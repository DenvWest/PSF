-- Dead-man's switch: laatste succesvolle cron-runs (alleen service_role via API)

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
