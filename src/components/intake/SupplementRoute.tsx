"use client";

import Link from "next/link";
import type { SupplementRecommendation } from "@/data/supplement-routes";
import type { DomainScores } from "@/lib/intake-engine";

const DOMAIN_LABEL_TO_KEY: Record<string, keyof DomainScores> = {
  Slaap: "sleep_score",
  Energie: "energy_score",
  Stress: "stress_score",
  Voeding: "nutrition_score",
  Beweging: "movement_score",
  Herstel: "recovery_score",
};

const SCORE_KEY_TO_SHORT_LABEL: Record<keyof DomainScores, string> = {
  sleep_score: "slaapscore",
  energy_score: "energiescore",
  stress_score: "stressscore",
  nutrition_score: "voedingsscore",
  movement_score: "bewegingsscore",
  recovery_score: "herstelscore",
};

function formatScoreBasisLine(
  domains: string[],
  scores: DomainScores,
): string | null {
  const seen = new Set<keyof DomainScores>();
  const keys: (keyof DomainScores)[] = [];

  for (const label of domains) {
    const key = DOMAIN_LABEL_TO_KEY[label];
    if (key === undefined || seen.has(key)) {
      continue;
    }
    seen.add(key);
    keys.push(key);
  }

  if (keys.length === 0) {
    return null;
  }

  const parts = keys.map((key, i) => {
    const value = Math.round(scores[key]);
    const name = SCORE_KEY_TO_SHORT_LABEL[key];
    return i === 0 ? `je ${name} (${value}/100)` : `${name} (${value}/100)`;
  });

  if (parts.length === 1) {
    return `Op basis van ${parts[0]}.`;
  }
  if (parts.length === 2) {
    return `Op basis van ${parts[0]} en ${parts[1]}.`;
  }
  const last = parts.pop();
  return `Op basis van ${parts.join(", ")} en ${last}.`;
}

type SupplementRouteProps = {
  recommendations: SupplementRecommendation[];
  scores: DomainScores;
};

export default function SupplementRoute({
  recommendations,
  scores,
}: SupplementRouteProps) {
  const showAffiliateDisclaimer = recommendations.some((r) => r.hasComparison);

  return (
    <div className="space-y-2" style={{ fontFamily: "var(--font-intake-body), sans-serif" }}>
      {recommendations.map((rec) => {
        const basisLine = formatScoreBasisLine(rec.domains, scores);
        return (
          <div
            key={rec.id}
            className="rounded-[10px] border border-[#f0ede8] bg-[#FAFAF7] px-4 py-3.5"
          >
            <div className="mb-1 text-[15px] font-bold text-[#1a1a1a]">{rec.name}</div>
            <p className="m-0 mb-2 text-[13px] leading-relaxed text-[#777]">{rec.reason}</p>
            {basisLine ? (
              <p className="m-0 mb-3 text-[12px] leading-snug text-[#666]">{basisLine}</p>
            ) : null}
            {rec.hasComparison ? (
              <Link
                href={rec.affiliateUrl}
                className="inline-flex max-w-full items-center justify-center rounded-lg bg-[#C4873B] px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Bekijk vergelijking →
              </Link>
            ) : (
              <Link
                href={rec.affiliateUrl}
                className="inline-block max-w-full break-words text-[13px] font-semibold text-[#C4873B] underline underline-offset-[3px]"
              >
                Meer informatie →
              </Link>
            )}
          </div>
        );
      })}
      {showAffiliateDisclaimer ? (
        <p className="mt-4 text-[11px] leading-snug text-[#aaa]">
          We verdienen een commissie als je via onze links koopt. Dit beïnvloedt onze
          aanbevelingen niet.
        </p>
      ) : null}
    </div>
  );
}
