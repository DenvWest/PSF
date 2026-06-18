# CURSOR PROMPT TEMPLATE — PerfectSupplement

> **Layer 1 — Core.** Vast skelet voor reproduceerbare Cursor-prompts. Korte samenvatting in [`CODE_CONVENTIONS.md`](CODE_CONVENTIONS.md).

---

## Skelet

Elke Cursor-prompt volgt deze volgorde:

```text
Rol → Context → Taak → Constraints → Acceptatiecriterium → Verificatie
```

| Sectie | Wat erin hoort |
|---|---|
| **Rol** | Wie de agent is en welk domein (bijv. Next.js dev, compliance-reviewer) |
| **Context** | Relevante docs uit [`_MASTER_INDEX.md`](../_MASTER_INDEX.md) + exacte bestandspaden |
| **Taak** | Concrete wijziging — production-ready, geen placeholders |
| **Constraints** | Harde regels uit [`CLAUDE.md`](../../CLAUDE.md) + do-not-touch lijst |
| **Acceptatiecriterium** | Wanneer de taak "klaar" is |
| **Verificatie** | Commando's die de agent moet draaien vóór stop |

---

## Leeg copy-paste-blok

```text
## Rol
Je bent [rol] voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- [docs/core/...]
- Bestanden: [exacte paden]

## Taak
[Concrete beschrijving van wat er moet gebeuren]

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- Verander NIETS aan: [lijst]
- Geen git commands, geen commit
- .env.local niet aanraken

## Acceptatiecriterium
- [ ] [concreet meetbaar resultaat]
- [ ] Geen nieuwe console.log in src/
- [ ] npm run build groen

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npm run build

Niet automatisch committen. Stop na aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat: [OMSCHRIJVING]"
```

---

## Ingevuld voorbeeld — nieuwe sectie op vergelijkingspagina

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/core/SEO_RULES.md (on-page SEO, heading-hiërarchie)
- docs/core/COMPLIANCE.md (EFSA claims)
- docs/core/AFFILIATE_SYSTEM.md (affiliate regels)
- Bestanden:
  - src/data/supplements/magnesium.ts
  - src/components/supplements/BuyingGuide.tsx (kopieer patronen)
  - src/app/beste/[supplement]/page.tsx

## Taak
Voeg een "Wanneer magnesium?" sectie toe aan de magnesium-vergelijkingspagina:
- H2 + 3 bullets met alleen EFSA-goedgekeurde claims uit approved-claims.ts
- Turbo-snippet (1-2 zinnen) boven interne link naar /supplementen/magnesium
- MedicalDisclaimer blijft onderaan de pagina

## Constraints
- Imports via `@/`
- Nederlandse UI, Engelse code
- Verander NIETS aan: src/data/affiliate-links.ts, src/lib/scoring.ts, globals.css, deploy.sh
- Geen affiliate links in nieuwe copy buiten bestaande productkaarten
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] Eén h1 op de pagina (bestaand), nieuwe sectie als h2
- [ ] Claims komen uit getUsableClaims('magnesium') of equivalent
- [ ] Interne link naar /supplementen/magnesium met turbo-snippet erboven
- [ ] Geen console.log, geen placeholders

## Verificatie
1. grep -rn "console.log" src/
2. npm run build

Niet automatisch committen. Stop na aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat: magnesium vergelijking wanneer-sectie"
```

---

## Wanneer welke agent

| Situatie | Agent |
|---|---|
| Grote taak, meerdere bestanden, architectuurkeuze | **Plan mode** — ontwerp eerst, implementeer daarna |
| UI/UX design resultaatscherm of dashboard (Claude Design) | **Design-prompt** — [`claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md) + [`results-reveal-layout.md`](../design/results-reveal-layout.md) |
| Brede codebase-sweep ("waar raken affiliate-slugs elkaar?") | **Explore agent** |
| Fix loopt vast of tweede mening nodig | **codex-rescue** |
| Concrete, afgebakende codewijziging | Standaard agent met deze template |

---

## Gerelateerde docs

| Doc | Wanneer |
|---|---|
| [`CODE_CONVENTIONS.md`](CODE_CONVENTIONS.md) | Git-workflow, naming, component patterns |
| [`docs/cursors/weekly-routines-claude-code.md`](../cursors/weekly-routines-claude-code.md) | Wekelijkse read-only audits |
| [`docs/cursors/monthly-strategy-review.md`](../cursors/monthly-strategy-review.md) | Maandelijkse markt/funnel/SWOT-review — **twee fasen**: schedule (Prompt A) + handmatige SQL-plak (Prompt B) |
| [`docs/cursors/claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md) | Claude Design: intake-resultaten / REVEAL-scherm (A/B mockups) |
| [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md) | Layout-spec companion — tokens, spacing, compliance-zone |
| [`CLAUDE.md`](../../CLAUDE.md) | Projectbrede regels (altijd) |

---

*Laatst bijgewerkt: juni 2026*
