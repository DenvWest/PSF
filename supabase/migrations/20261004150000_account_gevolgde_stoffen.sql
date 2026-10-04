-- Welke informatieve voedingsstoffen iemand wil volgen, naast de vijf
-- kernstoffen (BESLUIT_DOELEN_VERBONDEN_2026-10.md, punt 2 en "Herziening").
--
-- Eén rij per account, één lijst. Alle ingangen (Je doelen, de "+" in Je
-- patroon, later het dagboek) lezen en schrijven deze ene rij, zodat ze niet
-- uit elkaar kunnen lopen.
--
-- De sleutels zijn veldnamen uit VOLGBARE_VELDEN in
-- src/lib/account-gevolgde-stoffen.ts (bijv. fiberG, calciumMg). Geen
-- check-constraint op de waarden: de server valideert tegen die lijst, en een
-- veld dat later uit de lijst verdwijnt, moet een oude rij niet laten falen.
--
-- Zelfde opzet als account_macro_doelen: organization_id, RLS deny-all,
-- alleen server-side via service role.
create table if not exists public.account_gevolgde_stoffen (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  stoffen text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists account_gevolgde_stoffen_account_id_idx
  on public.account_gevolgde_stoffen (account_id);

alter table public.account_gevolgde_stoffen enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_gevolgde_stoffen is
  'Informatieve voedingsstoffen die iemand naast de vijf kernstoffen volgt (BESLUIT_DOELEN_VERBONDEN_2026-10.md). Eén rij per account; geen tekort-oordeel, geen /beste/*-route.';
comment on column public.account_gevolgde_stoffen.stoffen is
  'Veldnamen uit VOLGBARE_VELDEN (src/lib/account-gevolgde-stoffen.ts), in de volgorde waarin ze gekozen zijn.';
