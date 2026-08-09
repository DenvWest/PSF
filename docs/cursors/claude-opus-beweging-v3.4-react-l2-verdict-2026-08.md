# Verdict — Beweging v3.4 naar React: het L2-first pad

> Opgesteld 9 augustus 2026. Geen code gewijzigd in `src/`. Alle padverwijzingen zijn
> geverifieerd tegen de working tree op `main` (`8361013`).
> Bronnen: [`docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html`](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html),
> [`docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md),
> [`docs/cursors/beweging-f1a-gate6-verdict-2026-08.md`](beweging-f1a-gate6-verdict-2026-08.md),
> [`docs/cursors/fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md`](fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md).

---

## A. Executive verdict

**GO op het L2-first pad — met één herordening.**

1. Het F1a-meetvenster blokkeert precies niets van wat v3.4 lockt: scherm C en E-programma-rijen wonen op Voortgang en op de check-in-resultaatpagina, allebei buiten de bevriezingslijst.
2. Het check-in-resultaat is géén L1-surface. Het staat expliciet in de "WEL bouwen"-lijst en is tegelijk de scherpste klacht. Daarom is dát R0, niet de programProfile-uitbreiding.
3. Het resultaat voelt oud omdat het structureel ouder ís: slaap kreeg in [`sleep-assessment.ts:137`](../../src/lib/sleep-assessment.ts#L137) een conclusie-object, beweging nooit. Het is geen styling-achterstand maar een ontbrekend model.
4. `programProfile` bestaat al voor 60% ([`movement-plan-profile.ts:71`](../../src/lib/movement-plan-profile.ts#L71)); v3.4 vraagt vier velden erbij, allemaal in dezelfde answers-jsonb. **Geen DB-migratie in de hele reeks R0–R5.**
5. De v3.4-ladder (rung 1–6) bestaat nog nergens in `src/` — dat is de grootste bouwpost en hoort in R2, niet eerder.
6. Slaap/stress erven het C.1-sjabloon in R4, na beweging — niet parallel, anders sjabloneer je een vorm die zich nog niet bewezen heeft.

**KILL:** niets. **PIVOT:** alleen de volgorde binnen de gevraagde slice-lijst — R0 pakt de conclusie-kern van het resultaat, R3 pakt de persistentie en teruglezing ervan. Onderbouwing in §E.0.

---

## B. Diagnose — waarom het resultaat nu "oud" voelt

### B.1 De harde vergelijking

| | MovementCapture result | SleepCheckin result | v3.4 scherm C |
|---|---|---|---|
| Kop | `"Jouw beweeg-overzicht"` ([`:219`](../../src/components/intake/MovementCapture.tsx#L219)) | `"Jouw slaap-overzicht"` ([`:223`](../../src/components/intake/SleepCheckin.tsx#L223)) | `"Je basis — dit is genoeg om te beginnen"` (prebuild `:1833`) |
| Conclusie | **ontbreekt** | terra-kaart met headline + statement + secondaryHint ([`:230-248`](../../src/components/intake/SleepCheckin.tsx#L230-L248)) | basis-strip met titel + plan-regel |
| Acties | 4 keuzes × 11 dimensies = tot 44 knoppen ([`:252-279`](../../src/components/intake/MovementCapture.tsx#L252-L279)) | genummerde lijst van 3 ([`:250-283`](../../src/components/intake/SleepCheckin.tsx#L250-L283)) | max 3 per laag |
| Focus | **ontbreekt** — alles is even belangrijk | één dimensie, apart uitgelicht ([`:294-353`](../../src/components/intake/SleepCheckin.tsx#L294-L353)) | één basis + één extra |
| Volledig beeld | 11 gestapelde secties ([`:235-304`](../../src/components/intake/MovementCapture.tsx#L235-L304)) | chip-rij, één regel ([`:360-379`](../../src/components/intake/SleepCheckin.tsx#L360-L379)) | ladder-rail in de zijkolom |
| Vervolg | `/gids/beweging` | `/intake/plan/sleep` + dashboard-CTA ([`:402-406`](../../src/components/intake/SleepCheckin.tsx#L402-L406)) | terug naar de dagstap |
| Persistentie keuze | **geen** — `selected` is lokale state ([`:159-169`](../../src/components/intake/MovementCapture.tsx#L159-L169)) | PATCH naar `chosen_actions` ([`:170-201`](../../src/components/intake/SleepCheckin.tsx#L170-L201)) | n.v.t. |

### B.2 De vier oorzaken, met bestand en regel

**1. De engine levert geen conclusie.** [`assessMovement()`](../../src/lib/movement-assessment.ts#L50) retourneert een platte `MovementDimensionResult[]` — geen focus, geen headline, geen ranking. Slaap heeft naast `assessSleep()` een tweede functie [`buildSleepConclusion()`](../../src/lib/sleep-assessment.ts#L137) die de zwakste *actionable* dimensie kiest en er drie acties bij levert. Bij beweging bestaat dat tweede niveau niet, dus kan de UI niets anders dan alles even hard tonen.

**2. De API-response draagt de conclusie dus ook niet.** [`route.ts:261-264`](../../src/app/api/intake/movement-checkin/route.ts#L261-L264) geeft `{ assessment, start, mode }`. De slaap-route geeft er `checkinId` en `conclusion` bij en schrijft `focus_dimension`, `conclusion_text`, `conclusion_actions` en `chosen_actions` mee in `raw_inputs` ([`sleep-checkin/route.ts:341-364`](../../src/app/api/intake/sleep-checkin/route.ts#L341-L364)). Beweging schrijft alleen het kale rapport ([`:182-190`](../../src/app/api/intake/movement-checkin/route.ts#L182-L190)). Gevolg: er is niets om later op Voortgang terug te lezen — geen conclusie, geen gekozen actie.

**3. Het scherm schendt twee eigen ontwerpregels.** De 11-secties-stapel is exact BESLUIT §A.4 verbod 3 ("permanent gestapeld advies"). En de primaire CTA gebruikt tweemaal het verboden woord **stappenplan** ([`:310`](../../src/components/intake/MovementCapture.tsx#L310) en [`:316`](../../src/components/intake/MovementCapture.tsx#L316)) — BESLUIT §C.2 verbiedt dat zonder uitzondering, ook in de intake-flow.

**4. Er is geen brug terug naar de doe-surface.** De enige CTA's zijn `/gids/beweging` en `/intake` ([`:308-328`](../../src/components/intake/MovementCapture.tsx#L308-L328)). `buildDashboardVandaagHref()` is al geïmporteerd ([`:10`](../../src/components/intake/MovementCapture.tsx#L10)) en wordt in de volledige modus nergens gebruikt — alleen in de pulse-tak ([`:190-210`](../../src/components/intake/MovementCapture.tsx#L190-L210)). Wie de check afmaakt komt dus niet uit bij zijn eigen dagstap.

**Wat níét de oorzaak is.** De styling is niet het probleem: de terra/sage-tokens, kaartradii en typografie zijn identiek aan `SleepCheckin`. Wie hier "opnieuw designt" zonder het conclusie-model te bouwen, verplaatst de stapel.

---

## C. Drie-laagmodellen-mapping

Drie modellen, drie assen. Ze zijn many-to-many en mogen niet in elkaar geschoven worden.

| Model | Assen | Vraag die het beantwoordt |
|---|---|---|
| **Product-IA L1–L3** (BESLUIT §A.2) | surface | *Waar staat het op het scherm?* |
| **Domeincontract C.1–C.4** (Fable-verdict aug 2026) | functie | *Welk soort ding is het?* |
| **v3.4-ladder rung 1–6** (prebuild `:2954-3040`) | inhoud | *Waar in de leefstijl-hiërarchie hoort het?* |

### C.1 De kruistabel

| | L1 · Beweging (doe) | L2 · Voortgang › Beweging | L3 · advies-deur |
|---|---|---|---|
| **C.1 analyse-shell** | één regel als *reden* onder het voorstel — nooit een blok | **primair**: stand-tegel, sparkline, richtlijncontext, ladder | — |
| **C.2 advies-ladder** | de brug (rung 1–3, laag 2 read-only, max 3 acties) | **primair**: rung 1–6 met "Wat kun je hier doen?" op 3–6 | — |
| **C.3 product-oordeel** | verboden in elke staat | de deur ernaartoe, gegate | **primair**: `BewegingAdviesTreden` |
| **C.4 klaar-staat-gate** | **de gate zélf leeft hier** — `resolveDayStepState()` | consument van de gate | consument + tweede poort (voedingscheck) |

### C.2 Rungs versus lagen — de verwarring die je moet vermijden

- **Rung ≠ L-laag.** Rung 6 (supplementen · wearables) is *inhoud* en woont fysiek op **L2**, achter de C.3-deur. Er bestaat geen "L3-scherm"; L3 is een rol die een sheet op L2 vervult.
- **De drie treden in [`BewegingAdviesTreden`](../../src/lib/beweging-advies-treden.ts#L37) zijn geen rungs.** Trede 1/2/3 = *interventie → meten → aanvullen*, de stepped-care-volgorde bínnen C.3. Rungs 1–6 = de leefstijl-hiërarchie. Ze delen alleen het woord "trede/laag" en moeten in copy uit elkaar blijven: de treden heten treden, de ladder heet lagen.
- **Rung 1–3 verschijnen op twee plekken tegelijk.** Read-only in de brug op L1 ([`beweging-help-bridge.ts:29`](../../src/lib/beweging-help-bridge.ts#L29)), bewerkbaar op L2. Dat is bewust: één staat, twee uitlezingen (prebuild-lock 10).
- **C.4 is de enige regel die alle drie de modellen tegelijk raakt.** Zolang `resolveDayStepState()` `"open"` teruggeeft ([`domain-ready-state.ts:26`](../../src/lib/domain-ready-state.ts#L26)), is L1 de enige primary, mag C.3 niet promoveren en is rung 3–6 op L1 onzichtbaar.

### C.3 Wat vandaag al op de goede plek staat

| Ding | Model-coördinaat | Waar |
|---|---|---|
| Stand-tegel + gauge + sparkline | L2 · C.1 · rung-agnostisch | [`VoortgangDomeinScreen.tsx:172-209`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L172-L209) |
| Advies-deur met dubbele poort | L2→L3 · C.3 · rung 6 | [`VoortgangDomeinScreen.tsx:91-96`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L91-L96) + [`:241-278`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L241-L278) |
| Drie treden | L3 · C.3 · rung 6 | [`BewegingAdviesTreden.tsx:140-232`](../../src/components/dashboard/voortgang/BewegingAdviesTreden.tsx#L140-L232) |
| Brug rung 1–3 | L1 · C.2 · rung 1–3 | [`AgendaDayTimeline.tsx:537-541`](../../src/components/dashboard/agenda/AgendaDayTimeline.tsx#L537-L541) |
| Klaar-staat-gate | alle drie | [`domain-ready-state.ts`](../../src/lib/domain-ready-state.ts) — **nog nergens aangeroepen in `src/`** |

> De laatste rij is een echte bevinding: `resolveDayStepState` en `adviceMayOutrankDayStep` zijn geschreven en getest maar hebben nul consumenten. De gate bestaat als contract, niet als gedrag. Dat is geen R0-werk (het raakt L1), maar het hoort op de na-20-augustus-lijst.

---

## D. programProfile SSOT-plan

### D.1 Waar het vandaag verspreid zit

Alles woont in dezelfde `intake_sessions.answers`-jsonb, maar met **drie parsers, twee schrijvers en vier lezers**:

| Veld | Answers-key | Type-guard | Bron-bestand |
|---|---|---|---|
| `startPattern` | `preferredStartPattern` | `isMovementStartPattern` | [`movement-prefs.ts:24`](../../src/lib/movement-prefs.ts#L24) |
| `anchor` | `movementAnchor` | `isMovementAnchor` | [`movement-prefs.ts:25`](../../src/lib/movement-prefs.ts#L25) |
| `preferredSport` (legacy) | `preferredSport` | `isMovementSport` | [`movement-plan-profile.ts:29`](../../src/lib/movement-plan-profile.ts#L29) |
| `weeklyFrequency` | `weeklyAvailability` | `isMovementWeeklyFrequency` | [`movement-plan-profile.ts:30`](../../src/lib/movement-plan-profile.ts#L30) |
| `trainingLocation` | `trainingLocation` | `isMovementTrainingLocation` | [`movement-plan-profile.ts:31`](../../src/lib/movement-plan-profile.ts#L31) |
| `sports[]` | `sports` | `parseSportsArray` | [`movement-plan-profile.ts:32`](../../src/lib/movement-plan-profile.ts#L32) |
| `targetMinutes/Days/Strength` | idem | `isMovementTarget*` | [`data/movement/targets.ts`](../../src/data/movement/targets.ts) |
| MOV2_*-huidige beeld | `MOV2_*` | — | [`movement-target.ts:126`](../../src/lib/movement-target.ts#L126) / [`:145`](../../src/lib/movement-target.ts#L145) |

Lezers: `parseMovementPlanProfile()` (server + API), `useMovementPlanProfile()` client-cache ([`use-movement-plan-profile.ts:25`](../../src/lib/use-movement-plan-profile.ts#L25)), `model.movementPrefs` op `DashboardModel`, en `deriveMovementCurrent()` op dezelfde blob maar andere keys. Schrijvers: `mergeMovementPlanProfilePatch()` via `/api/account/movement-prefs` ([`route.ts:219`](../../src/app/api/account/movement-prefs/route.ts#L219)) en `mergeMovementCheckinIntoAnswers()` via de check-in-route ([`movement-checkin/route.ts:220`](../../src/app/api/intake/movement-checkin/route.ts#L220)).

**Het is dus al één opslag maar nog geen één contract.** Dat is goed nieuws: de SSOT-stap is een typeverbreding, geen datamigratie.

### D.2 Gat ten opzichte van v3.4

| v3.4-veld (prebuild `:2178-2201`) | Bestaat? | Doel |
|---|---|---|
| `frequency` (1\|2\|3) | ✅ `weeklyFrequency` | ongewijzigd |
| `place` (thuis·gym·groep·coach) | ⚠️ half | `trainingLocation` blijft 2-waardig; **nieuw** `guidance: zelf\|groep\|coach` |
| `strengthLevel` (beginner\|ervaren) | ❌ | **nieuw** |
| `conditionForm` (5 vormen) | ❌ | **nieuw** — sessie-variant binnen duurbasis |
| `sport` | ✅ `sports[]` | ongewijzigd, blijft copy-only |
| `experience` / zelf-calibratie | ❌ | **nieuw** — zelfverklaring náást de gemeten stand |
| `nutritionCheck` | ✅ afgeleid | [`VoortgangDomeinScreen.tsx:91-92`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L91-L92) |

### D.3 Migratiepad — backward compatible, nul SQL

1. Vier nieuwe answers-keys (`movementGuidance`, `strengthLevel`, `conditionForm`, `selfCalibration`), elk met een eigen type-guard in de stijl van `isMovementTrainingLocation` ([`movement-plan-profile.ts:65`](../../src/lib/movement-plan-profile.ts#L65)).
2. `MovementPlanProfile` krijgt vier nullable velden; `EMPTY_MOVEMENT_PLAN_PROFILE` ([`:82`](../../src/lib/movement-plan-profile.ts#L82)) vult ze met `null`. Elke bestaande sessie parseert dus gewoon door.
3. `MovementPlanProfilePatch` + `mergeMovementPlanProfilePatch` ([`:255-321`](../../src/lib/movement-plan-profile.ts#L255-L321)) krijgen dezelfde vier takken.
4. **`carryOverMovementPlanProfile()` ([`:178`](../../src/lib/movement-plan-profile.ts#L178)) MOET meegroeien** — vergeet je dat, dan verliest elke hermeting de nieuwe velden. Dat is de enige echte valkuil in R1.
5. `hasMovementPlanProfileValues()` ([`:156`](../../src/lib/movement-plan-profile.ts#L156)) krijgt de vier extra disjuncten.

De `place`-splitsing verdient één expliciete lock: **in de UI één control, in de data twee velden.** De prebuild zegt dit zelf (`:2156-2162`). Wie het als één veld van vier waarden opslaat, moet later migreren.

### D.4 Wat stuurt, en wat leest terug

| Element | Bron | Rol |
|---|---|---|
| Kop scherm A/E | `weeklyFrequency` + `startPattern` | **stuurt** |
| Sublead | `trainingLocation` + `guidance` + `targetMinutes` | **stuurt** |
| Vormregel ("vijf oefeningen…") | `strengthLevel` × `place` (8 combinaties, prebuild `:2207-2220`) | **stuurt** |
| Conditie-regel | `conditionForm` | **stuurt** |
| Gap-uitspraak | `sports[]` | **copy-only** — nooit plan, dosis of dagstap |
| Dagbeeld/dagstap | `targetMinutes` → `resolveMovementProgramDose()` ([`movement-target.ts:261`](../../src/lib/movement-target.ts#L261)) | **stuurt** |
| Sessieduur in de sheet | `entry.durationMin` uit de sessie-catalogus | **readout** |

> **LOCK dose vs dayDur.** `targetMinutes` is je dóél en stuurt de kaart. `durationMin` is wat de sessie duurt en is uitlezing. Twee duur-begrippen, nooit één veld — precies zoals prebuild-lock 2. Elke poging ze te verenigen produceert een kaart die verandert als je een variant opent.

---

## E. Slice-roadmap R0–R5

### E.0 De herordening, met reden

De gevraagde lijst zette het check-in-resultaat op R3. Dat kan niet: R1 (laag-2-paneel) en R3 (resultaat) delen precies één ding — het conclusie-object — en dat object bestaat nog niet. Bouw je R1 eerst, dan verzint het paneel zijn eigen samenvatting en heb je in R3 twee conclusiebronnen. Daarom:

- **R0 = de conclusie-kern**: engine + response + het resultaatscherm dat erop rust. Hoogste impact (het is Dennis' klacht), kleinste blast radius, nul afhankelijkheden.
- **R3 = de persistentie-helft** van het resultaat: `chosen_actions`, teruglezing op Voortgang, hermeting-delta op de conclusie.

De rest van de nummering staat zoals gevraagd.

---

### R0 · Conclusie-model beweegcheck

| | |
|---|---|
| **Doel** | Het volledige-check-resultaat geeft één conclusie, drie acties en één focus — in plaats van elf gelijkwaardige secties. |
| **Bestanden** | `src/lib/movement-assessment.ts` (uitbreiden), `src/data/movement-checkin/index.ts` (labels + focus-orde), `src/app/api/intake/movement-checkin/route.ts` (response + `raw_inputs`), `src/components/intake/MovementCapture.tsx` (resultaat-tak), `src/lib/__tests__/movement-assessment.test.ts` |
| **Prebuild-only of code** | **Code** |
| **Meet-gate** | `movement_checkin_completed` moet in GA4 verschijnen met `focus_dimension`; conclusie-tekst moet in `intake_domain_checkin.raw_inputs` staan. |
| **F1a-conflict** | **Nee.** Raakt geen `MovementTodayHero`, geen voorselectie, geen hero-copy, geen check-nudge, geen tier-picker. |

**Meetpunt:** `movement_checkin_completed` + het bestaande `measurement.checkin_completed` — hier lees je het effect af.

---

### R1 · programProfile SSOT + laag-2-paneel op Voortgang

| | |
|---|---|
| **Doel** | Vier ontbrekende velden uit §D.2 landen in het bestaande profiel; Voortgang › Beweging krijgt "Jouw programma" als bewerkbaar paneel met dezelfde staat als de sheet op L1. |
| **Bestanden** | `movement-plan-profile.ts`, `use-movement-plan-profile.ts`, `api/account/movement-prefs/route.ts`, nieuw `src/components/dashboard/voortgang/BewegingProgrammaPaneel.tsx`, `VoortgangDomeinScreen.tsx` |
| **Prebuild-only of code** | Code. Copy 1-op-1 uit prebuild `:2163-2220` (PLACES + FORM_COPY) — niet opnieuw formuleren. |
| **Meet-gate** | `movement.location_selected` en `movement.target_set` moeten óók vanaf `surface: "voortgang"` binnenkomen. |
| **F1a-conflict** | **Nee** — Voortgang staat buiten het venster. Wél: het paneel mag de kop op L1 nog niet herschrijven; dat is een na-20-augustus-slice. |

**Meetpunt:** `dashboard.beweging_programma_open` met `from: "voortgang"` — hier lees je het effect af.

---

### R2 · Ladder rung 1–6 + zelf-calibratie

| | |
|---|---|
| **Doel** | De leefstijl-ladder komt in code (bestaat vandaag **nergens** in `src/`), met "Wat kun je hier doen?" op rung 3–6 (max 3 acties, nooit een dag-knop op 4/5/6) en de sheet "Ik zit al verder op mijn ladder". |
| **Bestanden** | nieuw `src/data/movement/lifestyle-ladder.ts` (de zes rungs uit prebuild `:2954-3040`, letterlijk), nieuw `src/lib/movement-ladder.ts` (`layerState`, `aboveLine`, zelf-calibratie-resolutie), nieuwe componenten onder `src/components/dashboard/voortgang/` |
| **Prebuild-only of code** | Code, maar de **inhoud** is prebuild-canon: `ev`, `wel`, `niet`, `src` per rung overnemen, niet herschrijven. |
| **Meet-gate** | Zelf-calibratie is het enige echt nieuwe event van de hele reeks — zie §G.3. |
| **F1a-conflict** | **Nee.** Let op rung 6: hij blijft gegate op voedingscheck **én** hertest — dezelfde dubbele poort als [`VoortgangDomeinScreen.tsx:95-96`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L95-L96), niet een derde. |

**Meetpunt:** `movement.self_calibration_set` — hier lees je het effect af.

---

### R3 · Resultaat-persistentie + teruglezing

| | |
|---|---|
| **Doel** | De gekozen actie overleeft het scherm en verschijnt op Voortgang ("Je koos: …, twee dagen geleden"). |
| **Bestanden** | `api/intake/movement-checkin/route.ts` (`.select("id")` + `PATCH`-handler, exact het slaap-patroon uit [`sleep-checkin/route.ts:150-215`](../../src/app/api/intake/sleep-checkin/route.ts#L150-L215)), `MovementCapture.tsx`, `movement-assessment.ts` (`parseMovementCheckinFocus`, spiegel van [`sleep-assessment.ts:172`](../../src/lib/sleep-assessment.ts#L172)), `VoortgangDomeinScreen.tsx` |
| **Prebuild-only of code** | Code |
| **Meet-gate** | Ratio `chosen_actions ≠ []` over alle volledige beweegchecks in P1. |
| **F1a-conflict** | **Nee** |

**Meetpunt:** `movement_checkin_action_click` — hier lees je het effect af.

---

### R4 · Slaap/stress Voortgang-rij (C.1-sjabloon)

| | |
|---|---|
| **Doel** | De analyse-shell wordt domein-agnostisch: één component dat conclusie + focus + statusrij per domein rendert, met beweging als eerste consument en slaap/stress als tweede en derde. |
| **Bestanden** | nieuw `src/lib/domain-analyse-shell.ts` (adapter per domein), `VoortgangDomeinScreen.tsx`, hergebruik `parseSleepCheckinFocus()` dat al bestaat |
| **Prebuild-only of code** | Code |
| **Meet-gate** | `domain_tool.snapshot_viewed` ([`VoortgangDomeinScreen.tsx:99`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L99)) krijgt `has_conclusion: boolean` — geen nieuw event. |
| **F1a-conflict** | **Nee** |

> **Erfenis-lock — houd slaap/stress strikt gescheiden van de beweging-rungs.** Slaap en stress erven **C.1 (analyse-shell)** en **C.4 (klaar-staat-gate)**: conclusie, focus, statusrij, en de regel dat advies pas mag promoveren bij een gesloten dagstap. Ze erven **niet** de zes rungs en **niet** `programProfile`. De ladder is beweging-specifiek — hij ordent trainingsbelasting, en "periodisering" heeft geen slaap-equivalent. Slaap heeft zijn eigen inhoudelijke hiërarchie (ritme → omgeving → belasting → middel) die in een eigen slice hoort. Wie de rungs generaliseert, exporteert een beweging-metafoor naar een domein dat er niet op past. Wat slaap/stress wél alvast hebben: `SleepConclusion` bestaat al en `parseSleepCheckinFocus` ook — R4 is voor slaap dus grotendeels bedraden, niet bouwen. Stress heeft nog geen check-in-engine en is daarmee de duurste van de drie; plan die apart.

**Meetpunt:** `domain_tool.snapshot_viewed` met `has_conclusion` — hier lees je het effect af.

---

### R5 · Agenda-leesregel + Mijn Dag koppelstrip

| | |
|---|---|
| **Doel** | Het laag-2-paneel toont read-only waar de stap landt ("Komt op Mijn Dag · donderdag · 18:00"), en Mijn Dag toont één koppelstrip terug naar het domein. |
| **Bestanden** | `src/lib/agenda-week-preview.ts` (bestaande `WeekDaySlot` als bron), `BewegingProgrammaPaneel.tsx`, `AgendaDayTimeline.tsx` |
| **Prebuild-only of code** | Code, maar **lezen only** — geen tweede vinklijst, geen tweede tijd-picker. |
| **Meet-gate** | Geen nieuw event; `dashboard.movement_day_choice_set` ([`events.ts:21`](../../src/lib/events.ts#L21)) blijft de bron. |
| **F1a-conflict** | **Nee**, mits de strip op Mijn Dag staat en niet op de beweging-hero. |

**Meetpunt:** `dashboard.movement_day_choice_set` — hier lees je het effect af.

---

### E.6 Ná 20 augustus 2026 — de L1-slices, apart

Deze staan **niet** in R0–R5 en mogen pas in de wacht na het gate-6-verdict.

| Slice | Scherm | Wat | Waarom bevroren |
|---|---|---|---|
| **L1-#a** | v3.4 scherm A (eerste keer) | Kop = frequentie + wat, sublead = plek + duur, dynamisch uit `programProfile` | Wijzigt hero-copy én het voorstel — raakt `accepted_default` direct |
| **L1-#e** | v3.4 scherm E (elke dag daarna) | Weekstand-regel, read-only conditie-tweede-regel, programma-rijen in het open paneel | Zit in `MovementTodayHero`; de conditie-regel is een tweede leesobject naast het voorstel |
| **L1-#gate** | beide | `resolveDayStepState()` daadwerkelijk bedraden (zie §C.3) | Verandert wanneer advies zichtbaar wordt — dat is precies wat het venster meet |

Voorwaarde voor alle drie: `accepted_default_rate ≥ 60%` over de volle P1, zoals gelockt in het gate-6-verdict §2.1.

---

## F. Agenda-koppeling per domein

### F.1 Wat vandaag live is

| Onderdeel | Bestand | Domein-dekking |
|---|---|---|
| Dag-timeline (geometrie, snapping, blokken) | [`agenda-timeline.ts`](../../src/lib/agenda-timeline.ts) | alle domeinen |
| Week-preview + slot-toewijzing | [`agenda-week-preview.ts:82-99`](../../src/lib/agenda-week-preview.ts#L82-L99) | alle domeinen, via `model.ladder` |
| Brug-sheet vanuit de dag | [`AgendaDayTimeline.tsx:537-541`](../../src/components/dashboard/agenda/AgendaDayTimeline.tsx#L537-L541) | **alleen beweging** |
| Statusstrip Check→Advies→Favorieten→Beste | [`beweging-help-bridge.ts:29-52`](../../src/lib/beweging-help-bridge.ts#L29-L52) | **alleen beweging** |
| Afvinken | `daily_action_log` via `use-daily-action-log` | alle domeinen |

Beweging is dus het enige domein met een end-to-end koppeling; de rest deelt alleen de timeline.

### F.2 Wat DEFER blijft

- **Tweakbare weekagenda** — blijft DEFER, ongewijzigd. De trigger uit het agenda-check-in-verdict (2e-dag-retour < 30%) is niet geraakt.
- **Week-readout op Mijn Dag** — prebuild-lock v3.3 nr. 8 zegt zelf DEFER, alleen in reviewermodus.
- **Slot-swap binnen domein / `agenda_preferences`-tabel** — hoort bij de weekagenda-trigger, niet bij deze reeks. Zou een DB-migratie vergen en breekt daarmee de nul-SQL-belofte van R0–R5.

### F.3 Wat wel in R4/R5 kan

- **R4**: `buildBewegingHelpBridge` generaliseren naar `buildDomainHelpBridge(domain, …)`. De vier punten zijn al domein-agnostisch geformuleerd; alleen `findMovementStepTitle` en `programLabelFor` zijn beweging-specifiek en gaan achter een per-domein-adapter.
- **R5**: de leesregel. Read-only, één regel, uit de bestaande `WeekDaySlot`. Geen nieuwe opslag.

---

## G. Meetplan per slice — hergebruik eerst

### G.1 Wat al bestaat en dus hergebruikt wordt

**Durable (`domain_events`)** — [`events.ts:21`](../../src/lib/events.ts#L21), [`:51-56`](../../src/lib/events.ts#L51-L56):
`dashboard.movement_day_choice_set` · `movement.session_logged` · `movement.target_set` · `movement.location_selected` · `movement.sport_selected` · `movement.gap_shown` · `dashboard.beweging_programma_open` · `measurement.checkin_completed` · `measurement.direction_detected`

**GA4** — `domain_tool.snapshot_viewed`, `dashboard_beweging_checkin_click`, `dashboard_beweging_supplement_click` ([`VoortgangDomeinScreen.tsx:99`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L99), [`:104`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L104), [`:116`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L116)), `movement_plan_profile_updated`, `movement_target_set`, `movement_location_selected` ([`use-movement-plan-profile.ts:71-97`](../../src/lib/use-movement-plan-profile.ts#L71-L97))

**Clarity** — `movement_flow` ([`MovementCapture.tsx:86`](../../src/components/intake/MovementCapture.tsx#L86)), `dashboard_beweging_advies`, `dashboard_voortgang_domein`

### G.2 Per slice

| Slice | Hergebruik | Nieuw | Registratie nodig? |
|---|---|---|---|
| **R0** | `measurement.checkin_completed` (server, al live) · `clarityTag("movement_flow", …)` | GA4 `movement_checkin_completed` (spiegel van `sleep_checkin_completed`, [`SleepCheckin.tsx:153`](../../src/components/intake/SleepCheckin.tsx#L153)) | **Nee** — `trackEvent()` neemt een vrije string ([`ga4.ts:28-30`](../../src/lib/ga4.ts#L28-L30)); GA4 is geen union |
| **R1** | `movement.location_selected` · `movement.target_set` · `dashboard.beweging_programma_open` | alleen een extra `surface`-parameter | **Nee** |
| **R2** | `dashboard.beweging_programma_open` voor het openen van de ladder-sheet | **`movement.self_calibration_set`** | **Ja** — zie §G.3 |
| **R3** | — | GA4 `movement_checkin_action_click` | **Nee** |
| **R4** | `domain_tool.snapshot_viewed` + parameter `has_conclusion` | — | **Nee** |
| **R5** | `dashboard.movement_day_choice_set` | — | **Nee** |

### G.3 Registratiepad voor het ene nieuwe client-event

`movement.self_calibration_set` is het enige event in de hele reeks dat een echt domain-event moet zijn (het is een gebruikersuitspraak die een staat verzet, geen klik). Drie plekken, in deze volgorde:

1. `src/lib/events.ts` — toevoegen aan de `DomainEventType`-lijst, bij de andere `movement.*` op [`:51-55`](../../src/lib/events.ts#L51-L55).
2. `src/lib/intake-events-client.ts` — toevoegen aan de `ClientEmitType`-`Extract`-union.
3. `src/app/api/intake/events/route.ts` — toevoegen aan de `CLIENT_EMIT_TYPES`-set op [`:12-38`](../../src/app/api/intake/events/route.ts#L12-L38).

> Als de calibratie via `/api/account/movement-prefs` loopt in plaats van de intake-route, is stap 2 en 3 `account-events-client.ts` in plaats van `intake-events-client.ts` — kies één pad, niet beide.

**Payload-regel:** geen vrije tekst. `sportOwn` uit de prebuild (`:2196`) is data, geen event-veld — dat gaat naar de answers-jsonb en nooit naar GA4 of Clarity.

---

## H. Risico's en de bewuste NIET-lijst

### H.1 Risico's

| # | Risico | Kans | Mitigatie |
|---|---|---|---|
| 1 | **`carryOverMovementPlanProfile` vergeten** bij de vier nieuwe velden → hermeting wist het profiel | hoog | Testcase in `movement-plan-profile.test.ts` die *alle* velden van een gevuld profiel door een carry-over haalt |
| 2 | **`klachten` als focus** → medische claim | middel | Focus-kandidaten expliciet whitelisten (§ R0-spec). `klachten` en `herstel` zijn moderatoren, nooit focus |
| 3 | **Twee conclusiebronnen** als R1 vóór R0 gebouwd wordt | middel | De herordening in §E.0 — R0 eerst, altijd |
| 4 | **Rung-copy herschrijven** in plaats van overnemen uit de prebuild | middel | R2-spec verwijst naar `:2954-3040` als canon; bronvermeldingen (`WHO 2020`, `ACSM`) letterlijk mee |
| 5 | **`place` als één veld van vier waarden** opslaan | laag | §D.3 lock: UI één control, data twee velden |
| 6 | **Verboden woorden sluipen terug** ("stappenplan" staat er nu nog in) | middel | Grep op de §C.2-lijst als acceptatiecriterium in elke slice |
| 7 | **F1a-vertekening** via een tweede route naar de check | laag | R0 verandert geen enkele ingang naar `/intake/beweging`, alleen het resultaat |

### H.2 Bewust NIET

- **Geen DB-migratie** in R0–R5. Alles past in bestaande jsonb-kolommen.
- **Geen aanraking van `MovementTodayHero`, `BewegingScreen`-nudge, voorselectie of tier-picker** vóór 20 augustus.
- **Geen scherm B** (Maak een keuze). Blijft geparkeerd; rung 4 linkt ernaartoe en verder niets.
- **Geen tweede afvinkbare eenheid** waar dan ook — `daily_action_log` blijft de enige.
- **Geen affiliate of prijs** in het dashboard, ook niet op rung 5 of 6 (prebuild-lock 9).
- **Geen wearables-integratie** — rung 6 noemt ze, het product doet er niets mee.
- **Geen ladder voor slaap/stress.** Zie de erfenis-lock in R4.
- **Geen `next build` of `rm -rf .next`** tijdens een draaiende dev-server.

---

## I. De ene volgende actie voor Dennis

Draai de Cursor-prompt in §J (slice R0) en review het resultaat op 375px — dat is één sessie werk, raakt geen bevroren surface, en lost de klacht die dit hele document uitlokte.

---

## J. Cursor-prompt slice R0

```text
## Rol
Je bent senior Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).
Je bouwt het conclusie-model voor de beweegcheck: de check-in-resultaatpagina krijgt één
conclusie met drie acties en één focus, in plaats van elf gelijkwaardige dimensie-secties.

