import Link from "next/link";
import Container from "@/components/layout/Container";
import ApproachCardLink from "@/components/insights/ApproachCardLink";
import { getAccountFromCookie } from "@/lib/account-server";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { PILLAR } from "@/data/dashboard";
import { catalogBySlug } from "@/data/supplement-hub/catalog";
import { EIWIT_CARD_COPY, isEiwitPriority } from "@/data/approach/eiwit-card";

function EiwitCard() {
  const voedingHub = PILLAR.voeding.hubRoute;
  const guideHref = catalogBySlug.eiwitpoeder?.guideHref ?? "/supplementen/eiwitpoeder";
  const comparisonHref = catalogBySlug.eiwitpoeder?.comparisonHref ?? null;

  return (
    <article className="rounded-[20px] border border-[#E7E5E4] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#EEF3EF] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A8F6A]">
          {EIWIT_CARD_COPY.prioriteitLabel}
        </span>
        <span className="rounded-full bg-[#FAF9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500 ring-1 ring-[#E7E5E4]">
          {EIWIT_CARD_COPY.moeiteLabel}
        </span>
      </div>

      <h2 className="mt-4 font-display text-[26px] font-normal text-stone-900">
        {EIWIT_CARD_COPY.title}
      </h2>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-stone-600">
        {EIWIT_CARD_COPY.why}
      </p>

      <Link
        href={guideHref}
        className="mt-4 inline-flex items-center rounded-md bg-[#F0FAF3] px-3 py-2 text-[13px] font-semibold text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]"
      >
        {EIWIT_CARD_COPY.evidenceLabel} ›
      </Link>

      <div className="mt-5">
        <ApproachCardLink
          href={voedingHub}
          destination="approach_eiwit_gids"
          className="inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-[22px] py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
        >
          {EIWIT_CARD_COPY.ctaLabel}
        </ApproachCardLink>
      </div>

      {comparisonHref ? (
        <div className="mt-5 flex items-start gap-2 border-t border-[#F0EEEC] pt-4">
          <span className="mt-0.5 shrink-0 rounded-[3px] border border-[#D6D3D1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-stone-400">
            adv
          </span>
          <p className="text-[13px] leading-relaxed text-stone-400">
            {EIWIT_CARD_COPY.affiliateLead}{" "}
            <ApproachCardLink
              href={comparisonHref}
              destination="approach_eiwit_vergelijk"
              className="text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-800"
            >
              {EIWIT_CARD_COPY.affiliateLink}
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
  const answers = dashboard?.answers ?? null;
  const showEiwit = hasContext && isEiwitPriority(answers);

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

            {showEiwit ? (
              <EiwitCard />
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#D6D3D1] px-5 py-12 text-center">
                <p className="text-base text-stone-500">
                  Op dit moment geen grote eiwit-winst voor jou — mooi. Je volgende kansen verschijnen hier na je volgende check-in.
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
