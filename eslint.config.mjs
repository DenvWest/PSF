import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// A2/A5 deur-open-werk (docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md):
// service-role omzeilt RLS, dus tenant-isolatie hangt volledig af van of app-code
// het organization_id-filter niet vergeet. Nieuwe code moet via orgScoped()
// (src/lib/db/scoped.ts) — deze allowlist bevat exact de bestaande call-sites op
// createSupabaseAdmin() op het moment van dit besluit. Bestaande call-sites migreren
// we niet (dat betaalt pas bij een tweede tenant); nieuwe bestanden die hier niet op
// staan moeten orgScoped()/unscoped() gebruiken in plaats van createSupabaseAdmin()
// rechtstreeks te importeren.
const EXISTING_SUPABASE_ADMIN_CALLERS = [
  "src/lib/supabase-admin.ts",
  "src/lib/db/scoped.ts",
  "src/lib/db/entitlements.ts",
  "src/lib/org-resolver.ts",
  "src/lib/org-settings.ts",
  "src/lib/account-server.ts",
  "src/lib/account-dashboard.ts",
  "src/lib/account-priority-pref.ts",
  "src/lib/affiliate-analytics.ts",
  "src/lib/affiliate/db.ts",
  "src/lib/agenda-blocks.ts",
  "src/lib/connection-profile/store.ts",
  "src/lib/content/match-interventions.ts",
  "src/lib/content/plan-content.ts",
  "src/lib/content/themes.ts",
  "src/lib/cron-runs.ts",
  "src/lib/daily-action-log.ts",
  "src/lib/domain-goal.ts",
  "src/lib/events.ts",
  "src/lib/evidence-rag.ts",
  "src/lib/guide-nurture.ts",
  "src/lib/intake-baseline.ts",
  "src/lib/intake-marketing-continuity.ts",
  "src/lib/intake-reminder-cron.ts",
  "src/lib/intake-retention.ts",
  "src/lib/intake-session-resolve.ts",
  "src/lib/intake-session-server.ts",
  "src/lib/movement-recovery-context.ts",
  "src/lib/movement-session-log.ts",
  "src/lib/n8n-webhook.ts",
  "src/lib/nurture-cron.ts",
  "src/lib/nurture.ts",
  "src/lib/nutrition-log-server.ts",
  "src/lib/nutrition-relog-nurture.ts",
  "src/lib/partnerdesk/db.ts",
  "src/lib/recovery-token.ts",
  "src/lib/remeasure-reminder-cron.ts",
  "src/lib/supplement-verdict-producer.ts",
  "src/lib/supplement-verdict-store.ts",
  "src/app/account/wat-bij-jou-past/page.tsx",
  "src/app/rapport/\\[sid\\]/page.tsx",
  "src/app/api/account/agenda-blocks/\\[id\\]/route.ts",
  "src/app/api/account/agenda-blocks/route.ts",
  "src/app/api/account/claim-sessions/route.ts",
  "src/app/api/account/connection-profile/route.ts",
  "src/app/api/account/daily-log/route.ts",
  "src/app/api/account/domain-goal/route.ts",
  "src/app/api/account/favorites/route.ts",
  "src/app/api/account/login-eligibility/route.ts",
  "src/app/api/account/movement-log/route.ts",
  "src/app/api/account/movement-prefs/route.ts",
  "src/app/api/account/plan/route.ts",
  "src/app/api/account/priority-pref/route.ts",
  "src/app/api/account/remeasure/start/route.ts",
  "src/app/api/account/request-link/route.ts",
  "src/app/api/account/revoke/route.ts",
  "src/app/api/account/verify-code/route.ts",
  "src/app/api/account/verify/route.ts",
  "src/app/api/account/waitlist/route.ts",
  "src/app/api/admin/affiliate/route.ts",
  "src/app/api/admin/data/route.ts",
  "src/app/api/affiliate/click/route.ts",
  "src/app/api/consent/analytics/route.ts",
  "src/app/api/contact/route.ts",
  "src/app/api/gids/opt-in/route.ts",
  "src/app/api/intake/consent/route.ts",
  "src/app/api/intake/feedback/route.ts",
  "src/app/api/intake/movement-checkin/route.ts",
  "src/app/api/intake/nutrition-log/latest/route.ts",
  "src/app/api/intake/nutrition-log/route.ts",
  "src/app/api/intake/plan/route.ts",
  "src/app/api/intake/protein-target/route.ts",
  "src/app/api/intake/reminder/route.ts",
  "src/app/api/intake/session/route.ts",
  "src/app/api/intake/sleep-checkin/route.ts",
  "src/app/api/intake/stress-checkin/route.ts",
  "src/app/api/unsubscribe/route.ts",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase-admin",
              message:
                "Nieuwe code gebruikt orgScoped()/unscoped() uit @/lib/db/scoped in plaats van createSupabaseAdmin() rechtstreeks — dat maakt het organization_id-filter afdwingbaar. Zie A2 in docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md.",
            },
          ],
        },
      ],
    },
  },
  {
    files: EXISTING_SUPABASE_ADMIN_CALLERS,
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
