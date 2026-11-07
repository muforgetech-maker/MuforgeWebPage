import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Runs before first paint so a pinned theme never flashes. With no stored
// choice no attribute is set, which leaves the OS preference in charge and
// lets the page follow it live.
const themeScript = `try{var t=localStorage.getItem("mf-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://muforge.in"),
  title: {
    default: "MuForge | Technology That Moves Your Business Forward",
    template: "%s | MuForge",
  },
  description:
    "MuForge delivers custom software, website development, digital marketing, and SAP training solutions for businesses and learners in Coimbatore, Tamil Nadu.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MuForge",
    description:
      "Technology that moves your business forward with practical digital solutions, website development, and SAP training.",
    url: "/",
    siteName: "MuForge",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MuForge",
    description: "Custom software, website development, and SAP training for business growth.",
  },
  // Icons come from the app/icon.svg file convention. The previous override
  // pointed at an SVG that embedded a PNG with <image href>, which browsers
  // refuse to load in an icon, so the favicon rendered as a blank square.
};

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-text">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
      </body>
    </html>
  );
}
