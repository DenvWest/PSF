"use client";

import { useEffect, useRef, useState } from "react";
import {
  EETWIJZER_BRON,
  EETWIJZER_FRUIT,
  EETWIJZER_FRUIT_GEMIDDELDE,
  EETWIJZER_GROENTE,
  EETWIJZER_GROENTE_GEMIDDELDE,
  EETWIJZER_OVERIG,
  EETWIJZER_ZONE_KLEUR,
  EETWIJZER_ZONE_LABEL,
  eetwijzerZone,
  type EetwijzerItem,
} from "@/data/nutrition/pesticiden-eetwijzer";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

/**
 * Voedingskwaliteit · pesticide-residuen — de PesticidenEetwijzer-ranglijst.
 *
 * Dit is de **kwaliteits-as**: niet hoe vaak je iets eet (dat is
 * VerhoudingTabel), maar wat er gemiddeld op zit. De twee staan bewust naast
 * elkaar en tellen nooit op — iemand kan vijf porties groente eten die
 * allemaal uit de bovenkant van deze lijst komen, en dat is een andere vraag
 * dan of hij genoeg groente eet.
 *
 * Drie dingen die dit component met opzet niet doet:
 *
 * 1. **Geen persoonlijke uitslag.** De check vraagt niet wélke groente je eet,
 *    dus we kunnen en willen niet zeggen "jij zit in het rood". Zodra we dat
 *    wel zouden vragen, verandert er hier niets aan de data — alleen aan wat
 *    we ernaast kunnen zetten.
 * 2. **Geen gezondheidsclaim.** Alle waarden liggen onder de wettelijke
 *    residulimiet. De ranglijst gaat over het aantal *verschillende* stoffen,
 *    niet over overschrijding of toxiciteit.
 * 3. **Geen "eet dit niet".** PAN's eigen slotzin is dat je vooral groente en
 *    fruit moet blijven eten; deze lijst helpt kiezen tussen soorten. Die
 *    volgorde staat ook in de UI: de aanmoediging boven de lijst, niet eronder
 *    als disclaimer.
 */

type Surface = "check" | "dashboard";

const STYLES = {
  check: {
    kaart: "rounded-[14px] border border-[#ebe7e2] bg-[#faf9f7]",
    kop: "text-[#78716c]",
    tekst: "text-[#1c1917]",
    zacht: "text-[#78716c]",
    rij: "border-[#ebe7e2]",
    knop: "text-[#5A8F6A]",
    balkBed: "bg-[#efece7]",
  },
  dashboard: {
    kaart: "rounded-2xl border border-white/10 bg-black/20",
    kop: "text-[#9FB0A6]",
    tekst: "text-[#E7EDE8]",
    zacht: "text-[#9FB0A6]",
    rij: "border-white/10",
    knop: "text-[#9CC5A9]",
    balkBed: "bg-white/10",
  },
} as const;

