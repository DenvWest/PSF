-- AVG: domain_events.email droppen (audit N6a, docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md C3).
-- Het verwerkingsregister (docs/core/VERWERKINGSREGISTER.md §7) noemt
-- domain_events "geanonimiseerde events" met alleen een pseudoniem
-- session_id — er is nooit toestemming gevraagd om hier e-mailadressen in
-- op te slaan. De applicatiecode (src/lib/events.ts) slaat dit veld per
-- deze migratie niet meer op; bestaande rijen met een e-mailadres worden
-- eerst leeggemaakt en de kolom wordt daarna verwijderd.
--
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

update public.domain_events
  set email = null
  where email is not null;

alter table public.domain_events
  drop column if exists email;
