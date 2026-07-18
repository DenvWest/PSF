# Fable-prompt — beweging 0→hermeting: gedaan-log × modaliteiten (juli 2026)

Eén zelfstandige copy-paste prompt voor **Claude Fable**. Draai hem als **aparte sessie** —
architectuur-/productverdict, geen implementatie.

**Achtergrond.** Analyse-SSOT / leefstijllijn is de bindende lens
([`fable-bewegingsanalyse-leefstijllijn-2026-07.md`](fable-bewegingsanalyse-leefstijllijn-2026-07.md));
agenda-stack is gelockt. Wat nog ontbreekt voor een **sterk Bewegingsplan van 0-meting tot
hermeting** is de lus **“wat is gedaan?”**: kiesbare bewegingsvormen (nu SoonPill /
blog-links) → terug in plan → minuten/sessies loggen → leesbare evidentie naast de score-lijn.

**Bindende lens:** minuten + modaliteit = **gedragsbewijs (evidence)** onder / naast Analyse —
niet een parallelle 0–100-score, niet checklist-injectie, niet agenda-MVP. Score blijft
intake/check-in; “gedaan” onderbouwt of verklaart de leefstijllijn en hermeting-delta.

**Sessie-volgorde:**
1. Agenda-architectuur + refine — gelockt (18 jul)
2. Analyse-SSOT / leefstijllijn — eerst draaien en akkoord (of parallel alleen als jij de
   laag-contracten al intern vasthoudt)
3. **Deze prompt** (gedaan-log × modaliteiten × 0→hermeting)
4. Implementatie-handoffs pas ná akkoord

**Scope-besluit:** geen code, geen commits — output is een rapport. Handoffs alleen als
titel + 1 zin.

---

## Prompt — gedaan-log × bewegingsvormen (0 → hermeting)

