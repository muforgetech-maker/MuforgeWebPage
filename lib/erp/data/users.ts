import "server-only";
import { destroyAllSessions } from "@/lib/erp/auth";
import { all, audit, one, run, transaction } from "@/lib/erp/db";
import { hashPassword, verifyPassword } from "@/lib/erp/password";

export class UserError extends Error {}

export type UserRow = {
  id: number;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export function listUsers(): UserRow[] {
  return all<Omit<UserRow, "active"> & { active: number }>(
    `SELECT id, email, name, active, created_at AS createdAt, last_login_at AS lastLoginAt
       FROM users ORDER BY active DESC, name COLLATE NOCASE`,
  ).map((row) => ({ ...row, active: row.active === 1 }));
}

export async function createUser(actorId: number, input: { name: string; email: string; password: string }) {
  if (one("SELECT 1 AS found FROM users WHERE email = ?", input.email)) {
    throw new UserError("A user with that email already exists.");
  }
  const passwordHash = await hashPassword(input.password);
  return transaction(() => {
    const result = run(
      "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
      input.email,
      input.name,
      passwordHash,
    );
    const id = Number(result.lastInsertRowid);
    audit(actorId, "create", "user", id, input.email);
    return id;
  });
}

export function setUserActive(actorId: number, userId: number, active: boolean) {
  if (actorId === userId && !active) throw new UserError("You can’t deactivate your own account.");
  transaction(() => {
    if (!active) {
      const others = one<{ n: number }>(
        "SELECT COUNT(*) AS n FROM users WHERE active = 1 AND id <> ?",
        userId,
      );
      if ((others?.n ?? 0) === 0) throw new UserError("At least one active user must remain.");
    }
    run("UPDATE users SET active = ? WHERE id = ?", active ? 1 : 0, userId);
    if (!active) destroyAllSessions(userId);
    audit(actorId, active ? "activate" : "deactivate", "user", userId);
  });
}

/** Sets a user's password and signs them out everywhere. */
export async function resetPassword(actorId: number, userId: number, password: string) {
  const passwordHash = await hashPassword(password);
  transaction(() => {
    run("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, userId);
    destroyAllSessions(userId);
    audit(actorId, "reset-password", "user", userId);
  });
}

/** Changes the signed-in user's own password after checking the current one. */
export async function changeOwnPassword(userId: number, current: string, next: string) {
  const row = one<{ hash: string }>("SELECT password_hash AS hash FROM users WHERE id = ?", userId);
  if (!row || !(await verifyPassword(current, row.hash))) {
    throw new UserError("Your current password is incorrect.");
  }
  await resetPassword(userId, userId, next);
}
