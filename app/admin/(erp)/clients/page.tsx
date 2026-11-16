import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { Badge, EmptyState, Money, PageHeader, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { listClients } from "@/lib/erp/data/clients";
import { stateName } from "@/lib/erp/gst";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const showArchived = params.archived === "1";
  const clients = listClients({ query, includeArchived: showArchived });

  return (
    <>
      <PageHeader
        title="Clients"
        description="Everyone you bill, with what they owe right now."
        actions={
          <Link href="/admin/clients/new" className="erp-button">
            <Plus size={16} aria-hidden="true" />
            New client
          </Link>
        }
      />

      <Form action="/admin/clients" className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <label htmlFor="client-search" className="sr-only">
            Search clients
          </label>
          <input
            id="client-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search name, contact, email or GSTIN"
            className="erp-control pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={showArchived}
            className="size-4 accent-[var(--ember)]"
          />
          Include archived
        </label>
        <button type="submit" className="erp-button-secondary">
          Search
        </button>
      </Form>

      <TableCard>
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users size={20} aria-hidden="true" />}
            title={query ? "No clients match that search" : "No clients yet"}
            description={
              query
                ? "Try a different name, email or GSTIN."
                : "Add the people and businesses you invoice. Their state decides how GST is split."
            }
            action={
              !query && (
                <Link href="/admin/clients/new" className="erp-button">
                  <Plus size={16} aria-hidden="true" />
                  Add your first client
                </Link>
              )
            }
          />
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Location</th>
                <th>GSTIN</th>
                <th className="text-right">Invoices</th>
                <th className="text-right">Billed</th>
                <th className="text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <Link href={`/admin/clients/${client.id}`} className="erp-link">
                      {client.name}
                    </Link>
                    {client.archived && (
                      <span className="ml-2">
                        <Badge tone="muted">Archived</Badge>
                      </span>
                    )}
                    {(client.contactPerson || client.email) && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {[client.contactPerson, client.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-text-muted">
                    {[client.city, stateName(client.stateCode)].filter(Boolean).join(", ")}
                  </td>
                  <td className="whitespace-nowrap font-mono text-xs">{client.gstin || "—"}</td>
                  <td className="erp-num">{client.invoiceCount}</td>
                  <td className="erp-num">
                    <Money paise={client.invoicedPaise} />
                  </td>
                  <td className={`erp-num ${client.outstandingPaise > 0 ? "font-semibold" : "text-text-muted"}`}>
                    <Money paise={client.outstandingPaise} />
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
