import type { Metadata } from "next";
import { UserCheck, UserX } from "lucide-react";
import { toggleUserActive } from "@/app/admin/_actions/settings";
import { ActionButton } from "@/components/erp/action-button";
import { Badge, TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { listUsers } from "@/lib/erp/data/users";
import { formatTimestamp } from "@/lib/erp/dates";
import { MIN_PASSWORD_LENGTH } from "@/lib/erp/password";
import { AddUserForm, ResetPasswordForm } from "../account-forms";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = listUsers();

  return (
    <div className="grid gap-6">
      <TableCard title="People who can sign in">
        <ul className="divide-y divide-border">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text">
                  {user.name}
                  {user.id === admin.id && <Badge tone="neutral">You</Badge>}
                  {!user.active && <Badge tone="muted">Deactivated</Badge>}
                </p>
                <p className="text-sm text-text-muted">{user.email}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {user.lastLoginAt ? `Last signed in ${formatTimestamp(user.lastLoginAt)}` : "Never signed in"}
                </p>
              </div>
              {user.id !== admin.id && (
                <div className="flex flex-wrap items-start gap-4">
                  <ResetPasswordForm userId={user.id} name={user.name} />
                  <ActionButton
                    action={toggleUserActive.bind(null, user.id, !user.active)}
                    className={user.active ? "erp-button-danger py-1.5" : "erp-button-secondary py-1.5"}
                    confirmMessage={
                      user.active ? `Deactivate ${user.name}? They’ll be signed out immediately.` : undefined
                    }
                  >
                    {user.active ? (
                      <>
                        <UserX size={15} aria-hidden="true" /> Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck size={15} aria-hidden="true" /> Reactivate
                      </>
                    )}
                  </ActionButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      </TableCard>

      <section className="erp-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-text">Add a user</h2>
        <p className="mt-1 text-sm text-text-muted">
          Every user has full access: invoices, money and settings. Deactivate people who leave rather
          than sharing one login, so the activity log shows who did what.
        </p>
        <div className="mt-5">
          <AddUserForm minLength={MIN_PASSWORD_LENGTH} />
        </div>
      </section>
    </div>
  );
}
