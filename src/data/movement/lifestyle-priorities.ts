/**
 * Zes prioriteiten voor beweging — mét afgeleide staat.
 *
 * Tot v3.6 liet dit bestand PRIO_STATE en WHY_WAIT bewust weg, met de reden
 * dat de prebuild-waarden vaste demo-standen waren en er geen engine bestond
 * die per prioriteit winst/ok/watch/wacht berekende. Dat klopte, maar het
 * gevolg was dat de ladder op beweging niets beweerde: `actions` was leeg en
 * de readout kon er niet mee in tegenspraak raken omdat er niets was om mee
 * in tegenspraak te raken.
 *
 * Die staat wordt nu wél afgeleid, in [`movement-ladder.ts`](../../lib/movement-ladder.ts),
 * uit de focusdimensie die `buildMovementConclusion` al kiest — dus uit
 * dezelfde bron als de readout-kop. Zie BESLUIT_BEWEGING_V36 §I1.
 *
 * `actions` komt woordelijk uit `docs/design/dashboard-supplementroute-prebuild-v1-2026-08.html`
 * r.640-649 (`DOMEIN.beweging.lagen[].doing`). Dat is de bron die het oude
 * commentaar hier miste: echte imperatieve zinnen, niet uit `scope`
 * gedestilleerd — `scope` bevat topic-tags, en daar zinnen van maken zou
 * nieuwe copy zijn geweest. Prioriteit 5 en 6 hebben er bewust geen: 5 is
 * marginale winst en 6 is gegate achter de voedingscheck én de hertest.
 */

export type MovementPriorityId = 1 | 2 | 3 | 4 | 5 | 6;

export type MovementPriorityLayer = {
  id: MovementPriorityId;
  name: string;
  subtitle: string;
  summary: string;
  actions: string[];
};

export const MOVEMENT_PRIORITY_LAYERS: readonly MovementPriorityLayer[] = [
  {
    id: 1,
    name: "Dagelijks bewegen",
    subtitle: "Zitten onderbreken · wandelen · fietsen",
    summary:
      "Minder lang zitten en meer bewegen door je dag heen leveren voor de meeste mensen meer gezondheidswinst op dan een extra trainingssessie per week.",
    actions: [
      "Onderbreek elk werkuur twee minuten — staan is genoeg.",
      "Zet één verplaatsing per dag om naar lopen of fietsen.",
      "Neem één telefoongesprek per dag staand of wandelend.",
    ],
  },
  {
    id: 2,
    name: "Kracht + basisconditie",
    subtitle: "Spierbehoud · matig intensief bewegen",
    summary:
      "Twee keer per week kracht plus regelmatig matig intensief bewegen is de standaard voor volwassenen — sterker dan alleen cardio.",
    actions: [
      "Twee krachtsessies per week, vijf oefeningen, hele lichaam.",
      "Houd één rustige duursessie per week aan op spreektempo.",
      "Laat minstens één dag tussen twee krachtsessies.",
    ],
  },
  {
    id: 3,
    name: "Progressief opbouwen",
    subtitle: "Geleidelijk meer volume of intensiteit",
    summary:
      "Kracht en conditie bouw je op via geleidelijke toename van volume of intensiteit — niet via één perfect schema vanaf week 1.",
    actions: [
      "Verhoog één ding per keer: gewicht, herhalingen of sets.",
      "Noteer wat je deed, anders is opbouw een gevoel.",
      "Neem elke vierde week bewust iets rustiger.",
    ],
  },
  {
    id: 4,
    name: "Specifiek sporten",
    subtitle: "Hardlopen · zwemmen · teamsport",
    summary:
      "Doelgericht trainen voor één sport loont pas als de basis van prioriteit 1 en 2 er ligt.",
    actions: [
      "Houd je sport waar hij is — hij hoeft je basis niet te vervangen.",
      "Kijk welke eigenschap je sport niet traint, en zet die ernaast.",
      "Plan je krachtsessies niet vlak voor je wedstrijddag.",
    ],
  },
  {
    id: 5,
    name: "Geavanceerde training",
    subtitle: "Periodisering · zone 2 · intervallen",
    summary:
      "Periodisering, zone 2 versus intervallen en herstelplanning leveren marginale winst bovenop een solide basis.",
    actions: [],
  },
  {
    id: 6,
    name: "Supplementen · wearables",
    subtitle: "Optimalisatie ná leefstijl",
    summary:
      "Creatine, eiwit en wearables zijn optimalisatie ná leefstijl — geen vervanging van prioriteit 1 en 2.",
    actions: [],
  },
];
