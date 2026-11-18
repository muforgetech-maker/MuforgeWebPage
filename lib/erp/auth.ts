import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import {
  LOGIN_PATH,
  SESSION_COOKIE,
  SESSION_COOKIE_PATH,
  SESSION_HOURS,
} from "@/lib/erp/constants";
import { all, one, run } from "@/lib/erp/db";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/erp/password";

/*
 * Data Access Layer for authentication. Every ERP page, Server Action and
 * Route Handler calls requireAdmin() itself, close to the data. proxy.ts
 * only does a fast cookie-presence redirect and is not a security boundary.
 *
 * The cookie holds a random 256-bit token; the database stores only its
 * SHA-256, so a leaked database copy cannot be replayed as a login.
 */

export type AdminUser = { id: number; name: string; email: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function clientIp(requestHeaders: Headers) {
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Resolves the signed-in admin once per request, or null.
 *
 * connection() comes first: it marks everything after it as request-time
 * work, so neither the clock nor the database is read while Next.js
 * prerenders or validates a route. Every ERP read goes through here or
 * requireAdmin(), which keeps ERP data out of any static output.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await one<AdminUser>(
    `SELECT u.id, u.name, u.email
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`,
    hashToken(token),
    new Date().toISOString(),
  );
  return user ?? null;
});

/** The signed-in admin, or a redirect to the login page. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect(LOGIN_PATH);
  return user;
}

/** Starts a session and sets the cookie. Server Actions only. */
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_HOURS * 3_600_000);
  const requestHeaders = await headers();

  await run("DELETE FROM sessions WHERE expires_at <= ?", new Date().toISOString());
  await run(
    "INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)",
    hashToken(token),
    userId,
    expires.toISOString(),
    clientIp(requestHeaders),
    (requestHeaders.get("user-agent") ?? "").slice(0, 300),
  );

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SESSION_COOKIE_PATH,
    expires,
  });
}

/** Ends the current session. Server Actions only. */
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", hashToken(token));
  cookieStore.delete({ name: SESSION_COOKIE, path: SESSION_COOKIE_PATH });
}

/** Signs a user out everywhere, for example after a password change. */
export async function destroyAllSessions(userId: number) {
  await run("DELETE FROM sessions WHERE user_id = ?", userId);
}

// ---------------------------------------------------------------------------
// Brute-force protection: 5 failures per email or 30 per IP address in 15
// minutes locks further attempts until the window passes.
// ---------------------------------------------------------------------------

const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 30;

export async function isLoginLocked(email: string, ip: string) {
  const since = Date.now() - FAILURE_WINDOW_MS;
  const counts = await all<{ key: string; n: number }>(
    `SELECT key, COUNT(*) AS n FROM login_failures
      WHERE key IN (?, ?) AND at_ms > ? GROUP BY key`,
    `email:${email}`,
    `ip:${ip}`,
    since,
  );
  const count = (key: string) => counts.find((row) => row.key === key)?.n ?? 0;
  return (
    count(`email:${email}`) >= MAX_FAILURES_PER_EMAIL || count(`ip:${ip}`) >= MAX_FAILURES_PER_IP
  );
}

export async function recordLoginFailure(email: string, ip: string) {
  const now = Date.now();
  await run("DELETE FROM login_failures WHERE at_ms < ?", now - 24 * 3_600_000);
  await run("INSERT INTO login_failures (key, at_ms) VALUES (?, ?)", `email:${email}`, now);
  await run("INSERT INTO login_failures (key, at_ms) VALUES (?, ?)", `ip:${ip}`, now);
}

export async function clearLoginFailures(email: string) {
  await run("DELETE FROM login_failures WHERE key = ?", `email:${email}`);
}

// ---------------------------------------------------------------------------
// First admin. With no users yet, ERP_ADMIN_EMAIL and ERP_ADMIN_PASSWORD
// create one on the first login attempt. Once any user exists they are
// ignored, and the password can be removed from the environment.
// ---------------------------------------------------------------------------

export type SetupState = "ready" | "missing-env" | "weak-password";

async function userCount() {
  return (await one<{ n: number }>("SELECT COUNT(*) AS n FROM users"))?.n ?? 0;
}

export async function adminSetupState(): Promise<SetupState> {
  if (await userCount() > 0) return "ready";
  const email = process.env.ERP_ADMIN_EMAIL?.trim();
  const password = process.env.ERP_ADMIN_PASSWORD ?? "";
  if (!email || !password) return "missing-env";
  if (password.length < MIN_PASSWORD_LENGTH) return "weak-password";
  return "ready";
}

export async function ensureBootstrapAdmin() {
  if (await userCount() > 0 || (await adminSetupState()) !== "ready") return;
  const email = process.env.ERP_ADMIN_EMAIL!.trim().toLowerCase();
  const name = process.env.ERP_ADMIN_NAME?.trim() || "Administrator";
  const passwordHash = await hashPassword(process.env.ERP_ADMIN_PASSWORD!);
  // OR IGNORE: two first logins racing each other create one account, not an error.
  await run(
    "INSERT OR IGNORE INTO users (email, name, password_hash) VALUES (?, ?, ?)",
    email,
    name,
    passwordHash,
  );
}
