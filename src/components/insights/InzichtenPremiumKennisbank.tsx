"use client";

import Link from "next/link";
import { useEffect } from "react";
import Container from "@/components/layout/Container";
import ContentCard from "@/components/insights/ContentCard";
import {
  buildPremiumKennisbankHref,
  getPremiumKennisbankInsights,
} from "@/data/insights";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";
import type { InsightItem } from "@/types/insight";

type InzichtenPremiumKennisbankProps = {
  priorityPillarId: PillarId;
  priorityLabel: string;
  mode?: "hub" | "feed";
  feedPijler?: PillarId;
};

function selectItems(
  priorityPillarId: PillarId,
  mode: "hub" | "feed",
  feedPijler?: PillarId,
): InsightItem[] {
  if (mode === "feed") {
    return getPremiumKennisbankInsights(
      feedPijler ? { pijler: feedPijler } : undefined,
    );
  }

  const count = 4;
  const pillarItems = getPremiumKennisbankInsights({ pijler: priorityPillarId });
  if (pillarItems.length >= count) {
    return pillarItems.slice(0, count);
  }
  const fallback = getPremiumKennisbankInsights().filter(
    (item) => !pillarItems.some((p) => p.slug === item.slug),
  );
  return [...pillarItems, ...fallback].slice(0, count);
}

export default function InzichtenPremiumKennisbank({
  priorityPillarId,
  priorityLabel,
  mode = "hub",
  feedPijler,
}: InzichtenPremiumKennisbankProps) {
  const items = selectItems(priorityPillarId, mode, feedPijler);
  const viewAllHref = buildPremiumKennisbankHref(
    mode === "feed" ? feedPijler ?? priorityPillarId : priorityPillarId,
  );
  const trackPillar = feedPijler ?? priorityPillarId;

  useEffect(() => {
    clarityTag("inzichten_layer", "premium_kennisbank");
  }, []);

  if (items.length === 0) return null;

  if (mode === "feed") {
    return (
      <section
        id="premium-kennisbank"
        aria-label="Verdiepende begrippen"
        className="pb-16 md:pb-20 scroll-mt-24"
      >
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard
                key={`premium-feed-${item.slug}`}
                item={item}
                onClick={() =>
                  trackEvent("inzichten_premium_kennisbank_click", {
                    pillar: trackPillar,
                    slug: item.slug,
                  })
                }
              />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="premium-kennisbank"
      aria-label="Verdiepende begrippen"
      className="pb-4 md:pb-6 scroll-mt-24"
    >
      <Container>
        <div className="rounded-[20px] border border-[#5A8F6A]/35 bg-[#EEF3EF] p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-6">
            <div>
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
                Verdiepend — voor jou
              </p>
              <h2 className="mt-2 font-display text-[28px] font-normal text-stone-900">
                Begrippen bij je check-in
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Verdiepende kennisbank — passend bij {priorityLabel.toLowerCase()}
              </p>
            </div>
            <Link
              href={viewAllHref}
              onClick={() =>
                trackEvent("inzichten_premium_kennisbank_click", {
                  pillar: priorityPillarId,
                  slug: "view_all",
                })
              }
              className="shrink-0 text-sm font-semibold text-stone-700 transition hover:text-stone-900"
            >
              Alle verdiepende begrippen →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <ContentCard
                key={`premium-${item.slug}`}
                item={item}
                onClick={() =>
                  trackEvent("inzichten_premium_kennisbank_click", {
                    pillar: priorityPillarId,
                    slug: item.slug,
                  })
                }
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
