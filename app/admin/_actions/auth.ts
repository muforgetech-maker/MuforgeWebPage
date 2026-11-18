"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearLoginFailures,
  clientIp,
  createSession,
  destroySession,
  ensureBootstrapAdmin,
  getCurrentAdmin,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/erp/auth";
import { LOGIN_PATH, safeNextPath } from "@/lib/erp/constants";
import { audit, one, run } from "@/lib/erp/db";
import { errorState, type ActionState } from "@/lib/erp/form";
import { getDummyHash, verifyPassword } from "@/lib/erp/password";

const GENERIC_FAILURE = "That email and password don’t match an active account.";

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, 512);
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return errorState("Enter your email and password.");
  }

  await ensureBootstrapAdmin();

  const ip = clientIp(await headers());
  if (await isLoginLocked(email, ip)) {
    return errorState("Too many failed attempts. Wait 15 minutes, then try again.");
  }

  const user = await one<{ id: number; password_hash: string; active: number }>(
    "SELECT id, password_hash, active FROM users WHERE email = ?",
    email,
  );
  // Verify against a dummy hash for unknown emails so both paths cost the same.
  const passwordOk = await verifyPassword(password, user?.password_hash ?? (await getDummyHash()));

  if (!user || !passwordOk || user.active !== 1) {
    await recordLoginFailure(email, ip);
    return errorState(GENERIC_FAILURE);
  }

  await clearLoginFailures(email);
  await run("UPDATE users SET last_login_at = ? WHERE id = ?", new Date().toISOString(), user.id);
  await createSession(user.id);
  await audit(user.id, "login", "user", user.id);
  redirect(next);
}

export async function logout() {
  const user = await getCurrentAdmin();
  await destroySession();
  if (user) await audit(user.id, "logout", "user", user.id);
  redirect(LOGIN_PATH);
}
