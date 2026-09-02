-- Vitamine D bloedwaarde-check: referral-only measurement-interventie (nutrition-thema)
-- Geen partner/affiliate: generieke huisarts-verwijzing, external_provider_* blijft leeg.

insert into public.evidence_sources (
  organization_id, vancouver, url, pmid, doi, evidence_type
)
select * from (
  values
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Holick MF, Binkley NC, Bischoff-Ferrari HA, et al. J Clin Endocrinol Metab 2011;96(7):1911-1930.',
      'https://pubmed.ncbi.nlm.nih.gov/21646368/',
      '21646368',
      '10.1210/jc.2011-0385',
      'guideline'
    )
) as v (organization_id, vancouver, url, pmid, doi, evidence_type)
where not exists (
  select 1 from public.evidence_sources es
  where es.organization_id = v.organization_id
    and es.pmid = v.pmid
);

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
  'vitamine-d-bloedwaarde-check',
  'Vitamine D laten meten',
  'measurement',
  'Vraag je huisarts om een 25(OH)D-bloedwaarde te laten bepalen — dit is de enige betrouwbare manier om je vitamine D-status vast te stellen, in plaats van te gokken op basis van klachten.',
  2,
  4,
  4,
  5,
  null::text,
  null::text,
  'zekerheid over je vitamine D-status'
from public.themes t
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'nutrition'
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

-- Trigger: zelfde drempel als de bestaande vitamine-d3 fallback-regel (nutrition_score laag)
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
  1,
  'domain_below',
  'nutrition_score',
  null,
  '60'::jsonb
from public.interventions i
join public.themes t on t.id = i.theme_id
where t.slug = 'nutrition'
  and i.slug = 'vitamine-d-bloedwaarde-check'
  and not exists (
    select 1
    from public.intervention_triggers tr
    where tr.intervention_id = i.id
      and tr.kind = 'domain_below'
      and tr.field = 'nutrition_score'
  );

-- Evidence-onderbouwing: 25(OH)D is de enige bloedmarker die volgens intake-reference.ts
-- concreet toevoegt aan de vijf leefstijlmetingen (bloodMarker: "improves").
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
  '25(OH)D is de standaardbepaling voor vitamine D-status — een bloedwaarde geeft, anders dan bij de meeste leefstijlsignalen, direct en betrouwbaar inzicht in je voorraad.',
  'nutrition',
  i.id,
  s.id,
  false,
  'published'
from public.interventions i
join public.themes t on t.id = i.theme_id
join public.evidence_sources s on s.organization_id = '00000000-0000-0000-0000-000000000001'
where t.slug = 'nutrition'
  and i.slug = 'vitamine-d-bloedwaarde-check'
  and s.pmid = '21646368'
  and not exists (
    select 1
    from public.evidence_claims ec
    where ec.intervention_id = i.id
      and ec.status = 'published'
  );
