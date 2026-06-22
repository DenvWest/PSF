"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

type InzichtenCheckCtaProps = {
  variant?: "primary" | "secondary";
};

export default function InzichtenCheckCta({
  variant = "secondary",
}: InzichtenCheckCtaProps) {
  const className =
    variant === "secondary"
      ? "inline-flex min-h-[48px] items-center rounded-full border border-[#E7E5E4] bg-white px-6 py-3.5 text-[15px] font-semibold text-stone-900 transition hover:border-stone-400"
      : "inline-flex min-h-[48px] items-center rounded-full bg-[#0E1A14] px-6 py-3.5 text-[15px] font-semibold text-[#F7F5F0] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(14,26,20,0.5)]";

  return (
    <Link
      href="/intake"
      onClick={() => trackEvent("inzichten_check_cta", { source: "hero" })}
      className={className}
    >
      Doe de leefstijl-intake
    </Link>
  );
}
