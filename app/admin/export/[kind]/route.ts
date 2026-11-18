import { requireAdmin } from "@/lib/erp/auth";
import { listExpenses } from "@/lib/erp/data/expenses";
import { invoiceRegister } from "@/lib/erp/data/invoices";
import { listPayments } from "@/lib/erp/data/payments";
import { todayIST } from "@/lib/erp/dates";
import { stateName } from "@/lib/erp/gst";
import { paiseToInput } from "@/lib/erp/money";
import { resolvePeriod } from "@/lib/erp/period";

/*
 * CSV downloads for an accountant or a spreadsheet. Signed-in admins only;
 * the period comes from the same ?period= / ?from=&to= as the pages.
 */

type Cell = string | number;

// Text that starts with = + - @ can run as a formula when the file is opened
// in Excel or Sheets. Prefixing an apostrophe keeps it as plain text.
function text(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function toCsv(header: string[], rows: Cell[][]) {
  const escape = (cell: Cell) => {
    const value = String(cell);
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };
  // The BOM tells Excel the file is UTF-8, so ₹ and non-Latin names survive.
  return `﻿${[header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n")}\r\n`;
}

const money = (paise: number) => paiseToInput(paise);

export async function GET(request: Request, { params }: RouteContext<"/admin/export/[kind]">) {
  await requireAdmin();
  const { kind } = await params;
  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  const period = resolvePeriod(searchParams, todayIST(), "fy");

  let csv: string;
  if (kind === "invoices") {
    csv = toCsv(
      [
        "Invoice no", "Status", "Invoice date", "Due date", "Client", "Client GSTIN",
        "Place of supply", "Taxable value", "CGST", "SGST", "IGST", "Round off", "Total",
        "Paid", "Balance",
      ],
      (await invoiceRegister(period.from, period.to)).map((r) => {
        const isVoid = r.status === "void";
        return [
          r.number, isVoid ? "Void" : "Issued", r.issueDate, r.dueDate, text(r.clientName),
          r.clientGstin, `${r.placeOfSupply}-${stateName(r.placeOfSupply)}`,
          money(r.subtotalPaise), money(r.cgstPaise), money(r.sgstPaise), money(r.igstPaise),
          money(r.roundOffPaise), money(r.totalPaise), money(r.paidPaise),
          money(isVoid ? 0 : r.totalPaise - r.paidPaise),
        ];
      }),
    );
  } else if (kind === "payments") {
    csv = toCsv(
      ["Date", "Invoice no", "Client", "Method", "Reference", "Amount"],
      (await listPayments({ from: period.from, to: period.to })).map((p) => [
        p.paidOn, p.invoiceNumber, text(p.clientName), p.method, text(p.reference), money(p.amountPaise),
      ]),
    );
  } else if (kind === "expenses") {
    csv = toCsv(
      ["Date", "Category", "Description", "Paid to", "Method", "Reference", "Amount", "GST included"],
      (await listExpenses({ from: period.from, to: period.to })).map((e) => [
        e.spentOn, e.category, text(e.description), text(e.vendor), e.method, text(e.reference),
        money(e.amountPaise), money(e.gstPaise),
      ]),
    );
  } else {
    return new Response("Unknown export.", { status: 404 });
  }

  const range = period.key === "all" ? "all-time" : `${period.from}-to-${period.to}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="muforge-${kind}-${range}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
