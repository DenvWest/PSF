# Statusverdict — beweging-keten, slices 1 t/m 16

> Voorzitter productcommissie · opgesteld 11 augustus 2026 · geen code in dit document.
> Alles hieronder is geverifieerd tegen `main` op commit `eec2368` (= `origin/main`, 0 ahead / 0 behind),
> plus zes gewijzigde bestanden in de working tree en één untracked doc.
> **Verificatiestatus repo:** `npx tsc --noEmit` exit 0 · `vitest run` 201 files / 1815 tests groen ·
> `eslint src --max-warnings 0` exit 0 · `grep -rn "console.log" src/` = 0 treffers. De WIP is technisch schoon.

---

## A. EXECUTIEF VERDICT

**REFINE.**

**Is beweging af? Nee — en het antwoord verschilt hard per niveau.**

| Niveau | Oordeel | Kern-bewijs |
|---|---|---|
| **R0** (check-in conclusie + readout) | **AF en LIVE** — één restpunt | Productie serveert de R0-verfijningsstrings: chunk `189lguveg838x.js` op `perfectsupplement.nl/intake/beweging` bevat *"Waarom vragen we dit"*, *"Wat je antwoordde, en waar dat staat"*, *"Onder de richtlijn"* en *"Wat er hierna gebeurt"* — en **nul** treffers op `een band lager` / `een band omhoog`. Commit `442616c`. |
| **S3** (programma-sheet v3.4 + rung 2 rijk + rung 3–6 op Voortgang) | **NIET af — ~45%** | Van de tien v3.4-locks staan er drie volledig in `src/`. `strengthLevel`, `conditionForm`, zelf-calibratie en `BewegingProgrammaPaneel` geven **nul** grep-treffers in `src/`. De ladder rung 1–6 bestaat alleen in de prebuild. |
| **Schap** (slice 11, generiek, na PROEF) | **0% code** | `PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md:229` — *"Geen UI-copy, geen prebuild-revisie, geen schema"*. `option_key` geeft nul treffers in `src/`. De proef zelf is niet aantoonbaar afgerond (geen ingevulde kaartenset in de repo). |

**Waarom REFINE en niet DEFER:** er staat één deploy-klare brok (R0g, de Voortgang-parity in de working tree) en twee wijzigingen van één regel die meetgaten dichten. Dat is te veel waarde om te parkeren en te weinig om GO te noemen.

**"Af voor verbreding" (slices 13–16) = R0 + slice 4 (=9) + beweging-S3 (=10) deploy-klaar + H.3 deels open.** Die poort staat **dicht**:

- **slice 4 (=9)** is 0% code: `MeerHulpBridgeSheet` heeft precies één aanroeper — `AgendaDayTimeline.tsx:537`. Er is geen ingang op de Beweging-surface.
- **slice 10 (=S3)** is ~45%.
- **H.3** is 1 van de 7 items hard afgevinkt (`domain_goal`/`domain_goal_score` bestaan, `src/lib/domain-goal.ts:255-335`); één item is half (B1 heeft nu één consumer, `BewegingScreen.tsx:139`, en de checklist eist er twee).

**De duurste bevinding van deze ronde staat niet in de hints:** `weeklyFrequency` heeft **geen enkele schrijver in de UI**. De API accepteert hem (`api/account/movement-prefs/route.ts:246`), maar geen component stuurt hem ooit. Gevolg: `buildMovementProgramPreview()` returnt `null` zodra `weeklyFrequency` ontbreekt (`movement-plan-profile.ts:291`), dus de programma-regel op Voortgang › Beweging (`VoortgangDomeinScreen.tsx:112-118`) is voor **elke** echte gebruiker leeg. Dat is v3.4-lock 3 die niet half maar helemaal ontbreekt, plus een dode readout die niemand heeft gemeld omdat hij er gewoon niet staat.

---

## B. MASTER-TABEL SLICES 1–16

`%` = aandeel van de genormeerde acceptatiecriteria van die slice dat verifieerbaar in `src/` staat. Geen gevoelsschatting: per rij staat het bewijs in de forensische secties D t/m G.

| # | Versmelting / R-pad | Naam | ● | % | Gebouwd | Gedeployed | Meetbaar | Blocker | Volgende actie |
|---|---|---|---|---|---|---|---|---|---|
| **1** | versm. 1 | F1a-meetvenster | 🟡 | n.v.t. | n.v.t. (alleen aflezen) | ✅ `7d6205b`, 06-08 06:38 | ⚠️ afhankelijk van GA4-admin | Venster vol **20-08 06:38** (vandaag dag 5/14) | Bevestig `accepted_default` als aangepaste dimensie in GA4 — werkt niet met terugwerkende kracht |
| **2** | versm. 2 | Nazorg sync beweegcheck → programma | 🟡 | 90 | ✅ `movement-checkin/route.ts:285` → `mergeMovementCheckinIntoAnswers` | ✅ `a1bcd9f` | ❌ **meetgat** | `preselect_source` emit is hardcoded `"checkin"\|"plan"` (`MovementTodayHero.tsx:289`) — `"beweegcheck"` kan nooit voorkomen | Eén-regel-fix: derde bron-waarde emitten |
| **3** | versm. 3 | v3-prebuild-patch (design-only) | 🟢 | 100 | ✅ v3.4 is canon (`beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html`) | n.v.t. | n.v.t. | — | Niets; v3.4 is de normatieve bron voor slice 10 |
| **8** | — / **R0** | Conclusie-model check-in + readout | 🟢 | 90 | ✅ `442616c` (24 bestanden, +2577) | ✅ **live geverifieerd** | ✅ 4 GA4-events emitten | R0g (Voortgang-parity) staat **uncommitted** | Committen + deployen (zie K, deploy 1) |
| **9** | versm. 4 | Dunne #b op Beweging-surface | 🔴 | 0 | ❌ één aanroeper (`AgendaDayTimeline.tsx:537`) | ❌ | ❌ `from_state:"beweging_surface"` bestaat niet | Geen code; plus drie copy-divergenties (sectie J) | Bouwen ná 20-08 — kleinste wijziging met meetbehoefte |
| **10** | versm. 5 / **R1–R2 (+R5 deels)** | Programma-sheet v3.4 (beweging-S3) | 🟡 | 45 | deels — zie E | deels (basis live) | deels | v3.4-locks 3,5,7,8,9 ontbreken volledig | Opknippen in R1 / R2 / R5; **niet** in één deploy met 9 |
| **11** | — | Schap slice A (generiek, na PROEF) | 🔴 | 0 | ❌ `option_key`: 0 treffers | ❌ | ❌ | PROEF S1–S9 niet aantoonbaar ingevuld | Proef eerst afronden en dateren (§2 PROEF) |
| **12** | versm. 5 (favorieten) | Favorieten-opslag | 🔴 | 0 | ❌ `beweging-help-bridge.ts:48` hardcoded `status: "now"` | ❌ | ❌ | Kill-criterium ongemeten omdat slice 9 ontbreekt | Wachten op brug-CTR uit slice 9 |
| **13** | — | Golf 1: V2 snapshot-delta + V3 `action_key→nutrient` | 🟡 | 45 | V3 ✅ (`step-sourcing.ts:44`) · V2 ❌ | V3 ✅ | ❌ V3 heeft **nul** consumers buiten tests | Registry zonder leesregel = dode code | V3 bedraden of expliciet parkeren |
| **14** | — / **S1** | Slaap domein 2 (data vullen) | 🔴 | 15 | `parseSleepCheckinFocus` ✅ + `sleepCheckinFocus` in het model ✅ | ✅ (als data) | ❌ | `VoortgangDomeinScreen` heeft **geen** slaap-tak: `isMovement` gate op r.85 | Analyse-shell generiek maken (R4) |
| **15** | — / **ST1-sjabloon** | Stress domein 3 | 🟡 | 25 | ST1-besluit ✅ geland · check-in-engine bestaat ✅ (`api/intake/stress-checkin`, `data/stress-checkin/stress-assessment.ts`) | ✅ | ❌ | Zelfde `isMovement`-gate; engine is 2 items (`STR_FREQ`, `STR_RCV`) | Ná slaap, op hetzelfde sjabloon |
| **16** | — / **E1** | DriverDeepView light + VB1/VB2 | 🔴 | 5 | ❌ `DriverDeepView`: 0 treffers · energie/herstel = `DomainSoonScreen` (`Dashboard.tsx:2493`, `:3158`) | ❌ | ❌ | Geen component | Kan parallel aan golf 2; laagste prioriteit |

