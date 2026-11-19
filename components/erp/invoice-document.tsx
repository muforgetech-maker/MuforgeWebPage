import {
  DocumentFooter,
  DocumentHeader,
  DocumentTitle,
  PartyBlock,
  PaymentDetails,
  ServicesPanel,
  SignatureBlock,
  TermsList,
} from "@/components/erp/document-chrome";
import type { InvoiceDetail } from "@/lib/erp/data/invoices";
import { formatDate } from "@/lib/erp/dates";
import { formatRateBp } from "@/lib/erp/gst";
import { computeInvoiceTotals } from "@/lib/erp/invoice-calc";
import { amountInWords, formatAmount, formatQuantity } from "@/lib/erp/money";

/*
 * The invoice as a document, laid out to fill one A4 sheet when printed or
 * saved as PDF. It uses the paper tokens, which stay light in dark mode,
 * because this is stationery rather than part of the website.
 *
 * Carries what a GST invoice needs: both GSTINs, a consecutive number, the
 * date, place of supply, SAC/HSN per line, taxable value, rate-wise tax
 * split into CGST/SGST or IGST, and the total in words.
 */

type TaxRow = { label: string; rateBp: number; paise: number };

/**
 * One row per tax actually charged.
 *
 * Within the seller's state a rate is halved into CGST and SGST; across
 * states it is one IGST line. Rates are listed separately rather than
 * merged, because a GST return needs them that way.
 */
