-- Dagkeuze beweging (herstel/matig/trainen) expliciet opslaan i.p.v. afleiden uit
-- welk vinkje toevallig aanstaat. Zelfde "waarde + datum"-patroon als
-- plan_step_dismissed_date: de keuze geldt alleen als de datum vandaag is.
alter table public.account_priority_pref
  add column if not exists movement_day_choice text;

alter table public.account_priority_pref
  add column if not exists movement_day_choice_date date;

comment on column public.account_priority_pref.movement_day_choice is
  'Gekozen belastings-tier voor vandaag: herstel | matig | trainen. NULL = nog niet gekozen. Geen score, geen meting.';

comment on column public.account_priority_pref.movement_day_choice_date is
  'ISO-datum waarop movement_day_choice is gezet. Wijkt af van vandaag = keuze verlopen, gebruiker kiest opnieuw.';
