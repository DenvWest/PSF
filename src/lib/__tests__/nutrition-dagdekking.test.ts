import { describe, expect, it } from "vitest";
import {
  bouwDagdekking,
  dagdekkingRegel,
  dagdekkingRuimteRegel,
  dekkingVoorStof,
  zwaksteStoffen,
} from "@/lib/nutrition-dagdekking";
import {
  itemsNaarMomenten,
  parseDagItems,
  serialiseerDagItems,
  voegItemToe,
  zetItemPorties,
  type DagItems,
} from "@/lib/nutrition-dagboek-items";

const LEEG: DagItems = {};

function dag(): DagItems {
  return {
    ontbijt: [{ key: "havermout", porties: 1 }],
    avondeten: [
      { key: "spinazie", porties: 1 },
      { key: "zalm", porties: 1 },
    ],
  };
}

describe("itemsNaarMomenten", () => {
  it("telt producten op tot porties per voedselgroep", () => {
    const items: DagItems = {
      avondeten: [
        { key: "spinazie", porties: 1 },
        { key: "broccoli", porties: 2 },
        { key: "zalm", porties: 1 },
      ],
    };
    expect(itemsNaarMomenten(items)).toEqual({
      avondeten: { groente: 3, vis: 1 },
    });
  });

  it("laat een moment weg dat na afleiden leeg is", () => {
    expect(itemsNaarMomenten({ lunch: [{ key: "onbekend-product", porties: 2 }] })).toEqual({});
  });
});

describe("voegItemToe en zetItemPorties", () => {
  it("telt hetzelfde product op hetzelfde moment op in plaats van een tweede rij", () => {
    const eerste = voegItemToe(LEEG, "avondeten", "spinazie");
    const tweede = voegItemToe(eerste, "avondeten", "spinazie");
    expect(tweede.avondeten).toEqual([{ key: "spinazie", porties: 2 }]);
  });

  it("haalt een regel weg zodra de porties op nul komen", () => {
    const met = voegItemToe(LEEG, "lunch", "ei");
    expect(zetItemPorties(met, "lunch", "ei", 0)).toEqual({});
  });
});

describe("parseDagItems", () => {
  it("laat onbekende producten vallen zonder de rest weg te gooien", () => {
    const gelezen = parseDagItems({
      ontbijt: [
        { k: "havermout", n: 1 },
        { k: "eenhoornvlees", n: 3 },
      ],
    });
    expect(gelezen.ontbijt).toEqual([{ key: "havermout", porties: 1 }]);
  });

  it("weigert onbekende momenten, negatieve en niet-numerieke aantallen", () => {
    expect(parseDagItems({ brunch: [{ k: "ei", n: 1 }] })).toEqual({});
    expect(parseDagItems({ lunch: [{ k: "ei", n: -1 }] })).toEqual({});
    expect(parseDagItems({ lunch: [{ k: "ei", n: "twee" }] })).toEqual({});
  });

  it("rondt de opslagvorm heen en terug", () => {
    const heen = serialiseerDagItems(dag());
    expect(parseDagItems(heen)).toEqual(dag());
  });
});

describe("bouwDagdekking", () => {
  it("telt bronnen en noemt geen milligrammen als dagtotaal", () => {
    const dekking = bouwDagdekking(dag());
    const omega = dekkingVoorStof(dekking, "omega3")!;
    // Zalm is een rijke bron; één rijke bron maakt de stof sterk gedekt.
    expect(omega.status).toBe("sterk");
    expect(omega.bronnen.map((bron) => bron.product.key)).toContain("zalm");
  });

  it("laat een stof zonder bron op 'geen' staan", () => {
    const dekking = bouwDagdekking({ ontbijt: [{ key: "komkommer", porties: 1 }] });
    expect(dekkingVoorStof(dekking, "vitamine_b12")!.status).toBe("geen");
  });

  it("laat meer porties tot twee tellen en niet verder", () => {
    // Onbeperkt doortellen zou van één product een volledige dekking maken —
    // precies de somredenering die deze module vermijdt.
    const eenmaal = bouwDagdekking({ lunch: [{ key: "kropsla", porties: 1 }] });
    const drievoud = bouwDagdekking({ lunch: [{ key: "kropsla", porties: 3 }] });
    const twintigvoud = bouwDagdekking({ lunch: [{ key: "kropsla", porties: 20 }] });
    const status = (d: ReturnType<typeof bouwDagdekking>) =>
      dekkingVoorStof(d, "vitamine_k")!.status;
    expect(status(eenmaal)).toBe("sterk");
    expect(status(drievoud)).toBe(status(twintigvoud));
  });

  it("telt gedekte stoffen voor de kopregel", () => {
    const dekking = bouwDagdekking(dag());
    expect(dekking.totaal).toBe(18);
    expect(dekking.gedekt).toBeGreaterThan(0);
    expect(dekking.gedekt).toBeLessThanOrEqual(dekking.totaal);
    expect(dagdekkingRegel(dekking)).toMatch(/van de 18 stoffen kwamen langs/);
  });

  it("zegt bij een lege dag dat er niets staat, zonder oordeel", () => {
    const dekking = bouwDagdekking(LEEG);
    expect(dagdekkingRegel(dekking)).toBe("Nog niets ingevuld voor deze dag.");
    expect(dagdekkingRuimteRegel(dekking)).toBeNull();
  });

  it("noemt hoogstens drie gaten in de ruimteregel", () => {
    const regel = dagdekkingRuimteRegel(bouwDagdekking(dag()));
    if (regel && regel.startsWith("Nog niets")) {
      expect(regel.split(",").length).toBeLessThanOrEqual(3);
    }
  });
});

describe("zwaksteStoffen", () => {
  it("zet de stoffen zonder bron vooraan", () => {
    const dekking = bouwDagdekking(dag());
    const zwakste = zwaksteStoffen(dekking, 4);
    expect(zwakste).toHaveLength(4);
    expect(zwakste[0].status).toBe("geen");
  });
});
