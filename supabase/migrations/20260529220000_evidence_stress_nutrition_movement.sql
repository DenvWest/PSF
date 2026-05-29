-- Fase 7: interventions + evidence voor stress, nutrition, movement (placeholders)

-- Herkenning nutrition + movement
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
    ('Je eet zelden vette vis of structurele omega-3-bronnen.', 'NUT_O3', '<=', '1', 1),
    ('Eiwit bij maaltijden blijft vaak onder wat je lichaam nodig heeft.', 'NUT_PROT', '<=', '2', 2)
) as v (body_text, match_question_id, match_operator, match_value, priority)
where t.slug = 'nutrition'
  and t.organization_id = '00000000-0000-0000-0000-000000000001'
  and not exists (
    select 1 from public.recognition_lines rl
    where rl.theme_id = t.id and rl.body_text = v.body_text
  );

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
    ('Krachttraining voelt zwaarder dan vroeger, herstel blijft achter.', 'MOV_STR', '<=', '2', 1),
    ('Cardio of dagelijkse beweging schiet er vaak bij in.', 'MOV_CARD', '<=', '2', 2)
) as v (body_text, match_question_id, match_operator, match_value, priority)
where t.slug = 'movement'
  and t.organization_id = '00000000-0000-0000-0000-000000000001'
  and not exists (
    select 1 from public.recognition_lines rl
    where rl.theme_id = t.id and rl.body_text = v.body_text
  );

-- Extra evidence bron (omega-3 narrative — placeholder Vancouver)
insert into public.evidence_sources (
  organization_id,
  vancouver,
  url,
  evidence_type
)
select
  '00000000-0000-0000-0000-000000000001',
  'Calder PC. Ann Nutr Metab 2020;74:1-9.',
  'https://pubmed.ncbi.nlm.nih.gov/',
  'narrative_review'
where not exists (
  select 1
  from public.evidence_sources
  where organization_id = '00000000-0000-0000-0000-000000000001'
    and vancouver like 'Calder PC.%'
);

-- Stress interventies
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
      'rustmomenten-agenda',
      'Vaste herstelmomenten inplannen',
      'free_action',
      'Blok twee korte pauzes van 3 minuten in je agenda — bewust zonder scherm.',
      2,
      4,
      3,
      5,
      null::text,
      null::text,
      'meer ademruimte op drukke dagen'
    ),
    (
      'stress-check-in',
      'Spanning bijhouden',
      'measurement',
      'Noteer 7 dagen: wanneer spanning piekt en wat je lichaam doet (schouders, adem).',
      2,
      3,
      3,
      5,
      null::text,
      null::text,
      'inzicht in je stresspatroon'
    ),
    (
      'ashwagandha-stress',
      'Ashwagandha',
      'supplement',
      'Aanvulling wanneer rustmomenten alleen niet genoeg voelen — vergelijk inhoudelijk op eigen tempo.',
      3,
      3,
      3,
      4,
      null::text,
      '/beste/ashwagandha',
      'stress en herstel ondersteunen'
    )
) as v (
  slug, name, kind, description,
  score_moeite, score_mechanisme, score_onderbouwing, score_veiligheid,
  affiliate_url, comparison_path, goal_phrase
)
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
  updated_at = now();

-- Nutrition interventies
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
      'eiwit-per-maaltijd',
      'Eiwit bij elke maaltijd',
      'free_action',
      'Begin elke maaltijd met 20–30 g eiwit (eieren, kwark, vis, peulvruchten).',
      2,
      4,
      4,
      5,
      null::text,
      null::text,
      'stabielere energie en herstel'
    ),
    (
      'voeding-dagboek',
      'Voeding bijhouden',
      'measurement',
      'Noteer 5 dagen: eiwit per maaltijd en hoe vaak je vette vis of noten eet.',
      2,
      3,
      3,
      5,
      null::text,
      null::text,
      'inzicht in je voedingspatroon'
    ),
    (
      'omega-3-voeding',
      'Omega-3 (EPA/DHA)',
      'supplement',
      'Aanvulling wanneer vette vis structureel ontbreekt — vergelijk EPA/DHA en zuiverheid.',
      3,
      4,
      4,
      5,
      null::text,
      '/beste/omega-3-supplement',
      'vetzuur-balans ondersteunen'
    )
) as v (
  slug, name, kind, description,
  score_moeite, score_mechanisme, score_onderbouwing, score_veiligheid,
  affiliate_url, comparison_path, goal_phrase
)
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

