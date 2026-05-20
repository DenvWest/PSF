# ARCHITECTURE — PerfectSupplement

> **Layer 1 — Core.** Dit document is de source of truth voor stack, structuur en infrastructure.

---

## Stack

- **Framework:** Next.js 16 App Router, TypeScript strict
- **Styling:** Tailwind CSS (in JSX, geen aparte CSS behalve `globals.css`)
- **Database:** Supabase (Postgres + RLS)
- **Hosting:** Hetzner VPS (Fedora), Nginx reverse proxy, PM2, Let's Encrypt
- **E-mail:** Resend (nurture sequence + reminders)
- **Fonts:** DM Sans (body) + DM Serif Display (headings)
- **Pad alias:** `@/` = `src/`
- **IDE:** Cursor (primary, Agents/Composer), VS Code + Claude Code
- **Repo:** `DenvWest/PSF` op GitHub, `main` branch

## Stack keuzes (en waarom)

| Keuze | Waarom | Niet gekozen |
|---|---|---|
| Supabase | Relationeel, SQL voor intake-analyse, geen vendor lock-in | Firebase (NoSQL past niet), SQLite (niet schaalbaar) |
| Hetzner VPS | Volledige controle, vaste prijs (€4,50/mnd), cron via server/extern | Vercel (geen cron controle, duurder) |
| Resend | Gratis tier 3000/mnd, React email templates, simpele API | Mailgun, SendGrid |
| In-memory rate limiter | Sliding window, geen Redis dependency voor MVP | Redis (overkill) |
| PM2 | Stabiel, auto-restart, log management | — |
| Geen account-systeem | Drempel te hoog voor MVP, e-mail is genoeg | Auth0, Clerk |
| Scoring in frontend | Directe feedback, geen server roundtrip | Server-side scoring |

## Projectstructuur

```
psf/
├── src/
│   ├── app/                         # Next.js App Router pagina's
│   │   ├── intake/                  # Intake flow (/intake)
│   │   ├── blog/                    # Blog artikelen
│   │   ├── profiel/                 # Profielpagina's (+ [slug] dynamisch)
│   │   ├── beste/[supplement]/      # Vergelijkingspagina's (/beste/magnesium, etc.)
│   │   ├── supplementen/[supplement]/ # Supplementgidsen (/supplementen/omega-3)
│   │   ├── gids/[thema]/            # Thema-gidsen
│   │   ├── thema/[thema]/           # Thema-hubs
│   │   ├── kennisbank/[slug]/       # Kennisbank begrippen
│   │   ├── admin/                   # Admin dashboard
│   │   └── api/                     # API routes (intake, cron, partner, affiliate)
│   ├── components/
│   │   ├── intake/                  # IntakeIntro, IntakeQuestion, IntakeResults
│   │   ├── supplements/             # ComparisonTable, ProductCard, etc.
│   │   ├── supplement-guides/       # Gidspagina componenten
│   │   ├── supplement-hub/          # Hub-overzicht componenten
│   │   ├── layout/                  # Header, Footer, Container, Breadcrumbs
│   │   ├── blog/                    # Blog componenten
│   │   ├── homepage/                # Hero, trust, lifestyle secties
│   │   ├── gids/                    # Gids opt-in formulieren
│   │   ├── kennisbank/              # Kennisbank hub en term-pagina's
│   │   ├── content/                 # Article TOC, body chrome, affiliate inline
│   │   ├── compliance/              # Ashwagandha on-hold disclaimer, etc.
│   │   ├── references/              # RefNote, ReferenceList
│   │   ├── common/                  # MedicalDisclaimer
│   │   ├── privacy/                 # Privacy consent revoke
│   │   └── ui/                      # ContentSection, RelatedPages, Disclosure
│   ├── config/                      # Org config, theme tokens, partners (Tier 2 scaffold)
│   ├── data/                        # Statische data
│   │   ├── supplements/             # Vergelijkingsdata (ComparisonPageData) — actieve mapnaam
│   │   ├── supplement-guides/       # Gidsdata (SupplementData)
│   │   ├── supplement-hub/          # Hub catalog data
│   │   ├── profiles/                # Profieldata per slug
│   │   ├── blog/                    # Blog artikeldata
│   │   ├── gids/                    # Thema-gids content (slaap, stress, etc.)
│   │   ├── thema/                   # Thema-hub content
│   │   ├── page-content/            # Landingspagina copy (omega-3-vergelijken, etc.)
│   │   ├── references/              # Bronverwijzingen per pagina
│   │   ├── affiliate-links.ts       # Affiliate URL's
│   │   └── supplement-routes.ts     # Supplement routing triggers
│   ├── lib/                         # Utility functies en businesslogica
│   │   ├── intake-engine.ts         # Scoring + profiellabels
│   │   ├── intake-strategy.ts       # Form/chat intake strategy wrapper
│   │   ├── comparison-paths.ts      # Canonieke /beste/* paden (SSOT)
│   │   ├── build-recommendations.ts # Hub-aanbevelingen uit intake-sessie
│   │   ├── chat-intake.ts           # Conversational intake state machine
│   │   ├── api-middleware.ts        # public/internal/partner API auth
│   │   ├── __tests__/               # Vitest unit tests
│   │   ├── seo/                     # JSON-LD helpers
│   │   ├── email-templates/         # Nurture e-mail templates
│   │   ├── rate-limit.ts            # Rate limiter
│   │   ├── rate-limit-config.ts     # Per-route limits
│   │   ├── cron-auth.ts             # Cron HMAC verificatie
│   │   └── supabase*.ts             # Supabase clients
│   ├── proxy.ts                     # Next.js proxy (admin auth, CSP, security headers)
│   └── types/                       # TypeScript types
│       ├── supplement.ts
│       ├── supplement-guide.ts
│       └── ...
├── public/
│   ├── images/producten/            # Product images (Merk-Product.jpg)
│   └── downloads/                   # PDF gidsen
├── docs/                            # Documentatiesysteem (core/ = source of truth)
└── db/                              # Database migraties
```

