import { PRICE_MAX_AGE_DAYS } from "@/lib/product-admin/publish-gate";
import { daysSince } from "@/lib/partnerdesk/dates";

/** Vanaf deze leeftijd (dagen) waarschuwt het signaal: nog 7 dagen tot de poortgrens. */
export const PRICE_WARN_DAYS = PRICE_MAX_AGE_DAYS - 7;
/** Termijn na de poortgrens waarbinnen een oude prijs amber blijft; daarna rood (besluit B-2). */
export const PRICE_GRACE_DAYS = 7;

export type PriceAgeState = "fresh" | "warn" | "stale" | "overdue";

export function classifyPriceAge(checkedAt: string | null, today: string): PriceAgeState {
  const age = daysSince(checkedAt ? checkedAt.slice(0, 10) : null, today);
  if (age === null) return "overdue";
  if (age > PRICE_MAX_AGE_DAYS + PRICE_GRACE_DAYS) return "overdue";
  if (age > PRICE_MAX_AGE_DAYS) return "stale";
  if (age >= PRICE_WARN_DAYS) return "warn";
  return "fresh";
}

export interface PriceSignalInput {
  warn: number;
  stale: number;
  overdue: number;
  slugs: string[];
}

export function summarizePrices(
  offers: { slug: string; price_checked_at: string | null }[],
  today: string,
): PriceSignalInput {
  const out: PriceSignalInput = { warn: 0, stale: 0, overdue: 0, slugs: [] };
  for (const o of offers) {
    const state = classifyPriceAge(o.price_checked_at, today);
    if (state === "fresh") continue;
    out[state] += 1;
    if (out.slugs.length < 5 && !out.slugs.includes(o.slug)) out.slugs.push(o.slug);
  }
  return out;
}
