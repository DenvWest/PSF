import { describe, expect, it } from "vitest";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";
import {
  ALL_SUPPLEMENT_SLUGS,
  getSupplementData,
} from "@/data/supplement-guides";

/**
 * Snippet-contract (vakantieweek A3).
 *
 * Legt de rolverdeling uit BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md vast
 * als test, zodat kannibalisatie tussen /beste/{stof} (commercieel) en
 * /supplementen/{stof} (informationeel) zichtbaar wordt in plaats van
 * stilzwijgend terug te sluipen:
 *
 *   "een H1 op /supplementen/{stof} mag nooit de vorm 'welke X past bij jou'
 *    hebben — die zin hoort bij de vergelijking. En een /beste/*-pagina
 *    begint altijd met 'Beste'."
 *
 * De regel bestaat om kannibalisatie te voorkomen. Een gids zónder
 * /beste-tegenhanger (melatonine: bewust geen vergelijking, te weinig
 * producten) kan niets kannibaliseren en valt daarom buiten de regel — dat
 * is geen uitzondering maar de reikwijdte van de regel zelf.
 */

const COLLIDING_PHRASE = /past bij jou/i;

/** Stoffen met zowel een /beste-pagina als een gids: daar kan kannibalisatie ontstaan. */
const COMPARISON_CATEGORIES = new Set(
  SUPPLEMENT_SLUGS.map((slug) => getSupplementComparisonData(slug)?.category),
);

const GUIDES_WITH_COMPARISON = ALL_SUPPLEMENT_SLUGS.filter((slug) =>
  COMPARISON_CATEGORIES.has(slug),
);

/**
 * Openstaande schuld uit het besluit van 4 september. Het besluit paste de
 * rolverdeling alleen op omega-3 toe en parkeerde magnesium bewust
 * ("75 impressies te verliezen — pas na een bewuste keuze van Dennis en met
 * een CTR-meting vóór en na"). De overige stoffen zijn nooit meegenomen.
 *
 * Deze lijst is een schuldenregister, geen vrijbrief: de test hieronder
 * faalt óók als een entry níet meer overtreedt. Fix je een stof, dan haal
 * je hem hier weg — anders wordt de suite rood.
 */
const OPEN_H1_COLLISIONS: Record<string, string> = {
  magnesium: "gated: 75 impressies, wacht op Search Console-check (A4)",
  "vitamine-d": "gated: /beste heeft 190 impressies, eerst SC-check",
  ashwagandha: "open: ~0 impressies, veilig te fixen (B1)",
  creatine: "open: ~0 impressies, veilig te fixen (B1)",
  eiwitpoeder: "open: ~0 impressies, veilig te fixen (B1)",
  zink: "open: ~0 impressies, veilig te fixen (B1)",
};

const OPEN_METATITLE_COLLISIONS: Record<string, string> = {
  magnesium: "gated: zie A4",
  "vitamine-d": "gated: eerst SC-check",
  ashwagandha: "open: veilig te fixen (B1)",
  creatine: "open: veilig te fixen (B1)",
  zink: "open: veilig te fixen (B1)",
};

/** /beste-pagina's waarvan de H1 nog niet met "Beste" begint. */
const OPEN_BESTE_H1: Record<string, string> = {
  magnesium: "gated: H1-wissel wacht op Search Console-check (A4)",
};

