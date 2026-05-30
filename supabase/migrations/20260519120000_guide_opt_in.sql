-- Gids-opt-in: nurture_emails source/thema + guide_opt_ins consent audit

alter table public.nurture_emails
  add column if not exists source text not null default 'intake',
  add column if not exists thema text,
  add column if not exists template_key text;

alter table public.nurture_emails
  alter column session_id drop not null;

create index if not exists idx_nurture_emails_pending_source
  on public.nurture_emails (status, scheduled_at, source)
  where status = 'pending';

comment on column public.nurture_emails.source is 'intake | guide_slaap | guide_stress | …';
comment on column public.nurture_emails.thema is 'Thema-slug bij gids-opt-in (slaap, stress, …)';
comment on column public.nurture_emails.template_key is 'Audittrail template key bij insert';

create table if not exists public.guide_opt_ins (
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
  on public.guide_opt_ins (email, thema);

alter table public.guide_opt_ins enable row level security;

create policy "anon_insert_guide_opt_ins"
  on public.guide_opt_ins
  for insert
  to anon
  with check (true);

create policy "service_all_guide_opt_ins"
  on public.guide_opt_ins
  for all
  to service_role
  using (true)
  with check (true);

-- Uitfaseren thema_nurture pending rijen (legacy flow).
-- Guarded: thema_nurture bestaat niet in een supabase-only/verse DB, en de
-- legacy CHECK staat geen 'cancelled' toe -> daarom een delete binnen een guard.
do $$
begin
  if to_regclass('public.thema_nurture') is not null then
    delete from public.thema_nurture where status = 'pending';
  end if;
end $$;
