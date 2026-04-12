-- B2B multi-tenancy: organizations + organization_id op tenant-tabellen.
-- Service role (Next.js API) bypassed RLS; policies zijn voor toekomstige JWT/tenant-toegang.
-- Anon heeft geen policies → geen toegang zodra RLS aan staat.

-- Organizations tabel
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now(),
  settings jsonb default '{}'::jsonb
);

alter table public.organizations enable row level security;

-- Default B2C organisatie
insert into public.organizations (id, name, slug)
values (
  '00000000-0000-0000-0000-000000000001',
  'PerfectSupplement',
  'default'
)
on conflict (slug) do nothing;

-- organization_id kolommen (nullable tot backfill)
alter table public.intake_sessions
  add column if not exists organization_id uuid references public.organizations (id);

alter table public.intake_feedback
  add column if not exists organization_id uuid references public.organizations (id);

alter table public.intake_reminders
  add column if not exists organization_id uuid references public.organizations (id);

alter table public.consent_records
  add column if not exists organization_id uuid references public.organizations (id);

alter table public.affiliate_clicks
  add column if not exists organization_id uuid references public.organizations (id);

-- Backfill
update public.intake_sessions
set organization_id = '00000000-0000-0000-0000-000000000001'
where organization_id is null;

update public.intake_feedback
set organization_id = '00000000-0000-0000-0000-000000000001'
where organization_id is null;

update public.intake_reminders
set organization_id = '00000000-0000-0000-0000-000000000001'
where organization_id is null;

update public.consent_records
set organization_id = '00000000-0000-0000-0000-000000000001'
where organization_id is null;

update public.affiliate_clicks
set organization_id = '00000000-0000-0000-0000-000000000001'
where organization_id is null;

-- NOT NULL + default
alter table public.intake_sessions
  alter column organization_id set default '00000000-0000-0000-0000-000000000001',
  alter column organization_id set not null;

alter table public.intake_feedback
  alter column organization_id set default '00000000-0000-0000-0000-000000000001',
  alter column organization_id set not null;

alter table public.intake_reminders
  alter column organization_id set default '00000000-0000-0000-0000-000000000001',
  alter column organization_id set not null;

alter table public.consent_records
  alter column organization_id set default '00000000-0000-0000-0000-000000000001',
  alter column organization_id set not null;

alter table public.affiliate_clicks
  alter column organization_id set default '00000000-0000-0000-0000-000000000001',
  alter column organization_id set not null;

-- Indexen
create index if not exists intake_sessions_organization_id_idx
  on public.intake_sessions (organization_id);

create index if not exists intake_feedback_organization_id_idx
  on public.intake_feedback (organization_id);

create index if not exists intake_reminders_organization_id_idx
  on public.intake_reminders (organization_id);

create index if not exists consent_records_organization_id_idx
  on public.consent_records (organization_id);

create index if not exists affiliate_clicks_organization_id_idx
  on public.affiliate_clicks (organization_id);

-- RLS: intake-gerelateerde tabellen (anon heeft geen policies → deny)
alter table public.intake_sessions enable row level security;
alter table public.intake_feedback enable row level security;
alter table public.intake_reminders enable row level security;
alter table public.affiliate_clicks enable row level security;

-- Tenant-scope voor authenticated JWT (app_metadata.organization_id)
create policy "organizations_authenticated_select_own"
  on public.organizations
  for select
  to authenticated
  using (
    id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "intake_sessions_org_isolation_authenticated"
  on public.intake_sessions
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "intake_feedback_org_isolation_authenticated"
  on public.intake_feedback
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "intake_reminders_org_isolation_authenticated"
  on public.intake_reminders
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "consent_records_org_isolation_authenticated"
  on public.consent_records
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

create policy "affiliate_clicks_org_isolation_authenticated"
  on public.affiliate_clicks
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );
