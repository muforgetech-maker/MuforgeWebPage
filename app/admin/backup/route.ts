import { requireAdmin } from "@/lib/erp/auth";
import { TABLES, all, audit, transaction } from "@/lib/erp/db";
import { todayIST } from "@/lib/erp/dates";

/*
 * Downloads a snapshot of the whole ERP as JSON: one array of rows per table,
 * in dependency order, so it can be read by anything and loaded back in that
 * order if it is ever needed.
 *
 * Every table is read inside a single transaction, which on Postgres gives
 * all of the SELECTs one consistent view of the data. Without that, an
 * invoice saved midway through the export could appear with its items
 * missing, or its payments without the invoice.
 */
export async function GET() {
  const admin = await requireAdmin();

  const snapshot = await transaction(async () => {
    const tables: Record<string, unknown[]> = {};
    for (const table of TABLES) {
      // The table names are this module's own constants, never user input.
      tables[table] = await all(`SELECT * FROM ${table}`);
    }
    return tables;
  });

  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), tables: snapshot },
    null,
    2,
  );

  await audit(admin.id, "download", "backup", null, `${body.length} bytes`);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="muforge-erp-backup-${todayIST()}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
