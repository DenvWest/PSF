-- Premium-wachtlijst: vraag-validatie per premium-feature (fake-door / smoke-test)
create table if not exists public.premium_waitlist (
  id uuid default gen_random_uuid() primary key,
  account_id uuid not null references public.accounts (id) on delete cascade,
  feature text not null check (feature in ('inzichten', 'statistieken', 'lichaamssamenstelling')),
  source text,
  created_at timestamptz default now(),
  unique (account_id, feature)
);

create index if not exists premium_waitlist_feature_idx
  on public.premium_waitlist (feature);

alter table public.premium_waitlist enable row level security;
