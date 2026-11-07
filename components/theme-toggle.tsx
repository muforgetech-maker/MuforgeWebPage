"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Light/dark toggle.
 *
 * No state and no effect: the icons are both rendered and CSS shows the right
 * one for the active theme, so the server and client markup always match and
 * the control is correct on first paint. With no stored preference the site
 * follows the operating system; clicking pins a choice in localStorage.
 */
export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const current =
      root.getAttribute("data-theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mf-theme", next);
    } catch {
      // Private mode or blocked storage: the choice simply will not persist.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch colour theme"
      title="Switch colour theme"
      className="inline-flex size-10 items-center justify-center rounded-control border border-border text-text-muted transition-colors duration-200 hover:border-border-strong hover:text-text"
    >
      <Moon size={17} aria-hidden="true" className="icon-when-light" />
      <Sun size={17} aria-hidden="true" className="icon-when-dark" />
    </button>
  );
}
