-- nevo_foods — NEVO-online voedingsmiddelen, ongewijzigd, per 100 g/ml.
--
-- ## Waarom een eigen tabel (en niet sm_products)
--
-- sm_products bevat uitsluitend Open Food Facts-rijen: die tabel moet als geheel
-- onder de ODbL aangeboden kunnen worden (ODbL §4.4.d). NEVO heeft andere
-- voorwaarden (RIVM, versie 2025/9.0): alleen in ongewijzigde vorm, met bron en
-- versienummer, en niet in rekening te brengen bij eindgebruikers. Twee
-- licentielagen horen niet in één tabel. Zie
-- docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md §7 en
-- docs/plan/BESLUIT_NEVO_BRONVERMELDING.md.
--
-- ## Ongewijzigd
--
-- Elke waarde staat hier zoals het brondbestand haar geeft, in de eenheid van
-- het brondbestand (de loader weigert een afwijkende eenheid). Geen afronding,
-- geen omrekening. De decimale komma is een punt (representatie).
--   - NEVO "TR" (spoor, waarde 0 als plaatshouder) is GEEN gehalte: de kolom
--     blijft null en de stofcode staat in "spoor".
--   - NEVO "+" (waarde komt door verrijking) staat in "verrijkt".
--   - null = NEVO meet de stof niet voor dit voedingsmiddel (nooit een 0).
-- Omega-3 (EPA/DHA) staat bewust NIET in deze tabel: onze EPA+DHA-som is een
-- bewerking van de brondata, en dat staan de voorwaarden niet toe.
--
-- nevo_versie staat per rij, zodat een nieuwe NEVO-versie een herhaalbare
-- import is (upsert op nevo_code) en de oude versie aantoonbaar vervangen is.
--
-- Geen organization_id: gedeelde referentiedata, identiek voor elke tenant
-- (zelfde reden als sm_products). Code leest via unscoped().
-- Een dagboeklog verwijst via prod_id "nevo:<nevo_code>" en bewaart nooit een
-- voedingswaarde. Bewust geen foreign key.
--
-- pg_trgm: zie de toelichting bij 20261003090000_sm_products.sql.
create extension if not exists pg_trgm with schema extensions;

create table if not exists public.nevo_foods (
  nevo_code text primary key check (char_length(nevo_code) between 1 and 16),
  nevo_versie text not null check (char_length(nevo_versie) between 1 and 16),
  groep text not null check (char_length(groep) between 1 and 200),
  naam_nl text not null check (char_length(naam_nl) between 1 and 300),
  naam_en text check (naam_en is null or char_length(naam_en) <= 300),
  per text not null check (per in ('100g', '100ml')),

  zoek_tekst text not null,
  naam_lengte integer generated always as (char_length(naam_nl)) stored,

  -- Eenheden zoals NEVO ze publiceert.
  energy_kcal numeric(8, 2) check (energy_kcal is null or energy_kcal >= 0),
  protein_g numeric(8, 2) check (protein_g is null or protein_g >= 0),
  fat_g numeric(8, 2) check (fat_g is null or fat_g >= 0),
  saturated_fat_g numeric(8, 2) check (saturated_fat_g is null or saturated_fat_g >= 0),
  carbohydrate_g numeric(8, 2) check (carbohydrate_g is null or carbohydrate_g >= 0),
  sugars_g numeric(8, 2) check (sugars_g is null or sugars_g >= 0),
  fiber_g numeric(8, 2) check (fiber_g is null or fiber_g >= 0),
  sodium_mg numeric(10, 2) check (sodium_mg is null or sodium_mg >= 0),
  potassium_mg numeric(10, 2) check (potassium_mg is null or potassium_mg >= 0),
  calcium_mg numeric(10, 2) check (calcium_mg is null or calcium_mg >= 0),
  magnesium_mg numeric(10, 2) check (magnesium_mg is null or magnesium_mg >= 0),
  iron_mg numeric(10, 3) check (iron_mg is null or iron_mg >= 0),
  zinc_mg numeric(10, 3) check (zinc_mg is null or zinc_mg >= 0),
  vitamin_d_ug numeric(10, 3) check (vitamin_d_ug is null or vitamin_d_ug >= 0),
  vitamin_b12_ug numeric(10, 3) check (vitamin_b12_ug is null or vitamin_b12_ug >= 0),
  vitamin_c_mg numeric(10, 3) check (vitamin_c_mg is null or vitamin_c_mg >= 0),

  -- Kolomnamen (bijv. 'iron_mg') waarvan NEVO "TR" meldt resp. "+".
  spoor text[] not null default '{}',
  verrijkt text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nevo_foods_zoek_tekst_trgm_idx
  on public.nevo_foods using gin (zoek_tekst gin_trgm_ops);

alter table public.nevo_foods enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.nevo_foods is
  'NEVO-online voedingsmiddelen per 100 g/ml, ongewijzigd uit het RIVM-brondbestand (nevo_versie per rij). Eigen tabel naast sm_products (Open Food Facts, ODbL). Geen omega-3. Zie BESLUIT_NEVO_BRONVERMELDING.md.';
comment on column public.nevo_foods.nevo_code is
  'NEVO-code. Dit is wat een dagboeklog opslaat als prod_id "nevo:<nevo_code>" — verwijzen, niet kopiëren.';
comment on column public.nevo_foods.spoor is
  'Kolommen waarvan NEVO spoor (TR) meldt; de waarde is dan null, want de 0 in het bestand is een plaatshouder.';
