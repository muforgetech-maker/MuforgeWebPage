import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, Pencil, Send, Trash2 } from "lucide-react";
import {
  deleteDraftAction,
  deletePaymentAction,
  duplicateInvoiceAction,
  issueInvoiceAction,
} from "@/app/admin/_actions/invoices";
import { ActionButton } from "@/components/erp/action-button";
import { InvoiceDocument } from "@/components/erp/invoice-document";
import { InvoiceStatusBadge } from "@/components/erp/invoice-table";
import { Money, PageHeader } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { getInvoice, isEditable } from "@/lib/erp/data/invoices";
import { paymentMethods } from "@/lib/erp/data/payments";
import { daysBetween, formatDate, formatTimestamp, todayIST } from "@/lib/erp/dates";
import { parseId } from "@/lib/erp/form";
import { paiseToInput } from "@/lib/erp/money";
import { PrintButton, RecordPaymentForm, VoidInvoiceForm } from "./invoice-panels";

async function loadInvoice(params: PageProps<"/admin/invoices/[id]">["params"]) {
  await requireAdmin();
  const id = parseId((await params).id);
  return id ? getInvoice(id) : null;
}

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/admin/invoices/[id]">): Promise<Metadata> {
  const invoice = await loadInvoice(params);
  return { title: invoice?.number ?? "Draft invoice" };
}

export default async function InvoicePage({ params }: PageProps<"/admin/invoices/[id]">) {
  const invoice = await loadInvoice(params);
  if (!invoice) notFound();

  const today = todayIST();
  const editable = isEditable(invoice);
  const daysOverdue = daysBetween(invoice.dueDate, today);
  const pdfTitle = `${invoice.number ?? `Draft-${invoice.id}`} ${invoice.billTo.name}`.replace(/[\\/:*?"<>|]+/g, "-");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/invoices", label: "Invoices" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{invoice.number ?? "Draft invoice"}</span>
            <InvoiceStatusBadge status={invoice.displayStatus} />
          </span>
        }
        description={`${invoice.billTo.name} · ${formatDate(invoice.issueDate)}`}
        actions={
          <>
            {invoice.status === "draft" && (
              <ActionButton
                action={issueInvoiceAction.bind(null, invoice.id)}
                className="erp-button"
                pendingLabel="Issuing…"
                confirmMessage="Issue this invoice? It gets the next invoice number, which can’t be reused."
              >
                <Send size={16} aria-hidden="true" />
                Issue
              </ActionButton>
            )}
            {editable && (
              <Link href={`/admin/invoices/${invoice.id}/edit`} className="erp-button-secondary">
                <Pencil size={16} aria-hidden="true" />
                Edit
              </Link>
            )}
            <PrintButton documentTitle={pdfTitle} />
            <ActionButton action={duplicateInvoiceAction.bind(null, invoice.id)} pendingLabel="Copying…">
              <Copy size={16} aria-hidden="true" />
              Duplicate
            </ActionButton>
            {invoice.status === "draft" && (
              <ActionButton
                action={deleteDraftAction.bind(null, invoice.id)}
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
        <InvoiceDocument invoice={invoice} />

        <aside className="grid gap-4 print:hidden">
          {invoice.status === "issued" && (
            <section className="erp-card p-5">
              <h2 className="text-sm font-semibold text-text">Balance</h2>
              <dl className="mt-3 grid gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Total</dt>
                  <dd><Money paise={invoice.totalPaise} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Received</dt>
                  <dd><Money paise={invoice.paidPaise} /></dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <dt>Balance due</dt>
                  <dd>
                    <Money
                      paise={invoice.balancePaise}
                      className={invoice.balancePaise === 0 ? "text-steel" : ""}
                    />
                  </dd>
                </div>
              </dl>
              {invoice.balancePaise > 0 && (
                <p className={`mt-3 text-xs ${daysOverdue > 0 ? "font-medium text-danger" : "text-text-muted"}`}>
                  {daysOverdue > 0
                    ? `${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue`
                    : daysOverdue === 0
                      ? "Due today"
                      : `Due in ${-daysOverdue} day${daysOverdue === -1 ? "" : "s"}`}
                </p>
              )}
            </section>
          )}

          {invoice.status === "issued" && invoice.balancePaise > 0 && (
            <section className="erp-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-text">Record a payment</h2>
              <RecordPaymentForm
                key={invoice.balancePaise}
                invoiceId={invoice.id}
                balance={paiseToInput(invoice.balancePaise)}
                today={today < invoice.issueDate ? invoice.issueDate : today}
                methods={paymentMethods}
              />
            </section>
          )}

          {invoice.payments.length > 0 && (
            <section className="erp-card p-5">
              <h2 className="text-sm font-semibold text-text">Payments</h2>
              <ul className="mt-2 divide-y divide-border">
                {invoice.payments.map((payment) => (
                  <li key={payment.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <Money paise={payment.amountPaise} className="font-semibold" />
                      <p className="text-xs text-text-muted">
                        {formatDate(payment.paidOn)} · {payment.method}
                        {payment.reference && ` · ${payment.reference}`}
                      </p>
                    </div>
                    <ActionButton
                      action={deletePaymentAction.bind(null, payment.id)}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors duration-200 hover:bg-danger-wash hover:text-danger"
                      confirmMessage="Delete this payment? The invoice balance goes back up."
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      <span className="sr-only">Delete payment</span>
                    </ActionButton>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="erp-card p-5 text-sm">
            <h2 className="text-sm font-semibold text-text">History</h2>
            <ul className="mt-2 grid gap-1.5 text-xs text-text-muted">
              <li>Created {formatTimestamp(invoice.createdAt)}</li>
              {invoice.issuedAt && <li>Issued {formatTimestamp(invoice.issuedAt)}</li>}
              {invoice.updatedAt !== invoice.createdAt && <li>Last changed {formatTimestamp(invoice.updatedAt)}</li>}
              {invoice.voidedAt && (
                <li className="text-danger">
                  Voided {formatTimestamp(invoice.voidedAt)}: {invoice.voidReason}
                </li>
              )}
            </ul>
            {invoice.status === "issued" && invoice.payments.length === 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <VoidInvoiceForm invoiceId={invoice.id} number={invoice.number ?? ""} />
              </div>
            )}
            {invoice.status === "issued" && !editable && (
              <p className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
                Payments are recorded, so this invoice is locked. Delete its payments to edit or void it.
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
