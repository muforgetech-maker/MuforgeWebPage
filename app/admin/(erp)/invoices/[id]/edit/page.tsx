import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { saveInvoice } from "@/app/admin/_actions/invoices";
import { EmptyState, PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { clientOptions, getClient } from "@/lib/erp/data/clients";
import { getInvoice, isEditable } from "@/lib/erp/data/invoices";
import { getSettings } from "@/lib/erp/data/settings";
import { parseId } from "@/lib/erp/form";
import { editorInitialFrom, editorSettings } from "../../editor-data";
import { InvoiceEditor } from "../../invoice-editor";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Edit invoice" };

export default async function EditInvoicePage({ params }: PageProps<"/admin/invoices/[id]/edit">) {
  await requireAdmin();
  const id = parseId((await params).id);
  const invoice = id ? await getInvoice(id) : null;
  if (!invoice) notFound();

  const title = invoice.number ? `Edit ${invoice.number}` : "Edit draft";
  const back = { href: `/admin/invoices/${invoice.id}`, label: invoice.number ?? "Draft invoice" };

  if (!isEditable(invoice)) {
    return (
      <div className="max-w-5xl">
        <PageHeader title={title} back={back} />
        <div className="erp-card">
          <EmptyState
            icon={<Lock size={20} aria-hidden="true" />}
            title="This invoice is locked"
            description={
              invoice.status === "void"
                ? "Void invoices stay as they were. Duplicate it to start a new one."
                : "Payments have been recorded against it. Delete them first if the invoice really needs correcting."
            }
            action={
              <Link href={back.href} className="erp-button-secondary">
                Back to the invoice
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  // Keep the invoice's own client selectable even if it has since been archived.
  const clients = await clientOptions();
  if (!clients.some((c) => c.id === invoice.clientId)) {
    const client = await getClient(invoice.clientId);
    if (client) clients.unshift({ id: client.id, name: `${client.name} (archived)`, stateCode: client.stateCode, gstin: client.gstin });
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title={title} back={back} />
      <InvoiceEditor
        action={saveInvoice.bind(null, invoice.id)}
        clients={clients}
        settings={editorSettings(await getSettings())}
        mode={invoice.status === "issued" ? "issued" : "draft"}
        cancelHref={back.href}
        initial={editorInitialFrom(invoice)}
      />
    </div>
  );
}
