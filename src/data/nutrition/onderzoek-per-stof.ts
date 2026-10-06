import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";

/**
 * Per stof het volledige beeld naast de norm: wat onderzoek bij gezonde
 * mensen boven de norm liet zien, en waar de veilige bovengrens ligt
 * (`REVIEW_NORM_EN_ONDERZOEK_PER_STOF_2026-10.md` §6).
 *
 * ## De poort
 *
 * Een onderzochte zone komt alleen uit meta-analyses van gecontroleerde
 * studies bij gezonde volwassenen, met minstens matige zekerheid. Onderzoek
 * bij patiënten of risicogroepen telt niet mee, en ziekte-uitkomsten ook
 * niet. Geen zone is ook informatie: dan staat er waarom niet.
 *
 * ## Geen doel, geen ✓
 *
 * De zone vult geen ring en geeft geen vinkje. De norm blijft de ondergrens
 * (`voedingsnormen.ts`). Gezondheidsclaims blijven beperkt tot
 * `approved-claims.ts`; de tekst hier beschrijft onderzoek, geen effect op
 * jou.
 */

export type OnderzochteZone = {
  van: number;
  tot: number;
  unit: string;
  /** Wat er gemeten werd, in gewone taal. */
  uitkomst: string;
  zekerheid: string;
  bron: string;
  kanttekening?: string;
};

export type Bovengrens = {
  waarde: number;
  unit: string;
  bron: string;
  /** Geldt alleen voor supplementen en toevoegingen, niet voor gewone voeding. */
  alleenSupplement?: boolean;
};

export type StofOnderzoek = {
  zone: OnderzochteZone | null;
  /** Waarom er geen zone is, als die ontbreekt. */
  geenZone?: string;
  bovengrens: Bovengrens | null;
  /** Voor stoffen zonder norm maar met een richtlijn als maximum (natrium, vet, suikers). */
  richtlijn?: string;
};

export type StofMetOnderzoek = NutrientId | SupermarktVeld;

const ONDERZOEK: Partial<Record<StofMetOnderzoek, StofOnderzoek>> = {
  omega3: {
    zone: {
      van: 500,
      tot: 1500,
      unit: "mg",
      uitkomst: "verwerkingssnelheid",
      zekerheid: "matig",
      bron: "Shahinfar e.a. 2025, 32 studies bij gezonde volwassenen",
      kanttekening:
        "Op het denkvermogen in het algemeen geen effect. Suh e.a. 2024 zag een ongunstige trend boven 420 mg EPA per dag.",
    },
    bovengrens: { waarde: 5000, unit: "mg", bron: "EFSA 2012", alleenSupplement: true },
  },
  magnesium: {
    zone: null,
    geenZone: "Bij gezonde mensen geen aantoonbaar effect boven de norm; onderzoek naar slaap heeft lage zekerheid.",
    bovengrens: { waarde: 250, unit: "mg", bron: "EFSA", alleenSupplement: true },
  },
  zinc: {
    zone: null,
    geenZone: "Geen onderzoek bij gezonde mensen dat een hogere inname onderbouwt.",
    bovengrens: { waarde: 25, unit: "mg", bron: "EFSA" },
  },
  vitamin_d: {
    zone: null,
    geenZone: "Bij gezonde 50-plussers gaf 50 µg per dag geen effect op de hoofduitkomsten (VITAL).",
    bovengrens: { waarde: 100, unit: "µg", bron: "EFSA 2023" },
  },
  protein: {
    zone: {
      van: 1.2,
      tot: 1.6,
      unit: "g/kg",
      uitkomst: "spieropbouw bij krachttraining",
      zekerheid: "meta-analyse van 49 studies",
      bron: "Morton e.a. 2018",
      kanttekening: "Boven ongeveer 1,6 g/kg geen extra spierwinst.",
    },
    bovengrens: null,
  },
  potassiumMg: {
    zone: null,
    geenZone: "Het onderzoek boven de norm ging niet over gezonde mensen.",
    bovengrens: null,
  },
  calciumMg: {
    zone: null,
    geenZone: "Geen onderzoek bij gezonde mensen dat meer calcium uit voeding onderbouwt (Bolland e.a. 2015).",
    bovengrens: { waarde: 2500, unit: "mg", bron: "EFSA 2012" },
  },
  ironMg: {
    zone: null,
    geenZone: "Meer is niet beter: het lichaam slaat ijzer op en scheidt het nauwelijks uit.",
    bovengrens: null,
  },
  "vitaminB12µg": {
    zone: null,
    geenZone: "Geen onderzoek bij gezonde mensen dat een hogere inname onderbouwt.",
    bovengrens: null,
  },
  vitaminCMg: {
    zone: null,
    geenZone: "Geen onderzoek bij gezonde mensen dat een hogere inname onderbouwt.",
    bovengrens: null,
  },
  fiberG: {
    zone: null,
    geenZone: "Onderzoek boven de norm meet ziekterisico; dat valt buiten wat we tonen.",
    bovengrens: null,
  },
  sodiumMg: {
    zone: null,
    bovengrens: null,
    richtlijn: "Maximaal 2000 mg per dag (WHO; ongeveer 5 g zout).",
  },
  saturatedFatG: {
    zone: null,
    bovengrens: null,
    richtlijn: "Zo weinig mogelijk; minder dan 10% van je energie als tussenstap (Gezondheidsraad 2026).",
  },
  sugarsG: {
    zone: null,
    bovengrens: null,
    richtlijn: "Vrije suikers zo weinig mogelijk; 10% van je energie als richtpunt (Gezondheidsraad 2026).",
  },
};

