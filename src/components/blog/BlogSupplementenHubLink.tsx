"use client";

import Link from "next/link";
import type { BlogCornerstoneLink } from "@/types/blog";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

interface BlogSupplementenHubLinkProps {
  link: BlogCornerstoneLink;
  artikelSlug: string;
}

export default function BlogSupplementenHubLink({
  link,
  artikelSlug,
}: BlogSupplementenHubLinkProps) {
  return (
    <Link
      href={link.href}
      onClick={() => {
        trackEvent(GA4_EVENTS.ARTIKEL_SUPPLEMENTEN_HUB_CLICK, {
          artikel: artikelSlug,
          doel: link.href,
        });
      }}
      className="group inline-flex w-full flex-1 items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3.5 text-[0.875rem] font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50/75 hover:text-stone-900 sm:min-h-0 sm:max-w-fit"
    >
      <span>{link.label}</span>
      <span className="text-stone-400 transition group-hover:text-stone-500" aria-hidden>
        →
      </span>
    </Link>
  );
}
