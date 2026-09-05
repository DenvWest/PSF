"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import PrioriteitStrip from "@/components/dashboard/voortgang/PrioriteitStrip";
import NutrientRail from "@/components/dashboard/voortgang/NutrientRail";
import PrioriteitWerkvlak from "@/components/dashboard/voortgang/PrioriteitWerkvlak";
import DomeinOnderbouwing from "@/components/dashboard/voortgang/DomeinOnderbouwing";
import type { VerdictPanelSurface } from "@/components/dashboard/SupplementVerdictPanel";
import { PILLAR } from "@/data/dashboard";
import type { ProductStanceDomain } from "@/data/domain-product-stance";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import {
  buildDashboardAgendaHref,
  buildDashboardVandaagHref,
  type VoedingLaagId,
} from "@/lib/dashboard-url";
import { isDomainKompasDomain } from "@/lib/domain-kompas-copy";
import DomeinPaneel from "@/components/dashboard/voortgang/DomeinPaneel";
import VoedingVsSupplementTabel from "@/components/nutrition/VoedingVsSupplementTabel";
import VerhoudingTabel from "@/components/nutrition/VerhoudingTabel";
import MetenTijdLaag from "@/components/nutrition/MetenTijdLaag";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import {
  bouwNutrientRail,
  railFilterRegel,
  railVoorPrioriteit,
} from "@/lib/nutrient-rail";
import {
  bouwWerkbankPrioriteiten,
  kiesStartPrioriteit,
  type WerkbankPrioriteit,
} from "@/lib/domein-werkbank";
import { bouwDrieluik, kiesStartKnop } from "@/lib/voeding-drieluik";
import { buildLeefstijlprofielBronregel } from "@/lib/leefstijlprofiel-bronregel";
import { hasSchap } from "@/lib/schap-availability";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { buildDomeinPaneel } from "@/lib/domein-paneel";
import { buildMeetreeks, type Meetreeks } from "@/lib/voortgang-meetreeks";
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
  focusNutrient = null,
}: {
  domain: PillarId;
  data?: DashboardData;
  onOpenSchap: () => void;
  focusNutrient?: NutrientId | null;
}) {
  const mapping = STANCE_BY_PILLAR[domain];

  // Op voeding zelf is de eigen check (P1-P6, nutritionCheckinReadout) de
  // bron van waarheid — niet het oude losse voeding-inname-item, dat hier
  // een dubbele en verouderde gate zou zijn. De vergelijk-tabel toont de
  // rijen; zonder check blijft hij leeg.
  const nutritionGate = domain === "voeding" ? data?.nutritionCheckinReadout?.gate ?? null : null;
  const routeStatuses =
    domain === "voeding" ? data?.nutritionCheckinReadout?.routes ?? [] : [];
  const nutritionDone =
    domain === "voeding"
      ? nutritionGate?.open === true
      : buildRecommendationsEligibility(data?.nutritionIntake).nutritionLogCompleted === true;

  if (domain === "voeding") {
    return (
      <VoedingVsSupplementTabel
        statuses={routeStatuses}
        surface="leefstijlprofiel_voeding"
        gateOpen={nutritionGate?.open === true}
        compact
        focusNutrient={focusNutrient}
      />
    );
  }

  if (!mapping) {
    return null;
  }

  return (
    <div className="mt-4">
      <DomainSupplementStance
        domain={mapping.stance}
        verdicts={data?.supplementVerdicts ?? []}
        nutritionLogCompleted={nutritionDone}
        surface={mapping.surface}
        poortOnly
        onOpenFavorieten={onOpenSchap}
      />
    </div>
  );
}

/**
 * Wat er onder een ladder-laag hangt, per laag.
 *
 * De knop zegt wat je als eerste zou aanpakken; deze slots zeggen waaróm — op
 * de laag waar het argument thuishoort, niet als losse blokken erboven.
 *
 * **Voeding draait sinds 3 sep op drie knoppen** (zie `voeding-drieluik.ts`).
 * De zes ladderlagen blijven de bron; een knop kan er meer dan één tonen, en
 * die worden hier onder elkaar gerenderd in de volgorde die de knop noemt.
 *
 * - **P1 Voedingsbasis**: categorie-overzicht (groente, vezels, eiwit, …).
 * - **P2 Voedingskwaliteit**: de frequentievragen (suiker, bewerkingsgraad).
 * - **P4 Op jouw situatie**: volstaat je inname gegeven werk en sport?
 *   Die drie staan samen onder de knop Voedingsbasis: het zijn drie vragen
 *   over dezelfde maaltijden, uit dezelfde check.
 * - **P5 Meten & timing**: je eigen reeks, je logboek en de terugblik. De
 *   eerste knop, want dit is de enige laag waar je iets invoert.
 * - **P6 Aanvullen**: de vergelijking eten naast supplement.
 *
 * **P3 (Verhoudingen) heeft geen slot meer.** Die toonde de verdeling over je
 * eetmomenten — een detail van je logboek, geen eigen stap. Buiten voeding
 * heeft alleen P6 een slot; de andere lagen zijn daar leeg.
 */
