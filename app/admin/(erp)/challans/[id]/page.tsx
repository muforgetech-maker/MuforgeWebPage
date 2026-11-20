import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Pencil, Send, Trash2 } from "lucide-react";
import {
  deleteChallanDraftAction,
  invoiceChallanAction,
  issueChallanAction,
} from "@/app/admin/_actions/challans";
import { ActionButton } from "@/components/erp/action-button";
import { ChallanDocument } from "@/components/erp/challan-document";
import { Badge, Money, PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { getChallan, isEditable } from "@/lib/erp/data/challans";
import { formatDate, formatTimestamp } from "@/lib/erp/dates";
import { parseId } from "@/lib/erp/form";
import { PrintButton } from "../../invoices/[id]/invoice-panels";
import { CancelChallanForm } from "./challan-panels";

async function loadChallan(params: PageProps<"/admin/challans/[id]">["params"]) {
  await requireAdmin();
  const id = parseId((await params).id);
  return id ? await getChallan(id) : null;
}

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/admin/challans/[id]">): Promise<Metadata> {
  const challan = await loadChallan(params);
  return { title: challan?.number ?? "Draft challan" };
}

const statusTone = {
  draft: "muted",
  issued: "steel",
  cancelled: "danger",
} as const;

export default async function ChallanPage({ params }: PageProps<"/admin/challans/[id]">) {
  const challan = await loadChallan(params);
  if (!challan) notFound();

  const editable = isEditable(challan);
  const pdfTitle = `${challan.number ?? `Draft-${challan.id}`} ${challan.billTo.name}`.replace(
    /[\\/:*?"<>|]+/g,
    "-",
  );

  return (
    <>
      <PageHeader
        back={{ href: "/admin/challans", label: "Challans" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{challan.number ?? "Draft challan"}</span>
            <Badge tone={statusTone[challan.status]}>{challan.status}</Badge>
          </span>
        }
        description={`${challan.billTo.name} · ${formatDate(challan.challanDate)}`}
        actions={
          <>
            {challan.status === "draft" && (
              <ActionButton
                action={issueChallanAction.bind(null, challan.id)}
                className="erp-button"
                pendingLabel="Issuing…"
                confirmMessage="Issue this challan? It gets the next challan number, which can’t be reused."
              >
                <Send size={16} aria-hidden="true" />
                Issue
              </ActionButton>
            )}
            {challan.status === "issued" && !challan.invoiceId && (
              <ActionButton
                action={invoiceChallanAction.bind(null, challan.id)}
                className="erp-button"
                pendingLabel="Preparing…"
                confirmMessage="Create a draft invoice from this challan? You can edit it before issuing."
              >
                <FileText size={16} aria-hidden="true" />
                Create invoice
              </ActionButton>
            )}
            {editable && (
              <Link href={`/admin/challans/${challan.id}/edit`} className="erp-button-secondary">
                <Pencil size={16} aria-hidden="true" />
                Edit
              </Link>
            )}
            <PrintButton documentTitle={pdfTitle} />
            {challan.status === "draft" && (
              <ActionButton
                action={deleteChallanDraftAction.bind(null, challan.id)}
                className="erp-button-danger"
                confirmMessage="Delete this draft? This can’t be undone."
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </ActionButton>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start print:block">
        <ChallanDocument challan={challan} />

        <aside className="grid gap-4 print:hidden">
          <section className="erp-card p-5">
            <h2 className="text-sm font-semibold text-text">Consignment</h2>
            <dl className="mt-3 grid gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Items</dt>
                <dd className="tabular-nums">{challan.items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Reason</dt>
                <dd>{challan.reason}</dd>
              </div>
              {challan.taxMode !== "none" && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Value before tax</dt>
                    <dd>
                      <Money paise={challan.totalValuePaise} />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">
                      {challan.taxMode === "intra" ? "CGST + SGST" : "IGST"}
                    </dt>
                    <dd>
                      <Money paise={challan.cgstPaise + challan.sgstPaise + challan.igstPaise} />
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <dt>Total value</dt>
                <dd>
                  <Money paise={challan.totalPaise} />
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-text-muted">
              {challan.taxMode !== "none"
                ? "GST is shown on the challan as the rules ask. It is charged, and reported, on the invoice raised against it."
                : "Saved without tax. Edit it to set GST rates, or raise the invoice, which adds GST."}
            </p>
          </section>

          <section className="erp-card p-5">
            <h2 className="text-sm font-semibold text-text">Billing</h2>
            {challan.invoiceId ? (
              <p className="mt-2 text-sm text-text">
                Invoiced as{" "}
                <Link href={`/admin/invoices/${challan.invoiceId}`} className="erp-link font-mono">
                  {challan.invoiceNumber ?? "a draft invoice"}
                </Link>
                .
              </p>
            ) : challan.status === "issued" ? (
              <p className="mt-2 text-sm text-text-muted">
                Not invoiced yet. Use <strong className="font-medium text-text">Create invoice</strong>{" "}
                to raise a draft carrying these lines.
              </p>
            ) : (
              <p className="mt-2 text-sm text-text-muted">
                Issue the challan before raising an invoice from it.
              </p>
            )}
          </section>

          <section className="erp-card p-5 text-sm">
            <h2 className="text-sm font-semibold text-text">History</h2>
            <ul className="mt-2 grid gap-1.5 text-xs text-text-muted">
              <li>Created {formatTimestamp(challan.createdAt)}</li>
              {challan.issuedAt && <li>Issued {formatTimestamp(challan.issuedAt)}</li>}
              {challan.updatedAt !== challan.createdAt && (
                <li>Last changed {formatTimestamp(challan.updatedAt)}</li>
              )}
              {challan.cancelledAt && (
                <li className="text-danger">
                  Cancelled {formatTimestamp(challan.cancelledAt)}: {challan.cancelReason}
                </li>
              )}
            </ul>
            {challan.status === "issued" && !challan.invoiceId && (
              <div className="mt-4 border-t border-border pt-4">
                <CancelChallanForm challanId={challan.id} number={challan.number ?? ""} />
              </div>
            )}
            {challan.invoiceId && (
              <p className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
                This challan has been invoiced, so it is locked. Void the invoice to change it.
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
