# Steekproef: koppeling FOOD_CATALOG ↔ NEVO 2025/9.0

Gegenereerd door `scripts/nevo-koppel.mjs` (deterministisch). De regels onder "Handmatig gekoppeld" en "Bewust geen koppeling" zijn door Claude beslist en staan ter controle; alleen "Nog open" vraagt een keuze. Zekere koppelingen staan in `src/data/nutrition/food-catalog-nevo.ts`.

- Catalogusregels: 371
- Zeker via `bron` (FOOD_SOURCES-rij uit NEVO): 71
- Zeker via `naam` (één sterke kandidaat): 49
- Zeker via `handmatig` (beslist door Claude, ter beoordeling): 150
- Benadering (vergelijkbaar NEVO-record, gelabeld): 32
- Bewust geen koppeling (met reden): 68
- **Nog open voor Dennis: 1**

## Nog open voor Dennis

Kies per regel de code, of laat de regel zonder NEVO-koppeling. Leg de keuze vast in `scripts/nevo-koppel-beslissingen.json` (`handmatig` of `bewustNiet`) en draai het script opnieuw.

| Sleutel | Label | Reden | Kandidaten (code · naam · score) |
|---|---|---|---|
| kapucijners | Kapucijners | marge 0.00 < 0.15 | 969 · Kapucijners gekookt · 1.17<br>119 · Kapucijners gedroogd · 1.17<br>196 · Kapucijners blik/glas · 1.14 |

### Zonder kandidaat

| Sleutel | Label |
|---|---|

## Handmatig gekoppeld (Claude, ter beoordeling)

