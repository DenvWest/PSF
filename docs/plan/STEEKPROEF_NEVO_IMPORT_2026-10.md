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
| protein | sojadrink-verrijkt | 3180 | 3,4 g | 3,4 g | klopt |
| vitamin_d | makreel | 353 | 8 µg | 8 µg | klopt |
| vitamin_d | sardines | 355 | 3,3 µg | 3,3 µg | klopt |
| vitamin_d | halvarine | 2566 | 7,5 µg | 7,5 µg | klopt |
| zinc | rundvlees | 2336 | 4,17 mg | 4,17 mg | klopt |

## 3. Kandidaten voor rijen zonder NEVO-bron

Per rij de beste NEVO-voedingsmiddelen op naam. **Een kandidaat is een voorstel, geen match:** controleer vooral rauw/bereid, soort en verrijking. De kolom Δ vergelijkt met de waarde die er nu staat (vaak USDA); een groot verschil is een signaal om naar te kijken, niet per se een fout.

| Stof | Rij | Nu | NEVO-kandidaat (code) | Zekerheid | NEVO-waarde | Δ | Ook |
|---|---|---|---|---|---|---|---|
| protein | Tonijn uit blik, op water | 19 g (usda) | Tonijn in water blik (1590) | sterk | 24,9 g | +31% | Tonijn in olie blik; Tonijn m groente en tomatensaus in blik |
| protein | Kipfilet | 22,5 g (usda) | Kipfilet rauw (1634) | sterk | 23,3 g | +4% | Kipfilet bereid; Kipfilet (vleeswaar) |
| protein | Rundvlees, mager | 22,8 g (usda) | geen kandidaat | — | — | — |  |
| protein | Varkenshaas | 20,6 g (usda) | Varkenshaas rauw (1422) | sterk | 22,4 g | +9% | Varkenshaas bereid |
| protein | Seitan | — | Seitan gekruid (1458) | sterk | 28,4 g | — |  |
| protein | Belegen kaas | 24,9 g (usda) | Kaas 30+ belegen (3164) | sterk | 31,9 g | +28% | Kaas 30+ jong belegen; Kaas Goudse 48+ belegen |
| protein | Tempé | 20,3 g (usda) | Tempeh onbereid (5573) | sterk | 17,6 g | -13% |  |
| protein | Kabeljauw | 16,1 g (usda) | Kabeljauw rauw (820) | sterk | 17,5 g | +9% | Kabeljauw gekookt; Kabeljauw bereid in magnetron z toev |
| protein | Magere kwark | 11 g (usda) | Kwark magere (305) | sterk | 8,4 g | -24% | Kwark vruchten- magere; Kwark magere lactosevrij |
| protein | Skyr | 10,3 g (usda) | Skyr naturel magere (5295) | sterk | 10,6 g | +3% | Skyr m vruchten magere |
| protein | Linzen | 9,02 g (usda) | Linzen rode gekookt (5174) | sterk | 7,7 g | -15% | Linzen bruine blik/glas; Linzen groene en bruine gekookt |
| protein | Tofu | 17,3 g (usda) | Tofu onbereid (5519) | sterk | 12,4 g | -28% |  |
| protein | Kidneybonen | 8,67 g (usda) | Bonen kidney- rode gekookt (5173) | sterk | 8,3 g | -4% | Bonen kidney- rode gedroogd; Bonen kidney- rode blik/glas |
| protein | Griekse yoghurt | 8,78 g (usda) | Yoghurt Griekse volle (2503) | sterk | 3,8 g | -57% | Yoghurt Griekse magere |
| protein | Eieren | 12,6 g (usda) | Ei kippen- gebakken (1314) | sterk | 14,4 g | +14% | Ei kippen- rauw gem; Ei kippen- mais rauw |
| protein | Kikkererwten | 8,86 g (usda) | Kikkererwten geroosterd leblebi Turks (1369) | zwak | 21,3 g | +140% |  |
| protein | Hüttenkäse | 11,1 g (usda) | Kaas huttenkase (654) | sterk | 11,2 g | +1% |  |
| protein | Volkoren pasta | 13,5 g (usda) | Pasta volkoren rauw (811) | sterk | 13,3 g | -1% | Pasta volkoren gekookt |
| protein | Doperwten, diepvries | 5,15 g (usda) | Doperwten diepvries gekookt (953) | sterk | 6 g | +17% | Doperwten m wortelen diepvries onbereid |
| protein | Havermout | 13,5 g (usda) | Vlokken haver- (213) | sterk | 12,8 g | -5% |  |
| protein | Pinda's | 25,8 g (usda) | Pinda's gezouten (876) | sterk | 24,8 g | -4% | Pinda's ongezouten; Pinda's dry roasted |
| protein | Pistachenoten | 20,16 g (usda) | Noten pistache- gezouten (1896) | sterk | 23,8 g | +18% | Noten pistache ongezouten |
| protein | Sojabonen, gekookt | 18,2 g (usda) | Bonen soja- gekookt (971) | sterk | 10,6 g | -42% | Bonen snij- gekookt; Bonen tuin- gekookt |
| protein | Edamame | 11,9 g (usda) | geen kandidaat | — | — | — |  |
| protein | Spliterwten, gekookt | 8,34 g (usda) | geen kandidaat | — | — | — |  |
| protein | Tuinbonen, gekookt | 7,6 g (usda) | Bonen tuin- gekookt (962) | sterk | 5 g | -34% | Bonen tuin- rauw; Bonen snij- gekookt |
| protein | Quinoa, droog | 14,1 g (usda) | geen kandidaat | — | — | — |  |
| protein | Paling | 23,65 g (usda) | Paling rauw (112) | sterk | 14 g | -41% | Paling gerookt; Paling bereid in magnetron z toev |
| protein | Rundergehakt | 18,7 g (usda) | geen kandidaat | — | — | — |  |
| protein | Jonge kaas | 24,9 g (usda) | Kaas 30+ jong (3155) | sterk | 30,1 g | +21% | Kaas Goudse 48+ jong; Kaas 30+ jong belegen |
| protein | Mosselen | 23,4 g (usda) | Mosselen rauw (5326) | sterk | 11,1 g | -53% | Mosselen gekookt; Mosselen in zuur glas |
| protein | Biefstuk | 22,4 g (usda) | Runderbiefstuk rauw (1400) | zwak | 22,9 g | +2% | Runderbiefstuk bereid; Runderbiefstuk v de haas rauw |
| protein | Kippenlever | 16,9 g (usda) | geen kandidaat | — | — | — |  |
| protein | Mozzarella | 22,17 g (usda) | Kaas Mozzarella gemaakt v koemelk (1955) | sterk | 18,7 g | -16% |  |
| protein | Feta | 19,7 g (usda) | Kaas Feta (3362) | sterk | 16,6 g | -16% |  |
| protein | Volle melk | 3,27 g (usda) | Melk volle (279) | sterk | 3,3 g | +1% | Melk koffie- volle; Melk geiten- volle |
| magnesium | Pompoenzaden | 592 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Spinazie, gekookt | 87 mg (usda) | Spinazie gekookt (52) | sterk | 77 mg | -11% | Spinazie diepvries gekookt; Spinazie a la creme diepvries gekookt |
| magnesium | Zwarte bonen | 70 mg (usda) | Bonen zwarte blik/glas (5176) | sterk | 42 mg | -40% |  |
| magnesium | Quinoa | 64 mg (usda) | Quinoa rauw (3153) | sterk | 197 mg | +208% | Quinoa gekookt |
| magnesium | Zonnebloempitten | 325 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Havermout | 126 mg (usda) | Vlokken haver- (213) | sterk | 120 mg | -5% |  |
| magnesium | Cashewnoten | 251 mg (usda) | Noten cashew- gezouten (2886) | sterk | 269 mg | +7% | Noten cashew- ongezouten |
| magnesium | Amandelen | 258 mg (usda) | Meel amandel- (5579) | sterk | 240 mg | -7% | Broodje amandel- (v bladerdeeg); Noten amandelen z vliesje gezouten |
| magnesium | Zilvervliesrijst | 39 mg (usda) | Rijst zilvervlies- rauw (712) | sterk | 157 mg | +303% | Rijst zilvervlies- gekookt |
| magnesium | Volkorenbrood | 75 mg (usda) | Roggebrood volkoren (242) | zwak | 57 mg | -24% | Tarweroggebrood volkoren; Tarwedesembrood volkoren |
| magnesium | Tahin (sesampasta) | 95 mg (usda) | Pasta sesam- tahin m toegevoegd zout (1461) | sterk | 353 mg | +272% |  |
| magnesium | Pure chocolade 70% | — | geen kandidaat | — | — | — |  |
| magnesium | Witte bonen | 63 mg (usda) | Bonen witte gekookt (5175) | sterk | 48 mg | -24% | Bonen witte blik/glas; Bonen witte/bruine gedroogd |
| magnesium | Banaan | 28 mg (usda) | Banaan (151) | sterk | 28 mg | +0% | Banaan bak- rijp rauw; Beignet banaan- |
| magnesium | Gedroogde vijgen | 67,6 mg (usda) | Vijgen gedroogd (193) | sterk | 68 mg | +1% |  |
| magnesium | Avocado | 32,8 mg (usda) | Avocado (689) | sterk | 26 mg | -21% |  |
| magnesium | Boerenkool, gekookt | 25 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Snijbiet, gekookt | 86 mg (usda) | Snijbiet gekookt (48) | sterk | 11 mg | -87% |  |
| magnesium | Spinazie, rauw | 79 mg (usda) | Spinazie rauw (51) | sterk | 55 mg | -30% |  |
| magnesium | Spinazie, diepvries | 75 mg (usda) | Spinazie diepvries gekookt (146) | sterk | 34 mg | -55% | Spinazie gesneden diepvries onbereid; Spinazie a la creme diepvries gekookt |
| magnesium | Broccoli, gekookt | 21 mg (usda) | Broccoli gekookt (920) | sterk | 19 mg | -10% |  |
| magnesium | Hazelnoten | 163 mg (usda) | Noten hazel- ongezouten (200) | sterk | 160 mg | -2% |  |
| magnesium | Pecannoten | 121 mg (usda) | Noten pecan- ongebrand ongezouten (1895) | sterk | 121 mg | +0% | Noten pecan- gebrand m olie gezouten |
| magnesium | Pistachenoten | 121 mg (usda) | Noten pistache- gezouten (1896) | sterk | 136 mg | +12% | Noten pistache ongezouten |
| magnesium | Macadamianoten | 130 mg (usda) | Noten macadamia gezouten (5111) | sterk | 118 mg | -9% | Noten macadamia- ongezouten |
| magnesium | Pinda's | 168 mg (usda) | Pinda's gezouten (876) | sterk | 188 mg | +12% | Pinda's ongezouten; Pinda's dry roasted |
| magnesium | Sesamzaad | 351 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Maanzaad | 347 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Sojabonen, gekookt | 86 mg (usda) | Bonen soja- gekookt (971) | sterk | 74 mg | -14% | Bonen snij- gekookt; Bonen tuin- gekookt |
| magnesium | Edamame | 64 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Tuinbonen, gekookt | 43 mg (usda) | Bonen tuin- gekookt (962) | sterk | 19 mg | -56% | Bonen tuin- rauw; Bonen snij- gekookt |
| magnesium | Spliterwten, gekookt | 36 mg (usda) | geen kandidaat | — | — | — |  |
| magnesium | Quinoa, droog | 197 mg (usda) | geen kandidaat | — | — | — |  |
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
| vitamin_d | Zalm | — | Zalm blik (602) | sterk | 10,9 µg | — | Zalm gerookt; Zalm kweek- rauw |
| vitamin_d | Leverpastei | — | geen kandidaat | — | — | — |  |
| vitamin_d | Eieren | 2 µg (usda) | Ei kippen- gebakken (1314) | sterk | 1,4 µg | -30% | Ei kippen- rauw gem; Ei kippen- mais rauw |
| vitamin_d | Paddenstoelen, UV-behandeld | 26,2 µg (usda) | geen kandidaat | — | — | — |  |
| vitamin_d | Plantaardige drank, verrijkt | — | Plantaardig alternatief voor Goudse kaas obv kokosolie verrijkt m Ca en Vit B12 (5466) | zwak | 0 µg | — | Yoghurtdrank verrijkt m calcium |
| vitamin_d | Zonlicht op je huid | — | geen kandidaat | — | — | — |  |
| vitamin_d | Forel, gebakken | 19 µg (usda) | geen kandidaat | — | — | — |  |
| zinc | Oesters | 37,9 mg (usda) | Oesters (354) | sterk | 59,2 mg | +56% | Kalfsoester rauw; Varkensoester rauw |
| zinc | Lamsvlees | 2,08 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Kalfsvlees | 2,01 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Hennepzaad, gepeld | 9,9 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Linzen | 1,27 mg (usda) | Linzen rode gekookt (5174) | sterk | 1,37 mg | +8% | Linzen bruine blik/glas; Linzen groene en bruine gekookt |
| zinc | Pompoenzaden | 7,81 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Kikkererwten | 1,53 mg (usda) | Kikkererwten geroosterd leblebi Turks (1369) | zwak | — | — |  |
| zinc | Quinoa | 1,09 mg (usda) | Quinoa rauw (3153) | sterk | 3,1 mg | +184% | Quinoa gekookt |
| zinc | Eieren | 1,29 mg (usda) | Ei kippen- gebakken (1314) | sterk | 1,3 mg | +1% | Ei kippen- rauw gem; Ei kippen- mais rauw |
| zinc | Garnalen | 0,94 mg (usda) | Garnalen gemarineerde (5602) | sterk | 0,79 mg | -16% | Garnalen roze gekookt; Garnalen in water blik |
| zinc | Havermout | 2,74 mg (usda) | Vlokken haver- (213) | sterk | 2,5 mg | -9% |  |
| zinc | Cashewnoten | 5,07 mg (usda) | Noten cashew- gezouten (2886) | sterk | 5,8 mg | +14% | Noten cashew- ongezouten |
| zinc | Belegen kaas | 3,9 mg (usda) | Kaas 30+ belegen (3164) | sterk | 4,47 mg | +15% | Kaas 30+ jong belegen; Kaas Goudse 48+ belegen |
| zinc | Volkorenbrood | 1,77 mg (usda) | Roggebrood volkoren (242) | zwak | 1,5 mg | -15% | Tarweroggebrood volkoren; Tarwedesembrood volkoren |
| zinc | Pecannoten | 4,53 mg (usda) | Noten pecan- ongebrand ongezouten (1895) | sterk | 4,53 mg | +0% | Noten pecan- gebrand m olie gezouten |
| zinc | Edamame | 1,37 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Jonge kaas | 3,9 mg (usda) | Kaas 30+ jong (3155) | sterk | 4,15 mg | +6% | Kaas Goudse 48+ jong; Kaas 30+ jong belegen |
| zinc | Runderlever | 5,3 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Mosselen | 2,7 mg (usda) | Mosselen rauw (5326) | sterk | 2,19 mg | -19% | Mosselen gekookt; Mosselen in zuur glas |
| zinc | Biefstuk | 4 mg (usda) | Runderbiefstuk rauw (1400) | zwak | 3,99 mg | 0% | Runderbiefstuk bereid; Runderbiefstuk v de haas rauw |
| zinc | Kippenlever | 2,7 mg (usda) | geen kandidaat | — | — | — |  |
| zinc | Feta | 2,35 mg (usda) | Kaas Feta (3362) | sterk | 0,9 mg | -62% |  |

Rijen met minstens één kandidaat: **79 van 111**, waarvan sterk: **71**.

## 4. Generieke dagboekregels (`food-catalog.ts`)

- Regels in de catalogus: 371
- Met een sterke kandidaat in NEVO (score ≥ 0,9): **223**
- Zonder enige kandidaat: 113

### De 16 regels die wachtten op de supermarktlaag (`geenBron: "verrijkt"`)

| Regel | Beste NEVO-kandidaat (code) | kcal | Ook |
|---|---|---|---|
| Halfvolle melk | Melk halfvolle (286) | 45 | Melk koffie- halfvolle; Melk chocolade- halfvolle |
| Magere melk | Melk magere (294) | 35 | Melk koffie- magere; Melk chocolade- magere |
| Havermelk | Drink haver- z suiker (5463) | 40 | Drink haver- z suiker verrijkt m calcium en vitamines |
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
