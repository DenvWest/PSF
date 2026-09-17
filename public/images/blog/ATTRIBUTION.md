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
