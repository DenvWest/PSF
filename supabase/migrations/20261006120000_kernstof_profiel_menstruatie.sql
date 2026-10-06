-- Menstruatie als keuze in Je doelen, alleen voor de ijzernorm
-- (REVIEW_NORM_EN_ONDERZOEK_PER_STOF_2026-10.md §6.3).
--
-- Alleen gevraagd bij vrouw of anders. Null = niet ingevuld: de hogere
-- ijzernorm (16 mg). Gezondheidsgegeven (AVG art. 9): opt-in in Je doelen,
-- niet in de check; RLS deny-all blijft, alleen service role via de API.
-- Geen check-constraint: de server valideert tegen
-- src/lib/account-kernstof-profiel.ts.
alter table public.account_kernstof_profiel
  add column if not exists menstruatie text;

comment on column public.account_kernstof_profiel.menstruatie is
  '"ja" | "onregelmatig" | "nee" | null. Bepaalt alleen de ijzernorm (16 mg zolang er menstruaties zijn, anders 11 mg). Gezondheidsgegeven, opt-in.';
comment on column public.account_kernstof_profiel.voedingswijze is
  '"vegetarisch" | "veganistisch" | null. Bepaalt de zinknorm (fytaat, EFSA 2014) en welke voedingsbronnen we tonen.';
