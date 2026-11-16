/*
 * GST reference data. The two-digit codes are the official state codes that
 * also open every GSTIN, so a client's GSTIN can be checked against the state
 * chosen for them.
 */

export const indianStates = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
  { code: "96", name: "Outside India (export)" },
] as const;

export type StateCode = (typeof indianStates)[number]["code"];

const stateNames = new Map<string, string>(indianStates.map((s) => [s.code, s.name]));

export function isStateCode(value: string): value is StateCode {
  return stateNames.has(value);
}

export function stateName(code: string) {
  return stateNames.get(code) ?? code;
}

/** MuForge is in Coimbatore, Tamil Nadu. */
export const DEFAULT_STATE_CODE: StateCode = "33";

/**
 * GST slabs offered on invoice lines, in basis points (1800 = 18%). Since the
 * September 2025 rationalisation the main slabs are 5% and 18%, with 40% for
 * a short list of goods. Edit this list if your supplies need another rate.
 */
export const gstRatesBp = [0, 500, 1800, 4000] as const;

export function formatRateBp(bp: number) {
  return `${(bp / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
}

/** Common SAC codes for MuForge's services, offered as suggestions only. */
export const sacSuggestions = [
  { code: "998314", label: "IT design and development" },
  { code: "998313", label: "IT consulting and support" },
  { code: "998315", label: "Hosting and IT infrastructure" },
  { code: "998361", label: "Advertising services" },
  { code: "999293", label: "Commercial training and coaching" },
] as const;

/** 15 characters: state code, PAN, entity number, Z, checksum. */
const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Validates the format and the official mod-36 check character. */
export function isValidGstin(value: string) {
  if (!GSTIN_PATTERN.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const product = GSTIN_CHARS.indexOf(value[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36] === value[14];
}

export const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
