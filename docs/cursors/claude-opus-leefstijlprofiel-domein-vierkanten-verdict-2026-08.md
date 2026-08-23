# Opus-verdict — het leefstijlprofiel-domein als zes delen

> **Datum:** 23 augustus 2026 · besluitronde, geen bouwronde.
> **Getoetst tegen:** de werkkopie op schijf — `630bcbb8` + 19 ongecommitte paden (`git status --short`).
> **Prebuild:** [`docs/design/leefstijlprofiel-domein-delen-prebuild-2026-08.html`](../design/leefstijlprofiel-domein-delen-prebuild-2026-08.html)
> **Geen kop `PIVOT`.** Lock 7 blijft heel — zie §A.

---

## 0a. Aannames (S1–S4 en lock 1–3 zijn niet meegekomen)

De kop van de prompt ontbrak. Ik heb niet teruggevraagd. Vier stellingen en drie locks zijn hieronder
teruggelezen uit de MAG/MAG-NIET-lijst en de sectiebriefs; waar een aanname dragend is voor een
aanbeveling staat hij hier, niet verstopt in de tekst.

| # | Teruggelezen als | Waar ik het uit haal |
|---|---|---|
| S1 | De ladder(s) op dit scherm zijn er één te veel; wat de kop stuurt moet weg | §A-brief + MAG-punt 1 en 2 |
| S2 | Het domeinscherm wordt een raster van zes vierkanten als first view | §D-brief + prebuild-eis 7 |
| S3 | Elke subcategorie draagt zijn eigen meetlink | §E-brief |
| S4 | Het domein krijgt zijn plek in de 30-dagen-cyclus, zonder tweede bewijsband | §F-brief |
| lock 1 | Rolverdeling deur · schap · onderbouwing blijft staan | project-canon, niet uit de prompt |
| lock 2 | Eén vraag per surface | §B-brief ("als jouw vorm de scheiding niet scherper maakt dan live, is B onvoldoende") |
| lock 3 | Dit scherm is de leesplek — niet de dagtaak, geen tweede Kompas | de zichtbare staart van lock 3 |

**Eén aanname draagt echt.** Ik lees lock 3 als *"geen tweede Kompas"*, niet als *"geen raster"*. Dat verschil
bepaalt of §D een vorm mag voorstellen die op Kompas ook bestaat. Klopt die lezing niet, dan valt §D
en blijven §C, §E, §F, §G en §J overeind — die hangen aan de celinhoud, niet aan de celvorm.

## 0b. Afwijkingen tussen prompt en code

De prompt beschrijft `fa1406c3`. Op schijf staat `630bcbb8` + ongecommit werk. Vijf plekken lopen uiteen.
Ik werk verder met wat er staat.

| # | Prompt zegt | Code zegt | Gevolg |
|---|---|---|---|
| 1 | `DomainLifestyleLadder` staat in de "Je stand"-tegel (r. 379) | Niet geïmporteerd. Enige laddertreffer in [`LeefstijlprofielDomeinScherm.tsx:14`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx) + render op `:438` | De "twee ladders"-vraag uit §A is al beantwoord door de code — zie §A |
| 2 | `variant="explain"` bestaat niet | [`PrioriteitenLadder.tsx:81`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx) `variant?: "choose" \| "explain"`, gelezen op `:120` en `:124` | De save-knop en `LadderMomentButton` staan al níét op dit scherm voor de vier Kompas-domeinen |
| 3 | `scrollIntoView` op r. 226–242 | Komt in het bestand niet voor. Wat er staat is `pickedLayer` → `openLadderLayer` (`:224-225`) → `openLayer` (`:459`) | Er is geen sprong-gedrag om te beoordelen |
| 4 | `activeDayNumbers` | Bestaat niet in `src/` | Losse promptfout, zoals je zelf aangeeft. Raakt dit scherm niet |
| 5 | — (prompt noemt het niet) | `MijnKeuzeSectie` (`:102`, gerenderd `:488`) rendert op `:146` een `FavoriteSaveButton` als verwijderknop | Dit scherm heeft dus tóch een schrijfknop, ook in `explain`-stand — zie §C |

---

## A. Verdict + wat de ladder(s) nu doen

> **Totaaloordeel.** De richting klopt en het probleem is echt, maar het is een ander probleem dan de prompt
> denkt. Er staan geen twee ladders meer. Er staat één ladder die zes lagen kan tonen en voor drie van de vijf
> domeinen zijn eigen staten niet doorgeeft — terwijl `resolveDomainLadderReadout` ze al berekent en Kompas
> ze al toont. Het gat is dus geen vorm-gat maar een bedradings-gat, en het raster is de aanleiding om het te
> dichten, niet de oplossing zelf.

| # | Stelling (teruggelezen) | Verdict |
|---|---|---|
| S1 | Ladder weg van dit scherm | **GO — deels al gebeurd** |
| S2 | Raster van zes vierkanten als first view | **REFINE** |
| S3 | Meetlink per subcategorie | **GO** |
| S4 | Cyclus-anker in het domein | **GO** |

**PIVOT op lock 7 — nee.** Lock 7 zegt: verzin geen data, voeding zonder laag-staten blijft zonder oordeel.
Het voorstel raakt hem op één punt en houdt hem heel: de cel laat de staat-sleuf **weg** waar
`resolveDomainLadderReadout` `null` teruggeeft, in plaats van er zesmaal "nog niet beoordeeld" te zetten.
Zes keer hetzelfde niet-antwoord is nadrukkelijker dan één keer, en nadruk op leegte is de zachte vorm van
verzinnen. De zin staat één keer, in het anker (§I). Geen schade.

### Wat de ladder nu doet — en of hij bestaansrecht houdt

De kop-ladder bestaat niet meer; de vraag "houdt hij bestaansrecht na de zijbalk-keuzeronde" is door de code
zelf met nee beantwoord. Wat overleeft is `PrioriteitenLadder` in `explain`-stand (`:438-467`). Die doet vier
dingen, en drie ervan zijn elders beter belegd:

