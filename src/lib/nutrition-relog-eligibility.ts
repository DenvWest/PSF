/** Dagen na de laatste voedingslog voordat een her-log zinvol is (zelfde drempel als nurture-mail). */
export const NUTRITION_RELOG_DAYS = 14;

export function daysSinceIsoDate(isoDate: string, now = Date.now()): number {
  const loggedAt = Date.parse(isoDate);
  if (!Number.isFinite(loggedAt)) {
    return 0;
  }
  return Math.floor((now - loggedAt) / (24 * 60 * 60 * 1000));
}

export function isNutritionRelogDue(
  lastLoggedAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!lastLoggedAt) {
    return false;
  }
  return daysSinceIsoDate(lastLoggedAt, now) >= NUTRITION_RELOG_DAYS;
}
