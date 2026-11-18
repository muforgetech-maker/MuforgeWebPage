import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Download } from "lucide-react";
import { PeriodFilter } from "@/components/erp/period-filter";
import { Badge, EmptyState, Money, PageHeader, StatTile, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { listPayments, TDS_METHOD } from "@/lib/erp/data/payments";
import { formatDate, todayIST } from "@/lib/erp/dates";
import { formatINR } from "@/lib/erp/money";
import { periodQuery, resolvePeriod } from "@/lib/erp/period";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  await requireAdmin();
  const params = await searchParams;
  const period = resolvePeriod(params, todayIST(), "month");
  const payments = await listPayments({ from: period.from, to: period.to });

  const cash = payments.filter((p) => p.method !== TDS_METHOD).reduce((sum, p) => sum + p.amountPaise, 0);
  const tds = payments.filter((p) => p.method === TDS_METHOD).reduce((sum, p) => sum + p.amountPaise, 0);
  const byMethod = new Map<string, number>();
  for (const p of payments) byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amountPaise);

  return (
    <>
      <PageHeader
        title="Payments received"
        description={`Money in against invoices · ${period.label}`}
        actions={
          <a href={`/admin/export/payments?${periodQuery(period)}`} className="erp-button-secondary" download>
            <Download size={16} aria-hidden="true" />
            CSV
          </a>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatTile label="Collected" value={formatINR(cash)} tone="steel" detail={`${payments.length} receipts`} />
        <StatTile label="TDS deducted by clients" value={formatINR(tds)} detail="Claim against your income tax" />
        <StatTile
          label="By method"
          value={byMethod.size ? `${byMethod.size} method${byMethod.size === 1 ? "" : "s"}` : "—"}
          detail={[...byMethod.entries()].map(([m, v]) => `${m} ${formatINR(v)}`).join(" · ") || "Nothing received"}
        />
      </div>

      <div className="mb-4">
        <PeriodFilter basePath="/admin/payments" period={period} />
      </div>

      <TableCard>
        {payments.length === 0 ? (
          <EmptyState
            icon={<Banknote size={20} aria-hidden="true" />}
            title="No payments in this period"
            description="Payments are recorded from an issued invoice’s page."
            action={
              <Link href="/admin/invoices?status=due" className="erp-button-secondary">
                See unpaid invoices
              </Link>
            }
          />
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Client</th>
                <th>Method</th>
                <th>Reference</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="whitespace-nowrap text-text-muted">{formatDate(payment.paidOn)}</td>
                  <td className="whitespace-nowrap">
                    <Link href={`/admin/invoices/${payment.invoiceId}`} className="erp-link font-mono text-xs">
                      {payment.invoiceNumber}
                    </Link>
                  </td>
                  <td className="min-w-40">{payment.clientName}</td>
                  <td className="whitespace-nowrap">
                    {payment.method === TDS_METHOD ? <Badge tone="muted">TDS</Badge> : payment.method}
                  </td>
                  <td className="text-text-muted">{payment.reference || "—"}</td>
                  <td className="erp-num font-semibold">
                    <Money paise={payment.amountPaise} />
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
