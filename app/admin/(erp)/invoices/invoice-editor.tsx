"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { FormMessage, SelectField, TextAreaField, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";
import { addDays, daysBetween, isValidISODate } from "@/lib/erp/dates";
import type { ActionState } from "@/lib/erp/form";
import { formatRateBp, gstRatesBp, indianStates, sacSuggestions, stateName } from "@/lib/erp/gst";
import { computeInvoiceTotals, taxModeFor } from "@/lib/erp/invoice-calc";
import {
  amountInWords,
  formatINR,
  parseQuantityToMilli,
  parseRupeesToPaise,
} from "@/lib/erp/money";

export type EditorLine = {
  description: string;
  sac: string;
  quantity: string;
  unit: string;
  rate: string;
  taxRateBp: string;
};

export type EditorInitial = {
  clientId: string;
  issueDate: string;
  dueDate: string;
  placeOfSupply: string;
  notes: string;
  terms: string;
  lines: EditorLine[];
};

export type EditorSettings = {
  gstRegistered: boolean;
  stateCode: string;
  roundOff: boolean;
  defaultSac: string;
  defaultTaxRateBp: number;
};

type ClientOption = { id: number; name: string; stateCode: string; gstin: string };

const unitSuggestions = ["nos", "hrs", "days", "months", "sessions", "pages", "pcs"];

