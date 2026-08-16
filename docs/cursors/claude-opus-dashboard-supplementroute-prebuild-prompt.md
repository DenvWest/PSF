# Opus-prompt — Eén dashboard-prebuild: de deur, het schap en de onderbouwing

**Kompas Vandaag en Mijn Dag dragen de deur · Favorieten is het schap · de ladder op Voortgang is de onderbouwing · `/beste/{slug}` sluit af.**
Datum: 15 augustus 2026 · Repo: `perfectsupplement` (main) · Doelmodel: Claude Opus

---

## 0 · Wat je maakt

Eén losstaande interactieve prebuild die het hele ingelogde oppervlak toont als **één samenhangend systeem**, plus één besluitdocument dat de drifts beslecht en de bouwvolgorde vastlegt.

Je levert **geen React** en je raakt `src/` niet aan. De prebuild is het **ontwerpcontract**: wijkt latere code ervan af, dan is de code fout.

**Dit is geen greenfield-ontwerp.** Vijf domein-prebuilds bestaan al en zijn goedgekeurd. Ze zijn uit elkaar gegroeid, en de rolverdeling tussen de surfaces is bij één ervan — beweging — al opgelost terwijl de andere vier achterlopen. Je opdracht is **convergentie op het beweging-model**, plus de laatste schakel naar de vergelijking.

---

## 1 · De rolverdeling — dit is de kern van de opdracht

Vier surfaces, vier rollen, geen overlap:

```
KOMPAS VANDAAG   de handeling van vandaag  +  ÉÉN DEUR naar het schap
                 nooit een product, prijs, claim of oordeel

MIJN DAG         diezelfde handeling in de tijd  +  dezelfde deur
                 afvinken bestaat hier (en op Vandaag, zie L9)

FAVORIETEN       HET SCHAP — activiteiten én supplementen náást elkaar,
                 één oordeel-schema, per kaart een commissie-disclosure
                 de enige plek met aanbod

VOORTGANG        DE ONDERBOUWING — de ladder legt uit waarom deze volgorde,
(ladder)         waar jouw winst zit, en waarom de deur nu open of dicht staat
                 draagt zelf geen aanbod

/beste/{slug}    de vergelijking: vorm, dosering, prijs per dag, claimdrempel
```

De keten die daaruit volgt, en die je overal herkenbaar moet maken:

> **handeling → deur → schap → oordeel → vergelijking**, met de ladder ernaast als uitleg waarom de deur staat zoals hij staat.

### 1.1 · Waarom dit de juiste rolverdeling is — beweging doet het al

Dit is geen nieuwe architectuur. Het is de architectuur van beweging v3.5, uitgerold over de andere vier.

**Scherm E (Vandaag) draagt de deur, niet het schap.** `bridgeCtaHtml("e")` r.1332: één knop, twee labels, twee routes, allebei uit één predikaat `bridgeFirst()`. Staat er nog niets naast je basis → *"Voeg iets toe aan je basis"* → scherm B, het schap. Staat er wel iets → *"Zet er iets naast"* → scherm D, Mijn Dag. Op E staat **geen** product, geen prijs, geen claim, geen oordeel.

**Scherm B is het schap, en het is gemengd.** `CARDS` r.1007 — negen kaarten, vier typen:

| type | kaarten | oordeel-label | `micro`-regel |
|---|---|---|---|
| `basis` | "Stevig wandelen, 3× 30 minuten" · "Elk werkuur twee minuten staan" | **Aanrader** | *"Hier verdienen we niets aan. Dat verandert niets aan hoe we het beoordelen, en niets aan waar het staat."* |
| `dienst` | online traject · krachtgroep · baantjes · keten · PT-intake | **Alleen als…** | *"We ontvangen commissie als je hier klant wordt. Het oordeel is los daarvan opgesteld en verandert niet mee."* |
| `product` | **"Magnesiumcitraat — ter ondersteuning van spierfunctie"** | **Nu niet** | *"We ontvangen commissie als je via ons koopt. Het oordeel is los daarvan opgesteld en verandert niet mee."* |
| — | een kaart zonder afgerond oordeel | **Nog geen oordeel** | — |

Elke kaart draagt hetzelfde schema: `why` (per lens: profiel / lokaal) · `quality` (waarop beoordeeld) · `role` (waar het staat t.o.v. je basis) · `act` · en een `verdict` met **`gecheckt` · `sterk` · `zwak` · `oordeel` · `micro`**.

**Lees de magnesium-kaart (r.1069-1087) letterlijk voordat je iets ontwerpt.** Daar staat het hele platform in één kaart:

- `vl: "Nu niet"` — het oordeel over het enige product op de lijst is negatief
- `role: "Nu niet — we leggen hem klaar tot je hertest op 16 augustus"`
- `quality: "Beoordeeld op vorm en dosering · eerst leefstijl, daarna pas aanvullen"`
- `sterk: "Citraat met 200 mg elementair magnesium per dagdosis. Dat is een reële hoeveelheid, geen sierdosering."`
- `zwak: "Veel merken zetten oxide in vrijwel dezelfde verpakking. Op het etiket staat dan een hoog totaalgetal en een lage opname."`
- `oordeel: "Pas zinvol als je basis staat en je herstel achterblijft. Niet als startpunt."`
- `micro:` de commissie-disclosure, op de kaart zelf

**Dit is waarom de rolverdeling werkt.** "Leefstijl eerst" is hier geen belofte in een intro maar een **structurele eigenschap van het schap**: gratis wandelen staat als *Aanrader* boven magnesium als *Nu niet*, in dezelfde lijst, beoordeeld op dezelfde assen, met bij de een "hier verdienen we niets aan" en bij de ander "hier verdienen we wel aan". Een lezer kan dat controleren. Dat is de Consumentenbond-vorm, en geen enkele andere surface kan hem dragen — een dagelijkse handelingssurface niet, en een uitlegladder ook niet.

### 1.2 · Wat dit kost aan bestaande besluiten — benoem dit, verzwijg het niet

Deze rolverdeling **herroept twee vastgelegde regels**. Doe dat expliciet in je besluitdocument, met naam en paragraaf.

**Herroeping 1 — `BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` §C.3** zegt vandaag dat product-oordeel *"verboden in elke staat"* is op VQ, VR, K en MD, en §270 zegt over de supplementtegel op Kompas: *"Die tegel moet weg — niet verplaatst, weg."*

Dat blijft grotendeels staan, maar de formulering moet scherper. Nieuwe regel:

> Op de dagelijkse surfaces (Kompas Vandaag, Mijn Dag) staat **geen oordeel, geen product, geen merk, geen prijs en geen claim** — in geen enkele staat. Wél **één deur**: een label-only brug naar het schap, zonder productnaam erin.

Het verschil tussen *"Voeg iets toe aan je basis"* (mag) en *"Magnesium — Aanrader"* (mag niet) is precies wat §C.3 wilde beschermen. Beweging E houdt zich daar al aan; de regel liep achter op zijn eigen prebuild.

