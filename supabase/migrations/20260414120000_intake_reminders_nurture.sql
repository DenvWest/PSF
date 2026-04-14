-- Nurture-sequence: type per herinnering + koppeling aan intake-sessie.
alter table public.intake_reminders
  add column if not exists reminder_type text not null default '30d';

alter table public.intake_reminders
  add column if not exists session_id uuid references public.intake_sessions (id) on delete cascade;

comment on column public.intake_reminders.reminder_type is
  'welcome | day3 | day7 | day14 | day21 | day30 (legacy: 30d wordt als day30 behandeld)';

create index if not exists intake_reminders_session_id_idx
  on public.intake_reminders (session_id);

create index if not exists intake_reminders_due_unsent_idx
  on public.intake_reminders (reminder_date, sent)
  where sent = false;
