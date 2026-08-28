import type {
  DoseringPerDagdosis,
  EfsaClaimId,
  IngredientClaimKey,
  SupplementCategory,
} from "@/types/supplement";

/**
 * De vijf onderdelen van de PS-Score.
 *
 * Let op het onderscheid bij claims — het zijn twee verschillende vragen:
 *  - `claimStance` (een toestand, geen punten): mág dit product de claims
 *    voeren die eraan gekoppeld zijn? Dat is een drempel, geen gradient.
 *  - `claimdekking` (wel punten): hoeveel van de erkende EU-claims die vóór
 *    deze stof bestaan, ontsluit déze dagdosering? Dat is wél een gradient —
 *    720 mg EPA+DHA met 130 mg DHA haalt de hartclaim maar niet de twee
 *    DHA-claims, en dat verschil is echt.
 */
export type ScoreComponentId =
  | "claimdekking"
  | "dosering"
  | "vorm"
  | "transparantie"
  | "toetsing";

export type BioavailabilityTier = "hoog" | "goed" | "gemiddeld" | "laag";

/**
 * Vier etiketfeiten die iedereen op de verpakking kan nalezen. Bewust
 * objectief: geen oordeel over merk, verhaal of vormgeving.
 */
export interface LabelFacts {
  /** Staat de werkzame stof in een getal op het etiket (mg elementair, mg EPA/DHA, g)? */
  werkzameStofGekwantificeerd: boolean;
  /** Staat er een expliciete dagdosering (aantal eenheden per dag)? */
  dagdoseringVermeld: boolean;
  /** Bij complexen/blends: is de verdeling per vorm gekwantificeerd? Bij één vorm: waar. */
  samenstellingUitgesplitst: boolean;
  /** Proprietary blend — totaalgewicht wel, verdeling niet. */
  proprietaryBlend: boolean;
}

/**
 * De invoer van computeTrustScore(). DE AFFILIATE-FIREWALL: dit type bevat
 * geen prijs, geen retailer, geen affiliateSlug en geen commissie. Die velden
 * zijn niet *bereikbaar* vanuit de scorefunctie, en de firewall-test bewaakt
 * dat de map src/lib/supplement-score/ ze ook niet importeert.
 */
export interface TrustScoreInput {
  category: SupplementCategory;
  werkzameStof: IngredientClaimKey;
  doseringPerDagdosis: DoseringPerDagdosis;
  efsaClaimIds: readonly EfsaClaimId[];
  thirdPartyTested: boolean;
  formKey: string;
  label: LabelFacts;
  certificeringen: readonly string[];
  /**
   * Categorie-specifieke kwaliteitsmarkers, per sleutel uit QUALITY_MARKERS.
   * Ontbreekt een sleutel, dan geldt hij als niet vermeld.
   */
  kwaliteitsmarkers: Readonly<Record<string, boolean>>;
  /**
   * Ingevuld wanneer de werkzame dagdosis niet uit het etiket is vast te
   * stellen. Claimdekking én dosering vallen dan uit de score in plaats van
   * dat ze een nul krijgen — niet weten is iets anders dan slecht scoren.
   */
  dosisOnzekerReden: string | null;
}

export interface ScoreComponentResult {
  id: ScoreComponentId;
  label: string;
  /** Effectief gewicht ná hernormalisatie, 0–1. Nul wanneer niet te bepalen. */
  weight: number;
  /** 0–100, of null wanneer het onderdeel niet te bepalen is. */
  points: number | null;
  /** Eén zin die uit de data volgt — geen redactionele tekst. */
  reden: string;
}

export type ClaimStance =
  | "voldoet"
  | "voldoet_deels"
  | "voldoet_niet"
  | "geen_erkende_claim"
  | "onbepaald";

export interface TrustScoreResult {
  modelVersion: string;
  /** 0–100, afgerond op één decimaal. */
  total: number;
  components: ScoreComponentResult[];
  determinedCount: number;
  totalCount: number;
  claimStance: ClaimStance;
}

export interface ProductScoreInputs {
  formKey: string;
  label: LabelFacts;
  certificeringen: readonly string[];
  kwaliteitsmarkers: Readonly<Record<string, boolean>>;
  dosisOnzekerReden: string | null;
  /** Prijs per dag in eurocenten bij de dagdosering op het etiket. */
  prijsPerEtiketdagCent: number;
  /** ISO-datum waarop de prijs voor het laatst is nagelopen. */
  prijsGecontroleerdOp: string;
}
