/*
 * Money is stored and computed as integer paise (₹1 = 100 paise) everywhere.
 * Floats only appear at the edges: parsing what someone typed and formatting
 * for display. Nothing in this file touches the server, so the invoice editor
 * can import it and show the same totals the server will store.
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const amountFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,23,456.70 */
export function formatINR(paise: number) {
  return inrFormatter.format(paise / 100);
}

/** 1,23,456.70, for table cells where the column header carries the ₹. */
export function formatAmount(paise: number) {
  return amountFormatter.format(paise / 100);
}

/** Plain decimal for an <input> value: 123456.7 → "123456.70". */
export function paiseToInput(paise: number) {
  return (paise / 100).toFixed(2);
}

/** Largest amount accepted anywhere: ₹100 crore. Keeps every product of two
 *  amounts comfortably inside BigInt math and every sum inside a safe integer. */
export const MAX_PAISE = 100_00_00_000_00;

/**
 * Parses "1,23,456.5" or "₹ 500" into paise. Returns null for anything that
 * is not a plain non-negative amount with at most two decimals, so a typo
 * never silently becomes a different number.
 */
export function parseRupeesToPaise(input: string): number | null {
  const cleaned = input.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, fraction = ""] = cleaned.split(".");
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(paise) || paise > MAX_PAISE) return null;
  return paise;
}

/** Quantities are stored ×1000 so 1.5 hours is 1500, with no float drift. */
export function parseQuantityToMilli(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,3})?$/.test(cleaned)) return null;
  const [whole, fraction = ""] = cleaned.split(".");
  const milli = Number(whole) * 1000 + Number(fraction.padEnd(3, "0"));
  if (!Number.isSafeInteger(milli) || milli <= 0 || milli > 1_000_000_000) return null;
  return milli;
}

/** 1500 → "1.5", 2000 → "2". */
export function formatQuantity(milli: number) {
  return (milli / 1000).toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

/** Rounds a non-negative BigInt ratio half-up and returns a number. */
export function divRoundHalfUp(numerator: bigint, denominator: bigint) {
  const two = BigInt(2);
  return Number((numerator * two + denominator) / (denominator * two));
}

// ---------------------------------------------------------------------------
// Amount in words, Indian system (thousand, lakh, crore), as printed on
// invoices: "Rupees Twelve Thousand Five Hundred and Fifty Paise Only".
// ---------------------------------------------------------------------------

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(n: number) {
  if (n < 20) return ones[n];
  return [tens[Math.floor(n / 10)], ones[n % 10]].filter(Boolean).join(" ");
}

function belowThousand(n: number) {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return [hundred ? `${ones[hundred]} Hundred` : "", rest ? belowHundred(rest) : ""]
    .filter(Boolean)
    .join(" ");
}

function wholeToWords(n: number): string {
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const rest = n % 1000;
  // Above 99 crore the crore count itself is spelled recursively.
  if (crore) parts.push(`${wholeToWords(crore)} Crore`);
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  return parts.join(" ");
}

export function amountInWords(paise: number) {
  const rupees = Math.floor(paise / 100);
  const remainder = paise % 100;
  const rupeeWords = `Rupees ${wholeToWords(rupees)}`;
  return remainder
    ? `${rupeeWords} and ${belowHundred(remainder)} Paise Only`
    : `${rupeeWords} Only`;
}

/** Axis-tick style, Indian units: ₹950, ₹50K, ₹1.5L, ₹2.4Cr. */
export function formatCompactINR(paise: number) {
  const rupees = paise / 100;
  const trim = (value: number) => value.toFixed(value < 10 ? 1 : 0).replace(/\.0$/, "");
  if (rupees >= 1_00_00_000) return `₹${trim(rupees / 1_00_00_000)}Cr`;
  if (rupees >= 1_00_000) return `₹${trim(rupees / 1_00_000)}L`;
  if (rupees >= 1000) return `₹${trim(rupees / 1000)}K`;
  return `₹${Math.round(rupees)}`;
}

/** A clean axis top and step (1, 2, 2.5 or 5 × 10ⁿ) covering `maxPaise` in ~4 steps. */
export function niceAxis(maxPaise: number, steps = 4) {
  if (maxPaise <= 0) return { top: 400000, step: 100000 };
  const raw = maxPaise / steps;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw)!;
  return { top: Math.ceil(maxPaise / step) * step, step };
}
