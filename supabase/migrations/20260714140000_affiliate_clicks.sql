-- Affiliate fase T — klik-laag voor het eigen programma. Ruwe kliks (first-party,
-- gehashte IP/UA) voeden EPC + klik→lead in de rapportage. Append-only; retentie/
-- aggregatie volgt in fase 3B (af_daily_rollups). RLS deny-all, service-role-only.
-- Uitvoeren via de Supabase Dashboard SQL Editor.

create table if not exists public.af_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references public.af_affiliates (id) on delete cascade,
  link_id uuid references public.af_links (id) on delete set null,
  ref text not null,
  occurred_at timestamptz not null default now(),
  ip_hash text,
  ua_hash text,
  consent boolean not null default false,
  landing_path text,
  raw jsonb not null default '{}'::jsonb
);
create index if not exists af_clicks_affiliate_idx
  on public.af_clicks (affiliate_id, occurred_at desc);

alter table public.af_clicks enable row level security;

comment on table public.af_clicks is
  'Ruwe affiliate-kliks (Rol 2). First-party, gehashte identifiers; retentie/rollup in fase 3B.';
