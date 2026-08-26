"use client";

import { useEffect, useState } from "react";
import { clarityTag } from "@/lib/clarity";
import { deriveGoalMode, getSituationLabel, type DomainGoalDomain } from "@/lib/domain-goal";
import { fetchMovementAnchor } from "@/lib/domain-goal-client";
import { trackEvent } from "@/lib/ga4";
import type { MovementAnchor } from "@/lib/movement-prefs";
import { patchDomainGoal, useDomainGoals } from "@/lib/use-domain-goals";
import type { DomeinDoelZettenExistingGoal } from "@/components/dashboard/voortgang/DomeinDoelZetten";

/**
 * Gedeelde staat + acties achter het ijkpunt-bewerken. Tot 26 augustus had
 * alleen `KompasDoelIjkpunt` (middenkolom) een schrijfpad; de doel-zone in
 * `KompasContextSpine` (zijbalk) was read-only. Nu dragen beide surfaces
 * dezelfde editor — deze hook is de ene plek die `patchDomainGoal` en de
 * rescore-POST aanroept, zodat een bugfix niet op één plek landt en op de
 * andere niet.
 *
 * `surface` gaat mee in de tracking (`dashboard_kompas_doel_click`), zodat je
 * kompas-home en de contextkolom uit elkaar kunt lezen zonder een nieuw event.
 */
export function useDomainGoalEditor(goalDomain: DomainGoalDomain | null, surface: string) {
  const [anchor, setAnchor] = useState<MovementAnchor | null>(null);
  const [editingDomain, setEditingDomain] = useState<DomainGoalDomain | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { goals } = useDomainGoals(goalDomain != null);

  useEffect(() => {
    if (!goalDomain) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const anchorResult = await fetchMovementAnchor();
      if (!cancelled && anchorResult) {
        setAnchor(anchorResult);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [goalDomain]);

  // Aan het domein gekoppeld, niet aan een losse boolean: wissel je van
  // domein, dan valt de open bewerking vanzelf dicht — zonder reset-effect.
  const editing = goalDomain != null && editingDomain === goalDomain;
  const goal = goalDomain && goals ? (goals[goalDomain] ?? null) : null;
  const latestScore = goal ? (goal.scores[goal.scores.length - 1]?.score ?? null) : null;
  const goalLine =
    goal && goalDomain ? goal.ownWords || getSituationLabel(goalDomain, goal.situationId) : null;
  const existing: DomeinDoelZettenExistingGoal | null = goal
    ? { situationId: goal.situationId, ownWords: goal.ownWords }
    : null;

  const openEdit = () => {
    if (!goalDomain) {
      return;
    }
    trackEvent("dashboard_kompas_doel_click", {
      domain: goalDomain,
      entry: goal ? "rescore_inline" : "set",
      surface,
    });
    clarityTag("dashboard_kompas_home", `doel_${goalDomain}`);
    if (!goal) {
      setPanelOpen(true);
      return;
    }
    setPendingScore(null);
    setError(null);
    setEditingDomain(goalDomain);
  };

  const closeEdit = () => setEditingDomain(null);

  const openReformulate = () => {
    if (!goalDomain) {
      return;
    }
    trackEvent("dashboard_kompas_doel_click", {
      domain: goalDomain,
      entry: "reformulate",
      surface,
    });
    clarityTag("dashboard_kompas_home", `doel_herformuleren_${goalDomain}`);
    setEditingDomain(null);
    setPanelOpen(true);
  };

  const applySaved = (
    score: number,
    reformulated: boolean,
    saved?: DomeinDoelZettenExistingGoal,
  ) => {
    if (!goalDomain) {
      return;
    }
    const current = goals?.[goalDomain] ?? null;
    const previousScores = reformulated ? [] : (current?.scores ?? []);
    const previousScore = previousScores[previousScores.length - 1]?.score ?? null;
    patchDomainGoal(goalDomain, {
      situationId: saved?.situationId ?? current?.situationId ?? "anders",
      ownWords: saved?.ownWords ?? current?.ownWords ?? null,
      scores: [...previousScores, { score }],
      mode: deriveGoalMode(score, previousScore),
    });
  };

  const saveScore = async () => {
    if (pendingScore == null || !goal || !goalDomain) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/domain-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "rescore",
          domain: goalDomain,
          score: pendingScore,
          entryPoint: "domeinrij",
        }),
      });
      if (!response.ok) {
        setError("Opslaan lukte niet — probeer het zo nog eens.");
        setBusy(false);
        return;
      }
      applySaved(pendingScore, false, { situationId: goal.situationId, ownWords: goal.ownWords });
      clarityTag("dashboard_kompas_home", `doel_opgeslagen_${goalDomain}`);
      setBusy(false);
      setEditingDomain(null);
    } catch {
      setError("Opslaan lukte niet — probeer het zo nog eens.");
      setBusy(false);
    }
  };

  return {
    goals,
    goal,
    latestScore,
    goalLine,
    existing,
    anchor,
    editing,
    panelOpen,
    pendingScore,
    busy,
    error,
    setPendingScore,
    openEdit,
    closeEdit,
    openReformulate,
    saveScore,
    applySaved,
    closePanel: () => setPanelOpen(false),
  };
}
