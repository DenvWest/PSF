# Verdict — versmelting prebuild #d × live Beweging (check → doel → voorstel → Mijn Dag)

> **Opgesteld:** 6 augustus 2026 · branch `feat/slice2-beweging-advies-treden` (HEAD `5717d54`)
> **Status:** besluitdocument. Geen code, geen diffs, geen SQL, geen commit.
> **Pad A is uitgangspunt, geen agendapunt.** `#b` is geen hart; L1 = `#a`/`#e` doe-surface;
> L2 = Voortgang/advies-deur; L3 = dunne `#b`. `PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` §1–§9 blijft geparkeerd;
> alleen §10 (herbruikbaarheidscontract) en §11 (A/B/C-categorieën) zijn hier als lock gebruikt.
> **Gelezen:** `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` · `BESLUIT_FIT_PREFS.md` ·
> `claude-opus-beweging-mijn-dag-verdict-2026-08.md` (A–J bindend) ·
> `beweging-keuze-consumentenbond-prebuild-v3-2026-08.html` (`#s-a` r660, `#s-e` r704, `#s-d` r1198) ·
> `mijn-dag-fullbleed-prebuild-2026-08.html` · v2 alleen als diff.
> **Geverifieerd in `src/`:** `MovementCockpit` · `MovementTodayHero` · `MovementStartChoice` ·
> `MovementProgramSheet` · `movement-today-choices.ts` · `movement-target.ts` · `day-model.ts` ·
> `priority-pref-client.ts` · `AgendaTodayHero.tsx` · plus `agenda-plan-duration.ts`,
> `agenda-timeline.ts`, `beweging-help-bridge.ts`, `account-dashboard.ts`,
> `api/intake/movement-checkin/route.ts`, `api/account/priority-pref/route.ts`.

---

## A. Executive verdict

**S1 · Versmelting is productmatig slim — GO, met scope-correctie.**
Versmelt de *resolutieketen* (welke stap, welke zwaarte, welke duur, welke staat), niet de surfaces: de man 40+ stelt één vraag ("wat doe ik vandaag en past dat in mijn dag") die vandaag door twee schermen met andere woorden wordt beantwoord.

**S2 · Eén waarheid / twee readouts — GO, en dit staat er vandaag al.**
De wegval-toets houdt over de hele live keten: `daily_action_log` is de enige completie-bron (`day-model.ts:242`), de bloklengte is afgeleid en nergens opgeslagen (`agenda-plan-duration.ts:80`), en het plan-blok krijgt zijn `done` van de aanroeper in plaats van uit een eigen veld (`agenda-timeline.ts:301`) — gat 5 uit het Mijn-Dag-verdict is dicht. Er is géén derde completion-bron meer.

**S3 · v3 `#s-a` moet nu herzien — GO.**
`#s-a` toont één ononderscheiden "eerste keer", terwijl de live surface vier verschillende toestanden kent; en de duur-chips in `#s-a` binden aan de dag-readout van `#s-d`, wat regelrecht botst met de lock *"duur: nergens instelbaar, afgeleid uit de tier"*.

**S4 · check → test → voorstel → Mijn Dag synchroon binnen de aug-2 KILL's — PIVOT.**
De UI-helft kan (en staat er al); de datahelft niet: de volledige beweegcheck schrijft `MOV2_*` uitsluitend naar `intake_domain_checkin.raw_inputs` en alleen `RCV_FEEL` wordt eruit gelicht (`movement-recovery-context.ts:39`), terwijl `deriveMovementCurrent()` `answers.MOV2_*` leest (`movement-target.ts:112-115`). De test raakt vandaag dus wél de recovery-hint en de lijn op Voortgang, en níet het voorstel of het doel. Dat is een naad-fix, geen schermfix — en hij valt buiten geen enkele KILL.

> **Voor de gebruiker betekent versmelten: één zin over vandaag die op beide schermen woordelijk gelijk luidt, en een test die zijn voorstel aantoonbaar verandert. Het betekent níet één scherm minder, geen keuze op Mijn Dag, en geen tweede plek om iets af te vinken.**

---

## B. Huidige frictie