## Context
Lees vóór je begint:
- docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md — §A.4 (vijf ontwerpverboden) en §C.2
  (verboden UI-woorden). Let op: "stappenplan" is verboden en staat nu nog in de code.
- docs/cursors/claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md — §B (diagnose) en
  §E (slice R0)

Bestanden (exacte paden, geverifieerd):
- src/lib/sleep-assessment.ts — HET REFERENTIEPATROON. Kopieer de vorm van
  `SleepConclusion` (regel 41-48) en `buildSleepConclusion` (regel 137-162).
  Beweging krijgt hetzelfde tweede niveau bovenop de bestaande dimensie-lijst.
- src/components/intake/SleepCheckin.tsx — HET REFERENTIEPATROON voor de UI.
  Conclusie-kaart regel 230-248, "Jouw volgende 3 acties" regel 250-283,
  focus-blok regel 294-353, statusrij met chips regel 360-379.
- src/lib/movement-assessment.ts — hier komt de nieuwe functie bij. `assessMovement()`
  (regel 50-67) blijft ONGEWIJZIGD; er komt een tweede export naast.
- src/data/movement-checkin/index.ts — MOVEMENT_QUESTIONS, MOVEMENT_STATEMENTS,
  MOVEMENT_CHOICES, MOVEMENT_DEEPEN. Hier komen twee nieuwe exports bij.
