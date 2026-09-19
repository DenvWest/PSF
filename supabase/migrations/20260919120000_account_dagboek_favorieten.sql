-- Handmatig bewaarde dagboek-favorieten (ster-knop): een voedingsmiddel of
-- supplement dat de gebruiker wil terugvinden zonder opnieuw te zoeken.
--
-- Bewust een nieuwe tabel en geen hergebruik van account_favorites: die
-- tabel is gebouwd voor de leefstijlkeuze-context (kind: 'activiteit'|
-- 'supplement'|'dienst', domain, source, plus reminder-velden voor
-- inname-alerts). Daar betekent kind='supplement' "een supplement dat je
-- koos op het Keuze-scherm" — een andere betekenis dan "een catalogusproduct
-- dat ik in mijn dagboek wil kunnen hergebruiken". Hergebruik zou dat veld
-- laten botsen en sleept reminder-kolommen mee die hier niet gelden.
--
-- Geen titel-kolom: FOOD_CATALOG en SUPPLEMENT_CATALOG zijn altijd
-- client-side beschikbaar, dus een label wordt altijd via `key` opgezocht,
-- nooit opgeslagen. Dat scheelt een kolom en voorkomt dat een bewaarde titel
-- uit sync raakt met een catalogus-update.
--
-- organization_id, net als account_nutrition_daybook: dit is nieuwe code, dus
-- via orgScoped() (@/lib/db/scoped) i.p.v. de mono-allowlist in
-- organization-id-drift.test.ts — die lijst is voor bestaande drift, geen
-- vrijbrief voor nieuwe tabellen.
create table if not exists public.account_dagboek_favorieten (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  bron text not null check (bron in ('voeding', 'supplement')),
  key text not null,
  created_at timestamptz not null default now(),
  unique (account_id, bron, key)
);

create index if not exists account_dagboek_favorieten_account_id_idx
  on public.account_dagboek_favorieten (account_id);

alter table public.account_dagboek_favorieten enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_dagboek_favorieten is
  'Handmatig bewaarde dagboek-favorieten (ster-knop): een voedingsmiddel of supplement dat de gebruiker wil terugvinden zonder opnieuw te zoeken. Account-scoped, cascade bij verwijdering. Geen titel-kolom: het label komt altijd uit FOOD_CATALOG/SUPPLEMENT_CATALOG via key.';
comment on column public.account_dagboek_favorieten.bron is
  'voeding = sleutel in FOOD_CATALOG, supplement = sleutel in SUPPLEMENT_CATALOG.';
comment on column public.account_dagboek_favorieten.key is
  'Catalogussleutel binnen de gekozen bron. Alleen samen met bron uniek.';
