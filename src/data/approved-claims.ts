export type ClaimStatus = 'approved' | 'on_hold' | 'forbidden'

export interface ApprovedClaim {
  text: string
  condition: string
  status: ClaimStatus
}

export interface IngredientClaims {
  ingredient: string
  comparisonPath: string | null
  status: ClaimStatus
  verified: boolean
  claims: ApprovedClaim[]
  note: string | null
}

export const FORBIDDEN_PHRASES_GLOBAL: string[] = [
  'geneest',
  'voorkomt',
  'tegen',
  'herstelt',
  'lost op',
  'behandelt',
  'genezing',
  'remedie',
]

export const approvedClaims: Record<string, IngredientClaims> = {
  magnesium: {
    ingredient: 'Magnesium',
    comparisonPath: '/beste-magnesium',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'Draagt bij tot de normale werking van het zenuwstelsel', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot de normale spierfunctie', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot de vermindering van vermoeidheid en moeheid', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot een normale psychologische functie', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot een normale eiwitsynthese', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
    ],
    note: null,
  },
  omega3: {
    ingredient: 'Omega-3 (EPA/DHA)',
    comparisonPath: '/beste-omega-3-supplement',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'EPA en DHA dragen bij tot de normale werking van het hart', condition: 'bij 250 mg EPA+DHA per dag', status: 'approved' },
      { text: 'DHA draagt bij tot de instandhouding van de normale hersenfunctie', condition: 'bij 250 mg DHA per dag', status: 'approved' },
      { text: 'DHA draagt bij tot de instandhouding van een normaal gezichtsvermogen', condition: 'bij 250 mg DHA per dag', status: 'approved' },
    ],
    note: 'GEEN goedgekeurde claim voor energie, vermoeidheid of mitochondrien. Vermijd elke energie-suggestie.',
  },
  vitamineD: {
    ingredient: 'Vitamine D',
    comparisonPath: '/beste-vitamine-d',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'Draagt bij tot de normale werking van het immuunsysteem', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de instandhouding van normale botten', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de instandhouding van een normale spierfunctie', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de normale opname en het normale gebruik van calcium en fosfor', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
    ],
    note: null,
  },
  zink: {
    ingredient: 'Zink',
    comparisonPath: '/beste-zink',
    status: 'approved',
    verified: false,
    claims: [
      { text: 'Draagt bij tot het behoud van een normaal testosterongehalte in het bloed', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de normale werking van het immuunsysteem', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot een normaal cognitief functioneren', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de bescherming van cellen tegen oxidatieve stress', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
    ],
    note: 'verified=false: controleer exacte bewoording in EU Register voordat deze in evidence_claims gaan.',
  },
  creatine: {
    ingredient: 'Creatine',
    comparisonPath: '/beste-creatine',
    status: 'approved',
    verified: false,
    claims: [
      { text: 'Verhoogt de fysieke prestatie bij opeenvolgende korte, zeer intensieve inspanningen', condition: 'bij 3 g creatine per dag', status: 'approved' },
    ],
    note: 'verified=false: tweede claim (spierkracht i.c.m. weerstandstraining) geldt alleen voor volwassenen ouder dan 55 jaar. Controleer EU Register en leeftijdsvoorwaarde voor je deze opneemt.',
  },
  ashwagandha: {
    ingredient: 'Ashwagandha',
    comparisonPath: '/beste-ashwagandha',
    status: 'on_hold',
    verified: true,
    claims: [],
    note: 'GEEN goedgekeurde EFSA-claim, alle claims on-hold. Alleen gebruiken met disclaimer (on-hold, ingediend, aannemelijk). VWS overweegt verbod, besluit medio 2026. Niet opnemen in Foundation Stack.',
  },
  melatonine: {
    ingredient: 'Melatonine',
    comparisonPath: null,
    status: 'forbidden',
    verified: true,
    claims: [],
    note: 'NIET als supplement-interventie gebruiken. Boven 0,3 mg = geneesmiddel (IGJ, receptplichtig). Onder 0,3 mg = supplement maar mag GEEN gezondheidsclaim voeren. EFSA-inslaapclaim geldt pas vanaf 1 mg = geneesmiddel. comparisonPath bewust null. Hooguit informatieve kennisbank-term, nooit affiliate of interventie.',
  },
}

export function getUsableClaims(key: string): ApprovedClaim[] {
  const entry = approvedClaims[key]
  if (!entry || entry.status !== 'approved') return []
  return entry.claims.filter((claim) => claim.status === 'approved')
}

/** Backward compat: AshwagandhaOnHoldDisclaimer op profielpagina's. */
export const ON_HOLD_DISCLAIMER =
  "Ashwagandha staat op de EFSA 'on-hold' lijst voor claims. Dit betekent dat onderzoek naar " +
  "effectiviteit en veiligheid loopt. Geen goedgekeurde EFSA-claim. Gebruik op eigen risico. " +
  "De Nederlandse VWS overweegt momenteel een verbod (besluit verwacht medio 2026).";
