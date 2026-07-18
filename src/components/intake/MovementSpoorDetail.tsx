"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import {
  buildNutrientBridgeIntro,
  type MovementSpoorDetailModel,
} from "@/lib/movement-week-roadmap";
import type { NutrientBridgeItem } from "@/lib/movement-nutrient-bridge";
import type { PlanStepLink } from "@/types/lifestyle-plan";
import type { MovementDailyRhythm } from "@/lib/movement-daily-rhythm";
import MovementDailyRhythmContent from "@/components/intake/MovementDailyRhythmContent";

type MovementSpoorDetailProps = {
  detail: MovementSpoorDetailModel;
  domain: string;
  templateVersion: string;
  dailyRhythm: MovementDailyRhythm | null;
  nutrientBridgeItems: NutrientBridgeItem[];
  onBack: () => void;
  renderStepRow: (stepId: string, variant: "primary" | "alternative") => ReactNode;
  onBridgeItemClick: (item: NutrientBridgeItem) => void;
  onEvidenceClick: (stepId: string, link: PlanStepLink) => void;
};

function getLinkRel(kind: PlanStepLink["kind"]): string {
  if (kind === "comparison") {
    return "nofollow sponsored";
  }
  return "noopener noreferrer";
}

function NutrientBridgeBlock({
  items,
  bridgeIntro,
  onItemClick,
}: {
  items: NutrientBridgeItem[];
  bridgeIntro: string;
  onItemClick: (item: NutrientBridgeItem) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="spoor-nutrient-bridge-heading"
      className="mt-5 rounded-2xl border border-intake-card-border bg-intake-bg px-4 py-4"
    >
      <h3 id="spoor-nutrient-bridge-heading" className="text-sm font-semibold text-intake-ink">
        Ondersteuning
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-intake-ink-subtle">{bridgeIntro}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => {
          const external = item.kind === "comparison";
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                rel={getLinkRel(item.kind)}
                target={external ? "_blank" : undefined}
                onClick={() => onItemClick(item)}
                className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 transition-colors hover:border-intake-sage/40 ${
                  item.emphasis
                    ? "border-intake-sage/30 bg-intake-sage/5"
                    : "border-intake-card-border bg-intake-bg-elevated/50"
                }`}
              >
                <span className="text-sm font-medium text-intake-ink">{item.label}</span>
                <span className="text-xs leading-relaxed text-intake-ink-subtle">
                  {item.description}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function MovementSpoorDetail({
  detail,
  domain,
  templateVersion,
  dailyRhythm,
  nutrientBridgeItems,
  onBack,
  renderStepRow,
  onBridgeItemClick,
  onEvidenceClick,
}: MovementSpoorDetailProps) {
  useEffect(() => {
    clarityTag("plan_surface", "spoor_detail");
    clarityTag("movement_week_spoor", detail.category);
  }, [detail.category]);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-2 hover:decoration-intake-sage"
      >
        ← Deze week
      </button>

      <header className="mb-4">
        <h3 className="font-serif text-xl text-intake-ink">{detail.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-intake-ink-muted">{detail.hook}</p>
      </header>

      {detail.category === "dagelijks_ritme" && dailyRhythm ? (
        <MovementDailyRhythmContent
          rhythm={dailyRhythm}
          domain={domain}
          templateVersion={templateVersion}
          embedded
        />
      ) : (
        <>
          {detail.primarySteps.length > 0 ? (
            <section aria-labelledby="spoor-actions-heading" className="space-y-3">
              <h4
                id="spoor-actions-heading"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle"
              >
                Jouw acties deze week
              </h4>
              <ul className="space-y-3">
                {detail.primarySteps.map((step) => renderStepRow(step.id, "primary"))}
              </ul>
            </section>
          ) : (
            <p className="text-sm text-intake-ink-subtle">
              Geen acties in dit spoor voor jouw profiel.
            </p>
          )}

          {detail.alternativeSteps.length > 0 ? (
            <section aria-labelledby="spoor-alternatives-heading" className="mt-5 space-y-3">
              <h4
                id="spoor-alternatives-heading"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle"
              >
                Alternatief
              </h4>
              <ul className="space-y-3">
                {detail.alternativeSteps.map((step) =>
                  renderStepRow(step.id, "alternative"),
                )}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <details className="mt-5 rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-intake-ink">
          Waarom dit werkt
        </summary>
        <p className="mt-2 text-sm leading-relaxed text-intake-ink-muted">
          {detail.mechanismSummary}
        </p>
      </details>

      {detail.evidenceLinks.length > 0 ? (
        <section aria-labelledby="spoor-evidence-heading" className="mt-4">
          <h4
            id="spoor-evidence-heading"
            className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle"
          >
            Meer onderbouwing
          </h4>
          <ul className="space-y-2">
            {detail.evidenceLinks.map((link) => {
              const external = link.kind === "comparison";
              return (
                <li key={link.stepId}>
                  <Link
                    href={link.href}
                    rel={getLinkRel(link.kind)}
                    target={external ? "_blank" : undefined}
                    onClick={() =>
                      onEvidenceClick(link.stepId, {
                        label: link.label,
                        href: link.href,
                        kind: link.kind,
                      })
                    }
                    className="inline-flex text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                  >
                    {link.label} →
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {detail.category === "kracht" ? (
        <NutrientBridgeBlock
          items={nutrientBridgeItems}
          bridgeIntro={buildNutrientBridgeIntro("kracht")}
          onItemClick={onBridgeItemClick}
        />
      ) : null}
    </div>
  );
}
