import "server-only";
import type { Settings } from "@/lib/erp/data/settings";
import type { InvoiceDetail } from "@/lib/erp/data/invoices";
import { paiseToInput } from "@/lib/erp/money";
import type { EditorInitial, EditorLine, EditorSettings } from "./invoice-editor";

/** The subset of settings the editor needs to preview totals. */
export function editorSettings(settings: Settings): EditorSettings {
  return {
    gstRegistered: settings.gstRegistered,
    stateCode: settings.stateCode,
    roundOff: settings.roundOff,
    defaultSac: settings.defaultSac,
    defaultTaxRateBp: settings.defaultTaxRateBp,
  };
}

export function blankEditorLine(settings: Settings): EditorLine {
  return {
    description: "",
    sac: settings.defaultSac,
    quantity: "1",
    unit: "nos",
    rate: "",
    taxRateBp: String(settings.gstRegistered ? settings.defaultTaxRateBp : 0),
  };
}

export function editorInitialFrom(invoice: InvoiceDetail): EditorInitial {
  return {
    clientId: String(invoice.clientId),
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    placeOfSupply: invoice.placeOfSupply,
    notes: invoice.notes,
    terms: invoice.terms,
    lines: invoice.items.map((item) => ({
      description: item.description,
      sac: item.sac,
      quantity: String(item.quantityMilli / 1000),
      unit: item.unit,
      rate: paiseToInput(item.ratePaise),
      taxRateBp: String(item.taxRateBp),
    })),
  };
}
