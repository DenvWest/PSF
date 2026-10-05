# Besluit: Je patroon per maaltijd, doelen in Samenvatting, "Per stof"

**Datum:** 5 oktober 2026
**Status:** Besloten (Dennis), gebouwd op `feat/patroon-maaltijden`
**Raakt:** `src/components/dashboard/patroon/`, `src/lib/nutrition-maaltijd-patroon.ts`, `src/lib/use-voedingsdata-periode.ts`

## Aanleiding

Dennis' feedback: "Je patroon laat nu niet echt goede info zien."

1. Wat zit er gemiddeld per maaltijd (ontbijt, lunch, avondeten) aan macro- en micronutriënten? Dat moet als eerste getoond worden, met de maaltijden als kop.
2. Samenvatting mag de doelen tonen (macro, micro, kernstoffen): hoeveel wordt er gehaald, en hoeveel komt uit supplementen.
3. Optie: wat kost een maaltijd gemiddeld, en hoe rijk is hij?
4. "Deze week" en "Voedingsstoffen" zeggen weinig.

## Besluiten

1. **Eerste tab "Per maaltijd"**, standaard open. De kop is een segmentrij Ontbijt · Lunch · Avondeten · Tussendoor. Per maaltijd staat het gemiddelde over de keren dat die maaltijd geregistreerd is, de laatste 30 dagen. Bovenaan staan energie en macro's als tegels. Daaronder één tabel met alle micronutriënten van de voedingswaardetabel plus de kernstoffen (magnesium, zink, omega-3, vitamine D), met de kolommen gemiddeld · per 100 kcal · %ADH. Het deel uit supplementen staat er apart onder.
   - De noemer is het aantal keer dat de maaltijd geregistreerd is, niet het aantal kalenderdagen (asymmetrie-regel).
   - Er is één rekenpad: elke keer wordt doorgerekend met `berekenVoedingswaarde` en `nutrientenGesplitstUitItems`, dezelfde som als de dag en de krans.
2. **Samenvatting begint met "Je doelen deze week":**
   - macro's tegen je eigen doel, als neutraal restgetal zonder percentage (macro-besluit §1 Laag B);
   - "x van y meetbare kernstoffen op je norm", met een pil per stof;
   - supplementen: op hoeveel dagen, en welk deel van elke kernstof eruit kwam.
   De weekkaarten met staafjes per kernstof zijn uit Samenvatting gehaald. Ze dubbelden met dit blok en met "Per stof".
3. **"Hoe rijk" = dichtheid per 100 kcal, geen prijs.** De maaltijden staan in een vergelijkingstabel (kcal, eiwit en vezels per 100 kcal), en de maaltijdtabel heeft een kolom "/100 kcal". Dit is géén score en géén rangorde.
4. **"Deze week" + "Voedingsstoffen" → "Per stof".** Daarin staan de weektabel met bladeren, daaronder de vier vensters (vandaag tot 30 dagen) en de bevinding met "Plan in Mijn Dag". De telcirkels en drie losse uitlegblokken zijn vervangen door één korte noot.

## Afgewezen / uitgesteld

- **Kosten per maaltijd: uitgesteld, niet gebouwd.** Dit bevestigt `BESLUIT_SUPERMARKT_MCP_EN_BOODSCHAPPENLIJST_2026-10.md` (herzien 3 okt): prijzen zijn uitgesteld, folder- en AI-prijsdata zijn afgewezen, en de eerste prijsroute wordt later de Daisycon-supplementfeeds. De catalogus heeft geen prijsveld. Het scherm zegt dat ook letterlijk ("daar is nog geen betrouwbare prijsbron voor"). Terugkomen zodra er een prijsbron met licentie is.
- **Vensters als extra kolommen in de weektabel**: op 375 px zijn 7+ kolommen niet leesbaar. Ze staan daarom als tweede tabel in dezelfde tab.
- **Een dichtheidsscore per maaltijd** (één getal "hoe gezond"): afgewezen. Een tweede score is verboden (lock "minuten = evidence, nooit een tweede score"), en een gemiddelde van %RI's verbergt welke stof het verschil maakt.

## Meting

- `nutrition_patroon_sectie_gekozen` (bestaand) met de nieuwe ids `maaltijden` / `stof`.
- `nutrition_patroon_maaltijd_gekozen` {moment} (GA4) + Clarity-tag `nutrition_patroon_maaltijd`.
- `nutrition_patroon_doel_instellen_click` (GA4): de link "Stel er een in" bij een ontbrekend macrodoel.
