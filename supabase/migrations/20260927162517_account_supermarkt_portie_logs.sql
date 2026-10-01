-- Losse portie-logs van supermarktproducten (Laag A, calorieën/macro's) —
-- puur informatief, los van het tekortsysteem.
--
-- Zie docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §0.1:
-- twee lagen met een harde knip. Het tekortsysteem
-- (account_nutrition_daybook.items, DagboekItem) draagt de vijf kernstoffen
-- mét tekort-oordeel en /beste/*-uitgang. Deze tabel draagt calorieën/macro's
-- zonder oordeel en zonder affiliate-keten — een aparte tabel, geen kolom op
-- account_nutrition_daybook, om diezelfde reden als
-- account_dagboek_favorieten al een eigen tabel is: een ander soort veld
-- hoort niet in een rij die voor iets anders is opgezet.
--
-- Geen unique-constraint (in tegenstelling tot account_dagboek_favorieten):
-- hetzelfde product mag meerdere keren per dag gelogd worden (ontbijt +
-- lunch), dus elke log is een los event met een eigen id, niet een upsert op
-- (account_id, prodId).
--
-- entry_date staat apart van created_at zodat een log met terugwerkende
-- kracht op een andere dag geboekt kan worden (zelfde patroon als
-- account_nutrition_daybook.entry_date) zonder dat created_at (audit-tijdstip
-- van de insert) daarvoor hoeft te wijken.
--
-- organization_id, net als account_nutrition_daybook en
-- account_dagboek_favorieten: nieuwe code via orgScoped() (@/lib/db/scoped).
create table if not exists public.account_supermarkt_portie_logs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  entry_date date not null,
  moment text not null,
  prod_id text not null,
  grams integer not null check (grams > 0 and grams <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists account_supermarkt_portie_logs_account_date_idx
  on public.account_supermarkt_portie_logs (account_id, entry_date);

alter table public.account_supermarkt_portie_logs enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_supermarkt_portie_logs is
  'Losse portie-logs van supermarktproducten (Laag A): calorieën/macro-informatie, geen tekort-oordeel, geen /beste/*-uitgang. Zie BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §0.1. Puur additief naast account_nutrition_daybook.items — geen upsert-sleutel, elk log is een los event.';
comment on column public.account_supermarkt_portie_logs.prod_id is
  'Sleutel in SUPERMARKT_CATALOG (src/data/nutrition/supermarkt-catalog.ts), niet in FOOD_CATALOG of SUPPLEMENT_CATALOG.';
comment on column public.account_supermarkt_portie_logs.moment is
  'EetmomentId (nutrition-eetmomenten.ts), als vrije tekst opgeslagen — zelfde patroon als DagboekItem.moment.';
comment on column public.account_supermarkt_portie_logs.grams is
  'Gewicht in gram. Bovengrens 2000 g, zelfde MAX_GRAMS-conventie als nutrition-dagboek-items.ts.';
