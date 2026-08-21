## Cursor Cloud specific instructions

### Services

This is a single Next.js 16 App Router application. No external services (databases, Redis, etc.) are required to run the dev server — Supabase and Redis are remote services accessed via env vars.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm ci` |
| Dev server | `npm run dev` (port 3000, uses `--webpack` flag) |
| Lint | `npm run lint` (eslint `--max-warnings 0`) |
| Typecheck | `npx tsc --noEmit` |
| Tests | `npm test` (`vitest run`) |

### Environment variables

Copy `.env.example` to `.env.local`. Set `CONTACT_SMTP_DISABLED=true` for local dev. The app runs without real Supabase/Resend credentials — pages render fine with placeholder values, but API routes that touch Supabase will fail.

### Git hooks

The repo uses `.githooks/` (configured via `npm prepare`). Pre-commit runs `tsc --noEmit` and checks for `console.log` in `src/`. Pre-push runs `tsc --noEmit` + `vitest run`.

### Gotchas

- **Do NOT run `next build` or `rm -rf .next` while `next dev` is running** — it crashes the dev server.
- The lockfile is `package-lock.json` (npm). Do not use pnpm/yarn.
- ESLint has 5 pre-existing warnings in `DomainLifestyleLadder.tsx`, `SleepCheckin.tsx`, and `sleep-checkin-parse.ts`. These are not regressions.
- Server deployment uses `npm@10.8.2` / Node 20; the lockfile must stay compatible. See `CLAUDE.md` for details.
