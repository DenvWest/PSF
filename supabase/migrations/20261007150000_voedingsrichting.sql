-- Richting van je voeding in Je doelen (NUT_DOEL), naast het concrete doel uit
-- de check (domain_goal, ijkpunt 0–10). BESLUIT_VOEDINGSRICHTING_2026-10.md.
--
-- voedingsrichting: energie · gewicht · spier · gezonder · klachten · weet_niet,
-- of null = nog niet gekozen. Kiest alleen volgorde en tekst in Patroon, nooit
-- de meting of de score (ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING §10.1).
-- Geen check-constraint: de server valideert tegen
-- src/lib/nutrition-voedingsrichting.ts.
alter table public.account_voedingsdoelen
  add column if not exists voedingsrichting text;

comment on column public.account_voedingsdoelen.voedingsrichting is
  'Waar je met je voeding naartoe wilt (NUT_DOEL): energie, gewicht, spier, gezonder, klachten of weet_niet; null = niet gekozen. Kiest volgorde en copy, nooit de score.';
