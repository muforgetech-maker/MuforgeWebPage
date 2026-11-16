import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus, Receipt } from "lucide-react";
import { PeriodFilter } from "@/components/erp/period-filter";
import { EmptyState, Money, PageHeader, StatTile, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { expenseCategories, listExpenses } from "@/lib/erp/data/expenses";
import { formatDate, todayIST } from "@/lib/erp/dates";
import { formatINR } from "@/lib/erp/money";
import { periodQuery, resolvePeriod } from "@/lib/erp/period";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage({ searchParams }: PageProps<"/admin/expenses">) {
  await requireAdmin();
  const params = await searchParams;
  const period = resolvePeriod(params, todayIST(), "month");
  const category = expenseCategories.find((c) => c === params.category) ?? "";
  const expenses = listExpenses({ from: period.from, to: period.to, category });

  const total = expenses.reduce((sum, e) => sum + e.amountPaise, 0);
  const gst = expenses.reduce((sum, e) => sum + e.gstPaise, 0);
  const byCategory = new Map<string, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amountPaise);
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <PageHeader
        title="Expenses"
        description={`Money going out · ${period.label}`}
        actions={
          <>
            <a
              href={`/admin/export/expenses?${periodQuery(period)}`}
              className="erp-button-secondary"
              download
            >
              <Download size={16} aria-hidden="true" />
              CSV
            </a>
            <Link href="/admin/expenses/new" className="erp-button">
              <Plus size={16} aria-hidden="true" />
              New expense
            </Link>
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatTile label="Spent" value={formatINR(total)} detail={`${expenses.length} expenses`} />
        <StatTile label="GST paid (input)" value={formatINR(gst)} detail="Claimable against output GST" />
        <StatTile
          label="Largest category"
          value={topCategory ? formatINR(topCategory[1]) : "—"}
          detail={topCategory?.[0] ?? "No expenses in this period"}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter basePath="/admin/expenses" period={period} extra={category ? { category } : {}} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1" role="navigation" aria-label="Category">
        {["", ...expenseCategories.filter((c) => byCategory.has(c) || c === category)].map((c) => {
          const search = new URLSearchParams(periodQuery(period));
          if (c) search.set("category", c);
          const current = c === category;
          return (
            <Link
              key={c || "all"}
              href={`/admin/expenses?${search.toString()}`}
              aria-current={current ? "page" : undefined}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                current
                  ? "border-ember bg-ember-wash text-ember"
                  : "border-border text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              {c || "All categories"}
            </Link>
          );
        })}
      </div>

      <TableCard>
        {expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={20} aria-hidden="true" />}
            title="No expenses in this period"
            description="Record software, rent, contractors and other costs to see your real profit."
            action={
              <Link href="/admin/expenses/new" className="erp-button">
                <Plus size={16} aria-hidden="true" />
                Add an expense
              </Link>
            }
          />
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Paid by</th>
                <th className="text-right">GST</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="whitespace-nowrap text-text-muted">{formatDate(expense.spentOn)}</td>
                  <td className="min-w-48">
                    <Link href={`/admin/expenses/${expense.id}`} className="erp-link">
                      {expense.description}
                    </Link>
                    {expense.vendor && <p className="mt-0.5 text-xs text-text-muted">{expense.vendor}</p>}
                  </td>
                  <td className="whitespace-nowrap text-text-muted">{expense.category}</td>
                  <td className="whitespace-nowrap text-text-muted">{expense.method}</td>
                  <td className="erp-num text-text-muted">
                    {expense.gstPaise ? <Money paise={expense.gstPaise} /> : "—"}
                  </td>
                  <td className="erp-num font-semibold">
                    <Money paise={expense.amountPaise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </>
  );
}
