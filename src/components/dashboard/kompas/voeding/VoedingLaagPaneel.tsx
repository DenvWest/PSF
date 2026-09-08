"use client";

import * as Icons from "@/components/app/icons";
import type { Micronutrient } from "@/data/nutrition/micronutrients";
import { getMicronutrient } from "@/data/nutrition/micronutrients";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { dekkingVoorStof, DEKKING_LABEL, type Dagdekking } from "@/lib/nutrition-dagdekking";
import type { DagItems } from "@/lib/nutrition-dagboek-items";
import {
  bouwAanvulRegels,
  bouwKwaliteitBeeld,
  bouwMomentVerdeling,
  momentenMetEiwit,
} from "@/lib/nutrition-lagen-uit-dagboek";

/**
 * P2 tot en met P6, gelezen uit de dag die je op P1 invulde.
 *
 * ## Waarom de lagen op elkaar aansluiten en niet naast elkaar staan
 *
 * De ladder beloofde altijd al een volgorde — "wat eronder staat telt pas mee
 * als de lagen erboven staan" — maar de panelen erachter kwamen allemaal uit
 * dezelfde frequentiecheck. Zes lagen, één meting, en dus zes vormen van
 * hetzelfde antwoord.
 *
 * Nu ligt het dagboek eronder. P1 is waar je invult; P2 leest diezelfde dag op
 * kwaliteit, P3 op verdeling, en P6 op de vraag of aanvullen aan de orde is.
 * Eén invoer, vier lezingen — dat is wat "erop aansluiten" hier betekent.
 *
 * ## Wat deze panelen niet doen
 *
 * Geen oordeel over één dag. De ladder gaat over je patroon en de check weegt
 * weken; een dagboekdag is een waarneming, geen cijfer. Elk paneel toont
 * daarom tellingen met het bewijs erbij, en laat de conclusie aan de check.
 */

const KAART = "rounded-2xl border border-white/10 bg-black/20 p-3.5";
const EYEBROW =
  "m-0 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]";

function LegeDag({ laag }: { laag: string }) {
  return (
    <section aria-label={laag} className={KAART}>
      <p className={EYEBROW}>{laag}</p>
      <p className="m-0 mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Deze laag leest de dag die je hierboven invult. Zet er eerst iets in — dan staat
        hier wat je dag erover zegt.
      </p>
    </section>
  );
}

function Verhouding({ deel, totaal }: { deel: number; totaal: number }) {
  const percentage = totaal > 0 ? Math.round((deel / totaal) * 100) : 0;
  return (
    <span
      aria-hidden
      className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
    >
      <span
        className="block h-full rounded-full bg-[#5A8F6A]"
        style={{ width: `${percentage}%` }}
      />
    </span>
  );
}

