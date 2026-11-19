"use client";

import { Ban, LoaderCircle } from "lucide-react";
import { cancelChallanAction } from "@/app/admin/_actions/challans";
import { FormMessage, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";

export function CancelChallanForm({ challanId, number }: { challanId: number; number: string }) {
  const { state, pending, formProps, errorFor } = useActionForm(
    cancelChallanAction.bind(null, challanId),
  );

  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-medium text-danger">
        <span className="inline-flex items-center gap-2">
          <Ban size={15} aria-hidden="true" />
          Cancel this challan…
        </span>
      </summary>
      <form
        {...formProps}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Cancel ${number}? It stays in the records with its number, marked cancelled.`,
            )
          ) {
            event.preventDefault();
            return;
          }
          formProps.onSubmit(event);
        }}
        className="mt-3 grid gap-3"
      >
        <FormMessage state={state} />
        <TextField
          label="Reason"
          name="reason"
          placeholder="Goods returned, raised twice…"
          maxLength={300}
          error={errorFor("reason")}
        />
        <button type="submit" className="erp-button-danger" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          Cancel challan
        </button>
      </form>
    </details>
  );
}
