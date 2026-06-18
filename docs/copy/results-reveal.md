# REVEAL-scherm — copy-placeholders

Definitieve teksten levert de eigenaar. Cursor gebruikt onderstaande placeholders
tot vervanging. Wijzig alleen dit bestand + `src/lib/results-reveal-copy.ts`.

**Design (Claude Design):**
- Prompt: [`docs/cursors/claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md)
- Layout-spec: [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md)

| Plek | Placeholder | Huidige fallback in code |
|---|---|---|
| `<h1>` met naam | `{{warme zin in 2e persoon, mét naam, ≤ 8 woorden}}` | `getHeroTitle()` — nog vitaliteitsprofiel |
| `<h1>` zonder naam | `Dit is waar je nu staat.` (design locked) | `getHeroTitle()` — nog vitaliteitsprofiel |
| CTA-knoptekst | `Bewaar dit en volg je voortgang →` (design locked) | `Bewaar resultaat + herinnering →` |
| Context-zin onder hero | `Op basis van je antwoorden. Geen medische diagnose.` | Zelfde tekst |
| CTA subtekst | `Eén plek die onthoudt hoe het met je gaat.` | — |
| `<summary>` methodiek | `Hoe komt dit overzicht tot stand?` | Zelfde tekst |
| `<summary>` meer achtergrond | `Meer achtergrond` | `Meer achtergrond` |
