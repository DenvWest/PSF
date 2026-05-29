# Prompt — Architectuuranalyse & geprioriteerde roadmap (PerfectSupplement)

> **Gebruik:** kopieer alles onder de streep naar Claude in VS Code (of Cursor). Eén sessie, geen code wijzigen tenzij expliciet gevraagd.

---

## Rol

Je bent senior product- en software-architect voor **PerfectSupplement** (perfectsupplement.nl): onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+, monetisatie via affiliate, positionering “De Consumentenbond van supplementen”. Je adviseert Dennis (eigenaar); hij commit en deployt zelf.

**Outputtaal:** Nederlands. **Code/analyse:** Engelse identifiers, concrete bestands- en routepaden.

---

## Opdracht

Maak een **brede architectuuranalyse** van de huidige staat (mei 2026) en een **geprioriteerde roadmap** met vervolgstappen. Sorteer alles op **conversie en daadwerkelijk gebruik** bovenaan — niet op “technisch cool” of refactor om refactor.

Dek het spectrum af:

1. **Conversie & gebruik (B2C)** — intake-journey, affiliate-clicks, e-mail opt-in, herhaalbezoek
2. **Content & SEO-spinnenweb** — pillars, profielen, vergelijkingen, interne links
3. **Data & personalisatie** — Supabase content-laag vs hardcoded `getAdvice()`
4. **E-mail & nurture** — Resend, `nurture_emails`, alignment met `interventions`
5. **Events & automatisering** — `domain_events`, n8n, cron (systemd op server, geen PM2)
6. **Evidence-chat** — `/api/chat`, RAG, ontbrekende UI, embeddings
7. **B2B / betalende klanten (toekomst)** — Accendo, seats, Stripe, embed, webhooks
8. **Compliance & vertrouwen** — AVG, EFSA, geen medische claims
9. **Tech debt & docs** — verouderde docs vs code, deploy-pipeline

Wees eerlijk over **wat live is vs alleen in code/migratie**. Noem expliciet wat Dennis nog moet doen (Supabase migraties, env vars, cron-job.org).

---

## Verplichte bronnen — lees vóór je concludeert

Start met [`docs/_MASTER_INDEX.md`](../_MASTER_INDEX.md), maar **verifieer altijd in code** — meerdere core-docs zijn achter op de intake-journey (fases 1–8).

### Layer 1 — Core

| Document | Pad |
|----------|-----|
| Master index | `docs/_MASTER_INDEX.md` |
| Architectuur & deploy | `docs/core/ARCHITECTURE.md`, `CLAUDE.md` |
| Entity model / DB | `docs/core/ENTITY_MODEL.md` |
| SEO | `docs/core/SEO_RULES.md` |
| Compliance | `docs/core/COMPLIANCE.md` |
| Schrijfstem | `docs/core/WRITING_VOICE.md` |
| Code conventies | `docs/core/CODE_CONVENTIES.md` |

### Layer 2 — Systemen

| Document | Pad |
|----------|-----|
| Intake (legacy 5-fasen — deels vervangen) | `docs/core/INTAKE_SYSTEM.md` |
| Content | `docs/core/CONTENT_SYSTEM.md` |
| Affiliate | `docs/core/AFFILIATE_SYSTEM.md` |
| E-mail | `docs/core/EMAIL_SYSTEM.md` |
| Personalisatie | `docs/core/PERSONALIZATION_ENGINE.md` |
| Evidence-chat (fase 8) | `docs/core/EVIDENCE_CHAT.md` |
| Accendo / B2B (planning) | `docs/core/ACCENDO_ARCHITECTURE.md` |

### Layer 3 — Werk

| Document | Pad |
|----------|-----|
| Sprint | `docs/core/CURRENT_SPRINT.md` |
| Pagina-roadmap | `docs/core/PAGE_ROADMAP.md` |
| Content gaps | `docs/core/CONTENT_GAPS.md` |
| Cron | `src/app/api/cron/README.md` |

### Code — intake-journey (bron van waarheid, mei 2026)

Lees/minimal scan:

| Onderdeel | Waar |
|-----------|------|
| Journey UI | `src/app/intake/IntakeClient.tsx` |
| REVEAL / piramide | `src/components/intake/IntakeResults.tsx`, `src/lib/primary-theme.ts` |
| HERKENNING / FOCUS / PLAN | `IntakeRecognition.tsx`, `IntakeFocus.tsx`, `IntakePlan.tsx` |
| Content DB | `src/lib/content/themes.ts`, `match-recognition.ts`, `match-interventions.ts`, `plan-content.ts` |
| Journey gate | `src/app/api/intake/journey-ready/route.ts` |
| Events | `src/lib/events.ts`, `src/app/api/intake/events/route.ts` |
| Nurture + n8n | `src/lib/nurture.ts`, `nurture-cron.ts`, `n8n-webhook.ts`, `src/app/api/cron/n8n-events/route.ts` |
| Evidence chat API | `src/lib/evidence-rag.ts`, `src/app/api/chat/route.ts` |
| Legacy scoring | `src/lib/intake-engine.ts` (`getAdvice` nog deels actief) |
| Intake-chat (vragenlijst) | `src/app/api/intake/chat/route.ts`, `src/lib/chat-intake.ts` — **niet** hetzelfde als `/api/chat` |
| Copy placeholders | `docs/copy/themes/*.md`, `docs/copy/interventions/*.md` |
| Migraties (volgorde) | `supabase/migrations/20260529120000_*` t/m `20260529240000_*` |

