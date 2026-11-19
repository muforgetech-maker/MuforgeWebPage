import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveChallan } from "@/app/admin/_actions/challans";
import { PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { challanReasons, getChallan, isEditable } from "@/lib/erp/data/challans";
import { clientOptions } from "@/lib/erp/data/clients";
import { getSettings } from "@/lib/erp/data/settings";
import { parseId } from "@/lib/erp/form";
import { paiseToInput } from "@/lib/erp/money";
import { ChallanEditor } from "../../challan-editor";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Edit delivery challan" };

export default async function EditChallanPage({ params }: PageProps<"/admin/challans/[id]/edit">) {
  await requireAdmin();
  const id = parseId((await params).id);
  if (!id) notFound();

  const challan = await getChallan(id);
  if (!challan) notFound();
  if (!isEditable(challan)) notFound();

  const settings = await getSettings();
  const clients = await clientOptions();

  // The consignee of an existing challan may since have been archived; keep
  // it selectable so the document can still be corrected.
  if (!clients.some((c) => c.id === challan.clientId)) {
    clients.unshift({
      id: challan.clientId,
      name: challan.billTo.name,
      stateCode: challan.billTo.stateCode,
      gstin: challan.billTo.gstin,
    });
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={challan.number ? `Edit ${challan.number}` : "Edit draft challan"}
        back={{ href: `/admin/challans/${challan.id}`, label: "Back to challan" }}
      />
      <ChallanEditor
        action={saveChallan.bind(null, challan.id)}
        clients={clients}
        reasons={challanReasons}
        defaultSac={settings.defaultSac}
        mode={challan.status === "issued" ? "issued" : "draft"}
        cancelHref={`/admin/challans/${challan.id}`}
        initial={{
          clientId: String(challan.clientId),
          challanDate: challan.challanDate,
          reason: challan.reason,
          placeOfSupply: challan.placeOfSupply,
          vehicleNumber: challan.vehicleNumber,
          dispatchThrough: challan.dispatchThrough,
          shipTo: challan.shipTo,
          notes: challan.notes,
          terms: challan.terms,
          lines: challan.items.map((item) => ({
            description: item.description,
            sac: item.sac,
            quantity: String(item.quantityMilli / 1000),
            unit: item.unit,
            rate: paiseToInput(item.ratePaise),
          })),
        }}
      />
    </div>
  );
}
