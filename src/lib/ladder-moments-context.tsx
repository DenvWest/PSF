"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createAgendaBlock,
  deleteAgendaBlock,
  fetchAgendaBlocks,
  updateAgendaBlock,
} from "@/lib/agenda-blocks-client";
import { endTimeFromStartAndDuration } from "@/lib/agenda-time-picker";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import {
  findLadderMomentBlock,
  ladderMomentRange,
  type LadderMomentDomain,
  type LadderMomentDraft,
} from "@/lib/ladder-moments";
import type { AgendaBlockRecord } from "@/types/agenda";

/**
 * Eén lading agenda-blokken voor alle ladder-rijen op het scherm samen.
 *
 * Zonder dit zou elke actierij zijn eigen vraag stellen — zes lagen × drie
 * acties is achttien verzoeken voor één antwoord dat overal hetzelfde is.
 * Dezelfde reden als VoortgangFavoritesProvider, en dezelfde vorm: de
 * provider houdt de waarheid vast, de knop leest hem alleen uit.
 */

type LadderMomentsContextValue = {
  hydrated: boolean;
  /** Het blok dat bij deze actie hoort, of null als er nog geen moment staat. */
  momentFor: (domain: LadderMomentDomain, title: string) => AgendaBlockRecord | null;
  plan: (
    domain: LadderMomentDomain,
    title: string,
    draft: LadderMomentDraft,
  ) => Promise<AgendaBlockRecord | null>;
  move: (blockId: string, draft: LadderMomentDraft) => Promise<AgendaBlockRecord | null>;
  cancel: (blockId: string) => Promise<boolean>;
};

const LadderMomentsContext = createContext<LadderMomentsContextValue | null>(null);

export function LadderMomentsProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<AgendaBlockRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { startDate, endDate } = ladderMomentRange();
    void fetchAgendaBlocks(startDate, endDate)
      .then((rows) => {
        if (!cancelled) {
          setBlocks(rows);
        }
      })
      // Uitgelogd of agenda-opslag nog niet geactiveerd: dan staat er geen
      // moment, en dat is een geldig antwoord. De knop blijft werken en
      // meldt zelf wanneer opslaan niet lukt.
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const momentFor = useCallback(
    (domain: LadderMomentDomain, title: string) =>
      findLadderMomentBlock(blocks, domain, title, todayInAgendaTimezone()),
    [blocks],
  );

  const plan = useCallback(
    async (domain: LadderMomentDomain, title: string, draft: LadderMomentDraft) => {
      const block = await createAgendaBlock({
        date: draft.date,
        categoryId: domain,
        title,
        startTime: draft.startTime,
        endTime: endTimeFromStartAndDuration(draft.startTime, draft.durationMinutes),
      });
      setBlocks((current) => [...current, block]);
      return block;
    },
    [],
  );

  const move = useCallback(async (blockId: string, draft: LadderMomentDraft) => {
    const block = await updateAgendaBlock(blockId, {
      date: draft.date,
      startTime: draft.startTime,
      endTime: endTimeFromStartAndDuration(draft.startTime, draft.durationMinutes),
    });
    setBlocks((current) => current.map((row) => (row.id === blockId ? block : row)));
    return block;
  }, []);

  const cancel = useCallback(async (blockId: string) => {
    await deleteAgendaBlock(blockId);
    setBlocks((current) => current.filter((row) => row.id !== blockId));
    return true;
  }, []);

  const value = useMemo<LadderMomentsContextValue>(
    () => ({ hydrated, momentFor, plan, move, cancel }),
    [hydrated, momentFor, plan, move, cancel],
  );

  return (
    <LadderMomentsContext.Provider value={value}>{children}</LadderMomentsContext.Provider>
  );
}

/**
 * Null buiten de provider. De ladder draait ook op surfaces zonder agenda
 * (tests, losse verhalen); daar hoort de knop stil te verdwijnen in plaats
 * van het scherm om te trekken.
 */
export function useLadderMoments(): LadderMomentsContextValue | null {
  return useContext(LadderMomentsContext);
}
