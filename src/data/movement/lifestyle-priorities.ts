/**
 * Zes prioriteiten voor beweging — zelfselectie-vorm, geen afgeleide status.
 *
 * De prebuild (beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html,
 * PRIORITIES r.820) heeft wél een PRIO_STATE en WHY_WAIT, maar die zijn daar
 * een vaste demo-waarde — geen functie van echte beweegcheck-antwoorden. Er
 * bestaat geen scoring-engine die per prioriteit winst/ok/watch/wacht
 * berekent (in tegenstelling tot slaap, waar dat wél gebeurt). Dit bestand
 * neemt daarom alleen `name`/`sub`/`kern` over — woordelijk — en laat
 * PRIO_STATE/WHY_WAIT bewust weg. `scope` (topic-tags, geen volzinnen) is
 * niet overgenomen als `actions`: dat zou nieuwe imperatieve zinnen vereisen
 * die niet in de bron staan.
 */

export type MovementPriorityLayer = {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  subtitle: string;
  summary: string;
  actions: readonly string[];
};

export const MOVEMENT_PRIORITY_LAYERS: readonly MovementPriorityLayer[] = [
  {
    id: 1,
    name: "Dagelijks bewegen",
    subtitle: "Zitten onderbreken · wandelen · fietsen",
    summary:
      "Minder lang zitten en meer bewegen door je dag heen leveren voor de meeste mensen meer gezondheidswinst op dan een extra trainingssessie per week.",
    actions: [],
  },
  {
    id: 2,
    name: "Kracht + basisconditie",
    subtitle: "Spierbehoud · matig intensief bewegen",
    summary:
      "Twee keer per week kracht plus regelmatig matig intensief bewegen is de standaard voor volwassenen — sterker dan alleen cardio.",
    actions: [],
  },
  {
    id: 3,
    name: "Progressief opbouwen",
    subtitle: "Geleidelijk meer volume of intensiteit",
    summary:
      "Kracht en conditie bouw je op via geleidelijke toename van volume of intensiteit — niet via één perfect schema vanaf week 1.",
    actions: [],
  },
  {
    id: 4,
    name: "Specifiek sporten",
    subtitle: "Hardlopen · zwemmen · teamsport",
    summary:
      "Doelgericht trainen voor één sport loont pas als de basis van prioriteit 1 en 2 er ligt.",
    actions: [],
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
] as const;
