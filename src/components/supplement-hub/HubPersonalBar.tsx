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
  "rounded-2xl border border-[#5A8F6A]/25 bg-gradient-to-br from-[#EAF6EE] to-[#F8FBF9] px-5 py-5";
const EYEBROW =
  "font-display text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]";
const CTA_KNOP =
  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ps-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md";

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
        <p className={EYEBROW}>Gratis Leefstijlcheck · 3 min</p>
        <p className="mt-1.5 font-display text-lg font-bold leading-snug text-stone-900 sm:text-base sm:font-semibold">
          Welke van deze {productCount} passen bij jou?
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600 sm:hidden">
          Doe de gratis check (±3 min) en zie wat bij jou past.
        </p>
        <p className="mt-1.5 hidden text-sm leading-relaxed text-stone-600 sm:block">
          Doe de gratis Leefstijlcheck (±3 min). Daarna markeren we hier de
          producten die bij jouw antwoorden passen — en kun je er direct op
          filteren.
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
          Doe de Leefstijlcheck →
        </Link>
        <IntakeCtaMicro className="mt-2 hidden text-xs text-stone-500 sm:block" />
      </aside>
    );
  }

  if (personalization.state === "needs_nutrition") {
    return (
      <aside
        className={`${GROEN_KADER} ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <p className={EYEBROW}>Voedingscheck · 3 min</p>
        <p className="mt-1.5 font-display text-lg font-bold leading-snug text-stone-900 sm:text-base sm:font-semibold">
          Nog één stap: de voedingscheck
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600 sm:hidden">
          Nog de voedingscheck (±3 min), dan markeren we hier wat bij jou past.
        </p>
        <p className="mt-1.5 hidden text-sm leading-relaxed text-stone-600 sm:block">
          Je Leefstijlcheck staat genoteerd. We markeren pas producten als we
          weten wat er op je bord tekortschiet — eerst voeding, dan gericht
          vergelijken (±3 min).
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
        <p className="mt-2 text-xs text-stone-500">
          Geen diagnose · geen account verplicht
        </p>
      </aside>
    );
  }

  if (personalization.state === "geen_prioriteit" || matchNamen.length === 0) {
    return (
      <aside
        className={`rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5 ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <p className="font-display text-base font-semibold leading-snug text-stone-900">
          Je basis zit goed
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
          Uit je voedingscheck volgt geen supplement-prioriteit. Vergelijk
          gerust verder, maar geen van deze producten is voor jou urgent —
          algemene oriëntatie, geen persoonlijk medisch advies.
        </p>
        <Link
          href="/intake"
          className="mt-3 inline-block text-sm text-stone-500 transition-colors hover:text-ps-green"
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
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-sm transition-all ${
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
      <p className="mt-2.5 px-1 text-xs leading-relaxed text-stone-500">
        Past bij jou: {namenReeks(matchNamen)}. Op basis van je Leefstijlcheck
        en voedingscheck — algemene oriëntatie, geen persoonlijk medisch advies.
      </p>
      <Link
        href="/intake"
        className="mt-2 inline-block px-1 text-xs text-stone-400 transition-colors hover:text-ps-green"
      >
        Leefstijlcheck opnieuw doen →
      </Link>
    </aside>
  );
}
