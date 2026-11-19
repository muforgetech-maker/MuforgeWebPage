import Image from "next/image";
import type { ChallanDetail } from "@/lib/erp/data/challans";
import type { Party } from "@/lib/erp/data/invoices";
import { formatDate } from "@/lib/erp/dates";
import { amountInWords, formatAmount, formatQuantity } from "@/lib/erp/money";

/*
 * The delivery challan as a document, laid out to fill one A4 sheet. It uses
 * the same paper tokens as the invoice so the two look like one set of
 * stationery.
 *
 * Rule 55 wants: a consecutive serial number and date, the consignor's and
 * consignee's names, addresses and GSTINs, a description with HSN/SAC and
 * quantity, the value of the consignment, the place of supply and a
 * signature. No tax is charged here -- the invoice that follows does that,
 * and the document says so plainly rather than leaving it to be assumed.
 */

function addressLines(party: Party) {
  return [
    party.addressLine1,
    party.addressLine2,
    [party.city, party.pincode].filter(Boolean).join(" – "),
    party.stateCode ? `${party.stateName} (${party.stateCode})` : "",
  ].filter(Boolean);
}

export function ChallanDocument({ challan }: { challan: ChallanDetail }) {
  const { seller, billTo } = challan;
  const watermark =
    challan.status === "draft" ? "DRAFT" : challan.status === "cancelled" ? "CANCELLED" : null;
  const totalQuantityMilli = challan.items.reduce((sum, item) => sum + item.quantityMilli, 0);

  return (
    <article
      aria-label={`Delivery challan ${challan.number ?? "draft"}`}
      className="relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-card border border-border bg-paper p-6 text-[13px] leading-relaxed text-paper-text shadow-1 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      {watermark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="-rotate-[24deg] select-none font-display text-[6rem] font-bold tracking-widest text-paper-border opacity-60 sm:text-[8rem]">
            {watermark}
          </span>
        </div>
      )}

      <div className="relative">
        {/* Consignor and challan meta */}
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
              Delivery Challan
            </h2>
            <dl className="mt-3 grid grid-cols-[auto_auto] justify-start gap-x-4 gap-y-0.5 text-xs sm:justify-end">
              <dt className="text-paper-muted">Challan no.</dt>
              <dd className="font-mono font-semibold">{challan.number ?? "Not yet issued"}</dd>
              <dt className="text-paper-muted">Date</dt>
              <dd>{formatDate(challan.challanDate)}</dd>
              <dt className="text-paper-muted">Reason</dt>
              <dd>{challan.reason}</dd>
              <dt className="text-paper-muted">Place of supply</dt>
              <dd>{challan.placeOfSupply}</dd>
              {challan.vehicleNumber && (
                <>
                  <dt className="text-paper-muted">Vehicle no.</dt>
                  <dd className="font-mono">{challan.vehicleNumber}</dd>
                </>
              )}
              {challan.dispatchThrough && (
                <>
                  <dt className="text-paper-muted">Dispatched through</dt>
                  <dd>{challan.dispatchThrough}</dd>
                </>
              )}
            </dl>
          </div>
        </header>

        {/* Consignee, and where it actually goes */}
        <section className="grid gap-6 border-b border-paper-border py-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-paper-muted">
              Consignee
            </h3>
            <p className="mt-1.5 font-semibold">{billTo.name}</p>
            {billTo.contactPerson && <p className="text-xs">{billTo.contactPerson}</p>}
            <div className="mt-1 text-xs text-paper-muted">
              {addressLines(billTo).map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p>{[billTo.phone, billTo.email].filter(Boolean).join(" · ")}</p>
            </div>
            {billTo.gstin && <p className="mt-1.5 font-mono text-xs">GSTIN {billTo.gstin}</p>}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-paper-muted">
              Deliver to
            </h3>
            {challan.shipTo ? (
              <p className="mt-1.5 whitespace-pre-line text-xs">{challan.shipTo}</p>
            ) : (
              <p className="mt-1.5 text-xs text-paper-muted">Same as the consignee address.</p>
            )}
          </div>
        </section>

        {/* Items */}
        <table className="w-full border-collapse text-xs">
          <caption className="sr-only">Items in this consignment</caption>
          <thead>
            <tr className="border-b border-paper-border text-paper-muted">
              <th scope="col" className="py-2 pr-2 text-left font-semibold">
                #
              </th>
              <th scope="col" className="py-2 pr-2 text-left font-semibold">
                Description
              </th>
              <th scope="col" className="py-2 pr-2 text-left font-semibold">
                SAC/HSN
              </th>
              <th scope="col" className="py-2 pr-2 text-right font-semibold">
                Qty
              </th>
              <th scope="col" className="py-2 pr-2 text-left font-semibold">
                Unit
              </th>
              <th scope="col" className="py-2 pr-2 text-right font-semibold">
                Rate
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item, index) => (
              <tr key={item.id} className="border-b border-paper-border align-top">
                <td className="py-2 pr-2 tabular-nums text-paper-muted">{index + 1}</td>
                <td className="py-2 pr-2">{item.description}</td>
                <td className="py-2 pr-2 font-mono">{item.sac || "—"}</td>
                <td className="py-2 pr-2 text-right font-mono tabular-nums">
                  {formatQuantity(item.quantityMilli)}
                </td>
                <td className="py-2 pr-2">{item.unit || "—"}</td>
                <td className="py-2 pr-2 text-right font-mono tabular-nums">
                  {formatAmount(item.ratePaise)}
                </td>
                <td className="py-2 text-right font-mono tabular-nums">
                  {formatAmount(item.amountPaise)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={3} className="py-2.5">
                Total
              </td>
              <td className="py-2.5 pr-2 text-right font-mono tabular-nums">
                {formatQuantity(totalQuantityMilli)}
              </td>
              <td colSpan={2} />
              <td className="py-2.5 text-right font-mono tabular-nums">
                {formatAmount(challan.totalValuePaise)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-2 text-xs text-paper-muted">
          Value of consignment in words: {amountInWords(challan.totalValuePaise)}
        </p>
        <p className="mt-1 text-xs text-paper-muted">
          This is a delivery challan, not a tax invoice. No GST is charged on this document; it is
          charged on the invoice raised against this delivery.
        </p>

        {/* Notes, terms and signature */}
        <section className="mt-6 grid gap-6 border-t border-paper-border pt-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="grid gap-3 text-xs">
            {challan.notes && (
              <div>
                <h3 className="font-semibold uppercase tracking-wide text-paper-muted">Notes</h3>
                <p className="mt-1 whitespace-pre-line">{challan.notes}</p>
              </div>
            )}
            {challan.terms && (
              <div>
                <h3 className="font-semibold uppercase tracking-wide text-paper-muted">Terms</h3>
                <p className="mt-1 whitespace-pre-line">{challan.terms}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold uppercase tracking-wide text-paper-muted">
                Received in good condition
              </h3>
              <div className="mt-8 border-t border-paper-border pt-1 text-paper-muted">
                Consignee’s name and signature
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-right">
            <p className="text-paper-muted">For {seller.name}</p>
            <div className="mt-12 border-t border-paper-border pt-1 text-paper-muted">
              Authorised signatory
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
