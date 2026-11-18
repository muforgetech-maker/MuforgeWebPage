import "server-only";
import { daysBetween, shiftMonth, todayIST } from "@/lib/erp/dates";
import { all, one } from "@/lib/erp/db";
import { TDS_METHOD } from "@/lib/erp/data/payments";

/*
 * Read-only figures for the dashboard and reports. Conventions:
 *   - Sales are issued invoices, by issue date. Drafts and voids never count.
 *   - Collections are payments by payment date, excluding TDS (not cash).
 *   - Expenses are by spend date, GST-inclusive.
 *   - Receivables are balances on issued invoices as of today.
 */

export type PeriodSummary = {
  invoiceCount: number;
  salesPaise: number;
  taxablePaise: number;
  outputTaxPaise: number;
  collectedPaise: number;
  tdsPaise: number;
  expensesPaise: number;
  inputTaxPaise: number;
  netCashPaise: number;
};

export async function periodSummary(from: string, to: string): Promise<PeriodSummary> {
  const sales = (await one<{ n: number; total: number; taxable: number; tax: number }>(
    `SELECT COUNT(*) AS n, COALESCE(SUM(total_paise), 0) AS total,
            COALESCE(SUM(subtotal_paise), 0) AS taxable,
            COALESCE(SUM(cgst_paise + sgst_paise + igst_paise), 0) AS tax
       FROM invoices WHERE status = 'issued' AND issue_date BETWEEN ? AND ?`,
    from,
    to,
  ))!;
  const receipts = (await one<{ cash: number; tds: number }>(
    `SELECT COALESCE(SUM(CASE WHEN method <> @tds THEN amount_paise END), 0) AS cash,
            COALESCE(SUM(CASE WHEN method = @tds THEN amount_paise END), 0) AS tds
       FROM payments WHERE paid_on BETWEEN @from AND @to`,
    { tds: TDS_METHOD, from, to },
  ))!;
  const spend = (await one<{ total: number; gst: number }>(
    `SELECT COALESCE(SUM(amount_paise), 0) AS total, COALESCE(SUM(gst_paise), 0) AS gst
       FROM expenses WHERE spent_on BETWEEN ? AND ?`,
    from,
    to,
  ))!;
  return {
    invoiceCount: sales.n,
    salesPaise: sales.total,
    taxablePaise: sales.taxable,
    outputTaxPaise: sales.tax,
    collectedPaise: receipts.cash,
    tdsPaise: receipts.tds,
    expensesPaise: spend.total,
    inputTaxPaise: spend.gst,
    netCashPaise: receipts.cash - spend.total,
  };
}

export type MonthRow = {
  month: string; // YYYY-MM
  salesPaise: number;
  collectedPaise: number;
  expensesPaise: number;
};

/** Month-by-month figures, including empty months, oldest first. */
export async function monthlyTrend(from: string, to: string): Promise<MonthRow[]> {
  const byMonth = new Map<string, MonthRow>();
  for (let month = from.slice(0, 7); month <= to.slice(0, 7); month = shiftMonth(`${month}-01`, 1).slice(0, 7)) {
    byMonth.set(month, { month, salesPaise: 0, collectedPaise: 0, expensesPaise: 0 });
  }

  const sales = await all<{ month: string; total: number }>(
    `SELECT substr(issue_date, 1, 7) AS month, SUM(total_paise) AS total FROM invoices
      WHERE status = 'issued' AND issue_date BETWEEN ? AND ? GROUP BY month`,
    from,
    to,
  );
  const collected = await all<{ month: string; total: number }>(
    `SELECT substr(paid_on, 1, 7) AS month, SUM(amount_paise) AS total FROM payments
      WHERE method <> ? AND paid_on BETWEEN ? AND ? GROUP BY month`,
    TDS_METHOD,
    from,
    to,
  );
  const expenses = await all<{ month: string; total: number }>(
    `SELECT substr(spent_on, 1, 7) AS month, SUM(amount_paise) AS total FROM expenses
      WHERE spent_on BETWEEN ? AND ? GROUP BY month`,
    from,
    to,
  );

  for (const row of sales) byMonth.get(row.month)!.salesPaise = row.total;
  for (const row of collected) byMonth.get(row.month)!.collectedPaise = row.total;
  for (const row of expenses) byMonth.get(row.month)!.expensesPaise = row.total;
  return [...byMonth.values()];
}

export type GstMonthRow = {
  month: string;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  inputTaxPaise: number;
};