- src/components/intake/MovementCapture.tsx — de resultaat-tak (regel 216-332) wordt
  herbouwd. DIMENSION_LABELS (regel 37-49) verhuist naar de datamodule.
- src/app/api/intake/movement-checkin/route.ts — response (regel 261-264) en de
  `raw_inputs` van de insert (regel 182-190) krijgen de conclusie mee.
- src/lib/__tests__/movement-assessment.test.ts — bestaande tests blijven staan,
  er komt een describe-blok bij.

## Taak

### 1. `src/data/movement-checkin/index.ts` — twee nieuwe exports onderaan het bestand

Voeg toe (niets bestaands wijzigen):

```ts
export const MOVEMENT_DIMENSION_LABELS: Record<MovementDimensionKey, string> = {
  kracht: "Kracht",
  conditie: "Cardio",
  intensiteit: "Intensieve inspanning",
  zitten: "Zitten",
  conditie_ervaren: "Ervaren conditie",
  herstel: "Herstel",
  klachten: "Klachten",
  mobiliteit: "Mobiliteit",
  belastbaarheid: "Belastbaarheid",
  consistentie: "Consistentie",
  motivatie: "Motivatie",
};

/**
 * De dimensies waar een programma daadwerkelijk aan kan draaien. `herstel` en
 * `klachten` zijn moderatoren (ze sturen de zwaarte van vandaag, niet je focus),
 * `motivatie` bepaalt de grootte van de stap, en `conditie_ervaren` en
 * `belastbaarheid` zijn subjectieve respectievelijk functionele uitlezingen van
 * `conditie` — die als focus kiezen telt hetzelfde gat twee keer.
 *
 * De volgorde is de tie-break bij een gelijke score en volgt de leefstijl-ladder:
 * dagelijks bewegen (laag 1) vóór kracht en basisconditie (laag 2) vóór opbouw.
 */
export const MOVEMENT_FOCUS_ORDER = [
  "zitten",
  "kracht",
  "conditie",
  "consistentie",
  "intensiteit",
  "mobiliteit",
] as const satisfies readonly MovementDimensionKey[];

export type MovementFocusKey = (typeof MOVEMENT_FOCUS_ORDER)[number];
```