1. **Zes laagnamen + subtitel tonen.** Blijft nodig. Dit is de enige plek waar de zes namen *als geheel* leesbaar zijn.
2. **Staat per laag tonen.** Werkt alleen bij beweging. `layerStates` hangt aan `movementReadout` (`:445`),
   `stateLabels` idem (`:446`), `whyWait` idem (`:449`), `recommendedLayerIds` idem (`:455`). Slaap heeft zijn
   staten in `sleepCheckinSnapshot.layerStates`, stress in `resolveStressLayerStates` — beide worden op dit
   scherm niet gelezen, terwijl [`DomainKompasScreen.tsx:63`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)
   ze via één aanroep wél heeft. Dat is de scherpste bevinding van deze ronde.
3. **Openen/sluiten van een laag.** De accordion-toestand is nu extern gestuurd (`openLayer`/`onOpenLayerChange`,
   `:459-462`) terwijl er geen tweede navigator meer is die hem stuurt. `pickedLayer` bestaat nog uitsluitend
   om de "Terug daarheen"-regel op `:469-484` te voeden. Dat is een besturingsmechanisme zonder bestuurder.
4. **"Kies dit op Kompas".** Blijft nodig. Dit is de deur.

De ladder mist bovendien precies wat dit scherm zou moeten dragen: **hij toont geen enkel meetfeit.**
`evidenceByLayer` bestaat sinds 20 augustus ([`domain-ladder-readout.ts:64`](../../src/lib/domain-ladder-readout.ts))
en wordt op dit scherm nergens aangeroepen. De feiten staan er wél, maar in twee losse blokken eronder
(`MovementFactReadout` `:398`, `SleepFactReadout` `:423`) die hun laag niet kennen. Zes lagen boven, acht
feiten onder, geen lijn ertussen.

**Overname:** de diagnose (dit scherm leest als een werkplek terwijl het een leesplek is), de eis dat de keuze
zichtbaar is per deel, de eis van een cyclus-anker, en het verbod op afvinken hier.
**Afwijking:** het raster is geen doel maar een gevolg. Ik voer één component in met drie dichtheden die
door de data worden gekozen, niet één raster dat overal hetzelfde is (§D, §G).

---

## B. Job-scheiding

| | **Kompas › domein** | **Leefstijlprofiel › domein** | **Schap** | **Mijn Dag** |
|---|---|---|---|---|
| De ene zin | Waar werk ik nu aan? | Wat staat er onder dit domein, en waar komt dat vandaan? | Wat kan ik hierbij kopen of gebruiken? | Wat doe ik vandaag? |
| First view | Ring + kop + zes klikbare lagen + gratis opties op de gekozen laag | Cyclus-anker + zes delen met staat, meetfeit en keuze | Tabs met producten, diensten, favorieten | Dagblokken |
| Cel-rol | **keuzeknop** (`aria-pressed`, stuurt de rest van het scherm) | **dossierregel** (`aria-expanded`, opent zijn eigen herkomst) | productkaart | agenda-blok |
| Wat er níét staat | geschiedenis, meetfeiten per laag, datum van de check | keuzeknoppen, agenda-knoppen, prijzen, afvinkcirkels | laag-staten | oordelen |
| Component | `DomainLifestyleLadder` + `DomainFreeActionsTile` | **nieuw** `DomeinDelenGrid` | `SchapView` | `AgendaScreen` |

De scheiding wordt scherper dan live, en dat zit niet in de vorm maar in het **werkwoord van de cel**. Op Kompas
kies je met een cel; hier open je met een cel een dossier. Kompas kent geen datum en geen antwoord; dit scherm
kent geen knop die iets wegschrijft. Dat is toetsbaar: na deze ronde schrijft dit scherm nergens meer naar
`account_favorites` of `agenda_blocks` (§C, criterium 4 in §M).

---

## C. Ladder: KILL / REFINE / REPLACE

| Onderdeel | Oordeel | Wat er gebeurt |
|---|---|---|
| `PrioriteitenLadder` op leefstijlprofiel, vier Kompas-domeinen | **REPLACE** | Vervangen door `DomeinDelenGrid`. Alles wat de `explain`-stand droeg komt terug: naam, subtitel, `summary`, staat, `whyWait`, "Kies dit op Kompas" — plus het meetfeit dat hij nooit had |
| `PrioriteitenLadder` op leefstijlprofiel, **verbinding** | **KEEP** | `isDomainKompasDomain` ([`domain-kompas-copy.ts:78-80`](../../src/lib/domain-kompas-copy.ts)) dekt beweging, slaap, voeding, stress — verbinding niet. Daar is deze ladder de werkplek (`variant="choose"`), omdat Kompas-verbinding nog een prebuild-iframe is die niets kan opslaan. Niet aanraken |
| `PrioriteitenLadder` als component | **KEEP** | Blijft bestaan voor verbinding. Twee props worden dood: `openLayer` / `onOpenLayerChange` (`:88-89` in de props-type). Golf 1-opruiming, niet golf 0 |
| `DomainLifestyleLadder` op leefstijlprofiel | **al KILL** | Bestaat niet meer op dit scherm (afwijking 1) |
| `DomainLifestyleLadder` op Kompas | **KEEP, ongewijzigd** | Buiten scope |
| `openLayer`-koppeling + `pickedLayer` (`:224-225`, `:459-462`) | **KILL** | Het raster houdt zijn eigen open-cel bij. De "Terug daarheen"-regel (`:469-484`) verhuist mee: hij wordt de voetregel van het raster, niet van de ladder |
| `FavoriteSaveButton` binnen dit scherm | **KILL** | Staat nu nog in `MijnKeuzeSectie` (`:151`) als verwijderknop. Verwijderen: het is de enige schrijfactie die dit scherm nog heeft, en hij hoort op het schap waar je hem ook aanzette |
| `LadderMomentButton` | **al afwezig** | Alleen in `choose`-stand. Blijft weg |
| "Kies dit op Kompas" | **KEEP** | Verhuist naar de lade, één per deel |
| `MijnKeuzeSectie` (`:102-166`) | **KILL** | De cellen dragen de keuze per laag. Het archief landt in de cellen + het schap — geen derde dump |
| `KompasDomainGauge` in "Je stand" (`:334`) | **REPLACE** | Zelfde ring als `DomainKompasHead`. Wordt een stille stand-regel: bandwoord + `DeltaBadge` + `Sparkline` + `baselineSourceLabel`. De sparkline blijft: geschiedenis is het enige dat Kompas níét heeft |
| `LadderCoverageMeter` (`:361`) | **KILL** | "2 van 3 gemeten lagen staan" is een samenvatting van iets dat het raster nu voluit toont. Zijn beste zin blijft — *"Dit getal beweegt bij je hermeting, niet bij wat je hier aanklikt"* — verplaatst naar het anker |
| `MovementFactReadout` (`:398`) / `SleepFactReadout` (`:423`) | **KILL van dit scherm** | Landingsplek verplicht en aanwezig: elke feitenrij staat in de lade van zijn eigen laag, mét `benchmarkLabel`, `status`-badge, `whyLine` én `footnote`. De lade toont per rij strikt méér dan deze blokken deden — ze krijgen er hun laagcontext bij |
| `MovementCheckinReadout` / `SleepCheckinReadout` (`:379`, `:406`) | **KEEP** | Dat is de domein-conclusie plus `delta` en `startLine` — niet per laag geschreven, dus geen doublure met de cellen |
| Eyebrow *"Zelfde blok als op je check-in resultaat"* (`:373-377`) | **KILL** | Wordt onwaar zodra de feitenrijen eronder weg zijn |