function taxRows(invoice: InvoiceDetail): TaxRow[] {
  const groups = computeInvoiceTotals(invoice.items, invoice.taxMode, false).taxGroups.filter(
    (group) => group.rateBp > 0,
  );

  if (invoice.taxMode === "intra") {
    return groups.flatMap((group) => [
      { label: "CGST", rateBp: group.rateBp / 2, paise: group.cgstPaise },
      { label: "SGST", rateBp: group.rateBp / 2, paise: group.sgstPaise },
    ]);
  }
  if (invoice.taxMode === "inter") {
    return groups.map((group) => ({
      label: "IGST",
      rateBp: group.rateBp,
      paise: group.igstPaise,
    }));
  }
  return [];
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceDetail }) {
  const { seller, billTo } = invoice;
  const gst = invoice.gstRegistered;
  const rows = taxRows(invoice);
  const taxPaise = invoice.cgstPaise + invoice.sgstPaise + invoice.igstPaise;
  const watermark = invoice.status === "draft" ? "DRAFT" : invoice.status === "void" ? "VOID" : null;

  // The single-rate case, which is almost every invoice, can state the rate
  // on the "Add: GST" line instead of leaving it to be worked out.
  const singleRateBp =
    new Set(invoice.items.map((item) => item.taxRateBp).filter((bp) => bp > 0)).size === 1
      ? invoice.items.find((item) => item.taxRateBp > 0)?.taxRateBp
      : undefined;

  return (
    <article
      aria-label={`Invoice ${invoice.number ?? "draft"}`}
      className="relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-card border border-border bg-paper p-6 text-[13px] leading-relaxed text-paper-text shadow-1 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-6 print:shadow-none"
    >
      {watermark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="-rotate-[24deg] select-none font-display text-[7rem] font-bold tracking-widest text-paper-border opacity-60 sm:text-[9rem]">
            {watermark}
          </span>
        </div>
      )}

      <div className="relative">
        <DocumentHeader seller={seller} />

        <DocumentTitle
          title={gst ? "Tax Invoice" : "Invoice"}
          subtitle={gst ? "GST Bill" : undefined}
          rows={[
            {
              label: "Invoice No",
              value: <span className="font-mono">{invoice.number ?? "Not yet issued"}</span>,
            },
            { label: "Invoice Date", value: formatDate(invoice.issueDate) },
            { label: "Due Date", value: formatDate(invoice.dueDate) },
          ]}
        />

        <section className="mt-8 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <PartyBlock title="Bill To" party={billTo} />
          <ServicesPanel seller={seller} />
        </section>

        {/* Line items */}
        <table className="mt-8 w-full border-collapse text-xs">
          <caption className="sr-only">Items billed on this invoice</caption>
          <thead>
            <tr className="bg-paper-brand text-paper-brand-ink">
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                S.No
              </th>
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                Description of Services
              </th>
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                HSN/SAC
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                Qty
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                Rate (₹)
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-paper-border align-top">
                <td className="px-3 py-3 tabular-nums text-paper-muted">{index + 1}</td>
                <td className="px-3 py-3 font-medium">{item.description}</td>
                <td className="px-3 py-3 font-mono">{item.sac || "—"}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">
                  {formatQuantity(item.quantityMilli)}
                  {item.unit && <span className="ml-1 text-paper-muted">{item.unit}</span>}
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">
                  {formatAmount(item.ratePaise)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-semibold tabular-nums">
                  {formatAmount(item.amountPaise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tax summary and totals */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2 sm:items-start">
          {gst && rows.length > 0 ? (
            <div className="overflow-hidden rounded-card border border-paper-soft-border">
              <h3 className="bg-paper-soft px-4 py-2.5 text-sm font-semibold text-paper-text">
                Tax Summary
              </h3>
              <table className="w-full border-collapse text-xs">
                <caption className="sr-only">Tax charged, by type and rate</caption>
                <thead>
                  <tr className="border-y border-paper-soft-border text-paper-muted">
                    <th scope="col" className="px-4 py-2 text-left font-semibold">
                      Tax Type
                    </th>
                    <th scope="col" className="px-4 py-2 text-left font-semibold">
                      Rate
                    </th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.label}-${row.rateBp}-${index}`} className="border-b border-paper-soft-border">
                      <td className="px-4 py-2">{row.label}</td>
                      <td className="px-4 py-2 tabular-nums">{formatRateBp(row.rateBp)}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {formatAmount(row.paise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-paper-soft font-semibold">
                    <td className="px-4 py-2.5">Total GST</td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {singleRateBp ? formatRateBp(singleRateBp) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatAmount(taxPaise)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="self-start text-xs text-paper-muted">
              {gst
                ? "No GST is chargeable on the items above."
                : "Not registered for GST, so no tax is charged on this invoice."}
            </p>
          )}

          <div>
            <dl className="grid gap-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-paper-muted">Total Amount (Before Tax)</dt>
                <dd className="font-mono tabular-nums">{formatAmount(invoice.subtotalPaise)}</dd>
              </div>
              {gst && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-paper-muted">
                    Add: GST{singleRateBp ? ` (${formatRateBp(singleRateBp)})` : ""}
                  </dt>
                  <dd className="font-mono tabular-nums">{formatAmount(taxPaise)}</dd>
                </div>
              )}
              {invoice.roundOffPaise !== 0 && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-paper-muted">Round off</dt>
                  <dd className="font-mono tabular-nums">
                    {invoice.roundOffPaise > 0 ? "+" : ""}
                    {formatAmount(invoice.roundOffPaise)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-3 flex items-baseline justify-between gap-4 rounded-card bg-paper-soft px-4 py-3">
              <p className="text-sm font-semibold">Total Amount (₹)</p>
              <p className="font-mono text-xl font-bold tabular-nums">
                {formatAmount(invoice.totalPaise)}
              </p>
            </div>

            <div className="mt-3">
              <h3 className="text-xs font-semibold text-paper-text">Amount in Words</h3>
              <p className="text-xs text-paper-muted">{amountInWords(invoice.totalPaise)}</p>
            </div>
          </div>
        </section>

        {invoice.notes && (
          <p className="mt-6 whitespace-pre-line border-t border-paper-border pt-4 text-xs text-paper-muted">
            {invoice.notes}
          </p>
        )}

        {/* Payment, terms and signature */}
        <section className="mt-6 grid gap-6 border-t border-paper-border pt-5 sm:grid-cols-3">
          <PaymentDetails seller={seller} />
          <TermsList terms={invoice.terms} />
          <SignatureBlock seller={seller} />
        </section>

        <DocumentFooter seller={seller} />
      </div>
    </article>
  );
}
