"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { idleState, type ActionState } from "@/lib/erp/form";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * useActionState without React's automatic form reset. A plain form action
 * clears every field once it settles, which wipes what someone typed when
 * the server sends back a validation error. Submitting through onSubmit
 * keeps the values; `action` stays on the form so it still posts before
 * hydration.
 *
 * `resetOnSuccess` clears the form after a successful save, for forms that
 * stay on the page (add a user, change a password).
 */
export function useActionForm(action: Action, options: { resetOnSuccess?: boolean } = {}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  const { resetOnSuccess = false } = options;

  useEffect(() => {
    if (resetOnSuccess && state.status === "success") formRef.current?.reset();
  }, [state, resetOnSuccess]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(formData));
  }

  return {
    state,
    pending,
    formProps: { ref: formRef, action: formAction, onSubmit, noValidate: true },
    errorFor: (name: string) => state.fieldErrors?.[name],
  };
}
