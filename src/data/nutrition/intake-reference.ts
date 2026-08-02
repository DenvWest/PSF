/**
 * Referentietabel voor de 5 nutriënten met een interventiepad (/beste/*).
 * Productkennis — geen persoonsdata.
 * De enige plek met referentiecijfers; hardcode deze NIET in de engine.
 *
 * Drempelgetallen zijn INDICATIEF — vuistregels, geen gevalideerde norm.
 * De UI noemt ze daarom expliciet "vuistregel", niet "richtlijn".
 * TODO vervang door gebronde grenzen (Gezondheidsraad ADH / EFSA DRV / Voedingscentrum)
 *      vóór er weer norm-/richtlijn-taal in de UI terugkeert.
 */

import type { IngredientClaimKey } from "@/data/approved-claims";
import { buildLifestyleAction } from "@/data/nutrition/portion-dictionary";

export type NutrientId =
  | "protein"
  | "omega3"
  | "magnesium"
  | "vitamin_d"
  | "zinc";

/** 1 = laag, 4 = hoog. Promotie van de vertrouwens-annotatie bij `thresholds` naar een getypeerd veld. */
export type NutrientConfidence = 1 | 2 | 3 | 4;

/**
 * Of een bloedbepaling deze schatting harder maakt — dat verschilt per stof.
 * "later bloedonderzoek" is dus geen algemeen antwoord; alleen vitamine D wint er echt mee.
 */
export type BloodMarkerValue = "improves" | "limited" | "none";

export interface NutrientBloodMarker {
  value: BloodMarkerValue;
  /** Waarom een prik hier wel/niet iets toevoegt. Gebruikersgerichte formulering. */
  why: string;
}

export interface NutrientThresholds {
  /**
   * Signaalwaarde < belowMax → band "below".
   * TODO review indicatieve grens met voedingskundige bron.
   */
  belowMax: number;
  /**
   * Signaalwaarde >= meetsMin → band "meets".
   * Waarden daartussen → band "around".
   * TODO review indicatieve grens met voedingskundige bron.
   */
  meetsMin: number;
}

export interface NutrientReference {
  id: NutrientId;
  /** Nederlandse gebruikerslabel. */
  label: string;
  /**
   * Beschrijving van de richtlijn — geen normatieve waarde, wél herkenbaar.
   * Gebruikersgerichte formulering als context in de output-zin.
   */
  referenceLabel: string;
  /** Bestaand /beste/-pad; voor de supplement-gate (F2) en link-generatie. */
  comparisonPath: string;
  /** Frequentie-grenzen voor band-bepaling (indicatief, zie TODO). */
  thresholds: NutrientThresholds;
  /**
   * Leefstijl-eerst voedingsactie (F2). Informatief en concreet — geen statuswoorden.
   * Verschijnt altijd vóór een eventuele supplement-suggestie (priority 1).
   */
  lifestyleAction: string;
  /**
   * Exacte sleutel in approvedClaims (src/data/approved-claims.ts).
   * Gebruikt door getUsableClaims() in de supplement-gate (F2).
   * Neem nooit aan — verifieer tegen de werkelijke approvedClaims-keys.
   */
  claimKey: IngredientClaimKey;
  /**
   * Hoe zeker deze schatting is. Waarde volgt de vertrouwens-annotatie in de
   * `thresholds`-comment hieronder — die comment blijft de onderbouwing.
   */
  confidence: NutrientConfidence;
  /** Waarom die zekerheid, in één zin voor de gebruiker. Geen statusclaim. */
  confidenceWhy: string;
  bloodMarker: NutrientBloodMarker;
}

