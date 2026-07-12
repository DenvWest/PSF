// Datum-helpers voor PartnerDesk. Werkt met ISO-datums (YYYY-MM-DD) en rekent op
// UTC-middag zodat tijdzone-verschuivingen nooit een dag over de grens duwen.

function toUtcNoon(dateIso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateIso);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

/** Hele dagen tussen twee ISO-datums (b − a); positief als b later is. */
export function daysBetween(aIso: string, bIso: string): number | null {
  const a = toUtcNoon(aIso);
  const b = toUtcNoon(bIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / 86_400_000);
}

/** Hele dagen sinds `iso` tot `nowIso` (positief = in het verleden). */
export function daysSince(iso: string | null, nowIso: string): number | null {
  if (!iso) return null;
  return daysBetween(iso, nowIso);
}

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