| Sleutel | Label | NEVO-code | NEVO-naam | Opmerking |
|---|---|---|---|---|
| boerenkool-gekookt | Boerenkool, gekookt | 16 | Kool boeren- gekookt |  |
| boerenkool-rauw | Boerenkool, rauw | 959 | Kool boeren- rauw |  |
| sla-kropsla | Kropsla | 46 | Sla krop- rauw | rauw |
| rucola | Rucola | 2736 | Sla rucola rauw | NEVO noemt het 'Sla rucola rauw' |
| veldsla | Veldsla | 65 | Sla veld- rauw | rauw |
| bloemkool-gekookt | Bloemkool, gekookt | 15 | Kool bloem- gekookt |  |
| bloemkool-rauw | Bloemkool, rauw | 14 | Kool bloem- rauw |  |
| spruitjes-gekookt | Spruitjes, gekookt | 55 | Spruitjes gekookt |  |
| rodekool-gekookt | Rodekool, gekookt | 42 | Kool rode gekookt |  |
| wortel-rauw | Wortel, rauw | 71 | Wortel rauw gem | NEVO-gemiddelde |
| wortel-gekookt | Wortel, gekookt | 72 | Wortel gekookt gem | NEVO-gemiddelde |
| knolselderij-gekookt | Knolselderij, gekookt | 26 | Selderij knol- gekookt |  |
| tomaat | Tomaat | 60 | Tomaat gewoon rauw | Tomaat gewoon rauw |
| tomaat-blik | Tomaten, uit blik | 2293 | Tomaat in blik |  |
| paprika-rauw | Paprika, rauw | 2742 | Paprika rauw gem | NEVO-gemiddelde |
| komkommer | Komkommer | 2739 | Komkommer m schil rauw | met schil |
| ui-rauw | Ui, rauw | 63 | Ui rauw |  |
| ui-gebakken | Ui, gebakken | 1393 | Ui gebakken in plantaardige olie | enige gebakken ui in NEVO |
| knoflook | Knoflook | 830 | Knoflook rauw |  |
| asperges-gekookt | Asperges, gekookt | 957 | Asperge witte gekookt | witte asperge |
| mais-blik | Maïs, uit blik | 2900 | Mais blik/glas |  |
| mais-kolf | Maïskolf | 57 | Mais suiker- gekookt | suikermais, gekookt |
| sperziebonen-gekookt | Sperziebonen, gekookt | 951 | Bonen sperzie- gekookt |  |
| zeewier-nori | Nori (zeewier) | 3227 | Zeewier nori gedroogd | gedroogd |
| appel | Appel | 875 | Appel m schil gem | NEVO-gemiddelde met schil |
| peer | Peer | 2748 | Peer m schil | met schil |
| mandarijn | Mandarijn | 165 | Mandarijn |  |
| grapefruit | Grapefruit | 162 | Grapefruit |  |
| kiwi | Kiwi | 5120 | Kiwi gem | NEVO-gemiddelde |
| ananas | Ananas | 150 | Ananas |  |
| druiven | Druiven | 160 | Druiven m schil gem | NEVO-gemiddelde met schil |
| aardbeien | Aardbeien | 148 | Aardbeien |  |
| frambozen | Frambozen | 161 | Frambozen |  |
| kersen | Kersen | 163 | Kersen zoete | zoete kersen |
| perzik | Perzik | 5079 | Perzik m schil | met schil |
| pruim | Pruim | 170 | Pruimen m schil |  |
| abrikoos-vers | Abrikoos, vers | 149 | Abrikozen m schil | met schil |
| meloen | Meloen | 5369 | Meloen gem | NEVO-gemiddelde |
| dadels | Dadels | 181 | Dadels gedroogd | catalogusregel is gedroogd |
| rozijnen | Rozijnen | 33 | Rozijnen gedroogd |  |
| abrikoos-gedroogd | Abrikozen, gedroogd | 175 | Abrikozen gedroogd |  |
| pruimen-gedroogd | Pruimen, gedroogd | 190 | Pruimen gedroogd |  |
| appelmoes | Appelmoes | 179 | Appelmoes blik/glas |  |
| haverzemelen | Haverzemelen | 3058 | Zemelen haver- |  |
| bulgur-gekookt | Bulgur, gekookt | 3200 | Tarwe gebroken bulgur gekookt |  |
| couscous-gekookt | Couscous, gekookt | 2158 | Couscous gekookt |  |
| witbrood | Witbrood | 248 | Tarwebrood wit water | Tarwebrood wit water |
| roggebrood | Roggebrood | 242 | Roggebrood volkoren | volkoren; NEVO heeft geen ander roggebrood als gewone naam |
| stokbrood | Stokbrood | 2793 | Tarwestokbrood wit | Tarwestokbrood wit |
| pita | Pitabroodje | 2790 | Tarwebrood wit pita | Tarwebrood wit pita |
| tortilla-wrap | Tortilla / wrap | 2359 | Wrap/tortilla obv tarwe naturel | naturel |
| croissant | Croissant | 2818 | Croissant gem | NEVO-gemiddelde |
| crackers-volkoren | Volkoren crackers | 5567 | Cracker luchtige volkoren |  |
| knackebrod | Knäckebröd | 229 | Knackebrod gem | NEVO-gemiddelde |
| beschuit | Beschuit | 227 | Beschuit naturel | naturel |
| rijstwafel | Rijstwafel | 1481 | Wafel rijst- naturel m (zee)zout | naturel met zout |
| toast | Toast / geroosterd brood | 2937 | Toast Melba naturel | Toast Melba naturel |
| pasta-wit-droog | Pasta, droog | 4 | Pasta witte rauw | Pasta witte rauw |
| pasta-wit-gekookt | Pasta, gekookt | 659 | Pasta witte gem gekookt | NEVO-gemiddelde witte pasta |
| linzen-blik | Linzen, uit blik | 5169 | Linzen bruine blik/glas | bruine linzen |
| kidneybonen-blik | Kidneybonen, uit blik | 3184 | Bonen kidney- rode blik/glas |  |
| cannellinibonen-blik | Cannellinibonen, uit blik | 5170 | Bonen cannellini blik/glas |  |
| spliterwten-gekookt | Spliterwten, gekookt | 3216 | Erwten split- groene gekookt | groene spliterwten |
| walnoten | Walnoten | 206 | Noten wal- ongezouten | ongezouten |
| paranoten | Paranoten | 203 | Noten para- ongezouten | ongezouten |
| notenmix | Notenmix, ongezouten | 207 | Noten gemengd ongezouten | gemengd, ongezouten |
| chiazaad | Chiazaad | 3447 | Chiazaad gedroogd |  |
| lijnzaad | Lijnzaad, gemalen | 867 | Lijnzaad | NEVO geeft geen onderscheid hele/gemalen |
| kalkoenfilet | Kalkoenfilet | 1936 | Kalkoenfilet rauw | rauw |
| half-om-half-gehakt | Half-om-half gehakt | 1434 | Gehakt hoh rauw | rauw |
| varkenskarbonade | Karbonade | 1788 | Varkensribkarbonade rauw | Varkensribkarbonade rauw |
| konijn | Konijn | 109 | Konijn tam rauw | tam, rauw |
| wild | Wild (hert, ree) | 339 | Ree wild rauw | NEVO heeft alleen ree |
| hamburger | Hamburger | 1435 | Hamburger rauw | rauw |
| bacon | Bacon / spek | 641 | Bacon |  |
| salami | Salami | 1152 | Worst salami |  |
| kipfilet-vleeswaren | Kipfilet (vleeswaren) | 2654 | Kipfilet (vleeswaar) |  |
| runderlever | Runderlever | 1407 | Lever runder- rauw | rauw |
| varkenslever | Varkenslever | 1426 | Lever varkens- rauw | rauw |
| tong | Tong | 2298 | Tong rauw (vis) | rauw |
| zalm-gekweekt | Zalm, gekweekt | 1587 | Zalm kweek- rauw | kweek-, rauw |
| zalm-blik | Zalm, uit blik | 602 | Zalm blik |  |
| makreel-gerookt | Makreel, gerookt | 1586 | Makreelfilet gerookt | Makreelfilet gerookt |
| ansjovis | Ansjovis | 1588 | Ansjovis in olie blik | in olie, blik (gangbare vorm) |
| tonijn-vers | Tonijn, vers | 2297 | Tonijn rauw | rauw |
| koolvis | Koolvis | 2296 | Koolvis (Atlantisch) rauw | Atlantisch, rauw |
| schelvis | Schelvis | 1614 | Schelvis bereid in magnetron z toev | enige schelvis zonder blik/lever |
| schol | Schol | 813 | Schol rauw | rauw |
| pangasius | Pangasius | 3322 | Pangasius rauw | rauw |
| vissticks | Vissticks | 815 | Vissticks onbereid | onbereid |
| garnalen | Garnalen | 3320 | Garnalen roze gekookt | roze, gekookt (zo verkocht) |
| krab | Krab | 351 | Krab in water blik | in water, blik |
| inktvis | Inktvis | 1098 | Inktvis rauw | rauw |
| roerei | Roerei | 5321 | Omelet/roerei | NEVO: omelet/roerei |
| omelet | Omelet | 5321 | Omelet/roerei | NEVO: omelet/roerei |
| eiwit | Eiwit (los) | 358 | Eiwit kippenei rauw |  |
| eidooier | Eidooier (los) | 85 | Eidooier kippen- rauw | rauw |
| melk-halfvol | Halfvolle melk | 286 | Melk halfvolle |  |
| melk-mager | Magere melk | 294 | Melk magere |  |
| karnemelk | Karnemelk | 289 | Melk karne- |  |
| yoghurt-vol | Volle yoghurt | 278 | Yoghurt volle |  |
| yoghurt-mager | Magere yoghurt | 301 | Yoghurt magere |  |
| volle-kwark | Volle kwark | 307 | Kwark volle |  |
| creme-fraiche | Crème fraîche | 1808 | Creme fraiche |  |
| slagroom | Slagroom | 299 | Room slag- onbereid | Room slag- onbereid |
| drinkyoghurt | Drinkyoghurt | 657 | Yoghurtdrank | Yoghurtdrank |
| oude-kaas | Oude kaas | 2759 | Kaas Goudse 48+ oud | Goudse 48+ oud |
| magere-kaas | Magere kaas (20+/30+) | 1723 | Kaas 20+ | Kaas 20+ |
| schapenkaas | Schapenkaas | 804 | Kaas schapen- vers | vers |
| sojadrink-onverrijkt | Sojadrink, onverrijkt | 870 | Drink soja- z suiker | z suiker, onverrijkt |
| olijfolie-ev | Olijfolie, extra vierge | 601 | Olie olijf- | NEVO onderscheidt geen extra vierge |
| pindakaas | Pindakaas | 455 | Pindakaas |  |
| hummus | Hummus | 3207 | Hummus naturel | naturel |
| ketchup | Ketchup | 462 | Ketchup tomaten- | tomatenketchup |
| mosterd | Mosterd | 824 | Mosterd |  |
| pesto | Pesto | 2178 | Pesto groene | groene pesto |
| tomatensaus | Tomatensaus | 1524 | Saus tomaten- kant-en-klaar glas |  |
| sambal | Sambal | 1232 | Sambal oelek | sambal oelek |
| appelstroop | Appelstroop | 427 | Stroop appel- rinse | Stroop appel- rinse |
| muesli | Muesli | 2809 | Muesli m fruit/naturel |  |
| cornflakes | Cornflakes | 2081 | Ontbijtproduct Cornflakes |  |
| ontbijtkoek | Ontbijtkoek | 240 | Koek ontbijt- |  |
| jam | Jam | 445 | Jam |  |
| hagelslag | Hagelslag | 1311 | Hagelslag chocolade- gem | chocolade, gemiddeld |
| popcorn | Popcorn | 630 | Popcorn naturel gepoft z olie | naturel, gepoft zonder olie |
| chips | Chips | 122 | Chips gem | NEVO-gemiddelde |
| tortillachips | Tortillachips | 1937 | Chips tortilla naturel | naturel |
| koek | Koekje | 258 | Koekje gem | NEVO-gemiddelde koekje |
| melkchocolade | Melkchocolade | 431 | Chocolade melk- |  |
| ijs | IJs | 303 | IJs room/vanille- gem | room/vanille, gemiddeld |
| mueslireep | Mueslireep | 2239 | Mueslireep |  |
| stroopwafel | Stroopwafel | 713 | Wafel stroop- gem | gemiddeld |
| tomatensoep | Tomatensoep | 5062 | Soep tomaten- m vermicelli | met vermicelli |
| erwtensoep | Erwtensoep | 5177 | Soep erwten- m vlees | met vlees |
| lasagne | Lasagne | 1491 | Lasagne bolognese koelverse maaltijd | bolognese, koelverse maaltijd |
| nasi | Nasi goreng | 471 | Nasi goreng m ei | met ei |
| bami | Bami goreng | 470 | Bami goreng z ei | zonder ei |
| burrito | Burrito | 5457 | Burrito m gehakt | met gehakt |
| quiche | Quiche | 5398 | Quiche Lorraine | Lorraine |
| aardappel-gekookt | Aardappelen, gekookt | 982 | Aardappelen z schil gekookt gem | zonder schil, gemiddeld |
| aardappelpuree | Aardappelpuree | 737 | Aardappelpuree instant- gem bereid | instant, gemiddeld bereid |
| water | Water | 1885 | Water gem | gemiddeld |
| bruiswater | Bruiswater | 747 | Mineraalwater m en z koolzuur gem | met en zonder koolzuur, gemiddeld |
| koffie | Koffie | 644 | Koffie bereid | bereid |
| thee | Thee | 645 | Thee bereid | bereid |
| sinaasappelsap | Sinaasappelsap | 410 | Sap sinaasappel- gepasteuriseerd | gepasteuriseerd |
| appelsap | Appelsap | 383 | Sap appel- |  |
| groentesap | Groentesap | 1132 | Sap tomatengroenten- | tomatengroentesap |
| chocolademelk | Chocolademelk | 1464 | Melk chocolade- halfvolle | halfvolle |
| bier | Bier | 390 | Bier pils | pils |

