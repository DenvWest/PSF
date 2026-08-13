# Verdict — v3.5 als north-star, M.1–M.5 als implementatie-SSOT, en de weg erna

> Senior product-architect · opgesteld 12 augustus 2026 · geen code gewijzigd, geen commits.
> Geverifieerd tegen `main` op commit `0597fe3` (= `origin/main`, 0 ahead / 0 behind), plus drie
> untracked docs in de working tree.
> Bronnen: `beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` (15 locks, r.7-31) ·
> `BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` (§A–M) ·
> `opus-beweging-status-verdict-slices-1-16-2026-08.md` (§K, §L, §M, §N) ·
> `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` (§C.4, §D.1) · `claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md` (§R1/R2) ·
> `PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` (§8, §9) · `fable-domeinen-…-verdict-2026-08.md` (§H.2/H.3).

---

## A · Executief verdict

- **v3.5 is klaar genoeg als north-star. GO.** Vijftien locks, een acceptatiematrix over 25
  combinaties, en één predikaat (`bridgeFirst`, r.1309) dat label én bestemming stuurt. Er is geen
  v3.5.1-**herontwerp** nodig.
- **Wél een v3.5.1-delta van drie soorten regels, geen pixels:** (a) slice-tags per lock, (b) drie
  conflict-comments (sectie C), (c) één copy-fix — `Week 1 van 8` is een noemer op een doe-surface
  en botst met de eigen copy-lock (§J verbiedt `trede X van Y`). Herschrijf naar `Fase: opbouw`.
  Totaal ≤ 20 regels HTML-comment + één string.
- **Statuscorrectie op §K:** R0g is **niet meer uncommitted**. Het staat als `c1e363a` op `main`
  én op `origin/main`. Deploy 1 is daarmee geen commit-actie maar een **server-actie** — en hij is
  vandaag geblokkeerd, want `deploy.sh:5` faalt op `git status -s` en er staan drie untracked docs.
- **De duurste bevinding van het statusverdict staat overeind en is opnieuw geverifieerd:**
  `weeklyAvailability` heeft **nul** schrijvers in productiecode (alleen `__tests__`). De
  programma-regel op Voortgang › Beweging is voor elke echte gebruiker leeg.
- **v3.5 wint van v3.4 op de IA-vraag, en het is geen smaakkwestie.** Als instellen in de sheet
  gebeurt (`programControls`, r.1618) en Voortgang terugleest, dan ís R1a — de dode preview levend
  maken — precies de v3.5-teruglees-regel. Eén reparatie dient twee doelen. `BewegingProgrammaPaneel`
  wordt **KILL**.
- **Lock 5 (dual-label) kan niet vóór slice 11.** Het tweede label routeert naar scherm B; scherm B
  is het schap; het schap is 0% code en gegate op een niet-uitgevoerde proef. M.2 is daarmee niet
  alleen een voorkeur maar een noodzaak: één label is het enige dat vandaag ergens heen kán.
- **Lock 4 (brug = één knop, geen keten) mag niet in slice 9.** Hem nu doorvoeren betekent de enige
  meetbare brug slopen en vervangen door een link naar Mijn Dag — die bestaat al (`Open Mijn Dag`).
  Je zou een meetpunt inruilen voor navigatie.
- **De ene zin:** *de prebuild is het ontwerpcontract voor R2 en verder; de deploy-kolom bepaalt wat
  er in `src/` komt — HTML zonder slice-tag wordt niet gebouwd.*

---

## B · Prebuild ↔ slice mapping (lock 1–15)

| # | v3.5-lock | Slice-id | Status |
|---|---|---|---|
| 1 | Piramide weg → zes prioriteitsblokken, 4px statusbalk (slaap v2-patroon) | **R2** | prebuild-only |
| 2 | Prioriteit 1 bovenaan, 1→6 leest naar beneden | **R2** | prebuild-only |
| 3 | Copy-lock "Prioriteit N"; `Laag N` verboden in gerenderde tekst | **north-star (governance)** | **implementeer nu** — geldt vanaf de eerstvolgende string, dus vanaf deploy 2 |
| 4 | Brug = één knop, geen paneel/keten eronder | **R2** | prebuild-only — **conflict, zie C.1** |
| 5 | Dual-label + gesplitste routing (basis→B, naast→D), één predikaat | **R2 + slice-11** | PARK tot scherm B bestaat |
| 6 | Scherm B gedeparkeerd, terug in de flow | **slice-11** | PARK (proef-poort) |
| 7 | Mijn Dag = MD-structuur slaap v2 (appbar · mdhead · timeline · koppelstrip) | **R5 (deploy 6)** | prebuild-only |
| 8 | Voortgang C: twee bronnen, één conclusie (gemeten boven gekozen, ladder verklaart) | **R0g (gemeten, LIVE) + R2a (gekozen) + R2b (ladder)** | deels geland |
| 9 | `extraChosen` alleen na expliciete keuze op B, nooit bij load | **slice-11/12** | PARK |
| 10 | Dismiss tot morgen; expiry reset óók `hasVisitedShelf` | **slice-12** | PARK |
| 11 | `dose ≠ dayDur` — twee velden, twee herkomsten, nooit één control | **R1a + R1b** | **implementeer nu als invariant** (geen UI) |
| 12 | Sport stuurt copy, nooit plan/dosis/dagstap | **LIVE — KEEP** | `buildMovementSportLens` raakt alleen copy; R1b bewaakt |
| 13 | Prioriteit 6 gegate op voedingscheck **én** hertest, label-only op C | **poort LIVE + R2b (label-rij)** | `VoortgangDomeinScreen.tsx:104-105` draagt de dubbele poort al |
| 14 | Eén state-object, één `paint()` | **prebuild-mechaniek — NIET vertalen** | React heeft zijn eigen model; dit lock bewaakt de prebuild, niet `src/` |
| 15 | Responsiviteit uitsluitend via `@container app`; 375 primair, 1280 zet de rail | **R2b (rail) + bouwregel nu** | container-queries binnen tegels zijn al huisregel |

**Geen enkele lock is "implementeer alles nu".** Drie zijn vandaag actief (3, 11, 15 als regel; 12
en 13 als bestaande code), één is prebuild-eigen (14), de rest hangt aan R2 of verder.

---

## C · Conflictresolutie — v3.4 vs v3.5 vs live product

### C.1 De brug — vierpunts-keten vs "één knop" vs M.2

| Bron | Wat de brug is |
|---|---|
| **Live** | Sheet `MeerHulpBridgeSheet.tsx`, titel *"Zet er iets naast"* (r.65), vierpunts-keten Check → Advies → Favorieten → Beste (`beweging-help-bridge.ts:40-50`), één uitgang naar Voortgang. Eén aanroeper: `AgendaDayTimeline.tsx:537` |
| **v3.4** | Piramide laag 1–3, sheet per laag |
| **v3.5 lock 4/5** | Eén knop, geen paneel, geen keten; twee labels, twee routes (B of D) |
| **M.2** | Slice 9 = tweede aanroeper van de **bestaande vierpunts-brug**, enig label *"Zet er iets naast"* |

**Voorzittersbesluit: M.2 blijft staan, ongewijzigd.** Twee argumenten die in M.2 nog niet stonden en
die het besluit verharden:

1. **Het tweede label heeft geen bestemming.** `bridgeFirst()` routeert `true` → scherm B. B is het
   schap, het schap is slice 11, slice 11 is 0% code en zit achter een niet-uitgevoerde proef.
   Lock 5 vóór slice 11 shipt een knop naar een leeg scherm.
2. **Lock 4 nu = een meetpunt inruilen voor navigatie.** De keten is het enige dat de brug
   *inhoudelijk* onderscheidt van de al bestaande knop `Open Mijn Dag`. Haal je hem weg vóór de
   ladder er staat, dan verdwijnt `choice.shelf_opened` als betekenisvol signaal — precies het event
   waar het kill-criterium van slice 12 aan hangt.

**Wat de v3.5 HTML krijgt:** een comment-tag boven `bridgeLabel()` (r.1310). Geen herschrijving —
de HTML blijft het R2-eindbeeld.

### C.2 Programma instellen — v3.4 laag-2-paneel vs v3.5 `programControls` op A/E

**Voorzittersbesluit: v3.5 wint. `BewegingProgrammaPaneel` wordt KILL.** De default-aanname uit de
opdracht wordt bevestigd, met drie onderbouwingen:

- **Risico 4 uit §L wordt anders werkelijkheid.** Er zijn al drie bronnen die over "wat je doet"
  praten (`deriveMovementCurrent`, `movementCheckinSnapshot`, `buildBewegingAdviesTreden`). Een
  bewerkbaar paneel op Voortgang wordt de vierde — en de enige die met de eerste over hetzelfde gaat.
- **Lock 8 zegt het letterlijk:** Voortgang meet en verklaart. Een bewerkbaar paneel dóét.
- **R1a wordt er zinvoller van.** De teruglees-regel `Kracht · thuis · 2× per week · beginner`
  (besluit §D) is exact `buildMovementProgramPreview`. Repareer je die, dan heeft Voortgang zijn
  v3.5-rol al — zonder nieuw component.

**Hernoeming, vanaf nu SSOT:**

| Was | Wordt | Inhoud |
|---|---|---|
| R1 (v3.4) | **R1a** | `weeklyFrequency`-UI in `MovementProgramSheet` + levende preview op Voortgang |
| R1b (v3.4: paneel) | **R1b-v3.5** | rest van `programControls` in dezelfde sheet: `strengthLevel`, `conditionForm`, dose-uitlijning, plek/begeleiding-hergroepering |
| R2 (v3.4: ladder) | **R2a / R2b** | R2a = Voortgang C-compositie (gemeten boven gekozen); R2b = prioriteitenladder + rail |

### C.3 Dual-label (v3.5 lock 5) vs enkel label (M.2)

**Voorzittersbesluit: M.2. Eén label in deploy 2, dual-label in R2/slice-11.** Aanvullend besluit dat
M.2 nog niet nam: **géén `label_variant` in de payload van slice 9.** v3.5 §H stelt
`{ label_variant:'basis'|'ernaast' }` voor, maar met één label is dat een veld met één waarde —
precies de fout die `preselect_source` maakte (structureel `"checkin"|"plan"`, nooit `"beweegcheck"`)
en die `weeklyFrequency` maakte (een prop die nooit een waarde krijgt). **Dit document verbiedt dode
dimensies.** `from_state` draagt het onderscheid vandaag; `label_variant` komt mee met het tweede label.

**HTML-patch — dit is de enige wijziging aan v3.5 (naast de `Week 1 van 8`-string):**

```html
<!--
  IMPLEMENTATIE-TAGS (12 aug 2026 — verdict v3.5-implementatiekaart, sectie B/C).
  Deze prebuild is het ONTWERPCONTRACT. Wat er in src/ komt bepaalt de deploy-kolom.
  · lock 3        → governance, actief vanaf deploy 2 ("Laag N" verboden in nieuwe strings)
  · lock 4, 5     → R2 + slice-11. NIET in slice 9. De live brug blijft de vierpunts-keten
                    (beweging-help-bridge.ts:40-50) tot de ladder in code staat; het tweede
                    label routeert naar scherm B en dat scherm bestaat nog niet.
  · lock 6, 9, 10 → slice-11/12, geparkeerd achter de inhoudsproef (PROEF §8).
  · lock 7        → R5 (deploy 6, Mijn Dag-koppelstrip).
  · lock 8        → gemeten-helft LIVE sinds c1e363a; gekozen-helft = R2a; ladder = R2b.
  · lock 11,12,15 → gelden NU als bouwregel in R1a/R1b, zonder eigen UI.
  · lock 14       → prebuild-mechaniek, niet naar React vertalen.
  BewegingProgrammaPaneel (v3.4-R1b) is vervallen: instellen gebeurt in de sheet,
  Voortgang leest terug. Zie verdict sectie C.2.
-->
```

