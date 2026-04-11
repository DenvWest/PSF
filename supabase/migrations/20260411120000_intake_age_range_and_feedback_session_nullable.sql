-- Leeftijdscategorie bij intake-sessies
alter table public.intake_sessions
  add column if not exists age_range text;

-- Feedback mag los van sessie (bijv. geen id na insert-fout)
alter table public.intake_feedback
  alter column session_id drop not null;
