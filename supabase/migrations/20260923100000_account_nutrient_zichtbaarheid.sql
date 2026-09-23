-- Aan/uit-voorkeur per voedingsstof in de premium nutriëntentabel op "Je
-- patroon" (Samenvatting-sectie). Uitgezet betekent: de rij verdwijnt uit de
-- tabel en de stof verdwijnt mee uit de trend-grafiek — puur een
-- weergavefilter, de onderliggende dagboekdata blijft ongemoeid.
--
-- Ontbreekt een rij voor (account, nutrient), dan is de stof aan — "aan" is
-- de standaard, dus we slaan alleen uitzonderingen op in plaats van voor elke
-- account vijf rijen te zetten die toch allemaal true zouden zijn.
--
-- Zelfde opzet als account_dagboek_favorieten: organization_id via
-- orgScoped() (@/lib/db/scoped), RLS deny-all, alleen server-side via
-- service role.
create table if not exists public.account_nutrient_zichtbaarheid (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  nutrient text not null check (nutrient in ('protein', 'omega3', 'magnesium', 'vitamin_d', 'zinc')),
  zichtbaar boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (account_id, nutrient)
);

create index if not exists account_nutrient_zichtbaarheid_account_id_idx
  on public.account_nutrient_zichtbaarheid (account_id);

alter table public.account_nutrient_zichtbaarheid enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_nutrient_zichtbaarheid is
  'Aan/uit-voorkeur per voedingsstof voor de nutriëntentabel op Je patroon. Alleen uitgezette stoffen krijgen een rij (zichtbaar=false); een ontbrekende rij voor een nutrient betekent aan.';
comment on column public.account_nutrient_zichtbaarheid.nutrient is
  'NutrientId uit src/data/nutrition/intake-reference.ts.';
comment on column public.account_nutrient_zichtbaarheid.zichtbaar is
  'Altijd false in deze tabel — een rij bestaat alleen om "uit" vast te leggen. Aanwezig als expliciet veld zodat een toekomstige "expliciet aan"-state niet opnieuw het schema hoeft te wijzigen.';
