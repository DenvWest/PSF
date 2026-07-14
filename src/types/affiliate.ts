// Affiliate-programma (Rol 2) — types die het af_-schema weerspiegelen.
// Handgeschreven; UI-strings NL, kolommen/enums volgen de database (Engels).

export type AffiliateStatus = "active" | "paused" | "ended";
export type AfAppliesTo = "lead" | "sale" | "both";
export type AfValueType = "percent" | "fixed";
export type AfRuleType = "standard" | "promo";
export type AfConversionType = "lead" | "sale";
export type AfConversionStatus = "pending" | "approved" | "rejected";
export type AfLedgerKind =
  | "accrual"
  | "adjustment"
  | "reversal"
  | "payout"
  | "fee";
export type AfLedgerState = "pending" | "approved" | "paid" | "rejected";

export interface AfSource {
  id: string;
  created_at: string;
  kind: "manual" | "csv" | "network" | "bookkeeping" | "psp";
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
}

export interface AfAffiliate {
  id: string;
  created_at: string;
  updated_at: string;
  account_id: string | null;
  ref: string;
  display_name: string;
  company: string | null;
  email: string | null;
  status: AffiliateStatus;
  default_commission_rule_id: string | null;
  payout_details: Record<string, unknown>;
  notes: string | null;
  archived_at: string | null;
}

export interface AfCommissionRule {
  id: string;
  created_at: string;
  affiliate_id: string;
  applies_to: AfAppliesTo;
  value_type: AfValueType;
  rate_percent: number | null;
  amount_cents: number | null;
  rule_type: AfRuleType;
  valid_from: string | null;
  valid_to: string | null;
  notes: string | null;
  archived_at: string | null;
}

export interface AfLink {
  id: string;
  created_at: string;
  affiliate_id: string;
  ref: string;
  target_url: string;
  campaign: string | null;
}

export interface AfConversion {
  id: string;
  created_at: string;
  source_id: string;
  affiliate_id: string;
  external_id: string;
  type: AfConversionType;
  occurred_at: string;
  order_ref: string | null;
  revenue_cents: number;
  currency: string;
  status: AfConversionStatus;
  intake_session_id: string | null;
  raw: Record<string, unknown>;
  imported_at: string;
}

export interface AfLedgerEntry {
  id: string;
  created_at: string;
  affiliate_id: string;
  conversion_id: string | null;
  kind: AfLedgerKind;
  amount_cents: number;
  state: AfLedgerState;
  expected_cents: number | null;
  period: string;
  posted_at: string;
  source_id: string | null;
  reverses_entry_id: string | null;
  rule_snapshot: Record<string, unknown>;
  note: string | null;
}

export type AfPayoutStatus = "draft" | "approved" | "sent" | "paid" | "failed";

export interface AfPayout {
  id: string;
  created_at: string;
  affiliate_id: string;
  period: string;
  total_cents: number;
  status: AfPayoutStatus;
  bookkeeping_ref: string | null;
  psp_ref: string | null;
  paid_at: string | null;
}

/** Affiliate + afgeleide tellingen voor de lijstweergave. */
export interface AffiliateListRow {
  affiliate: AfAffiliate;
  ruleCount: number;
  linkCount: number;
}
