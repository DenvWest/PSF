import type { TopicId } from "@/data/connection/vocabulary";

/**
 * Onderwerp → de leefstijlpijler waaronder onze bestaande inzichten-content valt.
 *
 * Dit is een CONTENT-taxonomie, geen persoonsgegeven. Het bepaalt welk publiek
 * artikel we tonen en leidt niets af over de persoon; `gezondheid_leefstijl`
 * blijft ook hier een zelfgekozen onderwerpvoorkeur en nooit een
 * gezondheidssignaal (BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §7).
 *
 * Bewust grotendeels leeg — en dat is een bevinding, geen omissie. De
 * onderwerplijst is levensbreed (fotografie, geschiedenis, auto & motor); de
 * inzichten-bibliotheek is gezondheidssmal en bevat vandaag alleen artikelen
 * onder slaap, stress, energie, voeding en herstel. Waar geen echte overlap is
 * staat `null` en toont de opbrengst dat blok niet: liever één blok minder dan
 * een blok dat een verband suggereert dat er niet is (§0, de val).
 *
 * Groeit de bibliotheek (beweeg- of verbindingsartikelen), dan is dit bestand
 * de enige plek die mee moet.
 */

/** De pijlers waar daadwerkelijk content onder staat. Subset van PillarId. */
export type ContentPillar = "slaap" | "stress" | "energie" | "voeding" | "herstel";

export const TOPIC_CONTENT_PILLAR: Record<TopicId, ContentPillar | null> = {
  // De beweeg- en herstelcontent (creatine, omega-3, longevity) staat onder herstel.
  beweging_sport: "herstel",
  buiten_natuur: null,
  koken_voeding: "voeding",
  klussen_techniek: null,
  tuin_groen: null,
  muziek: null,
  kunst_cultuur: null,
  lezen_schrijven: null,
  fotografie: null,
  ondernemen_werk: null,
  geld_financien: null,
  technologie_ai: null,
  wetenschap: null,
  duurzaamheid: null,
  geschiedenis: null,
  reizen: null,
  auto_motor: null,
  spel_kaarten: null,
  vrijwilligerswerk: null,
  gezondheid_leefstijl: "herstel",
};

/**
 * Welke pijlers volgen uit de gekozen onderwerpen. `ontdekken` telt zwaarder dan
 * `interests` — "hier wil ik beter in worden" is een directere contentvraag dan
 * "hier gaat mijn aandacht naar uit" (§3.1) — dus die pijlers komen vooraan.
 */
export function contentPillarsForTopics(
  ontdekken: readonly TopicId[],
  interests: readonly TopicId[],
): ContentPillar[] {
  const ordered: ContentPillar[] = [];

  for (const topic of [...ontdekken, ...interests]) {
    const pillar = TOPIC_CONTENT_PILLAR[topic];
    if (pillar && !ordered.includes(pillar)) {
      ordered.push(pillar);
    }
  }

  return ordered;
}
