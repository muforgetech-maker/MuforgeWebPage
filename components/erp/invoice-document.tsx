import Image from "next/image";
import type { InvoiceDetail, Party } from "@/lib/erp/data/invoices";
import { formatDate } from "@/lib/erp/dates";
import { formatRateBp, stateName } from "@/lib/erp/gst";
import { computeInvoiceTotals } from "@/lib/erp/invoice-calc";
import { amountInWords, formatAmount, formatINR, formatQuantity } from "@/lib/erp/money";

/*
 * The invoice as a document. Uses the paper tokens, which stay light in dark
 * mode, and is laid out to fill one A4 sheet when printed or saved as PDF.
 * Carries what a GST invoice needs: seller and buyer GSTIN, a consecutive
 * number, date, place of supply, SAC/HSN, taxable value, rate-wise tax and
 * the total in words.
 */

function addressLines(party: Party) {
  return [
    party.addressLine1,
    party.addressLine2,
    [party.city, party.pincode].filter(Boolean).join(" – "),
    party.stateCode ? `${party.stateName} (${party.stateCode})` : "",
  ].filter(Boolean);
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceDetail }) {
  const { seller, billTo } = invoice;
  const gst = invoice.gstRegistered;
  const intra = invoice.taxMode === "intra";
  const taxGroups = computeInvoiceTotals(invoice.items, invoice.taxMode, false).taxGroups.filter(
    (group) => group.rateBp > 0,
  );
  const taxPaise = invoice.cgstPaise + invoice.sgstPaise + invoice.igstPaise;
  const hasBank = Boolean(seller.bankAccountNumber || seller.upiId);
  const watermark = invoice.status === "draft" ? "DRAFT" : invoice.status === "void" ? "VOID" : null;

  return (
    <article
      aria-label={`Invoice ${invoice.number ?? "draft"}`}
      className="relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-card border border-border bg-paper p-6 text-[13px] leading-relaxed text-paper-text shadow-1 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
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
        {/* Seller and invoice meta */}
        <header className="flex flex-col gap-6 border-b border-paper-border pb-6 sm:flex-row sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/muforge-logo-clean.png"
                alt=""
                width={661}
                height={420}
                className="h-10 w-auto"
              />
              <div>
                <p className="font-display text-xl font-semibold leading-tight">{seller.name}</p>
                {seller.legalName && seller.legalName !== seller.name && (
                  <p className="text-xs text-paper-muted">{seller.legalName}</p>
                )}
              </div>
            </div>
            <div className="mt-3 text-xs text-paper-muted">
              {addressLines(seller).map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p>{[seller.phone, seller.email].filter(Boolean).join(" · ")}</p>
              {seller.website && <p>{seller.website.replace(/^https?:\/\//, "")}</p>}
            </div>
            {(seller.gstin || seller.pan) && (
              <p className="mt-2 font-mono text-xs">
                {seller.gstin && <span className="mr-4">GSTIN {seller.gstin}</span>}
                {seller.pan && <span>PAN {seller.pan}</span>}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-paper-accent">
              {gst ? "Tax Invoice" : "Invoice"}
            </h2>
            <dl className="mt-3 grid grid-cols-[auto_auto] justify-start gap-x-4 gap-y-0.5 text-xs sm:justify-end">
              <dt className="text-paper-muted">Invoice no.</dt>
              <dd className="font-mono font-semibold">{invoice.number ?? "Not yet issued"}</dd>
              <dt className="text-paper-muted">Invoice date</dt>
              <dd>{formatDate(invoice.issueDate)}</dd>
              <dt className="text-paper-muted">Due date</dt>
              <dd>{formatDate(invoice.dueDate)}</dd>
              {gst && (
                <>
                  <dt className="text-paper-muted">Place of supply</dt>
                  <dd>
                    {stateName(invoice.placeOfSupply)} ({invoice.placeOfSupply})
                  </dd>
                </>
              )}
            </dl>
          </div>
        </header>

        {/* Buyer */}
        <section className="py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Bill to</p>
          <p className="mt-1 text-base font-semibold">{billTo.name}</p>
          {billTo.contactPerson && <p className="text-xs">Attn: {billTo.contactPerson}</p>}
          <div className="text-xs text-paper-muted">
            {addressLines(billTo).map((line) => (
              <p key={line}>{line}</p>
            ))}
            {(billTo.email || billTo.phone) && (
              <p>{[billTo.phone, billTo.email].filter(Boolean).join(" · ")}</p>
            )}
          </div>
          {billTo.gstin && <p className="mt-1 font-mono text-xs">GSTIN {billTo.gstin}</p>}
        </section>

        {/* Items */}
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-y border-paper-border text-left text-[10px] uppercase tracking-wider text-paper-muted">
              <th className="py-2 pr-2 font-semibold">#</th>
              <th className="py-2 pr-2 font-semibold">Description</th>
              <th className="py-2 pr-2 font-semibold">SAC/HSN</th>
              <th className="py-2 pr-2 text-right font-semibold">Qty</th>
              <th className="py-2 pr-2 text-right font-semibold">Rate</th>
              {gst && <th className="py-2 pr-2 text-right font-semibold">GST</th>}
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-paper-border align-top">
                <td className="py-2 pr-2 text-paper-muted">{index + 1}</td>
                <td className="py-2 pr-2">{item.description}</td>
                <td className="py-2 pr-2 font-mono">{item.sac || "—"}</td>
                <td className="whitespace-nowrap py-2 pr-2 text-right font-mono">
                  {formatQuantity(item.quantityMilli)} {item.unit}
                </td>
                <td className="whitespace-nowrap py-2 pr-2 text-right font-mono">
                  {formatAmount(item.ratePaise)}
                </td>
                {gst && <td className="py-2 pr-2 text-right font-mono">{formatRateBp(item.taxRateBp)}</td>}
                <td className="whitespace-nowrap py-2 text-right font-mono">
                  {formatAmount(item.amountPaise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tax summary, words, totals */}
        <div className="mt-5 flex flex-col-reverse gap-6 sm:flex-row sm:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            {gst && taxGroups.length > 0 && (
              <table className="w-full max-w-md border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-paper-border text-left text-paper-muted">
                    <th className="py-1 pr-2 font-semibold">Rate</th>
                    <th className="py-1 pr-2 text-right font-semibold">Taxable</th>
                    {intra ? (
                      <>
                        <th className="py-1 pr-2 text-right font-semibold">CGST</th>
                        <th className="py-1 text-right font-semibold">SGST</th>
                      </>
                    ) : (
                      <th className="py-1 text-right font-semibold">IGST</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {taxGroups.map((group) => (
                    <tr key={group.rateBp} className="border-b border-paper-border">
                      <td className="py-1 pr-2">{formatRateBp(group.rateBp)}</td>
                      <td className="py-1 pr-2 text-right font-mono">{formatAmount(group.taxablePaise)}</td>
                      {intra ? (
                        <>
                          <td className="py-1 pr-2 text-right font-mono">{formatAmount(group.cgstPaise)}</td>
                          <td className="py-1 text-right font-mono">{formatAmount(group.sgstPaise)}</td>
                        </>
                      ) : (
                        <td className="py-1 text-right font-mono">{formatAmount(group.igstPaise)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
                Amount in words
              </p>
              <p className="mt-0.5 font-medium">{amountInWords(invoice.totalPaise)}</p>
            </div>

            {hasBank && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
                  Payment details
                </p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-xs">
                  {seller.bankAccountName && (
                    <>
                      <dt className="text-paper-muted">Account name</dt>
                      <dd>{seller.bankAccountName}</dd>
                    </>
                  )}
                  {seller.bankAccountNumber && (
                    <>
                      <dt className="text-paper-muted">Account no.</dt>
                      <dd className="font-mono">{seller.bankAccountNumber}</dd>
                    </>
                  )}
                  {seller.bankIfsc && (
                    <>
                      <dt className="text-paper-muted">IFSC</dt>
                      <dd className="font-mono">{seller.bankIfsc}</dd>
                    </>
                  )}
                  {(seller.bankName || seller.bankBranch) && (
                    <>
                      <dt className="text-paper-muted">Bank</dt>
                      <dd>{[seller.bankName, seller.bankBranch].filter(Boolean).join(", ")}</dd>
                    </>
                  )}
                  {seller.upiId && (
                    <>
                      <dt className="text-paper-muted">UPI</dt>
                      <dd className="font-mono">{seller.upiId}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>

          <dl className="w-full shrink-0 self-start text-xs sm:w-64">
            <div className="flex justify-between py-1">
              <dt className="text-paper-muted">Taxable value</dt>
              <dd className="font-mono">{formatAmount(invoice.subtotalPaise)}</dd>
            </div>
            {intra && taxPaise > 0 && (
              <>
                <div className="flex justify-between py-1">
                  <dt className="text-paper-muted">CGST</dt>
                  <dd className="font-mono">{formatAmount(invoice.cgstPaise)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-paper-muted">SGST</dt>
                  <dd className="font-mono">{formatAmount(invoice.sgstPaise)}</dd>
                </div>
              </>
            )}
            {!intra && invoice.igstPaise > 0 && (
              <div className="flex justify-between py-1">
                <dt className="text-paper-muted">IGST</dt>
                <dd className="font-mono">{formatAmount(invoice.igstPaise)}</dd>
              </div>
            )}
            {invoice.roundOffPaise !== 0 && (
              <div className="flex justify-between py-1">
                <dt className="text-paper-muted">Round off</dt>
                <dd className="font-mono">
                  {invoice.roundOffPaise > 0 ? "+" : ""}
                  {formatAmount(invoice.roundOffPaise)}
                </dd>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between border-y-2 border-paper-text py-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-mono text-base font-semibold">{formatINR(invoice.totalPaise)}</dd>
            </div>
            {invoice.status === "issued" && invoice.paidPaise > 0 && (
              <>
                <div className="flex justify-between py-1">
                  <dt className="text-paper-muted">Paid</dt>
                  <dd className="font-mono">{formatAmount(invoice.paidPaise)}</dd>
                </div>
                <div className="flex justify-between py-1 font-semibold">
                  <dt>Balance due</dt>
                  <dd className="font-mono">{formatINR(invoice.balancePaise)}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className="mt-6 grid gap-4 border-t border-paper-border pt-4 text-xs sm:grid-cols-2">
            {invoice.notes && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Notes</p>
                <p className="mt-0.5 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Terms</p>
                <p className="mt-0.5 whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-[11px] text-paper-muted">
            This is a computer-generated invoice.
            {invoice.status === "void" && invoice.voidReason && (
              <span className="block font-semibold text-paper-accent">Voided: {invoice.voidReason}</span>
            )}
          </p>
          <div className="text-center text-xs sm:min-w-48">
            <p className="font-semibold">For {seller.name}</p>
            <div className="h-12" />
            <p className="border-t border-paper-border pt-1 text-paper-muted">Authorised signatory</p>
          </div>
        </footer>
      </div>
    </article>
  );
}
