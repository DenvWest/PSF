import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/public-site-url";

export function canonicalMetadata(path: string): Pick<Metadata, "alternates"> {
  return { alternates: { canonical: absoluteUrl(path) } };
}
