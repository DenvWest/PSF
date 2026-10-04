# Besluit — macro's en micronutriënten uitbreiden (MyFitnessPal-vorm, bewust heropend)

**Datum:** 26 september 2026, aangevuld 27 september 2026
**Status:** BESLIST (Dennis, expliciet na voorlegging) — vervangt het "geen kcal-teller"-verdict uit `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` (17 sep) en het onderliggende longevity-home-besluit (25 juli) voor het onderdeel calorieën/macro's/brede micronutriënten. Blijft binnen: het tekortsysteem (5 kernstoffen), de asymmetrie-regel, en `BESLUIT_IJZER_CALCIUM_2026-09.md` §8 (nieuwe *gemeten, geclaimde* stof = eerst pagina + claim).
**Aanleiding:** Dennis wil na een product-toevoeging een volwaardig voedingswaardescherm (calorieën, macro's, micronutriënten) zoals MyFitnessPal — screenshots meegestuurd (Voeding-tab met Calorieën/Voedingsstoffen/Macro's, macro-taart met instelbaar doel, "Meer"-menu).

---

## 0. Wat hier precies wordt herroepen, en wat niet

**Herroepen (26 sep):** het principiële bezwaar tegen calorieën/macro's/bredere micronutriënten **als informatie tonen** — vorm én mechanisme. Het eerdere verdict wees dit af omdat het leek te leiden naar een dashboard-doel-percentage ("127% · dat kan beter") dat wegleidt van de affiliate-monetisatie. Dennis' tegenargument (26 sep): dit gaat niet om een **gezondheidsclaim** — het is geen EFSA-geclaimd tekort met een `/beste/*`-uitgang, het is productinformatie, net als een voedingswaarde-etiket. Dat is een ander soort feature dan het tekortsysteem, en verdient daarom niet hetzelfde verbod.

**Aanvullend herroepen (27 sep):** het 17-sep-verdict had drie gronden — (a) retentiekosten van dagelijks loggen, (b) concurreren op andermans productdatabase-moat, (c) wegleiden van de monetisatie. Op 26 sep is alleen (c) weerlegd. Voorgelegd op 27 sep of (a) en (b) overeind blijven: **Dennis laat ze los**, met als onderbouwing dat dit een **parallelle, informatieve laag naast** het tekortsysteem is, niet de vervanging ervan — het tekortsysteem blijft de enige plek die naar `/beste/*` leidt (zie §0.1). Retentie- en moat-risico worden daarmee acceptabel geacht omdat deze laag geen eigen commerciële afhankelijkheid draagt: als niemand het macro-dagboek trouw invult, verliest de site niets van zijn verdienmodel.

### 0.1 Rolverdeling tussen de twee lagen (vastgesteld 27 sep)

Twee lagen, met een harde knip:

| | Tekortsysteem (bestaand) | Macro/micro-laag (dit besluit) |
|---|---|---|
| Stoffen | 5 kernstoffen (omega-3, magnesium, D, B12, ijzer\*) | Calorieën, macro's, brede micronutriënten (natrium, kalium, vitamine A/C, calcium, etc.) |
| Oordeel | Dekking/gat, asymmetrisch (✓ of "te gaan", nooit ✗) | Geen oordeel — alleen tonen wat is geregistreerd |
| Uitgang | `/beste/*` (de enige verkooproute) | Geen — informatief, geen affiliate-keten |
| Doel | Systeem berekent dekking tegen EFSA/RI-normen | Gebruiker vult zelf een doel in, of laat het leeg |

*IJzer/calcium als eigen claim-gedragen `/beste/*`-stof loopt via `BESLUIT_IJZER_CALCIUM_2026-09.md` §8, los van dit besluit.

**NIET herroepen:**
- **De asymmetrie-regel** (`nutrition-tekortsysteem.ts`): een ondergrens bewijst "gehaald" wel, "niet gehaald" nooit. Macro's/calorieën krijgen dus geen rood kruis, geen "te veel", geen "127%" als tekortoordeel.
- **`BESLUIT_IJZER_CALCIUM_2026-09.md` §8**: als een nieuwe stof een **gemeten, geclaimde** stof wordt met een tekort-oordeel en een `/beste/*`-uitgang, geldt nog steeds: eerst pagina + EFSA-claim, dan pas architectuur/data. Macro's/calorieën/de bredere micronutriënten uit dit besluit worden GEEN gemeten stof met claim-route — ze zijn informatief, niet onderdeel van het tekortsysteem. Zie §3.
- **Geen medische claims** (CLAUDE.md): een zelf ingesteld macro-doel is nog steeds een getal dat het systeem toont naast wat je binnenkrijgt. Zie §4 voor hoe dat compliant blijft.
- **RLS/architectuur/schema-regels**: ongewijzigd.

