# CLAUDE.md — PerfectSupplement

## Wat dit project is

PerfectSupplement (perfectsupplement.nl) is een onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+. Focus: slaap, stress, energie, herstel. Monetisatie via affiliate links (Daisycon, Arctic Blue direct). Positionering: "De Consumentenbond van supplementen" — objectief, wetenschappelijk onderbouwd.

## Tech stack — wijzig niet zonder overleg

- Next.js 16 App Router, TypeScript strict
- Tailwind CSS (in JSX, geen aparte CSS behalve globals.css)
- Supabase (Postgres + RLS, geen Firebase)
- Hetzner VPS (Fedora, Nginx, PM2, Let's Encrypt)
- Resend voor transactionele e-mail
- Fonts: DM Sans (body) + DM Serif Display (headings)
- Pad alias: `@/` = `src/`

## Projectstructuur

```
src/
├── app/            # Next.js App Router pagina's
│   ├── intake/     # Intake flow (/intake)
│   ├── admin/      # Admin dashboard
│   ├── blog/       # Blog artikelen
│   └── ...
├── components/
│   ├── intake/     # IntakeIntro, IntakeQuestion, IntakeResults, etc.
│   ├── supplements/# Supplement vergelijkingspagina componenten
│   ├── layout/     # Header, Footer, Container
│   └── blog/       # Blog componenten
├── data/           # Statische data (vragen, categorieën, supplementen, affiliate-links)
├── lib/            # Utility functies, Supabase client, scoring engine, nurture, rate-limit
└── types/          # TypeScript types (supplement.ts, etc.)
```

## Code conventies

- TypeScript strict, geen `any`
- Imports altijd via `@/` (niet relatief)
- Componenten: PascalCase, bestandsnaam = componentnaam
- Data in `src/data/`, logica in `src/lib/`, componenten in `src/components/`
- Server components default, `"use client"` alleen waar nodig
- Nederlandse UI strings, Engelse variabelen en functies
- Semantic HTML: gebruik `<article>`, `<section>`, `<nav>`, `<aside>`, `<main>` — niet alles in `<div>`
- Tailwind classes in JSX, geen inline styles, geen aparte CSS bestanden
- Geen onnodige comments in code
- Layout: gebruik `max-w-7xl px-6 lg:px-8` via de `Container` component (niet `max-w-4xl`)

## Belangrijke regels — LEES DIT

### Git & deploy
- **NOOIT automatisch committen.** Stop altijd na aanpassingen zodat Dennis kan reviewen.
- Draai `npm run build` voordat je klaar bent — build errors moeten opgelost zijn.
- Draai `grep -rn "console.log" src/` voor elke commit — geen debug-logging in productie.
- `.env.local` NOOIT overschrijven of committen.
- Na env var wijzigingen op server: `pm2 restart perfectsupplement --update-env`

### Affiliate links
- Daisycon: voor Vitaminstore.nl en VitalNutrition.nl
- Arctic Blue: eigen affiliate mechanisme (`sld=dennisvanwestbroek`) — NIET vervangen door Daisycon links
- Sub ID format: bijv. `ashwagandha-vergelijking`
- Affiliate links: `rel="nofollow sponsored"`, `target="_blank"`
- Affiliate links NOOIT in blogposts — alleen op vergelijkingspagina's
- Affiliate slug keys in `src/data/affiliate-links.ts` moeten matchen in `SupplementProduct`, `ChoiceRoute`, en `AffiliateLink` — mismatch = TypeScript build failure

### Images & data
- `imageSrc` waarden moeten exact matchen met filenames in `public/images/producten/` (case-sensitive)
- Naamconventie: `Merk-Product.jpg` (geen spaties, geen speciale tekens)

### Overig
- Geen localStorage — alles via Supabase
- Geen medische claims — "adviezen, geen diagnoses"
- Test op mobiel (375px) — doelgroep gebruikt vaak telefoon
- Affiliate links zijn de monetisatie — houd ze altijd intact

## Database (Supabase)

Tabellen:
- `intake_sessions`: id, created_at, symptom_profile, answers (jsonb), domain_scores (jsonb), urgency_level, profile_label, age_range, marketing_email, organization_id
- `intake_reminders`: id, created_at, email, reminder_date, sent
- `intake_feedback`: id, session_id, rating, comment
- `nurture_emails`: nurture e-mailsequence tracking
- `affiliate_clicks`: bestaande tabel, NIET aanraken

RLS is aan. Anon kan inserts doen op sessions, reminders en feedback.

## Live features (april 2026)

- Homepage met hero gericht op symptomen
- Intake flow op /intake: 5 fases, 12 vragen, scoring → Herstelplan
- Scoring engine: 6 domeinen, urgentieniveaus, profiellabels ("Lage Batterij", "Onrustige Slaper", etc.)
- Nurture e-mailsequence (dag 0-30, 6 templates via Resend)
- Admin dashboard op /admin
- Vergelijkingspagina's: /beste-omega-3-supplement, /beste-magnesium, /beste-ashwagandha
- Rate limiter (in-memory sliding window)
- AVG/GDPR compliance
- Blog met artikelen per categorie

## SEO standaarden — altijd toepassen

- Elke pagina: unieke `<title>` + `<meta name="description">` via Next.js metadata
- Heading-hiërarchie: één `<h1>`, logische `<h2>`→`<h3>` structuur
- Inhoudsopgave met anchor links bij artikelen >800 woorden
- Interne links: elke pagina linkt naar minimaal 2 gerelateerde pagina's
- Structured data (JSON-LD): Product schema op vergelijkingspagina's, Article op blogposts, FAQ waar relevant
- Afbeeldingen: alt-tekst, width/height, `next/image` met lazy loading
- Canonical URLs op alle pagina's
- Follow intern, `nofollow sponsored` op affiliate links

## Conversie standaarden — altijd toepassen

- Elke pagina heeft minimaal één CTA naar /intake of een vergelijkingspagina
- Turbo-snippet boven interne link-blokken: 1-2 zinnen die triggeren om door te klikken
- Gedragsbeïnvloedende copy: herkenning → validatie → mechanisme → actie → bewijs

## Server

- SSH: `root@178.104.75.207`
- App dir: `/root/perfectsupplement`
- Deploy: `bash deploy.sh` (git pull + npm ci + build + pm2 restart)
- Env: `/root/perfectsupplement/.env`

## Communicatie

- Antwoord in het Nederlands, code in het Engels
- Direct en concreet — geen onnodige inleidingen
- Werkende code, geen pseudo-code
- Bij keuzes: geef je aanbeveling met onderbouwing, niet 5 opties zonder mening
