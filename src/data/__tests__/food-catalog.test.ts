import { describe, it, expect } from "vitest";
import {
  FOOD_CATALOG,
  catalogByCategory,
  catalogEntry,
  searchCatalog,
  zonderBron,
} from "@/data/nutrition/food-catalog";
import {
  FOOD_CATEGORIES,
  isFoodCategoryId,
  type FoodCategoryId,
} from "@/data/nutrition/food-taxonomy";
import { DAGBOEK_GROEPEN } from "@/lib/nutrition-dagboek";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import type { NutrientId } from "@/data/nutrition/intake-reference";

const BRON_SLEUTELS = new Set(
  (Object.keys(FOOD_SOURCES) as NutrientId[]).flatMap((nutrient) =>
    FOOD_SOURCES[nutrient].map((bron) => bron.key),
  ),
);

describe("de catalogus is intern consistent", () => {
  it("heeft geen dubbele sleutels — de fout die food-sources.ts wél kon maken", () => {
    const gezien = new Map<string, number>();
    for (const entry of FOOD_CATALOG) {
      gezien.set(entry.key, (gezien.get(entry.key) ?? 0) + 1);
    }
    const dubbel = [...gezien.entries()].filter(([, n]) => n > 1).map(([key]) => key);
    expect(dubbel).toEqual([]);
  });

  it("gebruikt alleen categorieën die bestaan", () => {
    const onbekend = FOOD_CATALOG.filter((entry) => !isFoodCategoryId(entry.category));
    expect(onbekend.map((e) => e.key)).toEqual([]);
  });

  it("zet een voedingsmiddel nooit in zijn eigen ookIn — dat zou hem dubbel tonen", () => {
    const fout = FOOD_CATALOG.filter((entry) => entry.ookIn?.includes(entry.category));
    expect(fout.map((e) => e.key)).toEqual([]);
  });

  it("draagt alleen porties met een label en een positief gewicht", () => {
    const fout = FOOD_CATALOG.filter(
      (entry) =>
        entry.porties.length === 0 ||
        entry.porties.some((p) => !p.labelNl.trim() || !(p.grams > 0)),
    );
    expect(fout.map((e) => e.key)).toEqual([]);
  });
});

describe("de analyse-as blijft dertien groepen", () => {
  /**
   * Dit is de invariant die de hele catalogus mag laten groeien. Zolang elke
   * regel in een van de dertien dagboekgroepen valt, verandert er niets aan
   * `berekenBreedte`, `berekenVariatie` of de weekendvergelijking — hoeveel
   * regels er ook bij komen.
   */
  it("valt elke regel in een groep die het dagboek kent", () => {
    const toegestaan = new Set<string>(DAGBOEK_GROEPEN);
    const buiten = FOOD_CATALOG.filter((entry) => !toegestaan.has(entry.groep));
    expect(buiten.map((e) => `${e.key} → ${e.groep}`)).toEqual([]);
  });

  it("gebruikt de samengevoegde legacy-groep vlees-vis nergens", () => {
    // `vlees-vis` bestaat alleen nog om oude check-rijen af te meten. Een
    // catalogusregel die hem gebruikt, maakt vis en vlees onscheidbaar — en
    // precies die scheiding hebben de omega-3- en zinkroute nodig.
    const legacy = FOOD_CATALOG.filter((entry) => entry.groep === "vlees-vis");
    expect(legacy.map((e) => e.key)).toEqual([]);
  });
});