/** Output GST on invoices against input GST on expenses, by month. */
export async function gstSummary(from: string, to: string): Promise<GstMonthRow[]> {
  const output = await all<Omit<GstMonthRow, "inputTaxPaise">>(
    `SELECT substr(issue_date, 1, 7) AS month, SUM(subtotal_paise) AS "taxablePaise",
            SUM(cgst_paise) AS "cgstPaise", SUM(sgst_paise) AS "sgstPaise", SUM(igst_paise) AS "igstPaise"
       FROM invoices WHERE status = 'issued' AND issue_date BETWEEN ? AND ?
      GROUP BY month`,
    from,
    to,
  );
  const input = await all<{ month: string; gst: number }>(
    `SELECT substr(spent_on, 1, 7) AS month, SUM(gst_paise) AS gst FROM expenses
      WHERE spent_on BETWEEN ? AND ? GROUP BY month`,
    from,
    to,
  );
  const months = new Map<string, GstMonthRow>();
  for (const row of output) months.set(row.month, { ...row, inputTaxPaise: 0 });
  for (const row of input) {
    const existing = months.get(row.month);
    if (existing) existing.inputTaxPaise = row.gst;
    else
      months.set(row.month, {
        month: row.month,
        taxablePaise: 0,
        cgstPaise: 0,
        sgstPaise: 0,
        igstPaise: 0,
        inputTaxPaise: row.gst,
      });
  }
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export type OpenInvoice = {
  id: number;
  number: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  totalPaise: number;
  balancePaise: number;
  daysOverdue: number;
};

/** Every issued invoice with money still owed, most overdue first. */
export async function openInvoices(): Promise<OpenInvoice[]> {
  const today = todayIST();
  const rows = await all<Omit<OpenInvoice, "daysOverdue">>(
    `SELECT i.id, i.number, c.name AS "clientName", i.issue_date AS "issueDate",
            i.due_date AS "dueDate", i.total_paise AS "totalPaise",
            i.total_paise - COALESCE(p.paid, 0) AS "balancePaise"
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       LEFT JOIN (SELECT invoice_id, SUM(amount_paise) AS paid FROM payments GROUP BY invoice_id) p
              ON p.invoice_id = i.id
      WHERE i.status = 'issued' AND i.total_paise - COALESCE(p.paid, 0) > 0
      ORDER BY i.due_date, i.id`,
  );
  return rows.map((row) => ({ ...row, daysOverdue: Math.max(0, daysBetween(row.dueDate, today)) }));
}

export type AgingBucket = { label: string; count: number; balancePaise: number };

/** Receivables split by how far past due they are. */
export function receivablesAging(open: OpenInvoice[]): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { label: "Not yet due", count: 0, balancePaise: 0 },
    { label: "1–30 days", count: 0, balancePaise: 0 },
    { label: "31–60 days", count: 0, balancePaise: 0 },
    { label: "61–90 days", count: 0, balancePaise: 0 },
    { label: "Over 90 days", count: 0, balancePaise: 0 },
  ];
  for (const invoice of open) {
    const d = invoice.daysOverdue;
    const index = d === 0 ? 0 : d <= 30 ? 1 : d <= 60 ? 2 : d <= 90 ? 3 : 4;
    buckets[index].count++;
    buckets[index].balancePaise += invoice.balancePaise;
  }
  return buckets;
}

export type ClientTotal = { clientId: number; clientName: string; salesPaise: number; invoiceCount: number };

export async function topClients(from: string, to: string, limit = 5): Promise<ClientTotal[]> {
  return await all<ClientTotal>(
    `SELECT c.id AS "clientId", c.name AS "clientName", SUM(i.total_paise) AS "salesPaise",
            COUNT(*) AS "invoiceCount"
       FROM invoices i JOIN clients c ON c.id = i.client_id
      WHERE i.status = 'issued' AND i.issue_date BETWEEN ? AND ?
      GROUP BY c.id ORDER BY "salesPaise" DESC LIMIT ?`,
    from,
    to,
    limit,
  );
}

export type ExpenseCategoryTotal = { category: string; totalPaise: number };

export async function expensesByCategory(from: string, to: string): Promise<ExpenseCategoryTotal[]> {
  return await all<ExpenseCategoryTotal>(
    `SELECT category, SUM(amount_paise) AS "totalPaise" FROM expenses
      WHERE spent_on BETWEEN ? AND ? GROUP BY category ORDER BY "totalPaise" DESC`,
    from,
    to,
  );
}

export type ActivityRow = {
  id: number;
  at: string;
  userName: string | null;
  action: string;
  entity: string;
  entityId: number | null;
  summary: string;
};

export async function recentActivity(limit = 100): Promise<ActivityRow[]> {
  return await all<ActivityRow>(
    `SELECT a.id, a.at, u.name AS "userName", a.action, a.entity, a.entity_id AS "entityId", a.summary
       FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.id DESC LIMIT ?`,
    limit,
  );
}

/** The first date anything was recorded, so "All time" starts somewhere real. */
export async function earliestActivity(): Promise<string | null> {
  const row = await one<{ first: string | null }>(
    `SELECT MIN(d) AS first FROM (
       SELECT MIN(issue_date) AS d FROM invoices WHERE status = 'issued'
       UNION ALL SELECT MIN(paid_on) FROM payments
       UNION ALL SELECT MIN(spent_on) FROM expenses)`,
  );
  return row?.first ?? null;
}