> **Footnote — uncommitted WIP die de status beïnvloedt (6 bestanden, +46/−8).** Dit is **R0g** (Voortgang-parity) en het is de enige reden dat R0 op 90% staat en niet op 100:
> - `VoortgangDomeinScreen.tsx` +14 — `MovementFactReadout` en `DomeinIjkpuntCheckPrompt` op Voortgang › Beweging.
> - `account-dashboard.ts` +15 — `factRows` **herberekend** uit `raw_inputs` i.p.v. bevroren, zodat een latere copy-fix ook oude rijen bereikt. Dit is een bewuste keuze en het is de goede: hij ontsnapt aan de migratie-naad die het delta-blok wél heeft.
> - `movement-checkin-parse.ts` +8 en `movement-checkin/route.ts` +1 — `strip_variant` wordt nu **wel** bevroren opgeslagen.
> - `types/dashboard.ts` +7 · `MovementCapture.tsx` −3 netto (help-disclosure sluit nu op antwoord/terug i.p.v. via een `step`-effect).
> - Untracked: `docs/design/slaap-piramide-v2-prebuild-2026-08.html` — raakt slice 14, geen code.
>
> **Inconsistentie die je moet kennen:** `strip_variant` wordt bevroren opgeslagen, `factRows` wordt herberekend. Dat is twee verschillende antwoorden op dezelfde vraag in één commit. Beide zijn verdedigbaar (toon bevriezen, feit herberekenen) maar het besluit staat nergens expliciet — leg het vast vóór het derde veld erbij komt.

---

## C. PREREQUISITE-KETEN 1–8

### Slice 1 (versmelting 1) — F1a-meetvenster · **GATE DICHT tot 20 augustus**

| | |
|---|---|
| Referentiedeploy | `7d6205b` — *feat(beweging): GA4-meetpunten voor voorselectie-effectiviteit* |
| Deploy-moment | 2026-08-06 06:38 |
| Vandaag | 2026-08-11 → **dag 5 van 14**, nog **9 dagen** |
| Venster vol | 2026-08-20 06:38 |
| Drempel | `accepted_default_rate ≥ 60%` over volle P1 — **gelockt 09-08 vóór enig cijfer** (`beweging-f1a-gate6-verdict-2026-08.md:53`) |
| Bevroren | hero-copy · voorselectie-logica · check-nudge |

**Freeze-audit op wat er ná 6 augustus is geland — geen schending gevonden.** Commit `442616c` raakt `MovementCockpit.tsx` en `MovementProgramSheet.tsx`, allebei op de beweging-surface. Ik heb de diff regel voor regel gelezen:
- `MovementCockpit.tsx`: alleen deeplink-consumptie (`open=programma` opent de sheet, `stripMovementRoutingParams()` ruimt de URL op). De begeleidende comment claimt expliciet dat `focus` niets preselecteert, en de code houdt zich daaraan — `focus` wordt nergens gelezen behalve om hem te verwijderen (`dashboard-url.ts:137-146`).
- `MovementProgramSheet.tsx`: `trainingGuidance`-chiprij + drie lock-regels. Zit ín de sheet, niet in de hero.
- `MovementTodayHero.tsx`: **niet aangeraakt** door `442616c`.

Conclusie: hero, voorselectie en nudge zijn ongemoeid. De F1a-attributie is schoon gebleven. Wel drie GA4-annotaties nodig op 6, 9 en (bij deploy) 11+ augustus.

### **Mag slice 9 (=versmelting 4) nu deployen? Nee.**

Twee onafhankelijke redenen, en de tweede is de harde:
1. Slice 9 hangt een tweede ingang op de Beweging-surface. Dat is dezelfde surface waar `dashboard_vandaag_card_shown` en `dashboard_vandaag_step_alternative` vandaan komen. Een extra uitgang in beeld kan `accepted_default` beïnvloeden — precies de KPI die nog 9 dagen meet.
2. De versmelting-volgorde zet slice 4 expliciet **ná** slice 2, met een eigen venster van twee weken (`claude-opus-beweging-versmelting-verdict-2026-08.md §I`). Slice 2 is functioneel af maar **meettechnisch niet** (zie hieronder). Slice 9 deployen bovenop een slice-2 die je niet kunt aflezen, maakt beide onafleesbaar.

### Slice 2 (versmelting 2) — nazorg sync · **functioneel af, meettechnisch niet**

| Deel | Status | Bewijs |
|---|---|---|
| `MOV2_*` bereikt `intake_sessions.answers` | ✅ | `api/intake/movement-checkin/route.ts:285` roept `mergeMovementCheckinIntoAnswers(sessionRow.answers, fullReport)`; gedeelde sleutellijst `MOVEMENT_CURRENT_ANSWER_KEYS` (`movement-target.ts:106-113`) met een comment die schrijver en lezer aan elkaar bindt |
| `deriveMovementCurrent()` levert `source: "beweegcheck"` | ✅ | `movement-target.ts:31` union; consumers: `MovementProgramSheet.tsx:401`, `BewegingScreen.tsx:158`, `VoortgangDomeinScreen.tsx:105` |
| De check-regel staat in de sheet | ✅ | `MovementProgramSheet.tsx:401-421` — *"Uit je beweegcheck: matig … intensief … · kracht …"* |
| De nudge dooft | ✅ | `BewegingScreen.tsx:158` — `showBeweegcheckNudge = showAdvice && movementCurrent.source !== "beweegcheck"` |
| **`preselect_source: "beweegcheck"` verschijnt** | ❌ | `MovementTodayHero.tsx:289`: `preselect_source: recommendedKind != null ? "checkin" : "plan"`. `recommendedKind` komt uit `resolveRecommendedTodayChoiceKind(rcvFeelForHint, recovery)` — en `rcvFeelForHint` komt uit `pickLatestMovementRcvFeel()` over de check-in-rijen (`account-dashboard.ts:572`), dus uit de **pulse**-tak. Er is geen tak die "beweegcheck" produceert |

**Oordeel:** slice 2 is gebouwd en gedeployed maar **niet af**, want zijn eigen slaagcriterium is per constructie onmeetbaar. Het versmelting-verdict schreef het zelf: *"Slice 2 is geslaagd als `preselect_source: "beweegcheck"` überhaupt gaat voorkomen — vandaag is dat aantoonbaar nul."* Dat is nog steeds waar, en het blijft waar tot iemand de emit-regel splitst. Dit is de goedkoopste fix in dit hele document.

### Slice 3 (versmelting 3) — v3-prebuild-patch · **GATE OPEN, af**

v3.4 draagt alles wat slice 3 vroeg (A1–A4-substaten, `#s-d`-bindings, duur-chips als dosis) plus vier iteraties erbovenop. Geen `src/`-raakvlak. Eén governance-punt: de v3.4-headerlocks (r.7-33) zijn de normatieve bron voor slice 10, en ze zijn **strenger** dan wat het versmelting-verdict beschreef.

### Slice 8 (R0) — conclusie-model · **GATE OPEN, live**

Gebouwd, gedeployed en bewezen. Het live-bewijs staat in sectie A. Wat er precies leeft:

| R0-deel | Status | Bewijs |
|---|---|---|
| R0a/b/c conclusie + snapshot + deeplink | ✅ live | `movement-assessment.ts:145` `buildMovementConclusion` · `:753` `buildMovementCheckinSnapshot` · `dashboard-url.ts:124` `buildMovementRoutingHref` |
| R0d delta-copy zonder bandtaal | ✅ live | `movement-assessment.ts:450` `buildMovementFocusDelta`, templates T1–T7 (`:270`); nul treffers `een band` in gebruikersstrings (`vitality-gauge.ts:6` is een code-comment, `kennisbank.ts:621` is "bandbreedte" in een testosteron-artikel) |
| R0e vraag-uitleg opt-in | ✅ live | 11 van 11 vragen hebben `help: {title, body, anchor}` (`data/movement-checkin/index.ts`, 12 `help:`-treffers = 11 vragen + 1 typedefinitie op r.45); trigger `MOVEMENT_HELP_TRIGGER` r.49; `anchor ?? MOVEMENT_HELP_NO_NORM` (`MovementCapture.tsx:497`); `aria-expanded` + `aria-controls` correct |
| R0f feitelijke meting + vervolg-strip | ✅ live | `movement-assessment.ts:655` `buildMovementFactRows` met aerobe equivalentie (`:591` `aerobicStatus`, 1 min intensief = 2 matig); `MovementFactReadout.tsx` (4 rijen + toggle); `MovementFollowupStrip.tsx` (S1/S2/S3) |
| R0g Voortgang-parity | 🟡 **uncommitted** | de zes gewijzigde bestanden |