describe("herkomst is traceerbaar of expliciet afwezig", () => {
  it("wijst elke bron naar een sleutel die in FOOD_SOURCES bestaat", () => {
    const kapot = FOOD_CATALOG.filter(
      (entry) => entry.bron !== null && !BRON_SLEUTELS.has(entry.bron),
    );
    expect(kapot.map((e) => `${e.key} → ${e.bron}`)).toEqual([]);
  });

  it("levert de werklijst voor de USDA-extractie — alleen wat er echt een verdient", () => {
    const open = zonderBron();
    expect(open.length).toBeGreaterThan(0);
    // De werklijst bevat alleen op te halen regels: bron null én geen geenBron.
    expect(open.every((entry) => entry.bron === null && !entry.geenBron)).toBe(true);
    // Drie disjuncte stapels tellen samen op tot de hele catalogus.
    const metBron = FOOD_CATALOG.filter((entry) => entry.bron !== null);
    const geenBron = FOOD_CATALOG.filter((entry) => entry.geenBron);
    expect(metBron.length + geenBron.length + open.length).toBe(FOOD_CATALOG.length);
  });

  it("markeert geen enkele regel als geenBron zonder ook bron op null te zetten", () => {
    // Een gehalte én een reden waarom het er niet is, is tegenstrijdig: dan
    // stáát het getal er. `geenBron` mag alleen op regels die geen bron dragen.
    const tegenstrijdig = FOOD_CATALOG.filter(
      (entry) => entry.geenBron && entry.bron !== null,
    );
    expect(tegenstrijdig.map((e) => `${e.key} (${e.geenBron} → ${e.bron})`)).toEqual([]);
  });

  it("laat de werklijst krimpen, niet verschuiven, door geenBron", () => {
    // De hele reden voor geenBron: de werklijst is een echte deelverzameling
    // van 'alles zonder gehalte'. Wie een verrijkt of samengesteld product
    // toevoegt, laat dit getal dus niet stijgen.
    const open = zonderBron();
    const zonderGehalte = FOOD_CATALOG.filter((entry) => entry.bron === null);
    expect(open.length).toBeLessThan(zonderGehalte.length);
    const werklijst = new Set(open.map((e) => e.key));
    expect([...werklijst].every((key) => zonderGehalte.some((e) => e.key === key))).toBe(true);
  });
});

describe("een vorm die een eigen regel krijgt, verantwoordt zich", () => {
  /**
   * De regel uit food-taxonomy.ts: een bereidingsvariant bestaat alleen als
   * hij het gehalte of de portie meetbaar verandert. `waarom` is de plek waar
   * dat staat. Zonder deze test groeit de catalogus vol met varianten die
   * niets toevoegen behalve keuzestress bij het invoeren.
   */
  it("draagt een waarom bij elke bereiding die van de basisvorm afwijkt", () => {
    const basisvormen = new Set(["gekookt", "rauw"]);
    const zonderUitleg = FOOD_CATALOG.filter(
      (entry) => entry.bereiding && !basisvormen.has(entry.bereiding) && !entry.waarom,
    );
    expect(zonderUitleg.map((e) => `${e.key} (${e.bereiding})`)).toEqual([]);
  });
});

describe("zoeken en bladeren", () => {
  it("vindt een voedingsmiddel op zijn label", () => {
    const treffers = searchCatalog("broccoli");
    expect(treffers.length).toBeGreaterThan(0);
    expect(treffers.every((t) => t.labelNl.toLowerCase().includes("broccoli"))).toBe(true);
  });

  it("vindt een voedingsmiddel op een synoniem", () => {
    expect(searchCatalog("pompelmoes").map((t) => t.key)).toContain("grapefruit");
    expect(searchCatalog("snert").map((t) => t.key)).toContain("erwtensoep");
  });

  it("vindt hüttenkäse ook zonder diakrieten", () => {
    expect(searchCatalog("huttenkase").map((t) => t.key)).toContain("huttenkase");
    expect(searchCatalog("creme fraiche").map((t) => t.key)).toContain("creme-fraiche");
  });

  it("zet een treffer aan het begin van het label vóór een treffer halverwege", () => {
    const treffers = searchCatalog("kaas");
    const jong = treffers.findIndex((t) => t.key === "jonge-kaas");
    const hutten = treffers.findIndex((t) => t.key === "huttenkase");
    expect(jong).toBeGreaterThanOrEqual(0);
    if (hutten >= 0) expect(jong).toBeLessThan(hutten);
  });

  it("geeft niets terug op een lege zoekterm", () => {
    expect(searchCatalog("   ")).toEqual([]);
  });

  it("toont bij een categorie ook wat er via ookIn bij hoort", () => {
    const ontbijt = catalogByCategory("ontbijt");
    // Havermout woont bij granen maar hoort ook thuis onder ontbijt.
    expect(ontbijt.map((e) => e.key)).toContain("havermout");
    expect(ontbijt.map((e) => e.key)).toContain("muesli");
  });

  it("laat geen categorie leeg — een lege categorie is een dode deur", () => {
    const leeg = FOOD_CATEGORIES.map((c) => c.id).filter(
      (id: FoodCategoryId) => catalogByCategory(id).length === 0,
    );
    expect(leeg).toEqual([]);
  });

  it("vindt een regel terug op zijn sleutel", () => {
    expect(catalogEntry("amandelen")?.labelNl).toBe("Amandelen");
    expect(catalogEntry("bestaat-niet")).toBeNull();
  });
});
