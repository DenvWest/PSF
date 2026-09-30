# Blog cover images — bronnen

Stijl: natuurlijk licht, rustige sfeer, herkenbaar onderwerp; geen medische clichés,
geen tekst in beeld, geen merklogo's. 16:9, max ~1600px breed. Bestandsnaam = artikel-slug.

Publiek: genderneutraal of gemengd 40+, behalve waar `audience` mannen/vrouwen is.

Licenties: Unsplash License (vrij commercieel gebruik) of hergebruik van bestaande
kennisbank-/blogbestanden. Geen UI-credits op de pagina.

Artikelen: `public/images/blog/<slug>.jpg` + velden in `src/data/blog/*.ts`.
Categorie-fallbacks: `categorie-{stress|slaap|energie|supplementen}.jpg` via `src/lib/blog-cover.ts`.
Die vier zijn kopieën van bestaande artikelbeelden (stress ← cortisol-verlagen-natuurlijk,
slaap ← slaap-verbeteren-40-plus, energie ← energie-verhogen-natuurlijk,
supplementen ← supplement-kiezen-waar-op-letten). Ze dienen alleen als fallback
voor artikelen zonder eigen cover — niet als bibliotheekkaart. De twee pijlers
in de bibliotheek hebben eigen beelden: `pijler-testosteron-na-40.jpg` en
`pijler-overgang.jpg`.

## Refresh (uniek + context)

Elk artikel heeft een eigen cover-hash, los van andere artikelen. Cover en inline
van dezelfde slug delen geen pixels. Voorkeur: bestaande kennisbank-JPEG's en
ongebruikte blogbestanden; Unsplash-crops alleen voor gaten. De bibliotheektest
`elke bibliotheekkaart heeft een visueel uniek coverbeeld` bewaakt nabije kopieën.

Zie `scripts/refresh-blog-images.py` voor de mapping. Foto-ID's van eerdere
batches staan in `scripts/download-blog-covers.sh`.

`overgang.jpg` en `testosteron-na-40.jpg` zijn geen artikelcovers (geen slug);
niet hergebruiken als fallback. De testosteron-gidscover is dezelfde foto als
`kennisbank/testosteron.jpg` en `pijler-testosteron-na-40.jpg`, zodat de
bibliotheekkaart het artikelbeeld toont.

## Beeldregels (30 sep 2026)

- Een beeld staat alleen bij een artikel als het onderwerp erin te zien is. Passend beeld ontbreekt: laat de inline weg (optioneel) in plaats van een willekeurige stockfoto.
- `alt` beschrijft wat er echt op de foto staat; `caption` legt de link met het artikel. Nooit een beschrijving van een eerdere foto laten staan bij een vervangen bestand.
- Elke cover en inline is uniek (pixels én alt); de test in `src/lib/__tests__/article-body-images.test.ts` bewaakt dat, plus losse bestanden in `inline/`.
- Geen zichtbare merklogo's (bijv. sportmerken) in beeld.
- Inline-beelden van 30 sep 2026 komen van Pexels (Pexels License, vrij commercieel gebruik, geen credit op de pagina). Bron = `https://www.pexels.com/photo/<id>/`:

  - `inline/cortisol-en-slaap.jpg` ← 6943991
  - `inline/creatine-bijwerkingen-nieren-haaruitval.jpg` ← 7579823
  - `inline/creatine-dosering-en-laadfase.jpg` ← 38848778
  - `inline/creatine-en-brein-slaaptekort.jpg` ← 6345353
  - `inline/creatine-en-herstel.jpg` ← 4775187
  - `inline/creatine-voor-vrouwen-na-40.jpg` ← 6539867
  - `inline/creatine-vormen-en-keurmerken.jpg` ← 4475558
  - `inline/creatine-wanneer-innemen.jpg` ← 4047244
  - `inline/is-whey-schadelijk.jpg` ← 5149754
  - `inline/krachttraining-na-40.jpg` ← 3926639
  - `inline/magnesium-en-slaap.jpg` ← 7622521
  - `inline/magnesium-en-slaapkwaliteit.jpg` ← 7609020
  - `inline/magnesium-en-spierkrampen.jpg` ← 4127497
  - `inline/magnesium-in-de-overgang.jpg` ← 7500432
  - `inline/magnesium-overgang-vrouwen.jpg` ← 6687764
  - `inline/magnesium-tekort-herkennen.jpg` ← 7513211
  - `inline/magnesium-voor-wie-wel-niet.jpg` ← 8657366
  - `inline/magnesium-wanneer-innemen.jpg` ← 4040564
  - `inline/magnesium-herstel-mannen-40.jpg` ← 4804323
  - `inline/melatonine-na-40.jpg` ← 11344545
  - `inline/melatonine-wanneer-wel-niet.jpg` ← 6940877
  - `inline/omega-3-concentratie-energie.jpg` ← 8121886
  - `inline/omega-3-en-herstel.jpg` ← 6740571
  - `inline/omega-3-en-medicijnen.jpg` ← 11370618
  - `inline/omega-3-index-meten.jpg` ← 4040561
  - `inline/overgang-buikvet-gewichtstoename.jpg` ← 36626644
  - `inline/overgang-stress-cortisol.jpg` ← 8939962
  - `inline/slaapritme-herstellen.jpg` ← 9641778
  - `inline/slaap-verbeteren-40-plus.jpg` ← 7622509
  - `inline/supplement-kiezen-waar-op-letten.jpg` ← 8670519
  - `inline/vermoeidheid-bloedwaarden-checken-mannen.jpg` ← 7255321
  - `inline/visolie-oxidatie-en-bijwerkingen.jpg` ← 208518
  - `inline/vitamine-d-botgezondheid-overgang.jpg` ← 9960233
  - `inline/vitamine-d-en-k2-samen.jpg` ← 28797264
  - `inline/vitamine-d-seizoenen-jaarritme.jpg` ← 5876191
  - `inline/vitamine-d-tekort-herkennen.jpg` ← 6945636
  - `inline/waar-let-je-op-bij-omega-3.jpg` ← 8422719
  - `inline/whey-concentraat-isolaat-hydrolysaat.jpg` ← 5078590
  - `inline/whey-of-plantaardig-eiwit.jpg` ← 5966443
  - `inline/zink-en-testosteron.jpg` ← 7217526
  - `inline/zonnebrand-en-vitamine-d.jpg` ← 5202453