**Schema-comment die nu achterhaald is:** `supabase/migrations/20260923150000_account_voedingsdoelen.sql` bevat het commentaar "Waarom geen calorieën of macro's" met exact de asymmetrie-redenering uit het 17-sep-besluit. Dat commentaar wordt met dit besluit **feitelijk onjuist** voor het deel "geen calorieën/macro's" — het geldt niet meer als verbod, alleen nog als reden waarom een macrodoel niet in `account_voedingsdoelen` zelf hoort (zie §3: een informatief doel krijgt een eigen, nieuwe tabel, geen kolom op de bestaande eiwitdoel-tabel). Bij het bouwen van Laag C: comment in die migratielaag niet aanpassen (migraties zijn immutable), maar in de nieuwe migratie voor het macro-doel expliciet verwijzen naar dit document.

---

## 1. Wat er gebouwd wordt

Vier lagen, in volgorde (§6 herzien 27 sep: databron-volgorde omgedraaid, supermarktdata eerst).

### Laag 0 — Databron: supermarktproducten (nieuw, 27 sep)

Bron: externe dataset `pljwissink/supermarkets` (GitHub, Dennis had hem al lokaal in Downloads), vier CSV's (AH, Jumbo, Plus, Lidl), snapshot 14 maart 2026 — **geen live feed, geen doorlopende sync**. Per product: prijshistorie (honderden datumkolommen, wordt genegeerd — prijs is hier niet het doel), `prod_desc`, `quantity`, `cat`, en een `nutrients`-veld dat **vrije tekst** is (bijv. `"Per 100 Gramproduct.info.nutrion.sort.daily\Energie276 kJ (66 kcal)\Vet3,5 g\...`), geen gestructureerde kolommen per macro. Elk product heeft zijn eigen volgorde en notatie.

Dit is dus, net als de USDA-run in het 17-sep-besluit, een **extractie-klus**: een parser die de `nutrients`-tekst-blob per rij uit elkaar trekt naar vaste velden (energie kcal, vet g, waarvan verzadigd, koolhydraten g, waarvan suikers, vezels g, eiwit g, zout g, plus losse regels voor vitamines/mineralen waar aanwezig). Zelfde patroon als `usda-extract.mjs`, eigen script (`scripts/supermarkt-extract.mjs`), eigen rapport ter beoordeling — regex-gebaseerd, geen twee producten hoeven identiek geformatteerd te zijn.

**Wat dit oplevert:** een productenlijst met per product minimaal calorieën/macro's uit de supermarkt-CSV zelf. Micronutriënten die de tekst toevallig noemt (zoals calcium/vitamines bij verrijkte producten) worden meegenomen waar aanwezig, maar zijn niet compleet — dat vult Laag 0b aan.

### Laag 0b — Databron: USDA-aanvulling op supermarktproducten (volgorde herzien 27 sep)

Nadat de supermarktproducten in de catalogus staan (Laag 0), een matchronde tegen USDA FoodData Central om de micronutriënten aan te vullen die de supermarkttekst niet noemt — zelfde `usda-extract.mjs`-mechanisme en dezelfde beoordelingsstap als in het 17-sep-besluit (§5 aldaar), nu toegepast op de supermarktproducten in plaats van op `FOOD_SOURCES`-sleutels. Blokkade: elke match blijft door Dennis beoordeeld tegen de productomschrijving (het spinazie/asperges-precedent uit 17-sep §"Plak 1" geldt onverkort).

### Laag A — per product (UI, kleinste stuk eerst)

Na het kiezen van een product in het dagboek-zoekscherm: een rijk invoerscherm met calorieën + macro's (koolhydraten/vet/eiwit) voor dát ene item, als ring/percentage-verdeling — zoals screenshot 1 ("Voedsel toevoegen": maaltijd, aantal porties, portiegrootte, tijd, dan de ring). Puur informatief, geen dagdoel hier.

