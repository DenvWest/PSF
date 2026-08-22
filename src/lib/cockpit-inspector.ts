import { buildMeaningSentence } from "@/lib/betekenis-motor";

/**
 * Cockpit-contextpaneel (slice 2): regelgebaseerde selectie van welke kaarten
 * rechts verschijnen, uit data die al op het dashboard beschikbaar is. Pure
 * functie, domein-agnostisch (caller levert de al-geresolvede velden aan).
 * Volgorde = prioriteit: de meest relevante context nu bovenaan.
 */

export type InspectorCardKind =
  | "why"
  | "tip"
  | "meet"
  | "doel"
  | "laag"
  | "keuze"
  | "evidence"
  | "ijkpunt";

export type InspectorEvidenceStatus = "below" | "near" | "meets" | "own";

export type InspectorEvidenceRow = {
  key: string;
  label: string;
  answerLabel: string;
  benchmarkLabel?: string | null;
  status?: InspectorEvidenceStatus;
};

export const INSPECTOR_EVIDENCE_STATUS_LABEL: Record<InspectorEvidenceStatus, string> = {
  below: "Onder de richtlijn",
  near: "Bijna op de richtlijn",
  meets: "Haalt de richtlijn",
  own: "Jouw ijkpunt",
};

export type InspectorCard = {
  kind: InspectorCardKind;
  accent: "sage" | "terra" | "neutral";
  kicker: string;
  title: string;
  body: string;
  evidence?: readonly InspectorEvidenceRow[];
  href?: string;
  hrefLabel?: string;
  hasGoal?: boolean;
};

export type InspectorInput = {
  activeHabit?: { title: string; detail: string | null; done: boolean } | null;
  remeasure?: { daysUntil: number } | null;
  anchorWhy?: string | null;
};

export function buildInspectorCards(input: InspectorInput): InspectorCard[] {
  const cards: InspectorCard[] = [];
  const habit = input.activeHabit ?? null;

  if (habit?.done) {
    cards.push({
      kind: "tip",
      accent: "sage",
      kicker: "Gedaan vandaag",
      title: "Mooi — je stap staat.",
      body: "Morgen kies je opnieuw. Ritme boven perfectie — één moment telt al mee.",
    });
  } else if (habit) {
    cards.push({
      kind: "why",
      accent: "sage",
      kicker: "Waarom deze stap",
      title: habit.title,
      body: buildMeaningSentence({
        metric: habit.detail ?? habit.title,
        anchorWhy: input.anchorWhy ?? null,
      }),
    });
  } else {
    cards.push({
      kind: "why",
      accent: "neutral",
      kicker: "Waarom deze stap",
      title: "Je stap van vandaag",
      body: "Kies je dagkeuze in de hero — hier lees je straks waarom die past bij jouw doel.",
    });
  }

  const remeasure = input.remeasure ?? null;
  if (remeasure) {
    const ready = remeasure.daysUntil <= 0;
    cards.push({
      kind: "meet",
      accent: "terra",
      kicker: "Je volgende meetmoment",
      title: ready
        ? "Je hermeting staat klaar."
        : `Over ${remeasure.daysUntil} dagen: je hermeting`,
      body: "Niet elke dag een cijfer — dat is bewust. De payoff komt bij je hermeting.",
    });
  }

  if (input.anchorWhy) {
    cards.push({
      kind: "doel",
      accent: "neutral",
      kicker: "Waar je naartoe werkt",
      title: "Future You",
      body: input.anchorWhy,
    });
  }

  return cards;
}

