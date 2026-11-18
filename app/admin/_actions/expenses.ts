"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/erp/auth";
import {
  createExpense,
  deleteExpense,
  expenseCategories,
  expenseMethods,
  getExpense,
  updateExpense,
  type ExpenseInput,
} from "@/lib/erp/data/expenses";
import { errorState, FormReader, type ActionState } from "@/lib/erp/form";

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
