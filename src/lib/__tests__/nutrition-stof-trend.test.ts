import { describe, expect, it } from "vitest";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";
import { HOOFDMAALTIJDEN } from "@/lib/nutrition-eetpatroon";
import { bronnenUitMeting, meetDag, meetPeriode, perMomentUitMeting, type DagMeting } from "@/lib/nutrition-stof-meting";
import { bouwStofTrend, EIWITDOEL, schaalVoor, type StofTrendInvoer } from "@/lib/nutrition-stof-trend";

const mg = (moment: DagboekItem["moment"], capsules = 1) =>
  ({ moment, bron: "supplement", key: "magnesiumcitraat-capsule", grams: capsules }) as DagboekItem;
const zink = (moment: DagboekItem["moment"]) =>
  ({ moment, bron: "supplement", key: "zinkcitraat-tablet", grams: 1 }) as DagboekItem;

function bron(perDag: Record<string, DagboekItem[]>) {
  return { itemsPerDag: new Map(Object.entries(perDag)), etiketPerDag: {}, nevoProducten: new Map() };
}

describe("meetDag", () => {
  it("telt per maaltijd en noemt een dag pas volledig met ontbijt, lunch én avondeten", () => {
    const halve = meetDag("magnesium", bron({ "2026-10-01": [mg("ontbijt"), zink("lunch")] }), "2026-10-01");
    expect(halve.som).toBe(200);
    expect(halve.volledig).toBe(false);
    expect(halve.momenten.find((m) => m.moment === "lunch")).toMatchObject({ geregistreerd: true, som: 0 });

    const hele = meetDag(
      "magnesium",
      bron({ "2026-10-01": [mg("ontbijt"), zink("lunch"), zink("avondeten")] }),
      "2026-10-01",
    );
    expect(hele.volledig).toBe(true);
  });

  it("een dag is volledig met je gewone maaltijden, en een overgeslagen maaltijd telt als 0", () => {
    const tweeKeer = { ...bron({ "2026-10-01": [mg("lunch"), zink("avondeten")] }), gewoneMaaltijden: ["lunch", "avondeten"] as const };
    expect(meetDag("magnesium", tweeKeer, "2026-10-01").volledig).toBe(true);

    const metOvergeslagen = {
      ...bron({ "2026-10-01": [mg("ontbijt"), zink("avondeten")] }),
      overgeslagenPerDag: new Map([["2026-10-01", ["lunch" as const]]]),
    };
    const dag = meetDag("magnesium", metOvergeslagen, "2026-10-01");
    expect(dag.volledig).toBe(true);
    expect(dag.momenten.find((m) => m.moment === "lunch")).toMatchObject({ geregistreerd: true, overgeslagen: true, som: 0 });
  });

  it("laat een supplement van een andere stof buiten de bronnen", () => {
    const meting = meetPeriode("magnesium", bron({ "2026-10-01": [mg("ontbijt"), zink("ontbijt")] }), ["2026-10-01"]);
    expect(bronnenUitMeting(meting, "mg").map((b) => b.naam)).toEqual(["Magnesiumcitraat, capsule"]);
    expect(perMomentUitMeting(meting)[0]).toMatchObject({ moment: "ontbijt", totaal: 200, keer: 1 });
  });
});

function dag(datum: string, ontbijt: number, volledig: boolean): DagMeting {
  const momenten = (["ontbijt", "lunch", "avondeten", "tussendoor"] as const).map((moment) => ({
    moment,
    geregistreerd: moment === "ontbijt" || (volledig && moment !== "tussendoor"),
    overgeslagen: false,
    som: moment === "ontbijt" ? ontbijt : 0,
    somStreng: moment === "ontbijt" ? ontbijt : 0,
  }));
  return {
    datum,
    geregistreerd: true,
    volledig,
    verwacht: HOOFDMAALTIJDEN,
    som: ontbijt,
    somStreng: ontbijt,
    benaderd: false,
    momenten,
    bijdragen: [],
  };
}

function dagMet(datum: string, per: Partial<Record<"ontbijt" | "lunch" | "avondeten", number>>): DagMeting {
  const momenten = (["ontbijt", "lunch", "avondeten", "tussendoor"] as const).map((moment) => {
    const som = moment === "tussendoor" ? undefined : per[moment];
    return { moment, geregistreerd: som !== undefined, overgeslagen: false, som: som ?? 0, somStreng: som ?? 0 };
  });
  const som = momenten.reduce((t, m) => t + m.som, 0);
  return {
    datum,
    geregistreerd: true,
    volledig: per.ontbijt !== undefined && per.lunch !== undefined && per.avondeten !== undefined,
    verwacht: HOOFDMAALTIJDEN,
    som,
    somStreng: som,
    benaderd: false,
    momenten,
    bijdragen: [],
  };
}