| # | Probleem | Wat de gebruiker merkt | Bron (bestand/regel) | Raakt |
| --- | --- | --- | --- | --- |
| 1 | **De beweegcheck bereikt het programma niet.** `MOV2_*` landen alleen in `intake_domain_checkin.raw_inputs`; de dashboard-laag licht daar uitsluitend `RCV_FEEL` en slaap-focus uit | Hij doet de elfvragen-test en leest daarna in *Jouw programma* nog steeds "Nog geen beweegcheck gedaan" | `api/intake/movement-checkin/route.ts:182-188` · `movement-recovery-context.ts:39` · `account-dashboard.ts:388,585` · `movement-target.ts:112-115` · `MovementProgramSheet.tsx:400-406` | #a · #e |
| 2 | **De check-nudge dooft nooit.** De regel hangt aan `movementCurrent.source !== "beweegcheck"`, en die waarde kan door #1 nooit `beweegcheck` worden | "Je voorstel draait nog op je intake" blijft staan ná de test die dat zou oplossen | `BewegingScreen.tsx:157-158` | #e |
| 3 | **Twee duur-getallen op één kaart.** De programma-regel toont de dosis (`doel 3× 50 min`), de dagstap toont de tier-range (`20–45 min`) — verschillende herkomst, geen relatie | "Mijn doel is 50 minuten maar er staat 20–45" — hij weet niet welk getal telt | `movement-target.ts:230-243` vs `movement-today-choices.ts:58,69,80` · samengesteld in `MovementCockpit.tsx:99-104` | #a · #e · #d |
| 4 | **`#s-a` bestaat niet als staat in de code.** De prebuild toont een eigen eerste-keer-scherm; live verschijnt de instel-strook *ónder* de hero en alleen zolang `startPattern == null` | De prebuild belooft een onboarding die het product niet heeft | `MovementCockpit.tsx:112-113, 160-189` vs v3 r660-701 | #a |
| 5 | **De dunne `#b`-deur hangt alleen aan de agenda.** `MeerHulpBridgeSheet` is bereikbaar via het agenda-blokdetail, niet vanaf de Beweging-surface; v3 `#s-e` heeft die deur wél | Op Beweging vastlopen heeft geen uitgang; op Mijn Dag wel | `AgendaDayTimeline.tsx:537-540` · `AgendaBlockDetailSheet.tsx:279` (werkboom: nu beweging-only) vs v3 r750 | #e |
| 6 | **De duur staat in de titel, niet als eigen regel.** Mijn Dag plakt `titel · duur` aan elkaar; `#s-d` heeft een aparte sub-regel | Cosmetisch klein, maar de 1:1-binding met `#s-e` is zo niet toetsbaar | `AgendaTodayHero.tsx:123-126` vs v3 r1234 | #d |
| 7 | **Streak op de dag-readout.** "X dagen op rij" bij `streak ≥ 2` is de enige plek op deze surface die iets over gisteren beweert — spanning met lock 7 (verdict §H7, nog open) | Een gemiste dag wordt zichtbaar als verlies | `AgendaTodayHero.tsx:384-386` | #d |
| 8 | **De tier-default staat op twee plekken.** `resolvePlanChoiceKind()` valt terug op `matig`, `resolveBewegingChoiceKind()` doet dat onafhankelijk nog eens | Nu identiek; bij de derde consumer wijkt de duur op Mijn Dag af van de tier op Beweging | `movement-today-choices.ts:357-369` · `agenda-plan-duration.ts:33-52` — naad-hygiëneregel 3 uit het verdict is nog niet geborgd | #e · #d |
| 9 | **De hertest verandert Voortgang, niet het voorstel.** De check-score gaat naar de leefstijllijn-serie; `model.domainScores` blijft de intake-snapshot | Zijn score beweegt, zijn dagstap niet | `account-dashboard.ts:490-513` vs `dashboard-model.ts` (scores uit `intake_sessions.domain_scores`) | #a · #e |

*Rijen 1, 2, 3, 8 en 9 zijn nieuw t.o.v. het Mijn-Dag-verdict §B. De rijen 1–4 en 6 uit dat verdict zijn geverifieerd gesloten: `useTodayActionDone` heeft nu callers (`Dashboard.tsx:3489`, `AgendaDayTimeline.tsx:162`), de duur bereikt de dag (`AgendaTodayHero.tsx:119-126`), `onPrefUpdated` loopt door tot de hero (`MovementTodayHero.tsx:315-329`), en de sheet-dosis patcht de programma-regel via `useMovementPlanProfile`.*

---

## C. Doel-IA — drie toestanden × twee surfaces

| Toestand | Beweging (L1) | PROEF §11 | Mijn Dag (readout) | PROEF §11 | Mag daar nooit |
| --- | --- | --- | --- | --- | --- |
| **Eerste keer, plan niet bevestigd** | `#s-a` sub-staat **A1** (voorstel + specs + "Klopt dit?"-strook) → **A2** (programma instellen, 30 sec) | **B** — kop, lead, spec-labels en dosis-dial zijn beweeg-woorden | Tray-regel: `UIT JE PLAN` · titel · `<tier-duur> · nog geen moment gekozen` + `Kies een moment ›` | **A** — al domein-overstijgend | tier-picker · score · weekoordeel · "0 van je 2" |
| **Eerste keer, plan bevestigd, nog niet op dag** | `#s-a` sub-staat **A3** (programma-regel gevuld, `Zet op Mijn Dag`) → **A4** (moment gezet, bevestigingsregel + hertest-datum) | **B** | Ongewijzigd tray; ná A4 het blok in het raster op de gezette tijd, hoogte = bovengrens tier | **A** | een tijd die niemand koos · een te-laat-staat |
| **Elke dag daarna** | `#s-e` open-staat (`Gedaan` / `Ik doe de korte` / `Wijzig keuze` / programma-regel) en klaar-staat (ervaringsvraag + stille `#b`-deur) | **B, met voorbehoud** — "ik doe de korte" is een dosisverkleining die niet elk domein kent | `#s-d`: tray óf raster, zelfde titel, zelfde duur, `Markeer als gedaan` in het detail | **A** | tweede tier-picker · duur-invoer · eindtijd-veld |

**De ene regel die de twee surfaces uit elkaar houdt:** *keuze woont op de domein-surface, tijd woont op de dag-surface, completie woont in het grootboek.* Elk van de drie heeft precies één schrijfplek en willekeurig veel leesplekken.

