// Attributie (puur, geen database). Bepaalt welke affiliate een tracking-ref
// toebehoort. Alleen een actieve, niet-gearchiveerde affiliate attribueert.

import type { AfAffiliate } from "@/types/affiliate";

export function normalizeRef(ref: string | null | undefined): string | null {
  if (!ref) return null;
  const t = ref.trim().toLowerCase().slice(0, 60);
  return t.length > 0 ? t : null;
}

type RefAffiliate = Pick<AfAffiliate, "id" | "ref" | "status" | "archived_at">;

export function resolveAffiliateForRef<T extends RefAffiliate>(
  ref: string | null | undefined,
  affiliates: T[],
): T | null {
  const norm = normalizeRef(ref);
  if (!norm) return null;
  const match = affiliates.find((a) => a.ref.toLowerCase() === norm);
  if (!match) return null;
  if (match.status !== "active" || match.archived_at) return null;
  return match;
}
