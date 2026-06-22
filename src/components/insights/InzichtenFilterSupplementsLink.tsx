"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

export default function InzichtenFilterSupplementsLink() {
  return (
    <Link
      href="/supplementen"
      onClick={() =>
        trackEvent("supplements_route_click", { source: "filterbar" })
      }
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-stone-500 transition hover:text-stone-700"
    >
      <span
        className="h-1.5 w-1.5 rounded-[1px] bg-stone-400 shadow-[3px_0_0_0_#A8A29E]"
        aria-hidden
      />
      Supplementen vergelijken →
    </Link>
  );
}
