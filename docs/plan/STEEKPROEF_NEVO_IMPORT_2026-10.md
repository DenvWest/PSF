# Steekproef NEVO-import (ter beoordeling)

Gegenereerd door `node scripts/nevo-extract.mjs` — niet met de hand bewerken.
Bron: NEVO-online versie 2025/9.0, RIVM, Bilthoven. Het script legt NEVO naast de bestaande code en **patcht niets**.

## 1. Het bestand

- Versie in het bestand: NEVO-Online 2025 9.0
- Voedingsmiddelen: 2328, stoffen: 137
- Per 100 ml in plaats van per 100 g: 53 voedingsmiddelen
- Regels die dezelfde waarde herhalen onder een tweede stofgroep (genegeerd): 10410
- Regels die niet te lezen waren of een afwijkende dubbele waarde dragen: 0
- Waarden die NEVO als spoor (TR) markeert: 1171. Als verrijkt (+): 933.

Een spoor staat in het bestand als 0 met de vlag TR, en wordt hier ook zo bewaard (`spoor: true`). Een ontbrekende regel is iets anders dan een 0: dan heeft NEVO de stof niet gemeten.

### Dekking van de stoffen waar het dagboek op leunt

| Stof | Eenheid | Voedingsmiddelen met waarde | Waarvan spoor |
|---|---|---|---|
| Energie (kcal) (ENERCC) | kcal | 2328 van 2328 | 0 |
| Eiwit (PROT) | g | 2328 van 2328 | 2 |
| Vet (FAT) | g | 2328 van 2328 | 8 |
| Verzadigd vet (FASAT) | g | 2328 van 2328 | 4 |
| Koolhydraten (beschikbaar) (CHO) | g | 2328 van 2328 | 2 |
| Suikers (mono + di) (SUGAR) | g | 2327 van 2328 | 5 |
| Voedingsvezel (FIBT) | g | 2321 van 2328 | 2 |
| Natrium (NA) | mg | 2326 van 2328 | 10 |
| Kalium (K) | mg | 2297 van 2328 | 7 |
| Calcium (CA) | mg | 2302 van 2328 | 6 |
| Magnesium (MG) | mg | 2238 van 2328 | 7 |
| IJzer (FE) | mg | 2318 van 2328 | 7 |
| Zink (ZN) | mg | 2212 van 2328 | 13 |
| Vitamine D (VITD) | µg | 2276 van 2328 | 13 |
| Vitamine B12 (VITB12) | µg | 2289 van 2328 | 19 |
| Vitamine C (VITC) | mg | 2278 van 2328 | 49 |
| EPA (F20:5CN3) | g | 2136 van 2328 | 18 |
| DHA (F22:6CN3) | g | 2174 van 2328 | 13 |

Voedingsmiddelen met kcal, eiwit, vet, koolhydraten én vezels: **2321 van 2328**.

## 2. Bestaande NEVO-waarden in `food-sources.ts` nagelopen

