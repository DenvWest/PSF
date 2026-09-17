import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/public-site-url";

/**
 * Open Graph + Twitter-metadata voor pagina's zonder eigen cover-afbeelding
 * (hubs, juridische pagina's, intake-stappen). Voor pagina's mét cover-art
 * (blog, kennisbank, vergelijkingen) blijft het eigen, expliciete
 * `openGraph`-blok met `images` de norm.
 */
export function basicOpenGraph(params: {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  const { path, title, description, type = "website" } = params;
  const url = absoluteUrl(path);

  return {
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: "PerfectSupplement",
      locale: "nl_NL",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
