import type { DosageUnit, SupplementCategory } from "@/types/supplement";
import type {
  BioavailabilityTier,
  ScoreComponentId,
} from "@/types/supplement-score";

/**
 * PS-SCORE — het model achter elk getal op /supplementen.
 *
 * Drie eigenschappen maken dit anders dan de handmatige score op /beste/*:
 *
 * 1. BEREKEND, NIET INGETYPT. Elk onderdeel volgt uit een feit dat op het
 *    etiket staat of uit `approved-claims.ts`. "Waarom deze score" is daarmee
 *    gratis: de subscores zijn de uitleg.
 * 2. GEVERSIONEERD, zoals RULES_VERSION bij de Leefstijlcheck. Wijzigt het
 *    model, dan wijzigt de versie en herberekent alles.
 * 3. PRIJSVRIJ. Prijs zit bewust NIET in de kwaliteitsscore. Anders zijn
 *    kwaliteitsrang en kostenrang twee metingen van deels hetzelfde, en kan
 *    de lezer ze niet meer tegen elkaar afwegen. Prijs krijgt een eigen rang.
 *
 * Wijkt hiermee bewust af van de gewichtentabel in
 * docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C3, die prijs voor 20%
 * in de score legde.
 */
export const PS_SCORE_MODEL_VERSION = "1.1.0";

export const PS_SCORE_MODEL_DATE = "2026-08-27";

export const SCORE_COMPONENT_LABELS: Record<ScoreComponentId, string> = {
  claimdekking: "Dekking van erkende EU-claims",
  dosering: "Dosering t.o.v. onderzoeksdosis",
  vorm: "Vorm en opneembaarheid",
  transparantie: "Etikettransparantie",
  toetsing: "Onafhankelijke toetsing",
};

/** Gewichten tellen op tot 1. Valt een onderdeel uit, dan hernormaliseert de rest. */
export const SCORE_WEIGHTS: Record<ScoreComponentId, number> = {
  claimdekking: 0.2,
  dosering: 0.25,
  vorm: 0.25,
  transparantie: 0.2,
  toetsing: 0.1,
};

export const TIER_POINTS: Record<BioavailabilityTier, number> = {
  hoog: 100,
  goed: 78,
  gemiddeld: 55,
  laag: 25,
};

export const TIER_LABELS: Record<BioavailabilityTier, string> = {
  hoog: "Hoog opneembaar",
  goed: "Goed opneembaar",
  gemiddeld: "Gemiddeld opneembaar",
  laag: "Laag opneembaar",
};

/** Punten per etiketfeit; samen 100. */
export const LABEL_POINTS = {
  werkzameStofGekwantificeerd: 30,
  dagdoseringVermeld: 25,
  samenstellingUitgesplitst: 25,
  geenProprietaryBlend: 20,
} as const;

/**
 * Punten voor onafhankelijke toetsing; samen maximaal 100.
 *
 * WAT TELT ALS KEURMERK — de regel die dubbeltelling voorkomt.
 * Merkgebonden grondstofstandaarden (Creapure®, Quali-D®, L-OptiZinc®) tellen
 * hier mee: de chemische vorm eronder is gewoon monohydraat, cholecalciferol
 * of zinkmethionine, dus het onderdeel "vorm" beloont ze niet al.
 * Gestandaardiseerde plantextracten (KSM-66®, Sensoril®) tellen hier NIET mee:
 * bij een botanical ís de standaardisatie de vorm, en die wordt al in het
 * vorm-onderdeel gewaardeerd. Eén feit hoort één keer te scoren.
 */
export const TOETSING_POINTS = {
  thirdPartyTested: 70,
  perKeurmerk: 30,
} as const;

export interface QualityMarker {
  key: string;
  label: string;
  /** Waarom deze marker juist voor deze categorie iets zegt. */
  waarom: string;
  punten: number;
}

/**
 * KWALITEITSMARKERS PER CATEGORIE — de toetsingsfeiten die alleen in sommige
 * categorieen bestaan.
 *
 * Ze tellen mee in het onderdeel "Onafhankelijke toetsing", maar alleen waar
 * ze van toepassing zijn: creatinepoeder oxideert niet, dus daar een
 * oxidatiewaarde eisen zou het onterecht straffen. Zelfde principe als bij de
 * onderdelen zelf — niet van toepassing is geen nul, de noemer krimpt mee.
 */
