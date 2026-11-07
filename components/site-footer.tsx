import Image from "next/image";
import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle } from "lucide-react";

const quickLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About MuForge" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/sap-training", label: "SAP Training" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--section-bg)] text-[var(--body)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/assets/muforge-logo-clean.png"
                alt=""
                width={661}
                height={420}
                className="h-16 w-auto object-contain contrast-125 brightness-110"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-2xl font-semibold tracking-tight text-text">
                  MuForge
                </span>
                <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--body)]">
                  TECHNOLOGY THAT MOVES
                </span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--body)]">
              MuForge helps businesses and learners move forward with practical technology, digital growth, and future-ready skills.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--body)]">
              <a href="mailto:muforgetech@gmail.com" className="inline-flex items-center gap-2 transition hover:text-[var(--button-hover)]">
                <Mail size={15} />
                muforgetech@gmail.com
              </a>
              <a href="https://wa.me/919790261693" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-[var(--button-hover)]">
                <MessageCircle size={15} />
                +91 9790261693
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--heading)]">Explore</h3>
            <ul className="space-y-3 text-sm text-[var(--body)]">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[var(--button-hover)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--heading)]">Visit</h3>
            <ul className="space-y-3 text-sm text-[var(--body)]">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span>Coimbatore, Tamil Nadu, India</span>
              </li>
              <li className="flex items-start gap-2">
                <AtSign size={15} className="mt-0.5 shrink-0" />
                <a href="https://www.instagram.com/mu.forge/" target="_blank" rel="noreferrer" className="transition hover:text-[var(--button-hover)]">
                  @mu.forge
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-6 text-sm text-[var(--body)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 MuForge. All rights reserved.</p>
          <p>Built for trust, performance, and business growth.</p>
        </div>
      </div>
    </footer>
  );
}
