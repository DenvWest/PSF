"use client";

import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

const DUMP_URL = "/api/bronnen/open-food-facts";

export default function DumpDownloadLink() {
  return (
    <a
      href={DUMP_URL}
      onClick={() => trackEvent(GA4_EVENTS.BRONNEN_DUMP_DOWNLOAD, { bron: "open_food_facts" })}
      className="inline-flex min-h-[44px] items-center rounded-lg bg-ps-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
    >
      Download de database (zip)
    </a>
  );
}
