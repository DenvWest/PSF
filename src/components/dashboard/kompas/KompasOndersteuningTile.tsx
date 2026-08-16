"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { buildVerdictSummary } from "@/lib/supplement-verdict-copy";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type KompasOndersteuningTileProps = {
  model: DashboardModel;
  data?: DashboardData;
  surface?: "kompas_home" | "voortgang";
  /** "Bekijk alle" CTA — alleen zinvol als het paneel niet al op het Voortgang-scherm staat. */
  onGoVoortgang?: () => void;
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
  const summary = buildVerdictSummary(verdicts);

  // Label-only: geen productnaam, geen oordeel-label, geen vergelijkingslink
  // op de dagelijkse surface (lock L2). De kaarten met naam + oordeel +
  // vergelijk-link staan op Voortgang, niet hier — deze tegel is de deur.
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

      {onGoVoortgang ? (
        <button
          type="button"
          onClick={() => {
            trackEvent("dashboard_kompas_verdict_all_click", { surface });
            clarityTag("dashboard_kompas_home", "verdict_all");
            onGoVoortgang();
          }}
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-[#5A8F6A]"
        >
          Bekijk je oordeel op Voortgang <Icons.ChevronRight s={15} />
        </button>
      ) : null}
    </CockpitTile>
  );
}
