import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

/*
 * One PostgreSQL database holds all ERP data, hosted on Supabase.
 *
 * Why a pool on globalThis: every serverless invocation that reuses a warm
 * instance reuses these sockets. Opening a connection per request would
 * exhaust the database's connection limit under any real load.
 *
 * Connect through Supabase's transaction pooler (port 6543), not the direct
 * database port. Serverless instances come and go, and the pooler is what
 * keeps that from turning into thousands of Postgres backends.
 *
 * Queries are written with `?` or `@named` placeholders — the SQLite dialect
 * this schema grew up with. compile() rewrites them to $1..$n, so the data
 * layer reads the same as it always did.
 */

// COUNT() and SUM() come back as int8, which pg hands over as a string to
// avoid precision loss past 2^53. Every total here is paise in a plain
// integer column, far below that, so a number is both safe and expected.
types.setTypeParser(types.builtins.INT8, (value) => Number(value));

type Params = unknown[] | [Record<string, unknown>];

type Store = { pool: Pool };

const globalStore = globalThis as typeof globalThis & { __muforgeErp?: Store };

/** The open transaction, if the caller is inside one. */
const txStore = new AsyncLocalStorage<PoolClient>();

export function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy the Supabase transaction pooler connection string " +
        "(Project settings > Database > Connection string > Transaction pooler) into .env.local, " +
        "and set it in the Vercel project's environment variables.",
    );
  }
  return url;
}

/**
 * Host and database name, with the credentials stripped.
 *
 * DATABASE_URL carries the password, so it must never reach a page. This is
 * the only form of it that is safe to render.
 */
export function databaseLabel() {
  try {
    const url = new URL(databaseUrl());
    return `${url.hostname}${url.pathname}`;
  } catch {
    return "not configured";
  }
}

function open(): Store {
  const pool = new Pool({
    connectionString: databaseUrl(),
    // The pooler multiplexes for us, so each instance needs very few sockets.
    max: Number(process.env.ERP_DB_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    // Supabase terminates TLS with a publicly trusted certificate. The escape
    // hatch exists for self-hosted Postgres behind a private CA; leaving it
    // unset keeps the certificate checked.
    ssl:
      process.env.ERP_DB_SSL_INSECURE === "1"
        ? { rejectUnauthorized: false }
        : { rejectUnauthorized: true },
  });

  // A dead socket must never take the process down with it.
  pool.on("error", (error) => {
    console.error("[erp] idle database client error", error);
  });

  return { pool };
}

function pool() {
  globalStore.__muforgeErp ??= open();
  return globalStore.__muforgeErp.pool;
}

function isNamed(params: Params): params is [Record<string, unknown>] {
  if (params.length !== 1) return false;
  const first = params[0];
  return (
    typeof first === "object" &&
    first !== null &&
    !Array.isArray(first) &&
    Object.getPrototypeOf(first) === Object.prototype
  );
}

/**
 * Rewrites `?` / `@name` placeholders as $1..$n.
 *
 * The scan walks the statement rather than running a regex over it, so a `?`
 * or an `@` inside a quoted literal (an email address in a seed row, say) is
 * left alone instead of being mistaken for a parameter.
 */
export function compile(sql: string, params: Params): { text: string; values: unknown[] } {
  const named = isNamed(params);
  const source = named ? params[0] : null;
  const values: unknown[] = [];
  const seen = new Map<string, number>();
  let text = "";
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];

    // Skip over anything that is not executable SQL.
    if (char === "'" || char === '"') {
      const quote = char;
      let j = i + 1;
      while (j < sql.length) {
        // A quote is doubled to escape it. A backslash is an ordinary
        // character: with standard_conforming_strings on, which is the
        // default, ESCAPE '\' is a complete literal holding one backslash.
        if (sql[j] === quote) {
          if (sql[j + 1] === quote) j += 2; // an escaped quote, '' or ""
          else break;
        } else j++;
      }
      text += sql.slice(i, Math.min(j + 1, sql.length));
      i = j + 1;
      continue;
    }
    if (char === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      text += sql.slice(i, stop);
      i = stop;
      continue;
    }
    if (char === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      text += sql.slice(i, stop);
      i = stop;
      continue;
    }

    if (!named && char === "?") {
      values.push((params as unknown[])[values.length]);
      text += `$${values.length}`;
      i++;
      continue;
    }

    if (named && char === "@") {
      const match = /^@([A-Za-z_][A-Za-z0-9_]*)/.exec(sql.slice(i));
      if (match) {
        const name = match[1];
        let position = seen.get(name);
        if (position === undefined) {
          if (!source || !(name in source)) {
            throw new Error(`SQL parameter @${name} was not supplied`);
          }
          values.push(source[name]);
          position = values.length;
          seen.set(name, position);
        }
        text += `$${position}`;
        i += match[0].length;
        continue;
      }
    }

    text += char;
    i++;
  }

  if (!named) {
    const supplied = (params as unknown[]).length;
    if (values.length !== supplied) {
      throw new Error(`SQL expects ${values.length} parameters but received ${supplied}`);
    }
  }

  return { text, values };
}

async function query<T extends QueryResultRow>(sql: string, params: Params) {
  const { text, values } = compile(sql, params);
  const client = txStore.getStore();
  if (client) return client.query<T>(text, values);
  return pool().query<T>(text, values);
}

/** All rows. Pass positional values, or one object for @named parameters. */
export async function all<T extends QueryResultRow>(sql: string, ...params: Params): Promise<T[]> {
  const result = await query<T>(sql, params);
  return result.rows;
}

export async function one<T extends QueryResultRow>(
  sql: string,
  ...params: Params
): Promise<T | undefined> {
  const result = await query<T>(sql, params);
  return result.rows[0];
}

export async function run(sql: string, ...params: Params): Promise<{ changes: number }> {
  const result = await query(sql, params);
  return { changes: result.rowCount ?? 0 };
}

/**
 * An INSERT that hands back the generated id. Postgres has no equivalent of
 * last_insert_rowid(), so the id comes from a RETURNING clause.
 */
export async function insert(sql: string, ...params: Params): Promise<number> {
  const result = await query<{ id: number }>(`${sql.trimEnd().replace(/;$/, "")} RETURNING id`, params);
  const id = result.rows[0]?.id;
  if (id === undefined) throw new Error("INSERT did not return an id");
  return Number(id);
}

/**
 * Runs `work` atomically on a single connection. Nested calls join the outer
 * transaction rather than opening a second one.
 *
 * Everything inside must be awaited: an un-awaited query escapes the
 * AsyncLocalStorage scope and would run on a pooled connection outside the
 * transaction, committing independently of it.
 */
export async function transaction<T>(work: () => Promise<T>): Promise<T> {
  if (txStore.getStore()) return work();

  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await txStore.run(client, work);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("[erp] rollback failed", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Records who changed what. Call inside the same transaction as the change. */
export async function audit(
  userId: number | null,
  action: string,
  entity: string,
  entityId: number | bigint | null,
  summary = "",
) {
  await run(
    "INSERT INTO audit_log (user_id, action, entity, entity_id, summary) VALUES (?, ?, ?, ?, ?)",
    userId,
    action,
    entity,
    entityId === null ? null : Number(entityId),
    summary,
  );
}

/** Table names in dependency order, used by the backup download. */
export const TABLES = [
  "settings",
  "users",
  "clients",
  "invoice_sequences",
  "invoices",
  "invoice_items",
  "payments",
  "expenses",
  "audit_log",
] as const;
