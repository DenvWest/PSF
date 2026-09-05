# Besluit — blijft `/beste/*` per categorie bestaan?

**Datum:** 4 september 2026 · **Aanleiding:** omega-3-contentcluster (Spoor B uit [NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md](NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md))
**Vraag:** moet er een `/beste/*`-pagina per categorie blijven, en/of moet elk supplement er een krijgen?

## Besluit in één zin

`[OORDEEL]` **Ja, `/beste/*` blijft — maar per categorie, niet per supplement**, en de rolverdeling met `/supplementen/*` wordt hard gemaakt omdat die twee elkaar nu op de belangrijkste stoffen kannibaliseren.

## Wat er nu staat

| Route | Aantal | Zoekintentie | Monetisatie |
|---|---|---|---|
| `/beste/{stof}` | 7 (magnesium, omega-3, ashwagandha, vitamine-d, creatine, zink, eiwitpoeder) | commercieel ("beste X", "X vergelijken") | affiliate |
| `/supplementen/{stof}` | 8 (idem + melatonine) | informationeel ("wat is X", "welke vorm") | geen |
| `/supplementen` (hub) | 1 | navigatie/overzicht, PS-Score | geen |
| `/wat-is-omega-3`, `/waar-let-je-op-bij-omega-3` | 2 (alleen omega-3) | informationeel | geen |

## Bevinding 1 — de kannibalisatie zat niet waar de SEO_RULES hem zoekt

`[FEIT]` `SEO_RULES.md` bewaakt kannibalisatie tussen *blogparen* (magnesium-en-slaap × magnesium-en-slaapkwaliteit). Het echte duplicaat zat een laag hoger, in de H1's van de twee paginatypen zelf:

| Stof | `/supplementen/{stof}` H1 | `/beste/{stof}` H1 |
|---|---|---|
| omega-3 | "Omega-3: welke vorm past bij jou?" | "Welke omega-3 visolie past bij jou?" |
| magnesium | "Magnesium: welke vorm past bij jou?" | "Welke magnesium past bij jou?" |

`[OORDEEL]` Twee URL's die vrijwel dezelfde zin als H1 voeren, concurreren op dezelfde zoekopdracht. Dat is precies de situatie die op magnesium te zien is in de nulmeting: 75 impressies die *niet* op de `/beste/`-URL landen. Google kiest er zelf één, en niet noodzakelijk de pagina die geld verdient.

`[FEIT]` De overige stoffen hebben dit probleem niet: daar voert `/beste/*` al "Beste X supplement 2026 — onafhankelijk vergeleken".

## Bevinding 2 — meer `/beste/*`-pagina's zou het probleem vergroten, niet oplossen

`[FEIT]` Melatonine heeft bewust géén `/beste/*`-pagina (`comparisonHref: null` in `src/data/supplement-hub/catalog.ts`) omdat er niet genoeg vergelijkbare producten zijn.

`[OORDEEL]` Dat is de juiste regel en die houden we aan: **een `/beste/*`-pagina bestaat alleen waar minimaal drie producten langs dezelfde meetlat te leggen zijn.** Een vergelijkingspagina met één of twee producten is per definitie geen vergelijking; hij zou bovendien precies de vorm hebben die Google onder *scaled content abuse* schaart — veel vergelijkbare pagina's zonder eigen waarde. De risico-verhouding is ongunstig: nul extra klikbaar zoekvolume, wél verdunning van de autoriteit die nu over 7 pagina's verdeeld is.

## Bevinding 3 — de root-pagina's zijn de echte overbodigheid

`[FEIT]` Alleen omega-3 heeft twee losse root-URL's: `/wat-is-omega-3` (301 regels) en `/waar-let-je-op-bij-omega-3` (392 regels). Hun onderwerp valt samen met `/supplementen/omega-3`; geen andere stof heeft dit patroon.

`[OORDEEL]` Dit is een historisch overblijfsel en de enige plek waar een derde laag bestaat. Aanbeveling: **niet uitbreiden naar andere stoffen**, en op termijn samenvoegen met `/supplementen/omega-3` via 301. Nog niet nu uitgevoerd — eerst meten of ze eigen impressies hebben; ze zijn niet als aparte rij teruggekomen in de nulmeting.

## De rolverdeling die vanaf nu geldt

| Laag | Route | Eigenaar van | H1-vorm |
|---|---|---|---|
| Overzicht | `/supplementen` | "welke supplementen zijn er", PS-Score naast elkaar | catalogus |
| Uitleg | `/supplementen/{stof}` | "wat is X", "welke vorm", "hoe werkt het" | *"X: wat … doet en hoeveel je nodig hebt"* |
| Vergelijking | `/beste/{stof}` | "beste X", "X vergelijken", "X kopen" | *"Beste X supplement: … op … en prijs per dag"* |
| Long-tail | `/blog/{vraag}` | één concrete vraag per artikel | de vraag zelf |

**Regel:** een H1 op `/supplementen/{stof}` mag nooit de vorm "welke X past bij jou" hebben — die zin hoort bij de vergelijking. En een `/beste/*`-pagina begint altijd met "Beste".

## Wat in deze wijziging is uitgevoerd

- `/supplementen/omega-3`: H1 en meta naar informationele intentie ("Omega-3: wat EPA en DHA doen en hoeveel je nodig hebt").
- `/beste/omega-3-supplement`: H1 en snippet naar commerciële intentie, met een onderscheidend element in de title zelf ("op mg EPA+DHA, niet mg visolie") conform Spoor A uit de nulmeting.
- Zeven nieuwe omega-3-artikelen die elk één afgebakende zoekvraag beantwoorden en naar `/beste/omega-3-supplement` én `/supplementen` linken.

## Openstaand — bewust niet nu gedaan

`[OORDEEL]` **Magnesium heeft dezelfde H1-botsing, maar 75 impressies te verliezen.** Omega-3 stond op nul, dus daar was de wijziging risicoloos. Bij magnesium is het advies dezelfde behandeling, maar pas na een bewuste keuze van Dennis en met een CTR-meting vóór en na — niet als bijvangst van een contentwijziging.

Volgorde die daarbij hoort:
1. Search Console: welke URL rankt nu op "magnesium vergelijken" en "beste magnesium"?
2. Rankt `/supplementen/magnesium` op de commerciële zoekopdracht, dan is de H1-wissel winst; rankt `/beste/magnesium`, dan alleen de gids aanpassen.
3. Na 3 weken CTR terugkijken op dezelfde impressie-orde.

## Meetpunt

`artikel_supplementen_hub_click` (GA4) — vuurt op de nieuwe hub-link onderaan elk supplementartikel, met `artikel` (slug) en `doel` als parameters. Hier lees je af of de contentlaag daadwerkelijk doorstuurt naar de supplementenafdeling, los van de bestaande vergelijkings-CTA.
