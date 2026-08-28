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
  className?: string;
};

function namenReeks(namen: string[]): string {
  if (namen.length <= 1) return namen[0] ?? "";
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
}

const GROEN_KADER =
  "rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-6 py-5";
const CTA_KNOP =
  "inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-ps-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md";

export default function HubPersonalBar({
  personalization,
  productCount,
  matchNamen,
  className = "",
}: HubPersonalBarProps) {
  if (personalization.state === "no_intake") {
    return (
      <aside
        className={`${GROEN_KADER} md:flex md:items-center md:justify-between md:gap-8 ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-stone-900">
            Welke van deze {productCount} passen bij jou?
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            Doe de gratis Leefstijlcheck (±3 min). Daarna markeren we hier de
            producten die bij jouw antwoorden passen — en kun je er direct op
            filteren.
          </p>
          <IntakeCtaMicro className="mt-2 text-xs text-stone-500" />
        </div>
        <Link
          href="/intake"
          onClick={() =>
            trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
              locatie: "supplementen_catalogus",
            })
          }
          className={`mt-4 md:mt-0 ${CTA_KNOP}`}
        >
          Doe de Leefstijlcheck →
        </Link>
      </aside>
    );
  }

  if (personalization.state === "needs_nutrition") {
    return (
      <aside
        className={`${GROEN_KADER} md:flex md:items-center md:justify-between md:gap-8 ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-stone-900">
            Nog één stap: de voedingscheck
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            Je Leefstijlcheck staat genoteerd. We markeren pas producten als we
            weten wat er op je bord tekortschiet — eerst voeding, dan gericht
            vergelijken (±3 min).
          </p>
          <p className="mt-2 text-xs text-stone-500">
            Geen diagnose · geen account verplicht
          </p>
        </div>
        <Link
          href="/intake/voeding?from=supplementen"
          onClick={() =>
            trackEvent("hub_voedingscheck_cta_click", {
              surface: "supplementen_catalogus",
            })
          }
          className={`mt-4 md:mt-0 ${CTA_KNOP}`}
        >
          Doe de voedingscheck →
        </Link>
      </aside>
    );
  }

  if (personalization.state === "geen_prioriteit" || matchNamen.length === 0) {
    return (
      <aside
        className={`rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5 ${className}`}
        aria-label="Persoonlijke selectie"
      >
        <h3 className="font-display text-base font-semibold text-stone-900">
          Je basis zit goed
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
          Uit je voedingscheck volgt geen supplement-prioriteit. Vergelijk
          hieronder gerust, maar geen van deze producten is voor jou urgent —
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
    <aside className={`${GROEN_KADER} ${className}`} aria-label="Persoonlijke selectie">
      <h3 className="font-display text-base font-semibold text-stone-900">
        Past bij jou: {namenReeks(matchNamen)}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
        Op basis van je Leefstijlcheck en voedingscheck. Elk product in deze
        categorieën staat hieronder gemarkeerd met de reden — algemene
        oriëntatie, geen persoonlijk medisch advies.
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
