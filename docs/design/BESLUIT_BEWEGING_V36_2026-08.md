# Besluit — Beweging v3.6 · één deur, twee bronnen op Favorieten

**Artefact:** [`beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html`](beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html) — self-contained, fonts inline, geen CDN
**Vervangt:** v3.5 als leidend beeld. v3.5 blijft staan als referentie voor de PriorityLadder en het schap.
**Datum:** 18 augustus 2026 · poort 1 van de beweging-route-opdracht

---

## A · De vier naden, woordelijk

Deze vier zijn op 16 augustus 2026 beslist en hier woordelijk overgenomen. Ze zijn niet heropend.

**N1 · Drie woorden, drie rollen.** Ze verwijzen naar hetzelfde spoor, maar zijn niet inwisselbaar:

| woord | rol | waar |
|---|---|---|
| **Maak een keuze** | de handeling: de deur naar het schap | brug op Vandaag en Mijn Dag → scherm B |
| **Mijn keuze** | het resultaat: wat de klant koos | als rij op Vandaag en Mijn Dag, als sectie in Favorieten |
| **Favorieten** | het nav-item op Voortgang dat beide secties draagt | Voortgang › Favorieten |

**N2 · Twee bronnen, twee secties.** Favorieten toont ze náást elkaar, altijd in deze volgorde en altijd met de bron in beeld:

1. **Aanbevolen** — komt uit de leefstijlcheck en de beweegcheck. Alleen leefstijl-activiteiten. Dit is wat het systeem afleidt.
2. **Mijn keuze** — komt van de klant. Activiteit, supplement, dienst, begeleiding — alles wat in het schap staat. Dit is wat de klant wil.

Twee secties, geen twee staten van dezelfde kaart. Een aanbeveling wordt nooit stilzwijgend een keuze: de klant zet hem er zelf naast.

**N3 · Kompas/home en Vandaag/Mijn Dag zijn synoniem in spraakgebruik.** Er verandert **niets** in de UI, de labels of de nav. Geen rename-werk, geen zoek-en-vervang. Nav blijft Vandaag · Agenda · Voortgang · Hermeting; Vandaag (tab 1) en Mijn Dag (Agenda, tab 2) blijven twee aparte surfaces met hetzelfde contract.

**N4 · Afgeleide grens — "Mijn keuze" op Vandaag zonder het schap mee te slepen.**

> **Mag** op Vandaag en Mijn Dag: stofnaam of activiteit + tijdstip + afvinkactie — *"Magnesium · voor het slapen"*, *"Krachttraining thuis · 19:00"*.
> **Mag niet**, in geen enkele staat: merk, prijs, oordeelslabel ("Aanrader"), claimtekst, vergelijkingslink, affiliate-link.

**N5 · Leefstijlkeuze op Leefstijlprofiel, Favorieten = opgeslagen.** (18 aug 2026, implementatie)

- **Leefstijlprofiel** draagt per domein: onderbouwing (ladder/readout) + leefstijlkeuze (toggle Aanbevolen/Mijn keuze) + supplementen/producten/diensten.
- **Leefstijlprofiel root** toont de leefstijlkeuze-hub (geen vitaliteits-hero meer).
- **Favorieten** (nav-item) = alleen door de klant opgeslagen items (heart), account-gebonden in `account_favorites`.
- Legacy `screen=favorieten&fav={domein}` redirect naar `screen=leefstijlprofiel&fav={domein}`.

---

## B · Wat v3.6 intrekt, en waarom

Vier plekken in het bestaande materiaal spraken N1–N4 tegen. Ze zijn alle vier ten gunste van N1–N4 beslecht — §2 van de opdracht verklaart die bindend. Hieronder staat per stuk wat vervalt en op welke grond, zodat de intrekking navolgbaar is en niet stilzwijgend.

### B1 · Het dual-label met gesplitste routing — INGETROKKEN

`BESLUIT_BEWEGING_PRIORITEITEN_V35` §B r.38-40 en de acceptatiematrix r.169-173 legden vast:

```
bridgeFirst() = !extraChosen && !hasVisitedShelf
  true  → "Voeg iets toe aan je basis"  → scherm B
  false → "Zet er iets naast"           → scherm D
```

**Vervalt.** De deur heet altijd **"Maak een keuze"** en gaat altijd naar scherm B.

De grond is niet "N1 zegt het" maar het gevolg van N4. De tweede bestemming bestond omdat je op Mijn Dag zag wát je gekozen had. Onder N4 staat dat nu op Vandaag zélf, als rij. Iemand doorsturen naar een surface om iets te zien dat hij al voor zich heeft, is een omweg met een knop eromheen. Wat overblijft is één deur naar de enige plek met aanbod.

**Lock 2 is daarmee niet losgelaten maar strakker.** Label en bestemming zijn constanten (`DOOR_LABEL`, `DOOR_TARGET`) en kúnnen per definitie niet uit elkaar lopen. `bridgeFirst()` leeft door en stuurt uitsluitend de lead-regel onder de knop.

`normalize()` blijft bij verval óók `hasVisitedShelf` terugzetten. De reden is veranderd, de noodzaak niet: het label hangt er niet meer aan, de lead-regel wel — en die zou anders blijven verwijzen naar een keuze die verlopen is.

### B2 · "Favorieten is het schap" — INGETROKKEN voor beweging

`BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1` §A r.16, §D4 r.100 en de prebuild `renderFAV` r.1393/1398/1481 maken Favorieten en het schap één ding.

**Vervalt.** N1 scheidt ze: het schap is scherm B, bereikt via de deur; Favorieten is het nav-item op Voortgang dat toont wat er uit de check volgt en wat je zelf koos.

De scheiding is niet cosmetisch. Het schap is een **keuzesurface** — alles wat er is, met filters, lenzen en een postcodeveld. Favorieten is een **terugblik** — wat er voor jou uit is gekomen, uit twee bronnen. Die twee in één scherm proppen was precies wat §A van datzelfde besluit elders bestrijdt: één surface die twee rollen draagt.

### B3 · Eén blok "gekozen" op Voortgang — INGETROKKEN

`beweging-…v3.5.html` `renderChosen()` r.2006-2027 zette de systeem-afgeleide basis (r.2010) en de zelf gekozen extra (r.2017) in één blok, allebei getagd "Favorieten".

