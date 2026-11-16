import { requireAdmin } from "@/lib/erp/auth";
import { audit, getDb } from "@/lib/erp/db";
import { todayIST } from "@/lib/erp/dates";

/*
 * Downloads a consistent snapshot of the whole ERP database. serialize()
 * copies the live database in one step, so the file is never half-written
 * even if someone is saving an invoice at the same moment. Open it with any
 * SQLite tool, or restore by replacing the database file while stopped.
 */
export async function GET() {
  const admin = await requireAdmin();
  const snapshot = getDb().serialize();
  audit(admin.id, "download", "backup", null, `${snapshot.byteLength} bytes`);

  return new Response(new Uint8Array(snapshot), {
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename="muforge-erp-backup-${todayIST()}.sqlite"`,
      "Cache-Control": "private, no-store",
    },
  });
}
