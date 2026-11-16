import {
  financialYear,
  financialYearRange,
  formatDate,
  isValidISODate,
  monthRange,
  shiftMonth,
} from "@/lib/erp/dates";

/*
 * Reporting periods, read from ?period= (a preset) or ?from=&to= (custom).
 * Financial years run April to March.
 */

export const periodPresets = [
  { key: "month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "fy", label: "This FY" },
  { key: "last-fy", label: "Last FY" },
  { key: "all", label: "All time" },
] as const;

export type PeriodKey = (typeof periodPresets)[number]["key"] | "custom";

export type Period = { key: PeriodKey; from: string; to: string; label: string };

const EARLIEST = "2000-01-01";
const LATEST = "2099-12-31";

export function presetRange(key: PeriodKey, today: string): Period {
  switch (key) {
    case "month": {
      const range = monthRange(today);
      return { key, ...range, label: "This month" };
    }
    case "last-month": {
      const range = monthRange(shiftMonth(today, -1));
      return { key, ...range, label: "Last month" };
    }
    case "last-fy": {
      const lastYearDay = `${Number(financialYearRange(today).from.slice(0, 4)) - 1}-06-01`;
      return { key, ...financialYearRange(lastYearDay), label: `FY ${financialYear(lastYearDay)}` };
    }
    case "all":
      return { key, from: EARLIEST, to: LATEST, label: "All time" };
    default:
      return { key: "fy", ...financialYearRange(today), label: `FY ${financialYear(today)}` };
  }
}

/** Resolves the period from search params, falling back to `fallback`. */
export function resolvePeriod(
  params: Record<string, string | string[] | undefined>,
  today: string,
  fallback: PeriodKey = "fy",
): Period {
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  if (isValidISODate(from) && isValidISODate(to) && from <= to) {
    return { key: "custom", from, to, label: `${formatDate(from)} – ${formatDate(to)}` };
  }
  const preset = periodPresets.find((p) => p.key === params.period)?.key ?? fallback;
  return presetRange(preset, today);
}

/** Query string for the period, for links that should keep it (CSV exports). */
export function periodQuery(period: Period) {
  return period.key === "custom"
    ? `from=${period.from}&to=${period.to}`
    : `period=${period.key}`;
}