## Benadering (vergelijkbaar record)

Geen eigen NEVO-record; macro's (en kernstoffen als vrijgegeven in scripts/nevo-benadering-micros.json), altijd gelabeld als benadering, nooit in een som als brongetal.

| Sleutel | Label | NEVO-code | NEVO-naam | Opmerking |
|---|---|---|---|---|
| broccoli-gestoomd | Broccoli, gestoomd | 920 | Broccoli gekookt | gekookte broccoli |
| broccoli-diepvries | Broccoli, diepvries | 920 | Broccoli gekookt | gekookte broccoli |
| basmatirijst-gekookt | Basmatirijst, gekookt | 658 | Rijst witte gekookt | witte rijst gekookt |
| meergranenbrood | Meergranenbrood | 2784 | Meergranenbrood bruin m zaden  | bruin met zaden |
| kipdij | Kipdij | 1317 | Kip/bout z vel gegrild | kipbout zonder vel; dij en bout lijken sterk |
| eend | Eendenborst | 106 | Eend m vel rauw | eend met vel; geen eendenborst in NEVO |
| worst | Worst | 1909 | Worst excl leverproducten gem | gemiddelde worst zonder leverproducten |
| rosbief | Rosbief | 3345 | Runderrosbief (vleeswaar) | rosbief als beleg |
| boter | Roomboter | 879 | Boter gezouten | gezouten boter |
| blauwe-kaas | Blauwe kaas | 1939 | Kaas blauwschimmel Gorgonzola | Gorgonzola |
| smeerkaas | Smeerkaas | 516 | Kaas smeer- 40+ | smeerkaas 40+ |
| havermelk | Havermelk | 5463 | Drink haver- z suiker | onverrijkt; micro's niet gebruiken |
| amandeldrink | Amandeldrink | 5464 | Drink amandel- z suiker | onverrijkt; micro's niet gebruiken |
| kokosdrink | Kokosdrink | 5543 | Drink kokos- z suiker | onverrijkt; micro's niet gebruiken |
| rijstdrink | Rijstdrink | 5101 | Drink rijst- z suiker | onverrijkt; micro's niet gebruiken |
| vegan-gehakt | Vegetarisch gehakt | 2047 | Gehakt fijn- vegetarisch obv soja onbereid | op basis van soja |
| vegan-burger | Vegetarische burger | 5552 | Balletjes/burgers vegetarisch obv erwt onbereid | op basis van erwt |
| vegan-worst | Vegetarische worst | 5478 | Worst boterham- vegetarisch | vegetarische boterhamworst |
| vleesvervanger-stukjes | Vegetarische stukjes | 5485 | Reepjes/stukjes vegetarisch obv soja/tarwe onbereid | soja/tarwe |
| margarine | Margarine | 2557 | Margarine 80% vet >24 g verz vetz ongezouten | 80% vet, ongezouten; verrijking niet meegenomen |
| bakboter | Bak- en braadboter | 2563 | Bak- en braadvet vast 97% vet >17 g verz vetz ongezouten | bak- en braadvet, vast |
| granola | Granola | 5593 | Muesli krokante naturel | krokante naturel muesli |
| ontbijtgranen-volkoren | Volkoren ontbijtgranen | 225 | Volkoren graanontbijt | volkoren graanontbijt |
| proteinereep | Proteïnereep | 5507 | Eiwitreep m pinda | eiwitreep met pinda |
| groentesoep | Groentesoep | 759 | Soep heldere m soepgroente | heldere soep met soepgroente |
| kippensoep | Kippensoep | 758 | Soep heldere m vlees (rund/kip) | heldere soep met kip |
| pizza | Pizza | 5432 | Pizza m mozzarella Margherita | pizza margherita |
| stamppot | Stamppot | 1483 | Stamppot boerenkool z vlees bereid | boerenkoolstamppot zonder vlees |
| maaltijdsalade | Maaltijdsalade | 5532 | Salade maaltijd- m kip, pasta en dressing | maaltijdsalade met kip, pasta en dressing |
| wrap-gevuld | Gevulde wrap | 5363 | Wrap m kip | wrap met kip |
| groene-thee | Groene thee | 645 | Thee bereid | thee bereid |
| frisdrank-light | Frisdrank, light / zero | 1522 | Frisdrank light z cafeine | light frisdrank |

