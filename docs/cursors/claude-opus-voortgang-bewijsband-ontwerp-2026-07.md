# Voortgang → bewijs-scherm — ontwerp + prebuild

**Datum:** 28 juli 2026 · **Rol:** Senior Product Designer / IA / frontend-craft
**Codeartefact:** [`docs/design/voortgang-bewijsband-prebuild-2026-07.html`](../design/voortgang-bewijsband-prebuild-2026-07.html)
**Getoetst tegen:** `main`, 28 juli 2026

---

## A. ARCHITECTUUR-OVERNAME

### (a) Wat ik overneem

1. **Voortgang is de bewijs-surface, niet een tweede statusscherm.** Elk blok dat ik voorstel beantwoordt "wat is er sinds mijn check opgestapeld", niet "hoe sta ik ervoor".
2. **De drie meetlatten blijven gescheiden.** Ik maak dat sterker dan het nu is: adherence en beleving krijgen in de flagship *fysiek aparte rijen* boven en onder de as. De scheiding is niet langer alleen een regel in een codecomment, hij is zichtbaar.
3. **Het deltaReport blijft van Hermeting.** Voortgang toont de *domein*-delta die al in `model.deltaOf()` zit (die staat er vandaag ook al, in de DeltaBadge); het cyclus-rapport blijft ongemoeid.
4. **Verdict-SSOT + stepped care blijven in Statistieken/Favorieten.** Op de hub staat één regel-verwijzing, geen supplementinhoud.
5. **De reis-strip is score-loos** — dat principe hou ik. Ritme, geen prestatie.
6. **Narratief = oud-jij → nu → toekomstige-jij, per domein.** Geen aggregaat, geen tweede cijfer.
7. **Future You zit in copy en richting.** De enige plek waar hij spreekt is een citaatblok, nooit een getal.
8. **Niets wegsnijden zonder landingsplek**, en de hermeting-herinnering verdwijnt nooit — in mijn ontwerp is de hermeting letterlijk het eindpunt van de flagship, in élke state inclusief de nul-staat.
9. **De documentaire-vorm uit §16**: één flagship die de emotie draagt, sectie-ritme met een warme beat, één afsluiting in plaats van een kaartenmuur.
10. **Cohort boven polijstwerk.** Golf 0 raakt geen schema, geen loader, geen nieuw durable event.

### (b) Waar ik afwijk, en waarom

| # | Afwijking | Onderbouwing |
|---|---|---|
| 1 | **De reis-strip verdwijnt als los blok en wordt de as van de flagship.** | De strip doet precies het goede (check → nu → hermeting) maar op 40px hoogte, zonder enige data ertussen. Twee tijdlijnen naast elkaar is ruis. Dit maakt de ene job scherper: de strip *was* al het bewijsverhaal, hij had alleen geen lichaam. De hermeting-herinnering wordt hierdoor prominenter, niet zwakker (invariant 13 gedekt). |
| 2 | **Het gedeelde focus-paneel gaat van Voortgang af.** | Zie hieronder — dit is het eigenaarschapslek en het verdient een echt oordeel, geen compromis. |
| 3 | **De drie HubCards degraderen tot een lijst met haarlijnen.** | Drie gelijke kaarten onderaan maken van de bewijs-surface een menu. Als lijst kosten ze 40% minder hoogte en concurreren ze niet met de flagship. De prompt staat dit expliciet toe. |
| 4 | **Eén licht vlak in een donker cockpit.** | De craft-lat schrijft een contrast-beat voor en `?screen=inzichten` gebruikt al een licht thema — licht is geen novum in dit product. Ik begrens het tot één sectie van ~660px. |
| 5 | **De hero krijgt een eigen serif-kop bóven de bewijsregel.** | De bewijsregel is getest en gelockt, maar hij is 15px body-tekst tussen vijf andere blokken. Een serif-kop van 34px geeft hem het gewicht dat zijn inhoud verdient, zonder één letter van de gelockte copy aan te raken. |

Geen van deze vijf is esthetiek-only: 1, 3 en 5 maken de ene job scherper; 2 heft een architectuurschuld op; 4 is de enige die deels smaak is, en die begrens ik.

### Het eigenaarschapslek: het gedeelde focus-paneel

**Oordeel: verwijderen van Voortgang, met drie vervangende landingsplekken.**

`KompasVoortgangFocusBlock` draait vandaag op beide oppervlakken met alleen `showHeader={false}` als verschil. Dat is geen hergebruik, dat is dezelfde vraag twee keer stellen. Op Kompas beantwoordt het paneel *"waar richt ik me vandaag op"* — dat is oriëntatie, en oriëntatie is Kompas' werk. Op Voortgang beantwoordt het niets dat de rest van het scherm niet al zegt.

Wat er in het paneel zit, en waar het heen gaat:

| Onderdeel van het paneel | Bestemming |
|---|---|
| Focus-pill + picker | **Blijft alleen op Kompas.** Je focus kiezen is een oriënterende daad. |
| Domeincijfer 34px serif + bandlabel | **Bestaat al op Voortgang** — in de domeinrij (bandlabel + DeltaBadge). Niets verloren. |
| Route baseline → nu → volgende band | **Wordt de contrast-beat (sectie 3).** Zelfde data, andere job: op Kompas is het "waar mik ik op", op Voortgang "hoe ver is dit gekomen en wat vraagt het volgende niveau". |
| Pijnregel uit `getVitalityExplainer()` | **Blijft alleen op Kompas.** Dat is oriëntatie-copy. |

Netto: de duplicatie is weg, er verdwijnt geen enkele informatie, en de route krijgt op Voortgang eindelijk een reden om te bestaan.

### Spanningen die ik bewust open laat

1. **De runway kán als percentage gelezen worden.** Een 30-daagse as met acht merken erop is voor een strenge lezer 27%. Ik dempt dat hard (zie E en de kritiekronde) maar ik kan het niet tot nul reduceren zonder de tijdas op te geven — en die tijdas is precies wat de hermeting-datum voelbaar maakt. Ik accepteer het restrisico en documenteer het.
2. **Dag-attributie van adherence bestaat nog niet.** `cycleEvidence.activeDays` is een *telling*, geen datumreeks. Golf 0 draait daarom zonder dagmerken; Golf 1 voegt ze toe via een loader-veld. De prebuild toont het Golf 1-beeld — expliciet gemarkeerd.
3. **De supplementverwachting op een bewijs-scherm.** Een deel van het cohort komt van "de Consumentenbond van supplementen" en verwacht op "Voortgang" iets over supplementen. Ik geef ze één regel richting Statistieken en verder niets. Dat is de stepped-care-keuze, maar het kan bounce kosten. Meetbaar via `dashboard_voortgang_hub_click {destination:"statistieken"}`.
4. **Één licht vlak in een donker cockpit** blijft een craft-gok. Het staat of valt met de review op 375px.

---

## B. JOB EN INVARIANT

**De ene zin:** *Voortgang laat zien wat er sinds je check is opgestapeld, en of dat al genoeg is om iets te kunnen zeggen — met een datum waarop je het antwoord krijgt.*

