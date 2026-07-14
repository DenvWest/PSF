-- Affiliate fase 3A / plak A2 — eigen first-party 'tracking'-bron voor
-- automatisch geattribueerde leads (intake). Aparte kind zodat rapportage
-- auto-tracking van handmatige/CSV/netwerk-bronnen kan onderscheiden.
-- Uitvoeren via de Supabase Dashboard SQL Editor.

alter table public.af_sources drop constraint if exists af_sources_kind_check;
alter table public.af_sources
  add constraint af_sources_kind_check
  check (kind in ('manual', 'csv', 'network', 'bookkeeping', 'psp', 'tracking'));

insert into public.af_sources (kind, name) values
  ('tracking', 'Intake-tracking')
on conflict (name) do nothing;
