-- consent_records kent alleen `session_id`, en dat is een verwijzing naar
-- public.intake_sessions. Het Connection Profile hangt bewust NIET aan de
-- leefstijlcheck (BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §7): een
-- toestemmingsrij die eerst een intake-sessie moet opzoeken, legt precies de
-- koppeling die de firewall verbiedt — en maakt de toestemming bovendien niet
-- los intrekbaar, wat §7 maatregel 4 wél eist.
--
-- Daarom een tweede, nullable subject-kolom. Bestaande rijen blijven
-- sessie-gebonden en veranderen niet; account-scoped toestemmingen (nu alleen
-- connection_profile_storage) hangen aan het account.
--
-- Regel, bewust NIET als check-constraint: precies één van beide kolommen is
-- gevuld. Een XOR-constraint zou falen op historische rijen waar session_id via
-- `on delete set null` al null is geworden. De regel wordt in de API-routes
-- afgedwongen, niet in het schema.
--
-- Deploy: handmatig in Supabase Dashboard SQL Editor.
-- NOOIT supabase db push — remote migratie-historie is leeg.

alter table public.consent_records
  add column if not exists account_id uuid
    references public.accounts (id) on delete cascade;

create index if not exists consent_records_account_id_idx
  on public.consent_records (account_id);

create index if not exists consent_records_type_account_idx
  on public.consent_records (consent_type, account_id);

comment on column public.consent_records.account_id is
  'Subject van de toestemming wanneer die aan een account hangt in plaats van aan een intake-sessie (bijv. connection_profile_storage). Precies één van session_id/account_id hoort gevuld te zijn; dat wordt in de API-routes afgedwongen.';
