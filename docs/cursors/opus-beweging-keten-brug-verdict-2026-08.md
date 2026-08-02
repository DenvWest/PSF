# Verdict — De keten Beweging: programma ↔ vandaag ↔ voortgang

> **Opus-sessie 2 augustus 2026.** IA + wireframes + meetplan + slice-indeling. Geen code, geen diffs, geen commits.
> Geverifieerd tegen `main` (working tree met de ongecommitte Golf-1-bestanden: `domain-product-stance.ts`,
> `domain-ready-state.ts`, `domain-position-line.ts`). Alle bewijs is `pad:regel`, gelezen tijdens deze sessie.
> **Contractcontext (niet heropend):** [`fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md`](fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md) §C.
> **Leidend bij conflict:** [`BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md) (LOCK).
> **Voorganger:** [`claude-brug-beweging-voortgang-na-f1-prompt.md`](claude-brug-beweging-voortgang-na-f1-prompt.md).

---

## A. Executive summary

### A.1 De keten in één zin

> **Je programma zegt wat je deze weken doet, je Vandaag-kaart maakt daar één stap van die je afvinkt,
> en Voortgang › Beweging laat zien wat die stappen met je stand doen — drie plekken, één onderwerp,
> en elke plek noemt de vorige bij naam.**

Dat "bij naam noemen" is precies wat vandaag ontbreekt. De drie plekken bestaan technisch, maar geen van
de drie verwijst naar de andere twee met een zin die klopt: de sheet toont niet wat je keuze morgen doet,
de kaart toont een programmaregel uit de catalogus in plaats van uit jouw keuze, en Voortgang heeft geen
bestemming voor beweging. De keten is niet kapot, hij is **onbenoemd**.

### A.2 Routeringskeuze (B1)

> **Optie 1 — één domein-leesscherm `Voortgang › <domein>`, bereikbaar vanaf de meetlat-rij.**
> Domein-agnostisch gebouwd, beweging als eerste vulling. Dit is **Surface 3 uit BESLUIT §C.1**
> ("Voortgang › Beweging — bestaat al, wordt niet herbouwd"), niet een vierde Beweging-surface:
> de objecten uit §E.3 verhuizen ernaartoe, ze worden niet opnieuw uitgevonden.

Verdediging tegen de andere drie staat in §C.4.

### A.3 GO / PIVOT / KILL

| # | Item | Verdict | In één zin |
|---|---|---|---|
| 1 | **Optie 1** — domein-leesscherm vanaf de meetlat-rij | **GO** | De enige optie die de deur naar advies schoon kan dragen en met 7 pijlers meeschaalt als één component. |
| 2 | **Optie 2** — Statistieken object-gestuurd | **DEFER** | Juiste eindtoestand, verkeerde volgorde: het is de v2-herbouw die Dennis 30 jul parkeerde, en optie 1 is er later gratis in te vouwen. |
| 3 | **Optie 3** — meetlat-rij klapt open (accordeon) | **KILL** | Maakt de meetlat-tegel tweeledig (index én leesscherm) en er is geen plek waar de advies-deur dan eerlijk hangt. |
| 4 | **Optie 4** — klik blijft naar doe-surface | **KILL** | Dat is de huidige staat en precies de klacht: de meetlat belooft lezen en levert werk. |
| 5 | Programmaregel toont je **opgeslagen** dosis i.p.v. de catalogus | **GO** | Dit is de enige echte data-naad in de lus (§B rij 1) — alles anders eromheen is copy. |
| 6 | Herkomst-labels (`advies` / `jouw keuze`) + vandaag-preview in de sheet | **GO** | Maakt de gevolgen van een instelling zichtbaar vóór je de sheet sluit. |
| 7 | Ontvangst: ring + delta + sparkline + `baselineSourceLabel` + `lastMeasured` | **GO** | Complete verhuizing conform §E.3, ongewijzigd overzetten. |
| 8 | Richtlijn 150–300 min | **PIVOT** | Verhuist naar Voortgang, maar achter één disclosure — nooit als maatlat naast jouw getal. |
| 9 | Bouwfase-geschiedenis | **KILL** | Drie fase-ids waarvan er één bereikbaar is; een geschiedenis van één rij is een rangnummer in vermomming. |
| 10 | Beweegcheck-CTA als **primary** op het domeinscherm | **GO** | Een leesscherm mag precies één actie hebben, en dat is beter meten. |
| 11 | Supplementenlijst van Beweging-footer + rail → Statistieken › Advies | **GO** | Advies verhuist naar waar de poort al leeft; het schap verdwijnt van de doe-surface. |
| 12 | Beweeg-signaal als zélfstandige bron voor een supplement-verdict | **KILL (nee, streng)** | De beweegcheck meet gedrag, geen inname — een claim daarop draagt de check niet (§E.1). |
| 13 | Nutrient-bridge na krachtsessie | **PIVOT** | Blijft, maar linkt naar de **voedingscheck** als die ontbreekt, anders naar de gids — zo opent hij de poort in plaats van dood te lopen. |
| 14 | FooterLink "Leefstijl & inzichten" op Beweging | **KILL** | /inzichten staat al in de top-nav; een tweede ingang op de doe-surface is ruis. |
| 15 | `dashboard_beweging_premium_upsell` | **KILL** | Vuurt op mount zonder dat er een premium-blok staat (`BewegingScreen.tsx:83-90`) — een impressie zonder impressie vervuilt de advies-attributie. |
| 16 | `dashboard_beweging_voortgang_click {surface, state}` | **GO** | Het ene ontbrekende meetpunt; zonder hem is het brug-effect niet van het advies-effect te scheiden. |

### A.4 Ontbrekende bijlagen

**Alle vijf de screenshots ontbreken** (1–5 in de prompt). Ik heb de surfaces uit de code afgeleid —
compositie, blokvolgorde, copy, tracking — en dat is exact genoeg voor IA, maar niet voor pixelhoogtes.

Wat daardoor **AANNAME** is en als zodanig gemarkeerd staat:
- of de eerste viewport op 375px vandaag méér dan drie blokken toont (§B rij 7, §D.1);
- of "Deze week" in de open-staat boven of onder de vouw valt (BESLUIT §I.4 vraag 8 staat nog open);
- hoe zwaar de klaar-staat-footer visueel weegt t.o.v. de hero.

**Meetinstructie in plaats van gok:** meet in een echte 375px-viewport (`<iframe width="375">`),
niet met `chrome --headless --window-size=375` — die rendert op ~500px en schaalt de screenshot.
Zelfde methode als [`voortgang-plan-later.md`](../design/voortgang-plan-later.md) § *Verificatie van v2*.

Docs 6 wél gelezen: BESLUIT (LOCK), voortgang-plan-later, voorgangerprompt, Fable-verdict §C/§D.2/§G/§I.

---

## B. Diagnose — naad + leesbaarheid

| # | Probleem | Impact op de man 40+ | Root cause | Oppervlak |
|---|---|---|---|---|
| 1 | De programmaregel toont de **catalogus**, niet je keuze | Je zet in de sheet je frequentie van 2× naar 3× en de regel op Beweging verandert niet — de lus voelt dood, precies de klacht uit BLAUWDRUK_ADAPTIEF | `MovementCockpit.tsx:111` rendert `sessionEntry.label` + `sessionEntry.frequency` uit `session-catalog`; de sheet schrijft `profile.targetDays/targetMinutes/targetStrength` (`MovementProgramSheet.tsx:411-447`). Twee bronnen, één regel | Beweging + sheet |
| 2 | De verhuisde analyse-objecten zijn **nergens ontvangen** | "Waar sta ik" is sinds F1a onbeantwoordbaar; de positieregel is de enige rest en die legt niets uit | §E.3 is uitgevoerd als *kill*, niet als *verhuizing* — er was geen ontvangende bestemming toen de objecten weggingen | Voortgang |
| 3 | Pijler-rij → doe-surface | De tegel heet "Wat je van jezelf weet" en levert een afvinkscherm; wie wil lezen krijgt werk | `VoortgangHub.tsx:693-695` → `buildDashboardVandaagHref(domain)`; `VoortgangHero.tsx:96` doet hetzelfde voor de prioriteitspijler | Voortgang-hub |
| 4 | Geen brug-event | Straks is niet vast te stellen of de deur of het advies of de mail de conversie bewoog | `dashboard_beweging_voortgang_click` bestaat niet (0 treffers in `src/`) — BESLUIT §H rij 6 was gepland, niet gebouwd | meting |
| 5 | Klaar-staat-gate zonder consumers | Rustdag en "ander domein heeft prioriteit" vallen buiten de regel: dan blijft de advies-ruimte dicht terwijl er niets te doen is | `domain-ready-state.ts` (0 consumers); `BewegingScreen.tsx:74,205` gate't op een lokale `done`-boolean uit de hero-callback | Beweging |
| 6 | De sheet doet vier dingen en noemt geen herkomst | Het leest als een formulier: oefeningen + weekdoelen + sportkoppeling + variantkeuze, zonder één label dat zegt wat van jou is en wat van ons | De merge card+adjust-sheet is uitgevoerd zonder de herkomst-regel uit §E.1. Bijvangst: verboden woord *"Je spoor"* (`:541`), onmacht-string *"ongewijzigd door je sport"* (`:320`), richtlijn (`:468-472`) en beweegcheck-CTA (`:395-400`) staan in de bésturing i.p.v. bij de meting, en een `coming_soon`-tekstbranch (`:329-338`) i.p.v. de terugval uit §E.4 | sheet |
| 7 | De hero draagt vier leesobjecten naast de knoppen | Er is geen enkel moment waarop één ding het belangrijkste is: titel + ankerregel + waaromregel + duur + 2 knoppen + "Wijzig keuze" + disclosure + Straks-strip + 2 links, allemaal in één kaart | De hero groeide per functie, niet per budget: `MovementTodayHero.tsx:583-706`. Daaronder komen nog programmaregel, positieregel en weekritme. **AANNAME:** dit breekt D.1 (max 3 blokken boven de vouw) | Beweging |
| 8 | Footer-advies is nog een schap, plus een impressie zonder UI | Permanent gestapeld advies op de doe-surface (verbod 3 van §A.4) en een premium-event dat vuurt terwijl er geen premium-blok staat | `BewegingScreen.tsx:122-169` (supplementenlijst), `:88` (`dashboard_beweging_premium_upsell`), `context-rail.ts:86-93` (dezelfde lijst in de desktop-rail) | Beweging + rail + meting |

---

## C. Doel-IA

### C.1 Mentale model per surface (A0)

**Jouw programma (sheet)**
- *Dit is voor:* zien wat je de komende weken doet en dat bijstellen — hoe vaak, hoe lang, waar, met welke oefeningen.
- *Dit is NIET voor:* afvinken, meten, of kiezen uit een lijst programma's.
- **UI-schuld:** geen herkomst-labels; geen zin die zegt wat je wijziging morgen doet; besturing van je *week* staat naast oefeningen van je *sessie* zonder scheiding; drie objecten die hier niet horen (richtlijn, beweegcheck-CTA, verboden woord "spoor").

**Beweging-vandaag**
- *Dit is voor:* één stap doen vandaag, of hem in één tik kleiner maken.
- *Dit is NIET voor:* uitzoeken waar je staat, of iets kopen.
- **UI-schuld:** de positieregel staat ná de programmaregel en leest daardoor als bijschrift bij het programma in plaats van als rechtvaardiging van het voorstel; twee waarom-affordances in één kaart; de Straks-strip is vooruitblik (L2) in de eerste viewport.

**Voortgang (beweging-deel)**
- *Dit is voor:* zien waar je staat, of het beweegt, en wat dat betekent.
- *Dit is NIET voor:* afvinken, todo's, of een vooruitblik op wat je nog moet.
- **UI-schuld:** het bestaat niet. De rij belooft een leesbestemming en levert de doe-surface; er is geen enkele plek waar een score, een lijn of een hermeting-datum van beweging samen staan.

### C.2 Ontvangstkaart (B2) — wat waar landt

| Object uit §E.3 | Verdict | Waar | Vorm | Bij ontbrekende data |
|---|---|---|---|---|
| Score-ring 0–100 + baseline-marker | **ONTVANGEN** | `Voortgang › Beweging`, blok 1 | Ring 128px, score + bandlabel (`getScoreBandShortLabel`), baseline als markering op de ring | Geen baseline → ring zonder marker + "Je eerste meting." Nooit een 0 tonen |
| Delta-badge | **ONTVANGEN** | blok 1, naast de ring | Bestaande `DeltaBadge` | `baselineCrossesRulesVersion` → geen badge maar "methodiek gewijzigd — niet vergelijkbaar" (`leefstijllijn.ts:50-58` levert de vlag al) |
| Sparkline + "Begin 55 · nu 58" | **ONTVANGEN** | blok 1, onder de ring | Bestaande `Sparkline`, één regel tekst | <2 punten → sparkline weg, regel wordt "Eén meting tot nu toe" |
| `baselineSourceLabel` | **ONTVANGEN** | blok 1, subregel | "op basis van je intake / je check-ins" (bestaat al: `leefstijllijn.ts:24-32`) | Geen baseline-bron → regel weg, niet "onbekend" |
| `formatLastMeasured` + "verandert bij je hermeting" | **ONTVANGEN** | blok 1, metaregel | Één regel, muted | Geen datum → alleen "verandert bij je hermeting" |
| Richtlijn 150–300 min | **ONTVANGEN, gedempt** | blok 3, **achter een disclosure** | *"▸ Waar deze getallen vandaan komen"* → richtlijn + bron | Altijd toonbaar; het is context, geen persoonlijk getal |
| Bouwfase-geschiedenis | **KILL** | — | — | **Reden:** `PHASE_BUILD_PHASES` kent 3 fase-ids en `returning` is onbereikbaar tot F3 (`movement-plan-roadmap.ts:12-16`). Een geschiedenis waarin je altijd in dezelfde fase stond is "1 van 3" met andere woorden — precies wat §A.3 rij 12 killde. **Vervanging:** de positieregel wordt hierboven letterlijk herhaald (zelfde string, zelfde bron) als herkenningsanker |
| Uitgebreide beweegcheck-CTA | **ONTVANGEN als primary** | blok 5 | De enige knop op het scherm | Op Beweging blijft alleen de conditionele regel uit §E.3 ("je voorstel draait nog op je intake") |

**Twee objecten die er nieuw bij horen** (ze bestaan al als data, ze staan nu nergens in deze context):
- **Je eigen ijkpunt** — `domain_goal` + laatste `domain_goal_score`; nu alleen als losse regel in de meetlat-rij. Op het domeinscherm is het de tweede leesregel náást de score, nooit erin (lock uit PLAN_EIGEN_IJKPUNT).
- **Wat je deed** — minuten + momenten uit het beweeg-log. Dit is bewijs, geen tweede score, en het is het enige object dat de brug *terug* rechtvaardigt.

### C.3 De ene deur (A3)

| | Open-staat | Klaar-staat (done · rustdag · ander domein prioriteit) |
|---|---|---|
| **Vorm** | Eén stille tekstregel, onder de vouw, ná *Gedaan* en het mechanisme-blok | Eén kaart, direct onder de positieregel, boven de vouw |
| **Label** | `Je voortgang · beweging ›` | Kop `JE VOORTGANG` + twee feitelijke regels + `Bekijk je beweging ›` |
| **Kleur** | Muted (`#9FB0A6`), geen accent, geen rand | Accentrand toegestaan — er is geen primary meer om mee te concurreren |
| **Concurrentie met primary** | Nul: geen kaart, geen accentkleur, niet in de eerste viewport | N.v.t. |
| **Bestemming** | `Voortgang › Beweging` — dezelfde bestemming in beide staten | idem |

**Er is precies één deur.** De bestaande `followUp`-link in de klaar-staat van de hero
(`MovementTodayHero.tsx:698-705`, resolveert naar `/intake/beweging` via `buildVandaagFollowUp`)
wordt **niet** een tweede deur: die blijft wat hij is (check-in bijwerken) en verhuist mee naar
de conditionele beweegcheck-regel, of verdwijnt als de check-CTA op het domeinscherm hem overneemt.

**En de deur terug.** Onderaan `Voortgang › Beweging` staat één regel: *"Terug naar je stap van vandaag ›"*.
Dat is geen navigatie-back (die zit in `‹ Voortgang`) maar een inhoudelijke uitgang: je hebt gelezen,
nu is er iets te doen. In de klaar-staat leest die regel *"Morgen staat er weer iets voor je klaar"* zonder link.

### C.4 Routering — waarom optie 1, en niet de andere drie

**Optie 2 — Statistieken object-gestuurd.** Inhoudelijk de juiste eindtoestand: het domein als onderwerp,
de drie blikken als facetten. Twee bezwaren nu. *(a)* De blikken zijn vandaag facet-eerst en cross-domein
(`StatistiekenBlikPanels.tsx:103-144`); het domein tot onderwerp maken betekent het blik-model herbouwen —
dat is het v2-kruimelpad dat Dennis 30 jul expliciet parkeerde ten gunste van v1. *(b)* De Advies-blik is
voeding-gevormd (ladder → oordeel → welk potje); beweging erin persen vóór er beweging-evidence is,
vult drie treden met lucht. **Waarom dit geen afstel is:** optie 1 gebruikt dezelfde ingang (rij → object)
en dezelfde sleutel (`object` = domein-id) als de v2-eventspec in
[`voortgang-plan-later.md`](../design/voortgang-plan-later.md) §12. Wordt Statistieken later object-gestuurd,
dan verhuist de *inhoud* van het domeinscherm ernaartoe zonder dat de ingang of het event wijzigt.

**Optie 3 — accordeon in de meetlat.** Dit is eerlijk gezegd de goedkoopste bouw (§K.3), maar hij faalt op
drie punten. De tegel wordt tweeledig: index én leesscherm, terwijl hij nu al 7 rijen × 2 (score + ijkpunt)
draagt. Er is geen plek waar de advies-deur eerlijk hangt — een commerciële uitgang binnen een openklapbare
rij in een overzichtstegel is precies het "schap" dat §G.1 verbiedt. En het is de accordeon-vorm uit v2,
niet uit v1. **KILL.**

**Optie 4 — klik blijft naar de doe-surface.** Dat is de huidige staat en de klacht. **KILL.**

**Kosten en terugdraaibaarheid van optie 1.** Het is één extra `screen`-case in de router die er al staat
(`VoortgangHub.tsx:641-702` kent al 5 schermen met back-nav en URL-parsing via `dashboard-url.ts:68-80`).
Terugdraaien = de case verwijderen en `onOpenDomain` terugzetten op `buildDashboardVandaagHref` — één regel.
De hub-compositie wordt niet aangeraakt, dus er is geen weg-terug-schuld.

**7-pijler-schaal.** Eén component met een `domain`-parameter, geen zeven schermen.
Interventiedomeinen (slaap, stress, voeding, beweging, verbinding) krijgen blok 1–6;
readouts (energie, herstel) krijgen blok 1 + de bestaande `getReadoutPresentation`-driverregels
(`dashboard-readout.ts:13-25`) en **geen** check-in-CTA — die hebben ze niet en dat is de eerlijke leegstaat.

### C.5 Klaar-staat — hoe `adviceMayOutrankDayStep` de rendering stuurt (B3)

De bestaande helper wordt geconsumeerd, er komt geen nieuwe bij. `BewegingScreen` bouwt de feiten uit wat
het al weet en geeft één boolean door aan de deur en aan de footer.

| Feit (`DayStepFacts`) | Bron die er al is |
|---|---|
| `plannedActionKey` | De actieve dagstap-key als `slot.isToday && slot.domain === "beweging" && !isPlanStepHidden(...)` — dezelfde conditie als `MovementCockpit.tsx:73-78`; anders `null` |
| `completedActionKeys` | `[plannedActionKey]` wanneer de hero `done` meldt via `onStateChange` (`MovementTodayHero.tsx:243-247`), anders `[]` |
| `isPriorityDomain` | `model.priority.id === "beweging"` |

| `resolveDayStepState` | Wat er rendert |
|---|---|
| `open` | Deur = stille regel onder de vouw. Geen advies-blok, geen supplement-regel, geen gids-link. De nutrient-bridge staat **niet** in deze staat, ook niet na een krachtsessie |
| `done` | Deur = kaart boven de vouw. Nutrient-bridge onder de vouw als er een krachtsessie gelogd is. Gids-link onderaan |
| `rest_day` | Zelfde als `done`, andere kop: *"Vandaag staat beweging niet voorop."* Geen inhaalvoorstel |
| `other_domain_priority` | Zelfde als `rest_day` + één regel welke pijler wél voorop staat, met link naar die pijler |

**Waarom dit geen cosmetiek is:** vandaag hangt de zichtbaarheid aan een lokale `done`-boolean
(`BewegingScreen.tsx:74,205`). Daardoor is er op een rustdag en op een dag waarop slaap prioriteit heeft
géén klaar-staat — terwijl er niets te doen is. De helper lost precies dat op, en slaap/stress erven hem gratis.

---

## D. ASCII-wireframes 375px

### D.1 Beweging — open (hoofdstaat, na S1+S2)

```
┌──────────────────────────────────────┐  ← 375px
│ ‹ Beweging                           │
├──────────────────────────────────────┤
│ VANDAAG · ZONE 2                     │
│                                      │
│ Zone 2 · 30 minuten                  │
│ ↳ Past bij: na het avondeten         │
│                                      │
│ Je gaf gisteren aan moe te zijn, dus │
│ staat er vandaag niets zwaars.       │
│ ⏱ 30 min                             │
│                                      │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │  Gedaan   ✓  │ │ Ik doe de korte │ │
│ └──────────────┘ └─────────────────┘ │
│                    telt volledig mee │
│              Wijzig keuze            │
│ ·····················(zelfde kaart)· │
│ Je programma · Zone 2 · 3× p/week  › │
├──────────────────────────────────────┤
│ Je bouwt basis · week 3 · sinds      │
│ 14 juli                              │
├──────────────────────────────────────┤
│ DEZE WEEK                            │
│ Conditie en dagelijks bewegen staan. │
│ Kracht is nu je grootste winst.      │
│ ─────────────── vouw ─────────────── │
│                                      │
│ ▸ Waarom juist dit vandaag           │
│   (uitgeklapt eindigt op:            │
│    Lees de onderbouwing →)           │
│                                      │
│ STRAKS                               │
│ Na deze week schuift je Zone 2 naar  │
│ 35 minuten.                          │
│                                      │
│ GEDAAN                               │
│ ma 28   wandelen 25 min      licht   │
│ wo 30   Zone 2 30 min        matig   │
│ ▸ Alles                              │
│                                      │
│ ▸ Waarom bewegen na 40 anders werkt  │
│                                      │
│ Je voortgang · beweging            › │  ← stille regel, geen kaart
│ Al je acties van vandaag           › │
└──────────────────────────────────────┘
```

**Vier wijzigingen t.o.v. nu, alle vier compositie:**
1. De programmaregel zit in de **voet van de VANDAAG-kaart** (haarlijn, zelfde kaart), niet als losse tegel erna
   — daardoor leest de positieregel eronder als rechtvaardiging van het vóórstel, zoals D.1 bedoelt, en niet als
   bijschrift bij het programma.
2. De regel toont **jouw dosis** (`3× p/week` uit `profile.targetDays`), niet de catalogusfrequentie.
3. **Straks** verhuist onder de vouw. Het is vooruitblik, en vooruitblik is nooit de eerste blik.
4. **Eén** waaromaffordance: de disclosure blijft en eindigt op de onderbouwingslink. De losse
   *"Lees waarom →"* verdwijnt (tracking blijft, hij hangt aan de link in de disclosure).

**AANNAME:** met deze volgorde passen VANDAAG + positieregel + DEZE WEEK op 375px boven de vouw.
Meet dit; is de VANDAAG-kaart >340px, dan gaat DEZE WEEK onder de vouw (BESLUIT §I.4 vraag 8).

### D.2 Beweging — klaar, met de deur

```
┌──────────────────────────────────────┐
│ ‹ Beweging                           │
├──────────────────────────────────────┤
│ VANDAAG ✓                            │
│                                      │
│ Zone 2 · 30 minuten — gedaan         │
│ Morgen kies je opnieuw wat past.     │
│                                      │
│ Hoe voelde het?                      │
│ [ licht ]  [ matig ]  [ zwaar ]      │
│ overslaan mag                        │
│ ·····················(zelfde kaart)· │
│ Je programma · Zone 2 · 3× p/week  › │
├──────────────────────────────────────┤
│ Je bouwt basis · week 3 · sinds      │
│ 14 juli                              │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ JE VOORTGANG                     │ │
│ │ Beweging staat op 58, begonnen   │ │
│ │ op 55. Hermeting over 6 dagen.   │ │
│ │                                  │ │
│ │ Bekijk je beweging             › │ │
│ └──────────────────────────────────┘ │
│ ─────────────── vouw ─────────────── │
│                                      │
│ Kracht zonder eiwit levert minder    │
│ op. Zie wat dat praktisch betekent → │
│      (alleen ná een krachtsessie;    │
│       link = voedingscheck als die   │
│       ontbreekt, anders de gids)     │
│                                      │
│ GEDAAN                               │
│ ma 28   wandelen 25 min      licht   │
│ wo 30   Zone 2 30 min        matig   │
│ ▸ Alles                              │
│                                      │
│ ▸ Waarom bewegen na 40 anders werkt  │
│                                      │
│ Je voorstel draait nog op je intake. │
│ Een korte beweegcheck maakt het      │
│ scherper.                          › │
│      (alleen als check ouder is dan  │
│       de laatste hermeting)          │
│                                      │
│ Gratis Bewegingsgids               › │
└──────────────────────────────────────┘
```

**Weg t.o.v. nu:** de supplementenlijst (naar Advies), de vaste beweegcheck-tegel (wordt conditioneel),
de FooterLink "Leefstijl & inzichten", en het premium-impressie-event.

### D.3 Voortgang › Beweging — de ontvangst

```
┌──────────────────────────────────────┐
│ ‹ Voortgang               Beweging   │
├──────────────────────────────────────┤
│ JE STAND                             │
│                                      │
│            ╭─────────╮               │
│           │    58     │   ▲ +3       │
│           │   /100    │   sinds je   │
│            ╰─────────╯     start     │
│              ▲ begin 55              │
│                                      │
│  ▁▂▂▃▃▄   begin 55 · nu 58           │
│  op basis van je intake              │
│                                      │
│  Laatst gemeten 14 juli — dit        │
│  verandert bij je hermeting.         │
├──────────────────────────────────────┤
│ Je bouwt basis · week 3 · sinds      │
│ 14 juli                              │
├──────────────────────────────────────┤
│ WAT JE DEED                          │
│ Deze week 65 minuten in 3 momenten.  │
│ Vorige week 40 minuten.              │
│                                      │
│ ▸ Waar deze getallen vandaan komen   │
│   (uitgeklapt: hoe we meten +        │
│    de richtlijn van 150–300 min)     │
├──────────────────────────────────────┤
│ JE EIGEN IJKPUNT                     │
│ "Traplopen zonder buiten adem"       │
│ Bij je start 4, nu 6.                │
│                        Bijwerken →   │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ Doe de uitgebreide beweegcheck   │ │
│ │ (3 min)                        › │ │
│ └──────────────────────────────────┘ │
│ Scherper meten = scherper voorstel.  │
├──────────────────────────────────────┤
│ Wat een supplement hier wél en niet  │
│ doet                               › │
│      (alleen als de dagstap klaar is │
│       én je voedingscheck er staat)  │
├──────────────────────────────────────┤
│ Terug naar je stap van vandaag     › │
└──────────────────────────────────────┘
```

**Drie invarianten op dit scherm:** geen afvinkbaar element, geen teller die telt wat je niet deed,
en de richtlijn nooit als balk náást jouw getal — alleen als tekst achter de disclosure.
De regel *"Vorige week 40 minuten"* is de bewuste vervanging van een doel-vs-realisatie-balk: richting, geen saldo.

### D.4 Jouw programma — wat terugkomt op vandaag

```
┌─ JOUW PROGRAMMA ──────────────────  ✕┐
│ Zone 2                               │
│ Aerobe basis voor langdurige energie │
│                                      │
│ Duur           30 min          ▾     │
│                         advies       │
│ Hoe vaak       3× per week     ▾     │
│                         jouw keuze   │
│ Waar           thuis / buiten  ▾     │
│                         jouw keuze   │
│ Kracht         1× per week     ▾     │
│                         jouw keuze   │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ OP JE VANDAAG-KAART              │ │
│ │ Zone 2 · 30 minuten, 3× p/week   │ │
│ │ Morgen staat er kracht.          │ │
│ └──────────────────────────────────┘ │
│                                      │
│ WAT JE DOET                          │
│ 1. 5 min rustig inlopen              │
│ 2. 20 min in een tempo waarbij je    │
│    nog kunt praten                   │
│ 3. 5 min uitlopen                    │
│                                      │
│ WAT JE VERDER DOET                   │
│ Fietsen naar werk, tuinieren    ▾    │
│ Dit telt mee in je week op Beweging. │
│                                      │
│ ▸ Een andere vorm proberen           │
└──────────────────────────────────────┘
```

**Het blok `OP JE VANDAAG-KAART` is de kern-ingreep van taak A2.** Het is de spiegel van de programmaregel:
wat je hier verzet, zie je hier meteen terug in de woorden waarin je het straks op Beweging leest.
Geen animatie, geen toast, geen "opgeslagen" — één blok dat live meeleest.

**Weg uit de sheet:** de richtlijn (naar Voortgang), de beweegcheck-CTA (naar Voortgang), het woord
*"Je spoor"* (wordt `Een andere vorm proberen › Wat voor soort beweging`), de badge
*"ongewijzigd door je sport"* (onmacht-string, §C.3 kill-list), en de `coming_soon`-tekstbranch —
die wordt de terugval uit §E.4: *"De sportschool-oefeningen staan er nog niet in. Je krijgt de thuisvariant
— dezelfde prikkel, ander materiaal."*

### D.5 Waarom de lus nu wél voelbaar is (A2, dominante oorzaak)

Er zijn drie kandidaat-oorzaken: copy, ontbrekend herkomst-label, of een echte data-naad.
**Dominant is de data-naad** (§B rij 1): de programmaregel leest uit `session-catalog`, jouw wijziging
schrijft naar `movement_plan_profile`. Zolang die twee niet dezelfde bron delen, is elke copy-verbetering
een belofte die het scherm niet waarmaakt.

**Remedie, in volgorde van effect:**
1. De regel leest jouw opgeslagen dosis (S1) — dit alleen al maakt de lus zichtbaar.
2. Het `OP JE VANDAAG-KAART`-blok in de sheet toont het gevolg vóór je sluit (S1).
3. Herkomst-labels maken zichtbaar wat van jou is en wat van ons (S1) — dit is het label, niet de lus.

Copy is de dunste van de drie en komt daarom laatst.

---

## E. Advies-deur + wat er van de Beweging-footer verhuist

### E.1 Is het beweeg-signaal sterk genoeg voor een supplement-verdict? **Nee.**

Streng, met de reden. De beweegcheck meet **gedrag**: frequentie, minuten, krachtsessies
(`MOV_STR`, `deriveMovementCurrent`). Hij meet geen inname en geen status. De twee kandidaten voor beweging
zijn creatine en eiwitpoeder (`domain-product-stance.ts:21-24`), en beide claims hangen aan een
**innamevraag**, niet aan een gedragsvraag. Een verdict dat uit de beweegcheck alleen volgt, doet dus een
uitspraak die de check niet draagt — dezelfde redenering die stress op `lifestyle_first` zette.

**De juiste rolverdeling:**
- **Beweging levert de modifier** — train je kracht, dan wordt eiwit/creatine überhaupt relevant.
- **Voeding levert het bewijs** — komt je inname tekort. Dat is de bestaande poort
  (`canShowSupplementStrip` vereist `nutritionLogCompleted`, `supplement-eligibility.ts:12`).
- **Het verdict blijft op één plek:** Statistieken › Advies. Er komt geen tweede oordeel-oppervlak.

**Losse waarneming, meenemen in S5:** `buildMovementRecommendations` laat naast de twee stance-slugs
ook magnesium door bij `recovery_score < 50` (`build-recommendations.ts:133-143`) — dat wijkt af van
`DOMAIN_PRODUCT_STANCE.movement`. Magnesium hoort volgens de stance bij slaap. Eén bron kiezen bij de verhuizing.

### E.2 De deur zelf

| | |
|---|---|
| **Waar** | `Voortgang › Beweging`, blok 6 — nooit op de doe-surface |
| **Poort 1** | `adviceMayOutrankDayStep` is waar (de dagstap is klaar) |
| **Poort 2** | Er is beweging-evidence (een gelogde krachtsessie of een beweegcheck) **én** de voedingscheck staat er |
| **Label** | *"Wat een supplement hier wél en niet doet ›"* — geen productnaam, geen prijs, geen merk |
| **Bestemming** | Statistieken › Advies (bestaande surface, `blik: "advies"`) |
| **Poort dicht** | Eén regel waarom niet, geen knop: *"We beoordelen supplementen pas als je voeding bekend is — eerst weten wat er van tafel komt."* Zelfde toon als de bestaande `nutrition_missing`-staat |
| **Max** | Twee signalen tegelijk op Advies, altijd met de "waarom je dit misschien niet nodig hebt"-regel |

### E.3 Wat er van de Beweging-footer verhuist

| Wat | Waar nu | Bestemming | Waarom |
|---|---|---|---|
| Supplementenlijst + "Vergelijk"-links | `BewegingScreen.tsx:122-169` | **Statistieken › Advies**, gefilterd op beweging-evidence | Permanent gestapeld advies is een schap; op Advies leeft de poort al |
| Dezelfde lijst in de desktop-rail | `context-rail.ts:86-93` + `Dashboard.tsx:3053` | **idem** — de rail-tegel verdwijnt | Anders verhuist de doe-surface wel en de rail niet, en meet je een halve verhuizing |
| Vaste beweegcheck-tegel (klaar-staat) | `BewegingScreen.tsx:207-232` | **Voortgang › Beweging** als primary; op Beweging alleen de conditionele regel | Meten is geen doen (§E.3-uitzondering) |
| Voedingscheck-hint | `BewegingScreen.tsx:96-113` | **Blijft op Beweging**, maar getriggerd op een gelogde krachtsessie | Dit is de nutrient-bridge, en die is educatief |
| FooterLink "Gratis Bewegingsgids" | `:258-265` | **Blijft**, klaar-staat only | Eén rustige uitgang mag |
| FooterLink "Leefstijl & inzichten" | `:266-273` | **Weg** | /inzichten staat in de top-nav; dubbele ingang is ruis |
| `dashboard_beweging_premium_upsell` | `:83-90` | **Weg** | Vuurt zonder zichtbaar premium-blok |

### E.4 Nutrient-bridge — educatief naar de gids, of weg? **Blijft, maar gepivot.**

Hij blijft, want het is de enige plek waar de causaliteit *kracht → eiwit* leesbaar wordt, en hij is
getriggerd op bewijs (een gelogde sessie) in plaats van permanent gestapeld. Maar de bestemming wordt
conditioneel: **staat de voedingscheck er niet, dan linkt de regel naar de voedingscheck** — dat is de poort
waar de hele advieslus op wacht. Staat hij er wel, dan naar de gids. Eén regel, één link, en de conditie
(`nutritionLogCompleted`) staat al in de props van `BewegingScreen`.

---

## F. Meetplan

**Hergebruik eerst.** Er komt **geen** nieuw durable `DOMAIN_EVENT_TYPES`-event bij. Het enige nieuwe is
een GA4-naam die het bestaande `dashboard_beweging_*_click`-patroon volgt.

| # | Punt | Event | Payload | Nieuw of hergebruik |
|---|---|---|---|---|
| 1 | Deur op Beweging (beide staten) | `dashboard_beweging_voortgang_click` | `{ surface: "kompas_beweging", state: "open" \| "klaar" }` | 🆕 **GA4 only** — geen 3-plekken-registratie nodig |
| 2 | Meetlat-rij → domeinscherm | `dashboard_voortgang_domein_click` | `{ domain, destination: "domein_scherm" }` | **Hergebruik** (`VoortgangDomeinRing.tsx:82`) — alleen `destination` erbij, zodat de omslag van doe-surface naar leesscherm in het cijfer zichtbaar is |
| 3 | Domeinscherm getoond | `domain_tool.snapshot_viewed` | `{ domain: "beweging", surface: "voortgang_domein" }` | **Hergebruik durable** — staat al in de account-allowlist (`api/account/events/route.ts:11`) en in `account-events-client.ts` |
| 4 | Beweegcheck-CTA op het domeinscherm | `dashboard_beweging_checkin_click` | `{ mode: "full", surface: "voortgang_beweging" }` | **Hergebruik** |
| 5 | Advies-deur op het domeinscherm | `dashboard_beweging_supplement_click` | `{ slug: null, target: "statistieken_advies", surface: "advies_voortgang" }` | **Hergebruik** + GA4-annotatie op de verhuisdatum |
| 6 | Nutrient-bridge | `dashboard_beweging_voeding_click` | `{ surface: "kompas_beweging", trigger: "kracht_gelogd", target: "voedingscheck" \| "gids" }` | **Hergebruik** — `trigger` scheidt de getriggerde regel van de oude permanente footer |
| 7 | Programmaregel → sheet | `dashboard.beweging_programma_open` | `{ from: "kompas_beweging" }` | **Hergebruik durable** (bestaat, `MovementProgramSheet.tsx:228`) |
| 8 | Dosis verzet in de sheet | `movement.target_set` | `{ dial, from, to }` | **Hergebruik durable** — staat al in de allowlist |
| 9 | Regressiewacht | `dashboard_vandaag_action_toggled` | `{ surface: "kompas_beweging", state }` | **Hergebruik** — mag na de hele operatie niet dalen |
| 10 | Terugdeur | `dashboard_voortgang_hub_click` | `{ destination: "vandaag", surface: "voortgang_beweging" }` | **Hergebruik** |
| — | **Stopt** | `dashboard_beweging_premium_upsell` | — | **KILL** + GA4-annotatie |

**Clarity:** `clarityTag("dashboard_beweging_brug", state)` op de deur, en
`clarityTag("dashboard_voortgang_domein", domain)` op het scherm — genoeg om sessies terug te kijken
zonder een tweede getallenlaag.

### F.1 De drie effecten apart — de attributie-eis

| Effect | Teller → noemer | Venster | Wat er in dat venster **niet** mag veranderen |
|---|---|---|---|
| **Brug** | `dashboard_beweging_voortgang_click{state}` → `domain_tool.snapshot_viewed{domain:"beweging"}`, en als vervolgvraag: keert diegene de volgende dag terug op `dashboard_vandaag_action_toggled`? | Na S3+S4 | De advies-deur (bestaat nog niet, S6), de e-mail (staat uit) |
| **Advies** | `dashboard_beweging_supplement_click{surface:"advies_voortgang"}` → `dashboard_ladder_step_click` / `dashboard.aanrader_clicked`; noemer = `dashboard.advies_gate_passed` | Na S6 | De surfaces (bevroren), de deur-copy |
| **Alert** | `movement.nudge_sent` → `dashboard_vandaag_card_shown{ref:"nudge"}` → `dashboard_vandaag_action_toggled` | F1b, eigen deploy | De surfaces (bevroren) |

**Nooit blenden.** Het brug-cijfer is doorklik *op de deur*; het advies-cijfer is doorklik *binnen Advies*.
Eén funnel van deur → aankoop maken is de fout die §H.1 van het BESLUIT verbiedt: dan is niet te zien of een
lage uitkomst aan de deur, aan de poort of aan het oordeel ligt.

**Meetpunt: `dashboard_beweging_voortgang_click{state}` (brug) · `domain_tool.snapshot_viewed{domain}`
(ontvangst) · `dashboard_beweging_supplement_click{surface:"advies_voortgang"}` (advies) ·
`dashboard_vandaag_action_toggled` (regressiewacht) — hier lees je het effect af.**

---

## G. Bouwslices

Volgorde is S-effort eerst en meetbaarheid eerst: de twee goedkoopste slices repareren de leesbaarheid
van de keten, en pas daarna komt het nieuwe scherm. Zo weet je of de klacht "onduidelijk" met compositie
alleen al kleiner wordt.

### S1 — De lus zichtbaar maken · **S** · geen afhankelijkheden

Programmaregel leest de opgeslagen dosis; `OP JE VANDAAG-KAART`-blok in de sheet; herkomst-labels
(`advies` / `jouw keuze` / `volgt uit …`) bij elke instelbare waarde; richtlijn en beweegcheck-CTA uit de
sheet; "Je spoor" en "ongewijzigd door je sport" weg; `coming_soon`-branch wordt de terugvalregel uit §E.4.

**Acceptatie.** Frequentie van 2× naar 3× zetten verandert de regel op Beweging zonder herladen ·
elke instelbare waarde toont herkomst · `grep -rn "spoor\|coming soon\|verandert nooit" src/components/dashboard/beweging/` = 0 in user-facing copy · geen enkele variantkeuze leidt tot een leeg blok.

### S2 — Compositie naar D.1 · **S** · onafhankelijk van S1

Programmaregel in de voet van de VANDAAG-kaart; positieregel direct daaronder; Straks-strip onder de vouw;
de twee waaromaffordances samengevoegd tot één disclosure die op de onderbouwingslink eindigt.

**Acceptatie.** Max 3 contentblokken boven de vouw op 375px in de staten (a)(b)(c), gemeten in een echte
375px-viewport · `dashboard_vandaag_action_toggled` niet lager dan de nulmeting over een gelijk venster ·
geen tweede afvinkoppervlak ontstaan.

### S3 — Klaar-staat-gate consumeren + de deur · **S** · na S2

`BewegingScreen` bouwt `DayStepFacts` en gebruikt `adviceMayOutrankDayStep`; één deur-component met twee
renderingen (stille regel vs kaart); event #1 uit §F. De deur wijst voorlopig naar de Voortgang-hub —
S4 wisselt de bestemming.

**Acceptatie.** `domain-ready-state.ts` heeft ≥1 consumer · met een open stap staat er nergens een kaart of
accentkleur voor analyse/advies · rustdag en "ander domein prioriteit" renderen de klaar-staat ·
`dashboard_beweging_voortgang_click` vuurt met de juiste `state`.

### S4 — `Voortgang › <domein>` · **M** · na S3

Zesde `screen`-case + `domein`-parameter in de URL-parser; `onOpenDomain` in `VoortgangHubScroll` en
`VoortgangHero` gaat naar het scherm i.p.v. `buildDashboardVandaagHref`; blokken 1–6 uit D.3; readout-variant
voor energie/herstel; de terugdeur onderaan; events #2, #3, #4, #10.

**Acceptatie.** Een klik op een pijler-rij landt niet meer op de doe-surface · geen afvinkbaar element op het
scherm · alle 7 domeinen renderen zonder lege of kapotte weergave · de positieregel op het domeinscherm is
letterlijk dezelfde string als op Beweging · deeplink `?screen=domein&domein=beweging` werkt en de back-nav ook.

### S5 — Advies verhuizen · **S/M** · onafhankelijk van S4, wel ná S3

Supplementenlijst weg van Beweging en uit de rail; beweging-gefilterde signalen toevoegen aan
Statistieken › Advies achter de bestaande poort; magnesium-inconsistentie oplossen; nutrient-bridge
conditioneel; `dashboard_beweging_premium_upsell` weg; FooterLink "Leefstijl & inzichten" weg;
GA4-annotaties op beide omslagdata.

**Acceptatie.** `dashboard_beweging_supplement_click` vuurt niet meer met `surface: "kompas_beweging"` ·
geen supplementregel meer in de eerste viewport van Beweging in welke staat dan ook · Advies toont maximaal
twee beweeg-signalen, altijd met een tegenargument-regel · de rail-tegel is weg.

### S6 — De advies-deur op het domeinscherm · **S** · na S4 + S5

Blok 6 uit D.3 met de twee poorten; event #5; gesloten-poort-regel.

**Acceptatie.** Bij een open dagstap is de deur onzichtbaar · zonder voedingscheck toont hij de reden en geen
knop · de deur is nooit prominenter dan de beweegcheck-CTA erboven.

**Afhankelijkheidsketen:** S1 ∥ S2 → S3 → S4 → S6; S5 hangt alleen aan S3.
**Meetvensters:** brug meten na S4 (dus vóór S6 uitrollen), advies meten na S6. Niet tegelijk deployen.

---

## H. Parklijst

**F1b — e-mailnudge.** Eén korte dagmail bij een open beweegstap, achter een eigen opt-in.
*Nu niet:* de mail stuurt verkeer naar een scherm waarvan we nog niet weten of het werkt, en dan is de
hero-conversie een blended cijfer (§H.1 BESLUIT). *Eerst nodig:* een leesbaar meetvenster op S1–S4 plus de
aparte opt-in met eigen afmeldpad. *Vroegste slice:* na het brugvenster, als eigen deploy.

**Wearables.** Koppeling als optionele input naast de check.
*Nu niet:* de stub voedt niets (`api/account/wearable/snapshot` geeft 503) en er is geen partner.
*Eerst nodig:* een partner, een verwerkingsdoel, aparte toestemming, en een plek in het domeincontract waar
de data landt zonder de score te vervuilen. *Vroegste slice:* niet in 2026 tenzij een partner zich meldt.

**n8n.** Automatiseringslaag rond events en uitbetalingen.
*Nu niet:* app-first is het gelockte uitgangspunt; de events die n8n zou consumeren zijn er wel, de vraag niet.
*Eerst nodig:* een tweede consument van `domain_events` buiten PostHog. *Vroegste slice:* na het affiliate-programma.

**Community.** Gedeelde voortgang, vergelijking, groepen.
*Nu niet:* geen publiek, en sociale vergelijking is precies de gap-display-mechaniek die dit product weigert.
*Eerst nodig:* retentie die zonder sociale druk staat. *Vroegste slice:* geen.

**De andere zes domeinen volgens het F1-patroon.** Eén doe-surface, één sheet, gedeeld meetscherm.
*Nu niet:* de sjabloon is pas bewezen als de beweging-keten meetbaar werkt; kopiëren vóór dat moment
vermenigvuldigt een ontwerpfout met zes. *Eerst nodig:* een leesbaar brugvenster (S4) plus het Fable-verdict
D.3 (slaap eerst). *Vroegste slice:* slaap, ná S6. Wat ze **wel** meteen erven zonder werk: het domeinscherm
uit S4 (het is domein-agnostisch) en de klaar-staat-gate uit S3.

**Fable V2/V3 — voeding-registry + `previousBand`.** De `action_key → nutrient`-registry en de delta in de
snapshot. *Nu niet:* het is een andere keten (voeding) en het concurreert met het brugvenster om aandacht.
*Eerst nodig:* niets technisch — het is puur volgorde. *Vroegste slice:* parallel aan S5 als er ruimte is,
anders erna; ze raken elkaar nergens.

**Meetdiepte-audit stress/verbinding.** Wat meten die checks echt, en welke uitspraken dragen ze.
*Nu niet:* stress is met het `lifestyle_first`-besluit net eerlijk gemaakt; verbinding heeft geen eigen check
en dat is bewust. *Eerst nodig:* het S6-besluit over een eigen verbinding-check-in. *Vroegste slice:* na slaap,
als onderdeel van het domeincontract per domein.

---

## K. Kritiekronde — en wat het veranderde

### K.1 Man 40+, drukke week, telefoon

- **Kritiek 1.** "Je voortgang · beweging" onderaan een scherm dat ik open om af te vinken, ga ik nooit lezen.
  Als jullie willen dat ik het zie, moet het er staan als ik klaar ben — niet als ik bezig ben.
- **Kritiek 2.** Als ik op de deur klik en ik krijg een ring met 58, weet ik nog steeds niet of dat goed is.
  Een getal zonder oordeel is een tweede vraag, geen antwoord.
- **Verwerkt.** *(a)* De deur is in de open-staat bewust een dode regel onder de vouw en in de klaar-staat een
  kaart bóven de vouw — dat is niet inconsistent, dat is de klaar-staat-regel (§C.3). *(b)* Het domeinscherm
  toont naast de score het **bandlabel** (`getScoreBandShortLabel`, bestaat al) en de deltaregel in woorden,
  zodat 58 een betekenis heeft en niet alleen een positie.

### K.2 Gedragswetenschapper

- **Kritiek 1.** Wie twee weken niets deed en op de deur klikt, ziet een score die niet bewoog en een
  hermeting die nadert. Dat is een straf voor nieuwsgierigheid — precies op het moment dat iemand terugkomt.
- **Kritiek 2.** "Deze week 65 minuten" naast "de richtlijn is 150–300" is een gap display, hoe je het ook
  formuleert. De vergelijking zit in het hoofd van de lezer, niet in de UI.
- **Verwerkt.** *(a)* De richtlijn staat **achter een disclosure**, nooit als tweede getal naast het jouwe
  (§C.2), en de tweede regel is *"Vorige week 40 minuten"* — richting, geen norm. *(b)* Bij een stilstaande
  score is de metaregel niet "je staat stil" maar *"Dit verandert bij je hermeting"* — de score is een
  meetmoment, geen dagcijfer, en dat expliciet zeggen haalt de aanklacht eruit. *(c)* De vierde bouwfase
  `returning` is precies voor dit geval bedoeld; hij is nu onbereikbaar, en dat is de sterkste reden om
  de fase-aware resolver in F3 niet verder uit te stellen dan F3.

### K.3 Front-end realist

- **Kritiek 1.** Optie 3 (accordeon) is goedkoper dan optie 1 — misschien een halve dag. Als je in dit
  document doet alsof optie 1 óók het goedkoopst is, geloof ik de rest ook niet.
- **Kritiek 2.** Een nieuw scherm betekent een nieuwe URL-staat, back-gedrag, deeplinks en een leegstaat per
  domein. Dat is geen S, dat is een M met een staart.
- **Verwerkt.** *(a)* §C.4 zegt nu expliciet dat optie 3 goedkoper te **bouwen** is en dat optie 1 goedkoper
  te **verwijderen** is — dat is het argument, niet de bouwtijd. *(b)* S4 staat als **M** gelabeld, niet als S,
  en de acceptatiecriteria noemen deeplink en back-nav met naam. *(c)* De volgorde is zo gezet dat S1–S3 (drie
  keer S) al waarde opleveren als S4 zou uitlopen: de lus is dan zichtbaar en de compositie klopt, ook zonder
  nieuw scherm.

### K.4 Product-eigenaar

- **Kritiek 1.** Als de supplementenlijst van Beweging verdwijnt en tegelijk de deur verschijnt, zakt
  `dashboard_beweging_supplement_click` in en stijgt er niks meetbaars — en over drie maanden weet niemand meer
  waarom die lijn een knik heeft.
- **Kritiek 2.** "Brug-effect" is geen KPI. Doorklik op een deur zegt niets als je niet weet of die mensen
  daarna terugkomen om af te vinken.
- **Verwerkt.** *(a)* GA4-annotaties op **twee** data (verhuizing van de lijst, stop van het premium-event),
  benoemd in S5. *(b)* Het brug-effect heeft nu een tweede trap: doorklik op de deur → scherm gezien → **keert
  die gebruiker de volgende dag terug op `dashboard_vandaag_action_toggled`** (§F.1). Dat is de vraag die telt:
  maakt lezen dat je blijft doen. *(c)* Brug, advies en alert hebben drie aparte vensters met per venster
  expliciet wat bevroren blijft — en S6 rolt bewust ná het brugvenster, niet ermee.

---

*Opgesteld 2 augustus 2026. Geverifieerd tegen `main` + de ongecommitte Golf-1-bestanden.
IA, wireframes, meetplan en slices — geen code, geen diffs, geen commits.
Eén gelockt besluit wordt aangescherpt, geen enkel gelockt besluit heropend: §E.3 van het BESLUIT wordt van
een verhuislijst zónder ontvanger een verhuislijst mét bestemming, en de bouwfase-geschiedenis daarin wordt
gekild met reden (§C.2).*