**Waar het archief landt.** Keuzes mét laag → hun cel. Keuzes zonder laag (`parseLadderFavoriteLayer` geeft
`null`, bv. legacy `actie-…`-ids) → één voetregel onder het raster die ze noemt en naar het schap wijst waar
dat bestaat. Voor stress en verbinding bestaat geen schap ([`schap-availability.ts:22`](../../src/lib/schap-availability.ts));
daar is die voetregel hun enige huis en noemt hij ze voluit. Dat is één blok, conditioneel, geen derde dump.

---

## D. Vorm van de delen

### De keuze: 2×3 op 375px, en drie dichtheden

Twee kolommen, drie rijen, leesvolgorde links→rechts→beneden, zodat P1→P6 blijft staan. `351px` bruikbare
breedte bij `padding:12px` → cel van `171px`. Dat draagt een naam van twee regels, een staatwoord, een
meetfeit van twee regels en één keuze-chip. Zes cellen onder elkaar zou ~560px kosten en het anker uit beeld
duwen; 2×3 kost ~320px en laat anker én raster binnen de eerste 600px vallen.

**Geen verplichte `P{n}` in beeld.** Een monospace "P2" naast een naam leest als een veldnaam. Het nummer zit in
`aria-label` ("Prioriteit 2. Kracht + basisconditie. Grootste winst. Kracht: 1× per week. 1 gekozen.") en in
`data-layer`, precies zoals beide live-ladders dat al doen.

**De dichtheid volgt de data, niet het scherm.** Dit is de refine op S2 en het antwoord op tegenspraak 2 (§N):

| Dichtheid | Wanneer | Cel bevat |
|---|---|---|
| **vol** | `readout != null` én ≥2 lagen met een feitenrij | naam · staat · meetfeit · keuzes |
| **staat** | `readout != null`, geen feitenrijen (stress vandaag) | naam · staat · keuzes |
| **naam** | `readout == null` (voeding, verbinding) | naam · keuzes. **Geen staat-sleuf** — de leegte staat één keer in het anker |

Eén component, drie standen. Zes lege vierkanten met zesmaal "nog niet beoordeeld" komen er dus nooit.

### Element voor element, 375px (y vanaf de top van `<main>`)

| y | Element | Copy-intentie |
|---|---|---|
| 16 | Terugknop 38×38 + eyebrow `BEWEGING` | oriëntatie, geen titel |
| 72 | H1 `Wat er onder je beweging staat` | het object benoemen, niet de administratie |
| 116 | Anker: bolletje + één regel + datum | check → nu → hermeting, in één zin |
| 178 | Sectiekop `JE ZES DELEN` + telling rechts | de belofte van het raster, en meteen de eerlijkheid ervan |
| 200 | Rij 1: cel P1, cel P2 | |
| 304 | Rij 2: cel P3, cel P4 | |
| 408 | Rij 3: cel P5, cel P6 | |
| — | Lade: volle breedte, direct onder de rij van de aangetikte cel | |
| +12 | Voetregel losse keuzes (conditioneel) | |
| +22 | `DomainRouteStrip` | |
| +16 | Schap-deur, label-only | |

Anker (y=116) en de eerste twee rijen (tot y≈408) vallen ruim binnen 600px. Het instrument staat boven de vouw.

### Cel, element voor element

1. **Naam** — 13px/600, max twee regels, `text-wrap:balance`. Nooit afgekapt.
2. **Staat** — SVG-vorm (▲ gevuld = winst · ● = op orde · ◐ = houd in de gaten · ○ gestippeld = nog niet nu)
   + het woord uit `MOVEMENT_LAYER_STATE_LABEL` / `SLEEP_LAYER_STATE_LABEL`, verbatim. Kleur is de derde
   drager, nooit de enige.
3. **Meetfeit** — `label · answerLabel`, 11.5px. Nooit de benchmark: die maakt van de cel een oordeel.
   Precedentie gelijk aan `resolveLadderLayerReason` (`domain-ladder-readout.ts:99-122`): de rij met
   `status === "below"` draagt het beeld, anders de eerste rij.
4. **Keuzes** — mini-tegels, geen teller. Eén chip met de titel, en `+N` als er meer zijn. Nul keuzes = niets;
   "0 gekozen" is ruis.

### Drie soorten cel

- **Lege cel** (P4 bij beweging): naam + `NOG NIET NU` + niets. De lade legt uit waarom, met de `whyWait`-regel.
- **Winst-cel** (P2 bij beweging): terracotta rail + ▲ + `GROOTSTE WINST` + `Kracht · 1× per week` + chip.
- **Gekozen cel** (P1): staat `HOUD IN DE GATEN`, feit `Zitten · 8 tot 10 uur per dag`, chip met de handeling.

### In-cel uitklap of sheet — ik kies de rij-lade

