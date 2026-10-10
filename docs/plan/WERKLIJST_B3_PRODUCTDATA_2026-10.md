# Werklijst B-3: productdata van de 25 live producten op orde

- **Datum:** 10 oktober 2026
- **Bron:** `select slug, status, unnest(sup_publish_gate_failures(id)) …` in Supabase (10 okt)
- **Status:** werklijst; invullen door Dennis in `/admin/producten` (of via een bulkstap, zie onderaan)
- **Besluit:** B-3 in `BESLUIT_AFFILIATE_VERVOLG_2026-10.md` (laten staan, data op orde)

De poort staat nu in de database (trigger `sup_products_publish_gate_trg`, getest 10 okt). Live producten blijven staan; nieuwe publicaties en heropenen gaan wel door de poort.

## Stand

| Ontbreekt | Aantal live producten |
|---|---|
| Licentie-notitie bij afbeelding | 24 (alleen `vitalnutrition-ashwagandha-ksm66` heeft er een) |
| Minstens één bron | 24 (dezelfde) |
| Prijs jonger dan 30 dagen | 8 |
| Geldige https-affiliate-link | 1 (`vitalnutrition-ashwagandha-ksm66`, aanbieding is inactief) |
| Werkzame stoffen volledig | 1 (`viridian-bisglycinaat`, 0 mg) |

## 1. Afbeeldingen: toestemming per winkel, niet per product

Alle 25 afbeeldingen komen van de winkel of het merk (antwoord Dennis). Per aanbieding is de winkel via de affiliate-link vast te stellen, dus de toestemming hoeft maar voor **drie partijen** vastgelegd te worden. Het admin-veld "Bron" kent al `merchant_feed`, `manufacturer`, `own`, `licensed`.

De licentie-notitie moet waar zijn. Pas invullen nadat is nagegaan:

