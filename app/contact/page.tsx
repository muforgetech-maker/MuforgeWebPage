import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with MuForge for custom software, website development, digital marketing, creative services, or SAP FICO and SAP MM training enquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | MuForge",
    description:
      "Get in touch with MuForge for custom software, website development, digital marketing, creative services, or SAP FICO and SAP MM training enquiries.",
    url: "/contact",
    siteName: "MuForge",
    locale: "en_IN",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <section className="py-section">
      <div className="section-shell">
        <div className="max-w-measure">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-5 text-h1 font-semibold text-text">
            Tell us what you need, and we’ll help you plan the next step.
          </h1>
          <p className="mt-5 text-lg text-text-muted">
            Reach out for custom software, website development, digital growth, creative work, or
            SAP FICO and SAP MM training.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="grid gap-4">
            <div className="rounded-card border border-border bg-surface p-6">
              <h2 className="text-h3 font-semibold text-text">Direct contact</h2>
              <ul className="mt-5 space-y-4 text-sm text-text-muted">
                <li className="flex items-start gap-3">
                  <Mail size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
                  <a
                    href="mailto:muforgetech@gmail.com"
                    className="transition-colors duration-200 hover:text-ember"
                  >
                    muforgetech@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
                  <a
                    href="tel:+919790261693"
                    className="font-mono tabular-nums transition-colors duration-200 hover:text-ember"
                  >
                    +91 97902 61693
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ember"
                  />
                  <a
                    href="https://wa.me/919790261693"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors duration-200 hover:text-ember"
                  >
                    WhatsApp chat
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
                  <span>Coimbatore, Tamil Nadu, India</span>
                </li>
              </ul>
            </div>

            <div className="rounded-card border border-border bg-surface-2 p-6">
              <h2 className="text-2xs font-semibold uppercase text-text-muted">
                Why contact MuForge?
              </h2>
              <p className="mt-3 text-sm text-text-muted">
                We help with business software, websites, digital growth, product visuals, and SAP
                training enquiries.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
