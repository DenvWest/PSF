"use client";

import { useEffect } from "react";
import { clarityTag } from "@/lib/clarity";
import { surfaceStyles } from "@/lib/dashboard-surface";
import {
  macroBronregel,
  type DomeinPaneel as DomeinPaneelModel,
} from "@/lib/domein-paneel";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

/**
 * Het domeinpaneel: je cijfer met de bron eronder, als één regel.
 *
 * Zie `src/lib/domein-paneel.ts` voor waarom de macro-zone alleen verwijst in
 * plaats van een tweede score te tonen.
 *
 * **Waarom de reeksgrafiek hier weg is (3 sep).** De meso-zone toonde een
 * levenslijn over je meetmomenten, met "Sinds je eerste check" erboven. Twee
 * bezwaren, en het tweede is het zwaarste. Ten eerste is het lelijk op de
 * plek waar het stond: een brede lege baan bovenaan het werkvlak, vóór de
 * inhoud waar je voor kwam. Ten tweede stond dezelfde reeks al twee keer op
 * dit scherm — P5 (Meten & timing) draagt hem als `MetenTijdLaag`, waar hij
 * hoort, en Voortgang-home draagt de volle versie. Drie plekken voor één
 * reeks is geen nadruk maar ruis.
 *
 * Wat blijft is het anker: het cijfer, waar het vandaan komt, en de weg terug
 * naar het overzicht. Dat is de enige zin die op elk domeinscherm nodig is.
 */

export default function DomeinPaneel({
  paneel,
  domain,
  domainLabel,
  surface,
  onGoMacro,
}: {
  paneel: DomeinPaneelModel;
  domain: PillarId;
  domainLabel: string;
  surface: string;
  /** Terug naar Voortgang-home, waar de score thuishoort. */
  onGoMacro?: () => void;
}) {
  const s = surfaceStyles("dashboard");
  const { meso, macro } = paneel;

  useEffect(() => {
    trackEvent("domein_paneel_view", {
      surface,
      domain,
      meso: meso.staat,
      has_score: macro.score != null,
    });
    clarityTag("domein_paneel", `${domain}_${meso.staat}`);
  }, [surface, domain, meso.staat, macro.score]);

  return (
    <section
      aria-label={`Waar je staat op ${domainLabel.toLowerCase()}`}
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-3 ${s.rij}`}
    >
      {macro.score != null ? (
        <span
          className={`text-[22px] font-semibold leading-none ${s.tekst}`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {macro.score}
        </span>
      ) : null}
      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${s.kop}`}>
        Je {domainLabel.toLowerCase()}-cijfer
      </span>
      <p className={`m-0 min-w-0 flex-1 text-[11.5px] leading-relaxed ${s.zacht} text-pretty`}>
        {macroBronregel(macro)}
      </p>
      {onGoMacro ? (
        <button
          type="button"
          onClick={() => {
            trackEvent("domein_paneel_macro_click", { surface, domain });
            clarityTag("domein_paneel_macro", domain);
            onGoMacro();
          }}
          className={`shrink-0 cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-semibold ${s.knop}`}
        >
          Overzicht ›
        </button>
      ) : null}
    </section>
  );
}