**Waar `#s-a` eindigt en `#s-e` begint:** `#s-a` is de enige staat waarin het plan nog niet bevestigd is. Zodra `startPattern != null` én er één keer is afgevinkt, bestaat `#s-a` niet meer — hij is geen tab en geen route, maar een toestand van dezelfde surface (dat is precies wat de v3-statebars al zeggen, r661 en r705).

---

## D. Datastroom-contract

| Bron | Consumer | Mag schrijven | Verloopt | Sync-regel | Wegval-toets |
| --- | --- | --- | --- | --- | --- |
| `intake_sessions.answers` + `domain_scores` | `deriveMovementCurrent()`, `getPriorityPillar()`, recovery-hint, `resolvePlanChoiceKind()` | intake-flow (`api/intake/session`), `api/account/movement-prefs` | nooit (snapshot per sessie) | Eén sessie-rij is de waarheid; een hermeting maakt een nieuwe rij en draagt het plan-profiel mee (`carryOverMovementPlanProfile`, `movement-plan-profile.ts:178-213`) | **Haalt** — zonder deze rij is er geen voorstel |
| `intake_domain_checkin.raw_inputs` (beweegcheck) | vandaag alleen `rcvFeel` (`movement-recovery-context.ts`) en de leefstijllijn-serie | `api/intake/movement-checkin` | nooit; `rcvFeel` is 7 dagen geldig (`isRcvFeelWithinDays`) | **Gebroken schakel.** `MOV2_*` moet dezelfde route naar het model krijgen als `RCV_FEEL`, anders is de test een readout zonder gevolg | **Haalt** — puur afgeleid, maar hij bereikt de consument niet |
| `movementPlanProfile` (`startPattern`, `targetMinutes`, `targetDays`, `targetStrength`, `sports`, `trainingLocation`) — in de answers-jsonb | `MovementCockpit`, `MovementProgramSheet`, `resolveRecommendedSessionVariant`, `programLabelFor` | alleen `api/account/movement-prefs`, via `MovementStartChoice` en de programma-sheet | nooit (duurzaam) | Eén schrijfpad, één hook (`useMovementPlanProfile`); componenten lezen | **Haalt** — de dosis bestaat nergens anders |
| `account_priority_pref.movement_day_choice` (+ `_date`) | `MovementTodayHero` (init), `day-model.resolveEffectiveActionKey`, `agenda-plan-duration`, `AgendaTodayHero` | alleen `POST /api/account/priority-pref{action:set_movement_day_choice}` | **om middernacht** (datum-geresolved in `dashboard-model.ts:58,116`) | Server resolvet één keer tegen vandaag; de client patcht in-memory met de respons (`onPrefUpdated`) — nooit refetchen, nooit tweede picker | **Haalt** — zonder de kolom valt alles terug op de voorselectie |
| `resolvePlanStepContent` / `day-model` (`resolveActionKey` → `resolveEffectiveActionKey` → `isTodayActionDone`) | hero, rail, inspector, tijdlijn, weekkolommen | schrijft niets | n.v.t. | Elk oppervlak dat "is het gedaan?" beantwoordt, gaat via deze drie functies. Een component dat zelf een tier afleidt, is de derde readout van morgen | **Haalt** — pure afleiding |
| `daily_action_log` | alle Gedaan-knoppen, de liniaal op Voortgang, "Deze week" | `POST /api/account/daily-log` vanaf twee knoppen (Beweging-hero + Mijn Dag-detail) | dagelijks (één rij per domein per dag) | Twee knoppen op één bron mag; twee statussen niet | **Haalt** — het is de bron zelf |
| `account_priority_pref.scheduled_time` / `time_bucket` | `resolveScheduledTime`, `resolvePlanStepPlacement`, `AgendaTimeBucketPicker` | alleen Mijn Dag ("Verplaats") | duurzaam (bucket) / duurzaam (tijd) | Een expliciete tijd promoveert het blok naar het raster; een bucket nooit (`agenda-timeline.ts:326-334`). Eindtijd is afgeleid en niet invoerbaar | **Haalt** — zonder de tijd is er geen positie |

**Toevoeging aan de harde grens uit §A2b van het Mijn-Dag-verdict:** het verhuis-signaal is niet geraakt. Er is geen derde `movement_*`-kolom bijgekomen, geen tweede domein met een dagkeuze, en er is nog steeds één plan-stap per dag. De twee kolommen mogen blijven staan.

---

## E. Prebuild-revisie — v3 `#s-a`

### E1 · Vier sub-staten (max)

**A1 · Voorstel, plan onbevestigd** — dit is wat er komt te staan waar nu r660-701 staat.

