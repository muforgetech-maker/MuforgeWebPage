"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { FormMessage, SelectField, TextAreaField, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";
import type { ActionState } from "@/lib/erp/form";
import { indianStates, sacSuggestions, stateName } from "@/lib/erp/gst";
import { lineAmount } from "@/lib/erp/invoice-calc";
import { formatINR, parseQuantityToMilli, parseRupeesToPaise } from "@/lib/erp/money";

export type ChallanEditorLine = {
  description: string;
  sac: string;
  quantity: string;
  unit: string;
  rate: string;
};

export type ChallanEditorInitial = {
  clientId: string;
  challanDate: string;
  reason: string;
  placeOfSupply: string;
  vehicleNumber: string;
  dispatchThrough: string;
  shipTo: string;
  notes: string;
  terms: string;
  lines: ChallanEditorLine[];
};

type ClientOption = { id: number; name: string; stateCode: string; gstin: string };

const unitSuggestions = ["nos", "pcs", "sets", "boxes", "kg", "metres", "hrs"];

export function ChallanEditor({
  action,
  clients,
  reasons,
  defaultSac,
  initial,
  mode,
  cancelHref,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  clients: ClientOption[];
  reasons: readonly string[];
  defaultSac: string;
  initial: ChallanEditorInitial;
  mode: "create" | "draft" | "issued";
  cancelHref: string;
}) {
  const { state, pending, formProps, errorFor } = useActionForm(action);
  const [clientId, setClientId] = useState(initial.clientId);
  const [placeOfSupply, setPlaceOfSupply] = useState(initial.placeOfSupply);
  const [lines, setLines] = useState(() =>
    initial.lines.map((line, index) => ({ ...line, key: `initial-${index}` })),
  );

  const blankLine = (): ChallanEditorLine & { key: string } => ({
    key: crypto.randomUUID(),
    description: "",
    sac: defaultSac,
    quantity: "1",
    unit: "nos",
    rate: "",
  });

  const updateLine = (key: string, field: keyof ChallanEditorLine, value: string) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, [field]: value } : line)),
    );

  const changeClient = (value: string) => {
    setClientId(value);
    const client = clients.find((c) => String(c.id) === value);
    if (client) setPlaceOfSupply(client.stateCode);
  };

  const amounts = lines.map((line) =>
    lineAmount(parseQuantityToMilli(line.quantity) ?? 0, parseRupeesToPaise(line.rate) ?? 0),
  );
  const totalValuePaise = amounts.reduce((sum, paise) => sum + paise, 0);
  const selectedClient = clients.find((c) => String(c.id) === clientId);
  const lineGrid = "md:grid-cols-[minmax(0,1fr)_6.5rem_5rem_5.5rem_7.5rem_7.5rem_2.25rem]";

  return (
    <form {...formProps} className="grid gap-5">
      <FormMessage state={state} />
      <input
        type="hidden"
        name="lines"
        value={JSON.stringify(
          lines.map(({ description, sac, quantity, unit, rate }) => ({
            description,
            sac,
            quantity,
            unit,
            rate,
          })),
        )}
      />

      {/* Consignee, date and purpose */}
      <section className="erp-card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-end gap-3">
            <SelectField
              label="Consignee"
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
            <Link href="/admin/clients/new?returnTo=challan" className="erp-button-secondary mb-[1px]">
              <UserPlus size={16} aria-hidden="true" />
              New client
            </Link>
          </div>
          {selectedClient && (
            <p className="erp-hint">
              {selectedClient.gstin
                ? `GSTIN ${selectedClient.gstin} · ${stateName(selectedClient.stateCode)}`
                : `No GSTIN on file · ${stateName(selectedClient.stateCode)}`}
            </p>
          )}
        </div>

        <TextField
          label="Challan date"
          name="challanDate"
          type="date"
          defaultValue={initial.challanDate}
          error={errorFor("challanDate")}
        />

        <SelectField
          label="Reason for movement"
          name="reason"
          defaultValue={initial.reason}
          error={errorFor("reason")}
          hint="Printed on the challan, as GST requires."
        >
          {reasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Place of supply"
          name="placeOfSupply"
          value={placeOfSupply}
          onChange={(event) => setPlaceOfSupply(event.target.value)}
          error={errorFor("placeOfSupply")}
        >
          {indianStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.code}-{state.name}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Vehicle number"
          name="vehicleNumber"
          defaultValue={initial.vehicleNumber}
          error={errorFor("vehicleNumber")}
          className="font-mono uppercase"
          maxLength={20}
          hint="Optional, for example TN 37 AB 1234."
        />

        <TextField
          label="Dispatched through"
          name="dispatchThrough"
          defaultValue={initial.dispatchThrough}
          error={errorFor("dispatchThrough")}
          maxLength={100}
          hint="Optional: courier, transporter or person carrying it."
        />

        <TextAreaField
          label="Delivery address"
          name="shipTo"
          defaultValue={initial.shipTo}
          error={errorFor("shipTo")}
          rows={3}
          wrapperClassName="md:col-span-2"
          hint="Leave blank to deliver to the client's own address."
        />
      </section>

      {/* Items */}
      <section className="erp-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-text">Items</h2>
        <p className="erp-hint mt-1">
          A challan states a value for the consignment but charges no tax. GST is applied on the
          invoice raised afterwards.
        </p>
        {errorFor("lines") && (
          <p className="erp-error" role="alert">
            {errorFor("lines")}
          </p>
        )}

        <div
          className={`mt-4 hidden gap-2 px-1 text-xs font-medium text-text-muted md:grid ${lineGrid}`}
        >
          <span>Description</span>
          <span>SAC/HSN</span>
          <span className="text-right">Qty</span>
          <span>Unit</span>
          <span className="text-right">Rate (₹)</span>
          <span className="text-right">Value</span>
          <span />
        </div>

        <ol className="mt-3 grid gap-4 md:gap-2">
          {lines.map((line, index) => {
            const err = (field: string) => errorFor(`lines.${index}.${field}`);
            const lineErrors = ["description", "sac", "quantity", "rate"].map(err).filter(Boolean);
            const n = index + 1;
            const labelClass = "mb-1 block text-xs font-medium text-text-muted md:sr-only";
            return (
              <li key={line.key} className="rounded-control border border-border p-3 md:border-0 md:p-0">
                <div className={`grid grid-cols-2 gap-3 md:items-start md:gap-2 ${lineGrid}`}>
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor={`${line.key}-description`} className={labelClass}>
                      Item {n} description
                    </label>
                    <input
                      id={`${line.key}-description`}
                      value={line.description}
                      onChange={(e) => updateLine(line.key, "description", e.target.value)}
                      placeholder="What is being delivered"
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
                  <div className="flex items-center justify-between md:block md:pt-2 md:text-right">
                    <span className="text-xs text-text-muted md:sr-only">Value</span>
                    <span className="font-mono text-sm tabular-nums text-text">
                      {formatINR(amounts[index] ?? 0)}
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setLines((current) => [...current, blankLine()])}
            disabled={lines.length >= 100}
            className="erp-button-secondary"
          >
            <Plus size={16} aria-hidden="true" />
            Add item
          </button>
          <p className="text-sm text-text-muted">
            Total value{" "}
            <span className="font-mono tabular-nums text-text">{formatINR(totalValuePaise)}</span>
          </p>
        </div>

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
      </section>

      <section className="erp-card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
        <TextAreaField
          label="Notes"
          name="notes"
          defaultValue={initial.notes}
          error={errorFor("notes")}
          hint="Printed on the challan, for example a project or purchase-order reference."
        />
        <TextAreaField
          label="Terms"
          name="terms"
          defaultValue={initial.terms}
          error={errorFor("terms")}
          hint="Conditions of the delivery, for example when goods must be returned."
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
                first button, and that must never issue a numbered challan. */}
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
            This challan has already been issued. Saving updates it under the same number.
          </p>
        )}
      </div>
    </form>
  );
}