| Stof | Rij | NEVO-code | In de code | In NEVO | Oordeel |
|---|---|---|---|---|---|
| protein | tonijn-blik | 1590 | 24,9 g | 24,9 g | klopt |
| protein | kipfilet | 1634 | 23,3 g | 23,3 g | klopt |
| protein | rundvlees-mager | 1663 | 22,6 g | 22,6 g | klopt |
| protein | varkenshaas | 1422 | 22,4 g | 22,4 g | klopt |
| protein | seitan | 1458 | 28,4 g | 28,4 g | klopt |
| protein | belegen-kaas | 2758 | 22,5 g | 22,5 g | klopt |
| protein | tempe | 5573 | 17,6 g | 17,6 g | klopt |
| protein | kabeljauw | 820 | 17,5 g | 17,5 g | klopt |
| protein | magere-kwark | 305 | 8,4 g | 8,4 g | klopt |
| protein | skyr | 5295 | 10,6 g | 10,6 g | klopt |
| protein | linzen | 970 | 8,8 g | 8,8 g | klopt |
| protein | tofu | 5519 | 12,4 g | 12,4 g | klopt |
| protein | kidneybonen | 5173 | 8,3 g | 8,3 g | klopt |
| protein | eieren | 83 | 12,3 g | 12,3 g | klopt |
| protein | huttenkase | 654 | 11,2 g | 11,2 g | klopt |
| protein | volkoren-pasta | 811 | 13,3 g | 13,3 g | klopt |
| protein | erwten-diepvries | 953 | 6 g | 6 g | klopt |
| protein | sojadrink-verrijkt | 3180 | 3,4 g | 3,4 g | klopt |
| protein | havermout | 213 | 12,8 g | 12,8 g | klopt |
| protein | pinda | 204 | 25,2 g | 25,2 g | klopt |
| protein | pistachenoten | 5112 | 23,8 g | 23,8 g | klopt |
| protein | sojabonen-gekookt | 971 | 10,6 g | 10,6 g | klopt |
| protein | tuinbonen-gekookt | 962 | 5 g | 5 g | klopt |
| protein | quinoa-droog | 3153 | 14,1 g | 14,1 g | klopt |
| protein | paling | 1624 | 24,3 g | 24,3 g | klopt |
| protein | rundergehakt | 1405 | 18,9 g | 18,9 g | klopt |
| protein | jonge-kaas | 2756 | 22,8 g | 22,8 g | klopt |
| protein | mosselen | 111 | 17,2 g | 17,2 g | klopt |
| protein | biefstuk | 1400 | 22,9 g | 22,9 g | klopt |
| protein | kippenlever | 475 | 19,1 g | 19,1 g | klopt |
| protein | mozzarella | 1955 | 18,7 g | 18,7 g | klopt |
| protein | feta | 3362 | 16,6 g | 16,6 g | klopt |
| protein | melk-vol | 279 | 3,3 g | 3,3 g | klopt |
| magnesium | pompoenzaden | 2806 | 535 mg | 535 mg | klopt |
| magnesium | spinazie | 52 | 77 mg | 77 mg | klopt |
| magnesium | zwarte-bonen | 5176 | 42 mg | 42 mg | klopt |
| magnesium | quinoa | 3154 | 64 mg | 64 mg | klopt |
| magnesium | zonnebloempitten | 872 | 363 mg | 363 mg | klopt |
| magnesium | havermout | 213 | 120 mg | 120 mg | klopt |
| magnesium | cashewnoten | 199 | 269 mg | 269 mg | klopt |
| magnesium | amandelen | 5049 | 232 mg | 232 mg | klopt |
| magnesium | zilvervliesrijst | 1014 | 39 mg | 39 mg | klopt |
| magnesium | volkorenbrood | 246 | 66 mg | 66 mg | klopt |
| magnesium | witte-bonen | 5175 | 48 mg | 48 mg | klopt |
| magnesium | banaan | 151 | 28 mg | 28 mg | klopt |
| magnesium | gedroogde-vijgen | 193 | 68 mg | 68 mg | klopt |
| magnesium | avocado | 689 | 26 mg | 26 mg | klopt |
| magnesium | spinazie-rauw | 51 | 55 mg | 55 mg | klopt |
| magnesium | broccoli-gekookt | 920 | 19 mg | 19 mg | klopt |
| magnesium | hazelnoten | 200 | 160 mg | 160 mg | klopt |
| magnesium | pecannoten | 1895 | 121 mg | 121 mg | klopt |
| magnesium | pistachenoten | 5112 | 136 mg | 136 mg | klopt |
| magnesium | macadamia | 2844 | 118 mg | 118 mg | klopt |
| magnesium | pinda | 204 | 216 mg | 216 mg | klopt |
| magnesium | sesamzaad | 838 | 335 mg | 335 mg | klopt |
| magnesium | maanzaad | 2805 | 449 mg | 449 mg | klopt |
| magnesium | sojabonen-gekookt | 971 | 74 mg | 74 mg | klopt |
| magnesium | quinoa-droog | 3153 | 197 mg | 197 mg | klopt |
| vitamin_d | zalm | 1587 | 7,9 µg | 7,9 µg | klopt |
| vitamin_d | makreel | 353 | 8 µg | 8 µg | klopt |
| vitamin_d | sardines | 355 | 3,3 µg | 3,3 µg | klopt |
| vitamin_d | halvarine | 2566 | 7,5 µg | 7,5 µg | klopt |
| vitamin_d | eieren | 83 | 1,1 µg | 1,1 µg | klopt |
| zinc | rundvlees | 2336 | 4,17 mg | 4,17 mg | klopt |
| zinc | hennepzaad | 3446 | 9,9 mg | 9,9 mg | klopt |
| zinc | linzen | 970 | 1,4 mg | 1,4 mg | klopt |
| zinc | pompoenzaden | 2806 | 7,94 mg | 7,94 mg | klopt |
| zinc | quinoa | 3154 | 1,09 mg | 1,09 mg | klopt |
| zinc | eieren | 83 | 1,56 mg | 1,56 mg | klopt |
| zinc | havermout | 213 | 2,5 mg | 2,5 mg | klopt |
| zinc | cashewnoten | 199 | 5,8 mg | 5,8 mg | klopt |
| zinc | belegen-kaas | 2758 | 3,3 mg | 3,3 mg | klopt |
| zinc | volkorenbrood | 246 | 1,41 mg | 1,41 mg | klopt |
| zinc | pecannoten | 1895 | 4,53 mg | 4,53 mg | klopt |
| zinc | jonge-kaas | 2756 | 3,48 mg | 3,48 mg | klopt |
| zinc | mosselen | 111 | 2,2 mg | 2,2 mg | klopt |
| zinc | biefstuk | 1400 | 3,99 mg | 3,99 mg | klopt |
| zinc | kippenlever | 475 | 3,19 mg | 3,19 mg | klopt |

