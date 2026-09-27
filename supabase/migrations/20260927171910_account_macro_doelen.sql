-- Eigen macro/calorie-doel (Laag C) — 100% gebruikersinvoer, geen berekening.
--
-- ## Waarom dit een nieuwe tabel is en geen kolom op account_voedingsdoelen
--
-- Het commentaar op account_voedingsdoelen.eiwit_doel_g legt uit waarom die
-- tabel bewust geen calorieën/macro's droeg: een caloriedoel stelt een
-- bovengrens-vraag ("heb ik te veel gegeten?") aan data die het tekortsysteem
-- alleen als ondergrens kan bewijzen. Dat bezwaar gold specifiek de vraag "is
-- dit te veel" naast de vijf kernstoffen.
--
-- BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md herroept dat bezwaar
-- voor calorieën/macro's/brede micronutriënten als *informatie* (§0/§3) —
-- maar het doel dat hier wordt opgeslagen hoort niet bij die eiwitdoel-tabel:
-- eiwit_doel_g is een *overschrijving* van een gepubliceerde formule
-- (PROT-AGE/ESPEN, protein-target.ts), dit doel draagt geen enkele formule en
-- is 100% door de gebruiker ingevuld (§4). Twee verschillende soorten
-- "doel" — vermengen zou de een de claim-status van de ander laten aannemen.
--
-- ## Waarom er geen berekening/normalisatie in de database zit
--
-- §4 van het besluit: het systeem berekent het doel niet voor. Geen
-- ingebouwde 50/30/20-standaard, geen check dat de percentages optellen tot
-- 100 — dat zou een vorm van voorstellen zijn. Wat iemand invult, wordt
-- opgeslagen zoals ingevuld; de UI (MacroDoelenKaart) toont het terug als
-- "jouw ingestelde verdeling", nooit als "aanbevolen" of "optimaal".
--
-- Zelfde opzet als account_voedingsdoelen: organization_id via orgScoped()
-- (@/lib/db/scoped), RLS deny-all, alleen server-side via service role, één
-- rij per account.
create table if not exists public.account_macro_doelen (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  -- Optionele calorierichtlijn. Ruim begrensd (geen fysiologische grens
  -- opgelegd door dit systeem — dat zou zelf een vorm van berekenen zijn).
  calorieen_kcal smallint check (calorieen_kcal is null or (calorieen_kcal between 500 and 6000)),
  -- Macro-verdeling in gewichtspercentage van de calorieën, elk optioneel en
  -- onafhankelijk van de andere twee — geen constraint dat ze optellen tot
  -- 100: dat zou een correctie zijn op wat iemand zelf invulde.
  koolhydraten_pct smallint check (koolhydraten_pct is null or (koolhydraten_pct between 0 and 100)),
  vet_pct smallint check (vet_pct is null or (vet_pct between 0 and 100)),
  eiwit_pct smallint check (eiwit_pct is null or (eiwit_pct between 0 and 100)),
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists account_macro_doelen_account_id_idx
  on public.account_macro_doelen (account_id);

alter table public.account_macro_doelen enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_macro_doelen is
  'Eigen macro/calorie-doel (Laag C, BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §1/§4): 100% gebruikersinvoer, geen formule, geen vooringevulde vuistregel. Eén rij per account. Voedt de Doel-kolom in het dagboek-weekoverzicht (Laag B), nooit een tekort-oordeel.';
comment on column public.account_macro_doelen.calorieen_kcal is
  'Optionele zelf ingestelde calorierichtlijn. Null = geen doel ingesteld, de UI toont dan "nog niet ingesteld", nooit een berekend of vooringevuld getal.';
comment on column public.account_macro_doelen.koolhydraten_pct is
  'Zelf ingesteld gewichtspercentage koolhydraten. Onafhankelijk van vet_pct/eiwit_pct — geen 100%-constraint, dat zou het systeem laten corrigeren wat iemand invulde.';
comment on column public.account_macro_doelen.vet_pct is
  'Zelf ingesteld gewichtspercentage vet. Zie koolhydraten_pct voor de reden zonder som-constraint.';
comment on column public.account_macro_doelen.eiwit_pct is
  'Zelf ingesteld gewichtspercentage eiwit. Los van eiwit_doel_g in account_voedingsdoelen (dat is een gram-overschrijving van de PROT-AGE-formule); dit veld hoort bij de macro-verdeling zonder formule.';
