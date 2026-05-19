-- Mirror van supabase/migrations/20260519120000_guide_opt_in.sql voor handmatige deploy

alter table nurture_emails
  add column if not exists source text not null default 'intake',
  add column if not exists thema text,
  add column if not exists template_key text;

alter table nurture_emails
  alter column session_id drop not null;

create index if not exists idx_nurture_emails_pending_source
  on nurture_emails (status, scheduled_at, source)
  where status = 'pending';

create table if not exists guide_opt_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  thema text not null,
  consent_type text not null default 'guide_marketing_email',
  consent_version text not null,
  consent_text text not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  ip_hash text,
  ua_hash text
);

create index if not exists idx_guide_opt_ins_email_thema
  on guide_opt_ins (email, thema);

alter table guide_opt_ins enable row level security;

create policy "anon_insert_guide_opt_ins" on guide_opt_ins
  for insert to anon with check (true);

create policy "service_all_guide_opt_ins" on guide_opt_ins
  for all to service_role using (true) with check (true);

update thema_nurture set status = 'cancelled' where status = 'pending';
