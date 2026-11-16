import Link from "next/link";
import { Badge, Money } from "@/components/erp/ui";
import type { DisplayStatus, InvoiceListRow } from "@/lib/erp/data/invoices";
import { formatDate } from "@/lib/erp/dates";

const statusDisplay: Record<DisplayStatus, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  draft: { label: "Draft", tone: "muted" },
  due: { label: "Due", tone: "ember" },
  partial: { label: "Part paid", tone: "ember" },
  overdue: { label: "Overdue", tone: "danger" },
  paid: { label: "Paid", tone: "steel" },
  void: { label: "Void", tone: "muted" },
};

export function InvoiceStatusBadge({ status }: { status: DisplayStatus }) {
  const { label, tone } = statusDisplay[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function InvoiceTable({
  invoices,
  showClient = true,
}: {
  invoices: InvoiceListRow[];
  showClient?: boolean;
}) {
  return (
    <table className="erp-table">
      <thead>
        <tr>
          <th>Invoice</th>
          {showClient && <th>Client</th>}
          <th>Issued</th>
          <th>Due</th>
          <th>Status</th>
          <th className="text-right">Total</th>
          <th className="text-right">Balance</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => (
          <tr key={invoice.id}>
            <td className="whitespace-nowrap">
              <Link href={`/admin/invoices/${invoice.id}`} className="erp-link font-mono text-xs">
                {invoice.number ?? `Draft #${invoice.id}`}
              </Link>
            </td>
            {showClient && <td className="min-w-40">{invoice.clientName}</td>}
            <td className="whitespace-nowrap text-text-muted">{formatDate(invoice.issueDate)}</td>
            <td
              className={`whitespace-nowrap ${
                invoice.displayStatus === "overdue" ? "font-medium text-danger" : "text-text-muted"
              }`}
            >
              {invoice.status === "issued" ? formatDate(invoice.dueDate) : "—"}
            </td>
            <td>
              <InvoiceStatusBadge status={invoice.displayStatus} />
            </td>
            <td className={`erp-num ${invoice.status === "void" ? "text-text-muted line-through" : ""}`}>
              <Money paise={invoice.totalPaise} />
            </td>
            <td className={`erp-num ${invoice.balancePaise > 0 ? "font-semibold" : "text-text-muted"}`}>
              {invoice.status === "issued" ? <Money paise={invoice.balancePaise} /> : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
