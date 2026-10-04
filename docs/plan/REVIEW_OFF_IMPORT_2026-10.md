# Review — OFF-import, bronnenpagina en ODbL-dump (PR #114, #116, #117)

**Datum:** 4 oktober 2026
**Status:** review afgerond, door Dennis akkoord bevonden (4 okt: "akkoord, leg vast"). Er is niets in code of database gewijzigd; de fixes zijn nog niet gebouwd.
**Toetst:** commits `695d8d4d`, `4aced706`, `dee08f11`
**Tegen:** `BESLUIT_VOEDINGSBRONNEN_LAGEN_2026-10.md`, `ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md`, `BESLUIT_NEVO_BRONVERMELDING.md`, `STEEKPROEF_OFF_DEKKING_2026-10.md`

## Samenvatting

De licentiescheiding klopt: er staat geen NEVO in `sm_products` of in de dump, en een dagboeklog verwijst alleen. Twee dingen kloppen niet, en beide staan sinds 4 okt in de publieke ODbL-dump:

1. **Ongeveer drie kwart van de micro-waarden** (calcium, ijzer, vitamine C, vitamine D) in `sm_products` komt niet van het etiket. Het zijn schattingen die Open Food Facts uit de ingrediëntenlijst berekent. De Parquet-dump zet ze zonder vlag tussen de etiketwaarden.
2. **Een eenheidsfout in de extractor** maakt ~440 waarden 1.000 tot 1.000.000 keer te klein, waarvan 185 een verzonnen 0.

Het dagboek toont uit `sm_products` alleen kcal, koolhydraten, vet en eiwit. Gebruikers zien de foute micro's dus nog niet. Ze staan wel in de download op `/bronnen`, en de micro's zijn bedoeld voor latere weergave ("brede micro's", `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md`).

De dekkingsmeting houdt in richting stand, maar de getallen zijn te laag: ruwweg 35–45% in plaats van 22–30%.

## Hoe getoetst

