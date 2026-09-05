"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type KennisbankTier1FooterCtaProps = {
  termSlug: string;
  pillarId: PillarId;
};

export default function KennisbankTier1FooterCta({
  termSlug,
  pillarId,
}: KennisbankTier1FooterCtaProps) {
  const trackedView = useRef(false);

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    clarityTag("inzichten_layer", "kennisbank_tier1_footer");
  }, [termSlug]);

  return (
    <section
      className="mx-auto mt-20 max-w-[min(38rem,100%)] border border-stone-200/90 bg-white px-7 py-10 text-center md:mt-24 md:px-10 md:py-12"
      aria-label="Leefstijlcheck"
    >
      <p className="mx-auto max-w-[42ch] text-[0.9375rem] leading-[1.75] text-stone-600 md:text-base">
        Dit was de algemene uitleg — voor iedereen hetzelfde. Waar jíj staat op slaap, stress en
        energie zie je in vijf minuten.
      </p>
      <Link
        href="/intake"
        onClick={() =>
          trackEvent("focus_area_click", {
            destination: "kennisbank_tier1_intake",
            pillar: pillarId,
          })
        }
        className="group mt-8 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-ps-green px-7 text-[0.875rem] font-semibold text-white shadow-[0_2px_8px_rgba(90,143,106,0.28)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:bg-ps-green-hover hover:shadow-[0_6px_18px_rgba(90,143,106,0.36)] active:translate-y-0"
      >
        Doe de gratis Leefstijlcheck
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </section>
  );
}
