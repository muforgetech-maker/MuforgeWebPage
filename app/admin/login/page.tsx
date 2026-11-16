import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TriangleAlert } from "lucide-react";
import { adminSetupState, getCurrentAdmin } from "@/lib/erp/auth";
import { safeNextPath } from "@/lib/erp/constants";
import { MIN_PASSWORD_LENGTH } from "@/lib/erp/password";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3 rounded-control">
          <Image
            src="/assets/muforge-logo-clean.png"
            alt=""
            width={661}
            height={420}
            priority
            className="logo-mark h-10 w-auto"
          />
          <span className="font-display text-xl font-semibold tracking-tight text-text">
            MuForge
          </span>
        </Link>

        <div className="erp-card mt-8 p-6 sm:p-8">
          <h1 className="text-h3 font-semibold text-text">Sign in to the ERP</h1>
          <p className="mt-1 text-sm text-text-muted">Invoices, payments and accounts.</p>
          <div className="mt-6">
            <Suspense fallback={<div className="h-56" aria-hidden="true" />}>
              <LoginPanel searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Authorised MuForge staff only. Sessions end after 12 hours.
        </p>
      </div>
    </main>
  );
}

async function LoginPanel({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const [admin, params] = await Promise.all([getCurrentAdmin(), searchParams]);
  const next = safeNextPath(params.next);
  if (admin) redirect(next);

  const setup = adminSetupState();

  return (
    <>
      {setup !== "ready" && (
        <div role="note" className="mb-5 flex gap-2 rounded-control bg-ember-wash p-3 text-sm text-text">
          <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
          <p>
            {setup === "missing-env" ? (
              <>
                No admin account exists yet. Set <code className="font-mono">ERP_ADMIN_EMAIL</code>{" "}
                and <code className="font-mono">ERP_ADMIN_PASSWORD</code> in{" "}
                <code className="font-mono">.env.local</code>, restart the server, then sign in
                with them.
              </>
            ) : (
              <>
                <code className="font-mono">ERP_ADMIN_PASSWORD</code> must be at least{" "}
                {MIN_PASSWORD_LENGTH} characters. Update it and restart the server.
              </>
            )}
          </p>
        </div>
      )}
      <LoginForm next={next} />
    </>
  );
}
