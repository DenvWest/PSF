// PartnerDesk — types die het databaseschema (migratie 20260712120000) weerspiegelen.
// Handgeschreven (migraties draaien via Dashboard, geen CLI-typegeneratie).
// UI-strings zijn Nederlands; kolomnamen en enums volgen de database (Engels).

export type NetworkKind = "network" | "direct";
export type PartnerStatus = "onboarding" | "active" | "paused" | "ended";
export type ContractStatus = "concept" | "active" | "expired";
export type CommissionKind =
  | "cps_percent"
  | "cps_fixed"
  | "cpl"
  | "cpc"
  | "cpa";
export type CommissionScope = "all" | "category";
export type CommissionRuleType = "standard" | "exception" | "promo" | "bonus";
export type TimelineActor = "user" | "system" | "ai";
export type TaskStatus = "open" | "done" | "dismissed";
export type TaskSource = "manual" | "system" | "signal";
export type SignalSeverity = "red" | "amber";
export type SignalStatus = "open" | "snoozed" | "resolved";
export type DocumentKind =
  | "contract"
  | "terms"
  | "manual"
  | "rate_card"
  | "banner"
  | "logo"
  | "screenshot"
  | "other";

export interface PdNetwork {
  id: string;
  created_at: string;
  name: string;
  kind: NetworkKind;
  login_url: string | null;
  notes: string | null;
}

export interface PdCategory {
  id: string;
  created_at: string;
  name: string;
  parent_id: string | null;
}

export interface PdLabel {
  id: string;
  created_at: string;
  name: string;
  color: string;
}

export interface PdPartner {
  id: string;
  created_at: string;
  updated_at: string;
  network_id: string;
  slug: string;
  name: string;
  status: PartnerStatus;
  website: string | null;
  logo_path: string | null;
  login_url: string | null;
  login_username: string | null;
  account_manager: string | null;
  category_id: string | null;
  description: string | null;
  is_sole_proprietor: boolean;
  archived_at: string | null;
}

export interface PdContact {
  id: string;
  created_at: string;
  partner_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  responsibility: string | null;
  is_primary: boolean;
  notes: string | null;
  last_contact_at: string | null;
  archived_at: string | null;
}

export interface PdContract {
  id: string;
  created_at: string;
  updated_at: string;
  partner_id: string;
  number: string;
  starts_on: string;
  ends_on: string | null;
  notice_period_days: number | null;
  cancel_by: string | null;
  cookie_days: number | null;
  approval_terms: string | null;
  exclusivity: string | null;
  auto_renews: boolean;
  notes: string | null;
  archived_at: string | null;
}

export interface PdCommissionRule {
  id: string;
  created_at: string;
  contract_id: string;
  kind: CommissionKind;
  rate_percent: number | null;
  amount_cents: number | null;
  scope: CommissionScope;
  category_id: string | null;
  rule_type: CommissionRuleType;
  valid_from: string | null;
  valid_to: string | null;
  bonus_terms: string | null;
  notes: string | null;
  archived_at: string | null;
}

export interface PdCommissionTier {
  id: string;
  created_at: string;
  commission_rule_id: string;
  threshold_cents: number;
  rate_percent: number | null;
  amount_cents: number | null;
}

export interface PdTimelineEvent {
  id: string;
  created_at: string;
  partner_id: string;
  occurred_at: string;
  actor: TimelineActor;
  kind: string;
  body: string | null;
  metadata: Record<string, unknown>;
  contact_id: string | null;
  contract_id: string | null;
}

export interface PdTask {
  id: string;
  created_at: string;
  partner_id: string | null;
  contract_id: string | null;
  title: string;
  notes: string | null;
  due_on: string | null;
  status: TaskStatus;
  source: TaskSource;
  dedupe_key: string | null;
  completed_at: string | null;
}

export interface PdSignal {
  id: string;
  created_at: string;
  type: string;
  severity: SignalSeverity;
  subject_type: string;
  subject_id: string;
  partner_id: string | null;
  status: SignalStatus;
  snoozed_until: string | null;
  snooze_reason: string | null;
  reopen_count: number;
  dedupe_key: string;
  payload: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
}

export interface PdDocument {
  id: string;
  created_at: string;
  partner_id: string;
  contract_id: string | null;
  timeline_event_id: string | null;
  kind: DocumentKind;
  title: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  origin: string | null;
  version: number;
}

/** Partner + afgeleide velden voor de lijst- en dossierweergave. */
export interface PartnerListRow {
  partner: PdPartner;
  networkName: string;
  categoryName: string | null;
  labels: PdLabel[];
  openSignalCount: number;
}
