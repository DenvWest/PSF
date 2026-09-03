"use client";

import { useState } from "react";
import KwaliteitEetwijzer from "@/components/nutrition/KwaliteitEetwijzer";
import { clarityTag } from "@/lib/clarity";
import {
  BALK_ZONES,
  heeftStatusKleur,
  markerPositie,
  STATUS_KLEUR,
  surfaceStyles,
} from "@/lib/dashboard-surface";
import { trackEvent } from "@/lib/ga4";
import {
  EETWIJZER_FRUIT_GEMIDDELDE,
  EETWIJZER_GROENTE_GEMIDDELDE,
} from "@/data/nutrition/pesticiden-eetwijzer";
import type { NutritionFactRow } from "@/lib/nutrition-ladder";

/**
 * P2 Voedingskwaliteit — wat er op je eten zit, niet hoe vaak je het eet.
 *
 * ## Wat hier veranderde, en waarom
 *
 * Deze laag opende eerder op de volledige PesticidenEetwijzer-ranglijst: drie
 * lijsten met tientallen rijen, productkennis die voor iedereen gelijk is. Dat
 * duwde jouw eigen antwoorden onder een scherm vol tabel, terwijl de vraag van
 * deze laag begint bij wat *jij* eet.
 *
 * Nu staat je eigen check bovenaan en zit de ranglijst achter één knop. De
 * lijst is niet minder waard geworden — hij is alleen niet het antwoord op
 * "hoe sta ik ervoor", en dat is wat een domeinscherm hoort te openen.
 *
 * ## Welke rijen hier staan
 *
 * Twee soorten, bewust naast elkaar:
 *
 * - **Kwaliteitsvragen** (laag 2): suiker en bewerkingsgraad. Dit is wat de
 *   check letterlijk over kwaliteit vraagt.
 * - **De bronnen waar kwaliteit iets betekent** (van laag 1): groente, fruit,
 *   vlees en vis. Die vragen zelf gaan over hoevéél je eet, maar ze zijn de
 *   enige plek waar de ranglijst hieronder op slaat — je kunt pas kiezen
 *   tussen groentesoorten als je weet dat groente jouw knop is.
 *
 * Ze tellen nooit op tot één kwaliteitscijfer. De check vraagt niet wélke
 * groente je eet, dus een persoonlijke residu-uitslag bestaat niet en zou hier
 * verzonnen zijn.
 */

/** De rijen van laag 1 waar de residu-ranglijst betekenis voor heeft. */
const BRON_KEYS = ["plantbasis", "visbron", "eiwitbronnen"];

