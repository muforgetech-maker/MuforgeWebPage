"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/erp/auth";
import { getClient } from "@/lib/erp/data/clients";
import {
  createInvoice,
  deleteDraft,
  duplicateInvoice,
  getInvoice,
  InvoiceError,
  issueInvoice,
  updateInvoice,
  voidInvoice,
  type InvoiceInput,
} from "@/lib/erp/data/invoices";
import { deletePayment, paymentMethods, PaymentError, recordPayment } from "@/lib/erp/data/payments";
import { errorState, FormReader, successState, type ActionState } from "@/lib/erp/form";
import { gstRatesBp, indianStates } from "@/lib/erp/gst";
import type { LineInput } from "@/lib/erp/invoice-calc";
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
  taxRateBp?: unknown;
};

function readLines(form: FormReader): LineInput[] {
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
    form.fail("lines", `An invoice can have at most ${MAX_LINES} lines.`);
    return [];
  }

  return (raw as RawLine[]).map((line, index) => {
    const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
    const key = (field: string) => `lines.${index}.${field}`;

    const description = str(line.description);
    if (!description) form.fail(key("description"), "Describe this item.");
    else if (description.length > 500) form.fail(key("description"), "Keep the description under 500 characters.");

    const sac = str(line.sac);
    if (sac && !/^\d{4,8}$/.test(sac)) form.fail(key("sac"), "SAC/HSN is 4 to 8 digits.");

    const quantityMilli = parseQuantityToMilli(str(line.quantity));
    if (quantityMilli === null) form.fail(key("quantity"), "Quantity must be more than 0, up to 3 decimals.");

    const ratePaise = parseRupeesToPaise(str(line.rate));
    if (ratePaise === null) form.fail(key("rate"), "Rate must be an amount like 1500 or 1500.50.");

    const taxRateBp = Number(str(line.taxRateBp));
    if (!(gstRatesBp as readonly number[]).includes(taxRateBp)) form.fail(key("taxRateBp"), "Choose a GST rate.");

    const unit = str(line.unit).slice(0, 20);
    return {
      description,
      sac,
      quantityMilli: quantityMilli ?? 1000,
      unit,
      ratePaise: ratePaise ?? 0,
      taxRateBp: Number.isFinite(taxRateBp) ? taxRateBp : 0,
    };
  });
}

function readInvoice(formData: FormData, existingClientId: number | null) {
  const form = new FormReader(formData);
  const clientId = form.id("clientId");
  const client = clientId ? getClient(clientId) : null;
  if (!client) form.fail("clientId", "Choose a client.");
  // An archived client can stay on an invoice it already had, but not be newly chosen.
  else if (client.archived && client.id !== existingClientId) {
    form.fail("clientId", "This client is archived. Restore it before invoicing.");
  }

  const issueDate = form.date("issueDate", { label: "Invoice date" });
  const dueDate = form.date("dueDate", { label: "Due date" });
  if (issueDate && dueDate && dueDate < issueDate) {
    form.fail("dueDate", "The due date can’t be before the invoice date.");
  }

  const input: InvoiceInput = {
    clientId: clientId ?? 0,
    issueDate,
    dueDate,
    placeOfSupply: form.oneOf("placeOfSupply", stateCodes, { label: "The place of supply" }),
    notes: form.text("notes", { label: "Notes", max: 2000 }),
    terms: form.text("terms", { label: "Terms", max: 2000 }),
    lines: readLines(form),
  };
  return { form, input };
}

function refresh() {
  revalidatePath("/admin", "layout");
}

export async function saveInvoice(
  invoiceId: number | null,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const existing = invoiceId ? getInvoice(invoiceId) : null;
  if (invoiceId && !existing) return errorState("This invoice no longer exists.");

  const { form, input } = readInvoice(formData, existing?.clientId ?? null);
  if (!form.ok) {
    const lineProblem = Object.keys(form.errors).some((key) => key.startsWith("lines"));
    return errorState(
      lineProblem ? "Check the highlighted line items." : "Please fix the highlighted fields.",
      form.errors,
    );
  }

  const issue = formData.get("intent") === "issue";
  let id = invoiceId;
  try {
    if (id) updateInvoice(admin.id, id, input, issue);
    else id = createInvoice(admin.id, input, issue);
  } catch (error) {
    if (error instanceof InvoiceError) return errorState(error.message);
    throw error;
  }

  refresh();
  redirect(`/admin/invoices/${id}`);
}

/** Wraps a mutation that may refuse with a domain error. */
async function attempt(work: (adminId: number) => void, message?: string): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    work(admin.id);
  } catch (error) {
    if (error instanceof InvoiceError || error instanceof PaymentError) return errorState(error.message);
    throw error;
  }
  refresh();
  return message ? successState(message) : { status: "success" };
}

export async function issueInvoiceAction(invoiceId: number): Promise<ActionState> {
  return attempt((adminId) => issueInvoice(adminId, invoiceId));
}

export async function voidInvoiceAction(
  invoiceId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!reason) return errorState("Give a reason for voiding, such as “raised twice”.", { reason: "Required." });
  return attempt((adminId) => voidInvoice(adminId, invoiceId, reason));
}

export async function deleteDraftAction(invoiceId: number): Promise<ActionState> {
  const result = await attempt((adminId) => deleteDraft(adminId, invoiceId));
  if (result.status === "error") return result;
  redirect("/admin/invoices");
}

export async function duplicateInvoiceAction(invoiceId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  let newId: number;
  try {
    newId = duplicateInvoice(admin.id, invoiceId);
  } catch (error) {
    if (error instanceof InvoiceError) return errorState(error.message);
    throw error;
  }
  refresh();
  redirect(`/admin/invoices/${newId}/edit`);
}

export async function recordPaymentAction(
  invoiceId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const form = new FormReader(formData);
  const input = {
    paidOn: form.date("paidOn", { label: "Payment date" }),
    amountPaise: form.money("amount", { label: "Amount", required: true }),
    method: form.oneOf("method", paymentMethods, { label: "A payment method" }),
    reference: form.text("reference", { label: "Reference", max: 100 }),
    notes: form.text("notes", { label: "Notes", max: 500 }),
  };
  if (!form.ok) {
    await requireAdmin();
    return errorState("Please fix the highlighted fields.", form.errors);
  }
  return attempt((adminId) => {
    recordPayment(adminId, invoiceId, input);
  }, "Payment recorded.");
}

export async function deletePaymentAction(paymentId: number): Promise<ActionState> {
  return attempt((adminId) => {
    deletePayment(adminId, paymentId);
  });
}
