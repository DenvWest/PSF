import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import type { AgendaBlockRecord } from "@/types/agenda";

/**
 * Terugkijken op wat je zelf plande — de sluitsteen van de voedingsketen.
 *
 * De keten liep tot nu één kant op: je check signaleert, het Kompas
 * prioriteert, de agenda maakt er een moment van. Wat ontbrak is de weg terug.
 * Zonder die weg is een geplande actie een eenmalige beweging: hij staat er,
 * hij gaat voorbij, en niets vraagt ooit of het iets deed.
 *
 * ## Waarom aan een gepland moment en niet aan een vaste zondag
 *
 * Een vaste wekelijkse vraag stelt zich ook aan iemand die niets plande. Dat
 * is een vraag over niets, en die leert mensen de vraag weg te klikken —
 * waarna de vraag die er wél toe doet ook wordt weggeklikt. Een reflectie die
 * aan een concreet blok hangt, weet altijd waar hij over gaat.
 *
 * ## Wat dit expliciet niet is
 *
 * **Geen score.** Wat je hier antwoordt raakt `nutrition-score.ts` niet, niet
 * omhoog en niet omlaag. Dezelfde lock als bij beweging (minuten = evidence,
 * nooit een tweede score): een zelfrapportage over één actie mag nooit een
 * meting overschrijven die uit elf sliders komt.
 *
 * **Geen streak.** Geen tellingen van hoeveel weken achtereen, geen vlammetje,
 * geen inhaalschuld. Wie een blok niet deed krijgt de vraag één keer en daarna
 * niet meer. De copy-lock uit `voortgang-horizon-copy.ts` geldt hier
 * onverkort.
 *
 * **Geen LLM.** De vraag staat vast, de antwoordopties staan vast. Compliance-
 * regel uit het cyclus-besluit: geen gegenereerde tekst per moment.
 */

/** Hoever terug we kijken voor een moment dat om reflectie vraagt. */
export const REFLECTIE_WINDOW_DAYS = 14;

/**
 * Hoe lang een moment op reflectie blijft wachten.
 *
 * Korter dan het venster hierboven: een blok van tien dagen geleden herinner
 * je je niet meer, en een vraag erover levert een gok op in plaats van een
 * observatie. Zeven dagen is ruim genoeg om een weekend te overbruggen.
 */
export const REFLECTIE_MAX_AGE_DAYS = 7;

export type ReflectieAntwoord = "gelukt" | "deels" | "niet";

/** Eén blok dat om een terugblik vraagt. */
export type ReflectieMoment = {
  blockId: string;
  title: string;
  date: string;
  /** Was het blok afgevinkt op de agenda? Kleurt de vraag, bepaalt hem niet. */
  afgevinkt: boolean;
};

/**
 * De antwoordopties, in vaste volgorde.
 *
 * Drie en niet vijf: het verschil tussen "grotendeels" en "meestal" is er geen
 * dat iemand betrouwbaar aanwijst, en elke extra optie maakt het antwoord
 * trager zonder het waarheidsgetrouwer te maken.
 *
 * "Niet gelukt" staat er zonder verzachting en zonder gevolg. Dat is het punt:
 * een eerlijk nee moet net zo goedkoop zijn als een ja, anders meet je alleen
 * nog optimisme.
 */
export const REFLECTIE_OPTIES: readonly { id: ReflectieAntwoord; label: string }[] = [
  { id: "gelukt", label: "Gelukt" },
  { id: "deels", label: "Deels" },
  { id: "niet", label: "Niet gelukt" },
];

function isCategoryBlok(block: AgendaBlockRecord, categoryId: string): boolean {
  return block.categoryId === categoryId;
}

/**
 * Het moment dat nu om een terugblik vraagt, of null.
 *
 * Eén tegelijk. Een lijst met vier openstaande terugblikken is een
 * administratie, en administratie is precies wat mensen niet doen. Het oudste
 * blok binnen het venster wint: dat is het moment waarvan de herinnering het
 * snelst vervaagt.
 *
 * Blokken van vandaag tellen niet mee — de dag is nog bezig, dus de vraag is
 * nog niet te beantwoorden.
 *
 * `categoryId` default `voeding` houdt bestaande callers intact; slaap (en later
 * andere soft pillars) geven hun eigen agenda-categorie mee.
 */
