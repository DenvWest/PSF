"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import CategorieDetailPaneel from "@/components/nutrition/CategorieDetailPaneel";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import { heeftDetail } from "@/lib/nutrition-categorie-detail";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import type { NutritionFactRow, NutritionLadderReport } from "@/lib/nutrition-ladder";
import {
  categorieKaarten,
  GEEN_RICHTLIJN_LABEL,
  GEEN_RICHTLIJN_LABEL_KORT,
  type CategorieKaart,
} from "@/lib/nutrition-voedselgroepen";

/**
 * P1 Voedingsbasis — het categorie-overzicht als tabel, met doordruk per rij.
 *
 * ## Waarom een tabel en geen kaartenraster
 *
 * De vorige vorm zette elke categorie in een eigen kaart met een eigen
 * `Jij`/`Aanbevolen`-lijstje. Dat leest prima bij drie categorieën en valt uit
 * elkaar bij zeven: je vergelijkt kaarten met elkaar, en dat is precies wat een
 * raster moeilijk maakt — je oog moet per kaart opnieuw zoeken waar "Jij"
 * staat. Een tabel zet die waarden in een kolom onder elkaar, en dan is
 * vergelijken gratis.
 *
 * Het is ook wat de inhoud ís: één rij per categorie, dezelfde velden per rij,
 * gesorteerd op waar de ruimte zit. Dat is een tabel, geen verzameling kaarten.
 *
 * ## De doordruk
 *
 * Elke rij die bronnen achter zich heeft, klapt open naar
 * `CategorieDetailPaneel`: welke stoffen deze groep draagt en uit welke bronnen.
 * Eén rij tegelijk open — twee open dossiers naast elkaar brengen de muur terug
 * die de tabel net wegnam, en de vraag is per categorie te beantwoorden.
 *
 * Categorieën zonder bronnen (suiker: daar kies je niet tussen bronnen, daar
 * minder je) krijgen geen knop. Een knop die een leeg paneel opent belooft een
 * antwoord dat er niet is.
 *
 * ## Mobiel
 *
 * Onder 640px zakt de richtlijn-kolom weg onder het antwoord in dezelfde cel:
 * op 375px is een vierkolomstabel niet te lezen, en de richtlijn hoort bij het
 * antwoord — niet bij de statuskolom.
 */

const STATUS_KLEUR: Record<Exclude<LadderEvidenceStatus, "own">, string> = {
  below: "#C8956C",
  near: "#C99A3C",
  meets: "#9CC5A9",
};

const STATUS_LABEL: Record<LadderEvidenceStatus, string> = {
  below: "ruimte",
  near: "bijna",
  meets: "op orde",
  own: "eigen ijkpunt",
};

/** Ruimte eerst — dat is waar de tabel voor bestaat. */
const STATUS_VOLGORDE: Record<LadderEvidenceStatus, number> = {
  below: 0,
  near: 1,
  meets: 2,
  own: 3,
};

