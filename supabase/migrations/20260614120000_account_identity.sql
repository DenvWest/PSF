-- F1.1 Identiteitslaag: pseudonieme accounts + magic-link tokens.
-- Opt-in duurzame identiteit bovenop anonieme intake-sessies; login via eenmalige,
-- gehashte magic-link tokens (TTL + one-time-use). Geen wachtwoorden.

create extension if not exists citext;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  status text not null default 'active',  -- 'active' | 'revoked'
  created_at timestamptz not null default now()
);

create index if not exists accounts_organization_id_idx
  on public.accounts (organization_id);

alter table public.accounts enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.accounts is
  'Opt-in pseudonieme identiteit (e-mail) bovenop anonieme intake-sessies; koppelt historie voor het dashboard. AVG: account_storage-consent in consent_records; revoke ontkoppelt sessies (account_id -> null).';

create table if not exists public.account_login_tokens (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists account_login_tokens_account_id_idx
  on public.account_login_tokens (account_id);

create index if not exists account_login_tokens_expires_at_idx
  on public.account_login_tokens (expires_at)
  where used_at is null;

alter table public.account_login_tokens enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_login_tokens is
  'Eenmalige magic-link tokens (alleen sha256-hash opgeslagen, raw uitsluitend in de mail); TTL via expires_at, one-time-use via used_at.';

-- Koppel anonieme sessies aan een account (nullable). ON DELETE SET NULL:
-- account verwijderen ontkoppelt sessies (anonimiseert) i.p.v. ze te vernietigen.
alter table public.intake_sessions
  add column if not exists account_id uuid references public.accounts (id) on delete set null;

create index if not exists intake_sessions_account_id_idx
  on public.intake_sessions (account_id);
