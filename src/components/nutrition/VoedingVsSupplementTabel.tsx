"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { surfaceStyles } from "@/lib/dashboard-surface";
import { trackEvent } from "@/lib/ga4";
import { ROUTE_STATUS_COLOR, ROUTE_STATUS_LABEL } from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

/**
 * P6 Aanvullen & vergelijken — je bord naast het potje, per stof.
 *
 * **De twee kolommen zijn de hele boodschap.** Links wat je eten voor deze stof
 * doet, rechts of een supplement in beeld komt. Naast elkaar is dat één blik;
 * onder elkaar (zoals de losse routerijen deden) moet je onthouden wat links
 * stond terwijl je rechts leest, en dan wint het potje op volgorde in plaats
 * van op inhoud.
 *
 * **De volgorde binnen een rij is niet omkeerbaar.** Eerst het bord, dan pas de
 * deur. Dat is geen opmaak maar het productbesluit: een supplementlink
 * verschijnt alleen als de voedingsroute aantoonbaar dicht zit, nooit bij een
 * gat dat je met eten kunt dichten. `supplementDoorOpen` draagt dat oordeel —
 * deze component velt het niet zelf, hij toont het.
 *
 * **Op smalle schermen stapelt de rij.** Twee kolommen in 375px geeft twee
 * kolommen van ~170px, waarin elke regel in drie stukken breekt — dan is het
 * geen vergelijking meer maar twee smalle stroken tekst. Onder 30rem staat het
 * bord dus bovenop en het potje eronder, met de kolomnaam als label per helft,
 * zodat de volgorde (eerst bord, dan deur) blijft kloppen. De kolomkop staat
 * daar niet: die zou boven maar één van de twee helften staan.
 *
 * **De kop van het scherm zit in de tabel** (5 sep). Boven deze tabel stonden
 * titel, bronregel, cijferbalk en een werkvlak-kop — aanlopen naar het ene
 * beeld waar de laag om draait. De tabel draagt nu zijn eigen terugweg en naam.
 * De voetregel die de kolommen herhaalde ("eerst je bord, dan het potje") is
 * weg: de kolommen zéggen dat al.
 */