function StatusMerk({ status }: { status: LadderEvidenceStatus }) {
  const kleur = status === "own" ? "transparent" : STATUS_KLEUR[status];
  return (
    <span className="flex items-center justify-end gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#9FB0A6]">
      <span
        aria-hidden
        className="inline-block h-2 w-2 shrink-0 rounded-full border"
        style={{ backgroundColor: kleur, borderColor: status === "own" ? "#7E8C82" : kleur }}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

function CategorieRij({
  kaart,
  open,
  onToggle,
  report,
  surface,
}: {
  kaart: CategorieKaart;
  open: boolean;
  onToggle: () => void;
  report: NutritionSelfReport | null;
  surface: string;
}) {
  const uitklapbaar = heeftDetail(kaart.id);
  const paneelId = `voedingsbasis-detail-${kaart.id}`;

  return (
    <>
      <tr className="border-t border-white/10">
        <th scope="row" className="py-2.5 pr-3 text-left align-top font-normal">
          {uitklapbaar ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={paneelId}
              className="flex items-start gap-1.5 text-left text-[13px] font-semibold leading-snug text-[#E7EDE8] transition-colors hover:text-white"
            >
              <span
                aria-hidden
                className="mt-[3px] inline-flex shrink-0 text-[#7E8C82] transition-transform"
                style={{ transform: open ? "rotate(90deg)" : undefined }}
              >
                <Icons.ChevronRight s={12} />
              </span>
              {kaart.label}
            </button>
          ) : (
            <span className="flex items-start gap-1.5 pl-[18px] text-[13px] font-semibold leading-snug text-[#E7EDE8]">
              {kaart.label}
            </span>
          )}
        </th>

        <td className="py-2.5 pr-3 align-top text-[12.5px] leading-snug text-[#E7EDE8]">
          {kaart.jij}
          <span className="mt-0.5 block text-[11px] leading-snug text-[#7E8C82] sm:hidden">
            {kaart.aanbevolen
              ? `richtlijn: ${kaart.aanbevolen}`
              : kaart.exemption
                ? GEEN_RICHTLIJN_LABEL_KORT[kaart.exemption]
                : null}
          </span>
        </td>

        <td className="hidden py-2.5 pr-3 align-top text-[11.5px] leading-snug text-[#9FB0A6] sm:table-cell">
          {kaart.aanbevolen ?? (
            <span className="text-[#7E8C82]">
              {kaart.exemption ? GEEN_RICHTLIJN_LABEL[kaart.exemption] : "Geen norm"}
            </span>
          )}
          {kaart.aanbevolenBron ? (
            <span className="block text-[10.5px] text-[#7E8C82]">{kaart.aanbevolenBron}</span>
          ) : null}
        </td>

        <td className="py-2.5 pl-2 align-top">
          <StatusMerk status={kaart.status} />
        </td>
      </tr>

      {kaart.footnote ? (
        <tr>
          <td colSpan={4} className="pb-2 pl-[18px] pr-3 pt-0">
            <p className="m-0 max-w-[62ch] text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
              {kaart.footnote}
            </p>
          </td>
        </tr>
      ) : null}

      {open ? (
        <tr id={paneelId}>
          <td colSpan={4} className="border-t border-white/5 bg-black/20 px-3 py-2">
            <CategorieDetailPaneel
              categorieId={kaart.id}
              categorieLabel={kaart.label}
              report={report}
              surface={surface}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

/**
 * P1 Voedingsbasis — categorie-overzicht: groente, vezels, eiwit, etc.
 * Eén bron (`factRows`); geen tweede berekening naast de ladder.
 */
export default function VoedingsbasisOverzicht({
  rijen,
  report,
  selfReport = null,
  surface,
}: {
  rijen: readonly NutritionFactRow[];
  report: NutritionLadderReport | null;
  /**
   * Het frequentie-zelfrapport, voor de doordruk. Los van `report`: die draagt
   * de slider-indices voor de tabel zelf, dit draagt de genormaliseerde vorm
   * waar de nutriënt-engine op draait. Null = doordruk toont de neutrale staat.
   */
  selfReport?: NutritionSelfReport | null;
  surface: string;
}) {
  const kaarten = useMemo(() => {
    const gebouwd = categorieKaarten(rijen, report);
    // Ruimte bovenaan; bij gelijke status blijft de bordvolgorde uit
    // VOEDSELGROEPEN staan (Array.prototype.sort is stabiel).
    return [...gebouwd].sort(
      (a, b) => STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status],
    );
  }, [rijen, report]);

  const [openCategorie, setOpenCategorie] = useState<string | null>(null);
  const kaartSignature = kaarten.map((kaart) => `${kaart.id}:${kaart.status}`).join("|");

  useEffect(() => {
    if (kaarten.length === 0) {
      return;
    }
    for (const kaart of kaarten) {
      trackEvent("nutrition_basis_category_view", {
        surface,
        category_id: kaart.id,
        status: kaart.status,
      });
      emitAccountClientEvent("nutrition.basis_category_viewed", {
        category_id: kaart.id,
        status: kaart.status,
        surface,
      });
    }
    clarityTag("nutrition_basis_overview", surface);
  }, [kaartSignature, kaarten, surface]);

  if (kaarten.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5">
        <p className="m-0 text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Doe de voedingscheck om per categorie te zien waar je staat ten opzichte van de
          richtlijn.
        </p>
      </div>
    );
  }

  const uitklapbaar = kaarten.filter((kaart) => heeftDetail(kaart.id)).length;

  return (
    <div className="mt-4">
      <p className="mb-2.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
        Per categorie
      </p>
      <p className="mb-3 max-w-[62ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
        Wat aanbevolen is en wat jij doet, waar de meeste ruimte zit bovenaan.
        {uitklapbaar > 0 ? " Klap een categorie open om te zien welke stoffen hij levert." : ""}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/25 px-3 py-1">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Voedingsbasis per categorie: jouw antwoord naast de richtlijn
          </caption>
          <thead>
            <tr>
              <th className="py-2 pr-3 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                Categorie
              </th>
              <th className="py-2 pr-3 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                Jij
              </th>
              <th className="hidden py-2 pr-3 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82] sm:table-cell">
                Richtlijn
              </th>
              <th className="py-2 pl-2 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {kaarten.map((kaart) => (
              <CategorieRij
                key={kaart.id}
                kaart={kaart}
                open={openCategorie === kaart.id}
                onToggle={() =>
                  setOpenCategorie((huidig) => (huidig === kaart.id ? null : kaart.id))
                }
                report={selfReport}
                surface={surface}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
