# Prompt — Volledige platform audit (PerfectSupplement)

> **Gebruik:** kopieer alles onder de streep naar Claude in VS Code (of Cursor) met `@codebase`. Eén sessie, geen code wijzigen tenzij expliciet gevraagd.
>
> **Verschil met** [`architecture-strategy-analysis-prompt.md`](architecture-strategy-analysis-prompt.md): deze prompt dekt alle 22 audit-as (productvisie t/m eindbeoordeling), inclusief behavioural science, security, privacy, betaalsysteem-readiness en SaaS/AI-readiness.

---

## Rol

Je bent een multidisciplinair auditteam in één sessie. Werk simultaan vanuit deze perspectieven:

1. **Senior software architect** — schaalbaarheid, coupling, domain boundaries
2. **Product strategist** — visie, roadmap-fit, platform-evolutie
3. **UX researcher & conversion specialist** — funnel, drop-off, motivatie, engagement
4. **Behavioural scientist** — gedragsverandering, habit formation, adherence
5. **Growth engineer** — analytics, experimenten, retention loops
6. **Security engineer** — OWASP, auth, secrets, API-hardening
7. **Privacy & compliance officer** — AVG/GDPR, DPIA, consent, dataminimalisatie
8. **Performance engineer** — Core Web Vitals, bundle, caching
9. **Accessibility specialist** — WCAG 2.1 AA
10. **Technical auditor** — code quality, testdekking, tech debt

**Project:** PerfectSupplement (perfectsupplement.nl) — leefstijlcheck/funnel voor mannen 40+, uitgroeiend naar volledig leefstijlplatform (inzichten, coaching, betaalde rapporten, abonnementen, AI-coaching, voortgang over tijd).

**Opdrachtgever:** Dennis (eigenaar). Hij commit en deployt zelf.

**Outputtaal:** Nederlands. Code-identifiers en bestandspaden in het Engels.

**Harde regel:** Geen code wijzigen, geen commits, geen deploys. Alleen analyseren, bewijzen en aanbevelen.

---

## Context — wat dit project al is (valideer in code)

Dit is geen simpele vragenlijst. De huidige basis omvat:

- **Intake funnel** (6 client-fasen): intro → symptomen → 16 vragen → consent → berekenen → reveal
- **Scoring engine** (regelgebaseerd, geen ML): 7 domeinscores, vitaliteit (5 interventies), urgentie, profiellabel, primair thema
- **Domeinmodel:** interventie vs readout (`src/lib/domain-role.ts`)
- **Results reveal:** `src/lib/reveal-model.ts` → 4-staps `RevealStoryPath`
- **Persistence:** Supabase `intake_sessions` + HMAC cookies + `rules_version`
- **Nurture:** Resend, dag 0/3/7/14/21/30, recovery-links voor remeasure
- **Account:** passwordless OTP/magic-link, `/dashboard` met voortgang/hermeting
- **Check-ins:** slaap/stress/beweging/voeding satellietroutes + delta-rapport `/rapport/[sid]`
- **Monetisatie:** affiliate-only (7 vergelijkingspagina's), stepped-care tiers in DB, premium waitlist (geen checkout)
- **Content SEO-spinnenweb:** blog, pillars, profielen, supplementgidsen, kennisbank
- **Analytics:** drie lagen — `domain_events` (PostHog/n8n), GA4, Clarity
- **Evidence RAG:** `/api/chat` — FTS + pgvector, geen LLM in productie
- **Multi-tenant seam:** `organization_id` overal, runtime single-tenant default org
- **Geen Stripe/Mollie/subscriptions** in codebase

**Toekomstvisie (waar tegen auditen):** coaching, betaalde rapporten, abonnementen, AI-coach, wearables, biomarkers, B2B/organisaties, meerdere funnels/doelgroepen, community, referrals.

---

## Verplichte werkwijze

### Fase A — Oriëntatie (lees eerst, concludeer daarna)

1. Start met `docs/_MASTER_INDEX.md`
2. Lees core docs: `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `INTAKE_SYSTEM.md`, `ENTITY_MODEL.md`, `ACCOUNT_DASHBOARD_SYSTEM.md`, `STEPPED_CARE_MODEL.md`, `COMPLIANCE.md`, `DPIA.md`, `PERSONALIZATION_ENGINE.md`, `EMAIL_SYSTEM.md`, `AFFILIATE_SYSTEM.md`
3. **Verifieer docs altijd tegen code** — meerdere docs zijn achter (PM2 vs systemd, anon-inserts vs service_role, journey-fases)
4. Scan structuur: `src/app/`, `src/lib/`, `src/components/`, `src/data/`, `src/types/`, `supabase/migrations/`
5. Inventariseer alle API-routes in `src/app/api/`
6. Bekijk `.env.example`, `package.json`, `vitest.config.ts`, `.github/workflows/ci.yml`, `deploy.sh`, `src/proxy.ts`

### Fase B — Diepgaande analyse per audit-as

Werk **alle 22 secties** hieronder af. Per bevinding:

- **Observatie** (wat je in code/docs ziet) — met concreet bestand/regel/component
- **Impact** (waarom het ertoe doet voor platform-groei)
- **Aanbeveling** (wat te doen) — label als Quick Win / Kort / Middel / Lang
- **Zekerheid:** `BEWEZEN` (direct in code) | `AFGELEID` (logische conclusie) | `AANNAME` (expliciet benoemen)

### Fase C — Synthese

Scores (/10), roadmap, eindoordeel 5-10 jaar fundering.

---

## Audit-as 1: Productvisie

Beoordeel of de huidige architectuur kan uitgroeien tot compleet leefstijlplatform.

Onderzoek:
- Scheiding productkennis vs persoonsgegevens (`docs/core/ARCHITECTURE.md` "twee datastromen")
- Stepped-care model vs affiliate-only monetisatie
- Account als continuïteitslaag vs volledig identity platform
- Content in TS-files vs Supabase interventions — schaalbaarheid CMS
- Legacy `getAdvice()` vs DB-gedreven `getPlanContent()` — migratiestatus

Vragen:
- Kan coaching, abonnementen en AI hierop landen zonder grote rewrite?
- Waar ontstaat technische schuld als je nu doorgroeit?
- Wat is de "platform kernel" vs "feature modules"?

---

## Audit-as 2: Funnel

Analyseer de volledige journey:

**Routes:** `/intake`, satellieten (`/intake/slaap`, `/stress`, `/beweging`, `/voeding`, `/plan/[domain]`), `/dashboard`, `/rapport/[sid]`, `/account/*`

**Componenten:** `IntakeClient.tsx`, `IntakeIntro`, `IntakeSymptoms`, `IntakeQuestion`, `IntakeConsent`, `IntakeCalculating`, `IntakeResults`, `RevealStoryPath`

Beoordeel:
- UX-flow en cognitieve belasting (16 vragen + consent timing)
- Psychologie: herkenning → validatie → mechanisme → actie → bewijs
- Drop-off risico's per fase (meten via bestaande events: `intake.*`, `consent.*`)
- Motivatie en engagement na results (reveal → dashboard tease → account CTA)
- Categorievolgorde en vraaglogica (`src/data/intake-questions.ts`)
- Resultatenpagina: REVEAL vs volledige unlock (account gating)
- Nurture alignment met funnel (recovery links, remeasure timing)

---

## Audit-as 3: Behavioural Science

Beoordeel expliciet tegen deze frameworks (per framework: wat werkt al, wat ontbreekt):

- **Self-Determination Theory** (autonomie, competentie, verbondenheid)
- **COM-B** (Capability, Opportunity, Motivation)
- **Transtheoretical Model** (stadia van verandering)
- **Motivational Interviewing** (ambivalentie, change talk)
- **BJ Fogg / Tiny Habits** (trigger → actie → beloning)
- **Habit Formation** (30-dagen plan, `plan_progress`, `vitality-habit-kernel`)
- **Behaviour Change Technique taxonomy** (BCT's in interventies/nurture)

Koppel aan concrete code: lifestyle-plans, dashboard tabs, check-ins, nurture copy (`docs/core/WRITING_VOICE.md`), stepped-care tiers.

---

## Audit-as 4: Clean Code

Analyseer tegen SOLID, DRY, KISS, SRP:

- Componentgrootte (scan `src/components/intake/`, `dashboard/`)
- Duplicatie: scoring display vs routing bands, legacy vs DB adviespaden
- `src/lib/` organisatie (~283 bestanden) — is er feature-cohesie?
- Leesbaarheid en naming conventions (`docs/core/CODE_CONVENTIONS.md`)
- Testbaarheid: pure functions vs side effects
- Uitbreidbaarheid: nieuwe domeinen, vragen, tiers toevoegen

Geef concrete voorbeelden met bestandspaden — geen abstracte principes zonder bewijs.

---

## Audit-as 5: Architectuur

Beoordeel:
- **Schaalbaarheid:** single VPS, service_role-only DB, geen CDN-edge caching
- **Domain-driven structuur:** is `domain-role`, `intake-engine`, `reveal-model` een goede bounded context?
- **Feature-based vs layer-based:** `app/` + `components/` + `lib/` + `data/` — past dit bij platform-groei?
- **Dependency richting:** mogen `data/` → `lib/`? components → lib? circulaire imports?
- **Coupling hotspots:** intake-engine, nurture, dashboard-model, events
- **BFF-patroon:** alle DB via API-routes — voor- en nadelen bij mobile app / embed widget

Teken een as-is architectuurdiagram (mermaid) en een to-be voorstel voor platform-fase 2.

---

## Audit-as 6: Future Proof

Per capability: **aanwezig / deels / afwezig** + wat nodig is:

| Capability | Zoek in codebase |
|------------|------------------|
| Abonnementen / Stripe / Mollie | grep stripe, mollie, subscription, billing |
| AI-coach / GPT / Claude | evidence-rag, chat-intake, embeddings |
| Meerdere talen | i18n, locale, next-intl |
| Meerdere funnels / doelgroepen | IntakeStrategy, org config, partner API |
| Bedrijven / coaches / tenants | organization_id, registerOrg, RLS JWT |
| PDF-generatie | scripts/, rapport routes |
| E-mailflows / CRM | nurture, Zoho, n8n, domain_events |
| Notificaties / push | service worker, web push |
| Community / referrals | grep referral, community |
| Affiliateprogramma | huidige affiliate + partner API |
| Analytics / A/B-testing | domain_events, nurture variant kolom |
| Feature flags | maxTier, variant, env gates |

---

## Audit-as 7: Data Model

Analyseer `docs/core/ENTITY_MODEL.md` + `supabase/migrations/`:

- Uitbreidbaarheid: nieuwe vragen, domeinen, interventies
- Normalisatie: jsonb answers vs genormaliseerde antwoorden
- **Versiebeheer vragen:** `rules_version` op sessies — is dit voldoende voor vragenlijst-wijzigingen?
- Scoringmodel: kan het evolueren zonder historische data te breken?
- Resultatenmodel: `RevealModel` vs DB interventions — single source of truth?
- Gebruikershistorie: `session_kind`, baseline snapshots, delta
- Metingen over tijd: check-ins, `daily_action_log`, trends in dashboard
- Ontbrekende entiteiten voor: subscriptions, coaching sessies, AI context, wearables

---

## Audit-as 8: Security

Volledige review:

**Auth domeinen:**
- Admin: `admin_token` = raw secret (`src/lib/admin-auth.ts`)
- Account: HMAC cookie + OTP tokens
- Intake: HMAC session cookie + recovery tokens
- Cron: HMAC signature vs Bearer fallback
- Partner: x-api-key

**OWASP Top 10 mapping** — per risico: status + bewijs

**Specifiek checken:**
- `src/proxy.ts` — CSP, admin gate
- `src/lib/rate-limit.ts` — Redis vs in-memory
- Inputvalidatie per API-route
- Secrets in `.env.example` vs code-referenties
- Dependency audit (`npm audit` conceptueel — bekende risico's in package.json)
- `/api/intake/feedback` sessionId spoofing
- `/api/send-reminders` zwakkere cron auth
- Service_role overal — defense in depth?

---

## Audit-as 9: Privacy

Review tegen AVG/GDPR + `docs/core/DPIA.md`:

- Toestemming: intake consent, analytics consent, marketing opt-in — granulair genoeg?
- Dataminimalisatie: wat wordt opgeslagen dat niet nodig is?
- Bewaartermijnen: retention cron (24m sessies, 12m nurture) — adequaat?
- Exporteerbaarheid: kan gebruiker data exporteren?
- Verwijderbaarheid: revoke flows (`/api/intake/consent`, `/api/account/revoke`)
- Audit logging: `consent_records`, `domain_events` met e-mail
- Privacy by design: Clarity uit op gevoelige paden, geen PII in GA4
- Bijzondere persoonsgegevens (gezondheid): LLM-grens, anonimisering
- Server-side events zonder analytics consent — DPIA-alignment?

---

## Audit-as 10: Performance

- Next.js rendering: server vs client components verdeling
- Bundle size: framer-motion, recharts impact
- Lazy loading: dynamic imports?
- Caching: geen CDN? API response caching?
- Images: next/image gebruik
- Server: single VPS bottleneck
- Netwerk: aantal API calls per intake submit
- Memoization in dashboard/reveal components

Meet waar mogelijk via code-analyse (import chains, `"use client"` density).

---

## Audit-as 11: SEO

Relevant voor content-heavy platform:

- Metadata per route (title, description, canonical)
- Structured data (`src/lib/seo/structuredData.ts`)
- Sitemap (`src/app/sitemap.ts`)
- Interne links / spinnenweb (`docs/core/SEO_RULES.md`)
- Indexeerbaarheid intake vs dashboard (noindex?)
- Core Web Vitals risico's
- `docs/core/CONTENT_MAP.md` alignment

---

## Audit-as 12: Accessibility

WCAG 2.1 AA scan (code-based):

- Keyboard navigation in intake flow (één vraag per scherm)
- Focus management bij fase-transities
- Screen reader: labels, aria, live regions bij reveal
- Contrast: `docs/core/DESIGN_TOKENS.md`
- Formulieren: consent, account login
- Charts (recharts): alternatieve tekst?

---

## Audit-as 13: Mobile

Doelgroep gebruikt vaak telefoon (375px):

- Responsiveness intake + dashboard + vergelijkingspagina's
- Touch targets, swipe, voortgangsbalk
- Formulieren op mobiel (OTP invoer, consent)
- Snelheid op mobiel netwerk
- Test `docs/core/DESIGN_TOKENS.md` mobile-first claims

---

## Audit-as 14: Analytics

Architectuur voor meetbaarheid:

**Drie lagen** (`.cursor/rules/meten.mdc`):
1. `domain_events` → PostHog + n8n (`src/lib/events.ts`)
2. GA4 (`src/lib/ga4.ts`)
3. Clarity (`src/lib/clarity.ts`)

Beoordeel:
- Event-dekking over funnel (zijn alle CTA's gemeten?)
- Allowlist mismatch (`intake-events-client.ts` vs `/api/intake/events/route.ts`)
- PostHog: metadata only, geen server SDK — is n8n voldoende?
- Funnel-analyse mogelijk? Cohort mogelijk?
- A/B-ready? (`nurture_emails.variant` altijd null)
- Attribution bij meerdere touchpoints
- Mixpanel-ready? (schema compatibiliteit)

---

## Audit-as 15: Betaalsysteem (expliciet)

Beantwoord **ja/nee/nauwelijks** op: "Is dit project technisch klaar om later een betaalsysteem toe te voegen?"

Als nee of deels:
- Welke onderdelen ontbreken? (billing tables, webhooks, idempotency, entitlement checks)
- Welke architectuur moet eerst worden aangepast?
- Welke domeinmodellen ontbreken? (`subscriptions`, `invoices`, `entitlements`, `products`, `prices`)
- Stripe vs Mollie advies voor NL B2C + toekomst B2B
- Subscription modeling: org-level vs user-level, grace periods, dunning
- Ideale payment flow diagram (mermaid): checkout → webhook → entitlement → feature unlock
- Huidige seams: `is_paid`, `premium_waitlist`, `maxTier`, stepped-care tier 4-5

---

## Audit-as 16: SaaS Readiness

Beoordeel multi-tenant SaaS potentieel:

- Tenants: `organizations` tabel, `organization_id` FK's
- Rollen & permissions: aanwezig? (grep roles, permissions, RBAC)
- Org-admin UI: afwezig?
- Coaches als users: datamodel?
- Klant-dashboards per org
- Licenties / seats (Accendo docs)
- Data isolatie: RLS policies vs service_role bypass
- Billing per tenant

Referentie: `docs/core/ACCENDO_ARCHITECTURE.md`

---

## Audit-as 17: AI Readiness

Beoordeel architectuur voor toekomstige AI:

**Huidig:**
- Evidence RAG zonder LLM (`src/lib/evidence-rag.ts`)
- `evidence_claims.embedding` vector(1536) — infra klaar
- Chat-intake scaffold (EXPERIMENTAL)
- Intake engine expliciet regelgebaseerd tot schaal

**Toekomst:**
- Persoonlijke coaching chat met sessie-context
- Rapport-samenvattingen (PDF + AI)
- Aanbevelingen verrijken (niet vervangen scoring)
- RAG over productkennis vs gezondheidsdata-scheiding
- Contextopslag: waar bewaar je AI-conversatiegeschiedenis?
- Promptarchitectuur: system prompts, guardrails, EFSA compliance
- AVG: gezondheidsdata naar LLM — anonimiseringspipeline nodig?

---

## Audit-as 18: Developer Experience

- Onboarding: README vs werkelijkheid, `_MASTER_INDEX` als startpunt
- Documentatie kwaliteit en drift (noem concrete verouderde docs)
- Scripts: `npm run dev/build/test/lint/generate-state`
- Consistentie: `@/` imports, naming, component patterns
- Linting: eslint.config.mjs
- CI/CD: GitHub Actions + pre-push hooks + deploy.sh
- Migraties: supabase/migrations workflow
- `.claude/skills/`, `docs/cursors/` — AI-assisted dev maturity

---

## Audit-as 19: Testing

Inventariseer:
- Unit tests: `src/lib/__tests__/` (~94 bestanden)
- API route tests: slechts ~5 bestanden
- Integration tests: afwezig?
- E2E tests: afwezig? (Playwright/Cypress)
- Coverage thresholds: alleen intake-engine + cron-auth (80%)
- Regressierisico's bij scoring-wijzigingen (`rules_version`)
- Test gaps die P0 zijn voor productie (auth flows, cron, consent revoke)

Prioriteer welke 10 tests het meeste risico reduceren.

---

## Audit-as 20: Roadmap

Maak een geprioriteerde roadmap in vier horizons:

### Quick Wins (uren)
Concrete items met bestand + geschatte uren.

### Korte termijn (1-2 weken)
Focus op conversie, security fixes, meetbaarheid.

### Middellange termijn (1-2 maanden)
Platform seams: payments voorbereiding, AI MVP, testdekking.

### Lange termijn (6-12 maanden)
SaaS, multi-funnel, coaching, wearables, B2B.

Per item: prioriteit (P0-P3), afhankelijkheden, inspanning S/M/L, verwachte impact.

**Sorteerregel:** binnen elke horizon eerst wat **meer intake-completions, account-aanmaak, affiliate-clicks, remeasurements of retention** oplevert.

---

## Audit-as 21: Gemiste kansen

Zoek expliciet naar domeinen waar **niet** aan gedacht lijkt te zijn:

- Medische validatie / wetenschappelijke onderbouwing workflow
- Personalisatie beyond regels (ML readiness)
- Retention loops beyond nurture (push, SMS, in-app)
- Onboarding voor nieuwe accounts (empty dashboard probleem)
- Gamification (badges, streaks — `daily_action_log` als basis?)
- Reminders beyond 30-dagen e-mail
- Wearables: Apple Health, Google Fit, Garmin, Oura, WHOOP
- Biomarkers / lab-integraties
- Community / forum / cohort programs
- CMS voor content-schaal
- Experiment framework / feature flags (beyond maxTier)
- Observability: Sentry, structured logging, APM
- Error tracking, uptime monitoring
- Back-ups & disaster recovery
- Vragenlijst versiebeheer (question bank versioning)
- Medische disclaimer workflow bij content updates
- Coach marketplace
- White-label voor bedrijven
- Referral programma
- Content personalisatie op basis van intake zonder account

Per gemiste kans: "bewust uitgesteld" vs "blinde vlek" — onderbouw.

---

## Audit-as 22: Eindbeoordeling

### Scores (/10)

| Dimensie | Score | Kernonderbouwing (1 zin) |
|----------|-------|--------------------------|
| Architectuur | /10 | |
| Codekwaliteit | /10 | |
| Productvisie | /10 | |
| Schaalbaarheid | /10 | |
| SaaS-readiness | /10 | |
| AI-readiness | /10 | |
| Security | /10 | |
| Privacy | /10 | |
| Funnelkwaliteit | /10 | |
| Conversiepotentie | /10 | |
| Betaalsysteem-readiness | /10 | |

### Eindoordeel

Beantwoord expliciet:

> "Is dit project een goede fundering voor een professioneel platform voor de komende 5-10 jaar?"

- **Ja / Deels / Nee** — met eerlijke nuance
- Top 5 sterke punten (met bewijs)
- Top 5 risico's die de fundering ondermijnen
- Top 5 acties die de fundering het meest versterken

---

## Output-formaat

Lever één gestructureerd rapport:

1. **Executive Summary** (max 20 regels)
2. **As-is architectuurdiagram** (mermaid)
3. **Secties 1-22** (zoals hierboven, met Observatie/Impact/Aanbeveling/Zekerheid)
4. **Roadmap-tabel** (Quick Win → Lang)
5. **Scorecard** (sectie 22)
6. **Bijlage A:** Volledige API-route inventaris met auth + rate limit status
7. **Bijlage B:** Documentatie-drift lijst (doc vs code mismatches)
8. **Bijlage C:** Top 20 test gaps

---

## Beperkingen

- Geen code genereren tenzij Dennis apart vraagt
- Geen AI-gegenereerde medische claims of supplement-adviezen
- Geen commit/push commando's
- Bij onzekerheid: "onbekend — check `bestand X`", niet gokken
- Affiliate regels intact: Arctic Blue `sld=dennisvanwestbroek`, Daisycon, geen affiliate in blog
- Onderscheid **live in productie** vs **alleen in code/migratie** vs **alleen in docs**

---

## Kwaliteitscheck vóór je aflevert

- [ ] Minstens 50 concrete bestandsverwijzingen in het rapport
- [ ] Elke score heeft minstens 2 bewijspunten uit code
- [ ] Payment-readiness expliciet beantwoord (sectie 15)
- [ ] Behavioural science frameworks allemaal behandeld (sectie 3)
- [ ] Roadmap items hebben P0-P3 en S/M/L
- [ ] Geen sectie overgeslagen
- [ ] Onderscheid BEWEZEN / AFGELEID / AANNAME consequent toegepast

---

*Prompt versie: juli 2026 — volledige platform audit voor PerfectSupplement leefstijlcheck → platform evolutie.*
