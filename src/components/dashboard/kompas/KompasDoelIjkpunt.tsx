"use client";

import { useEffect, useState } from "react";
import DomeinDoelZetten, {
  type DomeinDoelZettenExistingGoal,
} from "@/components/dashboard/voortgang/DomeinDoelZetten";
import { clarityTag } from "@/lib/clarity";
import {
  deriveGoalMode,
  getSituationLabel,
  isDomainGoalDomain,
  type DomainGoalDomain,
} from "@/lib/domain-goal";
import {
  fetchDomainGoals,
  fetchMovementAnchor,
  type DomainGoalMap,
} from "@/lib/domain-goal-client";
import { trackEvent } from "@/lib/ga4";
import type { MovementAnchor } from "@/lib/movement-prefs";
import type { PillarId } from "@/types/dashboard";

type KompasDoelIjkpuntProps = {
  domain: PillarId;
  domainLabel: string;
};

const MODE_LINE: Record<NonNullable<ReturnType<typeof deriveGoalMode>>, string> = {
  verwerven: "Je bent dit aan het verwerven.",
  behouden: "Je houdt dit vast.",
  herpakken: "Je bent dit aan het herpakken.",
};

/**
 * Het ijkpunt van je focusdomein, als context bij Vandaag. Dezelfde bron en
 * hetzelfde zetmoment als de meetreeks op Voortgang — hier staat alleen het
 * domein waar je nú aan werkt, zodat je doel naast je dag hangt.
 */
export default function KompasDoelIjkpunt({ domain, domainLabel }: KompasDoelIjkpuntProps) {
  const [goals, setGoals] = useState<DomainGoalMap | null>(null);
  const [anchor, setAnchor] = useState<MovementAnchor | null>(null);
  const [open, setOpen] = useState(false);

  const goalDomain: DomainGoalDomain | null = isDomainGoalDomain(domain) ? domain : null;

  useEffect(() => {
    if (!goalDomain) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const [goalResult, anchorResult] = await Promise.all([
        fetchDomainGoals(),
        fetchMovementAnchor(),
      ]);
      if (cancelled) {
        return;
      }
      setGoals(goalResult ?? {});
      if (anchorResult) {
        setAnchor(anchorResult);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [goalDomain]);

  if (!goalDomain || goals == null) {
    return null;
  }

  const goal = goals[goalDomain] ?? null;
  const latestScore = goal ? (goal.scores[goal.scores.length - 1]?.score ?? null) : null;
  const existing: DomeinDoelZettenExistingGoal | null = goal
    ? { situationId: goal.situationId, ownWords: goal.ownWords }
    : null;

  const handleOpen = () => {
    trackEvent("dashboard_kompas_doel_click", {
      domain: goalDomain,
      entry: goal ? "rescore" : "set",
    });
    clarityTag("dashboard_kompas_home", `doel_${goalDomain}`);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="mt-3 flex w-full cursor-pointer items-start gap-2.5 rounded-xl border border-white/8 bg-black/15 px-3.5 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Je ijkpunt · {domainLabel.toLowerCase()}
          </span>
          <span className="mt-1 block text-[13.5px] leading-snug text-[#E7EDE8] text-pretty">
            {goal
              ? goal.ownWords || getSituationLabel(goalDomain, goal.situationId)
              : "Zet je eigen doel voor dit domein"}
          </span>
          <span className="mt-0.5 block text-[12px] text-[#9FB0A6]">
            {goal
              ? `${latestScore != null ? `Nu ${latestScore} van 10. ` : ""}${
                  goal.mode ? MODE_LINE[goal.mode] : ""
                }`.trim() || "Bijwerken bij je volgende check."
              : "Eén zin en een cijfer — dat is je meetlat naast de score."}
          </span>
        </span>
        <span className="shrink-0 pt-1 text-[11.5px] font-semibold text-[var(--sage)]">
          {goal ? "Bijwerken" : "Zetten"} →
        </span>
      </button>

      {open ? (
        <DomeinDoelZetten
          open
          domain={goalDomain}
          domainLabel={domainLabel}
          anchor={anchor}
          existingGoal={existing}
          onClose={() => setOpen(false)}
          onSaved={(result) => {
            setGoals((current) => {
              const previousScores = result.reformulated
                ? []
                : (current?.[goalDomain]?.scores ?? []);
              const previousScore = previousScores[previousScores.length - 1]?.score ?? null;
              return {
                ...current,
                [goalDomain]: {
                  situationId: result.situationId,
                  ownWords: result.ownWords,
                  scores: [...previousScores, { score: result.score }],
                  mode: deriveGoalMode(result.score, previousScore),
                },
              };
            });
          }}
        />
      ) : null}
    </>
  );
}
