"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import MovementCockpit, {
  type MovementDoneState,
} from "@/components/dashboard/beweging/MovementCockpit";
import MovementFreeActionsTile from "@/components/dashboard/beweging/MovementFreeActionsTile";
import MovementLogPanel from "@/components/dashboard/MovementLogPanel";
import DomainAttentionBar from "@/components/dashboard/kompas/DomainAttentionBar";
import { PILLAR } from "@/data/dashboard";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { MOVEMENT_PRIORITY_LAYERS } from "@/data/movement/lifestyle-priorities";
import { isPlanStepHidden, resolveActionKey } from "@/lib/day-model";
import {
  adviceMayOutrankDayStep,
  resolveDayStepState,
  type DayStepFacts,
} from "@/lib/domain-ready-state";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import { getMovementNutritionHint } from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { buildDashboardVoortgangHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { MOVEMENT_LAYER_STATE_LABEL } from "@/lib/movement-ladder";
import { buildMovementAheadLine } from "@/lib/movement-plan-roadmap";
import { deriveMovementCurrent } from "@/lib/movement-target";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type {
  AccountPriorityPrefData,
  DashboardData,
  DashboardModel,
} from "@/types/dashboard";

const FooterLink = ({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-[18px] py-4 no-underline text-inherit transition hover:border-white/20 md:hidden"
  >
    {icon}
    <span className="flex-1 font-serif text-[16px] text-[#F1EFE8]">{label}</span>
    <Icons.ChevronRight s={18} style={{ color: "#9FB0A6", flexShrink: 0 }} />
  </Link>
);

function sessionFromModel(model: DashboardModel): IntakeSessionPayload {
  return {
    sessionId: "",
    symptoms: [],
    answers: model.answers ?? {},
    scores: model.domainScores,
    urgency: "",
    profile: "",
    timestamp: 0,
    ageRange: null,
    firstName: null,
  };
}

/** De ene analyse-readout die als kaart bovenkomt in de klaar-staat, en als
 * stille regel eronder blijft in de open-staat — nooit allebei (§C.3). */
function buildVoortgangSnapshotLine(row: {
  currentScore: number;
  baselineScore: number | null;
} | null): string | null {
  if (!row) {
    return null;
  }
  if (row.baselineScore != null && row.baselineScore !== row.currentScore) {
    return `Beweging staat op ${row.currentScore}, begonnen op ${row.baselineScore}.`;
  }
  return `Beweging staat op ${row.currentScore}.`;
}

export default function BewegingScreen({
  model,
  data,
  slot,
  nutritionLogCompleted = false,
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
  onGoVoortgangDomein,
  onPrefUpdated,
}: {
  model: DashboardModel;
  data?: DashboardData;
  slot: WeekDaySlot | null;
  nutritionLogCompleted?: boolean;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
  onGoVoortgangDomein: () => void;
  onPrefUpdated?: (pref: AccountPriorityPrefData | null) => void;
}) {
  const [doneState, setDoneState] = useState<MovementDoneState>({
    done: false,
    isStrengthSession: false,
  });
  // Bewaakt tegen een render-lus: zonder deze gelijkheidscheck geeft elke
  // aanroep een nieuw object-object door, en verliest React de setState-
  // bailout die het bij een ongewijzigde primitive wél had (zie MovementCockpit).
  const handleDoneChange = useCallback((next: MovementDoneState) => {
    setDoneState((prev) =>
      prev.done === next.done && prev.isStrengthSession === next.isStrengthSession
        ? prev
        : next,
    );
  }, []);
  const session = sessionFromModel(model);
  const nutritionHint = getMovementNutritionHint(session);

  const logEnabled = isMovementLogEnabled();
  const aheadLine = buildMovementAheadLine(model.movementPlanProgress?.currentPhaseId);

  // Klaar-staat-gate (C.4, gedeeld met alle domeinen): zolang er een open
  // dagstap staat is de doe-laag de enige primary; is de stap klaar, een
  // rustdag, of heeft een ander domein prioriteit, dan mag analyse/advies
  // prominenter worden.
  const isOwnStep = Boolean(slot && slot.isToday && slot.domain === "beweging");
  const hiddenStep = slot ? isPlanStepHidden(model, slot) : true;
  const activeStep = isOwnStep && !hiddenStep && slot != null;
  const plannedActionKey = activeStep && slot ? resolveActionKey(model, slot) : null;
  const dayStepFacts: DayStepFacts = {
    plannedActionKey,
    completedActionKeys:
      doneState.done && plannedActionKey ? [plannedActionKey] : [],
    isPriorityDomain: model.priority.id === "beweging",
  };
  const dayStepState = resolveDayStepState(dayStepFacts);
  const showAdvice = adviceMayOutrankDayStep(dayStepFacts);

  const leefstijllijnRow =
    buildLeefstijllijnRows(model).find((row) => row.pillarId === "beweging") ?? null;
  const snapshotLine = buildVoortgangSnapshotLine(leefstijllijnRow);
  const daysUntilRemeasure = data?.remeasure?.daysUntil ?? null;
  const score = model.scores.beweging ?? 0;
  const daysAgo = data?.domainCheckDaysAgo?.beweging;

  // De aandachtsbalk en de drie gratis acties komen uit dezelfde bron als de
  // ladder op Voortgang (P1, movement-ladder.ts): de winst-prioriteit is
  // afgeleid uit de check, niet een eigen tweede regel. Zonder check is er
  // niets af te leiden — dan blijven kdome en de handeling over, geen
  // aandachtsbalk en geen acties-tegel (§C1, BESLUIT_BEWEGING_V36).
  const movementReadout = data?.movementCheckinSnapshot ?? null;
  const focusPriorityId = movementReadout?.ladder.focus ?? null;
  const focusLayer = focusPriorityId
    ? (MOVEMENT_PRIORITY_LAYERS.find((layer) => layer.id === focusPriorityId) ?? null)
    : null;

  const goToVoortgang = (state: "open" | "klaar") => {
    trackEvent("dashboard_beweging_voortgang_click", {
      surface: "kompas_beweging",
      state,
    });
    clarityTag("dashboard_beweging_brug", state);
    onGoVoortgangDomein();
  };

  // §E.3-uitzondering: geen permanente CTA-tegel op de doe-surface, alleen een
  // regel als het voorstel nog op de intake draait (geen beweegcheck gedaan).
  const movementCurrent = deriveMovementCurrent(model.answers ?? {});
  const showBeweegcheckNudge = showAdvice && movementCurrent.source !== "beweegcheck";

  // De deur: label-only, nooit een productnaam. Staat je voeding bekend, dan
  // wijst hij naar het oordeel op Voortgang — niet rechtstreeks naar een
  // supplement (was: /supplementen/eiwitpoeder, een lock-L2-schending).
  const nutritionBridgeHref = nutritionLogCompleted
    ? buildDashboardVoortgangHref("domein", null, "beweging")
    : "/intake/voeding?from=dashboard&kompas=beweging";
  const nutritionBridgeLabel = nutritionLogCompleted
    ? "Bekijk je oordeel op Voortgang"
    : "Doe de voedingscheck";

  // "Maak een keuze" (N1): één label, één bestemming, geen tweede vorm.
  // Favorieten · Beweging draagt sinds P4 zowel Aanbevolen/Mijn keuze als
  // het schap zelf (FavorietenBewegingSection) — er is geen aparte scherm-B-
  // route, dus deze surface doet dubbele dienst. De aanbieders-laag (PT,
  // groepslessen) ontbreekt daar nog bewust, zie schap-basis-cards.ts.
  const handleMaakEenKeuze = () => {
    emitAccountClientEvent("choice.shelf_opened", {
      domain: "beweging",
      from_state: "vandaag",
      surface: "kompas_beweging",
    });
    clarityTag("dashboard_beweging_brug", "maak_een_keuze");
  };

  return (
    <div className="flex flex-col gap-3 pb-16 md:pb-0">
      {/* kdome — score-ring + aandachtsbalk (v3.6 renderK r.1475). Geen CTA
          hierin: dit is een compact feitenblok, geen tweede primary naast
          de dagstap (§C.4, houdt de klaar-staat-gate intact). */}
      <CockpitTile ariaLabel="Beweging — je stand">
        <div className="flex items-center gap-4">
          <KompasDomainGauge value={score} label={PILLAR.beweging.label} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-relaxed text-[#F1EFE8]">
              {getScoreBandShortLabel(score)}
              {leefstijllijnRow?.delta != null ? (
                <span className="ml-2 inline-flex align-middle">
                  <DeltaBadge delta={leefstijllijnRow.delta} />
                </span>
              ) : null}
            </p>
            {leefstijllijnRow ? (
              <div className="mt-2">
                <Sparkline data={leefstijllijnRow.trend} color={PILLAR.beweging.color} w={96} h={28} />
              </div>
            ) : null}
            <p className="mt-2 text-[12px] text-[#7E8C82]">
              {daysAgo != null
                ? `Laatst gemeten ${daysAgo === 0 ? "vandaag" : `${daysAgo} dagen geleden`}.`
                : "Nog niet apart gemeten."}
            </p>
            {dayStepState === "other_domain_priority" ? (
              <p className="mt-2 text-[12.5px] leading-relaxed text-[#CDD7D0]">
                Een ander domein heeft vandaag prioriteit.
              </p>
            ) : null}
          </div>
        </div>
        {movementReadout ? (
          <DomainAttentionBar
            layers={MOVEMENT_PRIORITY_LAYERS}
            states={movementReadout.ladder.states}
            stateLabels={MOVEMENT_LAYER_STATE_LABEL}
          />
        ) : null}
      </CockpitTile>

      <MovementCockpit
        model={model}
        slot={slot}
        onGoAgenda={onGoAgenda}
        onMakePriority={onMakePriority}
        makePriorityBusy={makePriorityBusy}
        onDoneChange={handleDoneChange}
        onPrefUpdated={onPrefUpdated}
      />

      {/* Drie gratis dingen op de winst-prioriteit — alleen ná de klaar-staat-
          gate (§C.4): zolang de dagstap open staat is die de enige primary,
          niet deze aanvullende suggesties. */}
      {showAdvice && focusLayer ? (
        <MovementFreeActionsTile
          priorityId={focusLayer.id}
          priorityName={focusLayer.name}
          actions={focusLayer.actions}
        />
      ) : null}

      {/* CTA-stapel (v3.6 renderK r.1497): primair naar Voortgang, met de
          hermeting-regel als footnote. Alleen ná de klaar-staat-gate. */}
      {showAdvice ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => goToVoortgang("klaar")}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-none bg-[#5A8F6A] px-4 py-3.5 text-[14px] font-semibold text-[#0E1810]"
          >
            Open je beweegbeeld <Icons.ChevronRight s={15} />
          </button>
          {snapshotLine ? (
            <p className="text-center text-[12px] leading-relaxed text-[#7E8C82]">
              {snapshotLine}
              {daysUntilRemeasure != null
                ? ` Hermeting over ${daysUntilRemeasure} dagen.`
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* De deur (N1, lock 1): label-only, altijd aanwezig, nooit een
          productnaam, prijs of oordeel. Bestemming: Favorieten · Beweging —
          daar staat sinds P4 ook het schap zelf (FavorietenBewegingSection
          "Maak een keuze"), niet alleen de recap. Zie het commentaar bij
          handleMaakEenKeuze hierboven. */}
      <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3.5">
        <p className="text-[12.5px] leading-relaxed text-[#9FB0A6]">
          Je basis blijft staan. Wat er verder de moeite waard is — gratis of niet, met ons
          oordeel erbij — staat in Favorieten.
        </p>
        <Link
          href={buildDashboardVoortgangHref("leefstijlprofiel", null, null, "beweging")}
          onClick={handleMaakEenKeuze}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-[13px] font-semibold text-[#F1EFE8] no-underline"
        >
          Maak een keuze <Icons.ChevronRight s={13} />
        </Link>
        <p className="mt-2.5 text-[11px] leading-relaxed text-[#7E8C82]">
          Eén knop, één bestemming. Geen productnaam, geen prijs, geen oordeel — die horen op de
          plek waar we ze kunnen onderbouwen.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 lg:mx-auto lg:max-w-3xl">
        {logEnabled ? <MovementLogPanel /> : null}

        <div className="flex items-baseline gap-2 rounded-xl border border-dashed border-white/15 px-3.5 py-3">
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.11em] text-[#7E8C82]">
            Straks
          </span>
          <p className="m-0 text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
            {aheadLine}
          </p>
        </div>

        <details className="rounded-2xl border border-white/10 bg-black/20">
          <summary className="cursor-pointer list-none px-5 py-4 text-[13.5px] font-semibold text-[#CDD7D0] [&::-webkit-details-marker]:hidden">
            Waarom bewegen na 40 anders werkt
          </summary>
          <div className="space-y-3 border-t border-white/10 px-5 pb-5 pt-4">
            {movementPlanTemplate.mechanism.body.split("\n\n").map((paragraph, index) => (
              <p
                key={`mechanism-${index}`}
                className="max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]"
              >
                {paragraph}
              </p>
            ))}
            <p className="text-[12px] text-[#9FB0A6]">{movementPlanTemplate.mechanism.source}</p>
          </div>
        </details>

        {showAdvice && doneState.isStrengthSession ? (
          <p className="text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
            {nutritionHint}{" "}
            <Link
              href={nutritionBridgeHref}
              onClick={() => {
                trackEvent("dashboard_beweging_voeding_click", {
                  surface: "kompas_beweging",
                  trigger: "kracht_gelogd",
                });
                clarityTag("dashboard_beweging_voeding", "click");
              }}
              className="font-semibold text-[#5A8F6A] no-underline"
            >
              {nutritionBridgeLabel} <Icons.ChevronRight s={13} />
            </Link>
          </p>
        ) : null}

        {showBeweegcheckNudge ? (
          <p className="text-[13px] leading-relaxed text-[#9FB0A6] md:hidden">
            Je voorstel draait nog op je intake.{" "}
            <Link
              href="/intake/beweging?from=dashboard&kompas=beweging"
              onClick={() => {
                trackEvent("dashboard_beweging_checkin_click", {
                  mode: "full",
                  surface: "kompas_beweging",
                });
                clarityTag("dashboard_beweging_checkin", "click");
              }}
              className="font-semibold text-[#5A8F6A] no-underline"
            >
              Een korte beweegcheck maakt het scherper
            </Link>
            .
          </p>
        ) : null}

        {showAdvice ? (
          <FooterLink
            href="/gids/beweging"
            icon={<Icons.Mail s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
            label="Gratis Bewegingsgids"
            onClick={() => {
              trackEvent("dashboard_beweging_gids_click", { surface: "kompas_beweging" });
            }}
          />
        ) : null}

        {!showAdvice ? (
          <button
            type="button"
            onClick={() => goToVoortgang("open")}
            className="cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-medium text-[#7E8C82]"
          >
            Je voortgang · beweging ›
          </button>
        ) : null}
      </div>
    </div>
  );
}
