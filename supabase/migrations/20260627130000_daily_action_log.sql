-- Kompas dag-tracker: dagelijkse afvink-log per account en leefstijldomein (Fase 5a).
-- Account-scoped, dagelijks resetbaar (uniek per dag). RLS aan, alleen service_role via API.
create table if not exists public.daily_action_log (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  domain text not null,
  action_key text not null,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (account_id, domain, action_key, log_date)
);

create index if not exists daily_action_log_account_date_idx
  on public.daily_action_log (account_id, log_date);

create index if not exists daily_action_log_organization_id_idx
  on public.daily_action_log (organization_id);

alter table public.daily_action_log enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.daily_action_log is
  'Kompas dag-tracker: dagelijkse afvink-log per account en leefstijldomein. Account-scoped, cascadeert bij account-verwijdering, uniek per (account, domein, actie, dag). Niet-medisch — reflectie van eigen gedrag.';
