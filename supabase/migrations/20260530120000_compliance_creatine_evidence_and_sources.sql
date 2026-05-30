-- Compliance 3B: creatine-beweging EFSA-claim + juiste bron (niet pmid 33865376 = magnesium).
-- Voeg peer-reviewed bronnen toe per supplement voor evidence RAG (40+ / meta-analyse).

-- ---------------------------------------------------------------------------
-- Evidence sources (idempotent op pmid)
-- ---------------------------------------------------------------------------
insert into public.evidence_sources (
  organization_id, vancouver, url, pmid, doi, evidence_type
)
select * from (
  values
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Forbes SC, Candow DG, Ostojic SM, et al. J Cachexia Sarcopenia Muscle 2022;13(1):38-50.',
      'https://pubmed.ncbi.nlm.nih.gov/35482559/',
      '35482559',
      '10.1002/jcsm.12913',
      'meta_analysis'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Kreider RB, Kalman DS, Antonio J, et al. J Int Soc Sports Nutr 2017;14:18.',
      'https://pubmed.ncbi.nlm.nih.gov/28615996/',
      '28615996',
      '10.1186/s12970-017-0173-z',
      'narrative_review'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Boyle NB, Lawton C, Dye L. Nutrients 2017;9(5):429.',
      'https://pubmed.ncbi.nlm.nih.gov/28445426/',
      '28445426',
      '10.3390/nu9050429',
      'meta_analysis'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Jackson PA, Forster JS, Bell JG, et al. Br J Nutr 2016;115(6):1031-1041.',
      'https://pubmed.ncbi.nlm.nih.gov/26864360/',
      '26864360',
      '10.1017/S0007114515005315',
      'rct'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Bischoff-Ferrari HA, Willett WC, Orav EJ, et al. BMJ 2012;345:e4695.',
      'https://pubmed.ncbi.nlm.nih.gov/22833605/',
      '22833605',
      '10.1136/bmj.e4695',
      'meta_analysis'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Annweiler C, Montero-Odasso M, Llewellyn DJ, et al. J Alzheimers Dis 2013;37(3):657-669.',
      'https://pubmed.ncbi.nlm.nih.gov/23567424/',
      '23567424',
      null::text,
      'meta_analysis'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Haase H, Rink L. Nutrients 2014;6(6):2302-2328.',
      'https://pubmed.ncbi.nlm.nih.gov/24922193/',
      '24922193',
      '10.3390/nu6062302',
      'narrative_review'
    ),
    (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Calder PC. Ann Nutr Metab 2020;74:1-9.',
      'https://pubmed.ncbi.nlm.nih.gov/31808863/',
      '31808863',
      null::text,
      'narrative_review'
    )
) as v (organization_id, vancouver, url, pmid, doi, evidence_type)
where not exists (
  select 1
  from public.evidence_sources es
  where es.organization_id = v.organization_id
    and es.pmid = v.pmid
);

-- ---------------------------------------------------------------------------
-- Creatine-beweging: published claim → EFSA-conform + Kreider-bron
-- ---------------------------------------------------------------------------
update public.evidence_claims ec
set
  claim_text = 'Creatine verhoogt de fysieke prestatie bij opeenvolgende korte, zeer intensieve inspanningen (bij 3 g per dag).',
  is_efsa_authorized = true,
  source_id = s.id,
  updated_at = now()
from public.interventions i
join public.themes t on t.id = i.theme_id
join public.evidence_sources s
  on s.organization_id = '00000000-0000-0000-0000-000000000001'
  and s.pmid = '28615996'
where ec.intervention_id = i.id
  and ec.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'movement'
  and i.slug = 'creatine-beweging'
  and ec.status = 'published';

-- Opruimen: eventuele creatine-claims die nog aan magnesium-bron hangen
update public.evidence_claims ec
set
  source_id = s.id,
  updated_at = now()
from public.evidence_sources s
where ec.organization_id = '00000000-0000-0000-0000-000000000001'
  and ec.domain_label = 'movement'
  and ec.claim_text ilike '%creatine%'
  and ec.source_id in (
    select id from public.evidence_sources where pmid = '33865376'
  )
  and s.pmid = '28615996';

-- ---------------------------------------------------------------------------
-- RAG: ondersteunende published claims zonder interventie-koppeling (per domein)
-- ---------------------------------------------------------------------------
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
  v.domain_label,
  null,
  s.id,
  v.is_efsa,
  'published'
from (
  values
    (
      '28445426',
      'magnesium',
      'Systematische review: magnesiumsuppletie kan subjectieve stress en angst verlagen (volwassenen).',
      false
    ),
    (
      '26864360',
      'nutrition',
      'RCT bij volwassenen 50–75 jaar: DHA-suppletie verbeterde cognitieve reactietijd.',
      false
    ),
    (
      '22833605',
      'movement',
      'Meta-analyse: vitamine D-suppletie verlaagt valrisico bij ouderen.',
      false
    ),
    (
      '35482559',
      'movement',
      'Meta-analyse: creatine plus weerstandstraining verbetert spierkracht en -massa bij ouderen.',
      false
    ),
    (
      '24922193',
      'nutrition',
      'Review: zinkstatus en immuunfunctie zijn verweven; ouderen hebben verhoogd risico op tekort.',
      false
    )
) as v (pmid, domain_label, claim_text, is_efsa)
join public.evidence_sources s
  on s.organization_id = '00000000-0000-0000-0000-000000000001'
  and s.pmid = v.pmid
where not exists (
  select 1
  from public.evidence_claims ec
  where ec.organization_id = '00000000-0000-0000-0000-000000000001'
    and ec.source_id = s.id
    and ec.domain_label = v.domain_label
    and ec.claim_text = v.claim_text
);
