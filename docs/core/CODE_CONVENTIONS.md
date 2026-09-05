# CODE CONVENTIONS — PerfectSupplement

> **Layer 1 — Core.** Alle code- en workflowregels. Claude/Cursor: volg dit altijd.

---

## TypeScript & Code

- TypeScript strict, geen `any`
- Imports altijd via `@/` (niet relatief)
- Componenten: PascalCase, bestandsnaam = componentnaam
- Data in `src/data/`, logica in `src/lib/`, componenten in `src/components/`
- Server components default, `"use client"` alleen waar nodig
- Tailwind classes in JSX, geen aparte CSS behalve `globals.css`
- Geen onnodige comments in code
- Nederlandse UI strings, Engelse variabelen en functies
- Semantic HTML: `<article>`, `<section>`, `<nav>`, `<aside>`, `<main>`, `<header>`, `<footer>` — niet alles in `<div>`

## Git & Workflow (hard geleerd)

1. **Altijd `git add` + `git commit` VOOR elke Cursor-sessie als er WIP is** — Dennis heeft meerdere keren local work verloren (checkpoint)
2. **Na een afgeronde taak: klaar-check → direct committen** — zie [`AGENTS.md`](../../AGENTS.md) en `.cursor/rules/commit.mdc`. Nooit wachten op “commit”; nooit `git push`
3. **Klaar-check vóór elke commit** — `grep -rn "console.log" src/` + `npx tsc --noEmit` + vitest + eslint (geen `next build` terwijl `next dev` live is)
4. **Nooit `npm install/uninstall` zonder direct te committen**
5. **`.env.local` NOOIT overschrijven of committen**

## Cursor-prompt format

Volledig skelet: [`CURSOR_PROMPT_TEMPLATE.md`](CURSOR_PROMPT_TEMPLATE.md) (Rol → Context → Taak → Constraints → Acceptatiecriterium → Verificatie).

Korte checklist — elke prompt moet bevatten:

1. **Complete production-ready content** (geen placeholders)
2. **Exacte file paths** waar wijzigingen moeten
3. **Exacte JSX/Tailwind class names** (kopieer van werkende componenten)
4. **Explicit "do not touch" lijst** (`"Verander NIETS aan [file]"`)
5. **Verificatie + direct commit:** na groene klaar-check meteen `git add` (alleen deze taak) + `git commit`; nooit push
6. **Sprint-per-sprint:** stop en review na elke sprint alleen als de prompt dat expliciet vraagt; anders commit na elke afgeronde sprint

`console.log`-check wordt afgedwongen door `.githooks/pre-commit`; `npm run build` blijft handmatige/agent-verificatie (te traag voor pre-commit).

## Naming conventions

| Type | Pattern | Voorbeeld |
|---|---|---|
| Components | PascalCase | `ComparisonTable.tsx` |
| Data files | kebab-case | `affiliate-links.ts` |
| Variabelen | camelCase | `supplementSlug` |
| Types/Interfaces | PascalCase | `SupplementProduct` |
| URLs/routes | kebab-case | `/beste/magnesium` |
| Image files | `Merk-Product.jpg` | `ArcticBlue-Visolie.jpg` |
| Cookie keys | snake_case | `psf_intake_sid` |
| Domain scores | snake_case (Engels) | `sleep_score`, `energy_score` |
| CSS/layout | Tailwind utility | `max-w-7xl px-6 lg:px-8` |

## Image regels

- Format: `Merk-Product.jpg` (geen speciale tekens, geen spaties)
- `imageSrc` in data files moet exact matchen met `public/images/producten/` (case-sensitive)
- Altijd `next/image` met lazy loading, `alt` tekst, `width`/`height`

## Component patterns

- `Container` is default export van `@/components/layout/Container` met `max-w-7xl px-6 lg:px-8`
- `PersonalizationCta` returnt `null` als er geen sessie is (geen fallback/duplicaten)
- `MedicalDisclaimer` component op alle vergelijkings- en profielpagina's
- `AffiliateLink` component: Supabase click tracking + `target="_blank" rel="noopener noreferrer sponsored"`
- Affiliate slug keys moeten matchen in `SupplementProduct`, `ChoiceRoute`, `AffiliateLink`

## Communicatie (Claude/Cursor)

- Antwoord in het Nederlands, code in het Engels
- Direct en concreet — geen "Dat is een goede vraag!"
- Werkende code, geen pseudo-code
- Bij keuzes: geef je aanbeveling met onderbouwing, niet 5 opties zonder mening
- Bij aanpassingen: geef het volledige bestand of een duidelijke diff

---

*Laatst bijgewerkt: juni 2026*
