import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { InvoiceTable } from "@/components/erp/invoice-table";
import { EmptyState, Money, PageHeader, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { listInvoices, type DisplayStatus } from "@/lib/erp/data/invoices";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Invoices" };

const tabs: { value: DisplayStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "due", label: "Due" },
  { value: "partial", label: "Part paid" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
];

export default async function InvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const status = tabs.find((tab) => tab.value === params.status)?.value ?? "all";

  const all = listInvoices({ query });
  const counts = new Map<string, number>();
  for (const invoice of all) counts.set(invoice.displayStatus, (counts.get(invoice.displayStatus) ?? 0) + 1);
  const invoices = status === "all" ? all : all.filter((invoice) => invoice.displayStatus === status);
  const outstanding = invoices.reduce((sum, invoice) => sum + invoice.balancePaise, 0);

  const tabHref = (value: string) => {
    const search = new URLSearchParams();
    if (value !== "all") search.set("status", value);
    if (query) search.set("q", query);
    const qs = search.toString();
    return qs ? `/admin/invoices?${qs}` : "/admin/invoices";
  };

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Drafts, issued invoices and what’s still owed."
        actions={
          <Link href="/admin/invoices/new" className="erp-button">
            <Plus size={16} aria-hidden="true" />
            New invoice
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
                  current ? "bg-ember-wash text-ember" : "text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 font-mono text-xs opacity-70">{count}</span>
              </Link>
            );
          })}
        </nav>

        <Form action="/admin/invoices" className="relative w-full sm:w-72">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <label htmlFor="invoice-search" className="sr-only">
            Search invoices
          </label>
          <input
            id="invoice-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Invoice number or client"
            className="erp-control pl-9"
          />
        </Form>
      </div>

      <TableCard
        title={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        actions={
          outstanding > 0 && (
            <p className="text-sm text-text-muted">
              Outstanding <Money paise={outstanding} className="font-semibold text-text" />
            </p>
          )
        }
      >
        {invoices.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} aria-hidden="true" />}
            title={all.length === 0 && !query ? "No invoices yet" : "Nothing here"}
            description={
              all.length === 0 && !query
                ? "Create your first invoice. Save it as a draft, or issue it to give it a number."
                : "No invoices match this filter."
            }
            action={
              all.length === 0 &&
              !query && (
                <Link href="/admin/invoices/new" className="erp-button">
                  <Plus size={16} aria-hidden="true" />
                  Create an invoice
                </Link>
              )
            }
          />
        ) : (
          <InvoiceTable invoices={invoices} />
        )}
      </TableCard>
    </>
  );
}
