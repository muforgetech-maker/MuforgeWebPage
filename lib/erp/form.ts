import { isValidISODate } from "@/lib/erp/dates";
import { MAX_PAISE, parseRupeesToPaise } from "@/lib/erp/money";

/*
 * Server-side form validation for Server Actions. Each reader returns a
 * clean value and records a message against the field name when the input
 * is wrong, so the form can show every problem at once.
 */

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const idleState: ActionState = { status: "idle" };

export function errorState(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: "error", message, fieldErrors };
}

export function successState(message: string): ActionState {
  return { status: "success", message };
}

type TextOptions = {
  label: string;
  required?: boolean;
  max?: number;
  min?: number;
  pattern?: RegExp;
  patternMessage?: string;
  uppercase?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class FormReader {
  readonly errors: Record<string, string> = {};

  constructor(private readonly formData: FormData) {}

  get ok() {
    return Object.keys(this.errors).length === 0;
  }

  fail(name: string, message: string) {
    this.errors[name] ??= message;
  }

  raw(name: string) {
    const value = this.formData.get(name);
    return typeof value === "string" ? value : "";
  }

  text(name: string, options: TextOptions) {
    let value = this.raw(name).trim();
    if (options.uppercase) value = value.toUpperCase();
    const max = options.max ?? 200;
    if (!value) {
      if (options.required) this.fail(name, `Enter ${options.label.toLowerCase()}.`);
      return "";
    }
    if (value.length > max) {
      this.fail(name, `${options.label} must be ${max} characters or fewer.`);
    } else if (options.min && value.length < options.min) {
      this.fail(name, `${options.label} must be at least ${options.min} characters.`);
    } else if (options.pattern && !options.pattern.test(value)) {
      this.fail(name, options.patternMessage ?? `Check the ${options.label.toLowerCase()}.`);
    }
    return value;
  }

  email(name: string, options: { label: string; required?: boolean }) {
    const value = this.text(name, { ...options, max: 254 }).toLowerCase();
    if (value && !EMAIL_PATTERN.test(value)) this.fail(name, "Enter a valid email address.");
    return value;
  }

  /** A rupee amount, returned in paise. */
  money(name: string, options: { label: string; required?: boolean; allowZero?: boolean }) {
    const value = this.raw(name).trim();
    if (!value) {
      if (options.required) this.fail(name, `Enter ${options.label.toLowerCase()}.`);
      return 0;
    }
    const paise = parseRupeesToPaise(value);
    if (paise === null) {
      this.fail(name, `${options.label} must be an amount like 1500 or 1500.50.`);
      return 0;
    }
    if (paise === 0 && !options.allowZero) {
      this.fail(name, `${options.label} must be more than zero.`);
    }
    if (paise > MAX_PAISE) this.fail(name, `${options.label} is too large.`);
    return paise;
  }

  date(name: string, options: { label: string }) {
    const value = this.raw(name).trim();
    if (!isValidISODate(value)) {
      this.fail(name, `Enter a valid ${options.label.toLowerCase()}.`);
      return "";
    }
    return value;
  }

  integer(name: string, options: { label: string; min: number; max: number }) {
    const value = this.raw(name).trim();
    const number = Number(value);
    if (!/^-?\d+$/.test(value) || number < options.min || number > options.max) {
      this.fail(name, `${options.label} must be a whole number from ${options.min} to ${options.max}.`);
      return options.min;
    }
    return number;
  }

  oneOf<const T extends readonly string[]>(
    name: string,
    values: T,
    options: { label: string },
  ): T[number] {
    const value = this.raw(name).trim();
    const match = values.find((candidate) => candidate === value);
    if (match === undefined) {
      this.fail(name, `Choose ${options.label.toLowerCase()}.`);
      return values[0];
    }
    return match;
  }

  checkbox(name: string) {
    return this.formData.get(name) === "on";
  }

  id(name: string) {
    const value = Number(this.raw(name));
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
}

/** A positive integer route or form id, or null. */
export function parseId(value: unknown) {
  const number = typeof value === "string" ? Number(value) : NaN;
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}