**Herroeping 2 — "product hoort op laag 6, op VL, achter de poort"** (slaap-besluit §270). Het product verhuist naar Favorieten; de poort verhuist mee. Laag 6 op Voortgang blijft bestaan als **uitleg van de poortstand** plus de deur naar het schap — niet als tweede plek met een vergelijkingslink.

Daarmee is drift D4 (twee concurrerende schapoppervlakken) beslecht, en wordt waar wat de conversiekaart al beweerde: **Favorieten is de enige plek waar aanbod mag staan.**

### 1.3 · De schaalrekening

Er ligt een strategische audit van 15 augustus die het hele ingelogde oppervlak op de stop-lijst zet, met als eliminerend filter: *verandert dit wat er op een `/beste/`-pagina staat, of hoeveel mensen die vinden?*

Deze opdracht komt door dat filter op één voorwaarde: **het resultaat is minder oppervlak, niet meer.** Vijf handgeschreven schermen worden één skelet met vijf invullingen; twee concurrerende schapoppervlakken worden er één; vier eventnamen voor dezelfde handeling worden er één.

Lever die rekening als onderdeel van je besluitdocument: **componenten, secties, uitgangen en events — vóór en ná.** Komt de balans niet negatief uit, zeg dat dan gewoon.

---

## 2 · Wat er vandaag in de vijf prebuilds staat

Geverifieerde inventaris met regelnummers. **Vertrouw dit, en lees de bestanden zelf** — je hebt de letterlijke copy nodig, niet mijn samenvatting.

### 2.1 · Kompas Vandaag — vier status-eerst, één handeling-eerst

Alle vier bestaande K-frames gebruiken `cols--railright`: hoofdkolom links, sticky rail rechts.

| | **slaap v2** `renderK` r.1475 | **stress v1** `renderK` r.1698 | **verbinding v1** `renderK` r.1733 | **beweging v3.5** `renderE` r.1814 | **voeding v1.5** |
|---|---|---|---|---|---|
| kop | `kdome`: ring 64 + `<h1>Slaap</h1>` + band · gemeten + `kstat` + `renderAttnbar` (3 lagen) + note | idem, note over spanning/herstel | `kdome` **zonder ring** + `kstat` + attnbar + `vangnet()` | `header`: eyebrow `Beweging · {dag}` + `<h1>` = `programTitle()` + `today-sub` = `weekLine()` + optionele `condline` | **geen K-frame** |
| instrument | — | `resetTile`: preview + "Stel je reset in" → SI | `momentTile`: preview + "Zet je moment" → VI (alleen bij `actionBudget > 1`) | **`panel`: "Gedaan" / "Ik doe de korte" → na afvinken `done-head` + 1-5-schaal "Merk je er iets van?" + bevestiging + `Je programma`-disclosure met planner** | — |
| acties | `renderKActies`: 3 gratis dingen op de winstlaag, elk met "Zet op Mijn Dag › avond" | `renderKInterventies`: gegroepeerd per prioriteit + twee vouwgroepen ("staat" boven "nog niet") | idem stress | `also`-panel "Vandaag ook": één extra-rij, zelfde eenheid als Mijn Dag | — |
| **deur** | **geen** — twee vaste knoppen: "Open je slaapbeeld" + "Mijn Dag › vanavond" | **geen** — idem | **geen** — idem | **`bridgeCtaHtml("e")` r.1332: één knop, twee labels, twee routes uit één predikaat** | — |
| rail rechts | `renderKBridge`: mini-ladder (3 rijen) + winst-regel + link | idem, "Volledige ladder op Voortgang →" | idem | `strip` "Waar dit vandaan komt": twee `stripLink`s met label **én** hint | — |

**De vier deltas die je overbrugt:** beweging opent met wat je *doet*, niet met hoe je ervoor *staat* · beweging heeft een terugkoppeling die meeweegt in de hertest · beweging heeft één routerende knop in plaats van twee vaste · beweging's rail is een koppelstrip met hints, niet de mini-ladder.

### 2.2 · Voortgang per domein — de vijf ladders bestaan alle vijf al

| | **slaap** `renderVL` r.1597 | **stress** `renderSL` r.1797 | **verbinding** `renderVL` r.1885 | **beweging** `renderC` r.2065 | **voeding** `renderVL` r.1025 |
|---|---|---|---|---|---|
| layout | `cols--railleft` | `cols--railleft` | `cols--railleft` | `cols--railleft` (`showwide`) | **`cols--railright`** ← drift |
| kop | `backrow` + `<h1>` | `backrow` + `<h1>` | `backrow` + `<h1>` | `header` eyebrow + h1 + lead, **geen backrow** | `backlink` + `pagetitle` "Je voedingsbeeld" + `pagesub` |
| stand | `tile` "Je stand": ring 70 + band + bron + meta | idem + `renderPreview` + `lockline` | `renderStandBlock` (**geen ring**, besluit-lock) | **geen stand** | **geen stand** |
| rail | `<nav>` + ladder `rail` | idem | idem | idem | eetbasis-rail `rail`, **rechts** |
| readout | `ssot-flag` "Zelfde blok als op je check-in resultaat" + readout | idem | idem, of `emptycheck` r.1920 | idem | readout, of "Doe de voedingscheck" |
| ladderkop | "Prioriteitenladder — geen ranglijst" + zes-lagen-uitleg | idem + "Elke interventie op je Kompas hangt aan precies één van deze zes" | idem + **"Er is geen zevende laag met een schap"** | idem + `north`-note | `sectionhead` "Je eetbasis, van onder naar boven" |
| ladder vol | 6 rijen, laag 6 = poort | idem, **geen schap** | idem, **geen schap** | 6 prioriteiten, prio 6 = poort | 6 rijen, rij 6 = poort met `gatelinks` |
| daaronder | `renderGratisVormen` · `renderOverTijd` · `zelf`-disc · `achter`-disc (MATRIX + as) | `renderOverTijd` · `achter`-disc | `renderOverTijd` · `achter`-disc · `vangnet()` · `renderSchaalNotitie` | `renderFacts` · `renderChosen` · `self`-regel · `renderKeten` · `renderMeetpad` · `renderOwnFold` | clusterrijen "Wat we hebben gemeten" · `renderSelfcal` · bridge-regel |

**Het gedeelde skelet is al zichtbaar:** *stand → rail → ssot-readout → ladderkop → volle ladder → verdieping → footnote.* Dat is je contract; de rest is inhoud plus zes drifts (§3).

### 2.3 · De laag-6-poort — drie vormen, en na §1 een nieuwe rol

