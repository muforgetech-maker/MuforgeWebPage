import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/portfolio-grid";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Browse MuForge portfolio highlights across software development, website work, business automation, and digital solutions.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio | MuForge",
    description:
      "Browse MuForge portfolio highlights across software development, website work, business automation, and digital solutions.",
    url: "/portfolio",
    siteName: "MuForge",
    locale: "en_IN",
    type: "website",
  },
};

export default function PortfolioPage() {
  return (
    <section className="py-section">
      <div className="section-shell">
        <div className="max-w-measure">
          <span className="eyebrow">Portfolio</span>
          <h1 className="mt-5 text-h1 font-semibold text-text">
            Demonstration projects and practical digital outcomes.
          </h1>
          <p className="mt-5 text-lg text-text-muted">
            These examples reflect the kinds of business-focused solutions MuForge can help build.
            Each project is clearly labeled as a demonstration project until actual client work is
            available.
          </p>
        </div>

        <div className="mt-12">
          <PortfolioGrid />
        </div>
      </div>
    </section>
  );
}
