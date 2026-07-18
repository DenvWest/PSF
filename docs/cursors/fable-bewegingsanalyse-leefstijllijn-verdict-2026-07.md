# Verdict — Analyse-SSOT × leefstijllijn: REFINE (juli 2026)

**Type:** Opus architectuur-/productverdict (REFINE). Geen implementatie — brondocument voor handoffs.
**Prompt:** [`fable-bewegingsanalyse-leefstijllijn-2026-07.md`](fable-bewegingsanalyse-leefstijllijn-2026-07.md)
**Status:** ontwerp REFINE · pre-traffic-slices gedefinieerd · agenda-locks onaangetast · vastgelegd 18 jul 2026
**Regels:** één scoringswaarheid · readouts nooit slot · geen scores in reminder/ICS · sensor nooit in checklist-body · nooit automatisch committen.

---

## 1. Executive summary + bindend verdict

**Verdict: REFINE** — de Analyse-SSOT-richting is correct en de kiem is live; het eindbeeld vereist een **TrendPoint-model met timestamps**, expliciete **bron-labels**, en **copy-rename naar Bewegingsanalyse** op de analyse-shell — zonder routes/templates/API-idents te wijzigen.

Het langetermijn-gat is concreet: agenda (gelockt) kiest domein + stap, maar **prioriteit en domein-deep UI missen een bindend longitudinaal contract** — vandaag is `model.trend` een `number[]` zonder datum-as (`account-dashboard.ts:467-469`), baseline = `trend[0]` (`leefstijllijn.ts:21`), en BewegingScreen mengelt analyse-hero met een volle voeding/supplement-sectie (`BewegingScreen.tsx:314-481`).

| Tegenstelling | Oplossing via Analyse-SSOT |
|---|---|
| (a) Half-advies op bewegen | Analyse-shell hero = score + leefstijllijn + check-in; actie secundair |
| (b) Plan-als-hero | Plan-footer blijft onderaan; geen checklist boven de lijn |
| (c) Agenda zonder meetbare lijn | Leefstijllijn voedt prioriteit + Agenda-tab-teaser (geen tweede score) |

**Fit gratis Kompas vóór betaald:** meetbare lijn + check-in-retentie verdiepen het gratis dashboard zonder Stripe, lp_* of OAuth — exact de pre-traffic-ladder.

---

## 2. Hypothese-oordelen H1–H6

| # | Oordeel | Bewijs |
|---|---|---|
| **H1 Naming** | **BEVESTIGD, AANGESCHERPT** | UI-labels → **Bewegingsanalyse** / **Jouw lijn** / **Stappenplan** (actie-footer). Routes `/intake/plan/movement`, idents `movementPlanTemplate`, template-title `"Bewegingsplan na 40"` (`movement.ts:8`) blijven stabiel. §5.1-lock (`DOMAIN_MODEL.md:162`) is **verouderd** — copy-rename, geen API-rename. |
| **H2 Leefstijllijn = levenslijn** | **BEVESTIGD** | `buildLeefstijllijnRows` (`leefstijllijn.ts:16-36`) is kiem: baseline=`trend[0]`, delta bij ≥2 punten. Ontbreekt: `TrendPoint{value,ts,source}`, resoluties dag/week/maand, begin/eind-ankers, RULES_VERSION-annotatie. |
| **H3 Anti half-advies** | **BEVESTIGD, AANGESCHERPT** | BewegingScreen is analyse-first (gauge r.214-253, leefstijllijn r.255-260, check-in r.262-312) maar voeding+supplement (r.314-481) concurreert visueel — demote naar collapsible of verplaats onder evidence-laag (P1). |
| **H4 Signaalpijp** | **BEVESTIGD** | `WearableSignalSnapshot` comment analyse-only (`wearable-signals.ts:1-3`); API 503 (`wearable/snapshot/route.ts:7-15`). Snapshot verrijkt trend/context, injecteert niet in PlanStep-body. |
| **H5 Agenda-contract** | **BEVESTIGD** | Prioriteit bepaalt domein-slot; pool via `selectVisibleSteps` (`lifestyle-plan-eval.ts:79-87`). Analyse mag geen tweede "doe dit"-waarheid. Bouw-agenda DEFER (agenda-verdict §1). |
| **H6 Blauwdruk-uitrol** | **BEVESTIGD** | Beweging = eerste analyse-shell; siblings hergebruiken shell. Verbinding = quickWin-only (`PILLAR.verbinding.quickWin`). Geen check-in-route voor verbinding (`PILLAR_CHECKIN_ROUTES`, `dashboard/index.ts:292-297`). |

