"use client";

import { useActionState, type ReactNode } from "react";
import { idleState, type ActionState } from "@/lib/erp/form";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * A one-button form for a single Server Action (issue, void, delete,
 * archive). Optionally asks for confirmation first, and shows the server's
 * refusal inline, for example "delete the payments first".
 */
export function ActionButton({
  action,
  children,
  pendingLabel,
  confirmMessage,
  className = "erp-button-secondary",
  fields,
}: {
  action: Action;
  children: ReactNode;
  pendingLabel?: string;
  confirmMessage?: string;
  className?: string;
  fields?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="contents"
    >
      {fields &&
        Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <button type="submit" className={className} disabled={pending}>
        {pending && pendingLabel ? pendingLabel : children}
      </button>
      {state.status === "error" && (
        <p role="alert" className="erp-error basis-full">
          {state.message}
        </p>
      )}
    </form>
  );
}
