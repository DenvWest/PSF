import type { CheckLogEntry } from "@/types/dashboard";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const NL_MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mrt: 2,
  apr: 3,
  mei: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  okt: 9,
  nov: 10,
  dec: 11,
};

function parseDashboardDate(value: string): Date | null {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const match = value.trim().match(/^(\d{1,2})\s+([a-z]{3})\.?\s+(\d{4})$/i);
  if (!match) {
    return null;
  }

  const month = NL_MONTHS[match[2].toLowerCase().slice(0, 3)];
  if (month === undefined) {
    return null;
  }

  return new Date(Number(match[3]), month, Number(match[1]));
}

function parseEntryDate(entry: CheckLogEntry): Date | null {
  return parseDashboardDate(entry.date);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function uniqueSortedDayKeys(entries: CheckLogEntry[]): string[] {
  const keys = new Set<string>();
  for (const entry of entries) {
    const parsed = parseEntryDate(entry);
    if (parsed) {
      keys.add(dayKey(parsed));
    }
  }
  return [...keys].sort();
}

function streakEndingToday(dayKeys: string[], today: Date): number {
  if (dayKeys.length === 0) {
    return 0;
  }
  const todayKey = dayKey(today);
  const set = new Set(dayKeys);
  let streak = 0;
  let cursor = today.getTime();

  if (!set.has(todayKey)) {
    cursor -= MS_PER_DAY;
  }

  while (set.has(dayKey(new Date(cursor)))) {
    streak += 1;
    cursor -= MS_PER_DAY;
  }

  return streak;
}

function longestStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < dayKeys.length; index += 1) {
    const prev = new Date(`${dayKeys[index - 1]}T12:00:00.000Z`).getTime();
    const next = new Date(`${dayKeys[index]}T12:00:00.000Z`).getTime();
    if (next - prev === MS_PER_DAY) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export type CheckinRhythm = {
  currentDays: number;
  longestDays: number;
};

export function computeCheckinRhythm(
  history: CheckLogEntry[],
  now = new Date(),
): CheckinRhythm {
  const dayKeys = uniqueSortedDayKeys(history);
  return {
    currentDays: streakEndingToday(dayKeys, now),
    longestDays: longestStreak(dayKeys),
  };
}