---

## 3. Laag-contracten

### Tekstdiagram

```
[signaalbronnen] intake · hermeting · intake_domain_checkin · intake_nutrition_log · (horizon) WearableSnapshot · AI-bril
        │
        ▼
[ANALYSE-SSOT]  scores 0–100 ──► leefstijllijn (TrendPoint[] + bron + resolutie)
        │                              │
        ├──────────────────────────────┼──► Voortgang-hub / domein-deep (score·lijn·delta·label)
        │                              │
        └─ prioriteit-context ────────┘──► Agenda (domein-keuze alleen; DEFER MVP)
        
[PLAN] LifestylePlanTemplate + selectVisibleSteps ──pool──► Agenda (stap-keuze; refine ongewijzigd)
```

### Contract 1 — Analyse → Domein-deep / Voortgang

**Mag tonen:** `currentScore`, sparkline/trend, `baselineScore`, `delta`, resolutie-switch (dag/week/maand zodra beschikbaar), bron-label ("intake" | "check-in" | "nutrition_log" | "wearable" | "self_report"), RULES_VERSION-waarschuwing bij delta over grens.

**Mag niet:** advies-stappen als hero, supplement-CTA boven de lijn, "live gemeten", parallelle 0–100-score uit minuten/sensoren.

**Interface (woorden):** `LeefstijllijnRow` uitbreiden naar `{ … trendPoints: TrendPoint[], resolution: 'day'|'week'|'month', sourceLabel }` — UI consumeert via `buildLeefstijllijnRows`, geen eigen merge.

### Contract 2 — Analyse → Prioriteit / Agenda-domein-keuze

**Export:** gewogen domein-prioriteit + optionele contextstrings (geen PII, geen scores in ICS).

**Mag:** `"beweging"` als hoogste prioriteit vandaag op basis van laagste trend-delta of laagste absolute score.

**Mag niet:** `step_id`, PlanStep-body, sensor-raw, profiellabel in reminder.

Agenda-tab-precursor (§0b agenda-verdict): weekpreview toont **completie-streak** + teaser "Jouw lijn beweegt" — link naar Voortgang, geen hero-gauge op Agenda-tab.

### Contract 3 — Plan → Agenda-stap-keuze

**Ongewijzigd** t.o.v. refine-verdict: `selectVisibleSteps(phase, ctx)` → candidate-pool; swap binnen domein; bucket in prefs; completie = `daily_action_log`.

**Expliciet:** één scoringswaarheid — agenda houdt geen parallelle score bij.

---

## 4. Leefstijllijn target-model + gap-tabel

### Target-model

| Element | Definitie |
|---|---|
| **Punt** | `TrendPoint { value: number; ts: number; source: TrendSource; rulesVersion?: string }` |
| **Begin-anker** | Eerste intake-sessie of eerste domein-check-in (per pillar) |
| **Eind-anker** | Laatste punt of hermeting (+30d) |
| **Resoluties** | Dag = ruwe punten; week = bucket-max/last per ISO-week; maand = idem — **alleen waar punten bestaan** |
| **Bron-label** | UI: "op basis van je laatste check-in" / "op basis van je intake" — nooit "live gemeten" |
| **Readouts** | energie/herstel: delta/drivers op hermeting-rapport — **geen** leefstijllijn-rij (`domain-role.ts:9-23`) |

### Wat code vandaag wél/niet kan

| Capability | Status | Bewijs |
|---|---|---|
| 5 interventie-rijen | ✅ | `buildLeefstijllijnRows` filtert op `isInterventionDomain` |
| Merge intake + check-in + nutrition | ✅ | `account-dashboard.ts:413-458` |
| Baseline + delta | ✅ | `leefstijllijn.ts:21-23` |
| Timestamps in trend[] | ❌ | `slice(-6).map(point => point.value)` gooit `ts` weg (`account-dashboard.ts:467-469`) |
| Multi-resolutie | ❌ | Geen week/month rollup |
| Bron per punt | ❌ | Merge verliest source-label |
| Verbinding check-in | ❌ | Geen route in `PILLAR_CHECKIN_ROUTES` |

### Gap-tabel (geen fake interpolatie)