- `/code-review high` op `a00ecf33..dee08f11`, elke bevinding nagerekend. Eén bleek veel kleiner dan gemeld (#2), één vervalt (zie "Vervallen").
- De Parquet-dump `food.parquet` van 4 okt, de bron van de extractie, met DuckDB. Alleen lezen.
- `scripts/out/off-nl.ndjson` en een download van de dump-route van 4 okt 10:27 (58.690 rijen, compleet).
- De OFF-API (`/api/v2/product/<barcode>.json`, velden `nutriments` en `nutriments_estimated`), ~80 verzoeken. OFF gaf na ~14 snelle verzoeken een 429; met 8 seconden pauze ging het.
- De live site: alleen `GET /bronnen`, `GET /robots.txt`, een DNS-lookup en een verbindingstest op poort 3000.
- Niets naar Supabase geschreven, geen `--schrijf`.

## Bevindingen, op ernst

### 1. Hoog — de meeste micro-waarden zijn door OFF geschat, niet van het etiket

**Waar:** `scripts/off-extract.py:139-147` leest elke regel uit `nutriments` als etiketwaarde. De claim staat in `supabase/migrations/20261003090000_sm_products.sql:64` ("zoals op het etiket") en in `src/app/bronnen/page.tsx:49-53` ("de open database van vrijwilligers").

**Wat:** OFF schat voor veel producten de micro's uit de ingrediëntenlijst. In de API staan die schattingen apart, in `nutriments_estimated`; de etiketwaarden staan in `nutriments`. De Parquet-dump zet beide in dezelfde lijst, zonder vlag. Het enige spoor is een lege `value`, maar die is ook leeg bij veel geïmporteerde etiketdata. De extractor kan het verschil dus niet zien.

**Meting:**
- 24 willekeurige rijen met micro's (seed 99) tegen de API: 59 van de 77 micro-waarden zijn geschat. Per rij: 14 alleen geschat, 1 gemengd, 9 etiket.
- In de Parquet hebben 7.131 van de 10.191 rijen met micro's de volledige set geschatte vitamines (A, B1, B2, B6, B9, B12, E, PP) zonder `value`. Daarvan zijn er 4 van 4 gecontroleerd: geschat. Van de 2.124 rijen zonder die set waren 2 van 4 geschat; van de 933 met een ingevulde `value` waren 2 van 2 etiket. Die signatuur is dus geen bruikbaar filter.
- kcal, macro's, zout en natrium kwamen in alle 30 rijen van de steekproef (zie "Wat goed is") van het etiket.

**Scenario:** bij Jumbo Yoghurt Griekse stijl (`off:8718452520671`) staan op het etiket in OFF alleen kcal en eiwit. In `sm_products` en in de dump staat calcium 203,3 mg, vitamine D 1,27 µg, en ijzer en vitamine C allebei 0,4 mg (hetzelfde getal). Ook de 37 mg vitamine C bij AH Sinaasappelsap versgeperst (`off:8710400097259`) is een schatting.

**Waarom het telt:** het BESLUIT zet typische waarden in een eigen, uitgestelde laag: eerst de jurist, alleen als bandbreedte, nooit uit minder dan 5 producten van 3 merken. Een schatting per product is zo'n laag, maar zonder die voorwaarden, en hij staat al live als etiketwaarde. Het is geen NEVO, dus de RIVM-voorwaarden zijn niet geraakt.

**Fix:**
1. Nu: de vier micro-kolommen niet meer extraheren, en opnieuw extraheren en laden. `naarTabelRij` vult ontbrekende kolommen met `null` en de upsert overschrijft ze. In de UI verandert niets.
2. Daarna: de JSONL-export van OFF gebruiken, waarin `nutriments` en `nutriments_estimated` gescheiden zijn, en alleen `nutriments` overnemen. Nog niet geverifieerd: controleer eerst dat `8718452520671` daar geen calcium heeft.
3. Een herkomsttest met vaste barcodes (zie "Testgevallen"): elke micro in `sm_products` moet in `nutriments` staan, niet alleen in `nutriments_estimated`.
4. Pas daarna de micro's weer laden en `/bronnen` en de migratie-comment bijwerken.

### 2. Hoog — eenheidsfout: het `100g`-veld staat altijd in gram

**Waar:** `scripts/off-extract.py:110-118`, aangeroepen op `:144`.

**Wat:** `omrekenen(n["100g"], n["unit"], …)` gebruikt de eenheid waarin de bijdrager de waarde invoerde als eenheid van het `100g`-veld. Dat veld staat bij OFF altijd in gram (energie in kcal); de docstring zegt dat zelf ook (r. 27-30). Het gaat goed bij `unit = "g"`, het overgrote deel. Het gaat fout bij `mg`, `µg` en `mcg`.

**Meting:**
- Eenheden in de Parquet (NL-rijen): calcium 8.913 in g, 165 in mg. Vitamine C 8.714 in g, 185 in mg. Vitamine D 7.999 in g, 89 in µg, 10 in mcg, 3 in mg, 2 in IU. Zout en natrium elk 329 in mg, naast ~49.400 in g.
- Herberekend met en zonder fix: ~440 waarden wijken af, waarvan 185 een verzonnen 0.

| Kolom | Verzonnen 0 | Anders fout | Na fix leeg (boven `MICRO_MAX`) | Na fix gevuld (`% DV`/IU)* |
|---|---:|---:|---:|---:|
| `vitamin_d_ug` | 77 | 0 | 3 | 2 |
| `salt_g` | 42 | 2 | 0 | 0 |
| `iron_mg` | 36 | 41 | 0 | 4 |
| `sodium_mg` | 20 | 27 | 0 | 0 |
| `calcium_mg` | 10 | 104 | 0 | 5 |
| `vitamin_c_mg` | 0 | 67 | 0 | 4 |

\* Nu valt een waarde met eenheid `% DV` of IU weg als onbekende eenheid. Na de fix wordt hij gevuld. Niet apart gecontroleerd of OFF die waarden in het `100g`-veld ook in gram zet.

**Scenario:** Blue Band Goede Start! (`off:8719200054196`). Vitamine D (`value=7.5, unit=µg, 100g=7.5e-06`) wordt 0 in plaats van 7,5 µg. Calcium (`value=603, unit=mg`) wordt 0,6 mg in plaats van 603. Bij Vers sinaasappelsap McDonald's (`off:8713245168016`) wordt vitamine C 0,05 mg in plaats van 51.

**Correctie op de review-skill:** de skill noemde "5.041 van 8.626 vitamine C-waarden onder 1 mg" als bewijs. Die kleine waarden komen grotendeels uit AH- en Jumbo-feeds met `unit = "g"` en zijn correct omgerekend. De fout raakt de 1–2% van de waarden die in mg of µg is ingevoerd.

**Fix:**
- Voor alles behalve kcal: `waarde_100g / NAAR_GRAM[doel_eenheid]`, en `unit` negeren.
- Een unittest met `unit: "mg"` en `unit: "µg"`.
- Ook nodig als de micro's voorlopig leeg blijven (#1), voor zout en natrium.
- Nagerekend: met de fix valt geen rij weg en komt er geen bij (58.690 blijft 58.690). Opnieuw extraheren en laden herstelt dus alles via de upsert.
- Randgeval: Gouda's Glorie plantaardige halvarine (`off:8722100047755`). De bijdrager voerde 7,5 *mg* vitamine D in. De huidige fout maakt daar toevallig weer 7,5 µg van. Na de fix wordt het 7.500 µg, dus boven `MICRO_MAX`, dus leeg. Dat is correct.

### 3. Middel — dump-route: één verzoek kost 59 query's, alleen per IP begrensd

**Waar:** `src/app/api/bronnen/open-food-facts/route.ts:19-54`, `src/lib/rate-limit-config.ts:119`.

**Wat al goed afgedekt is:**
- `getClientIp` vertrouwt alleen `x-real-ip` van nginx, en dat is niet te omzeilen: poort 3000 is van buiten niet bereikbaar.
- Er is geen AAAA-record, dus geen IPv6-adressen om mee te rouleren.
- `robots.txt` sluit `/api` uit, dus crawlers halen de dump niet.
- Het geheugen blijft begrensd (pull-stream, keyset op de primaire sleutel).

**Wat:** elke download kost ~59 opeenvolgende PostgREST-query's en ~9 MB (de download van 10:27 was 8,8 MB). Die query's lopen via dezelfde databaseverbindingen als intake, account en dagboek. Een limiet van 5 per uur per IPv4-adres houdt één adres tegen, maar geen netwerk van proxy's.

**Scenario:** 50 adressen × 5 downloads per uur geeft ~15.000 query's en ~2 GB dataverkeer per uur. De verbindingen raken vol en de hele site wordt traag.

**Fix (voorstel):** de data verandert alleen als de loader draait. Laat de loader de dump één keer maken, als zip met licentie (zie #4), en zet die op een plek die hem zonder databasequery serveert (Supabase Storage of de server, met cache-headers). De route verwijst daarnaar. Dat lost ook #9 op en voorkomt dat een download tijdens een load twee snapshots mengt. Minimale variant: hooguit 1–2 dumps tegelijk, anders 503 met `Retry-After`.

### 4. Middel — ODbL §4.2(b): de licentie hoort ook ín het bestand

**Waar:** `src/app/api/bronnen/open-food-facts/route.ts:56-63`.

**Wat:** de CSV bevat geen licentie of bronvermelding. Er is alleen een `Link`-header, en die is weg zodra iemand het bestand doorstuurt. §4.2(b) vraagt de licentie-URI "both in the Database or Derivative Database and in any relevant documentation".

**Fix:** lever een zip met:
- de CSV;
- een `LICENTIE.txt` (ODbL 1.0, met de inhoud onder de DbCL);
- een `LEESMIJ.txt` (© Open Food Facts contributors, snapshotdatum, wat er veranderd is).

Neem dit punt mee in de jurist-vragen, bij vraag 9.

### 5. Middel — teksten op /bronnen kloppen niet helemaal met de code

**Waar:** `src/app/bronnen/page.tsx`.

- r. 49-53, "de open database van vrijwilligers": de meeste micro's zijn OFF-schattingen (#1).
- r. 72, "eenheden omgerekend": voor ~440 waarden fout (#2).
- r. 92, "Een lege cel betekent onbekend, nooit nul": klopt voor lege cellen, maar 185 nullen zijn verzonnen (#2).
- r. 70-78, de lijst met wijzigingen mist:
  - de afronding (kcal op 1 decimaal, micro's op 1–2);
  - de naamkeuze (eerst nl, dan de hoofdtaal, dan en) en het afkappen op 300 tekens;
  - de apostrof voor tekst die met `=`, `+`, `-` of `@` begint (die verandert inhoud in de dump);
  - dat 737 producten met alleen kJ wegvallen.
- r. 126-127, "De voedingswaarden halen we bij het tonen uit de bron op": ze komen uit onze kopie (`sm_products`, `nevo_foods`), niet live van OFF of het RIVM.
- Geen medische claims; de disclaimerlink staat er.

**Fix:** de teksten aanpassen zodra #1 en #2 zijn opgelost. Zolang de micro's leeg zijn, vervalt het eerste punt.

### 6. Middel — de dekking ligt eerder rond 35–45% dan op 22–30%

**Waar:**
- `scripts/off-dekking.py:105` (gelijke kandidaten), `:73` (zeldzame woorden), `:142` (schrijfpad);
- de Lezing in `STEEKPROEF_OFF_DEKKING_2026-10.md`;
- punt 2 van "Wat nog openstaat" in `BESLUIT_VOEDINGSBRONNEN_LAGEN_2026-10.md`.

**Gereproduceerd:** 22,5–30,2%, exact het rapport. Varianten:

| Variant | Dekking |
|---|---|
| A. Zoals het rapport (`off-nl.ndjson`) | 22,5% – 30,2% |
| B. A, met gelijke kandidaten (zelfde product, twee barcodes) als match | 22,5% – 32,1% |
| C. Alle NL-getagde OFF-producten met kcal, ook de rijen die de extractor liet vallen | 22,6% – 32,3% |
| D. NL + BE | 24,4% – 34,8% |
| E. NL + BE + overige met een Nederlandse naam | 24,8% – 35,3% |

**Handcontrole:** 40 willekeurige producten die variant A niet vond (seed 11), naast de beste kandidaten in OFF gelegd:
- **7 zeker in OFF-NL, met dezelfde kcal:** Hellmann's Real, Santa Maria Dip Mix Guacamole, Maggi Braadstomen Provençaal, Côte d'Or BonBonBloc, Gouda's Glorie Red Hot Samurai, AH verse lasagne, Huls chorizosticks.
- **4 waarschijnlijk:** Melkunie proteïnekwark aardbei, Lay's Bugles, Verstegen mix voor gehakt, De Ruijter vlokken.
- **4 aanwezig, maar met een andere of foute kcal:** Dolce Gusto-capsules (2×), Jumbo kransjes, AH Iberico ribfingers.
- **2–3 alleen met een BE-tag:** Takis Queso Volcano, Mora kaasballetjes, mogelijk Koikeya.
- **De rest (~22):** niet gevonden.

De gemiste producten vallen af op de naamdrempel (Jaccard < 0,7), door extra woorden als "mayonaise", "dipsaus" of "BLK 1 ster".

**Gevolg:**
- Ruwe schatting: 30% gevonden, plus 17–28% van de 70% die niet gevonden werd, min wat valse matches. Dat komt op ruwweg 35–45%. Met n = 40 is de onzekerheid groot.
- "Ruim twee derde ontbreekt" wordt "de helft tot twee derde".
- De richting van de conclusie blijft: de typische-waardenlaag en de aanlever-route blijven relevant.
- "De waarheid ligt in het midden" (tussen 42% en 25%) volgt niet uit de meting. De eerdere Lidl-steekproef van 42% ligt dichter bij deze schatting dan het rapport aangaf.
- De docstring noemt `exact` een ondergrens "vrijwel zonder valse matches", maar de eigen Lezing laat generieke Lidl-matches zien (Oregano → Kania).

**Fix:**
- Gelijke kandidaten met dezelfde tokens als één match tellen.
- Het script naar `scripts/out/` laten schrijven. Nu overschrijft het het rapport in `docs/plan/`, inclusief de handgeschreven Lezing (`:142`).
- De handcontrole als derde getal in het rapport en in het BESLUIT opnemen.

### 7. Laag — loader zonder retry en zonder hervatting (was al bekend)

**Waar:** `scripts/off-laden.mjs:119-123`, `:71`.

**Scenario:** stel dat "fetch failed" optreedt bij batch 60. Dan zijn rijen 0–29.999 bijgewerkt en de rest niet. Opnieuw draaien is veilig (de upsert is idempotent), maar begint weer bij 0. Eén `NaN` in het bestand laat `JSON.parse` het hele bestand weigeren, zonder regelnummer.

**Fix:**
- Per batch opnieuw proberen bij tijdelijke fouten (fetch failed, 5xx, 429), met oplopende wachttijd. Het tijdelijke script dat op 4 okt het laden afmaakte, deed tot 6 pogingen met 1 s × poging.
- `--vanaf=<n>` om te hervatten, `JSON.parse` per regel met regelnummer, en aan het eind een telling tegen het verwachte aantal.
- Melden hoeveel rijen in de tabel staan die niet meer in het bestand zitten. De upsert verwijdert nooit, dus die blijven met een oude `snapshot_datum` staan, ook in de dump.
- Hetzelfde in `scripts/nevo-laden.mjs`, liefst via één gedeelde helper. Die kan ook `laadEnv` overnemen, dat nu dubbel staat.

### 8. Laag — drempels in de extractor

De drempels zijn grotendeels goed afgesteld. Van de 68.127 gelezen NL-producten zijn er 58.690 geschreven. Overgeslagen:
- 8.003 zonder kcal, waarvan 737 met alleen kJ;
- 902 zonder naam of geldige barcode;
- 434 waar energie en macro's niet bij elkaar passen;
- 98 met onmogelijke waarden.

Drie gaten:

- **De energiecontrole** (`scripts/off-extract.py:163-167`) is te streng voor polyolen en alcohol. Van de 434 rijen hebben er 102 polyolen (> 1 g) en 30 alcohol (> 0,5 %vol), plus wijnen zonder alcoholveld. Daardoor ontbreken suikervrij snoep, zoetstoffen, wijn en champagne in de zoekresultaten.
  - Fix: polyolen meetellen met 2,4 kcal/g (en ze van de koolhydraten aftrekken), en alcohol met %vol × 0,789 × 7 kcal.
- **Natrium heeft geen bovengrens** (`:74`, en in de migratie `:75`). Eén rij staat boven 40.000 mg, terwijl puur zout ~39.300 mg natrium bevat. Ook 46 g zout in Appelsientje Zontomaatje en 14 g in een Ritter Sport komen erdoor.
  - Fix: `sodium_mg` ≤ 40.000 in `MICRO_MAX`.
  - Eventueel een massabalans-vlag: 218 rijen zitten boven 105 g per 100 g. Dat is gemengd: echte fouten, maar ook Amerikaanse etiketten met vezels in de koolhydraten. Markeren, niet laten vallen.
- **Niet-eindige getallen** komen nu niet voor (gecontroleerd). `math.isfinite` en `json.dumps(..., allow_nan=False)` voorkomen dat één `NaN` later de loader breekt.

De `MICRO_MAX`-waarden zelf zijn redelijk. Na de eenheidsfix gaan er maar 6 extra waarden naar leeg (3 vitamine D, 2 ijzer, 1 calcium).

### 9. Laag — details in de dump-route

**Waar:** `src/lib/sm-products-dump.ts:62-63`, `src/components/bronnen/DumpDownloadLink.tsx:12`.

- **Stoppen bij een korte pagina** breekt als Supabase ooit minder dan 1000 rijen per verzoek teruggeeft. Nu gaat het goed: de download van 10:27 was compleet. Veiliger is stoppen bij een lege pagina.
- **Een fout halverwege** wordt nergens gelogd. De browser ziet een mislukte download, de server niets.
- **Elke CSV-regel is een eigen chunk**, ~59.000 per download. Eén chunk per pagina is goedkoper.
- **GA4 `bronnen_dump_download` telt kliks**, ook als de route een 429 geeft. Bij een 429 krijgt de gebruiker geen uitleg.

Met de statische zip uit #3 verdwijnen al deze punten.

### 10. Laag — de grenzen staan op vier plekken

`GRENZEN` (Python), `KOLOM_GRENZEN` (mjs), `isPlausibelSupermarktProduct` (TS) en de check-constraints (SQL) worden met de hand gelijk gehouden. Een test die de drie kopieën tegen de constraints in de migratie legt, voorkomt dat ze uit elkaar lopen.

### Vervallen

- **"Geen CTA naar /intake op /bronnen"** (review-skill). Klopt niet: `ContentPageLayout` zet onder elke juridische pagina "Verder lezen", met "Gratis intake" en de Supplementengids.

## Wat goed is

- **De licentiegrenzen zitten in de structuur.** `check (bron in ('off'))`, `afwijzing()` in de loader met een test, NEVO in een eigen tabel, en de dump leest alleen `sm_products`. NEVO kan niet in de dump komen.
- **Verwijzen, niet kopiëren, houdt stand.**
  - Portielogs bewaren alleen `prod_id` en gram, en een test bewaakt dat.
  - `DagboekItem` verwijst naar de eigen catalogus.
  - Totalen worden bij het uitlezen berekend.
  - Er is geen andere tabel met OFF-waarden gevonden.
- **De steekproef van 30 willekeurige rijen** (seed 20261004) tegen de OFF-API: 28 identiek in alle 13 kolommen. kcal, macro's, zout en natrium klopten in alle 30, net als naam, merk en de NL-tag. De twee afwijkingen zijn #1.
- **De route is netjes gebouwd.**
  - Het geheugen blijft begrensd en `cancel()` sluit de generator.
  - Tekst die als formule gelezen kan worden, krijgt een apostrof.
  - `null` blijft een lege cel.
  - De zoeknormalisatie in Python (`normaliseer_zoektekst`) doet hetzelfde als die in TS.

## Wat live staat

De drie PR's zijn op 4 okt automatisch gedeployd; dat kon nog, want het was vóór #113. `/bronnen` en de dump zijn live en `sm_products` is geladen. #1 en #2 staan dus in de publieke download. In het dagboek zijn ze niet zichtbaar.

## Voorgestelde volgorde

1. **#1 en #2 in één wijziging:** #2 oplossen en de micro's leeg laten. Daarna opnieuw extraheren en laden, de testgevallen hieronder controleren, en de dump opnieuw downloaden en nakijken.
2. **#3 en #4 samen:** de dump als statische zip met licentie.
3. **#5:** de teksten op `/bronnen`.
4. **#6:** de dekkingsgetallen in het rapport en in het BESLUIT.
5. **#7–#10:** bij de volgende verversing van de data.
6. **Daarna pas de micro's opnieuw**, uit een bron die etiket en schatting scheidt (#1, stap 2).

## Testgevallen

Vaste barcodes om de fixes en de herkomsttest mee te toetsen. Waarden per 100 g, uit OFF op 4 okt.

| Barcode | Product | Toetst | Verwacht |
|---|---|---|---|
| 8718452520671 | Jumbo Yoghurt Griekse stijl naturel | geschatte micro's (#1) | geen calcium, ijzer, vitamine C of D; op het etiket staan alleen kcal 122 en eiwit 3,4 |
| 8710400097259 | AH Sinaasappelsap versgeperst | geschatte micro's (#1) | geen micro's van het etiket |
| 8719200054196 | Blue Band Goede Start! | `unit = µg` en `mg` (#2), etiketwaarden | vitamine D 7,5 µg en calcium 603 mg (nu 0 en 0,6) |
| 8713245168016 | Vers sinaasappelsap McDonald's | `unit = mg` (#2), etiketwaarde | vitamine C 51 mg (nu 0,05) |
| 8722100047755 | Gouda's Glorie plantaardige halvarine | invoerfout van de bijdrager (7,5 mg vitamine D) | na de fix leeg (boven `MICRO_MAX`); nu toevallig 7,5 |

## Open vragen

- **Voor de jurist (bij vraag 9):** moet de licentie-URI in het bestand zelf staan (#4)?
- **Voor Dennis:** micro's leeg laten tot er een bron is die etiket en schatting scheidt, of de geschatte waarden houden met een eigen label ("geschat door Open Food Facts")? Advies: leeg laten. Een schatting per product past niet in de laag "merkproducten per barcode", en de typische-waardenlaag is nog niet besloten.
