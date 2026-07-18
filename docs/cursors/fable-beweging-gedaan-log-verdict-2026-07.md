# Verdict — beweging gedaan-log × modaliteiten: REFINE (juli 2026)

**Type:** Opus architectuur-/productverdict (REFINE). Geen implementatie — brondocument voor handoffs.
**Prompt:** [`fable-beweging-gedaan-log-2026-07.md`](fable-beweging-gedaan-log-2026-07.md)
**Input SSOT:** [`fable-bewegingsanalyse-leefstijllijn-verdict-2026-07.md`](fable-bewegingsanalyse-leefstijllijn-verdict-2026-07.md) (P0 REFINE)
**Status:** ontwerp REFINE · pre-traffic-slice gedefinieerd · agenda-locks onaangetast · vastgelegd 18 jul 2026
**Regels:** minuten = evidence, nooit tweede score · agenda-completie gescheiden · geen fake interpolatie · nooit automatisch committen.

---

## 1. Executive summary + bindend verdict

**Verdict: REFINE** — gedaan-log als **evidence-laag** naast Analyse is het ontbrekende stuk tussen check-in-score en hermeting-leesbaarheid. MVP = account-scoped **movement_session_log** + loggable modaliteiten op BewegingScreen; geen parallelle 0–100-score, geen agenda-MVP, geen sibling-pariteit.

Het gat is concreet: modaliteiten zijn content-links met SoonPill (`BewegingScreen.tsx:483-538`); `mov-training-log` is een plan-stap zonder datalaag (`movement.ts:186-193`); `daily_action_log` is boolean per `action_key`/dag (`daily-action-log.ts:16-37`); trend[] heeft geen datum-as voor scores (`account-dashboard.ts:467-469`) — maar evidence **wél** vanaf dag één.

**Fit gratis Kompas vóór betaald:** volume naast score maakt hermeting leesbaar ("score bewoog X; je noteerde Y min") zonder betaald — meet vóór schaal.

---

## 2. Hypothese-oordelen G1–G6

| # | Oordeel | Bewijs |
|---|---|---|
| **G1 Evidence-oppervlak** | **BEVESTIGD** | Score = intake/check-in (`account-dashboard.ts:425-443`); geen session-log voor beweging. Evidence landt onder Analyse, niet Plan-hero. |
| **G2 Modaliteiten-sectiebar** | **BEVESTIGD, AANGESCHERPT** | Grid 2×2 + SoonPill (`BewegingScreen.tsx:483-538`) → **horizontale chip-scroll** met log + preference. SoonPill verdwijnt in dezelfde slice als log live. |
| **G3 Minuten naast score** | **BEVESTIGD** | Analogie voeding: `intake_intake_log` → `series.voeding` (`account-dashboard.ts:445-458`). Beweging mist equivalent. **Geen** minuten→score-conversie. |
| **G4 Datamodel** | **BEVESTIGD** — kies **nieuwe tabel** | `daily_action_log` te arm (boolean, agenda-completie). Extend zou semantiek vervuilen. Nieuwe `movement_session_log`, zelfde RLS-patroon als `daily_action_log` (deny-all, service-role API). |
| **G5 Anti half-advies** | **BEVESTIGD, AANGESCHERPT** | Gauge + leefstijllijn al hero; na MVP: **gedaan-log direct onder leefstijllijn**, voeding/supplement **collapsible** onder evidence. Naming: shell = Bewegingsanalyse (P0 H1), footer = Stappenplan. |
| **G6 Multi-domein later** | **BEVESTIGD** | Contract is generiek (`modality_id`, `minutes`, `date`); MVP alleen beweging. Verbinding = quickWin — geen gedaan-log. |

---

## 3. Evidence-contract + resolutie-oordeel

### Tekstdiagram

```
[0–100 score]  intake · check-in ──► Analyse/leefstijllijn (TrendPoint score)
                                              │
[evidence]     modality + minutes + date ─────┼──► aparte gedragsreeks (volume)
                                              │         │
                                              ▼         ▼
                                    BewegingScreen / Voortgang    Hermeting: score-Δ + volume
                                              │
[plan]         focus-modaliteit teaser + weekvolume (secundair)
                                              │
[agenda]       DEFER — daily_action_log blijft completie; evidence ↛ agenda-score
```

