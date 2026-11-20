import "server-only";
import { financialYear, todayIST } from "@/lib/erp/dates";
import { all, audit, insert, one, run, transaction } from "@/lib/erp/db";
import { stateName } from "@/lib/erp/gst";
import {
  computeInvoiceTotals,
  taxModeFor,
  type LineInput,
  type TaxMode,
} from "@/lib/erp/invoice-calc";
import { getClient } from "@/lib/erp/data/clients";
import { createInvoice, type Party, type Seller } from "@/lib/erp/data/invoices";
import { getSettings, type Settings } from "@/lib/erp/data/settings";

/*
 * Delivery challans.
 *
 * A challan accompanies goods or deliverables that move before they are
 * billed -- job work, supply on approval, a handover ahead of the invoice.
 * It states the value of the consignment and, as GST Rule 55(2)(f) asks for
 * a movement that is a supply, the tax on it: rate-wise CGST + SGST inside
 * the seller's state or IGST across states, worked out exactly as an invoice
 * does. It is still not a tax invoice. The tax is charged, and reported, on
 * the invoice raised afterwards; challans never count in the GST reports.
 *
 * The lifecycle mirrors invoices on purpose, so the two read the same way.
 * A draft carries no number and can be changed or deleted freely. Issuing
 * assigns the next number in its own per-financial-year series and freezes
 * the consignee and company details onto the document. An issued challan
 * can be cancelled, which keeps its number so the series stays unbroken.
 */

export class ChallanError extends Error {}

export type ChallanStatus = "draft" | "issued" | "cancelled";

/** The purposes Rule 55 recognises for moving goods without an invoice. */
export const challanReasons = [
  "Supply",
  "Job work",
  "Supply on approval",
  "SKD/CKD supply",
  "Line sales",
  "Recipient not known",
  "Other",
] as const;

export type ChallanReason = (typeof challanReasons)[number];

/** A challan line is an invoice line: same fields, same rounding, same tax. */
export type ChallanLineInput = LineInput;

export type ChallanItem = ChallanLineInput & { id: number; amountPaise: number };

export type ChallanInput = {
  clientId: number;
  challanDate: string;
  reason: string;
  placeOfSupply: string;
  vehicleNumber: string;
  dispatchThrough: string;
  shipTo: string;
  notes: string;
  terms: string;
  lines: ChallanLineInput[];
};

export type ChallanListRow = {
  id: number;
  number: string | null;
  status: ChallanStatus;
  clientId: number;
  clientName: string;
  challanDate: string;
  reason: string;
  totalValuePaise: number;
  /** Value plus tax plus round-off. */
  totalPaise: number;
  invoiceId: number | null;
  invoiceNumber: string | null;
};

export type ChallanDetail = {
  id: number;
  number: string | null;
  status: ChallanStatus;
  clientId: number;
  challanDate: string;
  reason: string;
  placeOfSupply: string;
  vehicleNumber: string;
  dispatchThrough: string;
  shipTo: string;
  notes: string;
  terms: string;
  /** The taxable value: quantity × rate, summed over the lines. */
  totalValuePaise: number;
  taxMode: TaxMode;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  /** Value plus tax plus round-off. */
  totalPaise: number;
  invoiceId: number | null;
  invoiceNumber: string | null;
  issuedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string;
  createdAt: string;
  updatedAt: string;
  billTo: Party;
  seller: Seller;
  items: ChallanItem[];
};

/**
 * Prices the lines and works out the tax, with the invoice's own arithmetic
 * and the current settings: the tax split follows the place of supply, an
 * unregistered business charges none, and the total is rounded the same way.
 * A challan and the invoice raised from it therefore never disagree by a
 * paisa.
 */
function totalsFor(lines: ChallanLineInput[], settings: Settings, placeOfSupply: string) {
  const mode = taxModeFor(settings.gstRegistered, settings.stateCode, placeOfSupply);
  return { mode, totals: computeInvoiceTotals(lines, mode, settings.roundOff) };
}

type Totals = ReturnType<typeof totalsFor>;

/** The stored tax columns, in the order the UPDATE/INSERT statements list them. */
function taxColumns({ mode, totals }: Totals) {
  return [
    totals.subtotalPaise,
    mode,
    totals.cgstPaise,
    totals.sgstPaise,
    totals.igstPaise,
    totals.roundOffPaise,
    totals.totalPaise,
  ] as const;
}

// ---------------------------------------------------------------------------
// Snapshots
//
// These reuse the invoice Party/Seller shapes so one printable document
// component can render either kind of paperwork.
// ---------------------------------------------------------------------------

