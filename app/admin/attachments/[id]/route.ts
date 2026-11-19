import { requireAdmin } from "@/lib/erp/auth";
import { getAttachmentRecord } from "@/lib/erp/data/attachments";
import { parseId } from "@/lib/erp/form";
import { getAttachment } from "@/lib/erp/storage";

/*
 * Serves one expense attachment to a signed-in admin.
 *
 * The bucket is private, so this route is the only way in and the session is
 * checked before anything is fetched. requireAdmin() redirects when there is
 * no session, which is what the rest of /admin does too.
 *
 * The response is locked down because these bytes were uploaded by a person
 * and are served from the ERP's own origin:
 *   - Content-Disposition: attachment, so a PDF downloads instead of opening
 *     in the browser's viewer. Images still render in an <img>, because
 *     Content-Disposition does not apply to subresource loads.
 *   - nosniff, so the browser cannot decide the bytes are something livelier
 *     than the stored type.
 *   - a sandbox CSP that permits nothing, as a last line of defence.
 */
export async function GET(_request: Request, { params }: RouteContext<"/admin/attachments/[id]">) {
  await requireAdmin();

  const id = parseId((await params).id);
  const record = id ? await getAttachmentRecord(id) : null;
  if (!record) return new Response("Not found", { status: 404 });

  const file = await getAttachment(record.storagePath);
  if (!file?.body) return new Response("The stored file could not be read", { status: 502 });

  return new Response(file.body, {
    headers: {
      "Content-Type": record.contentType,
      "Content-Disposition": `attachment; filename="${record.fileName}"`,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
