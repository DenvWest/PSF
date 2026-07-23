"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import MovementCockpit from "@/components/dashboard/beweging/MovementCockpit";
import MovementPlanDeepBody from "@/components/dashboard/beweging/MovementPlanDeepBody";
import MovementLogPanel from "@/components/dashboard/MovementLogPanel";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import {
  buildMovementRecommendations,
  getMovementNutritionHint,
} from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { BEWEGING_SUPPLEMENT_ANCHOR } from "@/lib/context-rail";
import { trackEvent } from "@/lib/ga4";
import type { KompasDeepView } from "@/lib/dashboard-url";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type { DashboardModel } from "@/types/dashboard";

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
    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-[18px] py-4 no-underline text-inherit transition hover:border-white/20"
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

export default function BewegingScreen({
  model,
  slot,
  deepView = "cockpit",
  sessionId = null,
  nutritionLogCompleted = false,
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
  onOpenPlan,
}: {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  deepView?: KompasDeepView;
  sessionId?: string | null;
  nutritionLogCompleted?: boolean;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
  onOpenPlan?: () => void;
}) {
  const isPlanView = deepView === "stappenplan";
  const premiumShownRef = useRef(false);
  const session = sessionFromModel(model);
  const nutritionHint = getMovementNutritionHint(session);
  const recommendations = buildMovementRecommendations(session, {
    nutritionLogCompleted,
  });
  const showActiveStep =
    model.activeHabit?.domain === "movement" && model.activeHabit.title;

  useEffect(() => {
    if (premiumShownRef.current) {
      return;
    }
    premiumShownRef.current = true;
    trackEvent("dashboard_beweging_premium_upsell", { surface: "kompas_beweging" });
    clarityTag("dashboard_beweging_premium", "shown");
  }, []);

  const logEnabled = isMovementLogEnabled();

  const voedingSupplementContent = (
    <>
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">
          Voeding optimaliseren
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
          {nutritionHint}
        </p>
        <Link
          href="/intake/voeding?from=dashboard&kompas=beweging"
          onClick={() => {
            trackEvent("dashboard_beweging_voeding_click", { surface: "kompas_beweging" });
            clarityTag("dashboard_beweging_voeding", "click");
          }}
          className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#5A8F6A] no-underline"
        >
          Doe de voedingscheck <Icons.ChevronRight s={15} />
        </Link>
      </div>

      <div
        id={BEWEGING_SUPPLEMENT_ANCHOR}
        className="mt-4 scroll-mt-24 border-t border-white/10 pt-4"
      >
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">
          Supplementen — als je basis staat
        </p>
        {recommendations.length > 0 ? (
          <div className="mt-3 flex flex-col">
            {recommendations.map((rec, index) => {
              const href = rec.comparisonHref ?? rec.guideHref;
              return (
                <Link
                  key={rec.slug}
                  href={href}
                  onClick={() => {
                    trackEvent("dashboard_beweging_supplement_click", {
                      slug: rec.slug,
                      target: href,
                      surface: "kompas_beweging",
                    });
                    clarityTag("dashboard_beweging_supplement", rec.slug);
                  }}
                  className={`flex items-center gap-3 py-3 no-underline text-inherit ${
                    index ? "border-t border-white/10" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-[20px]"
                  >
                    {rec.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-[16px] leading-tight text-[#F1EFE8]">
                      {rec.name}
                    </div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
                      {rec.wiifm}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-[#5A8F6A]">
                    Vergelijk <Icons.ChevronRight s={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            {nutritionLogCompleted
              ? "Geen supplement-signalen — focus eerst op voeding en je plan."
              : "Doe eerst de voedingscheck voordat we supplementen tonen — eerst tafel, dan potje."}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      <MovementCockpit
        model={model}
        slot={slot}
        deepView={deepView}
        onGoAgenda={onGoAgenda}
        onMakePriority={onMakePriority}
        makePriorityBusy={makePriorityBusy}
        onOpenPlan={onOpenPlan}
      />

      {isPlanView ? (
        <MovementPlanDeepBody
          scores={model.domainScores}
          answers={model.answers ?? {}}
          sessionId={sessionId}
          navMode="dashboard_view"
        />
      ) : (
        <div className="flex w-full flex-col gap-3 lg:mx-auto lg:max-w-3xl">
          {logEnabled ? <MovementLogPanel /> : null}

          {/* Op md+ staat dezelfde beweegcheck als tool in de context-rail. */}
          <CockpitTile eyebrow="Check-in" className="md:hidden">
            <Link
              href="/intake/beweging?from=dashboard&kompas=beweging"
              onClick={() => {
                trackEvent("dashboard_beweging_checkin_click", {
                  mode: "full",
                  surface: "kompas_beweging",
                });
                clarityTag("dashboard_beweging_checkin", "click");
              }}
              className="mt-2 flex flex-col gap-1.5 rounded-xl border border-[#5A8F6A]/30 bg-[#5A8F6A]/10 px-4 py-3.5 no-underline text-inherit"
            >
              <div className="flex items-center gap-3">
                <Icons.Activity s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />
                <span className="flex-1 text-[14.5px] font-semibold text-[#F1EFE8]">
                  Doe de uitgebreide beweegcheck (3 min)
                </span>
                <Icons.ChevronRight s={18} style={{ color: "#9FB0A6", flexShrink: 0 }} />
              </div>
              {showActiveStep ? (
                <p className="ml-[30px] text-[13px] leading-snug text-[#9FB0A6] text-pretty">
                  Actieve stap: {model.activeHabit?.title}
                </p>
              ) : null}
            </Link>
          </CockpitTile>

          {logEnabled ? (
            <details className="rounded-2xl border border-white/10 bg-black/20">
              <summary className="cursor-pointer list-none px-5 py-4 text-[13.5px] font-semibold text-[#CDD7D0] [&::-webkit-details-marker]:hidden">
                Voeding &amp; supplementen
              </summary>
              <div className="border-t border-white/10 px-5 pb-5 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
                  Leefstijl eerst
                </p>
                <p className="mt-2 font-serif text-[19px] text-[#F1EFE8]">Voeding &amp; supplementen</p>
                <div className="mt-4">{voedingSupplementContent}</div>
              </div>
            </details>
          ) : (
            <CockpitTile eyebrow="Leefstijl eerst" ariaLabel="Voeding en supplementen">
              <p className="mt-2 font-serif text-[19px] text-[#F1EFE8]">Voeding &amp; supplementen</p>
              <div className="mt-4">{voedingSupplementContent}</div>
            </CockpitTile>
          )}

          <CockpitTile>
            <KompasBegeleidingLink surface="kompas_beweging" />
          </CockpitTile>

          <FooterLink
            href="/gids/beweging"
            icon={<Icons.Mail s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
            label="Gratis Bewegingsgids"
            onClick={() => {
              trackEvent("dashboard_beweging_gids_click", { surface: "kompas_beweging" });
            }}
          />
          <FooterLink
            href="/inzichten"
            icon={<Icons.BookOpen s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
            label="Leefstijl & inzichten"
            onClick={() => {
              trackEvent("dashboard_beweging_leefstijl_click", { surface: "kompas_beweging" });
            }}
          />
        </div>
      )}
    </div>
  );
}
