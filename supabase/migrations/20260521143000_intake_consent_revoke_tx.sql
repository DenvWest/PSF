-- Atomische anon-revoke en full delete voor intake-sessies (AVG)
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