function sellerFrom(settings: Settings): Seller {
  return {
    name: settings.businessName,
    legalName: settings.legalName,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    city: settings.city,
    stateCode: settings.stateCode,
    stateName: stateName(settings.stateCode),
    pincode: settings.pincode,
    email: settings.email,
    phone: settings.phone,
    website: settings.website,
    gstin: settings.gstRegistered ? settings.gstin : "",
    pan: settings.pan,
    bankAccountName: settings.bankAccountName,
    bankAccountNumber: settings.bankAccountNumber,
    bankIfsc: settings.bankIfsc,
    bankName: settings.bankName,
    bankBranch: settings.bankBranch,
    upiId: settings.upiId,
    strapline: settings.strapline,
    tagline: settings.tagline,
    instagram: settings.instagram,
    panelHeading: settings.panelHeading,
    panelServices: settings.panelServices,
    panelQuote: settings.panelQuote,
    footerLine: settings.footerLine,
  };
}

async function billToFor(clientId: number): Promise<Party> {
  const client = await getClient(clientId);
  if (!client) throw new ChallanError("The client for this challan no longer exists.");
  return {
    name: client.name,
    contactPerson: client.contactPerson,
    addressLine1: client.addressLine1,
    addressLine2: client.addressLine2,
    city: client.city,
    stateCode: client.stateCode,
    stateName: stateName(client.stateCode),
    pincode: client.pincode,
    email: client.email,
    phone: client.phone,
    gstin: client.gstin,
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type ChallanFilter = {
  status?: ChallanStatus | "all";
  query?: string;
  clientId?: number;
};

export async function listChallans(filter: ChallanFilter = {}): Promise<ChallanListRow[]> {
  const like = `%${(filter.query ?? "").replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await all<ChallanListRow>(
    `SELECT d.id, d.number, d.status, d.client_id AS "clientId", c.name AS "clientName",
            d.challan_date AS "challanDate", d.reason,
            d.total_value_paise AS "totalValuePaise", d.total_paise AS "totalPaise",
            d.invoice_id AS "invoiceId", i.number AS "invoiceNumber"
       FROM delivery_challans d
       JOIN clients c ON c.id = d.client_id
       LEFT JOIN invoices i ON i.id = d.invoice_id
      WHERE (@clientId::int IS NULL OR d.client_id = @clientId)
        AND (COALESCE(d.number, '') ILIKE @like ESCAPE '\\' OR c.name ILIKE @like ESCAPE '\\')
      ORDER BY d.challan_date DESC, d.id DESC`,
    { clientId: filter.clientId ?? null, like },
  );
  if (!filter.status || filter.status === "all") return rows;
  return rows.filter((row) => row.status === filter.status);
}

type ChallanRow = Omit<ChallanDetail, "billTo" | "seller" | "items"> & {
  billToJson: string | null;
  sellerJson: string | null;
};

export async function getChallan(id: number): Promise<ChallanDetail | null> {
  const row = await one<ChallanRow>(
    `SELECT d.id, d.number, d.status, d.client_id AS "clientId",
            d.challan_date AS "challanDate", d.reason, d.place_of_supply AS "placeOfSupply",
            d.vehicle_number AS "vehicleNumber", d.dispatch_through AS "dispatchThrough",
            d.ship_to AS "shipTo", d.notes, d.terms,
            d.total_value_paise AS "totalValuePaise", d.tax_mode AS "taxMode",
            d.cgst_paise AS "cgstPaise", d.sgst_paise AS "sgstPaise", d.igst_paise AS "igstPaise",
            d.round_off_paise AS "roundOffPaise", d.total_paise AS "totalPaise",
            d.invoice_id AS "invoiceId", i.number AS "invoiceNumber",
            d.issued_at AS "issuedAt", d.cancelled_at AS "cancelledAt",
            d.cancel_reason AS "cancelReason",
            d.created_at AS "createdAt", d.updated_at AS "updatedAt",
            d.bill_to_json AS "billToJson", d.seller_json AS "sellerJson"
       FROM delivery_challans d
       LEFT JOIN invoices i ON i.id = d.invoice_id
      WHERE d.id = ?`,
    id,
  );
  if (!row) return null;

  const items = await all<ChallanItem>(
    `SELECT id, description, sac, quantity_milli AS "quantityMilli", unit,
            rate_paise AS "ratePaise", tax_rate_bp AS "taxRateBp", amount_paise AS "amountPaise"
       FROM delivery_challan_items WHERE challan_id = ? ORDER BY position`,
    id,
  );

  // Drafts show live details; issued and cancelled ones show their snapshot.
  const { billToJson, sellerJson, ...challan } = row;
  const seller: Seller = sellerJson ? JSON.parse(sellerJson) : sellerFrom(await getSettings());
  const billTo: Party = billToJson ? JSON.parse(billToJson) : await billToFor(challan.clientId);

  return { ...challan, billTo, seller, items };
}

/** Whether the lines and header may still change. */
export function isEditable(challan: Pick<ChallanDetail, "status" | "invoiceId">) {
  return challan.status !== "cancelled" && challan.invoiceId === null;
}

/**
 * How to name the invoice a challan became, in a message.
 *
 * An invoice raised from a challan starts as a draft and has no number
 * until it is issued, so naming it blindly produces "invoiced as null".
 */
function invoiceLabel(challan: Pick<ChallanDetail, "invoiceNumber">) {
  return challan.invoiceNumber ?? "a draft invoice";
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

async function writeItems(challanId: number, lines: Totals["totals"]["lines"]) {
  await run("DELETE FROM delivery_challan_items WHERE challan_id = ?", challanId);
  // Sequential: these share the caller's transaction, which is one
  // connection, so the inserts cannot be issued concurrently.
  for (const [position, line] of lines.entries()) {
    await run(
      `INSERT INTO delivery_challan_items (challan_id, position, description, sac,
         quantity_milli, unit, rate_paise, tax_rate_bp, amount_paise)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      challanId,
      position,
      line.description,
      line.sac,
      line.quantityMilli,
      line.unit,
      line.ratePaise,
      line.taxRateBp,
      line.amountPaise,
    );
  }
}

