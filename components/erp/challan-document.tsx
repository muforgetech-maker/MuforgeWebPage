import {
  DocumentFooter,
  DocumentHeader,
  DocumentTitle,
  PartyBlock,
  ServicesPanel,
  SignatureBlock,
  TermsList,
} from "@/components/erp/document-chrome";
import type { ChallanDetail } from "@/lib/erp/data/challans";
import { formatDate } from "@/lib/erp/dates";
import { amountInWords, formatAmount, formatQuantity } from "@/lib/erp/money";

/*
 * The delivery challan as a document, on the same stationery as the invoice
 * so the two read as one set.
 *
 * Rule 55 wants: a consecutive serial number and date, both parties' names,
 * addresses and GSTINs, a description with HSN/SAC and quantity, the value
 * of the consignment, the place of supply and a signature. No tax is
 * charged here -- the invoice that follows does that, and the document says
 * so rather than leaving it to be assumed.
 */
export function ChallanDocument({ challan }: { challan: ChallanDetail }) {
  const { seller, billTo } = challan;
  const watermark =
    challan.status === "draft" ? "DRAFT" : challan.status === "cancelled" ? "CANCELLED" : null;
  const totalQuantityMilli = challan.items.reduce((sum, item) => sum + item.quantityMilli, 0);

  return (
    <article
      aria-label={`Delivery challan ${challan.number ?? "draft"}`}
      className="relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-card border border-border bg-paper p-6 text-[13px] leading-relaxed text-paper-text shadow-1 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-6 print:shadow-none"
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
        <DocumentHeader seller={seller} />

        <DocumentTitle
          title="Delivery Challan"
          subtitle="Not a tax invoice"
          rows={[
            {
              label: "Challan No",
              value: <span className="font-mono">{challan.number ?? "Not yet issued"}</span>,
            },
            { label: "Challan Date", value: formatDate(challan.challanDate) },
            { label: "Reason", value: challan.reason },
            { label: "Place of Supply", value: challan.placeOfSupply },
            ...(challan.vehicleNumber
              ? [
                  {
                    label: "Vehicle No",
                    value: <span className="font-mono">{challan.vehicleNumber}</span>,
                  },
                ]
              : []),
            ...(challan.dispatchThrough
              ? [{ label: "Dispatched Through", value: challan.dispatchThrough }]
              : []),
          ]}
        />

        <section className="mt-8 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <PartyBlock title="Consignee" party={billTo} />
          <ServicesPanel seller={seller} />
        </section>

        {challan.shipTo && (
          <section className="mt-5 rounded-card border border-paper-border p-4">
            <h3 className="text-sm font-semibold text-paper-text">Deliver To</h3>
            <p className="mt-1 whitespace-pre-line text-xs text-paper-muted">{challan.shipTo}</p>
          </section>
        )}

        {/* Items */}
        <table className="mt-8 w-full border-collapse text-xs">
          <caption className="sr-only">Items in this consignment</caption>
          <thead>
            <tr className="bg-paper-brand text-paper-brand-ink">
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                S.No
              </th>
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                Description of Goods
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
                Value (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item, index) => (
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
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={3} className="px-3 py-2.5">
                Total
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                {formatQuantity(totalQuantityMilli)}
              </td>
              <td />
              <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                {formatAmount(challan.totalValuePaise)}
              </td>
            </tr>
          </tfoot>
        </table>

        <section className="mt-6 grid gap-6 sm:grid-cols-2 sm:items-start">
          <div className="text-xs text-paper-muted">
            <h3 className="text-xs font-semibold text-paper-text">Amount in Words</h3>
            <p>{amountInWords(challan.totalValuePaise)}</p>
            <p className="mt-3">
              This is a delivery challan, not a tax invoice. No GST is charged on this document; it
              is charged on the invoice raised against this delivery.
            </p>
          </div>

          <div className="flex items-baseline justify-between gap-4 rounded-card bg-paper-soft px-4 py-3">
            <p className="text-sm font-semibold">Value of Consignment (₹)</p>
            <p className="font-mono text-xl font-bold tabular-nums">
              {formatAmount(challan.totalValuePaise)}
            </p>
          </div>
        </section>

        {challan.notes && (
          <p className="mt-6 whitespace-pre-line border-t border-paper-border pt-4 text-xs text-paper-muted">
            {challan.notes}
          </p>
        )}

        <section className="mt-6 grid gap-6 border-t border-paper-border pt-5 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-paper-text">Received in Good Condition</h3>
            <div className="mt-10 border-t border-paper-border pt-1.5 text-xs text-paper-muted">
              Consignee’s name and signature
            </div>
          </div>
          <TermsList terms={challan.terms} />
          <SignatureBlock seller={seller} />
        </section>

        <DocumentFooter seller={seller} />
      </div>
    </article>
  );
}