### 2. `src/lib/movement-assessment.ts` — conclusie-model erbij

`assessMovement()` blijft exact zoals hij is. Voeg toe:

```ts
export type MovementFocus = {
  dimension: MovementFocusKey;
  label: string;
  band: MovementBand;
  statement: string;
  choices: string[];
  deepen: string | null;
  supplement: MovementSupplement | null;
} | null;

export type MovementConclusion = {
  headline: string;
  focusLabel: string | null;
  focusDimension: MovementFocusKey | null;
  statement: string;
  actions: string[];
  /** Herstel/klachten — maximaal twee, klachten altijd eerst. */
  moderatorHints: string[];
};

export function buildMovementConclusion(
  report: MovementSelfReport,
  results: MovementDimensionResult[],
): MovementConclusion;
```

Regels voor `buildMovementConclusion`:

a. **Kandidaten.** Alleen dimensies uit `MOVEMENT_FOCUS_ORDER` waarvan het antwoord
   een `number` is. Alle vragen hebben schaal 1–5, dus normaliseren is `value / 5`.

b. **Sortering.** Oplopend op genormaliseerde waarde. Bij gelijkspel wint de dimensie
   die eerder in `MOVEMENT_FOCUS_ORDER` staat.

c. **Override consistentie.** Als `MOV2_CONSIST <= 2` ÉN `MOV2_MOTIV <= 2`, dan is de
   focus altijd `consistentie`, ongeacht b. Reden: volume toevoegen aan iemand die niet
   komt opdagen is de klassieke fout — eerst het doel verkleinen.

