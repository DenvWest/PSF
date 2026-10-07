# Inventaris: vaste kleuren in het dashboard → tokens

- **Datum:** 7 oktober 2026
- **Status:** inventaris + voorstel plakken (akkoord Dennis op de aanpak, uitvoering per plak)
- **Doel:** alle kleuren in `src/components/dashboard` via `--vd-*`-tokens, als voorwaarde voor een eventuele tint-schuif (zie `BESLUIT_PATROON_STOF_EN_TREND_2026-10.md` §7, "Afgewezen (voor nu)"). Ook los daarvan nuttig: een ontwerpwijziging wordt één regel in `globals.css`.

## Meting (script, 7 okt, exclusief tests)

| | Aantal |
|---|---|
| Vaste hexcodes in `src/components/dashboard` | **945** in 83 bestanden, 56 unieke waarden |
| Daarvan **exact gelijk** aan een bestaand `--vd-*`-token | **666 (70%)** |
| Niet gelijk aan een token | 279, in ~45 unieke waarden |
| Tailwind-kleurnamen (`bg-amber-500` e.d.) | 5 |
| Wit/zwart met transparantie (`border-white/10`, `bg-black/20`, …) | 718 |

**Tokens staan op `:root`** (`globals.css`, vanaf r. 53), niet alleen op `.vd-root`. Een `var(--vd-*)` werkt dus ook in sheets en popovers die via een portal buiten `.vd-root` renderen (`AgendaTimePopover`). Vervangen bij exacte gelijkheid verandert daarom niets zichtbaars.

### Grootste exacte treffers

| Hex | Token | Aantal |
|---|---|---|
| `#9FB0A6` | `--vd-ink-2` | 210 |
| `#F1EFE8` | `--vd-ink` | 148 |
| `#7E8C82` | `--vd-ink-3` | 115 |
| `#5A8F6A` | `--vd-sage` | 94 |
| `#C8956C` | `--vd-terra` | 46 |
| `#9CC5A9` | `--vd-sage-2` | 33 |

### Grootste niet-treffers (nieuwe tokens nodig, of samenvoegen)

| Hex | Aantal | Vermoedelijke rol |
|---|---|---|
| `#CDD7D0` | 64 | tekst tussen `--vd-ink` en `--vd-ink-2` → nieuw `--vd-ink-1h` of samenvoegen met `--vd-ink-2` (zichtbaar verschil, vraagt keuze) |
| `#E7EDE8` | 41 | lichte tekst op sage (knoptekst) → `--vd-on-sage` |
| `#0F1C10` | 31 | donkere tekst op lichte knop → `--vd-on-light` |
| `#1C1917`, `#78716C`, `#E4E0DA`, `#EBE7E2`, `#FAF9F7`, `#D6D3D1`, `#57534E` | 77 | het **lichte** plan-reader/paneel-palet (stone-familie) → eigen set `--vd-light-*` |
| `#E2BC96`, `#DDB58F`, `#9C6A44`, `#E08A6B`, `#E8A08A` | 18 | terra-varianten → `--vd-terra-2` e.d. |
| `#7FB28E`, `#5FA872`, `#79B98C`, `#8FBF9E`, `#6FB07E` | 12 | sage-varianten → samenvoegen naar `--vd-sage`/`--vd-sage-2` (klein zichtbaar verschil) |

### Per map

agenda 213 · voortgang 200 · beweging 146 · cockpit 125 · kompas 123 · domain 72 · root (`Dashboard.tsx`) 34 · doelen 15 · focus 8 · unlock 5 · **dagboek 3 · patroon 0** · keuze 1.

Dagboek en Patroon zijn al vrijwel volledig getokeniseerd (sinds de samenvoeging van 23 sep). Het werk zit in de oudere cockpit-, agenda-, kompas- en beweegschermen.

**Wit/zwart met transparantie** (718×) laten we staan: dat zijn neutrale overlays (randen, hover) die op elke donkere tint werken. Ze hoeven niet mee met een tint-schuif.

## Plakken

1. **Plak 1: de 666 exacte treffers, mechanisch.** `text-[#9FB0A6]` → `text-[var(--vd-ink-2)]`, `"#9FB0A6"` in style/SVG → `"var(--vd-ink-2)"`. Pixel-identiek. Eén PR, met een test die nieuwe exacte-treffer-hex in `src/components/dashboard` blokkeert (regressie-slot).
2. **Plak 2: nieuwe tokens zonder kleurverandering.** `--vd-ink-1h` (`#CDD7D0`), `--vd-on-sage`, `--vd-on-light`, `--vd-terra-2` en het lichte palet `--vd-light-*`, elk met de huidige waarde. Ook pixel-identiek.
3. **Plak 3: samenvoegen (wél zichtbaar, Dennis kijkt per scherm).** Sage- en terra-varianten naar de hoofdtokens; per scherm op een eigen poort beoordelen.
4. **Pas daarna**, als Dennis het wil: de tint-schuif (Je doelen of instellingen), met afgeleide tokens op vaste helderheid; betekeniskleuren (sage/terra/stofkleuren) schuiven niet mee. Botst deels met het besluit van 23 sep (één donker thema); dan eerst een eigen besluit.

**Volgorde-advies:** plak 1 en 2 eerst op wat zichtbaar is (cockpit-shell, agenda, `Dashboard.tsx`, doelen). Beweging en kompas staan sinds 5 sep deels uit de navigatie (`psf-voeding-eerst-ui-snoei`); die komen als laatste of vervallen met eventuele opruiming.
