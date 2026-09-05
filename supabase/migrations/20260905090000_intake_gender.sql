-- Geslacht bij intake-sessies (content-personalisatie, geen scoring-input)
alter table public.intake_sessions
  add column if not exists gender text;

alter table public.intake_baseline_snapshots
  add column if not exists gender text;
