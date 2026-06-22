"use client";

import Link from "next/link";
import InzichtenCheckCta from "@/components/insights/InzichtenCheckCta";
import { trackEvent } from "@/lib/ga4";

export default function InzichtenHubActions() {
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <Link
        href="/inzichten?alles=1"
        onClick={() =>
          trackEvent("inzichten_hub_cta_click", { destination: "feed" })
        }
        className="inline-flex min-h-[48px] items-center rounded-full bg-[#0E1A14] px-6 py-3.5 text-[15px] font-semibold text-[#F7F5F0] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(14,26,20,0.5)]"
      >
        Verken de kennisbank
      </Link>
      <InzichtenCheckCta variant="secondary" />
    </div>
  );
}
