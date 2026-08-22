# Opus-verdict — De Kompas-zijbalk als keuzehart

> **Status:** besluitronde, geen bouwronde. Geen code, geen diffs, geen SQL.
> **GETEKEND 22 augustus 2026** — R3 in de drie gates van §G; de vier bouwvoorwaarden en de twee drempels staan
> vastgelegd in [`KOMPAS_SIDEBAR_ROADMAP_2026-08.md`](KOMPAS_SIDEBAR_ROADMAP_2026-08.md) §7. Vanaf hier is dit
> verdict samen met die roadmap het uitvoeringscontract; heropenen mag alleen onder een kop `PIVOT`.
> **Datum:** 22 augustus 2026
> **Toetsingsgrond:** [`KOMPAS_SIDEBAR_ROADMAP_2026-08.md`](KOMPAS_SIDEBAR_ROADMAP_2026-08.md) (VAST) ·
> [`opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md`](opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md) §C/§D/§F/§I ·
> [`claude-opus-beweging-mijn-dag-verdict-2026-08.md`](claude-opus-beweging-mijn-dag-verdict-2026-08.md) KILL #7/#8 ·
> as-built `src/` op main (35596895).

---

## Vier as-built correcties op de bronnen — lees dit vóór je de citaten gebruikt

Geen PIVOT, geen heropening: dit zijn verwijzingen die sinds het schrijven verlopen zijn.