Dat tweede deel is het scherp: bij N=2 en één meting is het eerlijke antwoord op dag 12 bijna altijd "nog niet". Een scherm dat dat durft te zeggen én er een datum bij levert, is geen statusdashboard maar een dossier in aanbouw met een zittingsdatum. Daardoor doet Voortgang **drie dingen níet**: (1) het beoordeelt je niet — geen totaalcijfer, geen samengesteld bewijs-percentage, geen oordeel over de persoon; (2) het vraagt je niets af te vinken — de enige check-off in de app blijft de Vandaag-hero op Mijn Dag; (3) het sluit de cyclus niet — het deltaReport, de hermeting-uitkomst en het "wat je deed"-blok blijven van Hermeting, Voortgang wijst er alleen naartoe.

---

## C. DATA-INVENTARISMATRIX

### LIVE — staat al op de hub

| Veld | Vandaag | In dit ontwerp |
|---|---|---|
| `cycleEvidence.activeDays` | bewijsregel | bewijsregel + adherence-rij flagship |
| `cycleEvidence.cycleDay` | bewijsregel, reis-strip | as-positie "vandaag" |
| `cycleEvidence.daysUntilRemeasure` | bewijsregel | band-voetregel |
| `remeasure.dueDate` / `.daysUntil` | reis-strip | **eindknoop flagship** — met datum, in elke state |
| `domainCheckDaysAgo` | metaregel domeinrij | **datering van de meetmomenten op de flagship** |
| `model.scores` | bandlabel per domein | idem + contrast-beat |
| `model.trend` | Sparkline 72×24 | idem, ongewijzigd |
| `model.deltaOf()` | DeltaBadge | idem + hero-kop |
| `model.history` | logboek (laatste 5) | meetreeks-sectie, uitgekleed tot een lijst |
| `model.priority` | bewijsregel, focuspaneel | hero, flagship-caption, contrast-beat |
| `model.vitality` | focuspaneel | **niet op de hub** — blijft `?screen=inzichten` |

### ONDERBENUT — bestaat, wordt hier niet gebruikt

| Veld | Wat het visueel kan dragen | Verdient het een plek? | Zonder loaderwijziging? |
|---|---|---|---|
| `cycleEvidence.cycleStartDate` | **Het beginpunt van de flagship-as, met datum.** | **Ja — direct.** Zonder startdatum is "dag 12" een getal zonder anker. | ✅ ja |
| `cycleEvidence.cycleEndDate` | Het eindpunt naast `remeasure.dueDate`; kruiscontrole. | Ja, als fallback wanneer `remeasure` ontbreekt. | ✅ ja |
| `trendBaselines` (`source` + `rulesVersion`) | Bronlabel bij de startwaarde in de contrast-beat ("op basis van je intake"). | Ja — Golf 1. `baselineSourceLabel()` bestaat al. | ✅ ja |
| `prev` (vorige snapshot) | Tweede meetmoment op de flagship bij ≥2 snapshots. | Ja — Golf 1. | ✅ ja |
| `planProgress` / `movementPlanProgress` | Niets. Dit ís adherence en zou als balk gaan lezen. | **Nee.** Botst met invariant 3. | n.v.t. |
| `movementRecoveryTrend` | Een derde rij (evidence) op de flagship. | Later — Golf 2, samen met sessies. | ✅ ja |
| `movementRcvFeel` + `...At` | Losse ruit op de meetlat-rij. | Ja — Golf 1, goedkoop. | ✅ ja |
| `nutritionIntake` | Meetmoment-ruit (bron `nutrition_log`). | Ja — Golf 1. | ✅ ja |
| `sleepCheckinFocus` / `hasStressCheckin` | Meetmoment-ruiten. | Ja — Golf 1. | ✅ ja |
| `answers`, `profileLabel` | Niets op deze surface. | Nee. | n.v.t. |
| `supplementVerdicts` | — | Nee, elders eigenaar. | n.v.t. |

### ELDERS EIGENAAR — niet stelen

`deltaReport` (Hermeting, ≥2 snapshots) · de dagtaak-afvinklijst (Mijn Dag) · het "Wat je deed"-blok in Hermeting · verdict-SSOT en stepped care (Statistieken/Favorieten) · de grote VitalityGauge en `getVitalityScoreCardCopy()` (`?screen=inzichten`).

### TOEKOMSTSLOT — bestaat als "binnenkort", niet als data

`Signal` met status `"binnenkort"` (wearable) → één rij in de Binnenkort-groep, met het bestaande durable event `wearable.interest_clicked`. · `LichaamssamenstellingView` → premium-rij met terracotta pill. Beide verschijnen **uitsluitend** als zichtbare binnenkort-toestand, nooit als nep-metric.

### VEREIST NIEUW

- **`cycleEvidence.activeDayNumbers: number[]`** — welke dagnummers actief waren. Loader-only afgeleide uit `daily_action_log` (de teller wordt daar al gemaakt); **geen schemawijziging**. Golf 1.
- **`model.seriesSources`** — bron per punt in de reeks (bestaat in `series[pillar][i].source`, gaat verloren in `trend`). Loader-only. Golf 1.
- **`movementSessions`** — minuten/sessies uit `movement_session_log`. Golf 2, ná het cohort.

---

## D. FIRST VIEWPORT (HERO)

Een man op dag 12, één intake, twee losse domeinchecks, 8 actieve dagen.

### 375px — element voor element (afstanden vanaf de bovenkant van de hub)

| y | Element | Schaal | Copy-intentie |
|---|---|---|---|
| 0 | Hero-vlak begint: `#132414`, 64px raster op .14 achter een radiale mask, één sage-cirkel `blur(120px)` rechtsboven op .18 | — | Dit is niet de zoveelste tegel. Dit is een vlak. |
| 28 | Eyebrow `BEWIJS · DAG 12` | 10px / 600 / .14em / `#9FB0A6` | Waar je bent, in vier woorden. Geen noemer — "van 30" nodigt uit tot percentages. |
| 54 | **H1** state-gestuurd, serif | `clamp(27px, 7.4vw, 34px)` / 1.1 | Het antwoord op "werkt het?" in één zin — of de eerlijke mededeling dat het te vroeg is. |
| 108 | **Bewijsregel** — `buildVoortgangBewijsRegel()` **verbatim** | 15.5px / 1.55 / `#CDD7D0` / max 42ch | De feiten onder de kop. Gelockte copy, geen letter aangeraakt. |
| 162 | CTA-rij: primair (sage pill, 46px) + tekstlink | 14.5px / 600 | Eén daad, één zijpad. Nooit drie. |
| 222 | Micro-reassurance | 12.5px / `--text-subtle` | Wegnemen van de "is dit genoeg?"-twijfel. |
| 290 | Kop **"Je cyclus"** serif 18 | — | Naamgeving, geen belofte. |
| 320 | **FLAGSHIP — de Bewijsband** (SVG, viewBox 340×112) | volle breedte | Zie E. |
| 435 | Scrubber (44px raakdoel) | — | |
| 485 | Caption, 3 regels, `min-height:76px` zodat er niets springt | 15px / 14px / serif-italic 15.5px | |
| 580 | Voetregel: *"Nog 18 dagen tot je hermeting op 14 aug. Laatste meting: slaap, 4 dagen geleden."* | 12.5px | **De hele boodschap zonder één interactie.** |
| 625 | Noot: *"Merken en metingen staan op aparte rijen — ze worden nooit één cijfer."* | 11px | Invariant 2, hardop. |
| 655 | Legenda (3 chips) | 11.5px | |
| ~720 | Einde hero-vlak | | |