**Bouwvolgorde binnen Laag A (besloten 27 sep):** UI eerst, tegen voorlopige/gedeeltelijke data. Het scherm wordt gebouwd tegen de doelstructuur (kcal/koolhydraten/vet/eiwit/brede-micro's als vaste velden), en toont `n.o.` (niet opgehaald) zolang een veld voor een product nog leeg is — zelfde patroon als `bron: null` in `food-catalog.ts`. Dat voorkomt dat de UI achteraf omgebouwd moet worden zodra Laag 0/0b meer velden aanlevert.

### Laag B — dagboek-overzicht met 3 tabbladen

Het bestaande dagboekscherm (`DagboekScherm.tsx`) krijgt naast de huidige 5-stoffen-ringen een tabbladstructuur **Calorieën · Voedingsstoffen · Macro's**, analoog aan screenshot 2/3:
- **Calorieën**: dagtotaal, geen weekscore-in-%-oordeel — een getal, geen "dat kan beter".
- **Voedingsstoffen**: tabel met alle micronutriënten die de databron levert (cholesterol, natrium, kalium, vitamine A/C, calcium, ijzer, en de bestaande 5), als **informatieve %-weergave van een instelbare referentiewaarde** — zie §4 voor hoe dit geen advies wordt.
- **Macro's**: weekgrafiek + gemiddelde tegen een **instelbaar** doel (screenshot 3's 50/30/20), met per-macro kleur — geen vast "Doel: 50%" dat het systeem oplegt.

### Laag C — instellingen

Een profielinstelling waar iemand zijn eigen macro-verdeling en (indien gewenst) calorierichtlijn intypt — myfitnesspal-stijl "Doelen"-scherm, als **nieuwe, eigen tabel** (niet als kolom op `account_voedingsdoelen` — zie §0.1's opmerking over het schema-commentaar). Dit is de plek waarop §4's compliance-redenering rust: het systeem *berekent geen* advies, het *toont* wat iemand zelf invulde naast wat hij at.

### Meer-menu — geschrapt (herzien 27 sep, na uitzoekwerk)

Het 27-sep-ochtendbesluit ("alleen een item toevoegen — 'Voeding'/'Dagboek' wijzend naar de bestaande dagboek-tab") ging uit van de aanname dat Dagboek een aparte, minder zichtbare plek was die een snelkoppeling nodig had. Bij het uitzoeken van de aansluitpunten bleek: **Dagboek is al de eerste hoofdtab** van het dashboard (tab-id `vandaag`, label "Dagboek", icon `BookOpen`, bereikbaar via `/dashboard?tab=vandaag` — zie `DASHBOARD_TABS` in `src/data/dashboard/index.ts` en `DagboekScherm.tsx` gerenderd in `Dashboard.tsx`). Het staat dus al prominent in de hoofdnavigatie, op elk scherm zichtbaar.

**Besloten (27 sep, herzien): geen item toevoegen aan `DASHBOARD_MORE_ITEMS`.** Een extra "Voeding"/"Dagboek"-snelkoppeling in het Meer-menu zou dubbelop zijn met een tab die al in de hoofdnav staat — het voegt geen bereikbaarheid toe, alleen ruis. Restlijst-stap 11 uit `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §4 vervalt hiermee.

Dit is geen enkele aanwijzing dat "Doelen" (het bestaande Meer-menu-item, wijzend naar `/dashboard/doelen`) ook zou moeten vervallen — dat item wijst naar een eigen route die geen hoofdtab is, dus dat blijft precies zoals het is.

**Wat NIET gebouwd wordt (bewust buiten scope):** de rest van screenshot 3's menu (Premium, Periodiek vasten, Slaap, Glucose, Weekrapport) — andere features van een ander product. Screenshot 3 dient als **stijlreferentie**, niet als blauwdruk voor de hele navigatie.

---

## 2. Waarom dit toch geen "127% · dat kan beter" wordt

Het 17-sep-bezwaar was drieledig (zie `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §2c): (a) een kcal-teller verkoopt geen omega-3, (b) een weekscore-in-% is compliance-taal die botst met `WRITING_VOICE.md`, (c) het leidt weg van de monetisatie. Dit besluit neemt die zorgen serieus door ze te begrenzen, niet te negeren:

- **(a) blijft waar, en dat is prima**: macro's/calorieën verkopen inderdaad geen supplement. Dat is niet het doel van deze laag — het tekortsysteem (5 kernstoffen, dekking, `/beste/*`-uitgang) blijft de enige plek met een affiliate-keten. Macro's/calorieën zijn een aparte, parallelle informatielaag zonder eigen commerciële uitgang.
- **(b) wordt vermeden door vorm**: geen "je zit op 73% van je week-doel, dat kan beter"-zin. Wel: een getal, een grafiek, een %-balk zonder oordelend bijschrift. Schrijfstem-regels (`WRITING_VOICE.md`) blijven van toepassing op elke copy-regel die hierbij komt.
- **(c) wordt het scherpst geraakt door §4**: geen systeem-opgelegd doel, dus geen suggestie dat het systeem een dieet voorschrijft.

