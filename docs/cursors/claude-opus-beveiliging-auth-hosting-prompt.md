# Prompt — Beveiliging, auth & hosting: MFA, OAuth, cybercrime, infra-upgrade

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek met repo-toegang).  
> **Output:** uitsluitend strategisch advies in het Nederlands — **geen code, geen diffs, geen implementatie**.  
> **Opgesteld:** 8 augustus 2026.  
> **Disclaimer:** dit is geen juridisch advies; markeer onzekere punten expliciet.

## Plaats in de reeks

| Doc | Relatie |
| --- | --- |
| Dit document | **Strategisch advies** — auth, cybercrime-weerbaarheid, infra-triggers |
| [`docs/core/DPIA.md`](../core/DPIA.md) | Art. 9-gezondheidsdata, verwerkers, risico's |
| [`docs/core/ACCOUNT_DASHBOARD_SYSTEM.md`](../core/ACCOUNT_DASHBOARD_SYSTEM.md) | Huidige passwordless OTP-auth |
| [`docs/plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md`](../plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md) | MFA-advies admin; NIS2 micro-onderneming |
| [`docs/cursors/claude-opus-beweging-pre-e-audit-prompt.md`](claude-opus-beweging-pre-e-audit-prompt.md) | Zelfde Opus-adviesformaat (audit, geen code) |

## Gebruiksinstructie

1. Open Claude Opus in een **nieuw gesprek** met toegang tot de repo (of plak relevante bestanden).
2. Kopieer het blok onder **Prompt (copy-paste)**.
3. Review secties **A–H** in het antwoord; gebruik **F** als werklijst.

## Wat Dennis al vooraf weet (hint — Opus moet verifiëren, niet aannemen)

Steekproef 8 aug 2026:

- **Consumentenlogin:** passwordless e-mail-OTP (6 cijfers, 15 min, eenmalig); geen wachtwoord, geen Supabase Auth, geen Google/OAuth, geen MFA.
- **Admin `/admin`:** enkel wachtwoord + HMAC-sessiecookie; **geen MFA** (affiliate-audit R3).
- **Gevoelige data:** art. 9 health data in **Supabase EU (Frankfurt)**; VPS host alleen de Next.js-app.
- **Infra:** Hetzner VPS (~€4,50/mnd) + Cloudflare + Nginx — **al betaalde EU-hosting**; vraag "naar betaalde server" moet worden herkaderd.
- **Beveiliging:** `src/proxy.ts` (HSTS, CSP, COOP); rate limits; Turnstile; service-role-only DB; CSP heeft `unsafe-inline`/`unsafe-eval`.
- **Product:** geen zorgverlener, geen bank — lifestyle/supplementen-platform voor mannen 40+.

---

## Prompt (copy-paste)

