import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, FilePlus, Receipt, TriangleAlert } from "lucide-react";
import { CashFlowChart } from "@/components/erp/cash-flow-chart";
import { InvoiceTable } from "@/components/erp/invoice-table";
import { EmptyState, Money, PageHeader, StatTile, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { listInvoices } from "@/lib/erp/data/invoices";
import { monthlyTrend, openInvoices, periodSummary } from "@/lib/erp/data/reports";
import { getSettings, settingsChecklist } from "@/lib/erp/data/settings";
import { formatDate, monthRange, shiftMonth, todayIST } from "@/lib/erp/dates";
import { formatINR } from "@/lib/erp/money";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const today = todayIST();
  const month = monthRange(today);
  const summary = periodSummary(month.from, month.to);
  const open = openInvoices();
  const overdue = open.filter((invoice) => invoice.daysOverdue > 0);
  const outstanding = open.reduce((sum, invoice) => sum + invoice.balancePaise, 0);
  const overdueTotal = overdue.reduce((sum, invoice) => sum + invoice.balancePaise, 0);
  const trend = monthlyTrend(shiftMonth(today, -5), month.to);
  const recent = listInvoices().slice(0, 6);
  const gaps = settingsChecklist(getSettings());
  const firstName = admin.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description={`Here’s where the money stands on ${formatDate(today)}.`}
        actions={
          <>
            <Link href="/admin/expenses/new" className="erp-button-secondary">
              <Receipt size={16} aria-hidden="true" />
              Add expense
            </Link>
            <Link href="/admin/invoices/new" className="erp-button">
              <FilePlus size={16} aria-hidden="true" />
              New invoice
            </Link>
          </>
        }
      />

      {gaps.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-ember/30 bg-ember-wash px-4 py-3 text-sm">
          <p className="flex items-start gap-2 text-text">
            <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
            <span>
              Before sending invoices, add your {gaps.join(", ").replace(/, ([^,]*)$/, " and $1")} so
              they print on every invoice.
            </span>
          </p>
          <Link href="/admin/settings" className="erp-link whitespace-nowrap text-sm">
            Complete settings
          </Link>
        </div>
      )}

      <section aria-labelledby="this-month" className="mb-6">
        <h2 id="this-month" className="sr-only">
          This month
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Collected this month"
            value={formatINR(summary.collectedPaise)}
            tone="steel"
            detail={summary.tdsPaise ? `Plus ${formatINR(summary.tdsPaise)} TDS` : "Cash received"}
          />
          <StatTile
            label="Invoiced this month"
            value={formatINR(summary.salesPaise)}
            detail={`${summary.invoiceCount} invoice${summary.invoiceCount === 1 ? "" : "s"} issued`}
          />
          <StatTile
            label="Spent this month"
            value={formatINR(summary.expensesPaise)}
            detail={`Net cash ${formatINR(summary.netCashPaise)}`}
          />
          <StatTile
            label="Outstanding"
            value={formatINR(outstanding)}
            tone={overdue.length ? "danger" : "default"}
            detail={
              overdue.length
                ? `${formatINR(overdueTotal)} overdue on ${overdue.length} invoice${overdue.length === 1 ? "" : "s"}`
                : `${open.length} unpaid, none overdue`
            }
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="erp-card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-text">Cash flow, last 6 months</h2>
            <Link href="/admin/reports" className="erp-link text-sm">
              Reports
            </Link>
          </div>
          <CashFlowChart rows={trend} caption="Money collected and spent per month, last six months" />
        </section>

        <TableCard
          title="Needs follow-up"
          actions={
            open.length > 0 && (
              <Link href="/admin/invoices?status=overdue" className="erp-link text-sm">
                All overdue
              </Link>
            )
          }
        >
          {open.length === 0 ? (
            <EmptyState
              icon={<CircleCheck size={20} aria-hidden="true" />}
              title="Nothing outstanding"
              description="Every issued invoice has been paid."
            />
          ) : (
            <ul className="divide-y divide-border">
              {open.slice(0, 6).map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/admin/invoices/${invoice.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-200 hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text">{invoice.clientName}</span>
                      <span className="block font-mono text-xs text-text-muted">{invoice.number}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <Money paise={invoice.balancePaise} className="block text-sm font-semibold text-text" />
                      <span
                        className={`block text-xs ${invoice.daysOverdue > 0 ? "font-medium text-danger" : "text-text-muted"}`}
                      >
                        {invoice.daysOverdue > 0
                          ? `${invoice.daysOverdue} day${invoice.daysOverdue === 1 ? "" : "s"} overdue`
                          : `Due ${formatDate(invoice.dueDate)}`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TableCard>
      </div>

      <div className="mt-6">
        <TableCard
          title="Recent invoices"
          actions={
            <Link href="/admin/invoices" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
              All invoices <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              icon={<FilePlus size={20} aria-hidden="true" />}
              title="No invoices yet"
              description="Add a client, then raise your first invoice. It takes about a minute."
              action={
                <Link href="/admin/invoices/new" className="erp-button">
                  <FilePlus size={16} aria-hidden="true" />
                  Create an invoice
                </Link>
              }
            />
          ) : (
            <InvoiceTable invoices={recent} />
          )}
        </TableCard>
      </div>
    </>
  );
}