---

## D · Deploy-kaart (vervangt §K)

| # | Wat | Wanneer | Meetvenster | Wat er NIET bij mag | GA4-annotatie |
|---|---|---|---|---|---|
| **1** | **R0g (`c1e363a`) naar productie** — fact-rijen + ijkpuntprompt op Voortgang, `strip_variant` persist. **Zonder** `preselect_source` | **nu** — mag tijdens F1a | `domain_tool.snapshot_viewed{domain:"beweging", has_conclusion:true}` en `movement_checkin_fact_readout_expanded{surface:"voortgang_beweging"}` verschijnen vanaf dag 1 | Niets uit slice 9 of 10. **Geen** `preselect_source`-regel (M.1) | "R0g Voortgang-parity — raakt geen F1a-surface" |
| **2** | **Slice 9** (tweede brug-ingang) + copy-unificatie + `from_state:"beweging_surface"` + `preselect_source` derde waarde + favorieten-status `now`→`toekomstig` | **≥ 20-08 06:38**, ná het F1a-verdict | **2 weken.** `choice.shelf_opened{from_state}` verdeling agenda vs. beweging_surface · `dashboard_vandaag_card_shown{preselect_source:"beweegcheck"} > 0` | Geen R1a. Geen favorieten-opslag. Geen brug-inhoudswijziging (keten→ladder). Geen `label_variant` | "Slice 9 + preselect_source — eerste regel na F1a-venster" |
| **3** | **R1a** — `weeklyFrequency`-chiprij in `MovementProgramSheet` + levende preview op Voortgang | ná het slice-9-venster (≈ 03-09) | `dashboard.beweging_programma_open` volume + **aandeel Voortgang › Beweging-bezoeken met niet-lege programma-regel** | R1b, R2. Geen nieuwe surface | "R1a — reparatie dode readout" |
| **4** | **R1b-v3.5** — rest `programControls` in de sheet: `strengthLevel`, `conditionForm`, dose-uitlijning | gate: R1a ≥ 2 weken live én programma-regel niet-leeg > 25% | `movement.target_set` + `dashboard.beweging_programma_open` (geen daling) | Geen Voortgang-paneel (C.2). Geen ladder | "R1b — programma-velden compleet" |
| **5a** | **R2a** — Voortgang C-compositie: gemeten boven gekozen, basis-regel + teruglees-link | gate: R1b live; `programProfile`-velden vullen | `domain_tool.snapshot_viewed` (geen daling) + kliks op de teruglees-link | Geen ladder in dezelfde deploy | "R2a — Voortgang C-compositie" |
| **5b** | **R2b** — prioriteitenladder (`full` + `rail`), zelf-calibratie, prioriteit 6 label-only | gate: R2a ≥ 2 weken; ladder-data redactioneel af | eigen venster; nieuw durable event `movement.self_calibration_set` | Slice 11, fit-lens, favorieten-opslag | "R2b — prioriteitenladder" |
| **6** | **R5** — Mijn Dag-koppelstrip + agenda-leesregel (lock 7) | gate: R2b live | `dashboard.agenda_domain_link_click{to}` | Geen tweede vinklijst; geen week-readout (lock 7 sluit die uit) | "R5 — koppelstrip Mijn Dag" |
| **7** | **Golf 2 · S1 slaap** — analyse-shell generiek (`isMovement`-gate weg) | gate: beweging-S3 af (R1b + R2b) | `domain_tool.snapshot_viewed{domain:"slaap", has_conclusion:true}` | Geen stress in dezelfde deploy; geen conversiekaart-hub | "Golf 2 S1 — slaap-analyse-rij" |

**Regressiewacht, permanent en per deploy afgelezen:** `dashboard_vandaag_action_toggled{done:true}`
mag niet dalen (emit-sites: `AgendaTodayHero.tsx:230`, `DomainTodayStrip.tsx:222`,
`use-daily-action-log.ts:117`).

**Deploy-1-blocker die niemand nog gemeld heeft:** `deploy.sh:5` weigert bij `git status -s` ≠ leeg,
en `-s` telt untracked mee. De drie untracked docs (v3.5-prompt, v3.5-besluit, v3.5-HTML) blokkeren
de deploy vandaag. Commit ze eerst als `docs(beweging): …`, of deploy faalt vóór hij begint.

---

## E · Productie-defect `weeklyFrequency` (M.3, uitgeschreven)

### E.1 Dataflow

```
intake answers (jsonb)
   │   sleutel "weeklyAvailability"  ← ANSWER_KEY_WEEKLY_FREQUENCY (movement-plan-profile.ts:31)
   │   ⚠ NUL SCHRIJVERS in productiecode. Grep buiten __tests__: 0 treffers.
   ▼
parseMovementPlanProfile()            movement-plan-profile.ts:141,159
   │   weeklyFrequency = isMovementWeeklyFrequency(x) ? x : null   → altijd null
   ▼
buildMovementProgramPreview(freq, location, guidance)   :287-294
   │   if (!weeklyFrequency || !trainingLocation) return null      → altijd null
   ▼
VoortgangDomeinScreen.tsx:112-118  → movementProgramPreview = null
   ▼
MovementCheckinReadout prop `programPreview` → regel valt stil weg
```