export const QUALITY_MARKERS: Record<SupplementCategory, QualityMarker[]> = {
  "omega-3": [
    {
      key: "oxidatiewaarde",
      label: "Oxidatiewaarde vermeld (TOTOX, PV of AV)",
      waarom:
        "Visolie oxideert vanaf het moment dat hij geperst is. Een geoxideerde olie ruikt niet alleen ranzig, hij levert ook minder werkzame EPA en DHA. De vrijwillige GOED-standaard houdt TOTOX 26 aan als bovengrens. Zonder gepubliceerde waarde is versheid niet te controleren.",
      punten: 50,
    },
    {
      key: "verontreinigingstest",
      label: "Getest op zware metalen en dioxines",
      waarom:
        "Vette zeevis stapelt kwik, dioxines en PCB's op. Verordening (EU) 2023/915 stelt grenswaarden, maar publicatie van de meetwaarde per batch is vrijwillig.",
      punten: 30,
    },
  ],
  eiwitpoeder: [
    {
      key: "verontreinigingstest",
      label: "Getest op zware metalen",
      waarom:
        "Plantaardige eiwitten nemen zware metalen op uit de bodem; bij erwt- en rijsteiwit is cadmium het aandachtspunt. Bij wei speelt dit nauwelijks, maar de test is voor beide categorieen dezelfde.",
      punten: 30,
    },
  ],
  magnesium: [],
  "vitamine-d": [],
  zink: [],
  creatine: [],
  ashwagandha: [
    {
      key: "verontreinigingstest",
      label: "Getest op zware metalen en pesticiden",
      waarom:
        "Ashwagandha is een wortelextract; bodemverontreiniging en gewasbeschermingsmiddelen komen mee in het eindproduct. Voor botanicals is dit de belangrijkste toets die er is.",
      punten: 30,
    },
  ],
  melatonine: [],
};

export function getQualityMarkers(category: SupplementCategory): QualityMarker[] {
  return QUALITY_MARKERS[category] ?? [];
}

export type EvidenceDoseMeasure =
  /** Dagdosering die als elementair/werkzaam gehalte op het etiket staat. */
  | "dagdosis-elementair"
  /** Dagdosering van het extract of eiwit zelf. */
  | "dagdosis"
  /** Som van EPA en DHA per dag. */
  | "epa_dha";

export interface EvidenceDose {
  /**
   * Laagste dagdosering waarbij het aangehaalde onderzoek effect laat zien.
   * Daaronder schaalt de score lineair mee.
   */
  onderzoeksdosis: number;
  /**
   * Bovengrens. Waar EFSA een aanvaardbare bovengrens voor suppletie hanteert
   * is dat die grens; anders de hoogste gangbare onderhoudsdosis. Erboven
   * volgt aftrek — hoger is niet beter.
   */
  bovengrens: number;
  eenheid: DosageUnit;
  meet: EvidenceDoseMeasure;
  /** Wat er precies gemeten wordt, in gewone taal. */
  omschrijving: string;
  bron: string;
}

/**
 * Per categorie de dosering waartegen we meten. Dit is bewust NIET de
 * EFSA-claimdrempel: die ligt bij mineralen op 15% van de referentie-inname en
 * wordt door elk serieus product gehaald. De claimdrempel bepaalt of een
 * product de claim mág voeren; deze waarde bepaalt of de dosering in de buurt
 * komt van wat het onderzoek gebruikte.
 */
export const EVIDENCE_DOSE: Record<SupplementCategory, EvidenceDose | null> = {
  magnesium: {
    onderzoeksdosis: 200,
    bovengrens: 250,
    eenheid: "mg",
    meet: "dagdosis-elementair",
    omschrijving: "elementair magnesium per dag",
    bron: "Doseringen in de aangehaalde meta-analyses (PMID 33865376, 28445426); EFSA hanteert 250 mg/dag als aanvaardbare bovengrens voor magnesium uit supplementen.",
  },
  "omega-3": {
    onderzoeksdosis: 1000,
    bovengrens: 5000,
    eenheid: "mg",
    meet: "epa_dha",
    omschrijving: "EPA + DHA per dag",
    bron: "Cardiometabole trials in Calder PC, Ann Nutr Metab 2020 (PMID 31808863) doseren 1 g EPA+DHA per dag en hoger. In model 1.0.0 stond hier 500 mg; dat was de algemene innameaanbeveling (Gezondheidsraad 200 mg, EFSA-claimdrempel 250 mg) en niet de dosering waarbij het aangehaalde onderzoek effect laat zien. EFSA acht aanvullende inname tot 5 g per dag veilig.",
  },
  "vitamine-d": {
    onderzoeksdosis: 20,
    bovengrens: 100,
    eenheid: "ug",
    meet: "dagdosis-elementair",
    omschrijving: "vitamine D3 per dag",
    bron: "Bischoff-Ferrari HA e.a., BMJ 2012 (PMID 22833605); EFSA hanteert 100 µg/dag als aanvaardbare bovengrens voor volwassenen.",
  },
  zink: {
    onderzoeksdosis: 15,
    bovengrens: 25,
    eenheid: "mg",
    meet: "dagdosis-elementair",
    omschrijving: "elementair zink per dag",
    bron: "Haase H, Rink L, Nutrients 2014 (PMID 24922193); EFSA hanteert 25 mg/dag als aanvaardbare bovengrens.",
  },
  creatine: {
    onderzoeksdosis: 3,
    bovengrens: 5,
    eenheid: "g",
    meet: "dagdosis-elementair",
    omschrijving: "creatine per dag",
    bron: "EFSA-claimvoorwaarde 3 g/dag; ISSN position stand (PMID 28615996) voor 3–5 g als onderhoudsdosis.",
  },
  ashwagandha: {
    onderzoeksdosis: 300,
    bovengrens: 600,
    eenheid: "mg",
    meet: "dagdosis",
    omschrijving: "gestandaardiseerd wortelextract per dag",
    bron: "Doseringen die in gepubliceerd KSM-66-onderzoek terugkomen. Let op: voor ashwagandha bestaat geen Europees erkende gezondheidsclaim.",
  },
  eiwitpoeder: {
    onderzoeksdosis: 20,
    bovengrens: 40,
    eenheid: "g",
    meet: "dagdosis",
    omschrijving: "eiwit per portie",
    bron: "Portiegroottes waarbij onderzoek naar spiereiwitsynthese een plateau laat zien. Op eiwit als zodanig rust geen EU-gezondheidsclaim.",
  },
  melatonine: null,
};

