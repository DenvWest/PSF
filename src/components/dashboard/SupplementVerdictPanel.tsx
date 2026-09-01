"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import { getIngredientVisual } from "@/data/supplement-hub/ingredient-visuals";
import { resolveSupplementLadderPlek } from "@/lib/keuze-spiegel";
import { buildAfleiding, buildVerdictFacts } from "@/lib/supplement-afleiding";
import {
  buildVerdictCards,
  buildVerdictSummary,
  countVerdictsWithoutPurchase,
  type VerdictTone,
} from "@/lib/supplement-verdict-copy";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { IngredientClaimKey } from "@/data/approved-claims";
import type { PillarId } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * Eén toonschema per oordeel, in de tokens van het dashboard. De vorm volgt de
 * productkaart op /supplementen — kop met badge, feitenstrook, uitklapbare
 * onderbouwing, actierij — zodat dezelfde stof op beide oppervlakken hetzelfde
 * leest. Wat verschilt is wat er vergeleken wordt: daar producten langs de
 * PS-Score, hier één stof langs de check die het oordeel droeg.
 */
const TONE: Record<
  VerdictTone,
  { card: string; badge: string; dot: string; text: string }
> = {
  ja: {
    card: "border-[rgba(90,143,106,0.40)]",
    badge: "border-[rgba(90,143,106,0.45)] bg-[rgba(90,143,106,0.16)] text-[#9CC5A9]",
    dot: "bg-[#9CC5A9]",
    text: "text-[#9CC5A9]",
  },
  wacht: {
    card: "border-[rgba(200,149,108,0.40)]",
    badge: "border-[rgba(200,149,108,0.45)] bg-[rgba(200,149,108,0.14)] text-[#DDB58F]",
    dot: "bg-[#DDB58F]",
    text: "text-[#DDB58F]",
  },
  nee: {
    card: "border-[var(--divider-strong)]",
    badge: "border-white/10 bg-white/[0.05] text-[var(--text-muted)]",
    dot: "bg-[var(--text-subtle)]",
    text: "text-[var(--text-muted)]",
  },
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
  | "leefstijlprofiel_beweging"
  | "leefstijlprofiel_slaap"
  | "leefstijlprofiel_voeding"
  | "leefstijlprofiel_stress";

type SupplementVerdictPanelProps = {
  verdicts: StoredSupplementVerdict[];
  variant?: "summary" | "full";
  surface?: VerdictPanelSurface;
  /**
   * Het leefstijldomein dat de rangorde levert. Zonder deze prop draagt de
   * kaart geen ladderplek: een laag uit het verkeerde domein is erger dan geen
   * laag.
   */
  ladderDomain?: PillarId;
  onViewAll?: () => void;
  hideHeader?: boolean;
  showFavoriteSave?: boolean;
  favoriteSource?: "aanbevolen" | "mijn_keuze";
};

function formatOordeelDatum(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function SupplementVerdictPanel({
  verdicts,
  variant = "full",
  surface = "voortgang",
  ladderDomain,
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
  const plek = ladderDomain ? resolveSupplementLadderPlek(ladderDomain) : null;
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

  /**
   * Beide uitgangen dragen dezelfde durable gebeurtenis met een `bestemming`
   * erbij — zo is af te lezen of iemand de brede catalogus of de redactionele
   * vergelijking kiest, zonder een tweede eventtype te verzinnen.
   */
  const handleUitgang = (
    ingredientKey: string,
    verdict: string,
    bestemming: "catalogus" | "vergelijking",
  ) => {
    trackEvent("dashboard_schap_vergelijking_click", {
      ingredient: ingredientKey,
      verdict,
      surface,
      bestemming,
    });
    clarityTag("dashboard_schap_vergelijking", `${ingredientKey}:${bestemming}`);
    emitIntakeClientEvent("dashboard.schap_vergelijking_click", {
      ingredient_key: ingredientKey,
      verdict,
      surface,
      bestemming,
    });
  };

  const verdictList = (
    <div className="flex flex-col gap-2.5">
      {cards.map((card) => {
        const row = verdictByIngredient.get(card.ingredientKey);
        const afleiding = row
          ? buildAfleiding(card.ingredientKey as IngredientClaimKey, row)
          : null;
        const facts = row
          ? buildVerdictFacts(card.ingredientKey as IngredientClaimKey, row)
          : [];
        const isOpen = openIngredient === card.ingredientKey;
        const tone = TONE[card.tone];
        const visual = getIngredientVisual(card.ingredientKey);
        const datum = row ? formatOordeelDatum(row.createdAt) : null;
        const heeftUitgang = Boolean(card.hubPath || card.comparisonPath);

        return (
          <article
            key={card.ingredientKey}
            data-tone={card.tone}
            className={`@container overflow-hidden rounded-2xl border bg-white/[0.055] transition-colors duration-150 hover:bg-white/[0.075] ${tone.card}`}
          >
            <div className="flex gap-3 p-3.5 @[22rem]:gap-4 @[22rem]:p-4 @[30rem]:p-5">
              {visual ? (
                /* De foto is de stof herkenbaar maken, geen merkaanbeveling:
                   de alt-tekst noemt geen merk en er staat nergens een
                   merknaam in de copy. Bij een oordeel dat géén "ja" is gaat
                   hij grijs — het beeld mag nooit harder duwen dan het
                   oordeel erboven. */
                <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/30 @[26rem]:h-20 @[26rem]:w-20">
                  <Image
                    src={visual.imageSrc}
                    alt={visual.imageAlt}
                    width={160}
                    height={160}
                    className={`h-full w-full object-contain p-1.5 ${
                      card.tone === "ja" ? "" : "opacity-45 grayscale"
                    }`}
                    loading="lazy"
                  />
                </span>
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                      Product
                    </p>
                    <h3 className="mt-1 font-[family-name:var(--f-serif)] text-[16px] font-normal leading-tight text-[var(--text)]">
                      {card.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.08em] ${tone.badge}`}
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                    />
                    {card.label}
                  </span>
                </div>

                <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
                  {card.reason}
                </p>
              </div>
            </div>

            {plek ? (
              /* De rangorde, niet de werking. Wat hier staat is onze eigen
                 volgorde van adviseren — de laagtekst zegt zelf al dat deze
                 laag geen vervanging is van de lagen erboven. Een cijfer voor
                 hoeveel de stof "helpt" zou een gezondheidsclaim zijn en mag
                 alleen in de goedgekeurde EU-bewoording. */
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/[0.07] px-3.5 py-2.5 @[22rem]:px-4 @[30rem]:px-5">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                  Plek in je plan
                </p>
                <span aria-hidden className="flex w-20 gap-[3px]">
                  {Array.from({ length: plek.totalLayers }, (_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 flex-1 rounded-full ${
                        index + 1 === plek.layerId
                          ? "bg-[var(--terra,#C8956C)]"
                          : "bg-[rgba(90,143,106,0.45)]"
                      }`}
                    />
                  ))}
                </span>
                <p className="text-[11.5px] font-semibold text-[var(--text-muted)]">
                  Laag {plek.layerId} van {plek.totalLayers} · {plek.layerName}
                </p>
                <p className="ml-auto text-[11px] text-[var(--text-subtle)]">
                  {plek.layersAbove} lagen komen hiervóór
                </p>
              </div>
            ) : null}

            {facts.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.07] bg-black/20 px-3.5 py-3 @[22rem]:px-4 @[26rem]:grid-cols-4 @[30rem]:px-5">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                      {fact.label}
                    </dt>
                    <dd className="mt-0.5 text-[12.5px] font-semibold leading-snug text-[var(--text)] text-pretty">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {afleiding ? (
              <div className="border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => handleAfleidingToggle(card.ingredientKey, card.verdict)}
                  aria-expanded={isOpen}
                  aria-controls={`afleiding-${card.ingredientKey}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-3 text-left text-[12px] font-semibold text-[var(--text-muted)] @[22rem]:px-4 @[30rem]:px-5"
                >
                  {isOpen ? "Verberg hoe we hier komen" : "Hoe we hier komen"}
                  <Icons.ChevronRight
                    s={13}
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? "rotate(90deg)" : undefined,
                      transition: "transform 0.15s ease",
                    }}
                  />
                </button>

                {isOpen ? (
                  <div
                    id={`afleiding-${card.ingredientKey}`}
                    className="border-t border-white/[0.07] px-3.5 pb-4 pt-3 @[22rem]:px-4 @[30rem]:px-5"
                  >
                    <dl className="overflow-hidden rounded-xl border border-[var(--divider)] bg-black/20">
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
                    <p className="mt-3 border-l-2 border-[rgba(90,143,106,0.45)] pl-2.5 text-[12px] leading-relaxed text-[var(--text-muted)] text-pretty">
                      {afleiding.claimLine}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="border-t border-white/[0.07] px-3.5 py-3 @[22rem]:px-4 @[30rem]:px-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                {card.hubPath ? (
                  <Link
                    href={withVoortgangReturn(card.hubPath)}
                    onClick={() =>
                      handleUitgang(card.ingredientKey, card.verdict, "catalogus")
                    }
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--sage,#5A8F6A)] no-underline"
                  >
                    Bekijk de producten
                    <Icons.ChevronRight s={13} />
                  </Link>
                ) : null}
                {card.comparisonPath ? (
                  <Link
                    href={withVoortgangReturn(card.comparisonPath)}
                    onClick={() =>
                      handleUitgang(card.ingredientKey, card.verdict, "vergelijking")
                    }
                    className="text-[12.5px] font-medium text-[var(--text-muted)] no-underline"
                  >
                    Bekijk de vergelijking
                  </Link>
                ) : null}
                {datum ? (
                  <span className="ml-auto text-[10px] text-[var(--text-subtle)]">
                    Oordeel van {datum}
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--text-subtle)] text-pretty">
                {heeftUitgang
                  ? "We ontvangen commissie als je via ons koopt. Het oordeel is los daarvan opgesteld en verandert niet mee."
                  : "Hier verdienen we niets aan, en je kunt er ook niets via ons kopen."}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );

  return (
    <section
      aria-label={isSummary ? "Ons oordeel — samenvatting" : "Alle oordelen"}
      className={hideHeader ? undefined : "mb-6"}
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
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[14px] font-semibold text-[var(--sage)]"
        >
          Alle {allCards.length} oordelen + vergelijking →
          <Icons.ChevronRight s={16} />
        </button>
      ) : null}

      <p className="mx-0.5 mt-2.5 text-[12px] leading-relaxed text-[var(--text-subtle)] text-pretty">
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
      className={`grid grid-cols-[78px_minmax(0,1fr)] gap-x-2.5 gap-y-1 px-3 py-2.5 ${
        last ? "" : "border-b border-[var(--divider)]"
      }`}
    >
      <dt className="pt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
        {label}
      </dt>
      <dd className="m-0 text-[12.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
        {text}
        {typeof confidence === "number" ? (
          <span aria-hidden className="ml-1.5 inline-flex gap-0.5 align-[-0.05em]">
            {[1, 2, 3, 4].map((step) => (
              <i
                key={step}
                className={`block h-[9px] w-[5px] rounded-[1px] ${
                  step <= confidence ? "bg-[var(--sage,#5A8F6A)]" : "bg-white/15"
                }`}
              />
            ))}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
