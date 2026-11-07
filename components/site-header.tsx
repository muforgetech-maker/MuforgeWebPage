"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, Phone, Sparkles } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/sap-training", label: "SAP Training" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="MuForge home page">
          <Image
            src="/assets/muforge-logo-clean.png"
            alt=""
            width={661}
            height={420}
            priority
            className="h-16 w-auto object-contain contrast-125 brightness-110 sm:h-20"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              MuForge
            </span>
            <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--body)] sm:text-[9px]">
              TECHNOLOGY THAT MOVES
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--body)] transition hover:text-[var(--heading)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a
            href="tel:+919790261693"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--secondary-bg)] px-4 py-2 text-sm font-medium text-[var(--body)] transition hover:border-[var(--accent)] hover:text-[var(--heading)]"
          >
            <Phone size={15} />
            +91 9790261693
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--button)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--button-hover)]"
          >
            Discuss Your Project
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex size-10 items-center justify-center rounded-control border border-border text-text"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--secondary-bg)] lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--body)] transition hover:bg-[var(--background)] hover:text-[var(--heading)]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-2">
              <a
                href="https://wa.me/919790261693"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--secondary-bg)] px-4 py-2 text-sm font-medium text-[var(--body)]"
              >
                <Sparkles size={15} />
                WhatsApp Enquiry
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--button)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--button-hover)]"
              >
                Contact Us
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
