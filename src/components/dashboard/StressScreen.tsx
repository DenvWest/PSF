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
import DomainToolsGrid, { type DomainTool } from "@/components/dashboard/domain/DomainToolsGrid";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import { getStressNutritionHint } from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardVoortgangHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type { DashboardModel } from "@/types/dashboard";

const RESET_TOOLS: DomainTool[] = [
  {
    icon: "🫁",
    label: "Ademhaling",
    href: "/blog/ademhaling-tegen-stress",
    slug: "ademhaling",
  },
  {
    icon: "🧭",
    label: "Overgangsritueel",
    href: "/blog/stress-werk-grenzen-stellen",
    slug: "overgangsritueel",
  },
  { icon: "👀", label: "Ogen ontspannen", href: null, slug: "ogen" },
  { icon: "🌿", label: "Schermvrije reset", href: null, slug: "schermvrij" },
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

export default function StressScreen({ model }: { model: DashboardModel }) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.stress;
  const session = sessionFromModel(model);
  const nutritionHint = getStressNutritionHint(session);

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_stress_premium_upsell", { surface: "kompas_stress" });
    clarityTag("dashboard_stress_premium", "shown");
  }, []);

  return (
    <DomainCockpitShell accent={pillar.color} ariaLabel="Stress-cockpit">
      <DomainHeaderCard
        pillar={pillar}
        score={model.scores.stress ?? 0}
        eyebrow="Ritme & reset"
        tagline="Stapsgewijs stress reguleren."
      />

      <DomainCheckinLink
        href="/intake/stress?from=dashboard&kompas=stress"
        icon={<Icons.Wind s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Doe de stress-check (1 min)"
        onClick={() => {
          trackEvent("dashboard_stress_checkin_click", { surface: "kompas_stress" });
          clarityTag("dashboard_stress_checkin", "click");
        }}
      />

      <section aria-label="Leefstijl eerst">
        <DomainSectionHeader eyebrow="Leefstijl eerst" title="Korte herstelmomenten" />
        <CockpitTile>
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Fysiologische zucht</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                2 korte neusinhalingen + 1 lange uitademing, 3 tot 5 rondes.
              </div>
              <Link
                href="/blog/ademhaling-tegen-stress"
                onClick={() => {
                  trackEvent("dashboard_stress_breathing_click", {
                    surface: "kompas_stress",
                  });
                }}
                className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#5A8F6A] no-underline"
              >
                Ademhaling uitleg <Icons.ChevronRight s={14} />
              </Link>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Lang uitademen</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                4 seconden in, 8 seconden uit, 2 minuten.
              </div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Ogen ontspannen</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Kijk 20 seconden ver weg om je focus en spanning te resetten.
              </div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Overgangsritueel</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Telefoon weg, 1 minuut ademhaling, en bewust afronden: werk is klaar.
              </div>
              <Link
                href="/blog/stress-werk-grenzen-stellen"
                onClick={() => {
                  trackEvent("dashboard_stress_ritueel_click", {
                    surface: "kompas_stress",
                  });
                }}
                className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#5A8F6A] no-underline"
              >
                Grenzen na werk <Icons.ChevronRight s={14} />
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
            href="/intake/voeding?from=dashboard&kompas=stress"
            onClick={() => {
              trackEvent("dashboard_stress_voeding_click", { surface: "kompas_stress" });
              clarityTag("dashboard_stress_voeding", "click");
            }}
            className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#5A8F6A] no-underline"
          >
            Doe de voedingscheck <Icons.ChevronRight s={15} />
          </Link>
        </CockpitTile>
      </section>

      <section aria-label="Aanvullen">
        <DomainSectionHeader eyebrow="Daarna gericht" title="Wat kun je hiernaast zetten?" />
        <Link
          href={buildDashboardVoortgangHref("domein", null, "stress")}
          onClick={() => {
            trackEvent("dashboard_stress_deur_click", { surface: "kompas_stress" });
            clarityTag("dashboard_stress_deur", "click");
          }}
          className="flex items-center gap-3 rounded-2xl border border-[#5A8F6A]/30 bg-[#5A8F6A]/10 px-4 py-3.5 no-underline text-inherit"
        >
          <Icons.ArrowRight s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />
          <span className="flex-1">
            <span className="block text-[14.5px] font-semibold text-[#F1EFE8]">
              Bekijk je oordeel op Voortgang
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-[#9FB0A6]">
              Eerst je basis, dan pas — als daar iets voor staat — een aanvulling.
            </span>
          </span>
          <Icons.ChevronRight s={16} style={{ color: "#9FB0A6", flexShrink: 0 }} />
        </Link>
      </section>

      <section aria-label="Reset tools">
        <DomainSectionHeader
          eyebrow="Reset tools"
          title="Voor drukke dagen"
          action={<DomainSoonPill />}
        />
        <CockpitTile>
          <DomainToolsGrid
            tools={RESET_TOOLS}
            note="Binnenkort: stressroutines die je aan je dag kunt koppelen, zonder extra app-gedoe."
            onToolClick={(tool) => {
              trackEvent("dashboard_stress_ritueel_click", {
                tool: tool.slug,
                target: tool.href ?? "",
              });
            }}
          />
        </CockpitTile>
      </section>

      <KompasBegeleidingLink surface="kompas_stress" />

      <DomainFooterLink
        href="/intake/plan/stress?from=dashboard&kompas=stress"
        icon={<Icons.Target s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Je stressplan"
        onClick={() => {
          trackEvent("dashboard_stress_plan_click", { surface: "kompas_stress" });
        }}
      />
      <DomainFooterLink
        href="/gids/stress"
        icon={<Icons.Mail s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Gratis Stressgids"
        onClick={() => {
          trackEvent("dashboard_stress_gids_click", { surface: "kompas_stress" });
        }}
      />
      <DomainFooterLink
        href="/inzichten"
        icon={<Icons.BookOpen s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Leefstijl & inzichten"
        onClick={() => {
          trackEvent("dashboard_stress_leefstijl_click", { surface: "kompas_stress" });
        }}
      />
    </DomainCockpitShell>
  );
}