**Binnen de eerste 600px** ziet hij dus: eyebrow → kop → bewijsregel → CTA → de complete band met de vandaag-marker, de hermeting-datum en de caption. Alleen de voetregel en de legenda vallen net onder de vouw. Er staat geen enkele tegel in het eerste scherm — de eerste `CockpitTile` verschijnt pas op ~900px.

### Desktop (≥1024px)

Twee kolommen, `minmax(0,1fr) minmax(0,1.05fr)`, gap 56px — dezelfde greep als `MovementLifeline`.
**Links (narratief):** eyebrow → H1 `clamp(34px, 3.6vw, 50px)` / 1.04 → bewijsregel 18px / max 38ch → CTA-rij → reassurance.
**Rechts (instrument):** de band, nu wél in een kaart (`rounded-20`, `border rgba(255,255,255,.10)`, `bg rgba(0,0,0,.22)`, padding 22) — op desktop heeft het instrument een rand nodig om niet in de leegte te zweven; op mobiel niet, daar is de schermbreedte de rand.
Hero-hoogte desktop ≈ 560px, volledig above the fold op 900px.

---

## E. FLAGSHIP-VISUAL — de Bewijsband

### Wat het is

Eén horizontale tijdband over de cyclus, van `cycleStartDate` tot `remeasure.dueDate`, met **twee gescheiden rijen**:

- **Boven de as — meetmomenten (BELEVING).** Een gekleurde ruit per meting, gedateerd op `cycleDay − domainCheckDaysAgo[pillar]`, in de pijlerkleur, met een haarlijn naar de as. De meest recente krijgt een ring.
- **Onder de as — actieve dagen (ADHERENCE).** Eén merk per dag waarop iets is gepakt. Nooit een balk, nooit een vulling.
- **De as zelf.** Verleden: solide 1.5px op `rgba(255,255,255,.30)`. Toekomst: **geen dagvakjes**, maar één stippel-haarlijn die naar de hermeting-knoop loopt. Startknoop met datum links, hermeting-knoop met datum rechts, met een zachte sage-gloed als bestemming.
- **Vandaag** is een sage-marker met verticale lijn. **De leeskop** is een wit driehoekje dat met de scrubber meebeweegt.

### De interactie

Eén `<input type="range">` over dag 1–30, `aria-valuetext="dag N van je cyclus"`. De caption eronder leest:

- verleden + meting → *"Dag 8 · 23 jul — Je mat je slaap."*
- verleden + actief → *"Dag 8 · 23 jul — Je pakte je moment."*
- verleden, niets → *"Dag 9 · 24 jul — Geen log op deze dag."* (feit, geen verwijt)
- vandaag → *"Dag 12 · vandaag — 8 dagen waarop je iets pakte."*
- toekomst → *"Dag 20 · 4 aug — Nog te gaan."* + serif-italic: *"Wat je tussen nu en dan neerzet, lees je op 14 aug terug."*
- dag 30 → *"Dag 30 · 14 aug — Je hermeting."* + *"Hier lees je terug of er beweging in je slaap zit."*

Bij ontbrekende cyclus is de scrubber `disabled`; de band toont dan alleen de as en de hermeting-knoop.

### Op 375px

De SVG schaalt op `width:100%` van een viewBox van 340. 30 dagen over 308px = 10.6px steek; merken zijn 2.5px breed met 8px lucht — nooit een aaneengesloten vlak. De hermeting-datum staat rechts-uitgelijnd op 10.5px in sage-tint en blijft in élke state leesbaar. Niets scrollt horizontaal.

### Waarom dit geen tweede score is

1. **Er wordt geen enkel getal uit afgeleid.** De band toont wat de gelockte bewijsregel al in woorden zegt; hij berekent niets nieuws.
2. **Geen noemer van 30 in de copy.** De enige noemer die valt is `cycleDay` — "8 van de 12 dagen", exact de bestaande zin. "30" is een *datum-as*, geen deler.
3. **De toekomst is geen te vullen ruimte.** Er staan geen 18 lege vakjes. Er staat een stippellijn naar een datum. Je kunt de runway niet "voller" maken, alleen dichterbij.
4. **Adherence en beleving raken elkaar nooit.** Ze staan aan weerszijden van de as, in andere vormen (staaf vs ruit), met een expliciete noot eronder.
5. **Geen streak-logica.** Aaneengesloten dagen krijgen geen andere behandeling dan losse dagen.

### Afgewogen alternatieven