## 3. Kandidaten voor rijen zonder NEVO-bron

Per rij de beste NEVO-voedingsmiddelen op naam. **Een kandidaat is een voorstel, geen match:** controleer vooral rauw/bereid, soort en verrijking. De kolom Δ vergelijkt met de waarde die er nu staat (vaak USDA); een groot verschil is een signaal om naar te kijken, niet per se een fout.

| Stof | Rij | Nu | NEVO-kandidaat (code) | Zekerheid | NEVO-waarde | Δ | Ook |
|---|---|---|---|---|---|---|---|
| protein | Griekse yoghurt | 8,78 g (usda) | Yoghurt Griekse volle (2503) | sterk | 3,8 g | -57% | Yoghurt Griekse magere |
| protein | Kikkererwten | 8,86 g (usda) | Kikkererwten geroosterd leblebi Turks (1369) | zwak | 21,3 g | +140% |  |
| protein | Edamame | 11,9 g (usda) | geen kandidaat | — | — | — |  |
| protein | Spliterwten, gekookt | 8,34 g (usda) | geen kandidaat | — | — | — |  |
| magnesium | Tahin (sesampasta) | 95 mg (usda) | Pasta sesam- tahin m toegevoegd zout (1461) | sterk | 353 mg | +272% |  |
| magnesium | Pure chocolade 70% | — | geen kandidaat | — | — | — |  |
| magnesium | Boerenkool, gekookt | 25 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Snijbiet, gekookt | 86 mg (usda) | Snijbiet gekookt (48) | sterk | 11 mg | -87% |  |
| magnesium | Spinazie, diepvries | 75 mg (usda) | Spinazie diepvries gekookt (146) | sterk | 34 mg | -55% | Spinazie gesneden diepvries onbereid; Spinazie a la creme diepvries gekookt |
| magnesium | Edamame | 64 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Tuinbonen, gekookt | 43 mg (usda) | Bonen tuin- gekookt (962) | sterk | 19 mg | -56% | Bonen tuin- rauw; Bonen snij- gekookt |
| magnesium | Spliterwten, gekookt | 36 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Boekweit, gekookt | 51 mg (usda) | geen kandidaat | — | — | — |  |
| omega3 | Makreel | 2299 mg (usda) | Makreel rauw (353) | sterk | 2520 mg | +10% | Makreel gestoomd; Makreel in olie blik |
| omega3 | Wilde zalm | 1436 mg (usda) | geen kandidaat | — | — | — |  |
| omega3 | Haring | 1571 mg (usda) | Haring gezouten (350) | sterk | 750 mg | -52% | Haring pan- rauw; Haring in (zoet)zuur |
| omega3 | Gekweekte zalm | 903 mg (usda) | Zalm kweek- rauw (1587) | sterk | 1410 mg | +56% | Zalm kweek- bereid in magnetron z toev |
| omega3 | Ansjovis | — | Ansjovis rauw (3199) | sterk | 1360 mg | — | Ansjovis in olie blik |
| omega3 | Sardines uit blik | 982 mg (usda) | Sardines in olie blik (355) | zwak | 2180 mg | +122% | Croissants uit blik afgebakken |
| omega3 | Sprot | — | geen kandidaat | — | — | — |  |
| omega3 | Gerookte forel | — | geen kandidaat | — | — | — |  |
| omega3 | Algenolie (voedingsolie) | — | geen kandidaat | — | — | — |  |
| omega3 | Omega-3 verrijkte eieren | — | geen kandidaat | — | — | — |  |
| omega3 | Tonijn uit blik, op water | 222 mg (usda) | Tonijn in water blik (1590) | sterk | 250 mg | +13% | Tonijn in olie blik; Tonijn m groente en tomatensaus in blik |
| vitamin_d | Haring | — | Haring gezouten (350) | sterk | 6,2 µg | — | Haring pan- rauw; Haring in (zoet)zuur |
| vitamin_d | Leverpastei | — | geen kandidaat | — | — | — |  |
| vitamin_d | Paddenstoelen, UV-behandeld | 26,2 µg (usda) | geen kandidaat | — | — | — |  |
| vitamin_d | Plantaardige drank, verrijkt | — | Plantaardig alternatief voor Goudse kaas obv kokosolie verrijkt m Ca en Vit B12 (5466) | zwak | 0 µg | — | Yoghurtdrank verrijkt m calcium |
| vitamin_d | Zonlicht op je huid | — | geen kandidaat | — | — | — |  |
| vitamin_d | Forel, gebakken | 19 µg (usda) | geen kandidaat | — | — | — |  |
| zinc | Oesters | 37,9 mg (usda) | Oesters (354) | sterk | 59,2 mg | +56% | Kalfsoester rauw; Varkensoester rauw |
| zinc | Lamsvlees | 2,08 mg (usda) | Lamsvlees >10 g vet rauw gem (1675) | zwak | 3,47 mg | +67% | Lamsvlees <10 g vet rauw gem |
| zinc | Kalfsvlees | 2,01 mg (usda) | Kalfsvlees gem rauw (5280) | sterk | 3,13 mg | +56% | Kalfsvlees <5 g vet gem rauw; Kalfsvlees >5 g vet gem rauw |
| zinc | Kikkererwten | 1,53 mg (usda) | Kikkererwten geroosterd leblebi Turks (1369) | zwak | — | — |  |
| zinc | Garnalen | 0,94 mg (usda) | Garnalen gemarineerde (5602) | sterk | 0,79 mg | -16% | Garnalen roze gekookt; Garnalen in water blik |
| zinc | Edamame | 1,37 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Runderlever | 5,3 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Feta | 2,35 mg (usda) | Kaas Feta (3362) | sterk | 0,9 mg | -62% |  |

