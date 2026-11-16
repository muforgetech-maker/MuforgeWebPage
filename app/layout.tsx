import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
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

// The document shell only. The public site's header, footer and structured
// data live in app/(site)/layout.tsx; the ERP brings its own chrome under
// app/admin, so neither leaks into the other.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-text">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
