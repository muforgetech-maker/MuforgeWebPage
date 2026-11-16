import "server-only";
import { all, audit, one, run, transaction } from "@/lib/erp/db";

export type ClientInput = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateCode: string;
  pincode: string;
  notes: string;
};

export type Client = ClientInput & {
  id: number;
  archived: boolean;
  createdAt: string;
};

export type ClientListRow = {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  stateCode: string;
  gstin: string;
  archived: boolean;
  invoiceCount: number;
  invoicedPaise: number;
  outstandingPaise: number;
};

const CLIENT_COLUMNS = `
  id, name, contact_person AS contactPerson, email, phone, gstin,
  address_line1 AS addressLine1, address_line2 AS addressLine2, city,
  state_code AS stateCode, pincode, notes, archived, created_at AS createdAt`;

type ClientRow = Omit<Client, "archived"> & { archived: number };

const toClient = (row: ClientRow): Client => ({ ...row, archived: row.archived === 1 });

export function getClient(id: number): Client | null {
  const row = one<ClientRow>(`SELECT ${CLIENT_COLUMNS} FROM clients WHERE id = ?`, id);
  return row ? toClient(row) : null;
}

/** Clients with what they have been billed and still owe (issued invoices). */
export function listClients(options: { query?: string; includeArchived?: boolean } = {}) {
  const like = `%${(options.query ?? "").replace(/[\\%_]/g, "\\$&")}%`;
  const rows = all<Omit<ClientListRow, "archived"> & { archived: number }>(
    `SELECT c.id, c.name, c.contact_person AS contactPerson, c.email, c.phone, c.city,
            c.state_code AS stateCode, c.gstin, c.archived,
            COUNT(i.id) AS invoiceCount,
            COALESCE(SUM(i.total_paise), 0) AS invoicedPaise,
            COALESCE(SUM(i.total_paise - COALESCE(p.paid, 0)), 0) AS outstandingPaise
       FROM clients c
       LEFT JOIN invoices i ON i.client_id = c.id AND i.status = 'issued'
       LEFT JOIN (SELECT invoice_id, SUM(amount_paise) AS paid FROM payments GROUP BY invoice_id) p
              ON p.invoice_id = i.id
      WHERE (@includeArchived = 1 OR c.archived = 0)
        AND (c.name LIKE @like ESCAPE '\\' OR c.contact_person LIKE @like ESCAPE '\\'
             OR c.email LIKE @like ESCAPE '\\' OR c.gstin LIKE @like ESCAPE '\\')
      GROUP BY c.id
      ORDER BY c.archived, c.name COLLATE NOCASE`,
    { includeArchived: options.includeArchived ? 1 : 0, like },
  );
  return rows.map((row) => ({ ...row, archived: row.archived === 1 }));
}

/** Active clients for the invoice editor's picker. */
export function clientOptions() {
  return all<{ id: number; name: string; stateCode: string; gstin: string }>(
    `SELECT id, name, state_code AS stateCode, gstin FROM clients
      WHERE archived = 0 ORDER BY name COLLATE NOCASE`,
  );
}

export function createClient(userId: number, input: ClientInput) {
  return transaction(() => {
    const result = run(
      `INSERT INTO clients (name, contact_person, email, phone, gstin, address_line1,
         address_line2, city, state_code, pincode, notes)
       VALUES (@name, @contactPerson, @email, @phone, @gstin, @addressLine1,
         @addressLine2, @city, @stateCode, @pincode, @notes)`,
      input,
    );
    const id = Number(result.lastInsertRowid);
    audit(userId, "create", "client", id, input.name);
    return id;
  });
}

export function updateClient(userId: number, id: number, input: ClientInput) {
  transaction(() => {
    run(
      `UPDATE clients SET name = @name, contact_person = @contactPerson, email = @email,
         phone = @phone, gstin = @gstin, address_line1 = @addressLine1,
         address_line2 = @addressLine2, city = @city, state_code = @stateCode,
         pincode = @pincode, notes = @notes,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = @id`,
      { ...input, id },
    );
    audit(userId, "update", "client", id, input.name);
  });
}

export function setClientArchived(userId: number, id: number, archived: boolean) {
  transaction(() => {
    run(
      "UPDATE clients SET archived = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?",
      archived ? 1 : 0,
      id,
    );
    audit(userId, archived ? "archive" : "restore", "client", id);
  });
}

/** Deletes a client with no invoices. Returns false if any invoice (even a draft) exists. */
export function deleteClient(userId: number, id: number) {
  return transaction(() => {
    const used = one<{ n: number }>("SELECT COUNT(*) AS n FROM invoices WHERE client_id = ?", id);
    if ((used?.n ?? 0) > 0) return false;
    const client = getClient(id);
    run("DELETE FROM clients WHERE id = ?", id);
    audit(userId, "delete", "client", id, client?.name ?? "");
    return true;
  });
}
