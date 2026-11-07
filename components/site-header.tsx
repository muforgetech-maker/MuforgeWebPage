"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/sap-training", label: "SAP Training" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="section-shell flex items-center justify-between gap-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-control"
          aria-label="MuForge home page"
        >
          <Image
            src="/assets/muforge-logo-clean.png"
            alt=""
            width={661}
            height={420}
            priority
            className="logo-mark h-9 w-auto sm:h-10"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-text">
              MuForge
            </span>
            <span className="mt-1 text-2xs font-medium text-text-muted">
              Technology that moves
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const current = isCurrent(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`rounded-control px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  current ? "text-ember" : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <a
            href="tel:+919790261693"
            className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:border-border-strong hover:text-text"
          >
            <Phone size={15} aria-hidden="true" />
            <span className="font-mono tabular-nums">+91 97902 61693</span>
          </a>
          <Link href="/contact" className="primary-button px-4 py-2">
            Discuss Your Project
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-control border border-border text-text transition-colors duration-200 hover:border-border-strong"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav
            id="mobile-nav"
            className="section-shell flex flex-col gap-1 py-4"
            aria-label="Primary"
          >
            {navItems.map((item) => {
              const current = isCurrent(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={current ? "page" : undefined}
                  className={`rounded-control px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    current ? "bg-ember-wash text-ember" : "text-text-muted hover:bg-surface-2 hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <a
                href="tel:+919790261693"
                className="secondary-button w-full"
              >
                <Phone size={15} aria-hidden="true" />
                <span className="font-mono tabular-nums">+91 97902 61693</span>
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="primary-button w-full"
              >
                Discuss Your Project
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
