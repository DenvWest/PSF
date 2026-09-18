import type {
  Bevinding,
  Richting,
  Venster,
  VensterLengte,
  Vensterreeks,
} from "@/lib/nutrition-tekortsysteem";

/**
 * De taal van het tekortsysteem: van vier vensters naar één zin.
 *
 * ## Waarom dit los van de rekenkern staat
 *
 * `nutrition-tekortsysteem.ts` beantwoordt "hoe hardnekkig is dit"; deze
 * module beantwoordt "hoe zeg je dat tegen iemand". Dat scheiden houdt de
 * kern testbaar op getallen en de copy testbaar op woorden — en het maakt
 * zichtbaar dat de asymmetrie-regel twee keer moet worden nagekomen: één keer
 * in wat je berekent, één keer in wat je opschrijft.
 *
 * ## Wat hier nooit uit mag komen
 *
 * Geen kruis, geen tekortgetal, geen "je komt 132 g te kort". Een ondergrens
 * bewijst "gehaald" en nooit "niet gehaald" — dus zegt deze module bij een
 * niet-gedekt venster hoeveel er *nog te gaan* is tot de referentie, als
 * afstand, en nooit als schuld. Zie §3.4 van
 * BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md.
 *
 * Geen samengesteld cijfer evenmin: er is geen weekscore en geen gemiddelde
 * over de vensters. Het verschil tussen de vensters is de bevinding, en een
 * cijfer dat ze samenvat gooit precies dat weg.
 */

/** Wat er onder een venster staat: "vandaag", "7 dagen", … */
export const VENSTER_LABEL: Record<VensterLengte, string> = {
  1: "vandaag",
  7: "7 dagen",
  14: "14 dagen",
  30: "30 dagen",
};

export const RICHTING_LABEL: Record<Richting, string> = {
  verbetert: "loopt op",
  verslechtert: "zakt",
  vlak: "vlak",
  piekt: "piek vandaag",
  onbekend: "te weinig dagen",
};

/**
 * Een korte uitleg per richting, in de tweede persoon.
 *
 * "Piekt" krijgt bewust een andere zin dan "loopt op": één dag ver boven een
 * vlakke maand betekent dat je gisteren vis at, niet dat je patroon verschuift.
 */
export const RICHTING_UITLEG: Record<Richting, string> = {
  verbetert: "Je laatste dagen liggen hoger dan je maand.",
  verslechtert: "Je laatste dagen liggen lager dan je maand.",
  vlak: "Je dagen liggen dicht bij elkaar.",
  piekt: "Vandaag springt eruit. Dat is een dag, nog geen patroon.",
  onbekend: "Nog te weinig dagen om iets over de richting te zeggen.",
};

/**
 * Wat er nog te gaan is tot de referentie, als afstand.
 *
 * Null wanneer de referentie al gehaald is, wanneer het doel elders vandaan
 * komt (eiwit), of wanneer er niets geregistreerd is. Nooit negatief en nooit
 * "tekort" genoemd: het is de ruimte tot de richtwaarde, niet een gat in jou.
 */
export function teGaan(
  venster: Venster,
  referentie: number,
): number | null {
  if (venster.aandeel === null || venster.dagen === 0) return null;
  if (venster.aandeel >= 1) return null;
  const rest = referentie - venster.gemiddeld;
  return rest > 0 ? Math.round(rest * 10) / 10 : null;
}

/**
 * De reden dat een stof geen oordeel krijgt, als het scherm die nodig heeft.
 *
 * Staat hier en niet in de kern omdat het een zin is en geen eigenschap: de
 * kern weet dát een stof onbewijsbaar is, deze module weet hoe je dat uitlegt
 * zonder dat het als falen leest.
 */
export function onbewijsbaarKop(label: string): string {
  return `${label} is met een dagboek niet aan te tonen`;
}

export type BevindingZin = {
  /** De zin zelf, in gewone taal. */
  tekst: string;
  /** Het nutriënt waar de zin over gaat, voor de meting en de route. */
  nutrient: Bevinding["nutrient"];
};

/**
 * De ene zin bovenaan het scherm.
 *
 * Bij geen bevinding geeft dit `null` en toont het scherm niets — een
 * eerlijker uitkomst dan de minst goede stof tot probleem verheffen. Dat
 * gebeurt in twee gevallen: er is te weinig geregistreerd, of alles wat
 * bewijsbaar is, is ook bewezen.
 */
export function bevindingZin(bevinding: Bevinding | null): BevindingZin | null {
  if (!bevinding) return null;

  const { label, dagenOnder, dagenGemeten, richting } = bevinding;
  const stof = label.toLowerCase();

  // "26 van de 30 dagen" is de kern van hardnekkigheid: niet hoe laag, maar
  // hoe vaak. Eén dag eronder is een dag; zesentwintig is een patroon.
  const telling =
    dagenGemeten === 1
      ? "op de ene dag die je registreerde"
      : `op ${dagenOnder} van de ${dagenGemeten} dagen die je registreerde`;

  const staart =
    richting === "verbetert"
      ? " De laatste dagen lopen wel op."
      : richting === "piekt"
        ? " Vandaag springt eruit, maar dat is één dag."
        : "";

  return {
    nutrient: bevinding.nutrient,
    tekst: `${label} is je hardnekkigste gat — ${telling} bleef ${stof} onder de referentie.${staart}`,
  };
}

/**
 * De samenvatting als er géén bevinding is, maar wél data.
 *
 * Twee verschillende situaties die niet op één zin mogen uitkomen: te weinig
 * dagen is "kom terug", alles gedekt is "dit staat".
 */
export function geenBevindingZin(reeksen: readonly Vensterreeks[]): string {
  const gemeten = reeksen.some((reeks) =>
    reeks.vensters.some((venster) => venster.dagen > 0),
  );
  if (!gemeten) {
    return "Nog niets geregistreerd. Vul een dag in je dagboek in — na vier dagen ziet dit scherm je patroon.";
  }
  return "Op wat je registreerde staat geen stof structureel onder de referentie. Dat is wat je dagboek aantoont, en het kan alleen meer worden dan dit.";
}

/**
 * Een hoeveelheid zoals een Nederlandse lezer hem schrijft: komma als
 * decimaalteken, en geen nullen achter de komma die niets toevoegen.
 *
 * `8.1 g` is Engels en leest als een fout op een Nederlandse pagina;
 * `124.4 mg` net zo. Dit staat hier en niet in de component omdat drie
 * schermen dezelfde getallen tonen en ze niet uit elkaar mogen lopen.
 */
export function hoeveelheid(waarde: number): string {
  const afgerond = Math.round(waarde * 10) / 10;
  return Number.isInteger(afgerond)
    ? String(afgerond)
    : afgerond.toFixed(1).replace(".", ",");
}
