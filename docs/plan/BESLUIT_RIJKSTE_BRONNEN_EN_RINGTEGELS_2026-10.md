# Besluit: rijkste bronnen per stof, en "Ook gevolgd" als ringtegels naast de krans

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "akkoord, ga door")
**Raakt:** dagboek (stofdetail, tabel Voedingsstoffen, krans), `scripts/nevo-gehaltes.mjs`, `src/lib/nutrition-rijkste-bronnen.ts`
**Bouwt voort op:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§0.1), `BESLUIT_NEVO_GEHALTES_DAGBOEK_2026-10.md`, `BESLUIT_DOELEN_VERBONDEN_2026-10.md`

## Besluit

1. **Rijkste bronnen per stof** (PR #127, uitgebreid in de PR van dit document). Top 10 uit de eigen catalogus, in drie standen: per portie (standaard), per 100 g, per 100 kcal (afgeleid: gehalte ÷ NEVO-energie, gelabeld). Tik = toevoegen, "Vergelijk top 3" opent de vergelijkingstabel.
2. **Voor welke stoffen.** De vijf kernstoffen (via het stofdetail onder de krans) en de informatieve stoffen **vezels, kalium, calcium, ijzer, vitamine B12, vitamine C** (via een tik op die rij in de tabel Voedingsstoffen). Waarden ongewijzigd uit NEVO 2025/9.0, statisch gegenereerd zoals de kernstoffen.
3. **Zonder oordeel.** Vezels en kcal per portie staan als context naast elke bron en sturen de volgorde niet. Geen samengestelde score, geen "vezelrijk"-label, geen ✓, geen link naar `/beste/*`. Informatieve stoffen krijgen een neutrale tint; %RI alleen waar een RI bestaat.
4. **Ringtegels (stap 2, ná plak 4 van `BESLUIT_DOELEN_VERBONDEN_2026-10.md`).** De krans blijft de vijf kernstoffen. Gevolgde stoffen krijgen een eigen rij "Ook gevolgd" eronder: kleine ringtegels in dezelfde vormtaal, ring vult tot RI (referentiestoffen, neutraal, ✓ bij gehaald, nooit ✗) of tot een eigen doel (macro's; zonder doel alleen het getal). Op mobiel horizontaal met snap-scroll, breed als raster; vul-animatie alleen `motion-safe`. Tik → zelfde rijkste-bronnenscherm. Leest gevolgde stoffen en doelen uit de functie die plak 4 bouwt — geen eigen opslag.

## Afgewezen

- **Natrium, verzadigd vet en suikers in de rijkste-bronnenlijst:** "rijkste bron van zout" leest als een aanrader.
- **Sauzen en smaakmakers in de lijst:** sojasaus en sambal haalden per 100 kcal de top terwijl je er een theelepel van eet.
- **Supplementen in de lijst:** winnen per definitie en maken de rangschikking zinloos; daarbij geen koopaanbod in het dashboard.
- **Gevolgde stoffen ín de krans:** breekt de telling "x van y gedekt" en de scheiding tekortsysteem / informatielaag.
- **Een draaiend wiel of carrousel voor de ringtegels:** verstopt stoffen achter een gebaar, op 375 px zie je er twee, en beweging die blijft draaien is slecht voor toegankelijkheid.
- **Ringtegels nu al bouwen:** zou de opslag voor gevolgde stoffen dubbelen die plak 4 net maakt.

## Meetpunt

GA4: `nutrition_dagboek_rijkste_geopend` (vanuit de tabel), `nutrition_dagboek_rijkste_stand`, `nutrition_dagboek_rijkste_gekozen` (met positie), `nutrition_dagboek_rijkste_vergelijk`. Param `nutrient` draagt de stof-id (kernstof of veld-id als `calciumMg`).
