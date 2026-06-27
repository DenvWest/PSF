# PerfectSupplement — Master Index

> **Dit is het startpunt.** Claude/Cursor: lees dit eerst, volg de links naar wat je nodig hebt.

---

## Project in één zin

Onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+. Monetisatie via affiliate. Positionering: "De Consumentenbond van supplementen."

## Huidige fase

**Meet-, personalisatie- & identiteitslaag** — de content-foundation staat; de focus ligt nu op de meet-lus (zelfrapportage per domein), het persoonlijke account + dashboard (continuïteit-moat) en personalisatie (eiwit/PAL). Zie [`core/ACCOUNT_DASHBOARD_SYSTEM.md`](core/ACCOUNT_DASHBOARD_SYSTEM.md) + [`plan/PLAN_MEASUREMENT_PERSONALIZATION.md`](plan/PLAN_MEASUREMENT_PERSONALIZATION.md). Content-spinnenweb = doorlopend onderhoud.

## Wat is live (juni 2026)

- 7 vergelijkingspagina's met affiliate (`/beste/*`; geen melatonine — zie `COMPLIANCE.md`)
- 7 pillar pages: slaap, stress, energie, herstel, testosteron, voeding, beweging (zie `core/CONTENT_MAP.md`)
- 4 profielpagina's (onrustige-slaper, stressdrager, lage-batterij, overtrainer)
- Actuele tellingen en slug-lijsten: `npm run generate-state` → `docs/PROJECT_STATE.md` (auto-gegenereerd)
- Planning/status nieuwe pagina's: `docs/core/PAGE_ROADMAP.md` + `docs/core/CURRENT_SPRINT.md`
- Intake flow: journey REVEAL → HERKENNING → FOCUS → PLAN (4 thema's), scoring, nurture, `domain_events`, evidence-chat API (`/api/chat`)
- Admin dashboard
- **Account & persoonlijk dashboard (juni 2026):** passwordless inlog (OTP-code + magic-link), `psf_account`-cookie, `/dashboard` met scores/trend/prioriteit per account, check-in-meet-lus — zie [`core/ACCOUNT_DASHBOARD_SYSTEM.md`](core/ACCOUNT_DASHBOARD_SYSTEM.md)
- **Meet-lussen:** voeding (`intake_intake_log`) + zachte pijlers (`intake_domain_checkin`: slaap/stress/beweging) met delta tegen baseline

---

## Documentstructuur (3 lagen)

### Layer 1 — Core (permanente regels, source of truth)

| Document | Wat het beschrijft |
|---|---|
| [`core/ARCHITECTURE.md`](core/ARCHITECTURE.md) | Stack, projectstructuur, file locations, deploy, server |
| [`core/CODE_CONVENTIONS.md`](core/CODE_CONVENTIONS.md) | Code regels, workflow regels, Cursor-prompt format |
| [`core/CURSOR_PROMPT_TEMPLATE.md`](core/CURSOR_PROMPT_TEMPLATE.md) | Vast skelet voor reproduceerbare Cursor-prompts |
| [`core/SEO_RULES.md`](core/SEO_RULES.md) | Spinnenweb-architectuur, on-page SEO, structured data, canonical policy, link regels |
| [`core/ENTITY_MODEL.md`](core/ENTITY_MODEL.md) | Database schema, domain scores, answers structuur, RLS |
| [`core/DESIGN_TOKENS.md`](core/DESIGN_TOKENS.md) | Fonts, kleuren, spacing, component patterns, mobile-first |
| [`core/COMPLIANCE.md`](core/COMPLIANCE.md) | EFSA claims, AVG, affiliate disclosure, medische disclaimers |
| [`core/WRITING_VOICE.md`](core/WRITING_VOICE.md) | Schrijfstem: toon, woorden, herkennings-copy (weggever, nurture, profielen) |
| [`core/BRAND_POSITIONING.md`](core/BRAND_POSITIONING.md) | Merkstrategie: propositie, differentiatie, social media, transparantie vs. moat |

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
| [`core/ACCOUNT_DASHBOARD_SYSTEM.md`](core/ACCOUNT_DASHBOARD_SYSTEM.md) | Passwordless account (OTP/magic-link), `psf_account`-cookie, claim/revoke, dashboard-dataflow, check-in-meet-lus (F1–F3) |

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
| Merk / social media / positionering | `core/BRAND_POSITIONING.md` + `core/WRITING_VOICE.md` |
| FASE A nurture-implementatie | `archive/FASE_A_IMPLEMENTATIE.md` + `core/EMAIL_SYSTEM.md` |
| Affiliate links | `core/AFFILIATE_SYSTEM.md` + `core/COMPLIANCE.md` |
| Technische vraag | `core/ARCHITECTURE.md` + `core/CODE_CONVENTIONS.md` |
| Cursor-prompt schrijven | `core/CURSOR_PROMPT_TEMPLATE.md` |
| Wekelijkse audits (read-only) | `cursors/weekly-routines-claude-code.md` |
| Maandelijkse strategiereview | `cursors/monthly-strategy-review.md` |
| Database/data | `core/ENTITY_MODEL.md` |
| Planning/sprint | `core/CURRENT_SPRINT.md` |
| Design/styling | `core/DESIGN_TOKENS.md` |
| Architectuur-strategie analyse (Claude prompt) | `cursors/architecture-strategy-analysis-prompt.md` |
| Plan-fase / premium tier / n8n-triage analyse (Claude prompt) | `cursors/claude-analyse-plan-fase-n8n-tier-prompt.md` |
| Evidence-chat / n8n (fase 8) | `core/EVIDENCE_CHAT.md` |

---

## Recente beslissingen

| Datum | Beslissing | Gedocumenteerd in |
|---|---|---|
| 27 juni 2026 | Aanpak-modus maand-roadmap (27 jun–24 jul): één categorie diep (sport/kracht: eiwit→kracht→creatine) als bewezen sjabloon vóór breedte; nutriënt-personalisatie = surfacing van bestaande lib (computeProteinTarget/movement-pal) in de Aanpak-kaart; categorie-map als visie; meet-vóór-uitbreiden | `plan/PLAN_AANPAK_MAAND_ROADMAP.md` |
| 26 juni 2026 | IA prioriteit × moeite-matrix: positioneringsgrid (geen takenlijst), evidence als korte credibility-tag (geen as), vier kwadranten met verdienmodel (Q1 gratis = vertrouwen, Q2 betaald = persoonlijk programma), twee gescheiden klikdoelen (evidence→bron, CTA→actie/upsell), coach-first→playbook→LLM | `plan/PLAN_PRIORITEIT_MOEITE_MATRIX.md` |
| 14–17 juni 2026 | Account-identiteitslaag + persoonlijk dashboard: passwordless OTP-login (+ magic-link), `psf_account`-cookie (aparte secret), claim/revoke (omkeerbaar intrekken), dashboard op echte `intake_sessions`, check-in-meet-lus (F3b: `intake_domain_checkin` in de trend), login-vindbaarheid (IMU-header) | `core/ACCOUNT_DASHBOARD_SYSTEM.md` |
| 10 juni 2026 | Voeding zelf-evaluatie-lus: 24h-zelfrapport → inname-inschatting → delta → leefstijl-eerst-dan-supplement-advies; `intake_intake_log` als temporeel substraat; cohort-vergelijking volume-gated; inname-vs-status-grens | `plan/PLAN_NUTRITION_SELFEVAL_LOOP.md` |
| 10 juni 2026 | Nurture multi-product data-readiness: meet-haakjes P1–P4, meten→testen→verbeteren-loop, LLM-governance-poort G1–G7, B2B-naden via organization_id | `plan/PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md` |
| 6 juni 2026 | FASE A implementatie-instructies: concrete werkvoor FASE A1–A6 (dag-0, CTA-resolver, Overtrainer, K1–K3, balansregel, mail-coherentie) | `archive/FASE_A_IMPLEMENTATIE.md` |
| 6 juni 2026 | Merkpositionering: propositie, differentiatie, social media pijlers, transparantie vs. bescherming bedrijfsinformatie | `core/BRAND_POSITIONING.md` |
| 6 juni 2026 | Geconsolideerd fundament-prioriteitenplan: één volgorde nurture + 0-meting→vervolg + n8n-events; zelf-rapportage NU, wearable/BIA als horizon | `plan/PLAN_FUNDAMENT_PRIORITEIT.md` |
| 6 juni 2026 | Funnel- & datapriority: dag-0-scharnier sterk neerzetten, centrale CTA-resolver met leefstijl-guard, cross-domein-balansregel in mail, productschema normaliseren, ontbrekende funnel-events (`nurture.email_sent`); wearable/home-scan/agency als horizon mét drempels | `plan/PLAN_FUNNEL_DATA_PRIORITY.md` |
| 6 juni 2026 | Analyse pijler-dekking: voeding is enige hard-kwantificeerbare pijler (scheefheid-risico), domein-interactielaag eerst versterken, cross-domein-balansregel, wearables als open beslispunt | `plan/ANALYSIS_PILLAR_COVERAGE.md` |
| 6 juni 2026 | Plan meet- & personalisatielaag: tier-2 self-report inname-verdieping (PAL/BMR/TDEE/macro/micro), waarden→advies-matching, productkennis-RAG en anonimiseringspad | `plan/PLAN_MEASUREMENT_PERSONALIZATION.md` |
| 6 juni 2026 | Twee gescheiden datastromen (productkennis vs intake-AVG art. 9) + waardentrap = diepere personalisatie | `core/ARCHITECTURE.md` |
| Mei 2026 | Geannuleerde profielen verwijderd, 4 definitieve profielen vastgelegd | `core/PERSONALIZATION_ENGINE.md` |
| Mei 2026 | Ashwagandha uitgesloten van Foundation Stack (EFSA + NL verbod risico) | `core/COMPLIANCE.md` |
| Mei 2026 | Content spinnenweb eerst, features later | `core/CURRENT_SPRINT.md` |
| April 2026 | localStorage afgeschaft, alles via Supabase | `core/ARCHITECTURE.md` |

---

*Laatst bijgewerkt: 27 juni 2026*
