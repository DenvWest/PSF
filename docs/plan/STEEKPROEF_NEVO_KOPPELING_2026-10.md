# Steekproef: koppeling FOOD_CATALOG ↔ NEVO 2025/9.0

Gegenereerd door `scripts/nevo-koppel.mjs` (deterministisch). Voorstellen op naam; de beoordeling is aan Dennis. Zekere koppelingen staan in `src/data/nutrition/food-catalog-nevo.ts`.

- Catalogusregels: 371
- Zeker via `bron` (FOOD_SOURCES-rij uit NEVO): 71
- Zeker via `naam` (één sterke kandidaat): 49
- **Onzeker (te beoordelen): 159**
- Geen kandidaat: 92

## Onzeker: beoordelen

Kies per regel de code, of laat de regel zonder NEVO-koppeling. Een goede koppeling kan in `scripts/nevo-koppel.mjs` als handmatige uitzondering of direct in het TS-bestand worden vastgelegd (en overleeft dan niet een nieuwe run: zet hem dan in `HANDMATIG`).

| Sleutel | Label | Reden | Kandidaten (code · naam · score) |
|---|---|---|---|
| rucola | Rucola | NEVO-naam draagt extra kenmerken: sla, rauw | 2736 · Sla rucola rauw · 0.94 |
| spruitjes-gekookt | Spruitjes, gekookt | marge 0.03 < 0.15 | 55 · Spruitjes gekookt · 1.20<br>1147 · Spruitjes diepvries gekookt · 1.17 |
| zuurkool | Zuurkool | NEVO-naam draagt extra kenmerken: sap | 1657 · Sap zuurkool- · 0.97<br>1486 · Stamppot zuurkool z vlees bereid · 0.56 |
| wortel-rauw | Wortel, rauw | marge 0.00 < 0.15 | 71 · Wortel rauw gem · 1.17<br>2726 · Wortel bospeen rauw · 1.17<br>2728 · Wortel winterpeen rauw · 1.17 |
| wortel-gekookt | Wortel, gekookt | marge 0.00 < 0.15 | 72 · Wortel gekookt gem · 1.17<br>2727 · Wortel bospeen gekookt · 1.17<br>2729 · Wortel winterpeen gekookt · 1.17 |
| tomaat | Tomaat | marge 0.00 < 0.15 | 2293 · Tomaat in blik · 1.17<br>1397 · Tomaat gestoofd · 1.17<br>2378 · Tomaat zongedroogd · 1.17 |
| tomaat-blik | Tomaten, uit blik | beste score 0.61 < 0.9 | 878 · Croissants uit blik afgebakken · 0.61<br>141 · Puree tomaten- geconcentreerd blik · 0.61 |
| paprika-rauw | Paprika, rauw | marge 0.00 < 0.15 | 2742 · Paprika rauw gem · 1.17<br>884 · Paprika rode rauw · 1.17<br>2740 · Paprika gele rauw · 1.17 |
| komkommer | Komkommer | marge 0.03 < 0.15 | 28 · Komkommer gekookt · 1.17<br>27 · Komkommer z schil rauw · 1.14<br>2739 · Komkommer m schil rauw · 1.14 |
| ui-rauw | Ui, rauw | marge 0.03 < 0.15 | 63 · Ui rauw · 1.20<br>2737 · Ui sla- rauw · 1.17<br>5459 · Ui rode rauw · 1.17 |
| ui-gebakken | Ui, gebakken | NEVO-naam draagt extra kenmerken: plantaardig, olie | 1393 · Ui gebakken in plantaardige olie · 1.14 |
| knoflook | Knoflook | marge 0.03 < 0.15 | 830 · Knoflook rauw · 1.17<br>5330 · Knoflook bereid z vet · 1.14<br>2573 · Saus knoflook- 20-<30% olie · 0.53 |
| mais-blik | Maïs, uit blik | beste score 0.84 < 0.9 | 2900 · Mais blik/glas · 0.84<br>878 · Croissants uit blik afgebakken · 0.61 |
| sperziebonen-gekookt | Sperziebonen, gekookt | marge 0.03 < 0.15 | 951 · Bonen sperzie- gekookt · 1.20<br>954 · Bonen sperzie- diepvries gekookt · 1.17<br>50 · Bonen sperzie- rauw · 0.67 |
| zeewier-nori | Nori (zeewier) | NEVO-naam draagt extra kenmerken: gedroogd | 3227 · Zeewier nori gedroogd · 0.97 |
| appel | Appel | NEVO-naam draagt extra kenmerken: schil, gem | 147 · Appel z schil gem · 1.14<br>875 · Appel m schil gem · 1.14<br>2751 · Appel Elstar m schil · 1.14 |
| peer | Peer | marge 0.00 < 0.15 | 168 · Peer z schil · 1.17<br>2748 · Peer m schil · 1.17 |
| mandarijn | Mandarijn | marge 0.09 < 0.15 | 165 · Mandarijn · 1.20<br>186 · Mandarijnen op siroop blik/glas · 1.11 |
| grapefruit | Grapefruit | marge 0.09 < 0.15 | 162 · Grapefruit · 1.20<br>848 · Grapefruit op siroop blik/glas · 1.11<br>664 · Sap grapefruit- · 0.97 |
| kiwi | Kiwi | marge 0.00 < 0.15 | 5120 · Kiwi gem · 1.17<br>3219 · Kiwi gele · 1.17<br>1056 · Kiwi groene · 1.17 |
| ananas | Ananas | marge 0.09 < 0.15 | 150 · Ananas · 1.20<br>177 · Ananas op siroop blik/glas · 1.11<br>2843 · Ananas op eigen sap blik/glas · 1.08 |
| druiven | Druiven | NEVO-naam draagt extra kenmerken: schil, gem | 160 · Druiven m schil gem · 1.14<br>2750 · Druiven witte m schil · 1.14<br>2749 · Druiven blauwe m schil · 1.14 |
| aardbeien | Aardbeien | marge 0.09 < 0.15 | 148 · Aardbeien · 1.20<br>174 · Aardbeien op siroop blik/glas · 1.11 |
| frambozen | Frambozen | marge 0.09 < 0.15 | 161 · Frambozen · 1.20<br>182 · Frambozen op siroop blik/glas · 1.11<br>399 · Vruchtendrank frambozen · 0.97 |
| kersen | Kersen | marge 0.00 < 0.15 | 167 · Kersen zure · 1.17<br>163 · Kersen zoete · 1.17<br>184 · Kersen op siroop blik/glas · 1.11 |
| perzik | Perzik | marge 0.00 < 0.15 | 169 · Perzik z schil · 1.17<br>5079 · Perzik m schil · 1.17<br>189 · Perziken op siroop blik/glas · 1.11 |
| pruim | Pruim | marge 0.00 < 0.15 | 170 · Pruimen m schil · 1.17<br>190 · Pruimen gedroogd · 1.17<br>2956 · Pruimen gedroogd geweekt · 1.14 |
| meloen | Meloen | marge 0.00 < 0.15 | 5369 · Meloen gem · 1.17<br>166 · Meloen net- · 1.17<br>1105 · Meloen water- · 1.17 |
| dadels | Dadels | marge 0.00 < 0.15 | 1887 · Dadels vers · 1.17<br>181 · Dadels gedroogd · 1.17 |
| rozijnen | Rozijnen | marge 0.03 < 0.15 | 33 · Rozijnen gedroogd · 1.17<br>2379 · Rozijnen gedroogd geweekt · 1.14<br>2393 · Cake rozijnen- · 0.97 |
| abrikoos-gedroogd | Abrikozen, gedroogd | marge 0.03 < 0.15 | 175 · Abrikozen gedroogd · 1.20<br>2685 · Abrikozen gedroogd geweekt · 1.17 |
| pruimen-gedroogd | Pruimen, gedroogd | marge 0.03 < 0.15 | 190 · Pruimen gedroogd · 1.20<br>2956 · Pruimen gedroogd geweekt · 1.17 |
| appelmoes | Appelmoes | NEVO-naam draagt extra kenmerken: blik, glas | 179 · Appelmoes blik/glas · 1.14<br>1182 · Appelmoes z suiker blik/glas · 0.76<br>2686 · Appelmoes z suiker m zoetstof blik/glas · 0.73 |
| basmatirijst-gekookt | Basmatirijst, gekookt | beste score 0.67 < 0.9 | 658 · Rijst witte gekookt · 0.67<br>2682 · Rijst meergranen- gekookt · 0.67<br>1014 · Rijst zilvervlies- gekookt · 0.67 |
| wilde-rijst-gekookt | Wilde rijst, gekookt | beste score 0.64 < 0.9 | 658 · Rijst witte gekookt · 0.64<br>2682 · Rijst meergranen- gekookt · 0.64<br>1014 · Rijst zilvervlies- gekookt · 0.64 |
| bulgur-gekookt | Bulgur, gekookt | NEVO-naam draagt extra kenmerken: tarw, gebrok | 3200 · Tarwe gebroken bulgur gekookt · 0.94 |
| couscous-gekookt | Couscous, gekookt | marge 0.03 < 0.15 | 2158 · Couscous gekookt · 1.20<br>5539 · Couscous volkoren gekookt · 1.17 |
| witbrood | Witbrood | NEVO-naam draagt extra kenmerken: broodj, gezond, v | 5352 · Broodje gezond v witbrood · 0.91<br>5598 · Bakmix voor brood wit glutenvrij · 0.91<br>2793 · Tarwestokbrood wit · 0.87 |
| meergranenbrood | Meergranenbrood | NEVO-naam draagt extra kenmerken: wit, zad | 2783 · Meergranenbrood wit m zaden · 0.94<br>2784 · Meergranenbrood bruin m zaden  · 0.94<br>5599 · Bakmix voor brood bruin/meergranen glutenvrij · 0.88 |
| roggebrood | Roggebrood | NEVO-naam draagt extra kenmerken: volkor | 242 · Roggebrood volkoren · 0.97<br>1011 · Roggebrood volkoren natriumarm · 0.94<br>1395 · Roggebrood volkoren/roggetarwebrood bruin gem · 0.88 |
| zuurdesembrood | Zuurdesembrood | NEVO-naam draagt extra kenmerken: glutenvrij | 5414 · Glutenvrij brood zuurdesem · 0.97 |
| stokbrood | Stokbrood | beste score 0.74 < 0.9 | 2793 · Tarwestokbrood wit · 0.74<br>2794 · Tarwestokbrood bruin · 0.74<br>2356 · Tarwestokbrood wit m kaas en uien · 0.68 |
| tortilla-wrap | Tortilla / wrap | NEVO-naam draagt extra kenmerken: obv, tarw, naturel | 2359 · Wrap/tortilla obv tarwe naturel · 0.91<br>5482 · Wrap/tortilla obv tarwe volkoren · 0.91<br>5591 · Wrap/tortilla obv tarwe en wortel · 0.91 |
| croissant | Croissant | marge 0.00 < 0.15 | 2818 · Croissant gem · 1.17<br>2830 · Croissant kaas- · 1.17<br>2400 · Croissant chocolade- · 1.17 |
| crackers-volkoren | Volkoren crackers | NEVO-naam draagt extra kenmerken: luchtig | 5567 · Cracker luchtige volkoren · 0.97 |
| knackebrod | Knäckebröd | marge 0.00 < 0.15 | 229 · Knackebrod gem · 1.17<br>975 · Knackebrod sesam · 1.17<br>1779 · Knackebrod volkoren · 1.17 |
| beschuit | Beschuit | marge 0.00 < 0.15 | 227 · Beschuit naturel · 1.17<br>5106 · Beschuit boeren- · 1.17<br>1022 · Beschuit natriumarm · 1.17 |
| pasta-wit-gekookt | Pasta, gekookt | marge 0.00 < 0.15 | 2157 · Pasta volkoren gekookt · 1.17<br>3250 · Pasta glutenvrij gekookt · 1.17<br>659 · Pasta witte gem gekookt · 1.14 |
| kikkererwten-blik | Kikkererwten, uit blik | beste score 0.61 < 0.9 | 878 · Croissants uit blik afgebakken · 0.61 |
| linzen-blik | Linzen, uit blik | beste score 0.81 < 0.9 | 5169 · Linzen bruine blik/glas · 0.81<br>5429 · Linzen blik/glas geen zout toegevoegd · 0.75<br>878 · Croissants uit blik afgebakken · 0.61 |
| kidneybonen-blik | Kidneybonen, uit blik | beste score 0.81 < 0.9 | 3184 · Bonen kidney- rode blik/glas · 0.81<br>5431 · Bonen kidney- rode blik/glas geen zout toegevoegd · 0.72<br>878 · Croissants uit blik afgebakken · 0.61 |
| cannellinibonen-blik | Cannellinibonen, uit blik | beste score 0.84 < 0.9 | 5170 · Bonen cannellini blik/glas · 0.84<br>878 · Croissants uit blik afgebakken · 0.61 |
| kapucijners | Kapucijners | marge 0.00 < 0.15 | 969 · Kapucijners gekookt · 1.17<br>119 · Kapucijners gedroogd · 1.17<br>196 · Kapucijners blik/glas · 1.14 |
| walnoten | Walnoten | marge 0.00 < 0.15 | 5110 · Noten wal- gezouten · 1.17<br>206 · Noten wal- ongezouten · 1.17 |
| paranoten | Paranoten | marge 0.00 < 0.15 | 5050 · Noten para- gezouten · 1.17<br>203 · Noten para- ongezouten · 1.17 |
| chiazaad | Chiazaad | NEVO-naam draagt extra kenmerken: gedroogd | 3447 · Chiazaad gedroogd · 0.97 |
| lijnzaad | Lijnzaad, gemalen | beste score 0.50 < 0.9 | 867 · Lijnzaad · 0.50 |
| kalkoenfilet | Kalkoenfilet | marge 0.00 < 0.15 | 1936 · Kalkoenfilet rauw · 1.17<br>3001 · Kalkoenfilet (vleeswaar) · 1.17 |
| half-om-half-gehakt | Half-om-half gehakt | beste score 0.63 < 0.9 | 2334 · Gehaktbal half-om-half m ei en paneermeel rauw · 0.63 |
| varkenskarbonade | Karbonade | beste score 0.74 < 0.9 | 1445 · Lamskarbonade rauw · 0.74<br>1577 · Lamskarbonade bereid · 0.74<br>1788 · Varkensribkarbonade rauw · 0.74 |
| schnitzel | Schnitzel | NEVO-naam draagt extra kenmerken: burger, vegetarisch, obv, melk, onbereid, verrijkt, ijzer | 5565 · Schnitzel/burger vegetarisch obv melk onbereid verrijkt m ijzer · 0.99<br>3040 · Schnitzel vegetarisch obv melk gevuld m kaas onbereid verrijkt m ijzer · 0.96<br>1512 · Schnitzel vegetarisch obv soja/tarwe onbereid verrijkt m ijzer en vit B12  · 0.93 |
| konijn | Konijn | NEVO-naam draagt extra kenmerken: tam, rauw | 109 · Konijn tam rauw · 1.14<br>110 · Konijn wild rauw · 1.14 |
| wild | Wild (hert, ree) | beste score 0.64 < 0.9 | 339 · Ree wild rauw · 0.64 |
| hamburger | Hamburger | marge 0.00 < 0.15 | 1435 · Hamburger rauw · 1.17<br>1569 · Hamburger bereid · 1.17<br>5355 · Broodje hamburger huishoudelijk bereid · 0.91 |
| worst | Worst | marge 0.03 < 0.15 | 5165 · Worst met- · 1.20<br>782 · Worst thee- · 1.17<br>568 · Worst bloed- · 1.17 |
| ham | Ham | marge 0.00 < 0.15 | 328 · Ham rauwe · 1.17<br>1777 · Ham been- · 1.17<br>784 · Ham achter- · 1.17 |
| rosbief | Rosbief | beste score 0.74 < 0.9 | 1410 · Runderrosbief rauw · 0.74<br>1545 · Runderrosbief bereid · 0.74<br>3345 · Runderrosbief (vleeswaar) · 0.74 |
| salami | Salami | NEVO-naam draagt extra kenmerken: worst | 1152 · Worst salami · 0.97<br>2945 · Pizza salami diepvries onbereid · 0.56 |
| nier | Nier | NEVO-naam draagt extra kenmerken: lams, rauw | 1903 · Nier lams- rauw · 1.14<br>1902 · Nier runder- rauw · 1.14<br>1901 · Nier varkens- rauw · 1.14 |
| tong | Tong | NEVO-naam draagt extra kenmerken: rauw, vis | 2298 · Tong rauw (vis) · 1.14<br>1619 · Tong bereid in magnetron z toev · 1.11<br>1774 · Worst tongen- · 0.97 |
| zalm-blik | Zalm, uit blik | beste score 0.87 < 0.9 | 602 · Zalm blik · 0.87<br>878 · Croissants uit blik afgebakken · 0.61 |
| ansjovis | Ansjovis | marge 0.03 < 0.15 | 3199 · Ansjovis rauw · 1.17<br>1588 · Ansjovis in olie blik · 1.14 |
| koolvis | Koolvis | NEVO-naam draagt extra kenmerken: alaska, rauw | 3318 · Koolvis (Alaska) rauw · 1.14<br>2296 · Koolvis (Atlantisch) rauw · 1.14<br>3319 · Koolvis (Alaska) gestoomd · 1.14 |
| schelvis | Schelvis | NEVO-naam draagt extra kenmerken: bereid, magnetron, toev | 1614 · Schelvis bereid in magnetron z toev · 1.11<br>356 · Lever schelvis- blik · 0.94 |
| schol | Schol | marge 0.00 < 0.15 | 813 · Schol rauw · 1.17<br>918 · Schol gekookt · 1.17<br>817 · Schol gebakken · 1.17 |
| pangasius | Pangasius | marge 0.06 < 0.15 | 3322 · Pangasius rauw · 1.17<br>2765 · Pangasius bereid in magnetron z toev · 1.11 |
| vissticks | Vissticks | marge 0.03 < 0.15 | 815 · Vissticks onbereid · 1.17<br>814 · Vissticks gebakken in zonnebloemolie · 1.14<br>5550 · Vissticks vegetarisch obv rijst/tarwe onbereid · 1.05 |
| garnalen | Garnalen | marge 0.03 < 0.15 | 5602 · Garnalen gemarineerde · 1.17<br>3320 · Garnalen roze gekookt · 1.14<br>1631 · Garnalen in water blik · 1.14 |
| krab | Krab | NEVO-naam draagt extra kenmerken: water, blik | 351 · Krab in water blik · 1.14<br>3232 · Salade krab- lunch/borrel · 0.91 |
| inktvis | Inktvis | marge 0.09 < 0.15 | 1098 · Inktvis rauw · 1.17<br>1632 · Inktvis pijl- bereid in magnetron z toev · 1.08 |
| roerei | Roerei | geenBron: samengesteld | 5321 · Omelet/roerei · 0.97 |
| omelet | Omelet | geenBron: samengesteld | 5321 · Omelet/roerei · 1.17<br>5322 · Omelet ham-kaas · 1.14<br>5323 · Omelet m aardappel Spaanse tortilla · 1.11 |
| melk-halfvol | Halfvolle melk | geenBron: verrijkt | 286 · Melk halfvolle · 1.00<br>285 · Melk koffie- halfvolle · 0.97<br>1464 · Melk chocolade- halfvolle · 0.97 |
| melk-mager | Magere melk | geenBron: verrijkt | 294 · Melk magere · 1.00<br>292 · Melk koffie- magere · 0.97<br>273 · Melk chocolade- magere · 0.97 |
| karnemelk | Karnemelk | marge 0.03 < 0.15 | 289 · Melk karne- · 1.20<br>479 · Melk karne- m vruchten · 1.17 |
| yoghurt-vol | Volle yoghurt | marge 0.03 < 0.15 | 278 · Yoghurt volle · 1.00<br>2503 · Yoghurt Griekse volle · 0.97<br>5339 · Yoghurt geiten- volle · 0.97 |
| yoghurt-mager | Magere yoghurt | marge 0.03 < 0.15 | 301 · Yoghurt magere · 1.00<br>5271 · Yoghurt Griekse magere · 0.97<br>284 · Yoghurt vruchten- magere · 0.97 |
| volle-kwark | Volle kwark | marge 0.03 < 0.15 | 307 · Kwark volle · 1.00<br>2504 · Kwark vruchten- volle · 0.97 |
| creme-fraiche | Crème fraîche | marge 0.03 < 0.15 | 1808 · Creme fraiche · 1.20<br>2268 · Creme fraiche halfvolle · 1.17 |
| room | Room | marge 0.00 < 0.15 | 812 · Room zure · 1.17<br>2275 · Room kook- · 1.17<br>293 · Room koffie- · 1.17 |
| slagroom | Slagroom | NEVO-naam draagt extra kenmerken: vla | 1957 · Vla slagroom- · 0.97<br>1475 · Soes slagroom- · 0.97<br>255 · Taart slagroom- · 0.97 |
| boter | Roomboter | NEVO-naam draagt extra kenmerken: cake | 253 · Cake z roomboter · 0.97<br>1969 · Cake m roomboter · 0.97<br>262 · Sprits m roomboter · 0.97 |
| magere-kaas | Magere kaas (20+/30+) | beste score 0.50 < 0.9 | 1723 · Kaas 20+ · 0.50 |
| geitenkaas | Geitenkaas | marge 0.00 < 0.15 | 2518 · Kaas geiten- hard · 1.17<br>1650 · Kaas geiten- verse · 1.17<br>3045 · Kaas schapen-/geiten- Turkse 50+ blik · 1.08 |
| schapenkaas | Schapenkaas | marge 0.09 < 0.15 | 804 · Kaas schapen- vers · 1.17<br>3045 · Kaas schapen-/geiten- Turkse 50+ blik · 1.08 |
| roomkaas | Roomkaas | NEVO-naam draagt extra kenmerken: zacht, boursin | 728 · Kaas room- zachte Boursin · 1.14<br>1302 · Kaas room- zachte Paturain · 1.14<br>719 · Kaas room- zachte Mon Chou · 1.11 |
| smeerkaas | Smeerkaas | marge 0.00 < 0.15 | 516 · Kaas smeer- 40+ · 1.17<br>517 · Kaas smeer- 20+ · 1.17<br>2995 · Kaas smeer- 45+ · 1.17 |
| sojadrink-onverrijkt | Sojadrink, onverrijkt | beste score 0.58 < 0.9 | 2261 · Drink soja- Groeidrink 1-3+ Alpro · 0.58<br>2858 · Drink soja- light verrijkt m calcium en vitamines Alpro · 0.55 |
| havermelk | Havermelk | geenBron: verrijkt | 5463 · Drink haver- z suiker · 0.82<br>5427 · Drink haver- z suiker verrijkt m calcium en vitamines · 0.73<br>2261 · Drink soja- Groeidrink 1-3+ Alpro · 0.55 |
| amandeldrink | Amandeldrink | geenBron: verrijkt | 5464 · Drink amandel- z suiker · 0.82<br>5116 · Drink amandel- m suiker verrijkt m calcium en vitamines · 0.73<br>5119 · Drink amandel- z suiker verrijkt m calcium en vitamines · 0.73 |
| kokosdrink | Kokosdrink | geenBron: verrijkt | 5543 · Drink kokos- z suiker · 0.82<br>5474 · Drink kokos- m suiker verrijkt m calcium en vitamines · 0.73 |
| rijstdrink | Rijstdrink | geenBron: verrijkt | 5101 · Drink rijst- z suiker · 0.82<br>2433 · Drink rijst- z suiker verrijkt m calcium en vitamines · 0.73 |
| plantaardige-drank-verrijkt | Plantaardige drank, verrijkt | beste score 0.60 < 0.9 | 5466 · Plantaardig alternatief voor Goudse kaas obv kokosolie verrijkt m Ca en Vit B12 · 0.60<br>3364 · Yoghurtdrank verrijkt m calcium · 0.54 |
| sojayoghurt | Sojayoghurt | geenBron: verrijkt | 2262 · Plantaardig alternatief voor room obv soja · 0.86<br>3176 · Plantaardig alternatief voor room obv soja Alpro Cuisine Light · 0.77<br>2888 · Plantaardig alternatief voor yoghurt obv soja m suiker verrijkt m calcium en vitamines · 0.67 |
| plantaardige-yoghurt | Plantaardige yoghurt | geenBron: verrijkt | 5545 · Plantaardig alternatief voor yoghurt obv kokos z suiker · 0.70<br>2888 · Plantaardig alternatief voor yoghurt obv soja m suiker verrijkt m calcium en vitamines · 0.61<br>5247 · Plantaardig alternatief voor yoghurt obv soja z suiker verrijkt m calcium en vitamines · 0.61 |
| vegan-gehakt | Vegetarisch gehakt | geenBron: verrijkt | 2047 · Gehakt fijn- vegetarisch obv soja onbereid · 0.88<br>2030 · Gehakt fijn- vegetarisch obv mycoproteine onbereid · 0.88<br>5561 · Gehakt rul vegetarisch obv soja onbereid verrijkt m ijzer en vit B12 · 0.76 |
| vegan-burger | Vegetarische burger | geenBron: verrijkt | 5552 · Balletjes/burgers vegetarisch obv erwt onbereid · 0.88<br>5566 · Burger vegetarisch gevuld m groente en kaas onbereid · 0.88<br>5553 · Groenteballetjes/-burgers vegetarisch obv soja onbereid · 0.88 |
| vegan-worst | Vegetarische worst | geenBron: verrijkt | 5478 · Worst boterham- vegetarisch · 0.97<br>5563 · Worst braad- vegetarisch obv erwt onbereid · 0.88<br>2541 · Worst boterham- vegetarisch verrijkt m ijzer en vit B12 · 0.85 |
| vleesvervanger-stukjes | Vegetarische stukjes | geenBron: verrijkt | 2031 · Stukjes vegetarisch obv mycoproteine onbereid · 0.91<br>5485 · Reepjes/stukjes vegetarisch obv soja/tarwe onbereid · 0.85<br>5554 · Reepjes/stukjes vegetarisch obv soja/tarwe onbereid verrijkt m ijzer en vit B12 · 0.73 |
| olijfolie-ev | Olijfolie, extra vierge | beste score 0.53 < 0.9 | 601 · Olie olijf- · 0.53 |
| margarine | Margarine | geenBron: verrijkt | 2063 · Margarine 80% vet >24 g verz vetz gezouten · 0.99<br>2557 · Margarine 80% vet >24 g verz vetz ongezouten · 0.99<br>2565 · Margarine 80% vet <24 g verz vetz ongezouten · 0.99 |
| pindakaas | Pindakaas | marge 0.03 < 0.15 | 455 · Pindakaas · 1.00<br>2367 · Pindakaas light · 0.97<br>541 · Pindakaas m stukjes pinda · 0.97 |
| hummus | Hummus | geenBron: samengesteld | 3207 · Hummus naturel · 1.17<br>5467 · Hummus m groente · 1.17 |
| ketchup | Ketchup | marge 0.00 < 0.15 | 584 · Ketchup curry- · 1.17<br>462 · Ketchup tomaten- · 1.17<br>583 · Ketchup hot chilli · 1.14 |
| mosterd | Mosterd | marge 0.03 < 0.15 | 824 · Mosterd · 1.20<br>1227 · Mosterd natriumarm · 1.17<br>2468 · Dressing honing/mosterd- · 0.94 |
| pesto | Pesto | marge 0.00 < 0.15 | 3222 · Pesto rode · 1.17<br>2178 · Pesto groene · 1.17 |
| tomatensaus | Tomatensaus | NEVO-naam draagt extra kenmerken: kant, klaar, glas | 1524 · Saus tomaten- kant-en-klaar glas · 1.11<br>349 · Haringfilet in tomatensaus blik · 0.94<br>5265 · Tonijn m groente en tomatensaus in blik · 0.91 |
| sambal | Sambal | marge 0.00 < 0.15 | 1232 · Sambal oelek · 1.17<br>1234 · Sambal gebakken · 1.17<br>1233 · Sambal oelek natriumarm · 1.14 |
| dressing | Slasaus / dressing | beste score 0.66 < 0.9 | 2667 · Dressing sla- 20% olie m yoghurt · 0.66<br>458 · Saus sla- 25% olie · 0.64 |
| muesli | Muesli | geenBron: samengesteld | 2809 · Muesli m fruit/naturel · 1.14<br>2675 · Muesli krokante m noten · 1.14<br>5592 · Muesli m fruit en noten · 1.14 |
| cornflakes | Cornflakes | NEVO-naam draagt extra kenmerken: ontbijtproduct | 2081 · Ontbijtproduct Cornflakes · 0.97<br>209 · Ontbijtproduct Cornflakes Kellogg's · 0.91<br>5126 · Ontbijtproduct Cornflakes Plus/1 de Beste · 0.88 |
| ontbijtgranen-volkoren | Volkoren ontbijtgranen | beste score 0.67 < 0.9 | 225 · Volkoren graanontbijt · 0.67<br>2081 · Ontbijtproduct Cornflakes · 0.67<br>2877 · Ontbijtproduct Weetabix original · 0.64 |
| ontbijtkoek | Ontbijtkoek | marge 0.03 < 0.15 | 240 · Koek ontbijt- · 1.20<br>1460 · Koek ontbijt- gember · 1.17<br>2397 · Koek ontbijt- m noten · 1.17 |
| jam | Jam | marge 0.09 < 0.15 | 445 · Jam · 1.20<br>457 · Jam rozenbottel- m vit C · 1.11 |
| hagelslag | Hagelslag | marge 0.03 < 0.15 | 442 · Hagelslag vruchten- · 1.17<br>1311 · Hagelslag chocolade- gem · 1.14<br>2424 · Hagelslag chocolade- wit · 1.14 |
| popcorn | Popcorn | NEVO-naam draagt extra kenmerken: zoet, gepoft, olie | 2387 · Popcorn zoete gepoft z olie · 1.11<br>3235 · Popcorn zoute gepoft z olie · 1.11<br>630 · Popcorn naturel gepoft z olie · 1.11 |
| chips | Chips | marge 0.00 < 0.15 | 122 · Chips gem · 1.17<br>2529 · Chips oven- · 1.17<br>2923 · Chips naturel · 1.17 |
| koek | Koekje | marge 0.00 < 0.15 | 258 · Koekje gem · 1.17<br>836 · Koekje zand- · 1.17<br>1699 · Koekje kaas- · 1.17 |
| melkchocolade | Melkchocolade | beste score 0.56 < 0.9 | 3378 · Pinda's omhuld m melkchocolade · 0.56 |
| snoep | Snoep | NEVO-naam draagt extra kenmerken: schuim, gum | 2659 · Snoep schuim-/gum- · 1.14 |
| ijs | IJs | marge 0.00 < 0.15 | 1474 · IJs water- · 1.17<br>2250 · IJs Festini · 1.17<br>3369 · IJs sorbet- · 1.17 |
| proteinereep | Proteïnereep | geenBron: verrijkt | 5507 · Eiwitreep m pinda · 1.17<br>5508 · Eiwitreep m chocola m zoetstof · 1.14 |
| mueslireep | Mueslireep | geenBron: samengesteld | 2239 · Mueslireep · 1.20<br>1509 · Mueslireep m chocolade · 1.17<br>5512 · Mueslireep verrijkt m vezel · 1.14 |
| gebak | Gebak | beste score 0.68 < 0.9 | 2009 · Taart vruchten- v zandgebak · 0.68 |
| groentesoep | Groentesoep | geenBron: samengesteld | 2488 · Soep op groente- en vleesbasis bereid pakje · 1.11<br>759 · Soep heldere m soepgroente · 1.04<br>763 · Soep gebonden m soepgroente · 1.04 |
| tomatensoep | Tomatensoep | geenBron: samengesteld | 5062 · Soep tomaten- m vermicelli · 1.17 |
| erwtensoep | Erwtensoep | geenBron: samengesteld | 5177 · Soep erwten- m vlees · 1.17 |
| bouillon | Bouillon | NEVO-naam draagt extra kenmerken: 1, kops, bereid | 3192 · Bouillon 1-kops bereid · 1.11<br>1528 · Bouillon v blokje bereid · 1.11<br>5499 · Bouillon geconcentreerd m groente of vlees pot · 1.08 |
| pizza | Pizza | geenBron: samengesteld | 5437 · Pizza quattro formaggi · 1.14<br>3042 · Pizza Turkse z toevoegingen · 1.14<br>5432 · Pizza m mozzarella Margherita · 1.14 |
| lasagne | Lasagne | geenBron: samengesteld | 1491 · Lasagne bolognese koelverse maaltijd · 0.76<br>5458 · Lasagne groenten- koelverse maaltijd · 0.76 |
| nasi | Nasi goreng | geenBron: samengesteld | 471 · Nasi goreng m ei · 1.17 |
| bami | Bami goreng | geenBron: samengesteld | 470 · Bami goreng z ei · 1.17 |
| stamppot | Stamppot | geenBron: samengesteld | 1486 · Stamppot zuurkool z vlees bereid · 1.11<br>1483 · Stamppot boerenkool z vlees bereid · 1.11<br>5401 · Stamppot boerenkool m rookworst en spekjes · 1.11 |
| burrito | Burrito | geenBron: samengesteld | 5457 · Burrito m gehakt · 1.17 |
| quiche | Quiche | geenBron: samengesteld | 5398 · Quiche Lorraine · 1.17 |
| aardappel-gekookt | Aardappelen, gekookt | marge 0.03 < 0.15 | 2112 · Aardappel zoete gekookt · 1.17<br>982 · Aardappelen z schil gekookt gem · 1.14<br>2325 · Aardappelen m schil gekookt gem · 1.14 |
| aardappelpuree | Aardappelpuree | NEVO-naam draagt extra kenmerken: instant, gem, bereid | 737 · Aardappelpuree instant- gem bereid · 1.11<br>2323 · Aardappelpuree instant- bereid m water · 1.11<br>2322 · Aardappelpuree instant- bereid m halfvolle melk · 1.08 |
| water | Water | marge 0.12 < 0.15 | 1885 · Water gem · 1.17<br>600 · Water >100 mg calcium p liter · 1.05<br>598 · Water 0-50 mg calcium p liter · 1.02 |
| koffie | Koffie | marge 0.03 < 0.15 | 644 · Koffie bereid · 1.17<br>2633 · Koffie oplos- poeder · 1.14<br>2648 · Koffie automaat- m melk · 1.14 |
| thee | Thee | marge 0.09 < 0.15 | 645 · Thee bereid · 1.17<br>2444 · Thee kruiden- oplos gezoet bereid · 1.08<br>2649 · Thee kruiden- oplos gezoet poeder · 1.08 |
| sinaasappelsap | Sinaasappelsap | marge 0.00 < 0.15 | 1932 · Sap sinaasappel- m vruchtvlees · 1.17<br>410 · Sap sinaasappel- gepasteuriseerd · 1.17<br>2755 · Sap sinaasappel- vers geperst · 1.14 |
| appelsap | Appelsap | marge 0.09 < 0.15 | 383 · Sap appel- · 1.20<br>2144 · Sap appel- verrijkt m vit C · 1.11<br>1932 · Sap sinaasappel- m vruchtvlees · 1.04 |
| groentesap | Groentesap | marge 0.03 < 0.15 | 1132 · Sap tomatengroenten- · 1.07<br>1156 · Sap tomatengroenten- natriumarm · 1.04<br>1933 · Sap tomatengroenten- Appelsientje Tomatientje · 1.01 |
| frisdrank | Frisdrank | NEVO-naam draagt extra kenmerken: rivella | 425 · Frisdrank Rivella · 0.97<br>1522 · Frisdrank light z cafeine · 0.94<br>1523 · Frisdrank light m cafeine · 0.94 |
| frisdrank-light | Frisdrank, light / zero | beste score 0.64 < 0.9 | 1522 · Frisdrank light z cafeine · 0.64<br>1523 · Frisdrank light m cafeine · 0.64 |
| chocolademelk | Chocolademelk | marge 0.00 < 0.15 | 272 · Melk chocolade- volle · 1.17<br>273 · Melk chocolade- magere · 1.17<br>2760 · Melk chocolade- automaat · 1.17 |
| sportdrank | Sportdrank | NEVO-naam draagt extra kenmerken: aquariu | 2646 · Sportdrank Aquarius · 0.97<br>2219 · Sportdrank Extran Hydro · 0.94<br>2218 · Sportdrank Extran Energy · 0.94 |
| bier | Bier | marge 0.00 < 0.15 | 3214 · Bier wit · 1.17<br>390 · Bier pils · 1.17<br>3268 · Bier bok- · 1.17 |
| wijn | Wijn | marge 0.00 < 0.15 | 422 · Wijn rode · 1.17<br>2610 · Wijn rose · 1.17<br>5246 · Wijn alcoholvrij · 1.17 |