| domein | poortstanden | wat er nu bij open staat |
|---|---|---|
| **slaap** (`renderLayerRow` r.1238, blok `L.id === 6`) | vier: `open` · `fundament` · `klinisch` · `geen_klacht`, elk met eigen `GATE_LABEL` + `GATE_ICON` + `gate.body`; `gatepick`-schakelaar r.1295 om alle vier te inspecteren | "Vergelijk op prijs en kwaliteit →" |
| **voeding** (`renderRailRow` r.879, blok `row.key === 6`) | twee: open / dicht + `s.gateReason` | `gatelinks`-lijst per stof met een `why`-regel |
| **beweging** (`do6Html` r.1477, `gateState` r.1473) | twee redenen: `voeding` · `hertest`; gaat in de prebuild **nooit** open | knop "Doe de voedingscheck", of `doframe` + `nodiag` + vergelijkingslink |
| **stress** | **geen schap.** `renderSL` r.1828: *"Op stress bestaat geen goedgekeurde EFSA-claim, dus staat er op dit domein geen schap — ook niet als al je prioriteiten staan."* | — |
| **verbinding** | **geen schap, structureel.** `renderVL` r.1908: geen EFSA-claim verbindt een voedingsstof aan sociaal contact; de dichtstbijzijnde (magnesium, "normale psychologische functie") gaat over je zenuwstelsel, niet over je relaties | — |

Na §1 verandert de rol van dit blok: de poort **verklaart** en **verwijst**, in plaats van zelf een vergelijkingslink te dragen. De vier slaap-standen zijn daarvoor het rijkste model; neem die redenenstructuur over en geef elk domein zijn eigen set.

### 2.4 · De Voortgang-hub — de conversiekaart

`voortgang-conversiekaart-prebuild-2026-07.html`, paneel `overzicht` (markup r.694-795).

**Hero** (`.hero-in`, twee kolommen vanaf 1080px): links `signal` (eyebrow + `<h1>` + lede) · rechts `instrument` = `rk` routekaart met focuschip, `lin` cyclusliniaal (30 dagen, `role="slider"`), `stages`-rail, `stage-desc`; daaronder `act` = `stepcard` naar Mijn Dag + `cta-row`.

**`STAGES`** r.1116 — vijf knoppen die naar een paneel springen én de beschrijving eronder vervangen:

| id | label | naar | beschrijving |
|---|---|---|---|
| `test` | Test | hermeting | *"Je leefstijlcheck zet je nulpunt. Elke cyclus van 30 dagen begint en eindigt hier."* |
| `check` | Check | agenda | *"De momenten die je op Mijn Dag zet."* |
| `advies` | Advies | statistieken `blik=advies` | *"Wat je metingen zeggen: eerst je bord, dan ons oordeel, dan pas welk potje past."* |
| `favorieten` | Favorieten | favorieten | *"Jouw keuzes naast onze aanraders. **De enige plek in Voortgang waar aanbod mag staan.**"* |
| `beste` | Beste | gebruik | **ghost** — *"Later: herbestellen en trouw blijven, gekoppeld aan je profiel. Nog niet gebouwd, geen datum, nu geen koop-CTA."* |

> **Corrigeer een voor de hand liggende misvatting.** Stage 5 "Beste" is **niet** de vergelijkingspagina; het is een toekomstig herbestel-oppervlak. Verplaats de vergelijkingslink daar niet heen.

**Meetlat-tegel** r.744: doel-kop + `mode` + `ijk` + `goalcta` · één gedeelde `scale` die herschildert op rij-klik · vijf domeinrijen (`renderRows` r.1680) met sparkline, delta, meta en ijkpunt-chip · readout-regel · link naar cijfers over tijd.

**Koppelstrip** r.771: `flow` Mijn Dag → Voortgang → Hermeting, dan **"In welke orde — leefstijl eerst"** met `trap` (`renderTrap` r.2042):

```
1 Uit voeding      · nu | check nodig
2 Meet opnieuw     · over {n} d
3 Supplement erbij · {n} open | dicht
4 In je omgeving   · ghost
```

met `trap-say`: *"Trede 1 kun je vandaag zetten. Trede 3 staat voor {n} stof(fen) open, omdat voeding het gat daar niet dicht krijgt; bij de rest is ons antwoord dat voeding het eerst moet doen."* — en zonder voedingscheck: *"Zolang je voedingscheck er niet is, weten we niet wat er van tafel komt — en staat de hele trap dicht. Niet omdat we het niet weten willen, maar omdat we het dan niet kunnen weten."*

**Favorieten-paneel** (`renderVerdicts` r.2111) — de kiem van het schap uit §1, maar vandaag alleen supplementen:
- `fv-summary`: *"Van de {n} die we bekeken voegt er {n} iets toe."* · zonder voedingscheck: *"Nog niets te zeggen over {n} supplementen."*
- per stof: naam + oordeel-tag + `vd-why`
- `vd-trace`, **het spoor terug**: *"Uit je {nutriënt}-gap · je actie '{label}' staat {n} van de laatste 14 dagen aan."* Gedrag, nooit een gemeten inname
- **alleen `verdict === "kopen"` krijgt een uitgang**: `Vergelijk {label} →`. De rest is een eindpunt
- zonder voedingscheck valt élk oordeel terug op `eerst_leefstijl`: *"Vul eerst je voeding in — zonder dat kunnen we niet zeggen of dit iets toevoegt."*

**Navigatie** `NAV` r.1100: *Kijken* — Overzicht · Statistieken · Jouw inzichten · Favorieten. *Nog in aanbouw* — Lichaamssamenstelling · Wearable · Begeleiding · Wat je gebruikt (ghost). Onder 900px vervalt de rail voor een sticky disclosure-nav met sheet; dezelfde acht items voeden beide.

---

## 3 · De zes drifts

Kies per drift, met onderbouwing. Geen optielijst — een besluit met een verliezer.

**D1 · Het laaglabel. Vier conventies voor hetzelfde.**

| prebuild | label in `pl-tab` | bron |
|---|---|---|
| slaap v2 | `Laag 1` … `Laag 6` | `idx:` r.514-574 |
| stress v1 | `P1` … `P6` | `tab:` r.564-658 |
| verbinding v1 | `P1` … `P6` | `tab:` r.556-610 |
| beweging v3.5 | `Prioriteit 1` … `Prioriteit 6` | `idx:` r.822 — **lock 3 eist dit** |
| voeding v1.5 | **geen cijfer**, alleen status-glyph + laagnaam | **lock 3 verbiedt dit** |

Beweging's lock 3 (*"'Prioriteit N' in elke gerenderde string, aria-label en eyebrow"*) en voeding's lock 3 (*"nooit een cijfer, nooit een ordinaal"*) zijn **recht tegengesteld**. `BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` §I verbiedt bovendien *"'Laag N' / 'Prioriteit N' als ordinaal boven de laagnaam"* — terwijl de verbinding-prebuild zelf `P1`–`P6` rendert. Eén van die twee is fout; zeg welke, en waarom de andere de regel wordt.

**D2 · De railzijde.** Vier prebuilds zetten de ladderrail links, voeding rechts. Op Kompas staat hij bij alle vier rechts. Wat is de regel?

