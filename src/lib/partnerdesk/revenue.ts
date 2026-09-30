import { contractStatus } from "@/lib/partnerdesk/contract-status";
import { daysSince } from "@/lib/partnerdesk/dates";
import type {
  PdContract,
  PdConversion,
  PdLedgerEntry,
  ReportingMethod,
} from "@/types/partnerdesk";

export const REPORTING_METHOD_LABEL: Record<ReportingMethod, string> = {
  postback: "Automatisch (postback)",
  import: "Import (CSV/export)",
  manual: "Handmatig",
};

export const STALE_PENDING_DAYS = 14;

export type CoverageKind = ReportingMethod | "network" | "unset";

export interface RevenueCoverage {
  kind: CoverageKind;
  label: string;
  cadence: string | null;
  automatic: boolean;
  note: string;
}

/**
 * Hoe wordt omzet van deze partner ingenomen? Netwerkpartners (Daisycon e.a.) geven
 * geen conversie per klik door: die krijgen kliks maar geen omzetregel, tenzij er
 * handmatig iets is ingevoerd. Een partner zonder methode toont nooit "€0".
 */
export function reportingCoverage(input: {
  networkKind: "network" | "direct" | null;
  contracts: PdContract[];
  today: string;
}): RevenueCoverage {
  const active =
    input.contracts.find(
      (c) => !c.archived_at && contractStatus(c.starts_on, c.ends_on, input.today) === "active",
    ) ?? input.contracts.find((c) => !c.archived_at);
  const method = active?.reporting_method ?? null;
  const cadence = active?.reporting_cadence ?? null;

  if (method) {
    return {
      kind: method,
      label: REPORTING_METHOD_LABEL[method],
      cadence,
      automatic: method === "postback",
      note:
        method === "postback"
          ? "Conversies komen vanzelf binnen; controleer alleen het verschil met de verwachte commissie."
          : "Conversies komen niet vanzelf binnen: voer ze in na elke rapportage van de partner.",
    };
  }
  if (input.networkKind === "network") {
    return {
      kind: "network",
      label: "Via netwerk — geen omzetregel per klik",
      cadence: null,
      automatic: false,
      note: "Een netwerk geeft geen click_token terug. Kliks zijn zichtbaar, omzet lees je af in het netwerkdashboard.",
    };
  }
  return {
    kind: "unset",
    label: "Geen rapportagemethode vastgelegd",
    cadence: null,
    automatic: false,
    note: "Leg bij het contract vast hoe deze partner conversies terugmeldt. Zonder methode is een omzettotaal niet betrouwbaar.",
  };
}

export interface StatusTotals {
  count: number;
  revenueCents: number;
  commissionCents: number;
}

export interface RevenueSummary {
  pending: StatusTotals;
  approved: StatusTotals;
  rejected: StatusTotals;
  lastIngestAt: string | null;
  approvedCents: number;
  expectedCents: number;
  receivedCents: number;
  mismatchCount: number;
  mismatchCents: number;
}

const emptyTotals = (): StatusTotals => ({ count: 0, revenueCents: 0, commissionCents: 0 });

/** Ledger-regels met een verwacht bedrag dat afwijkt van het ontvangen bedrag. */
export function ledgerMismatches(entries: PdLedgerEntry[]): PdLedgerEntry[] {
  return entries.filter(
    (e) => e.kind === "accrual" && e.expected_cents !== null && e.amount_cents !== e.expected_cents,
  );
}

export function summarizeRevenue(
  conversions: PdConversion[],
  ledger: PdLedgerEntry[],
): RevenueSummary {
  const totals = { pending: emptyTotals(), approved: emptyTotals(), rejected: emptyTotals() };
  let lastIngestAt: string | null = null;
  for (const c of conversions) {
    const t = totals[c.status];
    t.count += 1;
    t.revenueCents += c.revenue_cents;
    t.commissionCents += c.commission_cents ?? 0;
    if (!lastIngestAt || c.imported_at > lastIngestAt) lastIngestAt = c.imported_at;
  }
  const comparable = ledger.filter((e) => e.kind === "accrual" && e.expected_cents !== null);
  const mismatches = ledgerMismatches(ledger);
  return {
    ...totals,
    lastIngestAt,
    approvedCents: ledger
      .filter((e) => e.kind === "accrual" && e.state === "approved")
      .reduce((sum, e) => sum + e.amount_cents, 0),
    expectedCents: comparable.reduce((sum, e) => sum + (e.expected_cents ?? 0), 0),
    receivedCents: comparable.reduce((sum, e) => sum + e.amount_cents, 0),
    mismatchCount: mismatches.length,
    mismatchCents: mismatches.reduce((sum, e) => sum + ((e.expected_cents ?? 0) - e.amount_cents), 0),
  };
}

/** Conversies die al te lang op beoordeling wachten. */
export function stalePendingConversions(
  conversions: PdConversion[],
  today: string,
): PdConversion[] {
  return conversions.filter(
    (c) =>
      c.status === "pending" &&
      (daysSince(c.imported_at.slice(0, 10), today) ?? 0) > STALE_PENDING_DAYS,
  );
}

export interface ReviewOutcome {
  conversionStatus: "approved" | "rejected";
  ledger: {
    kind: "accrual";
    amount_cents: number;
    expected_cents: number | null;
    state: "approved" | "rejected";
    period: string;
    rule_snapshot: Record<string, unknown>;
  };
}

/**
 * Beoordeling van een conversie -> grootboekregel. Goedkeuren boekt het ontvangen
 * bedrag (standaard gelijk aan verwacht); afkeuren boekt 0 tegen het verwachte
 * bedrag, zodat de gemiste commissie als verschil zichtbaar blijft.
 */
export function buildReviewOutcome(
  conversion: Pick<PdConversion, "commission_cents" | "occurred_at" | "type" | "revenue_cents">,
  decision: "approve" | "reject",
  receivedCents: number | null,
): ReviewOutcome {
  const expected = conversion.commission_cents;
  const approved = decision === "approve";
  return {
    conversionStatus: approved ? "approved" : "rejected",
    ledger: {
      kind: "accrual",
      amount_cents: approved ? (receivedCents ?? expected ?? 0) : 0,
      expected_cents: expected,
      state: approved ? "approved" : "rejected",
      period: conversion.occurred_at.slice(0, 7),
      rule_snapshot: { type: conversion.type, revenue_cents: conversion.revenue_cents },
    },
  };
}