export function onderzoekVoor(stof: StofMetOnderzoek): StofOnderzoek | null {
  return ONDERZOEK[stof] ?? null;
}

function getal(waarde: number): string {
  return waarde.toLocaleString("nl-NL");
}

/** Korte regel onder de norm: "onderzocht 500–1500 mg · max 5000 mg". */
export function onderzoekKort(stof: StofMetOnderzoek): string | null {
  const o = onderzoekVoor(stof);
  if (!o) return null;
  if (o.richtlijn && !o.zone) return o.richtlijn;
  const delen = [
    o.zone ? `onderzocht ${getal(o.zone.van)}–${getal(o.zone.tot)} ${o.zone.unit}` : "geen onderzochte zone",
  ];
  if (o.bovengrens) {
    delen.push(`max ${getal(o.bovengrens.waarde)} ${o.bovengrens.unit}${o.bovengrens.alleenSupplement ? " uit supplementen" : ""}`);
  }
  return delen.join(" · ");
}

/** De volledige uitleg voor het invoerpaneel. */
export function onderzoekLang(stof: StofMetOnderzoek): string | null {
  const o = onderzoekVoor(stof);
  if (!o) return null;
  const delen: string[] = [];
  if (o.zone) {
    delen.push(
      `Onderzocht bij gezonde mensen: ${getal(o.zone.van)}–${getal(o.zone.tot)} ${o.zone.unit} (${o.zone.uitkomst}; zekerheid ${o.zone.zekerheid}; ${o.zone.bron}).`,
    );
    if (o.zone.kanttekening) delen.push(o.zone.kanttekening);
  } else if (o.geenZone) {
    delen.push(`Geen onderzochte zone boven de norm. ${o.geenZone}`);
  }
  if (o.richtlijn) delen.push(o.richtlijn);
  if (o.bovengrens) {
    delen.push(
      `Veilige bovengrens: ${getal(o.bovengrens.waarde)} ${o.bovengrens.unit} per dag${o.bovengrens.alleenSupplement ? " uit supplementen" : ""} (${o.bovengrens.bron}).`,
    );
  }
  delen.push("Geen doel en geen vinkje: de norm blijft de ondergrens.");
  return delen.join(" ");
}
