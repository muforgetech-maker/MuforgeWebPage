import { ContactForm } from "@/components/contact-form";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with MuForge for custom software, website development, digital marketing, creative services, or SAP FICO and SAP MM training enquiries.",
};

export default function ContactPage() {
  return (
    <div className="section-shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">Contact</span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Tell us what you need, and we’ll help you plan the next step.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Reach out for custom software, website development, digital growth, creative work, or SAP FICO and SAP MM training.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(18,63,70,0.04)]">
            <h2 className="text-2xl font-semibold text-slate-950">Direct contact</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-slate-900" />
                <a href="mailto:muforgetech@gmail.com" className="transition hover:text-[var(--button-hover)]">
                  muforgetech@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-slate-900" />
                <a href="tel:+919790261693" className="transition hover:text-[var(--button-hover)]">
                  +91 9790261693
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle size={18} className="mt-0.5 text-slate-900" />
                <a href="https://wa.me/919790261693" target="_blank" rel="noreferrer" className="transition hover:text-[var(--button-hover)]">
                  WhatsApp chat
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-slate-900" />
                <span>Coimbatore, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-[var(--section-bg)] p-6 shadow-[0_20px_60px_rgba(18,63,70,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-800">Why contact MuForge?</p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              We help with business software, websites, digital growth, product visuals, and SAP training enquiries.
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