function Kruimelpad({ onBack }: { onBack: () => void }) {
  return (
    <nav
      aria-label="Kruimelpad"
      className="flex items-center gap-0.5 text-[11.5px] font-semibold"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 font-[inherit] text-[#9FB0A6] transition hover:text-[#F1EFE8]"
      >
        <Icons.ChevronLeft s={13} sw={2} style={{ color: "currentColor" }} />
        Overzicht
      </button>
      <span aria-hidden className="px-1 text-[#5F6C64]">
        ·
      </span>
      <span className="text-[#7E8C82]">Voeding</span>
    </nav>
  );
}

function TabelKop({ onBack }: { onBack?: () => void }) {
  return (
    <div className="border-b border-white/10 px-3.5 py-2.5">
      {onBack ? <Kruimelpad onBack={onBack} /> : null}
      <h2
        className={`m-0 font-serif text-[17px] font-normal leading-none text-[#F1EFE8] ${
          onBack ? "mt-1.5" : ""
        }`}
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Aanvullen
      </h2>
    </div>
  );
}

export default function VoedingVsSupplementTabel({
  statuses,
  surface,
  gateOpen,
  gateReden = null,
  focusNutrient = null,
  onBack,
}: {
  statuses: readonly NutrientRouteStatus[];
  surface: string;
  /** De laag-6-poort: staat je eetbasis? Zonder dat blijft rechts dicht. */
  gateOpen: boolean;
  /**
   * Waarom de poort dicht is, in de bewoording van je eigen check.
   *
   * Stond tot 3 sep als losse alinea bóven de tabel, samen met drie andere
   * tekstblokken. Die stapel was precies wat dit scherm overvol maakte: vier
   * alinea's proza vóór het ene beeld waar de laag om draait. De reden hoort
   * in de kolom waar hij over gaat — dat is de kolom "Aanvullen", en daar
   * staat hij nu als kopregel boven de rijen.
   */
  gateReden?: string | null;
  focusNutrient?: string | null;
  /** Terug naar Voortgang-home. De tabel draagt zijn eigen terugweg. */
  onBack?: () => void;
}) {
  const s = surfaceStyles("dashboard");

  if (statuses.length === 0) {
    return (
      <div className="@container">
        <div className={`overflow-hidden rounded-xl border ${s.rij} bg-black/20`}>
          <TabelKop onBack={onBack} />
          <p className="m-0 px-3.5 py-3.5 text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Doe de voedingscheck om per stof te zien of aanvullen in beeld komt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      <div className={`overflow-hidden rounded-xl border ${s.rij} bg-black/20`}>
        <TabelKop onBack={onBack} />

        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-white/10 @[30rem]:grid">
          <p className={`m-0 px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.13em] ${s.zacht}`}>
            Uit je eten
          </p>
          <p
            className={`m-0 border-l border-white/10 px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.13em] ${s.zacht}`}
          >
            Aanvullen
          </p>
        </div>

        {!gateOpen && gateReden ? (
          <p className="m-0 border-b border-white/[0.06] px-3.5 py-2 text-[11.5px] leading-relaxed text-[#C8956C] text-pretty">
            {gateReden}
          </p>
        ) : null}

        <ul className="m-0 list-none p-0" role="list">
          {statuses.map((status) => {
            const kleur = ROUTE_STATUS_COLOR[status.status];
            const deurOpen = gateOpen && status.supplementDoorOpen;
            const isFocus = focusNutrient === status.nutrient;

            return (
              <li
                key={status.nutrient}
                className={`grid grid-cols-1 border-b border-white/[0.06] last:border-b-0 @[30rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${
                  isFocus ? "bg-white/[0.035]" : ""
                }`}
              >
                {/* Links: wat je bord doet. */}
                <div className="min-w-0 px-3.5 py-2.5">
                  <p className="m-0 flex items-baseline justify-between gap-2">
                    <span className={`min-w-0 truncate text-[13px] font-semibold ${s.tekst}`}>
                      {status.label}
                    </span>
                    <span
                      className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.06em]"
                      style={{ color: kleur }}
                    >
                      {ROUTE_STATUS_LABEL[status.status]}
                    </span>
                  </p>
                  {status.answerLabel ? (
                    <p className={`m-0 mt-1 text-[11.5px] leading-snug ${s.zacht}`}>
                      {status.answerLabel}
                    </p>
                  ) : null}
                  {status.sources.length > 0 ? (
                    <p className="m-0 mt-1 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
                      {status.sources
                        .slice(0, 2)
                        .map((bron) => bron.labelNl)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>

                {/* Rechts (of eronder): komt het potje in beeld — en anders waarom niet. */}
                <div className="min-w-0 border-t border-white/[0.06] px-3.5 py-2.5 @[30rem]:border-l @[30rem]:border-t-0 @[30rem]:border-white/10">
                  <p
                    className={`m-0 mb-1 text-[9.5px] font-bold uppercase tracking-[0.13em] ${s.zacht} @[30rem]:hidden`}
                  >
                    Aanvullen
                  </p>
                  {deurOpen ? (
                    <>
                      <p className={`m-0 text-[11.5px] leading-relaxed ${s.zacht} text-pretty`}>
                        {status.doorReasonNl}
                      </p>
                      <Link
                        href={status.comparisonPath}
                        onClick={() => {
                          trackEvent("nutrition_supplement_vergelijk_click", {
                            surface,
                            nutrient: status.nutrient,
                          });
                          clarityTag("nutrition_supplement_vergelijk", status.nutrient);
                        }}
                        className={`mt-1.5 inline-flex text-[12px] font-semibold no-underline ${s.knop}`}
                      >
                        Vergelijk producten ›
                      </Link>
                    </>
                  ) : (
                    <p className="m-0 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
                      {status.doorReasonNl}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
