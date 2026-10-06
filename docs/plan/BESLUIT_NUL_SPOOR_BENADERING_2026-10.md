# Besluit: gemeten 0/spoor tonen, benaderingen tonen maar nooit optellen

**Datum:** 6 oktober 2026
**Status:** besloten (Dennis, 6 okt, na voorlegging van het conflict met de besluiten hieronder)
**Wijzigt:** `BESLUIT_NEVO_GEHALTES_DAGBOEK_2026-10.md` §4 ("Weggelaten, niet nul" en "benaderingen krijgen geen micronutriënten")
**Laat staan:** `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md` §6 ("Benaderingen tellen nooit mee in een som")
**Raakt:** `scripts/nevo-gehaltes.mjs`, `scripts/nevo-benadering-micros.json`, `food-catalog-nevo-gehaltes.ts`, `nutrition-catalog-gehalte.ts`, `nutrition-dagboek-items.ts`, de dagboekschermen vergelijking, productdetail, portie-invoer en maaltijdtabel

## Aanleiding

In de vergelijking in het dagboek (spinazie diepvries · zalm gerookt · broccoli diepvries) stonden veel streepjes, met de uitleg "een streepje betekent 'niet gemeten', niet 'bevat niets'". Dat klopte twee keer niet:

1. **Spinazie, vitamine D en omega-3**: NEVO meldt hier 0. Het script liet een 0 of spoor weg, dus het werd "niet gemeten". Dat is precies verkeerd om: het ís gemeten en er zit niets in.
2. **Broccoli, diepvries**: helemaal leeg. NEVO heeft geen eigen record; de koppeling is een benadering (gekookte broccoli, code 920), en benaderingen kregen geen micronutriënten.

## Besluit

1. **Een 0 of spoor van een kernstof wordt bewaard en getoond.** Het script schrijft die in `nul` of `spoor` (nooit als getal), alleen voor eiwit, magnesium, zink, vitamine D, EPA en DHA. Schermen tonen "0" of "spoor". Een streepje betekent weer alleen "niet gemeten". Dat blijft binnen de RIVM-regel (ongewijzigd gebruik): het is letterlijk wat NEVO meldt.
2. **Een 0 of spoor telt nooit mee in een som.** De dagsom, krans, tekorten en rijkste bronnen blijven gelijk (`gehaltePer100g` verandert niet). Het enige wat verschuift: een product met een gemeten 0 telt niet meer als "product zonder gehalte" (`zonderGehalte`), want dan weten we het wél.
3. **Een rij in de vergelijking waarin geen enkel product een getal heeft, verdwijnt** (ook als er alleen nullen staan).
4. **Omega-3 buiten vis/zeevruchten**: alleen "0" als NEVO voor EPA én DHA een 0 of spoor meldt. Meldt NEVO bij een niet-vis een positieve DHA (laboratoriumruis, zie het vorige besluit), dan blijft het "niet gemeten": een 0 tonen zou de bron wijzigen.
5. **Benaderingen tonen, alleen als vrijgegeven, nooit in een som.** `scripts/nevo-benadering-micros.json` zegt per benaderingskoppeling of de kernstoffen van het vergelijkbare record getoond mogen worden, met reden. Ze staan in een apart blok (`FOOD_CATALOG_NEVO_BENADERINGEN`) met de NEVO-naam, en verschijnen alleen via `gehalteWeergavePer100g` / `weergaveVanItem`: altijd met "≈" en "waarden van '<NEVO-naam>' … telt niet mee in je dag". De maaltijdtabel telt op en houdt een benadering daarom op `n.o.`.
6. **Rekenen en tonen zijn twee functies.** `gehaltePer100g`/`bedragVanItem` = het getal voor sommen. `gehalteWeergavePer100g`/`weergaveVanItem`/`weergaveVoorStandaardPortie` = wat een scherm toont. Een nieuw scherm dat optelt, gebruikt nooit de weergavefuncties.

## Benaderingen: vrijgegeven en niet

**Vrijgegeven (10):** broccoli gestoomd en diepvries (→ broccoli gekookt), basmatirijst, meergranenbrood, kipdij, rosbief, roomboter, blauwe kaas, smeerkaas, groene thee.

**Niet, met reden:** plantendranken (verrijking per merk), margarine en bak- en braadboter (vitamine D-verrijking niet in het record), vleesvervangers (samenstelling/verrijking per merk), proteïnereep, stamppot (boerenkool ≠ stamppot), frisdrank light (per 100 ml).

**Voorgelegd, voorlopig niet:** eendenborst (alleen rauwe eend met vel), worst (gemiddelde), granola, volkoren ontbijtgranen (vaak verrijkt), pizza (margherita), groentesoep, kippensoep, maaltijdsalade, gevulde wrap. Vrijgeven = de sleutel naar `toon` verplaatsen en `node scripts/nevo-gehaltes.mjs` draaien.

## Afgewezen

- **Een 0 helemaal weglaten (cel leeg):** rustiger, maar dan valt het verschil tussen "niets erin" en "niet gemeten" weg, en in een vergelijking is "spinazie 0, zalm 3 µg" juist de informatie.
- **Benaderingen laten meetellen in de dagsom:** het dagtotaal is bewust een ondergrens uit echte brongetallen (TOTAALBEELD §6).
- **Alle 32 benaderingen in één keer vrijgeven:** bij verrijkte producten (margarine, plantendranken) zou de benadering de vitamine D structureel te laag tonen.
- **0 als getal in `FOOD_CATALOG_NEVO_GEHALTES` schrijven:** dan krijgt elke som-consument een 0 binnen en moet elke plek zelf weten dat die niet als bron telt. Een aparte lijst houdt de rekenkant ongewijzigd.

## Buiten deze stap

De etikettabel onderaan het productdetail (`VoedingswaardeTabel`, uit `nevo_foods`) heeft een eigen laadpad en toont nog `n.o.` waar NEVO 0 meldt. Gelijktrekken kan later.
