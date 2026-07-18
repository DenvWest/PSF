-- Verberg plan-stap op agenda voor één dag; herstelbaar via Moment.
alter table public.account_priority_pref
  add column if not exists plan_step_dismissed_date date;

comment on column public.account_priority_pref.plan_step_dismissed_date is
  'ISO-datum waarop de gebruiker de analyse-stap op de agenda verborg. NULL = zichtbaar.';
