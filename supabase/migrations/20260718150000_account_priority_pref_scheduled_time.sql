-- Exacte kloktijd voor leefstijlmoment in Agenda/Kompas (HH:MM, lokaal Amsterdam).
-- time_bucket blijft afgeleid veld voor dagdeel-weergave.
alter table public.account_priority_pref
  add column if not exists scheduled_time text;

comment on column public.account_priority_pref.scheduled_time is
  'Door gebruiker gekozen kloktijd HH:MM (lokaal, Europe/Amsterdam) voor het leefstijlmoment. time_bucket wordt hieruit afgeleid.';
