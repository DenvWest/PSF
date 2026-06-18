# REVEAL-scherm — copy-placeholders

Definitieve teksten levert de eigenaar. Cursor gebruikt onderstaande placeholders
tot vervanging. Wijzig alleen dit bestand + `src/lib/results-reveal-copy.ts`.

**Design (Claude Design):**
- Prompt: [`docs/cursors/claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md)
- Layout-spec: [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md)

| Plek | Placeholder | Huidige fallback in code |
|---|---|---|
| `<h1>` hero | `Dit is waar je nu staat.` (design locked) | `REVEAL_COPY.heroTitle` |
| Context-zin onder hero | `Op basis van je antwoorden. Geen medische diagnose.` | `REVEAL_COPY.contextLine` |
| Prioriteit eyebrow/titel | `Prioriteit` / `Waar je begint` | `REVEAL_COPY.priorityEyebrow` / `priorityTitle` |
| Ladder-teaser | `Nog 3 pijlers en je trend in je dashboard.` | `REVEAL_COPY.ladderMoreTeaser` |
| Plan eyebrow/titel | `Je plan` / `Leefstijl eerst` | `REVEAL_COPY.planEyebrow` / `planTitle` |
| Leefstijl rollen | `Start hier` / `Blijf dit vasthouden` | `lifestyleRolePrioriteit` / `lifestyleRoleKracht` |
| CTA-knoptekst | `Bewaar dit en volg je voortgang →` | `REVEAL_COPY.cta` |
| CTA subtekst | `Log in en bewaar dit — dan zie je je volledige prioriteit en voortgang.` | `REVEAL_COPY.ctaSubtext` |
| Dashboard-preview summary | `Zo ziet je dashboard eruit` | `REVEAL_COPY.dashboardPreviewSummary` |
| `<summary>` methodiek | `Hoe komt dit overzicht tot stand?` | `REVEAL_COPY.methodDetailsSummary` |
