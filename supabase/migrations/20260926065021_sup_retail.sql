-- Productplatform plak 1 — retail- en prijslaag (sup_*).
-- Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C4 en de §808-herziening
-- (26 sep 2026): wederpartij wordt per categorie bepaald (zowel merken als
-- webshops), dus sup_offers rekent NIET op N=1-verkoper als normaalgeval — de
-- multi-retailer-vergelijking ("Waar te koop" met meerdere prijzen) is vanaf
-- plak 4 volwaardig, niet een uitzondering voor overlappend assortiment.
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

create table if not exists public.sup_retailers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  pd_partner_id uuid references public.pd_partners (id) on delete set null,
  -- pd_partner_id is DE brug: contract, cookieduur en commissieregels blijven
  -- in PartnerDesk (pd_contracts / pd_commission_rules), niet hier gedupliceerd.
  relationship text not null check (relationship in ('direct', 'network')),
  -- relationship stuurt het meetpad: direct = eigen click_token (zie sup_clicks
  -- hieronder), network = netwerk-subid zonder click_token-attributie.
  base_url text,
  tracking_param text,
  disclosure_label text,
  active boolean not null default true
);
create index if not exists sup_retailers_relationship_idx on public.sup_retailers (relationship);

create table if not exists public.sup_offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product_id uuid not null references public.sup_products (id) on delete cascade,
  retailer_id uuid not null references public.sup_retailers (id) on delete cascade,
  external_sku text,
  product_url text,
  affiliate_url text,
  price_cents int check (price_cents >= 0),
  list_price_cents int check (list_price_cents >= 0),
  currency text not null default 'EUR',
  availability text,
  discount_code text,
  discount_percent numeric,
  price_checked_at timestamptz,
  source text not null default 'manual' check (source in ('manual', 'feed', 'api')),
  active boolean not null default true,
  unique (product_id, retailer_id)
);
create index if not exists sup_offers_product_idx on public.sup_offers (product_id);
create index if not exists sup_offers_retailer_idx on public.sup_offers (retailer_id);

create table if not exists public.sup_offer_price_history (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.sup_offers (id) on delete cascade,
  price_cents int not null check (price_cents >= 0),
  observed_at timestamptz not null default now()
);
create index if not exists sup_offer_price_history_offer_idx on public.sup_offer_price_history (offer_id, observed_at desc);

create table if not exists public.sup_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  click_token text not null unique,
  offer_id uuid not null references public.sup_offers (id) on delete cascade,
  product_id uuid not null references public.sup_products (id) on delete restrict,
  retailer_id uuid not null references public.sup_retailers (id) on delete restrict,
  page text,
  position int
  -- Geen IP, geen sessie-ID, geen PII — zie §K8 en
  -- docs/partners/SPEC_CLICK_TOKEN_TRACKING.md §6. click_token is kort, url-veilig
  -- en gaat mee als subid in affiliate_url; komt terug bij de conversie
  -- (pd_conversions, apart te migreren — zie §C6 van het analysedoc).
);
create index if not exists sup_clicks_offer_idx on public.sup_clicks (offer_id);
create index if not exists sup_clicks_product_idx on public.sup_clicks (product_id);

alter table public.sup_retailers           enable row level security;
alter table public.sup_offers              enable row level security;
alter table public.sup_offer_price_history enable row level security;
alter table public.sup_clicks              enable row level security;

comment on table public.sup_clicks is
  'Klik-attributie voor directe partners. Geen PII. Service-role-only (RLS deny-all).';

-- Seed: Arctic Blue staat al als 'direct' in pd_networks (zie 20260712120000);
-- de retailer-rij volgt zodra de eerste producten van dat merk worden ingevoerd,
-- niet hier — deze migratie zet alleen het schema neer, geen productdata.
