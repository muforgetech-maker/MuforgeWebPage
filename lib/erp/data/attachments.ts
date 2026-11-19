import "server-only";
import { randomUUID } from "node:crypto";
import { all, audit, insert, one, run, transaction } from "@/lib/erp/db";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  putAttachment,
  removeAttachment,
} from "@/lib/erp/storage";

/*
 * Receipts and bills kept against an expense.
 *
 * The file goes to Supabase Storage and only a pointer to it is recorded
 * here. The stored path carries a fresh id rather than the name someone
 * uploaded, so nothing a person types can steer where the file lands.
 */

export class AttachmentError extends Error {}

export type Attachment = {
  id: number;
  expenseId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByName: string | null;
};

export async function listAttachments(expenseId: number): Promise<Attachment[]> {
  return await all<Attachment>(
    `SELECT a.id, a.expense_id AS "expenseId", a.file_name AS "fileName",
            a.content_type AS "contentType", a.size_bytes AS "sizeBytes",
            a.uploaded_at AS "uploadedAt", u.name AS "uploadedByName"
       FROM expense_attachments a
       LEFT JOIN users u ON u.id = a.uploaded_by
      WHERE a.expense_id = ?
      ORDER BY a.id`,
    expenseId,
  );
}

export async function getAttachmentRecord(id: number) {
  return (
    (await one<{ id: number; expenseId: number; storagePath: string; fileName: string; contentType: string }>(
      `SELECT id, expense_id AS "expenseId", storage_path AS "storagePath",
              file_name AS "fileName", content_type AS "contentType"
         FROM expense_attachments WHERE id = ?`,
      id,
    )) ?? null
  );
}

/** Keeps a display name that is safe to put in a Content-Disposition header. */
function cleanFileName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const safe = base.replace(/[\u0000-\u001f\u007f"]/g, "").trim();
  return (safe || "file").slice(0, 120);
}

export async function addAttachment(
  userId: number,
  expenseId: number,
  file: { name: string; type: string; size: number; bytes: ArrayBuffer },
) {
  const extension = ALLOWED_ATTACHMENT_TYPES[file.type];
  if (!extension) {
    throw new AttachmentError("Attach a JPG, PNG, WEBP or PDF.");
  }
  if (file.size <= 0) throw new AttachmentError("That file is empty.");
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new AttachmentError(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_ATTACHMENT_BYTES / 1024 / 1024} MB.`,
    );
  }

  const expense = await one<{ id: number }>("SELECT id FROM expenses WHERE id = ?", expenseId);
  if (!expense) throw new AttachmentError("That expense no longer exists.");

  const storagePath = `expenses/${expenseId}/${randomUUID()}.${extension}`;

  // Upload first: a stored file with no row is invisible and harmless, while
  // a row with no file would show a broken download.
  await putAttachment(storagePath, file.bytes, file.type);

  try {
    return await transaction(async () => {
      const id = await insert(
        `INSERT INTO expense_attachments (expense_id, storage_path, file_name, content_type,
           size_bytes, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        expenseId,
        storagePath,
        cleanFileName(file.name),
        file.type,
        file.size,
        userId,
      );
      await audit(userId, "attach", "expense", expenseId, cleanFileName(file.name));
      return id;
    });
  } catch (error) {
    await removeAttachment(storagePath);
    throw error;
  }
}

export async function deleteAttachment(userId: number, id: number) {
  const record = await getAttachmentRecord(id);
  if (!record) throw new AttachmentError("That attachment no longer exists.");

  await transaction(async () => {
    await run("DELETE FROM expense_attachments WHERE id = ?", id);
    await audit(userId, "detach", "expense", record.expenseId, record.fileName);
  });

  // Only once the row is gone, so a failure here cannot leave a listed
  // attachment whose file has already been removed.
  await removeAttachment(record.storagePath);
  return record.expenseId;
}
