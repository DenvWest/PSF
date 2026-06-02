-- Pseudonieme voortgang per intake-sessie en leefstijldomein (leefstijlplan stap 3a)
create table if not exists public.plan_progress (
  session_id uuid not null references public.intake_sessions (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001',
  domain text not null,
  template_version text not null,
  current_phase_id text not null,
  steps jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (session_id, domain)
);

create index if not exists plan_progress_session_id_idx
  on public.plan_progress (session_id);

create index if not exists plan_progress_organization_id_idx
  on public.plan_progress (organization_id);

alter table public.plan_progress enable row level security;

-- Geen anon/authenticated policies: alleen service role via API-routes.

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
end;
$$;

create or replace function public.revoke_intake_session_consent(p_session_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_anon constant text := '—';
  v_empty_scores jsonb := '{"sleep_score":0,"energy_score":0,"stress_score":0,"nutrition_score":0,"movement_score":0,"recovery_score":0}'::jsonb;
begin
  select trim(profile_label) into v_label
  from public.intake_sessions
  where id = p_session_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if coalesce(v_label, '') = v_anon then
    return 'already_anonymized';
  end if;

  perform public.cleanup_intake_session_linked_data(p_session_id);

  update public.intake_sessions
  set
    symptom_profile = array[]::text[],
    answers = '{}'::jsonb,
    domain_scores = v_empty_scores,
    urgency_level = v_anon,
    profile_label = v_anon,
    age_range = null,
    marketing_email = null,
    first_name = null
  where id = p_session_id;

  return 'revoked';
end;
$$;

create or replace function public.delete_intake_session_data(p_session_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.intake_sessions where id = p_session_id
  ) then
    return 'not_found';
  end if;

  perform public.cleanup_intake_session_linked_data(p_session_id);

  delete from public.intake_sessions where id = p_session_id;

  return 'deleted';
end;
$$;

grant execute on function public.cleanup_intake_session_linked_data(uuid) to service_role;
grant execute on function public.revoke_intake_session_consent(uuid) to service_role;
grant execute on function public.delete_intake_session_data(uuid) to service_role;
