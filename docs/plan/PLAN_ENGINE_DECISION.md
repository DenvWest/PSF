# Beslissing: PLAN-engine vs legacy `getAdvice`

> **Status:** vastgelegd (juni 2026). Geen productie-code in dit document — alleen richting voor migratie.

## Probleem

Er lopen twee advies-paden naast elkaar:

| Engine | Entry | Claim-bron | Productie-callers |
|--------|-------|------------|-------------------|
| **Legacy** | `getAdvice()` in `src/lib/intake-engine.ts` | Inline `reason`-strings in TypeScript | `IntakeResults`, nurture-dispatch |
| **PLAN (DB)** | `getPlanContent()` in `src/lib/content/plan-content.ts` | `evidence_claims` (status `published`) + tier-governance via `getVisibleTiers` | Geen UI-caller; wel `themeHasCompletePlanContent` in nurture-cron / nurture-interventions |

Gedeelde laag: `getInterventionsForTheme()` in `match-interventions.ts` (DB-match + fallback supplement-routes).

Zolang beide live blijven voor hetzelfde supplement op hetzelfde scherm, divergeren claims en compliance (principe 1 + 4).

## Beslissing

**`getPlanContent` is de opvolger** voor stepped-care / tier-advies in PLAN en toekomstige HERSTEL-plan-UI.

**`getAdvice` blijft tijdelijk** voor de huidige HERSTEL-kaart (quick wins, long term, ranked supplements) tot die UI is herschreven.

**Niet doen:** beide engines parallel hetzelfde supplement tonen met verschillende claim-teksten.

## Gates vóór PLAN live

1. **B1 — default-org `maxTier`:** migratie `20260604120000_default_org_max_tier.sql` op Supabase (prod/staging). Verificatie:
   ```sql
   SELECT id, settings->'maxTier' AS max_tier
   FROM organizations
   WHERE id = '00000000-0000-0000-0000-000000000001';
   ```
   Verwacht: `3`. Zonder dit worden tier-3 supplementen stil gefilterd (revenue A0).
2. **B3 — fallback default-dicht:** `getPlanContent` bij `!ready` retourneert geen supplement-actions (geen claim uit `description` / route-`reason`).

## Migratiepad (gefaseerd)

1. **PLAN-scherm** — lifestyle-plan UI rendert `getPlanContent().actions` (tier-filter via `getVisibleTiers`).
2. **IntakeResults** — `getAdvice().supplements` geleidelijk afbouwen; quickWins/longTerm tijdelijk laten of naar DB `free_action`-interventies.
3. **Nurture** — supplement-copy uit `evidence_claims` / `nurtureInterventionHighlight`; geen inline `getAdvice`-reasons voor plan-highlights (plan-ready pad doet dit al via DB-buckets).
4. **`getAdvice` deprecaten** — wanneer geen caller meer supplement-claims rendert; behoud alleen logica die niet in `interventions` past.

## Wat bewust uitgesteld blijft

- B2B admin-UI voor `organizations.settings.maxTier`
- Tier 4/5-content zolang geen tenant ze nodig heeft
- Caching van `getVisibleTiers` (zie `LEEFSTIJLPLAN_HANDBOOK.md` §8)

## Referenties

- [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) — tier- en claim-eisen
- [`plan-content.ts`](../../src/lib/content/plan-content.ts) — PLAN-ready + fallback
- [`org-settings.ts`](../../src/lib/org-settings.ts) — `maxTier` trap-hoogte
