import Link from "next/link";
import { KB_CARD_SHELL } from "@/components/kennisbank/kennisbank-layout";

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
        12 vragen, 3 minuten — direct een persoonlijk herstelplan.
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm text-stone-500">
        Geen medische test — wel inzicht in 6 leefstijldomeinen.
      </p>
      <Link
        href="/intake"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3C7A56] px-8 py-3 text-base font-medium text-white transition hover:bg-[#2E5F43]"
      >
        Ontdek jouw herstelprofiel — gratis →
      </Link>
      <p className="mt-5 text-xs tracking-wide text-stone-400">
        Geen account nodig · Je gegevens worden anoniem verwerkt
      </p>
    </div>
  );
}
