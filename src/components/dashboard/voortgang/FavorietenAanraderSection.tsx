"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Button, Card } from "@/components/app/primitives";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import type { RecommendedSupplement } from "@/lib/build-recommendations";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";

type FavorietenAanraderSectionProps = {
  recommendation: RecommendedSupplement | null;
  comparisonCount?: number;
  onOpenStatistieken: () => void;
};

export default function FavorietenAanraderSection({
  recommendation,
  comparisonCount,
  onOpenStatistieken,
}: FavorietenAanraderSectionProps) {
  if (!recommendation) {
    return null;
  }

  const comparisonHref = withVoortgangReturn(
    recommendation.comparisonHref ?? recommendation.guideHref,
  );
  const compareLabel =
    comparisonCount && comparisonCount > 0
      ? `Vergelijk ${comparisonCount} ${recommendation.name.toLowerCase()}-potjes`
      : `Bekijk ${recommendation.name}`;

  return (
    <section aria-label="Onze aanrader" style={{ marginBottom: 24 }}>
      <VoortgangSectionHeader eyebrow="Onze aanrader" title="Wat wij zouden kiezen" />

      <Card pad={16}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }} aria-hidden>
            {recommendation.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 18,
                color: "var(--text)",
                lineHeight: 1.25,
              }}
            >
              {recommendation.name}
            </div>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                textWrap: "pretty",
              }}
            >
              {recommendation.wiifm}
            </p>
          </div>
        </div>

        <Link
          href={comparisonHref}
          onClick={() => {
            trackEvent("dashboard_aanrader_click", {
              slug: recommendation.slug,
              target: comparisonHref,
              surface: "voortgang_favorieten",
            });
            clarityTag("dashboard_aanrader", recommendation.slug);
            emitIntakeClientEvent("dashboard.aanrader_clicked", {
              slug: recommendation.slug,
              target: comparisonHref,
              surface: "voortgang_favorieten",
            });
          }}
          style={{ display: "block", marginTop: 16, textDecoration: "none" }}
        >
          <Button variant="primary" full>
            {compareLabel} →
          </Button>
        </Link>

        <button
          type="button"
          onClick={() => {
            trackEvent("dashboard_voortgang_hub_click", {
              destination: "statistieken",
              surface: "favorieten_waarom",
            });
            clarityTag("dashboard_voortgang", "favorieten_waarom");
            onOpenStatistieken();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            padding: 0,
            border: "none",
            background: "none",
            fontSize: 13,
            color: "var(--text-muted)",
            cursor: "pointer",
            textWrap: "pretty",
          }}
        >
          <Icons.Spark s={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
          Waarom dit? → Statistieken
        </button>
      </Card>
    </section>
  );
}
