import "server-only";
import { databaseUrl } from "@/lib/erp/db";

/*
 * Supabase Storage, over its REST API with plain fetch -- the same approach
 * the enquiry route takes with Resend, so there is no SDK to keep current.
 *
 * Files are never served from Supabase directly. The bucket is private and
 * every download goes through an authenticated route in the ERP, so a
 * receipt cannot be reached by anyone who merely guesses its URL.
 */

export const ATTACHMENT_BUCKET = "expense-attachments";

/** 10 MB: a photographed bill or a scanned PDF, with room to spare. */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/*
 * Deliberately no SVG. It is an image to a person but a script host to a
 * browser, and these files are served from the ERP's own origin.
 */
export const ALLOWED_ATTACHMENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function isImageType(contentType: string) {
  return contentType.startsWith("image/");
}

/**
 * The project's API origin.
 *
 * SUPABASE_URL wins. Without it the project reference is taken from the
 * pooler username in DATABASE_URL, which is always `postgres.<ref>`, so the
 * common setup needs only the one connection string.
 */
export function supabaseUrl() {
  const configured = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const user = new URL(databaseUrl()).username;
  const ref = user.includes(".") ? user.split(".").pop() : "";
  if (!ref) {
    throw new Error(
      "Could not work out the Supabase project URL. Set SUPABASE_URL (for example " +
        "https://yourproject.supabase.co) in the environment.",
    );
  }
  return `https://${ref}.supabase.co`;
}

function serviceKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Copy the service role key from the Supabase " +
        "dashboard (Project settings > API) into .env.local and the Vercel project. " +
        "It is server-only: never prefix it with NEXT_PUBLIC_.",
    );
  }
  return key;
}

function authHeaders() {
  const key = serviceKey();
  return { authorization: `Bearer ${key}`, apikey: key };
}

/** Creates the private bucket if it is not there yet. Safe to call twice. */
export async function ensureAttachmentBucket() {
  const existing = await fetch(`${supabaseUrl()}/storage/v1/bucket/${ATTACHMENT_BUCKET}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (existing.ok) return "already exists";
  if (existing.status !== 404) {
    throw new Error(`Could not read the storage bucket: ${existing.status} ${await existing.text()}`);
  }

  const created = await fetch(`${supabaseUrl()}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({
      id: ATTACHMENT_BUCKET,
      name: ATTACHMENT_BUCKET,
      public: false,
      file_size_limit: MAX_ATTACHMENT_BYTES,
      allowed_mime_types: Object.keys(ALLOWED_ATTACHMENT_TYPES),
    }),
  });
  if (!created.ok) {
    throw new Error(`Could not create the storage bucket: ${created.status} ${await created.text()}`);
  }
  return "created";
}

export async function putAttachment(path: string, body: ArrayBuffer, contentType: string) {
  const response = await fetch(
    `${supabaseUrl()}/storage/v1/object/${ATTACHMENT_BUCKET}/${encodeURI(path)}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "content-type": contentType,
        // Never silently replace a file: every path carries a fresh id.
        "x-upsert": "false",
      },
      body,
    },
  );
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
  }
}

export async function getAttachment(path: string) {
  const response = await fetch(
    `${supabaseUrl()}/storage/v1/object/${ATTACHMENT_BUCKET}/${encodeURI(path)}`,
    { headers: authHeaders(), cache: "no-store" },
  );
  if (!response.ok) return null;
  return response;
}

/**
 * Removes a stored file.
 *
 * Returns rather than throws: the database row is what the ERP shows, so a
 * storage object left behind is untidy but harmless, and should not stop
 * someone deleting an attachment they no longer want listed.
 */
export async function removeAttachment(path: string) {
  try {
    const response = await fetch(
      `${supabaseUrl()}/storage/v1/object/${ATTACHMENT_BUCKET}/${encodeURI(path)}`,
      { method: "DELETE", headers: authHeaders() },
    );
    if (!response.ok) console.error("[erp] could not delete stored file", path, response.status);
  } catch (error) {
    console.error("[erp] could not delete stored file", path, error);
  }
}
