-- Soft delete voor agenda-blokken: verborgen momenten blijven herstelbaar.
alter table public.agenda_blocks
  add column if not exists deleted_at timestamptz;

create index if not exists agenda_blocks_account_archived_idx
  on public.agenda_blocks (account_id, deleted_at desc)
  where deleted_at is not null;

comment on column public.agenda_blocks.deleted_at is
  'Tijdstip waarop gebruiker het blok verborg. NULL = actief op de agenda.';
