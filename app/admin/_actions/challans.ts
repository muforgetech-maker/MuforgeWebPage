"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/erp/auth";
import {
  cancelChallan,
  ChallanError,
  challanReasons,
  createChallan,
  deleteDraftChallan,
  getChallan,
  invoiceFromChallan,
  issueChallan,
  updateChallan,
  type ChallanInput,
  type ChallanLineInput,
} from "@/lib/erp/data/challans";
import { getClient } from "@/lib/erp/data/clients";
import { getSettings } from "@/lib/erp/data/settings";
import { addDays, todayIST } from "@/lib/erp/dates";
import { errorState, FormReader, successState, type ActionState } from "@/lib/erp/form";
import { indianStates } from "@/lib/erp/gst";
import { parseQuantityToMilli, parseRupeesToPaise } from "@/lib/erp/money";

const stateCodes = indianStates.map((state) => state.code);
const MAX_LINES = 100;

/** What the editor posts for each line: the raw strings someone typed. */
type RawLine = {
  description?: unknown;
  sac?: unknown;
  quantity?: unknown;
  unit?: unknown;
  rate?: unknown;
};

function readLines(form: FormReader): ChallanLineInput[] {
  let raw: unknown;
  try {
    raw = JSON.parse(form.raw("lines") || "[]");
  } catch {
    form.fail("lines", "The line items could not be read. Reload the page and try again.");
    return [];
  }
  if (!Array.isArray(raw) || raw.length === 0) {
    form.fail("lines", "Add at least one line item.");
    return [];
  }
  if (raw.length > MAX_LINES) {
    form.fail("lines", `A challan can have at most ${MAX_LINES} lines.`);
    return [];
  }

  return (raw as RawLine[]).map((line, index) => {
    const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
    const key = (field: string) => `lines.${index}.${field}`;

    const description = str(line.description);
    if (!description) form.fail(key("description"), "Describe this item.");
    else if (description.length > 500) {
      form.fail(key("description"), "Keep the description under 500 characters.");
    }

    const sac = str(line.sac);
    if (sac && !/^\d{4,8}$/.test(sac)) form.fail(key("sac"), "SAC/HSN is 4 to 8 digits.");

    const quantityMilli = parseQuantityToMilli(str(line.quantity));
    if (quantityMilli === null) {
      form.fail(key("quantity"), "Quantity must be more than 0, up to 3 decimals.");
    }

    // A challan may carry items of no stated value, a returnable jig for
    // example, so zero is allowed here where an invoice rate would not be.
    const rateText = str(line.rate);
    const ratePaise = rateText === "" ? 0 : parseRupeesToPaise(rateText);
    if (ratePaise === null) form.fail(key("rate"), "Value must be an amount like 1500 or 1500.50.");

    return {
      description,
      sac,
      quantityMilli: quantityMilli ?? 1000,
      unit: str(line.unit).slice(0, 20),
      ratePaise: ratePaise ?? 0,
    };
  });
}

async function readChallan(formData: FormData, existingClientId: number | null) {
  const form = new FormReader(formData);
  const clientId = form.id("clientId");
  const client = clientId ? await getClient(clientId) : null;
  if (!client) form.fail("clientId", "Choose a client.");
  // An archived client can stay on a challan it already had, but not be newly chosen.
  else if (client.archived && client.id !== existingClientId) {
    form.fail("clientId", "This client is archived. Restore it before raising a challan.");
  }

  const input: ChallanInput = {
    clientId: clientId ?? 0,
    challanDate: form.date("challanDate", { label: "Challan date" }),
    reason: form.oneOf("reason", challanReasons, { label: "A reason for the movement" }),
    placeOfSupply: form.oneOf("placeOfSupply", stateCodes, { label: "The place of supply" }),
    vehicleNumber: form.text("vehicleNumber", { label: "Vehicle number", max: 20, uppercase: true }),
    dispatchThrough: form.text("dispatchThrough", { label: "Dispatched through", max: 100 }),
    shipTo: form.text("shipTo", { label: "Delivery address", max: 500 }),
    notes: form.text("notes", { label: "Notes", max: 2000 }),
    terms: form.text("terms", { label: "Terms", max: 2000 }),
    lines: readLines(form),
  };
  return { form, input };
}

function refresh() {
  revalidatePath("/admin", "layout");
}

export async function saveChallan(
  challanId: number | null,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const existing = challanId ? await getChallan(challanId) : null;
  if (challanId && !existing) return errorState("This challan no longer exists.");

  const { form, input } = await readChallan(formData, existing?.clientId ?? null);
  if (!form.ok) {
    const lineProblem = Object.keys(form.errors).some((key) => key.startsWith("lines"));
    return errorState(
      lineProblem ? "Check the highlighted line items." : "Please fix the highlighted fields.",
      form.errors,
    );
  }

  const issue = formData.get("intent") === "issue";
  let id = challanId;
  try {
    if (id) await updateChallan(admin.id, id, input, issue);
    else id = await createChallan(admin.id, input, issue);
  } catch (error) {
    if (error instanceof ChallanError) return errorState(error.message);
    throw error;
  }

  refresh();
  redirect(`/admin/challans/${id}`);
}

/** Wraps a mutation that may refuse with a domain error. */
async function attempt(
  // Whatever the mutation returns is discarded; only whether it threw matters.
  work: (adminId: number) => Promise<unknown>,
  message?: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    // Awaited inside the try: without it a rejected mutation would escape
    // this handler and the action would report success.
    await work(admin.id);
  } catch (error) {
    if (error instanceof ChallanError) return errorState(error.message);
    throw error;
  }
  refresh();
  return message ? successState(message) : { status: "success" };
}

export async function issueChallanAction(challanId: number): Promise<ActionState> {
  return await attempt(async (adminId) => await issueChallan(adminId, challanId));
}

export async function cancelChallanAction(
  challanId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!reason) {
    return errorState("Give a reason for cancelling, such as “goods returned”.", {
      reason: "Required.",
    });
  }
  return await attempt(async (adminId) => await cancelChallan(adminId, challanId, reason));
}

export async function deleteChallanDraftAction(challanId: number): Promise<ActionState> {
  const result = await attempt(async (adminId) => await deleteDraftChallan(adminId, challanId));
  if (result.status === "error") return result;
  redirect("/admin/challans");
}

export async function invoiceChallanAction(challanId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const settings = await getSettings();
  let invoiceId: number;
  try {
    invoiceId = await invoiceFromChallan(
      admin.id,
      challanId,
      addDays(todayIST(), settings.paymentTermsDays),
    );
  } catch (error) {
    if (error instanceof ChallanError) return errorState(error.message);
    throw error;
  }
  refresh();
  redirect(`/admin/invoices/${invoiceId}/edit`);
}
