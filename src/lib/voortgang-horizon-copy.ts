/**
 * Copy-regels voor de Voortgang-hero op de tijd-as ("wanneer wordt dit leesbaar").
 * Vervangt de activiteit-as van voortgang-bewijs-copy.ts — andere vraag, andere staten.
 * - Nooit een causaal voegwoord: geen "dus", "daardoor", "dankzij", "omdat".
 * - Nooit adherence en beleving samenvoegen tot één getal, percentage of balk.
 * - Nooit een oordeel over de persoon ("goed bezig", "zwak", "je moet").
 * - Geen streaks, vlammetjes, badges of schuld-taal.
 * - Geen totale vitaliteitsscore in de zin — alleen het domeinverschil uit focusDelta.
 * - Geen richting waar er nog geen tweede meting is (delta === null-guard bij de aanroeper).
 */

export type VoortgangHorizonState =
  | "wachtend"
  | "onderweg"
  | "tweede_beeld"
  | "hermeting_klaar";

export type VoortgangHorizonRegel = {
  state: VoortgangHorizonState;
  eyebrow: string;
  h1: string;
  body: string;
};

export function buildVoortgangHorizonRegel(input: {
  hasCycleEvidence: boolean;
  cycleDay: number | null;
  daysUntilRemeasure: number | null;
  remeasureDueDate: string | null;
  trendLength: number;
  focusLabel: string;
  focusDelta: number;
}): VoortgangHorizonRegel {
  const {
    hasCycleEvidence,
    cycleDay,
    daysUntilRemeasure,
    remeasureDueDate,
    trendLength,
    focusLabel,
    focusDelta,
  } = input;

  if (daysUntilRemeasure != null && daysUntilRemeasure <= 0) {
    return {
      state: "hermeting_klaar",
      eyebrow: "JE CYCLUS · KLAAR",
      h1: "Je hermeting staat klaar.",
      body: "Dertig dagen sinds je start. Dit is het moment waarop de vergelijking iets betekent.",
    };
  }

  if (!hasCycleEvidence) {
    const body =
      remeasureDueDate != null
        ? `Je hermeting staat op ${remeasureDueDate}. Wat je tot dan neerzet, lees je op die dag terug — niet vandaag, en dat is bewust.`
        : "Wat je neerzet, lees je terug zodra je hermeting binnen is — niet vandaag, en dat is bewust.";
    return {
      state: "wachtend",
      eyebrow: "JE CYCLUS",
      h1: "Je eerste beeld staat. Het tweede is waar het leesbaar wordt.",
      body,
    };
  }

  const eyebrow = cycleDay != null ? `JE CYCLUS · DAG ${cycleDay} VAN 30` : "JE CYCLUS";

  if (trendLength < 2) {
    const body =
      daysUntilRemeasure != null
        ? `Over ${daysUntilRemeasure} dagen doe je je hermeting. Dan staat er naast je eerste beeld een tweede — pas dan is er een verschil om te lezen.`
        : "Zodra je hermeting binnen is, staat er naast je eerste beeld een tweede — pas dan is er een verschil om te lezen.";
    return {
      state: "onderweg",
      eyebrow,
      h1: cycleDay != null ? `Dag ${cycleDay} van je cyclus.` : "Je cyclus loopt.",
      body,
    };
  }

  const direction = focusDelta > 0 ? "hoger" : focusDelta < 0 ? "lager" : null;
  const body =
    direction != null
      ? `Je ${focusLabel.toLowerCase()} is sinds je start ${Math.abs(focusDelta)} punten ${direction}. Eén verschil is nog geen lijn — je volgende meting zegt of het richting is.`
      : `Je ${focusLabel.toLowerCase()} staat sinds je start op hetzelfde punt. Eén verschil is nog geen lijn — je volgende meting zegt of het richting is.`;

  return {
    state: "tweede_beeld",
    eyebrow,
    h1: "Er staat nu meer dan één meting.",
    body,
  };
}
