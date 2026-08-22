"use client";

import { useMemo } from "react";
import * as Icons from "@/components/app/icons";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainFreeActionsTile from "@/components/dashboard/domain/DomainFreeActionsTile";
import DomainKompasHead from "@/components/dashboard/domain/DomainKompasHead";
import DomainLifestyleLadder from "@/components/dashboard/domain/DomainLifestyleLadder";
import MijnKeuzeTile from "@/components/dashboard/MijnKeuzeTile";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { DOMAIN_KOMPAS_COPY, isDomainKompasDomain } from "@/lib/domain-kompas-copy";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import { useLadderLayerSelection } from "@/lib/domain-ladder-focus-context";
import { trackEvent } from "@/lib/ga4";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type DomainKompasScreenProps = {
  domain: PillarId;
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoVoortgangDomein: () => void;
};

/**
 * Kompas › domein: je stand, je prioriteiten, en wat je op de laag die je
 * aanklikt gratis kunt doen — in één beeld.
 *
 * De vorm is `renderE` uit de beweging-prebuild v3.6, die op zijn beurt de
 * vorm van slaap v2 `renderK` overneemt: één domeinkaart met ring en kop, de
 * ladder erin, één blok gratis opties eronder, en een CTA-stapel.
 *
 * Dit bestand heette tot 20 augustus `BewegingKompasScreen` en kende maar één
 * domein. Slaap kreeg daardoor een prebuild-iframe terwijl het al alles had om
 * hetzelfde scherm te dragen — staten per laag, een winst-laag, feitenrijen —
 * en de knoppen die naar `account_favorites` en `agenda_blocks` schrijven
 * halen de iframe-grens niet. Eén scherm voor beide houdt ze gelijk zonder dat
 * iemand het hoeft bij te houden; wat per domein verschilt is copy en staat in
 * {@link DOMAIN_KOMPAS_COPY}.
 *
 * Wat er sinds 20 augustus níét op staat is de dagkaart ("Vandaag · kracht"):
 * een uitgelezen meting met een afvinkknop, midden op een scherm dat over je
 * stand en je keuze gaat. Afvinken hoort op Mijn Dag, waar je dag staat — de
 * knop onderaan brengt je erheen. Ook de deur naar het schap ("Maak een
 * keuze") staat er niet als sluitregel op: dat was een tweede weg naar
 * dezelfde bestemming als de deur op de Kompas-home (N1).
 */
export default function DomainKompasScreen({
  domain,
  model,
  data,
  onGoAgenda,
  onGoVoortgangDomein,
}: DomainKompasScreenProps) {
  const ladder = getLeefstijlLadder(domain);
  const readout = resolveDomainLadderReadout(domain, data);
  const copy = isDomainKompasDomain(domain) ? DOMAIN_KOMPAS_COPY[domain] : null;

  const focusLayerId = readout?.focusLayer ?? null;
  // Beginstand is de aanbeveling; kiezen wijkt daar tijdelijk van af. Zonder
  // eigen domeincheck is er geen winst-laag om op te beginnen — dan opent de
  // ladder op prioriteit 1. Dat claimt niets, maar het scherm is wel meteen
  // bruikbaar. Inspector-chips schrijven dezelfde context.
  const { activeLayerId, selectLayer } = useLadderLayerSelection(domain, focusLayerId);

  const score = model.scores[domain] ?? 0;
  const daysAgo = data?.domainCheckDaysAgo?.[domain];
  const leefstijllijnRow = useMemo(
    () => buildLeefstijllijnRows(model).find((row) => row.pillarId === domain) ?? null,
    [model, domain],
  );

  if (!ladder || !copy) {
    return null;
  }

  const activeLayer = ladder.layers.find((layer) => layer.id === activeLayerId) ?? null;
  const measuredLine =
    daysAgo == null
      ? `nog geen ${copy.checkNoun}`
      : daysAgo === 0
        ? "gemeten vandaag"
        : `gemeten ${daysAgo} ${daysAgo === 1 ? "dag" : "dagen"} geleden`;

  return (
    <DomainCockpitShell accent="#5A8F6A" ariaLabel={PILLAR[domain].label}>
      <DomainKompasHead
        label={PILLAR[domain].label}
        score={score}
        bandLabel={getScoreBandShortLabel(score)}
        measuredLine={measuredLine}
        delta={leefstijllijnRow?.delta ?? null}
        statusLine={readout?.headline ?? copy.noCheckStatusLine}
      >
        {/* De ladder staat er altijd. Wat de check wél of niet oplevert bepaalt
            alleen of er staten naast de lagen staan — niet óf je je
            prioriteiten kunt lezen en aanklikken. */}
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
            {readout
              ? "Waar je winst nu zit · tik een prioriteit aan"
              : `${copy.ladderEyebrowWithoutCheck} · tik een prioriteit aan`}
          </p>
          <DomainLifestyleLadder
            layers={ladder.layers}
            {...(readout
              ? { layerStates: readout.layerStates, stateLabels: readout.stateLabels }
              : {})}
            selectedLayer={activeLayerId}
            onSelectLayer={selectLayer}
            whyWait={readout?.whyWait}
            domain={domain}
            columns={2}
            surface={copy.surface}
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
                onClick={() => selectLayer(focusLayerId)}
                className="cursor-pointer border-none bg-transparent p-0 text-left font-semibold text-[#9CC5A9] underline"
              >
                Terug daarheen
              </button>
            </p>
          ) : null}
        </div>
      </DomainKompasHead>

      {/* De opties op de laag die je aanklikte. Staat er niets klaar, dan legt
          het blok uit waarom, in plaats van te verdwijnen onder je vinger. */}
      {activeLayer ? (
        <DomainFreeActionsTile
          domain={domain}
          layerId={activeLayer.id}
          layerName={activeLayer.name}
          actions={activeLayer.actions}
          isRecommended={activeLayer.id === focusLayerId}
          maxActions={2}
          emptyLine={
            copy.emptyLine?.(activeLayer.id) ??
            readout?.whyWait(activeLayer.id) ??
            activeLayer.summary
          }
          surface={copy.surface}
        />
      ) : null}

      {/* N4: wat je koos, als snapshot — naam + herkomst, nooit merk of prijs.
          Afvinken op Mijn Dag. Verdwijnt zolang je nog niets koos. */}
      <MijnKeuzeTile domain={domain} surface={copy.surface} onGoAgenda={onGoAgenda} />

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 @[560px]:flex-row">
          <button
            type="button"
            onClick={() => {
              trackEvent(`dashboard_${domain}_voortgang_click`, {
                surface: copy.surface,
                state: "klaar",
              });
              clarityTag(`dashboard_${domain}_brug`, "klaar");
              onGoVoortgangDomein();
            }}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-none bg-[#5A8F6A] px-4 text-[14px] font-semibold text-[#0E1810]"
          >
            {copy.voortgangLabel} <Icons.ChevronRight s={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              trackEvent(`dashboard_${domain}_mijn_dag_click`, { surface: copy.surface });
              onGoAgenda();
            }}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
          >
            {copy.agendaLabel}
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
