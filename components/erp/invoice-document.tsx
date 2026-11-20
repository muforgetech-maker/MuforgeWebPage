import {
  DocumentFooter,
  DocumentHeader,
  DocumentTitle,
  PartyBlock,
  PaymentDetails,
  ServicesPanel,
  SignatureBlock,
  singleTaxRate,
  TaxSummary,
  taxRows,
  TermsList,
  TotalsBlock,
} from "@/components/erp/document-chrome";
import type { InvoiceDetail } from "@/lib/erp/data/invoices";
import { formatDate } from "@/lib/erp/dates";
import { formatAmount, formatQuantity } from "@/lib/erp/money";

/*
 * The invoice as a document, laid out to fill one A4 sheet when printed or
 * saved as PDF. It uses the paper tokens, which stay light in dark mode,
 * because this is stationery rather than part of the website.
 *
 * Carries what a GST invoice needs: both GSTINs, a consecutive number, the
 * date, place of supply, SAC/HSN per line, taxable value, rate-wise tax
 * split into CGST/SGST or IGST, and the total in words. The tax summary and
 * totals are shared with the delivery challan (document-chrome.tsx).
 */
export function InvoiceDocument({ invoice }: { invoice: InvoiceDetail }) {
  const { seller, billTo } = invoice;
  const gst = invoice.gstRegistered;
  const rows = taxRows(invoice.items, invoice.taxMode);
  const taxPaise = invoice.cgstPaise + invoice.sgstPaise + invoice.igstPaise;
  const watermark = invoice.status === "draft" ? "DRAFT" : invoice.status === "void" ? "VOID" : null;
  const singleRateBp = singleTaxRate(invoice.items);

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
            <TaxSummary
              rows={rows}
              totalTaxPaise={taxPaise}
              singleRateBp={singleRateBp}
              caption="Tax charged, by type and rate"
            />
          ) : (
            <p className="self-start text-xs text-paper-muted">
              {gst
                ? "No GST is chargeable on the items above."
                : "Not registered for GST, so no tax is charged on this invoice."}
            </p>
          )}

          <TotalsBlock
            subtotalLabel="Total Amount (Before Tax)"
            subtotalPaise={invoice.subtotalPaise}
            showTax={gst}
            taxPaise={taxPaise}
            singleRateBp={singleRateBp}
            roundOffPaise={invoice.roundOffPaise}
            totalLabel="Total Amount (₹)"
            totalPaise={invoice.totalPaise}
          />
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
