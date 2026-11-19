"use client";

import Image from "next/image";
import { useRef } from "react";
import { Download, FileText, LoaderCircle, Paperclip, Trash2 } from "lucide-react";
import { removeAttachmentAction, uploadAttachment } from "@/app/admin/_actions/expenses";
import { ActionButton } from "@/components/erp/action-button";
import { FormMessage } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";
import type { Attachment } from "@/lib/erp/data/attachments";
import { formatTimestamp } from "@/lib/erp/dates";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentPanel({
  expenseId,
  attachments,
}: {
  expenseId: number;
  attachments: Attachment[];
}) {
  const { state, pending, formProps, errorFor } = useActionForm(
    uploadAttachment.bind(null, expenseId),
    { resetOnSuccess: true },
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="erp-card mt-6 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-text">
        <Paperclip size={17} aria-hidden="true" className="text-ember" />
        Receipts
      </h2>
      <p className="erp-hint mt-1">
        Keep the bill with the expense. JPG, PNG, WEBP or PDF, up to 10 MB each.
      </p>

      {attachments.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {attachments.map((attachment) => {
            const href = `/admin/attachments/${attachment.id}`;
            const isImage = attachment.contentType.startsWith("image/");
            return (
              <li key={attachment.id} className="flex items-center gap-3 py-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface-2">
                  {isImage ? (
                    // Unoptimized on purpose: /_next/image would fetch this
                    // without the session cookie and be turned away.
                    <Image
                      src={href}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <FileText size={18} aria-hidden="true" className="text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a href={href} download className="erp-link break-all text-sm">
                    {attachment.fileName}
                  </a>
                  <p className="text-xs text-text-muted">
                    {formatSize(attachment.sizeBytes)} · {formatTimestamp(attachment.uploadedAt)}
                    {attachment.uploadedByName && ` · ${attachment.uploadedByName}`}
                  </p>
                </div>
                <a
                  href={href}
                  download
                  aria-label={`Download ${attachment.fileName}`}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text"
                >
                  <Download size={16} aria-hidden="true" />
                </a>
                <ActionButton
                  action={removeAttachmentAction.bind(null, attachment.id)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors duration-200 hover:bg-danger-wash hover:text-danger"
                  confirmMessage={`Remove ${attachment.fileName}? The file is deleted for good.`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span className="sr-only">Remove {attachment.fileName}</span>
                </ActionButton>
              </li>
            );
          })}
        </ul>
      )}

      <form {...formProps} className="mt-4 grid gap-3">
        <FormMessage state={state} />
        <div>
          <label htmlFor="attachment-file" className="erp-label">
            Add a receipt
          </label>
          <input
            ref={inputRef}
            id="attachment-file"
            type="file"
            name="file"
            accept={ACCEPT}
            aria-invalid={errorFor("file") ? true : undefined}
            aria-describedby={errorFor("file") ? "attachment-file-error" : undefined}
            className="erp-control file:mr-3 file:rounded-control file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text"
          />
          {errorFor("file") && (
            <p id="attachment-file-error" className="erp-error">
              {errorFor("file")}
            </p>
          )}
        </div>
        <div>
          <button type="submit" className="erp-button-secondary" disabled={pending}>
            {pending ? (
              <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Paperclip size={16} aria-hidden="true" />
            )}
            {pending ? "Uploading…" : "Attach"}
          </button>
        </div>
      </form>
    </section>
  );
}
