"use client";

import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";
import { INTAKE_CTA } from "@/lib/intake-product-copy";

export type BlogIntakeCtaLocatie =
  | "blog_mid"
  | "blog_closing"
  | "blog_hub"
  | "blog_categorie";

type BlogIntakeCTAProps = {
  placement: "invite" | "closing";
  locatie: BlogIntakeCtaLocatie;
  className?: string;
};

export default function BlogIntakeCTA({
  placement,
  locatie,
  className = "",
}: BlogIntakeCTAProps) {
  const isClosing = placement === "closing";
  const headline = isClosing
    ? INTAKE_CTA.blogClosingHeadline
    : INTAKE_CTA.blogHeadline;
  const subline = isClosing
    ? INTAKE_CTA.blogClosingSubline
    : INTAKE_CTA.blogSubline;

  return (
    <aside
      {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}
      aria-label="Leefstijlcheck"
      className={`rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-6 py-7 md:px-8 md:py-8 ${className}`}
    >
      <p className="max-w-2xl font-display text-xl font-bold leading-snug text-stone-900 md:text-2xl">
        {headline}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
        {subline}
      </p>
      <IntakeCtaLink
        locatie={locatie}
        className="mt-5 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md md:text-base"
      >
        {INTAKE_CTA.gratisButton}
        <span aria-hidden="true">→</span>
      </IntakeCtaLink>
    </aside>
  );
}
