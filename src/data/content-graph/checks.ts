import type { PillarId } from "@/types/dashboard";

/**
 * De checks die het platform aanbiedt, als registry.
 *
 * ## Naamgeving — let op
 *
 * `CheckId` en `CHECKS` bestaan al in `src/types/dashboard.ts` respectievelijk
 * `src/data/dashboard/index.ts`, met een heel andere betekenis: daar zijn het
 * de check-in-slots van het dashboard (`"check1" | "check2"`). Vandaar
 * `ContentCheckId` en `CONTENT_CHECKS`. Twee dingen die "check" heten is
 * verwarrend genoeg; ze dezelfde naam geven zou een botsing zijn.
 *
 * ## Waarom dit een registry is en geen losse hrefs
 *
 * De vervolgstap onder een artikel moet weten hoe de check héét, hoe lang hij
 * duurt en welk domein hij meet. Die drie stonden verspreid over
 * `domain-checkin.ts`, `dashboard/index.ts` en losse strings in componenten.
 * Eén plek betekent dat een wijziging in de duur niet op vier plekken hoeft.
 */

export type ContentCheckId =
  | "leefstijl"
  | "voeding"
  | "slaap"
  | "stress"
  | "beweging";

export interface ContentCheck {
  id: ContentCheckId;
  href: string;
  /** Hoe de check heet in lopende tekst. Kleine letter; hij staat midden in een zin. */
  label: string;
  /** Wat hij kost, in de taal van de bezoeker. */
  duurLabel: string;
  /** Het domein dat hij uitleest. `null` voor de brede leefstijlcheck. */
  pillarId: PillarId | null;
}

export const CONTENT_CHECKS: Record<ContentCheckId, ContentCheck> = {
  leefstijl: {
    id: "leefstijl",
    href: "/intake",
    label: "leefstijlcheck",
    duurLabel: "3 minuten",
    pillarId: null,
  },
  voeding: {
    id: "voeding",
    href: "/intake/voeding",
    label: "voedingscheck",
    duurLabel: "1 minuut",
    pillarId: "voeding",
  },
  slaap: {
    id: "slaap",
    href: "/intake/slaap",
    label: "slaapcheck",
    duurLabel: "1 minuut",
    pillarId: "slaap",
  },
  stress: {
    id: "stress",
    href: "/intake/stress",
    label: "stresscheck",
    duurLabel: "1 minuut",
    pillarId: "stress",
  },
  beweging: {
    id: "beweging",
    href: "/intake/beweging",
    label: "beweegcheck",
    duurLabel: "1 minuut",
    pillarId: "beweging",
  },
};

export const CONTENT_CHECK_IDS = Object.keys(
  CONTENT_CHECKS,
) as ContentCheckId[];

export function getContentCheck(id: ContentCheckId): ContentCheck {
  return CONTENT_CHECKS[id];
}
