# Prompt — Microfix A2/A3/A6 (vóór E)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Cursor (of Claude) als **implementatie**.  
> **Bron-audit:** Opus pre-E audit 4 aug 2026 → **GO-MET-MICROFIX**.  
> **Voorwaarde:** migratie `20260801120000_account_priority_pref_movement_day_choice.sql` is **op productie gedraaid** (Dennis bevestigd).  
> **Output:** drie gerichte fixes in één PR/deploy. Geen E-UI, geen B, geen kalender-herbouw.  
> **Daarna:** aparte implementatie-prompt voor E (nog niet deze prompt).

## Vertaling van de audit


| Prompt           | Wat                                                             | Wanneer                  |
| ---------------- | --------------------------------------------------------------- | ------------------------ |
| **Deze**         | A2 refresh · A3 durable event · A6 plan-stap `done`             | Nu — eigen deploy        |
| **Volgende (E)** | Voorselectie + open/klaar-staat · geen B-deur · geen review 1–5 | Ná deze microfix stabiel |
| **Later**        | B slice 1 · F1a duur-tray · review+register · F1b nudge         | Parklijst audit §E       |


Geen conversie-CTA in deze slice — alleen waarheid + meetbaarheid.

---

## Prompt (copy-paste)

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).
Je voert drie gerichte microfixes uit vóór de Beweging-E slice. Geen UI-herontwerp
van de keuzetrechter, geen Consumentenbond-ladder, geen agenda week/maand-werk.

## Context
Lees vóór je begint:
- docs/cursors/claude-opus-beweging-pre-e-audit-prompt.md (kader)
- docs/cursors/claude-opus-beweging-mijn-dag-verdict-2026-08.md — KILL 7–9, H1/H2/H5
- Migratie movement_day_choice staat op productie — géén isMissingPrefColumn-workaround
  “dan maar niet persisteren”; schrijf en emit alsof de kolommen bestaan.

Bestanden (geverifieerd):
- src/components/dashboard/Dashboard.tsx — setPriorityPrefOverride (:3802);
  BewegingScreen-render zonder onPrefUpdated (:3117-3126)
- src/components/dashboard/BewegingScreen.tsx
- src/components/dashboard/beweging/MovementCockpit.tsx
- src/components/dashboard/beweging/MovementTodayHero.tsx — persistChoice (:281-289)
  fire-and-forget; postMovementDayChoice-respons wordt weggegooid
- src/lib/priority-pref-client.ts — postMovementDayChoice retourneert al
  AccountPriorityPrefData
- src/lib/dashboard-priority-selection.ts — patroon: onPrefUpdated(pref) ná succesvolle POST
- src/app/api/account/priority-pref/route.ts — set_movement_day_choice (:155-179)
  enige actie zonder emitEvent; kopieer patroon van restore_plan_step (:194-203)
- src/lib/events.ts — DOMAIN_EVENT_TYPES; voeg dashboard.movement_day_choice_set toe
- src/lib/agenda-timeline.ts — buildAnalysisBlock done: false (:228-231);
  buildWeekColumnBlocks (:124+)
- src/components/dashboard/agenda/AgendaDayTimeline.tsx — gridBlocks merge (:144-151)
- src/components/dashboard/agenda/AgendaTimelineChip.tsx — leest block.done
- src/lib/use-today-action-done.ts / src/lib/day-model.ts — isTodayActionDone (SSOT)
- src/components/dashboard/agenda/AgendaScreen.tsx — weekState.completedKeys
  (week-pad voor done)

## Taak — precies deze drie fixes

### A2 — Model-refresh na dagkeuze
1. Geef `onPrefUpdated: (pref: AccountPriorityPrefData | null) => void` door:
   Dashboard (domainView beweging) → BewegingScreen → MovementCockpit → MovementTodayHero.
2. In MovementTodayHero.persistChoice (en elk pad dat postMovementDayChoice aanroept,
   inclusief wis via "Wijzig keuze" / choice:null):
   - await of .then de respons
   - bij succes: onPrefUpdated(pref) — zelfde patroon als saveDashboardPrioritySelection
   - blijf non-blocking voor de UI-keuze in de sessie; bij netwerkfout: catch zonder
     de lokale selectie terug te draaien (bestaand gedrag), maar log géén console.log
3. Geen volledige dashboard-refetch. setPriorityPrefOverride is genoeg (Dashboard
   bouwt currentModel al uit priorityPrefOverride).

### A3 — Durable event dashboard.movement_day_choice_set
1. Voeg `"dashboard.movement_day_choice_set"` toe aan DOMAIN_EVENT_TYPES in events.ts.
2. In route.ts, in de set_movement_day_choice-tak, NA succesvolle setMovementDayChoice,
   vóór de JSON-response:
   void emitEvent({
     eventType: "dashboard.movement_day_choice_set",
     email: account.email ?? undefined,
     organizationId: account.organization_id,
     payload: {
       choice: choiceRaw,   // string tier of null bij wissen
       date: dateRaw,
       surface,
     },
   });
