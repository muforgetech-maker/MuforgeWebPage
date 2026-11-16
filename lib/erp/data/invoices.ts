import "server-only";
import { addDays, financialYear, todayIST } from "@/lib/erp/dates";
import { all, audit, one, run, transaction } from "@/lib/erp/db";
import { stateName } from "@/lib/erp/gst";
import {
  computeInvoiceTotals,
  taxModeFor,
  type LineInput,
  type TaxMode,
} from "@/lib/erp/invoice-calc";
import { getClient } from "@/lib/erp/data/clients";
import { getSettings, type Settings } from "@/lib/erp/data/settings";

/*
 * Invoices: drafts are free to edit or delete and carry no number. Issuing
 * assigns the next consecutive number for the financial year (GST requires
 * an unbroken series) and freezes the client and seller details. An issued
 * invoice can still be corrected until a payment is recorded against it,
 * and can be voided, which keeps its number so the series stays unbroken.
 */

export class InvoiceError extends Error {}

export type InvoiceStatus = "draft" | "issued" | "void";
export type DisplayStatus = "draft" | "due" | "overdue" | "partial" | "paid" | "void";

export function displayStatus(
  status: InvoiceStatus,
  totalPaise: number,
  paidPaise: number,
  dueDate: string,
  today: string,
): DisplayStatus {
  if (status !== "issued") return status;
  if (paidPaise >= totalPaise) return "paid";
  if (dueDate < today) return "overdue";
  return paidPaise > 0 ? "partial" : "due";
}

export type Party = {
  name: string;
  contactPerson?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateCode: string;
  stateName: string;
  pincode: string;
  email: string;
  phone: string;
  gstin: string;
};

export type Seller = Party & {
  legalName: string;
  pan: string;
  website: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  bankBranch: string;
  upiId: string;
};

export type InvoiceInput = {
  clientId: number;
  issueDate: string;
  dueDate: string;
  placeOfSupply: string;
  notes: string;
  terms: string;
  lines: LineInput[];
};

export type InvoiceListRow = {
  id: number;
  number: string | null;
  status: InvoiceStatus;
  clientId: number;
  clientName: string;
  issueDate: string;
  dueDate: string;
  totalPaise: number;
  paidPaise: number;
  balancePaise: number;
  displayStatus: DisplayStatus;
};

export type InvoiceItem = LineInput & { id: number; amountPaise: number };

export type Payment = {
  id: number;
  paidOn: string;
  amountPaise: number;
  method: string;
  reference: string;
  notes: string;
};

export type InvoiceDetail = {
  id: number;
  number: string | null;
  status: InvoiceStatus;
  clientId: number;
  issueDate: string;
  dueDate: string;
  placeOfSupply: string;
  taxMode: TaxMode;
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  totalPaise: number;
  notes: string;
  terms: string;
  issuedAt: string | null;
  voidedAt: string | null;
  voidReason: string;
  createdAt: string;
  updatedAt: string;
  billTo: Party;
  seller: Seller;
  gstRegistered: boolean;
  items: InvoiceItem[];
  payments: Payment[];
  paidPaise: number;
  balancePaise: number;
  displayStatus: DisplayStatus;
};

// ---------------------------------------------------------------------------
// Snapshots
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
  };
}

