import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArchiveRestore, FilePlus, Pencil, Trash2 } from "lucide-react";
import { removeClient, toggleClientArchived } from "@/app/admin/_actions/clients";
import { ActionButton } from "@/components/erp/action-button";
import { InvoiceTable } from "@/components/erp/invoice-table";
import { Badge, DetailRow, EmptyState, PageHeader, StatTile, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { getClient } from "@/lib/erp/data/clients";
import { listInvoices } from "@/lib/erp/data/invoices";
import { parseId } from "@/lib/erp/form";
import { stateName } from "@/lib/erp/gst";
import { formatINR } from "@/lib/erp/money";

async function loadClient(params: PageProps<"/admin/clients/[id]">["params"]) {
  await requireAdmin();
  const id = parseId((await params).id);
  return id ? await getClient(id) : null;
}

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/admin/clients/[id]">): Promise<Metadata> {
  const client = await loadClient(params);
  return { title: client?.name ?? "Client" };
}

export default async function ClientPage({ params }: PageProps<"/admin/clients/[id]">) {
  const client = await loadClient(params);
  if (!client) notFound();

  const invoices = await listInvoices({ clientId: client.id });
  const issued = invoices.filter((invoice) => invoice.status === "issued");
  const billed = issued.reduce((sum, invoice) => sum + invoice.totalPaise, 0);
  const outstanding = issued.reduce((sum, invoice) => sum + invoice.balancePaise, 0);
  const overdue = invoices.filter((invoice) => invoice.displayStatus === "overdue");
  const address = [
    client.addressLine1,
    client.addressLine2,
    [client.city, client.pincode].filter(Boolean).join(" "),
    stateName(client.stateCode),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {client.name}
            {client.archived && <Badge tone="muted">Archived</Badge>}
          </span>
        }
        back={{ href: "/admin/clients", label: "Clients" }}
        actions={
          <>
            {!client.archived && (
              <Link href={`/admin/invoices/new?client=${client.id}`} className="erp-button">
                <FilePlus size={16} aria-hidden="true" />
                New invoice
              </Link>
            )}
            <Link href={`/admin/clients/${client.id}/edit`} className="erp-button-secondary">
              <Pencil size={16} aria-hidden="true" />
              Edit
            </Link>
            <ActionButton action={toggleClientArchived.bind(null, client.id, !client.archived)}>
              {client.archived ? (
                <>
                  <ArchiveRestore size={16} aria-hidden="true" />
                  Restore
                </>
              ) : (
                <>
                  <Archive size={16} aria-hidden="true" />
                  Archive
                </>
              )}
            </ActionButton>
            {invoices.length === 0 && (
              <ActionButton
                action={removeClient.bind(null, client.id)}
                confirmMessage={`Delete ${client.name}? This can’t be undone.`}
                className="erp-button-danger"
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </ActionButton>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Billed" value={formatINR(billed)} detail={`${issued.length} issued invoices`} />
        <StatTile
          label="Outstanding"
          value={formatINR(outstanding)}
          tone={outstanding > 0 ? "default" : "steel"}
        />
        <StatTile
          label="Overdue"
          value={overdue.length}
          tone={overdue.length ? "danger" : "default"}
          detail={overdue.length ? "Follow up on these first" : "Nothing overdue"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <section className="erp-card p-5">
          <h2 className="text-sm font-semibold text-text">Details</h2>
          <dl className="mt-2 divide-y divide-border">
            <DetailRow label="Contact">{client.contactPerson || "—"}</DetailRow>
            <DetailRow label="Email">
              {client.email ? (
                <a href={`mailto:${client.email}`} className="erp-link">
                  {client.email}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Phone">{client.phone || "—"}</DetailRow>
            <DetailRow label="GSTIN">
              <span className="font-mono text-xs">{client.gstin || "Unregistered"}</span>
            </DetailRow>
            <DetailRow label="Address">
              {address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </DetailRow>
            {client.notes && (
              <DetailRow label="Notes">
                <span className="whitespace-pre-line">{client.notes}</span>
              </DetailRow>
            )}
          </dl>
        </section>

        <TableCard title="Invoices">
          {invoices.length === 0 ? (
            <EmptyState
              icon={<FilePlus size={20} aria-hidden="true" />}
              title="No invoices yet"
              description="Invoices raised for this client will appear here."
            />
          ) : (
            <InvoiceTable invoices={invoices} showClient={false} />
          )}
        </TableCard>
      </div>
    </>
  );
}
