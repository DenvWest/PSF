import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import type { ActivePlanHabit } from "@/lib/dashboard-active-plan";
import type { Pillar, PillarId } from "@/types/dashboard";

export function firstSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  const dashSplit = trimmed.split(/\s—\s/);
  if (dashSplit.length > 1) {
    return dashSplit[0]?.trim() ?? trimmed;
  }

  const dotMatch = trimmed.match(/^[^.]+\./);
  if (dotMatch) {
    return dotMatch[0].trim();
  }

  return trimmed;
}

export function getVandaagContextLine(
  pillar: Pick<Pillar, "lever" | "quickWin">,
  habit: Pick<ActivePlanHabit, "detail"> | null,
): string {
  const leverLine = firstSentence(pillar.lever);

  if (habit?.detail) {
    if (habit.detail.length <= leverLine.length + 20) {
      return habit.detail;
    }
  }

  return leverLine || pillar.quickWin.detail;
}

export function buildVandaagOnderbouwingHref(pillarId: PillarId): string {
  if (pillarId === "voeding") {
    return "/onderbouwing/voeding?from=dashboard";
  }
  return "/onderbouwing?from=dashboard";
}

export type VandaagFollowUp = {
  href: string;
  label: string;
};

export function buildVandaagFollowUp(pillarId: PillarId): VandaagFollowUp {
  const pillar = PILLAR[pillarId];
  const checkinRoute = PILLAR_CHECKIN_ROUTES[pillarId];

  if (checkinRoute) {
    return {
      href: `${checkinRoute}?from=dashboard`,
      label: "Check-in bijwerken",
    };
  }

  return {
    href: `/dashboard?tab=vandaag&kompas=${pillarId}`,
    label: `Meer over ${pillar.label}`,
  };
}
