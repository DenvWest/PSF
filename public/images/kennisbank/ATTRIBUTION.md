# Kennisbank cover images — bronnen

Stijl: natuurlijk licht, rustige sfeer, herkenbaar onderwerp; geen medische clichés,
geen tekst in beeld, geen merklogo's, geen AI, geen supplementpotjes, geen geposeerde
mensen. 16:9, max ~1600px breed. Bestandsnaam = term-slug.

Publiek: genderneutraal. Geen UI-credits op de pagina.

Begrippen: `public/images/kennisbank/<slug>.jpg` + velden in `src/data/kennisbank.ts`.
Thema-fallbacks (alleen voor nieuwe begrippen zonder eigen cover):
`thema-{lichaam-veroudering|leefstijl-herstel|supplementwetenschap|longevity|ps-score}.jpg`
via `src/lib/kennisbank-cover.ts`. Die vijf zijn eigen Pexels-beelden, geen kopieën
van termcovers.

Herdownload Pexels-covers met:

```bash
python3 scripts/download-kennisbank-pexels.py
```

Foto-ID's staan in `scripts/kennisbank-pexels-ids.tsv` en in
`scripts/download-kennisbank-pexels.py`. `scripts/download-kennisbank-covers.sh` is
verouderd (Unsplash) en overschrijft deze set niet meer.

## Pexels (hoofdset)

Pexels License (vrij commercieel gebruik). ID = `pexels-photo-{id}`.

| Bestand | Pexels-ID | Onderwerp |
| --- | --- | --- |
| adaptogens.jpg | 6694149 | gedroogde kruiden op houten lepels |
| adh.jpg | 416528 | glas water |
| hpa-as.jpg | 7948527 | lege herfstbosweg |
| cortisol-v2.jpg | 7138778 | kruidenthee |
| atp.jpg | 4793233 | halterschijven |
| testosteron.jpg | 13863730 | lege gym |
| slaapschuld.jpg | 10554462 | beddengoed |
| sociale-verbinding.jpg | 8472173 | cafétafel |
| overtrainingssyndroom.jpg | 19141776 | dennenbos |
| vitamine-d-inname.jpg | 6213751 | olijfolie |
| onderzoeksdosis.jpg | 4110253 | afgemeten portie |
| claimdekking.jpg | 261579 | notitieboeken en koffie |
| etikettransparantie.jpg | 1656663 | marktgroenten |
| onafhankelijke-toetsing.jpg | 2280547 | microscoop |
| derde-partij-testen.jpg | 6129866 | reageerbuizen |
| ps-score-model.jpg | 606541 | notitieboek |
| scoregewichten.jpg | 8329286 | afgemeten kruiden |
| wei-eiwit.jpg | 8963368 | melk en eieren |
| leucinedrempel.jpg | 1211887 | feta-salade |
| mitochondrien.jpg | 371589 | alpenmeer |
| efsa-claims.jpg | 590493 | bibliotheek |
| biobeschikbaarheid.jpg | 1327838 | tomaten |
| chelaatvorm.jpg | 1435904 | paddenstoelen en paprika |
| healthspan.jpg | 1179229 | naaldbos van boven |
| insulineresistentie.jpg | 1640777 | groentekom |
| multivitamine.jpg | 1092730 | fruitbowl |
| nervus-vagus.jpg | 1761279 | bosbrug |
| vitamine-k2.jpg | 4109944 | kazen |
| thema-lichaam-veroudering.jpg | 414171 | berglandschap |
| thema-leefstijl-herstel.jpg | 8017404 | onopgemaakt bed |
| thema-ps-score.jpg | 6690217 | thee en notitieboek |
| thema-longevity.jpg | 417074 | bergmeer |
| thema-supplementwetenschap.jpg | 1340116 | kruidenlepels |

## Unsplash (natuurlijke originelen die al pasten)

Unsplash License. Deze covers zijn niet overschreven.

| Bestand | Unsplash-ID |
| --- | --- |
| circadiaan-ritme.jpg | 1495567720989-cebdbdd97913 |
| epa-dha-v2.jpg | 1519708227418-c8fd9a32b7a2 |
| slaaphygiene.jpg | 1522771739844-6a9f6d5f14af |
| eiwitbehoefte-na-40.jpg | 1546069901-ba9599a7e63c |
| kalium-natrium-balans.jpg | 1512621776951-a57141f2eefd |
| melatonine.jpg | 1419242902214-272b3f66ee7a |
| magnesiumvormen.jpg | 1498837167922-ddd27525d352 |
| vitamine-d.jpg | 1507525428034-b723cf961d3e |
| oxidatieve-stress.jpg | 1506905925346-21bda4d32df4 |