## Bewust geen koppeling

| Sleutel | Label | Reden |
|---|---|---|
| zuurkool | Zuurkool | NEVO heeft alleen zuurkoolsap en stamppot, geen zuurkool zelf |
| paprika-gebakken | Paprika, gebakken | NEVO heeft geen gebakken paprika |
| courgette-gebakken | Courgette, gebakken | NEVO heeft geen gebakken courgette |
| aubergine-gebakken | Aubergine, gebakken | NEVO heeft geen gebakken aubergine |
| pompoen-geroosterd | Pompoen, geroosterd | NEVO heeft geen geroosterde pompoen |
| paddenstoelen-uv | Paddenstoelen, UV-behandeld | NEVO heeft geen UV-behandelde paddenstoelen |
| fruit-diepvries | Rood fruit, diepvries | NEVO heeft geen diepvriesfruit |
| wilde-rijst-gekookt | Wilde rijst, gekookt | NEVO kent geen wilde rijst |
| boekweit-gekookt | Boekweit, gekookt | NEVO heeft alleen boekweitgrutten (droog) |
| amarant-gekookt | Amarant, gekookt | niet in NEVO |
| teff | Teff | niet in NEVO |
| gerst-gekookt | Gerst, gekookt | NEVO heeft alleen rauwe gerst |
| spelt-gekookt | Spelt, gekookt | NEVO heeft alleen speltmeel en -vlokken |
| polenta | Polenta | niet in NEVO |
| zuurdesembrood | Zuurdesembrood | NEVO heeft alleen een glutenvrije zuurdesem |
| speltbrood | Speltbrood | niet in NEVO |
| naan | Naanbrood | niet in NEVO |
| bagel | Bagel | niet in NEVO |
| maiswafel | Maïswafel | niet in NEVO |
| linzenpasta-droog | Linzenpasta, droog | niet in NEVO |
| kikkererwtenpasta-droog | Kikkererwtenpasta, droog | niet in NEVO |
| rijstnoedels-gekookt | Rijstnoedels, gekookt | niet in NEVO |
| eiernoedels-gekookt | Eiernoedels, gekookt | niet in NEVO |
| ramen-noedels | Ramennoedels | niet in NEVO |
| sobanoedels-gekookt | Sobanoedels, gekookt | niet in NEVO |
| kikkererwten-gekookt | Kikkererwten, gekookt | NEVO kent kikkererwten alleen als geroosterde snack |
| kikkererwten-blik | Kikkererwten, uit blik | NEVO kent kikkererwten alleen als geroosterde snack |
| edamame | Edamame | niet in NEVO |
| kippenvleugel | Kippenvleugels | niet in NEVO |
| schnitzel | Schnitzel | NEVO heeft alleen vegetarische schnitzels met verrijking |
| ham | Ham | NEVO onderscheidt ham per stuk van het varken; geen gewone hamplak |
| hart | Hart | niet in NEVO |
| nier | Nier | runder-, varkens- en lamsnier verschillen |
| pens | Pens | niet in NEVO |
| zalm-wild | Zalm, wild | niet in NEVO |
| sprot | Sprot | NEVO heeft alleen gerookte sprotfilet |
| gerookte-forel | Forel, gerookt | NEVO heeft geen gerookte forel |
| zeebaars | Zeebaars | niet in NEVO |
| dorade | Dorade | niet in NEVO |
| octopus | Octopus | niet in NEVO |
| verrijkte-eieren | Omega-3 verrijkte eieren | verrijking is een fabrikantkeuze; het etiket is de bron |
| room | Room | kook-, koffie-, zure en slagroom verschillen sterk |
| geitenkaas | Geitenkaas | verse en harde geitenkaas verschillen sterk |
| roomkaas | Roomkaas | NEVO heeft alleen merken |
| plantaardige-drank-verrijkt | Plantaardige drank, verrijkt | verrijking is een fabrikantkeuze; het etiket is de bron |
| sojayoghurt | Sojayoghurt | verrijking is een fabrikantkeuze; het etiket is de bron |
| plantaardige-yoghurt | Plantaardige yoghurt | verrijking is een fabrikantkeuze; het etiket is de bron |
| avocado-olie | Avocado-olie | niet in NEVO |
| algenolie | Algenolie | productspecificatie van de fabrikant |
| amandelpasta | Amandelpasta | niet in NEVO |
| currysaus | Currysaus | niet in NEVO |
| dressing | Slasaus / dressing | NEVO heeft specifieke dressings, geen gemiddelde |
| ontbijtgranen-verrijkt | Ontbijtgranen, verrijkt | verrijking is een fabrikantkeuze; het etiket is de bron |
| pure-chocolade | Pure chocolade 70 % | NEVO geeft geen cacaopercentage; 70% is niet te herleiden |
| snoep | Snoep | NEVO heeft alleen specifieke soorten |
| gebak | Gebak | te generiek |
| linzensoep | Linzensoep | niet in NEVO |
| pompoensoep | Pompoensoep | niet in NEVO |
| champignonsoep | Champignonsoep | niet in NEVO |
| bouillon | Bouillon | NEVO heeft meerdere bereidingen (blokje, kops, pot) |
| curry-maaltijd | Curry met rijst | niet in NEVO |
| pokebowl | Pokébowl | niet in NEVO |
| friet | Friet | niet in NEVO onder deze naam |
| ovenaardappel | Ovenaardappel | niet in NEVO |
| frisdrank | Frisdrank | cola, sinas en light verschillen |
| sportdrank | Sportdrank | NEVO heeft alleen merken |
| wijn | Wijn | rood, wit en rosé verschillen |
| eiwitshake | Eiwitshake | verrijking/merk; het etiket is de bron |

