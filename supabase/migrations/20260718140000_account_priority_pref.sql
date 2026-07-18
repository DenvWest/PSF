-- Account-scoped focus-voorkeur: welk interventiedomein de gebruiker als vertrekpunt kiest
-- en optioneel tijdvak (ochtend/middag/avond). RLS deny-all — alleen service_role via API.
create table if not exists public.account_priority_pref (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  pillar_id text not null,
  source text not null default 'user_selected',
  time_bucket text,
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists account_priority_pref_account_idx
  on public.account_priority_pref (account_id);

alter table public.account_priority_pref enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_priority_pref is
  'Dashboard focus-voorkeur per account: gekozen interventiedomein + dagdeel-bucket. Geen scores of profiellabels — alleen pillar_id enum en source. Account-scoped, cascade bij verwijdering.';
