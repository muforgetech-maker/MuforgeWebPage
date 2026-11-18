import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeExpense } from "@/app/admin/_actions/expenses";
import { ActionButton } from "@/components/erp/action-button";
import { PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { expenseCategories, expenseMethods, getExpense } from "@/lib/erp/data/expenses";
import { todayIST } from "@/lib/erp/dates";
import { parseId } from "@/lib/erp/form";
import { ExpenseForm } from "../expense-form";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Edit expense" };

export default async function EditExpensePage({ params }: PageProps<"/admin/expenses/[id]">) {
  await requireAdmin();
  const id = parseId((await params).id);
  const expense = id ? await getExpense(id) : null;
  if (!expense) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Edit expense"
        back={{ href: "/admin/expenses", label: "Expenses" }}
        actions={
          <ActionButton
            action={removeExpense.bind(null, expense.id)}
            className="erp-button-danger"
            confirmMessage="Delete this expense? This can’t be undone."
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </ActionButton>
        }
      />
      <ExpenseForm
        expense={expense}
        categories={expenseCategories}
        methods={expenseMethods}
        today={todayIST()}
      />
    </div>
  );
}
