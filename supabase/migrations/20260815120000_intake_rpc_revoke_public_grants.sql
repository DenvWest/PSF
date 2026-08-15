-- Intake-RPC's afschermen van de publieke API-rollen.
--
-- Aanleiding: Supabase security linter, "Public Can Execute SECURITY DEFINER
-- Function" plus de signed-in variant, op drie functies uit
-- 20260521143000_intake_consent_revoke_tx.sql. Geverifieerd op de live database:
-- has_function_privilege('anon', <fn>, 'EXECUTE') gaf true op alle drie, terwijl
-- de zes andere security-definer-functies al dicht stonden.
--
-- Waarom dit lekte: Postgres geeft bij `create function` standaard EXECUTE aan
-- PUBLIC. De oorspronkelijke migratie deed alleen `grant ... to service_role`.
-- Dat is additief, dus de PUBLIC-grant bleef staan. De latere migraties doen het
-- wel goed — 20260616120000_account_claim_sessions.sql en
-- 20260728120000_supplement_verdicts.sql revoken eerst en granten daarna.
--
-- Waarom het telt: alle drie zijn `security definer` en omzeilen dus RLS. Wie een
-- session-uuid had, kon POST /rest/v1/rpc/delete_intake_session_data doen en die
-- sessie wissen buiten de API om — langs de rate limiter, de consent-controle en
-- de logging heen. Session-uuid's lopen door nurture-e-maillinks, dus ze zijn niet
-- zo besloten als hun entropie suggereert.
--
-- Waarom intrekken veilig is: de enige Supabase-client in de app is service-role
-- (src/lib/supabase-admin.ts), er staat geen anon-key in de browser-bundle en
-- auth.users is leeg. De drie API-routes die deze functies aanroepen
-- (api/intake/consent, api/intake/session, api/account/revoke) gaan alle via
-- createSupabaseAdmin(). cleanup_intake_session_linked_data wordt uitsluitend
-- intern aangeroepen door delete_intake_session_data, dat als definer draait —
-- die `perform` blijft dus werken zonder eigen grant voor de aanroeper.
--
-- Deploy: handmatig in Supabase Dashboard SQL Editor.
-- NOOIT supabase db push — remote migratie-historie is leeg.

revoke all on function public.cleanup_intake_session_linked_data(uuid)
  from public, anon, authenticated;
revoke all on function public.revoke_intake_session_consent(uuid)
  from public, anon, authenticated;
revoke all on function public.delete_intake_session_data(uuid)
  from public, anon, authenticated;

grant execute on function public.cleanup_intake_session_linked_data(uuid) to service_role;
grant execute on function public.revoke_intake_session_consent(uuid) to service_role;
grant execute on function public.delete_intake_session_data(uuid) to service_role;

-- Let op bij toekomstig onderhoud: `create or replace function` behoudt de ACL,
-- maar `drop function` + `create function` niet — dan zet de PUBLIC-default de
-- grant terug. Draai dit bestand daarna opnieuw. Dezelfde valkuil staat in
-- 20260812120000_funnel_views_revoke_anon.sql voor views.