**D3 · De stand-tegel.** Aanwezig op slaap/stress/verbinding-Voortgang (ring 70; verbinding zonder ring, besluit-lock). Afwezig op beweging en voeding. Krijgen die er één, of vervalt hij overal? Als hij vervalt: waar leest iemand zijn cijfer, en wat betekent dat voor de meetlat in de hub?

**D4 · Twee schapoppervlakken.** ~~Open vraag~~ — **beslecht in §1.2: Favorieten is het schap, de laag-6-poort verklaart en verwijst.** Wat je nog moet uitwerken: hoe de poort naar Favorieten verwijst zonder een tweede vergelijkingslink te worden, en of de poortstand op Voortgang en de kaartstand in Favorieten uit één bron komen (dat moeten ze).

**D5 · De poortvorm.** Slaap heeft vier benoemde standen met eigen icoon en label; voeding open/dicht met vrije reden; beweging twee redenen en nooit open. Eén vorm met per domein een eigen set redenen — of andersom?

**D6 · Beweging's Voortgang wijkt af.** Geen backrow, geen stand — plus vier blokken die nergens anders bestaan: `renderChosen` r.2006 (basis + aanvulling met "waar staat het"-tags), `renderKeten` r.2029 (de Check → Advies → Favorieten → Beste-badge), `renderMeetpad` r.2035 (drie meetstappen in een `details`), `renderOwnFold` r.2049 (eigen begeleiding, met *"Dit is onze eigen begeleiding, geen partner. We verdienen er rechtstreeks aan — daarom staat hij hier apart en niet tussen de opties die we beoordelen"*). Welke zijn beweging-specifiek, welke horen bij alle vijf? `renderKeten` en `renderOwnFold` zijn sterke kandidaten voor universeel — de eerste omdat hij de keten uit §1 zichtbaar maakt, de tweede omdat elk domein waar je eigen dienst naast beoordeeld aanbod staat dezelfde scheiding nodig heeft.

---

## 4 · Deel A — Kompas Vandaag naar het model van beweging E

Eén skelet, vijf invullingen. Het skelet volgt `renderE` r.1814-1880.

```
appbar  ·  Vandaag* | Mijn Dag | Voortgang | Hermeting

cols--railright
├─ hoofdkolom
│   1. header      eyebrow "{Domein} · {dag}"  ·  h1 = de handeling van vandaag
│                  sub    = het ritme deze week
│   2. panel       DE HANDELING
│                    niet gedaan → primaire knop + lichtere variant + note
│                                  die uitlegt waarom de lichte volwaardig is
│                    gedaan      → bevestiging + terugkoppelvraag
│                                  + "dit weegt mee in je hertest op {datum}"
│                                  + "toch niet gedaan"
│                  disclosure: het onderliggende plan of de instelling
│   3. ook-panel   OPTIONEEL — één rij, zelfde eenheid als Mijn Dag
│   4. DE DEUR     ÉÉN knop, twee labels, twee bestemmingen, één predikaat
│                  label-only: nooit een productnaam, prijs, claim of oordeel
└─ rail (sticky)
    strip "Waar dit vandaan komt" — twee links, elk met label én hint
```

### 4.1 · De invulling per domein

**Voeding — de voedingsdag.** Dit is de grootste nieuwe invulling, en het materiaal ligt er al: `LAYER_ACTIONS` in voeding v1.5 r.647-663 geeft per open laag drie acties, elk met CTA `Zet op Mijn Dag`:

- laag 1 — *"Zet één portie groente bij je avondeten."* · *"Ruil je brood naar volkoren bij je volgende boodschappen."* · *"Kies water als standaard bij het avondeten."*
- laag 2 — *"Vervang één zoet drankmoment per dag door water of thee."* · *"Leg één keer per week vis op je boodschappenlijst."* · *"Neem een handvol ongezouten noten als vaste tussendoor."*
- laag 3 — *"Verplaats één eiwitrijk moment naar je ontbijt."* · *"Voeg peulvruchten toe aan één warme maaltijd per week."* · *"Reken je eiwitdoel uit voor jouw gewicht."*

En `s.railSingleAction` knipt dat al terug naar één actie, met de note *"Eén stap. Zodra die twee weken staat, komt de volgende in beeld."*

**Dat is de voedingsdag: één eetstap uit je onderste open laag, in de vorm van beweging E.** De check blijft periodiek; de dag is een stap, geen log. Let op de drie eigenaardigheden van voeding die je moet oplossen:

- **Niet elke stap is dagelijks.** *"Ruil je brood naar volkoren bij je volgende boodschappen"* is een weekhandeling; *"Kies water bij het avondeten"* is dagelijks. Wat betekent "Gedaan" bij een boodschappenstap, en wat staat er op de dagen ertussen?
- **Er is geen korte variant** zoals beweging's "Ik doe de korte". Bestaat er een eerlijk equivalent, of vervalt die knop bij voeding?
- **De terugkoppeling.** Beweging vraagt "Merk je er iets van?" direct na de sessie. Bij voeding is het effect traag en niet aan één maaltijd toe te schrijven. Verzin hier geen nep-schaal. Zoek de eerlijke variant, of laat de terugkoppeling weg en zeg waarom.

De rest:

| domein | de handeling van vandaag | de terugkoppeling | de deur |
|---|---|---|---|
| **slaap** | de winstlaag levert drie acties (`L.doing`), niet één. Kies je er één, of wordt het rijtje de handeling? | slaap meet je 's ochtends, niet direct na de handeling. Werkt de 1-5-vraag, of moet het een ochtendvraag worden? | naar Favorieten — magnesium/melatonine staan daar met hun eigen oordeel |
| **stress** | de reset (`resetTile` + `renderKInterventies`). Eén reset, of het hele interventieblok? | een reset gebeurt meerdere keren per dag. Telt afvinken, of merken? | **stress heeft geen schap.** Wat doet de deur dan — vervalt hij, of wijst hij naar de gratis kant van Favorieten? |
| **verbinding** | `actionBudget` beperkt acties tot 0, 1 of meer; bij 0 mag er **geen enkele** CTA staan | contact is niet dagelijks en niet afvinkbaar zonder ongemak | **nooit een deur naar een schap** (L3) |

**Forceer het model niet waar het niet past.** Beweging werkt omdat bewegen dagelijks, binair en afvinkbaar is met merkbaar effect. Slaap, stress, voeding en verbinding hebben dat geen van vieren op dezelfde manier. Laat zien welk deel van het skelet universeel is — kop → handeling → terugkoppeling → deur — en waar de invulling eerlijk moet afwijken. Een verbinding-Kompas met een 1-5-schaal onder "heb je iemand gebeld?" is fout, en je moet uitleggen waarom.

### 4.2 · Mijn Dag draagt dezelfde deur

Mijn Dag is de handeling in de tijd. `renderD` r.2123 (beweging) en `renderMD` r.1517 (slaap) zijn de bestaande vormen; de koppelstrip "Waar dit vandaan komt" bestaat op beide. Voeg daar dezelfde deur toe, met hetzelfde label en dezelfde bestemming als op Vandaag — niet een tweede variant. Eén predikaat, twee surfaces.