d. **Onderhoudsgeval.** Is er geen kandidaat met band `aandacht` of `redelijk`, dan:
   - `headline: "Je basis staat — houd vast wat werkt"`
   - `focusLabel: null`, `focusDimension: null`
   - `statement: "Op de dimensies die we meten staat je beweging er goed voor."`
   - `actions`: deze drie, hardcoded in dit bestand als `MAINTENANCE_ACTIONS`:
     1. `"Houd je vaste beweegmomenten aan — ook in een drukke week"`
     2. `"Onderbreek lang zitten elk uur met een paar minuten staan of lopen"`
     3. `"Houd twee krachtmomenten per week vast, met 48 uur ertussen"`

e. **Normale geval.**
   - `headline: \`Op basis van jouw antwoorden ligt jouw grootste beweegwinst bij ${label.toLowerCase()}.\``
     waarbij `label` uit `MOVEMENT_DIMENSION_LABELS` komt.
   - `statement`: `MOVEMENT_STATEMENTS[focus][band]`.
   - `actions`: `MOVEMENT_CHOICES[focus].slice(0, 3)`.

f. **Motivatie-modifier.** Als `MOV2_MOTIV <= 2` én de focus is niet `consistentie`,
   hang dan aan `statement` toe (met een spatie ervoor):
   `"Begin kleiner dan je denkt nodig te hebben — één moment dat je zeker haalt telt zwaarder dan een plan dat je laat liggen."`

