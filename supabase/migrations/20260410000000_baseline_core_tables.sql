-- Baseline: kerntabellen die buiten version control zijn ontstaan en in geen
-- enkele latere migratie worden aangemaakt (ze worden alleen ge-ALTER'd).
-- Zonder deze baseline faalt een verse `supabase db reset` direct op de eerste
-- ALTER-migratie (20260411000000_intake_feedback.sql verwijst naar intake_sessions).
--
-- Alles is `if not exists` -> op productie volledig no-op (tabellen bestaan al,
-- de hele definitie wordt dan genegeerd). De kolommen hieronder zijn de
-- ORIGINELE set; latere migraties voegen organization_id, age_range,
-- marketing_email, first_name, reminder_type, session_id, source, thema,
-- template_key, urgency_level etc. toe.
--
-- Geverifieerd tegen productie (information_schema.columns + pg_constraint) op
-- 2026-05-30. Timestamp bewust < 20260411000000 zodat dit als eerste draait.

create table if not exists public.intake_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  symptom_profile text[],
  answers jsonb,
  domain_scores jsonb,
  urgency_level text,
  profile_label text
);

create table if not exists public.nurture_emails (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  session_id uuid not null references public.intake_sessions (id) on delete cascade,
  email text not null,
  sequence_day integer not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text default 'pending'
    check (status in ('pending', 'sent', 'failed', 'cancelled')),
  profile_label text,
  primary_domain text,
  domain_scores jsonb,
  resend_id text,
  error_message text
);

create table if not exists public.intake_reminders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text not null,
  reminder_date timestamptz not null,
  sent boolean default false
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_naam text not null,
  categorie text,
  pagina text,
  "timestamp" timestamptz default now()
);
