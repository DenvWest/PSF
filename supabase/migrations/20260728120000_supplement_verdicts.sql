-- Oordeel-ruggengraat: per account en ingrediënt precies één geldig supplementoordeel.
-- Append-only: een nieuw oordeel superseedt het vorige, historie blijft staan.
-- Vervangt intake_sessions.recommendations (T=0-snapshot) als bron voor "wat vinden wij nu".
-- Account-scoped, RLS deny-all — alleen service_role via API-routes.

create table if not exists public.supplement_verdicts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  ingredient_key text not null,
  verdict text not null check (
    verdict in ('kopen', 'niet_nodig', 'eerst_leefstijl', 'nooit')
  ),
  reason_key text not null,
  evidence_claim_id uuid references public.evidence_claims (id) on delete set null,
  based_on_session_id uuid references public.intake_sessions (id) on delete set null,
  based_on jsonb not null default '{}'::jsonb,
  rules_version text not null,
  next_review_at date,
  superseded_at timestamptz,
  created_at timestamptz not null default now()
);

-- Precies één geldig oordeel per (account, ingrediënt).
create unique index if not exists supplement_verdicts_current_idx
  on public.supplement_verdicts (account_id, ingredient_key)
  where superseded_at is null;

-- Ritme-query (stap 2): welke oordelen zijn toe aan hertoetsing?
create index if not exists supplement_verdicts_review_due_idx
  on public.supplement_verdicts (next_review_at)
  where superseded_at is null and next_review_at is not null;

create index if not exists supplement_verdicts_history_idx
  on public.supplement_verdicts (account_id, ingredient_key, created_at desc);

create index if not exists supplement_verdicts_organization_id_idx
  on public.supplement_verdicts (organization_id);

alter table public.supplement_verdicts enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.supplement_verdicts is
  'Append-only supplementoordelen per account en ingrediënt: kopen / niet_nodig / eerst_leefstijl / nooit. superseded_at is null = geldig oordeel. based_on bevat de scores, signalen en triggers waarop het oordeel rust (reproduceerbaar). Verwijderd bij AVG-revoke via cleanup_intake_session_linked_data().';

comment on column public.supplement_verdicts.based_on is
  'Reproduceerbaarheids-snapshot: domain scores, deficiency-signalen, profiellabel, getriggerde regels en eligibility op moment van oordeel.';

comment on column public.supplement_verdicts.next_review_at is
  'Wanneer dit oordeel opnieuw getoetst moet worden. Voedt de hercheck-/herbestelmomenten.';

-- Atomair oordeel vastleggen: no-op bij ongewijzigd oordeel, anders supersede + insert.
-- Volgorde (update vóór insert) houdt supplement_verdicts_current_idx altijd geldig.
create or replace function public.record_supplement_verdict(
  p_account_id uuid,
  p_ingredient_key text,
  p_verdict text,
  p_reason_key text,
  p_rules_version text,
  p_based_on jsonb default '{}'::jsonb,
  p_based_on_session_id uuid default null,
  p_evidence_claim_id uuid default null,
  p_next_review_at date default null
)
returns table (verdict_id uuid, changed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current public.supplement_verdicts;
  v_new_id uuid;
begin
  select * into v_current
  from public.supplement_verdicts
  where account_id = p_account_id
    and ingredient_key = p_ingredient_key
    and superseded_at is null
  for update;

  if found
    and v_current.verdict = p_verdict
    and v_current.reason_key = p_reason_key
    and v_current.rules_version = p_rules_version
  then
    return query select v_current.id, false;
    return;
  end if;

  if found then
    update public.supplement_verdicts
    set superseded_at = now()
    where id = v_current.id;
  end if;

  insert into public.supplement_verdicts (
    account_id,
    ingredient_key,
    verdict,
    reason_key,
    evidence_claim_id,
    based_on_session_id,
    based_on,
    rules_version,
    next_review_at
  )
  values (
    p_account_id,
    p_ingredient_key,
    p_verdict,
    p_reason_key,
    p_evidence_claim_id,
    p_based_on_session_id,
    coalesce(p_based_on, '{}'::jsonb),
    p_rules_version,
    p_next_review_at
  )
  returning id into v_new_id;

  return query select v_new_id, true;

exception
  when unique_violation then
    -- Gelijktijdige eerste insert voor hetzelfde (account, ingrediënt): de ander won.
    select id into v_new_id
    from public.supplement_verdicts
    where account_id = p_account_id
      and ingredient_key = p_ingredient_key
      and superseded_at is null;
    return query select v_new_id, false;
end;
$$;

revoke all on function public.record_supplement_verdict(
  uuid, text, text, text, text, jsonb, uuid, uuid, date
) from public, anon, authenticated;

-- AVG: oordelen die op een ingetrokken sessie rusten verdwijnen mee.
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

  if to_regclass('public.supplement_verdicts') is not null then
    delete from public.supplement_verdicts where based_on_session_id = p_session_id;
  end if;
end;
$$;
