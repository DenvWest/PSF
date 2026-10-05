-- Eigen invloed op de kernstof-normen (BESLUIT_PATROON_PER_MAALTIJD_2026-10.md,
-- plak 2; herziet punt 5 van BESLUIT_KERNSTOF_NORMEN_2026-10.md).
--
-- Twee soorten invoer, één rij per account:
-- - Profielkeuzes die bepalen welke Gezondheidsraad-norm geldt: geslacht
--   (overschrijft dat uit de check), 70 jaar of ouder, voedingswijze.
-- - Een eigen streefwaarde per kernstof. Die staat als tweede lijn naast de
--   norm; "gehaald" blijft altijd tegen de norm rekenen.
--
-- Geen check-constraints op de waarden: de server valideert tegen
-- src/lib/account-kernstof-profiel.ts, en een waarde die daar later
-- verdwijnt, moet een oude rij niet laten falen.
--
-- Zelfde opzet als account_gevolgde_stoffen: organization_id, RLS deny-all,
-- alleen server-side via service role.
create table if not exists public.account_kernstof_profiel (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  geslacht text,
  zeventig_plus boolean not null default false,
  voedingswijze text,
  streefwaarden jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists account_kernstof_profiel_account_id_idx
  on public.account_kernstof_profiel (account_id);

alter table public.account_kernstof_profiel enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_kernstof_profiel is
  'Profielkeuzes voor de kernstof-normen en eigen streefwaarden (BESLUIT_PATROON_PER_MAALTIJD_2026-10.md, plak 2). Het oordeel "gehaald" rekent altijd tegen de norm, nooit tegen de streefwaarde.';
comment on column public.account_kernstof_profiel.geslacht is
  '"man" | "vrouw" | null (null = uit de check). Bepaalt de norm voor magnesium en zink.';
comment on column public.account_kernstof_profiel.zeventig_plus is
  'Vitamine D-norm 20 µg in plaats van 10 µg (Gezondheidsraad 2012).';
comment on column public.account_kernstof_profiel.voedingswijze is
  '"vegetarisch" | "veganistisch" | null. Verandert geen norm, alleen welke voedingsbronnen we tonen.';
comment on column public.account_kernstof_profiel.streefwaarden is
  'Eigen streefwaarde per kernstof, {"magnesium": 400, ...}, in de eenheid van de norm.';
