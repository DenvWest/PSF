# Prompt — Plan-fase-weaving, premium tier-gating & n8n-triage (PerfectSupplement)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude in een nieuw gesprek. Claude levert **alleen analyse** (A t/m D), geen code. Voeg optioneel toe: `CLAUDE.md`, `docs/core/STEPPED_CARE_MODEL.md`, `docs/core/ENTITY_MODEL.md`.

---

## Waarom deze prompt

Drie richtingen staan klaar in de codebase maar zijn nog niet doorgetrokken naar de UI/orchestratie-laag:

| Richting | Staat nu | Gap |
|----------|----------|-----|
| **Plan-fase-weaving** | `plan_progress` + 3 fasen per leefstijlplan | Dashboard + `/inzichten` filteren op pijler, niet op fase; `InsightItem.planPhase` is dood metadata |
| **Premium tier-gating** | `interventions.tier` + `is_paid`, `getVisibleTiers()` | Premium-kennisbank gate't op login+intake, niet op tier; losse `insightTier`-schaal |
| **n8n inbound** | Outbound `domain_events` → `N8N_WEBHOOK_URL` | Geen `/api/webhooks/*`, geen content-push of reorder-reminder terug |

**Randvoorwaarde:** vijf bekende multi-tenant-gaten (default org, geen org-UI, dormant `registerOrg`, sessie-org genegeerd, geen billing) — **niet oplossen in deze analyse**, wel meewegen bij fasering.

### Verificatie-bronnen (optioneel voor Claude)

| Onderwerp | Pad |
|-----------|-----|
| Plan progress + fase-eval | `src/lib/plan-progress.ts`, `src/lib/lifestyle-plan-eval.ts`, `src/data/lifestyle-plans/` |
| Dashboard volgende stap | `src/lib/dashboard-active-plan.ts`, `src/lib/dashboard-model.ts` |
| Inzichten personalisatie | `src/lib/visitor-personalization.ts`, `src/data/insights.ts`, `src/data/insight-metadata.ts` |
| Tier / org-gate | `src/lib/org-settings.ts`, `src/lib/content/plan-content.ts`, `src/data/kennisbank.ts` |
| Events + n8n | `src/lib/events.ts`, `src/lib/n8n-webhook.ts`, `src/app/api/cron/n8n-events/route.ts` |
| Multi-tenant seam | `src/lib/organization.ts`, `src/config/org.ts`, `src/config/partners/example-partner.ts` |

---

## Prompt (copy-paste)