---

## 5 · Deel B — Voortgang: de ladder wordt de onderbouwing

Alle vijf de ladders komen op Voortgang, op één skelet. Ze bestaan alle vijf al; ze staan alleen in vijf vormen. **Nieuw is hun rol: de ladder legt uit, hij verkoopt niet.**

```
appbar  ·  Vandaag | Mijn Dag | Voortgang* | Hermeting
backrow + h1 {Domein}

cols--rail{links of rechts — besluit D2}
├─ rail (sticky)
│   [stand-tegel — besluit D3]
│   <nav> ladder variant "rail" — zes rijen, aria-current op de open rij
└─ hoofdkolom
    1. ssot-flag + readout  (of de check-CTA als er niets gemeten is, r.1920)
    2. ladderkop  "Prioriteitenladder — geen ranglijst" + de zes-lagen-uitleg
    3. ladder variant "full" — zes uitklapbare rijen
         per rij: 4px statusbalk · label {D1} · naam · statuswoord · why-regel
         open:    kern-alinea · scope-chips · "Wat kun je hier doen?" (max 3)
                  · domeinspecifieke mock
         laag 6:  DE POORTSTAND + DE REDEN + de deur naar Favorieten
                  géén productnaam, géén vergelijkingslink, géén prijs
    4. verdieping — per domein, uit één vaste set:
         gratis vormen op je open lagen    (slaap — hoort dit bij alle vijf?)
         over tijd · je antwoorden         (slaap, stress, verbinding)
         zelf inschatten / zelf-calibratie (slaap, voeding)
         achtergrond bij de indeling       (slaap, stress, verbinding — MATRIX)
         gekozen · meetpad · begeleiding   (beweging — besluit D6)
    5. vangnet / schaalnotitie waar het domein dat eist (verbinding)
    6. footnote
```

**Wat "informatief" concreet betekent** — en waar je het bewijs voor haalt:

- De ladder beantwoordt drie vragen: *waarom deze volgorde*, *waar zit mijn winst nu*, en *waarom staat de deur open of dicht*. Niets anders.
- Het `achter`-blok (MATRIX + het as-diagram bewijs-vs-fundamenteel, slaap r.1637) is precies dat: de onderbouwing van de rangorde. Dat blok verdient een prominentere plek dan een dichtgeklapte disclosure onderaan.
- Slaap's kruisregel tussen laag 4 en 5 (`renderLadder` r.1320: *"Laag 4 en laag 5 staan naast elkaar, niet boven elkaar"*) is een goede vondst en hoort bij deze rol. Verbinding heeft `renderCrossRow` r.1376 voor hetzelfde probleem — kijk of het één patroon kan worden.
- De `smalldisc`-regels waarin stress en verbinding verantwoorden **waarom er geen schap is** (r.1828 resp. r.1908) horen hier tot de kern, niet tot de kleine lettertjes. Dat is de onderbouwing op zijn sterkst.

Harde eisen:

- **Precies één laag draagt "grootste winst"** en is default open. De andere vijf dicht met **één** why-regel.
- **De readout is byte-identiek** op de check-in-uitslag en hier. Eén bron, twee lezers — dat is wat `ssot-flag` claimt, en het moet waar zijn.
- **Poortstand en kaartstand komen uit één bron.** Staat de deur op Voortgang dicht met reden X, dan staat de kaart in Favorieten met datzelfde X. Twee bronnen = twee oordelen, en dat is precies de fout die `focusLayer` als SSOT moest voorkomen.
- **Voeding's rail-rechts trekt gelijk**, of je legt uit waarom voeding anders is.

---

## 6 · Deel C — Favorieten wordt het schap, en de hub eromheen

Dit is het nieuwe zwaartepunt. Veralgemeniseer beweging's scherm B (`renderB` r.1925, `CARDS` r.1007, `cardHtml` r.1891, `visibleCards` r.1883) tot **één schap dat alle vijf de domeinen bedient**.

### 6.1 · Het schap

- **Gemengde kaarten, één schema.** Types `basis` (gratis) · `dienst` (betaald) · `product` (supplement), elk met `why` (per lens) · `quality` · `role` · `verdict{gecheckt, sterk, zwak, oordeel, micro}`. Vier oordeel-labels: **Aanrader** · **Alleen als…** · **Nu niet** · **Nog geen oordeel**.
- **Gratis staat boven betaald wanneer het oordeel dat zegt** — niet als beleefdheidsvolgorde maar als uitkomst. Beweging's schap doet dat: wandelen = Aanrader, magnesium = Nu niet.
- **De commissie-disclosure staat op de kaart**, niet in een voetnoot: *"Hier verdienen we niets aan"* versus *"We ontvangen commissie als je via ons koopt. Het oordeel is los daarvan opgesteld en verandert niet mee."*
- **Alleen een product met een positief oordeel krijgt een uitgang** naar `/beste/{slug}`. Dat is de bestaande regel in `renderVerdicts` r.2158 (`verdict === "kopen"`), en hij blijft.
- **Je eigen dienst staat apart** — `renderOwnFold` r.2049 zet PerfectSupplement-begeleiding buiten de beoordeelde lijst, met de reden erbij. Dat patroon geldt voor elk domein.
- **De vijf domeinen delen één schap of hebben elk een eigen tak** — kies, en zeg wat er gebeurt bij stress en verbinding, die geen `product`-kaarten mogen hebben maar wel `basis`- en mogelijk `dienst`-kaarten.

Uit te werken: hoe verhoudt zich dit tot `renderVerdicts` r.2111, dat vandaag alleen supplementen toont met `vd-trace` als spoor terug? Het spoor terug is te goed om te verliezen — het koppelt de kaart aan een lopende actie op Mijn Dag. Neem het mee naar de gemengde vorm.

### 6.2 · De hub eromheen

1. **De vijf domeinrijen in de meetlat klikken door naar de vijf domeinschermen uit deel B.** Vandaag is alleen de slaap-rij live (`renderHubRows` r.1655: `live:true` alleen op slaap).
2. **`STAGES` en `trap` zeggen deels hetzelfde.** Test → Check → Advies → Favorieten → Beste, naast Uit voeding → Meet opnieuw → Supplement erbij → In je omgeving. Twee volgordemodellen op één scherm. Voeg samen of scheid scherp — en zeg welke de leefstijl-eerst-belofte draagt. Beweging's `renderKeten` r.2029 gebruikt een derde variant (Check → Advies → Favorieten → Beste); dat zijn er drie.
3. **De ghost blijft eerlijk.** Zichtbaar, klikbaar, en expliciet over wat hij niet is: geen koop-CTA, geen bestelgegevens, geen abonnement. Verwijder die eerlijkheid niet om de rail strakker te maken.
4. **Vier van de acht rail-items hebben geen bouwdatum** (Lichaamssamenstelling, Wearable, Begeleiding, Wat je gebruikt). Blijven ze met de "je klik telt als stem, geen datum"-notitie, of vervalt de tweede groep?

