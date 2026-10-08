# Steekproef — dekking van Open Food Facts op de eerste supermarktdataset

**Datum:** 4 oktober 2026  
**Script:** `scripts/off-dekking.py` (leest de lokale extractie, niet in git)  
**OFF-dump:** food.parquet van 4 oktober 2026. Nederlandse producten met energie en geldige waarden: 58.690 rijen.

De dataset heeft geen barcodes. De koppeling gaat dus op naam en wordt bevestigd met de calorie-waarde (binnen max(10 kcal, 10%)). `exact` is een ondergrens (zelfde woorden); `exact + ruim` is een bovengrens (woordoverlap ≥ 0,7, eenduidige beste kandidaat). De werkelijke dekking ligt ertussen.

| Keten | Producten met kcal | Exact | Exact + ruim | Dekking (onder – boven) |
|---|---:|---:|---:|---|
| AH | 10011 | 2140 | 2991 | 21% – 30% |
| Jumbo | 11703 | 3253 | 4352 | 28% – 37% |
| Lidl | 4035 | 1012 | 1067 | 25% – 26% |
| Plus | 10026 | 1630 | 2382 | 16% – 24% |
| **Totaal** | 35775 | 8035 | 10792 | **22% – 30%** |

## Steekproef van koppelingen (beoordeel op valse matches)

**AH**
- Nutella Hazelnootpasta  →  Nutella Hazelnootpasta (Nutella)
- Van Wijngaarden's Zaanse halfvolle mayo  →  Zaanse halfvolle mayo (Van Wijngaarden)
- Marne Franse mosterd  →  Franse mosterd (Marne)
- AH Smeuïge pindakaas met honing  →  AH Smeuïge pindakaas met honing (Albert Heijn)
- Knorr Aromat  →  Aromat (Knorr)
- Heinz Sandwich spread komkommer  →  Heinz Sandwich Spread Komkommer (Heinz)

**AH-ruim**
- Campina Zacht en luchtig framboos smaak  →  zacht en luchtig framboos (Campina)
- Kokki Djawa Gado gado speciaal  →  Boemboe Gado-Gado speciaal (Kokki Djawa)
- Ben & Jerry's Cool-lection classic  →  Ben & Jerry’s the classic cool-lection (Ben & Jerry's)
- Fish Tales Sockeye gerookte wilde zalm  →  Gerookte wilde zalm (Fish Tales)
- AH Kaas vd boerderij belegen 30+ stuk  →  Kaas van de Boerderij Belegen 30+ (AH)
- AH Vrije uitloop eieren L  →  Eieren (Vrije Uitloop)
- Bonne Maman Viervruchten confiture  →  Confiture (Bonne Maman)
- Parrano Geraspte kaas originale  →  Originale Geraspte Kaas 45+ (Parrano)
- Arla Skyr naturel yoghurt 0\% fat  →  Skyr 0% Fat Naturel (Arla)
- Tony's Chocolonely Reep puur amandel zeezout  →  Puur 51% amandel zeezout (Tony's Chocolonely)
- Go-Tan Wok egg noodles organic  →  Wok Egg Noodles (Go-Tan)
- De Zaanse Hoeve Yoghurt Turkse stijl  →  Turkse Stijl (De Zaanse Hoeve)

**Jumbo**
- Becel Lekker Romig 200 ml  →  Lekker Romig (Becel)
- Bonduelle Reuzenbonen 255g  →  Reuzenbonen (BONDUELLE)
- Campina Botergoud Gezouten Roomboter 250 g  →  Botergoud gezouten roomboter (Campina)
- Canisius Rinse Appelstroop 450 g  →  rinse appelstroop (Canisius)
- Cremeux Blue Kaas 150 g  →  Cremeux Blue Kaas 150 g (Merkloos)
- Danio Luchtige Kwark Bosbes 2 x 125 g  →  Luchtige kwark Danio Bosbes (Danio)

**Jumbo-ruim**
- Amoy Medium Noodles 300 g  →  Medium Wok Noodles (Amoy)
- Barú Matcha Latte Poeder 250g  →  Matcha Latte (BARÚ)
- Barú Pink Chai Latte Thee Poeder 250g  →  Barú Golden Chai Latte Thee Poeder 250g (Baru)
- Ben & Jerry's IJs Brookies 100 ml  →  Brookies (Ben & Jerry's)
- Ben & Jerry's IJs Strawberry Cheesecake 100 ml  →  Strawberry cheesecake (Ben & Jerry's)
- Bolletje Goed Bezig! Rood Fruit 9 Stuks 210 g  →  Goed Bezig! Stevige Havermoutrepen Rood Fruit (Bolletje)
- Bolletje Ontbijt Crackers Meerzaden 4 x 3 Stuks 270 g  →  Ontbijt crackers (Bolletje)
- Bonduelle Crispy Maïs Mini Packs 2 x 75 g  →  2 Mini's Crispy Maïs (Bonduelle)
- De Vegetarische Slager Cordon Blij Vegan 180 g  →  Cordon blij (De vegetarische slager)
- Dr. Oetker Ristorante Pizza Tiramisu 269 g  →  Pizza A La Tiramisu (Dr. Oetker)
- Dr. Oetker Vegan brownies choco bakmix 360 g  →  Vegan brownies choco (Dr. Oetker)
- Fish Tales Sockeye Gerookte Wilde Zalm 100 g  →  Gerookte wilde zalm (Fish Tales)