export function resolveReflectieMoment(
  blocks: readonly AgendaBlockRecord[],
  beantwoord: ReadonlySet<string>,
  today = todayInAgendaTimezone(),
  categoryId = "voeding",
): ReflectieMoment | null {
  const oudsteToegestaan = addAgendaDays(today, -REFLECTIE_MAX_AGE_DAYS);

  const kandidaten = blocks.filter(
    (block) =>
      isCategoryBlok(block, categoryId) &&
      !block.deletedAt &&
      block.date < today &&
      block.date >= oudsteToegestaan &&
      !beantwoord.has(block.id),
  );

  if (kandidaten.length === 0) {
    return null;
  }

  const oudste = kandidaten.reduce((earliest, block) =>
    block.date < earliest.date ||
    (block.date === earliest.date && block.startTime < earliest.startTime)
      ? block
      : earliest,
  );

  return {
    blockId: oudste.id,
    title: oudste.title,
    date: oudste.date,
    afgevinkt: oudste.status === "done",
  };
}

/**
 * De vraag boven de opties.
 *
 * Een afgevinkt blok krijgt een andere vraag dan een blok dat bleef staan.
 * Niet om te confronteren maar omdat het anders een vraag is waarvan het
 * antwoord al op het scherm staat: wie afvinkte heeft "gedaan" al gezegd, en
 * wat dan nog onbekend is, is of het ook werkte in de praktijk.
 */
export function reflectieVraag(moment: ReflectieMoment): string {
  return moment.afgevinkt
    ? "Je vinkte dit af — hoe ging het in de praktijk?"
    : "Dit stond op je dag. Hoe ging het?";
}

/**
 * De regel ná het antwoord.
 *
 * Geen aanmoediging bij "gelukt" en geen troost bij "niet gelukt": beide
 * maken van een observatie een oordeel over de persoon. Wat er wél staat is
 * wat het antwoord betekent voor wat je nu weet.
 */
export function reflectieNaklank(antwoord: ReflectieAntwoord): string {
  switch (antwoord) {
    case "gelukt":
      return "Genoteerd. Eén keer is nog geen patroon — je volgende check laat zien of het beklijft.";
    case "deels":
      return "Genoteerd. Deels is bruikbare informatie: er zat iets in de weg, en dat is te verplaatsen.";
    case "niet":
      return "Genoteerd. Een actie die niet past is een actie om te wisselen, niet om vol te houden.";
  }
}

/**
 * De reeks antwoorden als één regel — voor de tijdlaag.
 *
 * Bewust geen percentage en geen verhouding. "3 van de 5" nodigt uit tot een
 * doel van 5 van de 5, en dat is precies de streak die hier niet hoort. Wat
 * er staat is hoeveel je terugkeek en wat het vaakst gebeurde.
 */
export function reflectieReeksRegel(
  antwoorden: readonly ReflectieAntwoord[],
): string | null {
  if (antwoorden.length === 0) {
    return null;
  }
  if (antwoorden.length === 1) {
    return "Je keek één keer terug op een gepland moment.";
  }

  const telling = new Map<ReflectieAntwoord, number>();
  for (const antwoord of antwoorden) {
    telling.set(antwoord, (telling.get(antwoord) ?? 0) + 1);
  }

  const gelukt = telling.get("gelukt") ?? 0;
  const niet = telling.get("niet") ?? 0;

  if (gelukt > niet) {
    return `Je keek ${antwoorden.length} keer terug; meestal lukte het.`;
  }
  if (niet > gelukt) {
    return `Je keek ${antwoorden.length} keer terug; vaker niet dan wel. Misschien passen andere acties beter.`;
  }
  return `Je keek ${antwoorden.length} keer terug; wisselend beeld.`;
}