**Twee R0-locks die aantoonbaar gehouden zijn.** L15 (link-budget ≤ 5 uitgangen): op het intake-resultaat staan nu 1 primaire CTA + 2 à 3 striplinks + 1 gids-CTA. De ijkpunt-prompt is **verhuisd** van het resultaat naar Voortgang (`DomeinIjkpuntCheckPrompt` komt niet voor in `MovementCapture.tsx`, wél in de WIP op `VoortgangDomeinScreen.tsx:270`) en de terug-knop is opgegaan in de strip-route `mijn_dag`. Aanbouwen is dus niet gebeurd. L13: tijdens de check wordt geen band, score of tussenstand getoond.

---

## D. SLICE 4 (=9) FORENSISCH — dunne #b op de Beweging-surface

### D.1 Alle `MeerHulpBridgeSheet`-aanroepers

| Bestand:regel | Wat |
|---|---|
| `src/components/dashboard/agenda/AgendaDayTimeline.tsx:10` | import |
| `src/components/dashboard/agenda/AgendaDayTimeline.tsx:537` | **de enige render-site**, gegate op `addOpen && helpPreset` |
| `src/components/dashboard/agenda/AgendaBlockDetailSheet.tsx:281-297` | de trigger die `onOpenHelpSheet({domain})` roept, gegate op `block.slot.domain === "beweging"` |

De comment op `AgendaBlockDetailSheet.tsx:277-279` zegt het zelf: *"Tijdelijk beweging-only … Verbreedt zodra een domein zijn eigen brug-data draagt (§10)."*

### D.2 Permanente B1-plus-ingang op de Beweging-surface: **nee**

`BewegingScreen.tsx` heeft vier uitgangen en geen daarvan is de brug:
- `Bekijk je beweging ›` → Voortgang (r.196, `state:"klaar"`)
- de nutrient-bridge naar eiwit (r.236-253, getriggerd op een gelogde krachtsessie)
- de beweegcheck-nudge (r.261, `md:hidden`, dus **op desktop onzichtbaar**)
- `Gratis Bewegingsgids` (r.281) en de stille `Je voortgang · beweging ›` in de niet-klaar-staat (r.291)

### D.3 Copy — drie waarden voor één ding

| Plek | Letterlijke string | Bestand:regel |
|---|---|---|
| Sheet-titel (live) | **"Zet er iets naast"** | `MeerHulpBridgeSheet.tsx:65` |
| Trigger-label (live) | **"Meer hulp hierbij"** | `AgendaBlockDetailSheet.tsx:295` |
| Prebuild v3.2 t/m v3.4 | **"Voeg iets toe aan je basis"** (7× per bestand) | `…prebuild-v3.4-2026-08.html:1404, 1487, 2076, 3727, 4310` |

De hint zei "twee copy-divergenties". Het zijn er **drie**, en de derde is de gevaarlijkste: het versmelting-verdict lockte op 6 augustus *"Eén label overal: **Zet er iets naast**"* (J1-3), maar de prebuilds v3.2 t/m v3.4 gebruiken **allemaal** "Voeg iets toe aan je basis" — v3 en v3.1 gebruikten nog "Zet er iets naast" (6× elk). De lock is dus door de eigen prebuild-lijn overschreven zonder dat het J1-besluit is ingetrokken. **Iemand moet kiezen**, en het antwoord kan niet uit de documenten komen — die spreken elkaar tegen.

Mijn aanbeveling: **"Zet er iets naast"**. Reden: het is de enige van de drie die zowel als sheet-titel als als trigger werkt zonder rare inversie ("Voeg iets toe aan je basis" als knoplabel belooft een handeling die de dunne brug niet uitvoert — hij toont een status en stuurt door), en het is de formulering die J1-3 kreeg nadat *"Lukt het niet in je eentje?"* sneuvelde omdat het een persoon beloofde. `Lukt het niet` geeft **nul** treffers in `src/` en in alle vijf prebuilds — dat label is dood en blijft dood.

**Brug-lead.** Live (`MeerHulpBridgeSheet.tsx:66-69`): *"Iets ernaast zetten kies je in Voortgang, waar je oordeel en je hertest samenkomen — niet hier los."* De versmelting J1-1 schreef voor: *"Je basis blijft je basis — dit komt er hooguit naast. Wat erbij past kies je in Voortgang: daar staat ons oordeel naast jouw eigen hertest."* v3.4 heeft het weer anders: *"Je basis blijft staan. Dit is extra."* / *"…Dit is extra, en klein."* (`:3722-3724`). Drie leads, drie bronnen.

**Basis-blok redundantie: bevestigd.** `MeerHulpBridgeSheet.tsx:71-84` rendert nog het blok *"Je basis · primair pad"* met `stepTitle` + `programLabel`. J2-1a haalde dat er in de prebuild juist uit als redundant. v3.4 heeft het blok op één plek nog (`:1517`) maar niet in `bridgeHtml()` — de brug zelf is daar een **piramide** van laag 1–3 (`bridgeRungs()`, `:3729`), niet een vierpunts-keten.

**Dat laatste is de grootste divergentie van allemaal en hij staat in geen enkele hint:** live is de brug `Check → Advies → Favorieten → Beste` (`beweging-help-bridge.ts:40-50`); in v3.4 is de brug `laag 1 · laag 2 · laag 3` met per laag een sheet van maximaal drie acties. Dat zijn twee verschillende producten met dezelfde naam. Slice 9 kan niet "de bestaande sheet een tweede aanroeper geven" én "de prebuild volgen" — dat moet een expliciete keuze worden.

### D.4 Events

```
choice.shelf_opened  { domain: "beweging", from_state: "agenda_meer_hulp" }   MeerHulpBridgeSheet.tsx:44-47
clarityTag("dashboard_agenda", "meer_hulp_brug_shown")                        MeerHulpBridgeSheet.tsx:48
dashboard_agenda_meer_hulp_open { surface: "agenda", domain }                 AgendaBlockDetailSheet.tsx:285
dashboard_beweging_voortgang_click { surface: "meer_hulp_brug", state:"open" } MeerHulpBridgeSheet.tsx:56
```

`choice.shelf_opened` staat correct op alle drie de registratieplekken: `events.ts:57` (durable), `account-events-client.ts:15` (union), `api/account/events/route.ts:20` (allowlist). Er is dus **geen registratiewerk** voor slice 9 — alleen een tweede emit-site met een andere `from_state`.

### D.5 Wat ontbreekt voor de meetgate

`from_state: "beweging_surface"` bestaat nergens (grep: 0 treffers). Zolang die waarde niet emit, is het kill-criterium van slice 12 (zie F) niet toetsbaar en is de vraag *"wordt de deur ook zonder agenda gevonden?"* onbeantwoordbaar. `from_state` is een vrije payload-string op een durable event — geen schema-wijziging nodig.

---

## E. SLICE 10 (=S3) FORENSISCH — programma-sheet v3.4

### E.1 Veld-voor-veld: v3.4-lock ↔ `programProfile` ↔ sheet-UI ↔ Voortgang