/** P2 — Voedingskwaliteit: hoeveel van deze dag kwam uit hele voeding? */
function KwaliteitPaneel({ items }: { items: DagItems }) {
  const beeld = bouwKwaliteitBeeld(items);
  if (beeld.totaal === 0) {
    return <LegeDag laag="Voedingskwaliteit" />;
  }

  return (
    <section aria-label="Voedingskwaliteit" className={KAART}>
      <p className={EYEBROW}>Voedingskwaliteit · deze dag</p>
      <p className="m-0 mt-2 text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
        {beeld.basis} van de {beeld.totaal} porties kwamen uit hele voeding.
      </p>
      <Verhouding deel={beeld.basis} totaal={beeld.totaal} />

      {beeld.bewerkteProducten.length > 0 ? (
        <>
          <p className="m-0 mt-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Sterk bewerkt of gezoet vandaag:
          </p>
          <ul className="m-0 mt-1 flex list-none flex-wrap gap-1.5 p-0">
            {beeld.bewerkteProducten.map((regel) => (
              <li
                key={regel.product.key}
                className="inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-[#9FB0A6]"
              >
                {regel.porties > 1 ? `${regel.porties}× ` : ""}
                {regel.product.labelNl}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="m-0 mt-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Niets sterk bewerkts of gezoets op deze dag.
        </p>
      )}

      <p className="m-0 mt-3 text-[10.5px] leading-relaxed text-[#7E8C82]">
        Eén dag, geen oordeel. Deze laag gaat over hoe váák iets je standaardkeuze is —
        dat weegt je voedingscheck over weken, niet dit lijstje.
      </p>
    </section>
  );
}

/** P3 — Verhoudingen: waar in de dag zaten je eiwit- en vezelbronnen? */
function VerhoudingenPaneel({ items }: { items: DagItems }) {
  const verdeling = bouwMomentVerdeling(items);
  if (verdeling.length === 0) {
    return <LegeDag laag="Verhoudingen" />;
  }

  const metEiwit = momentenMetEiwit(verdeling);

  return (
    <section aria-label="Verhoudingen" className={KAART}>
      <p className={EYEBROW}>Verhoudingen · over je dag</p>
      <p className="m-0 mt-2 text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
        Op {metEiwit} van je {verdeling.length}{" "}
        {verdeling.length === 1 ? "ingevuld moment" : "ingevulde momenten"} stond een
        eiwitbron.
      </p>
      <p className="m-0 mt-1 max-w-[58ch] text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Eiwit gelijkmatig over de dag verdelen is wat deze laag als eerste noemt. Wat
        hier telt is een bron per moment, niet een aantal grammen.
      </p>

      <ul className="m-0 mt-2.5 flex list-none flex-col gap-1 p-0">
        {verdeling.map((rij) => (
          <li
            key={rij.moment}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5"
          >
            <span className="text-[12.5px] font-medium text-[#E7EDE8]">{rij.label}</span>
            <span className="flex flex-wrap items-center justify-end gap-1.5 text-[10.5px] text-[#9FB0A6]">
              <span
                className={
                  rij.eiwitbronnen > 0
                    ? "inline-flex items-center rounded-full border border-[rgba(90,143,106,0.4)] bg-[rgba(90,143,106,0.14)] px-1.5 py-0.5 text-[#9CC5A9]"
                    : "inline-flex items-center rounded-full border border-white/[0.08] px-1.5 py-0.5"
                }
              >
                {rij.eiwitbronnen > 0 ? `${rij.eiwitbronnen}× eiwit` : "geen eiwitbron"}
              </span>
              {rij.vezelbronnen > 0 ? (
                <span className="inline-flex items-center rounded-full border border-white/[0.08] px-1.5 py-0.5">
                  {rij.vezelbronnen}× vezels
                </span>
              ) : null}
              {rij.plantbronnen > 0 ? (
                <span className="inline-flex items-center rounded-full border border-white/[0.08] px-1.5 py-0.5">
                  {rij.plantbronnen}× plant
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** P4 — Op jouw situatie: wat de dag hierover wél en niet kan zeggen. */
function SituatiePaneel({ dekking }: { dekking: Dagdekking }) {
  const gaten = dekking.ontbreekt.slice(0, 4);
  return (
    <section aria-label="Op jouw situatie" className={KAART}>
      <p className={EYEBROW}>Op jouw situatie</p>
      <p className="m-0 mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
        Je gewicht, leeftijd, activiteit en voorkeuren bepalen welke stappen realistisch
        zijn. Dat weegt je voedingscheck — een dagboekdag zegt er niets over, en doet
        hier dus geen uitspraak.
      </p>
      {gaten.length > 0 ? (
        <p className="m-0 mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Wat je dag wél laat zien: {gaten.map((stof) => stof.label).join(", ")} kwamen er
          vandaag niet in voor. Of dat uitmaakt hangt af van de rest van je week.
        </p>
      ) : null}
      <p className="m-0 mt-2 text-[10.5px] leading-relaxed text-[#7E8C82]">
        Adviezen, geen diagnoses. Bij twijfel verwijzen we door.
      </p>
    </section>
  );
}

/** P6 — Aanvullen: pas nadat de dag heeft laten zien wat het bord al deed. */
function AanvullenPaneel({
  items,
  dekking,
  surface,
  onOpenStof,
}: {
  items: DagItems;
  dekking: Dagdekking;
  surface: string;
  onOpenStof: (stof: Micronutrient) => void;
}) {
  const regels = bouwAanvulRegels(items);

  return (
    <section aria-label="Aanvullen & vergelijken" className={KAART}>
      <p className={EYEBROW}>Aanvullen & vergelijken</p>
      <p className="m-0 mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
        Vijf stoffen waar wij supplementen van vergelijken. Eerst wat je dag ervoor
        leverde — pas als daar structureel niets staat, is een aanvulling de vraag.
      </p>

      <ul className="m-0 mt-2.5 flex list-none flex-col gap-1.5 p-0">
        {regels.map((regel) => {
          const micro = getMicronutrient(regel.stof);
          const stand = dekkingVoorStof(dekking, regel.stof);
          return (
            <li
              key={regel.stof}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-white/[0.05] bg-white/[0.02] px-2.5 py-2"
            >
              <span className="min-w-0">
                <button
                  type="button"
                  onClick={() => micro && onOpenStof(micro)}
                  className="cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-semibold text-[#E7EDE8] underline decoration-white/20 underline-offset-2"
                >
                  {regel.label}
                </button>
                <span className="block text-[10.5px] text-[#7E8C82]">
                  {regel.besteBron
                    ? `Vandaag uit ${regel.besteBron.labelNl}${
                        regel.bronnen > 1 ? ` en ${regel.bronnen - 1} andere` : ""
                      }`
                    : `Vandaag geen bron — ${stand ? DEKKING_LABEL[stand.status] : "niets"}`}
                </span>
              </span>
              <a
                href={regel.comparisonPath}
                onClick={() => {
                  trackEvent("nutrition_kompas_aanvullen_click", {
                    surface,
                    stof: regel.stof,
                    had_bron: regel.bronnen > 0,
                  });
                  clarityTag("nutrition_kompas_aanvullen", regel.stof);
                }}
                className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border border-white/15 px-2.5 text-[11.5px] font-semibold text-[#9CC5A9] no-underline transition hover:border-[rgba(90,143,106,0.5)]"
              >
                Vergelijk <Icons.ChevronRight s={12} />
              </a>
            </li>
          );
        })}
      </ul>

      <p className="m-0 mt-2.5 text-[10.5px] leading-relaxed text-[#7E8C82]">
        Een supplement vult aan wat je bord niet dekt; het vervangt geen bord. De
        bronnenlijst per stof staat een tik verderop.
      </p>
    </section>
  );
}

export default function VoedingLaagPaneel({
  laag,
  items,
  dekking,
  surface,
  onOpenStof,
  metenSlot,
}: {
  laag: number;
  items: DagItems;
  dekking: Dagdekking;
  surface: string;
  onOpenStof: (stof: Micronutrient) => void;
  /** P5 blijft de reeks uit de check tonen; die komt van buiten. */
  metenSlot?: React.ReactNode;
}) {
  if (laag === 2) {
    return <KwaliteitPaneel items={items} />;
  }
  if (laag === 3) {
    return <VerhoudingenPaneel items={items} />;
  }
  if (laag === 4) {
    return <SituatiePaneel dekking={dekking} />;
  }
  if (laag === 5) {
    return metenSlot ? <>{metenSlot}</> : null;
  }
  if (laag === 6) {
    return (
      <AanvullenPaneel
        items={items}
        dekking={dekking}
        surface={surface}
        onOpenStof={onOpenStof}
      />
    );
  }
  return null;
}