## Key file locations

| Wat | Waar |
|---|---|
| Vergelijkingspagina route | `src/app/beste/[supplement]/page.tsx` |
| Supplementgids route | `src/app/supplementen/[supplement]/page.tsx` |
| Supplement components | `src/components/supplements/` |
| Vergelijkingsdata | `src/data/supplements/` (roadmap noemt `supplement-comparisons/` — rename niet uitgevoerd) |
| Canonieke /beste/* paden | `src/lib/comparison-paths.ts` |
| Gidsdata | `src/data/supplement-guides/` |
| Profieldata | `src/data/profiles/` |
| Supplement types | `src/types/supplement.ts`, `src/types/supplement-guide.ts` |
| Affiliate links | `src/data/affiliate-links.ts` |
| Supplement routes | `src/data/supplement-routes.ts` |
| Product images | `public/images/producten/` |
| Intake components | `src/components/intake/` |
| Layout (Container) | `src/components/layout/Container` (default export, `max-w-7xl px-6 lg:px-8`) |
| Scoring engine | `src/lib/intake-engine.ts` |
| Rate limiter | `src/lib/rate-limit.ts` + `src/lib/rate-limit-config.ts` |
| IP detection | `src/lib/client-ip.ts` (cf-connecting-ip → x-forwarded-for → x-real-ip) |
| Legacy URL redirects | `next.config.ts` (flat `/beste-*` → `/beste/[slug]`) |

### Vergelijkings- vs gids-slugs

| Paginatype | Voorbeeld slug | URL |
|---|---|---|
| Supplementgids | `omega-3` | `/supplementen/omega-3` |
| Vergelijking | `omega-3-supplement` | `/beste/omega-3-supplement` |

Bewuste split: gids-slugs zijn kort; vergelijking-slugs volgen SEO/tracking-history (`omega-3-supplement`).
Affiliate sub-IDs in `affiliate-links.ts` (`ws=omega-3-supplement`) blijven gekoppeld aan vergelijking-slug.

`docs/PROJECT_STATE.md` is auto-gegenereerd (`scripts/generate-state.mjs`) en kan slug-keys tonen die afwijken van de runtime keys in `src/data/supplements/index.ts`.

### Partner API keys

`PARTNER_API_KEYS` in `.env`: `secret:org-uuid` per partner, of legacy `secret` (alleen key) → default org via `getDefaultOrganizationId()`. De `x-org-id` header wordt op partner-routes **niet** vertrouwd; org komt uit de key-mapping.

## Server

| Veld | Waarde |
|---|---|
| SSH | `root@178.104.75.207` |
| App dir | `/root/perfectsupplement` |
| Deploy script | `/root/deploy.sh` |
| Lokaal | `~/psf` |
| Env file | `/root/perfectsupplement/.env` |
| PM2 process | `perfectsupplement` op port 3000 |
| Na env wijzigingen | `pm2 restart perfectsupplement --update-env` |
| Rate limit whitelist | `RATE_LIMIT_WHITELIST` env var |

## Deploy workflow

```
Lokaal:  git add -A && git commit -m "..." → npm run build (verify) → git push
Server:  bash deploy.sh (= git pull → npm ci → npm run build → pm2 restart)
```

Server heeft alleen pull rights, nooit push. Nginx sets `proxy_set_header` correct voor IP detection.

## Externe services

| Service | Doel | Config |
|---|---|---|
| cron-job.org | Nurture emails + 30-dagen reminders | Externe trigger, geen server-side cron |
| Supabase | Database + RLS | Anon key + service_role key (admin) |
| Resend | Transactionele e-mail | API key in `.env` |
| Daisycon | Affiliate netwerk (account 408175) | Vitaminstore, VitalNutrition |
| Arctic Blue | Direct affiliate via Awin | `sld=dennisvanwestbroek` |

---

*Laatst bijgewerkt: mei 2026*
