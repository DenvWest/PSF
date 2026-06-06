# PerfectSupplement — Master Index

> **Dit is het startpunt.** Claude/Cursor: lees dit eerst, volg de links naar wat je nodig hebt.

---

## Project in één zin

Onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+. Monetisatie via affiliate. Positionering: "De Consumentenbond van supplementen."

## Huidige fase

**Content foundation bouwen** — profielpagina's, pillar pages, cluster-blogs en interne links vullen. Geen nieuwe features tot het spinnenweb stevig staat.

## Wat is live (mei 2026)

- 7 vergelijkingspagina's met affiliate (`/beste/*`; geen melatonine — zie `COMPLIANCE.md`)
- 7 pillar pages: slaap, stress, energie, herstel, testosteron, voeding, beweging (zie `core/CONTENT_MAP.md`)
- 4 profielpagina's (onrustige-slaper, stressdrager, lage-batterij, overtrainer)
- Actuele tellingen en slug-lijsten: `npm run generate-state` → `docs/PROJECT_STATE.md` (auto-gegenereerd)
- Planning/status nieuwe pagina's: `docs/core/PAGE_ROADMAP.md` + `docs/core/CURRENT_SPRINT.md`
- Intake flow: journey REVEAL → HERKENNING → FOCUS → PLAN (4 thema's), scoring, nurture, `domain_events`, evidence-chat API (`/api/chat`)
- Admin dashboard

---

## Documentstructuur (3 lagen)

### Layer 1 — Core (permanente regels, source of truth)

| Document | Wat het beschrijft |
|---|---|
| [`core/ARCHITECTURE.md`](core/ARCHITECTURE.md) | Stack, projectstructuur, file locations, deploy, server |
| [`core/CODE_CONVENTIONS.md`](core/CODE_CONVENTIONS.md) | Code regels, workflow regels, Cursor-prompt format |
| [`core/SEO_RULES.md`](core/SEO_RULES.md) | Spinnenweb-architectuur, on-page SEO, structured data, canonical policy, link regels |
| [`core/ENTITY_MODEL.md`](core/ENTITY_MODEL.md) | Database schema, domain scores, answers structuur, RLS |
| [`core/DESIGN_TOKENS.md`](core/DESIGN_TOKENS.md) | Fonts, kleuren, spacing, component patterns, mobile-first |
| [`core/COMPLIANCE.md`](core/COMPLIANCE.md) | EFSA claims, AVG, affiliate disclosure, medische disclaimers |
| [`core/WRITING_VOICE.md`](core/WRITING_VOICE.md) | Schrijfstem: toon, woorden, herkennings-copy (weggever, nurture, profielen) |

### Layer 2 — Systems (hoe systemen werken)

| Document | Wat het beschrijft |
|---|---|
| [`core/INTAKE_SYSTEM.md`](core/INTAKE_SYSTEM.md) | 5-fasen flow, vragenlijst, scoring engine, beslislogica, profiellabels |
| [`core/CONTENT_MAP.md`](core/CONTENT_MAP.md) | Canonieke routekaart (routes, clusters, profiel-koppelingen) |
| [`core/CONTENT_SYSTEM.md`](core/CONTENT_SYSTEM.md) | Turbo-snippets, Smart Content Module, page blueprints |
| [`core/AFFILIATE_SYSTEM.md`](core/AFFILIATE_SYSTEM.md) | Daisycon, Arctic Blue, link-structuur, Sub ID, click tracking |
| [`core/EMAIL_SYSTEM.md`](core/EMAIL_SYSTEM.md) | Nurture sequence, Resend, cron, PDF-gidsen |
| [`core/PERSONALIZATION_ENGINE.md`](core/PERSONALIZATION_ENGINE.md) | Profiel-architectuur, scoring triggers, 8-sectie structuur, spinnenweb per profiel |
| [`core/STEPPED_CARE_MODEL.md`](core/STEPPED_CARE_MODEL.md) | PLAN-journey per symptoom: tiers (gratis→meten→supplement→betaald), intervention_triggers, render-eisen |

### Layer 3 — Work (tijdelijk, verandert regelmatig)

| Document | Wat het beschrijft |
|---|---|
| [`core/CURRENT_SPRINT.md`](core/CURRENT_SPRINT.md) | Wat nu gebouwd wordt, sprint planning, voltooid/gepland |
| [`core/PAGE_ROADMAP.md`](core/PAGE_ROADMAP.md) | Alle 66 pagina's: status, SEO-data, prioriteit |
| [`core/CONTENT_GAPS.md`](core/CONTENT_GAPS.md) | Link-gaps, ontbrekende cluster-blogs, spinnenweb-gaten |

---

## Quick lookup: "Ik werk aan X, wat lees ik?"

| Taak | Lees |
|---|---|
| Pagina bouwen | `core/SEO_RULES.md` + `core/CONTENT_SYSTEM.md` + `core/PAGE_ROADMAP.md` |
| Vergelijkingspagina | `core/COMPLIANCE.md` (EFSA claims) + `core/AFFILIATE_SYSTEM.md` + `core/CONTENT_SYSTEM.md` (Blueprint 1) |
| Profielpagina | `core/PERSONALIZATION_ENGINE.md` + `core/CONTENT_SYSTEM.md` (Blueprint 3) |
| Pillar page | `core/SEO_RULES.md` + `core/CONTENT_SYSTEM.md` (Blueprint 2) |
| Blogpost | `core/SEO_RULES.md` + `core/CONTENT_SYSTEM.md` (Blueprint 4 + Smart Content Module) |
| Intake/scoring | `core/INTAKE_SYSTEM.md` + `core/ENTITY_MODEL.md` |
| PLAN-scherm / interventies / tiers | `core/STEPPED_CARE_MODEL.md` + `core/ENTITY_MODEL.md` |
| Nurture emails | `core/WRITING_VOICE.md` + `core/EMAIL_SYSTEM.md` + `core/PERSONALIZATION_ENGINE.md` |
| Copy schrijven (herkenning, profiel, weggever) | `core/WRITING_VOICE.md` + `core/COMPLIANCE.md` |
| Affiliate links | `core/AFFILIATE_SYSTEM.md` + `core/COMPLIANCE.md` |
| Technische vraag | `core/ARCHITECTURE.md` + `core/CODE_CONVENTIONS.md` |
| Database/data | `core/ENTITY_MODEL.md` |
| Planning/sprint | `core/CURRENT_SPRINT.md` |
| Design/styling | `core/DESIGN_TOKENS.md` |
| Architectuur-strategie analyse (Claude prompt) | `cursors/architecture-strategy-analysis-prompt.md` |
| Evidence-chat / n8n (fase 8) | `core/EVIDENCE_CHAT.md` |

---

## Recente beslissingen

| Datum | Beslissing | Gedocumenteerd in |
|---|---|---|
| 6 juni 2026 | Plan meet- & personalisatielaag: tier-2 self-report inname-verdieping (PAL/BMR/TDEE/macro/micro), waarden→advies-matching, productkennis-RAG en anonimiseringspad | `plan/PLAN_MEASUREMENT_PERSONALIZATION.md` |
| 6 juni 2026 | Twee gescheiden datastromen (productkennis vs intake-AVG art. 9) + waardentrap = diepere personalisatie | `core/ARCHITECTURE.md` |
| Mei 2026 | Geannuleerde profielen verwijderd, 4 definitieve profielen vastgelegd | `core/PERSONALIZATION_ENGINE.md` |
| Mei 2026 | Ashwagandha uitgesloten van Foundation Stack (EFSA + NL verbod risico) | `core/COMPLIANCE.md` |
| Mei 2026 | Content spinnenweb eerst, features later | `core/CURRENT_SPRINT.md` |
| April 2026 | localStorage afgeschaft, alles via Supabase | `core/ARCHITECTURE.md` |

---

*Laatst bijgewerkt: mei 2026*