export type LadderInspectorInput = {
  layerId: number;
  layerName: string;
  /** "Grootste winst", "Op orde", … — alleen waar de check een staat oplevert. */
  stateLabel?: string | null;
  /** De regel die uitlegt waarom deze laag kan wachten. */
  whyWait?: string | null;
  /** Wat je op deze laag koos, met zijn moment als dat er staat. */
  chosen: readonly { title: string; moment?: string | null }[];
  /** Of dit de laag is die de check aanwijst. Stuurt alleen het accent. */
  isFocus?: boolean;
  /** Feitenrijen uit de eigen check, al gefilterd op deze laag. */
  evidence?: readonly InspectorEvidenceRow[];
  /** Of er überhaupt een eigen check is — zonder vullen we niets in. */
  hasCheck: boolean;
  /** "beweegcheck", "slaapcheck", … — voor de lege staat. */
  checkNoun: string;
  checkHref?: string | null;
  /** Ijkpunt-titel (eigen woorden of situatielabel), of null zonder doel. */
  goalTitle?: string | null;
  /** Alleen interventiedomeinen hebben een ijkpunt. */
  canSetGoal?: boolean;
};

/**
 * De contextkolom op een domeinscherm beweegt mee met de ladder.
 *
 * Tot 20 augustus stond hier de "Waarom deze stap"-kaart uit het oude
 * stappenplan-systeem. Daarna droeg de kolom de laag-summary — dezelfde zin
 * als onder de midden-ladder. Nu is de kolom check-context: wat je antwoorden
 * over díé laag zeggen, welk ijkpunt er staat, en wat je koos. Geen tweede
 * ladder (lock N6), en geen herhaling van de samenvatting.
 */
export function buildLadderInspectorCards(input: LadderInspectorInput): InspectorCard[] {
  const cards: InspectorCard[] = [];
  const evidence = input.evidence ?? [];

  cards.push({
    kind: "laag",
    accent: input.isFocus ? "terra" : "neutral",
    kicker: input.stateLabel
      ? `Prioriteit ${input.layerId} · ${input.stateLabel}`
      : `Prioriteit ${input.layerId}`,
    title: input.layerName,
    body: "",
  });

  if (input.hasCheck && evidence.length > 0) {
    cards.push({
      kind: "evidence",
      accent: "sage",
      kicker: "Jouw stand op deze laag",
      title: evidence.length === 1 ? evidence[0].label : `${evidence.length} metingen uit je check`,
      body: "",
      evidence,
    });
  } else if (input.hasCheck) {
    cards.push({
      kind: "evidence",
      accent: "neutral",
      kicker: "Jouw stand op deze laag",
      title: "Niet gemeten op deze laag",
      body:
        input.whyWait ??
        "Je check zegt hier niets over — dat is geen tekort, en we vullen het niet in.",
    });
  } else {
    const href = input.checkHref ?? null;
    cards.push({
      kind: "evidence",
      accent: "neutral",
      kicker: "Jouw stand op deze laag",
      title: `Nog geen ${input.checkNoun}`,
      body: "Zonder check vullen we dit niet in met aannames.",
      ...(href
        ? { href, hrefLabel: `Doe de ${input.checkNoun}` }
        : {}),
    });
  }

  if (input.canSetGoal) {
    const hasGoal = Boolean(input.goalTitle);
    cards.push({
      kind: "ijkpunt",
      accent: "sage",
      kicker: "Jouw doel",
      title: input.goalTitle ?? "Nog geen doel",
      body: hasGoal
        ? "Dit ijkpunt geldt voor het hele domein, niet alleen deze laag."
        : "Wat wil je zelf kunnen? Dat volgt mee in Voortgang.",
      hasGoal,
    });
  }

  cards.push({
    kind: "keuze",
    accent: "sage",
    kicker: "Mijn keuze op deze laag",
    title:
      input.chosen.length === 0
        ? "Hier koos je nog niets"
        : `${input.chosen.length} ${input.chosen.length === 1 ? "keuze" : "keuzes"}`,
    body:
      input.chosen.length === 0
        ? "Dat hoeft ook niet — de laag lezen kost je niets en verplicht je tot niets."
        : input.chosen
            .map((row) => (row.moment ? `${row.title} — ${row.moment}` : row.title))
            .join(" "),
  });

  return cards;
}
