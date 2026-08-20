"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import DomainFreeActionsTile from "@/components/dashboard/domain/DomainFreeActionsTile";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainKompasHead from "@/components/dashboard/domain/DomainKompasHead";
import DomainLifestyleLadder from "@/components/dashboard/domain/DomainLifestyleLadder";
import MijnKeuzeTile from "@/components/dashboard/MijnKeuzeTile";
import { PILLAR } from "@/data/dashboard";
import {
  MOVEMENT_PRIORITY_LAYERS,
  type MovementPriorityId,
} from "@/data/movement/lifestyle-priorities";
import { clarityTag } from "@/lib/clarity";
import { useDomainLadderFocus } from "@/lib/domain-ladder-focus-context";
import { trackEvent } from "@/lib/ga4";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { MOVEMENT_LAYER_STATE_LABEL, movementLayerWhyWait } from "@/lib/movement-ladder";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import type { AccountPriorityPrefData, DashboardData, DashboardModel } from "@/types/dashboard";

type BewegingKompasScreenProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoVoortgangDomein: () => void;
  onPrefUpdated?: (pref: AccountPriorityPrefData | null) => void;
};

const SURFACE = "kompas_beweging";

/**
 * Kompas · Beweging: je stand, je prioriteiten, en wat je op de laag die je
 * aanklikt gratis kunt doen — in één beeld.
 *
 * De vorm is `renderE` uit de beweging-prebuild v3.6, die op zijn beurt de
 * vorm van slaap v2 `renderK` overneemt: kdome met ring en kop, de ladder
 * erin, één blok gratis opties eronder, en een CTA-stapel. Beweging was het
 * laatste domein dat daarvan afweek.
 *
 * Wat er sinds 20 augustus níét meer op staat is de dagkaart ("Vandaag ·
 * kracht"): een uitgelezen meting met een afvinkknop, midden op een scherm dat
 * over je stand en je keuze gaat. Afvinken hoort op Mijn Dag, waar je dag
 * staat — de knop hieronder brengt je erheen. Het beweegprogramma staat om
 * dezelfde reden uit: de inspanning gaat naar de supplementroute, en een
 * tweede spoor dat we niet doorontwikkelen hoort hier niet.
 *
 * Ook de deur naar het schap ("Maak een keuze") staat er sinds 20 augustus
 * niet meer als sluitregel op — dat was een tweede, overlappende weg naar
 * dezelfde bestemming als de deur op de Kompas-home (N1), en maakte dit
 * scherm voller dan de rest van de kop rechtvaardigt.
 */
