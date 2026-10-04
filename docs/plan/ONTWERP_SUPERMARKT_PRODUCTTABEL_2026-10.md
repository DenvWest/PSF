# Ontwerp — supermarktproducten in een eigen tabel (`sm_products`)

**Datum:** 3 oktober 2026
**Status:** gebouwd op branch `feat/supermarkt-tabel`, **niet live**: de tabel is leeg tot het licentiebesluit er is en de migratie is gedraaid.
**Besluit van:** Dennis, 3 okt ("akkoord met supabase-tabel")
**Volgt uit:** `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §5.3 en §6.3, en `JURIDISCHE_ANALYSE_SUPERMARKTDATA_2026-10.md` (eindadvies en bouweisen)

---

## 1. Waarom een tabel, en wat dit vervangt

De catalogus stond als `SUPERMARKT_CATALOG`-array in `src/data/nutrition/supermarkt-catalog.ts`. Dat werkte zolang hij leeg was. Met 36.000 producten (15 MB als JSON) belandt hij in de clientbundel van het dagboek, en dat is niet te verdedigen. De zoekfunctie deed bovendien een lineaire scan in de browser.

Nu: de producten staan in `sm_products`, de zoekfunctie draait server-side, en `supermarkt-catalog.ts` is verwijderd. Het type staat in `src/types/supermarkt-product.ts`.

**Wat het type veranderde.** De eerste dataset had een `supermarkt`-veld (AH/Jumbo/Lidl/Plus) en een `usdaZekerheid`. Beide vervallen: de USDA-aanvulling is afgewezen (VOORBEREIDING §5.4) en een product uit Open Food Facts hoort niet bij één keten. Nieuw zijn `bron`, `bronId`, `merk` en `snapshotDatum`. De naam "Supermarkt…" blijft staan op type, tabel, logs en events: hernoemen zou veel raken zonder iets op te leveren.

## 2. De tabel

Migratie `20261003090000_sm_products.sql`. Eén rij per product, alle waarden per 100 g/ml, `null` is onbekend (nooit 0).

- **`prod_id` = `<bron>:<bron_id>`**, bijvoorbeeld `off:8710400123456`. Een check-constraint dwingt dat af. Bij Open Food Facts is `bron_id` de barcode.
- **`bron` staat voorlopig alleen op `off`** (check-constraint). Een tabel met Open Food Facts-rijen moet als geheel onder de ODbL aangeboden kunnen worden en mag geen rijen uit een andere bron bevatten (ODbL §4.4.d). Een tweede bron is daarom een bewuste migratie na een licentiebeoordeling, geen extra waarde in een unie. Zie §7.
- **Geen `organization_id`.** Dit is gedeelde referentiedata, identiek voor elke tenant. Een org-kolom is betekenisloos en zou in de ODbL-dump belanden. De tabel staat daarom op `MONO_TABLE_ALLOWLIST` in `organization-id-drift.test.ts`, met reden. Code leest hem via `unscoped()`.
- **Zoeken:** kolom `zoek_tekst` (naam + merk, kleine letters, zonder accenten) met een trigram-index (`pg_trgm`). Geen generated column: `unaccent()` is niet immutable. De schrijver en de zoekopdracht gebruiken dezelfde `normaliseerZoektekst()`, zodat "creme fraiche" en "crème fraîche" elkaar vinden.
- **Rangschikking:** kolom `naam_lengte` (generated). Bij gelijke treffers komt de kortste naam eerst, dus "Havermelk" boven "Havermelk barista extra schuim 1 l".
- **Check-constraints op de waarden** (kcal 0–900, gram 0–100, mg ≥ 0). In de eerste dataset waren 134 van 35.517 rijen fysiek onmogelijk (kJ/kcal verwisseld, kolomverschuiving). `isPlausibelSupermarktProduct()` in TypeScript heeft dezelfde grenzen, zodat de schrijver zulke rijen overslaat in plaats van een hele batch te laten falen.
- RLS aan, geen policies: alleen service role.

## 3. Verwijzen, niet kopiëren

Dit is de harde eis uit de juridische analyse. Een dagboeklog (`account_supermarkt_portie_logs`) bewaart alleen `prod_id` en gram. Nooit een voedingswaarde.

- **Waarom:** kopieer je een kcal-waarde uit een share-alike-bron naar de dagboektabel, dan wordt die tabel mogelijk een afgeleide database onder de ODbL, met gezondheidsgegevens van gebruikers (AVG art. 9) erin. Dat conflict is niet op te lossen. Een verwijzing houdt de dagboektabel een onafhankelijke databank naast `sm_products` (ODbL §4.5.a).
- **Hoe:** de API koppelt het product bij het uitlezen aan de log (`koppelProducten()`, type `SupermarktPortie`). Alle sommen (dagtotaal, ring, weekoverzicht) rekenen op dat gekoppelde product. De pure rekenfuncties blijven synchroon en makkelijk te testen.
- **Bewaakt door een test:** `account-supermarkt-portie-logs.test.ts` controleert dat het insert-pakket precies `account_id`, `entry_date`, `moment`, `prod_id` en `grams` bevat. Komt er een voedingswaarde bij, dan faalt die test.
- **Geen foreign key** vanuit de logs naar `sm_products`. Een product dat uit een toekomstige dump verdwijnt, mag de dagboekregel niet meenemen. Rijen worden bij een verversing geüpsert (`schrijfSupermarktProducten`), nooit verwijderd.
- **Een log zonder product** (product weg, of de tabel niet bereikbaar) blijft zichtbaar als "Product niet meer beschikbaar", is te verwijderen en telt niet mee in een som.

**Afwijking van de analyse.** De analyse noemde "bron + barcode + snapshotdatum" per log. De bron en barcode zitten in `prod_id`. De snapshotdatum zit niet op de log: zonder dat we oude versies van een product bewaren, zegt een datum op de log niets, en bewaren we oude versies dan kopiëren we juist waarden. De snapshotdatum staat per product in `sm_products.snapshot_datum`.

## 4. Zoeken en ophalen

- **`GET /api/account/supermarkt-producten?q=`**, alleen voor ingelogde accounts, hooguit 20 resultaten. Er is bewust geen route die de tabel als geheel teruggeeft (ODbL §4.4.c behandelt een publieke dump als een aparte handeling).
- **Rate limit:** nieuwe sleutel `supermarkt_zoek`, 120 per minuut per IP (productie). De client debounced op 250 ms en breekt een verouderd verzoek af.
- **Minimaal 3 tekens** in minstens één term, anders helpt de trigram-index niet en komt bijna alles terug. Meerdere termen zijn een AND, in willekeurige volgorde. `%`, `_` en `\` in een zoekterm worden letterlijk genomen.
- **De logs-route** (`/api/account/supermarkt-portie-logs`) controleert bij een POST dat het product bestaat, en koppelt bij een GET de producten. Faalt het ophalen van producten, dan komt de dag toch terug, met `product: null` per log.
- **Foutgedrag:** zonder de tabel geeft zoeken een 500 en toont de UI geen supermarktresultaten. De rest van het zoekscherm werkt door. Daarom staat de migratie als "blokkeert deploy: nee" in `OPENSTAAND.md`.

## 5. Bronvermelding in de UI

Component `SupermarktBronRegel`, met de teksten uit `supermarkt-bron.ts`: "Voedingswaarden: **Open Food Facts**, beschikbaar onder de **Open Database License (ODbL)**", beide als link. Op het portiescherm (één product) linkt de bronnaam naar de productpagina bij Open Food Facts, zoals zij bij productspecifieke gegevens vragen. Onder een lijst (zoekresultaten, de dagboeksectie) linkt hij naar de bron in het algemeen.

**Open vraag voor de jurist (vraag 9):** is één bronregel per lijst voldoende, of moet hij bij elk product in de lijst staan? Nu staat hij onder elke lijst en op het portiescherm. Daarnaast ontbreekt nog de pagina "Bronnen en licenties" in de footer, met de downloadlink naar de ODbL-dump (zie §6).

## 6. Wat bewust niet is gebouwd, en wat er nog openstaat

1. **De importer.** Er staat geen data in de tabel. Open Food Facts levert een Parquet-dump (~4 GB wereldwijd). Die lezen vraagt een nieuwe afhankelijkheid (bijvoorbeeld DuckDB of `pyarrow`), en CLAUDE.md zegt de techstack niet zonder overleg te wijzigen. De schrijflaag (`schrijfSupermarktProducten`) en de mapping staan klaar en zijn getest.
2. **De ODbL-dump van de tabel (§4.6).** Wie de tabel gebruikt en publiek gebruik maakt van een afgeleide database, moet die op verzoek in machineleesbare vorm kunnen aanbieden. Dat is een eigen route of script plus de pagina "Bronnen en licenties". Nodig vóór livegang, niet erna.
3. **Het licentiebesluit en de menselijke jurist** (vragen 2, 3 en 8 van de analyse), en het antwoord van Open Food Facts op de mail.
4. **Prestatie op schaal.** De trigram-zoekopdracht is niet gemeten op 100.000+ rijen: er is geen data en geen lokale Postgres. Doe dit direct na de eerste import, met `explain analyze` op een paar gangbare zoektermen.
5. **De browser.** De UI is getest met Testing Library en een gemockte API, niet met echte data in een browser. Test op 375 px zodra er producten in de tabel staan.
6. **Het importscript uit PR #102** (`scripts/supermarkt-import.mjs`) levert nog het oude type met `supermarkt` en USDA-velden. Dat is onderzoeksmateriaal over de eerste dataset en gaat niet naar `sm_products`. Na het mergen van #102 hoort in VOORBEREIDING §5.3 een verwijzing naar dit document.

## 7. Hoe een tweede bron erbij komt

1. Licentiebeoordeling: mag de bron in een eigen laag, en onder welke voorwaarden?
2. Eigen tabel of eigen waarde in de `bron`-check, via een nieuwe migratie en een `OPENSTAAND.md`-blok. Heeft de bron een share-alike-licentie, dan krijgt hij een **eigen tabel**, zodat de ene dump niet de andere raakt.
3. Een waarde erbij in `SupermarktBron` en `SUPERMARKT_BRON_INFO` (naam, licentie, link naar het product). TypeScript dwingt af dat beide kloppen.
4. Een eigen importscript. De zoekroute en het koppelen van logs lezen over bronnen heen via `prod_id`.

Bij een tweede tabel wordt `haalSupermarktProductenOp` een lookup per bron; dat is dan een kleine aanpassing, geen herontwerp.

**3 okt: NEVO is de eerste tweede bron en volgt deze route.** Eigen tabel `nevo_foods`, eigen lib `src/lib/nevo-foods.ts`, eigen zoekroute; `SupermarktBron` blijft `off`. Zie `BESLUIT_NEVO_BRONVERMELDING.md`, laatste aanvulling.

---

## 8. Richting, nog niet gebouwd: ontbrekende producten aanleveren vanaf het etiket

Besproken met Dennis op 3 oktober, na de meting dat 42% van een steekproef Lidl-producten in Open Food Facts staat (waar beide een calorie-waarde hebben klopt die in 37 van 39 gevallen).

- **Idee:** vindt een gebruiker een product niet, dan fotografeert die het etiket. De gegevens gaan naar Open Food Facts en komen van daaruit terug in `sm_products`. De bron blijft zo Open Food Facts en de herkomst is schoon.
- **Waarom dit de enige route is om producten in Open Food Facts te krijgen:** hun voorwaarden eisen dat gegevens *rechtstreeks van het etiket* komen en foto's door de bijdrager zelf zijn genomen. Gegevens van andere websites, en dus ook van supermarktsites, zijn verboden: *"Contributors agree not to add on Open Food Facts information, data and photos from other websites (including other products databases, e-commerce websites, producers sites etc.)."*
- **Afgewezen:** de 36.000 producten uit de eerste dataset in Open Food Facts uploaden. Dat schendt hun voorwaarden en wast de herkomst niet schoon.
- **Voordeel:** de database groeit met wat gebruikers werkelijk zoeken, in plaats van met 36.000 producten die niemand logt.
- **Open:** hoe de aanlevering technisch en juridisch loopt (een eigen account of dat van de gebruiker, wat onze privacyverklaring daarover zegt, en welke hulpmiddelen Open Food Facts daarvoor biedt). Dat vraagt eerst overleg met hen en valt buiten dit ontwerp.

## 9. Voorstel, nog niet besloten: een generieke laag met "typische waarden"

Voorgesteld door Dennis (3 okt): een kopie van de producten uit de eerste dataset zonder supermarkt, wel met macro's en micro's. Uitgewerkt tot: per generiek productgroep **één gebundelde waarde** (mediaan met bandbreedte en aantal), zonder merk, zonder keten en zonder één afzonderlijke rij.

- **Meting (ruwe naam-match op de 371 generieke dagboekregels):** 175 regels hebben minstens 5 producten, bij 65 daarvan is de waarde stabiel (de middelste 80% binnen 35% van de mediaan). Voorbeelden: halfvolle melk 90 producten, 47 kcal, spreiding 6%; magere melk 14 producten, 35 kcal; chips 324 producten, 494 kcal. Hele voedingsmiddelen als appel of banaan komen er terecht niet door: de naam matcht te veel verschillende producten (appelsap, appeltaart). Daarvoor is NEVO de juiste bron.
- **Waarom dit juridisch sterker staat dan afzonderlijke rijen, en waarom het geen vrijbrief is:** de uitvoer maakt niets van de inhoud openbaar en is geen concurrerende database. Maar de eerdere kopie en onze kennis van de herkomst blijven bestaan. Dat is vraag 11 en 12 in `JURIDISCHE_VRAAG_SUPERMARKTDATA_2026-10.md` §7.
- **Wat het niet oplost:** de 16 "verrijkt"-regels. Bij plantaardige drankjes en margarine loopt de spreiding te ver uiteen (een mediaan zegt weinig over verrijking), en bij een derde van die regels zijn er te weinig producten.
- **Eerst de jurist.** Tot het antwoord er is, wordt hier niets van gebouwd en niets in `src/` gezet.
- **4 okt: herzien.** De waarden worden niet uit de eerste dataset berekend maar uit `sm_products`-rijen (herkomst Open Food Facts), en NEVO telt er nooit in mee. Zie `BESLUIT_VOEDINGSBRONNEN_LAGEN_2026-10.md`.

