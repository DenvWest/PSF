import {
  approvedClaims,
  type IngredientClaimKey,
} from "@/data/approved-claims";
import { isComparisonAllowed } from "@/lib/comparison-availability";
import type { DomainKey } from "@/data/nurture-content";

export type SupplementGateContext = {
  tierAllowsSupplement?: boolean;
  tipDomain?: DomainKey;
  supplementDomain?: DomainKey;
};

function slugFromComparisonPath(path: string): string | null {
  const match = path.match(/^\/beste\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function resolveGatedComparisonPath(
  ingredientKey: IngredientClaimKey,
): string | null {
  const entry = approvedClaims[ingredientKey];
  if (!entry || entry.status !== "approved" || entry.comparisonPath == null) {
    return null;
  }

  const slug = slugFromComparisonPath(entry.comparisonPath);
  if (!slug || !isComparisonAllowed(slug)) {
    return null;
  }

  return entry.comparisonPath;
}

export function isSupplementSuggestionAllowed(
  ingredientKey: IngredientClaimKey,
  ctx?: SupplementGateContext,
): boolean {
  if (resolveGatedComparisonPath(ingredientKey) == null) {
    return false;
  }

  if (ctx?.tierAllowsSupplement === false) {
    return false;
  }

  if (
    ctx?.tipDomain != null &&
    ctx?.supplementDomain != null &&
    ctx.tipDomain === ctx.supplementDomain
  ) {
    return false;
  }

  return true;
}
