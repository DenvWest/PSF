-- Capture-substraat voor domein-checkins (stress, beweging, etc.).
-- Pseudoniem, periodiek per intake-sessie. Zelfrapportage, geen status.

create table if not exists public.intake_domain_checkin (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.intake_sessions (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  domain_key text not null,
  raw_inputs jsonb not null default '{}'::jsonb,
  score jsonb not null default '{}'::jsonb,
  rules_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists intake_domain_checkin_session_id_idx
  on public.intake_domain_checkin (session_id);

create index if not exists intake_domain_checkin_organization_id_idx
  on public.intake_domain_checkin (organization_id);

create index if not exists intake_domain_checkin_domain_key_idx
  on public.intake_domain_checkin (domain_key);

alter table public.intake_domain_checkin enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.intake_domain_checkin is
  'Pseudonieme periodieke domein-checkins (zelfrapportage, niet status); raw_inputs = bron inclusief optionele signaalvelden, score = afgeleide domeinscore. Verwijderd bij AVG-revoke via cleanup_intake_session_linked_data().';

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

  if to_regclass('public.intake_intake_log') is not null then
    delete from public.intake_intake_log where session_id = p_session_id;
  end if;

  if to_regclass('public.intake_domain_checkin') is not null then
    delete from public.intake_domain_checkin where session_id = p_session_id;
  end if;
end;
$$;
