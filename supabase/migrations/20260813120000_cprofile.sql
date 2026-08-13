-- Connection Profile: de identiteitslaag voor verbinding.
-- Zie docs/design/BESLUIT_CONNECTION_PROFILE_V1_2026-08.md.
--
-- FIREWALL (§7): deze tabellen hebben BEWUST geen enkele relatie met
-- intake_sessions, intake_domain_checkin of domain_scores. Gezondheidsdata
-- (CON_*) mag dit profiel nooit vullen, sturen of eruit worden afgeleid.
-- account_id is wél gedeeld — het is dezelfde ingelogde persoon — waardoor een
-- join technisch mogelijk is. Die grens wordt in code bewaakt door
-- src/lib/connection-profile/__tests__/firewall.test.ts.
--
-- Twee tabellen, geen acht: alle multi-selects delen één tag-tabel met een
-- `kind`-discriminator. Een nieuw kenmerk toevoegen is dan een nieuwe kind-waarde
-- plus een tag in src/data/connection/vocabulary.ts — geen DDL, geen migratie.
--
-- RLS deny-all: uitsluitend service_role via API-routes, zoals pd_* en af_*.

create table if not exists public.cprofile_profile (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  -- Alleen de eerste 2 cijfers van de postcode. Nooit een volledige postcode,
  -- nooit een adres, nooit GPS.
  area_pc2 text check (area_pc2 is null or area_pc2 ~ '^[1-9][0-9]$'),
  travel_radius text check (
    travel_radius is null
    or travel_radius in ('tot_5km', 'tot_15km', 'tot_30km', 'heel_nl', 'alleen_online')
  ),
  -- Band, nooit een geboortedatum. Nullable: "zeg ik liever niet" slaat niets op.
  age_band text check (
    age_band is null or age_band in ('35_44', '45_54', '55_64', '65_plus')
  ),
  -- v1 kent alleen 'prive'. De kolom bestaat zodat het model klopt; de keuze
  -- bestaat niet zolang er niets is om zichtbaar voor te zijn.
  visibility text not null default 'prive' check (visibility in ('prive')),
  -- Optionele vrije tekst voor de gebruiker zelf. Nooit matchbaar, nooit
  -- zichtbaar voor anderen, nooit in een event.
  note text check (note is null or char_length(note) <= 140),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists cprofile_profile_account_idx
  on public.cprofile_profile (account_id);

-- Eén tabel voor alle multi-selects. `tag_id` verwijst naar de statische
-- woordenlijst in src/data/connection/vocabulary.ts, niet naar een db-tabel:
-- git is de audit, tsc is de validatie.
create table if not exists public.cprofile_tag (
  profile_id uuid not null references public.cprofile_profile (id) on delete cascade,
  kind text not null check (
    kind in ('interest', 'brengen', 'ontdekken', 'doet', 'vorm', 'beschikbaarheid')
  ),
  tag_id text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, kind, tag_id)
);

-- Draagt de latere match: brengen(A) ∩ ontdekken(B) is één join op deze index.
create index if not exists cprofile_tag_match_idx
  on public.cprofile_tag (kind, tag_id);

alter table public.cprofile_profile enable row level security;
alter table public.cprofile_tag enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.cprofile_profile is
  'Connection Profile: zelf opgegeven voorkeuren voor personalisatie en latere verbinding. Bevat GEEN gezondheidsdata en heeft bewust geen relatie met intake_sessions of domain_scores — zie BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §7.';

comment on table public.cprofile_tag is
  'Multi-select waarden van het Connection Profile, met kind-discriminator (interest/brengen/ontdekken/doet/vorm/beschikbaarheid). tag_id verwijst naar de statische woordenlijst in src/data/connection/vocabulary.ts.';

comment on column public.cprofile_profile.area_pc2 is
  'Eerste twee cijfers van de postcode. Nooit volledige postcode, adres of GPS.';

comment on column public.cprofile_profile.visibility is
  'v1 staat vast op prive. Uitbreiden vraagt een expliciet besluit plus een zichtbaarheidskeuze in de UI.';
