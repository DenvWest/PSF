-- Affiliate-kern fase 3A — eigen affiliate-programma (mono-tenant, app-first).
-- Aparte af_-laag naast pd_ (PartnerDesk = upstream) en affiliate_clicks (Rol 1).
-- Alle tabellen: RLS aan zonder policies (deny-all); toegang uitsluitend server-side
-- via createSupabaseAdmin() (service role). Geen per-affiliate RLS in 3A (portal = fase 5).
-- Zie docs/plan/PLAN_FASE3A_AFFILIATE_KERN.md. Uitvoeren via Dashboard SQL Editor.

create table if not exists public.af_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('manual', 'csv', 'network', 'bookkeeping', 'psp')),
  name text not null unique,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

create table if not exists public.af_affiliates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_id uuid references public.accounts (id),  -- NULLABLE: de naad naar login (fase 5)
  ref text not null unique,                          -- stabiele tracking-identifier + URL-slug
  display_name text not null,
  company text,
  email text,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  default_commission_rule_id uuid,                   -- FK hieronder toegevoegd
  payout_details jsonb not null default '{}'::jsonb,
  notes text,
  archived_at timestamptz
);
create index if not exists af_affiliates_status_idx on public.af_affiliates (status);

create table if not exists public.af_commission_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  applies_to text not null default 'both' check (applies_to in ('lead', 'sale', 'both')),
  value_type text not null check (value_type in ('percent', 'fixed')),
  rate_percent numeric(5, 2) check (rate_percent between 0 and 100),
  amount_cents int check (amount_cents >= 0),
  rule_type text not null default 'standard' check (rule_type in ('standard', 'promo')),
  valid_from date,
  valid_to date,
  notes text,
  archived_at timestamptz,
  check (
    (value_type = 'percent' and rate_percent is not null and amount_cents is null)
    or (value_type = 'fixed' and amount_cents is not null and rate_percent is null)
  )
);
create index if not exists af_commission_rules_affiliate_idx
  on public.af_commission_rules (affiliate_id);

alter table public.af_affiliates
  drop constraint if exists af_affiliates_default_rule_fk;
alter table public.af_affiliates
  add constraint af_affiliates_default_rule_fk
  foreign key (default_commission_rule_id)
  references public.af_commission_rules (id) on delete set null;

create table if not exists public.af_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  ref text not null,
  target_url text not null,
  campaign text
);
create index if not exists af_links_affiliate_idx on public.af_links (affiliate_id);

create table if not exists public.af_conversions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_id uuid not null references public.af_sources (id),
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  external_id text not null,
  type text not null check (type in ('lead', 'sale')),
  occurred_at timestamptz not null,
  order_ref text,
  revenue_cents int not null default 0 check (revenue_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  intake_session_id uuid,
  raw jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  unique (source_id, external_id)
);
create index if not exists af_conversions_affiliate_idx
  on public.af_conversions (affiliate_id, occurred_at desc);

create table if not exists public.af_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  conversion_id uuid references public.af_conversions (id) on delete set null,
  kind text not null check (kind in ('accrual', 'adjustment', 'reversal', 'payout', 'fee')),
  amount_cents int not null,
  state text not null default 'pending' check (state in ('pending', 'approved', 'paid', 'rejected')),
  expected_cents int,
  period text not null,                              -- 'YYYY-MM' uit occurred_at (UTC)
  posted_at timestamptz not null default now(),
  source_id uuid references public.af_sources (id),
  reverses_entry_id uuid references public.af_ledger_entries (id),
  rule_snapshot jsonb not null default '{}'::jsonb,  -- bevroren winnende regel (herleiding)
  note text
);
create index if not exists af_ledger_affiliate_state_idx
  on public.af_ledger_entries (affiliate_id, state);

create table if not exists public.af_payouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  period text not null,
  total_cents int not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'sent', 'paid', 'failed')),
  bookkeeping_ref text,
  psp_ref text,
  paid_at timestamptz
);

create table if not exists public.af_payout_items (
  payout_id uuid not null references public.af_payouts (id) on delete cascade,
  ledger_entry_id uuid not null references public.af_ledger_entries (id) on delete cascade,
  primary key (payout_id, ledger_entry_id)
);

create table if not exists public.af_financial_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('commission_expense', 'payout')),
  period text not null,
  gross_cents int not null,
  vat_cents int not null default 0,
  counterparty text,
  state text not null default 'new' check (state in ('new', 'exported', 'error')),
  payload jsonb not null default '{}'::jsonb,
  exported_at timestamptz
);
create index if not exists af_financial_events_state_idx
  on public.af_financial_events (state);

create table if not exists public.af_daily_rollups (
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  day date not null,
  clicks int not null default 0,
  leads int not null default 0,
  sales int not null default 0,
  revenue_cents int not null default 0,
  commission_cents int not null default 0,
  primary key (affiliate_id, day)
);

-- RLS: aan op alle af_-tabellen, geen policies = deny-all; alleen service-role.
alter table public.af_sources          enable row level security;
alter table public.af_affiliates        enable row level security;
alter table public.af_commission_rules  enable row level security;
alter table public.af_links             enable row level security;
alter table public.af_conversions       enable row level security;
alter table public.af_ledger_entries    enable row level security;
alter table public.af_payouts           enable row level security;
alter table public.af_payout_items      enable row level security;
alter table public.af_financial_events  enable row level security;
alter table public.af_daily_rollups     enable row level security;

comment on table public.af_affiliates is
  'Eigen affiliate-programma (Rol 2, downstream). account_id nullable = naad naar login (fase 5). Service-role-only.';

insert into public.af_sources (kind, name) values
  ('manual', 'Handmatig'),
  ('csv', 'CSV-import')
on conflict (name) do nothing;