Een in-cel uitklap laat het raster op elke tik verspringen. Een sheet is een tweede oppervlak met eigen
focus-trap en eigen sluitgedrag, en haalt je uit de pagina die je aan het lezen bent. De **rij-lade** — een blok
over de volle breedte, direct onder de rij waar de aangetikte cel in staat — houdt het raster stil, blijft in de
pagina, en landt op 375px binnen één duimscroll. Bij één kolom degradeert hij vanzelf tot een gewone uitklap.
Tikdoel: de hele cel, minimaal 96px hoog. Alles in de lade ≥44px.

**Wat "net als Kompas" honoreert:** de zes lagen in vaste volgorde met hun echte namen; het staatwoord
verbatim uit dezelfde constante; en het feit dat een tik het scherm laat uitleggen in plaats van navigeren.
Wat het níét overneemt: `aria-pressed`, de gratis-optiestegel, en de gedachte dat de cel een keuze is.

---

## E. Meetlink per subcategorie

Alles komt uit één aanroep: `resolveDomainLadderReadout(domain, data)` — het scherm doet zijn eigen
`movementCheckinSnapshot`/`sleepCheckinSnapshot`-takken (`:202-204`) niet meer zelf.

| Sleuf | Bron | Leeg als |
|---|---|---|
| staat | `readout.layerStates[id]` → `readout.stateLabels[state]` | `readout == null` → sleuf vervalt |
| meetfeit | `leadRow(readout.evidenceByLayer[id])` → `label · answerLabel` | laag heeft geen rijen → sleuf vervalt |
| lade-feiten | alle rijen: `label`, `answerLabel`, `benchmarkLabel`, `status`-badge, `whyLine`, `footnote` | idem |
| wacht-reden | `readout.whyWait(id)`, alleen bij `state === "wacht"` | `null` → geen blok |
| keuze | `account_favorites` gefilterd op `parseLadderFavoriteLayer(item.id) === id` | geen keuzes → geen chips |
| bronregel | `CHECK_NAME[domain]` + `data.domainCheckDaysAgo[domain]` | geen check → geen regel |

**Beweging P1 versus P5.** P1 krijgt twee rijen (`zitten`, `mobiliteit` via `MOVEMENT_LAYER_FACT_KEYS`),
dus staat + feit + lade met beide rijen. P5 staat niet in die map en krijgt dus geen enkele rij: de cel toont
staat zonder feit, en de lade toont de `summary` plus `"Marginale winst — pas bovenop een basis die acht weken
staat."` uit `WHY_WAIT[5]`. Geen vulling, geen streepje-placeholder.

**Slaap.** `SleepFactRow` draagt zijn laag zelf (`row.layer`), dus de groepering is gratis: P1 duur, P2 regelmaat,
P3 drie rijen, P5 drie rijen, P4 en P6 leeg. Anders dan beweging is dit geen redactionele toewijzing.

**Stress.** `evidenceByLayer: {}` by design tot T1d (`domain-ladder-readout.ts:235`). Zes cellen met staat,
nul cellen met feit → dichtheid **staat**. Dit is de staat die bewijst dat het raster geen bewijs nodig heeft
om te werken.

**Voeding.** Geen readout → dichtheid **naam**. Zes namen, keuzes waar ze zijn, en één zin in het anker.

**"Vorige meting" bij één check.** De cel zegt nooit "vorige". De cel zegt wat je opgaf; het anker zegt wanneer.
Richting is een domein-eigenschap en woont in de stand-regel (`DeltaBadge` + `Sparkline`) en op de hub-rij —
niet in een cel. **Geen sparkline per laag.** Er is per laag geen tweede meting, dus een lijn zou uit één punt
bestaan; en `buildLeefstijllijnRows` levert per *domein*, niet per laag. Niet VEREIST NIEUW, dus niet bouwen.

---

## F. Roadmap in het domein

**Eén ankerregel, één datum, geen tweede instrument.**

> Zes delen, zoals je beweegcheck van 4 dagen geleden ze achterliet. Je hermeting staat op 12 september — dan verandert dit.

Drie punten in één zin: laatste check (`data.domainCheckDaysAgo[domain]`), nu (impliciet), hermeting
(`data.remeasure.dueDate`). Beide velden zijn live. Geen band, geen scrubber, geen dagteller, geen tweede
score. De hero op de hub houdt de cyclus als *tijdlijn*; hier is hij een **bronvermelding** — daarom staat hij
boven het raster en niet eronder: hij dateert wat je gaat lezen.

Zonder eigen check (verbinding) vervalt het eerste deel en blijft de hermetingsdatum staan. Zonder readout
(voeding) komt er één zin bij, uit lock 7.

**`DomainRouteStrip`: KEEP, ongewijzigd, onderaan.** Hij doet een andere vraag dan het anker — *waar kan ik
heen* tegenover *wanneer is dit gemeten* — en hij is de enige plek waar "Leefstijlcheck opnieuw" als deur
staat. Wel verhuizen naar ná het raster: hij is een menu, geen kop. De vier knopen blijven zoals ze op `:272-284`
staan.

---

## G. Data-eerlijkheidsmatrix

Wat een cel per domein kán vullen. `staat` = `layerStates`, `bewijs` = `evidenceByLayer`, `keuze` =
`account_favorites` met laag-id, `datum` = `domainCheckDaysAgo`.

| Domein | staat | bewijs | keuze | datum | Dichtheid | Sleuven gevuld |
|---|---|---|---|---|---|---|
| **beweging** | ✅ 6/6 | ✅ P1 (2 rijen), P2 (2), P3 (1) — P4·P5·P6 leeg | ✅ | ✅ | vol | 14 van 24 |
| **slaap** | ✅ 6/6 | ✅ P1 (1), P2 (1), P3 (3), P5 (3) — P4·P6 leeg | ✅ | ✅ | vol | 14 van 24 |
| **stress** | ✅ 6/6 | ❌ leeg by design tot T1d | ✅ | ✅ | staat | 12 van 24 |
| **voeding** | ❌ geen readout | ❌ | ✅ | ✅ | naam | 6 van 24 |
| **verbinding** | ❌ | ❌ | ✅ | ❌ geen check-route | naam | 6 van 24 |

**VEREIST NIEUW: niets.** Elk veld hierboven bestaat en wordt al geladen. Wat ontbreekt is de aanroep op dit
scherm. Dat is de hele reden dat dit golf 0 kan zijn (§L).