/** Saves the lines and the figures worked out from them. */
async function writeTotals(challanId: number, computed: Totals) {
  await writeItems(challanId, computed.totals.lines);
  await run(
    `UPDATE delivery_challans SET total_value_paise = ?, tax_mode = ?, cgst_paise = ?,
       sgst_paise = ?, igst_paise = ?, round_off_paise = ?, total_paise = ?
     WHERE id = ?`,
    ...taxColumns(computed),
    challanId,
  );
}

async function nextChallanNumber(prefix: string, challanDate: string) {
  const fy = financialYear(challanDate);
  const row = await one<{ lastNumber: number }>(
    `INSERT INTO challan_sequences (financial_year, last_number) VALUES (?, 1)
     ON CONFLICT (financial_year)
       DO UPDATE SET last_number = challan_sequences.last_number + 1
     RETURNING last_number AS "lastNumber"`,
    fy,
  );
  return `${prefix}/${fy}/${String(row!.lastNumber).padStart(4, "0")}`;
}

/** Assigns a number and freezes details. Runs inside the caller's transaction. */
async function issueInPlace(userId: number, id: number) {
  const challan = await getChallan(id);
  if (!challan) throw new ChallanError("Challan not found.");
  if (challan.status !== "draft") throw new ChallanError("Only a draft can be issued.");
  if (challan.items.length === 0) throw new ChallanError("Add at least one line before issuing.");

  const settings = await getSettings();
  const number = await nextChallanNumber(settings.challanPrefix, challan.challanDate);

  // Recompute with today's settings, as an invoice does, in case GST
  // registration or rounding changed while this sat as a draft.
  await writeTotals(id, totalsFor(challan.items, settings, challan.placeOfSupply));
  await run(
    `UPDATE delivery_challans SET status = 'issued', number = ?,
       bill_to_json = ?, seller_json = ?, issued_at = erp_now(), updated_at = erp_now()
     WHERE id = ?`,
    number,
    JSON.stringify(await billToFor(challan.clientId)),
    JSON.stringify(sellerFrom(settings)),
    id,
  );
  await audit(userId, "issue", "challan", id, number);
  return number;
}

