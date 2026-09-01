import type { MetadataRoute } from "next";

const BASE = "https://perfectsupplement.nl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/rapport"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
