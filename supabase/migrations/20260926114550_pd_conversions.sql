-- Plak 4b — conversie-inname upstream (pd_conversions + pd_ledger_entries).
-- Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C6.
--
-- Spiegelt af_conversions/af_ledger_entries (het eigen affiliate-programma,
-- geld eruit) — dit is de upstream-kant (geld erin, bij directe contracten).
-- click_token verwijst naar sup_clicks.click_token: dat is de koppeling die
-- attributie tot op productniveau mogelijk maakt, wat een netwerk (Daisycon)
-- niet biedt. Voor netwerk-retailers (relationship='network') blijft die
-- koppeling leeg — geen click_token-attributie, zie §C4-slot.
--
-- RLS deny-all, service-role-only — zelfde patroon als pd_*/af_*/sup_*.
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

alter table public.pd_contracts
  add column if not exists reporting_method text
    check (reporting_method in ('postback', 'import', 'manual')),
  add column if not exists reporting_cadence text;

comment on column public.pd_contracts.reporting_method is
  'Hoe deze partner conversies terugmeldt — onderhandeld per contract, zie docs/partners/SPEC_CLICK_TOKEN_TRACKING.md §3-5.';
comment on column public.pd_contracts.reporting_cadence is
  'Vrije tekst, bijv. "realtime", "maandelijks" — bij reporting_method=postback meestal "realtime".';

alter table public.pd_partners
  add column if not exists webhook_secret text;

comment on column public.pd_partners.webhook_secret is
  'Gedeeld geheim voor de postback (Authorization: Bearer <geheim>) — alleen gezet bij reporting_method=postback. Nooit hetzelfde geheim voor twee partners.';

create table if not exists public.pd_conversions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  contract_id uuid references public.pd_contracts (id) on delete set null,
  click_token text references public.sup_clicks (click_token) on delete set null,
  external_id text not null,
  type text not null check (type in ('lead', 'sale')),
  occurred_at timestamptz not null,
  order_ref text,
  revenue_cents int not null default 0 check (revenue_cents >= 0),
  commission_cents int check (commission_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ingest_method text not null check (ingest_method in ('postback', 'import', 'manual')),
  raw jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  unique (partner_id, external_id)
);
create index if not exists pd_conversions_partner_idx
  on public.pd_conversions (partner_id, occurred_at desc);
create index if not exists pd_conversions_click_token_idx
  on public.pd_conversions (click_token);

create table if not exists public.pd_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  partner_id uuid not null references public.pd_partners (id) on delete cascade,
  conversion_id uuid references public.pd_conversions (id) on delete set null,
  kind text not null check (kind in ('accrual', 'adjustment', 'reversal', 'payment_received')),
  amount_cents int not null,
  expected_cents int,
  state text not null default 'pending' check (state in ('pending', 'approved', 'paid', 'rejected')),
  period text not null,
  rule_snapshot jsonb not null default '{}'::jsonb,
  posted_at timestamptz not null default now(),
  note text
);
create index if not exists pd_ledger_entries_partner_state_idx
  on public.pd_ledger_entries (partner_id, state);

alter table public.pd_conversions    enable row level security;
alter table public.pd_ledger_entries enable row level security;

comment on table public.pd_conversions is
  'Upstream conversie-inname (geld erin, directe contracten). Spiegelt af_conversions. Service-role-only (RLS deny-all).';
comment on table public.pd_ledger_entries is
  'Upstream grootboek: expected_cents (uit commission-resolution.ts) vs. amount_cents (ontvangen) — het verschil is het afkeuringssignaal (pd_signals).';
