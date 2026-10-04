import type { IntakeGender } from "@/data/intake-questions";

/**
 * De Nederlandse voedingsnormen voor de vier kernstoffen met een vaste norm.
 * Eiwit staat er niet in: dat doel rekent met gewicht en belasting
 * (`protein-target.ts`).
 *
 * ## Waarom niet de RI uit `reference-intake.ts`
 *
 * De RI (EU 1169/2011, bijlage XIII) is een etiketwaarde: één getal voor een
 * gemiddelde volwassene, bedoeld om producten te vergelijken. Voor vitamine D
 * is hij 5 µg, de helft van wat de Gezondheidsraad iedere volwassene
 * aanbeveelt. Een dekkingsoordeel over een persoon hoort tegen de norm voor
 * die persoon te rekenen. Het etiket blijft de RI gebruiken
 * (`BESLUIT_KERNSTOF_NORMEN_2026-10.md`).
 *
 * ## Onbekend geslacht
 *
 * Wie geen geslacht opgaf of "anders" koos, krijgt de hogere waarde. Een
 * hogere norm geeft minder vinkjes, en een vinkje is het enige wat het
 * tekortsysteem mag bewijzen (asymmetrie-regel). Zo zegt het systeem nooit
 * "gedekt" op grond van een norm die voor iemand te laag kan zijn.
 *
 * ## Leeftijd
 *
 * Voor deze vier stoffen verschilt de norm pas vanaf 70 jaar (vitamine D:
 * 20 µg). De leeftijdsvraag in de check stopt bij "55+", dus dat onderscheid
 * is niet te maken. Iedereen rekent met 10 µg.
 */

export type KernstofMetNorm = "magnesium" | "zinc" | "vitamin_d" | "omega3";

export type Voedingsnorm = {
  waarde: number;
  unit: "mg" | "µg";
  /** Korte bronvermelding voor in de UI. */
  bron: string;
  /** Voor wie deze waarde geldt, zoals je hem in de UI leest. */
  geldtVoor: string;
};

const GR_2018 = "Gezondheidsraad 2018";

type NormPerGeslacht = { man: number; vrouw: number };

const PER_GESLACHT: Record<"magnesium" | "zinc", NormPerGeslacht & { unit: "mg" }> = {
  magnesium: { man: 350, vrouw: 300, unit: "mg" },
  zinc: { man: 9, vrouw: 7, unit: "mg" },
};

function perGeslacht(stof: "magnesium" | "zinc", gender: IntakeGender | null): Voedingsnorm {
  const norm = PER_GESLACHT[stof];
  if (gender === "vrouw") {
    return { waarde: norm.vrouw, unit: norm.unit, bron: GR_2018, geldtVoor: "vrouwen 18+" };
  }
  if (gender === "man") {
    return { waarde: norm.man, unit: norm.unit, bron: GR_2018, geldtVoor: "mannen 18+" };
  }
  return { waarde: norm.man, unit: norm.unit, bron: GR_2018, geldtVoor: "volwassenen 18+" };
}

export function voedingsnormenVoor(gender: IntakeGender | null): Record<KernstofMetNorm, Voedingsnorm> {
  return {
    magnesium: perGeslacht("magnesium", gender),
    zinc: perGeslacht("zinc", gender),
    vitamin_d: { waarde: 10, unit: "µg", bron: GR_2018, geldtVoor: "volwassenen tot 70" },
    omega3: {
      waarde: 200,
      unit: "mg",
      bron: "Gezondheidsraad 2001",
      geldtVoor: "volwassenen, EPA+DHA uit vis",
    },
  };
}