```text
MODEL-CONTEXT: Claude Fable — architectuur- en productverdict "Beweging 0→hermeting:
gedaan-log + modaliteiten als Analyse-evidence", geen code wijzigen.
PROJECT: PerfectSupplement (perfectsupplement.nl) — Next.js 16 App Router, TypeScript strict,
Supabase (RLS), systemd-deploy op Hetzner. Onafhankelijk supplementen-vergelijkingsplatform
voor mannen 40+, positionering "Consumentenbond van supplementen".
TAAL: Nederlands in output; bestandspaden en code in Engels.
CONSTRAINTS: geen code-edits, geen commits, geen migraties, geen `next build`; alleen lezen +
rapporteren.

## Waarom deze sessie

Het Kompas heeft voor beweging al: score-gauge, leefstijllijn-focus, check-in-CTA, voeding/
supplement-sectie, modaliteiten-grid met "Binnenkort", en een plan-footer naar
`/intake/plan/movement`. Wat ontbreekt is een bruikbare lus van **eerste meting → wekelijks
gedrag → hermeting**:

  [0] intake/check-in score
        │
        ▼
  [gedaan]  modaliteit kiezen + minuten/sessie noteren  ← DEZE SESSIE
        │
        ▼
  [analyse] leefstijllijn + volume-reeks + begin↔eind bij hermeting
        │
        ▼
  [plan]    toont focus-vorm + "deze week X min" (secundair t.o.v. analyse)
        │
        ▼
  [agenda]  DEFER — consumeert later prioriteit/pool; bouwt géén done-log

Dennis-productintentie (stress-testen, niet gehoorzamen): sectiebar / chip-scroll voor
bewegingsvormen → landt terug in het bewegingsplan → daar (of vanuit Kompas) minuten
invoeren → valide zelfgerapporteerde evidentie over tijd → statistiek / hermeting-leesbaarheid
— later herbruikbaar over meerdere domeinen. Doel: **gratis Kompas sterker vóór betaald**,
meten vóór schaal.

BINDENDE LENS (niet heronderhandelen): dit is een architectuurverdict — KEEP / REFINE / KILL /
DEFER voor het gedaan-log-MVP-voorstel. Kies; geen "overweeg A of B". Agenda-locks heropen je
NIET. Analyse-SSOT-laagcontracten (analyse = waar/hoe, plan = wat, agenda = wanneer) zijn
input: evidence landt onder Analyse, niet als tweede scoringswaarheid.

## Drie + één oppervlakken (verankeren)

| Oppervlak | Vraag | Mag bevatten | Mag NIET |
|-----------|-------|--------------|----------|
| **Analyse / leefstijllijn** | Waar sta ik? | score, trend, delta, bron-label | advies-hero, "doe X vandaag" als hero |
| **Evidence / gedaan** | Wat deed ik? | modality_id, minuten of sessie, datum, week-aggregaat, label "op basis van wat jij noteerde" | parallelle 0–100-score; "live gemeten"; injectie in PlanStep-body |
| **Plan** | Wat kan ik? | pool/stappen, focus-modaliteit-teaser, link naar log | eigen scoringsengine; sensor-raw |
| **Agenda** | Wanneer? | (DEFER) slot via prioriteit + pool | done-log als completion-waarheid i.p.v. daily_action_log zonder expliciet contract |

Eén scoringswaarheid: intake-engine + trend-merge in account-dashboard.ts. Minuten converteren
NOOIT stilzwijgend naar domeinscore zonder expliciet, afgewezen of goedgekeurd model in dit
verdict (default: **niet converteren** — twee waarheden naast elkaar op hermeting).

## Dennis-hypothesen (stress-testen, niet gehoorzamen)

G1. **"Wat is gedaan?"** is een evidence-oppervlak onder/naast Analyse — niet Plan-hero, niet
    Agenda-MVP.
G2. **Modaliteiten-sectiebar** (kracht / wandelen / zone2 / herstel / …) = keuze + preference;
    landt in plan als zichtbare focus én in log als `modality_id`. SoonPill verdwijnt zodra
    log live is (geen "Binnenkort" naast werkende log).
G3. **Minuten (of sessies)** voeden een gedragsreeks naast de score-lijn; hermeting toont
    score-delta én volume. Geen stille minuten→score-conversie.
G4. **`daily_action_log` is te arm** (boolean toggle per action_key/dag). Ofwel uitbreiden met
    modality + minutes, ofwel dunne aparte `movement_session_log` (account-scoped,
    service-role / RLS deny-all). Kies één; pre-traffic-vriendelijk; analogie:
    `intake_nutrition_log` voor voeding-volume.
G5. **Anti half-advies:** op BewegingScreen worden leefstijllijn + gedaan de tweede hero ná
    gauge; voeding/supplement blijft secundair; modaliteiten worden actionable i.p.v. blog-grid
    met SoonPill.
G6. **Multi-domein later:** het evidence-contract is de blauwdruk; nu alleen beweging. Geen
    sibling-pariteit in MVP.

Per hypothese: bevestigen / aanscherpen / verwerpen — maar kiezen.

## Harde regels (niet heronderhandelen)

### Agenda-locks (18 jul 2026 — citeren, niet heropenen)
1. Build-trigger DEFER→BUILD: 2e-dag-retour dagelijkse-actie-habit < 30% in 2 opeenvolgende
   activatie-weken (N-floor).
2. `agenda_preferences` = kleine MVP-tabel, RLS deny-all, service-role-only.
3. Event `agenda.slot_tweaked` (domain, tweak_type — geen scores).
4. Fase 1 = beweging; verbinding = quickWin-only.
Refine: candidate-pool + swap + bucket; completie-agenda = `daily_action_log` tot anders
besloten — deze sessie mag alleen zeggen of gedaan-log agenda-completie raakt of gescheiden
blijft (aanbeveling: gescheiden tot agenda-MVP).

### Domeinmodel & copy
- 5 interventies; energie/herstel = readout — nooit leefstijllijn-rij, nooit agenda-slot
  (domain-role.ts).
- Copy: "op basis van je laatste check-in" / "op basis van wat jij noteerde" — nooit
  "live gemeten" (IA_ECOSYSTEEM.md:108,145).
- Geen scores/profiellabels in shareable/ICS/reminders (art. 9).
- RULES_VERSION-grens: delta's over grens niet-vergelijkbaar (DOMAIN_MODEL.md §7).

### Pre-traffic sprint
CURRENT_SPRINT.md: meten vóór schaal; geen Stripe; geen drempel-tuning op N<100. Alles vóór
week-0 = meet-/afleeswerk of kleinste evidence-slice — geen lp_*-schema, geen calendar/
wearable-OAuth, geen push. Botst een aanbeveling: label "ná verkeer" + metric + drempel.

### Privacy
Zelfgerapporteerde minuten = gezondheidsgerelateerd gedrag → treat als gevoelige/account-
gebonden data: account-scoped, geen PII in GA4/Clarity, register-check of dit een nieuw
verwerkingsdoel is t.o.v. bestaande check-ins (Fable: ja/nee + welk doc). Wearable blijft 503.

### Meet-standaard
Hergebruik eerst: `dashboard_beweging_modality_click`, `dashboard_beweging_plan_click`,
`dashboard_beweging_checkin_click`, `measurement.checkin_completed`,
`dashboard.daily_action_toggled`, `remeasure.*`. Nieuw event alleen met registratie-advies
(drie plekken als client): bijv. `movement.session_logged` — alleen als bestaande types tekort
schieten. Geen implementatie.

WERKWIJZE (verplicht, in volgorde — alleen analyse):

F0 Productfit (max 8 regels) — welk gat lost gedaan-log op t.o.v. (a) SoonPill-modaliteiten,
   (b) boolean daily_action alleen, (c) score-lijn zonder volume tot hermeting? Eén zin fit
   met "gratis Kompas sterker vóór betaald".

F1 Laag-contract Evidence (verplicht tekstdiagram) —
   - Evidence → Analyse/Voortgang/domein-deep: wat UI mag tonen (week-minuten, sessie-count,
     modality-mix, label).
   - Evidence → Plan: teaser/focus alleen; geen PlanStep die scores herschrijft.
   - Evidence ↛ Agenda-score; Evidence ↛ parallelle domeinscore.
   - Relatie tot `daily_action_log`: gescheiden vs uitbreiden — kies.

F2 UX-flow 0→hermeting (concreet, geen mockups) —
   Schets de happy path in stappen:
   1. Eerste score (intake of beweging-check-in)
   2. Kompas Beweging: sectiebar/chips modaliteiten (niet alleen blog-links)
   3. Log minuten (waar: Kompas, plan-pagina, of beide — kies één primaire)
   4. Plan toont focus + weekvolume
   5. Voortgang/leefstijllijn: score-lijn + volume-teaser
   6. Hermeting +30d: score-delta én "je noteerde Y min over Z dagen"
   Benoem wat er gebeurt bij 0 logs (lege state) — geen fake interpolatie.

F3 Datamodel-minimum (velden in woorden, geen SQL-migratie schrijven) —
   - Kies: extend `daily_action_log` vs nieuwe session-log-tabel vs hergebruik nutrition-log-
     patroon.
   - Minimale velden: account_id, date, modality_id, minutes (of duration_minutes),
     optional note/source="self_report", created_at.
   - Preference: last_selected_modality — in account prefs, plan_progress, of apart? Kies.
   - Hoe week/maand-aggregatie zonder timestamps te verliezen (les uit trend-bouw
     account-dashboard.ts:467-469 die ts weggooit).
   - Privacy/register: nieuw doel of bestaande meet-lus?

F4 Modaliteiten-catalogus —
   - Audit MOVEMENT_MODALITIES (BewegingScreen.tsx:28-58): krachttraining, wandelen, herstel,
     zone2 — blog/onderbouwing-hrefs. Wat blijft content-link, wat wordt loggable modality?
   - "Rust & herstel" als modality vs readout-herstel — naamconflicten oplossen.
   - Relatie tot movement.ts stappen (o.a. mov-training-log r.186-193) — vervangt done-log die
     stap, of is de stap de CTA naar de log?
   - Sectiebar vs huidige 2×2 grid: kies UI-patroon (chip-scroll vs grid) met 1 zin waarom,
     passend bij bestaande Kompas-light panel.

F5 Anti half-advies & IA —
   - Wat zakt in hiërarchie op BewegingScreen (voeding/supplement/Soon-copy)?
   - Naming: blijft "Bewegingsplan" in footer/template-title vs "Bewegingsanalyse" als shell —
     respecteer Analyse-SSOT-verdict als al beschikbaar; anders: voorwaardelijk advies
     ("als H1 KEEP rename → …").
   - Routes stabiel: `/intake/plan/movement`, `/intake/beweging`.

F6 Pre-traffic vs ná trigger —
   - Kleinste slice die wél vóór week-0 mag (geen lp_*, geen OAuth, geen push).
   - Wat DEFER blijft (agenda, wearable, multi-domein stats-hub, minuten→score-model).
   - Succesmetric vóór schaal: bijv. % accounts met ≥1 session_log in 7 dagen na beweging-
     check-in — kies één afleesbare metric + bestaande/nieuw event.

F7 Multi-domein horizon (kort) —
   Welk generiek evidence-contract hergebruikt slaap/stress/voeding later? Wat blijft
   beweging-specifiek (modaliteiten-lijst)? Verbinding = quickWin — geen gedaan-log-MVP daar.

F8 Verdict + NIET-lijst + handoffs —
   - KEEP / REFINE / KILL / DEFER voor gedaan-log-MVP als geheel.
   - Min 7 NIET-items, o.a.: parallelle score-engine; SoonPill laten staan naast live log;
     agenda-locks heropenen; wearable-OAuth; Stripe; lp_* vóór trigger; scores in ICS;
     stille minuten→score; sibling-domeinen in dezelfde slice.
   - Max 2 handoffs (titel + 1 zin): (1) implementatie gedaan-log beweging,
     (2) leefstijllijn-resolutie óf Analyse-SSOT-doc-sync — alleen als nog open.

## Verplichte bronnen

Domein & IA:
- docs/core/DOMAIN_MODEL.md — §5.1 analyse vs actie; naming; wearables op analyse-laag
- docs/core/ACCOUNT_DASHBOARD_SYSTEM.md — analyse vóór actie; signaalbronnen-horizon
- docs/core/IA_ECOSYSTEEM.md — leefstijllijn; geen "live gemeten"
- docs/core/STEPPED_CARE_MODEL.md — geen tweede primaire CTA
- docs/core/CURRENT_SPRINT.md — pre-traffic

Agenda (gelockt):
- docs/cursors/fable-agenda-checkin-verdict-2026-07.md
- docs/cursors/fable-agenda-refine-verdict-2026-07.md

Analyse-SSOT (input; niet heropenen als al geaccordeerd):
- docs/cursors/fable-bewegingsanalyse-leefstijllijn-2026-07.md
- (als verdict-doc al bestaat na sessie 2: citeer KEEP/REFINE + laag-contracten)

Plan / handbook:
- docs/plan/LEEFSTIJLPLAN_HANDBOOK.md — thin hub / thick detail
- docs/plan/ANALYSIS_PILLAR_COVERAGE.md — §2 voeding-asymmetrie (anti-scheefheid bij volume)

Code-spotchecks (minimaal; breid uit waar claim erom vraagt):
- src/components/dashboard/BewegingScreen.tsx — MOVEMENT_MODALITIES (r.28-58), gauge
  (r.214-253), leefstijllijn (r.255-260), check-in (r.262-312), voeding+supplement
  (r.314-481), modaliteiten SoonPill (r.483-538), plan-footer (r.542-549)
- src/components/dashboard/LeefstijllijnSection.tsx — surfaces voortgang|domain
- src/lib/leefstijllijn.ts — baseline=trend[0], delta ≥2 punten
- src/lib/daily-action-log.ts — toggleDailyAction / getDailyActionState (boolean keys)
- src/lib/account-dashboard.ts — trend-merge; ts weggegooid bij trend (≈467-469);
  voeding via nutrition_log (445-458) als analogie voor volume-reeks
- src/data/lifestyle-plans/movement.ts — title "Bewegingsplan na 40"; mov-training-log
  (r.186-193)
- src/lib/lifestyle-plan-eval.ts — selectVisibleSteps
- src/components/intake/NutritionCapture.tsx — nutrition_log_completed als UX/meet-analogie
  (patroon, geen copy-paste voeding in beweging)
- src/app/api/account/wearable/snapshot/route.ts — blijft 503

## Bekende feiten om te verifiëren (niet blind overnemen)

- Live: modaliteiten-grid met 4 items; de meeste hrefs = content; sectie heeft SoonPill
  "Binnenkort"; plan-footer "Stappen afvinken — bewegingsplan"; leefstijllijn-focus op
  beweging; daily_action_log = account-scoped boolean per domain+action_key+dag.
- Gaps: geen minutes-veld; geen modality preference persist; geen volume naast score op
  hermeting; trend[] zonder datum-as in row-model.
- Gelockt: agenda DEFER; fase 1 beweging; readouts geen slot; geen scores in reminders.
- Analogie: voeding heeft intake_nutrition_log → series.voeding; beweging heeft géén
  equivalent session-log.
- Spanning: mov-training-log stap ("Noteer 7 dagen…") vs echte log-UI — doublure of CTA?
- Spanning: modality "herstel" vs readout-pijler herstel — naming.

## Dennis-productschets (inspiratie — niet locken; Fable mag aanscherpen of verwerpen)

- Horizontale chip-scroll / sectiebar voor vormen i.p.v. alleen 2×2 blog-tegels.
- Plan toont "Deze week: 3× wandelen · 90 min" naast checklist.
- Hermeting: "Je score bewoog X; je noteerde Y minuten over Z dagen" — twee waarheden,
  één verhaal.
- Lege state: zachte CTA "Log je eerste sessie" i.p.v. lege grafiek met fake lijn.

## Outputstructuur (verplicht)

1. **Executive summary** — max 12 regels + bindend verdict (KEEP/REFINE/KILL/DEFER)
2. **Hypothese-oordelen** — G1–G6 elk: bevestigd / aangescherpt / verworpen + 2 regels bewijs
3. **Evidence-contract** — tekstdiagram Analyse ↔ Evidence ↔ Plan ↔ Agenda
4. **UX-flow 0→hermeting** — stappen + lege state + primaire log-surface
5. **Datamodel-keuze** — één optie + velden + privacy/register-oordeel
6. **Modaliteiten-besluit** — catalogus: loggable vs content-only; herstel-naming
7. **Pre-traffic slice** — wat mag nu; succesmetric; wat DEFER blijft
8. **Meetpunten** — bestaand eerst; nieuw alleen met registratie-advies
9. **NIET-lijst** — min 7 items met reden
10. **Dennis-checklist** + max 2 handoff-titels (titel + 1 zin)

## Regels

- Geen code, geen commits, geen migraties — alleen rapport
- Elke status-claim met bewijs (pad:regel of grep); anders → Dennis-checklist
- Geen vage "overweeg"-taal — kies, met onderbouwing
- Agenda-locks heropen je niet; wearable blijft 503; geen Stripe; geen lp_* vóór trigger
- Minuten ≠ score tenzij je conversie expliciet KEEP't (default: geen conversie)
- Geen "live gemeten"; zelfrapportage-label verplicht op volume-UI
- Sensor-data nooit in checklist-stappen
- Hergebruik bestaande event-types vóór je nieuwe verzint
- Sibling-domeinen en agenda-MVP buiten deze slice
```

---

## Na uitvoering

1. **Verdict + evidence-contract reviewen** — blijft score één waarheid? Landt volume naast
   de leefstijllijn zonder half-advies op BewegingScreen?
2. **Datamodel-keuze vastleggen** — extend `daily_action_log` vs nieuwe session-tabel; noteer
   privacy/register-implicatie.
3. **Pre-traffic-slice** — mag modaliteiten+minuten vóór week-0? Noteer succesmetric.
4. **SoonPill-regel** — bij KEEP/REFINE: Soon verdwijnt in dezelfde implementatieslice als
   de log live gaat.
5. **Handoffs** — max 2 pas uitwerken ná akkoord (verwacht: implementatie gedaan-log
   beweging; eventueel leefstijllijn-resolutie als Analyse-SSOT dat open liet).
