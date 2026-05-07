# guide-content

Python-modules met **`GUIDE`-dictionary’s** voor `scripts/generate-guide-pdf.py`.

## Vereisten

- Python 3.11+
- `pip install reportlab`

Fonts worden automatisch gedownload naar `scripts/fonts/` (eerste run).

## Nieuwe gids toevoegen

1. Maak `scripts/guide-content/{thema}.py` met een exports **`GUIDE`** dict (zie template hieronder).
2. Voeg `{thema}` toe aan de CLI-logica is niet nodig: elk `.py`-bestand in deze map kan met zijn bestandsnaam worden aangeroepen:

```bash
python scripts/generate-guide-pdf.py energie
```

3. Output: `public/downloads/{output_filename}` zoals ingesteld onder `meta`.

## Template (`GUIDE`)

```python
GUIDE = {
    "meta": {
        "header_banner": "THEMAGIDS VOOR MANNEN 40+",  # hoofding rechts pagina 2+
        "output_filename": "themagids-perfectsupplement.pdf",
        "pdf_title": "PDF-metadata titel",
    },
    "title_page": {
        "label": "GRATIS THEMAGIDS",
        "title": "Hoofdtitel<br/>optioneel tweede regel",
        "subtitle": "Max ±2 regels aanbevolen.",
        "usps": [
            "✓ punt een",
            "✓ punt twee",
            "✓ punt drie",
            "✓ punt vier",
        ],
        "quote": "Quote tekst.",
        "quote_source": "Bronregel na em-dash.",
        "footer_url": "perfectsupplement.nl",
    },
    "chapters": [
        {
            "number": "01",
            "title": "Hoofdstuktitel",
            "blocks": [
                {"type": "paragraph", "text": "Tekst. Mag <b>bold</b> en links als XML."},
                {"type": "subtitle", "text": "Subtitel (h3)"},
                {"type": "bullets", "items": ["Item", "Item"]},
                {"type": "tip", "title": "Optioneel", "text": "Tip-inhoud."},
                {
                    "type": "table",
                    "headers": ["Kolom A", "Kolom B"],
                    "rows": [["a", "b"]],
                },
                {"type": "spacer", "height": 12},
            ],
        },
    ],
    "cta": {
        "title": "Wil je weten waar je staat?",
        "text": "Uitleg Leefstijlcheck.",
        "url_href": "https://perfectsupplement.nl/intake",
        "url_label": "perfectsupplement.nl/intake",
    },
    "disclaimer": {
        "title": "Disclaimer",
        "body": "Juridisch/medisch kader.",
        "copyright": "© 2026 PerfectSupplement.nl — …",
    },
}
```

### Block-types

| `type`       | Velden |
|-------------|--------|
| `paragraph` | `text` |
| `subtitle`  | `text` |
| `bullets`   | `items` (list[str]) |
| `tip`       | `text`, optioneel `title` |
| `table`     | `headers`, `rows` |
| `spacer`    | `height` (pt, default 12) |

Tekst mag **ReportLab Paragraph markup** bevatten (`<b>`, `<br/>`, `<a href="..." color="#5A8F6A"><u>...</u></a>`). Gebruik anders platte tekst (speciale tekens worden waar nodig ge-escaped).

## Verplichte secties (logisch)

1. **`meta`** — uitvoerbestandsnaam + banner-tekst.
2. **`title_page`** — label, titel, subtitle, 4 USP’s, quote + bron, footer-url.
3. **`chapters`** — elk hoofdstuk **begint op nieuwe pagina** (script voegt `PageBreak` toe).
4. **`cta`** — voorlaatste pagina (Leefstijlcheck).
5. **`disclaimer`** — laatste pagina (copyright).

FAQ’s zijn gewoon een extra hoofdstuk met `subtitle` + `paragraph` Q/A.

## Design-tokens (referentie)

Worden centraal toegepast in `scripts/generate-guide-pdf.py`:

| Token | Hex | Gebruik |
|-------|-----|---------|
| Primair groen | `#3C7A56` | Koppen, accenten, lijnen, TOC-nummers |
| Donkergroen | `#2A5A3E` | Achtergrond titelpagina |
| Lichtgroen | `#5A8F6A` | Footer-intake-link, bullets ● |
| Bodytekst | `#1a1a1a` | Hoofdtekst |
| Subtekst | `#666666` / `#999999` | Captions, disclaimer |
| Beige blokken | `#F7F5F0` | Tips, CTA, zebra-tabellen |
| Rand | `#E5E0D8` | Tabellen en headerlijn |

**Pagina:** A4 — marges 60 pt links/rechts, 50 pt boven, 60 pt onder.

## Bestanden

- `slaap.py` — slaapgidscontent
- `stress.py` — stressgidscontent
- `energie.py`, `tekorten.py` — placeholders tot inhoud klaar is
