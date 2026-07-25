"use client";

import Link from "next/link";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { buildRecommendations } from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type KompasOndersteuningTileProps = {
  model: DashboardModel;
  data?: DashboardData;
};

export default function KompasOndersteuningTile({
  model,
  data,
}: KompasOndersteuningTileProps) {
  const eligibility = buildRecommendationsEligibility(data?.nutritionIntake);
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;

  if (!nutritionLogCompleted) {
    return (
      <CockpitTile eyebrow="Ondersteuning">
        <h2
          className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Supplementen
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
          Leefstijl eerst. Na je voedingscheck zie je hier welke supplementen
          passen bij je beeld — informatief, geen verkoop.
        </p>
        <Link
          href="/intake/voeding?from=dashboard"
          onClick={() => {
            trackEvent("dashboard_voedingscheck_cta_click", { surface: "kompas_home" });
            clarityTag("dashboard_voedingscheck_cta", "kompas_home");
          }}
          className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#5A8F6A] no-underline"
        >
          Doe je voedingscheck →
        </Link>
      </CockpitTile>
    );
  }

  const session: IntakeSessionPayload = {
    sessionId: data?.sessionId ?? "",
    symptoms: [],
    answers: model.answers ?? {},
    scores: model.domainScores,
    urgency: "",
    profile: data?.profileLabel ?? "",
    timestamp: 0,
    ageRange: null,
    firstName: null,
  };
  const recommendations = buildRecommendations(session, eligibility).slice(0, 2);

  return (
    <CockpitTile eyebrow="Ondersteuning">
      <h2
        className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Supplementen
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Op basis van je scores — stepped care na leefstijl, objectieve oriëntatie.
      </p>

      {recommendations.length > 0 ? (
        <ul className="mt-3 flex list-none flex-col gap-2 p-0">
          {recommendations.map((rec) => (
            <li key={rec.slug}>
              <Link
                href={rec.guideHref}
                onClick={() => {
                  trackEvent("dashboard_kompas_supplement_gids_click", {
                    slug: rec.slug,
                    surface: "kompas_home",
                  });
                  clarityTag("dashboard_kompas_home", `supplement_${rec.slug}`);
                }}
                className="flex items-start gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5 no-underline transition hover:border-white/15"
              >
                <span className="text-lg" aria-hidden>
                  {rec.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[14px] text-[#F1EFE8]">
                    {rec.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[#9FB0A6] text-pretty">
                    {rec.wiifm}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] text-[#9FB0A6] text-pretty">
          Geen supplement-signalen op basis van je check — focus op je leefstijlstappen.
        </p>
      )}
    </CockpitTile>
  );
}