/** Langste balk in beeld = hoogste waarde in de lijst; schaal per lijst. */
function balkBreedte(residuen: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.max(2, Math.round((residuen / max) * 100))}%`;
}

function Lijst({
  titel,
  items,
  gemiddelde,
  surface,
  ingeklapt,
}: {
  titel: string;
  items: EetwijzerItem[];
  gemiddelde: number | null;
  surface: Surface;
  /** Aantal rijen dat zichtbaar is vóór "toon alles"; null = alles tonen. */
  ingeklapt: number | null;
}) {
  const s = STYLES[surface];
  const max = items.reduce((hoogste, item) => Math.max(hoogste, item.residuen), 0);
  const zichtbaar = ingeklapt === null ? items : items.slice(0, ingeklapt);

  return (
    <div className="min-w-0">
      <div className={`flex items-baseline justify-between gap-2 border-b pb-1.5 ${s.rij}`}>
        <h3 className={`m-0 text-[11px] font-semibold uppercase tracking-[0.12em] ${s.kop}`}>
          {titel}
        </h3>
        <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] ${s.kop}`}>
          Gem. residuen
        </span>
      </div>

      <ol className="m-0 flex list-none flex-col p-0">
        {zichtbaar.map((item, i) => {
          const zone = eetwijzerZone(item.residuen);
          return (
            <li
              key={item.naam}
              className={`flex items-center gap-2.5 border-b py-1.5 ${s.rij}`}
            >
              <span
                className={`w-4 shrink-0 text-right text-[10.5px] tabular-nums ${s.zacht}`}
                aria-hidden
              >
                {i + 1}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className={`truncate text-[12.5px] font-medium ${s.tekst}`}>
                  {item.naam}
                </span>
                <span
                  className={`h-1 w-full overflow-hidden rounded-full ${s.balkBed}`}
                  role="presentation"
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: balkBreedte(item.residuen, max),
                      backgroundColor: EETWIJZER_ZONE_KLEUR[zone],
                    }}
                  />
                </span>
              </span>

              <span
                className={`w-8 shrink-0 text-right text-[12.5px] font-semibold tabular-nums ${s.tekst}`}
              >
                {item.residuen.toFixed(1).replace(".", ",")}
              </span>
              <span className="sr-only">{EETWIJZER_ZONE_LABEL[zone]}</span>
            </li>
          );
        })}
      </ol>

      {gemiddelde !== null ? (
        <p className={`m-0 flex items-baseline justify-between gap-2 py-1.5 text-[11.5px] ${s.zacht}`}>
          <span>Gemiddeld over alle soorten</span>
          <span className={`font-semibold tabular-nums ${s.tekst}`}>
            {gemiddelde.toFixed(1).replace(".", ",")}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export default function KwaliteitEetwijzer({
  surface,
  standaardIngeklapt = true,
}: {
  surface: Surface;
  /** Toon eerst de kop van beide lijsten; de rest achter één knop. */
  standaardIngeklapt?: boolean;
}) {
  const s = STYLES[surface];
  const [uitgeklapt, setUitgeklapt] = useState(!standaardIngeklapt);
  const gezien = useRef(false);

  useEffect(() => {
    if (gezien.current) return;
    gezien.current = true;
    trackEvent("nutrition_kwaliteit_shown", { surface });
    clarityTag("nutrition_kwaliteit", surface);
  }, [surface]);

  function handleUitklappen() {
    setUitgeklapt(true);
    trackEvent("nutrition_kwaliteit_expanded", { surface });
    clarityTag("nutrition_kwaliteit", "expanded");
  }

  const limiet = uitgeklapt ? null : 8;

  return (
    <section aria-labelledby="kwaliteit-heading" className={`@container ${s.kaart}`}>
      <div className="px-4 py-3.5">
        <h2
          id="kwaliteit-heading"
          className={`m-0 text-[11px] font-semibold uppercase tracking-[0.16em] ${s.kop}`}
        >
          Kwaliteit — wat er op je groente en fruit zit
        </h2>
        <p className={`mt-1.5 m-0 text-[13.5px] font-medium leading-snug ${s.tekst} text-pretty`}>
          Blijf groente en fruit eten. Deze lijst helpt kiezen wélke.
        </p>
        <p className={`mt-1.5 m-0 text-[11.5px] leading-relaxed ${s.zacht} text-pretty`}>
          Gemiddeld aantal <em>verschillende</em> pesticide-residuen per product,
          uit {EETWIJZER_BRON.dataBron} {EETWIJZER_BRON.onderzoeksjaren}. Alle
          geteste producten bleven onder de wettelijke residulimiet — de
          ranglijst gaat over hoeveel stoffen er samen op zitten, niet over
          overschrijding.
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-x-6 gap-y-4 border-t px-4 py-3 @[560px]:grid-cols-2 ${s.rij}`}>
        <Lijst
          titel="Fruit"
          items={EETWIJZER_FRUIT}
          gemiddelde={uitgeklapt ? EETWIJZER_FRUIT_GEMIDDELDE : null}
          surface={surface}
          ingeklapt={limiet}
        />
        <Lijst
          titel="Groente"
          items={EETWIJZER_GROENTE}
          gemiddelde={uitgeklapt ? EETWIJZER_GROENTE_GEMIDDELDE : null}
          surface={surface}
          ingeklapt={limiet}
        />
        {uitgeklapt ? (
          <Lijst
            titel="Overig"
            items={EETWIJZER_OVERIG}
            gemiddelde={null}
            surface={surface}
            ingeklapt={null}
          />
        ) : null}
      </div>

      {!uitgeklapt ? (
        <div className={`border-t px-4 py-2.5 ${s.rij}`}>
          <button
            type="button"
            onClick={handleUitklappen}
            className={`cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-semibold ${s.knop}`}
          >
            Toon de volledige lijst ({EETWIJZER_FRUIT.length + EETWIJZER_GROENTE.length + EETWIJZER_OVERIG.length} soorten) ›
          </button>
        </div>
      ) : null}

      <p className={`m-0 border-t px-4 py-3 text-[11px] leading-relaxed ${s.rij} ${s.zacht} text-pretty`}>
        Bron:{" "}
        <a
          href={EETWIJZER_BRON.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-medium underline underline-offset-[3px] ${s.knop}`}
        >
          {EETWIJZER_BRON.naam}
        </a>{" "}
        ({EETWIJZER_BRON.organisatie}) — {EETWIJZER_BRON.aantalTests.toLocaleString("nl-NL")}{" "}
        {EETWIJZER_BRON.dataBron} uit {EETWIJZER_BRON.onderzoeksjaren}, gemiddeld{" "}
        {EETWIJZER_BRON.gemiddeldTestsPerSoort} per soort, alleen gangbare teelt.
        Wat er op één product uit de winkel zit kan hier flink van afwijken door
        seizoen, teler en herkomst. Deze lijst telt niet mee in je voedingsscore.
      </p>
    </section>
  );
}
