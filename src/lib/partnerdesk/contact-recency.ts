import { daysSince } from "@/lib/partnerdesk/dates";

export const STALE_CONTACT_DAYS = 90;

/**
 * Amber-badge op een contactkaart: alleen "verouderd" als er ooit contact wás
 * en dat langer dan de drempel geleden is. Nooit-gelogd contact is neutraal
 * (geen ruis op net-aangemaakte kaarten); dat wordt op partnerniveau gevangen
 * door het stale_contact-signaal (plak 4).
 */
export function isStaleContact(
  lastContactAt: string | null,
  nowIso: string,
  thresholdDays: number = STALE_CONTACT_DAYS,
): boolean {
  const days = daysSince(lastContactAt, nowIso);
  return days !== null && days > thresholdDays;
}

/** Korte NL-omschrijving van "laatst contact", bijv. "12 dgn geleden". */
export function lastContactLabel(
  lastContactAt: string | null,
  nowIso: string,
): string {
  const days = daysSince(lastContactAt, nowIso);
  if (days === null) return "geen contact gelogd";
  if (days <= 0) return "vandaag";
  if (days === 1) return "gisteren";
  return `${days} dgn geleden`;
}
