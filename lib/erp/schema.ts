import "server-only";
import type { DatabaseSync } from "node:sqlite";

/*
 * Ordered migrations. Each runs once, inside a transaction, and bumps
 * PRAGMA user_version. Never edit a migration that has shipped; append a new
 * one instead, so every existing database upgrades the same way.
 *
 * Conventions:
 *   - money: INTEGER paise
 *   - quantities: INTEGER thousandths (quantity_milli)
 *   - tax rates: INTEGER basis points (1800 = 18%)
 *   - calendar dates: TEXT YYYY-MM-DD
 *   - timestamps: TEXT ISO 8601 UTC
 */

const NOW = "(strftime('%Y-%m-%dT%H:%M:%fZ','now'))";

const migrations: string[] = [
  // 1: users, sessions, settings, clients, invoices, payments, expenses, audit
  `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT ${NOW},
    last_login_at TEXT
  );

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    expires_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE login_failures (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL,
    at_ms INTEGER NOT NULL
  );
  CREATE INDEX login_failures_key ON login_failures(key, at_ms);

  CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    business_name TEXT NOT NULL,
    legal_name TEXT NOT NULL DEFAULT '',
    address_line1 TEXT NOT NULL DEFAULT '',
    address_line2 TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state_code TEXT NOT NULL,
    pincode TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    gst_registered INTEGER NOT NULL DEFAULT 0 CHECK (gst_registered IN (0, 1)),
    gstin TEXT NOT NULL DEFAULT '',
    pan TEXT NOT NULL DEFAULT '',
    bank_account_name TEXT NOT NULL DEFAULT '',
    bank_account_number TEXT NOT NULL DEFAULT '',
    bank_ifsc TEXT NOT NULL DEFAULT '',
    bank_name TEXT NOT NULL DEFAULT '',
    bank_branch TEXT NOT NULL DEFAULT '',
    upi_id TEXT NOT NULL DEFAULT '',
    invoice_prefix TEXT NOT NULL DEFAULT 'MF',
    payment_terms_days INTEGER NOT NULL DEFAULT 15,
    default_sac TEXT NOT NULL DEFAULT '',
    default_tax_rate_bp INTEGER NOT NULL DEFAULT 1800,
    round_off INTEGER NOT NULL DEFAULT 1 CHECK (round_off IN (0, 1)),
    invoice_notes TEXT NOT NULL DEFAULT '',
    invoice_terms TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE clients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    gstin TEXT NOT NULL DEFAULT '',
    address_line1 TEXT NOT NULL DEFAULT '',
    address_line2 TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state_code TEXT NOT NULL,
    pincode TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX clients_name ON clients(name COLLATE NOCASE);

  -- GST needs consecutive invoice numbers within each financial year.
  CREATE TABLE invoice_sequences (
    financial_year TEXT PRIMARY KEY,
    last_number INTEGER NOT NULL
  );

  CREATE TABLE invoices (
    id INTEGER PRIMARY KEY,
    number TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'void')),
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    place_of_supply TEXT NOT NULL,
    tax_mode TEXT NOT NULL CHECK (tax_mode IN ('intra', 'inter', 'none')),
    subtotal_paise INTEGER NOT NULL,
    cgst_paise INTEGER NOT NULL,
    sgst_paise INTEGER NOT NULL,
    igst_paise INTEGER NOT NULL,
    round_off_paise INTEGER NOT NULL,
    total_paise INTEGER NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    terms TEXT NOT NULL DEFAULT '',
    -- JSON snapshots taken when the invoice is issued, so later edits to the
    -- client or company profile never rewrite a document already sent.
    bill_to_json TEXT,
    seller_json TEXT,
    issued_at TEXT,
    voided_at TEXT,
    void_reason TEXT NOT NULL DEFAULT '',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW},
    CHECK ((status = 'draft') = (number IS NULL))
  );
  CREATE INDEX invoices_client ON invoices(client_id);
  CREATE INDEX invoices_status_issue ON invoices(status, issue_date);

  CREATE TABLE invoice_items (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    description TEXT NOT NULL,
    sac TEXT NOT NULL DEFAULT '',
    quantity_milli INTEGER NOT NULL CHECK (quantity_milli > 0),
    unit TEXT NOT NULL DEFAULT '',
    rate_paise INTEGER NOT NULL CHECK (rate_paise >= 0),
    tax_rate_bp INTEGER NOT NULL CHECK (tax_rate_bp >= 0),
    amount_paise INTEGER NOT NULL
  );
  CREATE INDEX invoice_items_invoice ON invoice_items(invoice_id, position);

  CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    paid_on TEXT NOT NULL,
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    method TEXT NOT NULL,
    reference TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX payments_invoice ON payments(invoice_id);
  CREATE INDEX payments_paid_on ON payments(paid_on);

  CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    spent_on TEXT NOT NULL,
    category TEXT NOT NULL,
    vendor TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    gst_paise INTEGER NOT NULL DEFAULT 0 CHECK (gst_paise >= 0 AND gst_paise <= amount_paise),
    method TEXT NOT NULL,
    reference TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX expenses_spent_on ON expenses(spent_on);

  CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL DEFAULT ${NOW},
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    summary TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX audit_log_at ON audit_log(at);
  `,
];

export function migrate(db: DatabaseSync) {
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  for (let version = row.user_version; version < migrations.length; version++) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(migrations[version]);
      // PRAGMA cannot take a bound parameter; the value is our own integer.
      db.exec(`PRAGMA user_version = ${version + 1}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}
