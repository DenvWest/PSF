"use client";

import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type PrePurchaseLadderCtaProps = {
  href: string;
  label: string;
  /** "open" = door naar de vergelijking, "closed" = eerst leefstijl. */
  gate: "open" | "closed";
  category: string;
  variant: "primary" | "secondary";
};

const VARIANT_CLASS: Record<PrePurchaseLadderCtaProps["variant"], string> = {
  primary:
    "bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-900/50",
  secondary:
    "border border-stone-300 bg-white text-stone-900 hover:border-stone-900 focus-visible:ring-stone-400/50",
};

export function PrePurchaseLadderCta({
  href,
  label,
  gate,
  category,
  variant,
}: PrePurchaseLadderCtaProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        trackEvent("comparison_ladder_cta_click", { gate, supplement: category });
        clarityTag("comparison_ladder_gate", gate);
      }}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 ${VARIANT_CLASS[variant]}`}
    >
      {label}
    </Link>
  );
}
