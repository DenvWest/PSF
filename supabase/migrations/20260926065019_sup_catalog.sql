-- Productplatform plak 1 — productcatalogus (sup_*).
-- Vierde tabelfamilie naast pd_* (upstream partnerbeheer), af_* (eigen affiliate-
-- programma) en affiliate_clicks (legacy, niet aanraken). Zie CLAUDE.md over de
-- drie betekenissen van "affiliate" — sup_* is de productcatalogus en raakt die
-- verwarring niet.
-- Alle tabellen: RLS aan zonder policies (deny-all); toegang uitsluitend server-side
-- via createSupabaseAdmin() (service role), zelfde patroon als pd_*/af_*/cprofile_*.
-- Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C2 (schema) en §808
-- (26 sep 2026: wederpartij per categorie — zowel merken als webshops, dus geen
-- N=1-aanname in deze laag; dat raakt vooral sup_retail.sql, niet dit bestand).
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

-- ── Merken, categorieën ──────────────────────────────────────────────────────

create table if not exists public.sup_brands (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  manufacturer text,
  country text,
  website text,
  logo_path text,
  transparency_note text,
  pd_partner_id uuid references public.pd_partners (id) on delete set null
  -- pd_partner_id: de brug naar PartnerDesk wanneer het merk ook de contractpartij
  -- is (bijv. Arctic Blue verkoopt zijn eigen product — merk én retailer, zie
  -- sup_retailers in sup_retail.sql en §C4 van het analysedoc).
);

create table if not exists public.sup_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.sup_categories (id) on delete set null,
  ingredient_claim_key text,
  -- ingredient_claim_key: brug naar approved-claims.ts (IngredientClaimKey) en
  -- naar supplement_verdicts — geen foreign key, want approved-claims.ts is
  -- code, geen tabel. Consistentie hiertussen bewaakt een test, niet de database.
  description text,
  comparison_path text
);

-- ── Producten ────────────────────────────────────────────────────────────────

create table if not exists public.sup_products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  brand_id uuid not null references public.sup_brands (id) on delete restrict,
  category_id uuid not null references public.sup_categories (id) on delete restrict,
  name text not null,
  variant text,
  form text,
  flavour text,
  container_size numeric,
  container_unit text,
  servings_per_container int check (servings_per_container > 0),
  serving_size numeric,
  serving_unit text,
  usage_advice text,
  description text,
  target_audience text,
  country_of_origin text,
  product_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  data_checked_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz
);
create index if not exists sup_products_brand_idx on public.sup_products (brand_id);
create index if not exists sup_products_category_idx on public.sup_products (category_id);
create index if not exists sup_products_status_idx on public.sup_products (status);

create table if not exists public.sup_product_actives (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.sup_products (id) on delete cascade,
  nutrient_key text not null,
  form_key text,
  amount_per_serving numeric not null check (amount_per_serving >= 0),
  unit text not null,
  is_elemental boolean not null default false
  -- meerdere rijen per product: EPA + DHA apart, magnesiumvormen apart met
  -- percentage elementair — dit is de enige bron voor claimtoetsing én voor
  -- prijs-per-effectieve-dosis (zie sup_offers in sup_retail.sql).
);
create index if not exists sup_product_actives_product_idx on public.sup_product_actives (product_id);

create table if not exists public.sup_product_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.sup_products (id) on delete cascade,
  position int not null,
  name text not null,
  is_active boolean not null default false,
  is_additive boolean not null default false,
  is_allergen boolean not null default false,
  unique (product_id, position)
);

create table if not exists public.sup_product_certifications (
  product_id uuid not null references public.sup_products (id) on delete cascade,
  certification_key text not null,
  primary key (product_id, certification_key)
  -- certification_key: vrije waarden zoals 'ifos', 'creapure', 'ksm66', 'vegan',
  -- 'gmp' — geen enum, nieuwe certificeringen mogen zonder migratie toegevoegd.
);

create table if not exists public.sup_product_claims (
  product_id uuid not null references public.sup_products (id) on delete cascade,
  efsa_claim_id text not null,
  meets_condition boolean not null default false,
  primary key (product_id, efsa_claim_id)
  -- efsa_claim_id: verwijst naar EfsaClaimId in approved-claims.ts, geen foreign
  -- key om dezelfde reden als ingredient_claim_key hierboven.
);

create table if not exists public.sup_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid references public.sup_products (id) on delete cascade,
  category_id uuid references public.sup_categories (id) on delete cascade,
  kind text not null,
  url text,
  title text,
  checked_at timestamptz,
  check (product_id is not null or category_id is not null)
);
create index if not exists sup_sources_product_idx on public.sup_sources (product_id);
create index if not exists sup_sources_category_idx on public.sup_sources (category_id);

create table if not exists public.sup_product_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.sup_products (id) on delete cascade,
  path text not null,
  alt text,
  position int not null default 0,
  source text not null check (source in ('own', 'merchant_feed', 'manufacturer', 'licensed')),
  license_note text,
  checked_at timestamptz
  -- source is NOT NULL: geen afbeelding zonder vastgelegde herkomst. Zie §K3 van
  -- het analysedoc en clausule 2 van docs/partners/DATA_BIJLAGE_PARTNERCONTRACT.md.
);
create index if not exists sup_product_images_product_idx on public.sup_product_images (product_id);

-- ── RLS: deny-all, service-role-only ─────────────────────────────────────────

alter table public.sup_brands                 enable row level security;
alter table public.sup_categories              enable row level security;
alter table public.sup_products                enable row level security;
alter table public.sup_product_actives         enable row level security;
alter table public.sup_product_ingredients     enable row level security;
alter table public.sup_product_certifications  enable row level security;
alter table public.sup_product_claims          enable row level security;
alter table public.sup_sources                 enable row level security;
alter table public.sup_product_images          enable row level security;

comment on table public.sup_products is
  'Productplatform: het catalogusanker. Service-role-only (RLS deny-all). Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md.';
