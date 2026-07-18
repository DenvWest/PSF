# Verdict — Roadmap vervolg dashboard-cockpit: fasering (18 juli 2026, avond)

**Type:** Fable fasering-verdict (KEEP/REFINE/KILL/DEFER per brok). Geen implementatie — brondocument voor de volgende bouwprompts.
**Bouwt op (niet heropend):** [`fable-agenda-checkin-verdict`](fable-agenda-checkin-verdict-2026-07.md) (4 gelockte besluiten, tweak-MVP DEFER achter retentie-trigger) · [`fable-bewegingsanalyse-leefstijllijn-verdict`](fable-bewegingsanalyse-leefstijllijn-verdict-2026-07.md) (P0 TrendPoint) · [`fable-beweging-gedaan-log-verdict`](fable-beweging-gedaan-log-verdict-2026-07.md) (P1 evidence-slice).
**Status code (geverifieerd 18 jul, avond):** Mijn Dag/agenda live (multi-blok, soft-delete, durable `agenda.block_*`-events), `account_priority_pref` incl. `scheduled_time` + 2 plan-stap-kolommen, `movement_session_log` gebouwd achter `NEXT_PUBLIC_MOVEMENT_LOG_ENABLED` (uit), wearable/snapshot bewust 503. **TrendPoint-P0 is nog NIET geland.** 5 bestanden uncommitted (premium-waitlist-opschoning) — eerst reviewen/afronden.

---

## 0. Verdict in één alinea

Consolidatie eerst, maar chirurgisch: niet "alles opruimen vóór alles bouwen", wel de twee schulden die zich per nieuw domein vermenigvuldigen — het **day-model** (drie plekken berekenen nu los wat er vandaag op de agenda staat) en de **TrendPoint-baseline** (delta liegt zodra er >6 meetpunten zijn). Die twee plus het aanzetten van de al gebouwde beweging-gedaan-log zijn deze week. Daarna: herhalende blokken + in-app dagstart + slaap als tweede module op het beweging-patroon. Alles met een extern kanaal (Google-sync, push, ICS, wearable) blijft DEFER achter de al verankerde privacy-gates. De agenda-tweak-MVP blijft DEFER achter de retentie-trigger — dat besluit is gelockt en dit rapport raakt het niet.

---

## 1. Hypothese-oordelen H1–H4

| # | Oordeel | Onderbouwing |
|---|---|---|
| **H1 Consolidatie eerst** | **BEVESTIGD, versmald** | Blokkerend: (a) TrendPoint/baseline-integriteit, (b) day-model-unificatie. Niet blokkerend: een big-bang navigatie-refactor — `tab`+`kompas` staan al in de URL ([`dashboard-url.ts`](../../src/lib/dashboard-url.ts)); wat mist is klein (agenda-dag, Voortgang-subscherm). [`Dashboard.tsx`](../../src/components/dashboard/Dashboard.tsx) (3.772 r.) niet herschrijven, wel bevriezen: nieuwe schermen als losse componenten (het `agenda/`-patroon), geen nieuwe secties in de monoliet. |
| **H2 Reminders > Google-sync** | **BEVESTIGD** | Adherence-winst zit in "kom terug en zie je dag", niet in spiegelen naar een externe kalender. In-app dagstart = nul nieuwe verwerkers. Google-OAuth = nieuwe verwerker + DPIA + two-way-sync-complexiteit voor een onbewezen behoefte → DEFER (geen KILL: `external_provider`/`external_ref`-kolommen liggen al klaar als naad). E-mail-dagstart kan als opt-in via Resend (bestaande verwerker) mits scorevrij en generiek — kleine registercheck, fase B. ICS/push: fase ≥ 2-gate uit het agenda-verdict blijft. |
| **H3 Day-model = sleutel-refactor** | **BEVESTIGD** | Drie onafhankelijke afleidingen van "wat gebeurt er vandaag hoe laat": [`agenda-week-preview.ts:209-237`](../../src/lib/agenda-week-preview.ts#L209-L237) (WeekDaySlot + stap-resolutie), [`agenda-timeline.ts:107-156`](../../src/lib/agenda-timeline.ts#L107-L156) (`resolveScheduledTime` + `buildPlanStepBlock`), [`AgendaTodayHero.tsx:64-67`](../../src/components/dashboard/agenda/AgendaTodayHero.tsx#L64-L67) (`habit?.stepId ?? slot.stepId` + eigen daily-log-fetch). Completie-waarheid is bovendien gesplitst over `daily_action_log` (plan-stap) en `agenda_blocks.status` (blok) zonder gedeelde lezer. Elk nieuw domein zou deze drievoudigheid kopiëren → refactor vóór uitrol. |
| **H4 Wearable pas bij concrete lus** | **BEVESTIGD** | 503 is bewust ([`wearable/snapshot/route.ts`](../../src/app/api/account/wearable/snapshot/route.ts)); DPIA + aparte consent vereist. Zonder recovery→agenda-lus is een snapshot een los getal. Blijft DEFER; de adapters (`recovery-fit.ts`, `movement-recovery-bridge.ts`) liggen klaar als naad. |

---

## 2. P0-data-integriteit (geverifieerd in code — dit is de "audit-lijst")

Een los audit-rapport is niet in de repo aangetroffen; deze vier punten zijn direct uit de code geverifieerd:

1. **Baseline-drift (P0, deze week).** `model.trend` = `slice(-6).map(point => point.value)` (timestamps + bron weggegooid in [`account-dashboard.ts`](../../src/lib/account-dashboard.ts), trend-build); [`leefstijllijn.ts:21`](../../src/lib/leefstijllijn.ts#L21) neemt `trend[0]` als baseline. Zodra een domein >6 punten heeft is "delta sinds start" stilletjes "delta sinds 6 punten geleden". Dit ondermijnt precies de hermeting-story ("score bewoog X"). Fix = het al gelockte TrendPoint-ontwerp (analyse-verdict §4): intern `TrendPoint{value, ts, source}`, baseline = eerste punt ooit, UI ongewijzigd.
2. **Day-model drievoudig (P0, deze week).** Zie H3. Eén `buildDayModel(model, date, blocks, completions)` in `src/lib/` die per dag oplevert: plan-stap-slot (incl. zichtbaarheid + tijd), routine/external-blokken, en een gemergde completie-status uit beide grootboeken. Week-strip, timeline, TodayHero, Kompas-dag-bridge en detail-sheet consumeren — geen eigen merge meer.
3. **Pref-tabel als UI-vergaarbak (P1, bewaken).** `account_priority_pref` draagt al `plan_step_dismissed_date` + `plan_steps_hidden` naast focus + tijd — UI-state in een `unique(account_id)`-rij. Werkt voor 1 domein; bij multi-domein past per-domein-state hier structureel niet. Regel: **geen nieuwe kolommen** meer op deze tabel; per-domein-state landt in het al gelockte `agenda_preferences`-ontwerp zodra de tweak-trigger slaat.
4. **Twee completie-grootboeken (accepteren, niet mergen).** `daily_action_log` (habit/plan-stap) en `agenda_blocks.status` (blok) zijn bewust gescheiden (evidence-contract). Geen migratie — het day-model wordt de enige plek die ze samen leest.

---

## 3. FASE-PLAN

### Fase A — deze week (consolidatie + oogsten wat al gebouwd is)

| Brok | Verdict | Afhankelijkheid | Meetpunt (succes aflezen) |
|---|---|---|---|
| **A1. Beweging gedaan-log: flag → GA** | **KEEP** | Gebouwd; register §15 + DPIA al bijgewerkt (migratie-comment). Verifiëren op dev, dan `NEXT_PUBLIC_MOVEMENT_LOG_ENABLED=true` op de server + restart; SoonPill-regel checken (zelfde slice als live). | `movement.session_logged` (durable, geregistreerd). Succesmetric uit P1-verdict: % accounts met ≥1 log binnen 7 dagen na eerste beweging-check-in. |
| **A2. TrendPoint + echte baseline** | **REFINE (P0)** | Geen — gelockt ontwerp (analyse-verdict §4). Intern `TrendPoint[]` met ts+source, baseline = eerste punt ooit; `LeefstijllijnRow` krijgt bron-label; sparkline-UI ongewijzigd. | Geen nieuw event — correctheid: vitest op baseline-bij->6-punten + delta over RULES_VERSION-grens; hermeting-copy kan daarna eerlijk "sinds je start". |
| **A3. Day-model-unificatie** | **REFINE (sleutel, §4 hieronder)** | Vóór A4/B3/C1. Pure refactor, geen UI- of gedragswijziging. | Geen nieuw event; bestaande `agenda.block_*` + `dashboard_vandaag_*` blijven de meting. Pariteits-vitest week-strip ↔ timeline ↔ hero. |
| **A4. URL=state afmaken (klein)** | **REFINE** | Na A3 (dag-selectie verhuist toch). `dag`-param op agenda-tab + Voortgang-subscherm-param, zelfde `replaceState`-patroon als `tab`/`kompas`. | `agenda_day_selected` (bestaand GA4) blijft; winst = deeplinkbare terugkeer (nurture kan naar `?tab=agenda&dag=...` linken zonder nieuw event). |

Plus hygiene: de 5 uncommitted bestanden (premium-waitlist-opschoning) door Dennis laten reviewen vóór er nieuwe wijzigingen overheen komen.

### Fase B — komende 2–4 weken (agenda-diepte + tweede module)

| Brok | Verdict | Afhankelijkheid | Meetpunt |
|---|---|---|---|
| **B1. Herhalende blokken (wekelijks)** | **REFINE-light** | A3. Additieve kolom op `agenda_blocks` (bijv. `repeat_weekly` + weekdag-set of parent-ref); expansie in day-model, niet in UI-plekken. Geen RRULE-engine. | `agenda.block_created` payload + `recurring`-veld (hergebruik event); retentie-lens: % actieve dagen met ≥1 open blok. |
| **B2. In-app dagstart ("Je dag staat klaar")** | **KEEP** | A3 (leest day-model). Eerste dashboard-open van de dag → Mijn Dag met vandaag-samenvatting; geen cron, geen push. Optioneel opt-in e-mail-dagstart via Resend: scorevrij, generiek ("2 momenten gepland"), kleine registercheck vóór activatie. | Ratio `dashboard_tab_selected(tab=agenda)` per actief account per dag (bestaand GA4); e-mailvariant: bestaand nurture-send-patroon, geen nieuw event-type vóór hergebruik-check. |
| **B3. Slaap als tweede module** | **REFINE** | A2+A3. Blauwdruk §5: analyse-shell-pariteit + agenda-pool voor slaap; **geen nieuwe tabellen** — check-in-route en plan-template bestaan al. Geen slaap-evidence-log (check-in is de datalaag). | `measurement.checkin_completed` (domain=slaap, bestaand) + completie via `daily_action_log`; shell-adoptie via bestaande `dashboard_tab_selected`/kompas-events. |
| **B4. Voortgang-story "jouw eerste 30 dagen"** | **REFINE** | A2 (eerlijke baseline verplicht). Leefstijllijn + beweging-volume + `priority-over-time` samengevoegd tot één vooruitgang-verhaal richting hermeting; geen nieuwe databron. | `remeasure.invited` → `remeasure.completed`-ratio (beide bestaand, durable) — dé retentie-KPI van deze hele fase. |

### Fase C — daarna (gated)

| Brok | Verdict | Gate | Meetpunt |
|---|---|---|---|
| **C1. Stress-module + voeding-slot-pool** | REFINE | B3 bewijst dat de blauwdruk herbruikbaar is (slaap-shell < ~2 dagen werk = bewijs). Voeding: alleen agenda-pool-aansluiting, deep-tool bestaat al. | `measurement.checkin_completed` per domein |
| **C2. Agenda-tweak-MVP (swap + `agenda_preferences`)** | **DEFER (gelockt)** | Retentie-trigger uit agenda-verdict §1: 2e-dag-retour < 30%, 2 weken, N-floor — Appendix A-query op prod draaien zodra er verkeer is (handoff 0, geen code). | `agenda.slot_tweaked` (pas dan registreren) |
| **C3. Premium-activatie statistieken/begeleiding** | REFINE | B4 live + prijsband-signaal uit waitlist. Zie §6. | `premium.waitlist_joined(price_band)` → later sale-conversie in `af_`-ledger |
| **C4. Wearable-lus** | **DEFER** | DPIA + aparte consent + concreet ontwerp recovery→agenda-hint (H4). Niet eerder. | pas bij ontwerp |

---

## 4. SLEUTEL-REFACTOR — day-model + navigatie

**Wat:** één module `src/lib/day-model.ts` (naam indicatief) met één builder die voor een datum oplevert: (1) het plan-stap-slot — domein via prioriteit, stap via de bestaande week-preview-resolutie, tijd via één `resolveScheduledTime`, zichtbaarheid via de pref-kolommen; (2) routine- en external-blokken uit `agenda_blocks`; (3) completie gemerged uit `daily_action_log` én `agenda_blocks.status`. `WeekDaySlot` en `TimelineBlock` blijven bestaan als output-typen; wat verdwijnt is dat [`agenda-week-preview.ts`](../../src/lib/agenda-week-preview.ts), [`agenda-timeline.ts`](../../src/lib/agenda-timeline.ts) en [`AgendaTodayHero.tsx`](../../src/components/dashboard/agenda/AgendaTodayHero.tsx) elk hun eigen merge doen.

**Waarom vóór uitbreiding:** elk nieuw domein (B3, C1) en elke agenda-verdieping (B1-recurrence, B2-dagstart, later swap) raakt "wat staat er vandaag". Nu zijn dat drie wijzigingsplekken die uiteen kunnen lopen (de tijd-resolutie verschilt vandaag al subtiel tussen week-preview en timeline); na de refactor is het er één. Dit is ook de voorbereiding op de gelockte tweak-MVP: swap wordt straks één extra input van de builder in plaats van een vierde merge-plek.

**Navigatiedeel (klein, geen herbouw):** zelfde `searchParams`-patroon als `tab`/`kompas` uitbreiden met agenda-dag en Voortgang-subscherm. Winst: refresh/back verliest geen context en nurture-mails kunnen naar een concrete dag linken. De `Dashboard.tsx`-monoliet zelf: bevriezen, niet herschrijven — uitsplitsen gebeurt organisch per scherm dat toch wordt aangeraakt.

## 5. MULTI-DOMEIN-BLAUWDRUK — één module-contract

Beweging is de referentie-implementatie. Per domein bestaat het contract uit zes sloten, waarvan er vijf al generiek zijn:

| Slot | Contract | Status per domein |
|---|---|---|
| Score + lijn | engine-score (SSOT) + `TrendPoint[]` via `buildLeefstijllijnRows` | alle 5 na A2 |
| Check-in | `/intake/<domein>`-route + `measurement.checkin_completed` | bestaat: slaap/stress/voeding/beweging; verbinding **bewust niet** |
| Plan-pool | `LifestylePlanTemplate` + `selectVisibleSteps` | bestaat: 4 domeinen; verbinding = quickWin-only (gelockt) |
| Evidence-links | `PlanStepLink` → `/onderbouwing` / kennisbank | bestaat, generiek |
| Agenda-slot | day-model: domein → `AgendaCategoryId`, completie → `daily_action_log` | generiek na A3 |
| Evidence-log (optioneel) | kwantitatieve gedragsreeks náást de score, alleen waar zinvol | beweging = `movement_session_log`; voeding = `intake_intake_log` (bestaat); **slaap/stress = geen** (check-in ís de datalaag — geen nieuwe tabellen) |

Uitrol = per domein alleen de shell-copy + eventuele domein-specifieke analyse-kaarten; datalagen, events en agenda-aansluiting komen uit het contract. Energie/herstel blijven readout — nooit een slot (verankerd). Verbinding krijgt geen shell (gelockt; quickWin-only).

## 6. MONETISATIE-HAAK

**De grens blijft de al besloten moat-lijn: uitkomsten en de leading-indicator-lus gratis; verdieping/longitudinaal betaald.** Concreet in deze roadmap: agenda, check-ins, gedaan-log, leefstijllijn-basis en hermeting = gratis (dit ís de retentie-motor en het affiliate-lead-been). Premium = de B4/C3-verdieping: 30-dagen-weekrapporten, langere historie, export, en later begeleiding op de agenda. De Voortgang-statistieken-gate + waitlist-kaart met prijsbanden (net opgeschoond, uncommitted) is het meetinstrument — geen Stripe vóór het prijsband-signaal er is.

**Minimale meetlus (alles bestaat al):** stats-gate-vertoning (GA4) → `premium.waitlist_joined` met `price_band` (durable) → bij latere activatie: sale-attributie via `psf_aff_ref` in de `af_`-ledger (fase-3A-naad, lead=intake / sale=premium). Er hoeft voor de monetisatie-haak in fase A/B **niets** gebouwd te worden behalve B4 — de story die de verdieping het waard maakt.

## 7. NIET-NU-LIJST

1. **Google Agenda-sync** — nieuwe verwerker + DPIA + two-way-complexiteit voor onbewezen pull; naad (`external_provider`) ligt klaar. DEFER.
2. **Push / service-worker / ICS-export** — zelfde privacy-gate (fase ≥ 2, agenda-verdict §6). DEFER.
3. **Wearable activeren** — 503 blijft tot DPIA + consent + concrete recovery→agenda-lus (H4). DEFER.
4. **Agenda-tweak-MVP (swap, `agenda_preferences`)** — gelockt achter retentie-trigger; alleen handoff-0-query draaien. DEFER.
5. **Verbinding-module/-check-in** — quickWin-only, gelockt. KILL voor deze horizon.
6. **Slaap/stress-evidence-logs** — check-in is genoeg; geen nieuwe tabellen zonder bewezen behoefte. KILL voor MVP.
7. **Minuten→score of andere tweede scoringswaarheid** — verankerd verbod. KILL.
8. **Big-bang Dashboard.tsx/navigatie-herbouw** — bevriezen + organisch uitsplitsen; alleen A4-params. KILL als los project.
9. **Stripe / betaalmuur** — pas na prijsband-signaal uit de waitlist. DEFER.
10. **Nieuwe event-types** — `agenda.block_*`, `movement.session_logged`, `measurement.checkin_completed`, `remeasure.*`, `premium.waitlist_joined`, `dashboard.priority_selected` dekken fase A+B volledig; `agenda.slot_tweaked` pas bij C2.

## 8. RISICO'S (top-3) + mitigatie

1. **Multi-domein vóór day-model → drift ×5.** Elke shell kopieert de drievoudige dag-merge; week-strip, timeline en hero gaan per domein subtiel verschillen (tijd-resolutie wijkt nu al af). Mitigatie: A3 is hard blokkerend voor B3/C1, met pariteits-vitest als contract.
2. **`account_priority_pref` groeit door als UI-vergaarbak.** Nog een dismissed-kolom erbij en de `unique(account_id)`-rij wordt de facto een ongestructureerde prefs-blob die bij multi-domein niet meer past en bij de tweak-MVP dubbelt met `agenda_preferences`. Mitigatie: kolom-freeze op deze tabel (§2.3); per-domein-state wacht op het gelockte `agenda_preferences`-ontwerp.
3. **Reminder-/sync-kanalen lekken gezondheidscontext (AVG).** Een e-mail/push/ICS met staptitels of domeinen is zo een art. 9-achtig datapunt buiten de app. Mitigatie: in-app first (B2); e-mailvariant scorevrij én domeinvrij, registercheck vóór activatie; elk extern kanaal achter de bestaande register/DPA/DPIA-gate — geen uitzonderingen "omdat het maar een reminder is".

---

**Eerstvolgende brok: A1 — de beweging-gedaan-log van flag naar GA (met A2-TrendPoint in dezelfde week); het bewijs dat hij werkt is de eerste `movement.session_logged`-rijen in `domain_events`, afgelezen als % accounts met ≥1 log binnen 7 dagen na hun eerste beweging-check-in.**
