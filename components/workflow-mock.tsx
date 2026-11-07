import { Check } from "lucide-react";

/**
 * A purchase request moving through approval — the kind of workflow the
 * custom-software and SAP MM work deals with. Static, server rendered, and
 * labelled as illustrative; the vendor and request are IDs, not names.
 */

const stages = [
  { step: "Raised", owner: "Stores", when: "Day 1" },
  { step: "Verified", owner: "Purchase", when: "Day 1" },
  { step: "Approved", owner: "Finance", when: "Day 2" },
];

const facts = [
  { label: "Value", value: "₹3,80,000" },
  { label: "Vendor", value: "V-220" },
  { label: "Order", value: "PO-8841" },
];

export function WorkflowMock() {
  return (
    <figure className="rounded-card border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="font-mono text-xs text-text-muted">PR-3310</span>
        <span className="rounded-control bg-ember-wash px-2 py-1 text-2xs font-semibold uppercase text-ember">
          Approved
        </span>
      </div>

      <ol className="px-5 py-5">
        {stages.map((stage, index) => (
          <li key={stage.step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-ember-wash text-ember">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              {index < stages.length - 1 && (
                <span aria-hidden="true" className="my-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className={index < stages.length - 1 ? "pb-5" : ""}>
              <p className="text-sm font-medium text-text">{stage.step}</p>
              <p className="mt-0.5 text-sm text-text-muted">
                {stage.owner} · <span className="font-mono">{stage.when}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-3 gap-3 border-t border-border px-5 py-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-2xs uppercase text-text-muted">{fact.label}</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums text-text">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <figcaption className="border-t border-border px-5 py-3 text-2xs uppercase text-text-muted">
        Illustrative interface · sample data
      </figcaption>
    </figure>
  );
}
