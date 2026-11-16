import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { formatINR } from "@/lib/erp/money";

/* Small presentational pieces shared by every ERP page. Server-safe. */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 print:hidden">
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1.5 rounded-control text-sm text-text-muted transition-colors duration-200 hover:text-text"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h2 font-semibold text-text">{title}</h1>
          {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** An amount in rupees, monospaced so columns line up. */
export function Money({ paise, className = "" }: { paise: number; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{formatINR(paise)}</span>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-control bg-ember-wash text-ember">
        {icon}
      </div>
      <h2 className="mt-4 text-base font-semibold text-text">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** A labelled figure: dashboard and report summary tiles. */
export function StatTile({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "default" | "danger" | "steel";
}) {
  const valueTone =
    tone === "danger" ? "text-danger" : tone === "steel" ? "text-steel" : "text-text";
  // Dataviz stat-tile contract: sentence-case label, sans semibold value with
  // proportional figures (tabular-nums is for aligned columns only).
  return (
    <div className="erp-card p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={`mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl ${valueTone}`}>{value}</p>
      {detail && <p className="mt-1 text-xs text-text-muted">{detail}</p>}
    </div>
  );
}

/** A card whose body scrolls sideways on narrow screens: wraps every table. */
export function TableCard({ children, title, actions }: { children: ReactNode; title?: string; actions?: ReactNode }) {
  return (
    <section className="erp-card overflow-hidden">
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-text">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

type Tone = "neutral" | "ember" | "steel" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text",
  ember: "bg-ember-wash text-ember",
  steel: "bg-steel-wash text-steel",
  danger: "bg-danger-wash text-danger",
  muted: "bg-surface-2 text-text-muted",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

/** A definition list row for detail pages. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-text">{children}</dd>
    </div>
  );
}
