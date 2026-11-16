import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  DatabaseSync,
  type SQLInputValue,
  type StatementResultingChanges,
  type StatementSync,
} from "node:sqlite";
import { DEFAULT_STATE_CODE } from "@/lib/erp/gst";
import { migrate } from "@/lib/erp/schema";

/*
 * One SQLite database file holds all ERP data. node:sqlite ships with
 * Node 22.13+ / 24, so there is no native module to build.
 *
 * The file needs a persistent disk: a VPS, a container with a volume, or any
 * Node host with durable storage. Serverless platforms with an ephemeral
 * filesystem would lose it; see README.md before deploying.
 */

type Params = SQLInputValue[] | [Record<string, SQLInputValue>];

type Store = {
  db: DatabaseSync;
  statements: Map<string, StatementSync>;
  transactionDepth: number;
};

// Kept on globalThis so dev-mode hot reloads reuse one connection instead of
// opening a new handle on every edit.
const globalStore = globalThis as typeof globalThis & { __muforgeErp?: Store };

export function databasePath() {
  // The database is runtime data, never a build asset: keep the bundler's
  // file tracer from pulling the project (or the data folder) into the output.
  return path.resolve(
    /*turbopackIgnore: true*/
    process.env.ERP_DATABASE_PATH || path.join(process.cwd(), "data", "muforge-erp.sqlite"),
  );
}

function open(): Store {
  const file = databasePath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
  `);
  migrate(db);
  seedSettings(db);
  return { db, statements: new Map(), transactionDepth: 0 };
}

function store() {
  globalStore.__muforgeErp ??= open();
  return globalStore.__muforgeErp;
}

export function getDb() {
  return store().db;
}

function statement(sql: string) {
  const { db, statements } = store();
  let prepared = statements.get(sql);
  if (!prepared) {
    prepared = db.prepare(sql);
    statements.set(sql, prepared);
  }
  return prepared;
}

// node:sqlite returns rows created with a null prototype. React refuses to
// pass those to Client Components, so every row is copied into a plain object.
function plain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

/** All rows. Pass positional values, or one object for @named parameters. */
export function all<T>(sql: string, ...params: Params): T[] {
  return statement(sql)
    .all(...(params as SQLInputValue[]))
    .map((row) => plain<T>(row));
}

export function one<T>(sql: string, ...params: Params): T | undefined {
  const row = statement(sql).get(...(params as SQLInputValue[]));
  return row === undefined ? undefined : plain<T>(row);
}

export function run(sql: string, ...params: Params): StatementResultingChanges {
  return statement(sql).run(...(params as SQLInputValue[]));
}

/**
 * Runs `work` atomically. The body must be synchronous: node:sqlite is, and
 * an await inside would let another request interleave its writes. Nested
 * calls join the outer transaction.
 */
export function transaction<T>(work: () => T): T {
  const s = store();
  if (s.transactionDepth > 0) return work();
  s.db.exec("BEGIN IMMEDIATE");
  s.transactionDepth++;
  try {
    const result = work();
    s.db.exec("COMMIT");
    return result;
  } catch (error) {
    s.db.exec("ROLLBACK");
    throw error;
  } finally {
    s.transactionDepth--;
  }
}

/** Records who changed what. Call inside the same transaction as the change. */
export function audit(
  userId: number | null,
  action: string,
  entity: string,
  entityId: number | bigint | null,
  summary = "",
) {
  run(
    "INSERT INTO audit_log (user_id, action, entity, entity_id, summary) VALUES (?, ?, ?, ?, ?)",
    userId,
    action,
    entity,
    entityId === null ? null : Number(entityId),
    summary,
  );
}

// Starts the company profile with the details already published on the
// website. Everything else (GSTIN, bank details) is entered under Settings.
function seedSettings(db: DatabaseSync) {
  db.prepare(
    `INSERT OR IGNORE INTO settings (
       id, business_name, city, state_code, email, phone, website, invoice_notes, invoice_terms
     ) VALUES (1, 'MuForge', 'Coimbatore', ?, 'muforgetech@gmail.com', '+91 97902 61693',
       'https://muforge.in', 'Thank you for your business.',
       'Please quote the invoice number when you make a payment.')`,
  ).run(DEFAULT_STATE_CODE);
}
