"use client";

import { Ban, LoaderCircle, Printer } from "lucide-react";
import { recordPaymentAction, voidInvoiceAction } from "@/app/admin/_actions/invoices";
import { FormMessage, SelectField, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";

export function PrintButton({ documentTitle }: { documentTitle: string }) {
  return (
    <button
      type="button"
      className="erp-button-secondary"
      onClick={() => {
        // The PDF file name comes from the document title.
        const previous = document.title;
        document.title = documentTitle;
        window.print();
        document.title = previous;
      }}
    >
      <Printer size={16} aria-hidden="true" />
      Print / PDF
    </button>
  );
}

export function RecordPaymentForm({
  invoiceId,
  balance,
  today,
  methods,
}: {
  invoiceId: number;
  balance: string;
  today: string;
  methods: readonly string[];
}) {
  const { state, pending, formProps, errorFor } = useActionForm(
    recordPaymentAction.bind(null, invoiceId),
  );

  return (
    <form {...formProps} className="grid gap-3">
      <FormMessage state={state} />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Amount (₹)"
          name="amount"
          defaultValue={balance}
          inputMode="decimal"
          className="font-mono"
          error={errorFor("amount")}
        />
        <TextField label="Date" name="paidOn" type="date" defaultValue={today} error={errorFor("paidOn")} />
      </div>
      <SelectField label="Method" name="method" defaultValue="UPI" error={errorFor("method")}>
        {methods.map((method) => (
          <option key={method}>{method}</option>
        ))}
      </SelectField>
      <TextField
        label="Reference"
        name="reference"
        placeholder="UTR, cheque no. or note"
        error={errorFor("reference")}
        hint="TDS deducted settles the invoice but isn’t counted as cash received."
      />
      <button type="submit" className="erp-button" disabled={pending}>
        {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
        Record payment
      </button>
    </form>
  );
}

export function VoidInvoiceForm({ invoiceId, number }: { invoiceId: number; number: string }) {
  const { state, pending, formProps, errorFor } = useActionForm(voidInvoiceAction.bind(null, invoiceId));

  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-medium text-danger">
        <span className="inline-flex items-center gap-2">
          <Ban size={15} aria-hidden="true" />
          Void this invoice…
        </span>
      </summary>
      <form
        {...formProps}
        onSubmit={(event) => {
          if (!window.confirm(`Void ${number}? It stays in the records with its number, marked void.`)) {
            event.preventDefault();
            return;
          }
          formProps.onSubmit(event);
        }}
        className="mt-3 grid gap-3"
      >
        <FormMessage state={state} />
        <TextField
          label="Reason"
          name="reason"
          placeholder="Raised twice, wrong client…"
          maxLength={300}
          error={errorFor("reason")}
        />
        <button type="submit" className="erp-button-danger" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          Void invoice
        </button>
      </form>
    </details>
  );
}