Rijen met minstens één kandidaat: **20 van 38**, waarvan sterk: **15**.

## 4. Generieke dagboekregels (`food-catalog.ts`)

- Regels in de catalogus: 371
- Met een sterke kandidaat in NEVO (score ≥ 0,9): **234**
- Zonder enige kandidaat: 96

### De 16 regels die wachtten op de supermarktlaag (`geenBron: "verrijkt"`)

| Regel | Beste NEVO-kandidaat (code) | kcal | Ook |
|---|---|---|---|
| Halfvolle melk | Melk halfvolle (286) | 45 | Melk koffie- halfvolle; Melk chocolade- halfvolle |
| Magere melk | Melk magere (294) | 35 | Melk koffie- magere; Melk chocolade- magere |
| Havermelk | Drink haver- z suiker (5463) | 40 | Drink haver- z suiker verrijkt m calcium en vitamines; Drink soja- Groeidrink 1-3+ Alpro |
| Amandeldrink | Drink amandel- z suiker (5464) | 26 | Drink amandel- m suiker verrijkt m calcium en vitamines; Drink amandel- z suiker verrijkt m calcium en vitamines |
| Kokosdrink | Drink kokos- z suiker (5543) | 26 | Drink kokos- m suiker verrijkt m calcium en vitamines |
| Rijstdrink | Drink rijst- z suiker (5101) | 65 | Drink rijst- z suiker verrijkt m calcium en vitamines |
| Sojayoghurt | Plantaardig alternatief voor room obv soja (2262) | 161 | Plantaardig alternatief voor room obv soja Alpro Cuisine Light; Plantaardig alternatief voor yoghurt obv soja m suiker verrijkt m calcium en vitamines |
| Plantaardige yoghurt | Plantaardig alternatief voor yoghurt obv kokos z suiker (5545) | 150 | Plantaardig alternatief voor yoghurt obv soja m suiker verrijkt m calcium en vitamines; Plantaardig alternatief voor yoghurt obv soja z suiker verrijkt m calcium en vitamines |
| Vegetarisch gehakt | Gehakt fijn- vegetarisch obv soja onbereid (2047) | 148 | Gehakt fijn- vegetarisch obv mycoproteine onbereid; Gehakt rul vegetarisch obv soja onbereid verrijkt m ijzer en vit B12 |
| Vegetarische burger | Balletjes/burgers vegetarisch obv erwt onbereid (5552) | 209 | Burger vegetarisch gevuld m groente en kaas onbereid; Groenteballetjes/-burgers vegetarisch obv soja onbereid |
| Vegetarische worst | Worst boterham- vegetarisch (5478) | 173 | Worst braad- vegetarisch obv erwt onbereid; Worst boterham- vegetarisch verrijkt m ijzer en vit B12 |
| Vegetarische stukjes | Stukjes vegetarisch obv mycoproteine onbereid (2031) | 86 | Reepjes/stukjes vegetarisch obv soja/tarwe onbereid; Reepjes/stukjes vegetarisch obv soja/tarwe onbereid verrijkt m ijzer en vit B12 |
| Margarine | Margarine 80% vet >24 g verz vetz gezouten (2063) | 719 | Margarine 80% vet >24 g verz vetz ongezouten; Margarine 80% vet <24 g verz vetz ongezouten |
| Ontbijtgranen, verrijkt | geen kandidaat | — |  |
| Proteïnereep | Eiwitreep m pinda (5507) | 506 | Eiwitreep m chocola m zoetstof |
| Eiwitshake | geen kandidaat | — |  |
