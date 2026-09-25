-- De check op /intake krijgt een eigen sessie-ingang.
--
-- Tot nu toe maakte alleen de brede check (POST /api/intake/session) een rij in
-- intake_sessions aan, en kon de check op /intake zijn resultaat daardoor niet
-- opslaan zonder eerst de brede check (401 in nutrition-log). Een rij met
-- session_kind = 'nutrition' is het pseudonieme anker voor iemand die alleen de
-- check deed: de kolommen van de brede check blijven leeg, de check zelf staat
-- in intake_intake_log.
--
-- Alleen de check-constraint verandert. De kolommen van de brede check
-- (symptom_profile, answers, domain_scores, urgency_level, profile_label,
-- age_range, gender, rules_version) zijn nooit NOT NULL geweest; alleen de
-- TypeScript-types eisten ze.
--
-- De bestaande constraint wordt op zijn definitie gezocht, niet op een
-- aangenomen naam: een `drop constraint if exists <verkeerde naam>` zou stil
-- niets doen, en dan houdt de oude check 'nutrition' alsnog tegen.
--
-- Additief: geen bestaande rij verandert.
-- Zie docs/plan/BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §6.
--
-- Deploy: handmatig in Supabase Dashboard SQL Editor.
-- NOOIT supabase db push — remote migratie-historie is leeg.

do $$
declare
  v_conname text;
begin
  for v_conname in
    select conname
    from pg_constraint
    where conrelid = 'public.intake_sessions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%session_kind%'
  loop
    execute format('alter table public.intake_sessions drop constraint %I', v_conname);
  end loop;
end $$;

alter table public.intake_sessions
  add constraint intake_sessions_session_kind_check
  check (session_kind in ('initial', 'remeasure', 'nutrition'));

comment on column public.intake_sessions.session_kind is
  'initial | remeasure = brede check (eerste meting/hermeting); nutrition = alleen de check op /intake — kolommen van de brede check zijn dan null. Zie docs/plan/BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md.';
