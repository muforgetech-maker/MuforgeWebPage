"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/erp/auth";
import {
  createClient,
  deleteClient,
  getClient,
  setClientArchived,
  updateClient,
  type ClientInput,
} from "@/lib/erp/data/clients";
import { errorState, FormReader, type ActionState } from "@/lib/erp/form";
import { indianStates, isValidGstin, stateName } from "@/lib/erp/gst";

const stateCodes = indianStates.map((state) => state.code);

function readClient(formData: FormData) {
  const form = new FormReader(formData);
  const input: ClientInput = {
    name: form.text("name", { label: "Client name", required: true, max: 120 }),
    contactPerson: form.text("contactPerson", { label: "Contact person", max: 100 }),
    email: form.email("email", { label: "Email" }),
    phone: form.text("phone", {
      label: "Phone",
      max: 30,
      pattern: /^\+?[\d\s()-]{6,}$/,
      patternMessage: "Enter a phone number with digits only, like +91 98765 43210.",
    }),
    gstin: form.text("gstin", { label: "GSTIN", max: 15, uppercase: true }),
    addressLine1: form.text("addressLine1", { label: "Address line 1", max: 150 }),
    addressLine2: form.text("addressLine2", { label: "Address line 2", max: 150 }),
    city: form.text("city", { label: "City", max: 80 }),
    stateCode: form.oneOf("stateCode", stateCodes, { label: "A state" }),
    pincode: form.text("pincode", { label: "PIN code", max: 10 }),
    notes: form.text("notes", { label: "Notes", max: 2000 }),
  };

  if (input.gstin) {
    if (!isValidGstin(input.gstin)) {
      form.fail("gstin", "This isn’t a valid GSTIN. Check for typos; the last character is a checksum.");
    } else if (input.gstin.slice(0, 2) !== input.stateCode) {
      form.fail(
        "gstin",
        `This GSTIN is registered in ${stateName(input.gstin.slice(0, 2))}, but the state is set to ${stateName(input.stateCode)}.`,
      );
    }
  }
  if (input.pincode && input.stateCode !== "96" && !/^\d{6}$/.test(input.pincode)) {
    form.fail("pincode", "An Indian PIN code has 6 digits.");
  }
  return { form, input };
}

export async function saveClient(
  clientId: number | null,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const { form, input } = readClient(formData);
  if (!form.ok) return errorState("Please fix the highlighted fields.", form.errors);

  let id = clientId;
  if (id !== null) {
    if (!await getClient(id)) return errorState("This client no longer exists.");
    await updateClient(admin.id, id, input);
  } else {
    id = await createClient(admin.id, input);
  }

  revalidatePath("/admin", "layout");
  const returnTo = formData.get("returnTo");
  // Coming from the invoice editor: go back there with the new client chosen.
  if (returnTo === "invoice") redirect(`/admin/invoices/new?client=${id}`);
  redirect(`/admin/clients/${id}`);
}

export async function toggleClientArchived(clientId: number, archived: boolean): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!await getClient(clientId)) return errorState("This client no longer exists.");
  await setClientArchived(admin.id, clientId, archived);
  revalidatePath("/admin", "layout");
  return { status: "success" };
}

export async function removeClient(clientId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!await deleteClient(admin.id, clientId)) {
    return errorState("This client has invoices, so it can’t be deleted. Archive it instead.");
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/clients");
}
