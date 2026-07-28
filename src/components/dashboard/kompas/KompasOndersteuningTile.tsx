"use client";

import Link from "next/link";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { buildVerdictCards, buildVerdictSummary } from "@/lib/supplement-verdict-copy";
import type { VerdictTone } from "@/lib/supplement-verdict-copy";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type KompasOndersteuningTileProps = {
  model: DashboardModel;
  data?: DashboardData;
  surface?: "kompas_home" | "voortgang";
  /** "Bekijk alle" CTA — alleen zinvol als het paneel niet al op het Voortgang-scherm staat. */
  onGoVoortgang?: () => void;
};

const TONE_COLOR: Record<VerdictTone, string> = {
  ja: "#7CB68C",
  wacht: "#D6A15C",
  nee: "#9FB0A6",
};

export default function KompasOndersteuningTile({
  model: _model,
  data,
  surface = "kompas_home",
  onGoVoortgang,
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
          Leefstijl eerst. Na je voedingscheck zeggen we per supplement of het
          iets toevoegt — of juist niet.
        </p>
        <Link
          href="/intake/voeding?from=dashboard"
          onClick={() => {
            trackEvent("dashboard_voedingscheck_cta_click", { surface });
            clarityTag("dashboard_voedingscheck_cta", surface);
          }}
          className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#5A8F6A] no-underline"
        >
          Doe je voedingscheck →
        </Link>
      </CockpitTile>
    );
  }

  const verdicts = data?.supplementVerdicts ?? [];
  const cards = buildVerdictCards(verdicts).slice(0, 3);
  const summary = buildVerdictSummary(verdicts);

  return (
    <CockpitTile eyebrow="Ondersteuning">
      <h2
        className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Ons oordeel
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        {summary ?? "Op basis van je scores — objectieve oriëntatie, geen verkoop."}
      </p>

      {cards.length > 0 ? (
        <ul className="mt-3 flex list-none flex-col gap-1.5 p-0">
          {cards.map((card) => {
            const content = (
              <>
                <span
                  aria-hidden
                  className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: TONE_COLOR[card.tone] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-serif text-[14px] text-[#F1EFE8]">
                      {card.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.06em]"
                      style={{ color: TONE_COLOR[card.tone] }}
                    >
                      {card.label}
                    </span>
                  </span>
                </span>
              </>
            );

            if (!card.comparisonPath) {
              return (
                <li
                  key={card.ingredientKey}
                  className="flex items-start gap-2 rounded-xl px-3 py-2"
                >
                  {content}
                </li>
              );
            }

            return (
              <li key={card.ingredientKey}>
                <Link
                  href={withVoortgangReturn(card.comparisonPath)}
                  onClick={() => {
                    trackEvent("dashboard_verdict_click", {
                      ingredient: card.ingredientKey,
                      verdict: card.verdict,
                      surface,
                    });
                    clarityTag("dashboard_verdict", card.ingredientKey);
                    emitIntakeClientEvent("dashboard.verdict_clicked", {
                      ingredient_key: card.ingredientKey,
                      verdict: card.verdict,
                      surface,
                    });
                  }}
                  className="flex items-start gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2 no-underline transition hover:border-white/15"
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      {onGoVoortgang ? (
        <button
          type="button"
          onClick={() => {
            trackEvent("dashboard_kompas_verdict_all_click", { surface });
            clarityTag("dashboard_kompas_home", "verdict_all");
            onGoVoortgang();
          }}
          className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#5A8F6A]"
        >
          Bekijk alle {verdicts.length || ""} →
        </button>
      ) : null}
    </CockpitTile>
  );
}
