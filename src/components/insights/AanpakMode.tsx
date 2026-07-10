import Link from "next/link";
import Container from "@/components/layout/Container";
import ApproachCardLink from "@/components/insights/ApproachCardLink";
import { getAccountFromCookie } from "@/lib/account-server";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { loadIntakeSessionPayloadBySessionId } from "@/lib/intake-session-server";
import {
  buildRecommendations,
  type RecommendedSupplement,
} from "@/lib/build-recommendations";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import {
  getSupplementCardCopy,
  MOEITE_LABEL,
} from "@/data/approach/supplement-cards";
import AanpakQ1EiwitHero from "@/components/insights/AanpakQ1EiwitHero";
import { shouldShowAanpakQ1EiwitHero } from "@/lib/aanpak-q1-eiwit";

function ApproachCard({
  rec,
  isTop,
}: {
  rec: RecommendedSupplement;
  isTop: boolean;
}) {
  const copy = getSupplementCardCopy(rec.slug, rec.name);
  const showComparison =
    Boolean(rec.comparisonHref) && rec.comparisonHref !== rec.guideHref;

  return (
    <article className="rounded-[20px] border border-[#E7E5E4] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#EEF3EF] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A8F6A]">
          {isTop ? "Prioriteit · hoog" : "Prioriteit · middel"}
        </span>
        <span className="rounded-full bg-[#FAF9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500 ring-1 ring-[#E7E5E4]">
          {MOEITE_LABEL[copy.moeite]}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[22px] font-normal text-stone-900">
        {copy.title}
      </h3>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-stone-600">
        {rec.reason}
      </p>

      <div className="mt-5">
        <ApproachCardLink
          href={rec.guideHref}
          destination={`approach_${rec.slug}_gids`}
          className="inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-[22px] py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
        >
          Zo pak je het aan →
        </ApproachCardLink>
      </div>

      {showComparison && rec.comparisonHref ? (
        <div className="mt-5 flex items-start gap-2 border-t border-[#F0EEEC] pt-4">
          <span className="mt-0.5 shrink-0 rounded-[3px] border border-[#D6D3D1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-stone-400">
            adv
          </span>
          <p className="text-[13px] leading-relaxed text-stone-400">
            Haal je het niet uit voeding?{" "}
            <ApproachCardLink
              href={rec.comparisonHref}
              destination={`approach_${rec.slug}_vergelijk`}
              className="text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-800"
            >
              Vergelijk {rec.name.toLowerCase()} →
            </ApproachCardLink>
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default async function AanpakMode() {
  const account = await getAccountFromCookie();
  const dashboard = account ? await loadAccountDashboardData(account.id) : null;
  const hasContext = Boolean(dashboard && !dashboard.empty && dashboard.current);
  const showQ1EiwitHero = hasContext && shouldShowAanpakQ1EiwitHero(dashboard?.answers);

  const nutritionLogCompleted =
    buildRecommendationsEligibility(dashboard?.nutritionIntake).nutritionLogCompleted ===
    true;

  let recommendations: RecommendedSupplement[] = [];
  if (hasContext && dashboard?.sessionId) {
    const loaded = await loadIntakeSessionPayloadBySessionId(dashboard.sessionId);
    if (loaded.ok && loaded.session) {
      recommendations = buildRecommendations(
        loaded.session,
        buildRecommendationsEligibility(dashboard?.nutritionIntake),
      );
    }
  }

  return (
    <section aria-label="Jouw aanpak" className="pb-16 md:pb-20">
      <Container>
        <div className="mb-6">
          <h1 className="font-display text-[clamp(2rem,4.5vw,2.875rem)] font-normal leading-[1.1] tracking-[-0.02em] text-stone-900">
            Jouw aanpak
          </h1>
          <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-stone-600">
            Wat het meeste oplevert, geordend naar hoeveel het je kost.
          </p>
        </div>

        {!hasContext ? (
          <div className="rounded-[20px] bg-[#0E1A14] p-6 md:p-8">
            <p className="max-w-[50ch] text-[15px] leading-relaxed text-[#F7F5F0]">
              Doe de Leefstijlcheck om je persoonlijke aanpak te zien — geordend op prioriteit en moeite.
            </p>
            <Link
              href="/intake"
              className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#5A8F6A] px-[22px] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
            >
              Start de Leefstijlcheck →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-[#5A8F6A]/25 bg-[#F0FAF3] px-4 py-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5A8F6A]" aria-hidden />
              <span className="text-sm leading-relaxed text-[#3D6B4F]">
                Op basis van je laatste check — niet je clicks.
              </span>
            </div>

            {showQ1EiwitHero ? (
              <div className="mb-6">
                <div className="mb-4 rounded-r-lg border-l-[3px] border-[#5A8F6A] bg-[#EEF3EF] py-3 pl-4 pr-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3D6B4F]">
                    Grootste winst, kleinste stap
                  </p>
                  <p className="mt-1 text-sm text-[#3D6B4F]">
                    Voeding eerst — supplement als aanvulling.
                  </p>
                </div>
                <AanpakQ1EiwitHero />
              </div>
            ) : null}

            {recommendations.length > 0 ? (
              <>
                {!showQ1EiwitHero ? (
                  <div className="mb-4 rounded-r-lg border-l-[3px] border-[#5A8F6A] bg-[#EEF3EF] py-3 pl-4 pr-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3D6B4F]">
                      Grootste winst, kleinste stap
                    </p>
                    <p className="mt-1 text-sm text-[#3D6B4F]">
                      Begin hier: veel effect, lage drempel. Voeding eerst, supplement als aanvulling.
                    </p>
                  </div>
                ) : (
                  <h2 className="mb-4 font-display text-lg font-normal text-stone-900">
                    Aanvullend: supplementen uit je check
                  </h2>
                )}
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <ApproachCard key={rec.slug} rec={rec} isTop={index === 0 && !showQ1EiwitHero} />
                  ))}
                </div>
              </>
            ) : !showQ1EiwitHero ? (
              <div className="rounded-[20px] border border-dashed border-[#D6D3D1] px-5 py-12 text-center">
                {nutritionLogCompleted ? (
                  <p className="text-base text-stone-500">
                    Op dit moment geen specifieke aanpak-tips uit je check — je leefstijl-basis zit goed. Nieuwe kansen verschijnen hier na je volgende check-in.
                  </p>
                ) : (
                  <>
                    <p className="text-base text-stone-600">
                      Supplementadvies tonen we pas na je voedingscheck — eerst je bord, dan gericht vergelijken.
                    </p>
                    <Link
                      href="/intake/voeding"
                      className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#5A8F6A] px-[22px] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
                    >
                      Start voedingscheck →
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}
