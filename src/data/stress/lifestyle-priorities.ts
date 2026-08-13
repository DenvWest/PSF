export type StressPriorityId = 1 | 2 | 3 | 4 | 5 | 6;

export type StressPriorityLayer = {
  id: StressPriorityId;
  name: string;
  subtitle: string;
  summary: string;
  actions: string[];
};

/** Zes prioriteiten — stress v1 (zachte pijler, delta t.o.v. nulpunt). */
export const STRESS_PRIORITY_LAYERS: readonly StressPriorityLayer[] = [
  {
    id: 1,
    name: "Overgang & grenzen",
    subtitle: "Werk loslaten, telefoon weg, vast afsluitmoment",
    summary:
      "Je lichaam heeft een signaal nodig dat de werkdag voorbij is. Zonder overgang blijf je 'aan' staan — ook thuis.",
    actions: [
      "Plan een vast eindtijd voor werk en houd die minstens drie dagen aan.",
      "Doe direct na werk 1 minuut ademhaling vóór je je telefoon pakt.",
      "Leg je telefoon buiten bereik tijdens je avondmaaltijd.",
    ],
  },
  {
    id: 2,
    name: "Ademhaling & reset",
    subtitle: "Box-breathing, zucht, korte reset na prikkels",
    summary:
      "Langzame ademhaling helpt je lichaam meetbaar terugschakelen. Geen meditatiecursus — wel een vaste reset die je kent.",
    actions: [
      "Doe 4 minuten box-breathing na werk (4 in, 4 vast, 4 uit).",
      "Gebruik 3 rondes fysiologische zucht als je spanning oploopt.",
      "Probeer 4-7-8 ademhaling vóór bed op drie avonden.",
    ],
  },
  {
    id: 3,
    name: "Herstelmomenten",
    subtitle: "Pauzes overdag, schermvrije reset",
    summary:
      "Stress stapelt op als herstel achterblijft. Korte, bewuste pauzes zijn goedkoper dan een vol weekend inhalen.",
    actions: [
      "Plan één schermvrije pauze van 5 minuten midden op de dag.",
      "Sta na elk uur achter elkaar werken even op en loop 2 minuten.",
      "Noteer één moment vandaag waarop je bewust losliet.",
    ],
  },
  {
    id: 4,
    name: "Slaap-koppeling",
    subtitle: "Piekeren, avondritueel, link naar slaap",
    summary:
      "Spanning 's avonds trekt door in je slaap. Als je piekert voor bed, is slaap vaak de volgende hefboom.",
    actions: [
      "Doe de slaap-check als je avond nog actief voelt.",
      "Schrijf één zorg op papier vóór je naar bed gaat.",
      "Houd je avondritueel identiek aan op drukke dagen.",
    ],
  },
  {
    id: 5,
    name: "Voeding-koppeling",
    subtitle: "Magnesium uit voeding, cortisol-risico",
    summary:
      "Wat je eet ondersteunt herstel — het vervangt geen grenzen. Bij cortisol-risico helpt voeding vooral als basis.",
    actions: [
      "Doe de voedingscheck als je stress en voeding nog niet gekoppeld hebt.",
      "Eet op vaste tijden op drukke dagen — geen extra willpower 's avonds.",
      "Kies één eiwitrijke lunch die je niet overslaat.",
    ],
  },
  {
    id: 6,
    name: "Meten & bijsturen",
    subtitle: "Wekelijkse check-in, delta t.o.v. nulpunt",
    summary:
      "Geen benchmark, geen norm — wel je eigen nulpunt en wat er sindsdien verschuift. Geen productschap op dit scherm.",
    actions: [
      "Herhaal de stress-check over 7–14 dagen op dezelfde dag.",
      "Kies één prioriteit om te volgen — niet alles tegelijk.",
      "Plan een her-intake na 8–12 weken als je patroon verandert.",
    ],
  },
] as const;

export const STRESS_LAYER_BY_ID: Record<StressPriorityId, StressPriorityLayer> = Object.fromEntries(
  STRESS_PRIORITY_LAYERS.map((layer) => [layer.id, layer]),
) as Record<StressPriorityId, StressPriorityLayer>;

export const STRESS_LAYER_STATE_LABEL: Record<
  "winst" | "ok" | "watch" | "wacht",
  string
> = {
  winst: "Grootste winst",
  ok: "Op orde",
  watch: "Houd in de gaten",
  wacht: "Nog niet nu",
};