**`LadderCoverageMeter`: KILL** — zie §C. Zijn getal is de kolom "sleuven gevuld" hierboven, en het raster
toont die kolom nu cel voor cel. Een percentage naast een raster dat hetzelfde voluit zegt, is een tweede,
grovere lezing van dezelfde waarheid — en precies het soort samengesteld getal dat lock 7 niet wil.

---

## H. Conversie + meetpunten

CTA-hiërarchie op het domein, in volgorde van gewicht:

| Rang | CTA | Waar | Wanneer primair |
|---|---|---|---|
| 1 | **Kies dit op Kompas** | in de lade, per deel | altijd wanneer een lade open is — dit is de enige actie die dit scherm bedoelt te veroorzaken |
| 2 | **Leefstijlcheck opnieuw** | `DomainRouteStrip` | wanneer `domainCheckDaysAgo ≥ 14` (`DOMAIN_CHECK_INTERVAL_DAYS`) of `readout == null` |
| 3 | **Mijn Dag** | `DomainRouteStrip` | wanneer er ≥1 keuze in een cel staat |
| 4 | **Open je schap** | voet, label-only | alleen waar `hasSchap(domain)` |

Geen productkaart, geen prijs, geen vergelijkingslink — lock blijft.

**Hergebruikte events (geen registratie nodig, GA4 neemt vrije namen):**

- `${domain}_ladder_layer_open` — vuurt nu bij het openen van een cel, met `{ layer, surface: "leefstijlprofiel_domein", view: "grid" }`. Zelfde naam als de ladder hem al vuurt ([`PrioriteitenLadder.tsx:144`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx)), dus de trechter blijft vergelijkbaar vóór en ná de omzetting; `view` scheidt de twee vormen.
- `voortgang_ladder_kompas_click` — de deur in de lade, ongewijzigd (`:155`).
- `voortgang_route_click` — `DomainRouteStrip`, ongewijzigd.
- `domain_tool.snapshot_viewed` — durable, vuurt al op mount (`:232-236`). `has_conclusion` gaat nu op `readout !== null` in plaats van op de twee snapshot-takken.
- `choice.shelf_opened` — durable, schap-deur, ongewijzigd (`:290`).

**Eén nieuw GA4-event, apart gehouden:**

- `voortgang_domein_grid_viewed` — `{ domain, layers_with_state, layers_with_fact, layers_with_choice }`.
  Vier getallen, geen PII, geen vrije tekst. Dit is de eerlijkheidsmatrix uit §G gemeten in productie: hij zegt
  of het raster in het wild vult zoals hier voorspeld, en dat is precies wat beslist of golf 1 doorgaat.
  Geen durable event: dit is vormonderzoek, geen gedragsfeit.

**Meetpunt:** `beweging_ladder_layer_open` (view=grid) · `voortgang_ladder_kompas_click` · `voortgang_domein_grid_viewed` — hier lees je het effect af.

---

## I. Copy-richting

**Kop van het scherm.** `Leefstijlprofiel · Beweging` (`:322`) leest als een breadcrumb in een beheerscherm.
Vervangen door eyebrow + H1:

- eyebrow: `BEWEGING`
- H1: **Wat er onder je beweging staat**

**Anker** (§F): *"Zes delen, zoals je beweegcheck van 4 dagen geleden ze achterliet. Je hermeting staat op
12 september — dan verandert dit."* Bij `readout == null` komt erachteraan: *"Je voedingscheck beoordeelt
deze delen nog niet apart; wat hier staat is je keuze en de datum."*

**Cel-leegte.** Geen tekst. De afwezige sleuf ís het antwoord. Alleen in de lade een zin:
*"Je beweegcheck beoordeelt dit deel niet apart. Dat is geen tekort — het betekent dat dit deel niet meeweegt
in wat we van je stand kunnen zeggen."*

**Cel-winst.** Het staatwoord verbatim: `GROOTSTE WINST`. Geen uitroep, geen "focus hier", geen kleuraccent
dat harder schreeuwt dan de andere vijf.

**Geen keuze in een cel.** In de lade: *"Hier koos je nog niets. Dat hoeft ook niet — dit deel lezen kost je niets
en verplicht je tot niets."* (behouden uit `PrioriteitenLadder.tsx:292-295`, die zin is al goed).

**Bronregel** onder de feiten in de lade: *"Uit je beweegcheck van 4 dagen geleden."*

**Voetregel losse keuzes:** *"Je koos hier ook 1 ding zonder laag — Wandelmaatje zoeken. Die staat op je schap ›"*

**Sluitregel:** *"Zelfrapportage, geen diagnose. Kiezen doe je op Kompas, afvinken op Mijn Dag."*

WRITING_VOICE: begrip (de zes delen zijn van jou) → urgentie (er staat een datum onder) → actie (één deur per
deel). Geen diagnose-taal, geen tweede persoon in de gebiedende wijs behalve in de deur zelf.

---

## J. Hub-slot + dunne staten

**Keuzehub: laat het.** Een preview van zes cellen in een hub-rij is de zesde weergave van dezelfde zes lagen.
De rij moet één ding beloven — *wat vind ik achter deze deur* — en dat kan met één regel. Eén wijziging,
in `CheckedPlainBlok` ([`LeefstijlprofielKeuzeHub.tsx:193-220`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx)):

```
Gemeten 4 dagen geleden · 2 opgeslagen        ← blijft (buildMeetregel)
Zes delen · 6 beoordeeld, 3 met een meetfeit  ← nieuw, uit dezelfde readout
```

Twee getallen, dezelfde bron als het raster, geen nieuwe component. Dit maakt de rijen van beweging en stress
niet-leeg zónder slice 3 uit het vorige verdict — het is een goedkopere invulling van dat gat dan een
kengetal-blok per domein, en hij liegt niet als de check niets per laag beoordeelt (dan staat er
`Zes delen · nog zonder oordeel`).

**Slaap-prebuildstaat.** Slaap heeft geen prebuild-iframe meer op Kompas
(`DomainKompasScreen` draagt hem sinds 20 augustus); op Voortgang staat hij al op het echte scherm.
Er is dus niets te ontwijken — slaap krijgt dichtheid **vol** zodra `resolveDomainLadderReadout` wordt
aangeroepen, en dat is de enige regel die daarvoor nodig is.