**(a) en (b) als retentie-/moat-risico (27 sep):** blijven inhoudelijk waar (zie §0), maar worden geaccepteerd omdat deze laag geen eigen verdienmodel-afhankelijkheid draagt — zie §0's redenering.

---

## 3. Waarom dit geen nieuwe "gemeten stof" is (en dus `BESLUIT_IJZER_CALCIUM_2026-09.md` niet raakt)

`NutrientId` (in `intake-reference.ts`) blijft de gesloten unie van 5 stoffen mét een `/beste/*`-interventiepad en een EFSA-claim. Calorieën, macro's, en de bredere micronutriënten uit de "Voedingsstoffen"-tab (cholesterol, natrium, kalium, vitamine A/C, calcium, ijzer, etc.) worden **niet** aan `NutrientId` toegevoegd en krijgen **geen** `bewijsbaar`-vlag, **geen** tekort-oordeel, **geen** vraag in de voedingscheck. Ze zijn een los, informatief veld op het productniveau (Laag A) en een optelling daarvan (Laag B) — geen uitbreiding van het tekortsysteem.

Dat is het onderscheid met het afgewezen "27-stoffen-dagboek"-voorstel van eerder vandaag: dát voorstel wilde nieuwe stoffen ALS gemeten stof met claim-aanspraak. Dit besluit voegt ze toe als **informatie**, net zoals een voedingswaarde-etiket informatie is zonder gezondheidsclaim te zijn. IJzer/calcium als eigen `/beste/*`-vergelijkingsroute (met claim, met normbesluit) blijft het traject uit `BESLUIT_IJZER_CALCIUM_2026-09.md` §8 volgen — onafhankelijk van dit besluit.

---

## 4. Hoe een instelbaar doel geen advies wordt

Twee dingen moeten allebei waar zijn:

1. **Het systeem berekent het doel niet.** Geen ingebouwde 50/30/20-standaard die als suggestie verschijnt vóór iemand iets invult — een leeg doel toont "nog niet ingesteld", geen vooringevulde vuistregel. (De 50/30/20 in screenshot 3 is zelf al een voedingsadvies-conventie; die schuift dit systeem niet naar voren als standaard.)
2. **De copy blijft neutraal.** "Jouw ingestelde verdeling" / "wat je invulde", nooit "aanbevolen" of "optimaal". Zodra het systeem een getal *voorstelt* in plaats van *registreert wat iemand zelf intypte*, is het weer een advies en moet het opnieuw langs deze afweging.

Dit is dezelfde grens als bij eiwit (`protein-target.ts`, `personalTarget: true`) — het verschil is dat eiwit een gepubliceerde formule gebruikt (PROT-AGE/ESPEN) en dus wél een claim mag dragen. Macro/calorie-doelen in dit besluit dragen geen enkele formule of claim — ze zijn 100% door de gebruiker ingevuld.

---

## 5. Databron — wat dit kost (herzien 27 sep: supermarktdata eerst)