g. **`moderatorHints`.** Maximaal twee, in deze volgorde:
   - `MOV2_PAIN <= 2` → `"Je geeft klachten aan die je beweging beperken. Bouw voorzichtig op en overleg bij twijfel met een fysiotherapeut."`
   - `RCV_FEEL <= 2` → `"Je voelt je vandaag niet hersteld. Een rustige dag of een korte wandeling past nu beter dan een zware sessie."`
   Andere waarden leveren geen hint.

Voeg daarnaast een exportfunctie toe die de focus opbouwt uit de bestaande
`results`-lijst, zodat de UI niet twee keer hoeft te zoeken:

```ts
export function resolveMovementFocus(
  conclusion: MovementConclusion,
  results: MovementDimensionResult[],
): MovementFocus;
```

Die geeft `null` bij `focusDimension === null`, en anders het `MovementDimensionResult`
van die dimensie verrijkt met `label` uit `MOVEMENT_DIMENSION_LABELS`. Het
`supplement`-veld komt ongewijzigd uit `results` — dus creatine verschijnt alleen als
de focus `kracht` is en de band niet `sterk`. Bouw hier geen tweede gate.

### 3. `src/app/api/intake/movement-checkin/route.ts`

- Bereken direct na `assessMovement(reportForAssessment)` in de volledige modus de
  conclusie. In `mode === "pulse"` gebeurt dit NIET en verandert er niets.
