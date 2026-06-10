-- F0: capture-substraat voor de voeding zelf-evaluatie-lus (24h-zelfrapport).
-- Pseudoniem, periodiek per intake-sessie. Inname-zelfrapportage, geen status.
-- Zie docs/plan/PLAN_NUTRITION_SELFEVAL_LOOP.md.

create table if not exists public.intake_intake_log (
  session_id uuid not null references public.intake_sessions (id) on delete cascade,
  logged_at timestamptz not null default now(),
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  raw_inputs jsonb not null default '{}'::jsonb,
  estimate jsonb,
  estimate_version text,
  created_at timestamptz not null default now(),
  primary key (session_id, logged_at)
);

create index if not exists intake_intake_log_session_id_idx
  on public.intake_intake_log (session_id);

create index if not exists intake_intake_log_organization_id_idx
  on public.intake_intake_log (organization_id);

alter table public.intake_intake_log enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.intake_intake_log is
  'Pseudonieme periodieke voedings-zelfrapportage (inname, niet status); raw_inputs = bron, estimate = afgeleide inschatting (apart, herberekenbaar). Verwijderd bij AVG-revoke via cleanup_intake_session_linked_data().';

-- Cleanup-haak uitbreiden: BESTAANDE body volledig behouden + intake_intake_log toevoegen.
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
end;
$$;