**Voeding zonder laag-staten.** Dichtheid **naam** + de extra ankerzin. De check is gedaan (er is een
`domainCheckDaysAgo`), dus de datum klopt; het oordeel per deel ontbreekt en dat staat er.

**Wachtend zonder check.** `domainCheckDaysAgo == null`: het raster staat er wél (zes namen zijn geen
uitspraak), het anker wordt *"Je beweegcheck staat nog open. Drie minuten, en dan staat hier wat je zelf
opgaf."* en de check is de enige CTA boven het raster. `GeenCheckBlok` op de hub doet dit al zo; dezelfde toon.

**Verbinding.** Blijft op `PrioriteitenLadder` in `choose`-stand. Niet aanraken (§C).

---

## K. HTML-prebuild

**Bestand:** [`docs/design/leefstijlprofiel-domein-delen-prebuild-2026-08.html`](../design/leefstijlprofiel-domein-delen-prebuild-2026-08.html) — standalone, geen build, geen framework, geen chart-lib.

**Volgorde in de HTML:** reviewer-balk → terug + eyebrow → H1 → cyclus-anker → sectiekop met telling →
raster (drie paar-rijen, lade tussen de rijen) → voetregel losse keuzes → `DomainRouteStrip` → schap-deur →
sluitregel → Kompas-referentie (uitgeklapt via toggle) → event-toast.

**Drie reviewer-staten**, alle drie schakelbaar, en alle drie veranderen het raster zelf — niet alleen de kop:

| | α | β | γ |
|---|---|---|---|
| domein | beweging | slaap | voeding |
| check | 4 dagen | 6 dagen | 9 dagen |
| `focusLayer` | 2 | 1 | — |
| `layerStates` | 6 | 6 | geen (`readout: null`) |
| `evidenceByLayer` | P1·P2·P3 | P1·P2·P3·P5 | — |
| keuzes | 2 met laag + 1 zonder | 0 | 1 met laag |
| dichtheid | vol | vol | naam |

**Mockvelden, echte namen:** `domainCheckDaysAgo`, `remeasure.dueDate`, `remeasure.daysUntil`, `cycleDay`,
`account_favorites[].{id,title,domain,kind}` met id-vorm `laag-beweging-p2-twee-krachtsessies-…`,
`readout.{focusLayer,layerStates,evidenceByLayer}`, feitenrijen met `key`, `label`, `answerLabel`,
`benchmarkLabel`, `benchmarkSource`-tekst in het label, `status`, `whyLine`, `footnote`. Laagnamen, summaries,
`WHY_WAIT`-regels en staatlabels zijn woordelijk uit `src/data/` en `src/lib/` overgenomen. Man op dag 12,
één intake, twee eigen checks — geen showcase.

**Interactie:** staat wisselen · een cel openen (lade onder de rij, `scrollIntoView` op de lade) · Kompas-referentie
in/uit · elke CTA toont in een toast welk event zou vuren. Tikdoelen ≥44px (cel ≥96px). Staat als vorm + woord
+ kleur; `aria-label` per cel draagt prioriteit, naam, staat, meetfeit en aantal keuzes.

**Drie bewuste afwijkingen t.o.v. live code:**

1. **`P{n}` staat niet in beeld**, alleen in `aria-label` en `data-layer`. Beide live-ladders tonen hem wél
   ([`PrioriteitenLadder.tsx:195-200`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx),
   [`DomainLifestyleLadder.tsx:120-125`](../../src/components/dashboard/domain/DomainLifestyleLadder.tsx)). In een cel
   van 171px kost het nummer een regel en levert het niets: de volgorde staat al in het raster.
2. **De cel toont het antwoord zonder de benchmark.** `MovementFactReadout` zet ze naast elkaar. In een cel
   maakt de benchmark van een meetfeit een cijfer; hij staat daarom pas in de lade, met `whyLine` en `footnote`.
3. **Terracotta staat er wél, maar alleen als staatkleur `winst`** — zoals in `STATE_STYLE` van beide
   live-ladders. Pagina-accent, knoppen, koppen en randen zijn sage. Ik lees het verbod als "geen
   pagina-accent", niet als "verwijder de staatkleur die op drie surfaces canon is". Wil je hem ook als
   staatkleur weg, dan moeten Kompas en de ladder mee — dat is een aparte ronde.

**Wat de prebuild bewust níét doet:** geen tweede score, geen 3/6-cirkel, geen sparkline per laag, geen
accordion als first view, geen afvinkcirkels, geen productkaart of prijs, geen React/JSX/Tailwind-CDN.

---

## L. Bouwgolven

**Golf 0 — beweging, bestaande data, bestaande events.**
Nieuwe presentational component + bedrading op één scherm. Nul nieuwe velden, nul schema, nul loader.
`resolveDomainLadderReadout("beweging", data)` levert alles; die functie draait al in productie op Kompas.
Eén nieuw GA4-event. Slaap en stress blijven in deze golf op de ladder staan (de component krijgt ze pas
in golf 1 aangeboden), zodat de vergelijking beweging-oud versus beweging-nieuw schoon is.

**Golf 1 — slaap en stress erbij, voeding eerlijk leeg.**
Eén regel: de domeincheck rond `resolveDomainLadderReadout` laten vallen, zodat alle vier de Kompas-domeinen
het raster krijgen. Slaap komt binnen op dichtheid **vol**, stress op **staat**, voeding op **naam**.
Plus de opruiming: `openLayer`/`onOpenLayerChange` uit `PrioriteitenLadder` en de hub-regel uit §J.

**Golf 2 — niet verzonnen.** Wat hier zou horen (feitenrijen voor stress) is T1d en heeft zijn eigen ronde.

**Waarom nu en niet ná het cohort.** Omdat dit geen craft-ronde is maar een reparatie die toevallig ook mooier
is. Slaap en stress tonen op Voortgang vandaag zes lagen zónder staat, terwijl Kompas diezelfde staten wél
toont uit dezelfde bron. Dat is een zichtbare tegenspraak tussen twee schermen over hetzelfde domein, en die
kost geen cohort om te beoordelen. De rastervorm is de goedkoopste manier om de reparatie te doen zonder
het scherm daarna nóg een keer te moeten verbouwen.

