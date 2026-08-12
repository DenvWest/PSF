-- Funnel-views afschermen van de publieke API-rollen.
--
-- Aanleiding: Supabase security linter (rule 0010 security_definer_view) op alle
-- vier views uit 20260706120000_funnel_views.sql. Geverifieerd op de live database:
-- `anon` had SELECT en kon de views daadwerkelijk uitlezen via PostgREST.
--
-- Waarom dit lekte: views hebben geen eigen RLS, en deze draaien met
-- security_invoker = off (owner = postgres). Daarmee omzeilen ze de RLS op
-- domain_events, premium_waitlist, intake_domain_checkin en intake_intake_log.
-- De anon-key staat in de browser-bundle, dus de aggregaten waren publiek.
-- Geen PII in de output (alleen weken/labels/counts), wél bedrijfscijfers.
--
-- Waarom GEEN security_invoker = on: dan heeft n8n_readonly SELECT op de
-- brontabellen nodig, precies wat docs/cursors/fable-conversie-datastrategie-2026-07.md
-- §F3 uitsluit ("SELECT op uitsluitend de 4 views, niet op de brontabellen").
-- De SECURITY DEFINER-constructie is hier het middel, niet de fout — alleen de
-- grants naar anon/authenticated horen er niet bij.
--
-- Deploy: handmatig in Supabase Dashboard SQL Editor.
-- NOOIT supabase db push — remote migratie-historie is leeg.

revoke all on public.v_funnel_week from anon, authenticated;
revoke all on public.v_nurture_ctr from anon, authenticated;
revoke all on public.v_premium_intent from anon, authenticated;
revoke all on public.v_checkin_activity from anon, authenticated;

-- Let op bij toekomstig onderhoud: `create or replace view` behoudt de ACL, maar
-- `drop view` + `create view` niet — dan geven Supabase's default privileges de
-- anon-grants terug. Draai dit bestand daarna opnieuw.
