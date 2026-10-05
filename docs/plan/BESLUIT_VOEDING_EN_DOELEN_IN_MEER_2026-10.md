# Besluit — Voeding en Doelen als eigen plekken onder Meer

**Datum:** 5 oktober 2026
**Status:** besloten (Dennis, 5 okt: "Akkoord met A en B")
**Herziet:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §1 (geen "Voeding" in Meer) en Laag B (tabbladen op het dagboekscherm)
**Bouwt voort op:** `BESLUIT_ONDERBALK_DRIE_TABS_2026-10.md`

## Aanleiding

In het dagboek stond één smalle rij met drie tabs (Vandaag · Voedingsstoffen · Macro's) en de knop "Vergelijk producten". Op mobiel was dat druk, en "Vandaag" was eigenlijk geen onderdeel maar het dagboek zelf. Het Doelen-scherm was een lang formulier met zes losse Opslaan-knoppen. Dennis stuurde als voorbeeld Yazio: daar staan in Meer onder andere Doelen en Voeding, Doelen is een lijst (label links, waarde rechts) en Voeding heeft de tabs Voedingsstoffen en Macro's met een weekoverzicht.

## Besluit

1. **Het dagboek is alleen om in te vullen.** De tabrij verdwijnt. "Vergelijk producten" blijft als losse knop boven de eetmomenten. De link "Alle voedingsstoffen en macro's →" gaat naar Voeding.
2. **Voeding** (`/dashboard/voeding`) is een eigen pagina via Meer: tabs Voedingsstoffen | Macro's, keuze Dag | Week, bladeren met ‹ ›. De inhoud zijn de bestaande tabellen en de macro-ring. Er wordt niets nieuw berekend: dezelfde `berekenVoedingswaarde` als het dagboek.
3. **Meer** bevat: Mijn Dag · Voeding · Doelen. Het blijft een paneel van onderen; wordt de lijst groter dan zo'n vijf items, dan wordt het een eigen pagina zoals bij Yazio.
4. **Doelen** wordt een lijst: per regel label links, waarde rechts. Tikken opent een paneel van onderen met één getalveld (− en + voor kleine stappen) of een keuzelijst, en één Opslaan-knop. Opslag en logica blijven gelijk. (Plak B)

## Afgewezen

- **Een draaiwiel voor getallen** (zoals in Yazio). Werkt stroef in een browser. Een getalveld opent het numerieke toetsenbord, − en + doen de kleine stapjes.
- **Een venster in het midden van het scherm.** Een paneel van onderen bestaat al in het dashboard (Meer gebruikt het) en zit dichter bij je duim.
- **Rijkste bronnen vanuit de tabel op de Voeding-pagina.** Die lijst voegt een product toe aan je dagboek en hoort daarom bij het dagboek. In het dagboek blijft hij bereikbaar via de tegels bij "Ook gevolgd".

## Meetpunten

- `dashboard_more_item_click` met `item: "voeding"`: hoe vaak Voeding via Meer wordt geopend.
- `nutrition_voeding_pagina_geopend` (surface `dagboek_link`): de link vanuit het dagboek.
- `nutrition_dagboek_subtab_gekozen` met `surface: "voeding_pagina"` en `nutrition_voeding_periode_gekozen`: welk onderdeel en welke periode wordt gebruikt.
