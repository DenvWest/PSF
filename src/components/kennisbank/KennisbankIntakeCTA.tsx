import Link from "next/link";
import { KB_CARD_SHELL } from "@/components/kennisbank/kennisbank-layout";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { INTAKE_CTA, INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";

interface KennisbankIntakeCTAProps {
  className?: string;
}

export default function KennisbankIntakeCTA({ className = "" }: KennisbankIntakeCTAProps) {
  return (
    <div className={`${KB_CARD_SHELL} px-8 py-12 text-center md:px-12 md:py-14 ${className}`}>
      <p className="ps-eyebrow">Persoonlijk inzicht</p>
      <p className="mt-4 font-display text-xl font-semibold leading-snug text-stone-900 md:text-2xl">
        {INTAKE_CTA.kennisbankHeadline}
      </p>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-stone-500">
        {INTAKE_DELIVERABLE.subline}
      </p>
      <IntakeCtaMicro className="mx-auto mt-4 max-w-md text-sm text-stone-500" />
      <Link
        href="/intake"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
      >
        {INTAKE_CTA.discoverOverview}
      </Link>
    </div>
  );
}
