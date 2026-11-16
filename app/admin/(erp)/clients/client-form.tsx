"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { saveClient } from "@/app/admin/_actions/clients";
import {
  FormMessage,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";
import type { Client } from "@/lib/erp/data/clients";
import { DEFAULT_STATE_CODE, indianStates } from "@/lib/erp/gst";

export function ClientForm({
  client,
  returnTo,
}: {
  client?: Client;
  returnTo?: "invoice";
}) {
  const { state, pending, formProps, errorFor } = useActionForm(
    saveClient.bind(null, client?.id ?? null),
  );
  const cancelHref = client ? `/admin/clients/${client.id}` : returnTo ? "/admin/invoices/new" : "/admin/clients";

  return (
    <form {...formProps} className="grid gap-5">
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <FormMessage state={state} />

      <FormSection title="Client" description="Who the invoice is billed to.">
        <TextField
          label="Client or company name"
          name="name"
          defaultValue={client?.name}
          error={errorFor("name")}
          autoComplete="organization"
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          label="Contact person"
          name="contactPerson"
          defaultValue={client?.contactPerson}
          error={errorFor("contactPerson")}
          autoComplete="name"
        />
        <TextField
          label="GSTIN"
          name="gstin"
          defaultValue={client?.gstin}
          error={errorFor("gstin")}
          hint="Leave blank for individuals and unregistered businesses."
          className="font-mono uppercase"
          maxLength={15}
          autoComplete="off"
          spellCheck={false}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={client?.email}
          error={errorFor("email")}
          autoComplete="email"
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={client?.phone}
          error={errorFor("phone")}
          autoComplete="tel"
        />
      </FormSection>

      <FormSection
        title="Billing address"
        description="The state sets the place of supply, which decides CGST + SGST or IGST."
      >
        <TextField
          label="Address line 1"
          name="addressLine1"
          defaultValue={client?.addressLine1}
          error={errorFor("addressLine1")}
          autoComplete="address-line1"
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          label="Address line 2"
          name="addressLine2"
          defaultValue={client?.addressLine2}
          error={errorFor("addressLine2")}
          autoComplete="address-line2"
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          label="City"
          name="city"
          defaultValue={client?.city}
          error={errorFor("city")}
          autoComplete="address-level2"
        />
        <TextField
          label="PIN code"
          name="pincode"
          defaultValue={client?.pincode}
          error={errorFor("pincode")}
          inputMode="numeric"
          autoComplete="postal-code"
          className="font-mono"
        />
        <SelectField
          label="State"
          name="stateCode"
          defaultValue={client?.stateCode ?? DEFAULT_STATE_CODE}
          error={errorFor("stateCode")}
          wrapperClassName="sm:col-span-2"
        >
          {indianStates.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.code})
            </option>
          ))}
        </SelectField>
      </FormSection>

      <FormSection title="Notes" description="Internal only. Never printed on invoices.">
        <TextAreaField
          label="Notes"
          name="notes"
          defaultValue={client?.notes}
          error={errorFor("notes")}
          wrapperClassName="sm:col-span-2"
        />
      </FormSection>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="erp-button" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          {client ? "Save changes" : "Create client"}
        </button>
        <Link href={cancelHref} className="erp-button-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
