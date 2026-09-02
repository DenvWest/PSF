"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";
import type { VerdictPanelSurface } from "@/components/dashboard/SupplementVerdictPanel";
import { PILLAR } from "@/data/dashboard";
import type { ProductStanceDomain } from "@/data/domain-product-stance";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardAgendaHref, buildDashboardVandaagHref } from "@/lib/dashboard-url";
import { isDomainKompasDomain } from "@/lib/domain-kompas-copy";
import NutrientRoutePanel from "@/components/dashboard/voortgang/NutrientRoutePanel";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import { buildLeefstijlprofielBronregel } from "@/lib/leefstijlprofiel-bronregel";
import { hasSchap } from "@/lib/schap-availability";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { buildMeetreeks } from "@/lib/voortgang-meetreeks";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

/**
 * Leefstijlprofiel · domein — **wat staat er onder dit domein?**
 *
 * De ladder is het dossier: per laag jij mat, de lat, jij koos. Kiezen
 * gebeurt op Kompas, afvinken op Mijn Dag. Score, balk en de volle
 * meetreeks wonen op Voortgang-home. Geen productkaart, geen prijs
 * (lock 4). Laag 6 is de poort naar het schap.
 *
 * Verbinding blijft `choose`: Kompas-verbinding is nog een iframe.
 */

const STANCE_BY_PILLAR: Partial<
  Record<PillarId, { stance: ProductStanceDomain; surface: VerdictPanelSurface }>
> = {
  beweging: { stance: "movement", surface: "leefstijlprofiel_beweging" },
  slaap: { stance: "sleep", surface: "leefstijlprofiel_slaap" },
  voeding: { stance: "nutrition", surface: "leefstijlprofiel_voeding" },
  stress: { stance: "stress", surface: "leefstijlprofiel_stress" },
};

function LayerSixSlot({
  domain,
  data,
  onOpenSchap,
}: {
  domain: PillarId;
  data?: DashboardData;
  onOpenSchap: () => void;
}) {
  const mapping = STANCE_BY_PILLAR[domain];
  const showWearable = domain === "beweging" || domain === "slaap";
  const nutritionDone =
    buildRecommendationsEligibility(data?.nutritionIntake).nutritionLogCompleted === true;

  // Op voeding zelf geldt een derde voorwaarde bovenop "check gedaan": er mag
  // geen gat meer openstaan in de eetbasis (BESLUIT_VOEDING_PIRAMIDE §E). Dat
  // is de enige formulering die "eerst je tafel, dan het potje" waarmaakt in
  // plaats van hem alleen te citeren — en de reden dat hij dicht is, staat
  // erbij, telkens in de bewoording van zijn eigen check.
  const nutritionGate = domain === "voeding" ? data?.nutritionCheckinReadout?.gate ?? null : null;
  const routeStatuses =
    domain === "voeding" ? data?.nutritionCheckinReadout?.routes ?? [] : [];
  const nutritionGateClosed = domain === "voeding" && nutritionGate?.open !== true;

  if (!mapping && !showWearable) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {nutritionGateClosed ? (
        <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          {nutritionGate?.reason ??
            "Zonder voedingscheck weten we niet of er iets aan te vullen valt."}
        </p>
      ) : null}
      {/* Op voeding staat de vraag "haal ik dit uit mijn eten" vóór het schap:
          de vijf routes zijn wat P6 te bieden heeft zolang de poort dicht is,
          en de context eromheen zodra hij open gaat. */}
      {domain === "voeding" && routeStatuses.length > 0 ? (
        <NutrientRoutePanel
          statuses={routeStatuses}
          surface="leefstijlprofiel_voeding"
          gateOpen={nutritionGate?.open === true}
          gateReason={nutritionGate?.reason ?? null}
        />
      ) : null}
      {mapping && !nutritionGateClosed ? (
        <DomainSupplementStance
          domain={mapping.stance}
          verdicts={data?.supplementVerdicts ?? []}
          nutritionLogCompleted={nutritionDone}
          surface={mapping.surface}
          poortOnly
          onOpenFavorieten={onOpenSchap}
        />
      ) : null}
      {showWearable ? (
        <p className="m-0 max-w-[58ch] text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
          Een wearable-reeks komt hier later bij. Tot die tijd is je check de meting.
        </p>
      ) : null}
    </div>
  );
}