export async function createChallan(userId: number, input: ChallanInput, issue: boolean) {
  return await transaction(async () => {
    const computed = totalsFor(input.lines, await getSettings(), input.placeOfSupply);
    const id = await insert(
      `INSERT INTO delivery_challans (status, client_id, challan_date, reason, place_of_supply,
         vehicle_number, dispatch_through, ship_to, notes, terms, total_value_paise, tax_mode,
         cgst_paise, sgst_paise, igst_paise, round_off_paise, total_paise, created_by)
       VALUES ('draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.clientId,
      input.challanDate,
      input.reason,
      input.placeOfSupply,
      input.vehicleNumber,
      input.dispatchThrough,
      input.shipTo,
      input.notes,
      input.terms,
      ...taxColumns(computed),
      userId,
    );
    await writeItems(id, computed.totals.lines);
    await audit(userId, "create", "challan", id, "Draft created");
    if (issue) await issueInPlace(userId, id);
    return id;
  });
}

export async function updateChallan(userId: number, id: number, input: ChallanInput, issue: boolean) {
  await transaction(async () => {
    const existing = await getChallan(id);
    if (!existing) throw new ChallanError("Challan not found.");
    if (!isEditable(existing)) {
      throw new ChallanError(
        existing.status === "cancelled"
          ? "A cancelled challan can’t be edited."
          : `This challan has been invoiced as ${invoiceLabel(existing)}, so it can no longer be edited.`,
      );
    }
    if (
      existing.status === "issued" &&
      financialYear(input.challanDate) !== financialYear(existing.challanDate)
    ) {
      throw new ChallanError(
        `Challan ${existing.number} belongs to FY ${financialYear(existing.challanDate)}; keep its date in that year.`,
      );
    }

    await run(
      `UPDATE delivery_challans SET client_id = ?, challan_date = ?, reason = ?,
         place_of_supply = ?, vehicle_number = ?, dispatch_through = ?, ship_to = ?,
         notes = ?, terms = ?, updated_at = erp_now()
       WHERE id = ?`,
      input.clientId,
      input.challanDate,
      input.reason,
      input.placeOfSupply,
      input.vehicleNumber,
      input.dispatchThrough,
      input.shipTo,
      input.notes,
      input.terms,
      id,
    );
    await writeTotals(id, totalsFor(input.lines, await getSettings(), input.placeOfSupply));

    // An issued challan has already gone out with the consignment, so the
    // snapshot is refreshed to match what the corrected document now says.
    if (existing.status === "issued") {
      await run(
        "UPDATE delivery_challans SET bill_to_json = ? WHERE id = ?",
        JSON.stringify(await billToFor(input.clientId)),
        id,
      );
    }

    await audit(userId, "update", "challan", id, existing.number ?? "Draft");
    if (issue && existing.status === "draft") await issueInPlace(userId, id);
  });
}

export async function issueChallan(userId: number, id: number) {
  return await transaction(async () => await issueInPlace(userId, id));
}

export async function cancelChallan(userId: number, id: number, reason: string) {
  await transaction(async () => {
    const challan = await getChallan(id);
    if (!challan) throw new ChallanError("Challan not found.");
    if (challan.status !== "issued") throw new ChallanError("Only an issued challan can be cancelled.");
    if (challan.invoiceId) {
      throw new ChallanError(
        `This challan has been invoiced as ${invoiceLabel(challan)}. Void that invoice first.`,
      );
    }
    await run(
      `UPDATE delivery_challans SET status = 'cancelled', cancel_reason = ?,
         cancelled_at = erp_now(), updated_at = erp_now() WHERE id = ?`,
      reason,
      id,
    );
    await audit(userId, "cancel", "challan", id, `${challan.number}: ${reason}`);
  });
}

export async function deleteDraftChallan(userId: number, id: number) {
  await transaction(async () => {
    const challan = await getChallan(id);
    if (!challan) throw new ChallanError("Challan not found.");
    if (challan.status !== "draft") {
      throw new ChallanError("Only a draft can be deleted. Cancel the challan instead.");
    }
    await run("DELETE FROM delivery_challans WHERE id = ?", id);
    await audit(userId, "delete", "challan", id, "Draft deleted");
  });
}

/**
 * Raises a draft invoice carrying this challan's lines.
 *
 * The challan records which invoice it became, so the same consignment
 * cannot be billed twice by accident. Each line keeps the GST rate it shows
 * on the challan, so the invoice charges the tax the challan stated. A
 * challan saved without tax -- one from before tax was shown on challans,
 * or one written while the business was unregistered -- falls back to the
 * default rate, which is what every invoice raised from a challan used to get.
 */
export async function invoiceFromChallan(userId: number, id: number, dueDate: string) {
  return await transaction(async () => {
    const challan = await getChallan(id);
    if (!challan) throw new ChallanError("Challan not found.");
    if (challan.status !== "issued") {
      throw new ChallanError("Issue the challan before raising an invoice from it.");
    }
    if (challan.invoiceId) {
      throw new ChallanError(`This challan is already invoiced as ${invoiceLabel(challan)}.`);
    }
    if (challan.items.length === 0) throw new ChallanError("This challan has no lines.");

    const settings = await getSettings();
    const defaultRateBp = settings.gstRegistered ? settings.defaultTaxRateBp : 0;
    const rateFor = (item: ChallanItem) =>
      challan.taxMode === "none" ? defaultRateBp : item.taxRateBp;
    const invoiceId = await createInvoice(
      userId,
      {
        clientId: challan.clientId,
        issueDate: todayIST(),
        dueDate,
        placeOfSupply: challan.placeOfSupply,
        notes: challan.number ? `Against delivery challan ${challan.number}.` : "",
        terms: settings.invoiceTerms,
        lines: challan.items.map((item) => ({
          description: item.description,
          sac: item.sac,
          quantityMilli: item.quantityMilli,
          unit: item.unit,
          ratePaise: item.ratePaise,
          taxRateBp: rateFor(item),
        })),
      },
      false,
    );

    await run(
      "UPDATE delivery_challans SET invoice_id = ?, updated_at = erp_now() WHERE id = ?",
      invoiceId,
      id,
    );
    await audit(userId, "invoice", "challan", id, `${challan.number} invoiced`);
    return invoiceId;
  });
}
