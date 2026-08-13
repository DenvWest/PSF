export type SleepPriorityId = 1 | 2 | 3 | 4 | 5 | 6;

export type SleepPriorityLayer = {
  id: SleepPriorityId;
  name: string;
  subtitle: string;
  summary: string;
  actions: string[];
};

/** Zes prioriteiten — canon uit slaap-piramide v2 (lock L1). */
export const SLEEP_PRIORITY_LAYERS: readonly SleepPriorityLayer[] = [
  {
    id: 1,
    name: "Slaapgelegenheid",
    subtitle: "Tijd, prioriteit, hoeveel je jezelf gunt",
    summary:
      "Geef je jezelf daadwerkelijk genoeg tijd en gelegenheid om te slapen? Niet hoeveel uur je zou moeten — wel hoeveel kans je structureel krijgt.",
    actions: [
      "Kies je opsta-tijd eerst, reken daarna terug naar je bedtijd.",
      "Kijk waar je avond weglekt voordat je aan je slaapkamer begint.",
      "Plan na een korte nacht bewust een normale nacht, geen inhaalweekend.",
    ],
  },
  {
    id: 2,
    name: "Ritme & slaapgewoonten",
    subtitle: "Vaste tijden, avondroutine, afbouwtijd",
    summary:
      "Consistentie werkt beter dan precisie. Een redelijk vaste opsta-tijd is voor je klok een sterker anker dan een exacte bedtijd.",
    actions: [
      "Zet je opsta-tijd vast en houd hem ook in het weekend binnen een uur.",
      "Bouw een korte, herkenbare volgorde voor het slapengaan.",
      "Reserveer twintig tot dertig minuten waarin de dag echt is afgelopen.",
    ],
  },
  {
    id: 3,
    name: "Gedrag & timing",
    subtitle: "Daglicht, cafeïne, alcohol, beweging, avond",
    summary:
      "Veel licht overdag, minder stimulerend licht richting de nacht. Cafeïne kan tot ongeveer acht uur nawerken — gevoeligheid verschilt per persoon.",
    actions: [
      "Ga binnen een uur na opstaan even naar buiten — bewolkt telt mee.",
      "Verschuif je laatste cafeïne twee uur naar voren en kijk wat er gebeurt.",
      "Plan twee tot drie avonden per week zonder alcohol.",
    ],
  },
  {
    id: 4,
    name: "Slaapomgeving",
    subtitle: "Licht, geluid, temperatuur, bed, prikkels",
    summary:
      "Verwijder wat je slaap verstoort — dat is iets anders dan alles optimaliseren. Een goed matras compenseert geen structureel slaaptekort.",
    actions: [
      "Pak eerst je grootste verstoring aan, niet alle zes tegelijk.",
      "Leg je telefoon buiten handbereik als je hem 's nachts pakt.",
      "Zet notificaties uit in plaats van het scherm te dimmen.",
    ],
  },
  {
    id: 5,
    name: "Gerichte interventies",
    subtitle: "Aanhoudende klachten, professionele hulp",
    summary:
      "Deze prioriteit gaat over aanhoudende klachten. Bij langdurige slapeloosheid bestaat CGT-i — dat bespreek je met je huisarts of slaaptherapeut.",
    actions: [
      "Loop de signalen langs — dit is geen vragenlijst met een uitslag.",
      "Houd twee weken kort bij wanneer klachten er wel en niet zijn.",
      "Neem die twee weken mee naar je huisarts.",
    ],
  },
  {
    id: 6,
    name: "Meten, gadgets & aanvullen",
    subtitle: "Trackers, supplementen, experimenten",
    summary:
      "Deze laag is experimenteler — niet waardevoller dan de rest. Een tracker helpt trends zien; losse nachtwaarden zijn geen uitslag.",
    actions: [
      "Gebruik een meting om een verandering te toetsen, niet om een cijfer te halen.",
      "Verander één ding tegelijk, anders weet je achteraf niet wat het deed.",
      "Beoordeel je nacht aan hoe je dag verloopt, niet aan een grafiek.",
    ],
  },
] as const;

export const SLEEP_LAYER_BY_ID: Record<SleepPriorityId, SleepPriorityLayer> = Object.fromEntries(
  SLEEP_PRIORITY_LAYERS.map((layer) => [layer.id, layer]),
) as Record<SleepPriorityId, SleepPriorityLayer>;

export const SLEEP_LAYER_STATE_LABEL: Record<
  "winst" | "ok" | "watch" | "wacht",
  string
> = {
  winst: "Grootste winst",
  ok: "Op orde",
  watch: "Houd in de gaten",
  wacht: "Nog niet nu",
};
