-- Join-key voor feedback/delta-loops per advies-engine-regelset
alter table public.intake_sessions
  add column if not exists rules_version text;

update public.intake_sessions
  set rules_version = 'pre-1.0'
  where rules_version is null;

comment on column public.intake_sessions.rules_version is
  'Advies-engine semver; join-key voor feedback/delta-segmentatie. Geen DB-default — app schrijft expliciet.';
