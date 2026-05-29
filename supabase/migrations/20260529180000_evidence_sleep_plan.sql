-- Fase 5: evidence store + sleep golden-path interventies (placeholders)

create table if not exists public.evidence_sources (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  vancouver text not null,
  url text,
  pmid text,
  doi text,
  evidence_type text not null check (
    evidence_type in (
      'meta_analysis',
      'rct',
      'observational',
      'efsa_regulation',
      'guideline',
      'textbook',
      'narrative_review'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_claims (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  claim_text text not null,
  domain_label text not null,
  intervention_id uuid references public.interventions (id) on delete set null,
  source_id uuid not null references public.evidence_sources (id),
  is_efsa_authorized boolean not null default false,
  status text not null default 'draft' check (
    status in ('draft', 'published', 'retired')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evidence_claims_intervention_status_idx
  on public.evidence_claims (intervention_id, status);

alter table public.evidence_sources enable row level security;
alter table public.evidence_claims enable row level security;

create policy "evidence_sources_org_isolation_authenticated"
  on public.evidence_sources
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "evidence_claims_org_isolation_authenticated"
  on public.evidence_claims
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

-- Bron: Mah & Pitre 2021 (uit src/data/references/magnesium.ts)
insert into public.evidence_sources (
  organization_id,
  vancouver,
  url,
  pmid,
  doi,
  evidence_type
)
select
  '00000000-0000-0000-0000-000000000001',
  'Mah J, Pitre T. BMC Complement Med Ther 2021;21:125.',
  'https://pubmed.ncbi.nlm.nih.gov/33865376/',
  '33865376',
  '10.1186/s12906-021-03297-z',
  'meta_analysis'
where not exists (
  select 1
  from public.evidence_sources
  where organization_id = '00000000-0000-0000-0000-000000000001'
    and pmid = '33865376'
);

-- Sleep interventies (placeholders — Dennis vervangt copy in Table Editor)
insert into public.interventions (
  organization_id,
  theme_id,
  slug,
  name,
  kind,
  description,
  score_moeite,
  score_mechanisme,
  score_onderbouwing,
  score_veiligheid,
  affiliate_url,
  comparison_path,
  goal_phrase
)
select
  '00000000-0000-0000-0000-000000000001',
  t.id,
  v.slug,
  v.name,
  v.kind,
  v.description,
  v.score_moeite,
  v.score_mechanisme,
  v.score_onderbouwing,
  v.score_veiligheid,
  v.affiliate_url,
  v.comparison_path,
  v.goal_phrase
from public.themes t
cross join (
  values
    (
      'vaste-slaaptijd',
      'Vaste bed- en wakker tijd',
      'free_action',
      'Ga 3 nachten op hetzelfde tijdstip naar bed en sta op.',
      2,
      4,
      4,
      5,
      null::text,
      null::text,
      'betere slaapkwaliteit'
    ),
    (
      'slaap-dagboek',
      'Slaapritme bijhouden',
      'measurement',
      'Noteer 7 dagen: bedtijd, inslaaptijd, wakker momenten.',
      2,
      3,
      4,
      5,
      null::text,
      null::text,
      'inzicht in je slaappatroon'
    ),
    (
      'magnesium-slaap',
      'Magnesium glycinaat',
      'supplement',
      'Aanvulling wanneer slaap en herstel uit gewoonten lastig vol te houden zijn.',
      3,
      4,
      4,
      5,
      null::text,
      '/beste/magnesium',
      'betere slaapkwaliteit'
    )
) as v (
  slug,
  name,
  kind,
  description,
  score_moeite,
  score_mechanisme,
  score_onderbouwing,
  score_veiligheid,
  affiliate_url,
  comparison_path,
  goal_phrase
)
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'sleep'
on conflict (organization_id, theme_id, slug) do update set
  name = excluded.name,
  kind = excluded.kind,
  description = excluded.description,
  score_moeite = excluded.score_moeite,
  score_mechanisme = excluded.score_mechanisme,
  score_onderbouwing = excluded.score_onderbouwing,
  score_veiligheid = excluded.score_veiligheid,
  comparison_path = excluded.comparison_path,
  goal_phrase = excluded.goal_phrase,
  updated_at = now();

-- Triggers sleep (OR-groepen: lege triggers = altijd match via code; hier simpele triggers)
insert into public.intervention_triggers (
  organization_id,
  intervention_id,
  group_id,
  kind,
  field,
  operator,
  value
)
select
  '00000000-0000-0000-0000-000000000001',
  i.id,
  v.group_id,
  v.kind,
  v.field,
  v.operator,
  v.value::jsonb
from public.interventions i
join public.themes t on t.id = i.theme_id
cross join (
  values
    ('vaste-slaaptijd', 1, 'domain_below', 'sleep_score', null, '50'),
    ('slaap-dagboek', 1, 'domain_below', 'sleep_score', null, '60'),
    ('magnesium-slaap', 1, 'domain_below', 'sleep_score', null, '55'),
    ('magnesium-slaap', 2, 'deficiency_signal', 'magnesium_signal', null, 'true')
) as v (intervention_slug, group_id, kind, field, operator, value)
where t.slug = 'sleep'
  and i.slug = v.intervention_slug
  and not exists (
    select 1
    from public.intervention_triggers tr
    where tr.intervention_id = i.id
      and tr.group_id = v.group_id
      and tr.kind = v.kind
      and tr.field = v.field
  );

-- Evidence claims (published) per sleep-interventie
insert into public.evidence_claims (
  organization_id,
  claim_text,
  domain_label,
  intervention_id,
  source_id,
  is_efsa_authorized,
  status
)
select
  '00000000-0000-0000-0000-000000000001',
  v.claim_text,
  'sleep',
  i.id,
  s.id,
  v.is_efsa,
  'published'
from public.interventions i
join public.themes t on t.id = i.theme_id
cross join public.evidence_sources s
cross join (
  values
    (
      'vaste-slaaptijd',
      'Vaste slaaptijden ondersteunen je circadiaan ritme — een veelgebruikte eerste stap bij onrustige slaap.',
      false
    ),
    (
      'slaap-dagboek',
      'Bijhouden van slaap helpt patronen zichtbaar maken voordat je gerichter bijstuurt.',
      false
    ),
    (
      'magnesium-slaap',
      'Magnesium draagt bij tot normale psychologische functie en vermindering van vermoeidheid (EU-claimvoorwaarden).',
      true
    )
) as v (intervention_slug, claim_text, is_efsa)
where t.slug = 'sleep'
  and i.slug = v.intervention_slug
  and s.organization_id = '00000000-0000-0000-0000-000000000001'
  and s.pmid = '33865376'
  and not exists (
    select 1
    from public.evidence_claims ec
    where ec.intervention_id = i.id
      and ec.status = 'published'
  );
