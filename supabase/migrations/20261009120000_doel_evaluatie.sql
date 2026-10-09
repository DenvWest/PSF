-- Evaluatie van je doel op voeding: wanneer je je richting koos, waar je toen
-- stond, en wanneer je hem voor het laatst bevestigde.
-- BESLUIT_DOEL_ZONE_RICHTING_EVALUATIE_2026-10.md §3 en §4.
--
-- voedingsrichting_gekozen_op: moment waarop voedingsrichting voor het laatst is
-- gekozen of gewijzigd. Null = onbekend (richtingen van vóór deze migratie);
-- de code behandelt dat als "nog geen evaluatie gepland", niet als een datum.
--
-- doel_startstand: de eerste stand per stof, nooit overschreven:
--   { "<stof>": { "datum": "2026-10-09", "aandeelPct": 48, "dagen": 5 } }
-- Alleen de stof, de datum, een afgerond percentage en het aantal volle dagen.
-- Geen producten, maaltijden of vrije tekst (voedingsgegevens zijn art. 9).
--
-- doel_bevestigd_op: laatste keer dat je bij de evaluatie "Houden" koos; het
-- evaluatieblok verdwijnt daarna voor 30 dagen.
alter table public.account_voedingsdoelen
  add column if not exists voedingsrichting_gekozen_op timestamptz,
  add column if not exists doel_startstand jsonb,
  add column if not exists doel_bevestigd_op timestamptz;

comment on column public.account_voedingsdoelen.voedingsrichting_gekozen_op is
  'Wanneer voedingsrichting voor het laatst is gekozen of gewijzigd; null = onbekend (van vóór de evaluatie).';
comment on column public.account_voedingsdoelen.doel_startstand is
  'Eerste stand per stof, nooit overschreven: { stof: { datum, aandeelPct, dagen } }. Geen producten of vrije tekst.';
comment on column public.account_voedingsdoelen.doel_bevestigd_op is
  'Laatste "Houden" bij de doel-evaluatie; het blok verdwijnt daarna 30 dagen.';