- Sla de conclusie mee op in de bestaande insert (regel 182-190). `raw_inputs` wordt:
  `{ ...reportForAssessment, focus_dimension, focus_label, conclusion_text, conclusion_actions, chosen_actions: [] }`
  waarbij `conclusion_text` de `headline` is. Dit spiegelt
  src/app/api/intake/sleep-checkin/route.ts regel 341-364. Het is een jsonb-kolom:
  geen migratie nodig. In pulse-modus blijft `raw_inputs` exact het kale rapport.
- De response (regel 261-264) wordt in volledige modus
  `{ assessment, conclusion, start, mode }`; in pulse-modus blijft hij ongewijzigd
  `{ assessment, start, mode }`.
- Verander niets aan de rate limiting, consent-insert, `emitEvent`-aanroepen of de
  answers-merge.

### 4. `src/components/intake/MovementCapture.tsx` — resultaat-tak herbouwen

Alleen het blok `if (step.kind === "result")` bij de **niet-pulse**-tak (regel 216-332).
De pulse-tak (regel 174-214), de vraag-stap, de consent-stap en de error-stap blijven
letterlijk ongewijzigd.

- Verwijder de lokale `DIMENSION_LABELS` (regel 37-49) en importeer
  `MOVEMENT_DIMENSION_LABELS` uit `@/data/movement-checkin`.
- `Step` van soort `"result"` krijgt een veld `conclusion: MovementConclusion`.
- Na de submit-fetch lees je `conclusion` uit de response mee.
- Voeg na de bestaande `clarityTag(...)` op regel 145 toe:
  `trackEvent("movement_checkin_completed", { surface: "intake_beweging", focus_dimension: data.conclusion.focusDimension ?? "geen" })`
  Importeer `trackEvent` uit `@/lib/ga4`. Er is GEEN registratie in events.ts nodig —
  `trackEvent` neemt een vrije string.

Nieuwe opbouw van het resultaatscherm, in deze volgorde:

1. `<h1>` blijft `"Jouw beweeg-overzicht"` met sublead `"Op basis van wat je nu doet"`.
2. **Conclusie-sectie** — zelfde markup als SleepCheckin regel 230-248: terra-kaart,
   `<h2>` met `conclusion.headline` in `font-serif text-xl`, daaronder
   `conclusion.statement`.