---

## 7 · De supplementroute — de laatste schakel

De keten bestaat in code tot en met de categorie. **Bouw hem niet opnieuw.**

```
Leefstijlcheck
  → src/lib/recommendation-engine.ts + SUPPLEMENT_CATALOG (routeTriggers)
  → src/lib/supplement-verdict.ts      → kopen | eerst_leefstijl | niet_nodig | nooit
  → src/lib/supplement-gate.ts         → resolveGatedComparisonPath(ingredientKey)
  → src/lib/comparison-availability.ts → isComparisonAllowed(slug)
  → src/lib/comparison-paths.ts        → COMPARISON_PATHS
  → /beste/{slug}
```

`COMPARISON_PATHS` (7): `magnesium` · `omega-3-supplement` · `zink` · `creatine` · `vitamine-d` · `eiwitpoeder` · `ashwagandha`. **Ashwagandha is on-hold** (COMPLIANCE.md) — een pad betekent bereikbaar, niet aanbevelbaar. `isComparisonAllowed()` is de enige waarheid.

De poort in code vandaag: `buildRecommendationsEligibility()` → `{ nutritionLogCompleted }`. Eén voorwaarde; de voeding-prebuild eist er drie (check gedaan **én** minstens één gemeten signaal **én** geen enkel `below` meer in de onderste laag). Benoem het verschil en kies.

**Op de kaart in het schap, bij een positief oordeel:**

- naam + oordeel-label
- `why` — waarom bij *jou*, uit de check, niet generiek
- `quality` — waarop je hebt beoordeeld
- de EFSA-claim **woordelijk** uit `src/data/approved-claims.ts`; bestaat die niet, dan de regel die al in `BewegingAdviesTreden.tsx:82-86` staat: *"Hier bestaat geen goedgekeurde gezondheidsclaim voor. Wat je vergelijkt is inname en praktijk — eiwitgehalte, prijs per portie — geen belofte over wat het met je doet."*
- `verdict.sterk` / `verdict.zwak` / `verdict.oordeel`
- `verdict.micro` — de commissie-disclosure
- het spoor terug naar de gap en de lopende actie (`vd-trace`)
- `Vergelijk {stof} op prijs en kwaliteit →` naar `/beste/{slug}`