| # | Bron zegt | As-built vandaag |
|---|---|---|
| a | Ecosysteem-verdict §K: vier `choice.shelf_opened`-emitters, waaronder `BewegingKompasScreen.tsx:88` en `LeefstijlprofielDomeinScherm.tsx:270` | Vier emitters, andere set: `KompasOndersteuningTile.tsx:89` · `LeefstijlprofielDomeinScherm.tsx:307` · `SchapView.tsx:97` · `MeerHulpBridgeSheet.tsx:53`. `BewegingKompasScreen` emit niets meer (zie c) |
| b | Ecosysteem-verdict §B#9: `VoortgangHub.tsx:145-152` | Dat pad bestaat niet meer; de hub staat op [`src/components/dashboard/VoortgangHub.tsx`](../../src/components/dashboard/VoortgangHub.tsx) (269 regels) en rendert `SchapView` + `FavorietenView`, geen `PrebuildFrame` |
| c | Roadmap §2 P1: `MijnKeuzeTile` staat twee keer | Drie keer. Naast [`DomainKompasScreen.tsx:172`](../../src/components/dashboard/domain/DomainKompasScreen.tsx) en [`KompasHomeCard.tsx:819`](../../src/components/dashboard/kompas/KompasHomeCard.tsx) staat hij in [`BewegingKompasScreen.tsx:173`](../../src/components/dashboard/domain/BewegingKompasScreen.tsx) — een dood bestand dat nergens meer geïmporteerd wordt, alleen genoemd in een doc-comment ([`DomainKompasScreen.tsx:37`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) |
| d | Prompt-constraint: "verbinding draait op Kompas nog als prebuild-iframe" | Klopt, en het is het enige domein: [`Dashboard.tsx:2492-2499`](../../src/components/dashboard/Dashboard.tsx). Beweging, slaap, voeding **en stress** draaien op `DomainKompasScreen` ([`domain-kompas-copy.ts:10`](../../src/lib/domain-kompas-copy.ts)) |

En één die het hele §I-antwoord stuurt: **W1 is niet begonnen.** `LayerRecommendation`, `MovementProvider`,
`bond_verdict` en `is_monetised` komen nergens in `src/` voor, en `BRAND_POSITIONING.md:12` draagt nog de oude
één-zin. Dat is geen verwijt — het is de reden dat de zijbalk vóór W1 kan.

---

## A. Verdict per stelling

**Totaaloordeel: GO op de zijbalk als keuzehart voor de drie domeinen die een readout hebben — mits de laagkeuze
verhuist naar één bron, de "vanwege" alleen verschijnt waar de check er een levert, en de drawer eerst een afgemaakte
surface wordt.**

| # | Stelling | Verdict |
|---|---|---|
| S1 | Aanbevolen ladder in de zijbalk: P{n} + *vanwege*, meebewegend, save op de aanbevolen actie | **REFINE** |
| S2 | P1–P6 finetune-baar in de zijbalk zonder N6 te breken | **REFINE** — de navigator mag, de tweede staat niet |
| S3 | Save primair in de zijbalk, midden als spiegel | **GO** (getekend) — uitvoering REFINE op twee as-built defecten |
| S4 | `MijnKeuzeTile` van héél Kompas af | **GO** (getekend) — met drie migratieschulden die in dezelfde plak horen |
| S5 | Kompas blijft interactief met aanbevelingen; schap is transitie; geen afvinken | **afvink-clausule GO** (getekend) · **spectrum-deel PARKEER tot W1** |
| S6 | Inline dashboard-help met `dashboard-unlock.ts` als SSOT | **REFINE** — de plek klopt, de SSOT niet |

### S1 · Aanbevolen laag + *vanwege* in de zijbalk — REFINE

Het meebewegen is al gebouwd. [`Dashboard.tsx:3585-3611`](../../src/components/dashboard/Dashboard.tsx) bouwt de
ladderkaarten uit `useDomainLadderFocus` + `resolveDomainLadderReadout`, en
[`DomainKompasScreen.tsx:82-85`](../../src/components/dashboard/domain/DomainKompasScreen.tsx) zet die focus bij elke
laagklik. Wat er niet is, is de *vanwege*.

De kaartbody is vandaag `layerSummary`, aangevuld met `whyWait` waar die bestaat
([`cockpit-inspector.ts:121`](../../src/lib/cockpit-inspector.ts)). En `whyWait` bestaat per definitie **niet** op de
aanbevolen laag: alle drie de domeinen geven `null` zodra `layer <= focus`
([`movement-ladder.ts:205-207`](../../src/lib/movement-ladder.ts) · [`sleep-ladder.ts:138,146`](../../src/lib/sleep-ladder.ts) ·
[`stress-ladder.ts:129`](../../src/lib/stress-ladder.ts)). Op precies de laag waar S1 over gaat staat dus een
samenvatting plus het label "Grootste winst" ([`movement-ladder.ts:210-214`](../../src/lib/movement-ladder.ts)) — een
etiket, geen reden.

Het materiaal voor die reden ligt er wél, en het is dormant: `evidenceByLayer`
([`domain-ladder-readout.ts:64`](../../src/lib/domain-ladder-readout.ts)) heeft in heel `src/` geen enkele renderer,
alleen tests ([`__tests__/domain-ladder-readout.test.ts:77-89`](../../src/lib/__tests__/domain-ladder-readout.test.ts)).
De feitenrijen zelf worden alleen op de check-schermen en op Voortgang getoond
([`MovementFactReadout.tsx:89`](../../src/components/intake/MovementFactReadout.tsx) ·
[`LeefstijlprofielDomeinScherm.tsx:440,464`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)).
S1 vraagt dus geen nieuwe data — alleen een precedentie-regel (§D) en één renderer.

**Drie verfijningen.** (1) De zijbalk toont **één** actie — de rang-1-optie van de laag, dezelfde volgorde die het
midden gebruikt ([`DomainFreeActionsTile.tsx:71`](../../src/components/dashboard/domain/DomainFreeActionsTile.tsx)) —
niet de hele lijst; een lijst mét knoppen in de contextkolom ís de tweede ladder. (2) Zonder readout geen
"Aanbevolen"-label: voeding en verbinding leveren `null`
([`domain-ladder-readout.ts:190`](../../src/lib/domain-ladder-readout.ts)) en openen op P1 als val, niet als
aanbeveling ([`DomainKompasScreen.tsx:66-71`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)).
(3) Staat er geen laag open (Kompas-home, of het verbinding-iframe), dan valt de kolom terug op de
gewoonte-kaarten uit een oudere generatie ([`Dashboard.tsx:3613-3625`](../../src/components/dashboard/Dashboard.tsx));
die val blijft, maar hij mag geen laag-copy dragen.

### S2 · Laag-navigator in de zijbalk — REFINE

De navigator mag (§C). Wat niet mag is dat hij zijn eigen waarheid krijgt, en dat gebeurt bij de naïeve bouw.

De laagkeuze woont vandaag in `useState` op het middenscherm
([`DomainKompasScreen.tsx:59`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) en wordt éénrichting de
context in geduwd ([`:82-85`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)). Zet de zijbalk
`setFocus({layerId: 4})`, dan verandert de contextwaarde, maar `selectedLayerId` in het midden verandert niet, dus
`activeLayerId` verandert niet, dus de effect-deps veranderen niet en het midden hoort er nooit van. Resultaat: de
ladder markeert P2, de samenvattingsregel gaat over P2, het actieblok toont P2 — en de zijbalk zegt P4. Twee open
lagen tegelijk, stil.

De oplossing bestaat al als patroon: `PrioriteitenLadder` is controlled-when-provided
([`PrioriteitenLadder.tsx:72-73,105-112`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx)). De
laagselectie hoort dus omhoog naar `domain-ladder-focus-context`
([`domain-ladder-focus-context.tsx:23-28`](../../src/lib/domain-ladder-focus-context.tsx)), waarna beide surfaces
gestuurd lezen uit dezelfde bron. Dat is de hele S2-plak, en hij is klein — maar hij is een voorwaarde, geen extraatje.

### S3 · Save primair in de zijbalk — GO (getekend), uitvoering REFINE

De gedeelde staat is gratis: `VoortgangFavoritesProvider` is al de enige bron en beide knoppen lezen dezelfde
`isSaved` ([`voortgang-favorites-context.tsx:78-118`](../../src/lib/voortgang-favorites-context.tsx) ·
[`FavoriteSaveButton.tsx:24-25`](../../src/components/dashboard/voortgang/FavoriteSaveButton.tsx)). Spiegel en primair
zijn letterlijk dezelfde knop met dezelfde sleutel; er komt geen tweede bron bij. Dat is de reden dat R2 goedkoop is.

Twee dingen moeten mee in dezelfde plak, anders draagt een primaire handeling een onafgemaakte surface:

- **De drawer heeft geen scrim.** [`CockpitFrame.tsx:320`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)
  rendert het overlay-vlak alleen wanneer `isDrawerMode && isDialogOpen` — dus onder 1280px — maar geeft het
  `max-xl:hidden` mee, wat het onder 1280px verbergt. Zoals geschreven verschijnt het nooit. Idem de sheet-greep op
  [`:347`](../../src/components/dashboard/cockpit/CockpitFrame.tsx). Eén resize bevestigt het; beide lezen als een
  omgekeerde variant (`xl:hidden` bedoeld).
- **Save is niet af te lezen per plek.** `dashboard_favorieten_save` draagt `item_id`, `kind`, `source` en `domain`,
  géén surface ([`voortgang-favorites-context.tsx:110-115`](../../src/lib/voortgang-favorites-context.tsx)); de
  `surface`-prop van de knop gaat alleen naar `data-surface`
  ([`FavoriteSaveButton.tsx:46`](../../src/components/dashboard/voortgang/FavoriteSaveButton.tsx)). Zonder die
  parameter is "primair in de zijbalk" een ontwerpuitspraak zonder toetsing. Zie §E.

### S4 · `MijnKeuzeTile` van héél Kompas af — GO (getekend)

Correct besluit, en de zijbalk draagt de laag-gescopete helft al ([`cockpit-inspector.ts:124-138`](../../src/lib/cockpit-inspector.ts)).
Maar het is geen delete van twee regels; zie §F voor de drie schulden (grid-gat op de home-kaart, een copy-regel die
liegt zodra de tile weg is, en een dood bestand dat hem nog rendert).

### S5 · Interactief blijven; schap is transitie; geen afvinken — GO op de afvink-clausule, PARKEER op het spectrum

De afvink-clausule is getekend en de as-built voldoet er al aan: er staat geen afvink-affordance op het domeinscherm
([`DomainKompasScreen.tsx:45-50,201-202`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)), en de
contextkolom kent alleen `laag` en `keuze` als kaartsoorten
([`cockpit-inspector.ts:10`](../../src/lib/cockpit-inspector.ts)). Bewaken, niet bouwen.

Het spectrum-deel PARKEERT — niet uit twijfel, maar omdat het bouwmateriaal ontbreekt: geen `LayerRecommendation`,
geen `bond_verdict`, geen `is_monetised` in `src/`; `dienst` rendert `null`
([`LadderActionRow.tsx:58`](../../src/components/dashboard/domain/LadderActionRow.tsx)) en
`resolveLadderAffordances` geeft alleen `keuze`/`moment`
([`ladder-affordances.ts:36,56`](../../src/lib/ladder-affordances.ts)). Dat is W1, en W1 is niet begonnen. **Niets in
de zijbalk-plakken hangt eraan** — dat is de belangrijkste sequencing-uitkomst van dit verdict.

### S6 · Inline dashboard-help — REFINE, de SSOT klopt niet

De plek klopt: de infokaart staat al ín de contextkolom als `inspectorExtra`
([`Dashboard.tsx:3629`](../../src/components/dashboard/Dashboard.tsx)), gedefinieerd op
[`:3531-3563`](../../src/components/dashboard/Dashboard.tsx). S6 is dus een inhoudsklus, geen plaatsingsklus.

De SSOT klopt niet. `dashboard-unlock.ts` is geen handleiding maar de **acquisitie-bron van een uitgelogde
squeeze-pagina**: hero over "een gratis account bewaart je overzicht" ([`:10-16`](../../src/data/dashboard-unlock.ts)),
een met/zonder-paar ([`:26-43`](../../src/data/dashboard-unlock.ts)), een verzonnen voorbeeldprofiel met vaste scores
([`:77-94`](../../src/data/dashboard-unlock.ts)), CTA *"Start de Leefstijlcheck →"*
([`:62`](../../src/data/dashboard-unlock.ts)) en een A/B-variantcookie
([`hoe-werkt-dashboard/page.tsx:30-37`](../../src/app/hoe-werkt-dashboard/page.tsx)). Dat binnen het dashboard tonen
zegt tegen iemand die de check gedaan heeft dat hij de check moet doen, met verzonnen scores naast zijn echte. Zie §H
voor wat er wél SSOT wordt.

---

## B. Zone-contract van de zijbalk

Vijf zones, vaste volgorde, één blok per zone. De contextkolom is 320px bij `xl` minus `px-4`
([`CockpitFrame.tsx:69,79`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)) — circa 288px inhoud. Dat is het
budget.

| Zone | Interactief | Databron | Desktop ≥1280 (sidebar) | <1280 (drawer/sheet) | Wat er uit midden/home verdwijnt |
|---|---|---|---|---|---|
| **1 · Aanbevolen laag + vanwege** | Nee (één link "terug naar de aanbevolen laag") | `resolveDomainLadderReadout().focusLayer` · `headline` · `stateLabels` · `evidenceByLayer` ([`domain-ladder-readout.ts:54-67`](../../src/lib/domain-ladder-readout.ts)) | Blok 1, altijd | Blok 1, altijd | Niets. Het midden houdt zijn eigen terugweg ([`DomainKompasScreen.tsx:135-147`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) — de zijbalk draagt de *reden*, het midden de *navigatie* |
| **2 · Laag-navigator P1–P6** | Ja | `getLeefstijlLadder(domain).layers` (alleen `id`) + `readout.layerStates` | Blok 2, strip van 6 chips | Blok 2, identieke strip | Niets. De ladder mét namen blijft in het midden ([`DomainLifestyleLadder.tsx:92-...`](../../src/components/dashboard/domain/DomainLifestyleLadder.tsx)) |
| **3 · De actie + save** | Ja — primair | `activeLayer.actions[0]` + `resolveLadderAffordances` + `FavoriteSaveButton` | Blok 3 | Blok 3 | Niets in plak 1: het midden houdt `DomainFreeActionsTile` als volledige spiegel (R2 / C-b) |
| **4 · Gekozen op deze laag** | Ja (unsave per rij) | `useVoortgangFavorites` gefilterd op domein + `parseLadderFavoriteLayer` | Blok 4 | Blok 4 | `MijnKeuzeTile` domein-variant ([`DomainKompasScreen.tsx:172`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) |
| **5 · Help** | Ja (uitklap) | Nieuw `dashboard-help.ts` + `DASHBOARD_ROUTE_STEPS` ([`dashboard-route.ts:10-53`](../../src/data/dashboard-route.ts)) | Blok 5, ingeklapt | Blok 5, ingeklapt | Niets — staat er al als `inspectorExtra` |

**Vijf regels bij de tabel.**

1. **Maximaal vijf blokken.** De kolom draagt vandaag al `laag` + `keuze` + infokaart, plus een hermeting-actie en de
   Future You-voet ([`CockpitInspector.tsx:119-137`](../../src/components/dashboard/cockpit/CockpitInspector.tsx) ·
   [`Dashboard.tsx:3626-3636`](../../src/components/dashboard/Dashboard.tsx)). De hermeting- en doel-kaarten horen
   op een domeinscherm mét open laag **niet** in beeld: `ladderInspectorCards` vervangt de generieke set al volledig
   ([`Dashboard.tsx:3613-3614`](../../src/components/dashboard/Dashboard.tsx)) — houd dat zo.
2. **Geen laagnamen in zone 2, geen samenvattingen, geen acties.** Dat is de operationele definitie van N6 (§C).
3. **Geen afvink-affordance in enige zone**, en geen "Open Mijn Dag"-CTA in de zijbalk (roadmap §2 P4).
4. **Drawer = dezelfde vijf zones, dezelfde volgorde.** Geen aparte mobiele informatie-architectuur; alleen
   `compact` ([`CockpitInspector.tsx:58`](../../src/components/dashboard/cockpit/CockpitInspector.tsx)) scheidt ze.
   Op de sheet staan zones 1–3 boven de vouw van `max-h-[min(85vh,720px)]`
   ([`CockpitFrame.tsx:85`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)).
5. **De kolom mag niet scrollen bij één open laag op 1280px.** Scrollt hij, dan is de cap in regel 1 overschreden.

---

## C. De N6-oplossing: **LayerStrip**, overal

Drie kandidaten, zoals de opdracht ze stelt: *CompactNav* (vorige/volgende + "P3 van 6"), *LayerStrip* (zes chips
P1…P6, staatskleur, statuswoord alleen op de actieve), *Hybrid* (strip op desktop, prev/next in de sheet).

**Gekozen: LayerStrip, in alle drie de presentaties.**

**Het 375px-argument, met de maten.** Onder 640px is de kolom een bottom sheet: `inset-x-0` met `p-3`
([`CockpitFrame.tsx:85`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)), dus op een 375px-toestel ~351px
inhoud. Zes chips van 44px met vijf tussenruimtes van 6px is ~294px: één rij, geen scroll, en 44px is het
aanraakformaat dat de rest van de cockpit al aanhoudt (`min-h-9`/`min-h-10`/`min-h-11` op
[`CockpitInspector.tsx:75`](../../src/components/dashboard/cockpit/CockpitInspector.tsx) en
[`FavoriteSaveButton.tsx:63`](../../src/components/dashboard/voortgang/FavoriteSaveButton.tsx)). Bij `xl` is het
budget 288px, dus dezelfde strip op ~40px per chip. Eén component haalt beide uiteinden van het bereik — dat is de
hele reden om niet te splitsen.

**Wat er bij de afvallers kapotgaat.**

- **CompactNav** verbergt welke lagen er zijn en kost tot vijf tikken naar P6. Erger: "P3 van 6" is letterlijk de
  ordinale lezing die `BESLUIT_BEWEGING §A.3 #12` heeft gekilld en die het twin-contract herbevestigt (*"nooit fase N
  van M"*, ecosysteem-verdict §G r.186). Een navigator die die zin in de UI zet, herintroduceert een gedode claim.
- **Hybrid** levert twee gedragingen om synchroon te houden en geeft de zwakste aan 375px — waar de doelgroep zit
  (CLAUDE.md). Bovendien verliest de sheet dan het enige wat de strip gratis geeft: de staatskleuren per laag, de
  enige plek onder 1280px waar "grootste winst" leesbaar is zonder het middenscherm te openen.

**Wat de strip géén tweede ladder maakt** — leg dit vast, want elke volgende chat toetst eraan: de strip draagt
*alleen* `id` + staat. Geen laagnaam, geen `subtitle`, geen `summary`, geen acties, geen bewijsrijen. De namen wonen
in het midden, in de kop, ín de domeinkaart (lock N6:
[`DomainKompasHead.tsx:20`](../../src/components/dashboard/domain/DomainKompasHead.tsx) ·
[`cockpit-inspector.ts:108`](../../src/lib/cockpit-inspector.ts)). Zodra de strip een tweede regel tekst per laag
krijgt, is N6 gebroken.

**Meetpunt:** hergebruik `${domain}_ladder_layer_open` met `surface: "zijbalk_<domein>"`. Het is dezelfde gebeurtenis
(een laag ging open) met een andere plek — precies het geval dat de G′-grens toestaat. Het event bestaat al op beide
huidige ladders ([`DomainLifestyleLadder.tsx:88`](../../src/components/dashboard/domain/DomainLifestyleLadder.tsx) ·
[`PrioriteitenLadder.tsx:127`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx)).

---

## D. Het *vanwege*-contract per domein

**De precedentie-regel, één keer, voor alle domeinen.** De zin onder "Prioriteit N" wordt gekozen in deze volgorde,
en de eerste die iets oplevert wint:

| Situatie | Bron van de zin | Toon |
|---|---|---|
| Laag == `focusLayer` | `evidenceByLayer[laag][0].whyLine`, met `benchmarkLabel` als die er is | "Vanwege" — dit is de reden |
| Laag > `focusLayer` | `whyWait(laag)` | "Kan wachten omdat…" |
| Laag < `focusLayer` | `layer.summary` | Beschrijving, geen oordeel |
| Geen readout | `layer.summary` | Beschrijving, **en geen "Aanbevolen"-label** |

Merk op dat rij 1 vandaag onbediend is en rij 2 al werkt — dat is precies omgekeerd aan wat de zijbalk nodig heeft.

| Domein | `headline` | `stateLabels` | `whyWait` | `evidenceByLayer` | Wat de *vanwege* wordt |
|---|---|---|---|---|---|
| **beweging** | Bevroren conclusiezin uit de snapshot ([`domain-ladder-readout.ts:92`](../../src/lib/domain-ladder-readout.ts)) | `MOVEMENT_LAYER_STATE_LABEL` ([`movement-ladder.ts:210-214`](../../src/lib/movement-ladder.ts)) | Alleen laag > focus ([`:201-207`](../../src/lib/movement-ladder.ts)) | **P1–P3** ([`domain-ladder-readout.ts:100-104`](../../src/lib/domain-ladder-readout.ts) via `MOVEMENT_LAYER_FACT_KEYS` [`:69-73`](../../src/lib/domain-ladder-readout.ts)) | Echte feitzin met richtlijn op P1–P3; op P4–P6 val terug op `headline` |
| **slaap** | Bevroren conclusiezin ([`:134`](../../src/lib/domain-ladder-readout.ts)) | `SLEEP_LAYER_STATE_LABEL` ([`sleep/lifestyle-priorities.ts:91-99`](../../src/data/sleep/lifestyle-priorities.ts)) | Alleen laag > focus ([`sleep-ladder.ts:138,146`](../../src/lib/sleep-ladder.ts)) | **P1, P2, P3, P5** ([`sleep-checkin-readout.ts:47-55`](../../src/lib/sleep-checkin-readout.ts)); rijen zonder richtlijn verliezen hun badge ([`domain-ladder-readout.ts:129`](../../src/lib/domain-ladder-readout.ts)) | Echte feitzin op vier lagen; P4 en P6 vallen terug op `headline` |
| **stress** | **Geen eigen conclusiezin** — hergebruikt een `assessStress`-statement of de laag-summary, expliciet gedocumenteerd ([`:147-169`](../../src/lib/domain-ladder-readout.ts)) | `STRESS_LAYER_STATE_LABEL` | Alleen laag > focus ([`stress-ladder.ts:129`](../../src/lib/stress-ladder.ts)) | **Leeg** — `evidenceByLayer: {}` ([`:176`](../../src/lib/domain-ladder-readout.ts)), wacht op T1d | Op de aanbevolen laag zegt de zijbalk *waar de laag over gaat*, niet waaróm de check hem koos. Copy moet dat dragen, niet verhullen |
| **voeding** | — | — | — | — | **Niets.** `resolveDomainLadderReadout` geeft `null` ([`:190`](../../src/lib/domain-ladder-readout.ts)); de ladder opent op P1 als val ([`DomainKompasScreen.tsx:66-71`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)). Zone 1 toont dan: geen aanbeveling, wel zes prioriteiten, en de CTA is de voedingscheck |
| **verbinding** | — | — | — | — | **Niets, en geen zijbalk-contract.** Het is een prebuild-iframe ([`Dashboard.tsx:2492-2499`](../../src/components/dashboard/Dashboard.tsx)); er wordt nooit een `DomainLadderFocus` gezet, dus de kolom valt terug op de generieke kaarten ([`:3613-3625`](../../src/components/dashboard/Dashboard.tsx)) |

**De eerlijke lege plek, uitgeschreven.** Voeding en verbinding hebben een ladder maar geen check die per laag een
staat oplevert — dat staat al zo in de kop van
[`domain-ladder-readout.ts:30-32`](../../src/lib/domain-ladder-readout.ts) en het is een correcte keuze. De verleiding
is om de leegte te vullen met de laag-summary onder een "Aanbevolen"-kicker. Doe dat niet: dan draagt een zin die
niemand op jouw antwoorden heeft gebaseerd het gewicht van een aanbeveling. De zijbalk zegt daar precies één ding —
*je hebt hier nog geen check gedaan* — met de check als enige actie.

**Antwoord op de verbinding-vraag uit de constraints: het zijbalk-contract geldt ná de React-migratie.** Bouw geen
postMessage-brug van het iframe naar de contextkolom. Verbinding heeft geen readout, dus zelfs een geslaagde brug
levert zone 1 leeg op — je zou een koppeling bouwen om een lege kaart te vullen.

---

## E. Save-contract

| Onderdeel | Vastgelegd |
|---|---|
| Component | `FavoriteSaveButton` met de ladder-opschriften ("Zet bij Mijn keuze" / "Staat bij Mijn keuze"), exact zoals [`LadderActionRow.tsx:40-52`](../../src/components/dashboard/domain/LadderActionRow.tsx) |
| Sleutel | `ladderActionFavoriteId(domain, layerId, action)` → `laag-<domein>-p<n>-<slug>`. Onveranderd, en de enige sleutel |
| `kind` | `activiteit` (zolang de laag alleen gratis acties draagt; `dienst`/`supplement` pas met W1) |
| `source` | `aanbevolen` als `layerId === readout.focusLayer`, anders `mijn_keuze` — dezelfde afleiding als het midden ([`DomainKompasScreen.tsx:159`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) |
| Gedeelde staat | Geen nieuwe bron: `VoortgangFavoritesProvider` levert `isSaved` aan beide knoppen ([`voortgang-favorites-context.tsx:100-118`](../../src/lib/voortgang-favorites-context.tsx)) |

**De val die je hier moet dichtzetten.** `source` wordt bij het opslaan meegeschreven en gepersisteerd
([`account-favorites.ts:5,14,27`](../../src/lib/account-favorites.ts)), en het opslaan van een bestaand id is een
no-op ([`voortgang-favorites-context.tsx:107`](../../src/lib/voortgang-favorites-context.tsx)). Berekenen midden en
zijbalk `source` verschillend, dan bepaalt *wie het eerst klikt* wat er in de database staat. Eén helper resolvet
`source`, beide surfaces roepen hem aan. Dit is de enige plek waar "spiegel" stiekem twee bronnen kan worden.

**Meetpunt — en de G′-grens toegepast.**

- **Toegestaan:** `surface` toevoegen aan `dashboard_favorieten_save`
  ([`voortgang-favorites-context.tsx:110-115`](../../src/lib/voortgang-favorites-context.tsx)). De betekenis van het
  event verandert niet (er is een keuze bewaard), geen bestaande parameter krijgt een nieuwe betekenis; er komt een
  dimensie bij. `trackEvent` kent geen allowlist ([`ga4.ts:27-34`](../../src/lib/ga4.ts)), dus dit is één regel.
- **Verboden:** `source: "zijbalk"`. `source` betekent *wie het voorstelde* en is een databasekolom — een
  surface-waarde daarin bederft niet een rapport maar een tabel.
- **Leesregel:** rijen van vóór deze wijziging hebben geen `surface`. Annoteer de datum in GA4 en lees "ontbreekt"
  als *vóór de zijbalk*, nooit als *midden*.
- **Durable of niet:** save is vandaag GA4-only, dus consent-vertekend. Houd dat zo in plak 1 en zeg wat het kost.
  Een durable event (drie plekken: [`events.ts:8-94`](../../src/lib/events.ts) ·
  [`account-events-client.ts:3-19`](../../src/lib/account-events-client.ts) ·
  [`api/account/events/route.ts:9-24`](../../src/app/api/account/events/route.ts)) verdient zijn kosten pas wanneer
  er een betaalde kaart bewaard kan worden — dan hangt er geld aan het getal.

---

## F. `MijnKeuzeTile`-migratie: waar de inhoud landt

| Wat verdwijnt | Wat het vervangt | Voorwaarde |
|---|---|---|
| Domein-variant ([`DomainKompasScreen.tsx:172`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) | Zone 4 in de zijbalk — maar **gescopet op de open laag**, niet op het domein | De domeinbrede lijst moet elders volledig zijn: Voortgang toont "N gekozen" per laag én de keuzes zelf ([`PrioriteitenLadder.tsx:204-209,263-298`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx)), Favorieten toont ze cross-domein |
| Home-variant ([`KompasHomeCard.tsx:815-825`](../../src/components/dashboard/kompas/KompasHomeCard.tsx)) | **Eén regel** met telling en doorklik naar Favorieten | Dezelfde vorm die het ecosysteem-verdict §H al voorschrijft voor de Voortgang-hub (*"keuze-archief als één regel per domein"*, r.198). Geen nieuwe tegel |
| Herkomstregel "Laag N · naam" ([`MijnKeuzeTile.tsx:89-91,114`](../../src/components/dashboard/MijnKeuzeTile.tsx)) | Diezelfde regel op Favorieten | **Harde voorwaarde:** [`FavorietenView.tsx`](../../src/components/dashboard/voortgang/FavorietenView.tsx) kent `parseLadderFavoriteLayer` niet en toont vandaag alleen domein, `kind` en `source` ([`:14-55`](../../src/components/dashboard/voortgang/FavorietenView.tsx)). Zonder deze toevoeging verlies je de terugweg naar de laag |
| CTA "Open Mijn Dag →" + `dashboard_mijn_keuze_open_agenda` ([`MijnKeuzeTile.tsx:61-68,127-133`](../../src/components/dashboard/MijnKeuzeTile.tsx)) | Niets in de zijbalk (roadmap §2 P4). Het domeinscherm houdt zijn eigen knop mét eigen event ([`DomainKompasScreen.tsx:190-199`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) | Het event **retiret**; richt het niet op de nieuwe link — de surface die het mat bestaat niet meer |

**Drie schulden die in dezelfde plak horen.**

1. **Gat in het grid.** De home-tegel is een container-query-raster met expliciete plaatsing: "Mijn keuze" is
   `order-2` op `col-start-2 / row-start-2`, en bij `@920px` `row-span-2 / row-start-1`
   ([`KompasHomeCard.tsx:817`](../../src/components/dashboard/kompas/KompasHomeCard.tsx)); "Voortgang" staat op
   `col-start-1 / row-start-2` ([`:829`](../../src/components/dashboard/kompas/KompasHomeCard.tsx)). De sectie
   weghalen laat een halve kolom leeg staan op elke breedte boven 720px. Dat is een layout-klus, geen delete.
2. **Copy die liegt.** [`PrioriteitenLadder.tsx:320`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx)
   zegt tegen de gebruiker: *"Wat je hier kiest, landt bij Mijn keuze op Kompas"*. Onwaar zodra de tile weg is.
3. **Dood bestand.** [`BewegingKompasScreen.tsx:173`](../../src/components/dashboard/domain/BewegingKompasScreen.tsx)
   rendert de tile nog en wordt nergens geïmporteerd. Verwijder het in dezelfde plak, anders meldt de volgende
   grep-audit een derde vindplaats die niemand meer kan plaatsen. De home-varianttests
   ([`__tests__/MijnKeuzeTile.test.tsx:83-130`](../../src/components/dashboard/__tests__/MijnKeuzeTile.test.tsx))
   verhuizen mee of vervallen met de tegel.

---

## G. Schap-transitie — en het tekenbare voorstel voor R3

**Wat het schap ís, gerekend met correctie C-a.** `SchapView` is 309 regels React, over drie domeinen
([`schap-availability.ts:22`](../../src/lib/schap-availability.ts)), met een domeinschakelaar
([`SchapView.tsx:127-141`](../../src/components/dashboard/voortgang/SchapView.tsx)) en tot vier tabs
([`schap-tabs.ts:15-48`](../../src/lib/schap-tabs.ts)): Leefstijl, Producten, Diensten (alleen beweging), Favorieten.
De Leefstijl-tab is **geen etalage** maar een werkplek: `PrioriteitenLadder` met Aanbevolen + Mijn keuze per laag en
"Zet op Mijn Dag" ([`SchapView.tsx:50-55`](../../src/components/dashboard/voortgang/SchapView.tsx)). Dat is dezelfde
handeling, met dezelfde knop, op dezelfde sleutel, als Kompas-domein en als Voortgang.

Daarmee is de W4-gate zoals hij geformuleerd staat — *"schap-iframe uit"* — niet uitvoerbaar: er is geen iframe, en
één vlag omzetten haalt tegelijk het enige aanbod-oppervlak van slaap en voeding weg terwijl hun lagen nog niets
dragen (W2 is één domein).

### R3-voorstel — **getekend 22 augustus 2026** (roadmap §7.1)

**W4 vervalt als één gate en wordt drie, elk met een eigen conditie.**

| Gate | Wat eruit gaat | Conditie | Af te lezen aan |
|---|---|---|---|
| **W4a · de doublure** | De **Leefstijl-tab** verdwijnt uit `resolveSchapTabs` ([`schap-tabs.ts:20-24`](../../src/lib/schap-tabs.ts)). Het schap wordt wat zijn naam zegt: aanbod (Producten/Diensten) + Favorieten | Zodra de zijbalk save op de laag draagt op dat domein (plak 1–3 van §I). Geen W1 nodig | `dashboard_schap_tab_selected` — het aandeel `leefstijl` moet vóór verwijdering al dalen; doet het dat niet, dan is de tab de werkplek die mensen kiezen en is dít het signaal dat de zijbalk zijn belofte niet waarmaakt |
| **W4b · de bestemming** | Het schap houdt op een deur te zijn, **per domein**, niet globaal | Per domein: W1 klaar én dat domein draagt kaarten mét oordeel op de laag (W2) | De kruising uit ecosysteem-verdict §I: `recommendation.card_clicked > choice.shelf_opened` voor dát domein |
| **W4c · het event** | `choice.shelf_opened` retiret **per emitter, niet per datum**: [`KompasOndersteuningTile.tsx:89`](../../src/components/dashboard/kompas/KompasOndersteuningTile.tsx) → [`MeerHulpBridgeSheet.tsx:53`](../../src/components/dashboard/agenda/MeerHulpBridgeSheet.tsx) → [`LeefstijlprofielDomeinScherm.tsx:307`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx) → als laatste de domeinschakelaar [`SchapView.tsx:97`](../../src/components/dashboard/voortgang/SchapView.tsx) | De laatste emitter valt met de laatste W4b-gate | GA4-annotatie op de dag dat de laatste emitter valt, plus het schrappen uit de drie registratieplekken |

**Hoe Kompas interactief blijft terwijl het schap nog leeft (W2).** De twee surfaces beantwoorden dan verschillende
vragen en dat is te handhaven zonder vlag: Kompas-domein + zijbalk beantwoorden *"wat past op déze laag"* (gratis
acties, save, moment), het schap beantwoordt *"wat kost geld en wat vinden we ervan"* (Producten/Diensten mét oordeel).
De overlap die vandaag bestaat is exact één ding — de Leefstijl-tab — en dat is precies wat W4a weghaalt. Zolang W4a
niet is uitgevoerd, staat dezelfde handeling op drie plekken, en dát is het echte transitierisico, niet het bestaan
van het schap.

**Wat dit betekent voor de vraag in roadmap §6:** nee, W4 blijft niet staan zoals geformuleerd. Als één gate valt hij
om op de dag dat je hem inschakelt; als drie gates is hij tekenbaar en omkeerbaar per domein.

---

## H. Dashboard-help

**Inline paneel.** Zone 5 van §B, uitklapbaar, in de plaats van de altijd-zichtbare linkregel van
[`Dashboard.tsx:3531-3563`](../../src/components/dashboard/Dashboard.tsx). Eén ding gaat **niet** achter de uitklap:
de alinea *"adviezen op basis van leefstijl, geen medische diagnoses"*
([`:3556-3561`](../../src/components/dashboard/Dashboard.tsx)) blijft altijd zichtbaar — dat is een
compliance-regel, geen help-tekst.

**De SSOT, gesplitst in twee eerlijke helften.**

| Vraag | Bron | Status |
|---|---|---|
| *"Waar in de route zit ik?"* | `DASHBOARD_ROUTE_STEPS` ([`dashboard-route.ts:10-53`](../../src/data/dashboard-route.ts)) — check → plan → dashboard → check-ins → hermeting → bijsturen | Bestaat, herbruikbaar, wordt al door de publieke pagina gedeeld |
| *"Wat doet dit scherm, en waar hoort welke handeling?"* | **Nieuw** `src/data/dashboard-help.ts`: één regel per surface | Bestaat niet. En het is een kopieerklus, geen ontwerpklus: roadmap §1 is die tabel al — zes surfaces, elk met "de ene vraag" en één "niet" |

**Wat op de publieke pagina blijft: alles.** `/hoe-werkt-dashboard` is een acquisitie-surface met eigen metadata,
canonical, FAQ- en HowTo-schema en een A/B-variant
([`hoe-werkt-dashboard/page.tsx:19-23,30-40`](../../src/app/hoe-werkt-dashboard/page.tsx)). `dashboard-unlock.ts`
blijft daar de SSOT van en wordt **niet** in het dashboard geïmporteerd — de voorbeeldscores op
[`:83-91`](../../src/data/dashboard-unlock.ts) zijn verzonnen en zouden naast de echte scores van de gebruiker komen
te staan.

**Meetpunt:** één nieuw GA4-event `dashboard_help_opened { surface, tab }`. Niet `dashboard_context_opened`
uitbreiden ([`CockpitFrame.tsx:167`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)) — dat betekent *"de
contextkolom ging open"*, heeft een lopende reeks, en een tweede betekenis erin duwen is exact de G′-fout.

---

## I. Slice-volgorde — vijf, beweging eerst

**W1 staat niet in deze lijst, en dat is het punt.** Geen enkele plak hieronder heeft `LayerRecommendation` nodig;
ze leunen alleen op `resolveDomainLadderReadout`, dat er is. W1 loopt ernaast of erna, als gate voor W2 (kaarten),
niet voor de zijbalk.

| # | Plak | Wat erin zit | Wat er niet in zit | Waaraan je het afleest |
|---|---|---|---|---|
| **1** | **Zijbalk-fundament, beweging** | Laagselectie omhoog naar `domain-ladder-focus-context` (controlled-patroon uit `PrioriteitenLadder`) · LayerStrip (zone 2) · aanbevolen-kaart mét *vanwege* uit `evidenceByLayer` (zone 1) · één actie + save (zone 3) · `surface` op `dashboard_favorieten_save` · de twee drawer-defecten ([`CockpitFrame.tsx:320,347`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)) | `MijnKeuzeTile`-verwijdering · help · andere domeinen · kaarten · `dienst` | `dashboard_favorieten_save{surface}` — aandeel zijbalk vs. midden · `beweging_ladder_layer_open{surface}` — wisselt iemand überhaupt van laag in de zijbalk · `dashboard_context_opened{presentation}` als noemer onder 1280px |
| **2** | **`MijnKeuzeTile` eruit** | Zone 4 (gekozen op deze laag, mét unsave) · laag-herkomst in `FavorietenView` · home-sectie wordt één regel + telling · copy-fix [`PrioriteitenLadder.tsx:320`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx) · dood `BewegingKompasScreen.tsx` weg · tests mee · `dashboard_mijn_keuze_open_agenda` retire | Nieuwe archief-functionaliteit op Favorieten (filters, sortering) | `dashboard_voortgang_hub_click{destination:"favorieten"}` ([`VoortgangHub.tsx:128`](../../src/components/dashboard/VoortgangHub.tsx)) moet stijgen; blijft hij vlak, dan is het archief onbereikbaar, niet ongewenst |
| **3** | **De andere React-domeinen** | slaap · stress · voeding, elk volgens de precedentie-tabel in §D — inclusief voedings **lege** staat zonder "Aanbevolen"-label en stress zonder feitzin | verbinding (iframe) · nieuwe checks · T1d-stressnapshot | `${domain}_ladder_layer_open{surface}` per domein; en of het aandeel saves-uit-de-zijbalk op domeinen zónder feitzin significant lager ligt — dat is de prijs van een ontbrekende *vanwege* |
| **4** | **Help inline** | `dashboard-help.ts` (zes surfaces uit roadmap §1) · uitklap in zone 5 · disclaimer blijft buiten de uitklap · `dashboard_help_opened` | Wijziging aan `/hoe-werkt-dashboard` · `dashboard-unlock.ts` aanraken | `dashboard_help_opened` per tab; en of `/onderbouwing`-kliks uit het dashboard dalen (dan beantwoordt de help de vraag ter plekke) |
| **5** | **Schap W4a** | Leefstijl-tab uit `resolveSchapTabs`; schap = aanbod + favorieten | W4b · W4c · `SCHAP_DOMAINS` aanraken · iets aan de Producten-tab | `dashboard_schap_tab_selected` vóór en ná; `choice.shelf_opened` per emitter blijft ongewijzigd draaien |

**Volgorde-lock:** plak 5 komt ná 1–3. Wie de Leefstijl-tab weghaalt vóórdat de zijbalk save draagt op alle vier de
React-domeinen, haalt een werkende werkplek weg en zet er niets voor in de plaats.

---

## J. Tegenspraak

Drie argumenten tegen de zijbalk als keuzehart, elk met de drempel waarop het besluit terugkomt. Een getekend besluit
sluit het argument niet uit — het verplaatst het hierheen.

**J1 · De zijbalk bestaat niet waar de doelgroep zit.** `COCKPIT_CONTEXT_SIDEBAR_MQ = "(min-width: 1280px)"`
([`cockpit-context-layout.ts:2`](../../src/lib/cockpit-context-layout.ts)). Daaronder is het keuzehart een paneel
achter een belletje ([`CockpitHeader.tsx:142-149`](../../src/components/dashboard/cockpit/CockpitHeader.tsx)), dicht
bij elke paginaload ([`CockpitFrame.tsx:132`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)), zonder scrim
([`:320`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)), en `useMediaQuery` geeft bij de eerste render
`false` ([`use-media-query.ts:29`](../../src/lib/use-media-query.ts)) zodat zelfs desktop even in drawer-logica
begint. CLAUDE.md zegt: test op 375px, want daar zit de doelgroep. Op 375px is het hart dus altijd één tik weg.
**Drempel:** vuurt `dashboard_context_opened` op minder dan 1 op de 5 domeinscherm-sessies onder 1280px, dan is de
zijbalk daar geen hart maar een lade — en is het midden feitelijk het product. Dan keert R2 terug als: *primair
betekent primair boven 1280, en het midden is de norm.*

**J2 · Save-primair scheidt de handeling van de tekst waar hij bij hoort.** In het midden staan actiezin en knop op
één regel ([`LadderActionRow.tsx:66-75`](../../src/components/dashboard/domain/LadderActionRow.tsx)) — en dat is
bewust: het doc-comment erboven ([`:26-30`](../../src/components/dashboard/domain/LadderActionRow.tsx)) legt uit dat
gestapelde knoppen "als een formulier" lazen. In de zijbalk liggen zin en bevestiging een hele kolom uit elkaar.
**Drempel:** blijft het aandeel saves-uit-de-zijbalk na twee weken onder een derde van het totaal — meetbaar alleen
als `surface` mét de knop meegaat (§E) — dan was R2 een ontwerpvoorkeur, geen gebruikersbehoefte, en verhuist
"primair" terug naar het midden met de zijbalk als spiegel.

**J3 · Op de meeste lagen kan de belofte niet waargemaakt worden.** De zijbalk belooft *aanbevolen laag + vanwege*.
Tel de paren: 5 domeinen × 6 lagen = 30. Een echte feitzin bestaat vandaag op beweging P1–P3
([`domain-ladder-readout.ts:100-104`](../../src/lib/domain-ladder-readout.ts)) en slaap P1, P2, P3, P5
([`sleep-checkin-readout.ts:47-55`](../../src/lib/sleep-checkin-readout.ts)) — **7 van de 30**. Stress levert een
lege `evidenceByLayer` ([`:176`](../../src/lib/domain-ladder-readout.ts)), voeding en verbinding leveren helemaal
geen readout ([`:190`](../../src/lib/domain-ladder-readout.ts)). Op 23 van de 30 paren is de "vanwege" dus een
samenvatting in het jasje van een reden. **Drempel:** verschijnt het label "Aanbevolen" op een paar zonder feitzin,
dan is het decoratie — en de toets is machinaal: geen "Aanbevolen"-kicker waar `evidenceByLayer[laag]` leeg is én
`whyWait` `null` geeft.

**J4 (extra) · De kolom is nu al vol.** Met een open laag draagt hij `laag` + `keuze`
([`cockpit-inspector.ts:114-138`](../../src/lib/cockpit-inspector.ts)) plus de infokaart
([`Dashboard.tsx:3629`](../../src/components/dashboard/Dashboard.tsx)); in de val-stand komen daar de
hermeting-actie en de Future You-voet bij
([`CockpitInspector.tsx:119-137`](../../src/components/dashboard/cockpit/CockpitInspector.tsx)). Er komen navigator,
actie, save en help bij. In 288px is dat de overladings-grens uit G′, toegepast op pixels in plaats van op events.
**Drempel:** heeft de kolom bij één open laag op 1280px een eigen scrollbalk nodig, dan is de cap uit §B-regel 1
overschreden en moet er een zone uit — en dan is dat zone 5 (help), niet zone 1.

### Mijn aanbeveling

Bouw plak 1 zoals hij in §I staat, met drie voorwaarden die geen van drieën duur zijn: `surface` gaat mee in dezelfde
commit als de knop (anders is R2 principieel onmeetbaar), de laagselectie verhuist naar één bron vóórdat er een
navigator komt (anders bouw je de N6-overtreding die je wilde vermijden, alleen stiller), en er komt geen
"Aanbevolen"-label op een laag zonder reden. Zet de drempels uit J1 en J2 vóór de bouw op papier — dan is de vraag
over twee weken een aflezing en geen discussie.

En teken R3 in de drie gates uit §G. **Gedaan op 22 augustus 2026** — daarmee staat er geen open besluit meer in dit
document, en is de volgende stap plak 1, niet nog een ronde.

---

**Meetpunt van dit document:** geen product-events — besluitstuk. Af te lezen aan het aantal PARKEER-items in §A
(één: het spectrum-deel van S5, geblokkeerd op W1) en aan de tijd tot plak 1 start.