export const nutrientReferences: Record<NutrientId, NutrientReference> = {
  protein: {
    id: "protein",
    label: "Eiwit",
    referenceLabel: "eiwit bij elke maaltijd",
    comparisonPath: "/beste/eiwitpoeder",
    thresholds: {
      // VOORSTEL (niet bevestigd) — vertrouwen: HOOG. Dit is een spreidings-
      // drempel (eetmomenten/dag), geen dosis-drempel — andere as dan de
      // g/kg-berekening in protein-target.ts. Sluit aan bij dezelfde bron die
      // daar al staat: PROT-AGE Study Group (2013) beveelt 3-4 eiwitrijke
      // eetmomenten/dag aan voor optimale eiwitsynthese bij 40+. belowMax=2/
      // meetsMin=3 volgt die verdeling. Check tegen de PROT-AGE-brontekst zelf
      // (nu alleen indirect via protein-target.ts geciteerd).
      belowMax: 2,
      meetsMin: 3,
    },
    lifestyleAction: buildLifestyleAction("protein"),
    claimKey: "eiwitpoeder",
    confidence: 4,
    confidenceWhy:
      "De vraag telt eetmomenten, en die verdeling over de dag is van deze vijf het best onderbouwd.",
    bloodMarker: {
      value: "none",
      why: "Er bestaat geen bloedmarker voor hoeveel eiwit je binnenkrijgt.",
    },
  },
  omega3: {
    id: "omega3",
    label: "Omega-3",
    referenceLabel: "2× vette vis per week",
    comparisonPath: "/beste/omega-3-supplement",
    thresholds: {
      // VOORSTEL (niet bevestigd) — vertrouwen: REDELIJK. Gezondheidsraad
      // Richtlijnen goede voeding (2015) noemt 1×/week (bij voorkeur vette)
      // vis als basis; internationale hart-richtlijnen (bv. AHA) noemen 2×/
      // week vette vis voor cardiovasculair voordeel. De huidige grens kiest
      // de ruimere kant (meetsMin=2) — dat is een interpretatiekeuze, geen
      // exacte Gezondheidsraad-cijfer. Controleer of 1×/week al als "around"
      // of als "meets" moet gelden.
      belowMax: 1,
      meetsMin: 2,
    },
    lifestyleAction: buildLifestyleAction("omega3"),
    claimKey: "omega3",
    confidence: 3,
    confidenceWhy:
      "Vette vis per week is een bruikbare maat; waar de grens tussen 1× en 2× ligt, is een interpretatiekeuze.",
    bloodMarker: {
      value: "limited",
      why: "De omega-3-index is een goede maat, maar geen standaardbepaling bij een Nederlands huisartsenlab.",
    },
  },
  magnesium: {
    id: "magnesium",
    label: "Magnesium",
    referenceLabel: "dagelijks bladgroenten, noten of peulvruchten",
    comparisonPath: "/beste/magnesium",
    thresholds: {
      // VOORSTEL (niet bevestigd) — vertrouwen: LAAG, meeste aandacht nodig.
      // "Porties groente/fruit" is een PROXY, geen directe magnesium-maat:
      // Schijf van Vijf's 250 g groente + 2 stuks fruit is een algemene
      // voedingsbasis, niet gekalibreerd op de magnesium-RI (~350 mg/dag
      // mannen, Gezondheidsraad — matcht wel de vuistregel in de lifestyle-
      // copy). Fruit is bovendien over het algemeen een zwakke magnesium-
      // bron; de sterkere bronnen (noten, volkoren, peulvruchten, blad-
      // groenten) zitten niet 1-op-1 in "groente/fruit". Overweeg de
      // onderliggende zelfrapportage-vraag te herzien naar magnesium-
      // specifieke bronnen i.p.v. alleen de grenswaarden te vervangen.
      belowMax: 2,
      meetsMin: 4,
    },
    lifestyleAction: buildLifestyleAction("magnesium"),
    claimKey: "magnesium",
    confidence: 1,
    confidenceWhy:
      "Je band komt uit een groente-en-fruit-telling, terwijl noten, volkoren en peulvruchten de sterkere bronnen zijn.",
    bloodMarker: {
      value: "limited",
      why: "Serum-magnesium wordt constant gehouden ten koste van bot en spier; een normale uitslag bij een krappe voorraad is gewoon.",
    },
  },
  vitamin_d: {
    id: "vitamin_d",
    label: "Vitamine D",
    referenceLabel: "dagelijks buiten (huid aan zonlicht)",
    comparisonPath: "/beste/vitamine-d",
    thresholds: {
      // VOORSTEL (niet bevestigd) — vertrouwen: LAAG, zwakste van de vijf.
      // Gezondheidsraad-advies over vitamine D (Evaluatie voedingsnormen
      // vitamine D, 2012) is primair gericht op suppletie voor risicogroepen
      // (65+, gesluierd, donkere huid, weinig buiten), niet op een gevalideerde
      // "keer buiten per week"-frequentie. Aanmaak hangt sterk af van duur,
      // tijdstip, seizoen en huidoppervlak — een frequentie-telling zonder
      // duur/seizoen is een zwakke proxy. De copy zelf splitst al zomer/winter
      // (portion-dictionary.ts); overweeg de drempel op dezelfde as te zetten
      // i.p.v. alleen "×/week".
      belowMax: 1,
      meetsMin: 3,
    },
    lifestyleAction: buildLifestyleAction("vitamin_d", { season: "summer" }),
    claimKey: "vitamineD",
    confidence: 1,
    confidenceWhy:
      "Aanmaak hangt af van duur, tijdstip en seizoen — hoe vaak je buiten komt zegt daar weinig over.",
    bloodMarker: {
      value: "improves",
      why: "25(OH)D is de standaardbepaling en zegt echt iets over je voorraad — de enige van de vijf waar een prik concreet iets toevoegt.",
    },
  },
  zinc: {
    id: "zinc",
    label: "Zink",
    referenceLabel: "dagelijks vlees, vis of peulvruchten",
    comparisonPath: "/beste/zink",
    thresholds: {
      // VOORSTEL (niet bevestigd) — vertrouwen: MATIG. Gezondheidsraad/EFSA
      // RI voor zink bij volwassen mannen ligt rond 9-11 mg/dag (matcht de
      // vuistregel in de lifestyle-copy). Dat een dagelijkse zink-bron-portie
      // "below" en twee "meets" is, is een plausibele maar niet scherp
      // gebronde vertaalslag van mg naar portiefrequentie — vergelijkbaar in
      // zwakte met omega-3, met de mg-vuistregel er expliciet naast als vangnet.
      belowMax: 1,
      meetsMin: 2,
    },
    lifestyleAction: buildLifestyleAction("zinc"),
    claimKey: "zink",
    confidence: 2,
    confidenceWhy:
      "De mg-vuistregel is bekend; de vertaling daarvan naar porties per week is plausibel maar niet scherp gebrond.",
    bloodMarker: {
      value: "none",
      why: "Plasma-zink daalt bij elke ontsteking en na een maaltijd, los van je voorraad.",
    },
  },
};

export const NUTRIENT_IDS: NutrientId[] = [
  "protein",
  "omega3",
  "magnesium",
  "vitamin_d",
  "zinc",
];