```
┌──────────────────────────────────────┐ 375px
│ BEWEGING · OP BASIS VAN JE CHECK     │
│                                      │
│ Twee keer kracht thuis               │
│ 15 tot 20 minuten                    │
│                                      │
│ Je beweegscore staat op matig en je  │
│ wilt spiermassa vasthouden. Op je    │
│ 47e is kracht de kortste route.      │
│                                      │
│ Vorm   Vijf basisoefeningen          │
│ Plek   Thuis, zonder apparaten       │
│ Vandaag  15–20 min · korter mag ook  │
│                                      │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │  Gedaan   ✓  │ │ Ik doe de korte │ │
│ └──────────────┘ └─────────────────┘ │
│                    telt volledig mee │
│                                      │
│ Je programma · nog niet ingesteld  › │
├──────────────────────────────────────┤
│ Klopt dit voor jou?                  │
│ We stelden dit voor op je score.     │
│ ┌──────────────────────────────────┐ │
│ │ Stel je programma in (30 sec)  › │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Wat wijzigt t.o.v. v3 vandaag: de duur-chips zijn wég uit de spec-lijst (zie E3-lock), de primary is `Gedaan` in plaats van `Zet op Mijn Dag`, en de instel-strook staat ónder het voorstel — de gebruiker kan afvinken zonder ooit iets in te stellen.

**A2 · Programma instellen** — twee vragen achter elkaar, in dezelfde kaartpositie als de strook uit A1: *spoor* (kracht · conditie · dagelijks ritme) en daarna *anker* ("als bewegen over tien jaar één ding geregeld heeft…"). Overslaan mag op beide stappen. Het voorstel erboven blijft staan en blijft afvinkbaar.

**A3 · Plan bevestigd, geen moment** — identiek aan A1, met drie verschillen: de programma-regel is gevuld (`Je programma · Kracht thuis · doel 2× 30 min ›`), de instel-strook is weg, en eronder staat één rustige regel met CTA:

```
│ Deze stap staat nog niet in je dag.  │
│ ┌──────────────────────────────────┐ │
│ │ 📅 Zet op Mijn Dag               │ │
│ └──────────────────────────────────┘ │
│ Koppel je momenten (optioneel)     › │
```

**A4 · Plan bevestigd, moment gezet** — A3, waarbij de CTA vervangen is door twee readout-regels; de planner-disclosure blijft bereikbaar maar dicht:

```
│ ✓ Staat op Mijn Dag · ma en do ·     │
│   18:00 · 25–40 min                  │
│ Over 14 dagen kijken we of dit voor  │
│ jou werkt — zondag 16 augustus.      │
```

Vanaf de eerste afvink opent de surface niet meer in `#s-a` maar in `#s-e`. Dat is de enige overgangsregel; er is geen "voltooid"-scherm tussenin.

### E2 · Welk live component elk blok representeert

| Blok in `#s-a` | Live component / functie | Opmerking |
| --- | --- | --- |
| Kop + lead + `⏱`-regel | `MovementTodayHero` (`activeChoice.title`, `stepRationale`, `activeChoice.durationLabel`) | bestaat |
| `Gedaan` / `Ik doe de korte` | `MovementTodayHero` → `useDailyActionLog` + `selectNoTime()` | bestaat |
| Spec-regels *Vorm* / *Plek* | `getMovementSessionCatalogEntry(recommendedVariant)` — `structure`, `trainingLocation` | bestaat, wordt nu alleen in de sheet getoond |
| "Klopt dit voor jou?" + CTA (A1) | `MovementCockpit.tsx:174-187` | bestaat, letterlijk deze copy |
| Instel-flow (A2) | `MovementStartChoice` (spoor → anker) | bestaat |
| Programma-regel (A3/A4) | `programSummary` in `MovementCockpit.tsx:99-104` → `MovementProgramSheet` | bestaat |
| `Zet op Mijn Dag` (A3) | **bestaat niet** — vandaag is dat `Open Mijn Dag` (navigatie), geen koppelhandeling | nieuw, klein: schrijft `time_bucket`/`scheduled_time` via de bestaande pref-route |
| Planner-disclosure (dagen + tijd) | `AgendaTimeBucketPicker` | bestaat, staat nu alleen op Mijn Dag |
| Bevestigingsregel (A4) | afgeleid uit `scheduled_time` + `resolvePlanStepDuration` | bestaat als data |
| Deur naar `#b` | `MeerHulpBridgeSheet` + `buildBewegingHelpBridge` | bestaat, hangt nu alleen aan de agenda |

### E3 · Wat bewust **niet** in `#s-a` staat

- **De tier-lijst (herstel/matig/trainen).** Die hoort achter `Wijzig keuze` op `#s-e`. Een keuze vóór het antwoord is verbod 1 uit `BESLUIT §A.4`.
- **Het volle schap.** `#s-a` heeft één deur en die is dun: hij leidt naar de brug (Check → Advies → Favorieten → Beste), niet naar een kaartenlijst. `PROEF §11` blijft geparkeerd.
- **Score-ring, sparkline, baseline, richtlijn-context, fase-as.** Alle acht readouts uit `BESLUIT §E.3` blijven op Voortgang.
- **De supplementen-treden.** Slice 2 leeft op Voortgang (`VoortgangDomeinScreen` → `BewegingAdviesTreden`) en komt niet terug op de doe-surface.

> **E3-lock · de duur-chips gaan eruit.** v3 `#s-a` (r675-679) heeft chips *kort / standaard / langer* die `basis.dur` zetten, en `#s-d` bindt diezelfde waarde in de dag-regel (r1234, `render()` r1351). Dat maakt de duur op Mijn Dag instelbaar — precies wat de aug-2-lock verbiedt (*"Duur · Nergens — afgeleid uit de tier"*, verdict §C2) en wat KILL 6 als achterdeur benoemt. Twee toegestane uitwegen, één aanbeveling:
>
> **Aanbevolen:** de chips verhuizen naar de programma-disclosure en zetten daar de **dosis** (`targetMinutes` / `targetDays`), met de kop *"Hoe lang wil je per keer?"* en de gevolgregel *"Dit zet je doel. Wat er vandaag staat kan korter zijn — dat telt volledig mee."* De dag-regel op `#s-d` blijft de tier-range tonen en bindt niet aan de chip.
> *Alternatief (zwakker):* chips helemaal schrappen en de dosis alleen in de sheet laten. Dan verliest `#s-a` zijn enige besturingselement en wordt hij een leesscherm.