| v3.4-lock | Datalaag (`movement-plan-profile.ts`) | Sheet-UI (`MovementProgramSheet.tsx`) | Voortgang (`VoortgangDomeinScreen.tsx`) | Oordeel |
|---|---|---|---|---|
| **1 · plek + begeleiding** (4 waarden, in product 2 velden) | ✅ `trainingLocation` r.83 · `trainingGuidance` r.85 | ✅ `LOCATION_OPTIONS` r.579-590 (alleen als `startPattern !== "dagelijks_ritme"`) · `GUIDANCE_OPTIONS` r.592-603 | leest mee in de preview r.115-116 | **DONE** — geland in `442616c` |
| **2 · duur eigen minuten naast chips** | ✅ `targetMinutes` r.88 | ✅ `PresetRow` r.446-455 met vrije invoer + knop "Zet" (r.196-211); range **20–400** (`data/movement/targets.ts:21-22`) | — | **DONE met afwijking**: v3.4 lockt 10–90 stap 5, de code doet 20–400 vrij. Bewuste verruiming of drift? Niet gedocumenteerd |
| **3 · frequentie instelbaar 1/2/3** | ✅ `weeklyFrequency` r.82 | ❌ **geen enkele UI** | leest hem (r.114) maar krijgt altijd `null` | **NOT STARTED — en actief kapot.** Zie E.2 |
| **4 · één programProfile met 7 velden** | 4 van 7: frequentie(dood) · plek · sport · voedingscheck(elders) | — | — | **PARTIAL** — `strengthLevel` (niveau), `conditionForm` (conditie-vorm) en `experience` (ervaring) geven **0 treffers** in heel `src/` |
| **5 · laag 2 rijk: 2 subblokken op Voortgang** | — | — | ❌ `BewegingProgrammaPaneel` bestaat niet (0 treffers in `src/`; alleen genoemd in `claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md:186, 244`) | **NOT STARTED** |
| **6 · conditie-raster: groep A programmeert, groep B duidt** | ✅ `sports[]` max 3 (r.110) · `SPORT_CATALOG` 14 entries | ✅ sport-chips r.528-553 + `buildMovementSportLens` r.278 · "beweegvorm" = `MOVEMENT_START_PATTERN_OPTIONS` r.573 | — | **PARTIAL** — de sport-duidt-nooit-stuurt-lock is gerespecteerd (`lens` raakt alleen copy); groep A is 3 startpatronen, v3.4 lockt 5 vormen |
| **7 · zelf-calibratie "Ik zit al verder op mijn ladder"** | — | — | — | **NOT STARTED** — 0 treffers |
| **8 · "Wat kun je hier doen?" op laag 3–6** | — | — | — | **NOT STARTED** — 0 treffers |
| **9 · laag 5 Bond-kader + laag 6 dubbele poort** | — | — | de dubbele poort bestáát al: `VoortgangDomeinScreen.tsx:104-105` (`source === "beweegcheck" && nutritionLogCompleted`) | **PARTIAL** — de poort is er, het kader niet |
| **10 · brug ongemoeid: laag 1–3** | — | — | — | **DIVERGENT** — live brug is de vierpunts-keten, niet laag 1–3 (zie D.3) |
| *(extra, niet in v3.4-locks)* ladder rung 1–6 in code | — | — | ❌ | **NOT STARTED** — `LAYERS` bestaat alleen in de prebuild (`:2954-3040`) |
| *(extra)* agenda-koppelstrip (R5) | — | `Open Mijn Dag` = navigatie, geen koppelhandeling | — | **NOT STARTED** |

### E.2 De weeklyFrequency-breuk, uitgeschreven

Dit is geen "ontbrekende UI" maar een dode readout die er al staat:

1. `parseMovementPlanProfile` leest `weeklyAvailability` uit de answers-jsonb (`movement-plan-profile.ts:141, 159`).
2. `api/account/movement-prefs/route.ts:137, 177, 246` accepteert en valideert `weeklyFrequency`.
3. **Geen enkele component stuurt hem.** De volledige grep buiten tests: `VoortgangDomeinScreen.tsx:114` (leest), `movement-plan-profile.ts` (definieert), `movement-prefs/route.ts` (accepteert). Nul schrijvers.
4. `buildMovementProgramPreview(weeklyFrequency, trainingLocation, guidance)` returnt `null` als *één van de eerste twee* ontbreekt (`movement-plan-profile.ts:291`).
5. Dus `movementProgramPreview` op `VoortgangDomeinScreen.tsx:112` is voor elke echte gebruiker `null`, en de programma-regel in `MovementCheckinReadout` (prop `programPreview`, r.249) valt altijd weg.

`resolveEffectivePlanProfile()` (r.297-308) vult `weeklyFrequency` wél met een pattern-default — maar die functie wordt bewust **niet** gebruikt voor de preview (de comment op r.280-284 verbiedt het expliciet: "Alleen de RAUWE, onopgeloste profielwaarden"). Die keuze is verdedigbaar; het gevolg is dat het veld nooit een waarde krijgt.

**Dit is de goedkoopste échte productwinst in slice 10** en hij zit in de eerste deploy-plak.

### E.3 Per R-slice

| R | Doel | Status | Bewijs |
|---|---|---|---|
| **R0** | conclusie-model | **DONE + live** | zie C |
| **R1** | programProfile SSOT + laag-2-paneel op Voortgang | **PARTIAL ~40%** | plek+begeleiding geland (`442616c`); `weeklyFrequency` dood; `strengthLevel`/`conditionForm` afwezig; `BewegingProgrammaPaneel` afwezig |
| **R2** | ladder rung 1–6 + zelf-calibratie | **NOT STARTED** | `data/movement/lifestyle-ladder.ts` en `lib/movement-ladder.ts` bestaan niet |
| **R3** | resultaat-persistentie `chosen_actions` | **NOT STARTED, bewust** | `movement-checkin/route.ts:228-230` schrijft het veld expliciet **niet** met een comment die uitlegt waarom ("een veld dat altijd leeg blijft leest later als 'niemand kiest iets'"). Goede beslissing, laten staan |
| **R4** | slaap/stress Voortgang-rij | **NOT STARTED** | `VoortgangDomeinScreen.tsx:85` `isMovement`-gate; geen `domain-analyse-shell.ts` |
| **R5** | agenda-leesregel + koppelstrip | **NOT STARTED** | geen leesregel; `Open Mijn Dag` blijft navigatie |

### E.4 Drie deploy-plakken

| Plak | Inhoud | Waarom deze grens | Meetvenster |
|---|---|---|---|
| **R1a — profiel-reparatie** | `weeklyFrequency`-UI in de sheet (v3.4-lock 3) + de programma-preview daarmee levend; géén nieuw paneel | Repareert een dode readout zonder een nieuw scherm te introduceren. Raakt de doe-surface alleen ín de sheet | `dashboard.beweging_programma_open` blijft de teller; regressiewacht `dashboard_vandaag_action_toggled{done:true}` |
| **R1b — laag-2-paneel op Voortgang** | `BewegingProgrammaPaneel` + `strengthLevel` + `conditionForm` | Voortgang staat buiten het F1a-venster; dit is de eerste écht nieuwe surface | `dashboard.beweging_programma_open{from:"voortgang"}` |
| **R2 — ladder + zelf-calibratie** | rung 1–6 als data, "Wat kun je hier doen?" op 3–6, de calibratie-sheet | Grootste blast radius, enige met een nieuw durable event (`movement.self_calibration_set`) | eigen venster |

R5 (koppelstrip) hoort **niet** in deze drie: hij raakt Mijn Dag en verdient zijn eigen deploy ná R1b.

---

## F. SLICES 11–12 — schap + favorieten

### F.1 PROEF §3 · S1–S9 proefstatus

De proef is **niet aantoonbaar uitgevoerd**. In de repo staat het proefdocument, geen ingevulde kaartenset — geen bestand met acht optieblokken, geen `is_monetised`-registratie, geen zoektijd/oordeeltijd-log (§7 vraagt daar expliciet om). Zonder die opbrengst kan ik S1 t/m S9 niet afvinken en kan niemand dat.

| Criterium | Toetsbaar vandaag? | Wat de repo wél zegt |
|---|---|---|
| S1 ≥ 8 opties | ❌ geen kaartenset | — |
| S2 ≥3 sterk / ≥3 zwak / ≥2 niet | ❌ | — |
| S3 ≥ 2 optietypes | ❌ | — |
| S4 `is_monetised` registratieplicht | ⚠️ deels vooraf bekend | `affiliate-links.ts` draagt creatine (r.33-39) en eiwitpoeder (r.57-63); `DOMAIN_PRODUCT_STANCE.movement` wijst exact die twee aan |
| S5a consistentie met bestaande surface | ❌ | de bestaande surfaces zijn er wel: `BewegingAdviesTreden` + `resolveGatedComparisonPath("creatine")` (`movement-assessment.ts:55`) |
| S5b consequentie doorgevoerd vóór deploy | ❌ poort op slice A | — |
| S6 vier assen per optie | ❌ | — |
| S7 nul dienst-kaarten op enkel een mening | ❌ | — |
| S8 ≤ 1 week / 10–12 pogingen, twee klokken | ❌ | — |
| S9 ≥ 3 vandaag-uitvoerbare eerste stappen | ❌ | — |

