import {
  approvedClaims,
  getUsableClaims,
  type IngredientClaimKey,
} from "@/data/approved-claims";
import type { DomainScores } from "@/lib/intake-engine";
import {
  nutrientReferences,
  type BloodMarkerValue,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import type { RecommendationTriggerReason } from "@/types/recommendation";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * Legt uit HOE een oordeel tot stand kwam — geen tweede oordeel, geen advies.
 * Vier regels: welk signaal, hoe zeker dat signaal is, of een bloedwaarde het
 * harder maakt, en de goedgekeurde claim (woordelijk, of de geen-claim-regel).
 *
 * Bron is uitsluitend wat al is vastgelegd bij het oordeel zelf
 * (`StoredSupplementVerdict.basedOn`, de reproduceerbaarheids-snapshot) plus
 * statische referentiedata. Geen nieuwe meting, geen status-taal
 * ("tekort"/"gebrek") — zie COMPLIANCE.md, de inname-vs-status-grens.
 */
export type AfleidingView = {
  signaalLine: string;
  zekerheidLine: string | null;
  /** Los van zekerheidLine — voor een visuele weergave (dots/balkjes), 1-4. */
  confidence: number | null;
  bloedLine: string | null;
  claimLine: string;
};

const NUTRIENT_BY_INGREDIENT: Partial<Record<IngredientClaimKey, NutrientId>> = {
  magnesium: "magnesium",
  omega3: "omega3",
  vitamineD: "vitamin_d",
  zink: "zinc",
  eiwitpoeder: "protein",
};

const DOMAIN_LABEL: Record<keyof DomainScores, string> = {
  sleep_score: "slaapscore",
  energy_score: "energiescore",
  stress_score: "stressscore",
  nutrition_score: "voedingsscore",
  movement_score: "beweegscore",
  recovery_score: "herstelscore",
  connection_score: "verbindingsscore",
};

/**
 * Signaal-zinnen per DeficiencySignal. Elke zin is exact wat het signaal
 * meet — niet meer. `creatine_signal` en `protein_gap_signal` zijn de twee
 * die inname en beweegprofiel al combineren (intake-engine.ts): lage inname
 * telt hier alleen mee als je beweegcheck ook belasting of traag herstel
 * laat zien. `magnesium_signal` en `omega3_deficiency` komen uitsluitend uit
 * slaap- resp. voedingsvragen, zonder beweegkoppeling — dat verschil staat
 * er expliciet bij, in plaats van het gelijk te trekken.
 */
const SIGNAL_SENTENCE: Partial<Record<string, string>> = {
  magnesium_signal:
    "Je check laat een magnesiumsignaal zien, uit je slaapvragen — inslapen of herstel dat achterblijft.",
  omega3_deficiency:
    "Je check laat zien dat vette vis zelden op je bord staat.",
  creatine_signal:
    "Je beweegcheck laat trainingsbelasting zien terwijl je herstel achterblijft — die combinatie is het signaal, niet de belasting alleen.",
  protein_gap_signal:
    "Je eiwitinname is laag, en je beweegcheck laat trainen of traag fysiek herstel zien — die twee samen zijn het signaal, niet de inname alleen.",
  cortisol_risk: "Je check laat een patroon van aanhoudende spanning zien.",
  melatonine_signal: "Je check laat een inslaappatroon zien dat met je stressniveau samenhangt.",
};

const HUB_RULE_SENTENCE: Partial<Record<string, string>> = {
  creatine_custom_matcher:
    "Je beweegcheck laat trainingsbelasting zien terwijl je herstel achterblijft — die combinatie is het signaal, niet de belasting alleen.",
  protein_gap_signal:
    "Je eiwitinname is laag, en je beweegcheck laat trainen of traag fysiek herstel zien — die twee samen zijn het signaal, niet de inname alleen.",
  vitamin_d_fallback: "Vitamine D staat los van een specifiek signaal — in Nederland is de aanmaak sowieso beperkt.",
};

function triggerSentence(reason: RecommendationTriggerReason): string {
  switch (reason.type) {
    case "signal":
      return SIGNAL_SENTENCE[reason.signal] ?? `Signaal uit je check: ${reason.signal}.`;
    case "domain_below":
      return `Je ${DOMAIN_LABEL[reason.domain]} staat onder de ${reason.threshold} — dat is de reden om dit te bekijken.`;
    case "profile":
      return `Dit voorstel hoort bij je profiel “${reason.label}”.`;
    case "hub_legacy":
      return HUB_RULE_SENTENCE[reason.rule] ?? "Een regel in je check wijst hierop.";
    case "pillar":
      return "Dit hoort bij het domein waar je nu op focust.";
  }
}

function signaalLine(verdict: StoredSupplementVerdict): string {
  const triggeredBy = verdict.basedOn?.triggeredBy ?? [];
  if (triggeredBy.length === 0) {
    return "Je check laat geen signaal zien dat dit gat toont — dat scheelt je geld.";
  }
  return triggeredBy.map(triggerSentence).join(" ");
}

function zekerheidLine(ingredientKey: IngredientClaimKey): string | null {
  const nutrientId = NUTRIENT_BY_INGREDIENT[ingredientKey];
  if (!nutrientId) {
    return null;
  }
  const ref = nutrientReferences[nutrientId];
  return `Zekerheid ${ref.confidence} van 4 — ${ref.confidenceWhy}`;
}

function confidenceValue(ingredientKey: IngredientClaimKey): number | null {
  const nutrientId = NUTRIENT_BY_INGREDIENT[ingredientKey];
  return nutrientId ? nutrientReferences[nutrientId].confidence : null;
}

function bloedLine(ingredientKey: IngredientClaimKey): string | null {
  const nutrientId = NUTRIENT_BY_INGREDIENT[ingredientKey];
  if (!nutrientId) {
    return null;
  }
  const marker = nutrientReferences[nutrientId].bloodMarker;
  const prefix =
    marker.value === "improves"
      ? "Bloedwaarde maakt dit harder"
      : marker.value === "limited"
        ? "Bloedwaarde: beperkt bruikbaar"
        : "Geen bruikbare bloedwaarde";
  return `${prefix} — ${marker.why}`;
}

function claimLine(ingredientKey: IngredientClaimKey): string {
  const entry = approvedClaims[ingredientKey];
  if (entry.status === "on_hold") {
    return "Geen goedgekeurde EU-claim — de claims hierover staan on-hold bij de beoordeling. Wij vellen dan geen oordeel.";
  }
  if (entry.status === "forbidden") {
    return "Geen goedgekeurde EU-claim, en een reëel verbodsrisico onder de geneesmiddelenwet.";
  }
  const claims = getUsableClaims(ingredientKey);
  if (claims.length === 0) {
    return "Hier bestaat geen goedgekeurde gezondheidsclaim voor. Wat je vergelijkt is inname en praktijk — prijs per dag, dosering per portie — geen belofte over wat het met je doet.";
  }
  return `De claim die mag: "${claims[0].text}" — de goedgekeurde EU-formulering, woordelijk. Geen eigen belofte.`;
}

/**
 * Bouwt de afleiding voor één oordeel. Geeft `null` bij oudere rijen zonder
 * bewaarde snapshot (`basedOn`) — dan valt de kaart terug op alleen de
 * bestaande, kortere reden-tekst uit `supplement-verdict-copy.ts`.
 */
export function buildAfleiding(
  ingredientKey: IngredientClaimKey,
  verdict: StoredSupplementVerdict,
): AfleidingView | null {
  if (!verdict.basedOn) {
    return null;
  }
  return {
    signaalLine: signaalLine(verdict),
    zekerheidLine: zekerheidLine(ingredientKey),
    confidence: confidenceValue(ingredientKey),
    bloedLine: bloedLine(ingredientKey),
    claimLine: claimLine(ingredientKey),
  };
}

/**
 * De vier vergelijkbare feiten achter één oordeel, kort genoeg om naast elkaar
 * te lezen. Zelfde bronnen en zelfde grenzen als `buildAfleiding` — dit is een
 * compactere weergave van wat daar al in zinnen staat, geen tweede oordeel en
 * geen nieuwe claim.
 */
export type VerdictFact = { label: string; value: string };

const BLOOD_MARKER_SHORT: Record<BloodMarkerValue, string> = {
  improves: "Maakt dit harder",
  limited: "Beperkt bruikbaar",
  none: "Voegt niets toe",
};

const SIGNAL_SHORT: Partial<Record<string, string>> = {
  magnesium_signal: "Je slaapvragen",
  omega3_deficiency: "Je voedingsvragen",
  creatine_signal: "Belasting + herstel",
  protein_gap_signal: "Inname + beweging",
  cortisol_risk: "Aanhoudende spanning",
  melatonine_signal: "Je inslaappatroon",
};

const HUB_RULE_SHORT: Partial<Record<string, string>> = {
  creatine_custom_matcher: "Belasting + herstel",
  protein_gap_signal: "Inname + beweging",
  vitamin_d_fallback: "Aanmaak in Nederland",
};

function triggerShort(reason: RecommendationTriggerReason): string {
  switch (reason.type) {
    case "signal":
      return SIGNAL_SHORT[reason.signal] ?? "Uit je check";
    case "domain_below":
      return `Je ${DOMAIN_LABEL[reason.domain]}`;
    case "profile":
      return `Profiel “${reason.label}”`;
    case "hub_legacy":
      return HUB_RULE_SHORT[reason.rule] ?? "Een regel in je check";
    case "pillar":
      return "Je focusdomein";
  }
}

function signaalFact(verdict: StoredSupplementVerdict): string {
  const triggeredBy = verdict.basedOn?.triggeredBy ?? [];
  if (triggeredBy.length === 0) {
    return "Geen signaal";
  }
  const first = triggerShort(triggeredBy[0]);
  return triggeredBy.length > 1 ? `${first} +${triggeredBy.length - 1}` : first;
}

function zekerheidFact(ingredientKey: IngredientClaimKey): string {
  const confidence = confidenceValue(ingredientKey);
  return confidence === null ? "Niet te scoren" : `${confidence} van 4`;
}

function bloedFact(ingredientKey: IngredientClaimKey): string {
  const nutrientId = NUTRIENT_BY_INGREDIENT[ingredientKey];
  if (!nutrientId) {
    return "Niet van toepassing";
  }
  return BLOOD_MARKER_SHORT[nutrientReferences[nutrientId].bloodMarker.value];
}

function claimFact(ingredientKey: IngredientClaimKey): string {
  const entry = approvedClaims[ingredientKey];
  if (!entry) {
    return "Onbekend";
  }
  if (entry.status === "on_hold") {
    return "On-hold bij EFSA";
  }
  if (entry.status === "forbidden") {
    return "Niet toegestaan";
  }
  return getUsableClaims(ingredientKey).length > 0
    ? "Goedgekeurd"
    : "Geen erkende claim";
}

export function buildVerdictFacts(
  ingredientKey: IngredientClaimKey,
  verdict: StoredSupplementVerdict,
): VerdictFact[] {
  return [
    { label: "Signaal", value: signaalFact(verdict) },
    { label: "Zekerheid", value: zekerheidFact(ingredientKey) },
    { label: "Bloedwaarde", value: bloedFact(ingredientKey) },
    { label: "EU-claim", value: claimFact(ingredientKey) },
  ];
}