### E4 · Copy voor de check-koppeling

**Mét beweegcheck (na de naad-fix uit slice 2):**
> Op basis van je beweegcheck van 2 augustus: je doet nu ongeveer 90 minuten matig per week. Dit voorstel zet daar één stap bovenop, niet drie.

**Zonder beweegcheck (alleen Leefstijlcheck):**
> Op basis van je Leefstijlcheck van 2 augustus. Je basischeck kent je frequentie, niet je minuten — een korte beweegcheck maakt dit voorstel scherper.

Twee zinnen, geen score in de eerste zin, geen gebiedende wijs. De datum is de check-datum, nooit "recent".

### E5 · v2 versus v3

Geverifieerd met een diff: **v2 `#s-a` en v3 `#s-a` zijn identiek op één regel na** (de statebar r661), en **v2 `#s-d` is byte-identiek aan v3 `#s-d`**. v2 mist alleen `#s-e` en de "Zo werkt het hier"-ladder in de aside. v2 draagt dus **geen enkel besluit dat v3 niet draagt**.

> **Patch-target = v3, uitsluitend.** In v2 komt één regel bovenaan: *"Historisch — vervangen door v3 (6 aug 2026). Niet patchen."* Meer niet.

---

## F. Prebuild-revisie — `#s-d` sync

### F1 · Bindings die 1:1 moeten matchen

| Binding in `#s-d` | Live bron | Regel |
| --- | --- | --- |
| `basis-title` | `resolveEffectiveActionKey()` → gekozen `option.title` (`day-model.ts:218-239`) | Woordelijk gelijk aan de kop op `#s-e`. Bij een vastgelegde keuze wint `movement_day_choice`; `inferCompletedChoice` is alléén de terugval |
| duur-regel | `resolvePlanStepDuration().durationLabel` (`agenda-plan-duration.ts:79-82`) | De **range** ("25–40 min") is de UI-waarde; de **bovengrens** is alleen geometrie. Het getal 40 verschijnt nooit als tekst |
| tier-label | `model.movementDayChoice` | Readout. Ontbreekt hij, dan toont Mijn Dag de voorselectie — nooit een eigen gok |
| done-label | `daily_action_log` via `AgendaTodayHero` | **Te patchen in de prebuild:** `#s-d` toont `Gedaan` als knop; het aug-2-verdict (§C1b) en de code (`doneLabel = "Markeer als gedaan"`) schrijven `Markeer als gedaan` vóór, en `✓ Gedaan` erná. Neem die twee woorden over in de prebuild |
| `basis-sub` als eigen regel | `AgendaTodayHero.tsx:123-126` plakt vandaag `titel · duur` samen | Aanbevolen: de duur als eigen sub-regel, zoals `#s-d` al doet. Anders is de binding niet visueel toetsbaar |

### F2 · Planner-gedrag — verplaatsen ≠ afvinken

1. **"Verplaats" schrijft uitsluitend `scheduled_time`.** Geen duur, geen eindtijd, geen status.
2. **Plaatsing volgt uit herkomst van de tijd, niet uit betekenis.** Expliciete tijd → raster; bucket of niets → tray (`resolvePlanStepPlacement`, `agenda-timeline.ts:326-334`). Plaatsing promoveert een voorstel nooit tot afspraak.
3. **De eindtijd is een readout in de picker**, afgeleid met `endTimeFromStartAndDuration` — er is geen invoerveld en dat blijft zo.
4. **Afvinken verplaatst niets.** Het object krijgt zijn vinkje op de plek waar het al stond; het springt niet van tray naar raster of terug.
5. **Één gedeeld component voor beide posities.** Tray-regel en rasterblok renderen dezelfde vier lagen (titel uit de resolver, duur uit de tier, positie uit `scheduled_time`, vinkje uit het grootboek). Wie een van die vier weghaalt, houdt een blok over dat niets meer kan beweren — dat is de toets, en hij slaagt.

### F3 · "Meer hulp hierbij" → dunne `#s-b`

De prebuild laat `d-help` (r1238) de helplens van het volle schap openen (`helpOn = true`, r1842-1843). **Dat moet weg.** Live doet de knop al het goede: `MeerHulpBridgeSheet` toont de basis-stap, de vier-punts-status (Check `gedaan` · Advies `wacht op basis` · Favorieten `nu` · Beste `nog niet`) en één CTA naar Voortgang. Patch `#s-d` en `#s-e` zo dat beide knoppen die brug openen — geen filterlijst, geen kaartenstapel, geen `option_type`-chips. Pad A, letterlijk.

---

## G. Check → test → voorstel-keten

