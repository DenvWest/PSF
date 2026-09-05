# Blog cover images — bronnen

Stijl: natuurlijk licht, rustige sfeer, herkenbaar onderwerp; geen medische clichés,
geen tekst in beeld, geen merklogo's. 16:9, max ~1600px breed. Bestandsnaam = artikel-slug.

Publiek: genderneutraal of gemengd 40+, behalve waar `audience` mannen/vrouwen is.

Licenties: Unsplash License (vrij commercieel gebruik) tenzij anders vermeld.
Geen UI-credits op de pagina.

Artikelen: `public/images/blog/<slug>.jpg` + velden in `src/data/blog/*.ts`.
Categorie-fallbacks: `categorie-{stress|slaap|energie|supplementen}.jpg` via `src/lib/blog-cover.ts`.

## AI-gegenereerd (waar stock tekortschoot)

| Bestand | Opmerking |
| --- | --- |
| zonnebrand-en-vitamine-d.jpg | AI — strand/zonlicht |
| vitamine-d-hoge-doses-social-media.jpg | AI — smartphone zonder merklogo's |
| beste-magnesium.jpg | AI — bladgroenten en zaden |

## Unsplash (overige artikelen)

Foto-ID's staan in `scripts/download-blog-covers.sh`. Herdownload met:

```bash
bash scripts/download-blog-covers.sh
```
