-- Fase 4: interventions + intervention_triggers (PLAN-scherm data-laag)

create table if not exists public.interventions (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  theme_id uuid not null references public.themes (id) on delete cascade,
  slug text not null,
  name text not null,
  kind text not null check (
    kind in ('free_action', 'measurement', 'supplement')
  ),
  description text not null default '',
  score_moeite int not null check (score_moeite between 1 and 5),
  score_mechanisme int not null check (score_mechanisme between 1 and 5),
  score_onderbouwing int not null check (score_onderbouwing between 1 and 5),
  score_veiligheid int not null check (score_veiligheid between 1 and 5),
  affiliate_url text,
  comparison_path text,
  goal_phrase text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, theme_id, slug)
);

create table if not exists public.intervention_triggers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  group_id int not null default 1,
  kind text not null check (
    kind in (
      'domain_below',
      'domain_above',
      'deficiency_signal',
      'profile_label',
      'answer'
    )
  ),
  field text not null,
  operator text check (
    operator is null
    or operator in ('<=', '>=', '=', 'in')
  ),
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interventions_theme_kind_idx
  on public.interventions (theme_id, kind);

create index if not exists intervention_triggers_intervention_group_idx
  on public.intervention_triggers (intervention_id, group_id);

alter table public.interventions enable row level security;
alter table public.intervention_triggers enable row level security;

create policy "interventions_org_isolation_authenticated"
  on public.interventions
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "intervention_triggers_org_isolation_authenticated"
  on public.intervention_triggers
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );
