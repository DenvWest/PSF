export type VitaminDSeason = "summer" | "winter";

/** Oct–Mar (NL): limited skin synthesis of vitamin D. */
export function isVitaminDLowSunSeason(date = new Date()): boolean {
  const month = date.getMonth();
  return month >= 9 || month <= 2;
}

export function seasonFromDate(date = new Date()): VitaminDSeason {
  return isVitaminDLowSunSeason(date) ? "winter" : "summer";
}
