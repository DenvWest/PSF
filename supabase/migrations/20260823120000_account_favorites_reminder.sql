-- Voorbereidend tijd+alert-veld op leefstijlladder-favorieten. Verstuurt zelf
-- nog geen melding (geen Web Push, geen wearable-uitlezing) — dat volgt later
-- via een eigen verzendkanaal. Validatie van de tijdvelden (HH:MM) gebeurt in
-- de app-laag, zelfde patroon als account_priority_pref.scheduled_time.
alter table public.account_favorites
  add column if not exists reminder_start_time text;

alter table public.account_favorites
  add column if not exists reminder_end_time text;

alter table public.account_favorites
  add column if not exists reminder_interval_minutes integer;

alter table public.account_favorites
  add column if not exists alert_enabled boolean not null default false;

comment on column public.account_favorites.reminder_start_time is
  'Door gebruiker gekozen starttijd HH:MM (lokaal, Europe/Amsterdam). Validatie in app-laag.';
comment on column public.account_favorites.reminder_end_time is
  'Eindtijd van een herhalend tijdvenster (HH:MM). Alleen samen met reminder_interval_minutes.';
comment on column public.account_favorites.reminder_interval_minutes is
  'Herhaal-interval in minuten binnen het tijdvenster. Alleen samen met reminder_end_time.';
comment on column public.account_favorites.alert_enabled is
  'Of de gebruiker een melding wil op de ingestelde tijd(en). Voorbereidend veld: verstuurt zelf nog niets.';
