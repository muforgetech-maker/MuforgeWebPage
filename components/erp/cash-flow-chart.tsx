"use client";

import { useState } from "react";
import { formatMonth } from "@/lib/erp/dates";
import { formatCompactINR, formatINR, niceAxis } from "@/lib/erp/money";

/*
 * Money in vs money out, by month: grouped columns, two series.
 * Follows the dataviz spec: columns capped at 20px with a 4px rounded data
 * end and a 2px gap, hairline gridlines, a legend naming both series, a
 * hover/focus tooltip per month (values lead, line keys), and a table for
 * screen readers so no value is reachable by hover alone. Series colours are
 * the validated --viz-in / --viz-out pair.
 */

type Row = { month: string; collectedPaise: number; expensesPaise: number };

const series = [
  { key: "collectedPaise", label: "Collected", swatch: "bg-viz-in" },
  { key: "expensesPaise", label: "Spent", swatch: "bg-viz-out" },
] as const;

export function CashFlowChart({ rows, caption }: { rows: Row[]; caption: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...rows.flatMap((r) => [r.collectedPaise, r.expensesPaise]));
  const { top, step } = niceAxis(max);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const totals = {
    collectedPaise: rows.reduce((s, r) => s + r.collectedPaise, 0),
    expensesPaise: rows.reduce((s, r) => s + r.expensesPaise, 0),
  };
  const pct = (paise: number) => (top ? (paise / top) * 100 : 0);
  const activeRow = active === null ? null : rows[active];

  return (
    <figure className="m-0">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-2.5 rounded-[2px] ${s.swatch}`} />
            <span className="text-text-muted">{s.label}</span>
            <span className="font-semibold text-text">{formatINR(totals[s.key])}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-5 h-56" aria-hidden="true">
        {/* Gridlines and y-axis ticks */}
        {ticks.map((tick) => (
          <div
            key={tick}
            className="pointer-events-none absolute left-0 right-0 flex items-center"
            style={{ bottom: `${pct(tick)}%`, transform: "translateY(50%)" }}
          >
            <span className="w-12 shrink-0 pr-2 text-right text-2xs normal-case tracking-normal tabular-nums text-text-muted">
              {formatCompactINR(tick)}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        ))}

        {/* Columns */}
        <div className="absolute inset-y-0 left-12 right-0 flex items-stretch">
          {rows.map((row, index) => (
            <div
              key={row.month}
              className={`relative flex flex-1 items-end justify-center gap-[2px] rounded-t-[4px] transition-colors duration-150 ${
                active === index ? "bg-surface-2" : ""
              }`}
              onPointerEnter={() => setActive(index)}
              onPointerLeave={() => setActive(null)}
            >
              {series.map((s) => {
                const value = row[s.key];
                return (
                  <div
                    key={s.key}
                    className={`w-full max-w-5 rounded-t-[4px] ${s.swatch}`}
                    style={{ height: value > 0 ? `max(2px, ${pct(value)}%)` : 0 }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {activeRow && active !== null && (
          // Inside the plot, beside the hovered month (left of it in the right
          // half, right of it in the left half), so it never hides those bars.
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-44 whitespace-nowrap rounded-control border border-border bg-surface px-3 py-2 text-xs shadow-1"
            style={
              active >= rows.length / 2
                ? { right: `calc((100% - 3rem) * ${(rows.length - active) / rows.length} + 4px)` }
                : { left: `calc(3rem + (100% - 3rem) * ${(active + 1) / rows.length} + 4px)` }
            }
          >
            <p className="mb-1 font-medium text-text-muted">{formatMonth(activeRow.month)}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-2">
                <span className={`h-0.5 w-3 rounded-full ${s.swatch}`} />
                <span className="font-semibold tabular-nums text-text">{formatINR(activeRow[s.key])}</span>
                <span className="text-text-muted">{s.label}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Month labels, also the keyboard path to each month's figures */}
      <div className="ml-12 mt-2 flex">
        {rows.map((row, index) => {
          const [year, month] = row.month.split("-");
          const showYear = index === 0 || month === "01";
          return (
            <button
              key={row.month}
              type="button"
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              aria-label={`${formatMonth(row.month)}: collected ${formatINR(row.collectedPaise)}, spent ${formatINR(row.expensesPaise)}`}
              className="flex-1 rounded-control py-0.5 text-center text-2xs text-text-muted"
            >
              {new Date(`${row.month}-01T00:00:00Z`).toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}
              {showYear && <span className="block opacity-70">{year}</span>}
            </button>
          );
        })}
      </div>

      <figcaption className="sr-only">{caption}</figcaption>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Collected</th>
            <th scope="col">Spent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month}>
              <th scope="row">{formatMonth(row.month)}</th>
              <td>{formatINR(row.collectedPaise)}</td>
              <td>{formatINR(row.expensesPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