const LEGE_DAG: DagMeting = { ...dag("2026-10-03", 0, false), geregistreerd: false, momenten: [] };

function invoer(dagen: DagMeting[], extra: Partial<StofTrendInvoer> = {}): StofTrendInvoer {
  return {
    stof: "magnesium",
    label: "Magnesium",
    unit: "mg",
    soort: "kern",
    norm: 350,
    nietBewijsbaar: null,
    periodetotaal: false,
    dagen,
    ...extra,
  };
}

describe("schaalVoor", () => {
  it("één dag per maaltijd, tot 14 dagen per dag, daarboven per week", () => {
    expect(schaalVoor(1)).toBe("maaltijd");
    expect(schaalVoor(7)).toBe("dag");
    expect(schaalVoor(14)).toBe("dag");
    expect(schaalVoor(30)).toBe("week");
  });
});

describe("bouwStofTrend", () => {
  it("geeft een onvolledige dag onder de norm geen oordeel, en zegt wat er per maaltijd wél te zeggen valt", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 70, false), dag("2026-10-02", 70, false), LEGE_DAG]));
    expect(trend.punten.map((p) => p.staat)).toEqual(["onvolledig", "onvolledig", "leeg"]);
    expect(trend.redenen[0]).toMatch(/Geen enkele dag is compleet/);
    expect(trend.redenen[1]).toBe("Gemiddeld per maaltijd: ontbijt 70 mg (20% van de dagnorm), 2 keer.");
  });

  it("rekent het oordeel over de volledige dagen en telt de onvolledige apart", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 175, true), dag("2026-10-02", 70, false)]));
    expect(trend.punten.map((p) => p.staat)).toEqual(["onder", "onvolledig"]);
    expect(trend.redenen[0]).toBe("Op de dag dat alles erin stond, haalde je gemiddeld 175 mg: 50% van de norm (350 mg).");
    expect(trend.redenen[1]).toMatch(/1 dag mist een maaltijd/);
  });

  it("een gehaalde dag is gehaald, ook als hij onvolledig is", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 400, false), dag("2026-10-02", 400, true)]));
    expect(trend.punten.map((p) => p.staat)).toEqual(["gehaald", "gehaald"]);
    expect(trend.gehaald).toBe(true);
    expect(trend.redenen).toEqual([]);
    expect(trend.kop).toBe("norm gehaald op 2 van 2 gemeten dagen");
  });

  it("een niet aan te tonen stof krijgt alleen de reden", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 3, true)], { stof: "zinc", nietBewijsbaar: "Bronnen leveren te weinig." }));
    expect(trend.bewijsbaar).toBe(false);
    expect(trend.redenen).toEqual(["Bronnen leveren te weinig."]);
  });

  it("omega-3 telt als periodetotaal, zonder kleur per dag", () => {
    const trend = bouwStofTrend(
      invoer([dag("2026-10-01", 1500, true), dag("2026-10-02", 0, true)], { stof: "omega3", norm: 250, periodetotaal: true }),
    );
    expect(trend.gehaald).toBe(true);
    expect(trend.punten.every((p) => p.staat === "neutraal")).toBe(true);
  });

  it("een gevolgde stof krijgt geen kleur, wel de feiten", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 175, true)], { stof: "calciumMg", soort: "gevolgd" }));
    expect(trend.punten[0]!.staat).toBe("neutraal");
    expect(trend.redenen[0]).toMatch(/50% van de norm/);
  });

  it("schat een onvolledige dag met je eigen gemiddelde van de ontbrekende maaltijd, pas vanaf 3 keer", () => {
    const dagen = [
      dagMet("2026-09-28", { ontbijt: 100, lunch: 50, avondeten: 100 }),
      dagMet("2026-09-29", { ontbijt: 100, lunch: 50, avondeten: 120 }),
      dagMet("2026-09-30", { ontbijt: 100, lunch: 50, avondeten: 140 }),
      dagMet("2026-10-01", { ontbijt: 100, lunch: 50 }),
    ];
    const trend = bouwStofTrend(invoer(dagen));
    const laatste = trend.punten[3]!;
    expect(laatste.staat).toBe("onvolledig");
    expect(laatste.aanvulling).toBe(120);
    expect(laatste.detail?.schatting).toBe("Met je gebruikelijke avondeten erbij kom je op ≈ 77% (een gok: meestal 120 mg).");
    expect(laatste.detail?.momenten.find((m) => m.moment === "avondeten")).toMatchObject({ waarde: null, geschat: 120 });
  });

  it("zegt bij te weinig registraties alleen wat de maaltijd nog moet leveren", () => {
    const dagen = [dagMet("2026-09-30", { ontbijt: 100, lunch: 50, avondeten: 140 }), dagMet("2026-10-01", { ontbijt: 100 })];
    const punt = bouwStofTrend(invoer(dagen)).punten[1]!;
    expect(punt.aanvulling).toBeNull();
    expect(punt.detail?.schatting).toBe("Je lunch en avondeten moeten samen nog 250 mg leveren voor de norm.");
  });

  it("schat niets als de dag de norm al haalt of bij een periodetotaal", () => {
    const gehaald = bouwStofTrend(invoer([dagMet("2026-10-01", { ontbijt: 400 }), dagMet("2026-10-02", { ontbijt: 10 })]));
    expect(gehaald.punten[0]!.detail?.schatting).toBeNull();
    const omega = bouwStofTrend(invoer([dagMet("2026-10-01", { ontbijt: 10 }), dagMet("2026-10-02", { ontbijt: 10 })], { periodetotaal: true }));
    expect(omega.punten.every((p) => p.detail?.schatting === null)).toBe(true);
  });

  it("eiwit rekent tegen je eiwitdoel en heet ook zo", () => {
    const trend = bouwStofTrend(
      invoer([dagMet("2026-10-01", { ontbijt: 30, lunch: 30, avondeten: 40 }), dagMet("2026-10-02", { ontbijt: 20, lunch: 20, avondeten: 20 })], {
        stof: "protein",
        unit: "g",
        norm: 96,
        normNaam: EIWITDOEL,
      }),
    );
    expect(trend.punten.map((p) => p.staat)).toEqual(["gehaald", "onder"]);
    expect(trend.kop).toBe("eiwitdoel gehaald op 1 van 2 gemeten dagen");
    expect(trend.punten[1]!.uitleg).toMatch(/63% van je eiwitdoel/);
  });

  it("een gevolgde stof krijgt een ✓ per gehaalde dag, zonder oordeel-kleur", () => {
    const trend = bouwStofTrend(
      invoer([dagMet("2026-10-01", { ontbijt: 400 }), dagMet("2026-10-02", { ontbijt: 100 })], { stof: "calciumMg", soort: "gevolgd" }),
    );
    expect(trend.punten.map((p) => p.normGehaald)).toEqual([true, false]);
    expect(trend.punten[0]!.staat).toBe("onvolledig");
  });

  it("telt bij twee gewone maaltijden 2/2 en laat overgeslagen maaltijden buiten het gebruikelijke gemiddelde", () => {
    const tweeKeer = (datum: string, lunch: number, avond?: number): DagMeting => {
      const basis = dagMet(datum, avond === undefined ? { lunch } : { lunch, avondeten: avond });
      return { ...basis, verwacht: ["lunch", "avondeten"], volledig: avond !== undefined };
    };
    const overgeslagenAvond = (datum: string): DagMeting => {
      const basis = tweeKeer(datum, 100);
      return {
        ...basis,
        momenten: basis.momenten.map((m) => (m.moment === "avondeten" ? { ...m, geregistreerd: true, overgeslagen: true } : m)),
      };
    };
    const dagen = [
      tweeKeer("2026-09-27", 100, 100),
      tweeKeer("2026-09-28", 100, 100),
      tweeKeer("2026-09-29", 100, 100),
      overgeslagenAvond("2026-09-30"),
      tweeKeer("2026-10-01", 100),
    ];
    const trend = bouwStofTrend(invoer(dagen));
    expect(trend.punten[0]!.sublabel).toBe("2/2");
    expect(trend.punten[0]!.uitleg).toMatch(/alle maaltijden opgeschreven/);
    // Gemiddelde avondeten = 100 uit drie keer gegeten, niet 75 met de overgeslagen 0 erbij.
    expect(trend.punten[4]!.aanvulling).toBe(100);
  });

  it("toont per maaltijd bij één dag", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 70, false)]));
    expect(trend.schaal).toBe("maaltijd");
    expect(trend.punten.map((p) => p.waarde)).toEqual([70, null, null, null]);
  });
});
