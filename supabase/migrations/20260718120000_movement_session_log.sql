-- Bewegingssessie-log: zelfgerapporteerde sessies (modaliteit + minuten) per account (P2 gedaan-log).
-- Evidence-reeks NÁÁST de scorelijn — geen domeinscore, geen tweede scoringswaarheid.
-- Meerdere sessies per dag toegestaan (geen unique). RLS aan: alleen service_role via account-API.
-- Zie docs/core/VERWERKINGSREGISTER.md §15 + docs/core/DPIA.md §1.3/§1.5.
create table if not exists public.movement_session_log (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  log_date date not null,
  modality_id text not null,
  minutes integer not null check (minutes > 0 and minutes <= 600),
  source text not null default 'self_report',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists movement_session_log_account_date_idx
  on public.movement_session_log (account_id, log_date);

create index if not exists movement_session_log_organization_id_idx
  on public.movement_session_log (organization_id);

alter table public.movement_session_log enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.movement_session_log is
  'Bewegingssessie-log: zelfgerapporteerde sessies (modaliteit + minuten) per account. Evidence-reeks naast de scorelijn, geen domeinscore. Account-scoped, cascadeert bij account-verwijdering, meerdere sessies per dag mogelijk. Zie VERWERKINGSREGISTER §15.';
