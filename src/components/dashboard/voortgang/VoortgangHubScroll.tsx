"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DomeinDoelZetten, {
  type DomeinDoelZettenExistingGoal,
} from "@/components/dashboard/voortgang/DomeinDoelZetten";
import VoortgangHero from "@/components/dashboard/voortgang/VoortgangHero";
import VoortgangMetingenPerDomein from "@/components/dashboard/voortgang/VoortgangMetingenPerDomein";
import { PILLAR } from "@/data/dashboard";
import { deriveGoalMode, type DomainGoalDomain } from "@/lib/domain-goal";
import {
  fetchDomainGoals,
  fetchMovementAnchor,
  type DomainGoalMap,
} from "@/lib/domain-goal-client";
import { DOMAIN_CHECK_PILLAR_IDS } from "@/lib/kompas-domain-check";
import type { MovementAnchor } from "@/lib/movement-prefs";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangHubScrollProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
  onOpenDomain: (domain: PillarId) => void;
};

/**
 * Welk domein de reeks onder de cyclus opent. Je prioriteit als die een eigen
 * check kent, anders het eerste domein dat er wel een heeft — nooit een domein
 * dat hier per definitie leeg zou blijven.
 */
function resolveStartDomain(priority: PillarId): PillarId {
  return DOMAIN_CHECK_PILLAR_IDS.includes(priority)
    ? priority
    : DOMAIN_CHECK_PILLAR_IDS[0];
}

export default function VoortgangHubScroll({
  model,
  data,
  onGoAgenda,
  onGoHermeting,
  onOpenDomain,
}: VoortgangHubScrollProps) {
  const [goals, setGoals] = useState<DomainGoalMap | null>(null);
  const [anchor, setAnchor] = useState<MovementAnchor | null>(null);
  const [openGoalDomain, setOpenGoalDomain] = useState<DomainGoalDomain | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<PillarId>(() =>
    resolveStartDomain(model.priority.id),
  );

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
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
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
        <VoortgangMetingenPerDomein
          data={data}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          goals={goals}
          onOpenGoal={setOpenGoalDomain}
          onOpenDomain={onOpenDomain}
        />
      </div>

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