- **Vitaminstore (Daisycon):** staat in de campagnevoorwaarden of het promotiemateriaal/de productfeed dat afbeeldingen gebruikt mogen worden? Daisycon art. 2.4–2.6: materiaal van de adverteerder mag onveranderd gebruikt worden voor de campagne; art. 2.5: afbeeldingen alleen rechtenvrij of met toestemming. Merkafbeeldingen via Vitaminstore (Solgar, Viridian, Bonusan, Mattisson, Minami, Möller's, Orangefit, Royal Green, Vitals) vallen onder dezelfde vraag.
- **VitalNutrition (Daisycon):** idem, eigen campagne.
- **Arctic Blue (direct):** staat in hun affiliatevoorwaarden of bij het programma dat afbeeldingen gebruikt mogen worden? Zo niet: toestemming vragen.
- **Let op:** de Daisycon-media is nu afgekeurd (zie besluitdoc). Toestemming via een campagne hangt af van een goedgekeurde campagneaanmelding.

Voorstel voor de notitie na verificatie: `Productafbeelding uit promotiemateriaal <winkel>, gebruik conform campagnevoorwaarden (nagegaan <datum>)`, bron `merchant_feed`.

### Vitaminstore (Daisycon): 17 producten

| Product (slug) | Merk | Afbeelding |
|---|---|---|
| `vitaminstore-ashwagandha-ksm66` | Vitaminstore | `Vitaminstore-Ashwagandha-KSM-66.jpg` |
| `vitaminstore-solgar-ashwagandha` | Solgar Vitamins | `Solgar-Vitamins-Ashwagandha-Root.jpg` |
| `mattisson-creatine-creapure` | Mattisson Healthstyle | `Mattisson-Creatine-Monohydraat.jpg` |
| `vitaminstore-creatine` | Vitaminstore | `Vitaminestore-Creatine-Monohydraat.jpg` |
| `orangefit-protein` | Orangefit | `Orangefit-Protein.jpg` |
| `royal-green-whey-protein-isolate` | Royal Green | `Royal-Green-Whey-Protein-Isolate.jpg` |
| `vitaminstore-super-magnesium` | Vitaminstore | `Vitaminstore-Super-Magnesium.jpg` |
| `viridian-bisglycinaat` | Viridian | `Viridian-Magnesium-Bisglycinate.jpg` |
| `vitals-liquid-epadha` | Vitals | `Vitalis-Visolie.jpg` |
| `mollers-omega-3-citroen` | Möller's | `Mollers-Omega-3-Citroen.jpg` |
| `minami-morepa-original` | Minami | `More-EPA-Original.jpg` |
| `vitaminstore-super-d3` | Vitaminstore | `Vitaminstore-Super-D3.jpg` |
| `solgar-vitamin-d3` | Solgar Vitamins | `Solgar-VitaminD-3.jpg` |
| `vitaminstore-d3-k2-softgels` | Vitaminstore | `Vitaminstore-Vitamine-D3-K2.jpg` |
| `vitaminstore-d3-k2-drops` | Vitaminstore | `Vitaminstore-Vitamine-D3-K2-Druppels.jpg` |
| `solgar-zink-picolinaat` | Solgar Vitamins | `Solgar-vitamins-zink.jpg` |
| `bonusan-zinkmethionine` | Bonusan | `Bonusan-zink-Methionine.jpg` |

### VitalNutrition (Daisycon): 7 producten

| Product (slug) | Merk | Afbeelding |
|---|---|---|
| `vitalnutrition-ashwagandha-ksm66` | Vital Nutrition | `Vital-Nutrition-Ashwagandha-KSM-66.jpg` |
| `vitalnutrition-creatine` | Vital Nutrition | `vital-Nutrition-Creatine-Monohydraat.jpg` |
| `vital-nutrition-whey-proteine` | Vital Nutrition | `vital-nutrition-whey-proteine.jpg` |
| `vital-nutrition-citraat` | Vital Nutrition | `Vitalnutrition-Magnesium-Citraat.jpg` |
| `vitalnutrition-vitamin-d3` | Vital Nutrition | `Vital-Nutrition-Vitamin-D3.jpg` |
| `vitalnutrition-d3-k2` | Vital Nutrition | `Vital-Nutrition-Vitamine-D3-K2.jpg` |
| `vitalnutrition-zink` | Vital Nutrition | `vital-nutrition-zink-methionine.jpg` |

### Arctic Blue (direct): 1 producten

| Product (slug) | Merk | Afbeelding |
|---|---|---|
| `arctic-blue-visolie` | Arctic Blue | `Arctic-Blue-Visolie.png` |

## 2. Bronnen (24 producten)

Eén bron per product is genoeg voor de poort. Soorten in het admin: `etiket`, `fabrikant`, `webshop`, `onderzoek`, `overig`. Een bron moet laten zien waar de productgegevens (dosering, vorm, inhoud) vandaan komen: bij voorkeur het **etiket** (eigen foto of de verpakking) of de **fabrikantpagina**; de webshoppagina is acceptabel als herkomst van wat je overnam, met de URL. Dit is jouw beoordeling per product; ik vul geen herkomst in die ik niet kan verifiëren.

## 3. Prijzen (8)

arctic-blue-visolie, minami-morepa-original, mollers-omega-3-citroen, orangefit-protein, royal-green-whey-protein-isolate, vital-nutrition-whey-proteine, vitals-liquid-epadha, vitalnutrition-ashwagandha-ksm66: prijs bij de winkel nakijken en bevestigen (admin: "prijs bevestigen"). Daarna blijft dit terugkomen elke 30 dagen: zie de prijsverval-stap in B-2 (signaal met 7 dagen termijn).

## 4. Twee losse producten

- **`vitalnutrition-ashwagandha-ksm66`:** de enige aanbieding is inactief en heeft geen geldige https-affiliate-link. Nagaan of het product nog verkocht wordt; zo ja: aanbieding activeren, link en prijs invullen; zo nee: archiveren.
- **`viridian-bisglycinaat`:** dosering van het etiket invullen (nu 0 mg). Vitaminstore-pagina is tegenstrijdig (140 mg per 2 capsules én 160 mg per capsule) en meldde "tijdelijk uitverkocht". De link naar het Viridian-product klopt (B-7: `…solgar-vitamins-magnesium-bisglycinate-1308886` is bij Vitaminstore het Viridian-product; alleen de URL-naam is verouderd). Bij uitverkocht: aanbieding deactiveren of product archiveren.

## 5. Voorstel bulkstap

Een kleine admin-actie "Invullen per winkel": jij kiest een winkel, bevestigt de notitie en de bron (`merchant_feed`), en de afbeeldingen van alle producten van die winkel zonder notitie worden in één keer bijgewerkt. Niets wordt ingevuld zonder jouw bevestiging. Bouwen pas na het verificatiewerk in §1.

## Besluit Dennis (10 oktober 2026) over de toestemming

Dennis gaat de campagnevoorwaarden (Vitaminstore, VitalNutrition) en de Arctic Blue-voorwaarden niet afzonderlijk nagaan: gebruik van de afbeeldingen via het affiliate-programma wordt als toegestaan beschouwd. De licentie-notitie legt dat daarom vast als **aanname van de eigenaar** met datum, niet als geverifieerde toestemming. Risico (bewust genomen): Daisycon art. 2.5 vraagt rechtenvrije afbeeldingen of toestemming; als een adverteerder bezwaar maakt, moet de afbeelding weg. Voor directe contracten (Arctic Blue en toekomstige) geldt: eigen materiaal opvragen bij het sluiten van het contract.

**Gebouwd:** "Afbeeldingen invullen per winkel" op `/admin/producten` (met controle vooraf, nooit bestaande notities overschrijven).
