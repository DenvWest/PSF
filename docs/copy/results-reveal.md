# REVEAL-scherm — copy-placeholders

Definitieve teksten levert de eigenaar. Cursor gebruikt onderstaande placeholders
tot vervanging. Wijzig alleen dit bestand + `src/lib/results-reveal-copy.ts`.

**Design (Claude Design):**
- Prompt: [`docs/cursors/claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md)
- Layout-spec: [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md)

| Plek | Placeholder | Huidige fallback in code |
|---|---|---|
| `<h1>` hero | `Dit is waar je nu staat.` | `REVEAL_COPY.heroTitle` |
| Herkenningszin | uit symptomen via `getRecognitionLine` | `model.recognitionLine` |
| Driver/strength | uit scores via `getVitalityFraming` | `model.driverLine` / `strengthLine` |
| Journey-rail | `Overzicht ● — Plan — Dashboard` | `journeyOverview` / `journeyPlan` / `journeyDashboard` |
| Waar je begint (open) | ladder + quick-win → login | `RevealWhereYouStart` |
| Primaire CTA | `Bewaar dit in je dashboard →` | `REVEAL_COPY.cta` |
| Preview-link | `Bekijk hoe je dashboard eruitziet` | `REVEAL_COPY.ctaPreviewLink` |
| Footer-panel | `Methodiek, privacy & disclaimer` | `REVEAL_COPY.footerPanelSummary` |
