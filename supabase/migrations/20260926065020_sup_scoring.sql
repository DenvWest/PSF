-- Productplatform plak 1 — scorelaag (sup_*), bewust gescheiden van sup_catalog.sql.
--
-- LET OP — deze migratie sluit aan op de PS-SCORE die al bestaat en al draait
-- (src/lib/supplement-score/compute.ts, computeTrustScore(), sinds 27 aug 2026,
-- src/data/supplement-hub/score-model.ts, versie PS_SCORE_MODEL_VERSION).
-- Dat systeem week destijds al bewust af van de gewichtentabel in
-- ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C3 (die prijs voor 20% liet meewegen)
-- — zie de moduledoc-comment in score-model.ts. Deze migratie volgt dus de
-- PS-Score, niet de oorspronkelijke §C3-tabel. Zie ook de bijwerking van het
-- analysedoc op 26 sep 2026 (§808-sectie) waar deze vondst is vastgelegd.
--
-- computeTrustScore() blijft een pure functie zonder I/O; deze tabellen zijn
-- waar de DB-loader (latere plak) het resultaat opslaat, niet waar de score
-- berekend wordt. RLS deny-all, service-role-only, zelfde patroon als sup_catalog.
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

create table if not exists public.sup_score_models (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  version text not null unique,
  weights jsonb not null,
  active_from timestamptz not null default now(),
  changelog text,
  notes text
);

create table if not exists public.sup_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.sup_products (id) on delete cascade,
  model_version text not null references public.sup_score_models (version) on delete restrict,
  total_0_100 numeric not null check (total_0_100 >= 0 and total_0_100 <= 100),
  -- components: array van ScoreComponentResult (id, label, weight, points, reden) —
  -- zie src/types/supplement-score.ts. Bewaart dezelfde vorm als het runtime-type,
  -- zodat de DB-loader TrustScoreResult 1-op-1 kan reconstrueren.
  components jsonb not null,
  determined_count int not null,
  total_count int not null,
  claim_stance text not null
    check (claim_stance in ('voldoet', 'voldoet_deels', 'voldoet_niet', 'geen_erkende_claim', 'onbepaald')),
  inputs_hash text not null,
  computed_at timestamptz not null default now(),
  unique (product_id, model_version)
);
create index if not exists sup_scores_product_idx on public.sup_scores (product_id);

create table if not exists public.sup_badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.sup_products (id) on delete cascade,
  category_id uuid not null references public.sup_categories (id) on delete cascade,
  badge_key text not null,
  rank int,
  computed_at timestamptz not null default now(),
  unique (category_id, badge_key, product_id)
);
create index if not exists sup_badges_category_idx on public.sup_badges (category_id);

alter table public.sup_score_models enable row level security;
alter table public.sup_scores       enable row level security;
alter table public.sup_badges       enable row level security;

comment on table public.sup_scores is
  'Opgeslagen PS-Score-resultaat (TrustScoreResult) — berekend door computeTrustScore(), nooit handmatig ingevoerd. Prijsvrij: zie src/data/supplement-hub/score-model.ts.';

-- Huidig model — gewichten uit PS_SCORE_MODEL_VERSION "1.2.0"
-- (src/data/supplement-hub/score-model.ts, SCORE_WEIGHTS, sinds 3 sep 2026).
insert into public.sup_score_models (version, weights, changelog, notes)
values (
  '1.2.0',
  '{
    "dosering": 0.30,
    "vorm": 0.25,
    "claimdekking": 0.15,
    "transparantie": 0.15,
    "toetsing": 0.15
  }'::jsonb,
  'PS-Score 1.2.0 — gewichten herschikt op effectpotentieel vs. vertrouwen. Bewust prijsvrij (zie score-model.ts-moduledoc).',
  'Valt een onderdeel uit (bijv. dosis onzeker), dan hernormaliseert de rest — zie computeTrustScore(). Dit is het model dat al draait op /supplementen; deze rij is de DB-registratie ervan, geen nieuw model.'
)
on conflict (version) do nothing;
