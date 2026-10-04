# Besluit: drie lagen voor voedingsdata, geen live supermarktdata

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "akkoord en ga door"); alleen vastleggen, er is niets in `src/` veranderd
**Raakt:** `sm_products`, `nevo_foods`, het dagboek, het idee van een generieke laag (`ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §9)
**Volgt uit:** `JURIDISCHE_ANALYSE_SUPERMARKTDATA_2026-10.md` (in PR #102), `BESLUIT_NEVO_BRONVERMELDING.md`, `ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md`

## De vraag

De eerste dataset (checkjebon, ~36.000 etiketproducten) is van onduidelijke herkomst: checkjebon bevat zelf geen voedingswaarden, dus ze komen van de supermarktsites of van Open Food Facts, en per rij is niet na te gaan welke. Jumbo verbiedt scrapen expliciet. De vraag was hoe we toch een breed productschap krijgen zonder die herkomst mee te nemen.

## Het besluit

| Laag | Bron | Tabel | Gebruik |
|---|---|---|---|
| Generiek ("yoghurt, naturel") | NEVO 2025/9.0 | `nevo_foods` | Basis; ongewijzigd, met `NEVO_CITATION` |
| Merkproducten | Open Food Facts, per barcode | `sm_products` | Alleen OFF-rijen; bronregel bij de waarden |
| Typische waarden voor gaten | Gemiddelde uit **OFF-rijen** | nog geen | Uitgesteld, zie "Wat nog openstaat" |

De 36.000 producten uit de eerste dataset blijven lokaal. Ze zijn onderzoeksmateriaal (matchen, toetsen) en gaan niet naar productie, niet in de repo en niet in een tabel.

## Afgewezen, met reden

1. **Ketenspecifieke producten live tonen ("Jumbo-yoghurt").** De voorwaarden van de ketens verbieden scrapen (Jumbo expliciet, AH en Plus algemeen). Het databankenrecht is op deze velden zwak, maar juist daardoor worden de gebruiksvoorwaarden beslissend.
2. **Supermarktnaam weglaten en de rest behouden.** Anonimiseren lost de herkomst niet op: de verzameling zelf blijft staan, en jurist-vraag 2 (aansprakelijkheid terwijl we de herkomst kennen) blijft open.
3. **Gemiddelden als hoofdbron, berekend uit de scrape.** Die uitvoer is juridisch sterker dan losse rijen, maar niet schoon: de eerdere kopie blijft bestaan. Hetzelfde idee uit OFF-rijen heeft wel een schone herkomst, en dat vervangt dit.
4. **Gemiddelden over NEVO-waarden.** RIVM staat gebruik alleen "ongewijzigd" toe. Een gemiddelde is een bewerking. NEVO wordt dus nooit gemengd of gemiddeld.
5. **Gebruikersvoorwaarden als vervanging voor een bronlicentie.** Toestemming van gebruikers dekt de AVG-kant van het dagboek (gezondheidsdata, art. 9), niet de rechten op de brondata. Voorwaarden van ons kunnen de ODbL of een supermarktvoorwaarde niet opheffen.
6. **De 36.000 producten in Open Food Facts uploaden.** Hun voorwaarden eisen dat gegevens rechtstreeks van het etiket komen (ONTWERP §8).

## Randvoorwaarden die blijven gelden

- Een dagboeklog **verwijst** (`prod_id`) en bewaart nooit een voedingswaarde. Dagtotalen worden bij het uitlezen berekend.
- `sm_products` bevat alleen OFF-rijen (ODbL §4.4.d). Een tweede bron krijgt een eigen tabel.
- De bronregel staat bij de waarden zelf, met een link naar het OFF-product en de licentie. Alleen een footerpagina is niet genoeg.
- **NEVO moet gratis blijven voor de eindgebruiker** (RIVM-voorwaarde). Een betaalde partner-API of B2B-product mag NEVO niet bevatten. Dit geldt niet voor `sm_products`-gegevens, maar daar geldt de deelplicht van de ODbL voor een afgeleide database (jurist-vraag 3).
- Een typische waarde mag nooit uit minder dan 5 producten van minimaal 3 merken komen, en wordt als bandbreedte (P25–P75) getoond. Met N=1 is een gemiddelde een kopie.

## Wat nog openstaat

1. **De OFF-importer: extractor klaar (4 okt, PR #116).** `scripts/off-extract.py` (DuckDB, los van de app, geen afhankelijkheid in `package.json`) leest de Parquet-dump en schrijft 58.690 Nederlandse producten als NDJSON in de vorm van `sm_products`. Nog te doen: de loader naar Supabase (`scripts/off-laden.mjs`, naar het voorbeeld van `nevo-laden.mjs`), pas nadat de migratie is gedraaid.
2. **De dekkingsmeting: gedaan (4 okt)**, zie `STEEKPROEF_OFF_DEKKING_2026-10.md` (PR #116). Op naam + kcal staat 22–30% van de 36.000 producten in OFF. De typische-waardenlaag blijft dus relevant.
3. **De typische-waardenlaag (ONTWERP §9).** Blijft op "eerst de jurist". De versie die we nu willen is anders dan die in §9: berekend uit `sm_products`-rijen, niet uit de scrape. Of dat een "produced work" onder de ODbL is (alleen bronvermelding) of een afgeleide database (deelplicht), is een vraag voor de jurist.
4. **Jurist en Open Food Facts.** De drie vragen uit de analyse en het antwoord van OFF op de mail (vraag 5 daarin dekt het B2B-punt).
5. **De pagina "Bronnen en licenties"** en de ODbL-dump van `sm_products` (nodig vóór livegang van OFF-data).
6. **Review van PR #114, #116 en #117 (4 okt):** zie `REVIEW_OFF_IMPORT_2026-10.md`. De micro's in `sm_products` zijn grotendeels door OFF geschat en niet van het etiket. Een eenheidsfout maakt bovendien ~185 waarden ten onrechte 0. Beide staan in de publieke dump. De dekking uit punt 2 ligt eerder rond 35–45%. De fixes zijn nog niet gedaan.
