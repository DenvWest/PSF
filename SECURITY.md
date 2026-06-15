# Security

Overzicht van bekende security-overwegingen en mitigaties voor PerfectSupplement.

## Rate limiting (productie)

API-routes zijn beschermd met sliding-window rate limiting. In productie op een VPS met PM2 cluster-mode is een gedeelde Redis-store **verplicht** — anders geldt de limiet per worker (effectief `limit × aantal workers`).

Configureer één van:

- **Upstash (aanbevolen):** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- **Self-hosted Redis:** `REDIS_URL` (`redis://` of `rediss://`)

Zonder Redis-config valt de app terug op in-memory limiting (alleen geschikt voor lokale dev) met een startup-waarschuwing in de logs.

Per-route limieten zijn configureerbaar via env vars (zie `.env.example`).

## Postcss advisory (GHSA-qx2v-qp2m-jg93)

**Status:** gemigreerd via npm `overrides` naar `postcss >= 8.5.10`.

Next.js 16 bundelt standaard `postcss@8.4.31` als nested dependency. De override forceert een gepatchte versie zolang Next.js upstream nog niet is bijgewerkt.

**Runtime-risico:** minimaal. Postcss wordt uitsluitend gebruikt tijdens build voor statische Tailwind-CSS-generatie — niet in runtime request-handling.

**Actie:** monitor Next.js releases voor een upstream postcss-patch; verwijder de override zodra Next.js een veilige versie meelevert.

## Overige audit-items (in orde)

- Geen hardcoded secrets; alles via `process.env`
- `.gitignore` dekt `.env`, `.env.*`, `.env.backup`
- Supabase RLS actief; admin-routes achter auth-gate
- Cron-routes beschermd via `CRON_SECRET`
