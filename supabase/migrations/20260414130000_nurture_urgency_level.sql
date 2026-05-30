-- Mirror van db/migrations/003: urgency_level op nurture_emails. Deze ALTER zat
-- alleen in de db/-set (handmatige psql) en ontbrak in de supabase-set, waardoor
-- een verse rebuild de kolom miste. Idempotent (no-op op productie).
alter table public.nurture_emails
  add column if not exists urgency_level text;

comment on column public.nurture_emails.urgency_level is
  'Toon-aanpassing in gepersonaliseerde mails; snapshot bij scheduling.';
