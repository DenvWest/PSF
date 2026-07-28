"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildVerdictCards,
  buildVerdictSummary,
  type VerdictTone,
} from "@/lib/supplement-verdict-copy";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { StoredSupplementVerdict } from "@/types/verdict";

const TONE_COLOR: Record<VerdictTone, string> = {
  ja: "var(--ps-green, #5A8F6A)",
  wacht: "var(--terra, #C8956C)",
  nee: "var(--text-subtle)",
};

export type VerdictPanelSurface = "voortgang" | "favorieten" | "statistieken";

type SupplementVerdictPanelProps = {
  verdicts: StoredSupplementVerdict[];
  variant?: "summary" | "full";
  surface?: VerdictPanelSurface;
  onViewAll?: () => void;
  hideHeader?: boolean;
};

export default function SupplementVerdictPanel({
  verdicts,
  variant = "full",
  surface = "voortgang",
  onViewAll,
  hideHeader = false,
}: SupplementVerdictPanelProps) {
  const allCards = buildVerdictCards(verdicts);
  const summary = buildVerdictSummary(verdicts);
  const cards =
    variant === "summary" ? allCards.slice(0, 3) : allCards;

  if (cards.length === 0) {
    return null;
  }

  const isSummary = variant === "summary";

  const verdictList = (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {cards.map((card, index) => (
        <li
          key={card.ingredientKey}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 10px",
            borderTop: index ? "1px solid var(--divider)" : "none",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              marginTop: 7,
              flexShrink: 0,
              background: TONE_COLOR[card.tone],
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 16,
                  color: "var(--text)",
                  lineHeight: 1.25,
                }}
              >
                {card.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: TONE_COLOR[card.tone],
                }}
              >
                {card.label}
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                margin: "2px 0 0",
                textWrap: "pretty",
              }}
            >
              {card.reason}
            </p>
            {card.comparisonPath ? (
              <Link
                href={withVoortgangReturn(card.comparisonPath)}
                onClick={() => {
                  trackEvent("dashboard_verdict_click", {
                    ingredient: card.ingredientKey,
                    verdict: card.verdict,
                    surface,
                  });
                  clarityTag("dashboard_verdict", card.ingredientKey);
                  emitIntakeClientEvent("dashboard.verdict_clicked", {
                    ingredient_key: card.ingredientKey,
                    verdict: card.verdict,
                    surface,
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  fontSize: 13,
                  color: "var(--ps-green, #5A8F6A)",
                  textDecoration: "none",
                }}
              >
                Bekijk de vergelijking
                <Icons.ChevronRight s={14} />
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={isSummary ? "Ons oordeel — samenvatting" : "Alle oordelen"}
      style={{ marginBottom: hideHeader ? 0 : 24 }}
    >
      {!hideHeader ? (
        isSummary ? (
          <VoortgangSectionHeader
            eyebrow="Stap 2 van 3 · Ons oordeel"
            title={
              summary
                ? summary.replace(/^We beoordeelden \d+ supplementen\. /, "")
                : undefined
            }
            body={
              summary?.startsWith("We beoordeelden")
                ? summary.split(". ").slice(0, 2).join(". ") + "."
                : summary ?? undefined
            }
          />
        ) : (
          <VoortgangSectionHeader eyebrow="Alle oordelen" body={summary ?? undefined} />
        )
      ) : null}

      {hideHeader ? verdictList : <CockpitTile>{verdictList}</CockpitTile>}

      {isSummary && onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            padding: 0,
            border: "none",
            background: "none",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--sage)",
            cursor: "pointer",
          }}
        >
          Alle {allCards.length} oordelen + vergelijking →
          <Icons.ChevronRight s={16} />
        </button>
      ) : null}

      <p
        style={{
          fontSize: 12,
          color: "var(--text-subtle)",
          lineHeight: 1.5,
          margin: "10px 2px 0",
          textWrap: "pretty",
        }}
      >
        Op basis van je laatste check. Adviezen, geen diagnoses — bij aanhoudende
        klachten je huisarts.
      </p>
    </section>
  );
}
