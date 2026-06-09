-- C+1: immutable baseline snapshot + remeasure session linkage

create table if not exists public.intake_baseline_snapshots (
  session_id uuid primary key references public.intake_sessions (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  frozen_at timestamptz not null default now(),
  domain_scores jsonb not null,
  profile_label text not null,
  urgency_level text not null,
  rules_version text not null,
  primary_theme text,
  symptom_profile text[] not null default '{}'::text[],
  age_range text not null
);

create index if not exists intake_baseline_snapshots_org_idx
  on public.intake_baseline_snapshots (organization_id);

alter table public.intake_baseline_snapshots enable row level security;

alter table public.intake_sessions
  add column if not exists session_kind text not null default 'initial'
    check (session_kind in ('initial', 'remeasure')),
  add column if not exists baseline_session_id uuid
    references public.intake_sessions (id) on delete set null;

create index if not exists intake_sessions_baseline_session_id_idx
  on public.intake_sessions (baseline_session_id)
  where baseline_session_id is not null;

create or replace function public.cleanup_intake_session_linked_data(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  update public.consent_records
  set withdrawn_at = v_now
  where session_id = p_session_id
    and withdrawn_at is null;

  delete from public.nurture_emails where session_id = p_session_id;
  delete from public.intake_reminders where session_id = p_session_id;

  if to_regclass('public.recovery_tokens') is not null then
    delete from public.recovery_tokens where session_id = p_session_id;
  end if;

  if to_regclass('public.plan_progress') is not null then
    delete from public.plan_progress where session_id = p_session_id;
  end if;

  if to_regclass('public.intake_baseline_snapshots') is not null then
    delete from public.intake_baseline_snapshots where session_id = p_session_id;
  end if;
end;
$$;

comment on table public.intake_baseline_snapshots is
  'Immutable dag-0 baseline; overleeft domain_scores-nulling op live rij bij revoke cleanup.';
