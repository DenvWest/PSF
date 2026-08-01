import { PILLAR } from "@/data/dashboard";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import type { DashboardModel, PillarId } from "@/types/dashboard";

export type KompasDomainActionKind = "checkin" | "result" | "open";

export type KompasDomainAction = {
  domain: PillarId;
  domainLabel: string;
  color: string;
  icon: string;
  actionLabel: string;
  actionKind: KompasDomainActionKind;
  href?: string;
  internalAction?: "open_domain";
  disabled?: boolean;
  disabledHint?: string;
};

type BuildKompasDomainActionsInput = {
  model: DashboardModel;
  nutritionLogCompleted: boolean;
  hasNutritionIntake: boolean;
  hasStressCheckin: boolean;
};

function checkinHref(domain: PillarId): string {
  return `/intake/${domain === "voeding" ? "voeding" : domain}?from=dashboard&kompas=${domain}`;
}

function buildSingleDomainAction(
  domain: PillarId,
  input: BuildKompasDomainActionsInput,
): KompasDomainAction {
  const pillar = PILLAR[domain];
  const base = {
    domain,
    domainLabel: pillar.label,
    color: pillar.color,
    icon: pillar.icon,
  };

  switch (domain) {
    case "voeding":
      if (input.nutritionLogCompleted) {
        return {
          ...base,
          actionLabel: "Bekijk je resultaat",
          actionKind: "result",
          href: "/intake/voeding?resultaten=true&from=dashboard&kompas=voeding",
        };
      }
      return {
        ...base,
        actionLabel: input.hasNutritionIntake ? "Voedingscheck bijwerken" : "Doe voedingscheck",
        actionKind: "checkin",
        href: checkinHref("voeding"),
      };

    case "slaap":
      if (input.model.sleepFocus) {
        return {
          ...base,
          actionLabel: "Bekijk je analyse",
          actionKind: "result",
          internalAction: "open_domain",
        };
      }
      return {
        ...base,
        actionLabel: "Doe slaapcheck",
        actionKind: "checkin",
        href: checkinHref("slaap"),
      };

    case "beweging":
      if (input.nutritionLogCompleted) {
        return {
          ...base,
          actionLabel: "Programma",
          actionKind: "open",
          internalAction: "open_domain",
        };
      }
      return {
        ...base,
        actionLabel: "Doe beweegcheck",
        actionKind: "checkin",
        href: checkinHref("beweging"),
      };

    case "stress":
      if (input.hasStressCheckin) {
        return {
          ...base,
          actionLabel: "Bekijk je stress-analyse",
          actionKind: "result",
          internalAction: "open_domain",
        };
      }
      return {
        ...base,
        actionLabel: "Doe stresscheck",
        actionKind: "checkin",
        href: checkinHref("stress"),
      };

    case "verbinding":
      // Geen aparte verbinding-check (DEFER, roadmap §3) — de score komt uit
      // de eerste Leefstijlcheck, dus dit is altijd een post-first-check-label.
      return {
        ...base,
        actionLabel: "Bekijk je verbinding",
        actionKind: "result",
        internalAction: "open_domain",
      };

    default:
      return {
        ...base,
        actionLabel: `Open ${pillar.label.toLowerCase()}`,
        actionKind: "open",
        internalAction: "open_domain",
      };
  }
}

export function buildKompasDomainActions(
  input: BuildKompasDomainActionsInput,
): KompasDomainAction[] {
  return KOMPAS_RAIL_PILLAR_IDS.map((domain) => buildSingleDomainAction(domain, input));
}