## Zeker op naam (steekproef)

| Sleutel | Label | NEVO-code | NEVO-naam | Score |
|---|---|---|---|---|
| snijbiet-gekookt | Snijbiet, gekookt | 48 | Snijbiet gekookt | 1.20 |
| andijvie-rauw | Andijvie, rauw | 7 | Andijvie rauw | 1.20 |
| andijvie-gekookt | Andijvie, gekookt | 8 | Andijvie gekookt | 1.20 |
| witlof-rauw | Witlof, rauw | 67 | Witlof rauw | 1.20 |
| witlof-gekookt | Witlof, gekookt | 68 | Witlof gekookt | 1.20 |
| broccoli-rauw | Broccoli, rauw | 921 | Broccoli rauw | 1.20 |
| witte-kool-gekookt | Witte kool, gekookt | 70 | Kool witte gekookt | 1.00 |
| paksoi-gekookt | Paksoi, gekookt | 3086 | Paksoi gekookt | 1.20 |
| pastinaak-gekookt | Pastinaak, gekookt | 3128 | Pastinaak gekookt | 1.20 |
| biet-gekookt | Rode biet, gekookt | 958 | Biet rode gekookt | 1.00 |
| radijs | Radijs | 124 | Radijs rauw | 1.17 |
| koolraap-gekookt | Koolraap, gekookt | 29 | Koolraap gekookt | 1.20 |
| courgette-gekookt | Courgette, gekookt | 966 | Courgette gekookt | 1.20 |
| pompoen-gekookt | Pompoen, gekookt | 2113 | Pompoen gekookt | 1.20 |
| prei-gekookt | Prei, gekookt | 37 | Prei gekookt | 1.20 |
| sperziebonen-diepvries | Sperziebonen, diepvries | 954 | Bonen sperzie- diepvries gekookt | 1.17 |
| champignons-gebakken | Champignons, gebakken | 5609 | Champignon gebakken z vet | 1.17 |
| champignons-rauw | Champignons, rauw | 19 | Champignon rauw | 1.20 |
| sinaasappel | Sinaasappel | 171 | Sinaasappel | 1.20 |
| citroen | Citroen | 158 | Citroen | 1.20 |
| limoen | Limoen | 691 | Limoen | 1.20 |
| mango | Mango | 692 | Mango | 1.20 |
| blauwe-bessen | Blauwe bessen | 152 | Bessen blauwe | 1.00 |
| bramen | Bramen | 157 | Bramen | 1.20 |
| nectarine | Nectarine | 1812 | Nectarine | 1.20 |
| granaatappel | Granaatappel | 1007 | Granaatappel | 1.20 |
| vijg-vers | Vijg, vers | 1010 | Vijgen vers | 1.20 |
| rijst-wit-gekookt | Witte rijst, gekookt | 658 | Rijst witte gekookt | 1.00 |
| gierst-gekookt | Gierst, gekookt | 2159 | Gierst gekookt | 1.20 |
| volkoren-pasta-gekookt | Volkoren pasta, gekookt | 2157 | Pasta volkoren gekookt | 1.00 |
| bruine-bonen-gekookt | Bruine bonen, gekookt | 5168 | Bonen bruine gekookt | 1.00 |
| pijnboompitten | Pijnboompitten | 2176 | Pijnboompitten | 1.00 |
| zalm-gerookt | Zalm, gerookt | 1096 | Zalm gerookt | 1.20 |
| kreeft | Kreeft | 352 | Kreeft gekookt | 1.17 |
| kefir | Kefir | 1076 | Kefir | 1.20 |
| parmezaan | Parmezaanse kaas | 718 | Kaas Parmezaanse | 1.00 |
| olijfolie | Olijfolie | 601 | Olie olijf- | 1.20 |
| koolzaadolie | Koolzaadolie | 3449 | Olie koolzaad-/raapzaad- | 1.17 |
| zonnebloemolie | Zonnebloemolie | 317 | Olie zonnebloem- | 1.20 |
| lijnzaadolie | Lijnzaadolie | 3051 | Olie lijnzaad- | 1.20 |
| sesamolie | Sesamolie | 3376 | Olie sesam- | 1.20 |
| kokosolie | Kokosolie | 3243 | Olie kokos- | 1.20 |
| mayonaise | Mayonaise | 451 | Mayonaise | 1.20 |
| sojasaus | Sojasaus | 5470 | Saus soja- | 1.20 |
| teriyakisaus | Teriyakisaus | 5471 | Saus wok- teriyaki | 1.17 |
| chilisaus | Chilisaus | 3343 | Saus chili- | 1.20 |
| honing | Honing | 443 | Honing | 1.20 |
| aardappel-gebakken | Aardappelen, gebakken | 1457 | Aardappelen gebakken | 1.20 |
| zoete-aardappel-gekookt | Zoete aardappel, gekookt | 2112 | Aardappel zoete gekookt | 1.00 |

