-- 2+2-dagboek: twee doordeweekse dagen, twee weekenddagen.
--
-- Waarom naast intake_intake_log en niet erin: die tabel draagt de
-- frequentie-check ("hoe vaak meestal"), een schatting over weken. Dit draagt
-- geregistreerde dagen — een steekproef van het werkelijke patroon. Twee
-- verschillende soorten waarnemingen; ze in één tabel persen zou betekenen dat
-- geen enkele lezer nog weet welke van de twee hij voor zich heeft.
--
-- Bewust GEEN score-, calorie- of gram-kolom. Het dagboek verrijkt de readout
-- van laag 5 en voedt nooit nutrition-score.ts. Zelfde lock als bij beweging
-- (minuten = evidence, nooit een tweede score).
--
-- Account-scoped, RLS deny-all — alleen service_role via API-routes.
create table if not exists public.account_nutrition_daybook (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  -- De geregistreerde dag zelf, niet het moment van invullen.
  entry_date date not null,
  day_kind text not null check (day_kind in ('doordeweeks', 'weekend')),
  -- Porties per voedselgroep: { "groente": 3, "fruit": 2, ... }. Dezelfde
  -- zeven groepen als de categorietabel op laag 1, zodat dagboek en check
  -- tegen elkaar te leggen zijn.
  portions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  -- Eén registratie per dag: een dag twee keer invullen overschrijft, want je
  -- herinnering aan gisteren wordt niet beter door hem twee keer op te schrijven.
  unique (account_id, entry_date)
);

create index if not exists account_nutrition_daybook_account_id_idx
  on public.account_nutrition_daybook (account_id, entry_date desc);

alter table public.account_nutrition_daybook enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_nutrition_daybook is
  '2+2-dagboek: porties per voedselgroep op twee doordeweekse en twee weekenddagen. Steekproef van het eetpatroon, geen boekhouding — raakt nooit een check-score.';

comment on column public.account_nutrition_daybook.day_kind is
  'doordeweeks | weekend. Afgeleid van entry_date bij invoer; opgeslagen zodat de telling niet elke keer de kalender hoeft te raadplegen.';

comment on column public.account_nutrition_daybook.portions is
  'Porties per voedselgroep-id. Ontbrekende groep betekent niet-ingevuld, niet nul.';
