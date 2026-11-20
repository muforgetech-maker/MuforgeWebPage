import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { saveChallan } from "@/app/admin/_actions/challans";
import { EmptyState, PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { challanReasons } from "@/lib/erp/data/challans";
import { clientOptions } from "@/lib/erp/data/clients";
import { getSettings } from "@/lib/erp/data/settings";
import { todayIST } from "@/lib/erp/dates";
import { ChallanEditor } from "../challan-editor";
import { challanEditorSettings } from "../editor-settings";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "New delivery challan" };

export default async function NewChallanPage({ searchParams }: PageProps<"/admin/challans/new">) {
  await requireAdmin();
  const { client } = await searchParams;
  const settings = await getSettings();
  const clients = await clientOptions();
  const preselected = clients.find((c) => String(c.id) === client);

  return (
    <div className="max-w-5xl">
      <PageHeader title="New delivery challan" back={{ href: "/admin/challans", label: "Challans" }} />
      {clients.length === 0 ? (
        <div className="erp-card">
          <EmptyState
            icon={<UserPlus size={20} aria-hidden="true" />}
            title="Add a client first"
            description="A challan needs a consignee. Add the client, and you’ll come straight back here."
            action={
              <Link href="/admin/clients/new?returnTo=challan" className="erp-button">
                <UserPlus size={16} aria-hidden="true" />
                Add a client
              </Link>
            }
          />
        </div>
      ) : (
        <ChallanEditor
          action={saveChallan.bind(null, null)}
          clients={clients}
          reasons={challanReasons}
          settings={challanEditorSettings(settings)}
          mode="create"
          cancelHref="/admin/challans"
          initial={{
            clientId: preselected ? String(preselected.id) : "",
            challanDate: todayIST(),
            reason: challanReasons[0],
            placeOfSupply: preselected?.stateCode ?? settings.stateCode,
            vehicleNumber: "",
            dispatchThrough: "",
            shipTo: "",
            notes: "",
            terms: "",
            lines: [
              {
                description: "",
                sac: settings.defaultSac,
                quantity: "1",
                unit: "nos",
                rate: "",
                taxRateBp: String(settings.gstRegistered ? settings.defaultTaxRateBp : 0),
              },
            ],
          }}
        />
      )}
    </div>
  );
}
