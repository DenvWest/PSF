import { describe, expect, it } from "vitest";
import {
  MAX_RELATED,
  autoEdges,
  inboundCountsWithAuto,
  relatedContent,
} from "@/lib/content-graph/related-content";
import { allGraphNodes, getGraphNode } from "@/lib/content-graph/node";
import { metadataForNode } from "@/data/content-graph/node-metadata";

describe("relatedContent — de vorm", () => {
  it("toont nooit meer dan de limiet", () => {
    for (const node of allGraphNodes()) {
      expect(relatedContent(node.path).length, node.path).toBeLessThanOrEqual(
        MAX_RELATED,
      );
    }
  });

  it("wijst nooit naar zichzelf en nooit twee keer naar hetzelfde", () => {
    for (const node of allGraphNodes()) {
      const links = relatedContent(node.path);
      const doelen = links.map((link) => link.href);
      expect(doelen, node.path).not.toContain(node.path);
      expect(new Set(doelen).size, node.path).toBe(doelen.length);
    }
  });

  it("wijst alleen naar bestaande knopen", () => {
    for (const edge of autoEdges()) {
      expect(getGraphNode(edge.to), `${edge.from} → ${edge.to}`).toBeDefined();
    }
  });

  it("neemt de ankertekst van de doelpagina", () => {
    for (const node of allGraphNodes()) {
      for (const link of relatedContent(node.path)) {
        expect(link.label, link.href).toBe(getGraphNode(link.href)?.title);
      }
    }
  });

  it("is stabiel — twee aanroepen geven hetzelfde", () => {
    const eerst = relatedContent("/blog/magnesium-en-slaap");
    const tweede = relatedContent("/blog/magnesium-en-slaap");
    expect(tweede).toEqual(eerst);
  });
});

describe("relatedContent — de regels", () => {
  it("zet handmatige keuzes vooraan", () => {
    // gerelateerdeSluggen blijft leidend; de graaf vult aan, hij vervangt niet.
    for (const node of allGraphNodes()) {
      const links = relatedContent(node.path);
      const handmatig = links.filter((l) => l.relation === "handmatig");
      if (handmatig.length === 0) continue;
      expect(
        links.slice(0, handmatig.length).every((l) => l.relation === "handmatig"),
        node.path,
      ).toBe(true);
    }
  });

  it("verbindt elk stuk met een stof aan zijn stofpagina", () => {
    // De brug die het hele plan draagt: van artikel naar de voedingsstof.
    for (const node of allGraphNodes()) {
      if (node.type === "voedingsstof") continue;
      const meta = metadataForNode(node);
      if (!meta.nutrients || meta.nutrients.length === 0) continue;
      const doelen = relatedContent(node.path).map((l) => l.href);
      for (const nutrient of meta.nutrients) {
        expect(
          doelen.some((d) => d.startsWith("/voedingsstoffen/")),
          `${node.path} mist zijn stofpagina (${nutrient})`,
        ).toBe(true);
      }
    }
  });

  it("laat een pagina niet verdrinken in hublinks", () => {
    const HUBS = new Set(["pillar", "profiel", "gezondheidsgids", "voedingsstof"]);
    for (const node of allGraphNodes()) {
      const hubs = relatedContent(node.path).filter((l) =>
        HUBS.has(getGraphNode(l.href)?.type ?? ""),
      );
      expect(hubs.length, node.path).toBeLessThanOrEqual(3);
    }
  });
});

describe("weespagina's", () => {
  /**
   * Nulmeting 17 september 2026. De automatische laag bracht het van twintig
   * naar twee. Wat overblijft is niet met een algoritme op te lossen:
   *
   * - `/gids/testosteron` — testosteron is geen `ThemeSlug`, dus er is geen
   *   thema om op te matchen. Dat is een modelleergat, geen linkprobleem.
   * - `/kennisbank/sociale-verbinding` — verbinding staat in
   *   `VERBORGEN_DOMEINEN`: het domein is bewust uit de interface gehaald, en
   *   deze term is daar het gevolg van.
   *
   * Beide vragen een redactionele of modelmatige beslissing. De lijst is een
   * plafond: hij mag korter worden, nooit langer.
   */
  const BEKENDE_WEZEN = [
    "/gids/testosteron",
    "/kennisbank/sociale-verbinding",
  ];

  it("er komt geen weespagina bij", () => {
    const inbound = inboundCountsWithAuto();
    const wezen = allGraphNodes()
      .filter((node) => !inbound.has(node.path))
      .map((node) => node.path)
      .sort();
    expect(wezen.filter((p) => !BEKENDE_WEZEN.includes(p))).toEqual([]);
  });

  it("de bekende wezen zijn er nog — anders mag de lijst korter", () => {
    const inbound = inboundCountsWithAuto();
    const opgelost = BEKENDE_WEZEN.filter((p) => inbound.has(p));
    expect(opgelost, "haal deze uit BEKENDE_WEZEN").toEqual([]);
  });

  it("heft de acht artikel-wezen op die de audit vond", () => {
    const inbound = inboundCountsWithAuto();
    for (const pad of [
      "/blog/eiwit-en-whey-in-de-overgang",
      "/blog/is-whey-schadelijk",
      "/blog/krachtverlies-eiwitbehoefte-na-40",
      "/blog/magnesium-herstel-mannen-40",
      "/blog/magnesium-in-de-overgang",
      "/blog/slaapkwaliteit-testosteron-herstel",
      "/blog/vermoeidheid-bloedwaarden-checken-mannen",
      "/blog/vitamine-d-botgezondheid-overgang",
    ]) {
      expect(inbound.get(pad) ?? 0, pad).toBeGreaterThan(0);
    }
  });

  it("geeft de vijf nieuwe stofpagina's inkomende links", () => {
    const inbound = inboundCountsWithAuto();
    for (const slug of ["eiwit", "omega-3", "magnesium", "vitamine-d", "zink"]) {
      expect(
        inbound.get(`/voedingsstoffen/${slug}`) ?? 0,
        slug,
      ).toBeGreaterThan(0);
    }
  });
});
