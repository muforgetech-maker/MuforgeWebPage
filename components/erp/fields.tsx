import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import type { ActionState } from "@/lib/erp/form";

/*
 * Labelled form controls for the ERP. Each one wires its label, hint and
 * error to the control by id, so screen readers announce the error with the
 * field and the first invalid field can take focus.
 */

type FieldShellProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

function FieldShell({ id, label, hint, error, className, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="erp-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="erp-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="erp-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type BaseProps = { label: string; name: string; hint?: ReactNode; error?: string; wrapperClassName?: string };

export function TextField({
  label,
  name,
  hint,
  error,
  wrapperClassName,
  id = `f-${name}`,
  className = "",
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`erp-control ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  hint,
  error,
  wrapperClassName,
  id = `f-${name}`,
  className = "",
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`erp-control ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  error,
  wrapperClassName,
  id = `f-${name}`,
  className = "",
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <textarea
        id={id}
        name={name}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`erp-control ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  defaultChecked,
  onChange,
}: {
  label: string;
  name: string;
  hint?: ReactNode;
  defaultChecked?: boolean;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
}) {
  const id = `f-${name}`;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={onChange}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1 size-4 shrink-0 accent-[var(--ember)]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Form-level result banner. */
export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const isError = state.status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-control px-3 py-2.5 text-sm ${
        isError ? "bg-danger-wash text-danger" : "bg-steel-wash text-steel"
      }`}
    >
      {isError ? (
        <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      ) : (
        <CircleCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

/** A titled group of fields inside a form. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="erp-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