3. Dit is een server-emitted event → GEEN wijziging aan account-events-client of
   api/account/events allowlist.
4. Raak GA4 dashboard_vandaag_step_alternative NIET aan (blijft tegenlezing).
5. Voeg géén accepted_default toe in deze microfix — dat hoort bij de E-slice
   wanneer voorselectie landt.

### A6 — Plan-stap done in raster = SSOT
Gekozen aanpak (niet half-half): **wire `done` vanuit dezelfde bron als de knoppen**.
Chip-gedrag mag blijven; analysis-blokken krijgen een eerlijke `done`.

1. Laat buildAnalysisBlock / buildPlanStepBlock een optionele `done?: boolean`
   accepteren (default false voor backward compat in tests), OF voeg een kleine
   helper `withPlanStepDone(block, done: boolean): TimelineBlock` toe.
2. AgendaDayTimeline: voor vandaag, bepaal done via bestaande SSOT
   (useTodayActionDone(model) of equivalent keys + isTodayActionDone). Zet die
   waarde op het plan-stap-blok vóór merge in gridBlocks.
3. Week-pad: waar buildWeekColumnBlocks / AgendaWeekTimeGrid plan-stap in grid zet,
   zet done vanuit weekState.completedKeys + bestaande helpers
   (isWeekSlotCompleted / resolveActionKey — hergebruik, verzin geen parallelle sleutel).
4. Update/verwijder de achterhaalde comment in buildAnalysisBlock dat "geen UI-pad
   dit veld leest".
5. Voeg/breid unit tests in src/lib/__tests__/agenda-timeline.test.ts aan:
   - plan-stap met done:true behoudt done in week/day helper
   - zonder expliciete tijd blijft placement tray (A5 mag niet breken)

## Constraints
- Imports via `@/`
- Nederlandse UI strings alleen als je copy raakt (deze slice raakt bij voorkeur géén copy)
- Verander NIETS aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local
- Geen E-UI: geen voorselectie, geen klaar-staat-herbouw, geen review 1–5,
  geen "Verder vandaag", geen deur naar B
- Geen B-keuzeladder, geen C-premium, geen week/maand layout-wijzigingen
- Schrijf niet naar agenda_blocks of scheduled_time
- Activeer postTimeBucket / updateAccountTimeBucket NIET
- Geen nieuwe console.log
- Geen git commit (Dennis commit zelf)

## Acceptatiecriterium
- [ ] Kies op Beweging een zwaarte (niet trainen-gate-afhaken); ga zonder reload naar
      Mijn Dag → titel/tier volgt de keuze (A2)
- [ ] Wis via "Wijzig keuze" → Mijn Dag valt terug zonder reload; event payload
      choice: null (A2+A3)
- [ ] Elke set_movement_day_choice levert precies één durable
      dashboard.movement_day_choice_set (A3); events.ts bevat het type
- [ ] Met expliciete scheduled_time + afgevinkte dagstap: raster-chip toont done
      (opacity/vink) gelijk aan Beweging/Mijn Dag-detail (A6)
- [ ] Zonder scheduled_time: plan-stap blijft in tray; A5-gedrag ongewijzigd
- [ ] Geen nieuwe console.log in src/
- [ ] npx tsc --noEmit groen
- [ ] vitest groen voor geraakte tests (agenda-timeline + event-registratie als die bestaat)

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/components/dashboard/beweging src/components/dashboard/agenda src/lib/agenda-timeline.ts src/app/api/account/priority-pref src/lib/events.ts
2. npx tsc --noEmit
3. npx vitest run src/lib/__tests__/agenda-timeline.test.ts
4. grep -n "movement_day_choice_set" src/lib/events.ts src/app/api/account/priority-pref/route.ts
5. grep -n "onPrefUpdated" src/components/dashboard/BewegingScreen.tsx src/components/dashboard/beweging/MovementTodayHero.tsx

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit:
# git add -A && git commit -m "$(cat <<'EOF'
# fix(beweging): sync dagkeuze naar Mijn Dag, emit choice-event, plan-stap done in raster
#
# EOF
# )"

## Meetpunt
Meetpunt: dashboard.movement_day_choice_set — hier lees je af hoeveel dagen een
expliciete (of later: accepted) keuze vastlegt. Geen nieuw client-event.
GA4 dashboard_vandaag_step_alternative blijft ongewijzigd als tegenlezing.
```

---

## Wat jij daarna stuurt (niet nu)

Na merge/deploy van deze microfix → vraag om de **E-implementatieprompt**. Die krijgt:

- WEL uit audit §B (voorselectie, open/klaar, Verder vandaag read-only, poort blijft)
- NIET uit audit §C (geen B-deur, geen review 1–5, geen agenda-writes)
- `accepted_default` in event-payload pas in díe slice
- SQL al live → persistentie mag hard aangenomen worden

