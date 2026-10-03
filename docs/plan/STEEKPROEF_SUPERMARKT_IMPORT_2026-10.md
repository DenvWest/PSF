# Steekproef supermarkt-import (ter beoordeling)

Gegenereerd door `node scripts/supermarkt-import.mjs` — niet met de hand bewerken.
Zie `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §5 voor de bevindingen en open beslissingen.

## Tellingen

- Laag 0-producten: 36089
- Overgeslagen (verdacht): 52
- In catalogus: 36037
- Laag 0b-rijen: 0, waarvan bruikbaar (sterk/zwak): 0
- Daadwerkelijk aangevuld uit USDA: sterk 0, zwak 0
- Waarvan USDA-macro's het etiket tegenspreken (≥1 van kcal/vet/koolhydraten >25% af): 0

Velddekking (niet-null):

- energyKcal: 35724
- fatG: 34290
- saturatedFatG: 33874
- carbohydrateG: 34865
- sugarsG: 34616
- fiberG: 24554
- proteinG: 34507
- saltG: 33686
- sodiumMg: 3591
- calciumMg: 1038
- ironMg: 181
- vitaminCMg: 333
- vitaminDµg: 219

## A. 40 producten zonder USDA-aanvulling (alleen etiket)

| Supermarkt | Product | kcal | vet | verz. | koolh. | suikers | vezels | eiwit | zout |
|---|---|---|---|---|---|---|---|---|---|
| AH | Activia Yoghurt naturel | 66 | 3.5 | 2.2 | 4.7 | 4.7 | 0 | 3.9 | 0.1 |
| AH | Heinz Sandwich spread komkommer | 165 | 12 | 0.8 | 12 | 11 | 0.8 | 1.5 | 1.9 |
| AH | AH Triangel meergranen bruin | 267 | 4.5 | 0.6 | 42 | 2 | 7.1 | 11 | 1.08 |
| AH | Olvarit Appel perzik mango 12m+ | 57 | 0.1 | 0 | 13 | 8 | 2 | 0.5 | 0.03 |
| AH | AH Terra Plantaardige hummus naturel | 302 | 26 | 3.4 | 8.8 | 0.08 | 4.6 | 6 | 1.2 |
| AH | Etos Zuigelingenmelk standaard 1+ | 68 | 3.2 | 0.7 | 8 | 0.3 | 0.5 | 1.5 | n.o. |
| AH | Streeckgenoten Rosbief | 128 | 3.4 | 1.4 | 0.4 | 0.4 | 0.1 | 24 | 0.7 |
| AH | Yfood This is food drinkmaaltijd fresh berry | 100 | 4.6 | 1 | 7 | 4.6 | 1.6 | 6.8 | 0.15 |
| AH | AH Biologisch Romige tomatensoep met room | 62 | 3.5 | 1.6 | 5 | 3 | 2 | 1.7 | 0.58 |
| AH | AH Skyr IJslandse stijl aardbei | 82 | 0.2 | 0.1 | 10 | 9.9 | 0 | 10 | 0.08 |
| AH | AH Roomboter cake | 392 | 20 | 12 | 47 | 25 | 1.1 | 5.4 | 0.3 |
| AH | Lindeman's Bin 30 sparkling rosé | 71 | 0 | 0 | 1.7 | 0.5 | n.o. | 0 | 0 |
| Jumbo | Campina Langlekker Magere Melk 0% Vet 1 L | 37 | 0.1 | 0.1 | 5 | 5 | n.o. | 3.8 | 0.14 |
| Jumbo | Fanta Orange 10+2 Gratis 12 x 250 ml | 23 | n.o. | n.o. | n.o. | n.o. | n.o. | n.o. | n.o. |
| Jumbo | Hollandia Matze Toast Naturel 2 Stuks 100 g | 375 | n.o. | 0 | 79 | 0.4 | 4 | n.o. | 0.005 |
| Jumbo | Jumbo Blokjes Belegen Kaas 48+ 200 g | 394 | 31.9 | 19.5 | 0 | 0 | 0 | 26.6 | 2.1 |
| Jumbo | Jumbo Granola Proteïne 325 g | 415 | 12.2 | 1.7 | 49 | 2.2 | 13 | 20.8 | n.o. |
| Jumbo | Jumbo Naturel Cakejes met Roomboter 320 g | 439 | 24.2 | 11.5 | 51.3 | 28.1 | 0.5 | 5.6 | 0.33 |
| Jumbo | Jumbo's Spicy Mango Chutney 250ML | 184 | 0.3 | 0.1 | 43.9 | 39.7 | 1 | 0.6 | 0 |
| Jumbo | Jumbo Zongedroogde Tomaten Reepjes  280 g | 243 | 13.2 | 0.3 | 22.1 | 13.5 | 8 | 5 | 4 |
| Jumbo | LION Mini melkchocolade uitdeelzak 270g | 480 | 20.8 | 11.3 | 67.8 | 51.6 | 1.3 | 4.8 | 0.51 |
| Jumbo | Nestlé Pirulo Mango 5 Stuks | 86 | 0.5 | 0.1 | 20 | 17 | 1.1 | 0.5 | 0.01 |
| Jumbo | Rio Mare Tonijn in olijfolie citroen zwarte peper 120g | 253 | 18 | 3.2 | 0.8 | 0.7 | n.o. | 22 | 1.2 |
| Jumbo | Unirice Basmati Rijst 2 kg | n.o. | 0.2 | n.o. | 78 | n.o. | n.o. | 7 | n.o. |
| Jumbo | Hertog Jan 0.0% Alcoholvrij bier  - Blik - 7+1 - 330ML | 18 | 0 | n.o. | 4.2 | 0.8 | n.o. | 0.4 | 0 |
| Lidl | Appelmoes | 70 | 0 | 0 | 16 | 12.6 | 2.2 | 0.2 | 0 |
| Lidl | Fanta zero 250ml | 3 | 0 | 0 | 0.4 | 0.4 | 0.006 | 0 | 0.012 |
| Lidl | Lentehagelmix | 454 | 15 | 9 | 74 | 66 | 3.745 | 4.7 | 0.12 |
| Lidl | Bolletje zoute pepsels | 386 | 2.7 | 0.5 | 77 | 1.2 | 3.8 | 11 | 5.1 |
| Plus | Bar-le-duc Mineraalwater koolzuurhoudend Citroen | 0 | 0 | 0 | 0 | 0 | n.o. | 0 | 0 |
| Plus | Campina Limited edition 1 - Oranje vla | 86 | 4.6 | 3.6 | 10 | 7.7 | n.o. | 1.8 | 0.06 |
| Plus | Dr. Oetker Ristorante pizza Salami glutenvrij | 248 | 11 | 4.7 | 26 | 2.1 | 1.9 | 10 | 1.4 |
| Plus | Haribo Zoute Rijen | 349 | 0.5 | 0.1 | 81 | 67 | n.o. | 6 | 0.02 |
| Plus | La Molisana Penne Rigate Integrali no 20 | 353 | 2 | 0.3 | 65 | 3.3 | 8 | 15 | 0.08 |
| Plus | Monini Olijfolie met truffelaroma | 828 | 92 | 14 | 0 | 0 | n.o. | 0 | 0 |
| Plus | PLUS Boerentrots Kip cordon bleu 4st | 205 | 9.6 | 2 | 14.8 | 1.2 | 0.5 | 14.5 | 1.15 |
| Plus | PLUS Kleintje Slagroomijs aardbei | 185 | 8 | 5.7 | 25.8 | 17.6 | 0.4 | 2.2 | 0.102 |
| Plus | PLUS Speklappen met zwoerd 2 stuks | 329 | 29.1 | 10.5 | 0 | 0 | 0 | 16.7 | 0.155 |
| Plus | Schär Glutenvrije Meesterbakker Mehrkorn | 249 | 6.6 | 0.8 | 38 | 4.1 | 9.9 | 4.5 | 0.97 |
| Plus | Unox Soep In Zak Aspergesoep | 30 | 1.3 | 0.1 | 3.5 | 0.6 | 0.5 | 0.8 | 0.64 |

_Geen USDA-aanvulling (standaard sinds 3 okt, zie VOORBEREIDING §5.4). Draai met `--met-usda` om de afgewezen meting te reproduceren._

## B. 40 producten mét USDA-aanvulling

Macro-check = hoeveel van kcal/vet/koolhydraten de USDA-match met het etiket deelt.

| Supermarkt | Product | USDA-match | zekerheid | macro-check | Na mg | Ca mg | Fe mg | vit C mg |
|---|---|---|---|---|---|---|---|---|