### Contractregels

| Richting | Regel |
|---|---|
| Evidence → Analyse/Voortgang | Week-minuten, sessie-count, modality-mix, label **"op basis van wat jij noteerde"** |
| Evidence → Plan | Teaser only: "Deze week: 90 min wandelen"; geen PlanStep die score herschrijft |
| Evidence ↛ Agenda | Agenda-completie blijft `daily_action_log`; evidence raakt agenda niet vóór MVP |
| Evidence ↛ parallelle score | Minuten converteren **niet** naar beweging-score |

### Relatie `daily_action_log`: **GESCHEIDEN**

Agenda/habit-completie = boolean toggle per stap/dag. Evidence = kwantitatieve sessie. Optioneel later: loggen tickt ook `mov-training-log` in daily_action — **niet in MVP** (dubbele waarheid vermijden).

### Resolutie-oordeel (verplicht F1-vraag)

**Ja** — evidence mag de week-view vullen **vóór** score-timestamps bestaan.

| As | Score-reeks | Evidence-reeks |
|---|---|---|
| Data vanaf | Eerste intake/check-in | Eerste session_log (kan dag 1) |
| Datum-as | Nu weggegooid in `trend[]` — fix in P0 TrendPoint | `log_date` + `created_at` behouden |
| Week-view | Leeg of sparse tot ≥2 check-ins | **Vult week** met dagelijkse minuten-buckets |
| UI | Sparkline 0–100, label "Jouw score" | Staaf/lijn minuten, label **"Wat je noteerde"** |
| Regels | Geen interpolatie tussen score-punten | Geen interpolatie — 0 = geen staaf, geen fake lijn |

Twee reeksen naast elkaar in BewegingScreen compact view; geen minuten→score, geen fake interpolatie.

---

## 4. UX-flow 0→hermeting

| Stap | Actie | Opmerking |
|---|---|---|
| 1 | Eerste score via intake of `/intake/beweging` | Bestaand |
| 2 | Kompas Beweging: chip-scroll modaliteiten | Loggable: kracht, wandelen, zone2, rustmoment |
| 3 | **Primair:** inline log op BewegingScreen (minuten + opslaan) | Secundair: deeplink vanuit plan-stap |
| 4 | Plan toont focus-modaliteit + "deze week X min" | Secundair t.o.v. analyse |
| 5 | Leefstijllijn: score-sparkline + volume-teaser | Twee as-labels |
| 6 | Hermeting +30d | Copy: "Score bewoog X punten; je noteerde Y min over Z dagen" |

**Lege state (0 logs):** geen grafiek — zachte CTA **"Log je eerste sessie — 2 min"** onder leefstijllijn. Geen fake trendlijn.

**Primaire log-surface:** **Kompas BewegingScreen** (niet plan-pagina als default).

---

## 5. Datamodel-keuze

### Gekozen optie: `movement_session_log` (nieuwe tabel)

Analogie `intake_intake_log` voor volume (`20260610140000_intake_intake_log.sql`), maar **account-scoped** zoals `daily_action_log` — beweging is doorlopend dashboard-gedrag, niet per intake-sessie gebonden.

| Veld | Type | Doel |
|---|---|---|
| `id` | uuid | PK |
| `account_id` | uuid FK | account-scoped |
| `organization_id` | uuid | consistent met andere tabellen |
| `log_date` | date | aggregatie-as |
| `modality_id` | text | `krachttraining` \| `wandelen` \| `zone2` \| `active_recovery` |
| `minutes` | int | duration |
| `source` | text | default `self_report` |
| `note` | text nullable | optional |
| `created_at` | timestamptz | audit |

**Preference:** `last_selected_modality` in account metadata / dunne `account_preferences` JSON — **niet** in `plan_progress` (plan = wat, preference = UI-state).

**Aggregatie:** server-side week/maand SUM per `log_date` — timestamps **niet** weggooien (les uit `account-dashboard.ts:467-469`).

### Privacy / register

**Nieuw verwerkingsdoel:** zelfgerapporteerde bewegingsminuten = gezondheidsgerelateerd gedrag, account-gebonden.

| Actie | Doc |
|---|---|
| VERWERKINGSREGISTER | Nieuw doel "bewegingssessie-log (zelfrapportage)" + bewaartermijn |
| privacy/page.tsx | Alleen als publiek relevant (account-data achter login → register primair) |
| Geen PII in GA4/Clarity | `movement.session_logged` payload: `modality_id`, `minutes_band` — geen raw note |

---

## 6. Modaliteiten-besluit

| Modality | Nu | MVP |
|---|---|---|
| Krachttraining | blog-link | **Loggable** + optionele content-link |
| Stevig wandelen | content-link | **Loggable** |
| Zone 2 cardio | onderbouwing-link | **Loggable** |
| Rust & herstel | content-link | **Loggable** als `active_recovery` — label **"Rustmoment"** (scheidt van readout-pijler herstel) |

**UI-patroon:** horizontale **chip-scroll** — meer modaliteiten schaalbaar, past bij Kompas-light panel, scheidt log-actie van content-link (link als secondary icon).

**`mov-training-log` (`movement.ts:186-193`):** blijft plan-stap als **CTA naar log-UI** ("Open je beweeglog") — vervangt de datalaag niet; SoonPill op modaliteiten verdwijnt wanneer log live is.

---

## 7. Pre-traffic slice + succesmetric

### Mag vóór week-0

- `movement_session_log` tabel + API route (account-auth, service-role)
- Chip-scroll + inline log op BewegingScreen
- Week-minuten aggregate + volume-teaser op leefstijllijn-focus
- SoonPill verwijderen in dezelfde deploy
- Register-update + `movement.session_logged` event (3-plekken registratie)
- Bewegingsanalyse copy (P0 H1) in dezelfde of directe vervolg-PR

### DEFER blijft

- Agenda-MVP, `agenda_preferences`, swap/tweak
- Wearable OAuth / snapshot enable
- Multi-domein evidence (slaap/stress)
- Minuten→score-model
- `lp_*` schema
- Voortgang-hub premium stats voor volume (teaser op BewegingScreen eerst)

### Succesmetric (pre-traffic)

**% accounts met ≥1 `movement_session_log` binnen 7 kalenderdagen na eerste beweging-check-in** — afleesbaar via Supabase + `movement.session_logged` (consent-cohort voor ratio's).

---

## 8. Meetpunten

| Event | Wanneer |
|---|---|
| `dashboard_beweging_modality_click` | bestaand — chip select |
| `movement.session_logged` | **nieuw** — na succesvolle save; payload: `modality_id`, `minutes` (banded), `surface` |
| `dashboard_beweging_checkin_click` | bestaand — funnel start |
| `remeasure.*` | hermeting met volume-context in UI only |

Registratie `movement.session_logged`: `events.ts` + account-events-client + `/api/account/events` allowlist.

---

## 9. NIET-lijst (≥7)

| # | NIET | Reden |
|---|---|---|
| 1 | Parallelle score-engine uit minuten | één scoringswaarheid |
| 2 | SoonPill naast live log | productfout |
| 3 | Agenda-locks heropenen | gelockt |
| 4 | Evidence als agenda-completie | gescheiden contract |
| 5 | Wearable-OAuth pre-traffic | 503 + DPIA |
| 6 | Stripe / lp_* vóór trigger | sprint |
| 7 | Stille minuten→score | default nee |
| 8 | Sibling-domeinen in MVP-slice | G6 scope |
| 9 | Scores in ICS/reminders | art. 9 |
| 10 | Fake interpolatie lege evidence-grafiek | integriteit |

---

## 10. Dennis-checklist + handoffs

### Akkoord-gate (P1)

- [ ] Evidence naast score — twee waarheden, één verhaal bij hermeting
- [ ] Week-view evidence vóór score-timestamps — ja + aparte as-label
- [ ] `movement_session_log` vs extend daily_action — nieuwe tabel akkoord
- [ ] Register-update scope akkoord vóór productie-log
- [ ] SoonPill-regel: zelfde slice als log live

### Handoffs (max 2)

1. **Implementatie gedaan-log beweging** — `movement_session_log` + API + BewegingScreen chip-scroll/inline log + week-aggregate + register + `movement.session_logged`.
2. **Leefstijllijn TrendPoint (P0)** — Alleen als P0 handoff 1 nog open: timestamps in score-trend vóór Voortgang-hub week-resolutie.

---

**Implementatie:** pas starten ná akkoord op P0 + P1 verdicts.
