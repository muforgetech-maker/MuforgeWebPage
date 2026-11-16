import Form from "next/form";
import Link from "next/link";
import { periodPresets, type Period } from "@/lib/erp/period";

/**
 * Preset period links plus a custom date range. Every option is a plain URL,
 * so a filtered view can be bookmarked or shared with a colleague.
 */
export function PeriodFilter({
  basePath,
  period,
  extra = {},
}: {
  basePath: string;
  period: Period;
  extra?: Record<string, string>;
}) {
  const href = (key: string) => {
    const search = new URLSearchParams({ ...extra, period: key });
    return `${basePath}?${search.toString()}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <nav aria-label="Period" className="flex flex-wrap gap-1">
        {periodPresets.map((preset) => {
          const current = period.key === preset.key;
          return (
            <Link
              key={preset.key}
              href={href(preset.key)}
              aria-current={current ? "page" : undefined}
              className={`rounded-control px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                current ? "bg-ember-wash text-ember" : "text-text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              {preset.label}
            </Link>
          );
        })}
      </nav>
      <Form action={basePath} className="flex flex-wrap items-center gap-2">
        {Object.entries(extra).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <label htmlFor="period-from" className="sr-only">
          From
        </label>
        <input
          id="period-from"
          type="date"
          name="from"
          required
          defaultValue={period.key === "custom" ? period.from : ""}
          className="erp-control w-auto py-1.5"
        />
        <span className="text-sm text-text-muted">to</span>
        <label htmlFor="period-to" className="sr-only">
          To
        </label>
        <input
          id="period-to"
          type="date"
          name="to"
          required
          defaultValue={period.key === "custom" ? period.to : ""}
          className="erp-control w-auto py-1.5"
        />
        <button
          type="submit"
          className={`erp-button-secondary py-1.5 ${period.key === "custom" ? "border-ember text-ember" : ""}`}
        >
          Apply
        </button>
      </Form>
    </div>
  );
}
