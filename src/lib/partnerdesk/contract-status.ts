import { daysBetween } from "@/lib/partnerdesk/dates";
import type { ContractStatus } from "@/types/partnerdesk";

export type ExpirySeverity = "red" | "amber" | null;

/** BR-01: contractstatus is berekend, geen kolom. */
export function contractStatus(
  startsOn: string,
  endsOn: string | null,
  todayIso: string,
): ContractStatus {
  if (startsOn > todayIso) return "concept";
  if (endsOn !== null && endsOn < todayIso) return "expired";
  return "active";
}

/** Dagen tot een datum (positief = toekomst); null bij ontbrekende/foute datum. */
export function daysUntil(dateIso: string | null, todayIso: string): number | null {
  if (!dateIso) return null;
  return daysBetween(todayIso, dateIso);
}

/** BR-02: verloop-ernst van een actief contract. amber < 60 dgn, rood < 30 dgn. */
export function expirySeverity(
  endsOn: string | null,
  todayIso: string,
): ExpirySeverity {
  const days = daysUntil(endsOn, todayIso);
  if (days === null || days < 0) return null;
  if (days < 30) return "red";
  if (days < 60) return "amber";
  return null;
}

/** BR-03: opzegdeadline-ernst. amber < 30 dgn, rood < 14 dgn. */
export function cancelDeadlineSeverity(
  cancelBy: string | null,
  todayIso: string,
): ExpirySeverity {
  const days = daysUntil(cancelBy, todayIso);
  if (days === null || days < 0) return null;
  if (days < 14) return "red";
  if (days < 30) return "amber";
  return null;
}
