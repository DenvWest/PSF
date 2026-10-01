-- Schema-drift dichten (audit N5, docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md C5).
-- Vier tabellen bestaan in productie maar nergens als DDL in
-- supabase/migrations/: cron_runs en thema_nurture staan alleen in
-- db/migrations/ (een los, ouder migratiepad), thema_downloads en
-- remeasure_reminders staan NERGENS als DDL. Dat betekent: een schema-
-- restore naar een nieuw Supabase-project (DR, staging, B2B-omgeving)
-- zou deze 4 tabellen missen.
--
-- Alle `create table if not exists` — dit draait veilig tegen productie
-- waar de tabellen al bestaan: de create table-statements doen dan NIETS
-- (if not exists slaat de hele tabeldefinitie over, incl. constraints —
-- geen risico dat een nieuwe primary key botst met bestaande dubbele
-- rijen). Alleen de indexen/policies die met `if not exists`/`drop policy
-- if exists` + `create policy` werken, worden alsnog toegepast op de
-- bestaande tabel. Het doel is een correcte DR-restore naar een lege DB,
-- niet een wijziging van de huidige productietabellen.
--
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

-- ---------------------------------------------------------------------------
-- cron_runs — overgezet 1-op-1 uit db/migrations/006_cron_runs.sql
-- ---------------------------------------------------------------------------

create table if not exists public.cron_runs (
  id uuid primary key default gen_random_uuid(),
  cron_name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('running', 'success', 'error')),
  result jsonb,
  error_message text
);

create index if not exists cron_runs_name_completed
  on public.cron_runs (cron_name, completed_at desc);

alter table public.cron_runs enable row level security;

comment on table public.cron_runs is
  'Audit trail voor geplande cron-jobs; RLS aan, geen anon/authenticated policies.';

-- ---------------------------------------------------------------------------
-- thema_nurture — overgezet 1-op-1 uit db/migrations/004_create_thema_nurture.sql
-- DEPRECATED: legacy /thema/*-flow, vervangen door nurture_emails. Rijen
-- blijven bewaard voor AVG/audit, geen nieuwe inserts meer vanuit de app.
-- ---------------------------------------------------------------------------

create table if not exists public.thema_nurture (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  email text not null,
  thema text not null,
  sequence_day integer not null,
  scheduled_at timestamptz not null,
  status text default 'pending' not null
    check (status in ('pending', 'sent', 'failed', 'unsubscribed')),
  sent_at timestamptz,
  resend_id text,
  error_message text
);

create index if not exists idx_thema_nurture_pending
  on public.thema_nurture (status, scheduled_at)
  where status = 'pending';

create index if not exists idx_thema_nurture_email_thema
  on public.thema_nurture (email, thema);

alter table public.thema_nurture enable row level security;

drop policy if exists "anon_insert_thema_nurture" on public.thema_nurture;
drop policy if exists "service_all_thema_nurture" on public.thema_nurture;

-- Legacy-flow is deprecated sinds mei 2026 (zie db/migrations/004): geen
-- nieuwe inserts meer vanuit de app, dus de anon-insert-policy keert hier
-- NIET terug (dat zou de 15 aug-anon-policy-opruiming tegenspreken, zie
-- 20260815130000_drop_anon_policies.sql). Alleen service_role.
create policy "service_all_thema_nurture" on public.thema_nurture
  for all to service_role using (true) with check (true);

comment on table public.thema_nurture is
  'DEPRECATED: legacy /thema/*-flow, vervangen door nurture_emails (source/thema). Geen nieuwe inserts; rijen bewaard voor AVG/audit.';

-- ---------------------------------------------------------------------------
-- thema_downloads — stond nergens als DDL. Schema gereconstrueerd uit
-- information_schema.columns van productie (Dennis, 1 okt 2026) + het
-- gebruikspatroon van zijn tegenhanger thema_nurture.
-- ---------------------------------------------------------------------------

create table if not exists public.thema_downloads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  email text not null,
  thema text not null
);

create index if not exists idx_thema_downloads_email_thema
  on public.thema_downloads (email, thema);

alter table public.thema_downloads enable row level security;

-- De oorspronkelijke anon-insert-policy (genoemd in
-- 20260815130000_drop_anon_policies.sql als "Allow anonymous inserts on
-- thema_downloads") keert hier bewust NIET terug — diezelfde migratie
-- herriep ook de anon-grant. Alleen service_role.
drop policy if exists "Allow anonymous inserts on thema_downloads" on public.thema_downloads;
drop policy if exists "service_all_thema_downloads" on public.thema_downloads;
create policy "service_all_thema_downloads" on public.thema_downloads
  for all to service_role using (true) with check (true);

comment on table public.thema_downloads is
  'Legacy gids-downloadregistratie; schema gereconstrueerd uit productie 1 okt 2026, geen oorspronkelijke migratie gevonden.';

-- ---------------------------------------------------------------------------
-- remeasure_reminders — stond nergens als DDL. Schema gereconstrueerd uit
-- information_schema.columns van productie (Dennis, 1 okt 2026) + het
-- gebruikspatroon in src/lib/remeasure-reminder-cron.ts: alleen account_id
-- wordt geïnsert (sent_at krijgt de default), en account_id wordt gebruikt
-- als "is deze candidate al herinnerd"-filter — functioneel de unieke sleutel.
-- ---------------------------------------------------------------------------

create table if not exists public.remeasure_reminders (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table public.remeasure_reminders enable row level security;

drop policy if exists "service_all_remeasure_reminders" on public.remeasure_reminders;
create policy "service_all_remeasure_reminders" on public.remeasure_reminders
  for all to service_role using (true) with check (true);

comment on table public.remeasure_reminders is
  'Markeert welke accounts al een hermeting-herinnering kregen; account_id = functionele unieke sleutel. Schema gereconstrueerd uit productie 1 okt 2026, geen oorspronkelijke migratie gevonden.';
