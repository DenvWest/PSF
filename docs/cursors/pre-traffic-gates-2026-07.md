# Pre-traffic gates — juli 2026

> Single source of truth voor gates vóór het sturen van publiek verkeer.  
> **Datum:** 16 juli 2026

---

## Gate-overzicht

| Gate | Status | Bewijs |
|---|---|---|
| Engine 1.4.0 op productie | ✅ | Post-deploy intake met `rules_version = 1.4.0` in `intake_sessions` |
| Waitlist-migratie prod (`20260704120000`) | ✅ | `premium_waitlist_feature_check` incl. `premium-coaching`; kolom `price_indication` |
| Intake funnel-events deployed | ✅ | `b76d7ed` — `intake.started`, `intake.phase_completed` |
| Delta-gating hermeting | ✅ | `85ec76f` — `buildDeltaReport` rules_version-bewust |
| Item-analyse baseline | ✅ | `docs/research/ITEM_ANALYSE_BASELINE.md` — N=2 (1.3.1 + 1.4.0) |
| Cookie-consent pre-deploy checklist | ✅ | `docs/cursors/cookie-consent-pre-deploy-checklist.md` — 10/10 prod |
| GA4 account hardening | ✅ | `docs/cursors/ga4-account-hardening-checklist.md` — land NL, delen uit, retentie 14m |

---

## Consent-bias

- Durable client-events via `/api/intake/events` en `/api/account/events` worden **niet geïnsert** zonder analytics-consent (200, silent drop).
- GA4 en Clarity laden alleen na expliciete toestemming.
- Funnel-ratio's (`intake.started` → `phase_completed` → `intake.completed`) zijn alleen betrouwbaar **binnen het consented cohort**.
- Vergelijk GA4-totalen niet 1:1 met `domain_events`-totalen — label rapporten altijd als consented-only waar van toepassing.

---

## Bewust uitgesteld (geen blocker voor verkeer)

| Item | Reden |
|---|---|
| `rules_version` op check-in write-paths (B5) | Geen dataverlies; week 2 na eerste traffic |
| Preview → waitlist CTA (DomainDeepTool) | Conversie-optimalisatie; pas met funnel-data |
| S4 / S6 (vraagset + check-in gate) | Tweede methodiek-bump op lage N |
| Stripe / live checkout | Geen premium-vraag bewezen; waitlist meet intentie |
| Drempel-tuning urgentie/items | Pas bij N ≥ 100 per `rules_version`-generatie |
| PostHog / n8n push-pipeline | `domain_events` is bron; pull-based later |

---

## Week-0 na verkeer

1. SQL S1–S6 uit `docs/cursors/monthly-strategy-review.md` (handmatig, wekelijks zolang N &lt; 100)
2. PostHog/`domain_events`: funnel per fase (consented cohort)
3. GA4: `quiz_gestart`, `intake_phase_completed`, `quiz_voltooid`
4. `npm run analyse:items` opnieuw bij cumulatief ~50 nieuwe voltooide sessies
