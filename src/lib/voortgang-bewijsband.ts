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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Korte datum uit een ISO-dag. Geeft null terug bij alles wat geen ISO-dag is —
 * anders levert een weergavestring ("4 aug 2026") stilzwijgend "NaN undefined"
 * op het scherm op. De aanroeper moet die null dragen in de copy.
 */
export function formatIsoShortDate(iso: string): string | null {
  if (!ISO_DATE_PATTERN.test(iso)) {
    return null;
  }
  const date = parseIsoDate(iso);
  return Number.isFinite(date.getTime()) ? formatShortDate(date) : null;
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
  /**
   * Ongeklemde dag sinds de start. Met de geklemde `cycleDay` valt een meting
   * van gisteren in een verlopen cyclus op dag 29 — een datum van weken terug.
   */
  cycleDayRaw: number;
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
    const day = input.cycleDayRaw - daysAgo;
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
  /** ISO-dag (YYYY-MM-DD), niet de weergavestring uit `remeasure.dueDate`. */
  remeasureDueDateIso: string;
  measurements: BandMeasurement[];
  headDay: number;
  activeDays: number;
  priorityLabel: string;
}): { title: string; body: string; future?: string } {
  const {
    cycleStartDate,
    cycleDay,
    remeasureDueDateIso,
    measurements,
    headDay,
    activeDays,
    priorityLabel,
  } = input;

  const remeasureDate = formatIsoShortDate(remeasureDueDateIso);

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
      title:
        remeasureDate != null
          ? `Dag ${headDay} · ${remeasureDate}`
          : `Dag ${headDay}`,
      body: "Je hermeting.",
      future: `Hier lees je terug of er beweging in je ${priorityLabel.toLowerCase()} zit.`,
    };
  }

  const date = formatShortDate(dayToDate(cycleStartDate, headDay));
  return {
    title: `Dag ${headDay} · ${date}`,
    body: "Nog te gaan.",
    future:
      remeasureDate != null
        ? `Wat je tussen nu en dan neerzet, lees je op ${remeasureDate} terug.`
        : "Wat je tussen nu en dan neerzet, lees je bij je hermeting terug.",
  };
}

export function buildWachtendCaption(remeasureDueDateIso: string): {
  title: string;
  body: string;
  future: string;
} {
  const date = formatIsoShortDate(remeasureDueDateIso);
  return {
    title: "Nog niets gelogd",
    body:
      date != null
        ? `Je hermeting staat op ${date}.`
        : "Je hermeting staat klaar zodra deze cyclus rond is.",
    future: "Wat je vanaf vandaag neerzet, lees je op die dag terug.",
  };
}
