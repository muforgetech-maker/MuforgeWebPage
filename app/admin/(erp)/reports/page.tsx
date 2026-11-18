import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { CashFlowChart } from "@/components/erp/cash-flow-chart";
import { PeriodFilter } from "@/components/erp/period-filter";
import { Money, PageHeader, StatTile, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import {
  earliestActivity,
  expensesByCategory,
  gstSummary,
  monthlyTrend,
  openInvoices,
  periodSummary,
  receivablesAging,
  topClients,
} from "@/lib/erp/data/reports";
import { formatMonth, shiftMonth, todayIST } from "@/lib/erp/dates";
import { formatINR } from "@/lib/erp/money";
import { periodQuery, resolvePeriod } from "@/lib/erp/period";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  await requireAdmin();
  const today = todayIST();
  const period = resolvePeriod(await searchParams, today, "fy");
  // "All time" starts at the first record; future months are left off.
  const from = period.key === "all" ? ((await earliestActivity()) ?? today) : period.from;
  const to = period.to > today && period.key !== "custom" ? today : period.to;

  const summary = await periodSummary(from, to);
  const months = from <= to ? await monthlyTrend(from, to) : [];
  const chartMonths = months.length > 24 ? await monthlyTrend(shiftMonth(to, -23), to) : months;
  const gst = await gstSummary(from, to);
  const open = await openInvoices();
  const aging = receivablesAging(open);
  const categories = await expensesByCategory(from, to);
  const clients = await topClients(from, to);
  const query = periodQuery(period);

  const sum = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + pick(row), 0);
  const outputTax = (r: (typeof gst)[number]) => r.cgstPaise + r.sgstPaise + r.igstPaise;
  const topCategory = categories[0]?.totalPaise ?? 0;

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${period.label} · sales by invoice date, cash by payment date`}
        actions={
          <>
            <a href={`/admin/export/invoices?${query}`} className="erp-button-secondary" download>
              <Download size={16} aria-hidden="true" />
              Invoice register
            </a>
            <a href={`/admin/export/payments?${query}`} className="erp-button-secondary" download>
              <Download size={16} aria-hidden="true" />
              Payments
            </a>
            <a href={`/admin/export/expenses?${query}`} className="erp-button-secondary" download>
              <Download size={16} aria-hidden="true" />
              Expenses
            </a>
          </>
        }
      />

      <div className="mb-6">
        <PeriodFilter basePath="/admin/reports" period={period} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Sales (invoiced)"
          value={formatINR(summary.salesPaise)}
          detail={`${summary.invoiceCount} invoices · ${formatINR(summary.outputTaxPaise)} GST`}
        />
        <StatTile
          label="Collected"
          value={formatINR(summary.collectedPaise)}
          tone="steel"
          detail={summary.tdsPaise ? `Plus ${formatINR(summary.tdsPaise)} TDS deducted` : "Cash received"}
        />
        <StatTile
          label="Spent"
          value={formatINR(summary.expensesPaise)}
          detail={`${formatINR(summary.inputTaxPaise)} GST paid on purchases`}
        />
        <StatTile
          label="Net cash"
          value={formatINR(summary.netCashPaise)}
          tone={summary.netCashPaise < 0 ? "danger" : "default"}
          detail="Collected minus spent"
        />
      </div>

      <section className="erp-card mt-6 p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-text">
          Cash flow by month{months.length > 24 ? " (last 24 months)" : ""}
        </h2>
        {chartMonths.length > 0 ? (
          <CashFlowChart rows={chartMonths} caption={`Money collected and spent per month, ${period.label}`} />
        ) : (
          <p className="text-sm text-text-muted">No months in this period.</p>
        )}
      </section>

      <div className="mt-6">
        <TableCard title="Month by month">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-right">Invoiced</th>
                <th className="text-right">Collected</th>
                <th className="text-right">Spent</th>
                <th className="text-right">Net cash</th>
              </tr>
            </thead>
            <tbody>
              {[...months].reverse().map((row) => {
                const net = row.collectedPaise - row.expensesPaise;
                return (
                  <tr key={row.month}>
                    <td className="whitespace-nowrap">{formatMonth(row.month)}</td>
                    <td className="erp-num"><Money paise={row.salesPaise} /></td>
                    <td className="erp-num"><Money paise={row.collectedPaise} /></td>
                    <td className="erp-num"><Money paise={row.expensesPaise} /></td>
                    <td className={`erp-num font-semibold ${net < 0 ? "text-danger" : ""}`}>
                      <Money paise={net} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="erp-num px-4 py-3"><Money paise={sum(months, (r) => r.salesPaise)} /></td>
                <td className="erp-num px-4 py-3"><Money paise={sum(months, (r) => r.collectedPaise)} /></td>
                <td className="erp-num px-4 py-3"><Money paise={sum(months, (r) => r.expensesPaise)} /></td>
                <td className="erp-num px-4 py-3">
                  <Money paise={sum(months, (r) => r.collectedPaise - r.expensesPaise)} />
                </td>
              </tr>
            </tfoot>
          </table>
        </TableCard>
      </div>

      <div className="mt-6">
        <TableCard title="GST summary">
          {gst.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">No GST in this period.</p>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-right">Taxable sales</th>
                  <th className="text-right">CGST</th>
                  <th className="text-right">SGST</th>
                  <th className="text-right">IGST</th>
                  <th className="text-right">Input GST</th>
                  <th className="text-right">Net payable</th>
                </tr>
              </thead>
              <tbody>
                {gst.map((row) => (
                  <tr key={row.month}>
                    <td className="whitespace-nowrap">{formatMonth(row.month)}</td>
                    <td className="erp-num"><Money paise={row.taxablePaise} /></td>
                    <td className="erp-num"><Money paise={row.cgstPaise} /></td>
                    <td className="erp-num"><Money paise={row.sgstPaise} /></td>
                    <td className="erp-num"><Money paise={row.igstPaise} /></td>
                    <td className="erp-num"><Money paise={row.inputTaxPaise} /></td>
                    <td className="erp-num font-semibold">
                      <Money paise={outputTax(row) - row.inputTaxPaise} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="erp-num px-4 py-3"><Money paise={sum(gst, (r) => r.taxablePaise)} /></td>
                  <td className="erp-num px-4 py-3"><Money paise={sum(gst, (r) => r.cgstPaise)} /></td>
                  <td className="erp-num px-4 py-3"><Money paise={sum(gst, (r) => r.sgstPaise)} /></td>
                  <td className="erp-num px-4 py-3"><Money paise={sum(gst, (r) => r.igstPaise)} /></td>
                  <td className="erp-num px-4 py-3"><Money paise={sum(gst, (r) => r.inputTaxPaise)} /></td>
                  <td className="erp-num px-4 py-3">
                    <Money paise={sum(gst, (r) => outputTax(r) - r.inputTaxPaise)} />
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
          <p className="border-t border-border px-4 py-3 text-xs text-text-muted">
            A working summary for GSTR-1 and GSTR-3B. Input GST is what you entered on expenses; confirm
            eligible credit with your accountant before filing.
          </p>
        </TableCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <TableCard title="Receivables by age (today)">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Overdue by</th>
                <th className="text-right">Invoices</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {aging.map((bucket, index) => (
                <tr key={bucket.label}>
                  <td className={index >= 3 && bucket.count ? "font-medium text-danger" : ""}>{bucket.label}</td>
                  <td className="erp-num">{bucket.count}</td>
                  <td className="erp-num"><Money paise={bucket.balancePaise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Spending by category">
          {categories.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">No expenses in this period.</p>
          ) : (
            <ul className="grid gap-3 px-4 py-4">
              {categories.map((row) => (
                <li key={row.category}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-text">{row.category}</span>
                    <Money paise={row.totalPaise} className="shrink-0 text-text-muted" />
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface-2" aria-hidden="true">
                    <div
                      className="h-2 rounded-full bg-viz-out"
                      style={{ width: `${Math.max(2, (row.totalPaise / topCategory) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TableCard>

        <TableCard title="Top clients by sales">
          {clients.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">No invoices in this period.</p>
          ) : (
            <table className="erp-table">
              <tbody>
                {clients.map((client) => (
                  <tr key={client.clientId}>
                    <td>
                      <Link href={`/admin/clients/${client.clientId}`} className="erp-link">
                        {client.clientName}
                      </Link>
                      <p className="text-xs text-text-muted">
                        {client.invoiceCount} invoice{client.invoiceCount === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="erp-num"><Money paise={client.salesPaise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>
    </>
  );
}
