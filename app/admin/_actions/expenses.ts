"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/erp/auth";
import {
  addAttachment,
  AttachmentError,
  deleteAttachment,
} from "@/lib/erp/data/attachments";
import {
  createExpense,
  deleteExpense,
  expenseCategories,
  expenseMethods,
  getExpense,
  updateExpense,
  type ExpenseInput,
} from "@/lib/erp/data/expenses";
import { errorState, FormReader, successState, type ActionState } from "@/lib/erp/form";

export async function saveExpense(
  expenseId: number | null,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = new FormReader(formData);
  const input: ExpenseInput = {
    spentOn: form.date("spentOn", { label: "Date" }),
    category: form.oneOf("category", expenseCategories, { label: "A category" }),
    vendor: form.text("vendor", { label: "Paid to", max: 120 }),
    description: form.text("description", { label: "Description", required: true, max: 300 }),
    amountPaise: form.money("amount", { label: "Amount", required: true }),
    gstPaise: form.money("gst", { label: "GST", allowZero: true }),
    method: form.oneOf("method", expenseMethods, { label: "A payment method" }),
    reference: form.text("reference", { label: "Reference", max: 100 }),
    notes: form.text("notes", { label: "Notes", max: 1000 }),
  };
  if (input.gstPaise > input.amountPaise) {
    form.fail("gst", "GST is part of the total, so it can’t be more than the amount.");
  }
  if (!form.ok) return errorState("Please fix the highlighted fields.", form.errors);

  if (expenseId !== null) {
    if (!await getExpense(expenseId)) return errorState("This expense no longer exists.");
    await updateExpense(admin.id, expenseId, input);
  } else {
    await createExpense(admin.id, input);
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/expenses");
}

export async function removeExpense(expenseId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!await getExpense(expenseId)) return errorState("This expense no longer exists.");
  await deleteExpense(admin.id, expenseId);
  revalidatePath("/admin", "layout");
  redirect("/admin/expenses");
}

export async function uploadAttachment(
  expenseId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return errorState("Choose a file to attach.", { file: "Required." });
  }

  try {
    await addAttachment(admin.id, expenseId, {
      name: file.name,
      type: file.type,
      size: file.size,
      bytes: await file.arrayBuffer(),
    });
  } catch (error) {
    if (error instanceof AttachmentError) return errorState(error.message, { file: error.message });
    // A storage outage or a missing key should say so rather than crash the page.
    console.error("[erp] attachment upload failed", error);
    return errorState("The file could not be uploaded. Try again, or check the storage settings.");
  }

  revalidatePath("/admin", "layout");
  return successState("Attachment added.");
}

export async function removeAttachmentAction(attachmentId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    await deleteAttachment(admin.id, attachmentId);
  } catch (error) {
    if (error instanceof AttachmentError) return errorState(error.message);
    throw error;
  }
  revalidatePath("/admin", "layout");
  return successState("Attachment removed.");
}
