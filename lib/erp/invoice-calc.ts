import { divRoundHalfUp } from "@/lib/erp/money";

/*
 * Invoice arithmetic, shared by the editor (live preview) and the server
 * (the stored figures). Both call computeInvoiceTotals with the same inputs,
 * so what someone sees while typing is exactly what gets saved.
 */

export type TaxMode = "intra" | "inter" | "none";

export type LineInput = {
  description: string;
  sac: string;
  quantityMilli: number;
  unit: string;
  ratePaise: number;
  taxRateBp: number;
};

export type ComputedLine = LineInput & { amountPaise: number };

export type TaxGroup = {
  rateBp: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
};

export type InvoiceTotals = {
  lines: ComputedLine[];
  subtotalPaise: number;
  taxGroups: TaxGroup[];
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  taxPaise: number;
  roundOffPaise: number;
  totalPaise: number;
};

/**
 * Supplies inside the seller's own state carry CGST + SGST; supplies to
 * another state (or abroad) carry IGST. An unregistered seller charges none.
 */
export function taxModeFor(
  gstRegistered: boolean,
  sellerStateCode: string,
  placeOfSupply: string,
): TaxMode {
  if (!gstRegistered) return "none";
  return sellerStateCode === placeOfSupply ? "intra" : "inter";
}

/** Taxable value of one line: quantity × rate, rounded to the paisa. */
export function lineAmount(quantityMilli: number, ratePaise: number) {
  return divRoundHalfUp(BigInt(quantityMilli) * BigInt(ratePaise), BigInt(1000));
}

/** Tax at a rate in basis points; `share` 2 gives each half of CGST/SGST. */
function taxOn(taxablePaise: number, rateBp: number, share = 1) {
  return divRoundHalfUp(BigInt(taxablePaise) * BigInt(rateBp), BigInt(10_000 * share));
}

export function computeInvoiceTotals(
  input: LineInput[],
  mode: TaxMode,
  roundOff: boolean,
): InvoiceTotals {
  const lines = input.map((line) => ({
    ...line,
    // An unregistered seller cannot charge GST, whatever the line says.
    taxRateBp: mode === "none" ? 0 : line.taxRateBp,
    amountPaise: lineAmount(line.quantityMilli, line.ratePaise),
  }));

  // Tax is worked out on the combined taxable value at each rate, which is
  // how the rate-wise summary on the invoice (and the GST return) adds up.
  const byRate = new Map<number, number>();
  for (const line of lines) {
    byRate.set(line.taxRateBp, (byRate.get(line.taxRateBp) ?? 0) + line.amountPaise);
  }

  const taxGroups: TaxGroup[] = [...byRate.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rateBp, taxablePaise]) => {
      if (mode === "intra") {
        // Each half is rounded on its own so CGST and SGST are always equal.
        const half = taxOn(taxablePaise, rateBp, 2);
        return { rateBp, taxablePaise, cgstPaise: half, sgstPaise: half, igstPaise: 0 };
      }
      if (mode === "inter") {
        const igst = taxOn(taxablePaise, rateBp);
        return { rateBp, taxablePaise, cgstPaise: 0, sgstPaise: 0, igstPaise: igst };
      }
      return { rateBp, taxablePaise, cgstPaise: 0, sgstPaise: 0, igstPaise: 0 };
    });

  const subtotalPaise = lines.reduce((sum, line) => sum + line.amountPaise, 0);
  const cgstPaise = taxGroups.reduce((sum, g) => sum + g.cgstPaise, 0);
  const sgstPaise = taxGroups.reduce((sum, g) => sum + g.sgstPaise, 0);
  const igstPaise = taxGroups.reduce((sum, g) => sum + g.igstPaise, 0);
  const taxPaise = cgstPaise + sgstPaise + igstPaise;
  const exact = subtotalPaise + taxPaise;
  const totalPaise = roundOff ? divRoundHalfUp(BigInt(exact), BigInt(100)) * 100 : exact;

  return {
    lines,
    subtotalPaise,
    taxGroups,
    cgstPaise,
    sgstPaise,
    igstPaise,
    taxPaise,
    roundOffPaise: totalPaise - exact,
    totalPaise,
  };
}
