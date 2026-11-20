import "server-only";
import type { Settings } from "@/lib/erp/data/settings";
import type { ChallanEditorSettings } from "./challan-editor";

/** The subset of settings the challan editor needs to preview the tax. */
export function challanEditorSettings(settings: Settings): ChallanEditorSettings {
  return {
    gstRegistered: settings.gstRegistered,
    stateCode: settings.stateCode,
    roundOff: settings.roundOff,
    defaultSac: settings.defaultSac,
    defaultTaxRateBp: settings.defaultTaxRateBp,
  };
}
