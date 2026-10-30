import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://muforge.netlify.app"),
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
    url: "https://muforge.netlify.app",
    siteName: "MuForge",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MuForge",
    description: "Custom software, website development, and SAP training for business growth.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--body)] antialiased">
        <div className="min-h-screen">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
        </div>
      </body>
    </html>
  );
}
