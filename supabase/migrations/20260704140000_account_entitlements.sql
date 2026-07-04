-- Account entitlements: billing-capabilities per account (trends, coach, q2).
-- Gevuld door Stripe-webhooks (fase 4); gelezen via service role in src/lib/db/entitlements.ts.

create table if not exists public.account_entitlements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  feature text not null check (feature in ('trends', 'coach', 'q2')),
  source text not null,
  valid_until timestamptz null,
  created_at timestamptz not null default now(),
  unique (account_id, feature)
);

create index if not exists account_entitlements_account_id_idx
  on public.account_entitlements (account_id);

alter table public.account_entitlements enable row level security;

comment on table public.account_entitlements is
  'Account-niveau premium-capabilities; service-role-only. Effectieve toegang = org maxTier ∩ entitlement (toekomst).';
