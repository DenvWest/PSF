"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { DomainGoalDomain } from "@/lib/domain-goal";
import {
  fetchDomainGoals,
  type DomainGoalMap,
  type DomainGoalSummary,
} from "@/lib/domain-goal-client";

/**
 * Eén gedeelde leesbron voor de ijkpunten, omdat er sinds de contextkolom twee
 * surfaces tegelijk in beeld staan: het zetmoment in de middenkolom
 * (`KompasDoelIjkpunt`) en de richting-regel in de zijbalk
 * (`KompasContextSpine`). Zonder gedeelde bron fetcht elk zijn eigen kopie en
 * blijft de zijbalk op de oude score staan zodra je in het midden herscoort.
 *
 * Bewust geen cache met vervaltijd: de map wordt één keer per paginabezoek
 * geladen en daarna alleen nog geschreven door `patchDomainGoal`, precies waar
 * de POST slaagt. Wie schrijft, meldt het hier.
 */

let cache: DomainGoalMap | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DomainGoalMap | null {
  return cache;
}

function getServerSnapshot(): DomainGoalMap | null {
  return null;
}

export function patchDomainGoal(domain: DomainGoalDomain, summary: DomainGoalSummary) {
  cache = { ...(cache ?? {}), [domain]: summary };
  emit();
}

/** Alleen voor tests — de module-cache overleeft anders tussen cases. */
export function resetDomainGoalsCache() {
  cache = null;
  inflight = null;
}

export function useDomainGoals(enabled = true): {
  goals: DomainGoalMap | null;
  loaded: boolean;
} {
  const goals = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!enabled || cache != null) {
      return;
    }
    // Geen setState hier: het effect start alleen de fetch, en de store meldt
    // zichzelf via `emit()`. Zo blijft er één rendercyclus per binnenkomst.
    inflight ??= (async () => {
      const result = await fetchDomainGoals();
      cache = result ?? {};
      inflight = null;
      emit();
    })();
  }, [enabled]);

  return { goals, loaded: goals != null };
}
