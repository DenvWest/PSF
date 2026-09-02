"use client";

import { useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { nutritionSourceFavoriteId } from "@/lib/nutrition-favorite-source";
import {
  NUTRITION_ROUTE_CHOICES,
  ROUTE_STATUS_COLOR,
  ROUTE_STATUS_LABEL,
  isRouteChoiceAllowed,
  nutritionRouteChoiceId,
  resolveNutritionRouteChoice,
  routeChoiceBlockedReason,
  routeChoiceConfirmation,
  routeChoiceFavoriteTitle,
  routeChoiceLabel,
  type NutritionRouteChoice,
} from "@/lib/nutrition-route-choice";
import {
  proteinAgeNote,
  proteinTargetLine,
} from "@/lib/nutrition-protein-personal";
import type { ProteinTargetRange } from "@/lib/protein-target";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";

/**
 * Eén stof uit het voedingslogboek, met de keuze eraan vast.
 *
 * ## De vraag die dit blok beantwoordt
 *
 * Tot 1 september toonde het routepaneel op Voortgang wél waar je stond
 * ("Hier ligt winst · jij: 2 momenten") en welke voeding die route droeg, maar
 * eindigde het bij een vergelijk-link. De vraag die daartussen zit — *ga ik
 * dit uit mijn eten halen, uit een potje, of allebei?* — kon je nergens
 * beantwoorden. Dat is precies de keuze waar het platform over gaat, en hij
 * stond op geen enkel scherm.
 *
 * Dit blok legt hem neer: status uit de check, de drie knoppen, en meteen
 * daaronder wat die keuze concreet betekent — bij "uit mijn eten" de bronnen
 * die de route dragen, met dezelfde bewaar-naad die het routepaneel al had.
 *
 * ## Waarom de knoppen niet altijd alle drie open staan
 *
 * "Uit mijn eten" mag altijd. "Uit een supplement" en "Allebei" hangen aan
 * dezelfde deur als de vergelijk-link: de laag-6-poort én de per-stof-deur.
 * Zonder die regel zou een keuzeknop de omkering zijn die de poort juist moet
 * voorkomen — eerst je tafel, dan het potje. De dichte knop noemt zijn reden,
 * want een uitgegrijsde knop zonder uitleg leest als een storing.
 *
 * Zie {@link nutritionRouteChoiceId} voor waar de keuze belandt: in
 * `account_favorites`, niet in een eigen tabel.
 */

export default function NutrientRouteChoiceCard({
  status,
  gateOpen,
  surface,
  compact = false,
  open,
  onToggle,
  proteinTarget = null,
  ageRange = null,
}: {
  status: NutrientRouteStatus;
  gateOpen: boolean;
  surface: string;
  /**
   * De persoonlijke eiwit-range, of null zonder gewicht. Alleen de eiwitrij
   * gebruikt hem — zie `nutrition-protein-personal.ts` voor waarom eiwit de
   * enige stof is die hier een getal mag dragen.
   */
  proteinTarget?: ProteinTargetRange | null;
  /** De leeftijdsband, alleen om de hogere ondergrens bij 55+ uit te leggen. */
  ageRange?: string | null;
  /** Compact = Kompas: de bronnen blijven ingeklapt tot hij het bord kiest. */
  compact?: boolean;
  /**
   * Of deze stof openstaat. De rij is een samenvouwing en niet altijd een
   * dossier: vijf stoffen volledig uitgeklapt onder elkaar is een muur waarin
   * de keuze — het enige waar dit blok voor bestaat — verdrinkt. Ingeklapt is
   * hij één regel: stof, jouw antwoord, en waar je staat.
   *
   * De staat woont bij de lijst en niet hier, zodat die kan afdwingen dat er
   * hooguit één stof tegelijk openstaat.
   */
  open: boolean;
  onToggle: () => void;
}) {
  const { items, save, remove } = useVoortgangFavorites();
  const chosen = resolveNutritionRouteChoice(status.nutrient, items);
  // Op Kompas blijven de bronnen dicht tot er een reden is ze te tonen; die
  // reden is zijn keuze, niet ons aandringen.
  const [showSources, setShowSources] = useState(!compact);
  const statusColor = ROUTE_STATUS_COLOR[status.status];
  const statusLabel = ROUTE_STATUS_LABEL[status.status];
  const personalLine = proteinTargetLine(proteinTarget);
  const ageNote = proteinAgeNote(ageRange);

  const handleChoose = (choice: NutritionRouteChoice) => {
    // Eén route per stof: de vorige keuze gaat weg voordat de nieuwe komt,
    // anders staan er twee tegenstrijdige rijen op zijn schap.
    for (const option of NUTRITION_ROUTE_CHOICES) {
      if (option !== choice) {
        remove(nutritionRouteChoiceId(status.nutrient, option));
      }
    }
    save(
      {
        id: nutritionRouteChoiceId(status.nutrient, choice),
        title: routeChoiceFavoriteTitle(status.nutrient, choice),
        kind: choice === "bord" ? "activiteit" : "supplement",
        domain: "voeding",
        source: "mijn_keuze",
      },
      surface,
    );
    trackEvent("nutrition_route_choice", {
      surface,
      nutrient: status.nutrient,
      choice,
      route_status: status.status,
    });
    clarityTag("nutrition_route_keuze", `${status.nutrient}_${choice}`);
    if (choice !== "potje") {
      setShowSources(true);
    }
  };

  return (
    <li className="border-t border-white/[0.07] pt-3 first:border-t-0 first:pt-0">
      {/* De kop is de hele rij: stof, jouw antwoord, waar je staat. Ingeklapt
          is dat alles wat je ziet — genoeg om te scannen welke stof je aandacht
          wil, en niet meer. Een chevron in plaats van een link, want dit gaat
          nergens heen: het vouwt open op de plek waar je al staat. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left font-[inherit]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: statusColor }}
          />
          <span className="min-w-0 text-[13.5px] font-semibold leading-snug text-[#F1EFE8]">
            {status.label}
            {status.answerLabel ? (
              <span className="font-normal text-[#7E8C82]"> · jij: {status.answerLabel}</span>
            ) : null}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-[11.5px] font-semibold" style={{ color: statusColor }}>
            {statusLabel}
          </span>
          <Icons.ChevronDown
            s={14}
            style={{
              color: "#7E8C82",
              transition: "transform .18s ease",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        </span>
      </button>

      {/* Wat hij koos blijft ook ingeklapt zichtbaar: een keuze die verdwijnt
          zodra je de rij dichtklapt, leest als een keuze die niet is
          aangekomen. */}
      {!open && chosen ? (
        <p className="m-0 mt-1 pl-3.5 text-[11.5px] leading-snug text-[#9CC5A9]">
          {routeChoiceLabel(chosen)}
        </p>
      ) : null}

      {open ? (
      <>
      <p className="m-0 mt-1.5 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
        {status.route.thresholdNl}
        {status.route.sourceNl ? ` · ${status.route.sourceNl}` : ""}
      </p>

      {/* Eiwit is de enige stof die hier een getal krijgt, en dat is geen
          uitzondering op de milligram-regel maar iets anders: g/kg
          lichaamsgewicht is een gepubliceerde norm (PROT-AGE, ESPEN), geen
          optelsom van tabelwaarden die op `verified: false` staan. Zonder
          gewicht staat er niets — een verzonnen standaard zou het slechtste
          van twee werelden zijn. */}
      {status.nutrient === "protein" && personalLine ? (
        <p className="m-0 mt-1 text-[12px] font-semibold leading-relaxed text-[#9CC5A9]">
          {personalLine}
        </p>
      ) : null}
      {status.nutrient === "protein" && ageNote ? (
        <p className="m-0 mt-1 max-w-[58ch] text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
          {ageNote}
        </p>
      ) : null}

      {/* Een zwakke meting benoemt zichzelf, ook hier: wie op een proxy-route
          een keuze maakt, hoort te weten hoe hard het oordeel eronder is. */}
      {!compact && status.route.measurementCaveatNl ? (
        <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
          {status.route.measurementCaveatNl}
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {NUTRITION_ROUTE_CHOICES.map((choice) => {
          const allowed = isRouteChoiceAllowed(choice, status, gateOpen);
          const active = chosen === choice;
          if (!allowed) {
            return (
              <span
                key={choice}
                aria-disabled
                title={routeChoiceBlockedReason(status, gateOpen)}
                className="inline-flex min-h-[34px] cursor-not-allowed items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] font-semibold text-[#5F6B63]"
              >
                {routeChoiceLabel(choice)}
                <Icons.Lock s={11} style={{ color: "#5F6B63" }} />
              </span>
            );
          }
          return (
            <button
              key={choice}
              type="button"
              aria-pressed={active}
              onClick={() => handleChoose(choice)}
              className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition ${
                active
                  ? "border-[#5A8F6A] bg-[rgba(90,143,106,0.18)] text-[#9CC5A9]"
                  : "border-white/12 bg-transparent text-[#CDD7D0] hover:border-white/25"
              }`}
            >
              {active ? <Icons.Check s={11} /> : null}
              {routeChoiceLabel(choice)}
            </button>
          );
        })}
      </div>

      {chosen ? (
        <p className="m-0 mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          {routeChoiceConfirmation(chosen, status)}
        </p>
      ) : (
        <p className="m-0 mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
          {gateOpen && status.supplementDoorOpen
            ? status.doorReasonNl
            : status.route.boardEffortShortNl}
        </p>
      )}

      {/* Welke voeding het is — de tweede helft van de vraag. Op Kompas
          ingeklapt tot hij het bord kiest; op Keuze staat hij open, want dat
          is het scherm waar je je keuze uitwerkt. */}
      {status.sources.length > 0 && chosen !== "potje" ? (
        showSources ? (
          <div className="mt-3">
            <p className="m-0 mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
              Hiermee loop je die route
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {status.sources.map((source) => (
                <li key={source.key} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[12.5px] leading-snug text-[#F1EFE8]">
                      {source.labelNl}
                      <span className="text-[#7E8C82]"> · {source.portionNl}</span>
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[#7E8C82]">
                      {source.whyNl}
                    </span>
                  </span>
                  <FavoriteBronKnop
                    nutrient={status.nutrient}
                    sourceKey={source.key}
                    label={source.labelNl}
                    surface={surface}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowSources(true);
              trackEvent("nutrition_route_sources_open", {
                surface,
                nutrient: status.nutrient,
              });
            }}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12px] font-semibold text-[#9CC5A9]"
          >
            Welke voeding dat is
            <Icons.ChevronDown s={13} />
          </button>
        )
      ) : null}

      {/* De vergelijk-deur blijft achteraan staan, ook nu er een keuzeknop
          boven hangt: eerst wat je bord kan, dan pas wat een potje kan. */}
      {gateOpen && status.supplementDoorOpen && chosen !== "bord" ? (
        <Link
          href={status.comparisonPath}
          onClick={() =>
            trackEvent("nutrition_route_compare_click", {
              surface,
              nutrient: status.nutrient,
              route_status: status.status,
            })
          }
          className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#C8956C] no-underline hover:underline"
        >
          Vergelijk op prijs en kwaliteit
          <Icons.ArrowRight s={13} />
        </Link>
      ) : null}
      </>
      ) : null}
    </li>
  );
}

/**
 * De bewaar-knop per bron. Eigen component omdat hij zijn label uit de
 * eet-context haalt ("Zet op je lijst" voor een portie, niet voor een actie)
 * en zijn staat rechtstreeks uit de favorieten-context leest.
 */
function FavoriteBronKnop({
  nutrient,
  sourceKey,
  label,
  surface,
}: {
  nutrient: Parameters<typeof nutritionSourceFavoriteId>[0];
  sourceKey: string;
  label: string;
  surface: string;
}) {
  const { isSaved, save } = useVoortgangFavorites();
  const id = nutritionSourceFavoriteId(nutrient, sourceKey);
  const saved = isSaved(id);

  return (
    <button
      type="button"
      disabled={saved}
      onClick={() =>
        save(
          {
            id,
            title: label,
            kind: "activiteit",
            domain: "voeding",
            source: "mijn_keuze",
          },
          surface,
        )
      }
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
        saved
          ? "cursor-default border-[#5A8F6A]/40 text-[#9CC5A9]"
          : "cursor-pointer border-white/12 text-[#CDD7D0] hover:border-white/25"
      }`}
    >
      {saved ? "Staat op je lijst" : "Zet op je lijst"}
    </button>
  );
}