**Wat nergens in het dashboard staat** (23 juli, herbevestigd in `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §I): merken, prijzen, productafbeeldingen, affiliate-links, koopknoppen. Ook niet in Favorieten. Het schap draagt **het oordeel**; de vergelijkingspagina draagt de prijs per dag en de merken. Dat is precies waarom die klik iets waard is — geef hem niet weg op de verkeerde plek.

**Wat een dichte deur toont:** één regel in gewone taal met **de eigen reden van deze toestand**. De voeding-prebuild stelt de test scherp: *"Eén poort, vijf redenen — dat is de test of de gate-copy werkt."* Schrijf je vijf keer dezelfde zin met een ander zelfstandig naamwoord, dan is de copy niet af. Nooit een knop, nooit "binnenkort", nooit een uitklap die de link alsnog toont.

**De twee domeinen zonder schap verdedigen dat, ze verzwijgen het niet.** Stress omdat er geen goedgekeurde claim is; verbinding omdat er geen claim *kan* zijn. Zet ze in de prebuild zichtbaar naast een open schap. Dat is het sterkste geloofwaardigheidsargument dat het platform heeft, en het staat nu weggestopt in een `smalldisc` onder een dichtgeklapte disclosure.

**De brug naar buiten.** `src/data/supplements/pre-purchase-ladder.ts` zet dezelfde piramide vóór de vergelijking op de publieke pagina — nu alleen voor `magnesium`, gevoed uit `sleepPlanTemplate`, terwijl de dashboardladder uit `SLEEP_PRIORITY_LAYERS` komt. **Twee bronnen voor dezelfde drie stappen.** Ontwerp de continuïteit: wie op `Vergelijk magnesium` klikt moet op `/beste/magnesium` dezelfde stappen herkennen, niet herhaald krijgen. Benoem welke gedeelde bron dat afdwingt. Bouw de publieke pagina niet — dat is de volgende opdracht.

---

## 8 · Locks

**L1 · Geen merk, prijs, productafbeelding, affiliate-link of koopknop in het dashboard.** Ook niet in Favorieten. Het schap draagt het oordeel; de vergelijkingspagina draagt de prijs.

**L2 · Geen oordeel, product, merk, prijs of claim op de dagelijkse surfaces** (Kompas Vandaag, Mijn Dag), in geen enkele staat. Wél één label-only deur naar het schap, zonder productnaam. *Amendement op `BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` §C.3 — zie §1.2.*

**L3 · Verbinding heeft structureel geen schap en geen deur.** `BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` §C6. Laag 6 heet daar "volgen & bijsturen" en eindigt in: *"Hier komt geen potje. Er is geen supplement dat contact vervangt, en geen goedgekeurde claim die dat suggereert."*

**L4 · Stress heeft geen product-kaarten** wegens ontbrekende EFSA-claim. Er bestaat geen `BESLUIT_STRESS_*.md`; jij legt dit vast, inclusief wat dat betekent voor de deur op stress-Vandaag.

**L5 · Claimtaal woordelijk uit `approved-claims.ts`.** Nooit parafraseren.

**L6 · Geen medische claims, geen diagnose, geen somscores of afkapwaarden.** "Adviezen, geen diagnoses."

**L7 · Eén state-object, één `paint()`.** Elke surface is een render van dezelfde staat. Alle vijf prebuilds houden zich hieraan; jouw samenvoeging ook.

**L8 · Eén conclusie per domein.** De readout is byte-identiek op de uitslag en op Voortgang. Poortstand op Voortgang en kaartstand in Favorieten komen uit één bron.

**L9 · Afvinken.** Voortgang meet, Mijn Dag doet (stress `KETEN` stap 4) — met beweging's bewuste uitzondering dat Vandaag óók afvinkt, expliciet gemaakt met *"Dit staat ook op Mijn Dag. Vink het hier af of daar — het is hetzelfde."* Beslis of die uitzondering bij alle vijf hoort.

**L10 · Responsiviteit uitsluitend via `@container`.** 375px primair, 1280px secundair. Geen viewport-media-queries. Raakvlakken ≥44px.

**L11 · Werkt door dubbelklikken.** Geen CDN, geen netwerkverzoek, geen emoji. Neem de base64-`@font-face`-blokken letterlijk over uit `voeding-piramide-prebuild-v1.5-2026-08.html`. Iconen inline uitschrijven, niet via `<use href="#id">` — dat breekt op `file://` (beweging v3.5 r.691-700 legt uit waarom en hoe ze het oplossen).

**L12 · Tokens uit slaap v2** r.27-64: `--shell:#0B140C` · `--sage:#5A8F6A` · `--sage-lt:#9CC5A9` · `--terra:#C8956C` · `--amber:#C99A3C` · `--move:#C26E4B`, plus `.surf-intake` / `.surf-dash`. Drie accenten: **terra** = winst · **sage** = op orde · **amber** = houd in de gaten. "Nog niet nu" is muted. De statusstip is nooit het enige signaal — het statuswoord staat er in tekst bij (`renderAttnbar` r.1433 legt uit waarom: terra en amber zijn op 7px niet betrouwbaar te onderscheiden).

**L13 · Rijvorm, geen piramidevorm.** `.pl-row-shell`: zes rijen met een 4px statusbalk links. Geen clip-path, geen trapezium, geen taper. Laag 1 staat **boven**.

---

## 9 · De statenmatrix

Neem bestaande staten over waar ze bestaan; slaap v2 heeft er zes (`F1` eerste check · `F2` vooruit · `F3` terug · `F4` ritme open · `F5` signalen · `F6` basis staat).

Minimaal te tonen, elk met een **andere** reden waarom de deur staat zoals hij staat:

| # | staat | deur op Vandaag | poortregel op Voortgang | kaarten in Favorieten |
|---|---|---|---|---|
| T0 | nog geen check in dit domein | geen deur | "niets te zeggen" (verbinding `emptycheck` r.1920) | alles `eerst_leefstijl` |
| T1 | check gedaan, onderste laag niet op orde | deur naar de gratis kant | fundament eerst | alleen `basis`-kaarten |
| T2 | onderste laag staat, geen gemeten signaal | deur open | nog geen gat om te dichten | `basis` + `dienst`, geen `product` |
| T3 | signaal aanwezig, geen goedgekeurde claim of geen bereikbare vergelijking | deur open | "geen pagina om heen te sturen, en dat zeggen we" | `product` met **Nog geen oordeel** |
| T4 | poort open, één stof | deur open | de deur staat open, met reden | één `product` met **Aanrader** |
| T5 | poort open, twee stoffen, verschillende oordelen | deur open | idem | **Aanrader** naast **Nu niet**, in één lijst |
| T6 | stress, elke stand | besluit L4 | geen schap — geen EFSA-claim op dit domein | geen `product`-kaarten |
| T7 | verbinding, elke stand | **geen deur** | geen laag 6 met een schap — weigering-copy | geen schap |

Toon T5, T6 en T7 in de prebuild expliciet naast elkaar: **Aanrader naast Nu niet naast geen-schap** is in één blik het hele argument. Neem daarnaast slaap's `gatepick`-schakelaar over (r.1295) zodat elke poortreden zonder omweg te inspecteren is.

---

## 10 · Acceptatie — schrijf dit zelf onderaan de prebuild als HTML-commentaar, met de uitkomst per punt

1. Eén `<h1>` per frame.
2. Het laaglabel volgt overal besluit D1 — nul afwijkingen over alle domein × surface-combinaties.
3. Nul merk-, prijs-, productafbeelding- of koopstrings op **elke** surface, inclusief Favorieten.
4. Nul oordeel-, product-, claim- of prijsstrings op **elk** Vandaag- en Mijn Dag-frame, in elke staat. De deur bevat nooit een productnaam.
5. Nul supplement-, prijs- of vergelijkstrings in **elke** verbinding-staat, en nul `product`-kaarten in **elke** stress-staat.
6. De readout is byte-identiek op de uitslag-render en op Voortgang, per domein.
7. Poortstand op Voortgang en kaartstand in Favorieten komen in alle acht de staten overeen.
8. Precies één laag draagt "grootste winst"; default open; de andere vijf dicht met één why-regel.
9. Elke kaart in het schap draagt `quality`, een volledig `verdict`-blok en een `micro`-regel. Nul kaarten zonder commissie-disclosure.
10. Alle vijf de domeinen renderen een ladder op Voortgang.
11. Alle vijf de Vandaag-frames volgen het skelet uit §4; elke afwijking is per domein beargumenteerd in het besluitdocument.
12. Nul viewport-media-queries binnen tegels; alles `@container`. Op 375px geen horizontale scroll; raakvlakken ≥44px.
13. Het bestand opent zonder netwerk: nul externe verzoeken, nul console-fouten.
14. Elke interactie vuurt een benoemd event naar de event-strip.
15. Uitgangen per surface geteld en genoteerd, vóór en ná.

---

## 11 · Meetpunten

De keten uit §1 is nu vier schakels lang, en elke schakel moet meetbaar zijn:

> **handeling → deur → schap → vergelijking.** Hoeveel procent van de mannen die de handeling zien opent de deur? Hoeveel van hen bereikt een kaart met een positief oordeel? Hoeveel klikt door naar `/beste/*`?

- **Consolideer eerst.** Vier GA4-namen voor één handeling vandaag: `dashboard_verdict_click`, `dashboard_voeding_supplement_click`, `dashboard_beweging_supplement_click`, `supplements_route_click`. Eén naam met `surface`- en `domain`-parameter, plus de migratie.
- Hergebruik bestaande domain-events vóór je nieuwe verzint: `dashboard.verdict_clicked` · `dashboard.advies_gate_passed` · `choice.shelf_opened` · `verdict.changed` · `affiliate.click`. **`choice.shelf_opened` is de deur** — die bestaat al.
- Nieuw client-event = drie registratieplekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + `CLIENT_EMIT_TYPES` in `src/app/api/intake/events/route.ts` r.12. Noem ze per event.
- **Meet de dichte deur, niet alleen de open.** Altijd dicht = dode route; altijd open = neppe poort. Leg per reden vast hoe vaak hij voorkomt.
- **Meet het negatieve oordeel.** Hoe vaak een kaart als "Nu niet" wordt getoond is de belangrijkste geloofwaardigheidsmetriek die het platform heeft. Als dat getal naar nul zakt, is het schap een schap geworden.
- Neem de meetpunt-inventaris van de conversiekaart als vorm over — `voortgang-prebuild-notitie-2026-07.md` heeft een tabel met event, payload en trigger.
- Sluit af met: **"Meetpunt: `<event(s)>` — hier lees je het effect af."**

---

## 12 · Deliverables

| # | bestand | inhoud |
|---|---|---|
| 1 | `docs/design/dashboard-supplementroute-prebuild-v1-2026-08.html` | de prebuild: vier surfaces (Vandaag · Mijn Dag · Voortgang-domein · Favorieten) × vijf domeinen × de staten uit §9, met schakelaars voor domein/surface/staat/breedte, een event-strip, de acceptatielijst uit §10 als slotcommentaar, en implementatie-tags per frame die naar de plakken uit deliverable 2 verwijzen |
| 2 | `docs/design/BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1_2026-08.md` | de rolverdeling uit §1 vastgelegd · de twee herroepingen uit §1.2 met naam en paragraaf · de zes drifts uit §3 beslecht · de copy per domein × staat · de poortredenen · het kaartschema · de meetketen uit §11 · de bouwvolgorde in maximaal zes verticale plakken, elk los reviewbaar, met bestandenlijst, acceptatietest en afhankelijkheden |
| 3 | sectie in deliverable 2, kop **"De balans"** | componenten, secties, uitgangen en events — vóór en ná. Per plak: welke bestaande bestanden en blokken vervallen, met pad en regelnummer |

---

## 13 · Leesvolgorde, met regelnummers

Lees de bestanden zelf. Je hebt de letterlijke copy nodig; die is grotendeels niet opnieuw te verzinnen en hoort niet te veranderen.

**De prebuilds — dit is de bron**

1. `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` — **het model.** Vijftien locks r.7-32 · icoon-inlining r.691 · **`CARDS` r.1007 (het schap; magnesium-kaart r.1069)** · `bridgeCtaHtml` r.1332 (de deur) · `gateState`/`do6Html` r.1473 · `priorityRow` r.1512 · `renderLadder` r.1596 · `renderA` r.1754 · **`renderE` r.1814 (Vandaag)** · `visibleCards` r.1883 · `cardHtml` r.1891 · **`renderB` r.1925 (het schap)** · `renderChosen` r.2006 · `renderKeten` r.2029 · `renderMeetpad` r.2035 · `renderOwnFold` r.2049 · `renderC` r.2065 (Voortgang) · `renderD` r.2123 (Mijn Dag)
2. `docs/design/slaap-piramide-v2-prebuild-2026-08.html` — de canon voor vorm en tokens. Tokens r.27-64 · `renderLayerRow` r.1238 (poort in `L.id === 6`, `gatepick` r.1295) · `renderLadder` r.1310 (kruisregel r.1320) · `renderAttnbar` r.1433 · `renderKBridge` r.1449 · `renderKActies` r.1458 · `renderK` r.1475 · `renderMD` r.1517 · `renderGratisVormen` r.1574 · `renderVL` r.1597 (as-diagram r.1637) · `renderHubRows` r.1655 · `FRAMES` r.1767
3. `docs/design/voortgang-conversiekaart-prebuild-2026-07.html` — het model voor de hub. Markup overzicht r.694-795 · `NAV` r.1100 · `STAGES` r.1116 · `renderStages` r.1615 · `renderScale` r.1634 · `renderRows` r.1680 · `renderTrap` r.2042 · **`renderVerdicts` r.2111 (Favorieten vandaag)**. Plus `docs/design/voortgang-prebuild-notitie-2026-07.md` — meetpunt-tabel en de vier 375px-fixes
4. `docs/design/voeding-piramide-prebuild-v1.5-2026-08.html` — vijftien locks in de header · **`LAYER_ACTIONS` r.647 (de voedingsdag)** · `renderRailRow` r.879 (`gatelinks` in `row.key === 6`) · `renderEetbasisRail` r.959 · `renderSelfcal` r.968 · `renderVLMain` r.980 · `renderVL` r.1025
5. `docs/design/stress-piramide-prebuild-v1-2026-08.html` — `renderIv` r.1388 · `renderKInterventies` r.1419 · `renderResetSheet` r.1479 · `renderK` r.1698 · `renderSL` r.1797 (geen-schap-regel r.1828) · `KETEN` r.1845 · `FRAMES` r.1908
6. `docs/design/verbinding-piramide-prebuild-v1-2026-08.html` — `renderLayerRow` r.1303 · `renderCrossRow` r.1376 · `renderKInterventies` r.1438 · `renderStandBlock` r.1697 · `renderK` r.1733 · `renderSchaalNotitie` r.1864 · `renderVL` r.1885 (geen-schap-argument r.1908) · `FRAMES` r.2018

**De besluiten**

7. `docs/design/BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` — §5, §C.3 (r.330), §180-205, §270, acceptatie §405. **Dit document amendeer je** (§1.2)
8. `docs/design/BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md` — §A5 (de meetlat-inversie), §E (de drie poortvoorwaarden), §F, r.570
9. `docs/design/BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` — §C6 (r.162), §I (verboden woorden, r.379), acceptatie r.398, r.335
10. `docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` — r.108-114 (prioriteit 6 gegate), r.191
11. `docs/design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` — de inhoudelijke proef achter `CARDS`; hier staat waarom een kaart een oordeel krijgt en hoe commissie en oordeel gescheiden blijven
12. `docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §I — de keten en de twee randvoorwaarden
13. `docs/core/STEPPED_CARE_MODEL.md` — tier 1-3, tier 3 = supplement met `comparison_path`

**De code**

14. `src/components/dashboard/voortgang/BewegingAdviesTreden.tsx` — de enige plek in `src/` waar de trap met claimtekst en vergelijkingslink al werkt
15. `src/components/dashboard/domain/DomainLifestyleLadder.tsx` — de enige geïmplementeerde ladder; drie varianten; rendert `P{id}` (zie D1)
16. `src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx` — ladder alleen in de slaap-tak (r.303-316), beweging-schap achter een disclosure (r.354-391)
17. `src/components/dashboard/VoortgangHub.tsx` r.256 en `voortgang/StatistiekenBlikPanels.tsx` r.367 — `SupplementVerdictPanel` staat er twee keer
18. `src/components/dashboard/SleepScreen.tsx` · `StressScreen.tsx` (supplementsectie r.140-174) · `VerbindingScreen.tsx` · `Dashboard.tsx` r.2840-2866 (het inline voedingsscherm met `DomainSupplementList`)
19. `src/lib/supplement-gate.ts` · `supplement-eligibility.ts` · `comparison-availability.ts` · `comparison-paths.ts` · `supplement-verdict-copy.ts`
20. `src/data/supplements/pre-purchase-ladder.ts` — de publieke spiegel, alleen `magnesium`
21. `src/lib/events.ts` · `src/app/api/intake/events/route.ts` r.12

**Stem**

22. `docs/core/WRITING_VOICE.md` — begrip → urgentie → actie. Feit eerst (bron, mechanisme), dan pas de korte actie. Geen generaliserende coach-copy, geen diagnose-taal.

---

## 14 · Toon

Nederlands in UI en documenten, Engels in code en datavelden. Direct en concreet. Bij een keuze: je aanbeveling met onderbouwing, niet vijf opties zonder mening.

Drie dingen die je **niet** doet. Niet opnieuw ontwerpen wat al ontworpen is — de prebuilds zijn goedgekeurd en hun copy is doorgaans beter dan wat je zou verzinnen; jouw werk is convergentie plus de laatste schakel. Niet gladstrijken: waar twee goedgekeurde prebuilds elkaar tegenspreken (§3) is de eerlijke uitkomst een besluit met een verliezer. En niet het negatieve oordeel wegontwerpen: een schap waarin elk product "Aanrader" is, is geen schap maar een schappenplan — de magnesium-kaart met `vl: "Nu niet"` is het duurste en waardevolste onderdeel van dit hele systeem.
