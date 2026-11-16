import type { Metadata } from "next";
import { requireAdmin } from "@/lib/erp/auth";
import { getSettings } from "@/lib/erp/data/settings";
import { CompanyForm } from "./company-form";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default async function CompanySettingsPage() {
  await requireAdmin();
  return <CompanyForm settings={getSettings()} />;
}
