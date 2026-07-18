-- Persoonlijke leefstijlplanner: door de gebruiker toegevoegde dagblokken (routines).
-- Account-scoped, RLS deny-all — alleen service_role via API.
create table if not exists public.agenda_blocks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  date date not null,
  category_id text not null,
  title text not null,
  start_time text not null,
  end_time text not null,
  source text not null default 'routine',
  status text not null default 'open',
  external_provider text,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agenda_blocks_account_date_idx
  on public.agenda_blocks (account_id, date);

create index if not exists agenda_blocks_organization_id_idx
  on public.agenda_blocks (organization_id);

alter table public.agenda_blocks enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.agenda_blocks is
  'Agenda dagblokken: door gebruiker toegevoegde routines met categorie, titel en tijdvenster. Account-scoped, cascade bij verwijdering. external_* kolommen gereserveerd voor latere koppelingen.';
