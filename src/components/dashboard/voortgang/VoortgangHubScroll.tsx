"use client";

import { useEffect, useState } from "react";
import VoortgangDomeinRing from "@/components/dashboard/voortgang/VoortgangDomeinRing";
import KompasFocusSection from "@/components/dashboard/voortgang/KompasFocusSection";
import DomeinDoelZetten, {
  type DomeinDoelZettenExistingGoal,
} from "@/components/dashboard/voortgang/DomeinDoelZetten";
import VoortgangHero from "@/components/dashboard/voortgang/VoortgangHero";
import VoortgangRichtingBeat from "@/components/dashboard/voortgang/VoortgangRichtingBeat";
import VoortgangRouteList from "@/components/dashboard/voortgang/VoortgangRouteList";
import { PILLAR } from "@/data/dashboard";
import { deriveGoalMode, type DomainGoalDomain } from "@/lib/domain-goal";
import {
  fetchDomainGoals,
  fetchMovementAnchor,
  type DomainGoalMap,
} from "@/lib/domain-goal-client";
import type { MovementAnchor } from "@/lib/movement-prefs";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangHubScrollProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
  onOpenDomain: (domain: PillarId) => void;
  onOpenStatistieken: () => void;
  onOpenFavorieten: () => void;
  onOpenInzichten: () => void;
};

export default function VoortgangHubScroll({
  model,
  data,
  onGoAgenda,
  onGoHermeting,
  onOpenDomain,
  onOpenStatistieken,
  onOpenFavorieten,
  onOpenInzichten,
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

      <KompasFocusSection model={model} data={data} />

      <div className="mt-3.5">
        <VoortgangDomeinRing
          model={model}
          data={data}
          goals={goals}
          onOpenDomain={onOpenDomain}
          onOpenGoal={setOpenGoalDomain}
        />
      </div>

      <VoortgangRichtingBeat
        model={model}
        data={data}
        goals={goals}
        onOpenStatistieken={onOpenStatistieken}
      />

      <div className="mb-5 mt-2">
        <VoortgangRouteList
          onOpenStatistieken={onOpenStatistieken}
          onOpenFavorieten={onOpenFavorieten}
          onOpenInzichten={onOpenInzichten}
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
