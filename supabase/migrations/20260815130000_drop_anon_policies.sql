-- Alle anon-policies droppen: de anon-rol heeft in deze app geen taak meer.
--
-- Aanleiding: Supabase security linter, "RLS Policy Always True". Geverifieerd op
-- de live database via pg_policies. Drie daarvan zijn geen ruis maar een lek:
--
--   intake_sessions.anon_read_sessions    SELECT true  → answers, domain_scores,
--                                                        symptom_profile,
--                                                        marketing_email, first_name
--   intake_reminders.anon_read_reminders  SELECT true  → alle e-mailadressen
--   intake_reminders.anon_update_reminders UPDATE true → reminders manipuleerbaar
--   affiliate_clicks.anon_read_clicks     SELECT true  → volledige klik-omzetdata
--
-- Waarom dit telt: de anon-key is publiek geweest. src/components/content/
-- AffiliateLink.tsx is een client-component en importeerde src/lib/track.ts, die
-- de anon-client uit het verwijderde src/lib/supabase.ts gebruikte. Next.js
-- inlinet NEXT_PUBLIC_SUPABASE_ANON_KEY in de client-bundle, dus de key stond in
-- de publieke JS van ongeveer 11 april (8a9c1a2) tot 30 mei 2026 (1cfa0d9).
-- Wie hem toen heeft opgehaald, kon met SELECT op intake_sessions de complete
-- gezondheidsdataset uitlezen. Een legacy JWT-anon-key blijft geldig tot hij
-- expliciet is uitgezet — het intrekken van deze policies is dus nodig, maar
-- controleer daarnaast in Project Settings → API Keys of de legacy keys nog
-- aanstaan, en zet ze uit als dat zo is.
--
-- Waarom droppen veilig is: er is geen anon-client meer. De enige createClient in
-- de codebase is service-role (src/lib/supabase-admin.ts), en auth.users is leeg.
-- Alle acht tabellen worden uitsluitend via createSupabaseAdmin() geschreven:
-- api/affiliate/click, api/gids/opt-in, api/intake/*, lib/nurture.ts,
-- lib/guide-nurture.ts, api/unsubscribe. service_role omzeilt RLS, dus geen
-- enkele policy hieronder is nodig voor de werking van de app.
--
-- De service_role-policies blijven staan: die zijn bewust always-true en de
-- linter flagt ze terecht als zodanig, maar ze zijn correct.
--
-- Let op: anon_insert_guide_opt_ins staat gedeclareerd in
-- 20260519120000_guide_opt_in.sql. Die migratie blijft zoals hij is — dit bestand
-- is de latere correctie, niet een herschrijving van de historie.
--
-- Deploy: handmatig in Supabase Dashboard SQL Editor.
-- NOOIT supabase db push — remote migratie-historie is leeg.

-- 1. De lekken.
drop policy if exists "anon_read_sessions"    on public.intake_sessions;
drop policy if exists "anon_read_reminders"   on public.intake_reminders;
drop policy if exists "anon_update_reminders" on public.intake_reminders;
drop policy if exists "anon_read_clicks"      on public.affiliate_clicks;

-- 2. De insert-policies: geen lek, wel ongeauthenticeerde schrijftoegang buiten
--    de API om, dus langs de rate limiter en de consent-registratie heen.
drop policy if exists "anon_insert_sessions"                     on public.intake_sessions;
drop policy if exists "anon_insert_reminders"                    on public.intake_reminders;
drop policy if exists "anon_insert_feedback"                     on public.intake_feedback;
drop policy if exists "anon_insert_clicks"                       on public.affiliate_clicks;
drop policy if exists "anon_insert_nurture"                      on public.nurture_emails;
drop policy if exists "anon_insert_guide_opt_ins"                on public.guide_opt_ins;
drop policy if exists "anon_insert_thema_nurture"                on public.thema_nurture;
drop policy if exists "Allow anonymous inserts on thema_downloads" on public.thema_downloads;

-- 3. Tweede muur. RLS zonder policy is al deny, maar de grant hoort ook weg:
--    dan faalt een toekomstige anon-aanroep op het recht, niet op de policy.
revoke all on table public.intake_sessions   from anon;
revoke all on table public.intake_reminders  from anon;
revoke all on table public.intake_feedback   from anon;
revoke all on table public.affiliate_clicks  from anon;
revoke all on table public.nurture_emails    from anon;
revoke all on table public.guide_opt_ins     from anon;
revoke all on table public.thema_nurture     from anon;
revoke all on table public.thema_downloads   from anon;