**Lidl**
- Oregano  →  Oregano (Kania)
- Pecannoten  →  Pecannoten (Ekoplaza)
- Cashewnoten  →  Cashewnoten (Smaakt)
- Augurken  →  Augurken
- Olijfolie classico  →  Olijfolie Classico (Primadonna)
- Mac 'n cheese  →  Mac 'n cheese (Jimmy Joy)

**Lidl-ruim**
- Crystal Clear appel & peer  →  Appel Peer Smaak (Crystal Clear)
- Oasis appel zwarte bes  →  Appel, zwarte bes, framboos (Oasis)
- Croky chips bolognese  →  CROKY Tortilla chips Bolognese (CROKY)
- Leffe blond blik  →  Leffe Blond bier blik (Leffe)

**Plus**
- Becel Original  →  Original (Becel)
- Becel ProActiv Original  →  Becel proactiv original 250g (Becel)
- Bonduelle Kikkererwten 2 mini's  →  2 Mini's Kikkererwten (Bonduelle)
- Brood van Soma Speltkoren speltbrood  →  Speltkoren speltbrood (Brood van Soma)
- Campina Botergoud ongezouten roomboter  →  Botergoud ongezouten roomboter (Campina)
- Coca-Cola Original taste  →  Coca-Cola Original Taste (Coca-Cola)

**Plus-ruim**
- Campina Botergoud Bakken en braden  →  Botergoud bakken en braden roomboter (Campina)
- Candyman Mac bubble watermeloen  →  Mac Bubble (Candyman)
- De Kleine Keuken Biologische dadeltjes 12+  →  Biologische dadeltjes (De kleine keuken)
- Dr. Oetker Bistro Baguette pizzabroodje Hawaii  →  Bistro Baguette Hawaii (Dr. Oetker)
- Dr. Oetker Casa di Mama pizza Quattro Formaggi  →  DR.OETKER CASA DI MAMA 4 Formaggi (DR.OETKER CASA DI MAMA)
- Dubbelfrisss Boost appel & perzik  →  Appel & perzik (Dubbelfrisss)
- Dubbelfrisss Boost appel & perzik  →  Appel & perzik (Dubbelfrisss)
- Eru Balans naturel  →  Balans naturel 15+ (ERU)
- Go Vega Plantaardige Crispy Sticks  →  Go Vega Crispy Sticks (Go Vega)
- Goedhart Hamburgerbroodjes de luxe brioche  →  Hamburgerbroodjes de luxe (Goedhart)
- Heinz Tomaten gepeld biologisch  →  Tomaten Gepeld (Heinz)
- Hero B'tween zero melkchocolade  →  B'tween zero (Hero)

## Lezing

- **Correctie na de review (`REVIEW_OFF_IMPORT_2026-10.md` #6): de dekking ligt eerder rond 35–45% dan op 22–30%.** De tabel hierboven is de ruwe meting van het script en blijft staan. Een handcontrole van 40 willekeurige producten die de naamkoppeling niet vond (seed 11), naast de beste kandidaten in OFF: 7 zeker in OFF-NL met dezelfde kcal, 4 waarschijnlijk, 4 aanwezig met een andere of foute kcal, 2–3 alleen met een BE-tag, en ~22 niet gevonden. De gemiste producten vallen af op de naamdrempel (Jaccard < 0,7) door extra woorden als "mayonaise" of "BLK 1 ster". Met n = 40 is de onzekerheid groot. Gelezen met de varianten in de review (gelijke kandidaten, alle NL-getagde producten, NL + BE) wordt "ruim twee derde ontbreekt" dus "de helft tot twee derde", en "de waarheid ligt in het midden" hieronder volgt niet uit de meting: de eerdere Lidl-steekproef van 42% ligt dichter bij deze schatting. De richting van de conclusie blijft. Het script is nog niet aangepast.
- **De namen-koppeling is een bandbreedte, geen exact getal.** Bij A-merken (AH, Jumbo) kloppen de koppelingen in de steekproef. Bij Lidl is "exact" zwak: generieke namen als "Oregano" of "Pecannoten" matchen met een product van een ander merk met dezelfde naam en dezelfde kcal. Dat bewijst dat dit generieke product *bestaat* in OFF, niet dat het hetzelfde product is. Voor dekking van het type product is dat voldoende, voor een één-op-één koppeling niet.
- **De eerdere steekproef gaf 42% voor Lidl, deze meting 25–26%.** De eerdere meting gebruikte een ruimere naamkoppeling; deze eist een kcal-bevestiging. De waarheid ligt in het midden: reken op ongeveer een kwart tot een derde van de producten.
- **Wat dit betekent voor het besluit** (`BESLUIT_VOEDINGSBRONNEN_LAGEN_2026-10.md`): OFF dekt de bekende A-merken en veel huismerken, maar ruim twee derde van de supermarktproducten ontbreekt op naam. OFF heeft zelf 58.690 bruikbare Nederlandse producten, dus het schap is niet leeg; het is alleen een andere set dan wat de supermarkten verkopen. De typische-waardenlaag voor gaten blijft daarom relevant, en de aanlever-route vanaf het etiket (ONTWERP §8) wordt belangrijker.
- **Kwaliteit van OFF zelf.** De extractor liet 434 rijen vallen omdat de energie niet bij de macro's past, 98 om onmogelijke waarden, en zette 117 micro-waarden op null (bijv. 9.010 mg vitamine C in koekjes). Dat is ongeveer 1% van de rijen: OFF is crowd-sourced, dus controle bij het laden blijft nodig.
