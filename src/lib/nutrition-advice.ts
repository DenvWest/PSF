/**
 * F2: van inname-gap naar advies — leefstijl eerst, dan (gegate) supplement.
 *
 * Merkprincipe: "Eerst de basis, dan de pil — in die volgorde, altijd."
 * De EFSA-poort hergebruikt de bestaande machinerie; er is geen tweede gate.
 * Claimtekst komt uitsluitend uit getUsableClaims() — nooit zelfverzonnen.
 */

import {
  approvedClaims,
  getUsableClaims,
  type IngredientClaimKey,
} from "@/data/approved-claims";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { isComparisonAllowed } from "@/lib/comparison-availability";
import { slugFromComparisonPath } from "@/lib/resolve-nurture-cta";

export type NutritionAdviceItem =
  | { kind: "lifestyle"; nutrient: NutrientId; priority: 1; text: string }
  | {
      kind: "supplement";
      nutrient: NutrientId;
      priority: 2;
      comparisonPath: string;
      claimText: string;
    };

type GateResult =
  | { allowed: true; comparisonPath: string; claimText: string }
  | { allowed: false };

/**
 * Vier-stappen gate — hergebruikt de bestaande keten, bouwt niets nieuws.
 *
 * 1. comparisonPath aanwezig in de referentietabel.
 * 2. approvedClaims[claimKey].status === "approved".
 * 3. slug uit comparisonPath doorstaat isComparisonAllowed() (sluit forbidden/on_hold uit).
 * 4. getUsableClaims(claimKey).length > 0 → claimText = claims[0].text (EFSA-conform).
 *
 * Eén check faalt → { allowed: false }. Geen dode CTA, geen verzonnen tekst.
 */
export function nutritionSupplementGate(nutrient: NutrientId): GateResult {
  const ref = nutrientReferences[nutrient];

  // Check 1 — comparisonPath aanwezig
  const { comparisonPath, claimKey } = ref;
  if (!comparisonPath) return { allowed: false };

  // Check 2 — approvedClaims status === "approved"
  const entry = approvedClaims[claimKey as IngredientClaimKey];
  if (!entry || entry.status !== "approved") return { allowed: false };

  // Check 3 — isComparisonAllowed via slug
  const slug = slugFromComparisonPath(comparisonPath);
  if (!slug || !isComparisonAllowed(slug)) return { allowed: false };

  // Check 4 — EFSA-usable claims aanwezig; claimText = eerste goedgekeurde claim
  const claims = getUsableClaims(claimKey);
  if (claims.length === 0) return { allowed: false };

  return { allowed: true, comparisonPath, claimText: claims[0].text };
}

/**
 * Vertaal een IntakeEstimate[]-array naar gerangschikte adviezen.
 *
 * Alleen gaps (band === "below") leveren adviezen op.
 * Per gap:
 *   - Altijd: lifestyle-item (priority 1, lifestyleAction uit referentietabel).
 *   - Alleen als de vier-stappen gate slaagt: supplement-item (priority 2).
 * Gesorteerd op priority — alle leefstijl-items vóór alle supplement-items.
 *
 * Puur, deterministisch, geen I/O.
 */
export function buildNutritionAdvice(
  estimates: IntakeEstimate[]
): NutritionAdviceItem[] {
  const items: NutritionAdviceItem[] = [];

  for (const estimate of estimates) {
    if (estimate.band !== "below") continue;

    const ref = nutrientReferences[estimate.nutrient];

    items.push({
      kind: "lifestyle",
      nutrient: estimate.nutrient,
      priority: 1,
      text: ref.lifestyleAction,
    });

    const gate = nutritionSupplementGate(estimate.nutrient);
    if (gate.allowed) {
      items.push({
        kind: "supplement",
        nutrient: estimate.nutrient,
        priority: 2,
        comparisonPath: gate.comparisonPath,
        claimText: gate.claimText,
      });
    }
  }

  // Stabiele sort op priority: priority 1 (lifestyle) vóór priority 2 (supplement).
  return items.sort((a, b) => a.priority - b.priority);
}
