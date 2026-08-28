"use client";

import Link from "next/link";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";

type HubPersonalBarProps = {
  personalization: HubPersonalization;
  productCount: number;
  /** Namen van de categorieen die ook echt in de catalogus staan. */
  matchNamen: string[];
  /** Aantal producten achter de knop. */
  persoonlijkAantal: number;
  /** Staat het persoonlijke filter aan? */
  actief: boolean;
  onToggle: () => void;
  className?: string;
};

function namenReeks(namen: string[]): string {
  if (namen.length <= 1) return namen[0] ?? "";
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
}

const GROEN_KADER =
  "rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-3 py-4 sm:px-5 sm:py-5";
const CTA_KNOP =
  "mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ps-green px-3 py-2.5 text-xs font-semibold leading-snug text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md sm:px-5 sm:py-3 sm:text-sm";

/** Kop en lopende tekst moeten ook in de smalle rail van 136px leesbaar zijn. */
const KADER_KOP =
  "font-display text-[0.85rem] font-semibold leading-snug text-stone-900 sm:text-base";
const KADER_TEKST =
  "mt-1.5 text-[0.72rem] leading-relaxed text-stone-600 sm:text-sm";

/**
 * Het persoonlijke blok bovenaan de zijbalk. In de eindstaat is dit een eigen
 * knop die de catalogus terugbrengt tot wat bij deze bezoeker past; daarvoor is
 * het de poort ernaartoe (check, dan voedingscheck).
 */
export default function HubPersonalBar({
  personalization,
  productCount,
  matchNamen,
  persoonlijkAantal,
  actief,
  onToggle,
  className = "",
}: HubPersonalBarProps) {
  if (personalization.state === "no_intake") {
    return (
      <aside
        className={`${GROEN_KADER} ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <p className={KADER_KOP}>
          Welke van deze {productCount} passen bij jou?
        </p>
        <p className={KADER_TEKST}>
          Doe de gratis Leefstijlcheck (±3 min). Daarna markeren we hier wat bij
          jouw antwoorden past.
        </p>
        <Link
          href="/intake"
          onClick={() =>
            trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
              locatie: "supplementen_catalogus",
            })
          }
          className={CTA_KNOP}
        >
          Doe de gratis check →
        </Link>
        <IntakeCtaMicro className="mt-2 text-[0.68rem] leading-snug text-stone-500 sm:text-xs" />
      </aside>
    );
  }

  if (personalization.state === "needs_nutrition") {
    return (
      <aside
        className={`${GROEN_KADER} ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <p className={KADER_KOP}>
          Nog één stap: de voedingscheck
        </p>
        <p className={KADER_TEKST}>
          Je check staat genoteerd. Met de voedingscheck weten we wat er op je
          bord tekortschiet (±3 min).
        </p>
        <Link
          href="/intake/voeding?from=supplementen"
          onClick={() =>
            trackEvent("hub_voedingscheck_cta_click", {
              surface: "supplementen_catalogus",
            })
          }
          className={CTA_KNOP}
        >
          Doe de voedingscheck →
        </Link>
        <p className="mt-2 text-[0.68rem] leading-snug text-stone-500 sm:text-xs">
          Geen diagnose · geen account verplicht
        </p>
      </aside>
    );
  }

  if (personalization.state === "geen_prioriteit" || matchNamen.length === 0) {
    return (
      <aside
        className={`rounded-2xl border border-stone-200 bg-stone-50 px-3 py-4 sm:px-5 sm:py-5 ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <p className={KADER_KOP}>
          Je basis zit goed
        </p>
        <p className={KADER_TEKST}>
          Uit je voedingscheck volgt geen supplement-prioriteit. Vergelijk
          gerust verder — algemene oriëntatie, geen medisch advies.
        </p>
        <Link
          href="/intake"
          className="mt-3 inline-block text-xs text-stone-500 transition-colors hover:text-ps-green sm:text-sm"
        >
          Leefstijlcheck opnieuw doen →
        </Link>
      </aside>
    );
  }

  return (
    <aside className={className} aria-label="Persoonlijke selectie">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={actief}
        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-[0.8rem] transition-all sm:px-5 sm:py-3.5 sm:text-sm ${
          actief
            ? "bg-ps-green font-semibold text-white shadow-sm"
            : "border border-[#5A8F6A]/40 bg-[#F0FAF3] font-semibold text-[#3D6B4F] hover:border-ps-green"
        }`}
      >
        <span>Past bij jou · {persoonlijkAantal}</span>
        <span
          aria-hidden
          className={actief ? "text-white/70" : "text-[#3D6B4F]/50"}
        >
          {actief ? "✓" : "→"}
        </span>
      </button>
      <p className="mt-2.5 px-1 text-[0.7rem] leading-relaxed text-stone-500 sm:text-xs">
        Op basis van je Leefstijlcheck en voedingscheck:{" "}
        {`${namenReeks(matchNamen)}.`} Algemene oriëntatie, geen persoonlijk
        medisch advies.
      </p>
      <Link
        href="/intake"
        className="mt-2 inline-block px-1 text-[0.7rem] text-stone-400 transition-colors hover:text-ps-green sm:text-xs"
      >
        Leefstijlcheck opnieuw doen →
      </Link>
    </aside>
  );
}
