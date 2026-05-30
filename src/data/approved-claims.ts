export type ClaimStatus = 'approved' | 'on_hold' | 'forbidden'

export type SupportingEvidenceType =
  | 'meta_analysis'
  | 'rct'
  | 'observational'
  | 'narrative_review'
  | 'efsa_regulation'

export interface ApprovedClaim {
  text: string
  condition: string
  status: ClaimStatus
}

/** Peer-reviewed onderbouwing naast EFSA-claims; relevant voor doelgroep 40+. */
export interface SupportingEvidence {
  vancouver: string
  url: string
  pmid: string | null
  evidenceType: SupportingEvidenceType
  audienceNote: string
}

export interface IngredientClaims {
  ingredient: string
  comparisonPath: string | null
  status: ClaimStatus
  verified: boolean
  claims: ApprovedClaim[]
  supportingEvidence: SupportingEvidence[]
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
    comparisonPath: '/beste/magnesium',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'Draagt bij tot de normale werking van het zenuwstelsel', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot de normale spierfunctie', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot de vermindering van vermoeidheid en moeheid', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot een normale psychologische functie', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
      { text: 'Draagt bij tot een normale eiwitsynthese', condition: 'min. 56,25 mg per dagdosis (15% RI)', status: 'approved' },
    ],
    supportingEvidence: [
      {
        vancouver: 'Mah J, Pitre T. BMC Complement Med Ther 2021;21:125.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/',
        pmid: '33865376',
        evidenceType: 'meta_analysis',
        audienceNote: 'Meta-analyse orale magnesium bij slapeloosheid bij ouderen (55+ in subset).',
      },
      {
        vancouver: 'Boyle NB, Lawton C, Dye L. Nutrients 2017;9(5):429.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28445426/',
        pmid: '28445426',
        evidenceType: 'meta_analysis',
        audienceNote: 'Systematische review magnesium en subjectieve stress/angst — ondersteunt psychologische-functie-context (claim 4).',
      },
    ],
    note: null,
  },
  omega3: {
    ingredient: 'Omega-3 (EPA/DHA)',
    comparisonPath: '/beste/omega-3-supplement',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'EPA en DHA dragen bij tot de normale werking van het hart', condition: 'bij 250 mg EPA+DHA per dag', status: 'approved' },
      { text: 'DHA draagt bij tot de instandhouding van de normale hersenfunctie', condition: 'bij 250 mg DHA per dag', status: 'approved' },
      { text: 'DHA draagt bij tot de instandhouding van een normaal gezichtsvermogen', condition: 'bij 250 mg DHA per dag', status: 'approved' },
    ],
    supportingEvidence: [
      {
        vancouver: 'Calder PC. Ann Nutr Metab 2020;74:1-9.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31808863/',
        pmid: '31808863',
        evidenceType: 'narrative_review',
        audienceNote: 'Overzicht EPA/DHA en cardiometabole gezondheid bij volwassenen.',
      },
      {
        vancouver: 'Jackson PA, Forster JS, Bell JG, et al. Br J Nutr 2016;115(6):1031-1041.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26864360/',
        pmid: '26864360',
        evidenceType: 'rct',
        audienceNote: 'RCT DHA-suppletie en cognitieve prestaties bij volwassenen 50–75 jaar.',
      },
    ],
    note: 'GEEN goedgekeurde claim voor energie, vermoeidheid of mitochondrien. Vermijd elke energie-suggestie.',
  },
  vitamineD: {
    ingredient: 'Vitamine D',
    comparisonPath: '/beste/vitamine-d',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'Draagt bij tot de normale werking van het immuunsysteem', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de instandhouding van normale botten', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de instandhouding van een normale spierfunctie', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de normale opname en het normale gebruik van calcium en fosfor', condition: 'min. 0,75 ug (5% RI) per dagdosis', status: 'approved' },
    ],
    supportingEvidence: [
      {
        vancouver: 'Bischoff-Ferrari HA, Willett WC, Orav EJ, et al. BMJ 2012;345:e4695.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22833605/',
        pmid: '22833605',
        evidenceType: 'meta_analysis',
        audienceNote: 'Meta-analyse vitamine D en valpreventie bij ouderen — botten/spiercontext 55+.',
      },
      {
        vancouver: 'Annweiler C, Montero-Odasso M, Llewellyn DJ, et al. J Alzheimers Dis 2013;37(3):657-669.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23567424/',
        pmid: '23567424',
        evidenceType: 'meta_analysis',
        audienceNote: 'Meta-analyse vitamine D en cognitie bij ouderen.',
      },
    ],
    note: null,
  },
  zink: {
    ingredient: 'Zink',
    comparisonPath: '/beste/zink',
    status: 'approved',
    verified: true,
    claims: [
      { text: 'Draagt bij tot het behoud van een normaal testosterongehalte in het bloed', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de normale werking van het immuunsysteem', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot een normaal cognitief functioneren', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
      { text: 'Draagt bij tot de bescherming van cellen tegen oxidatieve stress', condition: 'min. 1,5 mg (15% RI) per dagdosis', status: 'approved' },
    ],
    supportingEvidence: [
      {
        vancouver: 'Haase H, Rink L. Nutrients 2014;6(6):2302-2328.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24922193/',
        pmid: '24922193',
        evidenceType: 'narrative_review',
        audienceNote: 'Zink en immuunfunctie bij ouderen — relevant voor 40+ mannen.',
      },
      {
        vancouver: 'Prasad AS. Mol Med 2008;14(5-6):353-357.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18385818/',
        pmid: '18385818',
        evidenceType: 'observational',
        audienceNote: 'Zinc deficiency and aging: review of zinc status in elderly populations.',
      },
    ],
    note: 'Geen geautoriseerde EU-gezondheidsclaim voor zink+creatine-combinaties. Zink-claims gelden standalone; nooit als synergistische performance-combo met creatine marketen.',
  },
  creatine: {
    ingredient: 'Creatine',
    comparisonPath: '/beste/creatine',
    status: 'approved',
    verified: true,
    claims: [
      {
        text: 'Creatine verhoogt de fysieke prestatie bij opeenvolgende korte, zeer intensieve inspanningen',
        condition: 'bij 3 g creatine per dag',
        status: 'approved',
      },
      {
        text: 'Dagelijkse consumptie van creatine kan het effect van weerstandstraining op spierkracht verbeteren bij volwassenen ouder dan 55 jaar',
        condition: '3 g/dag + weerstandstraining min. 3x/week, intensiteit 65–75% 1RM, meerdere weken',
        status: 'approved',
      },
    ],
    supportingEvidence: [
      {
        vancouver: 'Forbes SC, Candow DG, Ostojic SM, et al. J Cachexia Sarcopenia Muscle 2022;13(1):38-50.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35482559/',
        pmid: '35482559',
        evidenceType: 'meta_analysis',
        audienceNote: 'Meta-analyse creatine + weerstandstraining en spierkracht bij ouderen — ondersteunt claim 2 (55+).',
      },
      {
        vancouver: 'Kreider RB, Kalman DS, Antonio J, et al. J Int Soc Sports Nutr 2017;14:18.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/',
        pmid: '28615996',
        evidenceType: 'narrative_review',
        audienceNote: 'ISSN position stand: veiligheid en prestatie-effecten creatine bij volwassenen incl. ouderen.',
      },
    ],
    note: 'Claim 2 geldt uitsluitend voor 55+. Geen geautoriseerde EU-comboclaim voor zink+creatine. PMID 33865376 (magnesium-slaap) mag niet aan creatine gekoppeld worden.',
  },
  ashwagandha: {
    ingredient: 'Ashwagandha',
    comparisonPath: '/beste/ashwagandha',
    status: 'on_hold',
    verified: true,
    claims: [],
    supportingEvidence: [],
    note: 'GEEN goedgekeurde EFSA-claim, alle claims on-hold. Alleen gebruiken met disclaimer (on-hold, ingediend, aannemelijk). VWS overweegt verbod, besluit medio 2026. Niet opnemen in Foundation Stack.',
  },
  melatonine: {
    ingredient: 'Melatonine',
    comparisonPath: null,
    status: 'forbidden',
    verified: true,
    claims: [],
    supportingEvidence: [],
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
