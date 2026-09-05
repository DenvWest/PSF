# Kennisbank cover images — bronnen

Stijl: natuurlijk licht, rustige sfeer, herkenbaar onderwerp; geen medische clichés,
geen tekst in beeld, geen merklogo's. 16:9, max ~1600px breed. Bestandsnaam = term-slug.

Publiek: genderneutraal of gemengd 40+, behalve waar `audience` mannen/vrouwen is.

Licenties: Unsplash License (vrij commercieel gebruik) tenzij anders vermeld.
Geen UI-credits op de pagina.

Begrippen: `public/images/kennisbank/<slug>.jpg` + velden in `src/data/kennisbank.ts`.
Thema-fallbacks: `thema-{lichaam-veroudering|leefstijl-herstel|supplementwetenschap|longevity|ps-score}.jpg`
via `src/lib/kennisbank-cover.ts`. Die vijf zijn kopieën van bestaande termbeelden
(lichaam ← vitamine-d, leefstijl ← slaaphygiene, supplementwetenschap ← biobeschikbaarheid,
longevity ← healthspan, ps-score ← ps-score-model) en vangen begrippen zonder eigen beeld
plus thema-hubs. Vervang ze door eigen beelden zodra die er zijn.

`scoregewichten` heeft bewust geen eigen cover → thema-ps-score-fallback.

## AI-gegenereerd (waar stock tekortschoot)

| Bestand | Opmerking |
| --- | --- |
| adh.jpg | AI — glas water, hydratatie |
| derde-partij-testen.jpg | AI — laboratoriumglaswerk zonder logo's |
| claimdekking-v2.jpg | AI — capsules + notitieboek (claim/etiket-context) |

## Unsplash (overige begrippen)

Foto-ID's staan in `scripts/download-kennisbank-covers.sh`. Herdownload met:

```bash
bash scripts/download-kennisbank-covers.sh
```

Let op: `adh`, `derde-partij-testen` en `claimdekking` staan niet in die map (AI).
`cortisol-v2.jpg` deelt Unsplash-ID met blog `cortisol-verlagen-natuurlijk` (meditatie/herstel).
`epa-dha-v2.jpg` = zalmfilet (`1519708227418-c8fd9a32b7a2`).
`multivitamine.jpg` is afgeleid van de blog-cover `multivitamine-zinvol-na-40.jpg`.
