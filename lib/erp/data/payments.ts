import "server-only";
import { all, audit, insert, one, run, transaction } from "@/lib/erp/db";
import { formatINR } from "@/lib/erp/money";

/*
 * Money received against issued invoices. "TDS deducted" settles the part
 * of an invoice the client withheld as tax at source: it closes the balance
 * but is not cash in the bank, so reports keep it apart from collections.
 */

export const paymentMethods = [
  "UPI",
  "Bank transfer",
  "Cash",
  "Cheque",
  "Card",
  "TDS deducted",
  "Other",
] as const;

export const TDS_METHOD = "TDS deducted";

export class PaymentError extends Error {}

export type PaymentInput = {
  paidOn: string;
  amountPaise: number;
  method: (typeof paymentMethods)[number];
  reference: string;
  notes: string;
};

export type PaymentListRow = {
  id: number;
  paidOn: string;
  amountPaise: number;
  method: string;
  reference: string;
  invoiceId: number;
  invoiceNumber: string;
  clientName: string;
};

export async function listPayments(filter: { from?: string; to?: string; query?: string } = {}) {
  const like = `%${(filter.query ?? "").replace(/[\\%_]/g, "\\$&")}%`;
  return await all<PaymentListRow>(
    `SELECT p.id, p.paid_on AS "paidOn", p.amount_paise AS "amountPaise", p.method, p.reference,
            i.id AS "invoiceId", i.number AS "invoiceNumber", c.name AS "clientName"
       FROM payments p
       JOIN invoices i ON i.id = p.invoice_id
       JOIN clients c ON c.id = i.client_id
      WHERE (@from IS NULL OR p.paid_on >= @from)
        AND (@to IS NULL OR p.paid_on <= @to)
        AND (i.number ILIKE @like ESCAPE '\\' OR c.name ILIKE @like ESCAPE '\\'
             OR p.reference ILIKE @like ESCAPE '\\')
      ORDER BY p.paid_on DESC, p.id DESC`,
    { from: filter.from ?? null, to: filter.to ?? null, like },
  );
}

export async function recordPayment(userId: number, invoiceId: number, input: PaymentInput) {
  return await transaction(async () => {
    const invoice = await one<{ status: string; number: string; totalPaise: number; issueDate: string }>(
      `SELECT status, number, total_paise AS "totalPaise", issue_date AS "issueDate" FROM invoices WHERE id = ?`,
      invoiceId,
    );
    if (!invoice) throw new PaymentError("Invoice not found.");
    if (invoice.status !== "issued") {
      throw new PaymentError("Payments can only be recorded on issued invoices.");
    }
    const paid =
      (await one<{ paid: number }>(
        "SELECT COALESCE(SUM(amount_paise), 0) AS paid FROM payments WHERE invoice_id = ?",
        invoiceId,
      ))?.paid ?? 0;
    const balance = invoice.totalPaise - paid;
    if (input.amountPaise > balance) {
      throw new PaymentError(`That is more than the ${formatINR(balance)} still due on this invoice.`);
    }
    if (input.paidOn < invoice.issueDate) {
      throw new PaymentError("The payment date can’t be before the invoice date.");
    }

    const id = await insert(
      `INSERT INTO payments (invoice_id, paid_on, amount_paise, method, reference, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      invoiceId,
      input.paidOn,
      input.amountPaise,
      input.method,
      input.reference,
      input.notes,
      userId,
    );
    await audit(userId, "create", "payment", id, `${formatINR(input.amountPaise)} on ${invoice.number}`);
    return id;
  });
}

/** Removes a payment; returns the invoice it belonged to. */
export async function deletePayment(userId: number, paymentId: number) {
  return await transaction(async () => {
    const payment = await one<{ invoiceId: number; amountPaise: number; number: string }>(
      `SELECT p.invoice_id AS "invoiceId", p.amount_paise AS "amountPaise", i.number
         FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.id = ?`,
      paymentId,
    );
    if (!payment) throw new PaymentError("Payment not found.");
    await run("DELETE FROM payments WHERE id = ?", paymentId);
    await audit(
      userId,
      "delete",
      "payment",
      paymentId,
      `${formatINR(payment.amountPaise)} on ${payment.number}`,
    );
    return payment.invoiceId;
  });
}
