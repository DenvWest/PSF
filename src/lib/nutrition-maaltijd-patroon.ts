import type { GevolgdeNormen } from "@/data/nutrition/voedingsnormen";
import { normVoorVeld, STANDAARD_GEVOLGDE_NORMEN } from "@/lib/nutrition-normen";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { isVrijgegevenBenadering } from "@/lib/nutrition-catalog-gehalte";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import {
  itemsVanMoment,
  nutrientenGesplitstUitItems,
  supplementVanItem,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { SupermarktPortie } from "@/lib/nutrition-supermarkt-items";
import { BASE_UNIT } from "@/lib/nutrition-units";
import {
  berekenVoedingswaarde,
  VOEDINGSWAARDE_VELDEN,
  type VoedingswaardeRij,
} from "@/lib/nutrition-voedingswaarde";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Wat er gemiddeld op één eetmoment op je bord ligt: energie, macro's,
 * micronutriënten en de kernstoffen, over de keren dat je dat moment
 * registreerde.
 *
 * ## Waarom gemiddeld per keer en niet per kalenderdag
 *
 * Een ontbijt dat je niet registreerde is geen leeg ontbijt maar een onbekend
 * ontbijt (asymmetrie-regel). De noemer is daarom het aantal dagen waarop het
 * moment minstens één product droeg; `keer` zegt hoeveel dat er waren.
 *
 * ## Dezelfde som als de dag
 *
 * Elke keer wordt doorgerekend met `berekenVoedingswaarde` en
 * `nutrientenGesplitstUitItems` — dezelfde functies als de dagtabel en de
 * krans. Een maaltijd kan dus nooit iets anders tellen dan de dag waar hij
 * in staat.
 *
 * ## Rijkdom per 100 kcal
 *
 * "Hoe rijk is deze maaltijd" is een dichtheid: hoeveel van een stof per
 * 100 kcal. Een grote lunch levert in absolute zin meer dan een klein ontbijt;
 * per 100 kcal zie je welke maaltijd zijn calorieën het best besteedt. Geen
 * prijs: die is uitgesteld (`BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`).
 */

/** De drie maaltijden plus tussendoor, in de volgorde van de dag. */
export const MAALTIJD_MOMENTEN: readonly EetmomentId[] = EETMOMENTEN.map((m) => m.id);

/** Eiwit staat al bij de macro's; de kernstoffen-rij toont de andere vier. */
const KERNSTOFFEN_PER_MAALTIJD: readonly NutrientId[] = ["magnesium", "zinc", "omega3", "vitamin_d"];

export type MaaltijdKernstof = {
  nutrient: NutrientId;
  label: string;
  unit: string;
  /** Gemiddelde per keer, of null als op geen enkele keer een bron met gehalte stond. */
  gemiddeld: number | null;
  /** Het deel van {@link gemiddeld} dat uit supplementen kwam. */
  uitSupplement: number | null;
  /** Of een benadering aan {@link gemiddeld} bijdroeg: toon met ≈. */
  benaderd: boolean;
};

export type MaaltijdRij = VoedingswaardeRij & {
  /** {@link VoedingswaardeRij.waarde} per 100 kcal, of null zonder energie of waarde. */
  per100kcal: number | null;
};

export type MaaltijdProduct = {
  naam: string;
  /** Op hoeveel keren dit product op deze maaltijd stond. */
  keer: number;
  /** Gemiddelde hoeveelheid per keer dat het er stond. */
  hoeveelheid: number;
  eenheid: "g" | "portie";
  supplement: boolean;
  /** Wat dit product gemiddeld per keer leverde: zelfde rekenpad als de maaltijd. */
  rijen: MaaltijdRij[];
  kernstoffen: MaaltijdKernstof[];
};

export type MaaltijdPatroon = {
  moment: EetmomentId;
  label: string;
  /** Aantal dagen waarop dit moment minstens één product droeg. */
  keer: number;
  rijen: MaaltijdRij[];
  kernstoffen: MaaltijdKernstof[];
  /** Producten in deze keren die niets bijdroegen aan de voedingswaarde. */
  zonderWaarde: number;
  /** Producten die als benadering meetelden (≈). */
  benaderd: number;
  /** Namen van die producten, voor de toelichting onder de tegels. */
  benaderdeProducten: string[];
  /** Supplementregels op dit moment, opgeteld over alle keren. */
  supplementen: number;
  /** Wat er op deze maaltijd stond, vaakst eerst. */
  producten: MaaltijdProduct[];
};

type Invoer = {
  /** Items per datum (gesanitized). */
  itemsPerDag: ReadonlyMap<string, readonly DagboekItem[]>;
  /** Etiketporties per datum. */
  etiketPerDag: Readonly<Record<string, readonly SupermarktPortie[]>>;
  nevoProducten: ReadonlyMap<string, SupermarktProduct>;
  /** Eerste en laatste datum (inclusief), `YYYY-MM-DD`. */
  van: string;
  tot: string;
  normen?: GevolgdeNormen;
};

type Keer = { items: readonly DagboekItem[]; etiket: readonly SupermarktPortie[] };

function gemiddeldeVan(keren: readonly Keer[], nevoProducten: ReadonlyMap<string, SupermarktProduct>, normen: GevolgdeNormen) {
  const keer = keren.length;
  const waarden = keren.map(({ items, etiket }) =>
    berekenVoedingswaarde({
      items,
      supermarktLogs: etiket,
      nevoProducten,
      normen,
    }),
  );

  const gemiddeldeRijen = VOEDINGSWAARDE_VELDEN.map((veld) => {
    let som = 0;
    let heeftWaarde = false;
    let benaderd = false;
    for (const waarde of waarden) {
      const rij = waarde.rijen.find((r) => r.veld === veld.veld);
      if (rij?.waarde === null || rij?.waarde === undefined) continue;
      som += rij.waarde;
      heeftWaarde = true;
      if (rij.benaderd) benaderd = true;
    }
    const gemiddeld = heeftWaarde && keer > 0 ? som / keer : null;
    const norm = normVoorVeld(normen, veld.veld)?.waarde ?? null;
    return {
      ...veld,
      waarde: gemiddeld,
      norm,
      aandeel: gemiddeld !== null && norm !== null ? gemiddeld / norm : null,
      aandeelRi: gemiddeld !== null && veld.ri !== null ? gemiddeld / veld.ri : null,
      benaderd,
    };
  });

  const kcal = gemiddeldeRijen.find((rij) => rij.veld === "energyKcal")?.waarde ?? null;
  const rijen = gemiddeldeRijen.map(
    (rij): MaaltijdRij => ({
      ...rij,
      waarde: rij.waarde === null ? null : afgerond(rij.waarde),
      per100kcal:
        rij.veld === "energyKcal" || rij.waarde === null || kcal === null || kcal <= 0
          ? null
          : (rij.waarde / kcal) * 100,
    }),
  );

  const perKeer = keren.map(({ items }) => nutrientenGesplitstUitItems(items));
  const kernstoffen = KERNSTOFFEN_PER_MAALTIJD.map((nutrient): MaaltijdKernstof => {
    let totaal = 0;
    let supplement = 0;
    let benaderd = false;
    let heeftBron = false;
    for (const stoffen of perKeer) {
      const stof = stoffen.find((s) => s.nutrient === nutrient);
      if (!stof) continue;
      totaal += stof.minstens;
      supplement += stof.uitSupplement;
      if (stof.uitBenadering > 0) benaderd = true;
      heeftBron = true;
    }
    return {
      nutrient,
      label: nutrientReferences[nutrient].label,
      unit: BASE_UNIT[nutrient],
      gemiddeld: heeftBron ? afgerond(totaal / keer) : null,
      uitSupplement: heeftBron ? afgerond(supplement / keer) : null,
      benaderd,
    };
  });

  return { waarden, rijen, kernstoffen };
}

/**
 * Wat er op deze maaltijd stond, vaakst eerst, met per product wat het
 * gemiddeld per keer leverde. De noemer is het aantal keren dat het product er
 * stond, niet het aantal keren dat de maaltijd geregistreerd is: "wat levert
 * mijn havermout" gaat over de havermout die je at.
 */
function productenVan(
  keren: readonly Keer[],
  nevoProducten: ReadonlyMap<string, SupermarktProduct>,
  normen: GevolgdeNormen,
): MaaltijdProduct[] {
  const perNaam = new Map<
    string,
    { keer: number; som: number; eenheid: "g" | "portie"; supplement: boolean; voorkomens: Keer[] }
  >();
  const tel = (naam: string, hoeveelheid: number, eenheid: "g" | "portie", supplement: boolean, voorkomen: Keer) => {
    const huidig = perNaam.get(naam) ?? { keer: 0, som: 0, eenheid, supplement, voorkomens: [] };
    huidig.keer += 1;
    huidig.som += hoeveelheid;
    huidig.voorkomens.push(voorkomen);
    perNaam.set(naam, huidig);
  };

  for (const { items, etiket } of keren) {
    for (const item of items) {
      if (item.bron === "supplement") {
        const entry = supplementVanItem(item);
        if (entry) tel(entry.labelNl, item.grams, "portie", true, { items: [item], etiket: [] });
      } else {
        const entry = catalogEntry(item.key);
        if (entry) tel(entry.labelNl, item.grams, "g", false, { items: [item], etiket: [] });
      }
    }
    for (const log of etiket) {
      const naam = log.product ? [log.product.merk, log.product.naam].filter(Boolean).join(" ") : null;
      if (naam) tel(naam, log.grams, "g", false, { items: [], etiket: [log] });
    }
  }

  return [...perNaam.entries()]
    .map(([naam, { keer, som, eenheid, supplement, voorkomens }]) => {
      const { rijen, kernstoffen } = gemiddeldeVan(voorkomens, nevoProducten, normen);
      return {
        naam,
        keer,
        hoeveelheid: Math.round(som / keer),
        eenheid,
        supplement,
        rijen,
        kernstoffen,
      };
    })
    .sort((a, b) => b.keer - a.keer || a.naam.localeCompare(b.naam, "nl"));
}

function afgerond(waarde: number): number {
  return Math.round(waarde * 10) / 10;
}

export function bouwMaaltijdPatroon({
  itemsPerDag,
  etiketPerDag,
  nevoProducten,
  van,
  tot,
  normen = STANDAARD_GEVOLGDE_NORMEN,
}: Invoer): MaaltijdPatroon[] {
  const datums = [...new Set([...itemsPerDag.keys(), ...Object.keys(etiketPerDag)])]
    .filter((datum) => datum >= van && datum <= tot)
    .sort();

  return EETMOMENTEN.map(({ id: moment, label }): MaaltijdPatroon => {
    const keren = datums.flatMap((datum) => {
      const items = itemsVanMoment(itemsPerDag.get(datum) ?? [], moment);
      const etiket = (etiketPerDag[datum] ?? []).filter((log) => log.moment === moment);
      return items.length + etiket.length > 0 ? [{ items, etiket }] : [];
    });
    const keer = keren.length;

    const { waarden, rijen, kernstoffen } = gemiddeldeVan(keren, nevoProducten, normen);

    return {
      moment,
      label,
      keer,
      rijen,
      kernstoffen,
      zonderWaarde: waarden.reduce((som, waarde) => som + waarde.zonderWaarde, 0),
      benaderd: waarden.reduce((som, waarde) => som + waarde.benaderd, 0),
      benaderdeProducten: [
        ...new Set(
          keren.flatMap(({ items }) =>
            items.flatMap((item) =>
              item.bron === "voeding" && isVrijgegevenBenadering(item.key) ? (catalogEntry(item.key)?.labelNl ?? []) : [],
            ),
          ),
        ),
      ],
      supplementen: keren.reduce(
        (som, { items }) => som + items.filter((item) => item.bron === "supplement").length,
        0,
      ),
      producten: productenVan(keren, nevoProducten, normen),
    };
  });
}
