"use client";

import { useEffect, useState } from "react";
import DomeinDoelZetten from "@/components/dashboard/voortgang/DomeinDoelZetten";
import { clarityTag } from "@/lib/clarity";
import { deriveGoalMode, getSituationLabel, type DomainGoalDomain } from "@/lib/domain-goal";
import {
  fetchDomainGoals,
  fetchMovementAnchor,
  type DomainGoalSummary,
} from "@/lib/domain-goal-client";
import { trackEvent } from "@/lib/ga4";
import type { MovementAnchor } from "@/lib/movement-prefs";

type DomeinIjkpuntCheckPromptProps = {
  domain: DomainGoalDomain;
  domainLabel: string;
};

/**
 * Slice D (PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md §10.1): het zetmoment
 * aangehaakt op de result-tak van de domeincheck. Hergebruikt DomeinDoelZetten
 * uit slice B — geen nieuwe flow. domain_goal is account-only (RLS deny-all,
 * service-role); zonder account faalt de fetch stil en rendert dit niets —
 * dat geldt voor iedereen die deze check nog vóór een account doet.
 */
export default function DomeinIjkpuntCheckPrompt({
  domain,
  domainLabel,
}: DomeinIjkpuntCheckPromptProps) {
  const [goal, setGoal] = useState<DomainGoalSummary | null | undefined>(undefined);
  const [anchor, setAnchor] = useState<MovementAnchor | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchDomainGoals();
      if (!cancelled && result) {
        setGoal(result[domain] ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [domain]);

  useEffect(() => {
    if (domain !== "beweging") {
      return;
    }
    let cancelled = false;
    void (async () => {
      const result = await fetchMovementAnchor();
      if (!cancelled) {
        setAnchor(result);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [domain]);

  if (goal === undefined) {
    return null;
  }

  const latestScore = goal ? (goal.scores[goal.scores.length - 1]?.score ?? null) : null;
  const heading = goal ? goal.ownWords || getSituationLabel(domain, goal.situationId) : null;

  return (
    <>
      <section
        aria-labelledby={`domain-goal-${domain}-heading`}
        className="mt-8 rounded-[14px] border border-intake-sage/30 bg-intake-sage/10 px-5 py-4"
      >
        <h2
          id={`domain-goal-${domain}-heading`}
          className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-intake-sage"
        >
          {goal ? "Je eigen doel" : "Zet een eigen doel"}
        </h2>
        {goal ? (
          <p className="text-sm leading-relaxed text-intake-ink-muted">
            {heading}
            {latestScore != null ? ` · nu ${latestScore}` : ""}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-intake-ink-muted">
            Benoem iets dat je zelf weer wil kunnen op het gebied van{" "}
            {domainLabel.toLowerCase()} — je scoort het zelf, bij elke check opnieuw.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            trackEvent("intake_domain_goal_prompt_click", {
              domain,
              entry: goal ? "rescore" : "set",
            });
            clarityTag("intake_domain_goal_prompt", domain);
            setOpen(true);
          }}
          className="mt-3 cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-intake-sage hover:underline"
        >
          {goal ? "Ijkpunt bijwerken →" : "Zet je doel →"}
        </button>
      </section>

      {open ? (
        <DomeinDoelZetten
          open
          domain={domain}
          domainLabel={domainLabel}
          anchor={anchor}
          existingGoal={
            goal ? { situationId: goal.situationId, ownWords: goal.ownWords } : null
          }
          entryPoint="check"
          onClose={() => setOpen(false)}
          onSaved={(result) => {
            setGoal((current) => {
              const previousScores = result.reformulated ? [] : (current?.scores ?? []);
              const previousScore = previousScores[previousScores.length - 1]?.score ?? null;
              return {
                situationId: result.situationId,
                ownWords: result.ownWords,
                scores: [...previousScores, { score: result.score }],
                mode: deriveGoalMode(result.score, previousScore),
              };
            });
          }}
        />
      ) : null}
    </>
  );
}