| Stap | Waar | Laag | Stand vandaag |
| --- | --- | --- | --- |
| 1. Leefstijlcheck (15 vragen) | `/intake` | — | `domain_scores` + `answers` in `intake_sessions`; `MOV_STR`/`MOV_CARD` dragen beweging |
| 2. Eerste voorstel | Beweging, `#s-a` A1 | **L1** | `resolvePlanChoiceKind(dayStepId)` levert de voorselectie; `recommendedKind` uit een verse check-in wint (`MovementTodayHero.tsx:227`) |
| 3. Programma bevestigen | Beweging, `#s-a` A2 → A3 | **L1** | `MovementStartChoice` → answers-jsonb → `recommendedVariant` |
| 4. Moment koppelen | Beweging A3 (CTA) → Mijn Dag ("Verplaats") | L1 → dag-surface | Tijd is een dag-eigenschap; de CTA op Beweging is een koppelhandeling, geen navigatie |
| 5. *(optioneel)* Volledige beweegcheck | `/intake/beweging` | **L2**, ingang staat op Voortgang (`VoortgangDomeinScreen`, `surface: "voortgang_beweging"`) en conditioneel op Beweging | Schrijft `MOV2_*` + score naar `intake_domain_checkin` |
| 6. Herscore | Voortgang › Beweging | **L2** | Score gaat naar de leefstijllijn-serie (`account-dashboard.ts:490-513`) — **niet** naar `model.domainScores`, dus het voorstel beweegt niet mee |
| 7. Preselect op `#s-e` | Beweging | **L1** | Werkt vandaag alleen via `rcvFeel` (pulse-check, 7 dagen geldig). De volledige check bereikt de voorselectie niet |
| 8. Mijn Dag | `#s-d` | dag-surface | Leest titel, tier, duur en staat uit dezelfde vier lagen — dit deel is af |

**De twee ontbrekende schakels zijn 6 en 7, en het is dezelfde schakel:** de test schrijft naar een tabel die het voorstel niet leest. Zolang die naad open staat, is "de keuze uit de check loopt mee in `#a`" een belofte over recovery alleen.

**Waar wat hoort:** de volledige beweegcheck-CTA staat primair op **Voortgang › Beweging (L2)** — meten is geen doen — en op Beweging alleen conditioneel, als één regel onder de vouw. Dat is vandaag zo geïmplementeerd en blijft zo. **Geen supplement-treden op de doe-surface:** slice 2 (`BewegingAdviesTreden`) blijft waar hij staat, in Voortgang.

---

## H. Meetplan

**Nul nieuwe events.** Alles wat de versmelting moet bewijzen, is af te lezen aan wat er al staat — twee bestaande events krijgen één extra payload-waarde. De Pad A-lock kost hier niets.

| Slice | Wat bewezen moet worden | GA4 / durable event | Clarity-tag |
| --- | --- | --- | --- |
| 1 · meetvenster | Voorselectie werkt (voorstel accepteren i.p.v. lijst openen) | `dashboard_vandaag_card_shown{preselected_choice, preselect_source}` ÷ `dashboard_vandaag_step_alternative{accepted_default:true}` · regressiewacht `dashboard_vandaag_action_toggled` | `dashboard_kompas_beweging` → `hero_shown` |
| 2 · naad-fix beweegcheck | De test verandert het voorstel | `dashboard_vandaag_card_shown` met **nieuwe waarde** `preselect_source: "beweegcheck"` (naast de bestaande `checkin` / `plan`) + `dashboard_beweging_checkin_click{mode:"full"}` als ingang | `dashboard_beweging_checkin` → `click` |
| 3 · v3-patch | — (prebuild-only, geen emitters) | n.v.t. | n.v.t. |
| 4 · dunne `#b` op Beweging | De deur wordt ook zonder agenda gevonden | `choice.shelf_opened` met **nieuwe waarde** `from_state: "beweging_surface"` (bestaat al met `agenda_meer_hulp`) → `dashboard_beweging_voortgang_click{surface:"meer_hulp_brug"}` | `dashboard_beweging_brug` |
| 5 · F2 favorieten | Iets ernaast zetten leidt tot herhaald gedrag | `dashboard_vandaag_action_toggled{surface}` na een favoriet, tegen dezelfde week zonder | `dashboard_agenda` |

**Sync-bewijs in één zin per slice.** Slice 2 is geslaagd als `preselect_source: "beweegcheck"` überhaupt gaat voorkomen — vandaag is dat aantoonbaar nul. Slice 4 is geslaagd als `choice.shelf_opened{from_state:"beweging_surface"}` een vergelijkbaar aandeel haalt als de agenda-variant; blijft hij op nul, dan is de deur op de verkeerde plek gehangen en niet: de deur is niet nodig.

**Meetpunt: `dashboard_vandaag_card_shown{preselect_source}` · `dashboard_vandaag_step_alternative{accepted_default}` · `dashboard.movement_day_choice_set` · `choice.shelf_opened{from_state}` — hier lees je af of de versmelting werkt.**

---

## I. Slice-volgorde

