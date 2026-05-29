-- Fase 6: append-only event log for nurture, n8n, analytics

create table if not exists public.domain_events (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  occurred_at timestamptz not null default now(),
  event_type text not null,
  session_id uuid references public.intake_sessions (id) on delete set null,
  email text,
  payload jsonb not null default '{}'::jsonb,
  delivered_to text[] not null default '{}'::text[]
);

create index if not exists domain_events_type_occurred_idx
  on public.domain_events (event_type, occurred_at desc);

create index if not exists domain_events_session_idx
  on public.domain_events (session_id)
  where session_id is not null;

alter table public.domain_events enable row level security;

create policy "domain_events_org_isolation_authenticated"
  on public.domain_events
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );
