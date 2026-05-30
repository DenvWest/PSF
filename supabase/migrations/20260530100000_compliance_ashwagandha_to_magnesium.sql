-- Compliance 3A: vervang ashwagandha-stress (tier 3, geen EFSA) door magnesium-stress.
-- Ashwagandha mag niet in matched.ordered blijven — alleen claim retiren maakt de
-- stress-trap leeg (ready-pad) of toont fallback zonder evidence-frame.
-- Idempotent: veilig op verse DB (ashwagandha bestaat) én re-run op prod.

-- 1. Verwijder gekoppelde published claims (voorkom RAG-zwevers + verkeerde bron-koppeling)
delete from public.evidence_claims ec
using public.interventions i
join public.themes t on t.id = i.theme_id
where ec.intervention_id = i.id
  and ec.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'stress'
  and i.slug = 'ashwagandha-stress';

-- Vang eventuele orphaned rijen (intervention_id null na eerdere delete)
delete from public.evidence_claims
where organization_id = '00000000-0000-0000-0000-000000000001'
  and domain_label = 'stress'
  and claim_text like 'Ashwagandha%';

-- 2. Verwijder interventie (cascade: intervention_triggers)
delete from public.interventions i
using public.themes t
where i.theme_id = t.id
  and t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'stress'
  and i.slug = 'ashwagandha-stress';

-- 3. Nieuwe tier-3 supplement: magnesium-stress (EFSA-conform)
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
  goal_phrase,
  tier,
  is_paid,
  paid_disclosure_key
)
select
  '00000000-0000-0000-0000-000000000001',
  t.id,
  'magnesium-stress',
  'Magnesium',
  'supplement',
  'Aanvulling wanneer rustmomenten alleen niet genoeg voelen — vergelijk vorm en dosering op eigen tempo.',
  3,
  4,
  4,
  5,
  null,
  '/beste/magnesium',
  'psychologische functie ondersteunen',
  3,
  true,
  'paid_action_default'
from public.themes t
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'stress'
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
  tier = excluded.tier,
  is_paid = excluded.is_paid,
  paid_disclosure_key = excluded.paid_disclosure_key,
  updated_at = now();

-- 4. Trigger: zelfde drempel als oude ashwagandha-stress (stress_score < 60)
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
  'stress_score',
  null,
  '60'::jsonb
from public.interventions i
join public.themes t on t.id = i.theme_id
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'stress'
  and i.slug = 'magnesium-stress'
  and not exists (
    select 1
    from public.intervention_triggers tr
    where tr.intervention_id = i.id
      and tr.kind = 'domain_below'
      and tr.field = 'stress_score'
  );

-- 5. Published EFSA-claim (approved-claims.ts magnesium, psychologische functie)
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
  'Magnesium draagt bij tot een normale psychologische functie',
  'stress',
  i.id,
  s.id,
  true,
  'published'
from public.interventions i
join public.themes t on t.id = i.theme_id
join public.evidence_sources s
  on s.organization_id = '00000000-0000-0000-0000-000000000001'
  and s.pmid = '33865376'
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'stress'
  and i.slug = 'magnesium-stress'
  and not exists (
    select 1
    from public.evidence_claims ec
    where ec.intervention_id = i.id
      and ec.status = 'published'
  );
