-- Eigen ijkpunt: kwalitatief doel per domein (situatie-enum + eigen woorden)
-- + append-only 0-10-ijkpuntreeks (PSFS-patroon). Aparte as náást domain_scores —
-- nooit in de ring, de leefstijlscore of de vitaliteit, nooit een tweede
-- scoringswaarheid. RLS deny-all: alleen service_role via account-API-routes.
-- Zie docs/plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md §5-6.

create table if not exists public.domain_goal (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  domain text not null check (domain in ('slaap','beweging','voeding','stress','verbinding')),
  situation_id text not null,
  own_words text check (own_words is null or char_length(own_words) <= 80),
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Eén actief doel per domein; ingetrokken/herformuleerde doelen blijven staan voor de historie.
create unique index if not exists domain_goal_active_idx
  on public.domain_goal (account_id, domain) where retired_at is null;

create index if not exists domain_goal_account_idx
  on public.domain_goal (account_id);

-- Append-only ijkpuntreeks. Nooit updaten, nooit verwijderen bij herformulering —
-- scores blijven aan het oude (retired) doel hangen.
create table if not exists public.domain_goal_score (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.domain_goal (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  session_id uuid references public.intake_sessions (id) on delete set null,
  score smallint not null check (score between 0 and 10),
  scored_at timestamptz not null default now()
);

create index if not exists domain_goal_score_goal_idx
  on public.domain_goal_score (goal_id, scored_at);

alter table public.domain_goal enable row level security;
alter table public.domain_goal_score enable row level security;
-- Geen anon/authenticated policies: alleen service role via account-API-routes.

comment on table public.domain_goal is
  'Eigen ijkpunt: één actief kwalitatief doel per account per domein (situatie-enum + eigen woorden, max 80 tekens). Herformulering zet retired_at en maakt een nieuwe rij; scores blijven aan het oude doel hangen.';

comment on table public.domain_goal_score is
  'Append-only 0-10-ijkpuntreeks per doel (PSFS-patroon). Aparte as náást domain_scores — nooit bijwerken of verwijderen bij herformulering.';