**Mag slice 11 bouwen? Nee.** Niet omdat de proef gefaald is, maar omdat hij niet is uitgevoerd. Het verschil is belangrijk: een gefaalde proef geeft je een besluit (§8: bij S1/S2-fail wordt het schap "een dunne, expliciet begrensde deur" en krijgt het preselect-spoor voorrang). Een niet-uitgevoerde proef geeft je niets, en bouwen zonder die uitkomst is precies wat §1 wilde voorkomen.

### F.2 Slice A-contract §10 — per item

| Generiek-eis uit §10 | In `src/`? | Bewijs |
|---|---|---|
| Schap-surface als **lees-staat** | ❌ | geen component |
| **Permanente ingang** (actie-soort + label gedeeld) | ❌ | de enige ingang is agenda-only en beweging-only |
| **Static data** per domein | ❌ | geen `data/*/shelf`-bron |
| `option_key` **namespaced** `{domain}:{slug}` | ❌ | 0 treffers op `option_key`. *Let op: `nutrientFromActionKey` (`step-sourcing.ts:44`) doet al exact dit patroon voor `voeding:<nutrient>:<slug>` — dat is de vorm om te kopiëren, niet opnieuw te bedenken* |
| Kaart neemt **`domain` als parameter** | ❌ | — |
| `choice.*`-events dragen `domain` vanaf de eerste emit | ✅ **al waar** | `MeerHulpBridgeSheet.tsx:45` stuurt `domain: "beweging"` mee. Dit ene contractpunt is al gehaald |
| Favorieten-opslag niet domein-gescopeerd | ❌ | geen opslag |
| Fit-lens optioneel (0 of 1 extra tab) | ❌ | — |
| Hertest 14/30d gedeeld | ✅ bestaat | `kompas-domain-check.ts:24` |

### F.3 Slice 12 kill-criteria — **expliciet**

> **Slice 12 (favorieten-opslag) vervalt als `choice.shelf_opened{from_state:"beweging_surface"}` op nul blijft** over een volledig venster van twee weken na slice 9. Dan is bewezen dat niemand er iets naast wil zetten, en is opslag bouwen voor een handeling die niemand start.

Vandaag is dat criterium **niet toetsbaar**, want `from_state:"beweging_surface"` bestaat niet. Slice 12 kan dus noch vervallen noch starten. Dat is de correcte staat — maar noteer dat `beweging-help-bridge.ts:48` `favorieten` hardcoded op `"now"` zet, terwijl er geen opslag is. De brug **belooft** dus vandaag al iets dat niet bestaat. Twee eerlijke uitwegen: het punt op `toekomstig` zetten tot slice 12 er is, of de status-copy veranderen van "nu" naar iets dat "hier kun je heen" betekent in plaats van "dit staat klaar".

### F.4 Risico slice 11 + 12 + FavorietenKeuze in één deploy

**Doe dat niet, en er is een derde reden bovenop de twee die je al kent.** `FavorietenKeuzeSection` en `FavorietenAanraderSection` bestaan al en staan live op de Voortgang-hub (`VoortgangHub.tsx:245, 251`). Dat zijn **supplement-verdict-kaarten**, geen schap-favorieten. Landt slice 12 in dezelfde deploy als slice 11, dan staan er drie dingen met "favoriet" in de naam op twee schermen, en is geen enkele klik-metriek nog toe te schrijven aan één van de drie.

---

## G. VERBREDING 13–16

| # | Item | "Alleen data vullen" | Écht bouwwerk | Hergebruik dat al bestaat | Afhankelijk van |
|---|---|---|---|---|---|
| **13** | Golf 1 · V2 snapshot-delta | ❌ | `previousBand` in de dashboard-snapshot; `nutrition-delta.ts` heeft alleen intake-consumers | de delta-bouwsteen bestaat en is getest | geen |
| **13** | Golf 1 · V3 registry | — | **gebouwd, niet bedraad** | `nutrientFromActionKey` (`step-sourcing.ts:44`), volledig getest (`step-sourcing.test.ts:49-68`) | consumers ontbreken; blokkeert H.3-item 5 |
| **14** | Slaap (S1) | **grotendeels ja** | de analyse-shell moet domein-agnostisch worden (`VoortgangDomeinScreen.tsx:85` is nu een harde `isMovement`-gate) | `parseSleepCheckinFocus` (`sleep-assessment.ts`), `SleepConclusion`, `sleepCheckinFocus` in `DashboardData` (`types/dashboard.ts:251`) — de data staat er, hij wordt op Voortgang niet gelezen (enige consumer: `Dashboard.tsx:3474`) | R4-shell |
| **15** | Stress (ST1-sjabloon) | ja, ná slaap | idem | **correctie op de planning:** stress heeft wél een check-in-engine (`api/intake/stress-checkin/route.ts`, `data/stress-checkin/stress-assessment.ts:26`) — het v3.4-verdict noemt stress "de duurste van de drie" omdat die engine zou ontbreken. Dat klopt niet meer. Wel is hij dun: 2 items (`STR_FREQ`, `STR_RCV`) | slaap eerst |
| **16** | E1 DriverDeepView light | ❌ | nieuw component | `getReadoutPresentation` + `READOUT_DRIVERS` (`domain-role.ts:20`) bestaan; `isReadoutDomain` (r.29) is de poort. Energie/herstel tonen nu `DomainSoonScreen` met een `SoonPill` (`Dashboard.tsx:2493-2519`) | kan parallel; laagste prioriteit |

**Eén compliance-punt bij 16:** `DomainSoonScreen` toont een `SoonPill`. Dat is precies het patroon dat VB1 bij verbinding wil afschaffen (*"geen badges, geen beloofde panelen"*, ontwerpverbod A.4-5). Als VB1 landt zonder E1, staat de belofte-badge nog op twee domeinen. Doe ze samen of doe geen van beide.

---

## H. H.3-POORT + GOLF-AFHANKELIJKHEDEN

### H.1 De zeven items

| | Item | Status | Bewijsregel |
|---|---|---|---|
| 1 | **≥3 interventiedomeinen** met volledige meetlat-rij (score + delta + checkpunten-sparkline uit echte bron) | **[ ]** — 2 van 3 | Score + `DeltaBadge` + `Sparkline` renderen generiek voor elk domein (`VoortgangDomeinScreen.tsx:200-220`) uit `buildLeefstijllijnRows`. Voeding telt (eigen bron); beweging telt sinds `442616c` (readout + delta + `baselineSourceLabel`). Slaap en stress hebben geen eigen rij. **Fable's telling "vandaag 1" is achterhaald — het zijn er 2** |
| 2 | **Stage-resolver** levert voor voeding + 1 tweede domein een niet-lege stage 3 | **[ ]** | Er is **geen** stage-resolver in `src/` (0 treffers op `resolveStage`/`StageId`/`voortgangStage`). Alleen `resolveAdviesState` (`statistieken-advies-model.ts:219`), voeding-only |
| 3 | **Ijkpunt-chip** heeft databron voor het focusdomein | **[x]** | `src/lib/domain-goal.ts:255-335` leest `domain_goal` + `domain_goal_score`; `DomeinIjkpuntCheckPrompt` draait op voeding, slaap, stress — en met de WIP ook beweging (`VoortgangDomeinScreen.tsx:270`) |
| 4 | **Klaar-staat-gate (B1)** gedeelde helper, gebruikt door beweging **én** één ander domein | **[~] half** | Helper: `src/lib/domain-ready-state.ts`. Consumer: **precies één** — `BewegingScreen.tsx:139`. Fable's notitie "consumers nog nul" is achterhaald; het item vinkt af bij domein twee |
| 5 | **Mijn Dag-leesregel** leest `daily_action_log` via het V3-registry | **[ ]** | `nutrientFromActionKey` heeft nul consumers buiten `__tests__` |
| 6 | **Beweging-S3** (programma-kaart) af | **[ ]** | ~45%, sectie E |
| 7 | **Stage 5 blijft uit** tot gebruikslijst + herbestelmoment | **[x] by design** | Blijvende uitsluiting; `ORDERING_ENABLED = false` (`step-sourcing.ts:20`) bewaakt hem in de runtime |