3. **"Jouw volgende 3 acties"** — genummerde `<ol>`, zelfde styling als SleepCheckin
   regel 257-266. Daaronder één regel met een link terug naar de doe-surface:
   `Wil je stappen afvinken? Open je beweegplan →`
   De href is `buildDashboardVandaagHref("beweging")` — die import staat al op regel 10.
   Bij klik: `trackEvent("movement_checkin_action_click", { surface: "intake_beweging" })`.
4. **"Sinds je start"** — het bestaande `start`-blok, ongewijzigd overnemen.
5. **Focus-blok** — alleen als `resolveMovementFocus(...)` niet `null` is. `<h2>`:
   `Je grootste winst zit nu in {label.toLowerCase()}`. Daarin: `statement`, de
   bestaande keuze-knoppen met `toggleChoice` (behoud die interactie exact zoals hij is,
   inclusief de `selected`-Set), `deepen` als die er is, en het `supplement`-blok
   ongewijzigd overnemen van regel 287-301.
6. **Statusrij** — `<h2>` `"Hoe je nu beweegt"`, daaronder chips voor ALLE dimensies uit
   `assessment`, exact het patroon van SleepCheckin regel 360-379: label +
   `·` + bandwoord. Bandwoorden: `aandacht → "Aandacht"`, `redelijk → "Redelijk"`,
   `sterk → "Sterk"`.
7. **Moderator-blok** — alleen als `conclusion.moderatorHints.length > 0`. Zelfde
   markup als de `contextHints` van SleepCheckin regel 387-398, met eyebrow
   `"Herstel & klachten"`.
8. `<DomeinIjkpuntCheckPrompt domain="beweging" domainLabel="Beweging" />` — ongewijzigd.
9. **Afsluitblok.** Vervang het huidige blok (regel 308-328) door:
   - tekst: `"Wil je week voor week begeleid worden? Ontvang de beweeggids per e-mail."`
   - primaire knop naar `/gids/beweging`: `"Ontvang de beweeggids →"`
   - de bestaande `/intake`-secundaire regel blijft ongewijzigd.
   Het woord "stappenplan" mag nergens meer in dit bestand voorkomen.

De 11 gestapelde dimensie-secties (regel 235-304) verdwijnen volledig — hun inhoud
komt terug als één focus-blok plus de chip-rij.

### 5. `src/lib/__tests__/movement-assessment.test.ts` — describe-blok voor de conclusie

Bestaat `describe("buildMovementConclusion")` al in dit bestand, laat het dan exact staan
en zorg dat je implementatie eraan voldoet — die tests zijn de specificatie. Ontbreekt het,
voeg het dan toe. De bestaande `assessMovement`-tests niet aanpassen. Dekking:
- `MOV2_STR: 1` en de rest 5 → `focusDimension === "kracht"`, 3 acties, headline bevat "kracht"
- `MOV2_SIT: 1` en `MOV2_STR: 1` → `focusDimension === "zitten"` (gelijkspel, ladder-volgorde wint)
- `MOV2_CONSIST: 2, MOV2_MOTIV: 2, MOV2_STR: 1` → `focusDimension === "consistentie"` (override c)
- alles op 5 → `focusDimension === null` en 3 onderhoudsacties
- `MOV2_PAIN: 1, RCV_FEEL: 1, MOV2_STR: 1` → 2 moderatorHints, klachten eerst,
  en `focusDimension` is NOOIT `"klachten"` of `"herstel"`
- `MOV2_MOTIV: 2, MOV2_STR: 1` → statement eindigt op de kleiner-beginnen-zin
- compliance: geen enkele `headline`, `statement` of actie bevat "tekort", "diagnose",
  "gezond", "ongezond", "verhoogd" of "normaal" — hergebruik de bestaande FORBIDDEN-array

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- TypeScript strict, geen `any`
- "use client" blijft staan waar hij staat; geen nieuwe client components
- Semantic HTML: `<section aria-labelledby>` per blok, één `<h1>` op het scherm
- Verboden UI-woorden (BESLUIT §C.2), ook in aria-labels: stappenplan · route · fase ·
  spoor · startpatroon · categorie · cockpit · kompas · journey · coming soon
- Geen medische claims — de klachten-hint verwijst door, diagnosticeert niet
- Geen PII in GA4-payloads
- Verander NIETS aan: src/app/intake/, src/components/dashboard/beweging/MovementTodayHero.tsx,
  src/components/dashboard/BewegingScreen.tsx, src/lib/movement-today-choices.ts,
  src/data/affiliate-links.ts, src/lib/scoring.ts, globals.css, deploy.sh, .env.local
- Geen database-migratie — `raw_inputs` is een bestaande jsonb-kolom
- De pulse-modus (`?mode=pulse`) verandert in gedrag noch in opslag
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] Na een volledige beweegcheck toont het resultaat: één conclusie-kaart, drie
      genummerde acties, één focus-blok en één chip-rij — geen gestapelde dimensie-secties
- [ ] `grep -rn "stappenplan" src/components/intake/MovementCapture.tsx` geeft niets
- [ ] `focusDimension` is nooit `klachten`, `herstel`, `motivatie`, `conditie_ervaren`
      of `belastbaarheid`
- [ ] `intake_domain_checkin.raw_inputs` bevat na een volledige check
      `focus_dimension`, `conclusion_text`, `conclusion_actions` en `chosen_actions`
- [ ] Pulse-modus levert byte-identiek dezelfde response en dezelfde `raw_inputs` als vóór deze wijziging
- [ ] 375px: geen horizontale scroll, alle knoppen minimaal 44px hoog
- [ ] Geen nieuwe console.log in src/
- [ ] tsc --noEmit groen

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npx tsc --noEmit
3. npx vitest run src/lib/__tests__/movement-assessment.test.ts src/app/api/intake/movement-checkin/__tests__/route.test.ts
4. npx eslint src/lib/movement-assessment.ts src/components/intake/MovementCapture.tsx src/app/api/intake/movement-checkin/route.ts src/data/movement-checkin/index.ts --max-warnings 0

Draai GEEN `next build` en verwijder `.next` niet — de dev-server draait mogelijk live.
Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.

# Voorgestelde commit:
# git add -A && git commit -m "feat(beweging): conclusie-model op beweegcheck-resultaat"
```

**Meetpunt R0:** `movement_checkin_completed` (GA4, met `focus_dimension`) en het bestaande `measurement.checkin_completed` (`domain_events`) — hier lees je het effect af.