| Alternatief | Waarom niet |
|---|---|
| **A. Domein-levenslijn** (slider zoals `MovementLifeline`, twee scenario's over de cyclus) | Vereist een *voorspelling* van waar je uitkomt. Dat is een tweede cijfer in grafiekvorm en botst frontaal met invariant 1 en 6. Bovendien is er geen daggranulaire data om op te tekenen — het zou verzonnen zijn. **Afgevallen op invariant.** |
| **B. Domeinring / radar** (7 pijlers als ring, huidige vs baseline) | Ziet er sterk uit en gebruikt alleen bestaande data. Maar: een gesloten ring is optisch een aggregaat — de oppervlakte *is* een samengestelde index, ook als je hem niet uitrekent. Bovendien beantwoordt hij "hoe sta ik ervoor" (Kompas' vraag), niet "wat is er opgestapeld". **Afgevallen op job + verkapte totaalscore.** |
| **C. Bewijsband** (gekozen) | Draait op `cycleStartDate`/`cycleEndDate` die vandaag nergens gerenderd worden, dateert de meetmomenten met data die er al is, maakt de scheiding van de meetlatten zichtbaar in plaats van alleen beschreven, en zet de hermeting-datum in het hart van het scherm — precies de North Star (`remeasure.invited` → `remeasure.completed`). |

**Doorslaggevend argument voor C:** het is de enige van de drie die er bij dun bewijs *beter* uitziet in plaats van slechter. Een radar met één meting is een plat vlak; een levenslijn met één meting is een lege grafiek. Een tijdband met twee ruiten en acht merken is een dossier dat net begonnen is — en dat is precies de waarheid.

---

## F. SECTIE-RITME

| # | Sectie | Toon | Kaart? | Hoogte @375 |
|---|---|---|---|---|
| 1 | **Hero + Bewijsband** | Donker vlak `#132414`, raster + sage-gloed. Analytisch mét emotie. | **Nee** — het vlak ís de container. Op desktop wel een kaart om de band. | ~720px |
| 2 | **Wat je van jezelf weet** — domeinlijst | Donker, puur analytisch. Terug naar `--bg`. | **Ja** — `CockpitTile`. Een lijst van 7 rijen mét sparklines is verdiende omkadering. | ~560px |
| 3 | **Waar dit heen loopt** — contrast-beat | **Licht** `#EFEDE6`, tekst `#16281A`, accent `--sage-ink #33583F`. Warm, traag, één idee. | **Nee** voor de route (die staat vrij op het vlak), **ja** voor het citaat (subtiele kaart binnen het lichte vlak). | ~660px |
| 4 | **Je meetreeks** | Donker, rustig. | **Nee** — haarlijnen tussen de rijen. Twee logregels in een kaart is overdaad. | ~200px |
| 5 | **Verder kijken** + Binnenkort | Donker, stil. | **Nee** — rijen met haarlijnen, 56px hoog. De Binnenkort-groep onder een `--divider-strong`. | ~420px |
| 6 | **Premium — de afsluiting** | Terracotta-gradient, één blok. | **Ja** — dit is de enige plek waar terracotta mag, en de enige kaart in de staart. | ~250px |

**De contrast-beat.** Sectie 3 is de `MovementFuture`-beat: het scherm wordt licht en warm, het tempo zakt, één idee krijgt de hele breedte. Het bevat exact wat het verwijderde focuspaneel bevatte (baseline → nu → volgende band) plus het Future You-citaat. Ervoor en erna staat donker analytisch werk. Op 375px blijft het scanbaar omdat er precies drie dingen staan: kop, schaal met drie stops, citaat.

**Kaarten alleen waar verdiend:** 2 van de 6 secties krijgen een tegel. Vandaag zijn dat er 6 van de 6.

---

## G. CONVERSIEKAART + MEETPUNTEN

**Regel voor de primaire CTA:** `remeasure.daysUntil <= 14` → hermeting is primair. Daarboven → de daad die méér bewijs oplevert (Mijn Dag) is primair. Dat volgt de North Star: bewijs opbouwen tot het kan, dan de cyclus sluiten.

| State | Primair | Secundair | Soft |
|---|---|---|---|
| **beantwoord** | "Wat staat er voor vandaag" → Mijn Dag<br>`dashboard_voortgang_hub_click {destination:"agenda", surface:"bewijs_hero"}` | "Bekijk je slaap" → domein<br>`dashboard_voortgang_domein_click {domain}` | Statistieken-rij · waitlist |
| **opbouwend** | idem | idem | idem |
| **dun** | **"Pak één moment terug"** (de gelockte `ctaLabel`) → Mijn Dag<br>`dashboard_voortgang_hub_click {destination:"agenda", surface:"bewijs_hero"}` | "Bekijk je slaap" | Contrast-beat-link |
| **wachtend** | "Wat staat er voor vandaag" → Mijn Dag | "Bekijk je slaap" | — |
| **≤14 dgn** (elke state) | **"Naar je hermeting"**<br>`dashboard_voortgang_hub_click {destination:"hermeting", surface:"bewijs_hero"}` | "Wat staat er voor vandaag" | — |
| **nul** | "Doe de Leefstijlcheck"<br>`dashboard_voortgang_hub_click {destination:"intake", surface:"bewijs_hero"}` | — | — |

### Overige meetpunten

| Interactie | Event | Status |
|---|---|---|
| Hero rendert | `dashboard_voortgang_bewijs_state {state, cycle_day, active_days}` | **bestaat** — ongewijzigd |
| Domeinrij | `dashboard_voortgang_domein_click {domain}` | **bestaat** |
| Rij in Verder kijken | `dashboard_voortgang_hub_click {destination, surface:"verder_kijken"}` | **bestaat** |
| Link in contrast-beat | `dashboard_voortgang_hub_click {destination:"inzichten", surface:"richting_beat"}` | **bestaat**, nieuwe `surface`-waarde |
| Terug uit subscherm | `dashboard_voortgang_terug {from}` | **bestaat** |
| Wearable-rij | `wearable.interest_clicked` | **bestaat** als durable, staat al in `CLIENT_EMIT_TYPES` |
| Waitlist | `premium.waitlist_joined` | **bestaat** als durable |
| **Scrubben op de band** | `dashboard_voortgang_band_scrub {zone: "verleden"\|"vandaag"\|"toekomst"}` | **NIEUW — GA4 only**, gedebounced op 1.2s |

Eén nieuw GA4-event, nul nieuwe durable events. Geen enkele payload bevat een domeinscore, vitaliteitswaarde of andere gezondheidscontext — `zone` is een van drie enums, `domain` is een pijler-id die al in het bestaande event zit.

**Meetpunt: `dashboard_voortgang_bewijs_state` + `dashboard_voortgang_hub_click {surface:"bewijs_hero"}` + `dashboard_voortgang_band_scrub`, afgezet tegen `remeasure.invited → remeasure.completed` — hier lees je het effect af.**

---

## H. COPY-RICHTING

### Hero-kop per state (nieuw, serif)

| State | H1 |
|---|---|
| beantwoord | **"Er zit beweging in."** |
| opbouwend | **"Er stapelt zich iets op. Lezen doe je straks."** |
| dun | **"Er ligt nog te weinig om iets te lezen."** |
| wachtend | **"Je bewijs begint bij je eerste dag."** |
| nul | **"Hier komt je bewijs te staan."** |

"Er zit beweging in" werkt bij een positieve én negatieve delta — het claimt beweging, geen verbetering. Dat is de eerlijke lezing en het scheelt een tweede tekstvariant.

### De vier bewijs-state-zinnen — ONGEWIJZIGD

`buildVoortgangBewijsRegel()` blijft letterlijk zoals hij is, inclusief tests. De prebuild draait de functie geport, één op één:

- **beantwoord** — "Je was 8 van de 12 dagen actief. Slaap staat 9 punten hoger dan bij je start."
- **opbouwend** — "Je was 7 van de 12 dagen actief. Of dat je slaap raakt, meet je over 18 dagen."
- **dun** — "Je was 2 van de 12 dagen actief. Te weinig om iets te zien — dat is informatie, geen oordeel."
- **wachtend** — "Je hermeting staat over 18 dagen. Dan zie je of er beweging in je slaap zit."

Alle vier: geen causaal voegwoord, geen samengevoegd getal, geen oordeel. Mijn nieuwe kop staat erbóven en herhaalt de feiten niet.

### Micro-reassurance (nieuw, onder de CTA)

- beantwoord — "Eén beweging in één domein. Je hermeting maakt er een reeks van."
- opbouwend — "Losse dagen zeggen weinig. Een reeks zegt iets."
- dun — "Twaalf dagen is kort. Er is nog ruimte genoeg tot je hermeting."
- wachtend — "Eén moment per dag is genoeg om iets te kunnen aflezen."
- nul — "Zes minuten. Je hoeft niets te weten van supplementen."

### Flagship

Kop **"Je cyclus"**. Voetregel: *"Nog 18 dagen tot je hermeting op 14 aug. Laatste meting: slaap, 4 dagen geleden."* Noot: *"Merken en metingen staan op aparte rijen — ze worden nooit één cijfer."*
Future You in de toekomstzone: *"Wat je tussen nu en dan neerzet, lees je op 14 aug terug."* — richting in taal, geen getal, geen belofte over de uitkomst.

### Sectiekoppen

`Je metingen` / **"Wat je van jezelf weet"** (bestaand, ongewijzigd) · `Waar dit heen loopt` / **"Van waar je begon, naar waar dit heen kan."** (bij één meting: **"Waar je nu staat, en wat het volgende niveau vraagt."**) · `Je meetreeks` / **"Wat je tot nu toe hebt vastgelegd"** · `Verder kijken` / **"Waar je dit verder uitzoekt"** · `Premium` / **"Straks: je cyclus naast je vorige cyclus"**.

### Contrast-beat

Lede: *"Slaap is je focus in deze cyclus. Dit is de schaal waarop je dat afleest — geen doel dat je moet halen, wel het volgende leesniveau."*
Citaat: *"Ik weet nog dat ik dacht: twaalf dagen, wat stelt dat voor. Wat ik toen neerzette, kon ik later teruglezen."* — *— jij, aan het eind van deze cyclus*
Voetnoot: *"Banden zijn leesniveaus, geen doelen en geen oordeel. Waar jouw lijn loopt, hangt af van waar je nu staat."*

---

## I. LEGE EN DUNNE STATES

| State | Hero | Flagship | Rest |
|---|---|---|---|
| **wachtend** (check gedaan, niets gelogd) | "Je bewijs begint bij je eerste dag." + gelockte regel. Primair → Mijn Dag. | As van startdatum naar hermeting-datum, **één ruit** (de leefstijlcheck), géén adherence-rij, géén vandaag-marker, **scrubber disabled**. Caption: "Nog niets gelogd — Je hermeting staat op 14 aug." + *"Wat je vanaf vandaag neerzet, lees je op die dag terug."* | Alle secties zichtbaar. Contrast-beat draait op de tweestops-variant. |
| **dun** (`activeDays < max(2, ⌈cycleDay/3⌉)`) | "Er ligt nog te weinig om iets te lezen." Primair = **"Pak één moment terug"** — de enige state met een `ctaLabel`. | Twee merken op de as, één ruit. Ziet er dun uit, en dat is de boodschap. De runway naar 14 aug is visueel dominant t.o.v. het verleden — dat is precies goed: er is meer tijd over dan verstreken. | Volledig. |
| **opbouwend** | "Er stapelt zich iets op. Lezen doe je straks." | Zeven merken, twee ruiten, volle band. | Volledig, contrast-beat tweestops (één meting op de focus). |
| **beantwoord** | "Er zit beweging in." + de delta-zin. | Drie ruiten, acht merken, de recentste meting geringd. | Volledig, contrast-beat driestops met echte startwaarde. |
| **NUL** (geen check) | "Hier komt je bewijs te staan." + `emptyHint` verbatim. Eén CTA: **"Doe de Leefstijlcheck"**. Reassurance: "Zes minuten." | **Spookband:** as als stippellijn, startknoop op 30% opaciteit, **hermeting-knoop wél zichtbaar** (hol, 35%) zonder datum. Labels `START` / `HERMETING` zonder waarden. Scrubber disabled. Caption: "Nog geen cyclus — Zodra je eerste check binnen is, begint deze band te lopen." | **Alles verborgen** behalve hero + spookband. Geen domeinlijst, geen contrast-beat, geen meetreeks, geen Verder kijken, **geen premium-CTA** — iemand zonder check krijgt geen upsell. |

### De nul-staat is vandaag een gat

`EMPTY_SECTIONS = ["vitalityScore"]` in `Dashboard.tsx:3479` filtert de Voortgang-secties tot een lege lijst: zonder check rendert de tab **geen enkele sectie**, alleen de `emptyHint`. Dat is een leeg scherm met één zin.

**De fix is één regel:** `voortgangHub` toevoegen aan `EMPTY_SECTIONS`, en `VoortgangHub` een `empty`-tak geven. Dat is de énige aanraking van het bevroren `Dashboard.tsx` die ik voorstel — geen herstructurering, één constante. De winst is groot: de spookband met een zichtbare hermeting-knoop maakt vanaf dag nul duidelijk waar dit scherm voor is, en zet de intake-CTA op de plek waar hij verdiend is.

---

## J. SUBSCHERM-CONTRACT

| Scherm | Blijft apart? | Deeplink | Doorstap |
|---|---|---|---|
| **Statistieken** | **Ja.** Verdict-SSOT + stepped care + Leefstijllijn is een eigen leesbeweging, geen scroll-sectie. | `?screen=statistieken` | Rij 1 in Verder kijken: *"Wat je metingen zeggen over supplementen"* |
| **Favorieten** | **Ja.** Keuze-oppervlak, ander werkwoord dan bewijs lezen. | `?screen=favorieten` | Rij 2: *"Je eigen keuzes en onze aanraders"* |
| **Jouw inzichten** | **Ja** — de grote `VitalityGauge` hoort niet op de hub (totaalcijfer, KOAG). | `?screen=inzichten` | **Twee ingangen:** rij 3 in Verder kijken, én de staartlink van de contrast-beat (*"Je vitaliteit in één beeld →"*). Dat is de natuurlijke doorstap: wie de per-domein-richting gelezen heeft, wil het totaalbeeld. |
| **Lichaamssamenstelling** | **Ja**, blijft premium-slot. | `?screen=lichaamssamenstelling` | Binnenkort-groep, terracotta pill "Binnenkort in te vullen" |

**Wordt sectie in de scroll:** niets van de vier. Wat wél naar de scroll verhuist is de *route* uit het verwijderde focuspaneel (→ contrast-beat) en de reis-strip (→ flagship-as).

**Hoe de doorstap eruitziet nu HubCards niet meer de hoofdmoot zijn.** Drie rijen van 56px, haarlijn ertussen, `titel` 14.5px + `wat je krijgt` 12.5px + chevron. Geen kaartvlak, geen iconen. Daaronder een `--divider-strong` en de groep **Binnenkort** met twee rijen die alleen een status tonen. Totaal ~420px in plaats van ~700px aan kaarten.

`?screen=`-sync, terugknop-hiërarchie en `dashboard_voortgang_terug {from}` blijven ongewijzigd.

---

## K. HTML-PREBUILD

**Bestand:** `docs/design/voortgang-bewijsband-prebuild-2026-07.html` — 1211 regels, 54 kB, standalone. Openen met een dubbelklik.
**Deeplinks:** `#beantwoord` (default) · `#opbouwend` · `#dun` · `#wachtend` · `#nul`.

### Sectievolgorde in de HTML

1. Review-chrome — state-schakelaar (5 knoppen, 44px) + regel die het auto-vurende `dashboard_voortgang_bewijs_state` toont
2. `<section class="hero">` — eyebrow → h1 → bewijsregel → CTA-rij → reassurance → **Bewijsband** (SVG + scrubber + caption + voetregel + noot + legenda)
3. `<section id="sec-domeinen">` — `CockpitTile`, dekkingsregel, 5 interventiedomeinen + scheidslijn "Volgt uit de rest" + 2 readout-domeinen
4. `<section class="beat">` — het lichte vlak: kop → lede → route (3 of 2 stops) → link naar Inzichten → Future You-citaat → voetnoot
5. `<section id="sec-meetreeks">` — logregels + "Eén meting. Je hermeting maakt er twee."
6. `<section id="sec-verder">` — 3 routerijen + groep Binnenkort (lichaamssamenstelling + wearable)
7. `<section id="sec-premium">` — terracotta afsluiting
8. Toast — toont bij elke klik welk event zou vuren, met laag (`GA4` / `GA4 (nieuw)` / `durable (bestaat al)`) en payload

### Gebruikte mockvelden

Eén object `MOCK` bovenaan het script, veldnamen 1:1 met `src/types/dashboard.ts`:

```
empty · remeasure{dueDate,daysUntil} · cycleEvidence{activeDays,cycleDay,
daysUntilRemeasure,cycleStartDate,cycleEndDate,activeDayNumbers*} ·
domainCheckDaysAgo · deltaReport(null, elders eigenaar) ·
supplementVerdicts([], elders eigenaar) · model{date,priority,vitality,
scores,trend,history}
```

Waarden voor een man op dag 12: `cycleDay 12`, `activeDays 8`, `daysUntil 18`, cyclus 16 jul → 14 aug, `domainCheckDaysAgo {slaap:4, voeding:9}`, `trend.slaap [38,47]`, `trend.voeding [58,55]`, vijf pijlers met één meting. `model.vitality 51` staat er wél in maar wordt **nergens gerenderd** — dat maakt zichtbaar dat het totaalcijfer op `?screen=inzichten` hoort.

Verder geport uit de code: `buildVoortgangBewijsRegel()` letterlijk, `getScoreBandShortLabel`-drempels (40/65), de vijf `VITALITY_BANDS`, de zeven pijlerkleuren, `isInterventionDomain`/`isReadoutDomain`, en `buildCoverageLine()`.

### Drie plekken waar de prebuild bewust afwijkt van de code van vandaag

1. **`cycleEvidence.activeDayNumbers` bestaat nog niet.** De prebuild toont het Golf 1-beeld met dagmerken. In het script staat het veld onder een `// VEREIST NIEUW (Golf 1)`-commentaar. Golf 0 rendert in plaats daarvan alleen de teller op de vandaag-marker; de rest van de band is identiek.
2. **De reis-strip bestaat niet meer als los blok.** `VoortgangReisStrip` rendert vandaag een 5-koloms grid boven de domeinring; in de prebuild is diezelfde check → nu → hermeting de as van de flagship.
3. **Het focuspaneel ontbreekt.** `VoortgangKompasPanels`/`KompasVoortgangFocusBlock` staat vandaag als vierde blok op de hub; in de prebuild is de route ervan de contrast-beat geworden en zijn de pill, de picker en de explainer-regel op Kompas achtergebleven.

Kleinere bewuste correcties: de dekkingsregel kapitaliseert de eerste ontbrekende domeinnaam (vandaag levert `buildCoverageLine()` "… gemeten. stress, beweging …" op), en de logregel toont `51 · Op gang` in plaats van een kaal cijfer — een bandlabel naast het getal is KOAG-vriendelijker.

### Contract-check

✅ self-contained · ✅ DM Serif Display + DM Sans via Google Fonts mét system-fallback · ✅ JS alleen voor flagship-interactie en state-wissel, geen framework · ✅ tokens als CSS custom properties op `:root` met de `globals.css`-namen · ✅ 375px-first + `@media (min-width:1024px)` · ✅ geen horizontale scroll op 375 · ✅ alle secties uit D/E/F in volgorde · ✅ mockdata met echte veldnamen bovenaan het script · ✅ schakelaar over 4 states + nul · ✅ wearable en lichaamssamenstelling uitsluitend als "binnenkort" · ✅ CTA's klikbaar met event-toast · ✅ echte `<button>`s, `role="img"` + `aria-label` op de flagship-SVG, `aria-valuetext` op de scrubber, `aria-live` op de caption, `aria-pressed` op de state-knoppen, raakdoelen ≥44px
❌ géén tweede score · ❌ géén percentagebalk · ❌ géén streak of badge · ❌ géén verzonnen velden buiten de gemarkeerde `activeDayNumbers` · ❌ terracotta uitsluitend op premium/binnenkort · ❌ geen React/JSX/Tailwind-CDN/chartlib

**Geverifieerd:** JS syntax-check (`node --check`) schoon; alle vijf states gerenderd in headless Chrome op 375×900 en 1440×900; state-overlays muteren `MOCK` niet; geen `var(--…)` in SVG-presentatieattributen (die worden niet overal betrouwbaar geresolved — de flagship tekent met een JS-spiegel van de tokens).

---

## L. BOUWGOLVEN

### Golf 0 — "Het scherm krijgt een hoofd" *(bestaande data, bestaande events, geen schema, geen loader)*

**Doel:** van zes gelijke tegels naar één hero met één flagship.
**User-visible winst:** binnen drie seconden weet je waar je in je cyclus staat, wanneer je hermeting is, en of er al iets te lezen valt.
**Bevat:** hero-vlak + serif-kop boven de gelockte bewijsregel · Bewijsband met echte as (`cycleStartDate` → `cycleDay` → `remeasure.dueDate`) en gedateerde meetruiten uit `domainCheckDaysAgo`; adherence als teller op de vandaag-marker · reis-strip opgeheven in de as · focuspaneel van Voortgang af, route naar de contrast-beat · HubCards → lijst · nul-staat gedicht.
**Afhankelijkheden:** één regel in `Dashboard.tsx` (`EMPTY_SECTIONS`). Verder niets.
**Acceptatie:** (1) alle vijf states renderen zonder lege sectielijst; (2) `dashboard_voortgang_bewijs_state` vuurt ongewijzigd; (3) `voortgang-bewijs-copy.test.ts` groen zonder wijziging; (4) geen horizontale scroll op 375; (5) `KompasVoortgangFocusBlock` komt niet meer voor in de Voortgang-boom.

**Waarom nu, niet na het cohort.** Dit is P1 — "één lus kogelvrij" — geen P3-polijstwerk. De lus is Vandaag → Voortgang → Hermeting, en Voortgang is de schakel die bepaalt of iemand op dag 30 terugkomt. Het cohort van 20-50 mannen landt op dít scherm; als het daar leest als een statuspagina zonder datum, meet je in P2 de verkeerde dingen. Golf 0 raakt geen schema, geen loader en geen durable event — het risico is bijna nul en de meetbaarheid is direct.

### Golf 1 — "De band wordt precies" *(loader-only, nog steeds geen schema)*

**Doel:** de merken op de band kloppen per dag en per bron.
**Winst:** je ziet wélke dagen je pakte, en waar elk meetpunt vandaan komt.
**Bevat:** `VEREIST NIEUW: cycleEvidence.activeDayNumbers` uit `daily_action_log` · `VEREIST NIEUW: model.seriesSources` (bron per punt; `series[pillar][i].source` bestaat al, `trend` gooit het weg) · `movementRcvFeel`, `nutritionIntake`, `sleepCheckinFocus`, `hasStressCheckin` als extra meetruiten · `trendBaselines` → bronlabel bij de startwaarde in de contrast-beat via het bestaande `baselineSourceLabel()`.
**Afhankelijkheden:** Golf 0 gemerged; wijzigingen in `src/lib/account-dashboard.ts` en `src/types/dashboard.ts`.
**Acceptatie:** (1) `activeDayNumbers.length === activeDays` in alle testfixtures; (2) elke ruit heeft een bron; (3) geen extra query; (4) band rendert identiek als het veld ontbreekt (graceful).

**Waarom pas hierna.** Het is een loaderwijziging aan de warmste code van het dashboard. Die doe je niet in dezelfde PR als een visuele herstructurering.

### Golf 2 — "De derde meetlat" *(ná het cohort)*

**Doel:** evidence (minuten/sessies) krijgt zijn eigen rij.
**Winst:** beweging wordt zichtbaar als geleverd werk, naast gedrag en beleving.
**Bevat:** `VEREIST NIEUW: movementSessions` uit `movement_session_log` als derde rij onder de adherence-rij · `movementRecoveryTrend` als lichte achtergrondlijn.
**Afhankelijkheden:** Golf 1; cohortdata over of de band überhaupt gescrubd wordt (`dashboard_voortgang_band_scrub`).
**Acceptatie:** (1) drie rijen blijven visueel gescheiden op 375; (2) geen enkele rij wordt met een andere opgeteld; (3) de rij verdwijnt volledig als er geen sessies zijn.

**Waarom ná het cohort.** Het is de duurste toevoeging en de enige die een tabel raakt die vandaag niet in `DashboardData` zit. Bouw hem als het scrub-event laat zien dat mannen de band daadwerkelijk gebruiken.

### Golf 3 — "Verdieping" *(freeze-adjacent)*

Personalisatie van het Future You-citaat per domein en cyclusfase · wearable-slot van "binnenkort" naar echt · premium-statistieken. **Alles wacht op de roadmap-freeze en op cohortsignaal.** Niets hiervan is nodig om de lus te sluiten.

---

## M. EERSTE CURSOR-BOUWPAKKET (Golf 0)

### Bestanden, in deze volgorde

1. **`src/lib/voortgang-bewijsband.ts`** *(nieuw, puur)* — as-wiskunde (`dayToDate`, `xOf`, `measurementsOf`) + `buildBandCaption()`. Geen React, geen I/O.
2. **`src/lib/__tests__/voortgang-bewijsband.test.ts`** *(nieuw)* — captions voor verleden/vandaag/toekomst/hermeting, ontbrekende `cycleEvidence`, `empty`.
3. **`src/components/dashboard/voortgang/VoortgangBewijsband.tsx`** *(nieuw)* — de SVG + scrubber + caption. `"use client"`.
4. **`src/components/dashboard/voortgang/VoortgangHero.tsx`** *(nieuw)* — vlak, eyebrow, serif-kop, `VoortgangBewijsRegel` als kind, CTA-rij, reassurance.
5. **`src/components/dashboard/voortgang/VoortgangRichtingBeat.tsx`** *(nieuw)* — het lichte vlak. Scoped token-override, géén ad-hoc kleuren.
6. **`src/components/dashboard/voortgang/VoortgangRouteList.tsx`** *(nieuw)* — vervangt de drie `HubCard`s + de Binnenkort-groep.
7. **`src/components/dashboard/voortgang/VoortgangHubScroll.tsx`** *(nieuw)* — componeert secties 1-6. Houdt de screen-router in `VoortgangHub.tsx` dun; hier landt alle nieuwe compositie zodat dat bestand niet verder groeit.
8. **`src/components/dashboard/VoortgangHub.tsx`** *(edit)* — hub-tak vervangen door `<VoortgangHubScroll/>`; `VoortgangReisStrip` en `VoortgangKompasPanels` verwijderen uit de hub-render; `empty`-tak toevoegen.
9. **`src/app/globals.css`** *(edit)* — `.ps-dash-beat` token-blok voor het lichte vlak (`--text`, `--text-muted`, `--divider`, `--sage-ink`).
10. **`src/components/dashboard/Dashboard.tsx`** *(edit — exact één regel)* — `EMPTY_SECTIONS` uitbreiden met `"voortgangHub"`. **Geen andere wijziging in dit bestand.**

### Vijf acceptatiecriteria

1. **Geen horizontale scroll op 375px** in alle vijf states; de band schaalt op `width:100%` uit een vaste viewBox.
2. **`voortgang-bewijs-copy.ts` en zijn test zijn byte-identiek** en `buildVoortgangBewijsRegel()` is de enige bron van de bewijszin.
3. **`dashboard_voortgang_bewijs_state`, `_domein_click`, `_hub_click` en `_terug` vuren met dezelfde namen en parameters als vandaag**; het enige nieuwe event is `dashboard_voortgang_band_scrub {zone}`, GA4-only, gedebounced.
4. **Zonder check rendert de tab hero + spookband met een zichtbare hermeting-knoop** — niet een lege pagina met één zin.
5. **`KompasVoortgangFocusBlock` komt nergens meer voor onder `?tab=voortgang`**, en Kompas is ongewijzigd (visuele diff op `?tab=vandaag` is leeg).

Plus de vaste poort: `npx tsc --noEmit` + `vitest` + `eslint --max-warnings 0`, en `grep -rn "console.log" src/` leeg.

### Niet aanraken

- **`src/lib/voortgang-bewijs-copy.ts`** en **`src/lib/__tests__/voortgang-bewijs-copy.test.ts`** — de vier states en hun copy-regels liggen vast.
- **`src/components/dashboard/Dashboard.tsx`** — bevroren, 4085 regels. Uitzondering: de ene `EMPTY_SECTIONS`-regel. Niet herstructureren, niet opsplitsen, niet "even opruimen".
- **`src/components/dashboard/kompas/KompasHomeCard.tsx`** en **`KompasVoortgangFocusBlock`** — Kompas houdt het paneel ongewijzigd.
- **`StatistiekenAdviesSection`, `LeefstijllijnSection`, `FavorietenKeuzeSection`, `FavorietenAanraderSection`** — subschermen blijven zoals ze zijn.
- **De Hermeting-tab en `deltaReport`** — niet lezen, niet tonen, niet linken behalve als CTA-bestemming.
- **`CockpitTile`** — hergebruiken, niet aanpassen; de nieuwe secties gebruiken hem waar een kaart verdiend is.
- **`src/lib/events.ts`, `account-events-client.ts`, `CLIENT_EMIT_TYPES`** — geen nieuw durable event in Golf 0.
- **`VoortgangReisStrip.tsx`** — bestand blijft staan (Hermeting kan hem nog willen), alleen de aanroep uit de hub verdwijnt.

---

## N. BEWUST NIET

| Overwogen | Waarom niet |
|---|---|
| Radar/spinnenweb over 7 pijlers | De oppervlakte ís een samengestelde index — verkapte totaalscore, ook zonder getal. |
| Levenslijn-slider met twee scenario's | Vereist een voorspelling; dat is een tweede cijfer in grafiekvorm. |
| Bewijs-meter of "dossiersterkte" 0-100 | Precies de tweede score die invariant 1 verbiedt. |
| Adherence als voortgangsbalk naar 30 dagen | Adherence is geen prestatie en mag er niet als score uitzien. |
| 18 lege dagvakjes in de toekomstzone | Maakt van de runway een te vullen balk en nodigt uit tot een percentage. |
| `to_day` meesturen in het scrub-event | Dagniveau + `active_days` is triangulatie richting gezondheidscontext. `zone` volstaat. |
| Streak-tegel / badge-tegel uit `MovementDashboardPreview` | Expliciet uitgesloten verzinsel; schuld-mechaniek. |
| "Future You Score" | Idem — Future You is copy en richting, nooit een cijfer. |
| `deltaReport` naar Voortgang halen | Eigendom van Hermeting; Voortgang zou een tweede cyclusrapport worden. |
| De grote `VitalityGauge` op de hub | Totaalcijfer als hero = KOAG-risico; hij heeft al een huis op `?screen=inzichten`. |
| Statistieken/Favorieten/Inzichten als scroll-secties | Andere leesbeweging, en het zou de hub weer een verzamelbak maken. |
| Supplement-innamelog | Data bestaat niet, AVG art. 9-gevoelig, bij N=2 geen betrouwbaar antwoord. |
| Extra check-off op Voortgang | Eén check-off in de hele app, en die staat op Mijn Dag. |
| Terracotta als hoofdaccent | Marketing-accent; het dashboard is sage. Terracotta blijft premium/binnenkort. |
| `VoortgangHub.tsx` volledig opsplitsen in vijf bestanden | Verleidelijk bij 1074 regels, maar het is niet de opdracht en het maakt de PR onreviewbaar. `VoortgangHubScroll` neemt de nieuwe compositie op zodat het bestand niet verder groeit. |
| Nieuw durable event voor bewijs-interacties | Roadmap-freeze; GA4 is goedkoop en beantwoordt de vraag. |

---

## KRITIEKRONDE — en wat ik erop veranderde

### 1. Gedragswetenschapper

- **"Tijd die verstrijkt is geen bewijs van jouw handelen."** Een tijdas vult zich vanzelf; dat verwart voortgang met verloop.
- **"Een lege toekomstzone wekt anticipatieangst, geen agency."** Achttien dagen leegte is een schuldvlak.
- **"Het scherm opent op de leegte in plaats van op je laatste daad."**

**Doorgevoerd:** de adherence-rij heet *"Dag waarop je iets pakte"* en inactieve dagen worden getekend als **afwezig** (haarlijntje van 5px), nooit als rode of open vakjes. De caption bij een lege dag is *"Geen log op deze dag"* — feit, geen verwijt. En: de **meest recente meting krijgt een ring**, en de altijd-zichtbare voetregel noemt hem bij naam (*"Laatste meting: slaap, 4 dagen geleden"*), zodat het scherm opent op iets dat jij gedaan hebt.
*Gewijzigd t.o.v. v1: de voetregel bestond niet; die noemde alleen de resterende dagen.*

### 2. 45-jarige gebruiker, dag 12, drukke week

- **"Ik zie een grafiek en moet er iets mee doen om te snappen wat er staat."**
- **"'Dag 12' — is dat goed of slecht? Ik wil niet nadenken."**
- **"Twee knoppen, welke is de mijne?"**

**Doorgevoerd:** de kop is nu een **volledige zin die het antwoord geeft** ("Er zit beweging in.") in plaats van een label, en de voetregel geeft de hele boodschap **zonder één interactie**: hoeveel dagen tot de hermeting, op welke datum, en wat je het laatst mat. De scrubber is winst, geen voorwaarde. De CTA-rij is teruggebracht tot één gevulde pill + één tekstlink; de ghost-knop verschijnt alleen bij ≤14 dagen, wanneer hermeting primair wordt.
*Gewijzigd t.o.v. v1: v1 had drie gelijkwaardige knoppen en een kop van twee woorden ("Je bewijs").*

### 3. Compliance (KOAG / AVG art. 9)

- **"Acht merken op een as van dertig is 27%."** Verkapte totaalscore.
- **"`band_scrub` met `to_day` naast `active_days` in het state-event is triangulatie richting gezondheidsgedrag."**
- **"'Er zit beweging in' bovenop een zin over actieve dagen suggereert oorzakelijkheid."**

**Doorgevoerd:** de toekomstzone is **één stippel-haarlijn naar een datum**, geen achttien lege vakjes — er valt niets te vullen, dus er valt geen breuk te lezen. **Het getal 30 komt nergens in de copy voor**; de enige noemer is `cycleDay`, exact zoals de gelockte zin die al gebruikt. Het scrub-event verstuurt **alleen `zone`** (drie enums), geen dagnummer. En de kop claimt **beweging, niet verbetering en niet oorzaak** — hij werkt bij een positieve én negatieve delta, en er staat geen causaal voegwoord tussen de kop en de bewijsregel. De expliciete noot *"Merken en metingen staan op aparte rijen — ze worden nooit één cijfer"* staat onder de band.
*Gewijzigd t.o.v. v1: v1 tekende 30 dagvakjes met de toekomst als lege slots, en stuurde `{to_day, zone}` mee.*

### 4. Frontend-ontwikkelaar

- **"`VoortgangHub.tsx` is 1074 regels met vijf schermen; hier komt een hero en een SVG-flagship bij."**
- **"Een licht vlak binnen `.ps-dash` betekent overal kleuren overschrijven — dat lekt."**
- **"`Dashboard.tsx` is bevroren, maar de nul-staat zit dáár."**

**Doorgevoerd:** alle as-wiskunde en captionlogica gaat naar **`src/lib/voortgang-bewijsband.ts`** met eigen tests — de component tekent alleen. De compositie van de zes secties landt in **`VoortgangHubScroll.tsx`**, zodat de screen-router in `VoortgangHub.tsx` dun blijft en dat bestand niet verder groeit. Het lichte vlak krijgt een **scoped token-blok `.ps-dash-beat`** in `globals.css` dat `--text`, `--text-muted`, `--divider` en `--sage-ink` herdefinieert; nul ad-hoc hexwaarden in JSX. En de nul-staat wordt **één regel** in `Dashboard.tsx` — `EMPTY_SECTIONS` uitbreiden — expliciet benoemd als de enige sanctie-aanraking van het bevroren bestand.
*Gewijzigd t.o.v. v1: v1 zette de bandlogica in de component en had geen antwoord op `EMPTY_SECTIONS` behalve "Dashboard.tsx aanpassen".*

### Ook gewijzigd tijdens de bouw van de prebuild

- De route in de contrast-beat liep eerst op een 0-100-schaal; drie pins op 38/47/65% met labels in een 3-koloms grid liepen zichtbaar uit elkaar. Nu loopt de schaal van **jouw startwaarde tot de volgende bandgrens**, staan de labels op hun pin, en **vervalt de startstop bij één meting** (met een aangepaste kop en lede) in plaats van "start 47 / nu 47" naast elkaar te zetten.
- De nul-staat tekende aanvankelijk nog dagmerken en een vandaag-marker, omdat `cycleEvidence` in de mock bleef bestaan. De band leest nu op `empty` en niet op de aanwezigheid van `cycleEvidence`, en de premium-CTA is in de nul-staat verborgen.
