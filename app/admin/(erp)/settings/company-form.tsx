"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { saveSettings } from "@/app/admin/_actions/settings";
import {
  CheckboxField,
  FormMessage,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";
import type { Settings } from "@/lib/erp/data/settings";
import { formatRateBp, gstRatesBp, indianStates, sacSuggestions } from "@/lib/erp/gst";

export function CompanyForm({ settings }: { settings: Settings }) {
  const { state, pending, formProps, errorFor } = useActionForm(saveSettings);

  return (
    <form {...formProps} className="grid gap-5">
      <FormMessage state={state} />
      {/* Keyed on the saved values: after a save the fields remount showing
          what the server stored (PAN filled from GSTIN, IFSC uppercased),
          while the message above survives. */}
      <CompanyFields key={JSON.stringify(settings)} settings={settings} errorFor={errorFor} />
      <div>
        <button type="submit" className="erp-button" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          Save settings
        </button>
      </div>
    </form>
  );
}

function CompanyFields({
  settings,
  errorFor,
}: {
  settings: Settings;
  errorFor: (name: string) => string | undefined;
}) {
  const [gstRegistered, setGstRegistered] = useState(settings.gstRegistered);

  return (
    <>
      <FormSection title="Business" description="Printed at the top of every invoice.">
        <TextField
          label="Business name"
          name="businessName"
          defaultValue={settings.businessName}
          error={errorFor("businessName")}
        />
        <TextField
          label="Legal name"
          name="legalName"
          defaultValue={settings.legalName}
          error={errorFor("legalName")}
          hint="As on your GST or PAN registration, if different."
        />
        <TextField
          label="Address line 1"
          name="addressLine1"
          defaultValue={settings.addressLine1}
          error={errorFor("addressLine1")}
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          label="Address line 2"
          name="addressLine2"
          defaultValue={settings.addressLine2}
          error={errorFor("addressLine2")}
          wrapperClassName="sm:col-span-2"
        />
        <TextField label="City" name="city" defaultValue={settings.city} error={errorFor("city")} />
        <TextField
          label="PIN code"
          name="pincode"
          defaultValue={settings.pincode}
          error={errorFor("pincode")}
          inputMode="numeric"
          className="font-mono"
        />
        <SelectField
          label="State"
          name="stateCode"
          defaultValue={settings.stateCode}
          error={errorFor("stateCode")}
          hint="Clients in this state are billed CGST + SGST; everyone else IGST."
          wrapperClassName="sm:col-span-2"
        >
          {indianStates
            .filter((s) => s.code !== "96")
            .map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
        </SelectField>
        <TextField label="Email" name="email" type="email" defaultValue={settings.email} error={errorFor("email")} />
        <TextField label="Phone" name="phone" type="tel" defaultValue={settings.phone} error={errorFor("phone")} />
        <TextField
          label="Website"
          name="website"
          type="url"
          defaultValue={settings.website}
          error={errorFor("website")}
          wrapperClassName="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="GST and tax">
        <div className="sm:col-span-2">
          <CheckboxField
            label="Registered for GST"
            name="gstRegistered"
            defaultChecked={settings.gstRegistered}
            onChange={(event) => setGstRegistered(event.target.checked)}
            hint="When on, invoices become Tax Invoices with CGST/SGST or IGST. When off, no GST is charged."
          />
        </div>
        {gstRegistered && (
          <>
            <TextField
              label="GSTIN"
              name="gstin"
              defaultValue={settings.gstin}
              error={errorFor("gstin")}
              className="font-mono uppercase"
              maxLength={15}
              spellCheck={false}
            />
            <SelectField
              label="Default GST rate"
              name="defaultTaxRateBp"
              defaultValue={String(settings.defaultTaxRateBp)}
              error={errorFor("defaultTaxRateBp")}
              hint="Most IT, design and training services are 18%."
            >
              {gstRatesBp.map((bp) => (
                <option key={bp} value={bp}>
                  {formatRateBp(bp)}
                </option>
              ))}
            </SelectField>
          </>
        )}
        {!gstRegistered && <input type="hidden" name="defaultTaxRateBp" value={settings.defaultTaxRateBp} />}
        <TextField
          label="PAN"
          name="pan"
          defaultValue={settings.pan}
          error={errorFor("pan")}
          className="font-mono uppercase"
          maxLength={10}
          spellCheck={false}
          hint={gstRegistered ? "Filled from your GSTIN if left blank." : undefined}
        />
        <TextField
          label="Default SAC/HSN"
          name="defaultSac"
          defaultValue={settings.defaultSac}
          error={errorFor("defaultSac")}
          list="settings-sac"
          className="font-mono"
          hint="Pre-filled on new invoice lines."
        />
        <datalist id="settings-sac">
          {sacSuggestions.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </datalist>
      </FormSection>

      <FormSection title="Getting paid" description="Shown under “Payment details” on invoices.">
        <TextField
          label="Account name"
          name="bankAccountName"
          defaultValue={settings.bankAccountName}
          error={errorFor("bankAccountName")}
        />
        <TextField
          label="Account number"
          name="bankAccountNumber"
          defaultValue={settings.bankAccountNumber}
          error={errorFor("bankAccountNumber")}
          inputMode="numeric"
          className="font-mono"
        />
        <TextField
          label="IFSC"
          name="bankIfsc"
          defaultValue={settings.bankIfsc}
          error={errorFor("bankIfsc")}
          className="font-mono uppercase"
          maxLength={11}
        />
        <TextField label="Bank" name="bankName" defaultValue={settings.bankName} error={errorFor("bankName")} />
        <TextField label="Branch" name="bankBranch" defaultValue={settings.bankBranch} error={errorFor("bankBranch")} />
        <TextField
          label="UPI ID"
          name="upiId"
          defaultValue={settings.upiId}
          error={errorFor("upiId")}
          className="font-mono"
        />
      </FormSection>

      <FormSection title="Invoice defaults">
        <TextField
          label="Invoice number prefix"
          name="invoicePrefix"
          defaultValue={settings.invoicePrefix}
          error={errorFor("invoicePrefix")}
          className="font-mono uppercase"
          maxLength={4}
          hint={`Numbers look like ${settings.invoicePrefix}/2026-27/0001 and restart each April.`}
        />
        <TextField
          label="Payment terms (days)"
          name="paymentTermsDays"
          type="number"
          min={0}
          max={365}
          defaultValue={settings.paymentTermsDays}
          error={errorFor("paymentTermsDays")}
          hint="Sets the default due date."
        />
        <div className="sm:col-span-2">
          <CheckboxField
            label="Round totals to the nearest rupee"
            name="roundOff"
            defaultChecked={settings.roundOff}
            hint="Adds a “Round off” line, as most Indian invoices do."
          />
        </div>
        <TextAreaField
          label="Default notes"
          name="invoiceNotes"
          defaultValue={settings.invoiceNotes}
          error={errorFor("invoiceNotes")}
        />
        <TextAreaField
          label="Default terms"
          name="invoiceTerms"
          defaultValue={settings.invoiceTerms}
          error={errorFor("invoiceTerms")}
        />
      </FormSection>
    </>
  );
}
