"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import { buildAfleiding } from "@/lib/supplement-afleiding";
import {
  buildVerdictCards,
  buildVerdictSummary,
  countVerdictsWithoutPurchase,
  type VerdictTone,
} from "@/lib/supplement-verdict-copy";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { IngredientClaimKey } from "@/data/approved-claims";
import type { StoredSupplementVerdict } from "@/types/verdict";

const TONE_COLOR: Record<VerdictTone, string> = {
  ja: "var(--sage, #5A8F6A)",
  wacht: "var(--terra, #C8956C)",
  nee: "var(--text-subtle)",
};

const TONE_BORDER: Record<VerdictTone, string> = {
  ja: "rgba(90, 143, 106, 0.4)",
  wacht: "rgba(200, 149, 108, 0.4)",
  nee: "var(--divider-strong)",
};

export type VerdictPanelSurface =
  | "voortgang"
  | "favorieten"
  | "leefstijlprofiel"
  | "statistieken"
  | "voortgang_slaap"
  | "voortgang_stress"
  | "voortgang_voeding"
  | "voortgang_beweging"
  | "favorieten_schap_producten"
  | "schap_beweging"
  | "schap_slaap"
  | "schap_voeding"
  | "leefstijlprofiel_beweging";

type SupplementVerdictPanelProps = {
  verdicts: StoredSupplementVerdict[];
  variant?: "summary" | "full";
  surface?: VerdictPanelSurface;
  onViewAll?: () => void;
  hideHeader?: boolean;
  showFavoriteSave?: boolean;
  favoriteSource?: "aanbevolen" | "mijn_keuze";
};

