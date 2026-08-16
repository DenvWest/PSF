import { describe, expect, it } from "vitest";
import { TOPIC_CONTENT_PILLAR } from "@/data/connection/topic-content";
import { CONNECTION_TOPICS } from "@/data/connection/vocabulary";
import { profileContentHref, resolveProfileContent } from "@/lib/connection-content";

/**
 * De brug van zelfgekozen onderwerpen naar bestaande publieke content.
 * Wat hier NIET gebeurt is minstens zo belangrijk: er wordt niets over de
 * persoon afgeleid, en een onderwerp zonder echte bibliotheek levert niets op
 * in plaats van een verband dat er niet is.
 */
describe("resolveProfileContent", () => {
  it("levert niets bij een profiel zonder passende pijler", () => {
    expect(resolveProfileContent([])).toEqual([]);
  });

  it("levert artikelen voor een pijler die content heeft", () => {
    const items = resolveProfileContent(["voeding"]);

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.pillarLabel === "Voeding")).toBe(true);
  });

  it("respecteert de limiet", () => {
    expect(resolveProfileContent(["voeding"], 2)).toHaveLength(2);
  });

  it("wisselt de pijlers af in plaats van één pijler het blok te laten vullen", () => {
    const items = resolveProfileContent(["voeding", "herstel"], 4);
    const labels = new Set(items.map((item) => item.pillarLabel));

    expect(labels.size).toBe(2);
  });

  it("levert nooit hetzelfde artikel twee keer", () => {
    const items = resolveProfileContent(["voeding", "voeding", "herstel"], 4);
    const slugs = items.map((item) => item.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("valt terug op de hub zonder pijler", () => {
    expect(profileContentHref([])).toBe("/inzichten");
    expect(profileContentHref(["voeding"])).toContain("pijler=voeding");
  });
});

describe("TOPIC_CONTENT_PILLAR", () => {
  it("dekt elk onderwerp uit de woordenlijst", () => {
    for (const topic of CONNECTION_TOPICS) {
      expect(TOPIC_CONTENT_PILLAR).toHaveProperty(topic.id);
    }
  });

  /**
   * Een pijler in de map die geen artikelen heeft, geeft een leeg blok dat er
   * gevuld uitziet. Deze test faalt zodra iemand een onderwerp koppelt aan een
   * pijler waar (nog) niets onder staat.
   */
  it("koppelt alleen aan pijlers waar daadwerkelijk content onder staat", () => {
    const mapped = [
      ...new Set(Object.values(TOPIC_CONTENT_PILLAR).filter((value) => value !== null)),
    ];

    for (const pillar of mapped) {
      expect(resolveProfileContent([pillar], 1).length).toBeGreaterThan(0);
    }
  });
});
