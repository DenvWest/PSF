-- Eenmalige recovery-links voor intake-resultaten (TTL + one-time-use)
create table if not exists public.recovery_tokens (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references public.intake_sessions (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists recovery_tokens_session_id_idx
  on public.recovery_tokens (session_id);

create index if not exists recovery_tokens_expires_at_idx
  on public.recovery_tokens (expires_at)
  where used_at is null;

alter table public.recovery_tokens enable row level security;