```text
ROL: Je bent senior architect op PerfectSupplement (Next.js 16 App Router, TS strict,
Supabase + RLS, affiliate-monetisatie). Lees CLAUDE.md mee. Lever UITSLUITEND een
ANALYSE. Geen code, geen diffs, geen edits, geen "ik ga nu bouwen". Als je twijfelt
of iets analyse of bouwen is: het is analyse.

DOEL: Maak een gefaseerd aanpakplan (fasering met afhankelijkheden) voor drie
richtingen, EN een harde n8n-triage: wat hoort WEL bij n8n, wat DEELS, wat (helemaal)
NIET. Onderbouw elke keuze met de bestaande codebase-realiteit hieronder.

CODEBASE-REALITEIT (geverifieerd, neem dit als waar aan):

1) Plan-fase model bestaat al maar wordt niet voor content-weaving gebruikt.
   - plan_progress (Supabase) + currentPhaseId per sessie+domein.
   - 4 leefstijlplannen (sleep/stress/nutrition/movement) x 3 vaste fasen:
     deze-week, week-2-4, week-4-12. Zie src/data/lifestyle-plans/ en
     src/lib/lifestyle-plan-eval.ts (selectVisibleSteps, computeCurrentPhaseId).
   - Dashboard + /inzichten personaliseren NU bijna alleen op PIJLER (laagste
     domeinscore via derivePriority), niet op fase.
     Zie src/lib/dashboard-model.ts, src/lib/visitor-personalization.ts,
     src/data/insights.ts (filterInsights = alleen pijler + type).
   - Weaving-naad is voorbereid maar DOOD: InsightItem.planPhase (1|2|3) in
     src/types/insight.ts, overlay in src/data/insight-metadata.ts (slechts paar
     slugs getagd), wordt nergens gelezen in rendering/filtering.
   - Dashboard "volgende stap" (activeHabit via buildActivePlanHabit) komt WEL uit
     de huidige plan-fase, maar RecommendedInsights en InzichtenContextStrip linken
     alleen op priorityPillarId — geen fase-weaving.

2) Premium = tier-data, model bestaat al, maar gating is nu losgekoppeld.
   - interventions.tier (1-5) + is_paid (Supabase), org-gate getVisibleTiers()
     op organizations.settings.maxTier (src/lib/org-settings.ts).
   - is_paid triggert nu alleen een disclosure, geen toegangspoort.
   - Kennisbank heeft een APARTE schaal insightTier (1-3) in src/data/kennisbank.ts.
   - Premium-kennisbank op /inzichten is NU een soft paywall: zichtbaar bij
     account + afgeronde intake (getInzichtenVisitorContext), niet op tier/is_paid.
     Losse /kennisbank/[slug]-pagina's blijven volledig publiek.
   - Er is GEEN monetair abonnement in het datamodel (accounts heeft geen is_paid).
   - Nurture gebruikt WEL plan-fase-voortgang (resolve-nurture-tier.ts) voor
     tier-degradatie op dag 14/21 — los van premium-kennisbank-gating.

3) n8n is vandaag puur OUTBOUND.
   - emitEvent -> domain_events (append-only) -> bij deliveredTo "n8n_webhook"
     directe POST naar N8N_WEBHOOK_URL (src/lib/events.ts, src/lib/n8n-webhook.ts).
   - Cron-backup /api/cron/n8n-events stuurt onverzonden events alsnog door.
   - ~33 DOMAIN_EVENT_TYPES (src/lib/events.ts). Client-events vereisen registratie
     op 3 plekken (events.ts + intake-events-client.ts + allowlist in
     /api/intake/events/route.ts) en respecteren analytics-consent.
   - GEEN inbound n8n: geen /api/webhooks/*, geen content-push, geen reorder-reminder
     terug de app in. PostHog heeft geen server-side forwarder (alleen label).
   - E-mail (nurture, remeasure) loopt intern via Resend + cron, niet via n8n inbound.

RANDVOORWAARDE - 5 bekende multi-tenant-gaten (NIET oplossen, wel meewegen):
   a) Runtime tenant-resolutie: alles -> default org via getDefaultOrganizationId().
   b) Geen org onboarding/auth UI (alleen PSF admin-wachtwoord).
   c) registerOrg() / EXAMPLE_PARTNER zijn dormant (geen call sites).
   d) Plan-route en de meeste API's negeren sessie-organization_id (hardcoded default;
      enige uitzondering: nurture plan-gate leest sessie-org).
   e) Geen per-org billing/feature-flags (alleen maxTier-gate, zonder admin-UI).

LEVER DEZE ANALYSE (en niets anders):

A. Per richting (1 plan-fase-weaving, 2 premium tier-gating, 3 n8n-inbound):
   - Kernbeslissing in 1 zin.
   - Wat hergebruikt bestaande seams (noem concrete files/velden) vs. wat is nieuw.
   - Kleinste zinvolle eerste stap (waarde zonder de multi-tenant-gaten op te lossen).
   - Welke van de 5 gaten dit raakt en of het een blokker of te-negeren-risico is.
   - Conversie/SEO-impact en een meetpunt-voorstel (welk bestaand domain_event of
     GA4/Clarity-tag; nieuw event alleen als echt nodig, met de 3 registratieplekken).

B. n8n-triage als expliciete driedeling:
   - WEL n8n: orchestratie/timing/multi-channel die buiten request-cyclus hoort
     (en wat dat vereist: nieuwe inbound /api/webhooks/* + auth-secret + idempotentie).
   - DEELS n8n: kan n8n, maar app moet de bron-van-waarheid + guardrails houden
     (bv. tier-gating, consent, RLS) - beschrijf de taakverdeling.
   - NIET (helemaal niet) n8n: alles wat synchroon, security-gevoelig, of
     bron-van-waarheid is (RLS-writes, tier-toegangspoort, PII-besluiten).
   Onderbouw met het feit dat n8n nu alleen outbound is en de app single-tenant draait.

C. Fasering: een geordende roadmap (Fase 0..n) met per fase: doel, afhankelijkheid,
   "definition of done", en of het de multi-tenant-seam aanraakt. Zet de goedkoopste
   hoogste-waarde stappen vooraan; markeer expliciet wat je BEWUST uitstelt tot
   multi-tenant echt nodig is.

D. Risico's & open vragen: top 5, met de vraag die je aan Dennis zou stellen.

FORMAAT: beknopt, kopjes + bullets, geen tabellen langer dan nodig. Nederlands.
Geen code. Sluit af met: "Aanbeveling: <de ene volgende stap die ik zou nemen>".
```

---

## Na de analyse

1. Bewaar Claude's output (bijv. `docs/analyse/plan-fase-n8n-tier-analyse.md`).
2. Kies één fase uit sectie C als aparte **implementatie-opdracht** (Cursor of Claude Code).
3. Multi-tenant-gaten pas aanpakken wanneer B2B/partner echt live gaat — niet als voorwaarde voor Fase 0/1.

*Prompt versie: juni 2026 — plan-fase-weaving + premium tier + n8n inbound triage.*
