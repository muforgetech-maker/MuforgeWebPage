import { Check } from "lucide-react";

/**
 * A product-style panel showing a sales order being completed and billed —
 * the same SD/FI flow taught in the SAP programme.
 *
 * Server component: the whole sequence is CSS keyframes with staggered
 * delays, so it ships no JavaScript, runs once and then rests. Everything
 * is clearly labelled as sample data, and the customer is an ID rather than
 * a name so nothing reads as a real client.
 */

const steps = [
  "Confirm stock for 3 line items",
  "Post goods issue",
  "Create billing document",
  "Release to accounting",
];

const lines = [
  { label: "Invoice", value: "INV-2042" },
  { label: "Customer", value: "CUST-10492" },
  { label: "Net", value: "₹1,24,500" },
  { label: "Tax (18%)", value: "₹22,410" },
];

export function OrderFlowDemo() {
  return (
    <figure className="demo-card rounded-card border border-border bg-surface shadow-1">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="font-mono text-xs text-text-muted">SO-1042</span>
        <span className="relative inline-flex items-center">
          <span className="demo-status-open rounded-control border border-border px-2 py-1 text-2xs font-semibold uppercase text-text-muted">
            Open
          </span>
          <span className="demo-status-done absolute right-0 rounded-control bg-ember px-2 py-1 text-2xs font-semibold uppercase text-on-ember">
            Billed
          </span>
        </span>
      </div>

      <div className="px-5 py-5">
        {/* Smaller on phones so the 28-character line cannot force the card
            wider than the viewport. */}
        <p className="flex items-baseline gap-2 font-mono text-xs text-text sm:text-sm">
          <span aria-hidden="true" className="text-ember">
            &gt;
          </span>
          <span className="demo-typed" style={{ "--chars": "28ch" } as React.CSSProperties}>
            Complete SO-1042 and bill it
          </span>
        </p>

        <p className="mt-5 text-2xs font-semibold uppercase text-text-muted">Plan</p>
        <ul className="mt-3 space-y-2.5">
          {steps.map((step, index) => (
            <li
              key={step}
              className="demo-step flex items-center gap-3 text-sm text-text"
              style={{ "--i": index } as React.CSSProperties}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ember-wash text-ember">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              {step}
            </li>
          ))}
        </ul>

        <dl className="demo-result mt-5 rounded-control border border-border bg-surface-2 px-4 py-3 text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-4 py-1">
              <dt className="text-text-muted">{line.label}</dt>
              <dd className="font-mono tabular-nums text-text">{line.value}</dd>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-2">
            <dt className="font-semibold text-text">Total billed</dt>
            <dd className="font-mono text-base font-semibold tabular-nums text-ember">
              ₹1,46,910
            </dd>
          </div>
        </dl>
      </div>

      <figcaption className="border-t border-border px-5 py-3 text-2xs uppercase text-text-muted">
        Illustrative interface · sample data
      </figcaption>
    </figure>
  );
}
