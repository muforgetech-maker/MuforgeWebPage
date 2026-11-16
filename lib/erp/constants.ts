// Shared by proxy.ts and the server code. Keep this file free of imports so
// the proxy bundle never pulls in the database.

export const SESSION_COOKIE = "mf_erp_session";

/** Cookies are scoped to the ERP; the public site never receives them. */
export const SESSION_COOKIE_PATH = "/admin";

export const SESSION_HOURS = 12;

export const LOGIN_PATH = "/admin/login";

/**
 * Where to send someone after signing in. Only ERP paths on this site are
 * accepted, so a crafted ?next= link cannot bounce a fresh login elsewhere.
 */
export function safeNextPath(value: unknown) {
  if (typeof value !== "string") return "/admin";
  const isErpPath = value === "/admin" || value.startsWith("/admin/") || value.startsWith("/admin?");
  if (!isErpPath || value.includes("\\") || value.startsWith(LOGIN_PATH)) return "/admin";
  return value;
}