**Vervalt.** N2 verbiedt dat een aanbeveling stilzwijgend een keuze wordt. De basis staat nu onder **Aanbevolen** met de bron erbij (`A_SOURCE`), de extra onder **Mijn keuze**. Dat geldt op scherm C én op scherm F.

### B4 · De nav-labels in de supplementroute-prebuild — INGETROKKEN

`dashboard-supplementroute-prebuild-v1` r.1166 gebruikt `['Vandaag','Mijn Dag','Voortgang','Hermeting']`.

**Vervalt.** N3 houdt Agenda. v3.6 heeft er één `appbar(active)`-helper voor, zodat er nergens een vijfde tab of een andere naam in kan sluipen. Scherm A kreeg de appbar die het in v3.5 niet had.

### B5 · Wat er níét is ingetrokken

- **De mini-ladder blijft weg.** `slaap-piramide-v2-prebuild` r.1452 rendert `renderLadder(s, 'mini')` in zijn rail; lock 3 en v3.5 §C verbieden die variant. Bij beweging draagt de rail de brug-tegel. Twee varianten: `full` en `rail`.
- **`P1`–`P6` in plaats van "Prioriteit N"** (`BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1` §D1) is **niet** doorgevoerd. Het raakt `PRIORITIES[].idx`, alle aria-labels (`beweging-…v3.5.html` r.1524), `metaLine`, `WHY_WAIT` en de lopende copy in `wel`/`niet`/`scope`. Dat is een sweep door het hele domein, geen gat in poort 1. Zie §G.

---

## C · Wat er gebouwd is

### C1 · Vandaag › Beweging krijgt de slaap-v2-vorm

Scherm E is herbouwd op `renderK()` uit `slaap-piramide-v2-prebuild` r.1475, in beweegstijl:

| onderdeel | bron | inhoud bij beweging |
|---|---|---|
| `kdome` + ring | slaap v2 r.321-325, `ring()` r.1101 | score 52 · Matig · gemeten 2 augustus, uit `dashboard-supplementroute-prebuild-v1` r.625 |
| aandachtsbalk | slaap v2 `renderAttnbar` r.1433 | top-3 uit `PRIO_STATE`, kleur **én** statuswoord in tekst |
| de handeling | v3.5 scherm E r.1826-1846, ongewijzigd | Gedaan · Ik doe de korte · *"Merk je er iets van?"* 1-5 |
| drie gratis acties | slaap v2 `renderKActies` r.1458 | `PRIO_DOING` op de winst-prioriteit, elk met "Zet op Mijn Dag ›" |
| Mijn keuze-rij | v3.5 "Vandaag ook" r.1858 + acties uit `renderD` r.2145-2152 | activiteit + tijd + afvinken, onder de grens van N4 |
| CTA-stapel | slaap v2 r.1497 | Open je beweegbeeld · Mijn Dag › vanavond · footnote |
| rechter rail | slaap v2 `renderKBridge` r.1450 | de deur + koppelstrip — **geen** tweede ladder |

**Eén afwijking van de opgegeven volgorde, met opzet.** De opdracht zette de drie gratis acties vóór de Mijn keuze-rij en liet de handeling impliciet in de CTA-stapel, zoals slaap v2 doet. Bij slaap kán dat: daar *zijn* de drie acties de handeling. Bij beweging is er een apart plan-item, en dat eerst tonen is het verschil tussen een doe-surface en een suggestielijst. De volgorde is nu: kdome → **de handeling van vandaag** → drie gratis acties → Mijn keuze → CTA-stapel.

**Eén inhoudelijke overlap, benoemd in plaats van verstopt.** `PRIO_DOING[2][0]` is *"Twee krachtsessies per week, vijf oefeningen, hele lichaam"* en het plan eronder is *"Kracht thuis, 2× per week"*. Dat is dezelfde zaak, twee keer. De rij verbergen zou de bron vertakken; hem laten staan zonder uitleg leest als een herhaling. De tegel zegt daarom op de winst-prioriteit: *"De eerste is de richtlijn; je plan hierboven is jouw invulling ervan. De andere twee staan er los van."* **Dit is de zwakste copy in v3.6 en de eerste plek om naar te kijken.**

### C2 · Voortgang › Favorieten, scherm F

Vorm uit `dashboard-supplementroute-prebuild-v1` `renderFAV()` r.1395, gesplitst volgens N2:

- **Keten-strip** Check → Onderbouwing → Schap → Vergelijking. Check en Onderbouwing staan op `data-on`, Schap is de klikbare volgende stap, Vergelijking nog niet. De caption zegt waar je staat, want Favorieten is zelf geen schakel in die keten.
- **Aanbevolen** — je basis met `A_SOURCE` erbij, plus de acties van de twee bovenste prioriteiten uit `PRIO_DOING`, elk met *"Afgeleid uit je check — hier verdienen we niets aan"*. Geen oordeelchip, geen prijs, geen commissie-regel: dit is geen aanbod.
- **Mijn keuze** — de gekozen kaart via `cardHtml()`, mét het volledige verdict-schema en de commissie-microcopy per kaart.
- **Aanvullen** — prioriteit 6, gegate, poortstand in gewone taal, geen kaart en geen teaser.

**Waarom Favorieten wél een oordeel draagt en Voortgang › Beweging niet.** Dat lijkt een gat in lock 5, maar het is de grens zelf. De ladder verklaart de vólgorde en mag daarom geen aanbod dragen. Favorieten gaat over wat je koos, en een keuze zonder het oordeel erbij is een lijstje. Kiezen zelf gebeurt nog steeds op het schap.

### C3 · N4 in de data, niet in de opmaak

`OPTS` heeft nu `dayTitle`/`daySub` naast `title`/`sub` — één record, twee uitlezingen.

| id | schap (`title`) | doe-surface (`dayTitle` · `daySub`) |
|---|---|---|
| `pt-intake` | PT-intake bij Kracht & Co | PT-intake · Eenmalige afspraak · 45 minuten |
| `krachtgroep` | Krachtgroep 45+ bij De Vliert | Krachtgroep 45+ · Vaste avond |
| `traject` | Online begeleiding — Beweegcoach Nederland | Online begeleiding · Sessie van deze week |
| `baantjes` | Rustig baantjeszwemmen (Sportiom, 4,6 km) | Rustig baantjeszwemmen · Rustig uur |
| `magnesium` | Magnesiumcitraat | Magnesium · 1 capsule bij het avondeten |