export default function BewegingKompasScreen({
  model,
  data,
  onGoAgenda,
  onGoVoortgangDomein,
}: BewegingKompasScreenProps) {
  const movementReadout = data?.movementCheckinSnapshot ?? null;
  const focusLayerId = movementReadout?.ladder.focus ?? null;
  const [selectedLayerId, setSelectedLayerId] = useState<MovementPriorityId | null>(null);
  const { setFocus } = useDomainLadderFocus();

  const score = model.scores.beweging ?? 0;
  const daysAgo = data?.domainCheckDaysAgo?.beweging;
  const leefstijllijnRow = useMemo(
    () => buildLeefstijllijnRows(model).find((row) => row.pillarId === "beweging") ?? null,
    [model],
  );

  // Beginstand is de aanbeveling; kiezen wijkt daar tijdelijk van af. Zonder
  // beweegcheck is er geen winst-laag om op te beginnen — dan opent de ladder
  // op prioriteit 1. Dat claimt niets, maar het scherm is wel meteen bruikbaar.
  const activeLayerId = selectedLayerId ?? focusLayerId ?? 1;
  const activeLayer =
    MOVEMENT_PRIORITY_LAYERS.find((layer) => layer.id === activeLayerId) ?? null;

  // De contextkolom leest dezelfde laag. Opruimen bij verlaten, anders blijft
  // er context van beweging staan op een scherm dat er niet meer over gaat.
  useEffect(() => {
    setFocus({ domain: "beweging", layerId: activeLayerId });
    return () => setFocus(null);
  }, [activeLayerId, setFocus]);

  const measuredLine =
    daysAgo == null
      ? "nog geen beweegcheck"
      : daysAgo === 0
        ? "gemeten vandaag"
        : `gemeten ${daysAgo} ${daysAgo === 1 ? "dag" : "dagen"} geleden`;

  return (
    <DomainCockpitShell accent="#5A8F6A" ariaLabel="Beweging">
      <DomainKompasHead
        label={PILLAR.beweging.label}
        score={score}
        bandLabel={getScoreBandShortLabel(score)}
        measuredLine={measuredLine}
        delta={leefstijllijnRow?.delta ?? null}
        statusLine={
          movementReadout?.headline ??
          "Waar jouw winst zit lezen we af uit je beweegcheck. Je prioriteiten staan er wel — lees ze, en kies wat herkenbaar is."
        }
      >
        {/* De ladder staat er altijd. Wat de beweegcheck wél of niet oplevert
            bepaalt alleen of er staten naast de lagen staan — niet óf je je
            prioriteiten kunt lezen en aanklikken. */}
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
            {movementReadout
              ? "Waar je winst nu zit · tik een prioriteit aan"
              : "Van fundament naar finetunen · tik een prioriteit aan"}
          </p>
          <DomainLifestyleLadder
            layers={MOVEMENT_PRIORITY_LAYERS}
            {...(movementReadout
              ? {
                  layerStates: movementReadout.ladder.states,
                  stateLabels: MOVEMENT_LAYER_STATE_LABEL,
                }
              : {})}
            selectedLayer={activeLayerId}
            onSelectLayer={(layerId) => setSelectedLayerId(layerId as MovementPriorityId)}
            whyWait={(layerId) => movementLayerWhyWait(layerId as MovementPriorityId, focusLayerId)}
            domain="beweging"
            columns={2}
            surface={SURFACE}
          />
          {activeLayer ? (
            <p className="mt-3 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
              {activeLayer.summary}
            </p>
          ) : null}
          {focusLayerId != null && activeLayerId !== focusLayerId ? (
            <p className="mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
              Je kijkt naar prioriteit {activeLayerId}. Jouw grootste winst zit op prioriteit{" "}
              {focusLayerId}.{" "}
              <button
                type="button"
                onClick={() => setSelectedLayerId(focusLayerId)}
                className="cursor-pointer border-none bg-transparent p-0 text-left font-semibold text-[#9CC5A9] underline"
              >
                Terug daarheen
              </button>
            </p>
          ) : null}
        </div>
      </DomainKompasHead>

      {/* De opties op de laag die je aanklikte. Op prioriteit 5 en 6 staat
          niets klaar; dan legt het blok uit waarom, in plaats van te
          verdwijnen onder je vinger. */}
      {activeLayer ? (
        <DomainFreeActionsTile
          domain="beweging"
          layerId={activeLayer.id}
          layerName={activeLayer.name}
          actions={activeLayer.actions}
          isRecommended={activeLayer.id === focusLayerId}
          maxActions={2}
          emptyLine={
            activeLayer.id === 6
              ? "Of aanvullen aan de orde is, lees je in je beweegbeeld. Kiezen doe je daarna op je schap, niet hier."
              : (movementLayerWhyWait(activeLayer.id, focusLayerId) ?? activeLayer.summary)
          }
          surface={SURFACE}
        />
      ) : null}

      {/* N4: wat je koos, als handeling — naam + afvinken, nooit merk of prijs.
          Verdwijnt zolang je nog niets koos, dus hij kost het scherm pas
          hoogte als er iets te lezen valt. */}
      <MijnKeuzeTile domain="beweging" surface={SURFACE} />

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 @[560px]:flex-row">
          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_beweging_voortgang_click", { surface: SURFACE, state: "klaar" });
              clarityTag("dashboard_beweging_brug", "klaar");
              onGoVoortgangDomein();
            }}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-none bg-[#5A8F6A] px-4 text-[14px] font-semibold text-[#0E1810]"
          >
            Open je beweegbeeld <Icons.ChevronRight s={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_beweging_mijn_dag_click", { surface: SURFACE });
              onGoAgenda();
            }}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
          >
            Mijn Dag &rsaquo; vandaag
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-[#7E8C82]">
          Zelfrapportage, geen diagnose. Afvinken doe je op Mijn Dag, waar je dag staat.
          {data?.remeasure?.daysUntil != null
            ? data.remeasure.daysUntil <= 0
              ? " Je korte hertest kan nu."
              : ` Je korte hertest kan over ${data.remeasure.daysUntil} ${
                  data.remeasure.daysUntil === 1 ? "dag" : "dagen"
                }.`
            : ""}
        </p>
      </div>
    </DomainCockpitShell>
  );
}
