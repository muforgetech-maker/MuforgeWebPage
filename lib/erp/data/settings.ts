import "server-only";
import { audit, one, run, transaction } from "@/lib/erp/db";

/*
 * The company profile: one row that feeds every invoice. Callers must have
 * passed requireAdmin() already; mutations take the acting user's id for
 * the audit log.
 */

export type Settings = {
  businessName: string;
  legalName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateCode: string;
  pincode: string;
  email: string;
  phone: string;
  website: string;
  gstRegistered: boolean;
  gstin: string;
  pan: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  bankBranch: string;
  upiId: string;
  invoicePrefix: string;
  challanPrefix: string;
  paymentTermsDays: number;
  defaultSac: string;
  defaultTaxRateBp: number;
  roundOff: boolean;
  invoiceNotes: string;
  invoiceTerms: string;
};

type SettingsRow = Omit<Settings, "gstRegistered" | "roundOff"> & {
  gstRegistered: number;
  roundOff: number;
};

export async function getSettings(): Promise<Settings> {
  const row = await one<SettingsRow>(
    `SELECT business_name AS "businessName", legal_name AS "legalName",
            address_line1 AS "addressLine1", address_line2 AS "addressLine2", city,
            state_code AS "stateCode", pincode, email, phone, website,
            gst_registered AS "gstRegistered", gstin, pan,
            bank_account_name AS "bankAccountName", bank_account_number AS "bankAccountNumber",
            bank_ifsc AS "bankIfsc", bank_name AS "bankName", bank_branch AS "bankBranch",
            upi_id AS "upiId", invoice_prefix AS "invoicePrefix",
            challan_prefix AS "challanPrefix",
            payment_terms_days AS "paymentTermsDays", default_sac AS "defaultSac",
            default_tax_rate_bp AS "defaultTaxRateBp", round_off AS "roundOff",
            invoice_notes AS "invoiceNotes", invoice_terms AS "invoiceTerms"
       FROM settings WHERE id = 1`,
  );
  if (!row) throw new Error("ERP settings row is missing.");
  return { ...row, gstRegistered: row.gstRegistered === 1, roundOff: row.roundOff === 1 };
}

export async function updateSettings(userId: number, values: Settings) {
  await transaction(async () => {
    await run(
      `UPDATE settings SET
         business_name = @businessName, legal_name = @legalName,
         address_line1 = @addressLine1, address_line2 = @addressLine2, city = @city,
         state_code = @stateCode, pincode = @pincode, email = @email, phone = @phone,
         website = @website, gst_registered = @gstRegistered, gstin = @gstin, pan = @pan,
         bank_account_name = @bankAccountName, bank_account_number = @bankAccountNumber,
         bank_ifsc = @bankIfsc, bank_name = @bankName, bank_branch = @bankBranch,
         upi_id = @upiId, invoice_prefix = @invoicePrefix,
         challan_prefix = @challanPrefix,
         payment_terms_days = @paymentTermsDays, default_sac = @defaultSac,
         default_tax_rate_bp = @defaultTaxRateBp, round_off = @roundOff,
         invoice_notes = @invoiceNotes, invoice_terms = @invoiceTerms,
         updated_at = erp_now()
       WHERE id = 1`,
      { ...values, gstRegistered: values.gstRegistered ? 1 : 0, roundOff: values.roundOff ? 1 : 0 },
    );
    await audit(userId, "update", "settings", 1, "Company settings updated");
  });
}

/** Profile gaps worth flagging on the dashboard before invoices go out. */
export function settingsChecklist(settings: Settings) {
  const gaps: string[] = [];
  if (!settings.addressLine1) gaps.push("business address");
  if (settings.gstRegistered && !settings.gstin) gaps.push("GSTIN");
  if (!settings.bankAccountNumber && !settings.upiId) gaps.push("bank or UPI details");
  return gaps;
}
