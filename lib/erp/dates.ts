/*
 * Dates are stored as ISO calendar dates ("2026-11-16") with no time or zone.
 * "Today" always means today in India, whatever timezone the server runs in,
 * so an invoice raised at 1am IST is not dated yesterday on a UTC host.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIST() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isValidISODate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/** Indian financial year, April to March: 2026-11-16 → "2026-27". */
export function financialYear(isoDate: string) {
  const year = Number(isoDate.slice(0, 4));
  const month = Number(isoDate.slice(5, 7));
  const start = month >= 4 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/** First and last day of the financial year containing the date. */
export function financialYearRange(isoDate: string) {
  const fy = financialYear(isoDate);
  const start = Number(fy.slice(0, 4));
  return { from: `${start}-04-01`, to: `${start + 1}-03-31` };
}

export function monthRange(isoDate: string) {
  const from = `${isoDate.slice(0, 7)}-01`;
  const next = new Date(`${from}T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(0);
  return { from, to: next.toISOString().slice(0, 10) };
}

/** Shifts a YYYY-MM-DD date by whole months, landing on the 1st. */
export function shiftMonth(isoDate: string, months: number) {
  const date = new Date(`${isoDate.slice(0, 7)}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

const displayFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "16 Nov 2026" */
export function formatDate(isoDate: string) {
  return displayFormatter.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

/** "2026-11" → "Nov 2026" */
export function formatMonth(yearMonth: string) {
  return monthFormatter.format(new Date(`${yearMonth}-01T00:00:00Z`));
}

const timestampFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

/** Full UTC timestamp → "16 Nov 2026, 3:42 pm" in IST. */
export function formatTimestamp(isoTimestamp: string) {
  return timestampFormatter.format(new Date(isoTimestamp));
}
