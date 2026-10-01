-- AVG: accounts.last_seen_at (audit N6d, docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md C3).
-- Het verwerkingsregister belooft op meerdere plekken een inactiviteits-
-- termijn van 24 maanden, maar accounts had geen enkel veld om activiteit
-- aan af te meten. Wordt bijgewerkt door getAccountFromCookie()
-- (src/lib/account-server.ts) bij elk geauthenticeerd verzoek, maximaal
-- eens per 24 uur.
--
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

alter table public.accounts
  add column if not exists last_seen_at timestamptz;

comment on column public.accounts.last_seen_at is
  'Laatst gezien bij een geauthenticeerd verzoek (getAccountFromCookie), max 1x/24u bijgewerkt. Voedt de inactiviteits-anonimisering, zie account-retention-cron.';

-- Bestaande accounts: created_at als eerste benadering, zodat de
-- inactiviteitscron niet meteen alle bestaande accounts als "nooit gezien"
-- behandelt.
update public.accounts
  set last_seen_at = created_at
  where last_seen_at is null;