function NutritionLayerSlot({
  layerId,
  domain,
  data,
  onOpenSchap,
  p6FocusNutrient,
  meetreeks,
}: {
  layerId: number;
  domain: PillarId;
  data?: DashboardData;
  onOpenSchap: () => void;
  p6FocusNutrient: NutrientId | null;
  meetreeks: Meetreeks | null;
}) {
  if (layerId === 6) {
    return (
      <LayerSixSlot
        domain={domain}
        data={data}
        onOpenSchap={onOpenSchap}
        focusNutrient={p6FocusNutrient}
      />
    );
  }
  if (domain !== "voeding") {
    return null;
  }

  const readout = data?.nutritionCheckinReadout ?? null;

  if (layerId === 1) {
    return (
      <VerhoudingTabel
        rijen={readout?.factRows ?? []}
        surface="dashboard"
        compact
        titel="Voedingsstatus"
      />
    );
  }

  if (layerId === 2 || layerId === 4) {
    return null;
  }

  if (layerId === 5) {
    return <MetenTijdLaag meetreeks={meetreeks} surface="leefstijlprofiel_voeding" />;
  }

  return null;
}

export default function LeefstijlprofielDomeinScherm({
  data,
  domain,
  adviesExtra,
  urlLayer = null,
  onUrlLayerChange,
  onBack,
  onOpenSchap,
}: {
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  adviesExtra?: ReactNode;
  /** Deep link vanuit de rail/topnav: een van de drie knoppen op Voeding. */
  urlLayer?: VoedingLaagId | null;
  onUrlLayerChange?: (layer: VoedingLaagId | null) => void;
  onBack: () => void;
  onOpenSchap: (domain: PillarId) => void;
}) {
  const pillar = PILLAR[domain];
  const daysAgo = data?.domainCheckDaysAgo?.[domain];
  const readout = resolveDomainLadderReadout(domain, data);
  const meetreeks = useMemo(
    () => buildMeetreeks(data?.domainMeasurements?.[domain] ?? []),
    [data?.domainMeasurements, domain],
  );

  // De domeinscore komt uit het nieuwste meetmoment van dit domein. Dat is
  // dezelfde bron als de reeks eronder — geen tweede pad naar hetzelfde cijfer,
  // en dus geen kans dat paneel en grafiek uiteenlopen.
  //
  // `PILLAR_SCORE_KEYS` uit foundation-pyramid is hier bewust níét gebruikt:
  // dat is een ander PillarId-vocabulaire (Engels: "sleep", "nutrition") dan
  // het dashboard hanteert (Nederlands: "slaap", "voeding").
  const domainScore = meetreeks.moments[0]?.score ?? null;

  const paneel = useMemo(
    () =>
      buildDomeinPaneel({
        meetreeks,
        score: domainScore,
        daysAgo: daysAgo ?? null,
        hermetingLabel: data?.remeasure?.dueDate ?? null,
      }),
    [meetreeks, domainScore, data?.remeasure?.dueDate, daysAgo],
  );

  const [picked, setPicked] = useState<{
    domain: PillarId;
    layer: number | null;
    urlLayer: number | null;
  } | null>(null);
  const [p6FocusNutrient, setP6FocusNutrient] = useState<NutrientId | null>(null);

  /** De prioriteiten van dit domein, met hun staat en aantal feiten. */
  const prioriteiten = useMemo(
    () =>
      bouwWerkbankPrioriteiten({
        domain,
        layerStates: readout?.layerStates,
        evidenceByLayer: readout?.evidenceByLayer,
        focusLayer: readout?.focusLayer ?? null,
      }),
    [domain, readout],
  );

  /**
   * Voeding draait op drie knoppen, de andere domeinen op hun zes ladderlagen.
   *
   * Waarom alleen voeding: daar is elk van de zes lagen gevuld, en juist die
   * volheid maakte het scherm onleesbaar. Bij slaap, beweging, stress en
   * verbinding is alleen laag 6 gevuld — daar bestaat de drukte niet, en zou
   * hernoemen naar drie knoppen betekenen dat er namen verzonnen worden voor
   * lagen die niets tonen.
   */
  const isDrieluik = domain === "voeding";

  const drieluik = useMemo(
    () => (isDrieluik ? bouwDrieluik(prioriteiten) : []),
    [isDrieluik, prioriteiten],
  );

  /**
   * De knoppen zoals de strip ze toont — drie op voeding, de zes ladderlagen
   * daarbuiten. Eén vorm, zodat de strip niet hoeft te weten welk model
   * eronder ligt.
   */
  const knoppen: WerkbankPrioriteit[] = useMemo(
    () =>
      isDrieluik
        ? drieluik.map((knop) => ({
            id: knop.laag,
            naam: knop.naam,
            samenvatting: knop.samenvatting,
            staat: knop.staat,
            feiten: knop.feiten,
            isWinst: knop.isWinst,
          }))
        : [...prioriteiten].sort((a, b) => a.id - b.id),
    [isDrieluik, drieluik, prioriteiten],
  );

  /**
   * Jouw eigen keuze, maar alleen die van dít domein.
   *
   * De keuze draagt zijn domein mee in plaats van bij het wisselen gewist te
   * worden door een effect: zo staat het werkvlak meteen goed bij de eerste
   * render van een nieuw domein, in plaats van eerst de laag van het vorige
   * domein te tonen en die daarna te corrigeren.
   */
  const pickedForDomain =
    picked?.domain === domain && picked.urlLayer === (urlLayer ?? null) ? picked : null;

  /**
   * Welke knop openstaat.
   *
   * Nooit `null` zolang het domein knoppen heeft: een leeg werkvlak naast een
   * gevulde strip leest als een fout. Op voeding opent hij zonder deeplink op
   * Meten & timing — daar vul je in, en de rest is daar een uitkomst van.
   */
  const actievePrioriteitId = (() => {
    if (pickedForDomain?.layer != null) {
      return pickedForDomain.layer;
    }
    if (isDrieluik) {
      const start = kiesStartKnop({ urlLayer, knoppen: drieluik });
      return drieluik.find((knop) => knop.id === start)?.laag ?? null;
    }
    return kiesStartPrioriteit({
      urlLayer,
      focusLayer: readout?.focusLayer ?? null,
      prioriteiten,
    });
  })();

  const actievePrioriteit =
    knoppen.find((rij) => rij.id === actievePrioriteitId) ?? null;

  /**
   * De lagen die onder de open knop hangen. Op voeding kan dat er meer dan één
   * zijn (Voedingsbasis draagt 1, 2 en 4); daarbuiten is het altijd de laag
   * zelf.
   */
  const actieveLagen: readonly number[] =
    actievePrioriteitId == null
      ? []
      : isDrieluik
        ? (drieluik.find((knop) => knop.laag === actievePrioriteitId)?.lagen ?? [
            actievePrioriteitId,
          ])
        : [actievePrioriteitId];

  /**
   * De feiten van alle lagen onder deze knop, in de volgorde waarin de lagen
   * getoond worden.
   */
  const actieveFeiten = actieveLagen.flatMap(
    (laag) => readout?.evidenceByLayer?.[laag] ?? [],
  );

  const hasConclusion = readout !== null;

  const handleKiesPrioriteit = (next: number) => {
    setPicked({ domain, layer: next, urlLayer: urlLayer ?? null });
    setP6FocusNutrient(null);
    trackEvent("domein_prioriteit_gekozen", {
      domain,
      surface: "leefstijlprofiel_domein",
      prioriteit: next,
    });
    clarityTag("domein_prioriteit", `${domain}_p${next}`);
    if (domain === "voeding") {
      onUrlLayerChange?.(next === 1 || next === 5 || next === 6 ? next : null);
    }
  };

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

  const handleGoP6 = (nutrient: NutrientId) => {
    setP6FocusNutrient(nutrient);
    setPicked({ domain, layer: 6, urlLayer: domain === "voeding" ? 6 : (urlLayer ?? null) });
    if (domain === "voeding") {
      onUrlLayerChange?.(6);
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

  /**
   * De stoffen voor de staande rail. Alleen voeding: de andere domeinen hebben
   * geen nutriëntschatting, en een lege kolom naast een gevuld werkvlak is
   * erger dan geen kolom.
   */
  const alleNutrienten = useMemo(
    () =>
      domain === "voeding"
        ? bouwNutrientRail(data?.nutritionCheckinReadout?.sufficiency.nutrients ?? [])
        : [],
    [domain, data?.nutritionCheckinReadout],
  );

  /**
   * De kolom beweegt mee met de prioriteit die openstaat, niet met de
   * sortering — zie `railVoorPrioriteit` voor waarom die twee assen los
   * blijven.
   */
  const nutrientRail = useMemo(
    () => railVoorPrioriteit(alleNutrienten, actievePrioriteitId),
    [alleNutrienten, actievePrioriteitId],
  );

  /**
   * De onderbouwing van de actieve prioriteit, als één knop.
   *
   * Staat op twee plekken in de boom — in de kolom op desktop, onder de feiten
   * op mobiel — maar is één element: dezelfde bronnen horen niet twee keer in
   * beeld te staan, en welke plek zichtbaar is regelt de layout.
   */
  const onderbouwingKnop =
    actievePrioriteit && actieveFeiten.length > 0 ? (
      <DomeinOnderbouwing
        rijen={actieveFeiten}
        prioriteitNaam={actievePrioriteit.naam}
        domain={domain}
        surface="leefstijlprofiel_domein"
      />
    ) : null;

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

      {/* De werkbank.

          **Waarom er nog maar één kolom is (3 sep).** De stoffen stonden hier
          als staande rail links naast het werkvlak. Dat was de derde
          navigatiekolom op één scherm — de shell-zijbalk draagt al de
          domeinen, de strip draagt de prioriteiten — en op de breedte die de
          cockpit overhoudt (~744px in de middenzone) knelde hij het werkvlak
          tot een strook. De stoffen zijn geen navigatie: het is een
          meetinstrument dat je erbij pakt. Daarom staan ze nu ingeklapt
          bovenaan het werkvlak, als één regel die zegt hoeveel stoffen ruimte
          laten zien, en klap je ze open wanneer je ze naast je prioriteit wilt
          leggen. Uitgeklapt beweegt de kolom mee met de laag die openstaat.

          De prioriteiten blijven horizontaal: dat is een route (eerst je
          basis, dan kwaliteit, dan verhoudingen), en een route lees je van
          links naar rechts. */}
      <div className="@container">
        <PrioriteitStrip
          prioriteiten={knoppen}
          actief={actievePrioriteitId}
          onKies={handleKiesPrioriteit}
          stateLabels={readout?.stateLabels}
        />

        <div className="mt-4 flex min-w-0 flex-col gap-3.5">
          {isDrieluik ? null : (
            <DomeinPaneel
              paneel={paneel}
              domain={domain}
              domainLabel={pillar.label}
              surface="leefstijlprofiel_domein"
              onGoMacro={onBack}
            />
          )}

          {nutrientRail.length > 0 && !isDrieluik ? (
            <NutrientRail
              rijen={nutrientRail}
              surface="leefstijlprofiel_domein"
              focusNutrient={p6FocusNutrient}
              onKiesNutrient={handleGoP6}
              filterRegel={railFilterRegel(actievePrioriteitId)}
            />
          ) : null}

          {actievePrioriteit ? (
            <PrioriteitWerkvlak
              prioriteit={actievePrioriteit}
              aantal={actievePrioriteit.id}
              totaal={prioriteiten.length}
              feiten={actieveFeiten}
              meetreeks={meetreeks}
              kleur={pillar.color}
              staatLabel={
                actievePrioriteit.staat && readout?.stateLabels
                  ? readout.stateLabels[actievePrioriteit.staat]
                  : null
              }
              waaromWachten={
                readout && actievePrioriteitId != null
                  ? readout.whyWait(actievePrioriteitId)
                  : null
              }
              onderbouwing={onderbouwingKnop}
              tabelOnly={isDrieluik}
              kompasHref={
                isKompasDomain && !isDrieluik
                  ? buildDashboardVandaagHref(domain)
                  : undefined
              }
              onKompas={() => {
                trackEvent("domein_prioriteit_kompas_click", {
                  domain,
                  surface: "leefstijlprofiel_domein",
                  prioriteit: actievePrioriteitId ?? 0,
                });
                clarityTag("domein_prioriteit_kompas", domain);
              }}
            >
              {/* Eén knop kan meer dan één ladderlaag dragen: Voedingsbasis
                  toont de basis, de kwaliteit en je situatie onder elkaar. */}
              {isKompasDomain
                ? actieveLagen.map((laag) => (
                    <NutritionLayerSlot
                      key={laag}
                      layerId={laag}
                      domain={domain}
                      data={data}
                      onOpenSchap={handleOpenSchap}
                      p6FocusNutrient={p6FocusNutrient}
                      meetreeks={meetreeks}
                    />
                  ))
                : null}
            </PrioriteitWerkvlak>
          ) : null}

          {adviesExtra}

          {isDrieluik ? null : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Op de domeinen zonder eigen Kompas-scherm droeg de ladder de weg
                naar Mijn Dag; die weg blijft bestaan nu de ladder hier weg is —
                kiezen en afvinken gebeurt daar, niet op dit scherm. */}
            {!isKompasDomain ? (
              <button
                type="button"
                onClick={handleGoMijnDag}
                className="cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
              >
                Plan dit op Mijn Dag ›
              </button>
            ) : null}

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
          )}
        </div>
      </div>
    </section>
  );
}
