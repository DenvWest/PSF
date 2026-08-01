"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainCheckinLink from "@/components/dashboard/domain/DomainCheckinLink";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainFooterLink from "@/components/dashboard/domain/DomainFooterLink";
import DomainHeaderCard from "@/components/dashboard/domain/DomainHeaderCard";
import DomainSectionHeader from "@/components/dashboard/domain/DomainSectionHeader";
import DomainSoonPill from "@/components/dashboard/domain/DomainSoonPill";
import DomainSupplementList from "@/components/dashboard/domain/DomainSupplementList";
import DomainToolsGrid, { type DomainTool } from "@/components/dashboard/domain/DomainToolsGrid";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import {
  buildSleepRecommendations,
  getSleepNutritionHint,
} from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type { DashboardModel } from "@/types/dashboard";

const SLEEP_TOOLS: DomainTool[] = [
  {
    icon: "🌅",
    label: "Ochtendlicht",
    href: "/blog/slaapritme-herstellen",
    slug: "ochtendlicht",
  },
  {
    icon: "☕",
    label: "Cafeine-cutoff",
    href: "/blog/alcohol-slaap-energie-na-40",
    slug: "cafeine_cutoff",
  },
  { icon: "🌙", label: "Avondafbouw", href: null, slug: "avondafbouw" },
  { icon: "⏰", label: "Vaste wektijd", href: null, slug: "vaste_wektijd" },
];

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
  nutritionLogCompleted = false,
}: {
  model: DashboardModel;
  nutritionLogCompleted?: boolean;
}) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.slaap;
  const session = sessionFromModel(model);
  const nutritionHint = getSleepNutritionHint(session);
  const recommendations = buildSleepRecommendations(session, {
    nutritionLogCompleted,
  });

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

      {model.sleepFocus ? (
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
          {model.sleepFocus.chosenActions.length > 0 ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6]">
              Actieve stap: {model.sleepFocus.chosenActions[0]}
            </p>
          ) : model.sleepFocus.actions[0] ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6]">
              Eerste actie: {model.sleepFocus.actions[0]}
            </p>
          ) : null}
        </CockpitTile>
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

      <section aria-label="Voeding en supplementen">
        <DomainSectionHeader eyebrow="Ondersteunend" title="Voeding & supplementen" />
        <CockpitTile>
          <div className="flex flex-col gap-3.5">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">
                Eerst je basis
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
                {nutritionHint}
              </p>
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
            </div>

            <div className="border-t border-white/10 pt-3.5">
              <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">
                Supplementen — pas na je basis
              </p>
              <DomainSupplementList
                recommendations={recommendations}
                emptyText="Eerst ritme, licht en vaste tijden. Supplementen zijn een aanvulling, geen startpunt."
                onItemClick={(rec, href) => {
                  trackEvent("dashboard_slaap_supplement_click", {
                    slug: rec.slug,
                    target: href,
                    surface: "kompas_slaap",
                  });
                  clarityTag("dashboard_slaap_supplement", rec.slug);
                }}
              />
            </div>
          </div>
        </CockpitTile>
      </section>

      <section aria-label="Slaaproutine tools">
        <DomainSectionHeader
          eyebrow="Slaaproutine tools"
          title="Voor drukke avonden"
          action={<DomainSoonPill />}
        />
        <CockpitTile>
          <DomainToolsGrid
            tools={SLEEP_TOOLS}
            note="Binnenkort: routines die je direct aan je dagritme kunt koppelen."
            onToolClick={(tool) => {
              trackEvent("dashboard_slaap_tool_click", {
                tool: tool.slug,
                target: tool.href ?? "",
              });
              clarityTag("dashboard_slaap_tool", tool.slug);
            }}
          />
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
