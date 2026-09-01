import {
  EVIDENCE_QUESTIONS_BY_DOMAIN,
  LEEFSTIJLCHECK_EVIDENCE_BY_ID,
  type EvidenceStrength,
} from "@/data/leefstijlcheck-evidence";
import { isInterventionDomain } from "@/lib/domain-role";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { PillarId } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * De spiegel: wat je gratis zelf kunt doen naast wat je kunt kopen, met de
 * volgorde ertussen expliciet.
 *
 * **Waarom de ladder de maat is en geen eigen effectcijfer.** Een getal per
 * stof ("helpt 2 van 10") is een uitspraak over wat die stof met jou doet, en
 * dat is een gezondheidsclaim — die mag alleen in de goedgekeurde EU-bewoording
 * (Verordening 1924/2006). De leefstijlladder zegt iets anders en wél van ons:
 * in welke volgorde wíj adviseren. Laag 6 is bij alle drie de schap-domeinen de
 * aanvul-laag, en de laagtekst zegt daar zelf al "geen vervanging van prioriteit
 * 1 en 2". Die rangorde is dus data die er al ligt, geen cijfer dat we verzinnen.
 *
 * De bewijssterren aan de leefstijlkant komen uit dezelfde bron en met dezelfde
 * regel als `EvidenceLadderCard` (sterkste vraag van het domein), zodat de twee
 * oppervlakken niet twee verschillende sterren voor hetzelfde domein tonen.
 */

export type LadderPlek = {
  layerId: number;
  layerName: string;
  layerSummary: string;
  totalLayers: number;
  /** Hoeveel lagen er vóór deze komen. Het argument zelf, niet een cijfer. */
  layersAbove: number;
};

/**
 * Waar een supplement in de ladder van dit domein staat: altijd de laatste
 * laag. Niet hardcoded op 6 — de ladder levert zijn eigen lengte, zodat een
 * domein met een andere opbouw hier vanzelf klopt.
 */
export function resolveSupplementLadderPlek(domain: PillarId): LadderPlek | null {
  const ladder = getLeefstijlLadder(domain);
  if (!ladder || ladder.layers.length === 0) {
    return null;
  }
  const last = ladder.layers[ladder.layers.length - 1];
  return {
    layerId: last.id,
    layerName: last.name,
    layerSummary: last.summary,
    totalLayers: ladder.layers.length,
    layersAbove: ladder.layers.length - 1,
  };
}

export type SpiegelEvidence = { stars: EvidenceStrength; label: string };

/**
 * De bewijssterkte van dit domein, volgens dezelfde keuze als het
 * statistieken-model: de sterkste vraag die het domein draagt.
 */
export function resolveDomainEvidence(domain: PillarId): SpiegelEvidence | null {
  if (!isInterventionDomain(domain)) {
    return null;
  }
  let best: SpiegelEvidence | null = null;
  for (const questionId of EVIDENCE_QUESTIONS_BY_DOMAIN[domain]) {
    const evidence = LEEFSTIJLCHECK_EVIDENCE_BY_ID[questionId];
    if (!evidence) {
      continue;
    }
    if (!best || evidence.strength.stars > best.stars) {
      best = { stars: evidence.strength.stars, label: evidence.strength.label };
    }
  }
  return best;
}

export type SpiegelLeefstijlLaag = {
  id: number;
  name: string;
  /** Eén concrete stap uit die laag; lagen zonder acties leveren null. */
  firstAction: string | null;
};

export type KeuzeSpiegel = {
  domain: PillarId;
  totalLayers: number;
  leefstijl: {
    layers: SpiegelLeefstijlLaag[];
    /** Aantal lagen dat we niet uitschrijven maar wel meetellen. */
    restLayers: number;
    evidence: SpiegelEvidence | null;
  };
  aanbod: {
    layerId: number;
    layerName: string;
    layerSummary: string;
    /** Oordelen met "kopen" — nooit gepresenteerd als het hele verhaal. */
    aanraders: number;
    beoordeeld: number;
    /** Dicht zolang de voedingscheck ontbreekt: dan is er niets te wegen. */
    open: boolean;
  };
};

const LEEFSTIJL_LAGEN_GETOOND = 3;

type BuildKeuzeSpiegelArgs = {
  domain: PillarId;
  verdicts: StoredSupplementVerdict[];
  nutritionLogCompleted: boolean;
};

export function buildKeuzeSpiegel({
  domain,
  verdicts,
  nutritionLogCompleted,
}: BuildKeuzeSpiegelArgs): KeuzeSpiegel | null {
  const ladder = getLeefstijlLadder(domain);
  const plek = resolveSupplementLadderPlek(domain);
  if (!ladder || !plek) {
    return null;
  }

  const leefstijlLagen = ladder.layers
    .filter((layer) => layer.id !== plek.layerId)
    .slice(0, LEEFSTIJL_LAGEN_GETOOND)
    .map((layer) => ({
      id: layer.id,
      name: layer.name,
      firstAction: layer.actions[0] ?? null,
    }));

  return {
    domain,
    totalLayers: plek.totalLayers,
    leefstijl: {
      layers: leefstijlLagen,
      restLayers: plek.layersAbove - leefstijlLagen.length,
      evidence: resolveDomainEvidence(domain),
    },
    aanbod: {
      layerId: plek.layerId,
      layerName: plek.layerName,
      layerSummary: plek.layerSummary,
      aanraders: verdicts.filter((row) => row.verdict === "kopen").length,
      beoordeeld: verdicts.length,
      open: nutritionLogCompleted,
    },
  };
}
