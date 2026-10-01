-- AVG: domain_events meenemen in de sessie-opruiming (audit N6c,
-- docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md C3). De FK van
-- domain_events.session_id naar intake_sessions is `on delete set null`,
-- dus een sessie verwijderen liet de events-rijen (met hun payload)
-- gewoon bestaan. cleanup_intake_session_linked_data() wordt aangeroepen
-- door zowel revoke_intake_session_consent() als delete_intake_session_data()
-- (zie 20260602100000_plan_progress.sql), dus deze ene wijziging dekt beide.
--
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

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

  if to_regclass('public.domain_events') is not null then
    delete from public.domain_events where session_id = p_session_id;
  end if;
end;
$$;