export function InvoiceEditor({
  action,
  clients,
  settings,
  initial,
  mode,
  cancelHref,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  clients: ClientOption[];
  settings: EditorSettings;
  initial: EditorInitial;
  mode: "create" | "draft" | "issued";
  cancelHref: string;
}) {
  const { state, pending, formProps, errorFor } = useActionForm(action);
  const [clientId, setClientId] = useState(initial.clientId);
  const [placeOfSupply, setPlaceOfSupply] = useState(initial.placeOfSupply);
  const [issueDate, setIssueDate] = useState(initial.issueDate);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [lines, setLines] = useState(() =>
    initial.lines.map((line, index) => ({ ...line, key: `initial-${index}` })),
  );

  const blankLine = (): EditorLine & { key: string } => ({
    key: crypto.randomUUID(),
    description: "",
    sac: settings.defaultSac,
    quantity: "1",
    unit: "nos",
    rate: "",
    taxRateBp: String(settings.gstRegistered ? settings.defaultTaxRateBp : 0),
  });

  const updateLine = (key: string, field: keyof EditorLine, value: string) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, [field]: value } : line)));

  const changeClient = (value: string) => {
    setClientId(value);
    const client = clients.find((c) => String(c.id) === value);
    if (client) setPlaceOfSupply(client.stateCode);
  };

  // Moving the invoice date keeps the same payment term.
  const changeIssueDate = (value: string) => {
    if (isValidISODate(value) && isValidISODate(issueDate) && isValidISODate(dueDate)) {
      setDueDate(addDays(value, daysBetween(issueDate, dueDate)));
    }
    setIssueDate(value);
  };

  const taxMode = taxModeFor(settings.gstRegistered, settings.stateCode, placeOfSupply);
  const totals = computeInvoiceTotals(
    lines.map((line) => ({
      description: line.description,
      sac: line.sac,
      unit: line.unit,
      quantityMilli: parseQuantityToMilli(line.quantity) ?? 0,
      ratePaise: parseRupeesToPaise(line.rate) ?? 0,
      taxRateBp: Number(line.taxRateBp) || 0,
    })),
    taxMode,
    settings.roundOff,
  );
  const selectedClient = clients.find((c) => String(c.id) === clientId);
  const showGst = settings.gstRegistered;
  const lineGrid = showGst
    ? "md:grid-cols-[minmax(0,1fr)_6.5rem_5rem_5.5rem_7.5rem_5.5rem_7.5rem_2.25rem]"
    : "md:grid-cols-[minmax(0,1fr)_6.5rem_5rem_5.5rem_7.5rem_7.5rem_2.25rem]";

  const taxNote =
    taxMode === "none"
      ? "Not GST registered: no tax is charged. Turn on GST under Settings once you have a GSTIN."
      : taxMode === "intra"
        ? `Supply within ${stateName(settings.stateCode)}: CGST + SGST.`
        : `Supply to ${stateName(placeOfSupply)}: IGST.`;

  return (
    <form {...formProps} className="grid gap-5">
      <FormMessage state={state} />
      <input
        type="hidden"
        name="lines"
        value={JSON.stringify(
          lines.map(({ description, sac, quantity, unit, rate, taxRateBp }) => ({
            description,
            sac,
            quantity,
            unit,
            rate,
            taxRateBp,
          })),
        )}
      />

      {/* Party and dates */}
      <section className="erp-card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-end gap-3">
            <SelectField
              label="Bill to"
              name="clientId"
              value={clientId}
              onChange={(event) => changeClient(event.target.value)}
              error={errorFor("clientId")}
              wrapperClassName="min-w-0 flex-1"
            >
              <option value="">Choose a client…</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </SelectField>
            <Link
              href="/admin/clients/new?returnTo=invoice"
              className="erp-button-secondary mb-[1px]"
            >
              <UserPlus size={16} aria-hidden="true" />
              New client
            </Link>
          </div>
          {selectedClient && (
            <p className="erp-hint">
              {selectedClient.gstin ? (
                <>
                  GSTIN <span className="font-mono">{selectedClient.gstin}</span> (B2B)
                </>
              ) : (
                "No GSTIN: billed as an unregistered customer (B2C)."
              )}
            </p>
          )}
        </div>

        <TextField
          label="Invoice date"
          name="issueDate"
          type="date"
          value={issueDate}
          onChange={(event) => changeIssueDate(event.target.value)}
          error={errorFor("issueDate")}
          hint={mode === "create" || mode === "draft" ? "The number is assigned when you issue." : undefined}
        />
        <TextField
          label="Due date"
          name="dueDate"
          type="date"
          value={dueDate}
          min={issueDate}
          onChange={(event) => setDueDate(event.target.value)}
          error={errorFor("dueDate")}
          hint={
            isValidISODate(issueDate) && isValidISODate(dueDate)
              ? `${daysBetween(issueDate, dueDate)} days after the invoice date`
              : undefined
          }
        />
        <SelectField
          label="Place of supply"
          name="placeOfSupply"
          value={placeOfSupply}
          onChange={(event) => setPlaceOfSupply(event.target.value)}
          error={errorFor("placeOfSupply")}
          hint={taxNote}
          wrapperClassName="md:col-span-2"
        >
          {indianStates.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.code})
            </option>
          ))}
        </SelectField>
      </section>

      {/* Line items */}
      <section className="erp-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text">Items</h2>
          <span className="text-xs text-text-muted">Rates exclude GST</span>
        </div>
        {errorFor("lines") && <p className="erp-error">{errorFor("lines")}</p>}

        <div
          aria-hidden="true"
          className={`mt-4 hidden gap-2 border-b border-border pb-2 text-2xs font-semibold uppercase text-text-muted md:grid ${lineGrid}`}
        >
          <span>Description</span>
          <span>SAC/HSN</span>
          <span className="text-right">Qty</span>
          <span>Unit</span>
          <span className="text-right">Rate (₹)</span>
          {showGst && <span>GST</span>}
          <span className="text-right">Amount</span>
          <span />
        </div>

        <ol className="mt-3 grid gap-4 md:gap-2">
          {lines.map((line, index) => {
            const err = (field: string) => errorFor(`lines.${index}.${field}`);
            const lineErrors = ["description", "sac", "quantity", "rate", "taxRateBp"]
              .map(err)
              .filter(Boolean);
            const n = index + 1;
            const labelClass = "mb-1 block text-xs font-medium text-text-muted md:sr-only";
            return (
              <li
                key={line.key}
                className="rounded-control border border-border p-3 md:border-0 md:p-0"
              >
                <div className={`grid grid-cols-2 gap-3 md:items-start md:gap-2 ${lineGrid}`}>
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor={`${line.key}-description`} className={labelClass}>
                      Item {n} description
                    </label>
                    <input
                      id={`${line.key}-description`}
                      value={line.description}
                      onChange={(e) => updateLine(line.key, "description", e.target.value)}
                      placeholder="What you did or supplied"
                      aria-invalid={err("description") ? true : undefined}
                      className="erp-control"
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${line.key}-sac`} className={labelClass}>
                      Item {n} SAC/HSN
                    </label>
                    <input
                      id={`${line.key}-sac`}
                      value={line.sac}
                      onChange={(e) => updateLine(line.key, "sac", e.target.value)}
                      list="sac-options"
                      inputMode="numeric"
                      aria-invalid={err("sac") ? true : undefined}
                      className="erp-control font-mono"
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${line.key}-quantity`} className={labelClass}>
                      Item {n} quantity
                    </label>
                    <input
                      id={`${line.key}-quantity`}
                      value={line.quantity}
                      onChange={(e) => updateLine(line.key, "quantity", e.target.value)}
                      inputMode="decimal"
                      aria-invalid={err("quantity") ? true : undefined}
                      className="erp-control text-right font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${line.key}-unit`} className={labelClass}>
                      Item {n} unit
                    </label>
                    <input
                      id={`${line.key}-unit`}
                      value={line.unit}
                      onChange={(e) => updateLine(line.key, "unit", e.target.value)}
                      list="unit-options"
                      className="erp-control"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${line.key}-rate`} className={labelClass}>
                      Item {n} rate in rupees
                    </label>
                    <input
                      id={`${line.key}-rate`}
                      value={line.rate}
                      onChange={(e) => updateLine(line.key, "rate", e.target.value)}
                      inputMode="decimal"
                      placeholder="0.00"
                      aria-invalid={err("rate") ? true : undefined}
                      className="erp-control text-right font-mono"
                    />
                  </div>
                  {showGst && (
                    <div>
                      <label htmlFor={`${line.key}-tax`} className={labelClass}>
                        Item {n} GST rate
                      </label>
                      <select
                        id={`${line.key}-tax`}
                        value={line.taxRateBp}
                        onChange={(e) => updateLine(line.key, "taxRateBp", e.target.value)}
                        aria-invalid={err("taxRateBp") ? true : undefined}
                        className="erp-control px-2"
                      >
                        {gstRatesBp.map((bp) => (
                          <option key={bp} value={bp}>
                            {formatRateBp(bp)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between md:block md:pt-2 md:text-right">
                    <span className="text-xs text-text-muted md:sr-only">Amount</span>
                    <span className="font-mono text-sm tabular-nums text-text">
                      {formatINR(totals.lines[index]?.amountPaise ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-end md:block">
                    <button
                      type="button"
                      onClick={() => setLines((current) => current.filter((l) => l.key !== line.key))}
                      disabled={lines.length === 1}
                      aria-label={`Remove item ${n}`}
                      title="Remove item"
                      className="inline-flex size-9 items-center justify-center rounded-control text-text-muted transition-colors duration-200 hover:bg-danger-wash hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {lineErrors.length > 0 && (
                  <p className="erp-error" role="alert">
                    Item {n}: {lineErrors.join(" ")}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={() => setLines((current) => [...current, blankLine()])}
          disabled={lines.length >= 100}
          className="erp-button-secondary mt-4"
        >
          <Plus size={16} aria-hidden="true" />
          Add item
        </button>

        <datalist id="sac-options">
          {sacSuggestions.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </datalist>
        <datalist id="unit-options">
          {unitSuggestions.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        {/* Totals */}
        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <dl className="grid w-full max-w-sm gap-1.5 text-sm" aria-live="polite">
            <TotalRow label="Taxable value" paise={totals.subtotalPaise} />
            {totals.taxGroups
              .filter((g) => g.rateBp > 0)
              .flatMap((g) =>
                taxMode === "intra"
                  ? [
                      <TotalRow key={`c${g.rateBp}`} label={`CGST @ ${formatRateBp(g.rateBp / 2)}`} paise={g.cgstPaise} />,
                      <TotalRow key={`s${g.rateBp}`} label={`SGST @ ${formatRateBp(g.rateBp / 2)}`} paise={g.sgstPaise} />,
                    ]
                  : [<TotalRow key={`i${g.rateBp}`} label={`IGST @ ${formatRateBp(g.rateBp)}`} paise={g.igstPaise} />],
              )}
            {totals.roundOffPaise !== 0 && <TotalRow label="Round off" paise={totals.roundOffPaise} signed />}
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-semibold text-text">Total</dt>
              <dd className="font-mono text-lg font-semibold tabular-nums text-text">
                {formatINR(totals.totalPaise)}
              </dd>
            </div>
            <p className="text-right text-xs text-text-muted">{amountInWords(totals.totalPaise)}</p>
          </dl>
        </div>
      </section>

      {/* Notes and terms */}
      <section className="erp-card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
        <TextAreaField
          label="Notes"
          name="notes"
          defaultValue={initial.notes}
          error={errorFor("notes")}
          hint="Printed on the invoice, for example a thank-you or project reference."
        />
        <TextAreaField
          label="Terms"
          name="terms"
          defaultValue={initial.terms}
          error={errorFor("terms")}
          hint="Payment terms, late fees, or other conditions."
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {mode === "issued" ? (
          <button type="submit" name="intent" value="save" className="erp-button" disabled={pending}>
            {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
            Save changes
          </button>
        ) : (
          <>
            {/* Draft comes first: pressing Enter in a field submits with the
                first button, and that must never issue a numbered invoice. */}
            <button
              type="submit"
              name="intent"
              value="draft"
              className="erp-button-secondary"
              disabled={pending}
            >
              {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
              Save as draft
            </button>
            <button type="submit" name="intent" value="issue" className="erp-button" disabled={pending}>
              <Send size={16} aria-hidden="true" />
              Save and issue
            </button>
          </>
        )}
        <Link href={cancelHref} className="erp-button-secondary">
          Cancel
        </Link>
        {mode === "issued" && (
          <p className="basis-full text-xs text-text-muted">
            This invoice has already been issued. Saving updates it under the same number.
          </p>
        )}
      </div>
    </form>
  );
}

function TotalRow({ label, paise, signed }: { label: string; paise: number; signed?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-mono tabular-nums text-text">
        {signed && paise > 0 ? "+" : ""}
        {formatINR(paise)}
      </dd>
    </div>
  );
}
