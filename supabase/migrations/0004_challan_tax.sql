-- Tax shown on delivery challans.
--
-- GST Rule 55(2)(f): when goods move for supply to the consignee, the
-- challan states the tax rate and the amount of central, state or integrated
-- tax. A challan is still not a tax invoice -- the tax is charged on the
-- invoice raised afterwards, and only invoices count in the GST reports --
-- but its paperwork now shows what that tax is.
--
-- Same split as invoices: CGST + SGST inside the seller's state, IGST across
-- states, nothing when the business is not GST registered.
--
-- Existing challans keep exactly what they were issued with: their lines get
-- a 0% rate, their tax starts at zero, and their total equals the value they
-- already show. Rates are set per line from the next edit on.

ALTER TABLE delivery_challan_items
  ADD COLUMN tax_rate_bp integer NOT NULL DEFAULT 0 CHECK (tax_rate_bp >= 0);

ALTER TABLE delivery_challans
  ADD COLUMN tax_mode text NOT NULL DEFAULT 'none' CHECK (tax_mode IN ('intra', 'inter', 'none')),
  ADD COLUMN cgst_paise integer NOT NULL DEFAULT 0,
  ADD COLUMN sgst_paise integer NOT NULL DEFAULT 0,
  ADD COLUMN igst_paise integer NOT NULL DEFAULT 0,
  ADD COLUMN round_off_paise integer NOT NULL DEFAULT 0,
  -- Value plus tax plus round-off. total_value_paise stays the taxable value.
  ADD COLUMN total_paise integer;

UPDATE delivery_challans SET total_paise = total_value_paise;

ALTER TABLE delivery_challans ALTER COLUMN total_paise SET NOT NULL;