function billToFor(clientId: number): Party {
  const client = getClient(clientId);
  if (!client) throw new InvoiceError("The client for this invoice no longer exists.");
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

export type InvoiceFilter = {
  status?: DisplayStatus | "all";
  query?: string;
  clientId?: number;
  from?: string;
  to?: string;
};

export function listInvoices(filter: InvoiceFilter = {}): InvoiceListRow[] {
  const today = todayIST();
  const like = `%${(filter.query ?? "").replace(/[\\%_]/g, "\\$&")}%`;
  const rows = all<Omit<InvoiceListRow, "balancePaise" | "displayStatus">>(
    `SELECT i.id, i.number, i.status, i.client_id AS clientId, c.name AS clientName,
            i.issue_date AS issueDate, i.due_date AS dueDate, i.total_paise AS totalPaise,
            COALESCE(p.paid, 0) AS paidPaise
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       LEFT JOIN (SELECT invoice_id, SUM(amount_paise) AS paid FROM payments GROUP BY invoice_id) p
              ON p.invoice_id = i.id
      WHERE (@clientId IS NULL OR i.client_id = @clientId)
        AND (@from IS NULL OR i.issue_date >= @from)
        AND (@to IS NULL OR i.issue_date <= @to)
        AND (COALESCE(i.number, '') LIKE @like ESCAPE '\\' OR c.name LIKE @like ESCAPE '\\')
      ORDER BY i.issue_date DESC, i.id DESC`,
    {
      clientId: filter.clientId ?? null,
      from: filter.from ?? null,
      to: filter.to ?? null,
      like,
    },
  );

  const enriched = rows.map((row) => ({
    ...row,
    balancePaise: row.status === "issued" ? row.totalPaise - row.paidPaise : 0,
    displayStatus: displayStatus(row.status, row.totalPaise, row.paidPaise, row.dueDate, today),
  }));

  const status = filter.status ?? "all";
  if (status === "all") return enriched;
  // "Unpaid" views include partial payments; overdue is its own bucket.
  return enriched.filter((row) => row.displayStatus === status);
}

export type RegisterRow = {
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientGstin: string;
  placeOfSupply: string;
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  totalPaise: number;
  paidPaise: number;
};

/** Issued and void invoices in number order: the sales register for GST filing. */
export function invoiceRegister(from: string, to: string): RegisterRow[] {
  return all<RegisterRow>(
    `SELECT i.number, i.status, i.issue_date AS issueDate, i.due_date AS dueDate,
            COALESCE(json_extract(i.bill_to_json, '$.name'), c.name) AS clientName,
            COALESCE(json_extract(i.bill_to_json, '$.gstin'), c.gstin) AS clientGstin,
            i.place_of_supply AS placeOfSupply, i.subtotal_paise AS subtotalPaise,
            i.cgst_paise AS cgstPaise, i.sgst_paise AS sgstPaise, i.igst_paise AS igstPaise,
            i.round_off_paise AS roundOffPaise, i.total_paise AS totalPaise,
            COALESCE(p.paid, 0) AS paidPaise
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       LEFT JOIN (SELECT invoice_id, SUM(amount_paise) AS paid FROM payments GROUP BY invoice_id) p
              ON p.invoice_id = i.id
      WHERE i.status <> 'draft' AND i.issue_date BETWEEN ? AND ?
      ORDER BY i.issue_date, i.number`,
    from,
    to,
  );
}

type InvoiceRow = Omit<
  InvoiceDetail,
  "billTo" | "seller" | "gstRegistered" | "items" | "payments" | "paidPaise" | "balancePaise" | "displayStatus"
> & { billToJson: string | null; sellerJson: string | null };

export function getInvoice(id: number): InvoiceDetail | null {
  const row = one<InvoiceRow>(
    `SELECT id, number, status, client_id AS clientId, issue_date AS issueDate,
            due_date AS dueDate, place_of_supply AS placeOfSupply, tax_mode AS taxMode,
            subtotal_paise AS subtotalPaise, cgst_paise AS cgstPaise, sgst_paise AS sgstPaise,
            igst_paise AS igstPaise, round_off_paise AS roundOffPaise, total_paise AS totalPaise,
            notes, terms, issued_at AS issuedAt, voided_at AS voidedAt, void_reason AS voidReason,
            created_at AS createdAt, updated_at AS updatedAt,
            bill_to_json AS billToJson, seller_json AS sellerJson
       FROM invoices WHERE id = ?`,
    id,
  );
  if (!row) return null;

  const items = all<InvoiceItem>(
    `SELECT id, description, sac, quantity_milli AS quantityMilli, unit,
            rate_paise AS ratePaise, tax_rate_bp AS taxRateBp, amount_paise AS amountPaise
       FROM invoice_items WHERE invoice_id = ? ORDER BY position`,
    id,
  );
  const payments = all<Payment>(
    `SELECT id, paid_on AS paidOn, amount_paise AS amountPaise, method, reference, notes
       FROM payments WHERE invoice_id = ? ORDER BY paid_on, id`,
    id,
  );

  // Drafts show live details; issued and void invoices show their snapshot.
  const { billToJson, sellerJson, ...invoice } = row;
  const seller: Seller = sellerJson ? JSON.parse(sellerJson) : sellerFrom(getSettings());
  const billTo: Party = billToJson ? JSON.parse(billToJson) : billToFor(invoice.clientId);
  const paidPaise = payments.reduce((sum, p) => sum + p.amountPaise, 0);

  return {
    ...invoice,
    billTo,
    seller,
    gstRegistered: invoice.taxMode !== "none",
    items,
    payments,
    paidPaise,
    balancePaise: invoice.status === "issued" ? invoice.totalPaise - paidPaise : 0,
    displayStatus: displayStatus(
      invoice.status,
      invoice.totalPaise,
      paidPaise,
      invoice.dueDate,
      todayIST(),
    ),
  };
}

/** Whether the line items and header may still change. */
export function isEditable(invoice: Pick<InvoiceDetail, "status" | "payments">) {
  return invoice.status === "draft" || (invoice.status === "issued" && invoice.payments.length === 0);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

function computeFor(input: InvoiceInput, settings: Settings) {
  const mode = taxModeFor(settings.gstRegistered, settings.stateCode, input.placeOfSupply);
  return { mode, totals: computeInvoiceTotals(input.lines, mode, settings.roundOff) };
}

function writeItems(invoiceId: number, lines: ReturnType<typeof computeInvoiceTotals>["lines"]) {
  run("DELETE FROM invoice_items WHERE invoice_id = ?", invoiceId);
  lines.forEach((line, position) => {
    run(
      `INSERT INTO invoice_items (invoice_id, position, description, sac, quantity_milli,
         unit, rate_paise, tax_rate_bp, amount_paise)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      invoiceId,
      position,
      line.description,
      line.sac,
      line.quantityMilli,
      line.unit,
      line.ratePaise,
      line.taxRateBp,
      line.amountPaise,
    );
  });
}

function nextInvoiceNumber(prefix: string, issueDate: string) {
  const fy = financialYear(issueDate);
  const row = one<{ lastNumber: number }>(
    `INSERT INTO invoice_sequences (financial_year, last_number) VALUES (?, 1)
     ON CONFLICT (financial_year) DO UPDATE SET last_number = last_number + 1
     RETURNING last_number AS lastNumber`,
    fy,
  );
  return `${prefix}/${fy}/${String(row!.lastNumber).padStart(4, "0")}`;
}

/** Assigns a number and freezes details. Runs inside the caller's transaction. */
function issueInPlace(userId: number, id: number) {
  const invoice = getInvoice(id);
  if (!invoice) throw new InvoiceError("Invoice not found.");
  if (invoice.status !== "draft") throw new InvoiceError("Only a draft can be issued.");
  if (invoice.items.length === 0) throw new InvoiceError("Add at least one line before issuing.");

  const settings = getSettings();
  if (settings.gstRegistered && !settings.gstin) {
    throw new InvoiceError("Add your GSTIN under Settings before issuing a GST invoice.");
  }

  // Recompute with today's settings in case GST or rounding changed since the draft was saved.
  const { mode, totals } = computeFor({ ...invoice, lines: invoice.items }, settings);
  const number = nextInvoiceNumber(settings.invoicePrefix, invoice.issueDate);

  writeItems(id, totals.lines);
  run(
    `UPDATE invoices SET status = 'issued', number = ?, tax_mode = ?,
       subtotal_paise = ?, cgst_paise = ?, sgst_paise = ?, igst_paise = ?,
       round_off_paise = ?, total_paise = ?, bill_to_json = ?, seller_json = ?,
       issued_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'),
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
     WHERE id = ?`,
    number,
    mode,
    totals.subtotalPaise,
    totals.cgstPaise,
    totals.sgstPaise,
    totals.igstPaise,
    totals.roundOffPaise,
    totals.totalPaise,
    JSON.stringify(billToFor(invoice.clientId)),
    JSON.stringify(sellerFrom(settings)),
    id,
  );
  audit(userId, "issue", "invoice", id, number);
  return number;
}

export function createInvoice(userId: number, input: InvoiceInput, issue: boolean) {
  return transaction(() => {
    const settings = getSettings();
    const { mode, totals } = computeFor(input, settings);
    const result = run(
      `INSERT INTO invoices (status, client_id, issue_date, due_date, place_of_supply, tax_mode,
         subtotal_paise, cgst_paise, sgst_paise, igst_paise, round_off_paise, total_paise,
         notes, terms, created_by)
       VALUES ('draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.clientId,
      input.issueDate,
      input.dueDate,
      input.placeOfSupply,
      mode,
      totals.subtotalPaise,
      totals.cgstPaise,
      totals.sgstPaise,
      totals.igstPaise,
      totals.roundOffPaise,
      totals.totalPaise,
      input.notes,
      input.terms,
      userId,
    );
    const id = Number(result.lastInsertRowid);
    writeItems(id, totals.lines);
    audit(userId, "create", "invoice", id, "Draft created");
    if (issue) issueInPlace(userId, id);
    return id;
  });
}

export function updateInvoice(userId: number, id: number, input: InvoiceInput, issue: boolean) {
  transaction(() => {
    const existing = getInvoice(id);
    if (!existing) throw new InvoiceError("Invoice not found.");
    if (!isEditable(existing)) {
      throw new InvoiceError(
        existing.status === "void"
          ? "A void invoice can’t be edited."
          : "This invoice has payments recorded, so it can no longer be edited.",
      );
    }
    if (
      existing.status === "issued" &&
      financialYear(input.issueDate) !== financialYear(existing.issueDate)
    ) {
      throw new InvoiceError(
        `Invoice ${existing.number} belongs to FY ${financialYear(existing.issueDate)}; keep its date in that year.`,
      );
    }

    const settings = getSettings();
    const { mode, totals } = computeFor(input, settings);
    const isIssued = existing.status === "issued";

    run(
      `UPDATE invoices SET client_id = ?, issue_date = ?, due_date = ?, place_of_supply = ?,
         tax_mode = ?, subtotal_paise = ?, cgst_paise = ?, sgst_paise = ?, igst_paise = ?,
         round_off_paise = ?, total_paise = ?, notes = ?, terms = ?,
         bill_to_json = ?, seller_json = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ?`,
      input.clientId,
      input.issueDate,
      input.dueDate,
      input.placeOfSupply,
      mode,
      totals.subtotalPaise,
      totals.cgstPaise,
      totals.sgstPaise,
      totals.igstPaise,
      totals.roundOffPaise,
      totals.totalPaise,
      input.notes,
      input.terms,
      // A corrected issued invoice is re-issued with current details.
      isIssued ? JSON.stringify(billToFor(input.clientId)) : null,
      isIssued ? JSON.stringify(sellerFrom(settings)) : null,
      id,
    );
    writeItems(id, totals.lines);
    audit(userId, "update", "invoice", id, existing.number ?? "Draft");
    if (issue && !isIssued) issueInPlace(userId, id);
  });
}

export function issueInvoice(userId: number, id: number) {
  return transaction(() => issueInPlace(userId, id));
}

export function voidInvoice(userId: number, id: number, reason: string) {
  transaction(() => {
    const invoice = getInvoice(id);
    if (!invoice) throw new InvoiceError("Invoice not found.");
    if (invoice.status !== "issued") throw new InvoiceError("Only an issued invoice can be voided.");
    if (invoice.payments.length > 0) {
      throw new InvoiceError("Delete the payments recorded on this invoice before voiding it.");
    }
    run(
      `UPDATE invoices SET status = 'void', void_reason = ?,
         voided_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'),
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ?`,
      reason,
      id,
    );
    audit(userId, "void", "invoice", id, `${invoice.number}: ${reason}`);
  });
}

export function deleteDraft(userId: number, id: number) {
  transaction(() => {
    const invoice = getInvoice(id);
    if (!invoice) throw new InvoiceError("Invoice not found.");
    if (invoice.status !== "draft") {
      throw new InvoiceError("Issued invoices can’t be deleted; void them instead.");
    }
    run("DELETE FROM invoices WHERE id = ?", id);
    audit(userId, "delete", "invoice", id, "Draft deleted");
  });
}

/** Copies an invoice's client and lines into a new draft dated today. */
export function duplicateInvoice(userId: number, id: number) {
  const source = getInvoice(id);
  if (!source) throw new InvoiceError("Invoice not found.");
  const client = getClient(source.clientId);
  if (!client || client.archived) {
    throw new InvoiceError("This invoice’s client is archived. Restore the client first.");
  }
  const settings = getSettings();
  const issueDate = todayIST();
  return createInvoice(
    userId,
    {
      clientId: source.clientId,
      issueDate,
      dueDate: addDays(issueDate, settings.paymentTermsDays),
      placeOfSupply: client.stateCode,
      notes: source.notes,
      terms: source.terms,
      lines: source.items.map(({ description, sac, quantityMilli, unit, ratePaise, taxRateBp }) => ({
        description,
        sac,
        quantityMilli,
        unit,
        ratePaise,
        taxRateBp,
      })),
    },
    false,
  );
}