---

## M. Cursor-bouwpakket

**Bestanden, in volgorde:**

1. **`src/components/dashboard/voortgang/DomeinDelenGrid.tsx`** — nieuw, presentational, `"use client"`.
   Props: `layers: readonly LeefstijlLadderLayer[]`, `readout: DomainLadderReadout | null`,
   `domain: PillarId`, `checkNaam: string`, `daysAgo: number | undefined`, `surface: string`,
   `kompasHref: string`, `onOpenSchap?: () => void`.
   Leest `useVoortgangFavorites()` zelf (zoals `PrioriteitenLadder` doet) en filtert op
   `parseLadderFavoriteLayer`. Houdt zijn eigen open-cel in `useState`. Rendert drie paar-rijen met de
   lade tussen de rijen. Schrijft nergens.
2. **`src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx`** — bedrading:
   `resolveDomainLadderReadout(domain, data)` vervangt de `movementReadout`/`sleepReadout`-takken op `:202-204`
   voor alles wat de ladder voedde; `DomeinDelenGrid` vervangt `PrioriteitenLadder` waar
   `isDomainKompasDomain(domain)`; `MijnKeuzeSectie` (`:102-166`, `:488`), `LadderCoverageMeter` (`:361`),
   `MovementFactReadout` (`:398`), `SleepFactReadout` (`:423`), de eyebrow op `:373-377`,
   `KompasDomainGauge` (`:334`) en het `pickedLayer`-paar (`:224-225`, `:459-462`, `:469-484`) eruit;
   `DomainRouteStrip` (`:486`) naar ná het raster; kop `:319-323` naar eyebrow + H1; ankerregel erbij.
3. **`src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx`** — golf 1: één regel in
   `CheckedPlainBlok` (§J).
4. **`src/components/dashboard/voortgang/__tests__/DomeinDelenGrid.test.tsx`** — nieuw.
5. **`src/components/dashboard/voortgang/PrioriteitenLadder.tsx`** — golf 1: `openLayer` /
   `onOpenLayerChange` verwijderen zodra niets ze meer meegeeft.

**Vijf acceptatiecriteria:**

1. Met `movementCheckinSnapshot` uit de fixture staan er zes cellen; P2 draagt het woord `Grootste winst`,
   het meetfeit `Kracht · 1× per week`, en één keuze-chip. P5 draagt geen meetfeit en geen chip.
2. Met alléén `sleepCheckinSnapshot` staan er zes cellen mét staat — de test faalt als de staat ontbreekt.
   Dit is de regressie die vandaag bestaat en die deze slice repareert.
3. Met `readout === null` (voeding) staat er geen enkel staatwoord in het raster, en staat de zin
   *"beoordeelt deze delen nog niet apart"* precies één keer op het scherm.
4. Het scherm rendert geen enkele knop die naar `account_favorites` of `agenda_blocks` schrijft:
   `queryAllByRole("button", { name: /Zet bij Mijn keuze|Zet op Mijn Dag|Verwijder/ })` is leeg.
5. Een cel openen vuurt `${domain}_ladder_layer_open` met `view: "grid"`; de lade bevat `benchmarkLabel`,
   `whyLine` én `footnote` van elke rij van die laag, en de knop `Kies dit op Kompas`.

**Niet aanraken:** `DomainKompasScreen`, `DomainLifestyleLadder`, `DomainFreeActionsTile`,
`DomainLadderContextPanel` en de rest van de keuzehart-zijbalk, `SchapView`, `Dashboard.tsx`,
`voortgang-horizon-copy.ts` + `VoortgangHero`, `PrioriteitenLadder` in `choose`-stand (verbinding),
`domain-ladder-readout.ts` (alleen lezen), alle schap-locks.

**Verificatie:** `npx tsc --noEmit` · `vitest run` · `eslint --max-warnings 0` ·
`grep -rn "console.log" src/`. Niet committen. Geen `next build`, geen `rm -rf .next`.

---

## N. Tegenspraak

**1. Het raster ís de Kompas-vorm.** `DomainLifestyleLadder` met `columns={2}` is letterlijk al een
tweekoloms raster van zes laagkaartjes met naam en staatwoord
([`DomainLifestyleLadder.tsx:94`](../../src/components/dashboard/domain/DomainLifestyleLadder.tsx)). Twee
schermen met dezelfde vorm voor twee verschillende vragen is precies wat lock 3 verbiedt. Erger: op 375px
vuurt `@[560px]:grid-cols-2` niet, dus op de telefoon ziet de gebruiker Kompas als één kolom en Voortgang als
twee — hetzelfde ding, twee vormen, zonder dat het verschil iets betekent. Dat leest als willekeur.

**2. Een raster adverteert symmetrie die de data niet heeft.** Zes cellen × vier sleuven is 24 sleuven; beweging
vult er 14, stress 12, voeding 6. Een accordion verbergt leegte netjes — een dichte rij toont niets. Een raster
toont leegte permanent en in het meervoud.

**3. De meetlink per laag is een redactionele keuze, geen meting.** `MOVEMENT_LAYER_FACT_KEYS`
([`domain-ladder-readout.ts:128-132`](../../src/lib/domain-ladder-readout.ts)) wijst zitten+mobiliteit aan P1 toe,
kracht+aeroob aan P2, consistentie aan P3 — dat is een besluit van ons, niet iets dat de check meet. Zolang de
feiten in een apart readout-blok staan, leest de gebruiker ze als antwoorden. Zet je ze ín de cel, dan leest het
als *"dit deel is gemeten"*, en dat hebben we niet gedaan. Bij slaap is dat verwijt onterecht (`row.layer` komt
uit de engine), bij beweging niet.

