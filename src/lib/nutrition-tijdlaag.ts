import { SCORE_ROW_KEY, type Meetreeks, type MeetreeksRow } from "@/lib/voortgang-meetreeks";

/**
 * Wat er sinds je vorige check bewoog — de inhoud van P5 (Meten & timing).
 *
 * P5 stond leeg omdat de laag in v1 bewust dicht is voor calorieën tellen en
 * eetvensters: dat zijn gereedschappen, geen fundament. Maar "meten" heeft een
 * tweede betekenis die wél op zijn plek is zodra je twee checks hebt gedaan —
 * beweegt het de goede kant op? Die data bestond al (`domainMeasurements`) en
 * werd alleen getoond achter "Over tijd" per losse feitenrij, verspreid over
 * P1 tot P3. Hier staat hij bij elkaar, op de laag die er zijn naam aan
 * ontleent.
 *
 * Twee regels die dit bestand hard maakt:
 *
 * 1. **Eén meting is geen reeks.** Met één moment is er niets veranderd, alleen
 *    iets gemeten. Dan zegt de laag dat, en niet meer.
 * 2. **Richting is geen cijfer.** We tonen dat iets omhoog of omlaag ging en
 *    tussen welke twee antwoorden — nooit een delta, percentage of snelheid.
 *    De schaal is zelfrapportage op een handvol stops; een getal eroverheen
 *    zou precisie claimen die de vraag niet draagt.
 */

export type TijdlaagRichting = "vooruit" | "achteruit" | "gelijk" | "nieuw";

export type TijdlaagRij = {
  key: string;
  label: string;
  richting: TijdlaagRichting;
  /** Het antwoord bij de laatste meting. */
  nu: string;
  /** Het antwoord bij de meting ervoor; null als die er niet was. */
  eerder: string | null;
};

export type NutritionTijdlaag = {
  /** Aantal meetmomenten in de reeks. */
  momenten: number;
  /** Label van het meest recente moment ("15 aug 2026"). */
  laatsteDatum: string | null;
  /** Label van het moment ervoor — waar we mee vergelijken. */
  vorigeDatum: string | null;
  rijen: readonly TijdlaagRij[];
};

function richtingVan(nu: number | null, eerder: number | null): TijdlaagRichting {
  if (nu == null) return "nieuw";
  if (eerder == null) return "nieuw";
  if (nu > eerder) return "vooruit";
  if (nu < eerder) return "achteruit";
  return "gelijk";
}

function bouwRij(row: MeetreeksRow): TijdlaagRij | null {
  const nuCell = row.cells[0] ?? null;
  const eerderCell = row.cells[1] ?? null;
  if (!nuCell) {
    return null;
  }
  return {
    key: row.key,
    label: row.label,
    richting: richtingVan(nuCell.level, eerderCell?.level ?? null),
    nu: nuCell.answerLabel,
    eerder: eerderCell?.answerLabel ?? null,
  };
}

export function buildNutritionTijdlaag(meetreeks: Meetreeks | null): NutritionTijdlaag {
  const moments = meetreeks?.moments ?? [];
  const leeg: NutritionTijdlaag = {
    momenten: moments.length,
    laatsteDatum: moments[0]?.dateLabel ?? null,
    vorigeDatum: moments[1]?.dateLabel ?? null,
    rijen: [],
  };

  if (!meetreeks || moments.length === 0) {
    return leeg;
  }

  // De domeinscore hoort op Voortgang-home, niet hier: deze laag gaat over de
  // losse antwoorden waar je iets aan kunt veranderen, niet over het cijfer.
  const rijen = meetreeks.valueRows
    .filter((row) => row.key !== SCORE_ROW_KEY)
    .map(bouwRij)
    .filter((rij): rij is TijdlaagRij => rij !== null);

  return {
    ...leeg,
    rijen,
  };
}
