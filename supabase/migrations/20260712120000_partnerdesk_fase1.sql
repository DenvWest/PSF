-- PartnerDesk fase 1 — het dossier.
-- Single-tenant affiliate-managementplatform, ingebed in de psf-admin onder /admin.
-- Alle tabellen: RLS aan zonder policies (deny-all); toegang uitsluitend server-side
-- via createSupabaseAdmin() (service role). Nooit via de anon-client benaderen.
-- Zie docs/plan/PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md (§2, §16).
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.
-- F2/F3-kolommen (product_id op regels, feed_id op taken) komen in migratie 002/003.

-- ── Systeemlaag: netwerken, categorieën, labels ─────────────────────────────

create table if not exists public.pd_networks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  kind text not null default 'network' check (kind in ('network', 'direct')),
  login_url text,
  notes text
);

create table if not exists public.pd_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  parent_id uuid references public.pd_categories (id) on delete set null,
  unique (parent_id, name)
);

create table if not exists public.pd_labels (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  color text not null default 'gray'
);

-- ── Dossierlaag: partners + relaties ────────────────────────────────────────

create table if not exists public.pd_partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  network_id uuid not null references public.pd_networks (id),
  slug text not null unique,
  name text not null,
  status text not null default 'onboarding'
    check (status in ('onboarding', 'active', 'paused', 'ended')),
  website text,
  logo_path text,
  login_url text,
  login_username text,
  account_manager text,
  category_id uuid references public.pd_categories (id) on delete set null,
  description text,
  is_sole_proprietor boolean not null default false,
  archived_at timestamptz
);
create index if not exists pd_partners_status_idx on public.pd_partners (status);
create index if not exists pd_partners_network_idx on public.pd_partners (network_id);

create table if not exists public.pd_partner_labels (
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  label_id uuid not null references public.pd_labels (id) on delete cascade,
  primary key (partner_id, label_id)
);

create table if not exists public.pd_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  linkedin_url text,
  responsibility text,
  is_primary boolean not null default false,
  notes text,
  last_contact_at timestamptz,
  archived_at timestamptz
);
create index if not exists pd_contacts_partner_idx on public.pd_contacts (partner_id);
create unique index if not exists pd_contacts_email_uq
  on public.pd_contacts (partner_id, email)
  where email is not null and archived_at is null;
create unique index if not exists pd_contacts_primary_uq
  on public.pd_contacts (partner_id)
  where is_primary and archived_at is null;

create table if not exists public.pd_contracts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  number text not null,
  starts_on date not null,
  ends_on date,
  notice_period_days int check (notice_period_days >= 0),
  cancel_by date generated always as (ends_on - notice_period_days) stored,
  cookie_days int check (cookie_days >= 0),
  approval_terms text,
  exclusivity text,
  auto_renews boolean not null default false,
  notes text,
  archived_at timestamptz,
  unique (partner_id, number)
);
create index if not exists pd_contracts_partner_idx on public.pd_contracts (partner_id);
create index if not exists pd_contracts_ends_on_idx on public.pd_contracts (ends_on);
create index if not exists pd_contracts_cancel_by_idx on public.pd_contracts (cancel_by);

create table if not exists public.pd_commission_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contract_id uuid not null references public.pd_contracts (id) on delete cascade,
  kind text not null
    check (kind in ('cps_percent', 'cps_fixed', 'cpl', 'cpc', 'cpa')),
  rate_percent numeric(5, 2) check (rate_percent between 0 and 100),
  amount_cents int check (amount_cents >= 0),
  scope text not null default 'all' check (scope in ('all', 'category')),
  category_id uuid references public.pd_categories (id) on delete set null,
  rule_type text not null default 'standard'
    check (rule_type in ('standard', 'exception', 'promo', 'bonus')),
  valid_from date,
  valid_to date,
  bonus_terms text,
  notes text,
  archived_at timestamptz,
  -- precies één van rate_percent / amount_cents, passend bij kind
  check (
    (kind = 'cps_percent' and rate_percent is not null and amount_cents is null)
    or (kind <> 'cps_percent' and amount_cents is not null and rate_percent is null)
  )
);
create index if not exists pd_commission_rules_contract_idx
  on public.pd_commission_rules (contract_id);

