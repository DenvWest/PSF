import Link from "next/link";
import NutritionCheckGateCard, {
  EmptyAfterNutritionCheck,
} from "@/components/supplement-hub/NutritionCheckGateCard";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { getRecommendationScoreBandLabel } from "@/lib/score-bands";

type RecommendedForYouProps = {
  session: IntakeSessionPayload;
  nutritionLogCompleted: boolean;
};

export default function RecommendedForYou({
  session,
  nutritionLogCompleted,
}: RecommendedForYouProps) {
  if (!nutritionLogCompleted) {
    return (
      <section aria-label="Jouw volgende stap">
        <NutritionCheckGateCard />
      </section>
    );
  }

  const recommendations = buildRecommendations(session, {
    nutritionLogCompleted: true,
  });

  if (recommendations.length === 0) {
    return (
      <section aria-label="Resultaat voedingscheck">
        <EmptyAfterNutritionCheck />
      </section>
    );
  }

  return (
    <section aria-label="Op basis van jouw antwoorden">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl text-stone-900">
          Op basis van jouw antwoorden
        </h2>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
          Algemene oriëntatie — geen persoonlijk medisch advies
        </span>
      </div>
      <p className="mb-6 text-sm text-stone-600">
        Na je voedingscheck — supplementen als aanvulling op je bord, niet
        ervoor.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => {
          const scoreBand = getRecommendationScoreBandLabel(
            rec.slug,
            session.scores,
          );

          return (
            <div
              key={rec.slug}
              className="rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-ps-green/30"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 text-2xl" aria-hidden="true">
                  {rec.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg leading-tight text-stone-900">
                    {rec.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">
                    {rec.wiifm}
                  </p>
                </div>
              </div>

              {scoreBand ? (
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    {scoreBand.label}
                  </span>
                  <p className="mt-1.5 text-xs text-stone-500">
                    {scoreBand.context}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={rec.guideHref}
                  className="text-sm font-medium text-ps-green transition-colors hover:text-ps-green-hover"
                >
                  {rec.name}: {rec.wiifm} →
                </Link>
                {rec.comparisonHref && rec.comparisonHref !== rec.guideHref ? (
                  <Link
                    href={rec.comparisonHref}
                    className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-800"
                  >
                    Vergelijk {rec.name.toLowerCase()} op prijs →
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
