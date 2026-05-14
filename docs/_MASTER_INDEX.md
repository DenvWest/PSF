# PerfectSupplement — Master Index

> **Dit is het startpunt.** Claude/Cursor: lees dit eerst, volg de links naar wat je nodig hebt.

---

## Project in één zin

Onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+. Monetisatie via affiliate. Positionering: "De Consumentenbond van supplementen."

## Huidige fase

**Content foundation bouwen** — profielpagina's, pillar pages, cluster-blogs en interne links vullen. Geen nieuwe features tot het spinnenweb stevig staat.

## Wat is live (mei 2026)

- 6 vergelijkingspagina's (omega-3, magnesium, ashwagandha, zink, creatine, vitamine D)
- 1 pillar page (`/slaap-verbeteren-na-40`)
- 1 profielpagina (`/profiel/onrustige-slaper`)
- 19 blogartikelen, 11 kennisbankbegrippen, 4 thema-hubs
- Intake flow met scoring engine, nurture emails, affiliate tracking
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

### Layer 2 — Systems (hoe systemen werken)

| Document | Wat het beschrijft |
|---|---|
| [`systems/INTAKE_SYSTEM.md`](systems/INTAKE_SYSTEM.md) | 5-fasen flow, vragenlijst, scoring engine, beslislogica, profiellabels |
| [`systems/CONTENT_SYSTEM.md`](systems/CONTENT_SYSTEM.md) | Content-map, turbo-snippets, Smart Content Module, page blueprints |
| [`systems/AFFILIATE_SYSTEM.md`](systems/AFFILIATE_SYSTEM.md) | Daisycon, Arctic Blue, link-structuur, Sub ID, click tracking |
| [`systems/EMAIL_SYSTEM.md`](systems/EMAIL_SYSTEM.md) | Nurture sequence, Resend, cron, PDF-gidsen |
| [`systems/PERSONALIZATION_ENGINE.md`](systems/PERSONALIZATION_ENGINE.md) | Profiel-architectuur, scoring triggers, 8-sectie structuur, spinnenweb per profiel |

### Layer 3 — Work (tijdelijk, verandert regelmatig)

| Document | Wat het beschrijft |
|---|---|
| [`work/CURRENT_SPRINT.md`](work/CURRENT_SPRINT.md) | Wat nu gebouwd wordt, sprint planning, voltooid/gepland |
| [`work/PAGE_ROADMAP.md`](work/PAGE_ROADMAP.md) | Alle 66 pagina's: status, SEO-data, prioriteit |
| [`work/CONTENT_GAPS.md`](work/CONTENT_GAPS.md) | Link-gaps, ontbrekende cluster-blogs, spinnenweb-gaten |

---

## Quick lookup: "Ik werk aan X, wat lees ik?"

| Taak | Lees |
|---|---|
| Pagina bouwen | `core/SEO_RULES.md` + `systems/CONTENT_SYSTEM.md` + `work/PAGE_ROADMAP.md` |
| Vergelijkingspagina | `core/COMPLIANCE.md` (EFSA claims) + `systems/AFFILIATE_SYSTEM.md` + `systems/CONTENT_SYSTEM.md` (Blueprint 1) |
| Profielpagina | `systems/PERSONALIZATION_ENGINE.md` + `systems/CONTENT_SYSTEM.md` (Blueprint 3) |
| Pillar page | `core/SEO_RULES.md` + `systems/CONTENT_SYSTEM.md` (Blueprint 2) |
| Blogpost | `core/SEO_RULES.md` + `systems/CONTENT_SYSTEM.md` (Blueprint 4 + Smart Content Module) |
| Intake/scoring | `systems/INTAKE_SYSTEM.md` + `core/ENTITY_MODEL.md` |
| Nurture emails | `systems/EMAIL_SYSTEM.md` + `systems/PERSONALIZATION_ENGINE.md` |
| Affiliate links | `systems/AFFILIATE_SYSTEM.md` + `core/COMPLIANCE.md` |
| Technische vraag | `core/ARCHITECTURE.md` + `core/CODE_CONVENTIONS.md` |
| Database/data | `core/ENTITY_MODEL.md` |
| Planning/sprint | `work/CURRENT_SPRINT.md` |
| Design/styling | `core/DESIGN_TOKENS.md` |

---

## Recente beslissingen

| Datum | Beslissing | Gedocumenteerd in |
|---|---|---|
| Mei 2026 | Geannuleerde profielen verwijderd, 4 definitieve profielen vastgelegd | `core/PERSONALIZATION_ENGINE.md` |
| Mei 2026 | Ashwagandha uitgesloten van Foundation Stack (EFSA + NL verbod risico) | `core/COMPLIANCE.md` |
| Mei 2026 | Content spinnenweb eerst, features later | `work/CURRENT_SPRINT.md` |
| April 2026 | localStorage afgeschaft, alles via Supabase | `core/ARCHITECTURE.md` |

---

*Laatst bijgewerkt: mei 2026*
