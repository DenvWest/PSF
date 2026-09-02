# Nulmeting — /beste/* vergelijkingen

**Datum:** 2 september 2026 · **Bron:** Search Console, periode laatste 3 maanden (31 mei – 2 sep 2026)
**Waarom:** stap 2 uit Deel B, [VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md](VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md) — nulpunt vóór stap 3 (één acquisitiekanaal, 3 weken).

## Resultaten per vergelijking

Bron: tabblad **Pagina's**, gefilterd op `+beste` (bevat), laatste 3 maanden.

| Pagina (URL) | Impressies (90d) | Klikken | Eigen blogartikelen over de stof |
|---|---|---|---|
| `/beste/vitamine-d` | 190 | 0 | 9 |
| `/beste/melatonine` | 7 | 0 | — (niet onderzocht) |
| `/beste/creatine` (perfectsupplement.nl) | 2 | 0 | 1 |
| `/beste/creatine` (www.perfectsupplement.nl) | 3 | 0 | *dubbeltelling, zie www-issue* |
| `/beste-creatine` (koppelteken, oude URL?) | 1 | 0 | *dubbeltelling* |
| `/beste/eiwitpoeder` | 1 | 0 | 0 (whey specifiek) |
| magnesium — géén eigen rij in Pagina's-tabblad; 75 impr. zaten op zoekopdracht-niveau, elders binnenkomend | — | 0 | 2 |
| omega-3, ashwagandha, zink | 0 (niet in top-6, niet onderzocht of ze er ná rij 6 nog staan) | 0 | 0-1 elk |

*(nog te doen: Positie-kolom, paginering voorbij rij 6 checken voor omega-3/ashwagandha/zink, GA4 affiliate-events)*

## Wat dit al zegt

`[FEIT]` Magnesium, omega-3 en whey: alle drie **0 klikken over 3 maanden**, ondanks impressies bij magnesium (75) en relevante zoekvolume bij vitamine D ("welke vitamine d is het beste" alleen al 62 impressies, "beste vitamine d" 56).

`[OORDEEL]` Dit is het scenario dat het verdict voorzag: content bestaat, rankt soms zelfs (impressies zijn er), maar converteert nul keer naar een klik. Twee mogelijke verklaringen, te onderscheiden zodra de Positie-kolom erbij staat:
- **Lage positie** (pagina 2+): mensen zien de resultaten niet → is een autoriteits-/indexatieprobleem, geen contentprobleem. Stap 3 wordt dan een linkbuilding-/autoriteitsvraag, niet een contentvraag.
- **Redelijke positie, toch geen klik**: titel/meta-description trekt niet door tegen de concurrentie. Dat is wél een contentvraag — snippet-copy aanpassen valt binnen stap 3 zonder de pagina zelf te herschrijven.

`[OORDEEL]` De vreemde eend "magnesium in combinatie met medicijnen" (70 impr.) rankt voor iets waar de vergelijkingspagina waarschijnlijk niet primair op geoptimaliseerd is — check of dat een aparte contentbehoefte is (mensen zoeken interacties, niet "beste product") die een eigen antwoord verdient, los van de vergelijkingspagina zelf.

## Bevinding: contentgat per stof, niet alleen distributie

`[FEIT]` Aantal blogartikelen dat daadwerkelijk over de stof zélf gaat (slug/onderwerp, niet losse vermelding), geteld op 2 sep 2026:

| Stof | Eigen blogartikelen | Impressies (90d) |
|---|---|---|
| vitamine-d | 9 (`vitamine-d-en-energie`, `-tekort-herkennen`, `-en-slaap`, `-meten-wanneer-zinvol`, `-zon-nederland`, `-seizoenen-jaarritme`, `-hoge-doses-social-media`, `-en-k2-samen`, `-aandoeningen-onderzoek`) | 190 |
| magnesium | 2 (`magnesium-en-slaap`, `-en-slaapkwaliteit`) | 75 (niet via /beste/-URL zelf) |
| creatine | 1 (`creatine-en-herstel`) | 2-3 (gesplitst over URL-varianten) |
| omega-3, ashwagandha, zink, whey | 0-1 | ~0 |

`[OORDEEL]` Dit **relativeert** het verdict van 30 augustus op één punt. Het verdict concludeerde puur distributie ("geen enkele extra regel code lost het op"). Deze correlatie tussen eigen-artikelen-aantal en impressies zegt iets anders voor zes van de zeven stoffen: er is weinig ondersteunend materiaal om te vinden of naar te linken. Vitamine-d is niet toevallig de uitschieter — het is de enige stof met een aanzienlijk contentcluster eromheen.

Dit is geen tegenspraak van B4 ("bouw niets in september") maar een precisering van wélk soort werk stap 3 zou moeten zijn ná de meetperiode: niet automatisch een puur off-page acquisitiekanaal (fora, nieuwsbrieven), maar mogelijk eerst uitzoeken of het contentgat de bottleneck is bij de zes zwakke stoffen, terwijl vitamine-d (heeft al het cluster, 190 impressies, 0 klikken) een zuiver conversie-/autoriteitsvraagstuk is los van content.

## www vs. non-www — technisch gat, gefixt op 2 sep 2026

