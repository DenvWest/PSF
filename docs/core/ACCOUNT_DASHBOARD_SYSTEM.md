# ACCOUNT & DASHBOARD SYSTEM

> **Layer 2 — System.** Hoe de opt-in identiteitslaag (passwordless account) en het persoonlijke dashboard werken. De bestemming achter de login = de **continuïteit-moat**: het dashboard onthoudt je voortgang over tijd — iets wat een stateless LLM niet kan.

## Kern

- **Doel:** opt-in, pseudonieme identiteit (alleen e-mail) bovenop anonieme intake-sessies → een persoonlijk dashboard dat scores/trend/prioriteit over tijd toont.
- **Passwordless, géén Supabase Auth.** Eigen mechaniek dat de bestaande HMAC-cookie + Resend + `consent_records` spiegelt.

## Auth (magic-link → OTP-inlogcode)

- **Inlogcode (OTP):** e-mail → 6-cijferige code (`createLoginCode`), op de site invoeren. De mail bevat óók een klik-link als alternatief. Token = `sha256(\`${accountId}.${code}\`)` in `account_login_tokens` (15 min, eenmalig via `used_at`).
- **Cookie:** `psf_account`, HMAC met een **aparte** `ACCOUNT_COOKIE_SECRET` (los van de intake-`COOKIE_SECRET`), httpOnly/secure/sameSite=lax, 90 dagen (`account-session-cookie.ts`).
- **Endpoints** (`src/app/api/account/`): `request-link` (code mailen; **altijd generieke 200** = non-enumerating; rate-limited per IP én per e-mail), `verify` (GET — klik-link `aid`+`code` → cookie → `/dashboard`), `verify-code` (POST — on-site code-invoer), `logout`, `claim-sessions`, `revoke`.
- **Brute-force-cap:** de 6-cijfer-code is zwak; de beveiliging is de **rate-limiting** (per e-mail + per IP) + 15 min TTL + eenmaligheid.

### Sessie-hardening

- **(a)** Tokenformaat is nu `accountId.issuedAt.sig`; server-side wordt 90 dagen afgedwongen. Oude 2-delige cookies zijn ongeldig na deploy — gebruikers moeten opnieuw inloggen.
- **(b) BACKLOG:** `#2` `session_version`-kolom op `accounts` voor echte "overal uitloggen"/per-account-intrekking (vóór partner-trials); `#3` optioneel sliding refresh (cookie vernieuwen bij activiteit).

## Account-lifecycle

- **Aanmaken:** nieuw e-mailadres → alléén bij `consent === true` + een actieve `psf_intake_sid` (het acquisitiemoment ná een check). Account-storage-consent wordt vastgelegd in `consent_records`.
- **Returning login:** bestaand actief account → code mailen (geen sessie/consent nodig).
- **Claim-by-email:** RPC's `count_claimable_intake_sessions` / `claim_intake_sessions_for_account(account_id)` koppelen eerdere anonieme sessies (case-insensitive `marketing_email`) op **expliciete bevestiging**.
- **Revoke (2-traps):** *intrekken* = status `revoked` + consent `withdrawn_at` + sessies ontkoppelen (anonieme data blijft; **omkeerbaar** via een nieuwe login) · *verwijderen* = `deleteIntakeSessionForSession` per sessie + account weg (cascade tokens).

## Dashboard (`/dashboard`)

- **Gated:** `getAccountFromCookie()` (`account-server.ts`) in de server-page → redirect naar `/account/login` zonder geldige cookie.
- **Donkere wereld:** scoped `.ps-dark`-tokens in `globals.css`; gedeelde primitives in `src/components/app/`, dashboard-specifiek in `src/components/dashboard/`.
- **Data (`account-dashboard.ts`):** leest de gekoppelde `intake_sessions` → Engelse domeinscores → Nederlandse pijlers (`sleep→slaap`, `energy→energie`, `stress→stress`, `nutrition→voeding`, `movement→beweging`, `recovery→herstel`); vitaliteit via de canonieke `computeVitaliteit` (5-facet, exclusief energie — gelijk aan het resultaatscherm); trend, prioriteit (afgeleid), historie.
- **Meet-lus (F3):** per pijler een check-in-CTA (`PILLAR_CHECKIN_ROUTES`: slaap/stress/beweging/voeding) → deep-link → terug naar het dashboard (`?from=dashboard`).
- **F3b:** `intake_domain_checkin` (slaap/stress/beweging) wordt **gemerged in de per-pijler-trend** → een check-in beweegt score/vitaliteit/prioriteit. Historie/hertest blijven sessie-gebaseerd (volledige checks).
- **Nog leeg:** objectieve signalen (wearables) = "binnenkort"; identiteit-sectie (geslacht/gewicht/lengte/werk) = invul-prompt (data nog niet verzameld).

## Belangrijke bestanden

- **Auth:** `lib/account-session-cookie.ts`, `lib/account-login-token.ts`, `lib/account-login-email.ts`, `lib/account-server.ts`; `app/api/account/*`.
- **Dashboard:** `lib/account-dashboard.ts`, `lib/dashboard-model.ts`, `data/dashboard/`, `types/dashboard.ts`, `components/dashboard/*`, `components/app/*`.
- **DB:** migraties `20260614120000_account_identity.sql`, `20260616120000_account_claim_sessions.sql`; tabel `intake_domain_checkin`.

## Open / backlog

1. Identiteit-sectie echt vullen (geslacht/gewicht/lengte/werk → eiwitdoel/PAL; biometrie → voedingsadvies). Grootste item, vraagt eerst een scope-besluit (opslaan vs bereken-en-vergeet).
2. Voeding in de trend via `intake_intake_log` (F3b-deel-2).
3. Nurture-mail-consolidatie (geen aparte login/welkomstmail bóvenop de nurture-sequence).
4. ~~Resultaatscherm declutteren~~ — **gedaan (jun 2026):** REVEAL = dashboard-trailer: top-3 ladder + 2 leefstijlstappen; volledige ladder en supplement alleen in dashboard na login; ingeklapte dashboard-preview onder CTA.
5. Wearables / objectieve signalen (toekomst).

*Laatst bijgewerkt: 17 juni 2026.*