-- Movement interventies
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
)
from public.themes t
cross join (
  values
    (
      'rustdag-na-training',
      'Rustdag na zware training',
      'free_action',
      'Plan vandaag een rustdag of lichte wandeling als je gisteren hard trainde.',
      2,
      4,
      4,
      5,
      null::text,
      null::text,
      'herstel tussen inspanningen'
    ),
    (
      'training-log',
      'Belasting bijhouden',
      'measurement',
      'Noteer 7 dagen: training, slaap en hoe zwaar je je voelde na inspanning.',
      2,
      3,
      3,
      5,
      null::text,
      null::text,
      'inzicht in belasting en herstel'
    ),
    (
      'creatine-beweging',
      'Creatine',
      'supplement',
      'Aanvulling bij krachttraining en herstel — vergelijk vorm en dosering op eigen tempo.',
      3,
      4,
      4,
      5,
      null::text,
      '/beste/creatine',
      'kracht en herstel ondersteunen'
    )
) as v (
  slug, name, kind, description,
  score_moeite, score_mechanisme, score_onderbouwing, score_veiligheid,
  affiliate_url, comparison_path, goal_phrase
)
where t.organization_id = '00000000-0000-0000-0000-000000000001'
  and t.slug = 'movement'
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

-- Triggers per thema (domain_below op thema-score)
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
  v.score_field,
  null,
  v.threshold::jsonb
from public.interventions i
join public.themes t on t.id = i.theme_id
cross join (
  values
    ('stress', 'rustmomenten-agenda', 'stress_score', '65'),
    ('stress', 'stress-check-in', 'stress_score', '65'),
    ('stress', 'ashwagandha-stress', 'stress_score', '60'),
    ('nutrition', 'eiwit-per-maaltijd', 'nutrition_score', '65'),
    ('nutrition', 'voeding-dagboek', 'nutrition_score', '65'),
    ('nutrition', 'omega-3-voeding', 'nutrition_score', '60'),
    ('movement', 'rustdag-na-training', 'movement_score', '65'),
    ('movement', 'training-log', 'movement_score', '65'),
    ('movement', 'creatine-beweging', 'movement_score', '60')
) as v (theme_slug, intervention_slug, score_field, threshold)
where t.slug = v.theme_slug
  and i.slug = v.intervention_slug
  and not exists (
    select 1
    from public.intervention_triggers tr
    where tr.intervention_id = i.id
      and tr.kind = 'domain_below'
      and tr.field = v.score_field
  );

-- Published evidence claims
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
  i.id,
  s.id,
  v.is_efsa,
  'published'
from public.interventions i
join public.themes t on t.id = i.theme_id
join public.evidence_sources s on s.organization_id = '00000000-0000-0000-0000-000000000001'
cross join (
  values
    ('stress', 'rustmomenten-agenda', 'stress', 'Calder PC.%', 'Korte, vaste rustmomenten helpen het zenuwstelsel schakelen tussen alert en herstel.', false),
    ('stress', 'stress-check-in', 'stress', 'Calder PC.%', 'Patronen bijhouden maakt zichtbaar wanneer stress piekt — nuttig vóór gerichte bijsturing.', false),
    ('stress', 'ashwagandha-stress', 'stress', '33865376', 'Ashwagandha wordt in reviews besproken in de context van stressperceptie — geen EU-goedgekeurde gezondheidsclaim.', false),
    ('nutrition', 'eiwit-per-maaltijd', 'nutrition', 'Calder PC.%', 'Voldoende eiwit per maaltijd ondersteunt spiermassa en herstel — vooral relevant na 40.', false),
    ('nutrition', 'voeding-dagboek', 'nutrition', 'Calder PC.%', 'Bijhouden van eiwit en vetzuren maakt tekorten zichtbaar voordat je supplementeert.', false),
    ('nutrition', 'omega-3-voeding', 'nutrition', 'Calder PC.%', 'EPA en DHA dragen bij tot normale hartfunctie en DHA tot instandhouding van hersenfunctie (claimvoorwaarden).', true),
    ('movement', 'rustdag-na-training', 'movement', 'Calder PC.%', 'Geplande rust na zware belasting helpt overbelasting voorkomen en herstel te structureren.', false),
    ('movement', 'training-log', 'movement', 'Calder PC.%', 'Belasting en herstel loggen maakt patronen zichtbaar wanneer je te veel of te weinig doet.', false),
    ('movement', 'creatine-beweging', 'movement', '33865376', 'Creatine wordt veel besproken bij krachttraining en herstel — vergelijk dosering en vorm op eigen tempo.', false)
) as v (theme_slug, intervention_slug, domain_label, source_match, claim_text, is_efsa)
where t.slug = v.theme_slug
  and i.slug = v.intervention_slug
  and (
    (v.source_match = '33865376' and s.pmid = '33865376')
    or (v.source_match = 'Calder PC.%' and s.vancouver like 'Calder PC.%')
  )
  and not exists (
    select 1
    from public.evidence_claims ec
    where ec.intervention_id = i.id
      and ec.status = 'published'
  );
