import Link from "next/link";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";

type RecommendedForYouProps = {
  session: IntakeSessionPayload;
};

const SCORE_LABEL_MAP: Record<
  string,
  { label: string; key: keyof IntakeSessionPayload["scores"] }
> = {
  magnesium: { label: "Slaapscore", key: "sleep_score" },
  ashwagandha: { label: "Stressscore", key: "stress_score" },
  "omega-3": { label: "Voedingsscore", key: "nutrition_score" },
  creatine: { label: "Energiescore", key: "energy_score" },
  "vitamine-d": { label: "Energiescore", key: "energy_score" },
  zink: { label: "Herstelscore", key: "recovery_score" },
};

export default function RecommendedForYou({ session }: RecommendedForYouProps) {
  const recommendations = buildRecommendations(session);

  if (recommendations.length === 0) return null;

  return (
    <section id="aanbevolen" aria-label="Aanbevolen voor jou">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="font-serif text-2xl text-stone-900">
          Aanbevolen voor jou
        </h2>
        <span className="text-xs font-medium bg-[#5A8F6A]/10 text-[#5A8F6A] rounded-full px-3 py-1">
          Op basis van je leefstijlcheck
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const scoreMap = SCORE_LABEL_MAP[rec.slug];
          const scoreValue = scoreMap
            ? session.scores[scoreMap.key]
            : null;

          return (
            <div
              key={rec.slug}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:border-[#5A8F6A]/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {rec.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-lg text-stone-900 leading-tight">
                    {rec.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500 leading-relaxed">
                    {rec.wiifm}
                  </p>
                </div>
              </div>

              {scoreValue !== null && scoreMap && (
                <div className="mt-3">
                  <span className="inline-flex items-center bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium">
                    {scoreMap.label}: {scoreValue}/100
                  </span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={rec.guideHref}
                  className="text-sm font-medium text-[#5A8F6A] hover:text-[#4a7a5a] transition-colors"
                >
                  Lees de gids →
                </Link>
                {rec.comparisonHref && (
                  <Link
                    href={rec.comparisonHref}
                    className="text-sm font-medium text-[#5A8F6A] hover:text-[#4a7a5a] transition-colors"
                  >
                    Vergelijk producten →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
