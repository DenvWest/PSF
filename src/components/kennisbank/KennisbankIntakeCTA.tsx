import Link from "next/link";
import { KB_CARD_SHELL } from "@/components/kennisbank/kennisbank-layout";
import { INTAKE_PROMO } from "@/data/homepage";

interface KennisbankIntakeCTAProps {
  className?: string;
}

export default function KennisbankIntakeCTA({ className = "" }: KennisbankIntakeCTAProps) {
  return (
    <div className={`${KB_CARD_SHELL} px-8 py-12 text-center md:px-12 md:py-14 ${className}`}>
      <p className="ps-eyebrow">Persoonlijk inzicht</p>
      <p className="mt-4 font-display text-xl font-semibold leading-snug text-stone-900 md:text-2xl">
        Wil je weten waar jij staat?
      </p>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-stone-500">
        {INTAKE_PROMO.subline}
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm text-stone-500">
        Geen medische test — wel inzicht in 6 leefstijldomeinen.
      </p>
      <Link
        href="/intake"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
      >
        Ontdek jouw herstelprofiel — gratis →
      </Link>
      <p className="mt-5 text-xs tracking-wide text-stone-400">
        Geen account nodig · Je gegevens worden anoniem verwerkt
      </p>
    </div>
  );
}
