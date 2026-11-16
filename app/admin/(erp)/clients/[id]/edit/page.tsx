import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { getClient } from "@/lib/erp/data/clients";
import { parseId } from "@/lib/erp/form";
import { ClientForm } from "../../client-form";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Edit client" };

export default async function EditClientPage({ params }: PageProps<"/admin/clients/[id]/edit">) {
  await requireAdmin();
  const id = parseId((await params).id);
  const client = id ? getClient(id) : null;
  if (!client) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Edit ${client.name}`}
        description="Changes apply to drafts and new invoices. Issued invoices keep the details they were issued with."
        back={{ href: `/admin/clients/${client.id}`, label: client.name }}
      />
      <ClientForm client={client} />
    </div>
  );
}
