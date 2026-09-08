"use client";

import { useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import type { Micronutrient } from "@/data/nutrition/micronutrients";
import type { Voedingsmiddel } from "@/data/nutrition/food-items";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import {
  BIJDRAGE_BRON,
  BIJDRAGE_LABEL,
  bronnenVoorStof,
  type BijdrageNiveau,
  type StofBron,
} from "@/lib/micronutrient-index";
import { DAGBOEK_LABELS } from "@/lib/nutrition-dagboek";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Alles wat deze stof levert — de volledigheid die het overzicht belooft.
 *
 * Geen top-vijf. De lijst toont elk voedingsmiddel in de tabel dat de
 * ondergrens haalt, aflopend op hoe zwaar één portie weegt. Dat is bewust: een
 * top-vijf is een redactionele keuze die je niet kunt controleren, en juist bij
 * "waar haal ik dit uit" wil je kunnen zien of wát jij eet erin staat.
 *
 * ## De volgorde gaat over borden, niet over honderd gram
 *
 * Gesorteerd op de bijdrage van één **portie**. Anders staan zaden en kruiden
 * altijd bovenaan — pompoenpitten hebben per 100 g meer magnesium dan wat
 * ook, maar niemand eet er 100 gram van. Twee eetlepels wél, en dat is wat er
 * staat.
 *
 * ## Waarom het supplement onderaan staat
 *
 * Onder de lijst, niet erboven, en alleen voor de stoffen waar wij een
 * vergelijking van hebben. De volgorde ís het advies: eerst wat er op je bord
 * kan, dan pas de vraag of aanvullen aan de orde is. Andersom zou het scherm
 * beweren dat een potje het antwoord is op een vraag die het bord al kon
 * beantwoorden.
 */

const NIVEAU_STIJL: Record<BijdrageNiveau, string> = {
  rijk: "border-[rgba(90,143,106,0.5)] bg-[rgba(90,143,106,0.18)] text-[#9CC5A9]",
  bron: "border-white/12 bg-white/[0.05] text-[#CDD7D0]",
  spoor: "border-white/[0.08] bg-transparent text-[#7E8C82]",
};

function BronRij({
  bron,
  onKies,
}: {
  bron: StofBron;
  onKies?: (product: Voedingsmiddel) => void;
}) {
  const inhoud = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] font-medium leading-snug text-[#E7EDE8]">
          {bron.product.labelNl}
        </span>
        <span className="block text-[10.5px] text-[#7E8C82]">{bron.product.portieLabel}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${NIVEAU_STIJL[bron.niveau]}`}
        >
          {BIJDRAGE_LABEL[bron.niveau]}
        </span>
        <span className="w-[4.5rem] text-right text-[12.5px] tabular-nums text-[#CDD7D0]">
          {bron.hoeveelheidLabel}
        </span>
      </span>
    </>
  );

  if (!onKies) {
    return (
      <li className="flex items-center gap-3 border-b border-white/[0.05] px-1 py-1.5 last:border-b-0">
        {inhoud}
      </li>
    );
  }

  return (
    <li className="border-b border-white/[0.05] last:border-b-0">
      <button
        type="button"
        onClick={() => onKies(bron.product)}
        aria-label={`${bron.product.labelNl} toevoegen aan je dag`}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-1 py-1.5 text-left transition hover:bg-white/[0.03]"
      >
        {inhoud}
      </button>
    </li>
  );
}

export default function MicronutrientBronnen({
  stof,
  onSluit,
  onKiesProduct,
}: {
  stof: Micronutrient;
  onSluit?: () => void;
  /** Meteen aan je dag toevoegen. Weglaten maakt de lijst puur naslag. */
  onKiesProduct?: (product: Voedingsmiddel) => void;
}) {
  const [groep, setGroep] = useState<VoedselgroepId | null>(null);

  const alles = useMemo(() => bronnenVoorStof(stof.id), [stof.id]);
  const groepen = useMemo(() => {
    const gezien: VoedselgroepId[] = [];
    for (const bron of alles) {
      if (!gezien.includes(bron.product.groep)) {
        gezien.push(bron.product.groep);
      }
    }
    return gezien;
  }, [alles]);

  const zichtbaar = groep ? alles.filter((bron) => bron.product.groep === groep) : alles;
  const route = stof.nutrientId ? nutrientReferences[stof.nutrientId] : null;

  return (
    <section
      aria-label={`Bronnen van ${stof.label}`}
      className="rounded-2xl border border-white/10 bg-black/25 p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[15px] font-semibold text-[#F1EFE8]">{stof.label}</h3>
          <p className="mt-1 max-w-[58ch] text-[12px] leading-relaxed text-[#CDD7D0] text-pretty">
            {stof.rolRegel}
          </p>
        </div>
        {onSluit ? (
          <button
            type="button"
            onClick={onSluit}
            className="shrink-0 cursor-pointer rounded-full border border-white/10 bg-transparent px-2.5 py-1 text-[11px] font-semibold text-[#9FB0A6] transition hover:border-white/25 hover:text-[#E7EDE8]"
          >
            Sluiten
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[#7E8C82]">
        Referentie: {stof.referentieLabel} — {stof.referentieBron}.
      </p>

      {groepen.length > 1 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setGroep(null)}
            aria-pressed={groep === null}
            className={`inline-flex min-h-8 cursor-pointer items-center rounded-full border px-2.5 text-[11.5px] font-medium transition ${
              groep === null
                ? "border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.16)] text-[#E7EDE8]"
                : "border-white/10 bg-transparent text-[#9FB0A6] hover:border-white/25"
            }`}
          >
            Alles ({alles.length})
          </button>
          {groepen.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setGroep(id === groep ? null : id)}
              aria-pressed={id === groep}
              className={`inline-flex min-h-8 cursor-pointer items-center rounded-full border px-2.5 text-[11.5px] font-medium transition ${
                id === groep
                  ? "border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.16)] text-[#E7EDE8]"
                  : "border-white/10 bg-transparent text-[#9FB0A6] hover:border-white/25"
              }`}
            >
              {DAGBOEK_LABELS[id]}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="m-0 mt-2 flex max-h-[52vh] list-none flex-col overflow-y-auto p-0">
        {zichtbaar.map((bron) => (
          <BronRij key={bron.product.key} bron={bron} onKies={onKiesProduct} />
        ))}
      </ul>

      <p className="m-0 mt-2.5 text-[10.5px] leading-relaxed text-[#7E8C82]">
        Per portie, aflopend. Gehaltes indicatief — nog niet tegen NEVO gelegd, dus
        vergelijk ze met elkaar en niet met een norm. {BIJDRAGE_BRON}
      </p>

      {route ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="m-0 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            <Icons.Pill s={12} /> Aanvullen
          </p>
          <p className="m-0 mt-1.5 max-w-[58ch] text-[12px] leading-relaxed text-[#CDD7D0] text-pretty">
            Lukt het niet uit je eten, dan is {stof.label.toLowerCase()} een van de stoffen
            waar een supplement voor bestaat. Eerst het bord, dan pas het potje — de lijst
            hierboven is de eerste route.
          </p>
          <a
            href={route.comparisonPath}
            className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[12px] font-semibold text-[#9CC5A9] no-underline transition hover:border-[rgba(90,143,106,0.5)]"
          >
            Vergelijk {stof.label.toLowerCase()} <Icons.ChevronRight s={13} />
          </a>
        </div>
      ) : (
        <p className="m-0 mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Voor {stof.label.toLowerCase()} vergelijken wij geen supplementen. {stof.bronRegel}
        </p>
      )}
    </section>
  );
}