Het zijn eigen velden, geen afgeleide van `title`. Een afgeleide (afkappen op " bij ", eerste komma, o.i.d.) doet het bij deze acht toevallig goed en lekt bij de negende alsnog een merknaam. Bij `magnesium` valt bovendien *"pas na 14 dagen zinvol"* weg: dat is claimtekst, en die hoort niet op een dag.

---

## D · Acceptatiematrix — vervangt v3.5 §K

De label/bestemming-kolom uit v3.5 is weg: die is nu constant. Wat de standen onderscheidt is de Mijn keuze-rij en de vulling van Favorieten.

| Reviewer-staat | Deur | Mijn keuze op E/D | Favorieten · Aanbevolen | Favorieten · Mijn keuze |
|---|---|---|---|---|
| `eerste_keer` | Maak een keuze → B | — | basis + 6 acties | lege staat |
| `dag_daarna` | Maak een keuze → B | — | basis + 6 acties | lege staat |
| `extra_gekozen` | Maak een keuze → B | zichtbaar, afvinkbaar | basis + 6 acties | kaart mét oordeel |
| `extra_verlopen` | Maak een keuze → B | weg (`normalize()`) | basis + 6 acties | lege staat |
| `extra_gedisst` | Maak een keuze → B | weg tot morgen | basis + 6 acties | kaart, mét notitie |
| `geen_check` **(nieuw)** | Maak een keuze → B | — | lege staat "nog geen check" | lege staat |

`geen_check` is een zesde **stand**, geen zesde staat: de vijf uit v3.5 zijn ongewijzigd. Hij bestaat om de lege staten inspecteerbaar te maken zonder omweg — hetzelfde motief als de `gatepick`-schakelaar in slaap v2 r.1295.

**De derde lege staat — "check binnen, niets aanbevolen" — is op beweging onbereikbaar.** Er is altijd een basis. De tak staat er wel, en dat is opzet: de vier domeinen die deze blauwdruk overnemen kunnen hem wél raken. Hem hier weglaten betekent dat de eerste die kopieert hem alsnog moet bedenken.

---

## E · Machinaal getoetst

Over **72 combinaties** — 6 schermen × 6 standen × 2 breedtes, in Chrome, elke disclosure in rust:

| toets | uitkomst |
|---|---|
| JS-fouten in de console | **0** |
| `<h1>` per scherm | **1**, in alle 72 |
| nav-tabs | `Vandaag\|Agenda\|Voortgang\|Hermeting` in alle 72 (scherm B draagt geen appbar — zie §G) |
| horizontale overflow | **0** |
| N4 · merk op Vandaag / Mijn Dag / A (`Kracht & Co`, `De Vliert`, `Beweegcoach Nederland`, `Sportiom`, `Magnesiumcitraat`) | **0** |
| N4 · afstand (`\d,\d km`) op een doe-surface | **0** |
| N4 · oordeelslabel (`Aanrader`, `Alleen als…`, `Nu niet`, `Nog geen oordeel`, `Bekijk ons oordeel`) op een doe-surface | **0** |
| N4 · prijs (`€`, `euro`, `per maand`) op een doe-surface | **0** |
| copy-lock v3.5 §J (`stappenplan`, `fase`, `spoor`, `cockpit`, `kompas`, `journey`, `coming soon`, `biohack`, `Laag N`) | **0** |
| inname-nooit-status (`tekort`, `gebrek`, `te weinig`, `deficiënt`) | **0** |
| advies-taal (`wij raden aan`, `ons advies`) | **0** |
| aanraakvlakken < 44px | **0** (de twee keten-knoppen stonden op 32px en zijn gerepareerd met een 44px-trefvlak om een 32px-pil) |
| mini-ladder-variant | **0 voorkomens** |

---

## F · Meetpunten

Ongewijzigd uit v3.5 §H, met twee aanpassingen:

| Event | Payload | Wijziging |
|---|---|---|
| `choice.shelf_opened` | `{ domain:'beweging', from_state, surface, target:'b' }` | **`label_variant` vervalt** — er is nog maar één label. `surface` blijft: die zegt wélke deur werd gebruikt |
| `dashboard.daily_action_toggled` | `{ domain:'beweging', priority, slot, planned:true }` | **hergebruikt** voor de drie gratis acties op Vandaag; bestond al (supplementroute §G) |
| `choice.extra_selected` · `choice.extra_dismissed` · `dashboard_vandaag_extra_toggled` | ongewijzigd | — |