`[FEIT]` `/beste/creatine` stond drie keer in Search Console: `perfectsupplement.nl/beste/creatine`, `www.perfectsupplement.nl/beste/creatine`, en `perfectsupplement.nl/beste-creatine` (koppelteken, al gedekt door een 301 in `next.config.ts`, alleen nog niet uitgefaseerd uit de index). Oorzaak: `/etc/nginx/conf.d/perfectsupplement.conf` bediende `perfectsupplement.nl` én `www.perfectsupplement.nl` op één server-block zonder onderlinge redirect — de canonical-tag (`src/lib/seo/canonical.ts`, altijd non-www) werd dus niet afgedwongen op HTTP-niveau, en Google kon `www.` los crawlen en indexeren.

**Fix (server, niet `src/`):** `www.perfectsupplement.nl` heeft nu een eigen HTTPS-server-block met `return 301 https://perfectsupplement.nl$request_uri;`, vóór het Next.js-proxyblock. Toegepast en geverifieerd op 2 sep 2026 — `curl -I https://www.perfectsupplement.nl/beste/creatine` geeft nu 301 naar de non-www-URL, non-www blijft 200. Backup van de oude config staat op de server als `/etc/nginx/conf.d/perfectsupplement.conf.bak-20260902094941`. Impressies/klikken op www-URL's zullen in Search Console vanaf nu niet meer groeien; bestaande www-indexatie dooft vanzelf uit naarmate Google herindexeert (weken, geen actie nodig).

## Stap 3 — plan om klikken en vertoningen te krijgen

Besluit 2 sep 2026: geen verdere cijferjacht (positie-kolom, paginering voorbij rij 6). Genoeg beeld om te bewegen. Twee sporen naast elkaar, niet na elkaar — ze raken andere pagina's.

### Spoor A — vitamine-d: 190 impressies ombuigen naar klikken

`[FEIT]` Enige pagina met echt volume. Content en ranking zijn er al (9 eigen artikelen, 190 impressies/90d); de 0-klik-uitkomst wijst op de snippet, niet op de pagina zelf. `[FEIT]` Huidige `seoTitle`: *"Beste Vitamine D Supplement 2026 — D3 en D3+K2"* (`src/data/supplements/vitamine-d.ts:18-19`) — generiek, concurreert met elke andere vergelijkingssite op exact dezelfde zin.

**Actie:**
1. Herschrijf `seoTitle` + `seoDescription` in `src/data/supplements/vitamine-d.ts` naar een snippet die zich onderscheidt — bijv. een concreet element uit de intro ("zonder afgewezen hartclaim", "3 producten, geen 20") in de title zelf, niet pas in de description.
2. 2-3 varianten opstellen, één live zetten, na 2-3 weken CTR in Search Console terugchecken (Prestaties → filter op deze pagina → CTR-trend).
3. Check of er een FAQ-blok op de pagina staat dat in aanmerking komt voor een FAQ-rich-result (CLAUDE.md noemt dit als SEO-standaard) — dat vergroot het snippet in de resultatenpagina zonder aan positie te hoeven werken.

**Kost:** een paar uur copy, geen bouwwerk. Meetbaar zonder aanname: CTR vóór/na op dezelfde impressie-orde-grootte.

### Spoor B — de overige zes stoffen: contentgat dichten vóór distributie

`[OORDEEL]` Fora/nieuwsbrieven proberen (het verdict se generieke stap-3-suggestie) heeft weinig om naartoe te wijzen: creatine heeft 1 eigen artikel, omega-3/ashwagandha/zink/whey hebben er 0-1. Voordat een extern kanaal zin heeft, moet er iets staan wat mensen die er via Google of een link binnenkomen ook vasthoudt en waar Google iets van kan indexeren.

**Actie — klein, per stof, geen nieuwe /beste/*-pagina's (die staan er al):**
1. Kies de twee stoffen met het duidelijkste bestaande zoekvolume-signaal om mee te beginnen — op basis van wat er al is: **magnesium** (75 impressies, ook al op interactie-vraag "in combinatie met medicijnen") en **creatine** (heeft al 1 artikel als anker).
2. Eén nieuw artikel per stof dat een concrete, veelgestelde vraag beantwoordt (niet nog een "wat is X"-overzicht) — voor magnesium ligt "magnesium met medicijnen" al klaar als onderwerp, want dat zoekwoord haalt nu al 70 impressies zonder dat er een dekkend antwoord voor bestaat.
3. Elk nieuw artikel linkt naar de bijbehorende `/beste/*`-pagina (bestaande interne-link-conventie, geen affiliate-link in de blogpost zelf — CLAUDE.md-regel).
4. Pas ná dat artikel: overweeg één extern kanaal voor die specifieke stof, niet generiek voor alle zeven.

**Kost:** 1-2 artikelen, binnen de bestaande contentstructuur — geen nieuwe architectuur, geen dashboard-werk. Dit is geen tegenspraak van "bouw niets in september": het is contentwerk op wat al live staat, niet featurewerk.

### Wat dit niet is

Geen nieuwe `/beste/*`-pagina's, geen dashboardwerk, geen advertentiebudget (het verdict sloot dat expliciet af zonder conversiedata). Spoor A en B raken alleen bestaande content en twee nieuwe artikelen — het kleinst mogelijke ingrijpen om van 0 klikken naar een eerste signaal te komen.
