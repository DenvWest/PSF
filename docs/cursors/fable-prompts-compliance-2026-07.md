# Fable-prompts — compliance-status + vervolganalyse (juli 2026)

Eén resterende copy-paste prompt voor Claude Fable: het eindoordeel (prompt 2).
Prompt 1 (status) is uitgevoerd op 4 juli en hoeft niet opnieuw.

**Achtergrond:** De juni 2026 Claude-analyse beschreef scenario A launch-readiness als
grotendeels papierwerk + één migratie. Het documentatie-blok is 4 juli 2026 afgerond en
de drie code-gaten zijn sindsdien gedicht: waitlist-migratie op prod (bevestigd 16 jul),
login pre-check en contact-checkbox. Open is alleen nog papierwerk: Zoho DPA, intern
rechten-runbook, privacytekst-sync (te checken), register-review augustus.

**Verwacht eindoordeel cookie–privacy–art. 9:** GROEN met papierwerk-gaten (Zoho DPA +
rechten-runbook); de technische keten — cookie-gating, consent-defaults, revoke — staat.

**Volgorde sessies (16 jul):** eerst de roadmap-evaluatie
(`docs/cursors/fable-roadmap-evaluatie-vervolg-2026-07.md`), daarna dit eindoordeel als
kleine losse sessie. Alleen als Zoho DPA of het rechten-runbook verkeer blokkeert mag
deze papierwerk-sessie parallel.

---

## Prompt 1 — Status (uitgevoerd, niet opnieuw draaien)

Uitgevoerd op 4 juli 2026; de MUST-matrix is gevalideerd tegen het Documenten-archief
(zie Referentie onderaan + logboek in `docs/core/VERWERKINGSREGISTER.md`). De
oorspronkelijke statusprompt is verwijderd omdat zijn "bekende feiten" verouderd waren
(waitlist/login/contact zijn inmiddels gedicht). Niet opnieuw draaien.

---

## Prompt 2 — Eindoordeel: cookie–privacy–art. 9 + prioriteit

Zelfstandig te draaien; de gevalideerde MUST-matrix staat onderaan dit document (Referentie).

