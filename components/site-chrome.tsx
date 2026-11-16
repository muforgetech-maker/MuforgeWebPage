import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";

// Structured data for a local service business. Only facts already published
// on the site: no ratings, no review counts, no invented numbers.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "MuForge",
  url: "https://muforge.in",
  description:
    "Custom software, website development, digital marketing, product photography and SAP FI and MM training.",
  email: "muforgetech@gmail.com",
  telephone: "+91-9790261693",
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Coimbatore",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  sameAs: ["https://www.instagram.com/mu.forge/"],
};

/** Header, footer, skip link and structured data for every public page. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-ember"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppFloat />
      </div>
    </>
  );
}
