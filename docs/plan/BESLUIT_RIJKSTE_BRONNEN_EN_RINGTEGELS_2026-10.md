# Besluit: rijkste bronnen per stof, en "Ook gevolgd" als ringtegels naast de krans

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "akkoord, ga door") — §4 en twee afgewezen opties herzien op 5 okt, zie `BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md`
**Raakt:** dagboek (stofdetail, tabel Voedingsstoffen, krans), `scripts/nevo-gehaltes.mjs`, `src/lib/nutrition-rijkste-bronnen.ts`
**Bouwt voort op:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§0.1), `BESLUIT_NEVO_GEHALTES_DAGBOEK_2026-10.md`, `BESLUIT_DOELEN_VERBONDEN_2026-10.md`

## Besluit

1. **Rijkste bronnen per stof** (PR #127, uitgebreid in de PR van dit document). Top 10 uit de eigen catalogus, in drie standen: per portie (standaard), per 100 g, per 100 kcal (afgeleid: gehalte ÷ NEVO-energie, gelabeld). Tik = toevoegen, "Vergelijk top 3" opent de vergelijkingstabel.
2. **Voor welke stoffen.** De vijf kernstoffen (via het stofdetail onder de krans) en de informatieve stoffen **vezels, kalium, calcium, ijzer, vitamine B12, vitamine C** (via een tik op die rij in de tabel Voedingsstoffen). Waarden ongewijzigd uit NEVO 2025/9.0, statisch gegenereerd zoals de kernstoffen.
3. **Zonder oordeel.** Vezels en kcal per portie staan als context naast elke bron en sturen de volgorde niet. Geen samengestelde score, geen "vezelrijk"-label, geen ✓, geen link naar `/beste/*`. Informatieve stoffen krijgen een neutrale tint; %RI alleen waar een RI bestaat.
4. **Ringtegels "Ook gevolgd"** (gebouwd 4 okt, na plak 4a #129). De krans blijft de vijf kernstoffen. Gevolgde stoffen krijgen een eigen rij onder de krans (tabbladen Vandaag en Voedingsstoffen): kleine ringen in één neutrale tint, ring vult tot de RI; een stof zonder RI (natrium, verzadigd vet, suikers) toont alleen het getal met een gestippeld spoor. Op mobiel horizontaal met snap-scroll, vanaf 520 px containerbreedte een raster; vul-animatie alleen `motion-safe`. Tik → rijkste-bronnenscherm (alleen stoffen die er een hebben). De "+" klapt dezelfde `GevolgdeStoffenKiezer` open als Je doelen en Je patroon (`surface: "dagboek"`). Getallen uit `berekenVoedingswaarde`, keuze uit `useGevolgdeStoffen`: geen eigen opslag of rekenpad.

### Bijgesteld bij het bouwen (4 okt)

- **Geen ✓ bij gehaald op de ringen.** `BESLUIT_DOELEN_VERBONDEN_2026-10.md` §1 staat een ✓ toe voor referentiestoffen, maar Je patroon ("Ook gevolgd · zonder oordeel", plak 4b) en de voedingswaardetabel tonen er geen. Eén leeswijze op alle plekken weegt zwaarder; een ✓ kan later overal tegelijk komen, samen met de RI-overschrijvingen.
- **De vijf kerntegels onder de krans blijven kaarten, geen mini-ringen.** Het docblok van `DagboekKrans.tsx` legt vast dat de krans juist "de rij mini-ringen" verving; ze terugzetten zou dubbel tonen wat de krans al toont.

## Afgewezen

- **Natrium, verzadigd vet en suikers in de rijkste-bronnenlijst:** "rijkste bron van zout" leest als een aanrader.
- **Sauzen en smaakmakers in de lijst:** sojasaus en sambal haalden per 100 kcal de top terwijl je er een theelepel van eet.
- **Supplementen in de lijst:** winnen per definitie en maken de rangschikking zinloos; daarbij geen koopaanbod in het dashboard.
- **Gevolgde stoffen ín de krans:** breekt de telling "x van y gedekt" en de scheiding tekortsysteem / informatielaag.
- **Een draaiend wiel of carrousel voor de ringtegels:** verstopt stoffen achter een gebaar, op 375 px zie je er twee, en beweging die blijft draaien is slecht voor toegankelijkheid.
- **Ringtegels vóór plak 4 bouwen:** zou de opslag voor gevolgde stoffen hebben gedubbeld; daarom pas na #129 gebouwd.

## Meetpunt

GA4: `nutrition_dagboek_rijkste_geopend` (param `surface`: `tabel` of `ring`), `nutrition_dagboek_gevolgd_toevoegen_open`, `voedingsdoel_aangepast` met `surface: dagboek`, `nutrition_dagboek_rijkste_stand`, `nutrition_dagboek_rijkste_gekozen` (met positie), `nutrition_dagboek_rijkste_vergelijk`. Param `nutrient` draagt de stof-id (kernstof of veld-id als `calciumMg`).

---

## Aanvulling 9 oktober: verder kijken dan de top 10

**Aanleiding.** Dennis: bij de rijkste bronnen van een stof (Dagboek → stofdetail) zie je alleen de top 10; zoekbalk en meer inspiratie gewenst. Eerst per ongeluk gebouwd in Keuze → Vergelijken (teruggedraaid, PR #227); het ging om deze lijst.

**Besluit (Dennis akkoord).**
1. **Geen zijwaartse balk.** Afgewezen: smalle kolom, verbergt het aanbod, botst op 375 px met paginascroll; de rijen lezen verticaal.
2. **"Toon 10 meer · nog N"** onder de lijst: start op 10, +10 per tik, tot de hele gemeten lijst. De rang blijft de echte rang in de gekozen stand.
3. **Zoekveld** over alle bronnen met deze stof (niet alleen de top 10), in de gekozen stand gerangschikt.
4. **Voedselgroep-chips** (vis & schaaldieren, noten & zaden, peulvruchten, groente & fruit, granen & brood, zuivel & ei, vlees); alleen groepen die voor deze stof een bron hebben.
5. "Vergelijk top 3" blijft de top 3 van de hele lijst, ongeacht zoeken of filter.

**Meting (GA4):** `nutrition_dagboek_rijkste_meer` {nutrient, aantal}, `nutrition_dagboek_rijkste_zoek` {nutrient, treffers}, `nutrition_dagboek_rijkste_groep` {nutrient, groep}. Bestaand: `nutrition_dagboek_rijkste_gekozen` {positie} laat zien of bronnen voorbij de top 10 worden toegevoegd.
