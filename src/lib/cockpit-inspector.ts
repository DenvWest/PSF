/**
 * Cockpit-contextpaneel (slice 2): regelgebaseerde selectie van welke kaarten
 * rechts verschijnen, uit data die al op het dashboard beschikbaar is. Pure
 * functie, domein-agnostisch (caller levert de al-geresolvede velden aan).
 * Volgorde = prioriteit: de meest relevante context nu bovenaan.
 */

export type InspectorCardKind = "why" | "tip" | "meet" | "doel";

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
      body:
        habit.detail ??
        "De kleinste stap van vandaag — klein genoeg om te doen, groot genoeg om te tellen.",
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
