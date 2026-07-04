# Fable-prompts — compliance-status + vervolganalyse (juli 2026)

Twee zelfstandige copy-paste prompts voor Claude Fable. Draai ze als **aparte sessies**:
eerst sessie 1 (status), dan sessie 2 (diepgaande analyse cookie–privacy–art. 9).

**Achtergrond:** De juni 2026 Claude-analyse beschreef scenario A launch-readiness als
grotendeels papierwerk + één migratie. Sindsdien is het documentatie-blok grotendeels
afgerond (4 juli 2026). Open: `premium_waitlist`-bug, Zoho DPA, intern rechten-runbook,
login pre-check, contactformulier art. 9.

**Verwacht eindoordeel cookie–privacy–art. 9:** ORANJE (technisch cookie-gating sterk;
gaten bij login/contact + privacy-dekking sub-consents).

---

## Prompt 1 — Status: wat is sinds juni gedaan?

```text
MODEL-CONTEXT: Claude Fable — compliance/status-sessie, geen code wijzigen.
PROJECT: PerfectSupplement (perfectsupplement.nl) — Next.js 16, Supabase, art. 9-gezondheidsdata live.
TAAL: Nederlands in output; citeer bestandspaden in Engels.

## Achtergrond (juni 2026 — vorige analyse)

Een eerdere Claude-sessie concludeerde:
- Art. 9-data draait al live → AVG-verplichtingen gelden nu, niet pas bij "launch"
- Scenario A (value-first, geen checkout) kan zodra MUST-lijst af is
- MUST vóór launch: waitlist-migratie, DPA's archiveren, verwerkingsregister, datalek-one-pager, DPIA afronden, cookie-consent verifiëren, handmatige rechten-procedure
- Top-3 risico's: art. 9 zonder DPA/register, tracking zonder cookie-opt-in, Premium herroeping (later)

## Jouw taak

Lees de genoemde bestanden in de repo en lever een **statusrapport**: per MUST-item uit de juni-lijst → DONE / PARTIAL / OPEN, met bewijs (bestand + datum).

### Verplichte leeslijst

| Onderwerp | Bestanden |
|---|---|
| Verwerkingsregister | docs/core/VERWERKINGSREGISTER.md |
| DPIA | docs/core/DPIA.md |
| Datalekprocedure | docs/legal/Datalekprocedure_PerfectSupplement_nl.md |
| Privacy (publiek) | src/app/privacy/page.tsx, docs/legal/Privacyverklaring_PerfectSupplement_nl.md |
| Consent / art. 9 | src/lib/consent-texts.ts, src/lib/intake-consent.ts, src/components/intake/IntakeConsent.tsx |
| Cookie / analytics | src/app/layout.tsx, src/components/privacy/CookieConsentBanner.tsx, src/components/analytics/AnalyticsLoader.tsx, docs/cursors/cookie-consent-pre-deploy-checklist.md |
| Revoke / rechten | src/components/privacy/PrivacyRevokeConsent.tsx, src/app/api/intake/consent/route.ts |
| DPA-status | docs/core/VERWERKINGSREGISTER.md §Verwerkersovereenkomsten, docs/legal/Zoho_CRM_DPA_accepteren.md |
| Live bug | supabase/migrations/20260628120000_premium_waitlist.sql, src/app/api/account/waitlist/route.ts |
| Retentie-backlog (Fable) | docs/cursors/fable-prompts-retentie-backlog-2026-07.md |

### Outputstructuur (verplicht)

1. **Executive summary** (max 8 regels): wat is sinds juni afgerond, wat is het grootste resterende gat?
2. **MUST-matrix** — tabel met kolommen: Item | Juni-status | Nu-status | Bewijs | Restwerk
3. **Wat expliciet NIET is gedaan** — minimaal: premium_waitlist CHECK-bug, Zoho DPA, intern rechten-runbook
4. **Documentatie vs. code** — waar divergeert de privacyverklaring/register van de implementatie?
5. **Geen implementatie** — alleen rapport; geen commits, geen code-edits

### Bekende feiten om te verifiëren (niet blind overnemen)

- Verwerkingsregister + DPIA + datalekprocedure + PDF's: gemeld als afgerond 2026-07-04
- DPIA v1.1 vastgesteld; geen [VUL IN]-placeholders meer in docs/core/DPIA.md
- Cookiebanner: Consent Mode default-deny; GA4/Clarity pas na opt-in (geen GTM in repo)
- Intake consent: checkboxes default false; server-side healthDataProcessing === true verplicht
- premium_waitlist: DB CHECK op 3 features, API op 8 → coach-knoppen 500 in productie
- LoginScreen: consent default true als !fromIntake (mogelijke pre-check gap)
- contact-form.tsx: healthDataProcessing hardcoded true zonder checkbox
```

---

## Prompt 2 — Vervolganalyse: cookie–privacy–art. 9 + prioriteit

Plak de executive summary + MUST-matrix uit prompt 1 bovenaan vóór je deze draait.

```text
MODEL-CONTEXT: Claude Fable — compliance-vervolganalyse, geen code wijzigen tenzij ik expliciet vraag.
PROJECT: PerfectSupplement — art. 9-gezondheidsdata live sinds intake/dashboard.
TAAL: Nederlands; concreet en onderbouwd met bestandspaden.

## Context uit vorige sessie
[PLAK HIER DE EXECUTIVE SUMMARY + MUST-MATRIX UIT PROMPT 1]

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

Minimaal deze items meenemen:
1. premium_waitlist CHECK-fix (live 500-bug)
2. Zoho CRM DPA accepteren + archiveren
3. Intern rechten-runbook (inzage/export/verwijdering, Supabase-queries, 30-dagen-SLA)
4. Login consent pre-check fix
5. Contactformulier art. 9-checkbox
6. Privacyverklaring bijwerken voor ontbrekende sub-consents
7. Maandelijkse register-review loggen (aug 2026)
8. Scenario B-papierwerk (Stripe, voorwaarden) — expliciet CAN WAIT tot Wave 7

### E. Aanbevolen volgende actie (max 3)

Geef **één concrete eerste stap per type**:
- **Documentatie** (Dennis handmatig)
- **Codefix** (Cursor-prompt klaarzetten)
- **Verificatie** (handmatige test, incognito checklist)

## Output-eisen

- Mermaid-diagram van de cookie→privacy→art.9-keten met gap-markering
- Eindtabel: Schakel | Oordeel | Top-gap | Fix
- Geen vage "overweeg"-taal — kies een aanbeveling met onderbouwing
- Geen code-edits; wel Cursor-prompt-skelet voor de #1 codefix als die premium_waitlist of login pre-check is

## Referentie-regels

- CLAUDE.md + .cursor/rules/meten.mdc (privacy-register-gate)
- Juni-insight: art. 9 draait al live — compliance-gaten zijn bestaande exposure, geen launch-blocker in abstractie
- Self-service data-export is CAN WAIT; handmatige export binnen 1 maand volstaat
```

---

## Referentie — verwachte MUST-matrix (ter controle na Fable)

| Item | Juni | Verwacht nu | Opmerking |
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

1. Valideer MUST-matrix tegen Documenten-archief (DPA's staan buiten git)
2. Als ORANJE bevestigd: waitlist-migratie → login/contact fixes → privacytekst sync → Zoho DPA
3. Waitlist-fix staat ook in docs/cursors/fable-prompts-retentie-backlog-2026-07.md (prompt 3)
