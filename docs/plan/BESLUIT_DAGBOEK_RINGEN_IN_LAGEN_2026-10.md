# Besluit: de krans als drie lagen (midden · kernstoffen · ook gevolgd)

**Datum:** 5 oktober 2026
**Status:** besloten (Dennis, 5 okt: "akkoord met jouw eerste vormgeving")
**Raakt:** `DagboekKrans` (tabbladen Vandaag en Voedingsstoffen); `DagboekOokGevolgd` vervalt
**Herziet:** `BESLUIT_RIJKSTE_BRONNEN_EN_RINGTEGELS_2026-10.md` §4 en twee afgewezen opties daarin (zie onder)
**Bouwt voort op:** `BESLUIT_DOELEN_VERBONDEN_2026-10.md` §2, `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md` §2

## Aanleiding

De krans, de vijf kerntegels eronder en de rij ringtegels "Ook gevolgd" lazen als drie losse blokken. De kerntegels toonden bovendien opnieuw wat de krans al toonde.

## Besluit

1. **Eén beeld met drie lagen.**
   - **Midden:** "Wat at je vandaag?", daarna "x van y gedekt".
   - **Binnenring:** de vijf kernstoffen, elk in een eigen kleur. De telling en het gestippelde spoor (zink, vitamine D) blijven ongewijzigd.
   - **Buitenring:** de gevolgde stoffen, dunner (8 tegen 16), in één neutrale tint en met een duidelijke tussenruimte. De ring vult tot de RI. Een stof zonder RI krijgt een gestippeld spoor zonder vulling. Er komt geen ✓ en de buitenring telt nooit mee.
2. **De "+" zit aan het einde van de buitenring.** Die opent dezelfde `GevolgdeStoffenKiezer` (`surface: "dagboek"`). Er komt geen eigen opslag of rekenpad.
3. **Meedraaien = één draai op een tik, geen carrousel.** Tik je een segment aan (of de chip eronder), dan draait die ring langs de kortste weg zodat de stof bovenaan staat, bij een kleine wijzer. De overige segmenten worden gedempt. Eén regel onder de krans toont de stof met de vervolgstap: "Logboek van … →" voor een kernstof, "Rijkste bronnen →" voor een gevolgde stof die er een heeft. De animatie draait alleen bij `motion-safe`, er is geen doorlopende beweging en alle stoffen blijven zichtbaar.
4. **Chips in plaats van kaarten.** Onder de krans staat per ring een rij compacte chips met naam en waarde. Ze leveren het label dat de ring zelf niet draagt en zijn de toegang voor het toetsenbord en voor schermlezers (`aria-pressed`). De SVG is `aria-hidden`.
5. **De binnenring is niet aanpasbaar.** Gevraagd werd of iemand zelf de vijf binnenste stoffen kan kiezen. Antwoord: nee. Ze dragen de persoonlijke norm (Gezondheidsraad), de telling, het tekortsysteem, Patroon en de brug naar `/beste/*`. Een informatieve stof heeft hooguit een RI. In de binnenring zou die ineens een oordeel krijgen, zoals "natrium gedekt". De buitenring is volledig vrij. Dit bevestigt `BESLUIT_DOELEN_VERBONDEN_2026-10.md` §2.

## Herziet uit het besluit van 4 okt

- **"Gevolgde stoffen ín de krans" (daar afgewezen).** Ze staan nu in een eigen buitenring, niet in de ring van de telling. De twee redenen van toen gelden nog steeds en blijven gerespecteerd: de telling gaat alleen over de binnenring, en de scheiding blijft zichtbaar via de dikte, de neutrale tint, de tussenruimte en het label "zonder oordeel".
- **"Een draaiend wiel of carrousel" (daar afgewezen).** Er komt niets dat blijft draaien en niets dat achter een gebaar verdwijnt. Een tik draait de ring één keer en elke stof blijft zichtbaar (ring + chip).
- **§4 "ringtegels in een eigen rij onder de krans" en "kerntegels blijven kaarten".** Beide vervallen: de chips nemen hun rol over.

## Afgewezen

- **Labels permanent rond de ring.** Op 375 px is daar geen ruimte voor, zeker niet met negen gevolgde stoffen. Het label staat in de chip en in de regel onder de krans.
- **Een tik op een segment opent direct het logboek (zoals voorheen).** Dan is er geen moment om de stof eerst te zien. Het kost één tik extra, maar daarmee kun je ook een gevolgde stof aanwijzen zonder dat je het scherm verlaat.
- **Een maximum van 8 op de buitenring.** Bij het bouwen bleek dat niet nodig: er zijn negen informatieve stoffen te kiezen, en negen segmenten plus de "+" passen.

## Meetpunt

GA4: `nutrition_dagboek_krans_gekozen` (nieuw; params `ring`: `kern` | `gevolgd`, `nutrient`). Daarna lees je de doorstroom af aan `nutrition_dagboek_nutrient_opened` (logboek) en `nutrition_dagboek_rijkste_geopend` met `surface: ring`. `nutrition_dagboek_gevolgd_toevoegen_open` blijft voor de "+".