| Gap | Impact | Oplossing |
|---|---|---|
| `CheckTrend` = `number[]` | Geen week-view op scores | Intern `TrendPoint[]` in dashboard build; UI krijgt beide waar nodig |
| ts discarded | Evidence kan wel week-view vóór score-resolutie (P1) | Aparte gedragsreeks; score-reeks wacht op punten |
| Voeding via nutrition_log, rest via check-in | Bron-asymmetrie | Label per punt; geen productgat — doc-sync `ACCOUNT_DASHBOARD_SYSTEM.md:71` (F3b-deel-2 is live in code) |
| Verbinding geen check-in | Trend = intake-only | Acceptabel; geen leefstijllijn-check-in tot productbesluit |
| RULES_VERSION | Delta over grens | Annotatie in UI (`DOMAIN_MODEL.md §7`) |

---

## 5. Domein-scorecard

| Domein | Analyse-hooks | Plan-rijpheid | Check-in | Leefstijllijn-ready | Fase |
|---|---|---|---|---|---|
| **Beweging** | Gauge, leefstijllijn, check-in (`BewegingScreen.tsx`) | `movementPlanTemplate` v1.4 | `/intake/beweging` | kiem ✅ | **Blauwdruk nu** |
| **Slaap** | DomainDeep pariteit deels | template aanwezig | `/intake/slaap` | kiem ✅ | Shell na beweging |
| **Stress** | idem | template | `/intake/stress` | kiem ✅ | Shell na beweging |
| **Voeding** | nutrition log + trend merge | template + NutritionCapture | `/intake/voeding` | kiem ✅ + volume | Evidence-rijk; anti-scheefheid (§2 ANALYSIS_PILLAR_COVERAGE) |
| **Verbinding** | score in intake | quickWin only | ❌ | intake-only | Geen analyse-shell MVP |
| **Energie** (readout) | afgeleid | n.v.t. | n.v.t. | ❌ geen rij | Rapport-delta hermeting |
| **Herstel** (readout) | afgeleid + recovery hints | n.v.t. | n.v.t. | ❌ geen rij | Rapport-delta hermeting |

**Anti-scheefheid-regel (uit ANALYSIS_PILLAR_COVERAGE §2):** elke domein-deep verdieping toont minstens één leefstijl-signal uit een ander domein — voeding mag nooit de enige "harde" laag blijven na analyse-hero.

---

## 6. Signaalbronnen-oordeel

### Wearable + AI-bril

**Bevestigd:** snapshot → **analyse-SSOT**, niet checklist. API blijft 503 tot DPIA + register + consent.

**Conflict-resolutie planner §8.2 vs analyse-only:**

| Bron | Oude claim | Bindende waarheid |
|---|---|---|
| `ARCHITECTUUR_LIFESTYLE_PLANNER.md §8.2` | "signalen → planning/intensiteit" | **REFINE doc:** snapshot landt eerst op analyse; planning mag alleen **afgeleide soft hints** lezen |
| `recovery-fit.ts:1-7` | recovery fit for planning | **Behouden** als adapter: `computeRecoveryFit` → `showWhen`-hint / analyse-banner — **niet** als alternate domain score |
| `movement-recovery-bridge.ts` | combineert intake + wearable | **Analyse-context** op BewegingScreen (herstel-hint banner); optioneel filter op zichtbare plan-stappen — geen sensor-raw in PlanStep-body |

**Doc-update (Dennis-checklist):** `ARCHITECTUUR_LIFESTYLE_PLANNER.md §8.2` → "Analyse-first; planning hints zijn afgeleid, feature-gated."

**AI-bril / camera-inname:** zelfde `WearableSignalSnapshot`-vorm; aparte consent/DPIA; voeding-horizon; geen vendor-keuze nu.

---

## 7. Agenda-aansluiting

**Vier gelockte besluiten** (agenda-verdict §1): build-trigger, `agenda_preferences`, `agenda.slot_tweaked`, fase 1 = beweging — **niet heropend**.

### Wat analyse moet af hebben vóór agenda-MVP zinvol is

1. Stabiele **prioriteit-export** uit leefstijllijn (welk domein daalt / blijft laag).
2. **TrendPoint-model** intern (timestamps) — zodat retentie-trigger meetbaar is zonder agenda-eigen score.
3. Beweging analyse-shell **REFINE** (anti half-advies) — anders is agenda-slot een checklist zonder context.

### Wat mag pre-traffic (zonder DEFER-trigger te schenden)

