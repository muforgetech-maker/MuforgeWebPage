import "server-only";
import { all, audit, one, run, transaction } from "@/lib/erp/db";
import { formatINR } from "@/lib/erp/money";

/*
 * Money going out. `amountPaise` is what was paid in total; `gstPaise` is the
 * GST portion of that, recorded so the reports can show input tax against
 * the output tax on invoices.
 */

export const expenseCategories = [
  "Software & subscriptions",
  "Hosting & domains",
  "Hardware & equipment",
  "Rent & utilities",
  "Internet & phone",
  "Marketing & advertising",
  "Salaries & contractors",
  "Professional fees",
  "Travel & conveyance",
  "Office supplies",
  "Bank charges",
  "Taxes & government fees",
  "Training & education",
  "Other",
] as const;

export const expenseMethods = ["UPI", "Bank transfer", "Card", "Cash", "Cheque", "Other"] as const;

export type ExpenseInput = {
  spentOn: string;
  category: (typeof expenseCategories)[number];
  vendor: string;
  description: string;
  amountPaise: number;
  gstPaise: number;
  method: (typeof expenseMethods)[number];
  reference: string;
  notes: string;
};

export type Expense = ExpenseInput & { id: number; createdAt: string };

const EXPENSE_COLUMNS = `
  id, spent_on AS spentOn, category, vendor, description, amount_paise AS amountPaise,
  gst_paise AS gstPaise, method, reference, notes, created_at AS createdAt`;

export function listExpenses(
  filter: { from?: string; to?: string; category?: string; query?: string } = {},
) {
  const like = `%${(filter.query ?? "").replace(/[\\%_]/g, "\\$&")}%`;
  return all<Expense>(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses
      WHERE (@from IS NULL OR spent_on >= @from)
        AND (@to IS NULL OR spent_on <= @to)
        AND (@category IS NULL OR category = @category)
        AND (description LIKE @like ESCAPE '\\' OR vendor LIKE @like ESCAPE '\\'
             OR reference LIKE @like ESCAPE '\\')
      ORDER BY spent_on DESC, id DESC`,
    {
      from: filter.from ?? null,
      to: filter.to ?? null,
      category: filter.category || null,
      like,
    },
  );
}

export function getExpense(id: number) {
  return one<Expense>(`SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE id = ?`, id) ?? null;
}

export function createExpense(userId: number, input: ExpenseInput) {
  return transaction(() => {
    const result = run(
      `INSERT INTO expenses (spent_on, category, vendor, description, amount_paise, gst_paise,
         method, reference, notes, created_by)
       VALUES (@spentOn, @category, @vendor, @description, @amountPaise, @gstPaise,
         @method, @reference, @notes, @userId)`,
      { ...input, userId },
    );
    const id = Number(result.lastInsertRowid);
    audit(userId, "create", "expense", id, `${formatINR(input.amountPaise)} ${input.description}`);
    return id;
  });
}

export function updateExpense(userId: number, id: number, input: ExpenseInput) {
  transaction(() => {
    run(
      `UPDATE expenses SET spent_on = @spentOn, category = @category, vendor = @vendor,
         description = @description, amount_paise = @amountPaise, gst_paise = @gstPaise,
         method = @method, reference = @reference, notes = @notes,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = @id`,
      { ...input, id },
    );
    audit(userId, "update", "expense", id, `${formatINR(input.amountPaise)} ${input.description}`);
  });
}

export function deleteExpense(userId: number, id: number) {
  transaction(() => {
    const expense = getExpense(id);
    run("DELETE FROM expenses WHERE id = ?", id);
    if (expense) {
      audit(userId, "delete", "expense", id, `${formatINR(expense.amountPaise)} ${expense.description}`);
    }
  });
}