## Zeker via bron

| Sleutel | Label | NEVO-code | NEVO-naam |
|---|---|---|---|
| spinazie-rauw | Spinazie, rauw | 51 | Spinazie rauw |
| spinazie-gekookt | Spinazie, gekookt | 52 | Spinazie gekookt |
| spinazie-diepvries | Spinazie, diepvries | 1146 | Spinazie gesneden diepvries onbereid |
| broccoli-gekookt | Broccoli, gekookt | 920 | Broccoli gekookt |
| doperwten-diepvries | Doperwten, diepvries | 953 | Doperwten diepvries gekookt |
| avocado | Avocado | 689 | Avocado |
| banaan | Banaan | 151 | Banaan |
| gedroogde-vijgen | Vijgen, gedroogd | 193 | Vijgen gedroogd |
| havermout | Havermout | 213 | Vlokken haver- |
| zilvervliesrijst | Zilvervliesrijst, gekookt | 1014 | Rijst zilvervlies- gekookt |
| quinoa | Quinoa, gekookt | 3154 | Quinoa gekookt |
| quinoa-droog | Quinoa, droog | 3153 | Quinoa rauw |
| volkorenbrood | Volkorenbrood | 246 | Tarwebrood volkoren gem v fijn en grof |
| volkoren-pasta | Volkoren pasta, droog | 811 | Pasta volkoren rauw |
| linzen-gekookt | Linzen, gekookt | 970 | Linzen groene en bruine gekookt |
| linzen-rood-gekookt | Rode linzen, gekookt | 970 | Linzen groene en bruine gekookt |
| linzen-groen-gekookt | Groene linzen, gekookt | 970 | Linzen groene en bruine gekookt |
| linzen-bruin-gekookt | Bruine linzen, gekookt | 970 | Linzen groene en bruine gekookt |
| kidneybonen-gekookt | Kidneybonen, gekookt | 5173 | Bonen kidney- rode gekookt |
| zwarte-bonen-gekookt | Zwarte bonen, gekookt | 5176 | Bonen zwarte blik/glas |
| witte-bonen-gekookt | Witte bonen, gekookt | 5175 | Bonen witte gekookt |
| sojabonen-gekookt | Sojabonen, gekookt | 971 | Bonen soja- gekookt |
| tuinbonen-gekookt | Tuinbonen, gekookt | 962 | Bonen tuin- gekookt |
| erwten-diepvries | Doperwten, diepvries | 953 | Doperwten diepvries gekookt |
| amandelen | Amandelen | 5049 | Noten amandelen m vliesje ongezouten |
| cashewnoten | Cashewnoten | 199 | Noten cashew- ongezouten |
| hazelnoten | Hazelnoten | 200 | Noten hazel- ongezouten |
| pecannoten | Pecannoten | 1895 | Noten pecan- ongebrand ongezouten |
| pistachenoten | Pistachenoten | 5112 | Noten pistache ongezouten |
| macadamia | Macadamianoten | 2844 | Noten macadamia- ongezouten |
| pinda | Pinda's | 204 | Pinda's ongezouten |
| hennepzaad | Hennepzaad, gepeld | 3446 | Hennepzaad |
| sesamzaad | Sesamzaad | 838 | Sesamzaad z schil |
| pompoenzaden | Pompoenpitten | 2806 | Pompoenpitten |
| zonnebloempitten | Zonnebloempitten | 872 | Zonnebloempitten |
| maanzaad | Maanzaad | 2805 | Maanzaad |
| kipfilet | Kipfilet | 1634 | Kipfilet rauw |
| rundvlees-mager | Rundvlees, mager | 1663 | Rundvlees <5 g vet rauw gem |
| biefstuk | Biefstuk | 1400 | Runderbiefstuk rauw |
| rundergehakt | Rundergehakt | 1405 | Gehakt runder- rauw |
| varkenshaas | Varkenshaas | 1422 | Varkenshaas rauw |
| kalfsvlees | Kalfsvlees | 5280 | Kalfsvlees gem rauw |
| lamsvlees | Lamsvlees | 2057 | Lamsvlees <10 g vet rauw gem |
| kippenlever | Kippenlever | 475 | Lever kippen- rauw |
| leverpastei | Leverpastei | 335 | Pastei lever- |
| makreel | Makreel | 353 | Makreel rauw |
| haring | Haring | 113 | Haring pan- rauw |
| sardines-blik | Sardines, uit blik | 355 | Sardines in olie blik |
| forel | Forel | 1611 | Forel bereid in magnetron z toev |
| tonijn-blik | Tonijn uit blik, op water | 1590 | Tonijn in water blik |
| kabeljauw | Kabeljauw | 820 | Kabeljauw rauw |
| paling | Paling | 1624 | Paling bereid in magnetron z toev |
| mosselen | Mosselen | 111 | Mosselen gekookt |
| oesters | Oesters | 354 | Oesters |
| ei-gekookt | Ei, gekookt | 83 | Ei kippen- rauw gem |
| ei-gebakken | Ei, gebakken | 83 | Ei kippen- rauw gem |
| melk-vol | Volle melk | 279 | Melk volle |
| griekse-yoghurt | Griekse yoghurt | 2503 | Yoghurt Griekse volle |
| skyr | Skyr | 5295 | Skyr naturel magere |
| magere-kwark | Magere kwark | 305 | Kwark magere |
| huttenkase | Hüttenkäse | 654 | Kaas huttenkase |
| jonge-kaas | Jonge kaas | 2756 | Kaas Goudse 48+ jong |
| belegen-kaas | Belegen kaas | 2758 | Kaas Goudse 48+ belegen |
| mozzarella | Mozzarella | 1955 | Kaas Mozzarella gemaakt v koemelk |
| feta | Feta | 3362 | Kaas Feta |
| sojadrink-verrijkt | Sojadrink, verrijkt | 3180 | Drink soja- z suiker verrijkt m calcium en vitamines |
| tofu | Tofu | 5519 | Tofu onbereid |
| tempe | Tempé | 5573 | Tempeh onbereid |
| seitan | Seitan | 1458 | Seitan gekruid |
| halvarine | Halvarine | 2566 | Halvarine 40% vet <17g verz vetz ongezouten |
| tahin | Tahin (sesampasta) | 1461 | Pasta sesam- tahin m toegevoegd zout |
