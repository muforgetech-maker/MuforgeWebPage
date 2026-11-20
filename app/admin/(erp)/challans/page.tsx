import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Plus, Search, Truck } from "lucide-react";
import { Badge, EmptyState, Money, PageHeader, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { listChallans, type ChallanStatus } from "@/lib/erp/data/challans";
import { formatDate } from "@/lib/erp/dates";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Delivery challans" };

const tabs: { value: ChallanStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "issued", label: "Issued" },
  { value: "cancelled", label: "Cancelled" },
];

const statusTone = {
  draft: "muted",
  issued: "steel",
  cancelled: "danger",
} as const;

export default async function ChallansPage({ searchParams }: PageProps<"/admin/challans">) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const status = tabs.find((tab) => tab.value === params.status)?.value ?? "all";

  const all = await listChallans({ query });
  const counts = new Map<string, number>();
  for (const challan of all) counts.set(challan.status, (counts.get(challan.status) ?? 0) + 1);
  const challans = status === "all" ? all : all.filter((challan) => challan.status === status);
  const totalValue = challans.reduce((sum, challan) => sum + challan.totalPaise, 0);

  const tabHref = (value: string) => {
    const search = new URLSearchParams();
    if (value !== "all") search.set("status", value);
    if (query) search.set("q", query);
    const qs = search.toString();
    return qs ? `/admin/challans?${qs}` : "/admin/challans";
  };

  return (
    <>
      <PageHeader
        title="Delivery challans"
        description="Paperwork for goods that move before they are billed."
        actions={
          <Link href="/admin/challans/new" className="erp-button">
            <Plus size={16} aria-hidden="true" />
            New challan
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const current = tab.value === status;
            const count = tab.value === "all" ? all.length : (counts.get(tab.value) ?? 0);
            return (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                aria-current={current ? "page" : undefined}
                className={`rounded-control px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  current
                    ? "bg-ember-wash text-ember"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs tabular-nums opacity-70">{count}</span>
              </Link>
            );
          })}
        </nav>

        <Form action="/admin/challans" className="flex items-center gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Challan number or client"
              aria-label="Search challans"
              className="erp-control w-56 pl-9"
            />
          </div>
          <button type="submit" className="erp-button-secondary">
            Search
          </button>
        </Form>
      </div>

      <TableCard>
        {challans.length === 0 ? (
          <EmptyState
            icon={<Truck size={20} aria-hidden="true" />}
            title={query ? "No challans match that search" : "No challans yet"}
            description={
              query
                ? "Try a different challan number or client name."
                : "Raise a challan when something leaves before it is invoiced — job work, goods on approval, or a handover ahead of billing."
            }
            action={
              !query && (
                <Link href="/admin/challans/new" className="erp-button">
                  <Plus size={16} aria-hidden="true" />
                  New challan
                </Link>
              )
            }
          />
        ) : (
          <table className="erp-table">
            <caption className="sr-only">Delivery challans</caption>
            <thead>
              <tr>
                <th scope="col">Number</th>
                <th scope="col">Date</th>
                <th scope="col">Consignee</th>
                <th scope="col">Reason</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  Value incl. GST
                </th>
                <th scope="col">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td className="whitespace-nowrap">
                    <Link href={`/admin/challans/${challan.id}`} className="erp-link font-mono">
                      {challan.number ?? "Draft"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap text-text-muted">
                    {formatDate(challan.challanDate)}
                  </td>
                  <td>{challan.clientName}</td>
                  <td className="text-text-muted">{challan.reason}</td>
                  <td>
                    <Badge tone={statusTone[challan.status]}>{challan.status}</Badge>
                  </td>
                  <td className="erp-num">
                    <Money paise={challan.totalPaise} />
                  </td>
                  <td className="whitespace-nowrap">
                    {challan.invoiceId ? (
                      <Link href={`/admin/invoices/${challan.invoiceId}`} className="erp-link font-mono">
                        {challan.invoiceNumber ?? "Draft"}
                      </Link>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-text-muted">
                  {challans.length} challan{challans.length === 1 ? "" : "s"}
                </td>
                <td className="erp-num font-semibold">
                  <Money paise={totalValue} />
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </TableCard>
    </>
  );
}
