-- Verpakte voedingsproducten met etiketwaarden (calorieën, macro's, brede
-- micronutriënten) voor het dagboek — puur informatief, los van het
-- tekortsysteem en zonder /beste/*-uitgang.
--
-- Zie docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md en
-- docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §0.1/§3.
--
-- ## Waarom een tabel en geen bestand in de bundel
--
-- De eerste dataset (36.000 producten) was 15 MB als JSON en zou in de
-- clientbundel van het dagboek belanden. Dit is referentiedata die
-- server-side wordt doorzocht (trigram-index) en per product wordt opgehaald.
--
-- ## Waarom `bron` voorlopig alleen 'off' toestaat
--
-- Elke bron heeft eigen licentievoorwaarden. Open Food Facts valt onder de
-- ODbL (share-alike): de tabel met die rijen moet als geheel onder ODbL
-- aangeboden kunnen worden, en mag dus geen rijen uit een andere bron
-- bevatten (ODbL §4.4.d; docs/plan/JURIDISCHE_ANALYSE_SUPERMARKTDATA_2026-10.md).
-- De check hieronder maakt van "een tweede bron erbij" een bewuste migratie na
-- een licentiebeoordeling, in plaats van een rij die er stilletjes tussen glipt.
--
-- ## Verwijzen, niet kopiëren
--
-- account_supermarkt_portie_logs bewaart alleen prod_id + gram, nooit een
-- voedingswaarde. Dagtotalen worden bij het uitlezen berekend uit deze tabel.
-- Dat houdt de dagboektabel een onafhankelijke databank (ODbL §4.5.a) en
-- voorkomt dat gezondheidsgegevens (AVG art. 9) gekoppeld raken aan een
-- share-alike-databank. Daarom bewust GEEN foreign key vanuit de logs: een
-- product dat uit een toekomstige dump verdwijnt, mag de dagboekregel van een
-- gebruiker niet meenemen. Rijen worden bij een verversing geüpsert, niet
-- verwijderd.
--
-- Geen organization_id: dit is gedeelde referentiedata, identiek voor elke
-- tenant (zelfde reden als een voedingsmiddelentabel). Code leest hem via
-- unscoped() (@/lib/db/scoped).
--
-- pg_trgm: Supabase installeert extensies standaard in schema "extensions",
-- dat in de search_path van de SQL Editor staat. Geeft de index-regel een
-- foutmelding over gin_trgm_ops, controleer dan met
--   select extname, extnamespace::regnamespace from pg_extension where extname = 'pg_trgm';
-- in welk schema de extensie staat en kwalificeer de opclass daarmee.
create extension if not exists pg_trgm with schema extensions;

create table if not exists public.sm_products (
  prod_id text primary key,
  bron text not null check (bron in ('off')),
  bron_id text not null check (char_length(bron_id) between 1 and 64),
  snapshot_datum date not null,

  naam text not null check (char_length(naam) between 1 and 300),
  merk text check (merk is null or char_length(merk) <= 200),
  categorie text check (categorie is null or char_length(categorie) <= 300),

  -- Genormaliseerde zoektekst (kleine letters, zonder accenten), door de
  -- schrijver gevuld met dezelfde functie als de zoekopdracht
  -- (normaliseerZoektekst in src/lib/supermarkt-products.ts). Geen generated
  -- column: unaccent() is niet immutable en mag daar dus niet in.
  zoek_tekst text not null,
  -- Kortste naam eerst bij gelijke treffers: de generieke variant boven de
  -- uitgebreide ("Havermelk" boven "Havermelk barista extra schuim 1 l").
  naam_lengte integer generated always as (char_length(naam)) stored,

  -- Per 100 g/ml, zoals op het etiket. null = onbekend, nooit een verzonnen 0.
  -- De grenzen vangen onmogelijke waarden (kJ/kcal verwisseld, kolomverschuiving):
  -- 134 van 35.517 rijen in de eerste dataset waren zo kapot.
  energy_kcal numeric(7, 1) check (energy_kcal is null or energy_kcal between 0 and 900),
  fat_g numeric(6, 2) check (fat_g is null or fat_g between 0 and 100),
  saturated_fat_g numeric(6, 2) check (saturated_fat_g is null or saturated_fat_g between 0 and 100),
  carbohydrate_g numeric(6, 2) check (carbohydrate_g is null or carbohydrate_g between 0 and 100),
  sugars_g numeric(6, 2) check (sugars_g is null or sugars_g between 0 and 100),
  fiber_g numeric(6, 2) check (fiber_g is null or fiber_g between 0 and 100),
  protein_g numeric(6, 2) check (protein_g is null or protein_g between 0 and 100),
  salt_g numeric(6, 2) check (salt_g is null or salt_g between 0 and 100),
  sodium_mg numeric(9, 1) check (sodium_mg is null or sodium_mg >= 0),
  calcium_mg numeric(9, 1) check (calcium_mg is null or calcium_mg >= 0),
  iron_mg numeric(9, 2) check (iron_mg is null or iron_mg >= 0),
  vitamin_c_mg numeric(9, 2) check (vitamin_c_mg is null or vitamin_c_mg >= 0),
  vitamin_d_ug numeric(9, 2) check (vitamin_d_ug is null or vitamin_d_ug >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sm_products_prod_id_klopt check (prod_id = bron || ':' || bron_id),
  constraint sm_products_bron_unique unique (bron, bron_id)
);

create index if not exists sm_products_zoek_tekst_trgm_idx
  on public.sm_products using gin (zoek_tekst gin_trgm_ops);

alter table public.sm_products enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.sm_products is
  'Verpakte voedingsproducten met etiketwaarden per 100 g/ml (informatief, geen tekort-oordeel). Eén tabel per licentielaag: bron staat voorlopig alleen op off (Open Food Facts, ODbL). Zie ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md.';
comment on column public.sm_products.prod_id is
  '<bron>:<bron_id>. Dit is wat account_supermarkt_portie_logs.prod_id opslaat — verwijzen, niet kopiëren.';
comment on column public.sm_products.snapshot_datum is
  'Datum van de dump waaruit deze rij komt (bronvermelding en versheid).';
comment on column public.sm_products.zoek_tekst is
  'Naam + merk, kleine letters, zonder accenten. Gevuld door de schrijver, niet door een generated column.';
