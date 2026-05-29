-- Fase 8: evidence RAG (FTS + pgvector) voor /api/chat

create extension if not exists vector with schema extensions;

alter table public.evidence_claims
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(claim_text, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(domain_label, '')), 'B')
  ) stored;

alter table public.evidence_claims
  add column if not exists embedding extensions.vector(1536);

create index if not exists evidence_claims_search_vector_idx
  on public.evidence_claims using gin (search_vector);

create index if not exists evidence_claims_org_status_domain_idx
  on public.evidence_claims (organization_id, status, domain_label);

-- Semantisch zoeken wanneer embeddings zijn ingevuld (later via batch/job)
create index if not exists evidence_claims_embedding_idx
  on public.evidence_claims
  using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null;

create or replace function public.search_evidence_claims(
  p_organization_id uuid,
  p_query text,
  p_domain_label text default null,
  p_match_count int default 5
)
returns table (
  id uuid,
  claim_text text,
  domain_label text,
  source_vancouver text,
  source_url text,
  rank real
)
language sql
stable
set search_path = public
as $$
  with normalized as (
    select nullif(trim(p_query), '') as q
  ),
  fts as (
    select
      ec.id,
      ec.claim_text,
      ec.domain_label,
      es.vancouver as source_vancouver,
      es.url as source_url,
      ts_rank(ec.search_vector, websearch_to_tsquery('simple', n.q)) as rank
    from public.evidence_claims ec
    join public.evidence_sources es on es.id = ec.source_id
    cross join normalized n
    where ec.organization_id = p_organization_id
      and ec.status = 'published'
      and n.q is not null
      and (p_domain_label is null or ec.domain_label = p_domain_label)
      and ec.search_vector @@ websearch_to_tsquery('simple', n.q)
  ),
  fallback as (
    select
      ec.id,
      ec.claim_text,
      ec.domain_label,
      es.vancouver as source_vancouver,
      es.url as source_url,
      0.01::real as rank
    from public.evidence_claims ec
    join public.evidence_sources es on es.id = ec.source_id
    cross join normalized n
    where ec.organization_id = p_organization_id
      and ec.status = 'published'
      and n.q is not null
      and (p_domain_label is null or ec.domain_label = p_domain_label)
      and not exists (select 1 from fts limit 1)
      and ec.claim_text ilike '%' || replace(n.q, '%', '') || '%'
  ),
  combined as (
    select * from fts
    union all
    select * from fallback
  )
  select
    c.id,
    c.claim_text,
    c.domain_label,
    c.source_vancouver,
    c.source_url,
    c.rank
  from combined c
  order by c.rank desc
  limit greatest(1, least(p_match_count, 10));
$$;