**Score: 2 hard afgevinkt (3, 7) · 1 half (4) · 4 open (1, 2, 5, 6).**

### H.2 Wat blokkeert wat

```
Golf 1  ─ V2 (niet gebouwd) ────────────────┐
        └ V3 (gebouwd, 0 consumers) ────────┤
                                            ├──► Golf 3 (kaart-koppeling)  GEBLOKKEERD
Golf 2  ─ S1 slaap (Voortgang-tak ontbreekt)┤    door: H.3-1, H.3-2, H.3-5, H.3-6
        ├ stress (na slaap)                 │
        ├ E1 (0 code)                       │
        └ VB1/VB2 (0 code)                  │
                                            │
Beweging-S3 (~45%) ─────────────────────────┘

Voortgang-v1 uit park  ◄── vereist alle 7 H.3-items
```

Concreet: **golf 2 is niet geblokkeerd** — S1 (slaap) kan vandaag starten, want hij hangt alleen aan het V3-*patroon* (dat bestaat), niet aan V3-*consumers*. **Golf 3 is dubbel geblokkeerd**: door beweging-S3 én door de ontbrekende stage-resolver. **Voortgang-v1 uit park** is het verst weg: item 1 vraagt een derde domein, wat slaap én stress betekent.

---

## I. MEETPLAN / MEETGATE-DASHBOARD

| Slice | Normatief event / KPI | Emitter bestaat? | Nu afleesbaar? | Regressiewacht |
|---|---|---|---|---|
| **1** (versm. 1) | `dashboard_vandaag_step_alternative{accepted_default}` ÷ totaal ≥ 60% | ✅ `7d6205b` | ⚠️ **alleen als `accepted_default` als aangepaste GA4-dimensie geregistreerd is** — dat werkt niet met terugwerkende kracht en is nog niet bevestigd | `dashboard_vandaag_action_toggled{done:true}` mag niet dalen |
| **2** (versm. 2) | `dashboard_vandaag_card_shown{preselect_source:"beweegcheck"}` | ⚠️ event ja, **waarde nee** | ❌ **nul, per constructie** (`MovementTodayHero.tsx:289`) | — |
| **8** (R0) | `movement_checkin_completed{focus_dimension, has_dimension_delta, is_recheck, strip_variant}` | ✅ `MovementCapture.tsx:179-184` | ✅ | — |
| **8** (R0) | `movement_checkin_routing_click{target, surface, slot}` | ✅ 3 emit-sites: `MovementCheckinReadout.tsx:116` (readout-CTA), `:130` (hint), `MovementFollowupStrip.tsx:79` (strip) | ✅ | — |
| **8** (R0e) | `movement_checkin_question_help_opened{field}` | ✅ `MovementCapture.tsx:478`, dedupe via `helpOpenedRef` | ✅ | — |
| **8** (R0f) | `movement_checkin_fact_readout_expanded{surface, focus_dimension}` | ✅ `MovementFactReadout.tsx:49` | ✅ | — |
| **9** (versm. 4) | `choice.shelf_opened{from_state:"beweging_surface"}` | ❌ alleen `agenda_meer_hulp` | ❌ | brug-CTR agenda mag niet wegvallen |
| **10** (S3) | `dashboard.beweging_programma_open{from}` | ✅ `MovementProgramSheet.tsx:241-242` (GA4 **én** durable) | ✅ maar `from` is hardcoded `"kompas_beweging"` — R1b moet `"voortgang"` toevoegen | `dashboard_vandaag_action_toggled{done:true}` |
| **11/12** | `choice.*` met `domain` | ✅ contract al goed | ❌ geen surface | — |
| **13** (V3) | `dashboard_ladder_step_click` / `dashboard.aanrader_clicked` | ✅ bestaan | ⚠️ V3 heeft geen consumer, dus geen effect om af te lezen | — |
| **14/15** | `domain_tool.snapshot_viewed{domain, has_conclusion}` | ✅ `VoortgangDomeinScreen.tsx:121-125` — **`has_conclusion` staat er al in** | ✅ voor beweging; `has_conclusion` is voor slaap/stress altijd `false` want `movementReadout` is de enige bron | — |

**Twee observaties.**

1. **Nul nieuw registratiewerk nodig voor alles t/m slice 10.** De vier `movement_checkin_*`-events zijn GA4-vrije strings (geen registratie), `choice.shelf_opened` en `dashboard.beweging_programma_open` staan al op alle drie de plekken, en `domain_tool.snapshot_viewed` draagt `has_conclusion` al. Het enige echt nieuwe durable event in de hele reeks is `movement.self_calibration_set` in R2, en dat is nog ver weg.
2. **Twee meetgaten kosten samen ongeveer twee regels code** (`preselect_source` derde waarde, `from_state` tweede waarde) en zijn allebei blokkerend voor een slice-gate. Dat is de slechtste verhouding tussen kosten en blokkade in dit hele document.

---

## J. COPY-DIVERGENTIE MATRIX

| UI-element | `src/` waarde | Prebuild v3.4-norm | Versmelting-lock | Slice die fixt |
|---|---|---|---|---|
| Sheet-titel brug | "Zet er iets naast" (`MeerHulpBridgeSheet.tsx:65`) | "Voeg iets toe aan je basis" (`:3727`) | "Zet er iets naast" (J1-3) | **9** — en er moet eerst gekozen worden |
| Trigger-label | "Meer hulp hierbij" (`AgendaBlockDetailSheet.tsx:295`) | "Voeg iets toe aan je basis" (`:1404, 1487, 2076`) | "één label overal" | **9** |
| Brug-lead | "Iets ernaast zetten kies je in Voortgang, waar je oordeel en je hertest samenkomen — niet hier los." (`:66-69`) | "Je basis blijft staan. Dit is extra." / "…, en klein." (`:3722-3724`) | J1-1-variant (weer anders) | **9** |
| Basis-blok "Je basis · primair pad" | ✅ aanwezig (`:71-84`) | ❌ verwijderd uit `bridgeHtml()` | J2-1a: eruit | **9** |
| Brug-inhoud | vierpunts-keten Check/Advies/Favorieten/Beste (`beweging-help-bridge.ts:40-50`) | piramide laag 1–3 met sheet per laag (`bridgeRungs()`) | v3.4-lock 10 | **9 of 10** — dit is een productbesluit, geen copy-fix |
| Favorieten-status | hardcoded `"now"` (`:48`) | n.v.t. | — | **12** (of eerder naar `toekomstig`) |
| "Lukt het niet in je eentje?" | **niet aanwezig** — 0 treffers in `src/` én in alle 5 prebuilds | — | geschrapt J1-3 | ✅ geen actie |
| Duur-range doel | 20–400 min (`data/movement/targets.ts:21-22`) | 10–90, stap 5 (v3.4-lock 2) | — | **10** — of documenteer de verruiming |
| "Markeer als gedaan" / "✓ Gedaan" | live-copy | v3.4 `#s-d` moest gepatcht (F1-tabel) | — | ✅ vermoedelijk gedaan in v3.2+ |

### J2. Confusion-traps — zes stuks

| # | Trap | Waar het wél staat | Waar het plan het verwacht |
|---|---|---|---|
| 1 | **`Rung`** | `BewegingAdviesTreden.tsx:21` — een lokaal component voor de **supplement-stepped-care** (3 treden: eiwit → hertest → oordeel, statussen `nu\|wacht\|staat\|dicht`) | De v3.4-**lifestyle-ladder** heeft 6 rungs en bestaat niet in `src/`. Wie op `rung` grept vindt het verkeerde ding en concludeert dat de ladder er al is |
| 2 | **"favorieten"** — drie betekenissen | (a) `FavorietenKeuzeSection`/`FavorietenAanraderSection` op de Voortgang-hub (`VoortgangHub.tsx:245, 251`) = **supplement-verdicts**; (b) `HelpBridgePointId "favorieten"` (`beweging-help-bridge.ts:15`) = een statuslabel zonder opslag; (c) schap-favorieten = slice 12, bestaat niet | Slice 12 gaat over (c). (a) is live en heeft niets met het schap te maak |
| 3 | **`choice.shelf_opened`** | de dunne brug-sheet (`MeerHulpBridgeSheet.tsx:44`) | PROEF §10 gebruikt `choice.*` als het meetpad van het **schap** (slice A). Dezelfde eventnaam telt straks twee verschillende oppervlakken. Zonder een `surface`- of `from_state`-onderscheid zijn ze niet te scheiden — nog een reden om `from_state` in slice 9 goed te doen |
| 4 | **"stress heeft geen check-in-engine"** | `api/intake/stress-checkin/route.ts` + `data/stress-checkin/stress-assessment.ts:26` — hij bestáát | `claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md` (R4-erfenis-lock) noemt stress "de duurste van de drie" op die grond. Dat argument is vervallen |
| 5 | **`preselect_source: "checkin"`** | betekent **pulse**-check (`RCV_FEEL`, ≤7 dagen — `movement-today-choices.ts:326`) | Lezers denken "de beweegcheck". De volledige beweegcheck komt nooit in dit veld. De waarde is niet fout, hij is misleidend genoemd |
| 6 | **B1 "nog zonder consumers"** | `BewegingScreen.tsx:139` gebruikt `adviceMayOutrankDayStep` al | De Fable-notitie (`:225`) en de H.3-checklist zeggen nul consumers. Dat was waar op 2 augustus en is het niet meer |

