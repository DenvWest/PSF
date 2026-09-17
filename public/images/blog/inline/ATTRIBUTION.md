# Inline artikelbeelden — bronnen

Stijl: natuurlijk licht, rustige sfeer, herkenbaar onderwerp; geen medische clichés,
geen tekst in beeld, geen merklogo's. 16:9, max ~1600px breed.

Licenties: Unsplash License (vrij commercieel gebruik) of hergebruik van bestaande
kennisbank-/blogbestanden. Geen UI-credits op de pagina (figcaption is redactioneel).

Bestanden: `public/images/blog/inline/<slug>.jpg`.
Inline staat halverwege het artikel (`BlogArticlePage`, na de eerste helft van de
secties). Alt + bijschrift voeden JSON-LD `ImageObject` en moeten het beeld
beschrijven.

Zie `scripts/refresh-blog-images.py` voor de mapping. Oudere Unsplash-ID's staan
in `scripts/download-article-inline-images.sh`.
