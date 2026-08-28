"use client";

import Link from "next/link";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";

type HubSluitCtaProps = {
  state: HubPersonalization["state"];
  productCount: number;
};

const KADER =
  "rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-6 py-7 md:px-8 md:py-8";
const KNOP =
  "mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md md:text-base";

/**
 * Het afsluitblok onder de catalogus. De hero is weg, dus dit is de plek waar
 * iemand die de hele lijst heeft doorgenomen alsnog de check kan doen — of,
 * als die al staat, de rekenmethode kan nalezen.
 */
export default function HubSluitCta({
  state,
  productCount,
}: HubSluitCtaProps) {
  if (state === "no_intake" || state === "needs_nutrition") {
    const naarVoeding = state === "needs_nutrition";
    return (
      <section className={KADER} aria-label="Doe de check">
        <h2 className="max-w-2xl font-display text-xl font-bold leading-snug text-stone-900 md:text-2xl">
          {naarVoeding
            ? "Nog één stap voordat we hier markeren wat bij jou past"
            : `Welke van deze ${productCount} passen bij jou?`}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
          {naarVoeding
            ? "Je Leefstijlcheck staat genoteerd. Met de voedingscheck weten we wat er op je bord tekortschiet — pas dan markeren we producten (±3 min)."
            : "De meeste klachten beginnen niet bij een tekort. De gratis Leefstijlcheck laat zien wat er speelt en of een supplement daarbij zinvol is (±3 min)."}
        </p>
        <Link
          href={naarVoeding ? "/intake/voeding?from=supplementen" : "/intake"}
          onClick={() =>
            trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
              locatie: naarVoeding
                ? "supplementen_afsluiter_voeding"
                : "supplementen_afsluiter",
            })
          }
          className={KNOP}
        >
          {naarVoeding ? "Doe de voedingscheck →" : "Doe de Leefstijlcheck →"}
        </Link>
        {naarVoeding ? (
          <p className="mt-2 text-xs text-stone-500">
            Geen diagnose · geen account verplicht
          </p>
        ) : (
          <IntakeCtaMicro className="mt-2 text-xs text-stone-500" />
        )}
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-stone-200 bg-white px-6 py-7 md:px-8 md:py-8"
      aria-label="Over de methode"
    >
      <h2 className="max-w-2xl font-display text-xl font-bold leading-snug text-stone-900 md:text-2xl">
        Wil je weten hoe deze cijfers tot stand komen?
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
        De hele rekenwijze staat open: de vijf onderdelen en hun gewicht, de
        onderzoeksdosis per stof, de opneembaarheid per vorm — en wat dit model
        nog níét meet.
      </p>
      <Link
        href="/ps-score"
        onClick={() =>
          trackEvent(GA4_EVENTS.SUPPLEMENTEN_METHODIEK_GEOPEND, {
            bron: "supplementen_afsluiter",
          })
        }
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-ps-green px-6 py-3 text-sm font-semibold text-ps-green transition-all hover:bg-ps-green hover:text-white"
      >
        Lees de hele methode →
      </Link>
    </section>
  );
}
