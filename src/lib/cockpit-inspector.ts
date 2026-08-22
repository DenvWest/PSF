import { buildMeaningSentence } from "@/lib/betekenis-motor";

/**
 * Cockpit-contextpaneel (slice 2): regelgebaseerde selectie van welke kaarten
 * rechts verschijnen, uit data die al op het dashboard beschikbaar is. Pure
 * functie, domein-agnostisch (caller levert de al-geresolvede velden aan).
 * Volgorde = prioriteit: de meest relevante context nu bovenaan.
 */

export type InspectorCardKind = "why" | "tip" | "meet" | "doel" | "laag" | "keuze";

export type InspectorCard = {
  kind: InspectorCardKind;
  accent: "sage" | "terra" | "neutral";
  kicker: string;
  title: string;
  body: string;
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
  layerSummary: string;
  /** "Grootste winst", "Op orde", … — alleen waar de check een staat oplevert. */
  stateLabel?: string | null;
  /** De regel die uitlegt waarom deze laag kan wachten. */
  whyWait?: string | null;
  /** Wat je op deze laag koos, met zijn moment als dat er staat. */
  chosen: readonly { title: string; moment?: string | null }[];
  /** Of dit de laag is die de check aanwijst. Stuurt alleen het accent. */
  isFocus?: boolean;
};

/**
 * De contextkolom op een domeinscherm beweegt mee met de ladder.
 *
 * Tot 20 augustus stond hier de "Waarom deze stap"-kaart uit het oude
 * stappenplan-systeem ("2× per week full-body kracht") plus Future You. Die
 * kwamen uit een generatie vóór de ladder en spraken hem soms tegen: de kaart
 * noemde een stap die op geen enkele laag stond. Nu draagt de kolom de laag
 * die je aanklikt en wat jij daar koos — geen tweede ladder (lock N6), maar
 * het waarom naast het wat.
 */
export function buildLadderInspectorCards(input: LadderInspectorInput): InspectorCard[] {
  const cards: InspectorCard[] = [];

  cards.push({
    kind: "laag",
    accent: input.isFocus ? "terra" : "neutral",
    kicker: input.stateLabel
      ? `Prioriteit ${input.layerId} · ${input.stateLabel}`
      : `Prioriteit ${input.layerId}`,
    title: input.layerName,
    body: input.whyWait ? `${input.layerSummary} ${input.whyWait}` : input.layerSummary,
  });

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