| # | Slice | Doel | Prebuild-only of code | Meet-gate |
| --- | --- | --- | --- | --- |
| **1** | **F1a-meetvenster uitzitten** (live sinds `7d6205b`) | Weten hoe vaak de voorselectie wordt overgenomen vóór er iets aan de surface verandert | **geen van beide** — alleen aflezen | ≥ 2 weken; `accepted_default:true` / totaal `step_alternative`; regressiewacht `dashboard_vandaag_action_toggled` mag niet dalen. **Bevriezen in dit venster:** hero-copy, voorselectie-logica, de check-nudge |
| **2** | **F1a-nazorg sync** — beweegcheck → programma | `MOV2_*` bereikt `deriveMovementCurrent()` langs dezelfde weg als `RCV_FEEL`; daarmee dooft frictie 1, 2 en deels 3 en 9 | **code** (lib + dashboard-laag, geen UI-herontwerp) | `preselect_source: "beweegcheck"` verschijnt; `MovementProgramSheet` toont de check-regel; de nudge dooft aantoonbaar. Pas starten ná gate 1 |
| **3** | **v3-prebuild-patch** — `#s-a` sub-staten A1–A4, `#s-d`-bindings, duur-chips naar dosis | Één normatief doelbeeld waar een designer zonder navraag mee verder kan | **prebuild-only** | Geen meting; gate = de acceptatielijst onderaan dit document. Kan **parallel aan gate 1**, want hij raakt niets live |
| **4** | **Dunne `#b` op de Beweging-surface** | `Lukt het niet? Meer hulp hierbij` op `#s-e` opent dezelfde brug als op de agenda | **code** (klein: bestaande sheet, tweede aanroeper) | `choice.shelf_opened{from_state:"beweging_surface"}`. Ná slice 2, eigen venster van 2 weken |
| **5** | **F2 favorieten** | Wat je ernaast zet krijgt opslag en een plek in de dag | **code** (nieuw: opslag) | Brug-CTR uit slice 4 moet eerst laten zien dát mensen iets ernaast willen. Blijft die op nul, dan vervalt slice 5 |

**Conflictcheck met Pad A en het meetvenster:** slice 3 is de enige die tijdens gate 1 mag lopen. Slice 2 verandert wat de hero voorstelt en mag dus niet in hetzelfde venster. Slice 4 en 5 raken de doe-surface en volgen elk in een eigen venster. Geen enkele slice opent `PROEF §3–§9`, introduceert een `editorial_verdict`-schema, zet een tier-picker op Mijn Dag of maakt `agenda_blocks` tot completiebron.

---

## J. De ene volgende actie voor Dennis

> **Patch v3 `#s-a` naar vier sub-staten: A1 voorstel-onbevestigd · A2 programma instellen · A3 bevestigd-zonder-moment · A4 bevestigd-met-moment** — inclusief de E3-lock (duur-chips uit de spec-lijst, verhuisd naar de programma-disclosure als dosis) en de twee `#s-d`-correcties uit F1/F3 (`Markeer als gedaan` in het detail, `d-help` opent de brug in plaats van het schap).

Design-only, raakt geen `src/`, en het is de enige slice die tijdens het lopende F1a-meetvenster vooruit kan zonder de attributie te vervuilen. De Cursor-prompt voor de F1a-nazorg sync komt daarna, niet tegelijk.

> **Uitgevoerd 6 augustus 2026** in `beweging-keuze-consumentenbond-prebuild-v3-2026-08.html`. Doorlopen in de browser op 375px: A1 → A2 → A3 → A4 en terug, de brug vanaf A, E-open, E-klaar en D, en alle vijf schermen zonder console-fouten. De duur-lock is toetsbaar gemaakt: het doel op 45–60 min zetten verandert de programma-regel en laat de dagduur op A, E én D onaangeroerd. In v2 hoort nu nog één regel bovenaan: *"Historisch — vervangen door v3. Niet patchen."*

### J1 · Revisieronde Dennis, zelfde dag — zes correcties

| # | Punt | Verwerkt als |
| --- | --- | --- |
| 1 | De brug-lead was geen mooie zin | *"Je basis blijft je basis — dit komt er hooguit naast. Wat erbij past kies je in Voortgang: daar staat ons oordeel naast jouw eigen hertest."* Dit is **live-copy** (`MeerHulpBridgeSheet.tsx:66-69`) — de prebuild is normatief, dus de zin moet in slice 4 meelanden |
| 2 | Startdosis op de kortste zetten | Voorgeselecteerde chip is `kort · 15–20 min`; kop, `Vandaag`-regel en doelregel volgen. Hoger zetten mag en staat één tik verderop. De korte variant is daarmee 10 min |
| 3 | *"Lukt het niet in je eentje?"* belooft een persoon | **Label geschrapt op alle drie de surfaces.** Eén label overal: **"Zet er iets naast"**. Naar een coach routeren kan niet: dat is `KompasBegeleidingLink`, en die is geparkeerd tot er een product is (`BESLUIT §I.4` vraag 4). Ook de live-labels *"Meer hulp hierbij"* schuiven mee in slice 4 |
| 4 | Hoort eiwit niet bij de krachtsessie? | Ja — en het stond op de verkeerde plek. Het permanente blok *"Verder vandaag"* met eiwit + slaap was **gestapeld advies** (verbod 3, `BESLUIT §A.4`). De eiwitregel is nu **getriggerd** in de klaar-staat, precies zoals de live nutrient-bridge (`BewegingScreen.tsx:236-253`); *"Verder vandaag"* is één stille regel naar Mijn Dag geworden. `#s-e` blijft domein-specifiek — cross-domein is Mijn Dag, en een tweede dag-lijst op de doe-surface is een tweede Mijn Dag |
| 5 | De deur is geen mooie knop; Check→Beste is onduidelijk | De brug is een eigen paneel met kop en `btn-ghost`-deur. Het pad rendert nu als `.chain` — dezelfde visuele taal als scherm C en D — met **Favorieten opgelicht** en één zin eronder die zegt wat er open staat en wanneer de hertest komt |

