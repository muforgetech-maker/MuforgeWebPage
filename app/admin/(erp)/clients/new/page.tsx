import type { Metadata } from "next";
import { PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { ClientForm } from "../client-form";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "New client" };

export default async function NewClientPage({ searchParams }: PageProps<"/admin/clients/new">) {
  await requireAdmin();
  const { returnTo } = await searchParams;
  const fromInvoice = returnTo === "invoice";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New client"
        back={
          fromInvoice
            ? { href: "/admin/invoices/new", label: "Back to the invoice" }
            : { href: "/admin/clients", label: "Clients" }
        }
      />
      <ClientForm returnTo={fromInvoice ? "invoice" : undefined} />
    </div>
  );
}