`resolveEffectivePlanProfile()` (r.297-308) vult het veld wél met een pattern-default, maar wordt
bewust niet gebruikt voor de preview (comment r.280-284: "Alleen de RAUWE, onopgeloste
profielwaarden"). Die keuze blijft staan — hij is juist. Het gevolg is dat er een **schrijver** moet
komen, geen fallback. De API accepteert al (`movement-prefs/route.ts:137,177,246`), de patch-functie
schrijft al (`applyMovementPlanProfilePatch`, r.361-364), en de optieset bestaat al
(`MOVEMENT_FREQUENCY_OPTIONS`, `session-catalog.ts:151-158`). Alleen de UI ontbreekt.

### E.2 De UI in R1a — exact

- **Plek:** `MovementProgramSheet.tsx`, in het `Een andere vorm proberen`-blok, als **eerste** rij
  boven `Waar train je`. Niet in de hero (F1a-freeze), niet op Voortgang (lock 8).
- **Vorm:** bestaande `ChipRow<MovementWeeklyFrequency>` met `MOVEMENT_FREQUENCY_OPTIONS`
  (labels `1× per week`, `2× per week`, `3× per week`), `value={profile.weeklyFrequency}`,
  `onSelect={(id) => onSave({ weeklyFrequency: id })}`.
- **Kop:** `Hoe vaak per week` (v3.5 gebruikt `Hoe vaak per week?` — vraagteken weg, de andere
  koppen in de sheet dragen er ook geen).
- **Compliance-copy (M.3-randvoorwaarde):** onder de rij één feitelijke regel —
  *"De richtlijn is 2× per week spier- en botversterkende activiteit (Beweegrichtlijnen 2017)."*
  Verboden: "aanbevolen voor jou", "wij adviseren", elke tweede-persoons-voorschrijving.
- **`dose ≠ dayDur` (lock 11):** de rij zet uitsluitend `weeklyFrequency`. Hij raakt `targetMinutes`
  niet en de dagstap-duur niet. Eén control, één veld.
- **Events:** hergebruik `movement.target_set` met `{ field: "weekly_frequency", value }` — het staat
  al op alle drie de registratieplekken. **Geen nieuw event.**

### E.3 Acceptatie

- **Primair:** het aandeel Voortgang › Beweging-bezoeken waar de programma-regel niet leeg is, gaat
  van **structureel 0%** naar **> 25%** binnen twee weken na deploy 3, gemeten onder gebruikers die
  de programma-sheet minstens één keer openden.
- **Technisch:** na één tik op een frequentiechip levert `buildMovementProgramPreview` een string van
  de vorm `2× per week · thuis · zelf`; `parseMovementPlanProfile` leest hem terug na herladen.
- **Regressie:** `dashboard_vandaag_action_toggled{done:true}` en
  `dashboard.beweging_programma_open` dalen niet.

---

## F · Slice 9 — specificatie (M.2)

**Tweede aanroeper:** `src/components/dashboard/BewegingScreen.tsx`. Alles wat de brug nodig heeft
staat daar al: `model`, `slot`, `nutritionLogCompleted`, en de klaar-staat-gate
`showAdvice = adviceMayOutrankDayStep(dayStepFacts)` (r.139). De trigger hangt **onder** `showAdvice`
— dat is het D.1-contract letterlijk: advies wordt niet prominenter dan een open dagstap.

- Bouwer: `buildBewegingHelpBridge(model, slot, nutritionLogCompleted)` (`beweging-help-bridge.ts:29`)
- Sheet: `MeerHulpBridgeSheet` krijgt één nieuwe prop `fromState: "agenda_meer_hulp" | "beweging_surface"`;
  de emit op r.44-47 leest die prop in plaats van de hardcoded waarde.
- Plaatsing: als laatste regel-CTA in de `lg:max-w-3xl`-kolom, boven `Gratis Bewegingsgids`.

### F.1 Copy-unificatie — wat verdwijnt, wat blijft

| String | Plek | Actie |
|---|---|---|
| `"Zet er iets naast"` | `MeerHulpBridgeSheet.tsx:65` (sheet-titel) | **blijft** — dit wordt het enige label |
| `"Meer hulp hierbij"` | `AgendaBlockDetailSheet.tsx:295` (trigger) | **wordt** `"Zet er iets naast"` |
| *(nieuw)* trigger op Beweging | `BewegingScreen.tsx` | `"Zet er iets naast"` |
| `"Voeg iets toe aan je basis"` | prebuilds v3.2–v3.5 | **komt niet in `src/`** tot R2/slice-11 (lock 5) |
| Brug-lead `"Iets ernaast zetten kies je in Voortgang…"` | `:66-69` | **blijft** — het is de enige lead die vandaag waar is: kiezen gebeurt echt in Voortgang |
| Blok `"Je basis · primair pad"` | `:71-84` | **weg** (J2-1a). Op beide surfaces redundant: op Beweging staat de dagstap erboven, in de agenda staat hij in het detail-sheet |
| `favorieten: status "now"` | `beweging-help-bridge.ts:48` | **wordt** `"toekomstig"` — de brug belooft nu opslag die niet bestaat (risico 7) |

### F.2 `from_state:"beweging_surface"` — waar en welke allowlist

- Emit: `MeerHulpBridgeSheet.tsx:44-47`, via `emitAccountClientEvent("choice.shelf_opened", { domain, from_state })`.
- **Geen registratiewerk.** `choice.shelf_opened` staat al op alle drie: `events.ts:57` (durable),
  `account-events-client.ts:15` (union), `api/account/events/route.ts:20` (`CLIENT_EMIT_TYPES`).
  `from_state` is een vrije payload-string.
- Confusion-trap J2-3 blijft daarmee beheerst: als het schap (slice 11) later hetzelfde event
  gebruikt, scheidt `from_state` de twee oppervlakken.

### F.3 Kill-criterium na 2 weken

> **Slice 12 (favorieten-opslag) vervalt als `choice.shelf_opened{from_state:"beweging_surface"}`
> over een volledig venster van 14 dagen op nul blijft.**

Drie uitkomsten, drie besluiten:

| Verdeling na 14 dagen | Lezing | Vervolg |
|---|---|---|
| `beweging_surface` = 0 | Niemand start "iets ernaast" zonder agenda-aanleiding | Slice 12 vervalt; de brug blijft agenda-only; slice 11 verliest zijn laatste bouwargument |
| `beweging_surface` > 0 maar < 25% van agenda | De deur werkt, maar hangt verkeerd | Herplaats de trigger vóór slice 12; niet bouwen |
| `beweging_surface` ≥ 25% van agenda | Er is vraag zonder agenda-aanleiding | Slice 12 komt op de roadmap, ná R2b |

---

## G · R2 — scope (v3.5 scherm C)

**Wel in R2:**

| Onderdeel | Bron in v3.5 | Slice |
|---|---|---|
| C-compositie: gemeten (readout, SSOT-vlag) boven gekozen | lock 8, besluit §D | **R2a** |
| Gekozen-sectie: basis-regel + teruglees-link naar de sheet | besluit §D punt 3 | **R2a** |
| `renderLadder("full")` — zes blokken, 4px statusbalk, statuswoord in tekst | r.1581, lock 1/2 | **R2b** |
| `renderLadder("rail")` — sticky desktop-navigatie, synchroon met full | lock 15 | **R2b** |
| Zelf-calibratie (twee stappen, r.1686-1710) | v3.4-lock 7 | **R2b** |
| Prioriteit 6 label-only achter de dubbele poort | lock 13 | **R2b** — poort bestaat al (`VoortgangDomeinScreen.tsx:104-105`) |

**Niet in R2:** scherm B / schap (slice 11) · fit-lens · favorieten-opslag (slice 12) · dual-label
routing (hangt aan B) · Mijn Dag-koppelstrip (R5) · elke `mini`-laddervariant (v3.5 schrapt die).

**Nieuwe/gewijzigde events:**

| Event | Nieuw? | Registratiepad |
|---|---|---|
| `movement.self_calibration_set` | **ja, durable** | `events.ts` + `account-events-client.ts` + `CLIENT_EMIT_TYPES` in `api/account/events/route.ts` — drie plekken, in dezelfde PR |
| `dashboard.beweging_programma_open{from:"voortgang"}` | bestaand, nieuwe waarde | geen registratie; `from` is vrije payload |
| `domain_tool.snapshot_viewed` | bestaand | geen |

**Blast radius vs `VoortgangDomeinScreen.tsx`:** het bestand is vandaag 1 scherm voor 7 domeinen met
een harde `isMovement`-gate (r.85) en ~15 beweging-specifieke takken. R2b voegt daar een ladder aan
toe die alleen voor beweging bestaat. **Regel voor R2b:** de ladder komt als eigen component
(`src/components/dashboard/voortgang/BewegingPrioriteitenLadder.tsx`) met de statusafleiding in
`src/lib/movement-ladder.ts` (besluit §G: "de statusafleiding hoort in `src/lib/`"). Eén extra
regel in `VoortgangDomeinScreen`, geen tak erbij — anders blokkeert R2b straks Golf 2, die datzelfde
bestand generiek moet maken.

---

## H · Slice 11 / de proef (M.4)

### H.1 Twee scenario's

| | **(A) Datum op de proef** | **(B) Expliciet parkeren** |
|---|---|---|
| Wat je doet | Zet in `PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` een uitvoerdatum + eigenaar; redactie levert ≥ 8 ingevulde optieblokken | Zet een park-blok bovenaan het doc met heropen-trigger |
| Roadmap-effect | Slice 11 komt terug op de kaart, ná R2b. Lock 5/6/9/10 worden bouwbaar | Lock 5/6/9/10 blijven PARK; R2b wordt het eindpunt van de beweging-keten |
| Kosten | ~1 week redactie (§8 rekent met 10-12 pogingen, twee klokken) | 0 |
| Risico | De week valt tussen R1b en R2b en vertraagt niets — maar levert pas waarde ná R2b | Stille afstel is uitgesloten omdat de trigger meetbaar is |
| Meetbaarheid | §7-registratie (zoektijd + oordeeltijd) is het jaarbudget van de redactie | Slice-9-venster beslist het voor je |

**Advies: (B), met de trigger aan slice 9 gekoppeld.** Conversion's punt uit M.4 — stille afstel is
een besluit dat niemand nam — wordt afgedekt zodra de heropen-trigger een cijfer is en geen
voornemen. En slice 9 levert dat cijfer over twee weken vanzelf.

### H.2 Exacte formulering voor `PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md`

Toe te voegen direct onder de titel:

```markdown
> **STATUS: GEPARKEERD — 12 augustus 2026.** Deze proef is niet uitgevoerd. Dat is
> geen gefaalde proef (§8 geeft dan vijf vervolgroutes) maar afwezigheid van data,
> en bouwen zonder die uitkomst is precies wat §1 wilde voorkomen.
>
> **Heropen-trigger (meetbaar, geen voornemen):** de proef wordt uitgevoerd zodra
> `choice.shelf_opened{from_state:"beweging_surface"}` over het volle venster van
> 14 dagen na deploy 2 ≥ 25% van het agenda-volume haalt. Blijft hij daaronder,
> dan is de vraag beantwoord zonder proef: er is geen vraag naar een schap, en
> §8's regel "dan wordt de keuze-ladder een dunne, expliciet begrensde deur"
> geldt — die deur staat er dan al.
>
> **Tot die trigger:** slice 11 en 12 zijn niet-bouwbaar, en v3.5-lock 5, 6, 9 en 10
> blijven prebuild-only. Er wordt niets "vast klein" gebouwd.
```

### H.3 Wat slice 12 wél mag, ook geparkeerd

- De statuscorrectie `favorieten: "now"` → `"toekomstig"` (deploy 2). Dat is geen slice-12-werk maar
  een eerlijkheidsfix op een bestaande belofte.
- Niets anders. Geen schema, geen `option_key`, geen lees-staat.

---

## I · H.3-poort en de conversiekaart (M.5)

### I.1 Beweging telt als 2e domein — per checklist-item

| Eis (H.3-item 1) | Voeding | Beweging | Bewijs |
|---|---|---|---|
| Score | ✅ | ✅ | `model.scores[domain]`, generiek |
| Delta | ✅ | ✅ | `buildLeefstijllijnRows` → `DeltaBadge` (`VoortgangDomeinScreen.tsx:200-220`) |
| Checkpunten-sparkline uit echte bron | ✅ | ✅ | zelfde generieke rij; beweging-bron sinds `442616c` |
| Conclusie-readout uit eigen bron | ✅ | ✅ | `movementCheckinSnapshot` (r.107) + `has_conclusion:true` in `domain_tool.snapshot_viewed` (r.121-125) |
| Feitrijen uit eigen antwoorden | — | ✅ | `MovementFactReadout` op Voortgang sinds `c1e363a` |

**Verdict M.5 bevestigd: 2.** De checklist toetst databeschikbaarheid.

### I.2 De UX-schuld — aparte post, geen R1/R2-werk

UX' bezwaar (elementen verspreid over vier tegels: `Je stand`, positieregel, readout, fact-readout)
is echt, maar het is een **compositie**-vraag over de meetlat-rij, en die rij is een
conversiekaart-object, geen domein-object. **Post: "meetlat-rij-compositie", eigenaar Golf 3.**
Niet in R1a, R1b, R2a of R2b — die zouden er een beweging-specifieke rij van maken en dat is precies
de schuld die Golf 3 moet opruimen.

### I.3 Wanneer de conversiekaart-hub wél mag

`voortgang-conversiekaart-prebuild-2026-07.html` gaat over de Voortgang-**hub**, niet over domein
Beweging. Hij blijft geparkeerd (`voortgang-plan-later.md`). **Gate = Golf 3**, en die vraagt:
Golf 1 compleet (V2 + V3 bedraad) · Golf 2 minimaal S1 (slaap) · beweging-S3 af (= R1b + R2b) ·
stage-resolver bestaat. Vandaag: 0 van 4. **Niets in dit document brengt de kaart dichterbij, en dat
is de bedoeling.**

---

## J · Cross-domein (Golf 2) — expliciete defer

**Waarom niet voeding/stress/slaap/verbinding-pariteit vóór R1a:**

1. **De analyse-shell is nog niet generiek.** `VoortgangDomeinScreen.tsx:85` is een harde
   `isMovement`-gate. Golf 2 moet die gate slopen. Doe je dat terwijl R1b en R2b hetzelfde bestand
   verbouwen, dan mergen twee verbouwingen in één scherm.
2. **Beweging is het sjabloon-domein.** §C.4 zegt: elk domein krijgt één doe-surface, één sheet, één
   gedeeld meetscherm. Dat sjabloon is bij beweging voor 45% af. Kopieer je nu naar slaap, dan
   kopieer je de gaten mee — inclusief de dode preview.
3. **Meetruimte.** Slaap-pariteit is een tweede conversie-gevoelige surface. De harde regel ("twee
   conversie-gevoelige surfaces niet in één deploy zonder los meetbaar effect") verbiedt dat naast
   slice 9 of R2.

**Wat wél gedeeld mag worden, zonder implementatie-blocker:**

- **De MD-structuur uit slaap v2** (appbar · mdhead · timeline · koppelstrip, lock 7) als
  *prebuild-conventie*. v3.5 heeft hem al overgenomen; dat is design-hergebruik, geen code.
- **`domain-ready-state.ts`** — de klaar-staat-helper is al domein-agnostisch. Slaap erft hem gratis
  bij S1 en vinkt daarmee H.3-item 4 af. **Niet aanpassen** voor beweging-specifieke wensen.
- **`domain_tool.snapshot_viewed{domain, has_conclusion}`** draagt al een `domain`-parameter. Elk
  nieuw domein hoeft alleen te emitten.

---

## K · Risico's (vervangt §L)

| # | Risico | Ernst | Mitigatie |
|---|---|---|---|
| 1 | Attributie-vervuiling F1a-venster (4 annotaties in 14 dagen) | Middel | Annotatielijst in het 20-08-verdict; geen van de vier raakte hero/voorselectie/nudge |
| 2 | **`accepted_default` mogelijk nooit als GA4-dimensie geregistreerd** | **BLOKKEREND** | Vandaag controleren. Ontbreekt hij → **deploy 2 gaat niet op 20-08**, want er is geen F1a-verdict om op te wachten; zie §N-1 |
| 3 | ~~WIP zonder deploy~~ → **commit zonder deploy** | Middel | R0g staat op `main` (`c1e363a`) maar prod-status is onbevestigd; `deploy.sh` is bovendien geblokkeerd door 3 untracked docs |
| 4 | Dubbele waarheid `programProfile` vs check-in vs advies-treden | Middel→**Laag** | Opgelost door C.2: geen vierde bron. Leg alsnog vast: profiel = wat je *wil*, `movementCurrent` = wat je *doet*, snapshot = wat je *antwoordde* |
| 5 | Bevriezen vs. herberekenen onbeslist | Middel | Eén regel in `BESLUIT_BEWEGING_PRODUCT_EN_IA.md`: **toon bevriest, feit herberekent.** `c1e363a` doet het al zo |
| 6 | Migratie-naad delta-copy (oude rijen dragen bandtaal) | Laag | Bewust; hardop zeggen in het R0-verdict |
| 7 | Brug belooft favorieten die er niet zijn | Laag | `"now"` → `"toekomstig"` in deploy 2 (§F.1) |
| 8 | F1a-freeze-schending | **Geen gevonden** | Diff-audit `442616c` + `c1e363a`: raken hero/voorselectie/nudge niet |
| **9** | **Prebuild afwerken zonder slice-tags = dubbel werk** | **Hoog** | v3.5 draagt vandaag 15 locks zonder één deploy-kolom. Zonder de C.3-comment-patch bouwt de volgende sessie lock 4/5 in slice 9 en sloopt de meetbare brug. **De comment-patch is het goedkoopste item in dit document** |
| **10** | **Dode dimensies als patroon** | Middel | `weeklyFrequency` (prop zonder schrijver), `preselect_source` (waarde die niet kan voorkomen), `favorieten:"now"` (status zonder opslag) — drie instanties in één keten. Regel: **geen veld, prop of payload-waarde zonder aantoonbare schrijver in dezelfde PR** |
| **11** | **`VoortgangDomeinScreen.tsx` wordt een beweging-bestand** | Middel | R2b in een eigen component + `src/lib/movement-ladder.ts`; het scherm krijgt één regel erbij, geen tak |
| **12** | **Dose-range-drift** | Laag | **Besloten (13-08):** geen drift — `targets.ts:21-22` (20-400) is het weektotaal, de prebuild-range (10-90 stap 5, r.1659) is een nog te bouwen per-sessie dosisveld ("Minuten per keer"). Twee velden, conform lock 11 (dose ≠ dayDur). R1b bouwt eigen constanten (`MOVEMENT_DOSE_MINUTES_MIN=10`, `MAX=90`, `STEP=5`) voor het dosisveld; `MOVEMENT_TARGET_MINUTES_MIN/MAX` blijft ongewijzigd voor het weektotaal. Niet hergebruiken tussen de twee |

---

## L · Cursor-prompts

### L1 — Deploy 1: R0g naar productie (zonder `preselect_source`)

```text
ROL
Je bent implementator op PerfectSupplement (Next.js 16 App Router, TypeScript strict,
Tailwind in JSX, Supabase). Je levert werkende code, geen pseudo-code. Je commit niet
en je pusht niet — Dennis reviewt.

CONTEXT
R0g (Voortgang-parity voor beweging) staat al als commit c1e363a op main en op
origin/main. Er is dus GEEN codewijziging nodig voor de feature zelf. Wat de deploy
vandaag blokkeert is deploy.sh:5 — die weigert bij `git status -s` ≠ leeg, en er staan
drie untracked docs in de working tree:
  docs/cursors/claude-opus-beweging-v3.5-prompt.md
  docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md
  docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html
Plus het verdict-document van deze ronde.

TAAK
1. Verifieer dat c1e363a inderdaad op origin/main staat en dat de werkboom verder
   schoon is (`git log --oneline -3`, `git status -sb`).
2. Voeg aan de v3.5-prebuild-HTML het implementatie-tag-commentblok toe, direct ONDER
   het bestaande "v3.5 — WAT DIT LOCKT"-commentaar in de <head>. De inhoud staat
   letterlijk in sectie C.3 van
   docs/cursors/claude-opus-beweging-v3.5-implementatiekaart-verdict-2026-08.md.
   Kopieer het één-op-één. Wijzig verder NIETS in de HTML.
3. Wijzig in diezelfde HTML de string "Week 1 van 8" naar "Fase: opbouw" (copy-lock §J
   verbiedt een noemer van het type "trede X van Y" op een doe-surface). Alleen die
   string; geen omliggende markup.
4. Voeg aan docs/design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md het STATUS-blok toe
   direct onder de H1. De exacte tekst staat in sectie H.2 van het verdict.
5. Rapporteer welke bestanden Dennis moet committen zodat `deploy.sh` kan draaien, met
   een voorgestelde commit-boodschap. VOER GEEN git commit of git push uit.

CONSTRAINTS
- Raak GEEN bestand in src/ aan. Deze deploy bevat geen codewijziging.
- Voer de preselect_source-fix NIET uit — die hoort in deploy 2 (voorzittersbesluit M.1,
  het F1a-meetvenster loopt tot 20-08 06:38).
- Geen wijziging aan affiliate-links.ts, scoring.ts of globals.css.
- Geen git commit, geen git push, geen deploy.sh draaien.

ACCEPTATIE
- De v3.5-HTML draagt het tag-blok en opent nog steeds zonder console-fouten bij
  dubbelklikken (self-contained, fonts inline).
- "Week 1 van 8" geeft nul treffers in het bestand.
- PROEF-doc draagt het STATUS-blok met de meetbare heropen-trigger.
- `git status -s` toont uitsluitend doc-bestanden.

VERIFICATIE
- `grep -c "Week 1 van 8" docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html`
  → 0
- `git status -sb` → geen src/-bestanden
- Open de HTML in de browser: vijf schermen × vijf reviewer-staten, nul console-fouten.
```

### L2 — Deploy 2: slice 9 + copy-unificatie + `preselect_source`

```text
ROL
Je bent implementator op PerfectSupplement (Next.js 16, TypeScript strict, Tailwind in
JSX, Supabase, imports via @/). NL UI-strings, Engelse code. Je commit niet.

CONTEXT
Slice 9 = de bestaande vierpunts-brug een TWEEDE aanroeper geven op de Beweging-surface.
Voorzittersbesluit M.2: het is NIET de v3.5-piramide-brug en NIET het v3.5-dual-label.
Eén label overal: "Zet er iets naast".
Deze deploy mag pas ná 2026-08-20 06:38 (einde F1a-meetvenster). Bevestig dat de datum
gepasseerd is voordat je begint.

Bestaande onderdelen (niet opnieuw bouwen):
- src/lib/beweging-help-bridge.ts:29  buildBewegingHelpBridge(model, slot, nutritionLogCompleted)
- src/components/dashboard/agenda/MeerHulpBridgeSheet.tsx  (sheet, titel r.65)
- src/components/dashboard/agenda/AgendaBlockDetailSheet.tsx:295  (huidige trigger)
- src/components/dashboard/BewegingScreen.tsx  (de nieuwe aanroeper; showAdvice op r.139)
- choice.shelf_opened staat al op alle drie de registratieplekken (events.ts:57,
  account-events-client.ts:15, api/account/events/route.ts:20) — GEEN registratiewerk.

TAAK
1. MeerHulpBridgeSheet: voeg prop `fromState: "agenda_meer_hulp" | "beweging_surface"`
   toe en gebruik die in de emit op r.44-47 in plaats van de hardcoded waarde.
2. MeerHulpBridgeSheet: verwijder het blok "Je basis · primair pad" (r.71-84) volledig.
   Het is op beide surfaces redundant. Laat de lead (r.66-69) en de keten ongewijzigd.
3. AgendaDayTimeline.tsx: geef `fromState="agenda_meer_hulp"` mee.
4. AgendaBlockDetailSheet.tsx:295: wijzig het triggerlabel "Meer hulp hierbij" naar
   "Zet er iets naast".
5. BewegingScreen.tsx: render de brug als tweede aanroeper.
   - Gate: uitsluitend binnen `showAdvice` (klaar-staat-contract D.1 — advies wordt nooit
     prominenter dan een open dagstap).
   - Plaatsing: als regel-CTA in de lg:max-w-3xl-kolom, direct BOVEN "Gratis
     Bewegingsgids".
   - Label: "Zet er iets naast".
   - Bouw de bridge met buildBewegingHelpBridge(model, slot, nutritionLogCompleted);
     nutritionLogCompleted is in dit bestand al beschikbaar.
   - Geef `fromState="beweging_surface"` mee.
6. beweging-help-bridge.ts:48: wijzig de status van het punt "favorieten" van "now" naar
   "toekomstig". Werk de comment op r.7-12 bij: de brug beloofde opslag die niet bestaat.
7. MovementTodayHero.tsx:289: splits de preselect_source-ternary in drie waarden zodat
   "beweegcheck" kan voorkomen wanneer de voorselectie uit de volledige beweegcheck komt
   (deriveMovementCurrent(...).source === "beweegcheck"), "checkin" bij de pulse-tak, en
   "plan" als er geen aanbeveling is. Raak de voorselectie-LOGICA niet aan — alleen het
   payload-veld.

CONSTRAINTS
- Imports via @/. NL UI-strings, Engelse identifiers. Server components default.
- Geen `label_variant` in de payload — met één label is dat een dode dimensie.
- Geen wijziging aan de brug-INHOUD (de vierpunts-keten blijft; geen piramide, geen
  ladder, geen paneel).
- Geen favorieten-opslag, geen schap, geen nieuw component onder voortgang/.
- src/app/intake/ niet aanraken.
- Geen affiliate-links.ts, scoring.ts, globals.css.
- Meetpunten in dezelfde PR als de surface-wijziging.
- Geen git commit.

ACCEPTATIE
- Op Beweging in klaar-staat is er precies één nieuwe uitgang met label "Zet er iets
  naast"; bij een open dagstap is hij afwezig.
- `grep -rn "Meer hulp hierbij" src/` → 0 treffers.
- `grep -rn "from_state" src/` toont beide waarden.
- De agenda-ingang werkt onveranderd (zelfde sheet, zelfde keten, zonder basis-blok).
- 375px: geen horizontale overflow, raakvlak ≥ 44px.

VERIFICATIE
- npx tsc --noEmit → exit 0
- npx vitest run → groen
- npx eslint src --max-warnings 0 → exit 0
- grep -rn "console.log" src/ → 0
- Meetpunt: choice.shelf_opened{from_state} (verdeling agenda vs. beweging_surface,
  venster 14 dagen) · dashboard_vandaag_card_shown{preselect_source:"beweegcheck"} > 0 ·
  regressiewacht dashboard_vandaag_action_toggled{done:true} mag niet dalen.
```

### L3 — Deploy 3: R1a `weeklyFrequency` + levende programma-preview

```text
ROL
Je bent implementator op PerfectSupplement (Next.js 16, TypeScript strict, Tailwind in
JSX, imports via @/). NL UI, Engelse code. Je commit niet.

CONTEXT
Productie-defect: `weeklyAvailability` heeft NUL schrijvers in productiecode (grep buiten
__tests__ = 0). Gevolg-keten:
  parseMovementPlanProfile (movement-plan-profile.ts:141,159) → weeklyFrequency = null
  → buildMovementProgramPreview (:291) returnt null zodra frequentie of locatie ontbreekt
  → VoortgangDomeinScreen.tsx:112-118 → movementProgramPreview altijd null
  → de programma-regel in MovementCheckinReadout valt voor ELKE gebruiker weg.
Alles behalve de UI bestaat al:
- API accepteert + valideert: api/account/movement-prefs/route.ts:137,177,246
- Patch schrijft: applyMovementPlanProfilePatch (movement-plan-profile.ts:361-364)
- Optieset: MOVEMENT_FREQUENCY_OPTIONS (src/data/movement/session-catalog.ts:151-158)
- Save-pad: MovementCockpit.tsx:217 → saveProfilePatch → use-movement-plan-profile.ts:55
Voorzittersbesluit M.3: R1a gaat vóór R1b. resolveEffectivePlanProfile blijft bewust
buiten de preview (comment r.280-284) — er moet een SCHRIJVER komen, geen fallback.

TAAK
1. MovementProgramSheet.tsx: voeg binnen het "Een andere vorm proberen"-blok, als EERSTE
   rij boven "Waar train je", een chiprij toe:
   - kop "Hoe vaak per week" (zelfde stijl als de bestaande koppen: uppercase,
     text-[10px], tracking-[0.12em])
   - <ChipRow options={MOVEMENT_FREQUENCY_OPTIONS} value={profile.weeklyFrequency}
       disabled={busy} onSelect={(id) => onSave({ weeklyFrequency: id })} />
   - direct eronder één feitelijke regel:
     "De richtlijn is 2× per week spier- en botversterkende activiteit
      (Beweegrichtlijnen 2017)."
2. Emit bij selectie het BESTAANDE event movement.target_set met
   { field: "weekly_frequency", value: id, surface: "programma_sheet" }. Geen nieuw event,
   geen registratiewerk.
3. Controleer dat VoortgangDomeinScreen.tsx:112-118 ongewijzigd blijft werken en de regel
   nu wél rendert zodra frequentie + locatie gezet zijn. Wijzig dat bestand alleen als er
   een aantoonbare bug is; voeg er geen nieuwe UI toe.
4. Voeg een unit-test toe die vastlegt dat een patch met weeklyFrequency de answers-sleutel
   "weeklyAvailability" zet en dat buildMovementProgramPreview daarna een niet-lege string
   oplevert.

CONSTRAINTS
- De chiprij zet UITSLUITEND weeklyFrequency. Hij raakt targetMinutes en de dagstap-duur
  niet (lock 11: dose ≠ dayDur, twee velden, nooit één control).
- Compliance: feitelijke frequentie-copy met bronvermelding. Verboden: "aanbevolen voor
  jou", "wij adviseren", elke tweede-persoons-voorschrijving. Adviezen, geen diagnoses.
- Niets in de hero (MovementTodayHero) en niets op Voortgang als nieuwe UI.
- Geen BewegingProgrammaPaneel — dat besluit is vervallen (verdict C.2).
- src/app/intake/ niet aanraken. Geen affiliate-links.ts, scoring.ts, globals.css.
- Imports via @/. Geen git commit.

ACCEPTATIE
- Na één tik op een frequentiechip levert buildMovementProgramPreview een string van de
  vorm "2× per week · thuis · zelf"; na herladen is de waarde terug uit de answers-jsonb.
- Voortgang › Beweging toont de programma-regel; hij is niet langer structureel leeg.
- KPI na 2 weken: aandeel Voortgang › Beweging-bezoeken met niet-lege programma-regel
  > 25% onder gebruikers die de sheet minstens één keer openden (was structureel 0%).
- 375px: chiprij wrapt netjes, raakvlakken ≥ 44px.

VERIFICATIE
- npx tsc --noEmit → exit 0
- npx vitest run → groen (incl. de nieuwe test)
- npx eslint src --max-warnings 0 → exit 0
- grep -rn "console.log" src/ → 0
- Meetpunt: movement.target_set{field:"weekly_frequency"} en het niet-leeg-aandeel van de
  programma-regel — hier lees je het effect af. Regressiewacht:
  dashboard_vandaag_action_toggled{done:true} en dashboard.beweging_programma_open.
```

### L4a — Deploy 5a: R2a, Voortgang C-readout + gekozen-sectie (géén ladder)

```text
ROL
Je bent implementator op PerfectSupplement (Next.js 16, TypeScript strict, Tailwind in
JSX, imports via @/). NL UI, Engelse code. Je commit niet.

CONTEXT
v3.5-lock 8: Voortgang › Beweging toont TWEE BRONNEN en ÉÉN CONCLUSIE, in deze volgorde:
  1. Gemeten — de check-readout, byte-identiek met het check-in resultaat, met de vlag
     "Zelfde blok als op je check-in resultaat" erboven.   ← bestaat al (movementCheckinSnapshot)
  2. Feitrijen — eigen antwoordlabels, vier zichtbaar.      ← bestaat al (MovementFactReadout, c1e363a)
  3. Gekozen — je basis, en de extra alleen als je die echt koos.   ← DIT BOUW JE
  4. Prioriteiten — de ladder verklaart.                    ← NIET NU (dat is R2b)
Deze plak is bewust gesplitst: de volledige ladder is te groot voor één deploy en heeft
een eigen meetvenster nodig.
Voorzittersbesluit C.2: instellen gebeurt in MovementProgramSheet; Voortgang LEEST TERUG.
Er komt geen bewerkbaar paneel op Voortgang.

TAAK
1. VoortgangDomeinScreen.tsx: voeg onder het bestaande readout/fact-blok een
   "Gekozen"-sectie toe (beweging-only, achter de bestaande isMovement-gate):
   - kop-eyebrow "Gekozen"
   - regel 1 = je basis: het programma als feitelijke regel, uit
     buildMovementProgramPreview (levend sinds R1a) in de vorm
     "Kracht · thuis · 2× per week · beginner"
   - onder die regel één link "Pas je programma aan ›" die de programma-sheet opent op de
     Beweging-surface (hergebruik het bestaande deeplink-pad open=programma via
     buildMovementRoutingHref / dashboard-url.ts:124)
   - is de regel leeg (geen frequentie of locatie gezet), toon dan één zin die de
     gebruiker naar de sheet stuurt — nooit een lege sectie.
2. Er is GEEN extra-regel: "extra" hangt aan het schap (slice 11) en dat is geparkeerd.
   Bouw het veld niet vooruit.
3. Copy-lock v3.5 §J: verboden in gerenderde tekst, aria-labels en eyebrows:
   stappenplan · route · fase · spoor · startpatroon · categorie · cockpit · kompas ·
   journey · deep view · programma-catalogus · oefeningenbibliotheek · coming soon ·
   level · trede X van Y · biohack · Laag N. Toegestaan: "ladder", "je programma".
4. Hergebruik het bestaande event dashboard.beweging_programma_open met from:"voortgang"
   op de teruglees-link (het event staat al op alle drie de registratieplekken; alleen de
   waarde van `from` is nieuw).

CONSTRAINTS
- Geen ladder, geen prioriteitsblokken, geen rail, geen zelf-calibratie — dat is R2b.
- Geen bewerkbare controls op Voortgang (lock 8: Voortgang meet en verklaart, doet niet).
- Voeg GEEN nieuwe beweging-tak toe aan VoortgangDomeinScreen buiten de bestaande
  isMovement-gate; het bestand moet in Golf 2 generiek gemaakt kunnen worden.
- De gekozen-sectie mag de readout nooit tegenspreken. Komen readout en programma-regel
  ooit uiteen, dan is dat een bug, geen nuance (besluit §D).
- src/app/intake/ niet aanraken. Geen affiliate-links.ts, scoring.ts, globals.css.
- Geen medische claims; adviezen, geen diagnoses. Imports via @/. Geen git commit.

ACCEPTATIE
- Volgorde op het scherm is: gemeten → feitrijen → gekozen. Geen vierde blok.
- De teruglees-link opent de programma-sheet op de Beweging-surface en emit
  dashboard.beweging_programma_open{from:"voortgang"}.
- Bij een leeg profiel staat er een sturende zin, geen lege sectie.
- 375px: geen horizontale overflow; binnen tegels container-queries (@container /
  @[Npx]:), geen lg:/xl: — de midden-zone is ~744px bij open contextkolom.

VERIFICATIE
- npx tsc --noEmit → exit 0 · npx vitest run → groen · npx eslint src --max-warnings 0 → exit 0
- grep -rn "console.log" src/ → 0
- Copy-lock-check: grep -rniE "stappenplan|startpatroon|cockpit|kompas|coming soon|laag [0-9]" \
  op de gewijzigde bestanden → alleen bestaande, niet-gerenderde treffers
- Meetpunt: dashboard.beweging_programma_open{from:"voortgang"} en
  domain_tool.snapshot_viewed{domain:"beweging"} (mag niet dalen) — hier lees je het
  effect af. Regressiewacht: dashboard_vandaag_action_toggled{done:true}.
```

> **L4b (R2b — ladder, rail, zelf-calibratie)** wordt pas uitgeschreven ná het R2a-venster.
> Reden: hij draagt het enige nieuwe durable event van de hele keten
> (`movement.self_calibration_set`, drie registratieplekken) plus een nieuw component + een
> nieuwe `src/lib/movement-ladder.ts`. Dat is geen tweede plak van dezelfde deploy maar een
> eigen deploy met eigen venster (harde regel: twee conversie-gevoelige surfaces niet samen).

---

## M · Commissie-tegenpraak op míjn deploy-volgorde

**Conversion: "R2 ladder vóór R1b — Voortgang is waar mensen het zien."**
Reëel punt: de sheet wordt door een minderheid geopend, Voortgang is de kijk-surface. Maar de
ladder verklaart een conclusie die hij niet mag tegenspreken (besluit §D), en de gekozen-sectie
leest het programma terug. Zonder R1a/R1b staan er in die sectie lege velden — een ladder bouwen
boven een leeg programma is dezelfde fout als een paneel bouwen boven een veld dat niemand kan
zetten.
**Voorzittersbesluit: afgewezen, mét concessie.** R2 wordt gesplitst in R2a (C-compositie, dicht
bij wat Conversion wil, kleine blast radius) en R2b (ladder). R2a mag direct ná R1b — dat is één
deploy eerder dan de oorspronkelijke volgorde. **M.3 blijft ongewijzigd.**

**Tech debt: "R1a is 20 regels, waarom wachten."**
Klopt qua omvang: één `ChipRow`, één copy-regel, één emit — alle onderdelen bestaan al. Maar R1a
is geen bugfix zonder gevolgen: hij maakt een regel zichtbaar die vandaag voor 100% van de
gebruikers wegvalt. Dat is een surface-wijziging op Voortgang, en die wil je niet in hetzelfde
venster als de nieuwe brug-ingang op Beweging — dan is `choice.shelf_opened{from_state}` niet
schoon af te lezen.
**Voorzittersbesluit: afgewezen.** R1a blijft deploy 3. **M.3 blijft ongewijzigd** — de volgorde
R1a vóór R1b staat, alleen niet vóór slice 9.

**Evidence: "F1a-venster vervuild."**
Vier annotaties in 14 dagen, en de diff-audit van `442616c` én `c1e363a` toont dat geen van beide
hero, voorselectie of check-nudge raakt. Het venster is niet vervuild; het is druk beannoteerd.
Wat het venster wél kan slopen is risico 2: een ontbrekende `accepted_default`-dimensie.
**Voorzittersbesluit: M.1 blijft ongewijzigd** (R0g nu, `preselect_source` op 20-08), **met één
verscherping**: staat `accepted_default` niet in GA4-admin, dan is er op 20-08 geen F1a-verdict en
gaat deploy 2 niet automatisch door — dan is de eerste vraag of slice 1 opnieuw moet, niet of slice
9 mag.

**M.2, M.4 en M.5 zijn niet aangevochten en blijven ongewijzigd.** M.2 wordt zelfs versterkt (C.1:
het tweede label heeft geen bestemming). M.4 krijgt een concrete invulling van optie B (§H.2). M.5
krijgt een expliciete ontwerpschuld-post (§I.2).

---

## N · Actielijst Dennis

| # | Wat | Effort | Waarom nu |
|---|---|---|---|
| **1** | **Controleer in GA4-admin of `accepted_default` een aangepaste dimensie is.** Ontbreekt hij → **BLOCKER voor deploy 2 op 20-08**: er is dan geen F1a-verdict, registratie werkt niet met terugwerkende kracht, en slice 1 begint opnieuw | **S** (5 min) | Dit stond op 9 én 11 augustus al als actie "nu". Alles wat op 20-08 wacht, wacht hierop |
| **2** | **Commit de drie untracked docs + dit verdict, dan `bash deploy.sh`** — R0g (`c1e363a`) staat op `main` maar `deploy.sh:5` weigert bij een niet-schone tree | **S** | Deploy 1 is verder klaar; dit is het enige dat hem tegenhoudt |
| **3** | **Bevestig dat prod R0g serveert** (Voortgang › Beweging toont fact-rijen + ijkpuntprompt) | **S** | Zonder bevestiging is het meetvenster van deploy 1 niet gestart |
| **4** | **Accordeer sectie B + C als SSOT** — met name: `BewegingProgrammaPaneel` is KILL, en lock 4/5 gaan niet in slice 9 | **S** (besluit) | Dit is de enige beslissing in dit document die niet uit code of eerdere besluiten volgt. Zonder akkoord bouwt de volgende sessie lock 4 in slice 9 |
| **5** | **Kies scenario A of B voor de inhoudsproef** (§H). Mijn advies: **B — parkeren met meetbare heropen-trigger** | **S** (besluit) | M.4 verbiedt stille doorschuiving; B maakt de trigger een cijfer in plaats van een voornemen |
| **6** | **Leg twee eenregelbesluiten vast in `BESLUIT_BEWEGING_PRODUCT_EN_IA.md`**: (a) toon bevriest, feit herberekent; (b) profiel = wat je *wil*, `movementCurrent` = wat je *doet*, snapshot = wat je *antwoordde* | **S** | Risico 4 en 5; beide zijn vandaag impliciet in de code en nergens expliciet |
| **7** | ~~Beslis de dose-range-drift~~ — **besloten 13-08**: geen drift, twee velden (weektotaal vs. dosis per keer); R1b bouwt eigen `MOVEMENT_DOSE_MINUTES_*`-constanten voor het dosisveld, zie risico 12 | — | Afgerond |

---

**Meetpunt:** `domain_tool.snapshot_viewed{domain:"beweging", has_conclusion}` (deploy 1) ·
`choice.shelf_opened{from_state}` + `dashboard_vandaag_card_shown{preselect_source:"beweegcheck"}`
(deploy 2, en de heropen-trigger van de inhoudsproef) · `movement.target_set{field:"weekly_frequency"}`
plus het niet-leeg-aandeel van de programma-regel (deploy 3) ·
`dashboard.beweging_programma_open{from:"voortgang"}` (deploy 5a) ·
`dashboard_vandaag_action_toggled{done:true}` (permanente regressiewacht) — hier lees je het effect af.

---

## O · Uitbreiding — slaap v2 + voeding v1, parallel aan beweging (12 augustus, vervolgverzoek)

Dennis' vraag: de vijf domeinen ogen live ongelijk gepolijst; slaap v2 en voeding v1 zijn allebei
voltooide, ship-ready ontwerpbesluiten (`BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md`,
`BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md`) die **niet** op beweging's 45% wachten — waarom niet nu
bouwen, parallel? Terecht. Dit is geen "v3.5-mechaniek forceren op andere domeinen" (dat blijft nee,
zie de vorige ronde) maar twee onafhankelijke, al ontworpen trajecten uitvoeren.

### O.1 Statuscorrectie na verificatie

**Voeding v1 is production-ready als eerste twee slices.** Sectie L van het besluit-document
specificeert zelf al acht Cursor-slices (V1a–V1h) met exacte bestanden en acceptatiecriteria — V1a en
V1b zijn de enige twee zonder voorganger en kunnen parallel. Sectie C van het besluit bevat de
volledige help-copy voor alle 13 vragen. Niets ontbreekt.

**Slaap v2 is groter dan het leek.** De huidige `src/lib/sleep-assessment.ts` gebruikt vandaag
letterlijk `SleepBand = "aandacht"|"redelijk"|"sterk"` — bandtaal, geen laag-model, geen klinische-
signalen-detectie, geen `SleepCheckinSnapshot`. S-R0 (het besluit-document, §G) is dus geen
data-toevoeging maar een **volledige engine- en resultaatscherm-vervanging**, qua omvang
vergelijkbaar met beweging's `442616c` (24 bestanden, +2577 regels). Bovendien: de v1-prebuild
draagt help-copy (`helpTitle`/`helpBody`) voor slechts **6 van de ~10 vragen** — als losse
per-staat-demo, geen volledige tabel zoals voeding die wél heeft in §C. `SLP_WAKE`, `SLP_QUAL` en
`sleepconfidence` hebben geen gesourcte helpBody. Die vragen fabriceren zou een placeholder zijn.

**Besluit voor deze ronde:** voeding krijgt zijn eerste twee slices (V1a+V1b) in volle omvang.
Slaap krijgt uitsluitend het deel dat vandaag **volledig gesourcet** is — de zes lagen, de
evidence-matrix, de signalenlijst en de twee mock-datasets, 1:1 uit de v1-prebuild canon (lock L1).
De engine-rewrite (S-R0 compleet: `resolveSleepLayer`, `detectClinicalSignals`,
`buildSleepFactRows`, `SleepCheckinSnapshot`, nieuw `SleepCheckinReadout.tsx`) én de ontbrekende
help-copy voor drie vragen zijn een aparte, latere ronde — exact dezelfde reden waarom L4b bij
beweging niet in deze ronde zat: te groot, te veel onderling afhankelijk, verdient een eigen
onderzoekspas.

### O.2 Wat dit oplevert, en wat nog niet

| | Deze ronde | Volgende ronde |
|---|---|---|
| **Voeding** | V1a (breedte-vragen → kern + help-velden) + V1b (piramide-data: lagen + clusters) | V1c–V1h: engine, readout-component, rail op Voortgang, poort, meetpunten |
| **Slaap** | Data-fundament: `SLEEP_LAYERS`, `SLEEP_EVIDENCE_MATRIX`, `SLEEP_SIGNALS`, `SLEEP_TIME_CHIPS`, `SLEEP_SCAN_ROWS` — geïsoleerd, geen consumers | Content: helpBody voor `SLP_WAKE`/`SLP_QUAL`/`sleepconfidence`. Code: volledige S-R0-engine + `SleepCheckinReadout.tsx` + resultaattak-rewrite. Daarna S-R2 (ladder op Voortgang), S-R2b (mini-brug + `DomainSupplementList` eruit), S-R5 |

Geen van beide prompts hieronder raakt beweging-bestanden. Ze mogen letterlijk in dezelfde week als
deploy 1–3 van sectie D lopen — andere domeinen, andere surfaces, geen gedeeld meetvenster.

### O.3 Cursor-prompt — Voeding V1a + V1b

**Correctie na verificatie (Explore-onderzoek + eigen leescontrole van `NutritionCapture.tsx`):**
de besluit-doc's V1a-bestandenlijst (§L) noemt alleen `lifescore-questions.ts` en
`nutrition-diet-skip.ts` — maar `NutritionCapture.tsx` heeft een **volledig aparte "breadth"-fase**
(eigen `Step`-kind, een `breadthIntro`-tussenscherm met "Optioneel — Nog N vragen" en een
"Overslaan"-knop, eigen navigatiefuncties, een eigen GA4-event `NUTRITION_BREADTH_SKIPPED`). Zonder
dat bestand mee te nemen compileert V1a wel, maar toont het tussenscherm live **"Nog 0 vragen voor
een verfijnde score"** met een knop **"Verder (0 vragen) →"** — zichtbaar kapotte productie-copy.
Deze prompt neemt daarom het strikt noodzakelijke deel van die opruiming mee (de oude
fase-machinerie verwijderen); de NIEUWE "Waarom vragen we dit?"-disclosure-UI blijft V1e, apart.
Ook `src/lib/__tests__/nutrition-flow.test.ts` moet inhoudelijk herschreven worden, niet alleen
"groen blijven" — zijn hele testdoel (een aparte breedte-groep bewijzen) vervalt met deze wijziging.

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/design/BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md — vooral §0 (correcties op de opdracht),
  §C (vraag-uitleg contract, met de volledige help-tabel voor alle 13 vragen), §D2/§D3
  (cluster-mapping + plant-equivalentie), §L (Cursor-slices V1a/V1b, acceptatiecriteria)
- src/data/nutrition/lifescore-questions.ts (312 regels, lees volledig) — drie losse
  question-interfaces zonder gedeelde basis (SliderQuestion r.23-33, MultiQuestion r.35-41,
  SingleQuestion r.43-49), NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET r.53-55 (nu alleen "vegetables"),
  NUTRITION_CORE_SLIDER_IDS_AFTER_DIET r.57-64, NUTRITION_BREADTH_SLIDER_IDS r.72-77 (fruit,
  berries, wholegrain, sugaryDrinks), NUTRITION_REQUIRED_STEP_COUNT/BREADTH_STEP_COUNT/TOTAL_STEPS
  r.300-306, NUTRITION_FLOW-samenstelling r.284-290. Bestaat al: `helper?: string` op alle drie de
  interfaces (blijft ongewijzigd — hij leert METEN, de nieuwe `help` legt uit WAAROM, nooit
  samenvoegen, besluit §C "Hergebruik-notitie")
- src/lib/nutrition-diet-skip.ts (356 regels, lees volledig) — twee parallelle skip-sporen:
  getSkipReason/shouldSkipSlider voor AFTER_DIET (r.91-117) met eigen index-navigatie
  nextAfterDietIndex/firstAfterDietIndex/lastAfterDietIndex/resolveAfterDietStep (r.264-309), en
  shouldSkipBreadthSlider/getBreadthSkipReason voor BREADTH (r.119-137, alléén wholegrain+
  tarwe-allergie) met eigen nextBreadthIndex/firstBreadthIndex/lastBreadthIndex (r.311-341).
  syncDietContext (r.218-253) en getCurrentlySkippedIds (r.344-355) hebben allebei een los
  AFTER_DIET-blok én een los wholegrain-specifiek blok
- src/components/intake/NutritionCapture.tsx (lees volledig, ±1000 regels) — met name: Step-union
  r.50-56 (incl. "breadthIntro"/"breadth"), isQuestionStep r.74-81, sliderDefaults r.111-124,
  questionForStep r.133-159, requiredStepsCompleted r.161-185, requiredStepNumber r.191-200,
  canGoBack r.202-216, redirectIfCurrentStepSkipped r.299-324, goToAfterDietOrBreadth r.423-430,
  goNextFromCoreAfterDiet r.458-465, goNextFromBreadth/handleSkipBreadth/handleContinueBreadth
  r.467-495, handleBack r.497-549 (drie breadth-branches: r.498-509, r.511-518, r.520-527), de
  submission-payload met `breadth_skipped: breadthSkipped` (r.610, r.615), de breadthIntro-render
  r.791-848, en de per-vraag render r.850-937 (met name isOptionalBreadth r.856 en de
  "Optioneel — X van N"-regel r.916-921)
- src/lib/ga4.ts:21 — GA4_EVENTS.NUTRITION_BREADTH_SKIPPED (enige definitie, enige aanroeper is
  NutritionCapture.tsx's handleSkipBreadth)
- src/lib/__tests__/nutrition-flow.test.ts (82 regels, lees volledig) — r.15-44 assert de
  volgorde-offset van NUTRITION_BREADTH_SLIDER_IDS als los blok ná alle AFTER_DIET-vragen; r.57-81
  test dat "kern-only" en "kern+breedte" defaults hetzelfde report geven. Beide aannames vervallen
  met deze wijziging en moeten herschreven worden, niet alleen "laten passeren"
- src/lib/__tests__/nutrition-diet-skip.test.ts — bestaande tests voor getSkipReason/
  shouldSkipSlider en shouldSkipBreadthSlider("wholegrain", …); r.58-62 is de enige
  wholegrain/tarwe-case
- src/data/nutrition/intake-reference.ts — **bevat GEEN herbruikbare benchmarkLabel/source-strings**
  in de vorm die besluit §C vraagt (WHO staat hier zelfs nergens letterlijk; dit bestand citeert
  Gezondheidsraad/EFSA voor de confidence-toon, niet als brontekst). Typ de WHO/Gezondheidsraad/
  PROT-AGE-referenties uit besluit §C vers over, zoek ze niet in dit bestand
- src/data/movement/session-catalog.ts — het te volgen stijlprecedent: `as const`-array +
  aparte `getXById`-lookupfunctie, GEEN ordinalen in gerenderde strings
- **Val om te vermijden:** src/data/foundation-pyramid.ts bestaat al met een vergelijkbaar
  laag-model, maar gebruikt `eyebrow: "01".."05"` als ordinaal-string die rechtstreeks in de UI
  rendert (FoundationPyramid.tsx). Dat is precies het patroon dat besluit §0 verbiedt ("geen
  laagnummer in enige exportstring, ook niet zonder 'van 6'"). Kopieer dit bestand NIET als
  voorbeeld voor de vorm van NUTRITION_LAYERS — alleen zijn `getPyramidLayerById`-lookuppatroon is
  bruikbaar, niet zijn `eyebrow`-veld

## Taak

### V1a — breedte-vragen worden kern (data + skip-logica + UI-opruiming, één PR)

**1. src/data/nutrition/lifescore-questions.ts**
- Verplaats `fruit` en `berries` naar `NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET`, ná `vegetables`
  (plant-equivalentie-groepering, besluit §D3 — ze horen inhoudelijk bij elkaar). Resultaat:
  `["vegetables", "fruit", "berries"]`.
- Verplaats `wholegrain` en `sugaryDrinks` naar het einde van `NUTRITION_CORE_SLIDER_IDS_AFTER_DIET`.
- Verwijder `NUTRITION_BREADTH_SLIDER_IDS`, het type `NutritionBreadthSliderId`, en
  `NUTRITION_BREADTH_STEP_COUNT` volledig (niet leeg laten — dit project verwijdert ongebruikte
  code, het laat geen orphaned constanten met waarde 0 staan).
- `NUTRITION_REQUIRED_STEP_COUNT` blijft dezelfde formule
  (`NUTRITION_CORE_SLIDER_IDS.length + NUTRITION_META_QUESTIONS.length`) — komt automatisch op 13
  uit doordat `NUTRITION_CORE_SLIDER_IDS` nu 11 in plaats van 7 entries telt.
  `NUTRITION_TOTAL_STEPS` wordt daarmee identiek aan `NUTRITION_REQUIRED_STEP_COUNT`; grep eerst
  op consumers buiten dit bestand (de vorige controle vond er geen) en verwijder hem dan ook.
- Voeg aan alle drie de question-interfaces (SliderQuestion, MultiQuestion, SingleQuestion) een
  los, identiek optioneel veld toe:
  ```ts
  export type NutritionQuestionHelp = {
    title: string;
    body: string;
    anchor: string | null;           // clusterverwijzing "C1".."C5", of null voor meta-vragen
    benchmarkLabel: string | null;
    benchmarkKind: "populatierichtlijn" | "vuistregel" | null;
    source: string | null;
  };
  ```
  Voeg `help?: NutritionQuestionHelp;` toe aan elk van de drie interfaces apart (geen gedeelde
  basis-interface introduceren — dat raakt meer code dan nodig voor deze slice).
- Vul `help` voor alle 13 kern-vragen met de letterlijke tekst uit besluit §C (drie tabellen:
  kern-sliders, breedte-sliders, meta-vragen). Waar de tabel *null* aangeeft: `benchmarkKind: null`,
  `benchmarkLabel: "geen norm — dit is jouw eigen ijkpunt"`. Herformuleer niets.

**2. src/lib/nutrition-diet-skip.ts**
- Verplaats de tarwe-allergie-check voor `wholegrain` van `shouldSkipBreadthSlider`/
  `getBreadthSkipReason` naar `getSkipReason`/`shouldSkipSlider` (dezelfde voorwaarde:
  `hasGlutenAllergy(allergies)` → reden `"allergy"`), zodat hij meeloopt in de bestaande
  AFTER_DIET-lus nu `wholegrain` daar deel van is.
- Verwijder volledig: `shouldSkipBreadthSlider`, `getBreadthSkipReason`, `nextBreadthIndex`,
  `firstBreadthIndex`, `lastBreadthIndex`, en de losse wholegrain-`if`-blokken in
  `getSkippedSliderLabels` (r.149-151) en `getCurrentlySkippedIds` (r.351-353) — die worden
  overbodig zodra de hoofdlus over `NUTRITION_CORE_SLIDER_IDS_AFTER_DIET` wholegrain al meeneemt.
  Verwijder ook het `if (shouldSkipBreadthSlider(...))`-blok in `syncDietContext` (r.246-250) op
  dezelfde manier — laat de bestaande AFTER_DIET-lus (r.227-244) het overnemen.
- `sugaryDrinks` heeft geen enkele skip-regel vandaag; die blijft zo, geen actie nodig.

**3. src/components/intake/NutritionCapture.tsx**
- Verwijder `"breadthIntro"` en `"breadth"` uit de `Step`-union (r.50-56).
- `QuestionStep` (r.69-72): exclude-lijst wordt `{ kind: "result" | "error" | "consent" }` (zonder
  breadthIntro, die bestaat niet meer).
- `isQuestionStep` (r.74-81): verwijder de `"breadth"`-tak uit de check.
- Verwijder uit de imports: `NUTRITION_BREADTH_SLIDER_IDS`, `NUTRITION_BREADTH_STEP_COUNT` (uit
  lifescore-questions) en `firstBreadthIndex`, `getBreadthSkipReason`, `lastBreadthIndex`,
  `nextBreadthIndex` (uit nutrition-diet-skip).
- `sliderDefaults` (r.111-124): verwijder de `...NUTRITION_BREADTH_SLIDER_IDS`-spread — de vier
  vragen zitten al in BEFORE_DIET/AFTER_DIET, dus dit gebeurt vanzelf.
- `questionForStep` (r.133-159): verwijder de laatste breadth-tak (r.153-158) — de
  `coreBeforeDiet`- en `coreAfterDiet`-takken dekken nu alle sliders.
- `requiredStepsCompleted` (r.161-185): verwijder de `case "breadthIntro": case "breadth":`-regel
  (r.177-179) — beide kinds bestaan niet meer.
- `requiredStepNumber` (r.191-200): verwijder de breadth/breadthIntro-null-guard (r.192-194).
- `canGoBack` (r.202-216): verwijder `"breadthIntro"` en `"breadth"` uit de true-lijst (r.204-206).
- `redirectIfCurrentStepSkipped` (r.299-324): verwijder het hele `if (currentStep.kind ===
  "breadth")`-blok (r.313-322). In het `coreAfterDiet`-blok: vervang de fallback
  `return { kind: "breadthIntro" }` (r.310) door `return { kind: "consent" }`.
- `goToAfterDietOrBreadth` (r.423-430): hernoem naar `goToAfterDietOrConsent`; vervang de fallback
  `setStep({ kind: "breadthIntro" })` (r.429) door `setStep({ kind: "consent" })`. Werk de
  aanroep in `handlePreferenceSelect` bij naar de nieuwe naam.
- `goNextFromCoreAfterDiet` (r.458-465): vervang de fallback `setStep({ kind: "breadthIntro" })`
  (r.464) door `setStep({ kind: "consent" })`.
- Verwijder volledig: `goNextFromBreadth`, `handleSkipBreadth`, `handleContinueBreadth`
  (r.467-495), inclusief de `GA4_EVENTS.NUTRITION_BREADTH_SKIPPED`-emit daarin.
- Verwijder de `breadthSkipped`-state (r.247) en zijn `setBreadthSkipped`-aanroepen in `resetFlow`
  (r.418). Op de twee submission-plekken (r.610, r.615): vervang `breadth_skipped: breadthSkipped`
  door `breadth_skipped: false` (letterlijk — er is geen UI-pad meer dat hem `true` kan zetten,
  maar het payload-veld zelf blijft staan omdat `nutrition_log_completed` er buiten deze slice nog
  op leunt, besluit §G). Raak de API-route/server-schema niet aan.
- `handleBack` (r.497-549): verwijder de `if (flowStep.kind === "consent") { if (breadthSkipped)
  … }`-tak (r.498-509, laat consent direct terugvallen op `lastAfterDietIndex`) en de
  `if (flowStep.kind === "breadthIntro")`-tak (r.511-518) en de `if (flowStep.kind ===
  "breadth")`-tak (r.520-527) volledig.
- In het render-gedeelte: verwijder het hele `if (step.kind === "breadthIntro") { … }`-blok
  (r.791-848). Verwijder `isOptionalBreadth` (r.856) en vereenvoudig de progress-regel (r.916-921)
  tot alleen de `Vraag {stepNumber} van {NUTRITION_REQUIRED_STEP_COUNT}`-tak.

**4. src/lib/ga4.ts**
- Verwijder `NUTRITION_BREADTH_SKIPPED` (r.21) — geen andere aanroeper meer na stap 3.

**5. src/lib/__tests__/nutrition-flow.test.ts**
- Herschrijf, niet alleen "laten passeren". De assertie dat breedte-vragen als los blok ná alle
  AFTER_DIET-vragen komen (r.15-44) klopt niet meer: schrijf in plaats daarvan een test die
  bevestigt dat `NUTRITION_FLOW` exact de 13 vragen bevat in de volgorde vegetables → fruit →
  berries → allergies → preference → nutsSeedsLegumes → oilyFish → proteinMeals → meatLegumes →
  dairy → daylight → wholegrain → sugaryDrinks. Verwijder de "kern-only vs kern+breedte
  geeft hetzelfde report"-test (r.57-81) — die vergelijking bestaat niet meer nu er geen aparte
  breedte-subset is.

### V1b — piramide-data: zes lagen + vijf clusters
Nieuw bestand src/data/nutrition/lifestyle-pyramid.ts:
- Exporteer NUTRITION_LAYERS: 6 entries volgens besluit §E (laagnaam, toestand-regel als
  beschrijvende string). `layer: 1|2|3|4|5|6` als getypeerd numeriek veld — nooit in een
  tekstveld dat gerenderd kan worden (zie de foundation-pyramid.ts-val hierboven).
- Exporteer een `getNutritionLayerById(id)`-lookupfunctie, naar het patroon van
  `getPyramidLayerById` in foundation-pyramid.ts (dat deel is wél herbruikbaar).
- Exporteer NUTRITION_CLUSTERS: C1 t/m C5, elk met sliderIds (verwijzend naar de vraag-id's uit
  lifescore-questions.ts), layer, en whyLine (max 12 woorden, uit besluit §D2 de "status per
  antwoord"-mapping en de toestandsdrempels). Plus `getNutritionClusterById(id)`.
- Volg de typering en exportstijl van src/data/movement/session-catalog.ts (union types,
  `as const` waar toepasselijk, JSDoc-header van 1-2 regels boven het bestand).

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- "use client" blijft staan op NutritionCapture.tsx (ongewijzigd) — dit is geen server/client-
  omslag, alleen interne opruiming
- Verander NIETS aan: src/data/affiliate-links.ts, src/lib/scoring.ts, globals.css, deploy.sh,
  .env.local, elke `src/app/api/`-route (inclusief de nutrition-log-route — het payload-veld
  `breadth_skipped` blijft bestaan, alleen altijd `false`)
- Raak src/lib/nutrition-conclusion.ts, src/components/intake/NutritionResultView.tsx en
  src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx NIET aan — die horen bij V1c/V1d/V1f
  en hangen af van wat je hier bouwt, niet andersom
- Bouw de "Waarom vragen we dit?"-disclosure-UI (V1e) niet vooruit — `help` is in deze slice puur
  data, nog geen zichtbaar UI-element
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] NUTRITION_REQUIRED_STEP_COUNT = 13; NUTRITION_BREADTH_SLIDER_IDS,
      NutritionBreadthSliderId, NUTRITION_BREADTH_STEP_COUNT bestaan niet meer
- [ ] Alle 13 kern-vragen hebben een `help`-object met de letterlijke tekst uit besluit §C
- [ ] NutritionCapture.tsx bevat geen "breadth"/"breadthIntro"-Step-kind meer; het
      tussenscherm "Nog N vragen voor een verfijnde score" is verwijderd, niet op N=0 gezet
- [ ] Alle 13 vragen tonen "Vraag X van 13" — geen "Optioneel" meer in de flow
- [ ] nutrition-flow.test.ts is herschreven en groen; nutrition-diet-skip.test.ts blijft groen
      met de wholegrain/tarwe-case nu via getSkipReason/shouldSkipSlider
- [ ] src/data/nutrition/lifestyle-pyramid.ts exporteert NUTRITION_LAYERS (6) en NUTRITION_CLUSTERS
      (5), zonder laagnummer in een tekstveld, met getNutritionLayerById/getNutritionClusterById
- [ ] grep op "NUTRITION_BREADTH" in src/ → 0 treffers
- [ ] Geen nieuwe console.log in src/
- [ ] tsc --noEmit groen

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. grep -rn "NUTRITION_BREADTH\|breadthIntro\|shouldSkipBreadthSlider\|getBreadthSkipReason\|nextBreadthIndex\|firstBreadthIndex\|lastBreadthIndex" src/ — hoort 0 treffers te zijn
3. npx tsc --noEmit
4. npx vitest run src/lib/__tests__/nutrition-flow.test.ts src/lib/__tests__/nutrition-diet-skip.test.ts src/lib/__tests__/nutrition-score.test.ts

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat(voeding): V1a+V1b — kernvragen + piramide-data"
```

### O.4 Cursor-prompt — Slaap data-fundament (canon uit v1-prebuild, geen engine-wijziging)

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/design/BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md — §A.5 (wat v2 herstelt), §C.1 (PriorityLadder
  vervangt de taper — de 4px-statusbalk, geen trapezium), §F (Consumentenbond-keten, 6 lagen),
  §I (laagmodellen uit elkaar houden: "Laag N" is toegestane gebruikerscopy voor slaap — anders dan
  bij beweging, waar dat woord verboden is), §J.1 (lock L1: LAYERS/MATRIX/SIGNALEN/TIJDCHIPS/
  SCANROWS zijn canon, 1:1 uit v1, niet herschrijven), §J.5 (verboden woorden)
- docs/design/slaap-piramide-v1-prebuild-2026-08.html regels 299-400 — dit IS de brondata:
  `var LAYERS = [...]` (6 objecten: id, name, idx, sub, kern, chips, doing, mock/mockNote),
  `var MATRIX = [...]` (8 rijen: [methode, effectiviteit, bewijskracht, wanneer]),
  `var SIGNALEN = [...]` (8 strings), `var TIJDCHIPS = [...]` (8 strings),
  `var SCANROWS = [...]` (6 strings)
- src/data/sleep-checkin/index.ts — bestaande vraagdata (SleepDimensionKey, SleepBand,
  SLEEP_QUESTIONS) zodat je begrijpt welk domein-vocabulaire al vastligt; dit bestand raak je niet
  aan
- src/data/movement/session-catalog.ts — stijlprecedent voor een pure-data-bestand in dit project
  (union types, `as const`, korte JSDoc-header)

## Taak
Nieuw bestand src/data/sleep/lifestyle-pyramid.ts (nieuwe map, bestaat nog niet). Extraheer de vijf
canon-datasets 1:1 uit de prebuild-regels hierboven — geen enkele herformulering, geen inkorting:

1. `SLEEP_LAYERS`: 6 entries. Type:
   ```
   export type SleepLayerId = 1 | 2 | 3 | 4 | 5 | 6;
   export type SleepLayerMock = "tijdchips" | "opstaweek" | "omgevingscan" | "signalen" | "matrix";
   export type SleepLayer = {
     id: SleepLayerId;
     name: string;
     idx: string;           // "Laag 1" t/m "Laag 6" — toegestane UI-copy voor slaap (besluit §I)
     sub: string;
     kern: string;
     chips: readonly string[];
     doing: readonly string[];
     mock?: SleepLayerMock;
     mockNote?: string;     // alleen laag 3 heeft dit i.p.v. `mock`
   };
   export const SLEEP_LAYERS: readonly SleepLayer[] = [ /* 1:1 uit LAYERS r.299-372 */ ];
   export const SLEEP_LAYER_BY_ID: Record<SleepLayerId, SleepLayer> = /* zoals LAYER_BY_ID in de prebuild */;
   ```
2. `SLEEP_EVIDENCE_MATRIX`: 8 entries uit MATRIX (r.376-385), als getypeerd object-array:
   `{ method: string; effectiveness: string; evidenceStrength: string; whenRelevant: string }[]`
   — niet als rauwe tuple-array, voor leesbaarheid bij toekomstige consumers.
3. `SLEEP_SIGNALS`: `readonly string[]`, 8 items, 1:1 uit SIGNALEN (r.387-396).
4. `SLEEP_TIME_CHIPS`: `readonly string[]`, 8 items, 1:1 uit TIJDCHIPS.
5. `SLEEP_SCAN_ROWS`: `readonly string[]`, 6 items, 1:1 uit SCANROWS.

**Expliciet buiten scope van dit bestand: `SLEEP_QUESTION_HELP`.** De v1-prebuild draagt
helpTitle/helpBody voor slechts 6 van de ~10 vragen (als per-staat-demo in de STATES-objecten,
geen canonieke tabel). `SLP_WAKE`, `SLP_QUAL` en `sleepconfidence` hebben geen gesourcte tekst.
Verzin die niet — dat is een aparte content-slice. Voeg geen `SLEEP_QUESTION_HELP`-export toe, ook
niet gedeeltelijk of met TODO-comments.

Dit is een **geïsoleerd fundament**: geen enkel ander bestand in src/ importeert dit bestand na
deze slice. De engine-rewrite (resolveSleepLayer, detectClinicalSignals, buildSleepFactRows,
SleepCheckinSnapshot) en de UI (SleepCheckinReadout.tsx, VoortgangDomeinScreen-tak) zijn een
volgende, aparte ronde — bouw ze niet vooruit, ook niet als lege stubs.

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse strings (het zijn alle vijf al Nederlandse teksten uit de prebuild — kopieer
  letterlijk), Engelse variabelen/functies/types
- Verboden woorden nergens in de gekopieerde strings (controleer, verwacht geen treffers):
  stappenplan · route · fase · cockpit · kompas · level · "trede X van Y" · biohack ·
  sleep score · deep sleep · perfecte slaap
- Raak src/lib/sleep-assessment.ts, src/lib/sleep-delta.ts, src/data/sleep-checkin/index.ts,
  src/components/intake/SleepCheckin.tsx, src/components/dashboard/SleepScreen.tsx,
  src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx NIET aan — dit is uitsluitend één
  nieuw, geïsoleerd databestand
- Geen nieuwe map buiten src/data/sleep/lifestyle-pyramid.ts
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] src/data/sleep/lifestyle-pyramid.ts bestaat en exporteert exact: SLEEP_LAYERS (6),
      SLEEP_LAYER_BY_ID, SLEEP_EVIDENCE_MATRIX (8), SLEEP_SIGNALS (8), SLEEP_TIME_CHIPS (8),
      SLEEP_SCAN_ROWS (6)
- [ ] Geen enkel ander bestand in src/ importeert dit nieuwe bestand (grep bevestigt 0 consumers)
- [ ] grep op de verboden-woordenlijst in het nieuwe bestand → 0 treffers
- [ ] Geen SLEEP_QUESTION_HELP-export, geen TODO-comments
- [ ] Geen nieuwe console.log in src/
- [ ] tsc --noEmit groen

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npx tsc --noEmit
3. grep -rn "from \"@/data/sleep/lifestyle-pyramid\"" src/ — hoort alleen het nieuwe bestand zelf
   te zijn (0 externe consumers)

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "docs(slaap): datafundament lifestyle-pyramid — canon uit v1-prebuild"
```

### O.5 Wat hierna volgt

Beide prompts hierboven zijn bewust smal: data zonder wiring, zodat ze zonder risico dit najaar
kunnen landen naast beweging's deploy 1–3. De vervolgstukken — voeding V1c t/m V1h (engine,
readout-component, rail, poort, meetpunten) en slaap's volledige S-R0 (engine-rewrite + nieuw
resultaatscherm) plus de ontbrekende help-copy voor drie vragen — verdienen ieder hun eigen
onderzoekspas met dezelfde diepgang als sectie D–G hierboven kreeg voor beweging. Zeg het zodra je
wilt dat ik daarmee begin; voeding V1c hangt op niets nieuws (V1a+V1b zijn dan binnen), slaap's
help-copy-gat is de eerste blocker voor de rest van de slaap-keten.