### Infra (productie)

- Deploy: `deploy.sh` → **systemd** `perfectsupplement`, niet PM2
- Server: Hetzner `178.104.75.207`, app `/root/perfectsupplement`
- Cron auth: `CRON_SECRET` Bearer; optioneel `N8N_WEBHOOK_URL`

---

## Bekende staat journey (fases 1–8) — valideer en vul aan

| Fase | Status (verwacht) | Kern |
|------|-------------------|------|
| 1 REVEAL | Live | `getPrimaryTheme`, piramide-accent |
| 2 HERKENNING | Live | `themes`, `recognition_lines` |
| 3 FOCUS | Live | hefboom + disclaimers |
| 4 Interventies | Live | `interventions`, triggers, scoring |
| 5 PLAN | Live | `evidence_claims`, sleep + stress/nutrition/movement seed |
| 6 Events + nurture sleep | Live | `domain_events`, nurture dag 3/14/21 uit DB |
| 7 Overige thema's | Live (na migratie) | zelfde journey voor 4 gemeten pijlers |
| 8 Evidence-chat + n8n hook | API live, **geen UI** | FTS RAG; n8n optioneel |

**Niet af:** chat-UI op site, pgvector embeddings vullen, `getAdvice()` volledig verwijderen, MASTER_INDEX/docs sync, betalingsflow, Accendo product.

---

## Gewenste outputstructuur

### 1. Executive summary (max 15 regels)

Waar staat het product technisch en commercieel? Grootste kans op omzet/impact in 90 dagen?

### 2. Architectuur nu (as-is diagram + tekst)

Mermaid of ASCII: **bezoeker → intake journey → Supabase → Resend / affiliate / events → n8n (optioneel) → chat API (los)**. Scheid B2C vs toekomst B2B.

### 3. Wat werkt goed (bewijs uit code/docs)

Bulletpoints met bestandsverwijzingen.

### 4. Gaps & risico’s

- Conversielekken (bijv. geen chat-UI, legacy Tips op results, placeholder copy)
- Operationeel (migraties, env, cron 503 zonder n8n)
- Juridisch/compliance
- Documentatie drift

### 5. Geprioriteerde roadmap

Tabel of genummerde lijst **P0 → P3**, elk item:

| Kolom | Inhoud |
|-------|--------|
| Prioriteit | P0–P3 |
| Item | Kort |
| Waarom (conversie/gebruik) | Meetbaar effect |
| Afhankelijkheden | Migratie, copy Dennis, n8n, Stripe, … |
| Geschatte inspanning | S/M/L |
| Bestanden/routes | Concreet |

**Sorteerregel:** binnen elke prioriteit eerst wat **meer intake-completions, affiliate-clicks, e-mail opt-ins of herhaalmetingen** oplevert; daarna SEO/content; daarna platform/B2B.

### 6. Betalingsflow & betalende klanten (toekomst — expliciet scheiden)

- B2C blijft affiliate — geen paywall op intake?
- Accendo: seats, branding, webhook per org (`organizations.settings`), Stripe-fase
- Wat kan **nu** al voorbereid worden zonder scope creep (events, `organization_id`, API-grenzen)?

### 7. n8n & chat — integratiepad

- Welke `domain_events` zijn er, wat moet n8n doen (nurture backup, CRM, coach alerts)?
- Evidence-chat: UI-plaatsing (PLAN-scherm? results?), embeddings-job, out-of-scope gedrag
- Verschil `/api/intake/chat` vs `/api/chat` — geen verwarring

### 8. Docs die Dennis moet updaten

Lijst concrete docs (o.a. `_MASTER_INDEX`, `INTAKE_SYSTEM`, `CURRENT_SPRINT`, `ENTITY_MODEL`) met wat erin moet.

### 9. “Niet doen nu” — expliciet

Bespaart focus (grote refactors, dubbele scoring, premature Accendo deploy, …).

---

## Beperkingen analyse

- **Geen code genereren** in deze sessie, tenzij Dennis dat apart vraagt.
- **Geen AI-gegenereerde supplement-scores of definitieve medische copy.**
- Geen commit/push-commando’s uitvoeren.
- Als iets onduidelijk is: zeg “onbekend — check `bestand X`”, niet gokken.
- Affiliate: Arctic Blue `sld=dennisvanwestbroek` en Daisycon-regels intact laten.

---

## Optionele verdieping (als tijd over is)

Kies **één** P0-item en werk uit tot acceptatiecriteria + testplan (mobiel 375px, Supabase-check queries, curl voorbeelden voor cron/chat).

---

*Prompt versie: mei 2026 — na afronding intake journey fases 1–8.*
