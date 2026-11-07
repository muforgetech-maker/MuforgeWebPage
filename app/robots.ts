import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://muforge.in/sitemap.xml",
    host: "https://muforge.in",
  };
}
