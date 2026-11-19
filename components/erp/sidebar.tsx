"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Banknote,
  ChartColumn,
  FileText,
  LayoutDashboard,
  Menu,
  Receipt,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/challans", label: "Challans", icon: Truck },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: Banknote },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/reports", label: "Reports", icon: ChartColumn },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 rounded-control">
      <Image
        src="/assets/muforge-logo-clean.png"
        alt=""
        width={661}
        height={420}
        className="logo-mark h-8 w-auto"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-text">MuForge</span>
        <span className="mt-0.5 text-2xs font-semibold uppercase text-ember">ERP</span>
      </span>
    </Link>
  );
}

/**
 * ERP navigation: a fixed column on large screens, a drawer below that.
 * `account` is the signed-in user panel, streamed in from the server.
 */
export function ErpSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isCurrent = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav aria-label="ERP" className="flex flex-col gap-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const current = isCurrent(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={current ? "page" : undefined}
            className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              current
                ? "bg-ember-wash text-ember"
                : "text-text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Small screens: top bar with a drawer */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md print:hidden lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="erp-drawer"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center rounded-control border border-border text-text transition-colors duration-200 hover:border-border-strong"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>
      {open && (
        <div id="erp-drawer" className="border-b border-border bg-surface px-4 py-4 print:hidden lg:hidden">
          {nav}
          <div className="mt-4 border-t border-border pt-4">{account}</div>
        </div>
      )}

      {/* Large screens: fixed column */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface print:hidden lg:flex">
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Brand />
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">{nav}</div>
        <div className="border-t border-border px-4 py-4">{account}</div>
      </aside>
    </>
  );
}
