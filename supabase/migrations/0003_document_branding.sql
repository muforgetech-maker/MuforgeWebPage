-- Branding shown on printed documents.
--
-- These are the parts of the invoice and challan that are marketing rather
-- than accounting: the taglines under the logo, the panel of services beside
-- the bill-to block, and the line across the footer band. They live in
-- settings so the wording can change without a deploy.
--
-- Defaults match the approved invoice design.

ALTER TABLE settings
  ADD COLUMN strapline text NOT NULL DEFAULT 'Custom Software & Digital Solutions',
  ADD COLUMN tagline text NOT NULL DEFAULT 'Build · Create · Grow',
  ADD COLUMN instagram text NOT NULL DEFAULT '',
  ADD COLUMN panel_heading text NOT NULL DEFAULT 'We Build What You Imagine',
  -- One service per line; the document lays them out in columns.
  ADD COLUMN panel_services text NOT NULL DEFAULT 'Websites
Custom Software
Digital Marketing
Final Year Projects
Product Photography
Video Editing
Training & Support',
  ADD COLUMN panel_quote text NOT NULL DEFAULT 'Your Vision + Our Tech = Real Solutions',
  ADD COLUMN footer_line text NOT NULL DEFAULT 'Let''s Build Something Great Together!';
