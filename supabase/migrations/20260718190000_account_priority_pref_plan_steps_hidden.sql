-- Blijvend verbergen van plan-stappen op de agenda; herstelbaar via Moment.
alter table public.account_priority_pref
  add column if not exists plan_steps_hidden boolean not null default false;

comment on column public.account_priority_pref.plan_steps_hidden is
  'TRUE = toon geen plan-stappen meer op de agenda tot de gebruiker ze weer aanzet.';
