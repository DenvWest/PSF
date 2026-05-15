-- Optional first name for personalization (nurture e-mails, future UX)
alter table public.intake_sessions
  add column if not exists first_name text;

comment on column public.intake_sessions.first_name is 'Optional voornaam; alleen voor personalisatie, geen medische data.';

alter table public.nurture_emails
  add column if not exists first_name text;

comment on column public.nurture_emails.first_name is 'Snapshot van voornaam bij scheduling (nullable voor oude rijen).';
