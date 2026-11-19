"use server";

import { revalidatePath } from "next/cache";
import { createSession, requireAdmin } from "@/lib/erp/auth";
import { updateSettings, type Settings } from "@/lib/erp/data/settings";
import {
  changeOwnPassword,
  createUser,
  resetPassword,
  setUserActive,
  UserError,
} from "@/lib/erp/data/users";
import { errorState, FormReader, successState, type ActionState } from "@/lib/erp/form";
import {
  gstRatesBp,
  IFSC_PATTERN,
  indianStates,
  isValidGstin,
  PAN_PATTERN,
  stateName,
} from "@/lib/erp/gst";
import { MIN_PASSWORD_LENGTH } from "@/lib/erp/password";

const stateCodes = indianStates.map((state) => state.code);
const rateValues = gstRatesBp.map(String);

export async function saveSettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = new FormReader(formData);
  const gstRegistered = form.checkbox("gstRegistered");

  const values: Settings = {
    businessName: form.text("businessName", { label: "Business name", required: true, max: 120 }),
    legalName: form.text("legalName", { label: "Legal name", max: 160 }),
    addressLine1: form.text("addressLine1", { label: "Address line 1", max: 150 }),
    addressLine2: form.text("addressLine2", { label: "Address line 2", max: 150 }),
    city: form.text("city", { label: "City", max: 80 }),
    stateCode: form.oneOf("stateCode", stateCodes, { label: "A state" }),
    pincode: form.text("pincode", {
      label: "PIN code",
      pattern: /^\d{6}$/,
      patternMessage: "A PIN code has 6 digits.",
    }),
    email: form.email("email", { label: "Email" }),
    phone: form.text("phone", { label: "Phone", max: 30 }),
    website: form.text("website", {
      label: "Website",
      max: 200,
      pattern: /^https?:\/\/\S+$/,
      patternMessage: "Start the website with https://",
    }),
    gstRegistered,
    gstin: form.text("gstin", { label: "GSTIN", max: 15, uppercase: true }),
    pan: form.text("pan", {
      label: "PAN",
      uppercase: true,
      pattern: PAN_PATTERN,
      patternMessage: "A PAN looks like ABCDE1234F.",
    }),
    bankAccountName: form.text("bankAccountName", { label: "Account name", max: 120 }),
    bankAccountNumber: form.text("bankAccountNumber", {
      label: "Account number",
      pattern: /^\d{6,20}$/,
      patternMessage: "Use digits only, 6 to 20 of them.",
    }),
    bankIfsc: form.text("bankIfsc", {
      label: "IFSC",
      uppercase: true,
      pattern: IFSC_PATTERN,
      patternMessage: "An IFSC looks like HDFC0001234.",
    }),
    bankName: form.text("bankName", { label: "Bank", max: 80 }),
    bankBranch: form.text("bankBranch", { label: "Branch", max: 80 }),
    upiId: form.text("upiId", {
      label: "UPI ID",
      max: 80,
      pattern: /^[\w.-]{2,}@[a-zA-Z]{2,}$/,
      patternMessage: "A UPI ID looks like muforge@okhdfcbank.",
    }),
    invoicePrefix: form.text("invoicePrefix", {
      label: "Invoice prefix",
      required: true,
      uppercase: true,
      pattern: /^[A-Z0-9]{1,4}$/,
      patternMessage: "Use 1 to 4 letters or digits, so the full number stays within GST’s 16 characters.",
    }),
    challanPrefix: form.text("challanPrefix", {
      label: "Delivery challan prefix",
      required: true,
      uppercase: true,
      pattern: /^[A-Z0-9]{1,4}$/,
      patternMessage: "Use 1 to 4 letters or digits, so the full number stays within GST’s 16 characters.",
    }),
    paymentTermsDays: form.integer("paymentTermsDays", { label: "Payment terms", min: 0, max: 365 }),
    defaultSac: form.text("defaultSac", {
      label: "Default SAC",
      pattern: /^\d{4,8}$/,
      patternMessage: "SAC/HSN is 4 to 8 digits.",
    }),
    defaultTaxRateBp: Number(form.oneOf("defaultTaxRateBp", rateValues, { label: "A default GST rate" })),
    roundOff: form.checkbox("roundOff"),
    invoiceNotes: form.text("invoiceNotes", { label: "Default notes", max: 2000 }),
    invoiceTerms: form.text("invoiceTerms", { label: "Default terms", max: 2000 }),
    strapline: form.text("strapline", { label: "Strapline", max: 80 }),
    tagline: form.text("tagline", { label: "Tagline", max: 60 }),
    instagram: form.text("instagram", { label: "Instagram handle", max: 40 }),
    panelHeading: form.text("panelHeading", { label: "Panel heading", max: 80 }),
    panelServices: form.text("panelServices", { label: "Services listed", max: 600 }),
    panelQuote: form.text("panelQuote", { label: "Panel quote", max: 160 }),
    footerLine: form.text("footerLine", { label: "Footer line", max: 120 }),
  };

  if (gstRegistered) {
    if (!values.gstin) form.fail("gstin", "Enter your GSTIN, or untick GST registration.");
    else if (!isValidGstin(values.gstin)) form.fail("gstin", "This isn’t a valid GSTIN. Check it against your registration certificate.");
    else if (values.gstin.slice(0, 2) !== values.stateCode) {
      form.fail("gstin", `This GSTIN is registered in ${stateName(values.gstin.slice(0, 2))}, but your state is ${stateName(values.stateCode)}.`);
    } else if (values.pan && values.gstin.slice(2, 12) !== values.pan) {
      form.fail("pan", "Your PAN should match characters 3 to 12 of your GSTIN.");
    }
  }
  if (!form.ok) return errorState("Please fix the highlighted fields.", form.errors);

  // Fill PAN from the GSTIN when it was left blank: they always agree.
  if (gstRegistered && !values.pan) values.pan = values.gstin.slice(2, 12);
  if (!gstRegistered) values.gstin = "";

  await updateSettings(admin.id, values);
  revalidatePath("/admin", "layout");
  return successState("Settings saved. New invoices and drafts use them; issued invoices keep their details.");
}