- **Supermarkt-extractie** (nieuw, §0/Laag 0): `scripts/supermarkt-extract.mjs` parst de vrije-tekst `nutrients`-kolom van de vier CSV's naar vaste velden. Regex per bekend patroon ("Energie... kJ (... kcal)", "Vet...g", "waarvan verzadigd...g", etc.); rapport met per product wat wél en niet geparsed kon worden, ter beoordeling door Dennis vóór opname in de catalogus. ~~Geen NEVO-bronvermeldingsplicht (geen claim, geen `/beste/*`-keten) — bronvermelding "bron: [supermarkt].nl / checkjebon.nl-dataset" in de UI volstaat.~~

  > **INGETROKKEN (3 oktober 2026).** Deze bronregel is feitelijk onjuist en mag niet gebruikt worden. De checkjebon-feed levert per product alleen naam, link, prijs en eenheid — **geen voedingswaarden** (geverifieerd in het databestand: de enige velden zijn `n`, `l`, `p`, `s`). De voedingswaardekolom in de `pljwissink`-dataset kan dus niet van checkjebon komen; hij komt van de retailersites of uit Open Food Facts, en bij beide ontbreekt een geregelde licentie. Een onjuiste bronvermelding is slechter dan geen. Zie `JURIDISCHE_ANALYSE_SUPERMARKTDATA_2026-10.md` §1 en het eindadvies, en `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §6.1. Welke bronvermelding wél geldt, volgt uit de bronkeuze die daar openstaat.
- **USDA-aanvulling** (Laag 0b, was oorspronkelijk Laag 0): `usda-extract.mjs`'s `NUTRIENTS`-map uitbreiden met energie (208/1008), koolhydraten (205/1005), vet (204/1004), en overige "Voedingsstoffen"-velden (cholesterol 601/1253, natrium 307/1093, kalium 306/1092, vitamine A/C, calcium, ijzer). Draait tegen de supermarktproducten uit Laag 0 om ontbrekende micronutriënten aan te vullen, en (ongewijzigd uit het 26-sep-besluit) tegen de bestaande 53 al-gevonden `fdcId`'s uit `scripts/out/usda-rapport.json` voor de niet-supermarkt-catalogusregels.
- **Geen `verified: true`-eis** zoals bij de 5 kernstoffen: deze velden dragen geen claim en geen `/beste/*`-keten.
- Product-datamodel (`food-catalog.ts` / `DagboekItem`-afgeleiden) krijgt een los, optioneel veld voor deze bredere waarden — niet via `NutrientId` (zie §3). Supermarktproducten krijgen een eigen herkomstveld (bijv. `bron: "supermarkt:ah"` / `bron: "supermarkt:jumbo"`) naast de bestaande `FOOD_SOURCES`-sleutel, zodat de twee databronnen niet door elkaar lopen.

---

## 6. Bouwvolgorde (herzien 27 sep)

1. **Databron, Laag 0**: `scripts/supermarkt-extract.mjs` — parseert de vier CSV's naar gestructureerde macro/calorie-velden; Dennis beoordeelt het rapport.
2. **Databron, Laag 0b**: USDA-aanvulling op de supermarktproducten uit stap 1 + de resterende 53 fdcId's; Dennis beoordeelt het rapport.
3. **Laag A** (per product, UI): rijk invoerscherm met calorieën/macro-ring na productkeuze — gebouwd tegen de volledige velddefinitie, met `n.o.` waar data nog ontbreekt (zie §1 Laag A).
4. **Laag C** (instellingen): eigen macro/calorie-doel intypen, eigen tabel — moet er zijn vóór Laag 5 een doel toont.
5. **Laag B** (dagboek-tabbladen): Calorieën/Voedingsstoffen/Macro's op het dagboekscherm.
6. **Meer-menu**: item "Voeding"/"Dagboek" toevoegen aan `DASHBOARD_MORE_ITEMS` — kan onafhankelijk van 1-5, kleinste stuk, geen blokkade.

Elke stap apart reviewbaar en deploybaar, zelfde principe als de bestaande "plakken". Stap 3 (UI) hoeft niet te wachten tot stap 1/2 volledig zijn — zie de "UI eerst tegen voorlopige data"-afspraak in §1 Laag A.

---

## 7. Wat dit document níét zegt

Niet: dat het tekortsysteem, de 5 kernstoffen, of de asymmetrie-regel veranderen — die blijven exact zoals ze zijn.
Niet: dat ijzer/calcium nu wél als gemeten stof mogen — dat traject blijft `BESLUIT_IJZER_CALCIUM_2026-09.md` §8 volgen, onafhankelijk van dit besluit.
Niet: dat er een systeem-voorgesteld dieet-doel komt — elk doel in dit besluit is 100% door de gebruiker zelf ingevuld, nooit een vuistregel die het systeem aanbeveelt.
Niet: dat de supermarktdata een live prijs- of voorraadfeed wordt — het is een eenmalige extractie uit een snapshot-dataset (14 maart 2026), gebruikt voor macro/micro-informatie, niet voor prijzen.
Niet: dat het Meer-menu een nieuw component of ontwerp krijgt — het bestaande `CockpitMoreMenu`-patroon volstaat, alleen een item erbij.
Wel: calorieën/macro's/brede micronutriënten worden vanaf nu getoond als informatie, in de vorm van MyFitnessPal maar zonder het weekscore-oordeel-mechanisme dat eerder is afgewezen, gevuld eerst vanuit supermarktproducten en aangevuld met USDA.