---

## K. DEPLOY-VOLGORDE (meet-ROI)

> **DEPLOY-REGEL.** Het meetvenster is het schaarse middel, niet de bouwtijd. De kleinste wijziging met een meetbehoefte gaat eerst. Twee conversie-gevoelige surface-wijzigingen in één deploy mogen alleen als hun effect los af te lezen is. Slice 11 nooit samen met slice 12 of de fit-lens.

### Volgende drie deploys

| # | Wat | Wanneer | Meetvenster | Wat er NIET bij mag |
|---|---|---|---|---|
| **1** | **R0g + de twee meetgat-fixes.** De zes WIP-bestanden (fact-rijen + ijkpunt-prompt op Voortgang, `strip_variant` persistentie) plus `preselect_source` derde waarde `"beweegcheck"` | **nu — kan tijdens het F1a-venster** | `domain_tool.snapshot_viewed{domain:"beweging", has_conclusion:true}` en `movement_checkin_fact_readout_expanded{surface:"voortgang_beweging"}` verschijnen. Van dag 1 af | Niets van slice 9 of 10. **Twijfelgeval, expliciet:** de `preselect_source`-fix raakt een payload-veld op de F1a-surface, niet de logica — `preselected_choice` en `accepted_default` blijven identiek. Ik houd dat voor veilig, maar zet er een GA4-annotatie op, en als je het venster volledig schoon wilt houden, schuif alléén die ene regel door naar deploy 2 |
| **2** | **Slice 9 (=versmelting 4): dunne #b op de Beweging-surface** + de copy-unificatie (één label, één lead, basis-blok eruit) + `from_state:"beweging_surface"` | **ná 20-08**, direct na het F1a-verdict | Eigen venster van **2 weken**: `choice.shelf_opened{from_state}` — verdeling agenda vs. beweging_surface. Blijft beweging op nul, dan hangt de deur verkeerd (niet: de deur is overbodig) | Geen slice 10. Geen favorieten-opslag. Geen brug-inhoud-verandering (keten → piramide) — dat is een productbesluit met eigen meetbehoefte |
| **3** | **Slice 10 plak R1a: `weeklyFrequency`-UI + levende programma-preview** | ná het slice-9-venster | `dashboard.beweging_programma_open` (volume) en het aandeel Voortgang-bezoeken waar de programma-regel niet leeg is. Regressiewacht: `dashboard_vandaag_action_toggled{done:true}` | R1b (laag-2-paneel) en R2 (ladder) gaan elk in een eigen deploy |

### Regressiewacht — permanent

`dashboard_vandaag_action_toggled{done:true}` mag niet dalen. Drie emit-sites: `AgendaTodayHero.tsx:230`, `DomainTodayStrip.tsx:222`, `use-daily-action-log.ts:117`. Deze teller is de enige die zegt of mensen nog steeds iets *doen* terwijl wij oppervlakken verbouwen. Lees hem per deploy af, niet per slice.

**GA4-annotaties die er moeten staan:** 06-08 (`7d6205b`), 09-08 (deploy-set 3: slice 2 + treden + brug), 09-08 (R0 `442616c`), plus één per deploy hierboven. Vier annotaties binnen het F1a-venster is veel. Noteer bij het 20-augustus-verdict welke daarvan de gemeten surface raakten (antwoord: geen).

---

## L. RISICO'S

| # | Risico | Ernst | Waarom nu | Mitigatie |
|---|---|---|---|---|
| 1 | **Attributie-vervuiling in het F1a-venster** — vier annotaties in 14 dagen | Middel | Geen ervan raakt hero/voorselectie/nudge (geverifieerd in C), maar het verdict op 20-08 moet dat expliciet vermelden, anders leest de volgende lezer een vertekend cijfer | Annotatielijst in het gate-verdict opnemen |
| 2 | **`accepted_default` is misschien nooit als aangepaste GA4-dimensie geregistreerd** | **Hoog** | Registratie werkt niet met terugwerkende kracht. Als dit niet gebeurd is, is het hele venster van 14 dagen weg en begint slice 1 opnieuw. Het gate-verdict noemde dit op 09-08 als actie 1 "nu" | Vandaag controleren in GA4-admin. Dit is het enige item in dit document met een deadline die al verstreken had moeten zijn |
| 3 | **WIP zonder deploy** — R0g staat al ≥2 dagen in de working tree | Middel | Het is schoon (tsc/vitest/lint groen) maar het blokkeert elke andere wijziging in die zes bestanden, en het maakt `git status` onleesbaar als er iets bijkomt | Deploy 1 |
| 4 | **Dubbele waarheid: `programProfile` vs. check-in vs. advies-treden** | Middel | Drie bronnen praten over "wat je doet": `deriveMovementCurrent()` (uit `answers`), `movementCheckinSnapshot` (bevroren in `raw_inputs`) en `buildBewegingAdviesTreden` (uit verdicts + voedingscheck). Ze zijn vandaag consistent omdat ze verschillende vragen beantwoorden — maar `BewegingProgrammaPaneel` (R1b) wordt de vierde en gaat over hetzelfde als de eerste | Leg vóór R1b vast: `programProfile` = wat je **wil**, `movementCurrent` = wat je **doet**, snapshot = wat je **antwoordde**. Eén zin per bron in de code |
| 5 | **Bevriezen vs. herberekenen is onbeslist** | Middel | In één WIP-commit wordt `strip_variant` bevroren en worden `factRows` herberekend. Beide met een goede comment, geen overkoepelend besluit | Eén regel in `BESLUIT_BEWEGING_PRODUCT_EN_IA.md`: toon bevriest, feit herberekent |
| 6 | **Migratie-naad delta-copy** | Laag, maar moet een besluit zijn | Voortgang leest `delta_line`, `delta_also_line`, `answer_label`, `implication_line` terug uit `raw_inputs` (`movement-checkin/route.ts:232-247`). Rijen van vóór `442616c` dragen nog bandtaal en blijven die tonen tot iemand hermeet | Acceptabel — maar zeg het hardop. De `factRows`-keuze in de WIP laat zien dat het ook anders kan; het delta-blok krijgt die behandeling bewust niet |
| 7 | **De brug belooft favorieten die er niet zijn** | Laag | `status: "now"` op een punt zonder opslag | Naar `toekomstig` tot slice 12, of de statuscopy herformuleren |
| 8 | **F1a-freeze schending** | **Geen gevonden** | Volledige diff-audit van `442616c` op de drie bevroren elementen: geen raakvlak | — |

---

## M. COMMISSIE-TEGENSPRAAK

### M.1 Deploy 1 — moet de `preselect_source`-fix mee?

**Tech debt: JA, nu.** Het is één ternary die drie waarden krijgt in plaats van twee. Uitstellen betekent dat slice 2 nóg twee weken onmeetbaar blijft en dat we straks slice 9 evalueren bovenop een naad waarvan we niet weten of hij werkt.

**Evidence: NEE, na 20 augustus.** *DISSENT.* Het F1a-venster meet één ding en het is al vier keer geannoteerd. Een vijfde annotatie op de gemeten surface — ook al is het "maar" een payload-veld op `dashboard_vandaag_card_shown` — maakt het 20-augustus-verdict aanvechtbaar precies op het moment dat je er een bouwbesluit van €weken op baseert. Negen dagen wachten kost niets; een onbruikbaar venster kost twee weken.