**De drempel waarop Dennis gelijk heeft.** Punt 1 valt weg zodra de cel meer draagt dan naam en staat: zodra
er een datum en een antwoord in staan, is het geen keuzeknop meer, en dat verschil is groter dan de
kolomtelling. Punt 2 valt weg zodra de vorm de dichtheid volgt in plaats van andersom — dat is de refine in
§D, en daarom staan er bij voeding géén zes lege vakjes. Punt 3 valt weg zodra de cel het antwoord toont en
de benchmark niet: `Zitten · 8 tot 10 uur per dag` is een citaat, `Onder de richtlijn` zou een oordeel zijn.
Alle drie de drempels zijn met copy en dichtheid te halen, niet met een andere vorm.

**Aanbeveling.** Bouwen, maar niet als redesign — als bedrading. Wat dit scherm mankeert is niet dat het een
accordion is, maar dat het voor drie van de vijf domeinen data laat liggen die de buurman al toont, en dat het
zes lagen boven acht feiten zet zonder lijn ertussen. `DomeinDelenGrid` lost precies dat op met nul nieuwe
velden: één aanroep van `resolveDomainLadderReadout`, één component met drie dichtheden, en zeven
onderdelen minder op het scherm. Doe golf 0 op beweging, laat `voortgang_domein_grid_viewed` twee weken
meelopen, en gebruik de kolom "sleuven gevuld" uit §G om te beslissen of slaap en stress volgen. Als die
cijfers tegenvallen kost het je één component om terug te vallen op de ladder — de data-laag verandert niet.

---

## Kritiekronde

**1 · IA-architect — is dit nog Voortgang, of een derde Kompas?**
Het blijft Voortgang zolang de cel geen keuze is. Twee kritiekpunten: (a) *"Kies dit op Kompas"* in elke lade
maakt van elk deel een mini-Kompas-ingang — zes deuren naar hetzelfde scherm; (b) het anker boven het raster
concurreert visueel met de hero-band op de hub eronder als de gebruiker doorscrollt.
**Doorgevoerd:** de deur staat alléén in de open lade, nooit in de cel, dus er is maximaal één deur tegelijk in beeld.

**2 · Man van 45, beweging, P2, twee keuzes, één check. Drie seconden.**
Hij ziet: een kop die zijn domein noemt, één regel met een datum, en zes vakjes waarvan er één anders kleurt.
In dat ene vakje staat `Kracht · 1× per week`. Kritiek: (a) `Grootste winst` in kapitalen naast `Kracht + basisconditie`
is veel tekst voor 171px; (b) hij weet na drie seconden nog niet dat hij kán tikken.
**Doorgevoerd:** de naam krijgt `text-wrap:balance` en max twee regels, het staatwoord staat op 9.5px onder
de naam in plaats van ernaast, en de hele cel is het tikdoel met zichtbare `aria-expanded`-staatwissel.

**3 · Compliance.**
(a) Vier staatwoorden over zes lagen kan als verkapte score lezen zodra iemand ze optelt — daarom géén
teller "4 van 6 op orde" en géén cirkel; de sectiekop telt alleen wat *beoordeeld* is, niet wat *goed* is.
(b) De `whyLine` van elke feitenrij is bestaande, geauditeerde copy; er komt geen nieuwe causale zin bij.
(c) `voortgang_domein_grid_viewed` bevat vier gehele getallen en een domeinnaam — geen vrije tekst, geen
antwoorden, geen PII.
**Doorgevoerd:** de telling in de sectiekop is `N van 6 beoordeeld · M met een meetfeit` — dekking, geen prestatie.

**4 · Frontend.**
(a) Favoriet-ids worden hergebruikt via `parseLadderFavoriteLayer`; er komt geen tweede ledger en geen
tweede id-vorm. (b) Op 375px is er geen container-query nodig: het raster is 2 kolommen vanaf 0px, en gaat
naar 3 op ≥1024px — maar let op de breedteval uit het cockpit-dossier: de midden-zone is ~744px bij open
contextkolom, dus de 3-koloms stand moet op `@container`/`@[Npx]:` en niet op `lg:`. (c) Wat er kapot gaat als
`PrioriteitenLadder` van dit scherm verdwijnt: **niets in de tests.** `PrioriteitenLadder.test.tsx` en
`PrioriteitenLadderEchteData.test.tsx` renderen de component rechtstreeks met eigen props en raken dit scherm
niet; `DomainLifestyleLadder.test.tsx` draait op de Kompas-surface. Er is geen test die
`leefstijlprofiel_beweging` als surface tegen `DomainLifestyleLadder` zet — die combinatie bestaat niet meer.
**Doorgevoerd:** de 3-koloms stand in §D is als container-query gespecificeerd, niet als viewport-breakpoint.

**Gewijzigd t.o.v. mijn eerste opzet:** (1) het raster is niet één vorm maar drie dichtheden, gekozen door de
data — dat kwam uit tegenspraak 2; (2) de benchmark is uit de cel gehaald en naar de lade verplaatst — uit
tegenspraak 3; (3) `LadderCoverageMeter` ging van KEEP naar KILL toen bleek dat de sectiekop-telling
hetzelfde doet met minder pretentie; (4) `MovementFactReadout`/`SleepFactReadout` gingen van KEEP naar
KILL toen bleek dat de lade per rij strikt méér toont.

---

## Wat ik niet kon verifiëren

- **S1–S4 en lock 1–3 letterlijk.** De kop van de prompt ontbrak; §0a is een reconstructie. Wijkt een stelling
  af, dan raakt dat §A en niets anders.
- **De prebuild op echte hardware.** Ik heb de JS syntactisch gecontroleerd (`node --check`, schoon) en de
  tag-balans geteld, maar niet in een browser op 375px gezien. De y-waarden in §D zijn berekend uit de
  opgegeven paddings en lettergroottes, niet gemeten.
- **`stressCheckinReport` in het wild.** Dat stress zes staten oplevert staat in
  `resolveStressLayerStates`, maar ik heb geen productiedata gezien die bevestigt hoe vaak dat veld gevuld is.
  Dichtheid **staat** is daarom een verwachting, geen waarneming.
- **Of `movementCheckinSnapshot.date` en `sleepCheckinSnapshot.date` altijd gevuld zijn.** Ik gebruik daarom
  in de bronregel `domainCheckDaysAgo` en niet die datumvelden.
- **De feitelijke schermbreedte van de midden-zone** bij open contextkolom op dit scherm. Ik neem de ~744px
  uit het cockpit-dossier over zonder hem opnieuw te meten.
