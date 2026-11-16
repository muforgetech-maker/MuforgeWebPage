import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/_actions/auth";
import { ErpSidebar } from "@/components/erp/sidebar";
import { requireAdmin } from "@/lib/erp/auth";

/*
 * The signed-in ERP. The sidebar is static and prerenders into the shell;
 * the account panel and every page read the session, so they stream in
 * behind Suspense boundaries (loading.tsx wraps each page).
 *
 * Every ERP route renders per request behind a login, so navigations are
 * allowed to wait for the server. `instant = false` here opts the ERP out of
 * static-shell validation; each page repeats it, because sibling-to-sibling
 * navigations are validated separately.
 */
export const instant = false;

export default function ErpLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] print:block print:min-h-0 print:bg-paper">
      <ErpSidebar
        account={
          <Suspense fallback={<div className="h-[4.5rem]" aria-hidden="true" />}>
            <AccountPanel />
          </Suspense>
        }
      />
      <main id="main" className="w-full max-w-[78rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">
        {children}
      </main>
    </div>
  );
}

async function AccountPanel() {
  const admin = await requireAdmin();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{admin.name}</p>
        <p className="truncate text-xs text-text-muted">{admin.email}</p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="inline-flex size-9 items-center justify-center rounded-control border border-border text-text-muted transition-colors duration-200 hover:border-border-strong hover:text-text"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
