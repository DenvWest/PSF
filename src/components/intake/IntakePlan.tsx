"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import IntakeAction from "@/components/intake/IntakeAction";
import type { PlanContent } from "@/lib/content/plan-content";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { PLAN_STEPPED_CARE_COPY } from "@/lib/plan-stepped-care-copy";
import type { ThemeSlug } from "@/lib/content/themes";

type IntakePlanProps = {
  themeSlug: ThemeSlug;
  answers: Record<string, number>;
  onBack: () => void;
  onCommitment: () => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; content: PlanContent };

export default function IntakePlan({
  themeSlug,
  answers,
  onBack,
  onCommitment,
}: IntakePlanProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const planViewedEmittedRef = useRef(false);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoadState({ status: "loading" });
      try {
        const response = await fetch("/api/intake/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme_slug: themeSlug, answers }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          if (!cancelled) {
            setLoadState({
              status: "error",
              message: payload?.error ?? "Plan kon niet worden geladen.",
            });
          }
          return;
        }

        const content = (await response.json()) as PlanContent;
        if (!cancelled) {
          if (!content.ready || content.actions.length < 3) {
            setLoadState({
              status: "error",
              message: "Plan is nog niet beschikbaar voor dit thema.",
            });
            return;
          }
          setLoadState({ status: "ready", content });
          if (!planViewedEmittedRef.current) {
            planViewedEmittedRef.current = true;
            emitIntakeClientEvent("plan.viewed", {
              theme_slug: themeSlug,
              tier_count: content.actions.length,
            });
          }
        }
      } catch {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: "Plan kon niet worden geladen.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [themeSlug, answers]);

  return (
    <>
      <Link
        href="/"
        className="fixed right-4 top-4 z-50 px-1 py-1 text-[13px] text-intake-ink-subtle no-underline transition-colors hover:text-intake-ink"
        aria-label="Sluiten"
      >
        ✕ Sluiten
      </Link>

      <div className="mx-auto box-border w-full max-w-[480px] px-6 pb-10 pt-8">
        <header className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            <span className="text-intake-terra">06</span> · Jouw plan
          </p>
          <h1 className="mb-1 font-serif text-[28px] font-normal leading-tight text-intake-ink">
            {PLAN_STEPPED_CARE_COPY.heroTitle}
          </h1>
          <p className="text-sm text-intake-ink-muted">
            {PLAN_STEPPED_CARE_COPY.heroSubtitle}
          </p>
        </header>

        {loadState.status === "loading" ? (
          <div
            className="flex min-h-[200px] flex-col items-center justify-center gap-3"
            role="status"
            aria-label="Laden"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-intake-card-border border-t-intake-terra" />
            <p className="text-sm text-intake-ink-subtle">Even geduld…</p>
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="rounded-2xl border border-intake-terra/30 bg-intake-terra/10 px-5 py-4 text-center">
            <p className="m-0 text-sm text-intake-ink-muted">{loadState.message}</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 cursor-pointer text-sm font-medium text-intake-sage underline underline-offset-2"
            >
              Terug
            </button>
          </div>
        ) : null}

        {loadState.status === "ready" ? (
          <>
            <p className="mb-5 text-center text-xs leading-relaxed text-intake-ink-subtle">
              {PLAN_STEPPED_CARE_COPY.topDisclaimer}
            </p>

            <div className="mb-6 space-y-4" aria-label="Stappen in volgorde">
              {loadState.content.actions.map((action, index) => (
                <IntakeAction
                  key={action.slug}
                  action={action}
                  step={index + 1}
                  onPlanLinkClick={(clicked) => {
                    emitIntakeClientEvent("plan.tier_action_clicked", {
                      theme_slug: themeSlug,
                      intervention_slug: clicked.slug,
                      tier: clicked.tier,
                      kind: clicked.kind,
                      is_paid: clicked.isPaid,
                    });
                  }}
                  onEvidenceClick={(clicked) => {
                    emitIntakeClientEvent("plan.evidence_clicked", {
                      theme_slug: themeSlug,
                      intervention_slug: clicked.slug,
                      tier: clicked.tier,
                    });
                  }}
                />
              ))}
            </div>

            <p className="mb-5 text-center text-xs leading-relaxed text-intake-ink-subtle">
              {PLAN_STEPPED_CARE_COPY.bottomDisclaimer}
            </p>

            <div className="text-center">
              <button
                type="button"
                onClick={onCommitment}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[10px] border-none px-6 py-3.5 text-sm font-bold text-white"
                style={{ background: "#C8956C" }}
              >
                {PLAN_STEPPED_CARE_COPY.commitmentCta}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 cursor-pointer text-sm font-medium text-intake-ink-subtle underline underline-offset-2 hover:text-intake-ink-muted"
              >
                ← Terug
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
