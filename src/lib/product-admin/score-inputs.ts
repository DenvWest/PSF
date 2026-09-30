import { FORM_BIOAVAILABILITY, getFormDefinition, getQualityMarkers } from "@/data/supplement-hub/score-model";
import type { SupplementCategory } from "@/types/supplement";
import type { LabelFacts, ProductScoreInputs } from "@/types/supplement-score";

/** Wat in sup_products.score_inputs staat: de scorefeiten uit ProductScoreInputs, zonder prijs (de score is prijsvrij). */
export type StoredScoreInputs = Omit<ProductScoreInputs, "prijsPerEtiketdagCent" | "prijsGecontroleerdOp">;

export const LABEL_FACT_KEYS: (keyof LabelFacts)[] = [
  "werkzameStofGekwantificeerd",
  "dagdoseringVermeld",
  "samenstellingUitgesplitst",
  "proprietaryBlend",
];

export function staticToStored(inputs: ProductScoreInputs): StoredScoreInputs {
  return {
    formKey: inputs.formKey,
    label: { ...inputs.label },
    certificeringen: [...inputs.certificeringen],
    kwaliteitsmarkers: { ...inputs.kwaliteitsmarkers },
    dosisOnzekerReden: inputs.dosisOnzekerReden,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Leest de jsonb-kolom defensief; onbruikbare of onvolledige waarden geven null (dan geldt de statische terugval). */
export function parseStoredScoreInputs(raw: unknown): StoredScoreInputs | null {
  if (!isRecord(raw) || typeof raw.formKey !== "string" || !isRecord(raw.label)) return null;
  const label = raw.label;
  if (!LABEL_FACT_KEYS.every((k) => typeof label[k] === "boolean")) return null;

  const markers: Record<string, boolean> = {};
  if (isRecord(raw.kwaliteitsmarkers)) {
    for (const [key, value] of Object.entries(raw.kwaliteitsmarkers)) {
      if (typeof value === "boolean") markers[key] = value;
    }
  }
  const certs = Array.isArray(raw.certificeringen)
    ? raw.certificeringen.filter((c): c is string => typeof c === "string")
    : [];

  return {
    formKey: raw.formKey,
    label: label as unknown as LabelFacts,
    certificeringen: certs,
    kwaliteitsmarkers: markers,
    dosisOnzekerReden: typeof raw.dosisOnzekerReden === "string" && raw.dosisOnzekerReden.trim() !== "" ? raw.dosisOnzekerReden : null,
  };
}

/** Beschikbare keuzes voor het invoerformulier, per categorie. */
export function scoreInputOptions(category: SupplementCategory) {
  return {
    forms: Object.entries(FORM_BIOAVAILABILITY[category] ?? {}).map(([key, def]) => ({ key, label: def.label })),
    markers: getQualityMarkers(category).map((m) => ({ key: m.key, label: m.label, waarom: m.waarom })),
  };
}

/** Validatie van wat het formulier opslaat; alle sleutels moeten uit de registers van de categorie komen. */
export function validateScoreInputs(category: SupplementCategory, inputs: StoredScoreInputs): string | null {
  if (!getFormDefinition(category, inputs.formKey)) return "Kies een vorm uit de lijst voor deze categorie.";
  const allowedMarkers = new Set(getQualityMarkers(category).map((m) => m.key));
  for (const key of Object.keys(inputs.kwaliteitsmarkers)) {
    if (!allowedMarkers.has(key)) return `Onbekende kwaliteitsmarker: ${key}.`;
  }
  if (inputs.label.proprietaryBlend && inputs.label.samenstellingUitgesplitst) {
    return "Een proprietary blend kan niet tegelijk uitgesplitst zijn.";
  }
  if (inputs.dosisOnzekerReden !== null && inputs.dosisOnzekerReden.length > 300) {
    return "Reden is te lang (max 300 tekens).";
  }
  return null;
}
