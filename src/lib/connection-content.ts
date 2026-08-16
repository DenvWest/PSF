import type { ContentPillar } from "@/data/connection/topic-content";
import {
  buildInsightFilterHref,
  filterInsights,
  isPremiumKennisbankInsight,
} from "@/data/insights";
import type { InsightItem } from "@/types/insight";
import type { PillarId } from "@/types/dashboard";

/**
 * Van gekozen onderwerpen naar bestaande inzichten-content.
 *
 * Deze module staat BEWUST buiten src/lib/connection-profile/ — zelfde reden als
 * connection-profile-consent.ts: daar bewaakt firewall.test.ts dat er niets
 * binnenkomt uit de gezondheidskant, en de inzichten-catalogus draagt
 * personalisatienaden (gapSignal, profile) die daar niet thuishoren. De grens
 * blijft zo meetbaar in plaats van dat de test wordt opgerekt.
 *
 * Wat hier gebeurt is uitsluitend: pijler in, publieke artikelen uit. Er wordt
 * niets van de gebruiker gelezen behalve de tags die hij zelf aantikte.
 */

export type ProfileContentItem = {
  slug: string;
  title: string;
  href: string;
  pillarLabel: string;
  readingTime: string | null;
};

/**
 * Compile-time bewijs dat elke ContentPillar een bestaande pijler is. Verdwijnt
 * er ooit een pijler uit de taxonomie, dan faalt tsc hier en niet in productie.
 */
const PILLAR_LABEL: Record<ContentPillar, { id: PillarId; label: string }> = {
  slaap: { id: "slaap", label: "Slaap" },
  stress: { id: "stress", label: "Stress" },
  energie: { id: "energie", label: "Energie" },
  voeding: { id: "voeding", label: "Voeding" },
  herstel: { id: "herstel", label: "Herstel" },
};

const DEFAULT_LIMIT = 4;

/** Leesbaar eerst, begrippen achteraan — dit blok is een leessuggestie, geen index. */
const TYPE_ORDER: Record<InsightItem["type"], number> = {
  artikel: 0,
  deepdive: 1,
  begrip: 2,
};

/**
 * Premium-begrippen vallen af: een suggestie die achter een slot ligt is geen
 * opbrengst maar een teleurstelling, en dit profiel mag niets beloven wat het
 * niet direct waarmaakt (§0).
 */
function readableInsights(pillar: ContentPillar): InsightItem[] {
  return filterInsights({ pijler: PILLAR_LABEL[pillar].id })
    .filter((item) => !isPremiumKennisbankInsight(item))
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
}

/**
 * Eén artikel per pijler eerst, daarna aanvullen. Dat voorkomt dat vier
 * voedingsartikelen het hele blok vullen terwijl iemand ook herstel koos.
 */
export function resolveProfileContent(
  pillars: readonly ContentPillar[],
  limit = DEFAULT_LIMIT,
): ProfileContentItem[] {
  if (pillars.length === 0) {
    return [];
  }

  const perPillar = [...new Set(pillars)].map((pillar) => ({
    pillar,
    items: readableInsights(pillar),
  }));

  const picked: ProfileContentItem[] = [];
  const seen = new Set<string>();

  for (let round = 0; picked.length < limit; round += 1) {
    let addedThisRound = false;

    for (const { pillar, items } of perPillar) {
      const item = items[round];
      if (!item || seen.has(item.slug) || picked.length >= limit) {
        continue;
      }
      seen.add(item.slug);
      addedThisRound = true;
      picked.push({
        slug: item.slug,
        title: item.title,
        href: item.href,
        pillarLabel: PILLAR_LABEL[pillar].label,
        readingTime: item.readingTime ?? null,
      });
    }

    if (!addedThisRound) {
      break;
    }
  }

  return picked;
}

/** Waar "meer hierover" heen gaat: de bestaande inzichten-hub, gefilterd. */
export function profileContentHref(pillars: readonly ContentPillar[]): string {
  const first = pillars[0];
  return first ? buildInsightFilterHref({ pijler: PILLAR_LABEL[first].id }) : "/inzichten";
}
