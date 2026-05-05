export type ApprovedClaimsEntry =
  | {
      efsa: string[];
      dosageRequirement?: string;
      notApproved: string[];
      alternativePhrasing: Record<string, string>;
    }
  | {
      status: "on-hold";
      efsa: readonly [];
      disclaimer: string;
      vwsConsultationUrl: string;
      notApproved: string[];
      alternativePhrasing: Record<string, string>;
    };

export const approvedClaims = {
  magnesium: {
    efsa: [
      "Draagt bij tot de normale werking van het zenuwstelsel",
      "Draagt bij tot de normale spierfunctie",
      "Draagt bij tot de vermindering van moeheid en vermoeidheid",
      "Draagt bij tot een normale psychologische functie",
      "Draagt bij tot de normale eiwitsynthese",
    ],
    dosageRequirement:
      "Voor gezondheidsclaims: minimaal 56,25 mg elementair magnesium per dag (15% van de RI)",
    notApproved: ["slaap", "stress", "ontspanning", "kalmerend", "migraine"],
    alternativePhrasing: {
      voor_slaap:
        "magnesium draagt bij tot een normale psychologische functie en tot de vermindering van vermoeidheid",
      tegen_stress:
        "magnesium draagt bij tot normale psychologische functie en tot de normale werking van het zenuwstelsel",
      energie:
        "magnesium draagt bij tot de vermindering van moeheid en vermoeidheid",
    },
  },
  "omega-3": {
    efsa: [
      "EPA en DHA dragen bij tot de normale werking van het hart (bij een dagelijkse inname van 250 mg EPA en DHA)",
      "DHA draagt bij tot de instandhouding van de normale hersenfunctie (bij een dagelijkse inname van 250 mg DHA)",
      "DHA draagt bij tot de instandhouding van een normaal gezichtsvermogen (bij een dagelijkse inname van 250 mg DHA)",
    ],
    dosageRequirement: "Minimaal 250 mg EPA+DHA voor het hart; 250 mg DHA voor hersenen en gezicht",
    notApproved: ["energie", "vermoeidheid", "focus", "cognitief (tenzij gekoppeld aan DHA-formulering)"],
    alternativePhrasing: {
      energie:
        "een voldoende inname van EPA en DHA draagt bij tot de normale werking van het hart; DHA aan de instandhouding van normale hersenfunctie",
      cognitief:
        "DHA draagt bij tot de instandhouding van normale hersenfunctie (bij 250 mg DHA/dag)",
    },
  },
  ashwagandha: {
    status: "on-hold" as const,
    efsa: [],
    disclaimer:
      "Voor dit ingrediënt geldt in de EU de zgn. on-hold-situatie: claims zijn ingediend bij EFSA en nog niet definitief beoordeeld. Ze mogen voorlopig worden gebruikt, maar er zijn geen formeel goedgekeurde gezondheidsclaims. Het ministerie van VWS voert een aparte procedure over de voedselveiligheid van ashwagandha in supplementen.",
    vwsConsultationUrl:
      "https://www.internetconsultatie.nl/voedingssupplementen_en_kruidenpreparaten",
    notApproved: [
      "Concrete gezondheidseffecten als gevestigde feiten (stress, slaap, cortisol, testosteron) zonder nuance",
    ],
    alternativePhrasing: {
      stress_slaap:
        "productvergelijking op extract, standardisatie en transparantie; gezondheidseffecten zijn niet EU-bevestigd",
    },
  },
  zink: {
    efsa: [
      "Draagt bij tot een normale cognitieve functie",
      "Draagt bij tot een normale vruchtbaarheid en voortplanting",
      "Draagt bij tot de instandhouding van een normaal testosterongehalte in het bloed",
      "Draagt bij tot de normale werking van het immuunsysteem",
      "Draagt bij tot de bescherming van cellen tegen oxidatieve stress",
      "Draagt bij tot de normale eiwitsynthese",
    ],
    dosageRequirement: "Hanteer etiket en ADH; langdurig zeer hoge doses kunnen koperopname beïnvloeden",
    notApproved: ["testosteron boosten", "cortisol"],
    alternativePhrasing: {
      testosteron_marketing:
        "draagt bij tot de instandhouding van een normaal testosterongehalte in het bloed",
    },
  },
  melatonine: {
    efsa: [
      "Melatonine draagt bij aan het verminderen van de tijd nodig om in slaap te vallen (in de EU-claimteksten o.a. gekoppeld aan 1 mg, ingesteld vóór het slapen gaan)",
    ],
    dosageRequirement: "Volg het etiket; lage fysiologische doses worden vaak gebruikt in zelfzorgcontext",
    notApproved: ["geneest slapeloosheid", "stress als gegarandeerd effect van melatonine"],
    alternativePhrasing: {
      inslapen: "draagt bij aan het verminderen van de tijd om in slaap te vallen (bij passende dosering volgens claimvoorwaarden)",
    },
  },
  creatine: {
    efsa: [
      "Creatine verhoogt de fysieke prestaties bij opeenvolgende reeksen van zeer korte, intense lichamelijke inspanningen (minimaal 3 g creatine per dag)",
    ],
    dosageRequirement: "Minimaal 3 g/dag voor deze claimcontext; 3–5 g/dag gangbaar in sportcontext",
    notApproved: ["cognitieve gezondheidsclaim EU", "energie (metabool) als claim"],
    alternativePhrasing: {
      cognitie:
        "buiten de erkende EU-claim voor zeer korte, intense inspanning bestaat er geen EU-gezondheidsclaim voor cognitie voor creatine",
    },
  },
  "vitamine-d": {
    efsa: [
      "Draagt bij tot een normale werking van het immuunsysteem",
      "Draagt bij tot de instandhouding van normale botten en tanden",
      "Draagt bij tot een normale spierwerking",
      "Draagt bij tot een normale calciumconcentratie in het bloed",
      "Draagt bij tot de normale opname van calcium en fosfor",
    ],
    dosageRequirement: "Volg ADH en advies van zorgverlener; hogere doses alleen met overleg en waar nodig met bloedonderzoek",
    notApproved: ["testosteron verhogen als supplementclaim", "energie als vitamine-D-claim"],
    alternativePhrasing: {
      testosteron:
        "epidemiologisch komen lagere 25(OH)D-waarden vaker samen met lagere testosteronwaarden; vitamine D draagt o.a. bij tot normale spierwerking en immuunsysteem",
    },
  },
  eiwitpoeder: {
    efsa: [
      "Eiwitten dragen bij aan de groei in spiermassa",
      "Eiwitten dragen bij aan het instandhouden van spiermassa",
      "Eiwitten dragen bij aan het instandhouden van normale botten",
    ],
    dosageRequirement: "Claims zijn gekoppeld aan voldoende eiwitinname en context van o.a. training",
    notApproved: ["genezing", "vervanging van medische behandeling"],
    alternativePhrasing: {},
  },
} satisfies Record<string, ApprovedClaimsEntry>;

export type ApprovedClaimKey = keyof typeof approvedClaims;

export function isApprovedClaim(supplement: string, claim: string): boolean {
  const entry = approvedClaims[supplement as ApprovedClaimKey];
  if (!entry || !("efsa" in entry) || entry.efsa.length === 0) return false;
  const normalized = claim.toLowerCase().trim();
  return entry.efsa.some((line) => {
    const l = line.toLowerCase();
    return normalized.includes(l) || l.includes(normalized);
  });
}

export function getAlternativePhrasing(
  supplement: string,
  phraseKey: string,
): string {
  const entry = approvedClaims[supplement as ApprovedClaimKey];
  if (!entry || !("alternativePhrasing" in entry)) return phraseKey;
  const map = entry.alternativePhrasing as Record<string, string>;
  return map[phraseKey] ?? phraseKey;
}
