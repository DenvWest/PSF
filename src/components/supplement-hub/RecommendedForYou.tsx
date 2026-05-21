import Link from "next/link";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { getRecommendationScoreBandLabel } from "@/lib/score-bands";

type RecommendedForYouProps = {
  session: IntakeSessionPayload;
};

export default function RecommendedForYou({ session }: RecommendedForYouProps) {
  const recommendations = buildRecommendations(session);

  return (
    <section aria-label="Op basis van jouw antwoorden">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h2 className="font-display text-2xl text-stone-900">
          Op basis van jouw antwoorden
        </h2>
        <span className="text-xs font-medium bg-stone-100 text-stone-600 rounded-full px-3 py-1">
          Algemene oriëntatie — geen persoonlijk medisch advies
        </span>
      </div>
      <p className="mb-6 text-sm text-stone-600">
        Liever zelf vergelijken zonder antwoorden?{" "}
        <Link
          href="/supplementen"
          className="font-medium text-ps-green hover:text-ps-green-hover underline-offset-4 hover:underline"
        >
          Bekijk alle supplementen →
        </Link>
      </p>

      {recommendations.length === 0 ? (
        <p className="text-stone-600 text-base leading-relaxed max-w-xl">
          We hebben op dit moment geen specifieke supplementtips op basis van je
          profiel. Bekijk hieronder de thema&apos;s en gidsen, of doe de
          leefstijlcheck opnieuw als je situatie is veranderd.
        </p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const scoreBand = getRecommendationScoreBandLabel(
            rec.slug,
            session.scores,
          );

          return (
            <div
              key={rec.slug}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:border-ps-green/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {rec.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-stone-900 leading-tight">
                    {rec.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500 leading-relaxed">
                    {rec.wiifm}
                  </p>
                </div>
              </div>

              {scoreBand ? (
                <div className="mt-3">
                  <span className="inline-flex items-center bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium">
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
                  className="text-sm font-medium text-ps-green hover:text-ps-green-hover transition-colors"
                >
                  {rec.name}: {rec.wiifm} →
                </Link>
                {rec.comparisonHref && rec.comparisonHref !== rec.guideHref && (
                  <Link
                    href={rec.comparisonHref}
                    className="text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
                  >
                    Vergelijk {rec.name.toLowerCase()} op prijs →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
}
