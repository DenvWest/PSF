# Steekproef supermarkt-import (ter beoordeling)

Gegenereerd door `node scripts/supermarkt-import.mjs` — niet met de hand bewerken.
Zie `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §5 voor de bevindingen en open beslissingen.

## Tellingen

- Laag 0-producten: 36089
- Overgeslagen (verdacht): 52
- In catalogus: 36037
- Laag 0b-rijen: 18484, waarvan bruikbaar (sterk/zwak): 15051
- Daadwerkelijk aangevuld uit USDA: sterk 505, zwak 12803
- Waarvan USDA-macro's het etiket tegenspreken (≥1 van kcal/vet/koolhydraten >25% af): 8721

Velddekking (niet-null):

- energyKcal: 35724
- fatG: 34290
- saturatedFatG: 33874
- carbohydrateG: 34865
- sugarsG: 34616
- fiberG: 24554
- proteinG: 34507
- saltG: 33686
- sodiumMg: 4153
- calciumMg: 13612
- ironMg: 13130
- vitaminCMg: 7134
- vitaminDµg: 219

## A. 40 producten zonder USDA-aanvulling (alleen etiket)

| Supermarkt | Product | kcal | vet | verz. | koolh. | suikers | vezels | eiwit | zout |
|---|---|---|---|---|---|---|---|---|---|
| AH | AH Terra Plantaardig halvarine goed begin | 361 | 39 | 9.5 | 2.4 | 0 | 0 | 0 | 0.3 |
| AH | Antinori Santa Cristina Toscana rosso | 80 | 0 | 0 | 1.17 | 0.53 | n.o. | 0 | 0 |
| AH | Knorr Mix voor kippensoep | 21 | 0.5 | 0.1 | 4.2 | 0.5 | 0.5 | 0.6 | 0.66 |
| AH | AH Stemgember | 291 | 0.3 | 0.1 | 71 | 70 | 1 | 0.5 | 0.05 |
| AH | Bertolli Originale extra vierge olijfolie | 821 | 91 | 13 | 0 | 0 | n.o. | 0 | 0 |
| AH | Solan de Cabras Mineraalwater | n.o. | n.o. | n.o. | n.o. | n.o. | n.o. | n.o. | n.o. |
| AH | Mentos Mini fruit | 389 | 1.7 | 1.6 | 92 | 71 | n.o. | 0 | 0.1 |
| AH | AH Oven Pittige hapjes | 242 | 10 | 2.7 | 27 | 2.1 | 2.1 | 10 | 1.58 |
| AH | Fish Tales Anjovisfilets in olijfolie | 179 | 8 | 1.7 | 0.5 | 0.2 | n.o. | 27 | 14 |
| AH | Mooi Kaap Rosé wijntap | 87 | 0.1 | 0.1 | 3.7 | 3 | 0 | 0.1 | 0.01 |
| AH | AH Appelcompote | 57 | 0.5 | 0 | 12 | 11 | 1.6 | 0.3 | 0 |
| AH | AH Verse original croissants | 344 | 16 | 7.1 | 38 | 3.5 | 1.1 | 9.1 | 1.9 |
| Jumbo | Chocomel Plantaardig 1 L | 59 | 1.8 | 0.8 | 8.4 | 7.1 | n.o. | 1.8 | 0.2 |
| Jumbo | Fruittella Garden Fruits Vegan 4-pack | 385 | n.o. | 3.6 | 87 | 55 | n.o. | 0 | 0.04 |
| Jumbo | Ísey Skyr Air Mousse Passionfruit 125 g | 71 | n.o. | n.o. | 4.1 | 3.8 | n.o. | 8.5 | 0.15 |
| Jumbo | Jumbo Curryworst 3 Stuks | 332 | 30.1 | 11.7 | 3.9 | 0.5 | 0.1 | 11.3 | 2.35 |
| Jumbo | Jumbo Kippenfond 350 ml | 10 | 0.3 | 0.1 | 0.3 | 0.1 | 0 | 1.6 | 1 |
| Jumbo | Jumbo Plantaardige Nuggets Krokant 200 g | 221 | 12 | 1.5 | 18 | 1.2 | 5.4 | 7.5 | 1.1 |
| Jumbo | Jumbo Snackbal Naturel 135 g | 270 | 22.9 | 9.3 | 2.1 | 0.4 | 0.4 | 13.7 | 1.64 |
| Jumbo | Klene Drop Steekpenningen 210g | 337 | 0.3 | 0.2 | 75 | 47 | n.o. | 8.6 | 0.23 |
| Jumbo | MAGGI Smaakmaker Groentesoep Pakjes 2 x 26 g | 37 | 2.3 | 1 | 1.2 | 0.6 | 0.5 | 2.8 | 0.66 |
| Jumbo | Olvarit 4+ Maanden Variatiemenu Maaltijd 12 x 125g | 31 | 0.2 | 0 | 5.3 | 5.3 | 2.4 | 0.7 | 0.08 |
| Jumbo | Sharwood's Garlic & Coriander Mini Naans 4 Stuks 260 g | 301 | 6.2 | 0.6 | 51.9 | 5.6 | 2.6 | 8 | 0.71 |
| Jumbo | Verstegen Guilt Free Crunchy Pindasaus 285 ml | 200 | 11.1 | 1.6 | 7.5 | 4.1 | n.o. | 7.2 | 1.1 |
| Jumbo | Alpro Amandeldrink Houdbaar 1L | 22 | 1.1 | 0.1 | 2.4 | 2.4 | 0.4 | 0.4 | 0.14 |
| Lidl | Kant-en-klaar deeg | 291 | 8.1 | 0.7 | 48.2 | 0.8 | 2.02 | 2 | 1.6 |
| Lidl | Lays max flamin hot | 520 | 31 | 2.8 | 52 | 2.1 | 3.5 | 6 | 0.6875 |
| Lidl | Mayonaise in tube | 704 | 76.9 | 6 | 1.5 | 1.3 | 0.188 | 1.1 | 0.83 |
| Lidl | Casa di Mama speciale | 209 | 7 | 3.9 | 26 | 3.1 | 2 | 9.1 | 1.3775 |
| Lidl | Hertog Jan 0.33l | 41 | 0 | 0.015 | 3 | 1.058 | 0.008 | 0.4 | 0.009 |
| Plus | Chocomel Chocolademelk Koud | 69 | 1.6 | 1 | 10 | 9.8 | n.o. | 3.4 | 0.13 |
| Plus | Elvee Wensdoos Bedankt Fairtrade | 520 | 32 | 19 | 53 | 51 | n.o. | 4.4 | 0.21 |
| Plus | Homemade Suikerwafel mix | 401 | 13 | 5.7 | 60 | 37 | 1.4 | 9.7 | 0.6 |
| Plus | Lays Naturel | 512 | 29 | 2.1 | 55 | 0.5 | 5.2 | 6.2 | 0.85 |
| Plus | Nakd Raw Fruitreep Blueberry Muffin | 368 | 11 | 1.7 | 56 | 49 | 9.5 | 6.6 | 0.02 |
| Plus | PLUS Boerentrots Nasi-bamivlees | 149 | 7 | 2.8 | 0 | 0 | 0 | 21.5 | 0.15 |
| Plus | PLUS Klaverland Geitenkaas belegen 50+ stuk | 429 | 36.71 | 24.96 | 0 | 0 | 0 | 23.83 | 1.85 |
| Plus | PLUS Sategehakt | 281 | 18.4 | 6.5 | 13.5 | 5.3 | 0.5 | 15 | 2.363 |
| Plus | Remia Salata Naturel | 35 | 0.1 | 0 | 7.4 | 7 | n.o. | 0.1 | 1.8 |
| Plus | Unox Cup-a-soup groente | 34 | 0.8 | 0.4 | 5.8 | 2.3 | 0.5 | 0.7 | 0.72 |

## B. 40 producten mét USDA-aanvulling

Macro-check = hoeveel van kcal/vet/koolhydraten de USDA-match met het etiket deelt.

| Supermarkt | Product | USDA-match | zekerheid | macro-check | Na mg | Ca mg | Fe mg | vit C mg |
|---|---|---|---|---|---|---|---|---|
| AH | Activia Yoghurt naturel | Yogurt, plain, nonfat | zwak | 2/2 | n.o. | 140 | 0 | n.o. |
| AH | AH Kaas vd boerderij belegen 50+ plak | Cheese, cheddar | zwak | 3/3 | n.o. | 707 | 0.2 | n.o. |
| AH | AH Goudse extra belegen 48+ plakken | Cheese, gouda | zwak | 3/3 | n.o. | 700 | 0.2 | 0 |
| AH | AH Glutenvrij Double cookies | Cookies, oatmeal, soft, with raisins | zwak | 2/3 | n.o. | 29 | 2.3 | n.o. |
| AH | E Energy drink sugarfree | Beverages, NESTLE, Boost plus, nutritional drink, ready-to-drink | zwak | 0/3 | n.o. | 135 | 1.7 | 23.1 |
| AH | Wahid Lasagne bolognese | Lasagna, cheese, frozen, prepared | zwak | 3/3 | n.o. | 111 | 1.3 | 17.1 |
| AH | AH Pasta ham kaas salade specialiteit | Ham, sliced, restaurant | zwak | 0/3 | n.o. | 6 | 0.9 | n.o. |
| AH | Saitaku Poke rice | Flour, rice, brown | zwak | 3/3 | n.o. | 10 | 1.5 | n.o. |
| AH | Hellmann's Truffle saus | Sauce, salsa, ready-to-serve | zwak | 1/3 | n.o. | 28 | 0.4 | n.o. |
| AH | AH Terra Plantaardig protein gurt bosvruchten | Beverages, Protein powder soy based | zwak | 0/3 | n.o. | 178 | 12 | 0 |
| AH | AH Goudse jong 48+ stuk | Cheese, gouda | zwak | 3/3 | n.o. | 700 | 0.2 | 0 |
| AH | AH Stamppot bloemkool en prei verspakket | Leeks, bulb and greens, root removed, raw | zwak | 0/0 | n.o. | 51.4 | 0.8 | n.o. |
| Jumbo | Brunswick Canadian Style Sardines Haring 106 g | Fish oil, herring | zwak | 1/3 | n.o. | 0 | 0 | 0 |
| Jumbo | Dr. Oetker Big Americans Pizza Hawaii 460 g | PIZZA HUT 12" Cheese Pizza, Pan Crust | zwak | 1/3 | n.o. | 208 | 1.9 | 0 |
| Jumbo | Heinz Tomaten Gepeld | Tomato, roma | zwak | 2/2 | n.o. | 10 | 0.1 | 17.8 |
| Jumbo | Jumbo Babyvoeding Biologisch Appel, Mango, Ananas & Banaan 8+ Maanden 190 g | Pineapple, raw | zwak | 2/2 | 0 | 12.5 | 0.1 | 58.6 |
| Jumbo | Jumbo Croutons Knoflook Kruiden 125 g | Garlic, raw | zwak | 0/3 | n.o. | n.o. | n.o. | 10 |
| Jumbo | Jumbo Kaas Pesto Dip 150 g | Cheese, cheddar | zwak | 3/3 | n.o. | 707 | 0.2 | n.o. |
| Jumbo | Jumbo Prei Kerriesoep Verspakket 4-6 Personen | Leeks, bulb and greens, root removed, raw | zwak | 0/0 | n.o. | 51.4 | 0.8 | n.o. |
| Jumbo | Jumbo Tempeh Naturel 395g | Tempeh | zwak | 3/3 | n.o. | 111 | 2.7 | 0 |
| Jumbo | La Morena Ketchup met Chipotle 250ML | Ketchup, restaurant | zwak | 3/3 | n.o. | 14 | 0.4 | n.o. |
| Jumbo | Melkunie Volle Melk 1 L | Cheese, ricotta, whole milk | sterk | 1/3 | n.o. | 129 | 0.1 | n.o. |
| Jumbo | Oreo Enrobed Koekjes met melkchocoladesmaak 246g | Cookies, oatmeal, soft, with raisins | zwak | 2/2 | n.o. | 29 | 2.3 | n.o. |
| Jumbo | Slimpie Lemon Smaak Siroop 300 ml | Fruit syrup | zwak | 1/2 | n.o. | 8 | 0 | 1.6 |
| Jumbo | Violife Mozzarella Flavour Grated 200 g | Cheese, mozzarella, low moisture, part-skim | zwak | 2/3 | n.o. | 693 | 0.2 | n.o. |
| Jumbo | Activia Yoghurt Mango 4 x 125 g | Mango, Ataulfo, peeled, raw | zwak | 2/2 | n.o. | 10 | 0 | 168.1 |
| Lidl | Appel-nektar | Apples, fuji, with skin, raw | zwak | 2/2 | 4 | 6 | 0 | n.o. |
| Lidl | Witte bonen | Beans, Dry, Small White (0% moisture) | zwak | 1/1 | 160 | 236 | 4.9 | n.o. |
| Lidl | AA Drink high energy | Beverages, NESTLE, Boost plus, nutritional drink, ready-to-drink | zwak | 1/3 | 8 | 135 | 1.7 | 23.1 |
| Plus | BIO+ Macaroni | Babyfood, macaroni and cheese, toddler | zwak | 1/3 | n.o. | 102 | 0.6 | 0 |
| Plus | BOON Linzen in kruidige tomatensaus - mini | Lentils, dry | zwak | 1/2 | n.o. | 61.9 | 7.2 | n.o. |
| Plus | Damhert Kokoskoek chocolade low carb | Beverages, chocolate syrup | zwak | 0/3 | n.o. | 14 | 2.1 | 0.2 |
| Plus | Get More Vits Still mango & passionfruit | Mango, Ataulfo, peeled, raw | zwak | 1/2 | n.o. | 10 | 0 | 168.1 |
| Plus | Kellogg's Tresor Chocolade hazelnoot | Nuts, hazelnuts or filberts, raw | zwak | 0/2 | n.o. | 134.7 | 3.5 | n.o. |
| Plus | Melkan Griekse stijl yoghurt 10% vet | Yogurt, plain, nonfat | zwak | 1/2 | n.o. | 167.4 | 0 | n.o. |
| Plus | Plato Food Ovenbroodje Kip Surinaamse stijl | Chicken, ground, with additives, raw | zwak | 1/2 | n.o. | 5.8 | 0.6 | n.o. |
| Plus | PLUS Korenlanders Boeren tijger volkoren half | Flour, whole wheat, unenriched | zwak | 1/3 | n.o. | 38 | 3.9 | n.o. |
| Plus | PLUS Zoete aardappelfriet | Cherries, sweet, dark red, raw | zwak | 2/2 | n.o. | 12.3 | 0.1 | 10.4 |
| Plus | Smaakt Honingwafels bio | Cereals, QUAKER, Instant Oatmeal Organic, Regular | zwak | 2/3 | n.o. | 52 | 4.2 | 0 |
| Plus | Verstegen Mix voor gehakt italiaans | Beef, ground, 80% lean meat / 20% fat, raw | zwak | 0/2 | n.o. | 6.9 | 2 | n.o. |
