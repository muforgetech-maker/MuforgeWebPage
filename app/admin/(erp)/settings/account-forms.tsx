"use client";

import { LoaderCircle } from "lucide-react";
import { addUser, changeMyPassword, resetUserPassword } from "@/app/admin/_actions/settings";
import { FormMessage, TextField } from "@/components/erp/fields";
import { useActionForm } from "@/components/erp/use-action-form";

export function AddUserForm({ minLength }: { minLength: number }) {
  const { state, pending, formProps, errorFor } = useActionForm(addUser, { resetOnSuccess: true });
  return (
    <form {...formProps} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <TextField label="Name" name="name" autoComplete="off" error={errorFor("name")} />
      <TextField label="Email" name="email" type="email" autoComplete="off" error={errorFor("email")} />
      <TextField
        label="Temporary password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={errorFor("password")}
        hint={`At least ${minLength} characters. They can change it under My password.`}
        wrapperClassName="sm:col-span-2"
      />
      <div>
        <button type="submit" className="erp-button" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          Add user
        </button>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ userId, name }: { userId: number; name: string }) {
  const { state, pending, formProps, errorFor } = useActionForm(resetUserPassword.bind(null, userId), {
    resetOnSuccess: true,
  });
  return (
    <details>
      <summary className="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
        Reset password
      </summary>
      <form {...formProps} className="mt-3 grid gap-3">
        <FormMessage state={state} />
        <TextField
          id={`reset-${userId}`}
          label={`New password for ${name}`}
          name="password"
          type="password"
          autoComplete="new-password"
          error={errorFor("password")}
        />
        <div>
          <button type="submit" className="erp-button-secondary" disabled={pending}>
            {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
            Set password
          </button>
        </div>
      </form>
    </details>
  );
}

export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const { state, pending, formProps, errorFor } = useActionForm(changeMyPassword, { resetOnSuccess: true });
  return (
    <form {...formProps} className="grid max-w-md gap-4">
      <FormMessage state={state} />
      <TextField
        label="Current password"
        name="current"
        type="password"
        autoComplete="current-password"
        error={errorFor("current")}
      />
      <TextField
        label="New password"
        name="next"
        type="password"
        autoComplete="new-password"
        error={errorFor("next")}
        hint={`At least ${minLength} characters. A short phrase is easier to remember than symbols.`}
      />
      <TextField
        label="Repeat new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        error={errorFor("confirm")}
      />
      <div>
        <button type="submit" className="erp-button" disabled={pending}>
          {pending && <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />}
          Change password
        </button>
      </div>
    </form>
  );
}
