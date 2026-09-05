# Blog cover images — bronnen

Stijl: natuurlijk licht, rustige sfeer, herkenbaar onderwerp; geen medische clichés,
geen tekst in beeld, geen merklogo's. 16:9, max ~1600px breed. Bestandsnaam = artikel-slug.

Publiek: genderneutraal of gemengd 40+, behalve waar `audience` mannen/vrouwen is.

Licenties: Unsplash License (vrij commercieel gebruik) tenzij anders vermeld.
Geen UI-credits op de pagina.

Artikelen: `public/images/blog/<slug>.jpg` + velden in `src/data/blog/*.ts`.
Categorie-fallbacks: `categorie-{stress|slaap|energie|supplementen}.jpg` via `src/lib/blog-cover.ts`.
Die vier zijn kopieën van bestaande artikelbeelden (stress ← cortisol-verlagen-natuurlijk,
slaap ← slaap-verbeteren-40-plus, energie ← energie-verhogen-natuurlijk,
supplementen ← creatine-vormen-en-keurmerken) en vangen alleen artikelen zonder eigen beeld
plus de twee pijlerpagina's. Vervang ze door eigen beelden zodra die er zijn.

## AI-gegenereerd (geen mensen — product/landschap/voedsel)

| Bestand | Opmerking |
| --- | --- |
| zonnebrand-en-vitamine-d.jpg | AI — strand/zonlicht |
| beste-magnesium.jpg | AI — bladgroenten en zaden |
| magnesium-in-combinatie-met-medicijnen.jpg | AI — magnesiumcapsules + medicijnblisters |
| vitamine-d-zon-nederland.jpg | AI — Nederlands polderlandschap in zonlicht |
| eiwitinname-timing-mannen-40.jpg | AI — eiwitrijke maaltijd |
| alcohol-slaap-energie-na-40.jpg | AI — wijnglas bij bed |
| middagdip-bloedsuiker-na-40.jpg | AI — kop koffie |
| zink-en-testosteron.jpg | AI — vlees, oesters, zaden |
| eiwit-na-40.jpg | AI — eiwitshake |
| omega-3-en-herstel.jpg | AI — vette vis |
| ashwagandha-werking-mannen.jpg | AI — ashwagandha-wortel |
| wat-is-omega-3.jpg | AI — zalm, sardines, visolie |
| waar-let-je-op-bij-omega-3.jpg | AI — omega-3-potjes naast vis |
| magnesium-in-de-overgang.jpg | AI — magnesiumcapsules + glas water |

## Unsplash (mensen-beelden + objecten i.p.v. AI-gezichten)

| Bestand | Opmerking |
| --- | --- |
| vitamine-d-hoge-doses-social-media.jpg | Unsplash `1614440562463-5bb4a862db46` — smartphone met selfie |
| overgang.jpg | Unsplash `1573497019940-1c28c88b4f3e` — vrouw 45+ portret |
| testosteron-na-40.jpg | Unsplash `1605296867304-46d5465a13f1` — man krachttraining |
| buikvet-cortisol-slaap-mannen.jpg | Unsplash `1476480862126-209bfaa8edc8` — hardloopschoenen/trappen |
| krachtverlies-eiwitbehoefte-na-40.jpg | Unsplash `1576678927484-cc907957088c` — dumbbells |
| magnesium-herstel-mannen-40.jpg | Unsplash `1587854692152-cbe660dbde88` — capsules |
| slaapkwaliteit-testosteron-herstel.jpg | Unsplash `1522771739844-6a9f6d5f14af` — slaapkamer |
| vermoeidheid-bloedwaarden-checken-mannen.jpg | Unsplash `1532187863486-abf9dbad1b69` — labbuisjes |
| overgang-slaapproblemen-opvliegers.jpg | Unsplash `1540518614846-7eded433c457` — slaapkamer |
| overgang-buikvet-gewichtstoename.jpg | Unsplash `1541534741688-6078c6bfb5c5` — krachttraining |
| overgang-stress-cortisol.jpg | Unsplash `1544367567-0f2fcb009e0b` — yoga/zonsondergang |
| vitamine-d-botgezondheid-overgang.jpg | Unsplash `1472214103451-9374bd1c798e` — zonlicht landschap |

Foto-ID's staan in `scripts/download-blog-covers.sh`. Herdownload met:

```bash
bash scripts/download-blog-covers.sh
```
