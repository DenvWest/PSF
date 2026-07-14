# CLAUDE.md — PerfectSupplement

## Wat dit project is

PerfectSupplement (perfectsupplement.nl) is een onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+. Focus: slaap, stress, energie, herstel. Positionering: "De Consumentenbond van supplementen" — objectief, wetenschappelijk onderbouwd.

**Monetisatie.** Huidig/live: externe affiliate links (Daisycon, Arctic Blue direct) op de vergelijkingspagina's. In opbouw (2026): eigen partnerbeheer (**PartnerDesk**) en een **eigen affiliate-programma** rondom Leefstijlcheck — zie "Interne platformen (2026)".

## Tech stack — wijzig niet zonder overleg

- Next.js 16 App Router, TypeScript strict
- Tailwind CSS (in JSX, geen aparte CSS behalve globals.css)
- Supabase (Postgres + RLS, geen Firebase)
- Hetzner VPS (Fedora, Nginx, systemd, Let's Encrypt)
- Resend voor transactionele e-mail
- Fonts: DM Sans (body) + DM Serif Display (headings)
- Pad alias: `@/` = `src/`

## Projectstructuur

```
src/
├── app/                    # Next.js App Router pagina's (NL routes, bijv. /supplementen/)
│   ├── intake/             # Intake flow (/intake)
│   ├── admin/              # Admin dashboard
│   ├── blog/               # Blog artikelen
│   ├── supplementen/       # Supplementgids pagina's (/supplementen/*)
│   └── ...
├── components/
│   ├── intake/             # IntakeIntro, IntakeQuestion, IntakeResults, etc.
│   ├── supplements/        # Vergelijkingspagina componenten (/beste-*)
│   ├── supplement-guides/  # Supplementgids componenten (/supplementen/*)
│   ├── supplement-hub/     # Hub-overzichtspagina componenten (/supplementen)
│   ├── layout/             # Header, Footer, Container
│   └── blog/               # Blog componenten
├── data/
│   ├── supplements/        # ComparisonPageData voor vergelijkingspagina's
│   ├── supplement-guides/  # SupplementData voor gidspagina's
│   ├── supplement-hub/     # Catalog data voor hub-overzicht
│   └── ...                 # Overige statische data (vragen, categorieën, affiliate-links)
├── lib/                    # Utility functies, Supabase client, scoring engine, nurture, rate-limit
├── proxy.ts                # Next.js proxy (admin auth, CSP, security headers)
└── types/                  # TypeScript types (supplement.ts, supplement-guide.ts, etc.)
```

### Naamconventie mappen

- **Data en componenten**: altijd Engelse mapnamen (`supplements/`, `supplement-guides/`, `supplement-hub/`)
- **Routes/URLs**: Nederlandse slugs waar user-facing (`/supplementen/`, `/beste/magnesium`)
- **Geen `src/service/`** — alle logica hoort in `src/lib/`
- **Geen losse bestanden in `src/`** behalve `proxy.ts` (Next.js 16 proxy conventie)

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
- Verifieer met `npx tsc --noEmit` + `vitest` + `eslint --max-warnings 0` (de pre-push hook draait tsc+vitest). Draai **NIET** `next build` of `rm -rf .next` terwijl `next dev` live is — dat crasht de dev-server; de productie-build draait op de server via `deploy.sh`.
- Draai `grep -rn "console.log" src/` voor elke commit — geen debug-logging in productie.
- `.env.local` NOOIT overschrijven of committen.
- Server-lockfile met `npx npm@10.8.2 install` genereren (server npm 10/node 20 vs lokaal npm 11/node 24; anders faalt `npm ci` op de server).
- Na env var wijzigingen op server: `sudo systemctl restart perfectsupplement`

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

Verder in gebruik: `accounts` + `account_entitlements` (account-login/premium), en twee interne tabelfamilies (zie "Interne platformen"): **`pd_*`** (PartnerDesk) en **`af_*`** (affiliate-programma). Die zijn **RLS deny-all** (geen policies) en uitsluitend server-side benaderbaar via `createSupabaseAdmin()` (service-role); nooit via de anon-client.

**Migraties**: SQL-bestand in `supabase/migrations/`, uitvoeren via de **Supabase Dashboard SQL Editor** — NOOIT `supabase db push` (de remote CLI-historie is leeg). `SUPABASE_SERVICE_ROLE_KEY` heeft een `sb_secret_`-waarde (niet de legacy `eyJ`-JWT).

Schema check: `npm run check:db-schema` (vereist `supabase link`).

## Live features (april 2026)

- Homepage met hero gericht op symptomen
- Intake flow op /intake: 5 fases, 15 vragen, scoring → Herstelplan
- Scoring engine: 6 domeinen, urgentieniveaus, profiellabels ("Lage Batterij", "Onrustige Slaper", etc.)
- Nurture e-mailsequence (dag 0-30, 6 templates via Resend)
- Admin op /admin = PartnerDesk-shell (partner-/affiliate-beheer + Vandaag-dashboard); het oude intake-dashboard staat onder /admin/site
- Vergelijkingspagina's: /beste/omega-3-supplement, /beste/magnesium, /beste/ashwagandha
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

## Meet-standaarden — altijd toepassen

- Bij elke nieuwe of geactiveerde CTA, knop, keuze-vertakking, opt-in of affiliate-link: bouw de meting mee in DEZELFDE wijziging.
- Drie lagen — kies wat past: `domain_events` (durable, PostHog + n8n) · GA4 `trackEvent` · Clarity `clarityTag`
- Nieuw client-event vereist registratie op drie plekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`
- Hergebruik bestaande event-types vóór je nieuwe verzint
- Geen PII in GA4/Clarity-payloads; geen dormant component activeren zonder meetpunt
- Meld bij elke afronding: "Meetpunt: <event(s)> — hier lees je het effect af."

## Interne platformen (2026)

Twee admin-only platformen onder `/admin`, los van de consumenten-site. Beide **mono-tenant**, service-role-only, en gebouwd in reviewbare "plakken". Details in `docs/plan/`.

- **PartnerDesk** (`pd_*`, `src/lib/partnerdesk/`, `src/components/partnerdesk/`) — beheer van *upstream* partnerrelaties (merchants/netwerken waar jij commissie van ontvangt): dossier, contracten, commissieregels + resolutie, contacten, tijdlijn, taken, signalen (Vandaag-dashboard), ⌘K. Fase 1 compleet. Zie `PRODUCTVISIE_AFFILIATE_PLATFORM.md` + `PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md`.
- **Affiliate-programma** (`af_*`, `src/lib/affiliate/`, route `/admin/programma`) — je *eigen* affiliate-programma (*downstream*: partners die Leefstijlcheck promoten en die jíj uitbetaalt). Append-only grootboek in centen, attributie via `psf_aff_ref`-cookie (lead=intake, sale=premium), commissie-resolutie, handmatige uitbetaling + `af_financial_events`-outbox (n8n/boekhouding later). App-first; n8n/Daisycon zijn optionele, uitgestelde adapters. Zie `ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md` + `PLAN_FASE3A_AFFILIATE_KERN.md`.

De drie betekenissen van "affiliate" niet verwarren: `affiliate_clicks` (uitgaande merchant-kliks, NIET aanraken) ≠ `pd_partners` (upstream) ≠ `af_affiliates` (eigen programma).

## Server

- SSH: `root@178.104.75.207`
- App dir: `/root/perfectsupplement`
- Deploy: `bash deploy.sh` (vereist schone working tree → push → ssh → git pull + npm ci + build + `sudo systemctl restart perfectsupplement`)
- Env: `/root/perfectsupplement/.env`

## Schrijfstem

- Herkennings-copy, nurture-mails, profielpagina's: volg `docs/core/WRITING_VOICE.md` (begrip → urgentie → actie, geen diagnose-taal)

## Communicatie

- Antwoord in het Nederlands, code in het Engels
- Direct en concreet — geen onnodige inleidingen
- Werkende code, geen pseudo-code
- Bij keuzes: geef je aanbeveling met onderbouwing, niet 5 opties zonder mening

## UX-beslissingen (juni 2026)

- /inzichten staat in top-nav als 3e item (na Supplementen, vóór Gidsen)
- PersonalPathBridge verwijderd uit InzichtenHubHero (doublure met ContextStrip)
- FocusAreaCard: 1 link per kaart (gids-link geschrapt)
- Dashboard SignalsSection: "Lees over →" per kaart vervangen door 1 sectie-footer naar /inzichten
- InzichtenContextStrip (hub-variant): 1 CTA (feed), "Open dashboard →" verwijderd
