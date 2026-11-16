import type { Metadata } from "next";
import { PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { expenseCategories, expenseMethods } from "@/lib/erp/data/expenses";
import { todayIST } from "@/lib/erp/dates";
import { ExpenseForm } from "../expense-form";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "New expense" };

export default async function NewExpensePage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <PageHeader title="New expense" back={{ href: "/admin/expenses", label: "Expenses" }} />
      <ExpenseForm categories={expenseCategories} methods={expenseMethods} today={todayIST()} />
    </div>
  );
}
