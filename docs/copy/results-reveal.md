# REVEAL-scherm — copy-placeholders

Definitieve teksten levert de eigenaar. Cursor gebruikt onderstaande placeholders
tot vervanging. Wijzig alleen dit bestand + `src/lib/results-reveal-copy.ts`.

**Design (Claude Design):**
- Prompt: [`docs/cursors/claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md)
- Layout-spec: [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md)

| Plek | Placeholder | Huidige fallback in code |
|---|---|---|
| Momentopname eyebrow | `JOUW MOMENTOPNAME · ANONIEM` | `REVEAL_COPY.eyebrow` |
| Profiel hook | dynamisch via `PROFILE_COPY` + `getProfileLabel` | `RevealHeroCard` |
| Driver/strength | uit scores via `getVitalityFraming` | footer in `RevealHeroCard` |
| Waar je begint | top-3 priority bars | `RevealLadderCard` + `RevealPriorityBars` |
| Eerste stap titel | `Dit heb je nu — en wat er op je wacht` | `REVEAL_COPY.firstStepTitle` |
| Eerste stap | piramide: nu (leefstijl) + pas daarna (supplement) + dashboard-features | `RevealFirstStep` + `resolveRevealFirstStep` |
| Dashboard tease titel | `Dit wacht op je in je dashboard` | `REVEAL_COPY.dashboardTeaseTitle` |
| Dashboard wins | 3 bullets in `REVEAL_DASHBOARD_WINS` | `RevealDashboardTease` |
| Primaire CTA | `Bewaar dit in je dashboard →` | `REVEAL_COPY.cta` |
| Feedback | `Herken je jezelf in dit overzicht?` | `REVEAL_COPY.feedbackTitle` |