```text
## Rol
Je bent senior security- & privacy-adviseur voor PerfectSupplement
(perfectsupplement.nl) — een NL micro-onderneming met art. 9-gezondheidsdata
(Leefstijlcheck, dashboard, nurture-mails).

Je geeft STRATEGISCH ADVIES: geen code, geen diffs, geen JSX/SQL, geen
implementatie-prompts. Nederlands; paden en identifiers in het Engels.

⚖️ Geen juridisch advies — markeer onzekere punten; verwijs naar advocaat/FG
waar nodig.

## Context — lees en verifieer in de repo (niet aannemen)

Docs:
- docs/core/DPIA.md — art. 9, verwerkers, risico's, doorgifte
- docs/core/VERWERKINGSREGISTER.md — wat waar staat
- docs/core/ACCOUNT_DASHBOARD_SYSTEM.md — OTP-auth, cookie, rate limits
- docs/core/ARCHITECTURE.md — Hetzner + Supabase-scheiding, stack
- docs/plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md — MFA admin, NIS2 micro
- docs/legal/Datalekprocedure_PerfectSupplement_nl.md — incident-response

Code (minimaal openen):
- src/proxy.ts — security headers, CSP
- src/lib/rate-limit.ts + src/lib/rate-limit-config.ts
- src/lib/admin-auth.ts + src/app/api/admin/auth/route.ts
- src/lib/account-session-cookie.ts + src/lib/account-login-token.ts
- src/app/api/account/request-link/route.ts
- src/app/api/account/verify-code/route.ts
- src/app/account/verify/page.tsx — POST i.p.v. GET (e-mailscanner-fix)

Productcontext (lock):
- Geen ziekenhuis, geen bank, geen verzekeraar — algemeen welzijn/leefstijl
- Monetisatie: affiliate links + premium in opbouw
- Doelgroep: mannen 40+, mobiel-first
- Admin: mono-tenant, één gebruiker (PartnerDesk + site-admin)

## Kernvragen van Dennis

Beantwoord expliciet en zonder FUD:

### 1. MFA / authenticator — slim, verplicht, of overkill?

- Is MFA (TOTP-app, hardware key, passkey) **wettelijk verplicht** voor
  PerfectSupplement **vandaag** of binnen **12–24 maanden**?
- Toets expliciet per wet/regime (kort, praktisch):
  - AVG art. 32 (passende maatregelen — geen specifieke MFA-plicht)
  - NIS2 / Cyberbeveiligingswet NL (omvang + sector — micro buiten sectoren?)
  - eIDAS 2 / digital identity wallet (impact op consumentenlogin?)
  - PSD2/SCA (relevantie voor lifestyle-app login?)
  - Zorgsector-wetgeving (niet van toepassing — bevestig waarom)
- Beoordeel **per loginlaag apart**:
  | Laag | Huidig | Risico |
  | Consument OTP | e-mail 6-cijfercode | account takeover via e-mail |
  | Admin /admin | wachtwoord only | single point of failure |
  | Cron/partner API | secrets/keys | key leak |
- Conclusie per laag: **verplicht** vs **sterk aanbevolen** vs **nice-to-have**
- Geef **timing-triggers**: "doe X wanneer Y gebeurt" (niet alleen "zou mooi zijn")

### 2. Inloggen met Google — voldoende alternatief voor authenticator?

- Is "Sign in with Google" een **vervanger** voor MFA, of iets anders (IdP)?
- Vergelijk voor PerfectSupplement:
  - OAuth Google/Apple vs e-mail-OTP vs TOTP vs passkeys/WebAuthn
  - Beveiliging: account takeover, e-mailcompromis, SIM-swap, session hijack
  - UX/conversie: doelgroep mannen 40+
  - AVG/privacy: Google als identity provider, doorgifte VS, consent
  - **Art. 9-data**: extra voorzichtigheid — is federated login verstandig?
- Geef **één duidelijke aanbeveling** met onderbouwing:
  OTP behouden / passkeys toevoegen / OAuth optioneel / OAuth niet doen

### 3. Staat de beveiliging goed tegen cybercrime?

Beoordeel in lagen. Per laag: score 1–5, top-3 gaps, quick wins (uren):

**Edge:** Cloudflare, Turnstile, DDoS
**App:** Next.js proxy headers/CSP, auth flows, API routes, rate limits
**Data:** Supabase EU, service-role blast radius, RLS, back-ups
**Ops:** Hetzner VPS, SSH, secrets in .env, deploy.sh, monitoring, DR

Behandel expliciet:
- Account takeover (OTP-brute-force mitigatie, rate limits, in-memory vs Redis)
- Admin compromise (geen MFA)
- CSP `unsafe-inline` / `unsafe-eval` — XSS-risico
- Service-role key op server — blast radius bij VPS-compromis
- Dependency/supply-chain (npm audit niveau)
- Observability: Sentry, uptime, logging — blind spots?
- Back-up & disaster recovery
- Realistisch dreigingsmodel voor kleine NL-site met health data
  (niet enterprise-bank dreiging)

### 4. Wanneer infra upgraden? (herkader de vraag)

Dennis vraagt "van Hetzner naar betaalde server voor extra gevoelige info".
Herkader: Hetzner **is al betaald**; art. 9-data zit in **Supabase**, niet op VPS-disk.

Geef **concrete drempels** (triggers → actie → waarom), bijv.:
- Nu (micro, art. 9, geen betalingen)
- Bij X actieve accounts / Y MRR / premium live
- Bij B2B/white-label of coach-inzage (derde partij art. 9)
- Bij affiliate-programma uitbetalingen (financiële data)

Scheid drie beslissingen:
1. **Hetzner VPS** — tier/hardening (fail2ban, SSH keys, snapshots, auto-updates)
2. **Supabase** — plan/back-ups/PITR/SOC2
3. **Managed PaaS vs VPS** — wanneer verhuizen compute, en wat het níet oplost

Geef kostenbanden indicatief: €0–50, €50–200, €200+/maand — wat levert elke band op?

## Output-structuur (verplicht)

## A. Executive summary
Max 10 bullets — wat Dennis **nu** moet weten.

## B. MFA & wetgeving — per loginlaag
Tabel:
| Laag | Verplicht? | Aanbevolen? | Waarom | Wanneer (trigger) |

## C. Google/OAuth vs OTP vs passkeys
Eén duidelijke aanbeveling + alternatieven afgewezen met reden.

## D. Cybercrime-weerbaarheid
Per laag (Edge/App/Data/Ops): score 1–5, top gaps, quick wins (uren) vs medium (weken).

## E. Infra-upgrade-pad
Triggers-tabel — geen premature spend; scheid VPS vs Supabase vs PaaS.

## F. Prioriteiten
P0/P1/P2 met inspanning S/M/L — gesorteerd op risico × haalbaarheid.

## G. Bewust NIET doen (YAGNI)
Wat Dennis kan overslaan zonder onacceptabel risico op huidige schaal.

## H. Disclaimer & externe hulp
Wanneer advocaat, FG of externe pentest/CISO nodig is.

## Constraints
- Geen code, geen implementatie
- Onderscheid: wettelijke plicht vs best practice vs marketing-FUD
- Geen "verhuizen lost alles op" — data zit in Supabase
- Hetzner is al betaald; benoem wat upgrade echt oplevert
- Realistisch dreigingsmodel — geen enterprise-paranoia
- PerfectSupplement verwerkt gezondheidsdata maar is geen zorginstelling
```
