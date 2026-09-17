import { describe, expect, it } from "vitest";
import {
  NUTRIENT_PAGES,
  NUTRIENT_PAGE_SLUGS,
  nutrientPageBySlug,
} from "@/data/nutrition/nutrient-pages";
import { nutrientContent } from "@/data/content-graph/nutrient-content";
import {
  NUTRIENT_IDS,
  nutrientReferences,
} from "@/data/nutrition/intake-reference";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import { nutrientBronnen } from "@/lib/nutrition-nutrient-index";
import { getUsableClaims } from "@/data/approved-claims";
import sitemap from "@/app/sitemap";

function alleCopy(page: (typeof NUTRIENT_PAGES)[keyof typeof NUTRIENT_PAGES]) {
  return [
    page.h1,
    page.metaTitle,
    page.metaDescription,
    page.intro,
    ...page.kernpunten,
    ...page.waaromNa30,
    ...page.faq.flatMap((f) => [f.vraag, f.antwoord]),
  ].join(" ");
}

describe("voedingsstofpagina's — dekking", () => {
  it("bestaat voor elke gemeten stof, en voor geen andere", () => {
    expect(Object.keys(NUTRIENT_PAGES).sort()).toEqual([...NUTRIENT_IDS].sort());
  });

  it("heeft unieke slugs die op te zoeken zijn", () => {
    expect(new Set(NUTRIENT_PAGE_SLUGS).size).toBe(NUTRIENT_PAGE_SLUGS.length);
    for (const slug of NUTRIENT_PAGE_SLUGS) {
      expect(nutrientPageBySlug(slug), slug).toBeDefined();
    }
    expect(nutrientPageBySlug("bestaat-niet")).toBeUndefined();
  });

  it("staat met hub en al in de sitemap", () => {
    const paden = new Set(sitemap().map((e) => new URL(e.url).pathname));
    expect(paden.has("/voedingsstoffen")).toBe(true);
    for (const slug of NUTRIENT_PAGE_SLUGS) {
      expect(paden.has(`/voedingsstoffen/${slug}`), slug).toBe(true);
    }
  });
});

describe("voedingsstofpagina's — de harde grenzen", () => {
  // Dezelfde grens die food-sources.ts en nutrient-rail.ts al bewaken: de band
  // per nutriënt komt uit frequentievragen, niet uit grammen.
  it("noemt in de redactionele copy geen milligram, microgram of dagtotaal", () => {
    for (const page of Object.values(NUTRIENT_PAGES)) {
      const tekst = alleCopy(page);
      expect(tekst, `${page.slug}: milligram`).not.toMatch(/\b\d+\s*(mg|µg|mcg)\b/i);
      expect(tekst, `${page.slug}: dagtotaal`).not.toMatch(/dagtotaal|per dag binnen/i);
      expect(tekst, `${page.slug}: ADH-percentage`).not.toMatch(
        /\d+\s*%\s*(van|van je)?\s*(de\s*)?(adh|dagbehoefte|dagelijkse behoefte)/i,
      );
    }
  });

  it("schrijft geen claim over die niet in approved-claims staat", () => {
    // De pagina leest claims uit approved-claims.ts. Zou de copy ze herhalen,
    // dan kan een pagina een claim blijven voeren die daar is ingetrokken.
    for (const page of Object.values(NUTRIENT_PAGES)) {
      const tekst = alleCopy(page).toLowerCase();
      expect(tekst, page.slug).not.toContain("draagt bij tot de normale werking van het hart");
      expect(tekst, page.slug).not.toContain("vermindering van vermoeidheid");
    }
  });

  it("leest per stof alleen goedgekeurde claims uit", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const claims = getUsableClaims(nutrientReferences[nutrient].claimKey);
      for (const claim of claims) {
        expect(claim.status, `${nutrient}/${claim.id}`).toBe("approved");
      }
    }
  });
});

describe("voedingsstofpagina's — de bronnen", () => {
  it("levert per stof minstens acht bronnen", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const lijst = nutrientBronnen(nutrient, { limiet: 12 });
      expect(lijst.regels.length, nutrient).toBeGreaterThanOrEqual(8);
    }
  });

  it("sorteert aflopend op de ONDERKANT van de band", () => {
    // Het enige getal dat we durven claimen — sorteren op de puntwaarde zou
    // ordenen op een getal dat de copy weigert te noemen.
    for (const nutrient of NUTRIENT_IDS) {
      const regels = nutrientBronnen(nutrient, { limiet: 12 }).regels;
      for (let i = 1; i < regels.length; i += 1) {
        expect(regels[i - 1]!.band.lo, nutrient).toBeGreaterThanOrEqual(
          regels[i]!.band.lo,
        );
      }
    }
  });

  /**
   * Nulmeting 17 september 2026. Omega-3 is de enige stof zonder één gehalte
   * dat tegen een brondataset is gelegd: alle veertien rijen in
   * `food-sources.ts` staan op `verified: false` en dragen een indicatieve
   * literatuurwaarde. `scripts/usda-extract.mjs` heeft hier zijn volgende werk.
   *
   * De tabel zegt dat per rij, dus de pagina liegt niet — maar het is wel het
   * cluster met de hardste gepubliceerde norm (Gezondheidsraad) en de sterkste
   * commerciële pagina, dus het is de plek waar een gebronde waarde het meest
   * oplevert.
   *
   * Deze lijst is een plafond: hij mag korter worden, nooit langer.
   */
  const ZONDER_GEVERIFIEERD_GEHALTE = ["omega3"];

  it("draagt per stof minstens één geverifieerd gehalte", () => {
    for (const nutrient of NUTRIENT_IDS) {
      if (ZONDER_GEVERIFIEERD_GEHALTE.includes(nutrient)) continue;
      expect(nutrientBronnen(nutrient, { limiet: 12 }).geverifieerd, nutrient)
        .toBeGreaterThan(0);
    }
  });

  it("meldt welke stoffen nog geen gebrond gehalte hebben", () => {
    const zonder = NUTRIENT_IDS.filter(
      (nutrient) => nutrientBronnen(nutrient, { limiet: 12 }).geverifieerd === 0,
    );
    expect(
      zonder,
      `stoffen zonder gebrond gehalte — werk voor scripts/usda-extract.mjs`,
    ).toEqual(ZONDER_GEVERIFIEERD_GEHALTE);
  });
});

describe("voedingsstofpagina's — de verbindingen", () => {
  it("verbindt elke stof met gids, vergelijking en pillar", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const content = nutrientContent(nutrient);
      expect(content.guidePath, nutrient).toMatch(/^\/supplementen\//);
      expect(content.comparisonPath, nutrient).toMatch(/^\/beste\//);
      expect(content.pillarPath, nutrient).toMatch(/^\//);
    }
  });

  it("vindt per stof minstens drie artikelen", () => {
    for (const nutrient of NUTRIENT_IDS) {
      expect(nutrientContent(nutrient).insights.length, nutrient)
        .toBeGreaterThanOrEqual(3);
    }
  });

  it("noemt bij een proxy-drempel geen bron die er niet is", () => {
    // sourceNl is null bij magnesium en zink: er is geen instantie die deze
    // drempel publiceerde, en dan hoort er geen autoriteit te staan.
    expect(nutrientRoute("magnesium").sourceNl).toBeNull();
    expect(nutrientRoute("zinc").sourceNl).toBeNull();
  });
});