- Copy-rename Bewegingsanalyse + `LeefstijllijnSection` labels (al "Analyse / Jouw lijn")
- TrendPoint intern + sparkline met echte volgorde
- BewegingScreen hiërarchie opschonen (voeding/supplement demote)
- Agenda-tab **precursor** (weekpreview + vandaag-check-in) — al gelockt apart
- P1 gedaan-log evidence (apart verdict) — versterkt leefstijllijn zonder agenda

### Agenda-tab / weekpreview respect

- Toont completie (`daily_action_log`) + link "Bekijk je lijn → Voortgang"
- **Geen** domein-gauge als hero op Agenda-tab
- Geen scores in weekstrip-cells

---

## 8. Fasering 12–24 maanden

| Fase | Scope | Dependency | Privacy | Meetpunt |
|---|---|---|---|---|
| **1** Pre-traffic | Analyse-shell beweging REFINE + TrendPoint intern + copy-rename | agenda gelockt | geen nieuwe verwerker | bestaand `dashboard_beweging_*`, `measurement.checkin_completed` |
| **2** Pre/post week-0 | Gedaan-log evidence (P1) + week-resolutie score+volume | fase 1 | register-check session log | `movement.session_logged` (nieuw, registratie) |
| **3** | Sibling analyse-shell pariteit (slaap/stress) | fase 1 shell | — | domein-check-in events |
| **4** | Week/maand-resolutie + hermeting-delta leesbaar | TrendPoint | — | `remeasure.*` |
| **5** | Wearable opt-in | DPIA + consent + enable API | **gate** | `wearable.interest_clicked` |
| **6** | Agenda-MVP | retentie-trigger <30% | prefs-tabel | `agenda.slot_tweaked` |
| **7** | AI-bril / rijkere sensors | fase 5 + aparte DPIA | **gate** | — |

---

## 9. Meetpunten per fase

- **Fase 1–2:** hergebruik `dashboard_beweging_checkin_click`, `dashboard_beweging_plan_click`, `dashboard_tab_selected`, `measurement.checkin_completed`
- **Nieuw (alleen fase 2, P1):** `movement.session_logged` — vereist registratie op 3 plekken als client-event
- **Geen** scores in GA4/Clarity payloads

---

## 10. NIET-lijst (≥7)

| # | NIET | Reden |
|---|---|---|
| 1 | `scoring.ts` / intake-engine openbreken | Eén scoringswaarheid |
| 2 | Readout-agenda-slots (energie/herstel) | agenda-lock + `domain-role.ts` |
| 3 | Scores in ICS/reminders/shareable | art. 9 AVG |
| 4 | Sensor-raw in PlanStep-body | checklist ≠ analyse-pijp |
| 5 | Agenda-locks heropenen | gelockt 18 jul |
| 6 | Stripe / premium vóór week-0 | CURRENT_SPRINT |
| 7 | `lp_*` / Calendar OAuth vóór trigger | pre-traffic |
| 8 | Fake interpolatie in leefstijllijn | productintegriteit |
| 9 | Minuten→score stilzwijgend | tweede waarheid (P1 default: nee) |
| 10 | Verbinding analyse-shell MVP | quickWin-only |

---

## 11. Dennis-checklist + handoffs

### Akkoord-gate (P0)

- [ ] REFINE-verdict acceptabel — één scoringswaarheid + TrendPoint-model
- [ ] H1: Bewegingsanalyse copy ja/nee → zo ja: PR `DOMAIN_MODEL.md` §5.1
- [ ] Planner §8.2 doc-sync akkoord
- [ ] Pre-traffic slice fase 1–2 scope akkoord
- [ ] Doc-sync: `ACCOUNT_DASHBOARD_SYSTEM.md:71` — voeding in trend is live, backlog-regel stale

### Handoffs (max 3 — titel + 1 zin)

1. **Leefstijllijn TrendPoint + resolutie** — Breid `account-dashboard.ts` trend-build en `leefstijllijn.ts` uit met timestamps, bron-labels en week-rollup zonder fake interpolatie.
2. **Bewegingsanalyse shell REFINE** — Hernoem Kompas-copy, demote voeding/supplement-sectie, behoud plan-footer als Stappenplan.
3. **Wearable analyse-bridge doc-sync** — Update planner §8.2 + recovery-fit contract: analyse-first, planning hints afgeleid.

---

**Volgende stap:** P1 gedaan-log (`fable-beweging-gedaan-log-2026-07.md`) met dit verdict als SSOT-input.
