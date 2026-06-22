"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

export default function InzichtenCheckCta() {
  return (
    <Link
      href="/intake"
      onClick={() => trackEvent("inzichten_check_cta", { source: "hero" })}
      className="inline-flex min-h-[44px] items-center rounded-full bg-ps-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green/90"
    >
      Doe de gratis Leefstijlcheck →
    </Link>
  );
}