**Voorzittersbesluit: REFINE — splits deploy 1.** R0g gaat nu (raakt Voortgang en de intake-flow, niet de gemeten surface). De `preselect_source`-fix gaat op 20 augustus als eerste regel van deploy 2. Evidence heeft gelijk over de kosten van een aanvechtbaar venster; Tech debt heeft gelijk dat de fix triviaal is — maar triviaal en risicovrij zijn niet hetzelfde.

### M.2 Slice 9 — welk label, en welke brug?

**Conversion: "Voeg iets toe aan je basis".** Het is de nieuwste prebuild-waarde (v3.2 t/m v3.4, drie iteraties consistent) en het is een uitnodiging in plaats van een constatering. "Zet er iets naast" leest passief.

**UX: "Zet er iets naast".** *DISSENT.* Een knoplabel moet beschrijven wat er gebeurt na de tik. Er gebeurt: een dun paneel met vier statussen en één doorverwijzing. Er wordt niets toegevoegd. "Voeg iets toe aan je basis" belooft een handeling die de dunne brug per definitie niet uitvoert — dat is Pad A's hele punt.

**Tech debt: de labelvraag is de kleine vraag.** *DISSENT op de framing.* Live is de brug een vierpunts-keten; v3.4 is een piramide van laag 1–3 met een sheet per laag. Slice 9 heet "tweede aanroeper van de bestaande sheet" — maar als je de prebuild volgt, bouw je een ander component. Kies eerst welk product de brug is, dan volgt het label vanzelf.

**Voorzittersbesluit:** Tech debt heeft gelijk dat dit de hoofdvraag is. **Slice 9 = tweede aanroeper van de bestaande vierpunts-brug, met "Zet er iets naast" als enig label.** De piramide-brug hoort bij R2 (ladder in code) en niet bij een slice die als "klein" is begroot. Conversion krijgt zijn uitnodiging terug zodra de piramide er staat en de knop wél iets toevoegt.

### M.3 Slice 10 — mag `weeklyFrequency` vóór het laag-2-paneel?

**Conversion: nee, bouw R1b eerst.** Een frequentie-chiprij in een sheet die 40% van de gebruikers nooit opent, verandert niets. Het paneel op Voortgang is waar mensen hun programma zien.

**Tech debt: ja, en het is niet eens een feature.** *DISSENT.* Er staat een readout in productie die per constructie altijd leeg is (`VoortgangDomeinScreen.tsx:112-118`). Dat is geen ontbrekende feature maar een defect: code die is geschreven om iets te tonen, toont nooit iets, en niemand merkt het omdat de fallback stil is. Zulke code rot: de volgende ontwikkelaar ziet `movementProgramPreview` in de props en gaat ervan uit dat hij werkt.

**Compliance: geen bezwaar, één randvoorwaarde.** De frequentie-UI mag geen suggestie wekken van een medisch voorschrift. `3× per week` naast een WHO-richtlijn is feitelijk; "aanbevolen voor jou" is dat niet.

**Voorzittersbesluit: Tech debt.** R1a (frequentie + levende preview) gaat vóór R1b. Het repareert een defect, is klein, en maakt R1b daarna zinvoller — een paneel bouwen bovenop een veld dat niemand kan zetten is de duurdere volgorde.

### M.4 Slice 11 — is "de proef is niet uitgevoerd" hetzelfde als "de proef is gefaald"?

**Evidence: nee, en dat onderscheid moet je bewaken.** Een gefaalde proef is data: PROEF §8 geeft vijf verschillende vervolgroutes afhankelijk van wélk criterium sneuvelt. Een niet-uitgevoerde proef is afwezigheid van data, en die verleidt tot "we bouwen 'm gewoon klein".

**Conversion: de proef kost een week redactie en het schap is de moat.** *DISSENT op de prioriteit.* Als de proef zes maanden blijft liggen omdat er altijd een slice voorgaat, is de facto besloten dat het schap er niet komt — zonder dat iemand dat besluit heeft genomen.

**Voorzittersbesluit:** Conversion heeft een reëel punt over stille afstel. **Zet een datum op de proef of park hem expliciet.** Beide zijn eerlijk; doorschuiven zonder besluit is dat niet. Bouwen mag pas na S1–S9 + S5a — dat blijft staan.

### M.5 H.3-item 1 — tellen we 1 of 2 domeinen?

**Evidence: 2.** Beweging heeft sinds `442616c` score, delta, sparkline, baseline-label én een conclusie-readout uit een echte bron. Dat is de definitie in de checklist.

**UX: 1.** *DISSENT.* De checklist zegt "volledige meetlat-rij". Bij beweging staan die elementen verspreid over vier losse tegels (`Je stand`, positieregel, readout, fact-readout) en niet als één rij. Voeding heeft de rij; beweging heeft de onderdelen.

**Voorzittersbesluit: 2, met UX' bezwaar genoteerd als ontwerpschuld.** De checklist toetst databeschikbaarheid, niet compositie. Maar UX heeft gelijk dat "meetlat-rij" ooit ook een vorm was, en die vorm bestaat alleen bij voeding — noteer dat als aparte post en niet als H.3-blokkade.

---

## N. ACTIELIJST DENNIS

| # | Wat | Waarom nu | Effort | Meetpunt na deploy |
|---|---|---|---|---|
| **1** | **Controleer in GA4-admin of `accepted_default` als aangepaste dimensie geregistreerd is** | Dit stond op 9 augustus al als actie "nu" en registratie werkt niet met terugwerkende kracht. Staat hij er niet, dan is het venster van 14 dagen op 20 augustus leeg en begint slice 1 opnieuw. Alles in dit document dat op 20-08 wacht, wacht hierop | **S** (5 min) | `dashboard_vandaag_step_alternative{accepted_default}` levert een niet-lege verdeling |
| **2** | **Deploy 1: commit + deploy de zes WIP-bestanden (R0g)** — zónder de `preselect_source`-fix | Kleinste wijziging met meetbehoefte die *nu* mag: hij raakt Voortgang en de intake-flow, niet de F1a-surface. tsc/vitest/lint zijn groen. Elke dag dat dit blijft liggen blokkeert het werk in dezelfde bestanden | **S** | `domain_tool.snapshot_viewed{domain:"beweging", has_conclusion:true}` + `movement_checkin_fact_readout_expanded{surface:"voortgang_beweging"}` |
| **3** | **Beslis de drie brug-vragen op papier vóór 20 augustus** — (a) één label, (b) één lead, (c) keten óf piramide | Slice 9 is als "klein" begroot maar draagt een onbeslist productbesluit. Zonder deze drie antwoorden wordt de slice ofwel te groot ofwel landt hij met copy die de prebuild tegenspreekt. Mijn advies staat in M.2 | **S** (besluit, geen code) | n.v.t. — dit is de poort vóór het meetpunt |
| **4** | **20 augustus: lees het F1a-venster af, dan deploy 2 (slice 9 + copy-unificatie + `preselect_source`-fix)** | Twee gates gaan tegelijk open. De `preselect_source`-fix hoort in deze deploy omdat het venster dan gesloten is | **M** | `choice.shelf_opened{from_state}` — verdeling agenda vs. `beweging_surface` over 2 weken · `dashboard_vandaag_card_shown{preselect_source:"beweegcheck"}` > 0 |
| **5** | **Zet een datum op de inhoudsproef (slice 11) of park hem expliciet** | De proef blokkeert het schap én bepaalt of de generalisatie naar 5 domeinen doorgaat. Hij is niet uitgevoerd en er is geen datum. Zes maanden stil doorschuiven is een besluit dat niemand genomen heeft (M.4) | **S** (besluit) / **L** (uitvoering) | PROEF §7-registratie: zoektijd + oordeeltijd per optie — dat cijfer is het jaarbudget van de redactie |

---

**Meetpunt:** `dashboard_vandaag_step_alternative{accepted_default}` (gate 6, 20-08) · `domain_tool.snapshot_viewed{domain, has_conclusion}` (R0g-parity) · `choice.shelf_opened{from_state}` (slice 9 en het kill-criterium van slice 12) · `dashboard_vandaag_card_shown{preselect_source}` (slice 2, vandaag structureel nul) · `dashboard_vandaag_action_toggled{done:true}` (permanente regressiewacht) — hier lees je het effect af.
