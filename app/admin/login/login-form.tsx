"use client";

import { LoaderCircle, Lock } from "lucide-react";
import { login } from "@/app/admin/_actions/auth";
import { FormMessage, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, formProps } = useActionForm(login);

  return (
    <form {...formProps} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        autoFocus
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <button type="submit" className="erp-button mt-2 w-full py-2.5" disabled={pending}>
        {pending ? (
          <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />
        ) : (
          <Lock size={16} aria-hidden="true" />
        )}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
