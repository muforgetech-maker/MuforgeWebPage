"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { saveExpense } from "@/app/admin/_actions/expenses";
import { FormMessage, FormSection, SelectField, TextAreaField, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";
import type { Expense } from "@/lib/erp/data/expenses";
import { paiseToInput } from "@/lib/erp/money";

export function ExpenseForm({
  expense,
  categories,
  methods,
  today,
}: {
  expense?: Expense;
  categories: readonly string[];
  methods: readonly string[];
  today: string;
}) {
  const { state, pending, formProps, errorFor } = useActionForm(saveExpense.bind(null, expense?.id ?? null));

  return (
    <form {...formProps} className="grid gap-5">
      <FormMessage state={state} />
      <FormSection title="Expense">
        <TextField
          label="Description"
          name="description"
          defaultValue={expense?.description}
          error={errorFor("description")}
          placeholder="Adobe Creative Cloud, November"
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          label="Date"
          name="spentOn"
          type="date"
          defaultValue={expense?.spentOn ?? today}
          error={errorFor("spentOn")}
        />
        <SelectField
          label="Category"
          name="category"
          defaultValue={expense?.category ?? categories[0]}
          error={errorFor("category")}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </SelectField>
        <TextField
          label="Amount paid (₹)"
          name="amount"
          inputMode="decimal"
          defaultValue={expense ? paiseToInput(expense.amountPaise) : ""}
          error={errorFor("amount")}
          hint="The total paid, including any GST."
          className="font-mono"
        />
        <TextField
          label="GST included (₹)"
          name="gst"
          inputMode="decimal"
          defaultValue={expense ? paiseToInput(expense.gstPaise) : ""}
          error={errorFor("gst")}
          hint="From the supplier’s GST invoice. Counts as input tax in reports."
          className="font-mono"
        />
        <TextField
          label="Paid to"
          name="vendor"
          defaultValue={expense?.vendor}
          error={errorFor("vendor")}
          placeholder="Supplier or person"
        />
        <SelectField
          label="Paid by"
          name="method"
          defaultValue={expense?.method ?? methods[0]}
          error={errorFor("method")}
        >
          {methods.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </SelectField>
        <TextField
          label="Reference"
          name="reference"
          defaultValue={expense?.reference}
          error={errorFor("reference")}
          placeholder="Bill no. or UTR"
        />
        <TextAreaField
          label="Notes"
          name="notes"
          defaultValue={expense?.notes}
          error={errorFor("notes")}
          wrapperClassName="sm:col-span-2"
        />
      </FormSection>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="erp-button" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          {expense ? "Save changes" : "Add expense"}
        </button>
        <Link href="/admin/expenses" className="erp-button-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
