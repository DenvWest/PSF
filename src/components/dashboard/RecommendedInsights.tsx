"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import { INSIGHT_TYPE_LABELS } from "@/components/insights/ContentCard";
import { PILLAR } from "@/data/dashboard";
import { buildPremiumKennisbankHref, filterInsights } from "@/data/insights";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import type { PillarId } from "@/types/dashboard";

export default function RecommendedInsights({ pillarId }: { pillarId: PillarId }) {
  const items = filterInsights({ pijler: pillarId })
    .filter((item) => item.type !== "begrip")
    .slice(0, 3);
  if (items.length === 0) return null;

  const label = PILLAR[pillarId].label;
  const premiumHref = buildPremiumKennisbankHref(pillarId);

  return (
    <Card pad={20}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(90,143,106,0.18)",
            color: "var(--sage)",
            border: "1px solid rgba(90,143,106,0.32)",
          }}
        >
          <Icons.BookOpen s={17} />
        </span>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          Achtergrond bij {label.toLowerCase()}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, index) => (
          <Link
            key={`${item.source}-${item.slug}`}
            href={item.href}
            onClick={() =>
              trackEvent("dashboard_recommended_insight_click", {
                pillar: pillarId,
                slug: item.slug,
                source: item.source,
              })
            }
            style={{
              display: "block",
              padding: "10px 0",
              borderTop: index > 0 ? "1px solid var(--divider)" : "none",
              textDecoration: "none",
            }}
          >
            <div style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 500, lineHeight: 1.4 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 3 }}>
              {INSIGHT_TYPE_LABELS[item.type]}
              {item.readingTime ? ` · ${item.readingTime}` : ""}
            </div>
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        <Link
          href={premiumHref}
          onClick={() => {
            trackEvent("dashboard_premium_kennisbank_click", { pillar: pillarId });
            emitIntakeClientEvent("dashboard.cta_to_hub", {
              pillar: pillarId,
              destination: "inzichten_premium",
            });
          }}
          style={{
            display: "inline-block",
            color: "var(--sage)",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--f-sans)",
            textDecoration: "none",
          }}
        >
          Verdieping na je check →
        </Link>
        <Link
          href={`/inzichten?pijler=${pillarId}`}
          onClick={() =>
            emitIntakeClientEvent("dashboard.cta_to_hub", {
              pillar: pillarId,
              destination: "inzichten",
            })
          }
          style={{
            display: "inline-block",
            color: "var(--text-subtle)",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--f-sans)",
            textDecoration: "none",
          }}
        >
          Alles over {label.toLowerCase()} →
        </Link>
      </div>
    </Card>
  );
}
