"use client";

import { useRef, useState } from "react";
import {
  enquiryBudgets,
  enquiryServices,
  preferredContactMethods,
  type EnquiryData,
} from "@/lib/enquiry";

type FormState = Omit<EnquiryData, "website">;
type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budget: "",
  description: "",
  preferredContact: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^\+[1-9]\d{6,14}$/.test(phone.replace(/[\s().-]/g, ""));
}

function responseMessage(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }
  return "We could not send your enquiry. Please try again or email muforgetech@gmail.com.";
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (form.name.trim().length < 2) nextErrors.name = "Please enter your full name.";
    if (!form.email.trim()) nextErrors.email = "Please enter your email address.";
    else if (!isValidEmail(form.email)) nextErrors.email = "Please enter a valid email address.";
    if (!form.phone.trim()) nextErrors.phone = "Please include your country code, such as +91.";
    else if (!isValidPhone(form.phone)) nextErrors.phone = "Enter a valid phone number with its country code.";
    if (!enquiryServices.some((service) => service === form.service)) {
      nextErrors.service = "Please select a service.";
    }
    if (form.budget && !enquiryBudgets.some((budget) => budget === form.budget)) {
      nextErrors.budget = "Please select a valid budget range.";
    }
    if (form.preferredContact && !preferredContactMethods.some((method) => method === form.preferredContact)) {
      nextErrors.preferredContact = "Please select a valid contact method.";
    }
    if (form.description.trim().length < 10) {
      nextErrors.description = "Please describe your project in at least 10 characters.";
    }
    if (form.description.length > 5000) {
      nextErrors.description = "Please keep your project description under 5,000 characters.";
    }
    if (form.company.length > 120) nextErrors.company = "Company name must be 120 characters or fewer.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    idempotencyKeyRef.current = null;
    if (status === "success" || status === "error") {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!validate()) {
      setStatus("error");
      setStatusMessage("Please fix the highlighted fields before sending your enquiry.");
      return;
    }

    submittingRef.current = true;
    setStatus("loading");
    setStatusMessage("");

    try {
      idempotencyKeyRef.current ??= crypto.randomUUID();
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({ ...form, website: honeypot }),
      });

      const result: unknown = await response.json();
      if (!response.ok) {
        setStatus("error");
        setStatusMessage(responseMessage(result));
        return;
      }

      setStatus("success");
      setStatusMessage(responseMessage(result));
      setForm(initialState);
      setHoneypot("");
      setErrors({});
      idempotencyKeyRef.current = null;
    } catch {
      setStatus("error");
      setStatusMessage(
        "We could not reach the enquiry service. Your details are still here; please try again or email muforgetech@gmail.com.",
      );
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(18,63,70,0.06)] sm:p-7"
    >
      <div
        aria-hidden="true"
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="company-website">Leave this field empty</label>
        <input
          id="company-website"
          name="website"
          type="text"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-800">
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <p id="name-error" className="mt-2 text-sm text-[var(--heading)]">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">
            Email address <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && <p id="email-error" className="mt-2 text-sm text-[var(--heading)]">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-800">
            Phone number with country code <span aria-hidden="true">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={30}
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            placeholder="+91 9790261693"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && <p id="phone-error" className="mt-2 text-sm text-[var(--heading)]">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-800">
            Company name <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={120}
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            placeholder="Your company"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "company-error" : undefined}
          />
          {errors.company && <p id="company-error" className="mt-2 text-sm text-[var(--heading)]">{errors.company}</p>}
        </div>

        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-medium text-slate-800">
            Service interested in <span aria-hidden="true">*</span>
          </label>
          <select
            id="service"
            name="service"
            required
            value={form.service}
            onChange={(event) => handleChange("service", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? "service-error" : undefined}
          >
            <option value="">Select a service</option>
            {enquiryServices.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          {errors.service && <p id="service-error" className="mt-2 text-sm text-[var(--heading)]">{errors.service}</p>}
        </div>

        <div>
          <label htmlFor="budget" className="mb-2 block text-sm font-medium text-slate-800">
            Project budget <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select
            id="budget"
            name="budget"
            value={form.budget}
            onChange={(event) => handleChange("budget", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? "budget-error" : undefined}
          >
            <option value="">Choose a budget range</option>
            {enquiryBudgets.map((budget) => (
              <option key={budget} value={budget}>{budget}</option>
            ))}
          </select>
          {errors.budget && <p id="budget-error" className="mt-2 text-sm text-[var(--heading)]">{errors.budget}</p>}
        </div>

        <div>
          <label htmlFor="preferredContact" className="mb-2 block text-sm font-medium text-slate-800">
            Preferred contact method <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select
            id="preferredContact"
            name="preferredContact"
            value={form.preferredContact}
            onChange={(event) => handleChange("preferredContact", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
            aria-invalid={Boolean(errors.preferredContact)}
            aria-describedby={errors.preferredContact ? "preferredContact-error" : undefined}
          >
            <option value="">No preference</option>
            {preferredContactMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          {errors.preferredContact && <p id="preferredContact-error" className="mt-2 text-sm text-[var(--heading)]">{errors.preferredContact}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-800">
          Project description <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--button)] focus:bg-white"
          placeholder="Tell us your goals, timeline, and what you need help with."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && <p id="description-error" className="mt-2 text-sm text-[var(--heading)]">{errors.description}</p>}
      </div>

      {statusMessage && (
        <p
          role={status === "error" ? "alert" : "status"}
          aria-live={status === "error" ? "assertive" : "polite"}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status === "success"
              ? "border-[var(--border)] bg-[var(--section-bg)] text-[var(--heading)]"
              : "border-[var(--border)] bg-[var(--secondary-bg)] text-[var(--heading)]"
          }`}
        >
          {statusMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--button)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--button-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Sending enquiry…" : "Submit enquiry"}
      </button>
      <p className="text-xs leading-5 text-slate-500">
        Your details are used only to respond to your enquiry.
      </p>
    </form>
  );
}