## Geen kandidaat

| Sleutel | Label |
|---|---|
| boerenkool-gekookt | Boerenkool, gekookt |
| boerenkool-rauw | Boerenkool, rauw |
| sla-kropsla | Kropsla |
| veldsla | Veldsla |
| broccoli-gestoomd | Broccoli, gestoomd |
| broccoli-diepvries | Broccoli, diepvries |
| bloemkool-gekookt | Bloemkool, gekookt |
| bloemkool-rauw | Bloemkool, rauw |
| rodekool-gekookt | Rodekool, gekookt |
| knolselderij-gekookt | Knolselderij, gekookt |
| paprika-gebakken | Paprika, gebakken |
| courgette-gebakken | Courgette, gebakken |
| aubergine-gebakken | Aubergine, gebakken |
| pompoen-geroosterd | Pompoen, geroosterd |
| asperges-gekookt | Asperges, gekookt |
| mais-kolf | Maïskolf |
| paddenstoelen-uv | Paddenstoelen, UV-behandeld |
| abrikoos-vers | Abrikoos, vers |
| fruit-diepvries | Rood fruit, diepvries |
| haverzemelen | Haverzemelen |
| boekweit-gekookt | Boekweit, gekookt |
| amarant-gekookt | Amarant, gekookt |
| teff | Teff |
| gerst-gekookt | Gerst, gekookt |
| spelt-gekookt | Spelt, gekookt |
| polenta | Polenta |
| speltbrood | Speltbrood |
| pita | Pitabroodje |
| naan | Naanbrood |
| bagel | Bagel |
| rijstwafel | Rijstwafel |
| maiswafel | Maïswafel |
| toast | Toast / geroosterd brood |
| pasta-wit-droog | Pasta, droog |
| linzenpasta-droog | Linzenpasta, droog |
| kikkererwtenpasta-droog | Kikkererwtenpasta, droog |
| rijstnoedels-gekookt | Rijstnoedels, gekookt |
| eiernoedels-gekookt | Eiernoedels, gekookt |
| ramen-noedels | Ramennoedels |
| sobanoedels-gekookt | Sobanoedels, gekookt |
| kikkererwten-gekookt | Kikkererwten, gekookt |
| edamame | Edamame |
| spliterwten-gekookt | Spliterwten, gekookt |
| notenmix | Notenmix, ongezouten |
| kipdij | Kipdij |
| kippenvleugel | Kippenvleugels |
| eend | Eendenborst |
| bacon | Bacon / spek |
| kipfilet-vleeswaren | Kipfilet (vleeswaren) |
| runderlever | Runderlever |
| varkenslever | Varkenslever |
| hart | Hart |
| pens | Pens |
| zalm-gekweekt | Zalm, gekweekt |
| zalm-wild | Zalm, wild |
| makreel-gerookt | Makreel, gerookt |
| sprot | Sprot |
| gerookte-forel | Forel, gerookt |
| tonijn-vers | Tonijn, vers |
| zeebaars | Zeebaars |
| dorade | Dorade |
| octopus | Octopus |
| eiwit | Eiwit (los) |
| eidooier | Eidooier (los) |
| verrijkte-eieren | Omega-3 verrijkte eieren |
| drinkyoghurt | Drinkyoghurt |
| oude-kaas | Oude kaas |
| blauwe-kaas | Blauwe kaas |
| avocado-olie | Avocado-olie |
| algenolie | Algenolie |
| bakboter | Bak- en braadboter |
| amandelpasta | Amandelpasta |
| currysaus | Currysaus |
| appelstroop | Appelstroop |
| granola | Granola |
| ontbijtgranen-verrijkt | Ontbijtgranen, verrijkt |
| tortillachips | Tortillachips |
| pure-chocolade | Pure chocolade 70 % |
| stroopwafel | Stroopwafel |
| linzensoep | Linzensoep |
| kippensoep | Kippensoep |
| pompoensoep | Pompoensoep |
| champignonsoep | Champignonsoep |
| curry-maaltijd | Curry met rijst |
| maaltijdsalade | Maaltijdsalade |
| pokebowl | Pokébowl |
| wrap-gevuld | Gevulde wrap |
| friet | Friet |
| ovenaardappel | Ovenaardappel |
| bruiswater | Bruiswater |
| groene-thee | Groene thee |
| eiwitshake | Eiwitshake |

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