```text
MODEL-CONTEXT: Claude Fable — compliance-vervolganalyse, geen code wijzigen tenzij ik expliciet vraag.
PROJECT: PerfectSupplement — art. 9-gezondheidsdata live sinds intake/dashboard.
TAAL: Nederlands; concreet en onderbouwd met bestandspaden.

## Context (status gevalideerd 4 jul, code herbevestigd 16 jul)

De MUST-matrix is 4 juli gevalideerd. Sindsdien zijn de drie code-gaten gedicht —
behandel ze als DONE, voer ze niet opnieuw als gap op (wel kort herbevestigen):
- premium_waitlist 500-bug: migratie supabase/migrations/20260704120000_premium_waitlist_consolidation.sql (CHECK incl. premium-coaching + price_indication); prod bevestigd ✅ in docs/cursors/pre-traffic-gates-2026-07.md (16 jul)
- Login pre-check: consent default uit — src/components/account/LoginScreen.tsx:232 (useState(false))
- Contactformulier art. 9: echte checkbox, default uit — src/components/contact-form.tsx:46 (useState(false)); checkbox op regel 185

Nog open (papierwerk): Zoho DPA, intern rechten-runbook, privacytekst-sync (checken),
maandelijkse register-review augustus 2026.

## Hoofdvraag

Beantwoord in één helder document:

> Is de keten **cookie-toestemming → privacy-informatie → art. 9-verwerking** juridisch en technisch voldoende gedekt voor scenario A (publieke site, geen checkout)?

Geef een **eindoordeel**: GROEN / ORANJE / ROOD per schakel, plus totaaloordeel.

## Analyse-opdracht (diep)

### A. Cookie ↔ tracking (Telecommunicatiewet 11.7a)

Verifieer en beoordeel:
- Laadvolgorde: Consent Mode stub → banner → AnalyticsLoader (layout.tsx, AnalyticsLoader.tsx)
- Geen `_ga` / Clarity vóór opt-in (checklist: docs/cursors/cookie-consent-pre-deploy-checklist.md)
- Clarity uit op gezondheidsroutes (/intake, /rapport, /dashboard, /account)
- Marketing-cookie gate voor affiliate (AffiliateLink + marketing-consent.ts)
- Semantische conflatie: intake-checkbox `anonymous_analytics` zet ook analytics-cookies (session/route.ts) — is één consent_type voor cookiebanner + productevents verdedigbaar?
- Geen GTM — alleen directe gtag.js; noteer implicaties

### B. Privacy-informatie (art. 13)

Verifieer dekking in src/app/privacy/page.tsx vs. werkelijke verwerkingen in VERWERKINGSREGISTER.md:
- Alle 12 register-verwerkingen genoemd?
- Granulaire art. 9-subconsents (body_metrics, domain_checkin_logging, nutrition_intake_logging, account_storage) — staan ze in privacytekst?
- Bewaartermijnen: register vs. privacy vs. retention-cron — inconsistenties (nurture 12m vs. 5j)?
- premium_waitlist / coach-wachtlijst — vermeld?
- Rechten sectie vs. werkelijke self-service (revoke wel, export niet)

### C. Art. 9-toestemming (expliciet, granulair, geen pre-check)

Per flow beoordelen (tabel: Flow | UI default | Server check | consent_records | Oordeel):

| Flow | Bestanden |
|---|---|
| Intake | IntakeConsent.tsx, intake/session/route.ts, intake-consent.ts |
| Check-ins (slaap/stress/beweging/voeding) | SleepCheckin, StressCheckin, MovementCapture, NutritionCapture |
| Account login | LoginScreen.tsx, account-storage-consent.ts |
| Contactformulier | contact-form.tsx |
| Hermeting-opt-in | MeasurementReminderOptIn.tsx |
| Revoke | PrivacyRevokeConsent.tsx, consent/route.ts DELETE |

Expliciet beantwoorden:
- Waar is pre-check of impliciete toestemming nog een gap?
- Is consent-tekst in UI gelijk aan audittrail (CONSENT_VERSION 2.1)?
- Is intrekken effectief (anonimisering + cookie purge)?

### D. Prioritering restwerk

Sorteer alles wat nog OPEN/PARTIAL is in drie buckets (MUST vóór scenario A / SHOULD 0-30d / CAN WAIT), met **geschatte effort** (uren) en **boete-/handhavingsrisico** (laag/middel/hoog).

Alleen deze items meenemen (waitlist/login/contact zijn gedicht — zie Context):
1. Zoho CRM DPA accepteren + archiveren
2. Intern rechten-runbook (inzage/export/verwijdering, Supabase-queries, 30-dagen-SLA)
3. Privacytekst-sync: dekt src/app/privacy/page.tsx alle sub-consents en de waitlist? (eerst checken, alleen bij bevestigde gap als restwerk opvoeren)
4. Maandelijkse register-review loggen (aug 2026)

### E. Aanbevolen volgende actie (max 3)

Geef **één concrete eerste stap per type**:
- **Documentatie** (Dennis handmatig)
- **Codefix** (Cursor-prompt klaarzetten)
- **Verificatie** (handmatige test, incognito checklist)

## Output-eisen

- Mermaid-diagram van de cookie→privacy→art.9-keten met gap-markering
- Eindtabel: Schakel | Oordeel | Top-gap | Fix
- Geen vage "overweeg"-taal — kies een aanbeveling met onderbouwing
- Geen code-edits; alleen als de privacytekst-sync een bevestigde gap oplevert: prompt-skelet voor src/app/privacy/page.tsx klaarzetten

## Referentie-regels

- CLAUDE.md + .cursor/rules/meten.mdc (privacy-register-gate)
- Juni-insight: art. 9 draait al live — compliance-gaten zijn bestaande exposure, geen launch-blocker in abstractie
- Self-service data-export is CAN WAIT; handmatige export binnen 1 maand volstaat
```

---

## Referentie — MUST-matrix (gevalideerd 4 jul; historische stand)

Let op: de ❌ bij premium_waitlist en de 🟡-gaps bij cookie-consent (login/contact) zijn
ná 4 juli gedicht — zie het Context-blok in de prompt. Alleen Zoho DPA en het
rechten-runbook staan nog open.

| Item | Juni | Stand 4 jul | Opmerking |
|---|---|---|---|
| Art. 9 consent intake | ✅ | ✅ | Geen pre-check; server-validatie |
| Informatieplicht | ✅ | ✅ | Privacy + PDF bijgewerkt 4 jul |
| Verwerkingsregister | ❌ | ✅ | docs/core/VERWERKINGSREGISTER.md |
| Datalekprocedure | ❌ | ✅ | One-pager + PDF |
| DPIA vastgesteld | 🟡 | ✅ | v1.1, geen [VUL IN] |
| DPA's archiveren | ❌ | 🟡 | 6/7 gearchiveerd; Zoho open |
| Cookie-consent | ⚠️ | 🟡 | Technisch sterk; login/contact gaps |
| Rechten-procedure | 🟡 | 🟡 | Revoke UI ja; intern runbook nee |
| premium_waitlist migratie | ❌ | ❌ | Live bug ongewijzigd |

## Na uitvoering

1. Zoho CRM DPA accepteren + archiveren als `dpa/Zoho_CRM_DPA_geaccepteerd_[datum].pdf` (Dennis, handmatig)
2. Intern rechten-runbook schrijven (inzage/export/verwijdering, Supabase-queries, 30-dagen-SLA)
3. Alleen bij bevestigde gap: privacytekst-sync in src/app/privacy/page.tsx
4. Register-review augustus loggen in docs/core/VERWERKINGSREGISTER.md
