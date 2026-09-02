"use client";

import { useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { clarityTag } from "@/lib/clarity";
import { nutritionSourceFavoriteId } from "@/lib/nutrition-favorite-source";
import { trackEvent } from "@/lib/ga4";
import {
  ROUTE_STATUS_COLOR,
  ROUTE_STATUS_LABEL,
} from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

/**
 * "Wat moet ik eten om hier vanaf te komen — en wanneer lukt dat niet meer?"
 *
 * Eén rij per nutriënt, met zijn eigen antwoord naast de drempel, de bronnen
 * die de route dragen, en pas achteraan de vergelijk-deur. Die volgorde is het
 * product: een tracker toont je alles tegelijk en laat de prioritering aan
 * jou, wij zeggen eerst wat je bord kan doen en pas daarna wat een potje kan.
 *
 * De deur staat per stof los van de laag-6-poort. De poort vraagt of je
 * eetbasis staat; de deur vraagt of het bord déze stof nog kán leveren. Beide
 * moeten open voordat er een vergelijk-link verschijnt — geen van de twee is
 * een omweg om de ander heen.
 */


function RouteRow({
  status,
  surface,
}: {
  status: NutrientRouteStatus;
  surface: string;
}) {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      trackEvent("nutrition_route_expanded", {
        nutrient: status.nutrient,
        route_status: status.status,
      });
      clarityTag("nutrition_route", status.nutrient);
    }
  };

  return (
    <li className="border-t border-[var(--divider)] pt-3.5 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start justify-between gap-3 border-none bg-transparent p-0 text-left font-[inherit]"
      >
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold leading-snug text-[#F1EFE8]">
            {status.label}
          </span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-[#9FB0A6]">
            {status.route.thresholdNl}
            {status.route.sourceNl ? ` · ${status.route.sourceNl}` : ""}
          </span>
          {status.answerLabel ? (
            <span className="mt-0.5 block text-[12px] leading-relaxed text-[#7E8C82]">
              Jij: {status.answerLabel}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span
            className="text-[11.5px] font-semibold"
            style={{ color: ROUTE_STATUS_COLOR[status.status] }}
          >
            {ROUTE_STATUS_LABEL[status.status]}
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

      {open ? (
        <div className="mt-3 flex flex-col gap-3">
          {/* Een zwakke meting benoemt zichzelf. Zonder deze regel leest een
              proxy-route als een harde grens, en dat is hij niet. */}
          {status.route.measurementCaveatNl ? (
            <p className="m-0 rounded-lg border border-[var(--divider)] px-3 py-2 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
              {status.route.measurementCaveatNl}
            </p>
          ) : null}

          {/* Wat je bord dagelijks vraagt, náást wat een potje vraagt. Dit is
              een vergelijking van moeite, niet van milligrammen — die hebben we
              niet en zouden we hier ook niet mogen tonen. */}
          <div>
            <p className="m-0 mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
              Wat je bord hiervoor vraagt
            </p>
            <p className="m-0 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
              {status.route.boardEffortNl}
            </p>
          </div>

          {status.sources.length > 0 ? (
            <div>
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
                      {/* Opname en spreiding staan hier omdat ze de keuze
                          veranderen: dezelfde hoeveelheid uit brood en uit
                          vlees is niet dezelfde uitkomst. */}
                      {source.bioavailabilityWhy ? (
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-[#7E8C82]">
                          {source.bioavailabilityWhy}
                        </span>
                      ) : null}
                      {source.preparationNote ? (
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-[#7E8C82]">
                          {source.preparationNote}
                        </span>
                      ) : null}
                    </span>
                    <FavoriteSaveButton
                      item={{
                        id: nutritionSourceFavoriteId(status.nutrient, source.key),
                        title: source.labelNl,
                        kind: "activiteit",
                        domain: "voeding",
                        source: "aanbevolen",
                      }}
                      surface={surface}
                      compact
                      labels={{ save: "Zet op je lijst", saved: "Staat op je lijst" }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border border-[var(--divider)] px-3 py-2.5">
            <p className="m-0 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
              {status.doorReasonNl}
            </p>
            {status.supplementDoorOpen ? (
              <Link
                href={status.comparisonPath}
                onClick={() =>
                  trackEvent("nutrition_route_compare_click", {
                    nutrient: status.nutrient,
                    route_status: status.status,
                  })
                }
                className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#C8956C] no-underline hover:underline"
              >
                Vergelijk op prijs en kwaliteit
                <Icons.ArrowRight s={13} />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

export default function NutrientRoutePanel({
  statuses,
  surface,
  gateOpen,
  gateReason,
}: {
  statuses: readonly NutrientRouteStatus[];
  surface: string;
  /** De laag-6-poort. Dicht = geen enkele vergelijk-link, ook niet per stof. */
  gateOpen: boolean;
  gateReason: string | null;
}) {
  if (statuses.length === 0) {
    return null;
  }

  // De poort overrulet de deur. Anders zou een open deur op één stof de hele
  // "eerst je tafel"-belofte omzeilen — dat is precies de omkering die de
  // poort moet voorkomen.
  const visible = gateOpen
    ? statuses
    : statuses.map((status) => ({
        ...status,
        supplementDoorOpen: false,
        doorReasonNl: gateReason ?? status.doorReasonNl,
      }));

  return (
    <section className="mt-4">
      <p className="m-0 mb-1 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
        Uit je eten of niet
      </p>
      <p className="m-0 mb-3 max-w-[58ch] text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
        Per stof: wat je ervoor moet eten, en wanneer je bord het niet meer
        dekt. Open een rij om te zien waarmee je die route loopt.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
        {visible.map((status) => (
          <RouteRow key={status.nutrient} status={status} surface={surface} />
        ))}
      </ul>
    </section>
  );
}