export default function LeefstijlprofielDomeinScherm({
  data,
  domain,
  adviesExtra,
  onBack,
  onOpenSchap,
}: {
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  adviesExtra?: ReactNode;
  onBack: () => void;
  onOpenSchap: (domain: PillarId) => void;
}) {
  const pillar = PILLAR[domain];
  const daysAgo = data?.domainCheckDaysAgo?.[domain];
  const ladder = getLeefstijlLadder(domain);
  const readout = resolveDomainLadderReadout(domain, data);
  const meetreeks = useMemo(
    () => buildMeetreeks(data?.domainMeasurements?.[domain] ?? []),
    [data?.domainMeasurements, domain],
  );

  const [picked, setPicked] = useState<{ domain: PillarId; layer: number | null } | null>(
    null,
  );
  const pickedForDomain = picked?.domain === domain ? picked : null;
  const openLadderLayer = pickedForDomain
    ? pickedForDomain.layer
    : (readout?.focusLayer ?? null);

  const hasConclusion = readout !== null;

  useEffect(() => {
    trackEvent("domain_tool.snapshot_viewed", {
      domain,
      surface: "leefstijlprofiel_domein",
      has_conclusion: hasConclusion,
    });
    clarityTag("dashboard_leefstijlprofiel_domein", domain);
  }, [domain, hasConclusion]);

  const handleGoMijnDag = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "agenda",
      surface: "leefstijlprofiel_domein",
    });
    const href = buildDashboardAgendaHref();
    if (typeof window !== "undefined" && window.location.pathname === "/dashboard") {
      window.history.pushState(null, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }
    if (typeof window !== "undefined") {
      window.location.assign(href);
    }
  };

  const handleOpenSchap = () => {
    emitAccountClientEvent("choice.shelf_opened", {
      domain,
      from_state: "leefstijlprofiel",
      surface: "leefstijlprofiel_domein",
    });
    clarityTag("dashboard_leefstijlprofiel_schap", domain);
    onOpenSchap(domain);
  };

  const bronregel = buildLeefstijlprofielBronregel({
    domain,
    daysAgo,
    dueDate: data?.remeasure?.dueDate ?? null,
    hasReadout: readout !== null,
  });

  const isKompasDomain = isDomainKompasDomain(domain);

  return (
    <section aria-label={`Leefstijlprofiel — ${pillar.label}`} className="pt-4">
      <div className="mb-5">
        <VoortgangTerugLink onBack={onBack} />
        <div className="min-w-0">
          {/* De balk in de header noemt het domein al; op mobiel zou deze
              bovenkop dat woordelijk herhalen. */}
          <p className="m-0 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)] md:block">
            {pillar.label}
          </p>
          <h1
            className="font-serif text-[clamp(22px,5.4vw,28px)] font-normal leading-[1.15] text-[#F1EFE8] text-balance md:mt-1.5"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            Wat er onder je {pillar.label.toLowerCase()} staat
          </h1>
          {bronregel ? (
            <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
              {bronregel}
            </p>
          ) : null}
          {readout?.headline ? (
            <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
              {readout.headline}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {ladder ? (
          <PrioriteitenLadder
            layers={ladder.layers}
            intro={ladder.intro}
            eyebrow={ladder.eyebrow}
            safetyNetLine={ladder.safetyNetLine}
            domain={domain}
            surface={ladder.surface}
            layerStates={readout?.layerStates}
            stateLabels={readout?.stateLabels}
            focusLayer={readout?.focusLayer ?? null}
            whyWait={readout ? (layerId) => readout.whyWait(layerId) : undefined}
            recommendedLayerIds={readout?.recommendedLayerIds}
            evidenceByLayer={readout?.evidenceByLayer}
            meetreeks={meetreeks}
            chartColor={pillar.color}
            openLayer={readout ? openLadderLayer : undefined}
            onOpenLayerChange={
              readout ? (next) => setPicked({ domain, layer: next }) : undefined
            }
            layerExtra={
              isKompasDomain
                ? (layerId) =>
                    layerId === 6 ? (
                      <LayerSixSlot domain={domain} data={data} onOpenSchap={handleOpenSchap} />
                    ) : null
                : undefined
            }
            {...(isKompasDomain
              ? { variant: "explain" as const, kompasHref: buildDashboardVandaagHref(domain) }
              : { onGoAgenda: handleGoMijnDag })}
          />
        ) : null}

        {readout &&
        readout.focusLayer != null &&
        openLadderLayer != null &&
        openLadderLayer !== readout.focusLayer ? (
          <p className="mt-0 max-w-[58ch] text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Je kijkt naar prioriteit {openLadderLayer}. Jouw grootste winst zit op prioriteit{" "}
            {readout.focusLayer}.{" "}
            <button
              type="button"
              onClick={() => setPicked({ domain, layer: readout.focusLayer })}
              className="cursor-pointer border-none bg-transparent p-0 text-left font-semibold text-[#9CC5A9] underline"
            >
              Terug daarheen
            </button>
          </p>
        ) : null}

        {adviesExtra}

        {hasSchap(domain) ? (
          <button
            type="button"
            onClick={handleOpenSchap}
            className="cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
          >
            Open je keuze ›
          </button>
        ) : null}
      </div>
    </section>
  );
}
