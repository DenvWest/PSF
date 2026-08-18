"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VoortgangDomeinRing from "@/components/dashboard/voortgang/VoortgangDomeinRing";
import DomeinDoelZetten, {
  type DomeinDoelZettenExistingGoal,
} from "@/components/dashboard/voortgang/DomeinDoelZetten";
import VoortgangHero from "@/components/dashboard/voortgang/VoortgangHero";
import VoortgangRichtingBeat from "@/components/dashboard/voortgang/VoortgangRichtingBeat";
import VoortgangOverTijdSection from "@/components/dashboard/voortgang/VoortgangOverTijdSection";
import LeefstijllijnSection from "@/components/dashboard/LeefstijllijnSection";
import { PILLAR } from "@/data/dashboard";
import { deriveGoalMode, type DomainGoalDomain } from "@/lib/domain-goal";
import {
  fetchDomainGoals,
  fetchMovementAnchor,
  type DomainGoalMap,
} from "@/lib/domain-goal-client";
import type { MovementAnchor } from "@/lib/movement-prefs";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";
import type { ReactNode } from "react";

type VoortgangHubScrollProps = {
  model: DashboardModel;
  data?: DashboardData;
  overTijdExtra?: ReactNode;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
  onOpenDomain: (domain: PillarId) => void;
  onScrollToOverTijd: () => void;
};

export default function VoortgangHubScroll({
  model,
  data,
  overTijdExtra,
  onGoAgenda,
  onGoHermeting,
  onOpenDomain,
  onScrollToOverTijd,
}: VoortgangHubScrollProps) {
  const [goals, setGoals] = useState<DomainGoalMap | null>(null);
  const [anchor, setAnchor] = useState<MovementAnchor | null>(null);
  const [openGoalDomain, setOpenGoalDomain] = useState<DomainGoalDomain | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchDomainGoals();
      if (!cancelled && result) {
        setGoals(result);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchMovementAnchor();
      if (!cancelled && result) {
        setAnchor(result);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openGoal = openGoalDomain ? (goals?.[openGoalDomain] ?? null) : null;
  const openGoalExisting: DomeinDoelZettenExistingGoal | null = openGoal
    ? { situationId: openGoal.situationId, ownWords: openGoal.ownWords }
    : null;

  return (
    <>
      <VoortgangHero
        model={model}
        data={data}
        onGoAgenda={onGoAgenda}
        onGoHermeting={onGoHermeting}
        onOpenDomain={onOpenDomain}
      />

      <p className="mt-2 text-[13px] text-[var(--text-muted)]">
        Je werkt aan{" "}
        <Link
          href={`/dashboard?tab=vandaag&kompas=${model.priority.id}`}
          className="font-semibold text-[var(--sage)] no-underline"
        >
          {model.priority.label.toLowerCase()}
        </Link>
        .{" "}
        <Link href="/dashboard?tab=vandaag" className="text-[var(--text-subtle)] no-underline">
          Naar Vandaag →
        </Link>
      </p>

      <div className="mt-3.5">
        <VoortgangDomeinRing
          model={model}
          data={data}
          goals={goals}
          onOpenDomain={onOpenDomain}
          onOpenGoal={setOpenGoalDomain}
        />
      </div>

      <div className="mt-4">
        <LeefstijllijnSection
          model={model}
          surface="voortgang"
          compact
          focusPillarId={model.priority.id}
        />
      </div>

      <VoortgangRichtingBeat
        model={model}
        data={data}
        goals={goals}
        onScrollToOverTijd={onScrollToOverTijd}
      />

      <VoortgangOverTijdSection model={model}>{overTijdExtra}</VoortgangOverTijdSection>

      {openGoalDomain ? (
        <DomeinDoelZetten
          key={openGoalDomain}
          open
          domain={openGoalDomain}
          domainLabel={PILLAR[openGoalDomain].label}
          anchor={anchor}
          existingGoal={openGoalExisting}
          onClose={() => setOpenGoalDomain(null)}
          onSaved={(result) => {
            setGoals((current) => {
              const previousScores = result.reformulated
                ? []
                : (current?.[openGoalDomain]?.scores ?? []);
              const previousScore = previousScores[previousScores.length - 1]?.score ?? null;
              return {
                ...current,
                [openGoalDomain]: {
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