**Twee copy-divergenties met `src/` die in slice 4 mee moeten:** de brug-lead (rij 1) en de trigger-labels (rij 3). Zolang die niet landen, zegt de prebuild iets anders dan de app.

### J2 · Revisieronde Dennis, dezelfde dag — zes vervolgpunten

| # | Punt | Verwerkt als |
| --- | --- | --- |
| 1 | De brug herhaalt kracht als "primair pad" — dat staat al in beeld; interessant om kracht/conditie/dagelijks-ritme dynamisch uit de vragenlijst te tonen (nu bij beweging blijven) | **Twee dingen.** *(a)* Het redundante "Je basis · primair pad"-blok is uit de brug — hij voegt nu alleen toe wat nog niet in beeld was (de keten). *(b)* A2 toont nu een **"past bij je check"-badge** op Kracht, gedreven door dezelfde signalen als de lead-tekst (matige score + doel spierbehoud). Dit is een **demo van dynamische voorselectie** — live is `MovementStartChoice` vandaag een blinde 3-weg-keuze zonder badge. Generaliseren naar andere domeinen is een aparte vervolgvraag, hier alleen genoteerd, scope blijft beweging |
| 2 | "Je advies wacht op je voedingscheck" leest als voeding-domein, niet beweging | De losse uitlegzin is weg. De reden staat nu **in het ketting-label zelf**: `Advies · wacht op voedingscheck`. Dat is inhoudelijk correct — live gate ik `Advies` in `beweging-help-bridge.ts` óók op `nutritionLogCompleted`, want de twee gemonetiseerde producten van dit domein (creatine, eiwit) zijn zelf voeding-adjacent (`PROEF §4`). De copy verankert dat nu aan beweging door de poort met naam te noemen in plaats van een generieke zin |
| 3 | Moeten de ketting-items klikbaar zijn? | **Nee — bewuste keuze, niet aangepast.** De items zijn `<span>`, geen `<button>`. Reden: "Check" doorsturen zou vragen om de intake over te doen, "Advies" is gated en een klik daarop is een doodlopend pad, en het geheel klikbaar maken maakt van de brug een tweede menu — precies wat de dunne-deur-lock (Pad A, één CTA) verbiedt. De keten blijft een read-only statusindicator; "Open Voortgang" blijft de enige actie |
| 4 | Duidelijker maken dat het voorstel tegelijk voorbeeld én instelling is; persoonlijke welkomstzin met naam, vertrouwen gevend | *(a)* Nieuwe regel boven de eyebrow: **"Welkom, Peter — fijn dat je verder gaat."** Rustig, geen hype, geen superlatief — conform `WRITING_VOICE.md §3`. Rail kreeg de naam ook (`Peter · 47 jaar`). *(b)* Onder Gedaan/Ik doe de korte: **"Dit is al je instelling, geen los voorbeeld — je hoeft niets aan te passen om te beginnen."** |
| 5 | Minder tekst, met name de dosis-disclosure | Algemene inkortingsslag: de dosis-alinea (3 zinnen) is **"Je doel, niet je dag — vandaag mag altijd korter."** (1 zin). De Vandaag-specregel verloor zijn bijzin (stond al in de knoppen/note). Het "Zet er iets naast"-intro ging van een dubbele vraag naar één regel. De brug-uitleg is samengevouwen in de ketting-labels (zie punt 2) — scheelt een hele alinea |
| 6 | Meteen een link naar Gekozen (met eigen begeleiding) bij de eerste keer | **Toegevoegd, met een correctie die de eerlijkheid van de link waarborgt.** Rechtstreeks doorlinken naar scherm C zou daar een fictief gekozen extra tonen — `extraId`/`extraCoupled` stonden in de demo-state altijd al op "PT-intake", ongeacht of iemand via B is geweest. Nieuwe state **`extraChosen`** (default `false`, alleen `true` na een echte fav/dag-actie op B) gate't nu de tweede rij én de kop/lead op scherm C. Zonder keuze: *"Je basis — dit is genoeg om te beginnen"* + de aanvulling-rij verborgen. Mét keuze: ongewijzigd de bestaande "gekozen"-staat. De link vanaf A ("Liever met iemand die meekijkt? Onze eigen begeleiding →") landt dus altijd op een waarheidsgetrouwe C, ook wanneer B nooit bezocht is |

**Geverifieerd in de browser (375px):** badge op Kracht in A2, ketting met inline-status vanaf A/E/D, C zonder gefabriceerde keuze bij directe link vanaf A, C mét de volle "gekozen"-staat na een echte B-keuze, alle vijf schermen, nul console-fouten.

---

## Acceptatie

- [x] S1–S4 elk beoordeeld met GO / PIVOT / KILL (S1 GO · S2 GO · S3 GO · S4 PIVOT)
- [x] `#s-a` sub-staten zijn specificeerbaar zonder navraag: vier staten, per staat een wireframe, per blok een live component, plus een expliciete uitsluitingslijst
- [x] Datastroom-tabel doorstaat de wegval-toets op alle zeven rijen; de enige rij die faalt, faalt op *bereik* (de consument leest hem niet), niet op *zelfstandigheid*
- [x] Slice-volgorde conflicteert niet met Pad A of het F1a-meetvenster: precies één slice loopt parallel, en die raakt geen code
- [x] Elk genoemd pad geverifieerd tegen de repo op branch `feat/slice2-beweging-advies-treden`
