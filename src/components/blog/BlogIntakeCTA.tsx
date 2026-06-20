import Link from "next/link";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";
import { INTAKE_CTA } from "@/lib/intake-product-copy";

interface BlogIntakeCTAProps {
  className?: string;
}

export default function BlogIntakeCTA({ className = "" }: BlogIntakeCTAProps) {
  return (
    <div
      {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}
      className={`rounded-2xl border border-stone-200/80 bg-white px-6 py-10 text-center shadow-sm shadow-stone-900/[0.03] md:px-10 md:py-12 ${className}`}
    >
      <p className="ps-eyebrow">Persoonlijk inzicht</p>
      <p className="mt-3 font-display text-xl font-semibold text-stone-900 md:text-2xl">
        {INTAKE_CTA.blogHeadline}
      </p>
      <p className="mt-2 text-sm text-stone-500">
        {INTAKE_CTA.blogSubline}
      </p>
      <Link
        href="/intake"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
      >
        {INTAKE_CTA.primaryButton}
      </Link>
    </div>
  );
}
