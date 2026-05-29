-- Content-laag fase 2: themes + recognition_lines (HERKENNING-scherm)

create table if not exists public.themes (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  slug text not null,
  label text not null,
  sublabel text not null,
  hefboom_text text,
  disclaimer_key text,
  position int not null default 0,
  is_measured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.recognition_lines (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  theme_id uuid not null references public.themes (id) on delete cascade,
  body_text text not null,
  match_question_id text not null,
  match_operator text not null check (
    match_operator in ('<=', '>=', '=', 'in')
  ),
  match_value jsonb not null,
  priority int not null default 100,
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recognition_lines_theme_priority_idx
  on public.recognition_lines (theme_id, priority);

create index if not exists themes_org_slug_idx
  on public.themes (organization_id, slug);

alter table public.themes enable row level security;
alter table public.recognition_lines enable row level security;

create policy "themes_org_isolation_authenticated"
  on public.themes
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "recognition_lines_org_isolation_authenticated"
  on public.recognition_lines
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

-- Default tenant themes
insert into public.themes (
  organization_id, slug, label, sublabel, position, is_measured
) values
  ('00000000-0000-0000-0000-000000000001', 'stress', 'Stress', 'Zenuwstelsel', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'sleep', 'Slaap', 'Herstel', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'nutrition', 'Voeding', 'Darmen', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'movement', 'Beweging', 'Spierkracht', 4, true),
  ('00000000-0000-0000-0000-000000000001', 'connection', 'Verbinding', 'Sociaal · doel', 5, false)
on conflict (organization_id, slug) do update set
  label = excluded.label,
  sublabel = excluded.sublabel,
  position = excluded.position,
  is_measured = excluded.is_measured,
  updated_at = now();

-- Sleep recognition lines (golden path — placeholders tot definitieve copy)
insert into public.recognition_lines (
  organization_id,
  theme_id,
  body_text,
  match_question_id,
  match_operator,
  match_value,
  priority,
  is_placeholder
)
select
  '00000000-0000-0000-0000-000000000001',
  t.id,
  v.body_text,
  v.match_question_id,
  v.match_operator,
  v.match_value::jsonb,
  v.priority,
  v.is_placeholder
from public.themes t
cross join (
  values
    (
      'Je wordt ''s nachts wakker en je hoofd start meteen op.',
      'SLP_WAKE',
      '<=',
      '2',
      1,
      true
    ),
    (
      'Je ligt lang wakker voordat je in slaap valt.',
      'SLP_ONSET',
      '<=',
      '2',
      2,
      true
    ),
    (
      'Je wordt wakker alsof je niet echt geslapen hebt.',
      'SLP_QUAL',
      '<=',
      '2',
      3,
      true
    ),
    (
      'Je slaapritme wisselt — vaste tijden lukken niet altijd.',
      'SLP_CONS',
      '<=',
      '1',
      4,
      true
    ),
    (
      'Je slaapt genoeg uren, maar herstelt niet echt.',
      'SLP_QUAL',
      '=',
      '2',
      5,
      true
    ),
    (
      'Je hoofd blijft ''s avonds actief terwijl je lichaam moe is.',
      'SLP_ONSET',
      '=',
      '1',
      6,
      true
    )
) as v (
  body_text,
  match_question_id,
  match_operator,
  match_value,
  priority,
  is_placeholder
)
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'sleep'
  and not exists (
    select 1
    from public.recognition_lines rl
    where rl.theme_id = t.id
      and rl.match_question_id = v.match_question_id
      and rl.match_operator = v.match_operator
      and rl.match_value = v.match_value::jsonb
  );

-- Stress placeholders
insert into public.recognition_lines (
  organization_id,
  theme_id,
  body_text,
  match_question_id,
  match_operator,
  match_value,
  priority,
  is_placeholder
)
select
  '00000000-0000-0000-0000-000000000001',
  t.id,
  v.body_text,
  v.match_question_id,
  v.match_operator,
  v.match_value::jsonb,
  v.priority,
  true
from public.themes t
cross join (
  values
    ('Je voelt spanning alsof je schouders nooit echt zakken.', 'STR_FREQ', '<=', '2', 1),
    ('Herstelmomenten blijven op een drukke dag achterwege.', 'STR_RCV', '<=', '2', 2)
) as v (body_text, match_question_id, match_operator, match_value, priority)
where t.slug = 'stress'
  and t.organization_id = '00000000-0000-0000-0000-000000000001'
  and not exists (
    select 1 from public.recognition_lines rl
    where rl.theme_id = t.id and rl.body_text = v.body_text
  );
