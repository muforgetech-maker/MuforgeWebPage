import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { saveInvoice } from "@/app/admin/_actions/invoices";
import { EmptyState, PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { clientOptions } from "@/lib/erp/data/clients";
import { getSettings } from "@/lib/erp/data/settings";
import { addDays, todayIST } from "@/lib/erp/dates";
import { blankEditorLine, editorSettings } from "../editor-data";
import { InvoiceEditor } from "../invoice-editor";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "New invoice" };

export default async function NewInvoicePage({ searchParams }: PageProps<"/admin/invoices/new">) {
  await requireAdmin();
  const { client } = await searchParams;
  const settings = await getSettings();
  const clients = await clientOptions();
  const preselected = clients.find((c) => String(c.id) === client);
  const today = todayIST();

  return (
    <div className="max-w-5xl">
      <PageHeader title="New invoice" back={{ href: "/admin/invoices", label: "Invoices" }} />
      {clients.length === 0 ? (
        <div className="erp-card">
          <EmptyState
            icon={<UserPlus size={20} aria-hidden="true" />}
            title="Add a client first"
            description="An invoice needs someone to bill. Add the client, and you’ll come straight back here."
            action={
              <Link href="/admin/clients/new?returnTo=invoice" className="erp-button">
                <UserPlus size={16} aria-hidden="true" />
                Add a client
              </Link>
            }
          />
        </div>
      ) : (
        <InvoiceEditor
          action={saveInvoice.bind(null, null)}
          clients={clients}
          settings={editorSettings(settings)}
          mode="create"
          cancelHref="/admin/invoices"
          initial={{
            clientId: preselected ? String(preselected.id) : "",
            issueDate: today,
            dueDate: addDays(today, settings.paymentTermsDays),
            placeOfSupply: preselected?.stateCode ?? settings.stateCode,
            notes: settings.invoiceNotes,
            terms: settings.invoiceTerms,
            lines: [blankEditorLine(settings)],
          }}
        />
      )}
    </div>
  );
}
