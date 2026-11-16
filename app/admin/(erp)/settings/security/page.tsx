import type { Metadata } from "next";
import { requireAdmin } from "@/lib/erp/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/erp/password";
import { ChangePasswordForm } from "../account-forms";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "My password" };

export default async function SecurityPage() {
  const admin = await requireAdmin();
  return (
    <section className="erp-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-text">Change your password</h2>
      <p className="mt-1 text-sm text-text-muted">
        Signed in as {admin.email}. Changing it signs you out on every other device.
      </p>
      <div className="mt-5">
        <ChangePasswordForm minLength={MIN_PASSWORD_LENGTH} />
      </div>
    </section>
  );
}
