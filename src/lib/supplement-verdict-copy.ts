import { approvedClaims, type IngredientClaimKey } from "@/data/approved-claims";
import { getAllowedComparisonPath } from "@/lib/comparison-availability";
import type { StoredSupplementVerdict, VerdictValue } from "@/types/verdict";

export type VerdictTone = "ja" | "nee" | "wacht";

export type VerdictPresentationKind = "default" | "gate" | "hold" | "gap";

const VERDICT_LABEL: Record<VerdictValue, string> = {
  kopen: "Aanvullen",
  niet_nodig: "Niet nodig",
  eerst_leefstijl: "Eerst leefstijl",
  nooit: "Raden we niet aan",
};

const REASON_LABEL: Partial<Record<string, string>> = {
  nutrition_log_incomplete: "Nog niet te zeggen",
  claim_on_hold: "Eerst leefstijl",
  comparison_unavailable: "Geen vergelijking",
};

function presentationKindFor(reasonKey: string): VerdictPresentationKind {
  if (reasonKey === "nutrition_log_incomplete") {
    return "gate";
  }
  if (reasonKey === "claim_on_hold") {
    return "hold";
  }
  if (reasonKey === "comparison_unavailable") {
    return "gap";
  }
  return "default";
}

function labelForVerdict(verdict: VerdictValue, reasonKey: string): string {
  if (verdict === "eerst_leefstijl" && REASON_LABEL[reasonKey]) {
    return REASON_LABEL[reasonKey]!;
  }
  return VERDICT_LABEL[verdict];
}

const VERDICT_TONE: Record<VerdictValue, VerdictTone> = {
  kopen: "ja",
  niet_nodig: "nee",
  eerst_leefstijl: "wacht",
  nooit: "nee",
};

/** Reden in gewone taal. Inname-taal, geen status- of diagnose-taal. */
const REASON_TEXT: Record<string, string> = {
  trigger_matched:
    "Je check laat een reden zien om dit aan te vullen naast je leefstijl.",
  no_trigger_matched:
    "Je check laat geen reden zien om dit te nemen. Dat scheelt je geld.",
  nutrition_log_incomplete:
    "Vul eerst je voeding in — zonder dat kunnen we niet zeggen of dit iets toevoegt.",
  claim_on_hold:
    "Geen goedgekeurde EFSA-claim en een reëel verbod-risico in Nederland. Wij wachten af.",
  claim_forbidden:
    "Dit valt boven de supplementgrens onder de geneesmiddelenwet. Wij adviseren het niet.",
  comparison_unavailable:
    "Hier hebben we nog geen onderbouwde vergelijking voor.",
};

const FALLBACK_REASON = "Beoordeeld op je laatste check.";

export type VerdictCardCopy = {
  ingredientKey: string;
  name: string;
  verdict: VerdictValue;
  reasonKey: string;
  label: string;
  tone: VerdictTone;
  presentationKind: VerdictPresentationKind;
  reason: string;
  comparisonPath: string | null;
};

function ingredientName(ingredientKey: string): string {
  const entry = approvedClaims[ingredientKey as IngredientClaimKey];
  return entry ? entry.ingredient : ingredientKey;
}

function comparisonPathFor(ingredientKey: string, verdict: VerdictValue): string | null {
  if (verdict !== "kopen") {
    return null;
  }
  const entry = approvedClaims[ingredientKey as IngredientClaimKey];
  if (!entry?.comparisonPath) {
    return null;
  }
  const slug = entry.comparisonPath.replace("/beste/", "");
  return getAllowedComparisonPath(slug);
}

export function toVerdictCardCopy(row: StoredSupplementVerdict): VerdictCardCopy {
  return {
    ingredientKey: row.ingredientKey,
    name: ingredientName(row.ingredientKey),
    verdict: row.verdict,
    reasonKey: row.reasonKey,
    label: labelForVerdict(row.verdict, row.reasonKey),
    tone: VERDICT_TONE[row.verdict],
    presentationKind: presentationKindFor(row.reasonKey),
    reason: REASON_TEXT[row.reasonKey] ?? FALLBACK_REASON,
    comparisonPath: comparisonPathFor(row.ingredientKey, row.verdict),
  };
}

/** Aanvullen eerst, dan wat kan wachten, dan de nee's — de "nee" hoort er zichtbaar bij. */
const TONE_ORDER: Record<VerdictTone, number> = { ja: 0, wacht: 1, nee: 2 };

export function buildVerdictCards(rows: StoredSupplementVerdict[]): VerdictCardCopy[] {
  return rows
    .map(toVerdictCardCopy)
    .sort(
      (left, right) =>
        TONE_ORDER[left.tone] - TONE_ORDER[right.tone] ||
        left.name.localeCompare(right.name, "nl"),
    );
}

export function countVerdictsWithoutPurchase(rows: StoredSupplementVerdict[]): number {
  return rows.filter((row) => row.verdict !== "kopen").length;
}

export function buildVerdictSummary(rows: StoredSupplementVerdict[]): string | null {
  if (rows.length === 0) {
    return null;
  }
  const withoutPurchase = countVerdictsWithoutPurchase(rows);
  if (withoutPurchase === rows.length) {
    return `We beoordeelden ${rows.length} supplementen. Geen enkele voegt nu iets toe voor jou.`;
  }
  if (withoutPurchase === 0) {
    return `We beoordeelden ${rows.length} supplementen.`;
  }
  return `We beoordeelden ${rows.length} supplementen. Bij ${withoutPurchase} is ons antwoord: niet kopen.`;
}
