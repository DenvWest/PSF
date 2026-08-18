-- Opgeslagen favorieten uit leefstijlkeuze (activiteit, supplement, dienst).
-- Account-scoped, RLS deny-all — alleen service_role via API.
create table if not exists public.account_favorites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  item_id text not null,
  title text not null,
  kind text not null check (kind in ('activiteit', 'supplement', 'dienst')),
  domain text,
  source text check (source in ('aanbevolen', 'mijn_keuze')),
  created_at timestamptz not null default now(),
  unique (account_id, item_id)
);

create index if not exists account_favorites_account_id_idx
  on public.account_favorites (account_id);

alter table public.account_favorites enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_favorites is
  'Door gebruiker opgeslagen favorieten uit leefstijlkeuze (aanbevolen of mijn keuze). Account-scoped, cascade bij verwijdering.';
