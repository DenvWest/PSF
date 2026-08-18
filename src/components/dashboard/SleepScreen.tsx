"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainCheckinLink from "@/components/dashboard/domain/DomainCheckinLink";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainFooterLink from "@/components/dashboard/domain/DomainFooterLink";
import DomainLifestyleLadder from "@/components/dashboard/domain/DomainLifestyleLadder";
import DomainSectionHeader from "@/components/dashboard/domain/DomainSectionHeader";
import DomainHeaderCard from "@/components/dashboard/domain/DomainHeaderCard";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import {
  SLEEP_LAYER_STATE_LABEL,
  SLEEP_PRIORITY_LAYERS,
  type SleepPriorityId,
} from "@/data/sleep/lifestyle-priorities";
import { getSleepNutritionHint } from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardVoortgangHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { sleepLayerWhyWait } from "@/lib/sleep-ladder";
import type { DashboardModel, SleepCheckinReadoutData } from "@/types/dashboard";

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

export default function SleepScreen({
  model,
  sleepSnapshot = null,
  nutritionLogCompleted = false,
  onGoVoortgangDomein,
}: {
  model: DashboardModel;
  sleepSnapshot?: SleepCheckinReadoutData | null;
  nutritionLogCompleted?: boolean;
  onGoVoortgangDomein?: () => void;
}) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.slaap;
  const session = sessionFromModel(model);
  const nutritionHint = getSleepNutritionHint(session);
  const snapshot = sleepSnapshot;
  const voortgangHref = buildDashboardVoortgangHref("domein", null, "slaap");

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_slaap_premium_upsell", { surface: "kompas_slaap" });
    clarityTag("dashboard_slaap_premium", "shown");
  }, []);

  return (
    <DomainCockpitShell accent={pillar.color} ariaLabel="Slaap-cockpit">
      <DomainHeaderCard
        pillar={pillar}
        score={model.scores.slaap ?? 0}
        eyebrow="Ritme & herstel"
        tagline="Stapsgewijs beter slapen met vaste routines."
      />

      <DomainCheckinLink
        href="/intake/slaap?from=dashboard&kompas=slaap"
        icon={<Icons.Moon s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Doe de slaap-check (1 min)"
        onClick={() => {
          trackEvent("dashboard_slaap_checkin_click", { surface: "kompas_slaap" });
          clarityTag("dashboard_slaap_checkin", "click");
        }}
      />

      {snapshot ? (
        <CockpitTile eyebrow="Laatste slaapanalyse">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]">
            {snapshot.date}
          </p>
          <p className="mt-2 font-serif text-[18px] leading-snug text-[#F1EFE8]">{snapshot.headline}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#CDD7D0]">{snapshot.kompasStatus}</p>
          {snapshot.primaryAction ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6]">
              Eerste actie: {snapshot.primaryAction}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_slaap_voortgang_click", { surface: "kompas_slaap" });
              clarityTag("sleep_flow", "kompas_voortgang");
              onGoVoortgangDomein?.();
            }}
            className="mt-3 cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
          >
            Bekijk volledige voortgang ›
          </button>
        </CockpitTile>
      ) : model.sleepFocus ? (
        <CockpitTile>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5B6EAE]">
            Laatste slaapanalyse · {model.sleepFocus.date}
          </p>
          <div className="font-serif text-[18px] text-[#F1EFE8]">
            {model.sleepFocus.conclusionText}
          </div>
          {model.sleepFocus.focusLabel ? (
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#CDD7D0]">
              Focus: <strong className="text-[#F1EFE8]">{model.sleepFocus.focusLabel}</strong>
            </p>
          ) : null}
        </CockpitTile>
      ) : null}

      {snapshot ? (
        <section aria-label="Prioriteiten">
          <DomainSectionHeader eyebrow="Prioriteiten" title="Waar je winst zit" />
          <CockpitTile>
            <DomainLifestyleLadder
              layers={SLEEP_PRIORITY_LAYERS}
              layerStates={snapshot.layerStates}
              focusLayer={snapshot.focusLayer}
              stateLabels={SLEEP_LAYER_STATE_LABEL}
              variant="mini"
              whyWait={(layerId) => sleepLayerWhyWait(layerId as SleepPriorityId, snapshot.focusLayer)}
              domain="slaap"
              surface="kompas_slaap"
            />
            <Link
              href={voortgangHref}
              onClick={() => {
                trackEvent("dashboard_slaap_voortgang_click", { surface: "kompas_slaap" });
                clarityTag("sleep_ladder_focus", String(snapshot.focusLayer));
              }}
              className="mt-3 inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[#9CC5A9] no-underline hover:underline"
            >
              Volledige ladder op Voortgang ›
            </Link>
          </CockpitTile>
        </section>
      ) : null}

      <section aria-label="Leefstijl eerst">
        <DomainSectionHeader eyebrow="Leefstijl eerst" title="Ritme-hefbomen" />
        <CockpitTile>
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Vaste wektijd</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Kies 1 wektijd en houd die ook in het weekend aan.
              </div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Ochtendlicht</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Binnen 60 minuten na opstaan 10 minuten buitenlicht.
              </div>
              <Link
                href="/blog/slaapritme-herstellen"
                onClick={() => {
                  trackEvent("dashboard_slaap_leefstijl_click", {
                    tool: "ochtendlicht",
                    surface: "kompas_slaap",
                  });
                  clarityTag("dashboard_slaap_leefstijl", "ochtendlicht");
                }}
                className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#5A8F6A] no-underline"
              >
                Ritme verbeteren <Icons.ChevronRight s={14} />
              </Link>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Avondafbouw</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Laatste 45 minuten: schermlicht dimmen, rustiger tempo, vaste volgorde.
              </div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Cafeine-cutoff</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Stop met cafeine na de lunch, zodat je slaapdruk niet wordt geremd.
              </div>
              <Link
                href="/blog/alcohol-slaap-energie-na-40"
                onClick={() => {
                  trackEvent("dashboard_slaap_leefstijl_click", {
                    tool: "cafeine_cutoff",
                    surface: "kompas_slaap",
                  });
                  clarityTag("dashboard_slaap_leefstijl", "cafeine_cutoff");
                }}
                className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#5A8F6A] no-underline"
              >
                Avondprikkels beperken <Icons.ChevronRight s={14} />
              </Link>
            </div>
          </div>
        </CockpitTile>
      </section>

      <section aria-label="Voeding">
        <DomainSectionHeader eyebrow="Ondersteunend" title="Voeding" />
        <CockpitTile>
          <p className="text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">{nutritionHint}</p>
          <Link
            href="/intake/voeding?from=dashboard&kompas=slaap"
            onClick={() => {
              trackEvent("dashboard_slaap_voeding_click", { surface: "kompas_slaap" });
              clarityTag("dashboard_slaap_voeding", "click");
            }}
            className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#5A8F6A] no-underline"
          >
            Doe de voedingscheck <Icons.ChevronRight s={15} />
          </Link>
          {nutritionLogCompleted ? (
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#7E8C82]">
              Supplementen zijn een aanvulling op ritme en licht — geen startpunt op dit scherm.
            </p>
          ) : null}
        </CockpitTile>
      </section>

      <KompasBegeleidingLink surface="kompas_slaap" />

      <DomainFooterLink
        href="/intake/plan/sleep?from=dashboard&kompas=slaap"
        icon={<Icons.Target s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Je slaapplan"
        onClick={() => {
          trackEvent("dashboard_slaap_plan_click", { surface: "kompas_slaap" });
          clarityTag("dashboard_slaap_footer", "plan");
        }}
      />
      <DomainFooterLink
        href="/inzichten"
        icon={<Icons.BookOpen s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Leefstijl & inzichten"
        onClick={() => {
          trackEvent("dashboard_slaap_leefstijl_footer_click", { surface: "kompas_slaap" });
          clarityTag("dashboard_slaap_footer", "inzichten");
        }}
      />
    </DomainCockpitShell>
  );
}
