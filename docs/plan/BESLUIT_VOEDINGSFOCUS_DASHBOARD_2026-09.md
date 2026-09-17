# Besluit — voedingsfocus: van leefstijldashboard naar voedingscheck

**Datum:** 17 september 2026
**Status:** besluit genomen, bouwplan in plakken
**Herzien:** 17 sep — vier ontwerprondes met Dennis; §3.2 omgekeerd (dagboek blijft, als 2+2),
§3.3 t/m §3.7 nieuw (tekortsysteem, asymmetrie, profiel, %RI, de keten),
bouwvolgorde van 6 naar 9 plakken
**Aanleiding:** vraag van Dennis n.a.v. het Virtuagym-voedingsdagboek — "moet Kompas helemaal zo?"
**Vervolg op:** [psf-verdict-focus-vergelijking] (15 aug) en [psf-voeding-eerst-ui-snoei] (5 sep)
**Prebuilds:** [dagboek 2+2](https://claude.ai/code/artifact/4d96ec83-1fa0-4879-b5d6-ac1be834a0be) ·
[vier tabs](https://claude.ai/code/artifact/236a3d44-a47c-4591-80cf-834733844f6d) — vorm en
functie, niet de eindstyling; die volgt bij het bouwen in `src/` op de Tailwind-tokens

---

## 0. Samenvatting

Het dashboard gaat van **zeven domeinen** naar **één domein op vier samenhangende tabs**, met één uitkomst: waar zit je nutriëntgat, hoe hardnekkig is het, en wat dicht het.

De vier tabs zijn één lus — Dagboek meet, Je patroon weegt, Keuze dicht, Mijn Dag plant — en het tekort is de spil die ze verbindt.

Twee dingen die in de vraag door elkaar liepen, worden hier uit elkaar gehaald:

1. **De focus versmallen naar voeding-supplementen** → JA. Dit is uitvoering van een besluit dat al twee keer eerder is genomen maar nooit is afgemaakt.
2. **Het mechanisme vervangen door een Virtuagym-achtig dagboek** → NEE, maar de *vorm* wel. Zie §2. Het bestaande 2+2-dagboek blijft en draagt het scherm mee (§3.2) — dat is een correctie op v1 van dit document.

---

## 1. Waarom nu, en wat de telling zegt

Stand op 17 sep 2026, geteld in `src/`:

| Wat | Aantal |
|---|---|
| Dashboard-componenten (excl. tests) | **106** |
| Regels in `src/components/dashboard/` (incl. tests) | **33.373** |
| Regels in `Dashboard.tsx` alleen | **3.769** |
| `nutrition-*` libs in `src/lib/` | **42** (7.304 regels) |
| Vragen in de Leefstijlcheck | **32** over 8 categorieën |
| Domeinen in `VALID_KOMPAS_VIEWS` | **7** |
| Uitgangen vanuit het dashboard naar `/beste/*` | **0** |

Die laatste regel is het hele argument. 33.373 regels dashboard met vijf externe links — naar `/privacy`, `/onderbouwing`, `/methodologie`, `/medische-disclaimer` en `/hoe-werkt-dashboard`. Geen enkele naar een vergelijkingspagina, dus geen enkele naar de monetisatie.

Het focusfilter uit het 15-aug-verdict, toegepast op het huidige dashboard:

- *Verandert dit wat er op een `/beste/`-pagina staat of hoeveel mensen die vinden?* → nee
- *Is het effect binnen 30 dagen af te lezen in organische sessies of affiliate-omzet?* → nee

Twee keer nee op de eliminerende vragen. Het dashboard zoals het nu staat valt af op zijn eigen filter. De enige verdedigbare voortzetting die het verdict openliet, was **net-negatieve snoei richting de supplementroute** — en dat is precies wat hieronder staat.

---

## 2. Waarom niet het Virtuagym-model

Het Virtuagym/MyFitnessPal-scherm is een **invoerapp**: elk product loggen, de app rekent kcal en macro's, de week krijgt een percentage ("127% · wekelijkse score 12,5% · dat kan beter"). Dat werkt daar omdat de logging zélf het product is.

Hier is logging een middel. Drie bezwaren, in volgorde van zwaarte:

**a. Retentiekosten in de verkeerde volgorde.** Dagelijks eten loggen heeft een bekend steile afhaakcurve. Een mechanisme bouwen dat pas waarde geeft ná weken trouw invoeren, terwijl de teller op 2 ingevulde checks staat, is de verkeerde volgorde: eerst iets dat bij de eerste sessie waarde geeft, dan pas iets dat trouw beloont.

**b. Concurrentie op andermans moat.** Gratis apps hebben hier tien jaar voorsprong en productdatabases van miljoenen items. De moat hier is `approved-claims.ts` plus het gepubliceerde oordeel — niet een barcodescanner.

**c. Het leidt weg van de monetisatie.** Een kcal-teller verkoopt geen omega-3. Een *gat* verkoopt omega-3. De weekscore als cijfer is bovendien compliance-taal ("dat kan beter"), en dat botst frontaal met `WRITING_VOICE.md` (begrip → urgentie → actie, nooit een oordeel over de persoon).

Dit is daarnaast geen nieuwe afweging: het longevity-home-besluit van 25 juli verwierp de kcal-teller al expliciet. Dezelfde vraag, nieuw jasje.

**Wat wél wordt overgenomen van dat scherm:** de *vorm*. Eén scherm, ronde dekkingsindicatoren per nutriënt in plaats van statische balken, een dagelijks/wekelijks ritme dat zichtbaar is. Niet het mechanisme.

### De vertaling

| Virtuagym | PerfectSupplement |
|---|---|
| Dagboek = elk item loggen | **Voedingscheck** = ~10 frequentievragen |
| Wekelijkse score in % van kcal-doel | **Dekking per nutriënt** (omega-3, eiwit, magnesium, D, B12, ijzer) |
| Doel = calorieën | Doel = **gat dichten**: voeding eerst, supplement als het gat blijft |
| Uitkomst = "dat kan beter" | Uitkomst = **product met oordeel** → `/beste/*` |

---

## 3. De acht beslissingen

### 3.1 Kompas verdwijnt als begrip

Niet "dagboek wordt Kompas" — Kompas wordt opgeheven. Een kompas is een metafoor die alleen betekenis heeft bij meerdere richtingen; met één domein is hij loos.

De vier tabs houden hun bestaande ids (`vandaag · agenda · voortgang · keuze` in `DASHBOARD_TABS`) en krijgen nieuwe labels: **Dagboek · Mijn Dag · Je patroon · Keuze**. Geen URL-breuk, geen migratie.

Weg: `KompasContextSpine`, `KompasKeuzeSectie`, `KompasDoelIjkpunt`, `KompasOndersteuningTile`, `KompasHomeCard`, `KompasVoortgangFocusBlock`, `FocusVoortgangPanel` (7 bestanden, 2.646 regels), plus `KompasDomainGauge` en de `kompas=`-parameter met zijn `VALID_KOMPAS_VIEWS`-set van 7 domeinen.

### 3.2 Het dagboek blijft — als 2+2, met vrije dagen eromheen

**Dit keert v1 van dit document om.** Daar stond "geen dagelijkse invoer"; dat is geschreven vóór `nutrition-dagboek.ts` en het besluit van 9 september gelezen waren. Het 2+2-dagboek (twee doordeweekse dagen, twee weekenddagen) is geen Virtuagym-logging en geen niets — het is de derde optie:

> Dertig dagen zou nauwkeuriger zijn en wordt niet ingevuld. Vier dagen is de afruil die daadwerkelijk data oplevert.

Zonder dagboek is een check van tien vragen te mager om een gat op te hangen. Mét dagboek levert het twee dingen die de check alleen niet kan: het **weekendverschil** (een vlak matig patroon vraagt iets anders dan een prima week met een ontspoord weekend) en **kalibratie** — het verschil tussen wat je zei en wat je registreerde.

**Elke dag invullen mag, vier dagen telt.** Extra dagen verbeteren je dekking, maar kalibratie en weekendvergelijking draaien op een vast venster: vijf doordeweekse dagen zeggen niets over je weekend. `DagboekSlot` dwingt dat al af ("er zijn er altijd precies vier, twee per soort"). De UI toont de volle week met de vier meetdagen gemarkeerd.

`NutritionDagboekPaneel`, `NutritionDagInvoer` en `NutrientLogboekPanel` blijven dus in de UI — niet ontkoppeld.

### 3.3 Het tekortsysteem: vier vensters, nooit één gemiddelde

De spil van het hele dashboard. Per stof staan **1 dag, 7, 14 en 30 dagen naast elkaar**, met een richtingkolom.

De reden dat het er vier zijn en geen gemiddelde: omega-3 staat op een dag met zalm op 760% en over een week op 38%. **Dat verschil ís de bevinding.** Een stof die in alle vier de vensters laag staat is een structureel tekort; een stof die alleen vandaag laag staat is een dag. Bovenaan staat dat als één zin in gewone taal ("magnesium is je hardnekkigste tekort — 26 van de 30 dagen onder de RI").

`nutrition-delta.ts` en `nutrition-sufficiency.ts` dragen de vergelijking en het oordeel al.

**Geen samengestelde weekscore**, en geen percentage als voortgangsbalk. De richtwaarde staat als marker; een percentage nodigt uit tot najagen naar 100.

### 3.4 De asymmetrie-regel is de UI-regel

Uit de ondergrens-regel (§2 van het 9-sep-besluit) volgt wat het scherm wel en niet mag tonen:

> Een ondergrens kan "gehaald" bewijzen, en "niet gehaald" nooit.

Dus: een ✓ waar dekking bewezen is, en **nooit een rood kruis of een "132 g onder"**. De kolom "Te gaan" toont een afstand, geen tekort.

Twee stoffen krijgen structureel géén oordeel: **zink** (bronnen leveren 1–4 mg per portie tegen 10 mg RI — alleen oesters halen dat in één portie) en **vitamine D** (komt uit zon en verrijking, niet uit voeding). Meer dagen meten maakt een onmeetbare stof niet meetbaar. Elke stof draagt daarom een `bewijsbaar`-vlag; staat die op false, dan toont het scherm de bronnentelling met de reden erbij.

### 3.5 Het profiel verschuift de aanbeveling, niet de dekking

Je patroon draagt een rij aanpasbare chips: leeftijd, geslacht, activiteitniveau, gewicht, seizoen, voedingswijze. Die verschuiven de **aanbevolen**-kolom — eiwit staat op 101 g bij 84 kg en matig actief (1,2 g/kg); op hoog actief stijgt de eis en daalt je dekking. Vitamine D volgt het seizoen.

Wat je registreerde verandert nooit mee: je bronnen blijven je bronnen.

### 3.6 Dekking als %RI — wettelijk de voorgeschreven vorm

Per portie tonen hoeveel van de aanbeveling het dekt (100 g, 1 gram, 1 capsule) mag, en is zelfs de vorm die de wet voorschrijft:

- **Bijlage XIII van EU 1169/2011** legt de referentie-innames vast (magnesium 375 mg, zink 10 mg, vitamine D 5 µg)
- **Artikel 32** bepaalt dat een vermelding als %RI wordt uitgedrukt
- **15% RI per 100 g** = "bron van" · **30%** = "rijk aan"

Scherp houden: **%RI is een feitelijke samenstellingsvermelding** en altijd toegestaan; een *gezondheidsclaim* ("draagt bij tot vermindering van vermoeidheid") mag pas boven de EFSA-drempel — voor magnesium 56,25 mg, precies wat al in `approved-claims.ts` staat. Twee verschillende dingen, twee verschillende labels in de UI.

**Let op:** `intake-reference.ts` noemt zijn eigen drempels expliciet indicatief ("vuistregels, geen gevalideerde norm"). De dekkingspercentages staan daarom op de wettelijke RI, niet op die vuistregels.

### 3.7 De keten: patroon → keuze → agenda → dagboek

De vier tabs zijn één lus, niet vier schermen:

| Stap | Waar | Wat |
|---|---|---|
| Het tekort komt boven | Je patroon | vier vensters + één bevinding |
| De keuze dicht het | Keuze | doellat die meebeweegt met het venster |
| De keuze wordt een plan | Mijn Dag | agendablok uit de keuze |
| De uitvoering bevestigt | Dagboek | registratie vinkt het blok af |

In Keuze beweegt de **doellat** mee met het gekozen venster: bij 30 dagen is het gat groter dan bij 1 dag, want goede dagen vallen weg tegen slechte. Zo zie je vóór het kiezen of je er komt.

**De naad naar een externe partij bestaat al.** `agenda_blocks` (migratie 18 juli) heeft `source`, `status`, `external_provider` en `external_ref`. Een bevestiging door een supplementbedrijf of supermarkt is dus één extra status op een bestaande tabel — geen nieuw systeem en geen migratie om te beginnen.

Wat hier **niet** gebouwd wordt: een echte bestelfunctie. Dat betekent transacties op eigen terrein terwijl de monetisatie affiliate-uitgaand is — een strategische omslag, geen dashboardfeature. Nu een herinnering.

### 3.8 Voedingscheck van ~10-13 vragen

De huidige check: 32 vragen, 8 categorieën, 5 fases, RULES_VERSION 1.4.0, scoring over 6 domeinen, profiellabels. Een zwaar apparaat voor 2 invullers.

Nieuw: **~10-13 frequentievragen, één categorie, één uitkomst** — je nutriëntgaten, gerangschikt, met route naar het product. Het dagboek (§3.2) kalibreert ze.

Bruikbaar uit de huidige set: `NUT_O3`, `NUT_PROT`, `NUT_STRUCT`, `NUT_QUAL` — vier vragen die al in de goede vorm staan (frequentie, geen zelfdiagnose). Aan te vullen met ~6 vragen voor wat nu ongedekt is: zuivel/calcium, groente/foliumzuur, vlees/ijzer+B12, zon/vitamine D, noten-zaden/magnesium, vis-anders/jodium.

De scoring voor slaap/stress/beweging/verbinding blijft in `src/lib/` staan maar wordt niet meer aangeroepen. **Niet verwijderen** — het `RULES_VERSION`-contract en de hermeting-deltalogica zijn duur verworven (drie P1-bugs gevonden en gefixt bij 1.4.0).


---

## 4. Snoeibalans

De voorwaarde uit het 15-aug-verdict was dat dashboardwerk alleen mag als de balans **negatief** uitkomt. Verwachte stand:

| | Vóór | Ná | Delta |
|---|---|---|---|
| Dashboard-componenten (excl. tests) | 106 | ~40 | **−66** |
| Dashboard-tabs | 4, over 7 domeinen | 4, over 1 domein | **0** (labels om) |
| Domeinen in de UI | 7 | 1 | **−6** |
| Check-vragen | 32 | ~10-13 | **−19** |
| Uitgangen naar `/beste/*` | 0 | ≥3 | **+3** |
| Actieve `agenda.*`-events | 7 | ~3 (voedingsblokken) | **−4** |

Ruim negatief op alles behalve de uitgangen naar de monetisatie — en dat is precies de gewenste richting: minder oppervlak, meer doorstroom.

**Niet weggooien, alleen ontkoppelen:** `src/components/dashboard/agenda/` (28 bestanden, 5.997 regels), `src/components/dashboard/beweging/` (6, 2.025), de prebuild-iframes voor stress/verbinding, en de niet-voeding scoring in `src/lib/`. Zelfde patroon als /inzichten in juni.

---

## 5. Homepage

De homepage draait sinds 29 aug op 5 rustige blokken met de Leefstijlcheck als enige aanbod. Wijziging: **"Leefstijlcheck" wordt "Voedingscheck"**, en elk blok krijgt een uitgang naar een `/beste/*`-pagina.

Dit is de goedkoopste winst van het hele plan: het haalt vraag 1 én 2 van het focusfilter (het verandert direct hoeveel mensen een `/beste/`-pagina vinden, en dat is binnen 30 dagen af te lezen in organische sessies).

---

## 6. Bouwvolgorde in plakken

Elke plak is apart reviewbaar en apart te deployen. Plak 0 blokkeert alles wat erna komt.

**Plak 0 — De tabel omkeren.**
`FOOD_SOURCES` is `nutriënt → bronnen` (120 keys, 2.720 regels); een productkiezer heeft `product → nutriënten` nodig. Havermout staat nu in drie lijsten als drie losse rijen. Dat levert al echte fouten op: `belegen-kaas` heeft portie "50 g (2 sneden)" bij eiwit en "30 g (1 snee)" bij zink; zalm heet `zalm-wild`/`zalm-gekweekt` bij omega-3 en gewoon `zalm` bij vitamine D. `food-catalog.ts` (749 regels, 37 entries) is die omkering in aanbouw.

**Plak 1 — De USDA-run.**
De API antwoordt weer (geverifieerd 17 sep; hij stond op 403). Hij levert `min`/`max`/`dataPoints` — de `observed`-spreiding waar `nutrition-spread.ts` op wacht, ter vervanging van de klassenband ×0,60–1,70. Vereist een eigen `FDC_API_KEY`; DEMO_KEY loopt na ~3 records tegen zijn dagquotum. **Elke fdcId tegen zijn `description` controleren** — een testmatch voor gekookte spinazie gaf asperges terug.

**Plak 2 — Voedingscheck (~10-13 vragen).**
Nieuwe vragenset, hergebruik van de vier bestaande `NUT_*`-vragen. Uitkomst: gaten gerangschikt.

**Plak 3 — Dagboekscherm.**
Maaltijdblokken met de stoffen als kolomkop (niet per item), subtotaal per maaltijd, volle week met vier gemarkeerde meetdagen. Ronde RI-meters erboven. `Dashboard.tsx` (3.769 regels) terug naar één domein; kompas-componenten weg.

**Plak 4 — Het tekortsysteem.**
Vier vensters (1/7/14/30), richtingkolom, één bevinding in gewone taal, `bewijsbaar`-vlag per stof. Dit is de plak die de andere drie tabs betekenis geeft.

**Plak 5 — Keuze met doellat.**
Dekking als %RI per portie, doellat die meebeweegt met het venster, claimlabels uit `approved-claims.ts`. **De plak die de monetisatie raakt** — hier de meetpunten op (`domain_events` + GA4, registratie op de drie plekken uit CLAUDE.md).

**Plak 6 — De keten sluiten.**
Keuze schrijft een agendablok, dagboek vinkt het af. Gebruikt `source` en `status` die al bestaan.

**Plak 7 — Homepage.**
"Leefstijlcheck" wordt "Voedingscheck", elk blok een uitgang naar `/beste/*`.

**Plak 8 — Ontkoppeling.**
Agenda-componenten voor niet-voeding, beweging, prebuilds uit de UI. Bewust als laatste: pas snoeien als het nieuwe pad bewezen werkt.

## 7. Wat dit besluit níét doet

- **Geen code verwijderen** die niet in de UI zit. Alles wat hier "weg" heet, wordt ontkoppeld — conform het /inzichten-precedent.
- **De scoring-engine niet aanraken.** RULES_VERSION 1.4.0 en de hermeting-deltalogica blijven intact.
- **Geen migratie nodig.** Geen schemawijziging in deze negen plakken — `agenda_blocks` draagt `source`, `status`, `external_provider` en `external_ref` al.
- **Geen bestelfunctie.** De externe naad blijft een herinnering; transacties op eigen terrein zijn een strategische omslag, geen dashboardfeature.
- **`/beste/*` blijft ongemoeid.** Die pagina's zijn het doel, niet het onderwerp.
- **`affiliate_clicks` niet aanraken.**

---

## 8. Openstaand

- **Welke ~6 nutriënten** krijgen een eigen vraag in plak 2? Moet langs `approved-claims.ts`: een nutriënt zonder toegestane claim kan wel een gat tonen maar geen productroute dragen.
- **`FDC_API_KEY`** — Dennis' actie. Gratis via fdc.nal.usda.gov/api-key-signup; het script leest hem al op regel 80.
- **Hermeting-interval.** Nu 14 dagen (leefstijlbalk-ritme); bij één domein is 21 of 28 dagen mogelijk zinniger — een voedingspatroon verschuift langzamer dan een slaapklacht.
- **De dertien groepsiconen.** USDA levert geen afbeeldingen (geverifieerd: het record heeft alleen `description`, `foodNutrients`, `foodPortions`). Foto's per product zijn onhoudbaar bij 371 catalogusregels en Open Food Facts is merkgebonden terwijl de catalogus dat juist niet is. Eén icoon per voedselgroep dekt alles en schaalt naar duizenden regels; een product erft zijn icoon van zijn groep, zoals het zijn gehaltes erft van zijn `foodKey`. Supplementen gebruiken de echte foto's die al in `/images/producten/` staan.
- **Schermnaam** van de eerste tab: "Dagboek" of "Je dag".

---

## 9. Over de prebuilds

De twee prebuilds leggen **vorm en functie** vast, niet de eindstyling. Ze draaien op losse HTML met eigen CSS; het echte scherm wordt gebouwd in `src/` op Tailwind, de `Container`-component en de tokens uit `DESIGN_TOKENS.md`.

Wat uit de prebuilds bindend is:
- de informatiestructuur (stoffen als kolomkop, subtotaal per maaltijd, vier vensters naast elkaar)
- de regels die in de UI zichtbaar moeten zijn (geen kruis, geen percentage als voortgang, `n.o.` in plaats van een verzonnen getal, `bewijsbaar`-vlag)
- de keten tussen de vier tabs

Wat niet bindend is: kleuren, spacing, iconografie, typografie. Die volgen het bestaande systeem.