describe("snippet-contract — /beste/* (commerciële laag)", () => {
  it.each(SUPPLEMENT_SLUGS)(
    "/beste/%s: H1 begint met 'Beste'",
    (slug) => {
      const data = getSupplementComparisonData(slug);
      expect(data).toBeDefined();
      const category = data!.category;

      if (category in OPEN_BESTE_H1) {
        expect(
          data!.h1.startsWith("Beste"),
          `${category} staat op OPEN_BESTE_H1 maar voldoet nu wél — haal hem van de lijst.`,
        ).toBe(false);
        return;
      }

      expect(data!.h1.startsWith("Beste")).toBe(true);
    },
  );

  it.each(SUPPLEMENT_SLUGS)(
    "/beste/%s: H1 draagt niet de gids-zin 'past bij jou'",
    (slug) => {
      const data = getSupplementComparisonData(slug);
      const category = data!.category;

      if (category in OPEN_BESTE_H1) return; // zelfde gated H1, al gedekt hierboven

      expect(COLLIDING_PHRASE.test(data!.h1)).toBe(false);
    },
  );

  it("geen twee /beste-pagina's delen dezelfde seoTitle", () => {
    const titles = SUPPLEMENT_SLUGS.map(
      (slug) => getSupplementComparisonData(slug)?.seoTitle,
    );
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("geen twee /beste-pagina's delen dezelfde H1", () => {
    const h1s = SUPPLEMENT_SLUGS.map(
      (slug) => getSupplementComparisonData(slug)?.h1,
    );
    expect(new Set(h1s).size).toBe(h1s.length);
  });
});

describe("snippet-contract — /supplementen/* (informationele laag)", () => {
  it.each(GUIDES_WITH_COMPARISON)(
    "/supplementen/%s: H1 draagt niet 'past bij jou' (die zin hoort bij /beste)",
    (slug) => {
      const guide = getSupplementData(slug);
      const violates = COLLIDING_PHRASE.test(guide.h1);

      if (slug in OPEN_H1_COLLISIONS) {
        expect(
          violates,
          `${slug} staat op OPEN_H1_COLLISIONS (${OPEN_H1_COLLISIONS[slug]}) maar voldoet nu wél — haal hem van de lijst.`,
        ).toBe(true);
        return;
      }

      expect(violates).toBe(false);
    },
  );

  it.each(GUIDES_WITH_COMPARISON)(
    "/supplementen/%s: metaTitle draagt niet 'past bij jou'",
    (slug) => {
      const guide = getSupplementData(slug);
      const violates = COLLIDING_PHRASE.test(guide.metaTitle);

      if (slug in OPEN_METATITLE_COLLISIONS) {
        expect(
          violates,
          `${slug} staat op OPEN_METATITLE_COLLISIONS (${OPEN_METATITLE_COLLISIONS[slug]}) maar voldoet nu wél — haal hem van de lijst.`,
        ).toBe(true);
        return;
      }

      expect(violates).toBe(false);
    },
  );

  it("een gids-H1 is nooit identiek aan de H1 van zijn /beste-tegenhanger", () => {
    for (const slug of GUIDES_WITH_COMPARISON) {
      const guide = getSupplementData(slug);
      const comparisonSlug = SUPPLEMENT_SLUGS.find(
        (s) => getSupplementComparisonData(s)?.category === slug,
      );
      const comparison = comparisonSlug
        ? getSupplementComparisonData(comparisonSlug)
        : undefined;
      expect(guide.h1, `${slug}: gids en /beste delen dezelfde H1`).not.toBe(
        comparison?.h1,
      );
    }
  });
});

describe("snippet-contract — reikwijdte en schuldenregister", () => {
  it("melatonine valt buiten de regel: geen /beste-tegenhanger, dus geen kannibalisatie", () => {
    expect(ALL_SUPPLEMENT_SLUGS).toContain("melatonine");
    expect(GUIDES_WITH_COMPARISON).not.toContain("melatonine");
  });

  it("elke stof op een schuldenlijst bestaat ook echt", () => {
    for (const slug of Object.keys(OPEN_H1_COLLISIONS)) {
      expect(ALL_SUPPLEMENT_SLUGS).toContain(slug);
    }
    for (const slug of Object.keys(OPEN_METATITLE_COLLISIONS)) {
      expect(ALL_SUPPLEMENT_SLUGS).toContain(slug);
    }
    for (const category of Object.keys(OPEN_BESTE_H1)) {
      expect([...COMPARISON_CATEGORIES]).toContain(category);
    }
  });

  it("het schuldenregister groeit niet ongemerkt", () => {
    // Stand bij invoering (13 sep 2026). Deze getallen horen te DALEN.
    // Gaat er een omhoog, dan is er nieuwe kannibalisatie bij gekomen.
    expect(Object.keys(OPEN_H1_COLLISIONS).length).toBeLessThanOrEqual(6);
    expect(Object.keys(OPEN_METATITLE_COLLISIONS).length).toBeLessThanOrEqual(5);
    expect(Object.keys(OPEN_BESTE_H1).length).toBeLessThanOrEqual(1);
  });
});