Registratiepad bij bouw: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`.

**Meetpunt: `choice.shelf_opened` met `surface` — hier lees je af of de deur op Vandaag en die op Mijn Dag allebei gebruikt worden.** v3.5 mat of de gesplitste routing werkte; die vraag is weg. De vraag die overblijft is of één deur op twee surfaces er één te veel is. Blijft `surface=d` structureel leeg, dan draagt Mijn Dag een knop die niemand nodig heeft.

---

## G · Wat open staat

1. **Scherm B draagt geen appbar.** In v3.5 had geen enkel scherm er een behalve C en D; nu A, E, C, D en F hem hebben, valt B op. Onder welke tab hoort het schap? Het is bereikbaar vanaf Vandaag (de deur), Mijn Dag (de deur) en Voortgang (de keten op F) — drie tabs, één scherm. Ik heb er geen gekozen omdat elke keuze twee andere routes een verkeerde tab-highlight geeft. **Dit is een besluit voor jou.**
2. **`P1`–`P6` versus "Prioriteit N".** `BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1` §D1 trekt v3.5 lock 3 in en eist het ordinaal alleen in de mono-tab, met `aria-hidden`. v3.6 rendert nog `Prioriteit 2` in de aandachtsbalk, in `metaLine` en in aria-labels. Dat rechttrekken is een sweep door het hele domein en hoort in een eigen plak, niet in poort 1.
3. **De overlap-copy op de winst-prioriteit** (§C1). Werkt, maar is een uitleg van een structuurprobleem in plaats van een oplossing ervan.
4. **De keten-strip plaatst Favorieten niet.** Check → Onderbouwing → Schap → Vergelijking is de route; Favorieten is er geen schakel in. De caption vangt dat op. Als Favorieten een blijvend nav-item wordt, hoort het waarschijnlijk in de keten.
5. **v3.5 §M vraag 2 en 3** (vier knoppen op de extra-rij bij 375px, `Week 1 van 8` in de traject-optie) staan nog open en zijn in v3.6 niet aangeraakt.

---

## H · Scherm C uitgedund — 18 augustus, na review

C droeg negen blokken en werd de surface die alles deed. Drie zijn eraf, elk met een eigen adres:

| blok | naar | grond |
|---|---|---|
| `renderChosen` — het gekozen-blok | **scherm F** | Onder N2 staat daar hetzelfde in twee volwaardige secties mét de bron. Het hier nóg eens samenvatten is dezelfde inhoud op twee plekken — precies wat de deur/schap-scheiding moest oplossen |
| `renderKeten` — Check → Advies → Favorieten → Beste | **scherm F** (als `ketenHtml`, met de canonieke labels) | De keten gaat over de route naar het aanbod. C ligt daar niet op: C verklaart de volgorde |
| `renderOwnFold` — onze eigen begeleiding | **scherm F** | Dat is aanbod, ook al is het van ons (supplementroute §E2). Lock 5 zegt: Voortgang meet, doet niet. Een wachtlijstknop is doen |

Beide functies zijn **verwijderd**, niet uitgecommentarieerd — een prebuild met dode render-functies is een val voor wie hem overzet.

Wat overblijft hoort alle vijf bij één rol, meten en verklaren: readout (SSOT) · feitrijen · ladder · meetpad · de weg terug. Zeven top-level blokken, machinaal geteld. De kop is mee veranderd: *"Beweging · gekozen / Je basis, en één ding ernaast"* was de kop van een gekozen-scherm. Nu: *"Beweging · onderbouwing / Waarom je ladder er zo uitziet"*.

---

## I · Voortgang in `src/` — de staat, tegenover v3.5 en v3.6

Voortgang heeft in `src/` **zes** schermen: `hub` · `statistieken` (drie bliks) · `inzichten` · `favorieten` · `domein` · `lichaamssamenstelling` ([`VoortgangHub.tsx:595-670`](../../src/components/dashboard/VoortgangHub.tsx#L595-L670)). v3.5 kent er één (C), v3.6 twee (C + F). Dat verschil op zichzelf is geen fout; wat eronder zit wel.

### I1 · Lock 4 is niet gesloten — hij is omzeild

[`src/data/movement/lifestyle-priorities.ts:1-11`](../../src/data/movement/lifestyle-priorities.ts#L1-L11) legt in zijn eigen bestandscommentaar uit waarom:

> *"De prebuild heeft wél een PRIO_STATE en WHY_WAIT, maar die zijn daar een vaste demo-waarde — geen functie van echte beweegcheck-antwoorden. Er bestaat geen scoring-engine die per prioriteit winst/ok/watch/wacht berekent (in tegenstelling tot slaap). Dit bestand neemt daarom alleen `name`/`sub`/`kern` over en laat PRIO_STATE/WHY_WAIT bewust weg."*

Gevolg, met bewijs:

- `actions: []` voor alle zes lagen (r.25-72). De uitklap *"Wat je kunt doen"* is op beweging altijd leeg.
- [`VoortgangDomeinScreen.tsx:398-406`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L398-L406) rendert voor beweging `PrioriteitenLadder` — zelfselectie, **geen status** — terwijl slaap op r.298-311 `DomainLifestyleLadder` krijgt **mét** `layerStates` en `focusLayer` uit de readout.

**De readout en de ladder kunnen op beweging niet uiteenlopen omdat de ladder niets beweert.** Dat is geen SSOT, dat is een leeg vak. Het is de eerste bug om te sluiten, en de rest is cosmetiek zolang hij openstaat.

**v3.6 levert precies wat dat commentaar zegt te missen.** `PRIO_DOING` bestaat uit echte imperatieve zinnen, woordelijk uit `dashboard-supplementroute-prebuild-v1` r.640-646 — niet verzonnen, en niet uit `scope` gedestilleerd (wat het commentaar terecht afwees).

### I2 · "Favorieten" betekent in `src/` iets anders dan in N1/N2

[`FavorietenKeuzeSection.tsx:20-27`](../../src/components/dashboard/voortgang/FavorietenKeuzeSection.tsx#L20-L27) heet *"Jouw keuze"*, maar gaat over welk **domein** je als focus koos (`model.priorityIsUserChosen`). Dat is de focuskeuze, niet de schapkeuze. N1's *"Mijn keuze"* is dus bezet door een ander begrip — en de sectie die N2 eist bestaat niet.

### I3 · Drie ketens naast elkaar voor dezelfde reis

| bron | keten |
|---|---|
| v3.6 `ketenHtml` | Check → Onderbouwing → Schap → Vergelijking |
| [`StatistiekenBlikPanels.tsx:195, 316, 401`](../../src/components/dashboard/voortgang/StatistiekenBlikPanels.tsx#L195) | Stap 1 van 3 · Uit voeding → Stap 2 van 3 · Ons oordeel → Stap 3 van 3 · Welk potje |
| [`VoortgangRouteList.tsx:17-31`](../../src/components/dashboard/voortgang/VoortgangRouteList.tsx#L17-L31) | Statistieken · Favorieten · Jouw inzichten, onder *"Waar je dit verder uitzoekt"* |

Drie antwoorden op dezelfde vraag: waar ben ik, en waar ga ik heen.

### I4 · Het oordeel staat op drie oppervlakken

`SupplementVerdictPanel` rendert op [`VoortgangHub.tsx:232`](../../src/components/dashboard/VoortgangHub.tsx#L232) (favorieten), [`StatistiekenBlikPanels.tsx:367`](../../src/components/dashboard/voortgang/StatistiekenBlikPanels.tsx#L367) (advies) en [`DomainSupplementStance.tsx:179`](../../src/components/dashboard/voortgang/DomainSupplementStance.tsx#L179) (domein). Het supplementroute-besluit §I begrootte dit al op 4 → 1; die snoei is niet uitgevoerd.

### I5 · De roadmap staat ín de UI

**21 teaser-plekken** in `src/components/dashboard/`. De dichtste concentratie is [`VoortgangRouteList.tsx:124-174`](../../src/components/dashboard/voortgang/VoortgangRouteList.tsx#L124-L174): een blok met de kop **BINNENKORT** en drie rijen met de pills *"Binnenkort in te vullen"*, *"Binnenkort"* en *"In ontwikkeling"*.

Dat botst frontaal met de regel die v3.6 zelf op het scherm zet in `p6GateHtml`, overgenomen uit `dashboard-supplementroute-prebuild-v1` r.1446:

> *"Geen kaarten, geen teaser, geen 'binnenkort'. Een dichte deur die toch iets laat zien is geen dichte deur."*

En met v3.5 §J, dat `coming soon` in gerenderde tekst verbiedt. De productplanning is UI geworden: de gebruiker leest wat wij nog moeten bouwen, op de plek waar hij wil weten hoe hij ervoor staat.

Daarbij: `DomainSoonPill` en `DomainToolsGrid` staan in supplementroute §I op de lijst *"te verwijderen — dormant, geen meetpunt"*, maar worden nog aangeroepen op [`SleepScreen.tsx:257`](../../src/components/dashboard/SleepScreen.tsx#L257), [`StressScreen.tsx:184`](../../src/components/dashboard/StressScreen.tsx#L184) en [`Dashboard.tsx:2739`](../../src/components/dashboard/Dashboard.tsx#L2739).

### I6 · "Jouw inzichten" rendert licht op donker

[`VoortgangHub.tsx:349-356`](../../src/components/dashboard/VoortgangHub.tsx#L349-L356): een `VitalityGauge` van 300px met `variant="hero" theme="light" tone="light"` binnen de donkere dashboard-surface. Hetzelfde patroon staat op `Dashboard.tsx:573` en `:606`.

---

## J · Voorgestelde plak-volgorde voor `src/`

Zes plakken, elk los reviewbaar, elk ≤ ~400 gewijzigde regels.

| # | plak | raakt | acceptatie | grond |
|---|---|---|---|---|
| **P1** | **De beweegladder krijgt status.** Nieuwe `src/lib/movement-priority-state.ts` die uit de beweegcheck-antwoorden `winst/ok/watch/wacht` per prioriteit afleidt + `whyWait`; `MOVEMENT_PRIORITY_LAYERS` krijgt `actions` uit `PRIO_DOING`; beweging schakelt van `PrioriteitenLadder` naar `DomainLifestyleLadder` | `data/movement/lifestyle-priorities.ts` · nieuw `lib/movement-priority-state.ts` · `VoortgangDomeinScreen.tsx` | ladder toont per prioriteit een staat; readout-focus en winst-prioriteit komen uit één functie; test die uiteenlopen laat falen | I1 — alles hierna is cosmetiek zolang dit open staat |
| **P2** | **Vandaag › Beweging naar de v3.6-vorm.** kdome + ring + aandachtsbalk + drie gratis acties + Mijn keuze-rij + deur in de rail | `BewegingScreen.tsx` · `beweging/MovementTodayHero.tsx` · nieuw `kompas/DomainAttentionBar.tsx` | ≤5 secties; nul merk/prijs/oordeel op de surface; één deur | N4 + N5 |
| **P3** | **Voortgang › domein uitdunnen.** Elf blokken naar zeven, volgens §H | `VoortgangDomeinScreen.tsx` | readout draagt de SSOT-vlag; geen aanbod op de surface | §H + lock 4/5 |
| **P4** | **Favorieten wordt de twee secties.** `FavorietenKeuzeSection` → Aanbevolen + Mijn keuze; de focuskeuze verhuist naar de hub | `FavorietenKeuzeSection.tsx` · `VoortgangHub.tsx` | twee secties met bron in beeld; nul aanbevelingen die stilzwijgend keuze heten | I2 + N2 |
| **P5** | **De roadmap uit de UI.** 21 teaser-plekken weg; `DomainSoonPill` + `DomainToolsGrid` verwijderd; poortcopy in de plaats waar een deur echt dicht is | `VoortgangRouteList.tsx` · `SleepScreen` · `StressScreen` · `Dashboard.tsx` · 2 componenten **verwijderd** | nul treffers op `binnenkort\|in ontwikkeling\|coming soon` in gerenderde dashboard-tekst | I5 |
| **P6** | **Eén keten, één oordeel-oppervlak.** De drie-stappen-copy in Statistieken vervalt; `SupplementVerdictPanel` van drie plekken naar één | `StatistiekenBlikPanels.tsx` · `VoortgangHub.tsx` · `DomainSupplementStance.tsx` | één keten in het product; één oordeel-oppervlak | I3 + I4 |

**P1 eerst, en niet onderhandelbaar.** De rest verandert hoe het eruitziet; P1 verandert of het waar is.

---

## K · Plak P1 — uitgevoerd, 18 augustus

**De beweegladder krijgt status.** Wat lock 4 eiste is nu waar in `src/`, niet alleen in de prebuild.

### K1 · De ingreep

De winst-prioriteit wordt **afgeleid uit de focusdimensie die `buildMovementConclusion` al kiest** — dezelfde waarde die de readout-kop draagt. Een tweede regel naast de readout zou precies de tegenspraak scheppen die lock 4 verbiedt; nu kan er geen verschil van mening ontstaan, alleen een bug in één functie.

| bestand | wat |
|---|---|
| `src/lib/movement-ladder.ts` **(nieuw, 164 r.)** | `resolveMovementFocusPriority` · `resolveMovementLayerStates` · `movementLayerWhyWait` · `MOVEMENT_LAYER_STATE_LABEL` |
| `src/data/movement/lifestyle-priorities.ts` | `actions` gevuld voor P1-P4, woordelijk uit `dashboard-supplementroute-prebuild-v1` r.640-649; het commentaar dat de weglating rechtvaardigde is vervangen door de reden dat hij nu dicht is |
| `src/types/dashboard.ts` | `MovementCheckinReadoutData.ladder = { states, focus }` |
| `src/lib/account-dashboard.ts` | ladder herberekend uit `raw_inputs`, niet bevroren — zelfde grond als `factRows` (R0g): een regel-fix moet ook oude rijen bereiken |
| `DomainLifestyleLadder.tsx` | `domain` verbreed met `"beweging"`; de kop *"Wat je kunt doen"* verschijnt niet meer boven een lege lijst |
| `VoortgangDomeinScreen.tsx` | beweging mét check → `DomainLifestyleLadder` mét staten; **zonder** check blijft `PrioriteitenLadder` staan |
| `src/lib/__tests__/movement-ladder.test.ts` **(nieuw, 142 r.)** | 8 tests, draaien de echte engine |

### K2 · De mapping, en waar hij vandaan komt

| focusdimensie | prioriteit | grond |
|---|---|---|
| `zitten` | P1 | letterlijk *"Zitten onderbreken"* in de subtitel |
| `mobiliteit` | P1 | P1 heeft als resultaat *"je lijf blijft losser"* — soepel blijven woont daar |
| `kracht` | P2 | *"Spierbehoud"* in de subtitel |
| `conditie` | P2 | *"basisconditie"* staat in de naam |
| `intensiteit` | P2 | de aerobe richtlijn kent één norm met twee valuta's (`MOVEMENT_FACT_ROW_ORDER`: `aeroob` vat cardio en intensief samen) — apart laden zou één gat als twee prioriteiten tonen |
| `consistentie` | P3 | *"Progressief opbouwen"* begint per definitie pas als je het volhoudt |

P4-P6 staan er bewust niet in: voor specifiek sporten bestaat geen gemeten gat, P5 is marginale winst, P6 is gegate. Geen van drieën kan ooit de winst-prioriteit zijn.

### K3 · Wat de test vastzet

De belangrijkste test zet één veld per keer op 1 en controleert over **alle zes** focusdimensies dat `conclusion.focusDimension` en de winst-prioriteit dezelfde laag aanwijzen, én dat er precies één winst-laag is. Mist de mapping ooit een dimensie, dan valt precies die combinatie om.

Verder: geen winst-laag als alles sterk is · een open laag bóven de winst-laag blijft `watch` (de prebuild-regel *"dit telt mee, maar kracht levert nu meer op"*) · lagen zonder meting krijgen `wacht`, want geen meting is geen oordeel · alleen lagen ónder de winst-laag krijgen een wachtregel.

### K4 · Verificatie

`grep console.log src/` → 0 · `npx tsc --noEmit` → schoon · `npx vitest run` → 212 bestanden, 1919 tests, alles groen · `GET /dashboard` op de dev-server → 200, geen compile-fout.

`npx eslint . --max-warnings 0` faalt op **5 waarschuwingen — exact dezelfde 5 als op `HEAD`**, gemeten met een stash-vergelijking. Vier in `SleepCheckin.tsx` en `sleep-checkin-parse.ts`, één in `DomainLifestyleLadder.tsx:189` (ongebruikte `state`-prop, bestond al). Deze plak voegt er geen toe en haalt er geen weg; de gate staat dus al rood vóór dit werk.

**Omvang:** 135 gewijzigde regels + 306 nieuwe, waarvan 142 test. Code-deel ~299 regels — binnen de plakgrens.

**Meetpunt:** `beweging_ladder_layer_open` — bestond al (`PrioriteitenLadder` en `DomainLifestyleLadder` zenden allebei `${domain}_ladder_layer_open`), dus geen nieuw event en geen registratie op drie plekken nodig. Hier lees je af of mensen de winst-prioriteit nu daadwerkelijk openklappen; deed de ladder eerder niets, dan is dit de eerste keer dat dat cijfer iets betekent.

---

## L · Plak P2 — uitgevoerd, 18 augustus

**Vandaag › Beweging naar de v3.6-vorm.** kdome + aandachtsbalk + drie gratis acties + één deur, gebouwd bovenop wat P1 opleverde.

### L1 · Wat er nieuw is

| bestand | wat |
|---|---|
| `src/components/dashboard/kompas/DomainAttentionBar.tsx` **(nieuw, 87 r.)** | Generieke aandachtsbalk — top-3 uit `states`, kleur én statuswoord in tekst, zelfde `ATTN_RANK`-sortering als v3.6 `attentionOrder()` |
| `src/components/dashboard/beweging/MovementFreeActionsTile.tsx` **(nieuw, 86 r.)** | Drie gratis dingen op de winst-prioriteit, uit `MOVEMENT_PRIORITY_LAYERS[focus].actions` — dezelfde bron als P1's ladder |
| `src/components/dashboard/BewegingScreen.tsx` | kdome-tegel (ring + band + delta + sparkline + "laatst gemeten" + aandachtsbalk) vóór `MovementCockpit`; de acties-tegel erna; CTA-stapel + deur-tegel; de oude "Je voortgang"-advies­box vervalt — hij was voor honderd procent overlap met de nieuwe kdome + CTA |
| `DomainAttentionBar.test.tsx` · `MovementFreeActionsTile.test.tsx` **(nieuw, 101 r.)** | Isolatie-tests: sortering, drie-lagen-cap, N4 (geen merk/prijs/oordeel), lege staat op P5/P6 |

`MovementTodayHero.tsx` — **niet aangeraakt**, in afwijking van de bestandenlijst in §J. Bij nadere lezing is dat component al precies "de handeling van vandaag": vier eigen staten (training-poort, keuzekaarten, rustdag, klaar-staat), diep verweven met `day-model`/`agenda`. v3.6 vraagt geen nieuwe vorm voor de handeling — die bestond al. Het risico van erin snijden woog niet op tegen wat het zou opleveren.

### L2 · Twee keuzes die ik niet stil heb gemaakt

**Het schap bestaat niet in `src/`.** Geen van de zes plakken in §J bouwt scherm B — dat is een gat in mijn eigen plan, niet iets wat ik nu stilletjes heb rechtgezet. De deur ("Maak een keuze") wijst daarom naar **Favorieten** (`/dashboard?tab=voortgang&screen=favorieten`), de enige bestaande surface waar aanbevolen en gekozen dingen al samenkomen — dezelfde rol die "Favorieten" al speelt in `beweging-help-bridge.ts` (`status: "now"`, tegenover `"toekomstig"` voor "Beste"). Geen derde vorm verzonnen; wel een bestemming gekozen die nog niet de bestemming is die N1 uiteindelijk bedoelt. **Zodra scherm B bestaat, moet deze `href` mee.**

**"Drie gratis acties" schrijft niet naar `daily_action_log`.** Die hook deelt zijn streak-teller met `DomainTodayStrip` en `AgendaTodayHero` — een van deze micro-suggesties afvinken zou dezelfde streak optellen als een volledige krachtsessie, en geen enkel document zegt dat dat de bedoeling is. De staat is nu sessie-lokaal (`useState`), met een GA4-event (`beweging_gratis_actie_gepland`) voor het meetpunt. Persistentie — en de streak-vraag die daarbij hoort — is een open beslissing, geen stille keuze.

### L3 · Wat ik bewust niet verwijderd heb

BewegingScreen droeg negen secties; v3.6 vraagt er vijf. Zes zijn nieuw samengesteld (kdome, aandachtsbalk, handeling, acties, CTA, deur — geteld als vijf omdat aandachtsbalk in de kdome-tegel leeft, zoals in de prebuild). Vijf bestaande blokken blijven ongewijzigd staan: de "Straks"-regel, de uitklap "Waarom bewegen na 40 anders werkt", `MovementLogPanel` (flag-gated), de voedings-hint na een krachtsessie, de beweegcheck-nudge, en de gids-link. Geen daarvan is aanbod in de zin van lock 1 — het zijn educatieve en contextuele elementen — maar ze duwen de sectie-telling boven de vijf uit het model.

Ze verwijderen was geen onderdeel van "Vandaag naar de v3.6-vorm"; het is een aparte, inhoudelijke beslissing (wat er met live content gebeurt) die niet bij "reorganiseer de surface" hoort. **Dit is het eerste dat ik zou aanpakken als je "≤5 secties" letterlijk wilt — met per blok een voorstel: laten staan, verhuizen naar de gids, of onder een "meer"-uitklap.**

### L4 · Verificatie

`grep console.log src/` → 0 · `npx tsc --noEmit` → schoon · `npx eslint --max-warnings 0` → dezelfde 5 baseline-waarschuwingen als op `HEAD`, geen nieuwe · `npx vitest run` → 214 bestanden, 1926 tests, alles groen (7 nieuw, waaronder de N4-toets op de acties-tegel).

**Geen browser-render van de levende `/dashboard`-route.** Die vereist een echt account-cookie (`getAccountFromCookie()` redirect't zonder sessie naar `/account/login`, vóór elke `state=`-branch) en ik heb geen testaccount — een account aanmaken is een actie die ik niet zonder overleg neem. In plaats daarvan: `GET /dashboard?state=scored&tab=kompas&kompas=beweging` geeft `200` zonder Next.js-compilefout (bevestigt dat de module-graaf, incl. de twee nieuwe bestanden, klopt), en de twee nieuwe componenten zijn in isolatie in jsdom gerenderd en getoetst. `MovementCockpit`/`MovementTodayHero` — ongewijzigd, dus niet apart geverifieerd — leunen op `useSearchParams()` en meerdere fetch-hooks zonder bestaande test-scaffolding in dit project; die opzetten was buiten de scope van deze plak.

**Omvang:** 122 gewijzigd in `BewegingScreen.tsx` + 173 nieuw (twee componenten) = 295 regels productiecode, plus 101 regels tests. Binnen de plakgrens.

**Meetpunt:** `choice.shelf_opened` met `{domain:'beweging', from_state:'vandaag', surface:'kompas_beweging'}` op de deur — bestond al, hergebruikt. `beweging_gratis_actie_gepland` (nieuw, GA4) op de acties-tegel — hier lees je af of de suggesties worden opgepakt vóórdat de vraag "moet dit persistent worden" beantwoord hoeft te zijn.

---

## M · Plak P3 — uitgevoerd, 18 augustus

**Voortgang › Beweging uitgedund, en de navigatie-rail meegenomen.** Twee delen, op verzoek: het hoofdblok van `VoortgangDomeinScreen.tsx`, en een gat in `CockpitContextRail` (de bestaande, al mobiel-responsieve linker rail) dat zichtbaar werd zodra je van Voortgang naar een domein-detail gaat.

### M1 · De vondst die de plak bepaalde

`showAdviesDeur` (de oude toggle + `BewegingAdviesTreden`, 314 regels) bleek **exact het probleem dat `DomainSupplementStance` al oplost voor drie andere domeinen** — en `DOMAIN_PRODUCT_STANCE.movement = { kind: "candidates", slugs: ["creatine", "eiwitpoeder"] }` bestond al, ongebruikt. Dit is precies wat `BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1` §I al op de sloop-lijst had staan: *"`BewegingAdviesTreden.tsx` (234 r.) — gaat op in het schap"*. Geen nieuw component gebouwd — een bestaand, al-juist patroon eindelijk gebruikt.

| bestand | wat |
|---|---|
| `src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx` | SSOT-vlag toegevoegd boven `MovementCheckinReadout` (lock 4, alleen beweging); `showAdviesDeur`-blok vervangen door `<DomainSupplementStance domain="movement" .../>`, in dezelfde positie, gate nu `movementReadout` (was `movementCurrent.source === "beweegcheck"` — beide betekenen "beweegcheck gedaan", nu één bron in plaats van twee die uiteen konden lopen) |
| `src/components/dashboard/voortgang/BewegingAdviesTreden.tsx` | **verwijderd** (314 r.) — geen enkele resterende aanroep |
| `src/lib/__tests__/beweging-advies-treden.test.ts` | **verwijderd** (226 r.) — testte uitsluitend de verwijderde functie |
| `src/lib/beweging-advies-treden.ts` | 153 → 16 regels. `programLabelFor` blijft: `beweging-help-bridge.ts` (Agenda › meer-hulp-sheet) leunt erop, en Agenda stond buiten de scope. `buildBewegingAdviesTreden` en zijn types weg |
| `src/components/dashboard/VoortgangHub.tsx` | `onOpenAdvies`/`onOpenFavorieten` weg bij de `VoortgangDomeinScreen`-aanroep — werden nergens anders meer gebruikt na de vervanging |

### M2 · De rail — op je vraag, niet stilzwijgend uitgebreid

Je koos "de bestaande navigatie-rail" (`CockpitContextRail`, mode `"voortgang"`) — niet de sticky ladder-rail uit de prebuild, die nog nergens in `src/` bestaat. Bevinding: `VOORTGANG_RAIL_ITEMS` kent alleen `hub`/`statistieken`/`inzichten`/`favorieten`. Op Voortgang › Beweging (`screen === "domein"`) matchte niets, dus lichtte er niets op in de rail — een navigatie-dood-punt dat al bestond, niet iets dat P3 veroorzaakte.

`resolveVoortgangRailActiveItem()` (nieuw, `context-rail.ts`) lost dat op door dezelfde hiërarchie te volgen die `VoortgangHub.tsx`'s eigen `goBack()` al gebruikt: `domein → hub`, `lichaamssamenstelling → statistieken`, de vier bestaande items ongewijzigd. Geen nieuw concept — een bestaande terugweg omgezet in een oplicht-regel. Gewijzigd: `context-rail.ts` (+resolver, +5 tests) en `Dashboard.tsx` (1 regel: `railVoortgangActiveScreen={resolveVoortgangRailActiveItem(voortgangScreen)}`).

**`CockpitContextRail.tsx` en `CockpitFrame.tsx` — geen van beide aangeraakt.** Geverifieerd met `git diff --stat`: leeg. Het `md:hidden`/`md:flex`-responsive-patroon (compacte profielstrip <768px, volledige rail ≥768px) staat exact zoals het stond.

### M3 · Verificatie

`grep console.log src/` → 0 · `npx tsc --noEmit` → schoon · `npx eslint --max-warnings 0` → dezelfde 5 baseline-warnings, niets nieuws · `npx vitest run` → 213 bestanden, 1916 tests groen (netto minder tests dan vóór P3, want de verwijderde 226-regel testfile testte uitsluitend verwijderde code; 8 nieuwe tests op `resolveVoortgangRailActiveItem` erbij) · `GET /dashboard?tab=voortgang&screen=domein&domein=beweging` → 200, geen Next.js-compilefout.

**Omvang: netto -566 regels** (-800 verwijderd, +325 nieuw/gewijzigd, over 14 bestanden). Dit is de eerste plak die code afbouwt in plaats van optelt — precies wat "elf blokken naar zeven" beoogde.

### M4 · Wat ik bewust niet heb aangepakt

- **Sleep mist dezelfde SSOT-vlag.** `SleepCheckinReadout.tsx` heeft géén "Zelfde blok als op je check-in resultaat"-tekst, exact hetzelfde gat als beweging had. Niet gefixed — dat is een ander domein aanraken, buiten de scope van deze opdracht.
- **`SupplementVerdictPanel` draagt nog een vergelijkingslink.** `DomainSupplementStance` (en dus nu ook beweging) opent 'm nog steeds. Lock 5 ("geen vergelijkingslink … op Voortgang") is daarmee nog niet overal waar — maar dat gat bestond al voor slaap/stress/voeding vóór P3, en het nu ook voor beweging "gelijktrekken" is consistent maken, geen nieuw probleem introduceren. Een echte fix raakt `SupplementVerdictPanel` zelf — vier domeinen tegelijk.
- **De exacte volgorde "elf → zeven" is niet letterlijk op zeven uitgekomen.** DomeinIjkpuntCheckPrompt, de `movementLogEnabled`-tegel en de checkinRoute-link blijven staan (zelfde reden als in P2: bestaande, niet-schap content verwijderen is een productbeslissing, geen reorganisatie). Netto is het blok wel fors kleiner: 234 regels bespoke 3-tredenstructuur weg voor 6 regels die een al-bestaand component aanroepen.

---

## N · Open punten na P1 + P2 + P3

1. **Scherm B (het schap) bestaat niet in `src/`.** Geen plak in §J bouwt hem. De deur op Vandaag wijst voorlopig naar Favorieten (L2) — dat moet mee zodra dit gebouwd wordt.
2. **Persistentie van de drie gratis acties**, en of ze de `daily_action_log`-streak mogen delen met de primaire dagstap (L2).
3. **"≤5 secties" letterlijk halen** vraagt een inhoudelijke beslissing over vijf bestaande blokken (L3) — geen refactor, een productkeuze.
4. Scherm B krijgt geen appbar in de prebuild (v3.5 §Open vragen 1, ongewijzigd) — relevant zodra plak "bouw het schap" aan de beurt is.
5. **`SupplementVerdictPanel`'s vergelijkingslink op Voortgang** (M4) — geldt voor alle vier de domeinen met een schap, niet beweging-specifiek. Buiten de scope van deze blauwdruk-opdracht.
6. **Sleep mist de SSOT-vlag** die beweging nu wel heeft (M4) — hetzelfde gat, ander domein, niet aangeraakt.
7. §J P4-P6 staan klaar en wachten op akkoord.

---

## N · Bestanden

| bestand | status |
|---|---|
| `docs/design/beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html` | **nieuw** |
| `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` | blijft staan, ongewijzigd |
| `docs/design/BESLUIT_BEWEGING_V36_2026-08.md` | **nieuw** — dit document |
| `docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` | amendement-verwijzing toegevoegd bij §B en §K |
| `src/lib/movement-ladder.ts` · `src/lib/__tests__/movement-ladder.test.ts` | **nieuw** — plak P1 |
| `src/data/movement/lifestyle-priorities.ts` · `src/types/dashboard.ts` · `src/lib/account-dashboard.ts` · `DomainLifestyleLadder.tsx` · `VoortgangDomeinScreen.tsx` | gewijzigd — plak P1 |
| `src/components/dashboard/kompas/DomainAttentionBar.tsx` · `src/components/dashboard/beweging/MovementFreeActionsTile.tsx` + hun tests | **nieuw** — plak P2 |
| `src/components/dashboard/BewegingScreen.tsx` | gewijzigd — plak P2 |
| `src/components/dashboard/voortgang/BewegingAdviesTreden.tsx` · `src/lib/__tests__/beweging-advies-treden.test.ts` | **verwijderd** — plak P3 |
| `src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx` · `src/lib/beweging-advies-treden.ts` · `src/lib/context-rail.ts` · `src/components/dashboard/Dashboard.tsx` · `src/components/dashboard/VoortgangHub.tsx` | gewijzigd — plak P3 |

P4 tot en met P6 uit §J staan klaar en wachten op akkoord, één plak per beurt.
