import {
  LIFESTYLE_PILLARS,
  PILLAR_SCORE_KEYS,
} from "@/data/foundation-pyramid";
import { getDisplayStatus, type DisplayStatus } from "@/lib/score-display";

export type LifestyleOverviewRow = {
  label: string;
  status: DisplayStatus | "Niet gemeten";
};

export type LifestyleOverviewStatus = LifestyleOverviewRow["status"];

function parseDomainScore(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function buildLifestyleOverviewRows(
  domainScores: Record<string, number>,
): LifestyleOverviewRow[] {
  return LIFESTYLE_PILLARS.map((pillar) => {
    if (pillar.id === "connection") {
      return { label: pillar.label, status: "Niet gemeten" };
    }

    const scoreKey = PILLAR_SCORE_KEYS[pillar.id];
    if (!scoreKey) {
      return { label: pillar.label, status: "Niet gemeten" };
    }

    const score = parseDomainScore(domainScores[scoreKey]);
    if (score === null) {
      return { label: pillar.label, status: "Niet gemeten" };
    }

    return {
      label: pillar.label,
      status: getDisplayStatus(score),
    };
  });
}

export const EMAIL_STATUS_PILL_STYLE: Record<
  LifestyleOverviewStatus,
  { background: string; color: string; border: string }
> = {
  Sterk: { background: "#e8f0ea", color: "#2d5016", border: "#5a8f6a" },
  Voldoende: { background: "#f0eeea", color: "#5c5c5c", border: "#c8c4bc" },
  Aandacht: { background: "#f5ebe3", color: "#8b5e3c", border: "#c8956c" },
  Prioriteit: { background: "#efe0d6", color: "#6b3f24", border: "#a66b42" },
  "Niet gemeten": {
    background: "#f5f5f5",
    color: "#888888",
    border: "#cccccc",
  },
};
