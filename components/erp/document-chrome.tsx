import Image from "next/image";
import type { ReactNode } from "react";
import { AtSign, Globe, Landmark, Mail, MapPin } from "lucide-react";
import { QrCode } from "@/components/erp/qr-code";
import type { Party, Seller } from "@/lib/erp/data/invoices";

/*
 * The parts an invoice and a delivery challan share: the letterhead, the
 * services panel, payment details, the signature block and the footer band.
 * Keeping them here means the two documents cannot drift apart.
 *
 * Everything comes from the seller snapshot frozen onto the document, so a
 * reprint years later looks like the copy that was sent.
 */

export function addressLines(party: Party) {
  return [
    party.addressLine1,
    party.addressLine2,
    [party.city, party.pincode].filter(Boolean).join(" – "),
    party.stateCode ? `${party.stateName} (${party.stateCode})` : "",
  ].filter(Boolean);
}

function ContactLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-paper-accent" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

/** Logo and name on the left, how to reach the business on the right. */
export function DocumentHeader({ seller }: { seller: Seller }) {
  const place = [seller.city, seller.stateName].filter(Boolean).join(", ");
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/muforge-logo-clean.png"
            alt=""
            width={661}
            height={420}
            className="h-14 w-auto"
          />
          <div className="min-w-0">
            <p className="font-display text-3xl font-bold leading-none tracking-tight text-paper-text">
              {seller.name}
            </p>
            {seller.tagline && (
              <p className="mt-1.5 text-sm text-paper-muted">{seller.tagline}</p>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 sm:max-w-[17rem] sm:text-left">
        <p className="font-semibold text-paper-text">{seller.legalName || seller.name}</p>
        {seller.strapline && <p className="text-xs text-paper-muted">{seller.strapline}</p>}
        <ul className="mt-2.5 grid gap-1.5 text-xs text-paper-text">
          {place && (
            <ContactLine icon={<MapPin size={13} />}>{place}</ContactLine>
          )}
          {seller.email && <ContactLine icon={<Mail size={13} />}>{seller.email}</ContactLine>}
          {seller.website && (
            <ContactLine icon={<Globe size={13} />}>
              {seller.website.replace(/^https?:\/\//, "")}
            </ContactLine>
          )}
          {seller.instagram && (
            <ContactLine icon={<AtSign size={13} />}>{seller.instagram}</ContactLine>
          )}
        </ul>
      </div>
    </header>
  );
}

/** The document's name, with its reference details beside it. */
export function DocumentTitle({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle?: string;
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-paper-text">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-lg text-paper-muted">{subtitle}</p>}
        <div className="mt-3 h-1 w-16 rounded-full bg-paper-accent" />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-l border-paper-border pl-5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-paper-muted">{row.label}</dt>
            <dd className="font-semibold text-paper-text">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PartyBlock({ title, party }: { title: string; party: Party }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-paper-text">{title}</h3>
      <p className="mt-1.5 font-semibold text-paper-text">{party.name}</p>
      {party.contactPerson && <p className="text-xs">{party.contactPerson}</p>}
      <div className="mt-0.5 text-xs text-paper-muted">
        {addressLines(party).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>{[party.phone, party.email].filter(Boolean).join(" · ")}</p>
      </div>
      {party.gstin && (
        <p className="mt-2 text-xs">
          <span className="font-semibold text-paper-text">GSTIN</span>
          <span className="mx-2 text-paper-muted">:</span>
          <span className="font-mono">{party.gstin}</span>
        </p>
      )}
    </div>
  );
}

/** What the business does, beside the bill-to block. */
export function ServicesPanel({ seller }: { seller: Seller }) {
  const services = seller.panelServices
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!services.length && !seller.panelHeading) return null;

  return (
    <aside className="rounded-card border border-paper-soft-border bg-paper-soft p-5">
      {seller.panelHeading && (
        <h3 className="font-display text-lg font-semibold text-paper-accent">
          {seller.panelHeading}
        </h3>
      )}
      {services.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-paper-text">
          {services.map((service, index) => (
            <li key={service} className="flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden="true" className="text-paper-soft-border">
                  |
                </span>
              )}
              {service}
            </li>
          ))}
        </ul>
      )}
      {seller.panelQuote && (
        <p className="mt-4 border-t border-paper-soft-border pt-3 text-center text-xs italic text-paper-muted">
          “{seller.panelQuote}”
        </p>
      )}
    </aside>
  );
}

export function PaymentDetails({ seller }: { seller: Seller }) {
  const rows = [
    ["Bank Name", seller.bankName],
    ["Account No", seller.bankAccountNumber],
    ["IFSC", seller.bankIfsc],
    ["Account Name", seller.bankAccountName],
    ["UPI", seller.upiId],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  if (!rows.length) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-paper-text">
        <Landmark size={15} aria-hidden="true" className="text-paper-accent" />
        Payment Details
      </h3>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            {/* The colon sits at the right edge of a fixed-width label, so
                the colons line up down the block. It belongs to the term
                rather than being a cell of its own, which would make it a
                second <dd> for screen readers to read out. */}
            <dt className="flex w-[6.5rem] justify-between text-paper-muted">
              <span>{label}</span>
              <span aria-hidden="true">:</span>
            </dt>
            <dd className="font-mono">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function TermsList({ terms }: { terms: string }) {
  const items = terms
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
  if (!items.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-paper-text">Terms &amp; Conditions</h3>
      <ol className="mt-2 grid list-decimal gap-1 pl-4 text-xs text-paper-muted marker:text-paper-muted">
        {items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SignatureBlock({ seller }: { seller: Seller }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl italic text-paper-text">Team {seller.name}</p>
      <div className="mt-2 border-t border-paper-border pt-1.5 text-xs text-paper-muted">
        Authorised Signatory
      </div>
      <p className="text-xs font-semibold text-paper-text">{seller.name}</p>
    </div>
  );
}

/** The dark band across the foot of the page. */
export function DocumentFooter({ seller }: { seller: Seller }) {
  const website = seller.website?.trim();
  const url = website ? (website.startsWith("http") ? website : `https://${website}`) : "";

  if (!seller.footerLine && !url) return null;

  return (
    <footer className="-mx-6 -mb-6 mt-8 flex items-center justify-between gap-6 bg-paper-brand px-6 py-5 text-paper-brand-ink sm:-mx-10 sm:-mb-10 sm:px-10 print:-mx-0 print:-mb-0 print:px-6">
      {seller.footerLine && (
        <p className="font-display text-lg font-semibold italic">{seller.footerLine}</p>
      )}
      {url && (
        <div className="flex shrink-0 items-center gap-3">
          <QrCode value={url} title={`QR code linking to ${url}`} className="size-16 rounded-sm" />
          <p className="text-xs leading-snug">
            Scan to visit
            <br />
            our website
          </p>
        </div>
      )}
    </footer>
  );
}
