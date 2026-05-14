Je werkt aan PerfectSupplement (perfectsupplement.nl) — een data-gedreven gezondheidsplatform voor mannen 40+.

## Codebase context
- Next.js App Router, TypeScript strict, Tailwind CSS, Supabase, Resend
- Pad alias: @/ = src/
- Server components default — "use client" alleen bij interactiviteit
- Container component: `@/components/layout/Container` (max-w-7xl px-6 lg:px-8)
- Fonts: DM Sans (body), DM Serif Display (headings)
- Kleuren: primair groen #3C7A56 / #5A8F6A, hover #4A7F5A, achtergrond #F7F5F0
- Inline links: `font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]`
- Affiliate links: `target="_blank" rel="noopener noreferrer sponsored"`
- Interne links: nooit rel="nofollow"
- Arctic Blue links via Awin (sld=dennisvanwestbroek) — nooit vervangen

## Projectdocumenten (raadpleeg wat relevant is)
- pages-plan.md — masterlijst alle pagina's (status, SEO, prioriteit)
- page-blueprints.md — bouwspecificatie per paginatype (vergelijking, pillar, profiel, blog, kennisbank)
- content-map.md — spinnenweb: interne links + turbo-snippets bibliotheek
- PerfectSupplement_Systeemplan.md — intake, scoring, beslislogica
- database-schema.md — Supabase tabellen en RLS
- seo-content-strategie.md — structured data, content kanon

## Kwaliteitsregels
- TypeScript strict, geen `any`
- Geen console.log statements
- Geen placeholders of TODOs — alles volledig uitgeschreven
- Semantic HTML: article, section, nav, aside — niet alles in div
- Één h1 per pagina, logische h2→h3 hiërarchie
- next/image voor alle afbeeldingen (alt, width, height verplicht)
- Nederlandse UI strings, Engelse variabelen en functies
- Elke pagina: unieke title + meta description via Next.js metadata
- Elke pagina: minimaal één CTA naar /intake of vergelijkingspagina
- Geen comments tenzij echt noodzakelijk

## Vaste regels die je nooit overtreedt
- .env.local nooit aanraken
- src/app/intake/ nooit aanraken
- src/data/affiliate-links.ts nooit aanraken tenzij expliciet gevraagd
- src/lib/scoring.ts nooit aanraken
- globals.css nooit aanraken
- deploy.sh nooit aanraken
- Geen git commands uitvoeren

## Jouw taak
De taak en de bestanden die je moet aanpassen staan hieronder aangegeven vanuit het plan.
Pas alleen die bestanden aan — niets daarbuiten.

[output vanuit claude code staat gekopieerd in de prompt]

# Voorgestelde commit: git add -A && git commit -m "feat: [OMSCHRIJVING]"
Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
