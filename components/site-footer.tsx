import Image from "next/image";
import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle } from "lucide-react";

const quickLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About MuForge" },
  { href: "/our-story", label: "Our Story" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/sap-training", label: "SAP Training" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="section-shell py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/assets/muforge-logo-clean.png"
                alt=""
                width={661}
                height={420}
                className="logo-mark h-9 w-auto"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold tracking-tight text-text">
                  MuForge
                </span>
                <span className="mt-1 text-2xs font-medium text-text-muted">
                  Technology that moves
                </span>
              </span>
            </div>
            <p className="max-w-measure text-sm text-text-muted">
              MuForge helps businesses and learners move forward with practical technology,
              digital growth, and future-ready skills.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <a
                href="mailto:muforgetech@gmail.com"
                className="inline-flex items-center gap-2 py-1 text-text-muted transition-colors duration-200 hover:text-ember"
              >
                <Mail size={15} aria-hidden="true" />
                muforgetech@gmail.com
              </a>
              <a
                href="https://wa.me/919790261693"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-1 text-text-muted transition-colors duration-200 hover:text-ember"
              >
                <MessageCircle size={15} aria-hidden="true" />
                <span className="font-mono tabular-nums">+91 97902 61693</span>
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xs font-semibold uppercase text-text-muted">Explore</h2>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-text-muted transition-colors duration-200 hover:text-ember"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-2xs font-semibold uppercase text-text-muted">Visit</h2>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-1 shrink-0" aria-hidden="true" />
                <span>Coimbatore, Tamil Nadu, India</span>
              </li>
              <li className="flex items-start gap-2">
                <AtSign size={15} className="mt-1 shrink-0" aria-hidden="true" />
                <a
                  href="https://www.instagram.com/mu.forge/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block py-1 transition-colors duration-200 hover:text-ember"
                >
                  @mu.forge
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* No year: the page is prerendered, so a rendered year would freeze
              at build time and go stale, as the hard-coded 2025 did. */}
          <p>© MuForge. All rights reserved.</p>
          <p>Built in Coimbatore for businesses and learners.</p>
        </div>
      </div>
    </footer>
  );
}