export interface FormDefinition {
  label: string;
  tier: BioavailabilityTier;
  onderbouwing: string;
}

/**
 * Vormregistratie per categorie. De inschatting per vorm staat hier één keer,
 * publiceerbaar en na te lezen — niet 22 keer met de hand bij een product.
 */
export const FORM_BIOAVAILABILITY: Record<
  SupplementCategory,
  Record<string, FormDefinition>
> = {
  magnesium: {
    bisglycinaat: {
      label: "Bisglycinaat",
      tier: "hoog",
      onderbouwing:
        "Aminozuurchelaat; wordt als geheel opgenomen en geeft daardoor weinig darmklachten bij een gelijke elementaire dosis.",
    },
    citraat: {
      label: "Citraat",
      tier: "goed",
      onderbouwing:
        "Organisch gebonden en goed oplosbaar; hoger opneembaar dan oxide, laxerender dan bisglycinaat.",
    },
    "complex-zonder-oxide": {
      label: "Complex zonder oxide",
      tier: "goed",
      onderbouwing:
        "Meerdere organische vormen naast elkaar. Dekt breed, maar zonder uitgesplitste verdeling is de opneembaarheid niet exact te herleiden.",
    },
    tauraat: {
      label: "Tauraat",
      tier: "goed",
      onderbouwing: "Organisch gebonden aan taurine; vergelijkbaar met citraat qua opname.",
    },
    oxide: {
      label: "Oxide",
      tier: "laag",
      onderbouwing:
        "Hoog elementair gehalte, maar een klein deel wordt daadwerkelijk opgenomen. Vaak gekozen om de mg op het etiket, niet om het effect.",
    },
  },
  "omega-3": {
    "triglyceride-vloeibaar": {
      label: "Triglyceride (vloeibaar)",
      tier: "hoog",
      onderbouwing:
        "Natuurlijke triglyceridevorm; hoger opneembaar dan ethylester en per theelepel exact te doseren.",
    },
    "triglyceride-softgel": {
      label: "Triglyceride (softgel)",
      tier: "hoog",
      onderbouwing:
        "Zelfde opneembaarheid als vloeibaar, verpakt per capsule. Dosering ligt vast op wat de capsule bevat.",
    },
    ethylester: {
      label: "Ethylester",
      tier: "gemiddeld",
      onderbouwing:
        "Goedkoper te produceren; opname ligt lager dan bij de triglyceridevorm, zeker zonder vetrijke maaltijd.",
    },
  },
  "vitamine-d": {
    "d3-met-vetdrager": {
      label: "D3 met vetdrager",
      tier: "hoog",
      onderbouwing:
        "Cholecalciferol opgelost in olie. Vitamine D is vetoplosbaar, dus een vetdrager maakt de opname minder afhankelijk van de maaltijd.",
    },
    "d3-cholecalciferol": {
      label: "D3 (cholecalciferol)",
      tier: "goed",
      onderbouwing:
        "De vorm die het lichaam zelf aanmaakt; verhoogt de bloedspiegel effectiever dan D2.",
    },
    "d2-ergocalciferol": {
      label: "D2 (ergocalciferol)",
      tier: "laag",
      onderbouwing: "Plantaardig, maar verhoogt de bloedspiegel minder en minder langdurig dan D3.",
    },
  },
  zink: {
    zinkmethionine: {
      label: "Zinkmethionine",
      tier: "hoog",
      onderbouwing: "Organisch gebonden aan methionine; van de zinkvormen het best opneembaar.",
    },
    "l-optizinc": {
      label: "L-OptiZinc® (zinkmethionine)",
      tier: "hoog",
      onderbouwing:
        "Gepatenteerde zinkmethionine met eigen absorptieonderzoek; dezelfde chemische vorm, met vastgelegde samenstelling.",
    },
    zinkbisglycinaat: {
      label: "Zinkbisglycinaat",
      tier: "hoog",
      onderbouwing: "Aminozuurchelaat; goed opneembaar en mild voor de maag.",
    },
    zinkpicolinaat: {
      label: "Zinkpicolinaat",
      tier: "goed",
      onderbouwing:
        "Goed onderzochte organische vorm; in vergelijkend onderzoek iets lager dan methionine.",
    },
    zinkgluconaat: {
      label: "Zinkgluconaat",
      tier: "gemiddeld",
      onderbouwing: "Breed toegepast en betaalbaar; opname ligt onder die van de chelaatvormen.",
    },
    zinkoxide: {
      label: "Zinkoxide",
      tier: "laag",
      onderbouwing: "Slecht oplosbaar; een groot deel verlaat het lichaam ongebruikt.",
    },
  },
  creatine: {
    "monohydraat-micronized": {
      label: "Monohydraat (micronized)",
      tier: "hoog",
      onderbouwing:
        "Zelfde molecuul, fijner gemalen. Lost beter op; dat verandert het comfort, niet de werkzaamheid.",
    },
    monohydraat: {
      label: "Monohydraat",
      tier: "goed",
      onderbouwing:
        "De onderzochte vorm, zonder vermelde maalgraad of zuiverheidsherkomst.",
    },
    hcl: {
      label: "Creatine HCl",
      tier: "gemiddeld",
      onderbouwing:
        "Beter oplosbaar, maar geen aangetoonde meerwaarde boven monohydraat bij een gelijke dosis.",
    },
  },
  ashwagandha: {
    "ksm-66": {
      label: "KSM-66® extract",
      tier: "hoog",
      onderbouwing:
        "Gestandaardiseerd op ≥5% withanoliden en het extract waarmee het meeste gepubliceerde onderzoek is gedaan.",
    },
    sensoril: {
      label: "Sensoril® extract",
      tier: "hoog",
      onderbouwing: "Gestandaardiseerd extract met eigen onderzoekslijn; hoger withanolidegehalte, andere plantdelen.",
    },
    "gestandaardiseerd-extract": {
      label: "Gestandaardiseerd extract",
      tier: "goed",
      onderbouwing: "Withanolidegehalte vastgelegd, maar zonder de onderzoekslijn van KSM-66 of Sensoril.",
    },
    "extract-plus-heel-kruid": {
      label: "Extract + heel kruid",
      tier: "gemiddeld",
      onderbouwing:
        "Breder plantprofiel, maar het aandeel gestandaardiseerd extract is niet los te vergelijken met onderzoeksdoseringen.",
    },
    "heel-kruid": {
      label: "Heel kruid (poeder)",
      tier: "laag",
      onderbouwing: "Niet gestandaardiseerd; het withanolidegehalte varieert per oogst.",
    },
  },
  eiwitpoeder: {
    "whey-isolaat": {
      label: "Whey-isolaat",
      tier: "hoog",
      onderbouwing:
        "Hoogste eiwitgehalte per gram en het volledige aminozuurprofiel inclusief leucine; nauwelijks lactose.",
    },
    "whey-blend": {
      label: "Whey-blend",
      tier: "hoog",
      onderbouwing:
        "Isolaat, hydrolysaat en concentraat naast elkaar; hetzelfde aminozuurprofiel, gemengd opnametempo.",
    },
    caseine: {
      label: "Caseïne",
      tier: "goed",
      onderbouwing: "Compleet profiel, maar trager verteerbaar — gunstiger rond de nacht dan rond training.",
    },
    erwteneiwit: {
      label: "Erwteneiwit",
      tier: "goed",
      onderbouwing:
        "Compleet aminozuurprofiel, maar lager leucinegehalte per gram dan wei; vraagt een iets grotere portie.",
    },
    collageen: {
      label: "Collageen",
      tier: "laag",
      onderbouwing:
        "Onvolledig aminozuurprofiel — mist tryptofaan en is arm aan leucine; ongeschikt als eiwitbron voor spiermassa.",
    },
  },
  melatonine: {},
};

export function getFormDefinition(
  category: SupplementCategory,
  formKey: string,
): FormDefinition | null {
  return FORM_BIOAVAILABILITY[category]?.[formKey] ?? null;
}
