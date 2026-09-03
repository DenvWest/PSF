-- Terugblik op een gepland agendamoment: "hoe ging het?" na afloop.
--
-- Hangt aan een agenda_blocks-rij, niet aan een favoriet: de vraag gaat over
-- een moment dat voorbij is, niet over een keuze die staat. Eén antwoord per
-- blok — de unique constraint dwingt af dat dezelfde vraag nooit twee keer
-- gesteld en beantwoord wordt.
--
-- Bewust GEEN score-veld en geen relatie naar intake_log: dit is
-- zelfrapportage over één actie en mag nooit een voedingsscore beïnvloeden
-- die uit de check komt. Zelfde lock als bij beweging (minuten = evidence,
-- nooit een tweede score).
--
-- Account-scoped, RLS deny-all — alleen service_role via API-routes.
create table if not exists public.account_action_reflections (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  -- Meebewegen met agenda_blocks, dat de kolom al draagt. De naad blijft
  -- ongebruikt zolang het platform mono-tenant is; hem nu leggen is goedkoper
  -- dan een backfill later (zie organization-id-drift.test.ts).
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  block_id uuid not null references public.agenda_blocks (id) on delete cascade,
  domain text not null,
  answer text not null check (answer in ('gelukt', 'deels', 'niet')),
  created_at timestamptz not null default now(),
  unique (account_id, block_id)
);

create index if not exists account_action_reflections_account_id_idx
  on public.account_action_reflections (account_id, created_at desc);

alter table public.account_action_reflections enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_action_reflections is
  'Terugblik van de gebruiker op een gepland agendamoment (gelukt/deels/niet). Eén per blok. Zelfrapportage: raakt nooit een check-score.';

comment on column public.account_action_reflections.block_id is
  'Het agenda_blocks-moment waar deze terugblik over gaat. Cascade: blok weg = terugblik weg.';

comment on column public.account_action_reflections.answer is
  'gelukt | deels | niet. Vaste enum, geen vrije tekst — vrije tekst hoort nooit in een event-pad.';
