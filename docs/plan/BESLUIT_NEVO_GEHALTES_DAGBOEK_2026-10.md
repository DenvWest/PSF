# Besluit: NEVO-gehaltes als vaste data in de dagboekcatalogus, omega-3 via EPA en DHA

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt, twee keuzes na voorlegging)
**Raakt:** `food-catalog.ts`, `food-catalog-nevo.ts`, het dagboek (tabel per eetmoment, productdetail, krans)
**Volgt uit:** `BESLUIT_NEVO_BRONVERMELDING.md`, `BESLUIT_VOEDINGSBRONNEN_LAGEN_2026-10.md`

## Aanleiding

Het dagboek toonde `n.o.` voor stoffen die een product wel heeft: "Zalm, gerookt" gaf geen eiwit en geen omega-3. Oorzaak: 279 van de 371 catalogusregels hebben geen `bron` (verwijzing naar `FOOD_SOURCES`), terwijl voor 221 daarvan al een NEVO-koppeling bestond. Een product moet elke van de vijf dagboekstoffen laten zien die het heeft.

## Besluit

1. **Statisch genereren, niet live ophalen.** `scripts/nevo-gehaltes.mjs` schrijft eiwit, magnesium, zink, vitamine D, EPA en DHA per catalogusregel naar `src/data/nutrition/food-catalog-nevo-gehaltes.ts`. Het dagboek blijft synchroon.
2. **Eén plek per gehalte.** `FOOD_SOURCES` (via `bron`) gaat voor; NEVO vult alleen aan waar een stof daar ontbreekt (`src/lib/nutrition-catalog-gehalte.ts`). Een beoordeelde rij wordt nooit overschreven.
3. **Alleen ongewijzigd en met bron.** Waarden staan zoals NEVO ze geeft. Productdetail toont "NEVO-online versie 2025/9.0, RIVM, Bilthoven" zodra een stof uit NEVO komt.
4. **Weggelaten, niet nul.** Een spoor (TR), een 0 en alles per 100 ml blijven `n.o.`. Koppelingen met `basis: "benadering"` (32 stuks) krijgen geen micronutriënten. Na deze stap hebben nog 100 van de 371 regels geen enkel gehalte (benaderingen en regels zonder koppeling): dat blijft `n.o.`.

## Wijkt af van een eerder besluit

`nevo-food.ts` liet omega-3 bewust weg: de EPA+DHA-som is een bewerking en RIVM staat alleen ongewijzigd gebruik toe. Nu worden **EPA en DHA los en ongewijzigd** opgeslagen, alleen voor vis en zeevruchten (NEVO meldt bij o.a. havermout, koek en pindakaas een DHA-waarde die laboratoriumruis lijkt en niet als omega-3-bron mag lezen); alleen de som voor de dagboekuitlezing (mg omega-3) wordt in de app berekend en als **afgeleid** getoond, met EPA en DHA apart zichtbaar in het productdetail. De tabel `nevo_foods` blijft zonder omega-3-kolom.

## Afgewezen

- **Live uit `nevo_foods`:** altijd actueel, maar de dagsom zou asynchroon worden en krans en tabellen moeten wachten op een fetch. De data verandert alleen per NEVO-editie.
- **Omega-3 `n.o.` laten bij NEVO-producten:** zou zalm gerookt en vergelijkbare vis structureel zonder omega-3 laten.
- **Zalm gerookt laten lenen van `zalm-gekweekt`:** de catalogus zegt met reden dat een variant niet leent van zijn basis (ander vocht- en zoutgehalte).

## Bij een nieuwe NEVO-editie

`node scripts/nevo-gehaltes.mjs` opnieuw draaien en `NEVO_EDITIE` in het script verhogen. Koppelingen zelf komen uit `scripts/nevo-koppel.mjs`.
