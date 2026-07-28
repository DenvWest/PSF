/**
 * Copy-regels voor de Voortgang-bewijsregel:
 * - Nooit een causaal voegwoord: geen "dus", "daardoor", "dankzij", "omdat".
 *   Gedrag en beleving staan naast elkaar, nooit als oorzaak en gevolg.
 * - Nooit adherence en beleving samenvoegen tot één getal, percentage of balk.
 * - Nooit een oordeel over de persoon ("goed bezig", "zwak", "je moet").
 * - Geen streaks, vlammetjes, badges of schuld-taal.
 * - Geen totale vitaliteitsscore in de zin — alleen het domeinverschil uit focusDelta.
 */

export type VoortgangBewijsState = "beantwoord" | "opbouwend" | "dun" | "wachtend";

export type VoortgangBewijsRegel = {
  state: VoortgangBewijsState;
  line: string;
  ctaLabel: string | null;
};

export function buildVoortgangBewijsRegel(input: {
  activeDays: number | null;
  cycleDay: number | null;
  daysUntilRemeasure: number | null;
  focusLabel: string;
  focusDelta: number | null;
}): VoortgangBewijsRegel {
  const { activeDays, cycleDay, daysUntilRemeasure, focusLabel, focusDelta } = input;

  if (
    focusDelta != null &&
    focusDelta !== 0 &&
    activeDays != null &&
    cycleDay != null
  ) {
    const direction = focusDelta > 0 ? "hoger" : "lager";
    return {
      state: "beantwoord",
      line: `Je was ${activeDays} van de ${cycleDay} dagen actief. ${focusLabel} staat ${Math.abs(focusDelta)} punten ${direction} dan bij je start.`,
      ctaLabel: null,
    };
  }

  if (activeDays == null || cycleDay == null) {
    const line =
      daysUntilRemeasure != null
        ? `Je hermeting staat over ${daysUntilRemeasure} dagen. Dan zie je of er beweging in je ${focusLabel.toLowerCase()} zit.`
        : "Zodra je tweede meting binnen is, lees je hier of er beweging in zit.";
    return {
      state: "wachtend",
      line,
      ctaLabel: null,
    };
  }

  const threshold = Math.max(2, Math.ceil(cycleDay / 3));

  if (activeDays >= threshold) {
    const measureSuffix =
      daysUntilRemeasure != null && daysUntilRemeasure <= 0
        ? "meet je nu, met je hermeting."
        : `meet je over ${daysUntilRemeasure ?? 0} dagen.`;
    return {
      state: "opbouwend",
      line: `Je was ${activeDays} van de ${cycleDay} dagen actief. Of dat je ${focusLabel.toLowerCase()} raakt, ${measureSuffix}`,
      ctaLabel: null,
    };
  }

  return {
    state: "dun",
    line: `Je was ${activeDays} van de ${cycleDay} dagen actief. Te weinig om iets te zien — dat is informatie, geen oordeel.`,
    ctaLabel: "Pak één moment terug",
  };
}
