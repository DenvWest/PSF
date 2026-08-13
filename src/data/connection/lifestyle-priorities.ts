/**
 * Bron: docs/design/verbinding-piramide-prebuild-v1-2026-08.html (LAYERS).
 * Woordelijke overname — wijkt deze data af van de prebuild, dan is deze
 * data fout, niet de prebuild. Zie BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md
 * §E voor de onderbouwing per laag.
 *
 * Vandaag alleen gebruikt als leescontent (geen check, geen focus, geen
 * status per laag) — zie BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md
 * §S8 optie C. Wordt bij W2 de bron voor de interactieve ladder.
 */

export type ConnectionPriorityId = 1 | 2 | 3 | 4 | 5 | 6;

export type ConnectionPriorityLayer = {
  id: ConnectionPriorityId;
  name: string;
  subtitle: string;
  summary: string;
  actions: string[];
};

export const CONNECTION_PRIORITY_LAYERS: readonly ConnectionPriorityLayer[] = [
  {
    id: 1,
    name: "Vast moment in je week",
    subtitle: "Eén contactmoment dat niet van de dag afhangt",
    summary:
      "Contact dat van de dag moet komen, komt er niet. Een moment met een tijd erin komt er wel — ook in een week die tegenzit.",
    actions: [
      "Zet één terugkerend moment in je agenda met een naam erbij — niet 'iemand bellen', maar wie en wanneer.",
      "Kies een moment dat niet van je energie afhangt: koppel het aan iets wat toch al vast staat.",
      "Stuur vandaag één bericht om dat moment te zetten, ook als het over drie weken valt.",
    ],
  },
  {
    id: 2,
    name: "Jij zet het in gang",
    subtitle: "Van wachten naar zelf voorstellen",
    summary:
      "De sterkste effecten in onderzoek zitten niet bij méér contacten, maar bij een verschuiving in wie het initiatief neemt. Dat is gedrag, en gedrag is te veranderen.",
    actions: [
      "Stuur deze week één uitnodiging zonder te wachten tot de ander begint.",
      "Stel een dag en een tijd voor in plaats van 'we moeten weer eens'.",
      "Kies iemand bij wie het contact altijd van hem uitgaat, en draai dat één keer om.",
    ],
  },
  {
    id: 3,
    name: "Samen iets doen",
    subtitle: "Een activiteit als drager, niet een gesprek als doel",
    summary:
      "Mannen verbinden vaker naast elkaar via iets wat ze samen doen dan tegenover elkaar via een gesprek. Het gesprek komt uit de activiteit voort, niet andersom.",
    actions: [
      "Kies één ding dat je toch al doet en vraag er iemand bij.",
      "Zoek iets met een vaste tijd, zodat je niet elke week opnieuw hoeft af te spreken.",
      "Ga één keer mee met iets waar je normaal nee op zegt.",
    ],
  },
  {
    id: 4,
    name: "Eén gesprek dat verder gaat",
    subtitle: "Iemand die weet wat er echt speelt",
    summary:
      "Dit is de laag waar aantallen niet helpen. Méér mensen erbij lost het missen van één hechte band niet op — één band waarin je niets hoeft te relativeren wel.",
    actions: [
      "Zeg één keer hoe het echt gaat tegen iemand die er al is — daar heb je geen nieuw contact voor nodig.",
      "Kies een moment naast elkaar: in de auto, tijdens het lopen, na het sporten.",
      "Vraag door als de ander iets laat vallen, in plaats van het te laten liggen.",
    ],
  },
  {
    id: 5,
    name: "Iets betekenen voor iemand",
    subtitle: "Nodig zijn is ook verbinding",
    summary:
      "Verbinding is niet alleen krijgen. Voor veel mannen is 'iemand rekent op mij' een makkelijker ingang dan 'ik heb steun nodig' — en het levert hetzelfde op.",
    actions: [
      "Bied één keer concreet hulp aan in plaats van 'laat maar weten'.",
      "Zeg ja op één ding waar iemand je voor vraagt, ook als het niet uitkomt.",
      "Vraag iemand die je een tijd niet sprak hoe het met hém gaat.",
    ],
  },
  {
    id: 6,
    name: "Volgen & bijsturen",
    subtitle: "Je eigen nulpunt, geen norm — en geen schap",
    summary:
      "Geen norm, geen benchmark — je eigen nulpunt en wat er sindsdien verschuift. Hier komt geen potje: er is geen supplement dat contact vervangt, en geen goedgekeurde claim die dat suggereert.",
    actions: [
      "Herhaal de verbinding-check over 14 dagen, op dezelfde dag van de week.",
      "Volg één ding: of het moment dat je zette er over twee weken nog staat.",
      "Lees terug wat je vorige keer invulde — je eigen antwoorden, niet een cijfer.",
    ],
  },
];

/**
 * Bron: BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md §C4 (besluit L2).
 * Niet-conditioneel, byte-identiek overal waar dit domein tekst toont —
 * ook hier, waar er nog geen check bestaat. Nooit wijzigen zonder de
 * §C4-onderbouwing opnieuw te lezen.
 */
export const CONNECTION_SAFETY_NET_LINE =
  "Loopt dit verder dan een druk leven — voel je je langere tijd niet goed — dan is je huisarts het juiste startpunt. Deze check meet leefstijl, geen klachten.";
