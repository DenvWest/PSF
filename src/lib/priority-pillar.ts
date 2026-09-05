import { PILLAR, SCORE_KEY_BY_PILLAR, TIE_ORDER } from "@/data/dashboard";
import type { DomainScores } from "@/lib/intake-engine";
import { MEASURED_DOMAIN_TO_PILLAR } from "@/lib/measured-pillar-map";
import { isReadoutDomain } from "@/lib/domain-role";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { isZichtbaarDomein, zichtbareDomeinen } from "@/lib/zichtbare-domeinen";
import type { Pillar, PillarId } from "@/types/dashboard";

/**
 * Eén priority-bron voor de hele funnel: de zichtbare prioriteitspijler is altijd de
 * measured primary theme (slaap/stress/voeding/beweging), nooit energie/herstel. Zo matchen
 * de reveal-kop, de dashboard-priority en nurture.primary_domain 1-op-1.
 *
 * **Verborgen domeinen komen hier niet uit** (5 sep). `getPrimaryTheme` kan
 * `connection` teruggeven — die score bestaat nog en wordt nog berekend — maar
 * een prioriteit is een *aanwijzing*: hij bepaalt waar het dashboard je heen
 * stuurt, welk domein de agenda inplant en welke kop je op je resultaat leest.
 * Naar een domein wijzen dat niet meer in de interface staat is een dood spoor.
 *
 * Het filter zit hier en niet in `getPrimaryTheme` zelf: dat is de bredere
 * funnel-bron (intake-resultaat, plan, nurture), en die mag blijven zien wat de
 * check daadwerkelijk meet. Wat hier gebeurt is de vertaling naar "waar sturen
 * we je heen", en dat is precies de plek waar zichtbaarheid telt.
 */
export function getPriorityPillarId(
  scores: DomainScores,
  answers: Record<string, number>,
): PillarId {
  const gemeten = MEASURED_DOMAIN_TO_PILLAR[getPrimaryTheme(scores, answers)];
  if (isZichtbaarDomein(gemeten)) {
    return gemeten;
  }

  // Het volgende domein op zijn eigen rangorde: de laagste zichtbare score, met
  // dezelfde tiebreak als de engine. Niet zomaar "slaap" — dat zou een
  // willekeurig domein tot prioriteit maken bij iemand die daar juist goed
  // scoort.
  return laagsteZichtbareDomein(scores);
}

/** De laagste score onder de zichtbare domeinen, tiebreak volgens TIE_ORDER. */
function laagsteZichtbareDomein(scores: DomainScores): PillarId {
  const kandidaten = zichtbareDomeinen(
    TIE_ORDER.filter((id) => !isReadoutDomain(id)),
  );
  let gekozen = kandidaten[0];
  let laagste = Number.POSITIVE_INFINITY;

  for (const id of kandidaten) {
    const key = SCORE_KEY_BY_PILLAR[id];
    const waarde = scores[key];
    if (typeof waarde === "number" && Number.isFinite(waarde) && waarde < laagste) {
      laagste = waarde;
      gekozen = id;
    }
  }

  return gekozen;
}

export function getPriorityPillar(
  scores: DomainScores,
  answers: Record<string, number>,
): Pillar {
  return PILLAR[getPriorityPillarId(scores, answers)];
}
