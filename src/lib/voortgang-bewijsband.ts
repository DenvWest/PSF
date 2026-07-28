import { PILLAR, PILLARS } from "@/data/dashboard";
import type { PillarId } from "@/types/dashboard";

export const CYCLE_LENGTH = 30;

const MONTHS = [
  "jan",
  "feb",
  "mrt",
  "apr",
  "mei",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

export type BandMeasurement = {
  day: number;
  pillarId: PillarId | null;
  label: string;
};

export type BandScrubZone = "verleden" | "vandaag" | "toekomst";

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayToDate(cycleStartDate: string, day: number): Date {
  const start = parseIsoDate(cycleStartDate);
  const result = new Date(start.getTime());
  result.setDate(result.getDate() + (day - 1));
  return result;
}

export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function measurementsOf(input: {
  cycleDay: number;
  domainCheckDaysAgo: Partial<Record<PillarId, number>>;
}): BandMeasurement[] {
  const out: BandMeasurement[] = [
    { day: 1, pillarId: null, label: "Je leefstijlcheck" },
  ];

  for (const pillar of PILLARS) {
    const daysAgo = input.domainCheckDaysAgo[pillar.id];
    if (daysAgo == null) {
      continue;
    }
    const day = input.cycleDay - daysAgo;
    if (day >= 1 && day <= CYCLE_LENGTH) {
      out.push({
        day,
        pillarId: pillar.id,
        label: PILLAR[pillar.id].label,
      });
    }
  }

  return out.sort((a, b) => a.day - b.day);
}

export function scrubZone(cycleDay: number, headDay: number): BandScrubZone {
  if (headDay < cycleDay) {
    return "verleden";
  }
  if (headDay === cycleDay) {
    return "vandaag";
  }
  return "toekomst";
}

export function buildBandCaption(input: {
  cycleStartDate: string;
  cycleDay: number;
  remeasureDueDate: string;
  measurements: BandMeasurement[];
  headDay: number;
  activeDays: number;
  priorityLabel: string;
}): { title: string; body: string; future?: string } {
  const {
    cycleStartDate,
    cycleDay,
    remeasureDueDate,
    measurements,
    headDay,
    activeDays,
    priorityLabel,
  } = input;

  const remeasureDate = formatShortDate(parseIsoDate(remeasureDueDate));

  if (headDay < cycleDay) {
    const date = formatShortDate(dayToDate(cycleStartDate, headDay));
    const meting = measurements.find((m) => m.day === headDay);
    if (meting) {
      return {
        title: `Dag ${headDay} · ${date}`,
        body:
          meting.pillarId == null
            ? "Je leefstijlcheck."
            : `Je mat je ${meting.label.toLowerCase()}.`,
      };
    }
    return {
      title: `Dag ${headDay} · ${date}`,
      body: "Nog geen bijzonderheid gelogd op deze dag.",
    };
  }

  if (headDay === cycleDay) {
    return {
      title: `Dag ${headDay} · vandaag`,
      body: `${activeDays} dagen waarop je iets pakte deze cyclus.`,
    };
  }

  if (headDay === CYCLE_LENGTH) {
    return {
      title: `Dag ${headDay} · ${remeasureDate}`,
      body: "Je hermeting.",
      future: `Hier lees je terug of er beweging in je ${priorityLabel.toLowerCase()} zit.`,
    };
  }

  const date = formatShortDate(dayToDate(cycleStartDate, headDay));
  return {
    title: `Dag ${headDay} · ${date}`,
    body: "Nog te gaan.",
    future: `Wat je tussen nu en dan neerzet, lees je op ${remeasureDate} terug.`,
  };
}

export function buildWachtendCaption(remeasureDueDate: string): {
  title: string;
  body: string;
  future: string;
} {
  const date = formatShortDate(parseIsoDate(remeasureDueDate));
  return {
    title: "Nog niets gelogd",
    body: `Je hermeting staat op ${date}.`,
    future: "Wat je vanaf vandaag neerzet, lees je op die dag terug.",
  };
}