create table if not exists public.pd_commission_tiers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  commission_rule_id uuid not null
    references public.pd_commission_rules (id) on delete cascade,
  threshold_cents int not null check (threshold_cents >= 0),
  rate_percent numeric(5, 2),
  amount_cents int,
  unique (commission_rule_id, threshold_cents)
);
create index if not exists pd_commission_tiers_rule_idx
  on public.pd_commission_tiers (commission_rule_id);

-- ── Tijdlijn, taken, documenten, signalen ───────────────────────────────────

create table if not exists public.pd_timeline_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  actor text not null check (actor in ('user', 'system', 'ai')),
  kind text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  contact_id uuid references public.pd_contacts (id) on delete set null,
  contract_id uuid references public.pd_contracts (id) on delete set null
);
create index if not exists pd_timeline_events_partner_idx
  on public.pd_timeline_events (partner_id, occurred_at desc);

create table if not exists public.pd_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  contract_id uuid references public.pd_contracts (id) on delete set null,
  timeline_event_id uuid references public.pd_timeline_events (id) on delete set null,
  kind text not null default 'other'
    check (kind in ('contract', 'terms', 'manual', 'rate_card',
                    'banner', 'logo', 'screenshot', 'other')),
  title text not null,
  storage_path text not null,
  mime_type text,
  file_size int,
  origin text,
  version int not null default 1
);
create index if not exists pd_documents_partner_idx on public.pd_documents (partner_id);

create table if not exists public.pd_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid references public.pd_partners (id) on delete cascade,
  contract_id uuid references public.pd_contracts (id) on delete cascade,
  title text not null,
  notes text,
  due_on date,
  status text not null default 'open' check (status in ('open', 'done', 'dismissed')),
  source text not null default 'manual' check (source in ('manual', 'system', 'signal')),
  dedupe_key text unique,
  completed_at timestamptz
);
create index if not exists pd_tasks_status_due_idx on public.pd_tasks (status, due_on);

create table if not exists public.pd_signals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null,
  severity text not null check (severity in ('red', 'amber')),
  subject_type text not null,
  subject_id uuid not null,
  partner_id uuid references public.pd_partners (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'snoozed', 'resolved')),
  snoozed_until date,
  snooze_reason text,
  reopen_count int not null default 0,
  dedupe_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists pd_signals_status_idx on public.pd_signals (status, severity);
create index if not exists pd_signals_partner_idx on public.pd_signals (partner_id);

-- ── Werk-state: opgeslagen weergaven, voorkeuren, instellingen, recent ───────

create table if not exists public.pd_saved_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  module text not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb
);

create table if not exists public.pd_user_prefs (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.pd_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.pd_recent_visits (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid not null,
  visited_at timestamptz not null default now(),
  unique (subject_type, subject_id)
);

-- ── RLS: aan op alle tabellen, geen policies = deny-all voor anon/authenticated ─
-- De service-role-key (server-side) omzeilt RLS; de publieke anon-key krijgt niets.

alter table public.pd_networks         enable row level security;
alter table public.pd_categories       enable row level security;
alter table public.pd_labels           enable row level security;
alter table public.pd_partners         enable row level security;
alter table public.pd_partner_labels   enable row level security;
alter table public.pd_contacts         enable row level security;
alter table public.pd_contracts        enable row level security;
alter table public.pd_commission_rules enable row level security;
alter table public.pd_commission_tiers enable row level security;
alter table public.pd_timeline_events  enable row level security;
alter table public.pd_documents        enable row level security;
alter table public.pd_tasks            enable row level security;
alter table public.pd_signals          enable row level security;
alter table public.pd_saved_views      enable row level security;
alter table public.pd_user_prefs       enable row level security;
alter table public.pd_settings         enable row level security;
alter table public.pd_recent_visits    enable row level security;

comment on table public.pd_partners is
  'PartnerDesk: het dossier-anker. Service-role-only (RLS deny-all). Zie PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md.';

-- ── Seeds: netwerken + basiscategorieën zodat het "+ Partner"-formulier werkt ─

insert into public.pd_networks (name, kind, login_url) values
  ('Daisycon', 'network', 'https://www.daisycon.com/nl/login/'),
  ('Arctic Blue', 'direct', null)
on conflict (name) do nothing;

insert into public.pd_categories (name)
select v.name
from (values ('Slaap'), ('Stress'), ('Energie'), ('Herstel'), ('Algemeen')) as v(name)
where not exists (
  select 1 from public.pd_categories c
  where c.name = v.name and c.parent_id is null
);