export default function SupplementVerdictPanel({
  verdicts,
  variant = "full",
  surface = "voortgang",
  onViewAll,
  hideHeader = false,
  showFavoriteSave = false,
  favoriteSource = "mijn_keuze",
}: SupplementVerdictPanelProps) {
  const [openIngredient, setOpenIngredient] = useState<string | null>(null);
  const allCards = buildVerdictCards(verdicts);
  const summary = buildVerdictSummary(verdicts);
  const cards =
    variant === "summary" ? allCards.slice(0, 3) : allCards;

  // De belangrijkste geloofwaardigheidsmetriek die het schap heeft: hoe vaak
  // staat er "Nu niet" of "Nog geen oordeel" naast een "Aanrader"? Eén
  // impressie per render met een nieuwe verdict-set, geen ruis per kaart.
  const negativeCount = countVerdictsWithoutPurchase(verdicts);
  const impressionKey = `${verdicts.length}:${negativeCount}:${surface}`;
  const trackedImpressionRef = useRef<string | null>(null);
  useEffect(() => {
    if (cards.length === 0 || trackedImpressionRef.current === impressionKey) {
      return;
    }
    trackedImpressionRef.current = impressionKey;
    trackEvent("dashboard_schap_getoond", {
      surface,
      total: verdicts.length,
      negative: negativeCount,
      positive: verdicts.length - negativeCount,
    });
    emitIntakeClientEvent("dashboard.schap_getoond", {
      surface,
      total: verdicts.length,
      negative: negativeCount,
      positive: verdicts.length - negativeCount,
    });
  }, [cards.length, impressionKey, negativeCount, surface, verdicts.length]);

  if (cards.length === 0) {
    return null;
  }

  const isSummary = variant === "summary";
  const verdictByIngredient = new Map(verdicts.map((row) => [row.ingredientKey, row]));

  const handleAfleidingToggle = (ingredientKey: string, verdict: string) => {
    const next = openIngredient === ingredientKey ? null : ingredientKey;
    setOpenIngredient(next);
    if (next) {
      trackEvent("dashboard_afleiding_open", { ingredient: ingredientKey, verdict, surface });
      clarityTag("dashboard_afleiding", ingredientKey);
      emitIntakeClientEvent("dashboard.afleiding_opened", {
        ingredient_key: ingredientKey,
        verdict,
        surface,
      });
    }
  };

  const verdictList = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {cards.map((card) => {
        const row = verdictByIngredient.get(card.ingredientKey);
        const afleiding = row
          ? buildAfleiding(card.ingredientKey as IngredientClaimKey, row)
          : null;
        const isOpen = openIngredient === card.ingredientKey;

        return (
          <article
            key={card.ingredientKey}
            data-tone={card.tone}
            style={{
              border: `1px solid ${TONE_BORDER[card.tone]}`,
              borderRadius: 16,
              background: "var(--panel, rgba(255,255,255,0.04))",
              padding: "15px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                marginBottom: 9,
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: `1px solid ${TONE_BORDER[card.tone]}`,
                  color: "var(--text-muted)",
                }}
              >
                Product
              </span>
              {showFavoriteSave ? (
                <FavoriteSaveButton
                  compact
                  surface={surface}
                  item={{
                    id: card.ingredientKey,
                    title: card.name,
                    kind: "supplement",
                    source: favoriteSource,
                  }}
                />
              ) : null}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: TONE_COLOR[card.tone],
                }}
              >
                {card.label}
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--f-serif)",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: 1.25,
                color: "var(--text)",
                margin: "0 0 6px",
              }}
            >
              {card.name}
            </h3>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {card.reason}
            </p>

            {afleiding ? (
              <>
                <button
                  type="button"
                  onClick={() => handleAfleidingToggle(card.ingredientKey, card.verdict)}
                  aria-expanded={isOpen}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 9,
                    padding: 0,
                    border: "none",
                    background: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  {isOpen ? "Verberg hoe we hier komen" : "Hoe we hier komen"}
                  <Icons.ChevronRight
                    s={12}
                    style={{ transform: isOpen ? "rotate(90deg)" : undefined }}
                  />
                </button>
                {isOpen ? (
                  <>
                    <dl
                      style={{
                        margin: "9px 0 0",
                        border: "1px solid var(--divider)",
                        borderRadius: 10,
                        background: "rgba(0,0,0,0.18)",
                        overflow: "hidden",
                      }}
                    >
                      <AfleidingRow
                        label="Signaal"
                        text={afleiding.signaalLine}
                        last={!afleiding.zekerheidLine && !afleiding.bloedLine}
                      />
                      {afleiding.zekerheidLine ? (
                        <AfleidingRow
                          label="Zekerheid"
                          text={afleiding.zekerheidLine}
                          confidence={afleiding.confidence}
                          last={!afleiding.bloedLine}
                        />
                      ) : null}
                      {afleiding.bloedLine ? (
                        <AfleidingRow label="Bloedwaarde" text={afleiding.bloedLine} last />
                      ) : null}
                    </dl>
                    <p
                      style={{
                        margin: "11px 0 0",
                        fontSize: 12,
                        lineHeight: 1.55,
                        color: "var(--text-muted)",
                        borderLeft: "2px solid rgba(90, 143, 106, 0.45)",
                        paddingLeft: 10,
                        textWrap: "pretty",
                      }}
                    >
                      {afleiding.claimLine}
                    </p>
                  </>
                ) : null}
              </>
            ) : null}

            <p
              style={{
                fontSize: 11,
                color: "var(--text-subtle)",
                lineHeight: 1.5,
                margin: "9px 0 0",
                textWrap: "pretty",
              }}
            >
              {card.comparisonPath
                ? "We ontvangen commissie als je via ons koopt. Het oordeel is los daarvan opgesteld en verandert niet mee."
                : "Hier verdienen we niets aan, en je kunt er ook niets via ons kopen."}
            </p>

            {card.comparisonPath ? (
              <Link
                href={withVoortgangReturn(card.comparisonPath)}
                onClick={() => {
                  trackEvent("dashboard_schap_vergelijking_click", {
                    ingredient: card.ingredientKey,
                    verdict: card.verdict,
                    surface,
                  });
                  clarityTag("dashboard_schap_vergelijking", card.ingredientKey);
                  emitIntakeClientEvent("dashboard.schap_vergelijking_click", {
                    ingredient_key: card.ingredientKey,
                    verdict: card.verdict,
                    surface,
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 11,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--sage, #5A8F6A)",
                  textDecoration: "none",
                }}
              >
                Bekijk de vergelijking
                <Icons.ChevronRight s={14} />
              </Link>
            ) : null}
          </article>
        );
      })}
    </div>
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

function AfleidingRow({
  label,
  text,
  confidence,
  last = false,
}: {
  label: string;
  text: string;
  confidence?: number | null;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "78px minmax(0, 1fr)",
        gap: "4px 10px",
        padding: "10px 12px",
        borderBottom: last ? "none" : "1px solid var(--divider)",
      }}
    >
      <dt
        style={{
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-subtle)",
          paddingTop: 2,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: 12.5,
          lineHeight: 1.5,
          color: "var(--text-muted)",
          textWrap: "pretty",
        }}
      >
        {text}
        {typeof confidence === "number" ? (
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              gap: 2,
              verticalAlign: "-0.05em",
              marginLeft: 5,
            }}
          >
            {[1, 2, 3, 4].map((step) => (
              <i
                key={step}
                style={{
                  width: 5,
                  height: 9,
                  borderRadius: 1,
                  display: "block",
                  background:
                    step <= confidence ? "var(--sage, #5A8F6A)" : "rgba(255,255,255,0.14)",
                }}
              />
            ))}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
