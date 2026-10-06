import type { IntakeGender } from "@/data/intake-questions";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";

/**
 * De voedingsnormen per persoon: de vier kernstoffen met een vaste norm en de
 * gevolgde stoffen met een norm (`REVIEW_NORM_EN_ONDERZOEK_PER_STOF_2026-10.md`
 * §6). Eiwit staat er niet in: dat doel rekent met gewicht en belasting
 * (`protein-target.ts`).
 *
 * ## Welke bron
 *
 * Per stof de normen van de Gezondheidsraad, EFSA en de Noordse aanbevelingen
 * (NNR2023) naast elkaar; bij verschil de hoogste. Een hogere norm geeft
 * minder vinkjes, en een vinkje is het enige wat het tekortsysteem mag
 * bewijzen (asymmetrie-regel). Om dezelfde reden krijgt wie geen geslacht
 * opgaf of "anders" koos de hogere waarde.
 *
 * ## Waarom niet de RI
 *
 * De RI (EU 1169/2011, bijlage XIII) is een etiketwaarde voor een gemiddelde
 * volwassene. Voor kalium is hij 2000 mg, tegen een norm van 3500. Een ring
 * die tot de RI vult, loopt vol terwijl de norm nog niet gehaald is. Het
 * etiket en de voedingswaardetabel blijven de RI tonen.
 *
 * ## Toetsing
 *
 * {@link NORMEN_GETOETST} is de maand waarin alle waarden voor het laatst naast
 * de bronnen zijn gelegd. Een test faalt als dat langer dan twaalf maanden
 * geleden is.
 */

export const NORMEN_GETOETST = "2026-10";

export type KernstofMetNorm = "magnesium" | "zinc" | "vitamin_d" | "omega3";

export type GevolgdeStofMetNorm = "potassiumMg" | "calciumMg" | "ironMg" | "vitaminB12µg" | "vitaminCMg";

export type Menstruatie = "ja" | "onregelmatig" | "nee";

export type Voedingswijze = "vegetarisch" | "veganistisch";

export type Voedingsnorm = {
  waarde: number;
  unit: "mg" | "µg";
  /** Korte bronvermelding voor in de UI. */
  bron: string;
  /** Voor wie deze waarde geldt, zoals je hem in de UI leest. */
  geldtVoor: string;
};

export type NormProfiel = {
  gender: IntakeGender | null;
  ageRange?: string | null;
  zeventigPlus?: boolean;
  voedingswijze?: Voedingswijze | null;
  menstruatie?: Menstruatie | null;
};

export type GevolgdeNormen = Record<GevolgdeStofMetNorm, Voedingsnorm>;

const GR_2018 = "Gezondheidsraad 2018";
const NNR_2023 = "NNR 2023";

function voorWie(gender: IntakeGender | null): string {
  return gender === "vrouw" ? "vrouwen" : gender === "man" ? "mannen" : "volwassenen";
}

/** Alleen bij "vrouw" of "anders"; bij een onbekend geslacht geldt zonder vraag de hogere ijzernorm. */
export function vraagtMenstruatie(gender: IntakeGender | null): boolean {
  return gender === "vrouw" || gender === "anders";
}

function vijftigPlus(ageRange: string | null | undefined): boolean {
  return ageRange === null || ageRange === undefined || ageRange === "50–54" || ageRange === "55+";
}

function zink(gender: IntakeGender | null, voedingswijze: Voedingswijze | null | undefined): Voedingsnorm {
  const vrouw = gender === "vrouw";
  if (voedingswijze === "veganistisch") {
    return {
      waarde: vrouw ? 12.7 : 16.3,
      unit: "mg",
      bron: "EFSA 2014",
      geldtVoor: `${voorWie(gender)}, veganistisch (veel fytaat)`,
    };
  }
  if (voedingswijze === "vegetarisch") {
    return {
      waarde: vrouw ? 11 : 14,
      unit: "mg",
      bron: "EFSA 2014",
      geldtVoor: `${voorWie(gender)}, vegetarisch (meer fytaat)`,
    };
  }
  return { waarde: vrouw ? 10 : 13, unit: "mg", bron: NNR_2023, geldtVoor: voorWie(gender) };
}

export function voedingsnormenVoor(
  gender: IntakeGender | null,
  { zeventigPlus = false, voedingswijze = null }: Omit<NormProfiel, "gender"> = {},
): Record<KernstofMetNorm, Voedingsnorm> {
  return {
    magnesium: {
      waarde: gender === "vrouw" ? 300 : 350,
      unit: "mg",
      bron: GR_2018,
      geldtVoor: `${voorWie(gender)} 18+`,
    },
    zinc: zink(gender, voedingswijze),
    vitamin_d: zeventigPlus
      ? { waarde: 20, unit: "µg", bron: "Gezondheidsraad 2012", geldtVoor: "volwassenen vanaf 70" }
      : { waarde: 15, unit: "µg", bron: "EFSA 2016", geldtVoor: "volwassenen tot 70" },
    omega3: {
      waarde: 250,
      unit: "mg",
      bron: "EFSA 2010",
      geldtVoor: "volwassenen, EPA+DHA",
    },
  };
}

function calcium(profiel: NormProfiel): Voedingsnorm {
  if (profiel.zeventigPlus) {
    return { waarde: 1200, unit: "mg", bron: GR_2018, geldtVoor: "volwassenen vanaf 70" };
  }
  if (profiel.gender !== "man" && vijftigPlus(profiel.ageRange)) {
    return { waarde: 1100, unit: "mg", bron: GR_2018, geldtVoor: "vrouwen 51–69" };
  }
  return { waarde: 950, unit: "mg", bron: GR_2018, geldtVoor: `${voorWie(profiel.gender)} 25–69` };
}

function ijzer(profiel: NormProfiel): Voedingsnorm {
  if (profiel.gender === "man") {
    return { waarde: 11, unit: "mg", bron: GR_2018, geldtVoor: "mannen" };
  }
  if (vraagtMenstruatie(profiel.gender) && profiel.menstruatie === "nee") {
    return { waarde: 11, unit: "mg", bron: GR_2018, geldtVoor: "na de menopauze" };
  }
  return { waarde: 16, unit: "mg", bron: GR_2018, geldtVoor: "zolang je menstrueert" };
}

export function gevolgdeNormenVoor(profiel: NormProfiel): GevolgdeNormen {
  const vrouw = profiel.gender === "vrouw";
  return {
    potassiumMg: { waarde: 3500, unit: "mg", bron: GR_2018, geldtVoor: "volwassenen" },
    calciumMg: calcium(profiel),
    ironMg: ijzer(profiel),
    vitaminB12µg: { waarde: 4, unit: "µg", bron: "EFSA 2015", geldtVoor: "volwassenen" },
    vitaminCMg: { waarde: vrouw ? 95 : 110, unit: "mg", bron: "EFSA 2013", geldtVoor: voorWie(profiel.gender) },
  };
}

export function isGevolgdeStofMetNorm(veld: SupermarktVeld): veld is GevolgdeStofMetNorm {
  return veld === "potassiumMg" || veld === "calciumMg" || veld === "ironMg" || veld === "vitaminB12µg" || veld === "vitaminCMg";
}