export async function addUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = new FormReader(formData);
  const name = form.text("name", { label: "Name", required: true, max: 100 });
  const email = form.email("email", { label: "Email", required: true });
  const password = form.raw("password");
  if (password.length < MIN_PASSWORD_LENGTH) {
    form.fail("password", `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!form.ok) return errorState("Please fix the highlighted fields.", form.errors);

  try {
    await createUser(admin.id, { name, email, password });
  } catch (error) {
    if (error instanceof UserError) return errorState(error.message, { email: error.message });
    throw error;
  }
  revalidatePath("/admin/settings/users");
  return successState(`${name} can now sign in with ${email}. Share the password with them securely.`);
}

export async function toggleUserActive(userId: number, active: boolean): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    await setUserActive(admin.id, userId, active);
  } catch (error) {
    if (error instanceof UserError) return errorState(error.message);
    throw error;
  }
  revalidatePath("/admin/settings/users");
  return { status: "success" };
}

export async function resetUserPassword(
  userId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return errorState(`Use at least ${MIN_PASSWORD_LENGTH} characters.`, { password: "Too short." });
  }
  await resetPassword(admin.id, userId, password);
  revalidatePath("/admin/settings/users");
  return successState("Password reset. They’ve been signed out everywhere.");
}

export async function changeMyPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const errors: Record<string, string> = {};
  if (!current) errors.current = "Enter your current password.";
  if (next.length < MIN_PASSWORD_LENGTH) errors.next = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  else if (next === current) errors.next = "Choose a password different from the current one.";
  if (confirm !== next) errors.confirm = "The two new passwords don’t match.";
  if (Object.keys(errors).length) return errorState("Please fix the highlighted fields.", errors);

  try {
    await changeOwnPassword(admin.id, current, next);
  } catch (error) {
    if (error instanceof UserError) return errorState(error.message, { current: error.message });
    throw error;
  }
  // Every session was ended; start a fresh one so this browser stays signed in.
  await createSession(admin.id);
  return successState("Password changed. Any other devices have been signed out.");
}
