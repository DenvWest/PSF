"use client";

import Link from "next/link";
import type { PlanAction } from "@/lib/content/plan-content";

const TIER_LABELS: Record<number, string> = {
  1: "Stap 1 · Gratis",
  2: "Stap 2 · Meten",
  3: "Stap 3 · Ondersteuning",
  4: "Optioneel",
  5: "Optioneel",
};

const KIND_LABELS: Record<PlanAction["kind"], string> = {
  free_action: "Leefstijl",
  measurement: "Meten",
  supplement: "Supplement",
};

type PlanContentSectionProps = {
  actions: PlanAction[];
  ready: boolean;
};

function actionHref(action: PlanAction): string | null {
  if (action.kind === "supplement" && action.comparisonPath) {
    return action.comparisonPath;
  }
  if (action.externalProviderUrl) {
    return action.externalProviderUrl;
  }
  return action.comparisonPath ?? action.affiliateUrl;
}

export default function PlanContentSection({
  actions,
  ready,
}: PlanContentSectionProps) {
  if (actions.length === 0) {
    return null;
  }

  const sorted = [...actions].sort((a, b) => a.tier - b.tier);

  return (
    <section
      className="mb-6 rounded-2xl border border-intake-card-border bg-intake-bg-elevated/60 px-5 py-4"
      aria-label="Jouw stappenplan"
    >
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
        {ready ? "Jouw volgorde" : "Eerst dit"}
      </p>
      <h2 className="mb-4 font-serif text-lg font-normal text-intake-ink">
        Leefstijl eerst — daarna pas supplementen
      </h2>
      <ol className="space-y-4">
        {sorted.map((action) => {
          const href = actionHref(action);
          const tierLabel = TIER_LABELS[action.tier] ?? `Stap ${action.tier}`;
          return (
            <li
              key={`${action.kind}-${action.slug}`}
              className="rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3.5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-intake-sage">
                {tierLabel} · {KIND_LABELS[action.kind]}
              </p>
              <p className="mt-1 text-sm font-semibold text-intake-ink">{action.name}</p>
              {action.description ? (
                <p className="mt-2 text-sm leading-relaxed text-intake-ink-muted">
                  {action.description}
                </p>
              ) : null}
              {action.claimText ? (
                <p className="mt-2 text-xs leading-relaxed text-intake-ink-subtle">
                  {action.claimText}
                  {action.sourceLabel ? (
                    <span className="block mt-1">Bron: {action.sourceLabel}</span>
                  ) : null}
                </p>
              ) : null}
              {action.paidDisclosureText ? (
                <p className="mt-2 text-xs text-intake-ink-subtle">{action.paidDisclosureText}</p>
              ) : null}
              {href ? (
                <Link
                  href={href}
                  className="mt-3 inline-block text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                  {...(action.isPaid
                    ? { rel: "nofollow sponsored", target: "_blank" }
                    : {})}
                >
                  {action.kind === "supplement" ? "Bekijk vergelijking →" : "Meer info →"}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
