# Nulmeting — CTR magnesium vóór de H1/snippet-wissel

**Datum invullen:** \_\_\_ september 2026 · **Bron:** Search Console
**Waarom:** vóórmeting bij A4 uit het vakantiecodeerplan. `/beste/magnesium` en
`/supplementen/magnesium` voerden vrijwel dezelfde H1; die botsing is opgelost,
waarbij de vergelijking naar koop-intentie ging en de gids naar uitleg. Zonder
een vóórmeting op dezelfde impressie-orde is achteraf niet te zeggen of het iets
deed.

**Volgorde:** deze tabel invullen **vóór** `deploy.sh`. Daarna pas deployen.

---

## Let op — magnesium had vorige keer geen eigen paginarij

`[FEIT]` In [NULMETING_BESTE_VERGELIJKINGEN_2026-09-02](NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md)
stond magnesium **niet** als rij in het tabblad *Pagina's*; de 75 impressies
kwamen op zoekopdracht-niveau naar boven.

`[OORDEEL]` Vul daarom **beide** tabellen hieronder. Blijft tabel 1 leeg, dan is
dat zelf de meting: de URL haalt geen eigen paginarij, en dan is CTR niet het
probleem maar indexatie/positie.

---

## Zo kom je aan de cijfers

1. **search.google.com/search-console** → property `perfectsupplement.nl`
2. **Prestaties → Zoekresultaten**
3. Zet alle vier de tegels aan: *Klikken, Vertoningen, Gem. CTR, Gem. positie*
   (CTR en positie staan standaard uit)
4. **Datum → Laatste 3 maanden.** Noteer de exacte periode hieronder; bij de
   nameting moet je dezelfde vensterlengte gebruiken
5. Tabblad **Pagina's** → filter `+ Nieuw → Pagina → URL bevat → magnesium`
6. Tabblad **Zoekopdrachten** → filter `+ Nieuw → Zoekopdracht → bevat → magnesium`
7. **Exporteren** (rechtsboven) → CSV, en bewaar het bestand — deze tabel is de
   samenvatting, niet het origineel

**Periode gemeten:** \_\_\_\_\_\_ t/m \_\_\_\_\_\_

---

## Tabel 1 — per URL

| URL | Vertoningen | Klikken | Gem. CTR | Gem. positie |
|---|---|---|---|---|
| `/beste/magnesium` | | | | |
| `/supplementen/magnesium` | | | | |
| `/blog/magnesium-en-slaap` | | | | |
| `/blog/magnesium-en-slaapkwaliteit` | | | | |
| `/blog/magnesium-in-combinatie-met-medicijnen` | | | | |

*Staat er geen rij voor een URL: noteer "geen rij" — dat is een uitkomst, geen
ontbrekende data.*

## Tabel 2 — per zoekopdracht (top 10, filter `bevat magnesium`)

| Zoekopdracht | Vertoningen | Klikken | Gem. CTR | Gem. positie |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

`[OORDEEL]` Tabel 2 is het belangrijkste deel. De nieuwe titel is
*"Beste magnesium 2026: bisglycinaat, citraat of complex"*. Staan in deze lijst
vooral vormvragen (*bisglycinaat vs citraat*, *welke magnesium*), dan past de
titel bij de vraag. Staan er vooral klachtvragen (*magnesium slapen*,
*magnesium kramp*) of interactievragen (*magnesium medicijnen*), dan beantwoordt
de titel iets anders dan wat men zoekt en is dát de volgende aanpassing.

---

## Wat er gewijzigd is (de interventie)

| | Vóór | Na |
|---|---|---|
| `/beste/magnesium` H1 | Welke magnesium past bij jou? | Beste magnesium: bisglycinaat, citraat of complex? |
| `/beste/magnesium` title | Beste magnesium supplement 2026 — onafhankelijk vergeleken | Beste magnesium 2026: bisglycinaat, citraat of complex |
| `/beste/magnesium` description | Vergelijk magnesiumsupplementen op vorm (…), dosering en prijs per dag. Onafhankelijke analyse voor mannen 30+. | Bisglycinaat, citraat of een 5-vormencomplex? … dagprijs (v.a. €0,20). Geen oxide als hoofdvorm, geen top-20. |
| `/supplementen/magnesium` H1 | Magnesium: welke vorm past bij jou? | Magnesium: wat het doet en hoeveel je nodig hebt |

**Deploydatum:** \_\_\_\_\_\_

Direct na de deploy: **URL-inspectie** op `/beste/magnesium` → *Indexering
aanvragen*. Zonder dat kan het weken duren voor Google de nieuwe titel ziet en
meet je de oude snippet.

---

## Nameting — na 3 weken

**Nameetdatum:** \_\_\_\_\_\_ (streef: 3 weken ná de deploy, zelfde vensterlengte)

`[OORDEEL]` Wees streng bij het lezen. **75 vertoningen in 90 dagen is te weinig
voor een CTR-conclusie** — van 0 naar 1 klik is 1,3%, dat is ruis. Wat je wél
kunt aflezen, in deze volgorde:

1. **Gem. positie.** Staat `/beste/magnesium` op positie 25+, dan is 0 klikken
   geen snippetprobleem maar een ranking-/autoriteitsprobleem, en verandert deze
   wijziging er weinig aan. Op positie 8–15 is de snippet wél de knop waar je aan
   draait. Dit bepaalt of de hele A4-aanpak zin heeft.
2. **Binair: 0 klikken of meer dan 0.** Genoeg om te besluiten of dezelfde
   behandeling naar de andere zes pagina's gaat.
3. **Verschoof de verdeling** tussen `/beste/magnesium` en
   `/supplementen/magnesium`? Dít is de eigenlijke toets op de H1-botsing, en
   die heeft geen grote aantallen nodig: als de vergelijking impressies wint die
   de gids verliest, is de cannibalisatie opgelost.

`[OORDEEL]` Wat géén conclusie is: een CTR-percentage dat stijgt of daalt bij
minder dan ~200 vertoningen. Noteer het getal, hang er geen besluit aan.

---

## Uitkomst

*(invullen bij de nameting)*

`[FEIT]`

`[OORDEEL]`

**Besluit:** dezelfde behandeling wel / niet uitrollen naar de overige zes
`/beste/*`-pagina's, omdat:
