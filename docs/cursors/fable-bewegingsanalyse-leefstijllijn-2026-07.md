# Fable-prompt — bewegingsanalyse × leefstijllijn × agenda (langetermijn) (juli 2026)

Eén zelfstandige copy-paste prompt voor **Claude Fable**. Draai hem als **aparte sessie** —
architectuur-/productverdict + langetermijn-model, geen implementatie.

**Achtergrond.** De agenda-stack is gelockt ([`fable-agenda-checkin-verdict-2026-07.md`](fable-agenda-checkin-verdict-2026-07.md),
[`fable-agenda-refine-verdict-2026-07.md`](fable-agenda-refine-verdict-2026-07.md)): architectuur B
refine (candidate-pool + tweak), `agenda_preferences`, `agenda.slot_tweaked`, build-trigger,
fase 1 = beweging. Wat nog ontbreekt is een bindend **langetermijn-model voor de analysekant**:
de **leefstijllijn** (Dennis: "levenslijn") als longitudinale SSOT per interventiedomein —
symbool · curve · punt over tijd, begin ↔ nu/hermeting — die prioriteit, domein-deep UI en
(later) agenda voedt, en waar wearables/AI-bril op landen zonder de checklist te vervuilen.
Vandaag is de kiem live (`buildLeefstijllijnRows`: baseline = `trend[0]`, current = score) maar
zonder resoluties, zonder bron-labels en zonder contract richting agenda.

**Bindende lens:** analyse (waar sta ik?) · plan (wat?) · agenda (wanneer?) zijn drie lagen met
harde scheiding. Half-advies op één domein zonder meetbare lijn is een **productfout**, geen
feature. **Agenda-architectuur is gelockt; deze sessie ontwerpt de Analyse-SSOT waar agenda
later op consumeert.**

**Sessie-volgorde:**
1. Agenda-architectuur + refine + verdict — gedraaid en gelockt (18 jul)
2. Deze prompt (analyse-SSOT / leefstijllijn)
3. Handoff-prompts pas ná akkoord op het verdict

**Scope-besluit:** geen code, geen commits — output is een rapport. Handoffs alleen als
titel + 1 zin.

---

## Prompt — bewegingsanalyse × leefstijllijn (Analyse-SSOT)

```text
MODEL-CONTEXT: Claude Fable — architectuur- en productverdict "Analyse-SSOT + leefstijllijn
(bewegingsanalyse als blauwdruk)", geen code wijzigen.
PROJECT: PerfectSupplement (perfectsupplement.nl) — Next.js 16 App Router, TypeScript strict,
Supabase (RLS), systemd-deploy op Hetzner. Onafhankelijk supplementen-vergelijkingsplatform
voor mannen 40+, positionering "Consumentenbond van supplementen".
TAAL: Nederlands in output; bestandspaden en code in Engels.
CONSTRAINTS: geen code-edits, geen commits, geen migraties, geen `next build`; alleen lezen +
rapporteren.

## Waarom deze sessie

De agenda-stack (check-in → 7-dagenagenda) is als ontwerp GELOCKT: architectuur B + refine
(candidate-pool per domein + swap + tijdvak-bucket), `agenda_preferences`-tabel, event
`agenda.slot_tweaked`, build-trigger (2e-dag-retour < 30%, 2 weken, N-floor), fase 1 =
beweging. De agenda kiest *welk domein* via prioriteit en *welke stap* via de pool — maar er
is nog géén bindend langetermijn-model voor hoe de **leefstijllijn** (waar sta ik / hoe
beweegt het?) die prioriteit en de domein-deep UI voedt, noch hoe wearables en een toekomstige
AI-bril daar landen zonder een tweede scoringswaarheid of checklist-vervuiling te creëren.

Deze sessie vult dat gat: ontwerp de **Analyse-SSOT** zodat agenda later een schone afnemer
is. "Levenslijn" (Dennis' term) en "leefstijllijn" zijn hetzelfde concept — de productterm in
code en docs is en blijft **leefstijllijn**; gebruik één naam.

BINDENDE LENS (niet heronderhandelen): dit is een architectuurverdict — KEEP / REFINE / KILL /
DEFER voor het analyse-SSOT-voorstel, met laag-contracten, target-datamodel en 12–24-maanden
fasering. Kies; geen "overweeg A of B". Je mag de §5.1 naming-lock ("blijf Bewegingsplan
noemen") stress-testen en desnoods overturnen — maar de agenda-locks heropen je NIET.

## Drie lagen — harde scheiding (verankeren in elk contract)

  [signaalbronnen]  intake+hermeting · domein-check-ins · WearableSnapshot · (horizon) AI-bril
        │
        ▼
  [ANALYSE-SSOT]    domeinscores 0–100 → leefstijllijn (symbool·curve·punt)
                    → resoluties dag/week/maand → begin↔eind-delta (hermeting)
        │                    │                          │
        │ informeert         │ voedt                    │ voedt
        │ prioriteit +       ▼                          ▼
        │ context      [domein-deep UI]           [Voortgang-hub]
        ▼              (BewegingScreen e.a.)      (leefstijllijn 5 rijen)
  [ACTIE-LAAG]
    Plan  = wat   (LifestylePlanTemplate / candidate-pool)  ──pool──▶  Agenda = wanneer
    Agenda = slot (domein via prioriteit, stap via pool; DEFER achter trigger)

| Laag | Vraag | Mag bevatten | Mag NIET bevatten |
|------|-------|--------------|-------------------|
| **Analyse / leefstijllijn** | Waar sta ik? Hoe beweegt het? | scores, trend, delta, signaalbron-label (check-in vs sensor), resolutie | advies-stappen, kloktijden, "doe X vandaag" als hero |
| **Plan** | Wat kan ik doen? | PlanStep-pool, rationale, evidence-link | nieuwe scores; sensor-raw; "live gemeten"-claims |
| **Agenda** | Wanneer doe ik het? | domein-slot (prioriteit), gekozen stap, bucket/tweak | eigen scoringsengine; readout-slots; scores in reminders |

Eén scoringswaarheid: `intake-engine`-scores + de trend-merge in `account-dashboard.ts`.
Agenda noch analyse-UI mag een parallelle score bijhouden.

## Dennis-hypothesen (stress-testen, niet gehoorzamen)

H1. **Naming:** hernoem de producttaal naar **Bewegingsanalyse** (en later Slaapanalyse …);
    routes en templates mogen `plan`/`movement` blijven. De §5.1-lock "naming blijft
    Bewegingsplan" (DOMAIN_MODEL.md:162) is te voorzichtig nu analyse de hero is.
H2. **Leefstijllijn = levenslijn:** één longitudinaal model per interventiedomein met views
    dag / week / maand + begin↔eind (intake → check-ins → hermeting). Het huidige
    `buildLeefstijllijnRows` (baseline = `trend[0]`, current = score) is de kiem, niet het
    eindbeeld.
H3. **Anti half-advies:** domein-deep (nu BewegingScreen) mag geen mengeling zijn van "een
    beetje gauge + een beetje voedingsadvies + plan-footer" zonder dat analyse de hero is;
    advies hoort secundair of in plan/agenda.
H4. **Signaalpijp:** wearables én toekomstige AI-bril (voeding/inname) landen op dezelfde
    analyse-snapshot-pijp (`WearableSignalSnapshot`-familie), verrijken trend/context, en
    injecteren niet in checklist-stappen.
H5. **Agenda-contract:** leefstijllijn/prioriteit bepaalt welk domein het slot krijgt; de
    agenda-pool bepaalt welke stap; analyse mag agenda nooit overschrijven met een tweede
    "doe dit"-waarheid. Bouw-agenda blijft DEFER; analyse-diepte mag wél vóór week-0 als het
    retentie/meetbaarheid versterkt zonder lp_*/OAuth.
H6. **Blauwdruk-uitrol:** beweging is de eerste analyse-shell; slaap/stress/voeding/verbinding
    hergebruiken dezelfde shell; actie-templates blijven domein-specifiek (verbinding =
    quickWin-only, conform agenda-lock).

Per hypothese: bevestigen / aanscherpen / verwerpen — maar kiezen.

## Harde regels (verankerd — niet heronderhandelen)

### Agenda-locks (18 jul 2026 — citeren, niet heropenen)
Uit fable-agenda-checkin-verdict-2026-07.md §1 + §0b:
1. Build-trigger DEFER→BUILD: 2e-dag-retour dagelijkse-actie-habit < 30% in 2 opeenvolgende
   activatie-weken (N-floor), alle geactiveerde accounts.
2. `agenda_preferences` = kleine MVP-tabel, RLS deny-all, service-role-only.
3. Nieuw event `agenda.slot_tweaked` (payload: domain, tweak_type — geen scores).
4. Fase 1 = beweging; verbinding blijft quickWin-only.
Plus refine-model: candidate-pool via `selectVisibleSteps` + swap binnen domein + tijdvak-
bucket; evidence = link-laag; completie = `daily_action_log`; precursor = Agenda-tab met
weekpreview (§0b). Deze besluiten zijn input, geen discussie.

### Domeinmodel
- 5 interventiedomeinen (slaap, stress, voeding, beweging, verbinding); energie/herstel =
  readout — "Rapport"-label, drivers via READOUT_DRIVERS, nooit een leefstijllijn-rij, nooit
  een agenda-slot (src/lib/domain-role.ts:9-23).
- Copy: "op basis van je laatste check-in" — nooit "live gemeten" (IA_ECOSYSTEEM.md:108,145);
  geen scores/profiellabels in shareable/calendar-artefacts (art. 9 AVG).
- Delta's over een RULES_VERSION-grens markeren als niet-vergelijkbaar (DOMAIN_MODEL.md §7).

### Pre-traffic sprint
Uit docs/core/CURRENT_SPRINT.md: meten vóór schaal; geen Stripe, geen drempel-tuning op
N<100. Alles wat je vóór week-0 aanbeveelt = meet-/afleeswerk of kleinste analyse-slice —
geen lp_*-schema, geen calendar/wearable-OAuth, geen push. Botst een aanbeveling hiermee,
label expliciet "ná verkeer" + concrete trigger (metric + drempel).

### Privacy / register-gate
Wearable-ingest en AI-bril/camera-inname = nieuwe (bijzondere-categorie-nabije) databron →
DPIA + verwerkingsregister + expliciete aparte consent vóór activatie
(ACCOUNT_DASHBOARD_SYSTEM.md §Signaalbronnen). De snapshot-API blijft 503
(src/app/api/account/wearable/snapshot/route.ts:7-15) tot expliciete enable + register-update.
Geen vendor-keuze in deze sessie — wel pijp-architectuur + privacy-volgorde.

### Meet-standaard
Hergebruik bestaande events vóór je nieuwe verzint: dashboard_beweging_checkin_click /
plan_click / voeding_click / supplement_click / modality_click (BewegingScreen),
measurement.checkin_completed, dashboard.daily_action_toggled, remeasure.*,
wearable.interest_clicked, en de agenda-set (agenda.slot_tweaked, dashboard_tab_selected,
agenda_day_selected). Nieuwe analyse-CTA's vereisen meetpunt-advies — geen implementatie.

WERKWIJZE (verplicht, in volgorde — alleen analyse):

F0 Productfit (max 8 regels) — welk langetermijn-gat lost "analyse-SSOT + leefstijllijn" op
   t.o.v. (a) half-advies op bewegen, (b) plan-als-hero, (c) agenda zonder meetbare lijn?
   Eén zin fit met "gratis Kompas sterker vóór betaald".

F1 Naming & IA — verdict op H1. Map (tabel): UI-labels (Bewegingsanalyse / Jouw lijn /
   Stappenplan) ↔ routes (/intake/plan/movement, /intake/beweging) ↔ code-idents
   (movementPlanTemplate, "Bewegingsplan na 40" — movement.ts:8). Wat hernoem je in copy,
   wat houd je stabiel in routes/API — en wat betekent je verdict voor DOMAIN_MODEL.md §5.1.

F2 Leefstijllijn-datamodel (kern, langetermijn) —
   - Wat model.trend + leefstijllijn.ts vandaag wél/niet kunnen (pad:regel): trend-merge in
     account-dashboard.ts, baseline = trend[0] (leefstijllijn.ts:21), delta pas bij ≥2 punten,
     géén timestamps per punt in de row, géén resoluties.
   - Target-model: resoluties dag / week / maand; ankers begin (intake of eerste check-in) en
     eind (laatste punt / hermeting +30d); RULES_VERSION-grens gerespecteerd.
   - Welke punten uit check-in vs wearable vs (later) AI-bril — en hoe je bron labelt zonder
     "live gemeten"-claim.
   - Readouts (energie/herstel): buiten de 5 lijnen; wel delta/drivers op hermeting — geen
     agenda-slot (agenda-lock).
   - Gap-tabel: welke data ontbreekt voor echte multi-resolutie (voeding nog niet in de trend
     — F3b-deel-2 backlog; verbinding zonder check-in-route; punten zonder datum-as). Geen
     fake interpolatie verzinnen.

F3 Laag-contracten (verplicht: tekstdiagram + interface in woorden) — schrijf drie contracten:
   1. Analyse → Domein-deep / Voortgang: wat de UI mag tonen (score, lijn, delta, bron-label,
      resolutie) en wat niet (advies-hero).
   2. Analyse → Prioriteit / Agenda-domein-keuze: alléén domein + context; geen stap-id.
   3. Plan → Agenda-stap-keuze: pool via selectVisibleSteps — ongewijzigd t.o.v. refine-verdict.
   Expliciet: één scoringswaarheid; agenda houdt geen parallelle score bij.

F4 Beweging als blauwdruk, dan siblings — scorecard per interventiedomein: bestaande
   analyse-hooks (pad:regel) | plan-rijpheid | check-in | leefstijllijn-ready | fase.
   Verbinding = quickWin (agenda-lock). Voeding-asymmetrie (harde externe norm vs zachte
   0–100-scores, ANALYSIS_PILLAR_COVERAGE.md §2) meenemen als anti-scheefheid-regel voor de
   analyse-shell. Energie/herstel als aparte readout-rijen.

F5 Signaalbronnen (wearable + AI-bril) —
   - Bevestig of corrigeer: snapshot voedt analyse, niet checklist.
   - Los het conflict op: ARCHITECTUUR_LIFESTYLE_PLANNER.md §8.2 ("signalen → planning",
     intensiteit/prioriteit) + recovery-fit.ts:1-7 ("recovery fit factor for planning") vs
     types/wearable-signals.ts:1-3 ("Feeds the analyse-laag …, not LifestylePlan checklists")
     en DOMAIN_MODEL.md:163. Kies één waarheid; benoem de grens-casus
     movement-recovery-bridge.ts (wearable → herstel-hint: analyse-context of planning?) en
     welk doc bijgewerkt moet worden.
   - AI-bril / camera-inname: zelfde snapshot-pijp, aparte consent/DPIA-gate, voeding eerst
     als horizon; geen greenfield vendor-keuze nu.
   - Pre-traffic: API blijft 503 tot expliciete enable + register-update.

F6 Relatie tot agenda-stack (niet herontwerpen) — citeer de vier gelockte besluiten en
   beantwoord alleen:
   - Wat moet de analyse-laag áf hebben voordat de agenda-MVP zinvol is?
   - Wat mag nú (pre-traffic) gebouwd/verdiept zonder de DEFER-trigger te schenden?
   - Hoe toont de Agenda-tab-precursor / weekpreview respect voor de leefstijllijn (teaser,
     geen tweede hero-score)?

F7 Fasering 12–24 maanden (langetermijn-sequentie, concreet — geen waffle):
   1. Analyse-shell pariteit (beweging → siblings) + leefstijllijn-hub
   2. Resolutie week/maand + hermeting-delta leesbaar
   3. Wearable opt-in (analyse-enrichment)
   4. Agenda-MVP ná retentie-trigger (bestaande lock)
   5. AI-bril / rijkere sensors (privacy-gate)
   Per fase: scope, dependency op de vorige, privacy-gate, meetpunt-advies (bestaande events
   eerst).

F8 Verdict + NIET-lijst + handoffs —
   - KEEP / REFINE / KILL / DEFER voor het analyse-SSOT-voorstel als geheel.
   - Min 7 NIET-items, o.a.: scoring.ts/intake-engine openbreken; readout-agenda-slots;
     scores in ICS/reminders; checklist ← sensor-injectie; agenda-locks heropenen; Stripe;
     lp_* vóór trigger.
   - Max 3 handoff-prompts (titel + 1 zin), bv. leefstijllijn-resolutie, domein-shell
     pariteit, wearable-analyse-bridge.

## Verplichte bronnen

Domein & IA:
- docs/core/DOMAIN_MODEL.md — §5.1 (analyse primair, naming-lock r.162, wearables op
  analyse-laag r.163); §7 RULES_VERSION-grens
- docs/core/ACCOUNT_DASHBOARD_SYSTEM.md — "analyse vóór actie" (r.39-48) +
  §Signaalbronnen-horizon (r.50-60, wearable 503 / AI-bril DPIA / blended-prioriteit-gate)
- docs/core/IA_ECOSYSTEEM.md — Voortgang = leefstijllijn (r.110); "live gemeten" verboden
  (r.108, 145)
- docs/core/STEPPED_CARE_MODEL.md — tier-trap; geen tweede primaire CTA
- docs/core/CURRENT_SPRINT.md — pre-traffic regels

Agenda (gelockt — niet heropenen):
- docs/cursors/fable-agenda-checkin-architectuur-2026-07.md — briefing
- docs/cursors/fable-agenda-checkin-verdict-2026-07.md — 4 besluiten + precursor Agenda-tab
  (§0b) + uitrolvolgorde (§10)
- docs/cursors/fable-agenda-refine-verdict-2026-07.md — candidate-pool + tweak + evidence-link

Plan / meting / wearable:
- docs/plan/LEEFSTIJLPLAN_HANDBOOK.md — content-laag vs planning-laag; thin hub / thick
  spoor-detail (movement v1.6+)
- docs/plan/ARCHITECTUUR_LIFESTYLE_PLANNER.md — §8 WearableService (8.2 signalen→planning =
  te resolven conflict; 8.3 normalisatie/TTL)
- docs/plan/ANALYSIS_PILLAR_COVERAGE.md — §2 voeding-asymmetrie/scheefheid; §4 wearable =
  open strategisch beslispunt

Code-spotchecks (minimaal deze; breid uit waar een claim erom vraagt):
- src/lib/leefstijllijn.ts — buildLeefstijllijnRows (r.16-36), buildDomainTrendRow (r.38-49)
- src/components/dashboard/LeefstijllijnSection.tsx — "Analyse / Jouw lijn", surfaces
  voortgang|domain, focusPillarId, begin-label + DeltaBadge
- src/components/dashboard/BewegingScreen.tsx — gauge-hero (r.214-253), leefstijllijn-focus
  (r.255-260), check-in-CTA (r.262-312), voeding+supplement-sectie (r.314-481), modaliteiten
  "Binnenkort" (r.483-538), plan-footer (r.542-549)
- src/components/dashboard/VoortgangHub.tsx — hub met LeefstijllijnSection (r.1000),
  premium-gates op trends/statistieken
- src/lib/domain-role.ts — DOMAIN_ROLE, READOUT_DRIVERS
- src/types/wearable-signals.ts — snapshot-vorm + analyse-only comment (r.1-3)
- src/lib/wearable/ — signal-snapshot.ts (parse), recovery-fit.ts (planning-comment!),
  movement-recovery-bridge.ts (grens-casus)
- src/app/api/account/wearable/snapshot/route.ts — 503-gate
- src/lib/account-dashboard.ts — trend-merge intake_sessions + intake_domain_checkin
  (±r.337-467)
- src/data/lifestyle-plans/movement.ts — movementPlanTemplate v1.4, "Bewegingsplan na 40"
- src/lib/lifestyle-plan-eval.ts — selectVisibleSteps (r.79-87), computeCurrentPhaseId (r.104)
- src/lib/daily-action-log.ts — agenda-completie-waarheid (account-scoped dag-toggle)
- src/lib/__tests__/leefstijllijn.test.ts — bestaand testcontract van de kiem

## Bekende feiten om te verifiëren (niet blind overnemen)

- Live: leefstijllijn met 5 interventie-rijen (Voortgang-hub + domein-focus in
  BewegingScreen); baseline = trend[0]; delta pas bij ≥2 trend-punten; BewegingScreen =
  analyse-first met plan-footer; wearable-API 503 met code "wearable_not_enabled";
  check-in-trend-merge voor slaap/stress/beweging.
- Gelockt: agenda B + refine; bouw DEFER achter retentie-trigger; fase 1 = beweging; readouts
  geen slot; scores nooit in reminder/ICS; verbinding quickWin-only.
- Ontwerp only: lp_*-tabellen, Calendar-OAuth, multi-resolutie leefstijllijn, wearable-enable,
  AI-bril.
- Gaps: voeding nog niet in de trend (F3b-deel-2 backlog, ACCOUNT_DASHBOARD_SYSTEM.md);
  verbinding heeft geen check-in-route (PILLAR_CHECKIN_ROUTES = 4 domeinen); trend-punten
  dragen geen datum-as in het row-model → multi-resolutie is nu niet af te leiden.
- Spanning 1: DOMAIN_MODEL §5.1 "geen rename" (r.162) vs Dennis-hypothese H1
  (Bewegingsanalyse als producttaal).
- Spanning 2: planner §8.2 + recovery-fit.ts (signalen → planning/intensiteit) vs
  wearable-signals.ts + DOMAIN_MODEL r.163 (snapshot → analyse only).

## Outputstructuur (verplicht)

1. **Executive summary** — max 12 regels + bindend verdict (KEEP/REFINE/KILL/DEFER)
2. **Hypothese-oordelen** — H1–H6 elk: bevestigd / aangescherpt / verworpen + 2 regels bewijs
3. **Laag-contracten** — 3 contracten + tekstdiagram Analyse ↔ Plan ↔ Agenda
4. **Leefstijllijn target-model** — dag/week/maand + begin/eind + bron-labels + gap-tabel
   t.o.v. code
5. **Domein-scorecard** — 5 interventies + 2 readouts: hooks (pad:regel) | plan-rijpheid |
   check-in | leefstijllijn-ready | fase
6. **Signaalbronnen-oordeel** — wearable / AI-bril / privacy + conflict-resolutie planner §8
7. **Agenda-aansluiting** — wat analyse moet leveren; wat DEFER blijft
8. **Fasering 12–24m** — pre-traffic vs ná trigger, per fase dependency + privacy-gate
9. **Meetpunten per fase** — bestaand event eerst, nieuw alleen met registratie-advies
10. **NIET-lijst** — min 7 items met reden
11. **Dennis-checklist** + max 3 handoff-titels (titel + 1 zin)

## Regels

- Geen code, geen commits, geen migraties — alleen rapport
- Elke status-claim met bewijs (pad:regel of grep); "niet verifieerbaar vanuit repo" →
  Dennis-checklist
- Geen vage "overweeg"-taal — kies, met onderbouwing
- Agenda-locks (4 besluiten + refine-model + DEFER-trigger) heropen je niet; §5.1 naming-lock
  mág je overturnen, mits met migratiepad voor copy vs routes/idents
- Energie/herstel nooit als leefstijllijn-rij of agenda-slot — readout only
- Sensor-data nooit in checklist-stappen; snapshot-pijp is analyse-verrijking
- Geen scores/profiellabels in reminder/ICS/shareable (art. 9 AVG); geen "live gemeten"
- Geen vendor-keuze wearable/AI-bril; wel pijp-architectuur + privacy-volgorde
- Hergebruik bestaande event-types vóór je nieuwe verzint
```

---

## Na uitvoering

1. **Verdict + laag-contracten reviewen** — vooral: houdt de scheiding analyse/plan/agenda
   stand als één scoringswaarheid, en is het leefstijllijn-target-model bouwbaar zonder fake
   interpolatie?
2. **H1-besluit vastleggen** — Bewegingsanalyse als producttaal ja/nee; bij ja: doc-PR op
   `DOMAIN_MODEL.md` §5.1 (copy-rename, routes/idents stabiel).
3. **Conflict-resolutie noteren** — planner §8.2 vs analyse-only snapshot: welk doc wordt
   bijgewerkt en waar landt de herstel-hint (analyse-context vs planning).
4. **Pre-traffic-scope** — welke analyse-slices mogen vóór week-0 (F6-antwoord) zonder de
   agenda-DEFER te schenden; noteer triggers.
5. **Handoffs** — max 3 pas laten uitwerken in aparte sessies, ná akkoord op verdict en
   fasering (verwacht: leefstijllijn-resolutie, domein-shell-pariteit, wearable-analyse-bridge).
