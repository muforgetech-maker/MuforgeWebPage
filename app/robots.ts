import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The ERP is private; its pages also send noindex headers.
      disallow: "/admin",
    },
    sitemap: "https://muforge.in/sitemap.xml",
    host: "https://muforge.in",
  };
}
