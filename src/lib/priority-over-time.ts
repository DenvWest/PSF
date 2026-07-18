import { PILLAR } from "@/data/dashboard";
import type { CheckLogEntry, DashboardModel, PillarId } from "@/types/dashboard";

export type PriorityTimelinePoint = {
  seq: number;
  date: string;
  pillarId: PillarId;
  label: string;
  color: string;
  isLatest: boolean;
};

export function buildPriorityTimeline(model: DashboardModel): PriorityTimelinePoint[] {
  if (model.history.length === 0) {
    return [
      {
        seq: 1,
        date: model.date,
        pillarId: model.enginePriority.id,
        label: model.enginePriority.label,
        color: model.enginePriority.color,
        isLatest: true,
      },
    ];
  }

  return model.history.map((entry, index) => {
    const pillar = PILLAR[entry.priority];
    return {
      seq: entry.seq,
      date: entry.date,
      pillarId: entry.priority,
      label: pillar.label,
      color: pillar.color,
      isLatest: index === model.history.length - 1,
    };
  });
}

export function hasPriorityShift(model: DashboardModel): boolean {
  const timeline = buildPriorityTimeline(model);
  if (timeline.length < 2) {
    return false;
  }
  const first = timeline[0]?.pillarId;
  const last = timeline[timeline.length - 1]?.pillarId;
  return first != null && last != null && first !== last;
}

export function formatPriorityShiftSummary(model: DashboardModel): string | null {
  const timeline = buildPriorityTimeline(model);
  if (timeline.length < 2) {
    return null;
  }
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  if (!first || !last || first.pillarId === last.pillarId) {
    return null;
  }
  return `${first.label.toLowerCase()} → ${last.label.toLowerCase()}`;
}

export function shouldShowEngineShiftNudge(model: DashboardModel): boolean {
  return (
    model.priorityIsUserChosen &&
    model.enginePriority.id !== model.priority.id
  );
}

export type UserPinMarker = {
  pillarId: PillarId;
  label: string;
  updatedAt: string;
};

export function buildUserPinMarker(
  model: DashboardModel,
  prefUpdatedAt: string | null,
): UserPinMarker | null {
  if (!model.priorityIsUserChosen || !prefUpdatedAt) {
    return null;
  }
  return {
    pillarId: model.priority.id,
    label: model.priority.label,
    updatedAt: prefUpdatedAt,
  };
}

export function countEnginePriorityChanges(history: CheckLogEntry[]): number {
  if (history.length < 2) {
    return 0;
  }
  let changes = 0;
  for (let index = 1; index < history.length; index += 1) {
    if (history[index]?.priority !== history[index - 1]?.priority) {
      changes += 1;
    }
  }
  return changes;
}
