import type { Metadata } from "next";
import Link from "next/link";
import { Database, Download } from "lucide-react";
import { TableCard } from "@/components/erp/ui";
import { requireAdmin } from "@/lib/erp/auth";
import { recentActivity } from "@/lib/erp/data/reports";
import { databaseLabel } from "@/lib/erp/db";
import { formatTimestamp } from "@/lib/erp/dates";

// Renders per request behind the login; see the ERP layout.
export const instant = false;

export const metadata: Metadata = { title: "Backup and activity" };

const entityLinks: Record<string, string> = {
  invoice: "/admin/invoices/",
  client: "/admin/clients/",
  expense: "/admin/expenses/",
};

export default async function DataPage() {
  await requireAdmin();
  const activity = await recentActivity(150);

  return (
    <div className="grid gap-6">
      <section className="erp-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-2 text-base font-semibold text-text">
              <Database size={17} aria-hidden="true" className="text-ember" />
              Back up your data
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Your data lives in a managed Postgres database, which Supabase backs up on its own
              schedule. Download a copy at least weekly as well, and keep it somewhere else, such
              as Google Drive. The file is JSON: one list of rows per table.
            </p>
            <p className="mt-3 break-all font-mono text-xs text-text-muted">{databaseLabel()}</p>
          </div>
          <a href="/admin/backup" className="erp-button" download>
            <Download size={16} aria-hidden="true" />
            Download backup
          </a>
        </div>
      </section>

      <TableCard title="Recent activity">
        <table className="erp-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>What</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((row) => {
              const href = row.entityId && entityLinks[row.entity] ? `${entityLinks[row.entity]}${row.entityId}` : null;
              const label = `${row.action.replace("-", " ")} ${row.entity}`;
              return (
                <tr key={row.id}>
                  <td className="whitespace-nowrap text-text-muted">{formatTimestamp(row.at)}</td>
                  <td className="whitespace-nowrap">{row.userName ?? "—"}</td>
                  <td>
                    <span className="capitalize">{label}</span>
                    {row.summary && <span className="text-text-muted"> · {row.summary}</span>}
                    {href && row.action !== "delete" && (
                      <Link href={href} className="erp-link ml-2 text-xs">
                        Open
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