function KwaliteitRij({ rij }: { rij: NutritionFactRow }) {
  const s = surfaceStyles("dashboard");
  const status = rij.status ?? "own";
  const kleur = heeftStatusKleur(status) ? STATUS_KLEUR[status] : "#7E8C82";

  return (
    <li className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className={`min-w-0 text-[13px] leading-snug ${s.tekst}`}>{rij.label}</span>
        <span className={`shrink-0 text-[12.5px] font-semibold leading-snug ${s.tekst}`}>
          {rij.answerLabel}
        </span>
      </div>
      {heeftStatusKleur(status) ? (
        <div className="relative mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full">
          {BALK_ZONES.map((zone) => (
            <span
              key={zone.status}
              aria-hidden
              className="h-full"
              style={{
                width: `${zone.breedte}%`,
                backgroundColor:
                  zone.status === status ? STATUS_KLEUR[zone.status] : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
          <span
            aria-hidden
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#141d1a]"
            style={{ left: `${markerPositie(status)}%`, backgroundColor: kleur }}
          />
        </div>
      ) : (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06]" />
      )}
      {rij.benchmarkLabel ? (
        <p className={`m-0 mt-1 text-[11px] leading-relaxed ${s.zacht} text-pretty`}>
          {rij.benchmarkLabel}
        </p>
      ) : null}
    </li>
  );
}

export default function VoedingskwaliteitLaag({
  rijen,
  checkDatum,
}: {
  /** Feitenrijen van de laatste check; leeg zonder log. */
  rijen: readonly NutritionFactRow[];
  checkDatum: string | null;
}) {
  const s = surfaceStyles("dashboard");
  const [lijstOpen, setLijstOpen] = useState(false);

  const kwaliteitsrijen = rijen.filter((rij) => rij.layer === 2);
  const bronrijen = rijen.filter((rij) => BRON_KEYS.includes(rij.key));
  const heeftCheck = kwaliteitsrijen.length > 0 || bronrijen.length > 0;

  function toggleLijst() {
    const next = !lijstOpen;
    setLijstOpen(next);
    trackEvent("nutrition_kwaliteit_ranglijst", {
      surface: "dashboard",
      staat: next ? "open" : "dicht",
    });
    clarityTag("nutrition_kwaliteit_ranglijst", next ? "open" : "dicht");
  }

  if (!heeftCheck) {
    return (
      <div className={`mt-4 ${s.kaart} px-4 py-3.5`}>
        <p className={`m-0 text-[13.5px] font-medium leading-snug ${s.tekst} text-pretty`}>
          Dit komt uit je voedingscheck.
        </p>
        <p className={`m-0 mt-1.5 text-[12.5px] leading-relaxed ${s.zacht} text-pretty`}>
          Zonder check kunnen we hier niets van jóuw kwaliteit laten zien — alleen
          de ranglijst, en die is voor iedereen gelijk.
        </p>
        <a
          href="/intake/voeding?from=dashboard"
          onClick={() => {
            trackEvent("nutrition_kwaliteit_check_cta", { surface: "dashboard" });
            clarityTag("nutrition_kwaliteit_check_cta", "dashboard");
          }}
          className={`mt-2.5 inline-flex text-[13px] font-semibold no-underline ${s.knop}`}
        >
          Doe de voedingscheck ›
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {kwaliteitsrijen.length > 0 ? (
        <section>
          <p className={`m-0 mb-2.5 text-[9.5px] font-bold uppercase tracking-[0.15em] ${s.zacht}`}>
            Wat je check over kwaliteit zegt
          </p>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0" role="list">
            {kwaliteitsrijen.map((rij) => (
              <KwaliteitRij key={rij.key} rij={rij} />
            ))}
          </ul>
        </section>
      ) : null}

      {bronrijen.length > 0 ? (
        <section>
          <p className={`m-0 mb-1 text-[9.5px] font-bold uppercase tracking-[0.15em] ${s.zacht}`}>
            Waar kwaliteit voor jou telt
          </p>
          <p className={`m-0 mb-2.5 max-w-[58ch] text-[11.5px] leading-relaxed ${s.zacht} text-pretty`}>
            Hoe vaak je deze bronnen eet, uit je check. Hoe méér ze op je bord
            staan, hoe meer het uitmaakt wélke soort je kiest.
          </p>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0" role="list">
            {bronrijen.map((rij) => (
              <KwaliteitRij key={rij.key} rij={rij} />
            ))}
          </ul>
        </section>
      ) : null}

      {/* De ranglijst achter één knop: productkennis die voor iedereen gelijk
          is, en dus niet het antwoord op "hoe sta ik ervoor". */}
      <section>
        <button
          type="button"
          onClick={toggleLijst}
          aria-expanded={lijstOpen}
          className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${s.rij} bg-black/20 hover:bg-white/[0.04]`}
        >
          <span className="min-w-0">
            <span className={`block text-[12.5px] font-semibold ${s.tekst}`}>
              Ranglijst pesticide-residuen
            </span>
            <span className={`mt-0.5 block text-[11px] leading-relaxed ${s.zacht}`}>
              Gemiddeld {EETWIJZER_GROENTE_GEMIDDELDE} stoffen op groente,{" "}
              {EETWIJZER_FRUIT_GEMIDDELDE} op fruit
            </span>
          </span>
          <span aria-hidden className={`shrink-0 text-[11px] font-semibold ${s.knop}`}>
            {lijstOpen ? "Verberg" : "Bekijk"}
          </span>
        </button>

        {lijstOpen ? <KwaliteitEetwijzer surface="dashboard" /> : null}
      </section>

      {checkDatum ? (
        <p className={`m-0 text-[10.5px] leading-relaxed text-[#7E8C82]`}>
          Je antwoorden komen uit je check van {checkDatum}. De ranglijst is
          productkennis en verandert daar niet mee.
        </p>
      ) : null}
    </div>
  );
}
