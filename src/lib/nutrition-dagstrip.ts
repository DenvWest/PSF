import { addAgendaDays } from "@/lib/agenda-week-preview";

/**
 * De zeven dagen boven het voedingsdagboek.
 *
 * Vandaag staat rechts en de week loopt terug — niet een kalenderweek van
 * maandag tot zondag. Een dagboek vul je achteraf in, meestal over gisteren of
 * eergisteren, en dan wil je zeven dagen terug kunnen kijken zonder van week te
 * wisselen. Op woensdag zou een kalenderweek drie lege toekomstige dagen tonen
 * en de zaterdag ervoor verbergen; deze vorm doet het omgekeerde.
 *
 * Vooruit kan niet: `isValidEntryDate` weigert dagen in de toekomst, en een
 * knop die een foutmelding oplevert is geen knop.
 */

export type DagstripDag = {
  /** ISO-datum. */
  date: string;
  /** "wo", "do" — twee letters, zoals de strip ze toont. */
  kortLabel: string;
  /** Dagnummer in de maand. */
  dagNummer: number;
  /** Volledige omschrijving voor screenreaders: "woensdag 2 september". */
  volledigLabel: string;
  isVandaag: boolean;
  isWeekend: boolean;
};

const KORT = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  timeZone: "Europe/Amsterdam",
});
const VOLLEDIG = new Intl.DateTimeFormat("nl-NL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Amsterdam",
});

function alsDatum(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00.000Z`);
}

export function bouwDagstrip(vandaag: string, dagen = 7): DagstripDag[] {
  const rijen: DagstripDag[] = [];
  for (let terug = dagen - 1; terug >= 0; terug -= 1) {
    const date = addAgendaDays(vandaag, -terug);
    const datum = alsDatum(date);
    const weekdag = datum.getUTCDay();
    rijen.push({
      date,
      // Intl geeft "wo." met punt; die punt is ruis in een pil van 40 px.
      kortLabel: KORT.format(datum).replace(".", ""),
      dagNummer: Number(date.slice(8, 10)),
      volledigLabel: VOLLEDIG.format(datum),
      isVandaag: date === vandaag,
      isWeekend: weekdag === 0 || weekdag === 6,
    });
  }
  return rijen;
}

/** "Vandaag", "Gisteren", anders de volledige omschrijving. */
export function dagTitel(isoDate: string, vandaag: string): string {
  if (isoDate === vandaag) return "Vandaag";
  if (isoDate === addAgendaDays(vandaag, -1)) return "Gisteren";
  return VOLLEDIG.format(alsDatum(isoDate));
}
