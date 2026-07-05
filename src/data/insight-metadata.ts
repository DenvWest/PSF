import type { InsightItem } from "@/types/insight";

export type ContentMetadata = Pick<
  InsightItem,
  "theme" | "planPhase" | "gapSignal" | "profile" | "relatedSupplementId"
>;

/** Overlay gekeyed op InsightItem.slug; elke slug in allInsights heeft minstens theme. */
export const CONTENT_METADATA: Record<string, ContentMetadata> = {
  // ── Blog ──────────────────────────────────────────────────────────────────
  "ademhaling-tegen-stress": { theme: "stress", planPhase: 1 },
  "alcohol-slaap-energie-na-40": { theme: "sleep" },
  "ashwagandha-werking-mannen": {
    theme: "stress",
    gapSignal: "cortisol_risk",
    profile: "Stressdrager",
  },
  "beste-magnesium": {
    theme: "sleep",
    gapSignal: "magnesium_signal",
    relatedSupplementId: "magnesium-glycinaat",
  },
  "beste-omega-3-supplement": {
    theme: "nutrition",
    gapSignal: "omega3_deficiency",
    relatedSupplementId: "omega-3",
  },
  "cortisol-en-slaap": { theme: "sleep", gapSignal: "cortisol_risk" },
  "cortisol-en-testosteron": { theme: "stress", gapSignal: "cortisol_risk" },
  "cortisol-verlagen-natuurlijk": {
    theme: "stress",
    gapSignal: "cortisol_risk",
    profile: "Stressdrager",
    planPhase: 1,
  },
  "creatine-en-herstel": {
    theme: "movement",
    gapSignal: "creatine_signal",
    relatedSupplementId: "creatine",
    profile: "Overtrainer",
  },
  "eiwit-na-40": {
    theme: "nutrition",
    gapSignal: "protein_gap_signal",
    relatedSupplementId: "eiwitpoeder",
  },
  "eiwitinname-timing-mannen-40": {
    theme: "nutrition",
    gapSignal: "protein_gap_signal",
    relatedSupplementId: "eiwitpoeder",
  },
  "energie-verhogen-natuurlijk": {
    theme: "movement",
    gapSignal: "energy_dip_unexplained",
    profile: "Lage Batterij",
  },
  "krachttraining-na-40": { theme: "movement", planPhase: 1 },
  "magnesium-en-slaap": {
    theme: "sleep",
    gapSignal: "magnesium_signal",
    relatedSupplementId: "magnesium-glycinaat",
  },
  "magnesium-en-slaapkwaliteit": {
    theme: "sleep",
    planPhase: 2,
    gapSignal: "magnesium_signal",
    relatedSupplementId: "magnesium-glycinaat",
  },
  "melatonine-na-40": { theme: "sleep", gapSignal: "melatonine_signal" },
  "melatonine-wanneer-wel-niet": { theme: "sleep" },
  "middagdip-bloedsuiker-na-40": {
    theme: "nutrition",
    gapSignal: "omega3_deficiency",
  },
  "omega-3-concentratie-energie": {
    theme: "nutrition",
    gapSignal: "omega3_deficiency",
    relatedSupplementId: "omega-3",
  },
  "omega-3-en-herstel": {
    theme: "movement",
    gapSignal: "omega3_deficiency",
    relatedSupplementId: "omega-3",
  },
  "slaap-verbeteren-40-plus": {
    theme: "sleep",
    profile: "Onrustige Slaper",
    planPhase: 1,
  },
  "slaaphygiene-mannen-40-plus": { theme: "sleep", planPhase: 1 },
  "slaapritme-herstellen": { theme: "sleep", planPhase: 1 },
  "stress-werk-grenzen-stellen": { theme: "stress", profile: "Stressdrager" },
  "supplement-kiezen-waar-op-letten": { theme: "nutrition" },
  "testosteron-en-energie-na-40": { theme: "movement" },
  "vitamine-d-en-energie": {
    theme: "nutrition",
    relatedSupplementId: "vitamine-d3",
  },
  "vitamine-d-tekort-herkennen": {
    theme: "nutrition",
    relatedSupplementId: "vitamine-d3",
  },
  "waar-let-je-op-bij-omega-3": {
    theme: "nutrition",
    gapSignal: "omega3_deficiency",
    relatedSupplementId: "omega-3",
  },
  "wat-is-omega-3": {
    theme: "nutrition",
    gapSignal: "omega3_deficiency",
    relatedSupplementId: "omega-3",
  },
  "zink-en-testosteron": {
    theme: "nutrition",
    relatedSupplementId: "zink",
  },

  // ── Kennisbank ────────────────────────────────────────────────────────────
  adaptogens: { theme: "stress", profile: "Stressdrager" },
  adh: { theme: "nutrition" },
  atp: { theme: "movement" },
  biobeschikbaarheid: { theme: "nutrition" },
  chelaatvorm: { theme: "nutrition" },
  "circadiaan-ritme": { theme: "sleep", planPhase: 1 },
  cortisol: { theme: "stress", gapSignal: "cortisol_risk", profile: "Stressdrager" },
  "derde-partij-testen": { theme: "nutrition" },
  "efsa-claims": { theme: "nutrition" },
  "eiwitbehoefte-na-40": {
    theme: "nutrition",
    gapSignal: "protein_gap_signal",
    relatedSupplementId: "eiwitpoeder",
  },
  "epa-dha": {
    theme: "nutrition",
    gapSignal: "omega3_deficiency",
    relatedSupplementId: "omega-3",
  },
  healthspan: { theme: "movement" },
  "hpa-as": { theme: "stress", gapSignal: "cortisol_risk" },
  insulineresistentie: { theme: "nutrition" },
  magnesiumvormen: {
    theme: "sleep",
    gapSignal: "magnesium_signal",
    relatedSupplementId: "magnesium-glycinaat",
  },
  melatonine: { theme: "sleep", gapSignal: "melatonine_signal" },
  mitochondrien: { theme: "movement" },
  "nervus-vagus": { theme: "stress", planPhase: 1 },
  overtrainingssyndroom: {
    theme: "movement",
    gapSignal: "creatine_signal",
    profile: "Overtrainer",
  },
  "oxidatieve-stress": {
    theme: "movement",
    relatedSupplementId: "omega-3",
  },
  slaaphygiene: { theme: "sleep", planPhase: 1 },
  slaapschuld: { theme: "sleep", gapSignal: "sleep_issue_no_stress" },
  testosteron: { theme: "movement" },
  "vitamine-d": {
    theme: "nutrition",
    relatedSupplementId: "vitamine-d3",
  },
};

export function getContentMetadata(slug: string): ContentMetadata {
  return CONTENT_METADATA[slug] ?? {};
}
