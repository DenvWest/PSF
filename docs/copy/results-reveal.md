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
| Herkenningszin | uit symptomen via `getRecognitionLine` | `model.recognitionLine` |
| Driver/strength | uit scores via `getVitalityFraming` | footer in `RevealHeroCard` |
| Waar je begint | top-3 ladder + quick win | `RevealLadderCard` + `RevealQuickWin` |
| Primaire CTA | `Bewaar dit in je dashboard →` | `REVEAL_COPY.cta` |
| CTA headline | `Bewaar je overzicht` | `REVEAL_COPY.ctaHeadline` |
| Feedback | `Herken je jezelf in dit overzicht?` | `REVEAL_COPY.feedbackTitle` |
