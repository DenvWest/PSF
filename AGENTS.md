# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PerfectSupplement is a Next.js 16 App Router application (TypeScript, Tailwind CSS 4, Supabase). No Docker or local database required — Supabase is cloud-hosted.

### Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (ESLint, zero warnings enforced) |
| Tests | `npm run test` (Vitest, 103 tests) |
| Build | `npm run build` |

### Environment

- `.env.local` is required for runtime features (intake flow, admin, contact form). See `.env.example` for variable list.
- The build succeeds without real Supabase credentials (placeholder fallbacks exist in the client).
- Set `CONTACT_SMTP_DISABLED=true` to bypass external email services in local dev.
- No `.nvmrc` — Node 18.18+ required; current environment has Node 22.

### Gotchas

- The proxy middleware (`src/proxy.ts`) runs on all routes — it handles admin auth and security headers. If the dev server returns unexpected 401s on `/admin`, ensure `ADMIN_SECRET` is set in `.env.local`.
- Affiliate link slug keys in `src/data/affiliate-links.ts` must match across `SupplementProduct`, `ChoiceRoute`, and `AffiliateLink` types — a mismatch causes a TypeScript build failure.
- `imageSrc` values in product data must exactly match filenames in `public/images/producten/` (case-sensitive).
- Rate limiting is in-memory (no Redis) — restarting the dev server resets all rate limit state.
