# Opus-verdict — Kompas als aanbevelingsmotor per prioriteitslaag

> **Status:** besluitronde. Geen code, geen migratie, geen prebuild. Bouw blijft bevroren tot GO op sectie C.
> **Datum:** 20 augustus 2026
> **Aanleiding:** Dennis' pivot — Kompas wordt een aanbevelingsmotor per prioriteitslaag (gratis → betaald → affiliate → premium), postcode sorteert later mee, en de Consumentenbond-positionering wordt mogelijk herformuleerd.
> **Toetsingsgrond:** `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` · `BESLUIT_FIT_PREFS.md` · `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md` · `BRAND_POSITIONING.md` · `voortgang-plan-later.md` · `beweging-keuze-consumentenbond-prebuild-v3.6` · as-built `src/`.

**Twee bronnen uit de opdracht bestaan niet in de repo.** `.cursor/plans/ecosysteem_ia_analyse_5583e4a4.plan.md` en `.cursor/plans/kompas_uitwerking_0219f94c.plan.md` zijn er niet (`.cursor/plans/` bevat 34 andere bestanden). Ook de anchors `#s-b` / `#s-e` en de aanduiding "frame K" bestaan niet in v3.6: schermen schakelen via `data-go="b"` / `data-go="e"` (r701-706), en `renderKActies`/`renderKBridge` (r2059, r2091) zijn naar slaap-v2's `renderK` genoemd — ze zitten ín scherm E. Ik heb scherm B (`renderB`, r2317) en scherm E (`renderE`, r2187) gelezen als de bedoelde bronnen. Als die twee plan-bestanden inhoud dragen die dit verdict raakt, lever ze aan — dan herzie ik sectie C.

---

## A. Executive summary

**GO op de pivot — met één harde inperking en één herformulering die geen keuze meer is.**

De pivot is architectonisch goedkoper dan hij eruitziet, want de as-built loopt er al drie stappen naartoe. `LadderActionRow.tsx:38-45` heeft per ladderoptie al precies de twee handelingen die een aanbevelingskaart nodig heeft (opslaan in `account_favorites`, plannen in `agenda_blocks`), en `ladder-affordances.ts:26-27` heeft de derde — `dienst` — er als gedocumenteerde, uitgezette regel naast staan. De kaartvorm mét oordeel bestaat al in `SchapBasisCard` (`schap-basis-cards.ts:15-30`), inclusief `role: "Aanvulling op prioriteit 2 · …"` in `schap-diensten.ts:28`. De laag-naad bestaat al als sleutel (`leefstijl-ladder.ts:111-117`). Wat ontbreekt is niet een motor, maar één type dat die drie verbindt.

**De inperking.** `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md` §C1 (uitvoeringsbesluit, door jou genomen op 13 aug) zegt: vermelding mag op P2·P3·P4, geld alleen op P4, en de acceptatieregel is machinaal — *nul kaarten met `is_monetised: ja` of `zou_monetiseren: ja` bereikbaar vanaf P1, P2 of P3* (§C2, r.72). "Gratis → betaald → affiliate → premium op elke laag" botst daar frontaal mee. **Het spectrum is per laag begrensd, niet uniform.** Dat is geen afzwakking van je pivot; het is wat hem verdedigbaar houdt.

**De herformulering is al voorspeld.** Datzelfde document, §L1: *"Zeg je nee — dus ook commissie op P2/P3 — dan moet de positionering opnieuw geformuleerd worden vóór A1. Dat is dan een besluit over wat PerfectSupplement is, niet over een scherm."* Je pivot is die "nee". Sectie E levert de zin.

**Wat je nu wél doet:** GO/NO-GO tekenen op de zes items in sectie C, en daarna W1 (alleen een datacontract, geen scherm).
**Wat je nu níét doet:** Cursor openen. Kaarten schrijven. Aanbieders werven. Postcode aanraken. Premium bouwen. Slaap/stress/voeding aanraken.

---

## B. F1 verificatie-as-built

| # | Stelling uit de pivot | Verdict | Bewijs (pad:regel) |
|---|---|---|---|
| 1 | Kompas-domein toont vandaag alleen gratis + een deur | **WEL** | `DomainFreeActionsTile.tsx:48` eyebrow `Gratis, op prioriteit N`; `:83` *"Hier verdienen we niets aan"*; `BewegingKompasScreen.tsx:227-239` de deur is label-only met `buildDashboardFavorietenSchapHref` |
| 2 | Kompas-domein is nog een doe-surface (waarop de klaar-staat-gate slaat) | **NIET** | `BewegingKompasScreen.tsx:45-50`: de dagkaart is er sinds 20 aug af, *"Afvinken hoort op Mijn Dag"*; `:215` zegt dat ook in de UI. Er is geen open dagstap meer op dit scherm om tegen af te wegen |
| 3 | De kaartvorm mét Bond-oordeel bestaat al in code | **WEL** | `schap-basis-cards.ts:15-30` — `verdict: { gecheckt, sterk, zwak, oordeel, micro }`, plus `role`; `schap-diensten.ts:16-47` gebruikt hetzelfde type |
| 4 | Die kaarten dragen al een laag-koppeling | **DEELS** | `schap-diensten.ts:28` *"Aanvulling op prioriteit 2 · kracht + basisconditie"* — proza in een `role: string`, niet `layer_id: number`. Machinaal niet te toetsen |
| 5 | De ladderlaag kent kaarten | **NIET** | `DomainLifestyleLadder.tsx:7-13` `LifestylePriorityLayer` = id/name/subtitle/summary/actions; `lifestyle-priorities.ts:25-31` idem — `actions: string[]`, geen kind, prijs, oordeel of bron |
| 6 | De aanbevelingsengine kan diensten/begeleiding aan | **NIET** | `types/recommendation.ts:25-35` `RankedRecommendation` = supplementId + comparisonPath + efsaStatus. Supplement-only. `build-recommendations.ts:12-20` idem |
| 7 | Opslaan + plannen per optie bestaan al als handeling | **WEL** | `LadderActionRow.tsx:38-45` (FavoriteSaveButton → `account_favorites`) en `LadderMomentButton` (→ `agenda_blocks`); `ladder-affordances.ts:36` `BUILT_LADDER_AFFORDANCES = ["keuze","moment"]` |
| 8 | Een `dienst`-handeling is voorzien maar uit | **WEL** | `ladder-affordances.ts:25-27`: *"`dienst` → wat geld kost. Loopt vandaag via de deur naar het schap … een handeling per actie zou aanbod op een doe-surface zetten"* |
| 9 | Het schap is een echte tweede bestemming | **WEL, maar als iframe** | `VoortgangHub.tsx:145-152` rendert `PrebuildFrame src="favorieten-schap-v3.html"`. Geen React, geen gedeelde datalaag met de ladder |
| 10 | Het schap bestaat voor alle vijf domeinen | **NIET** | `schap-availability.ts:13` `SCHAP_DOMAINS = ["beweging"]` |
| 11 | De laag-naad ladder ↔ favoriet ↔ Mijn Dag bestaat | **WEL** | `leefstijl-ladder.ts:111-117` `laag-<domein>-p<n>-<slug>`; teruggelezen in `MijnKeuzeTile.tsx:70-72` |
| 12 | `AccountFavoriteKind` dekt de vier kaartsoorten uit de pivot | **DEELS** | `account-favorites.ts:4` = `activiteit \| supplement \| dienst`. `begeleiding` ontbreekt; `gratis` is geen kind maar een prijs-eigenschap |
| 13 | Postcode bestaat als lens | **WEL, alleen in de prebuild** | v3.6 `renderB()` r2340-2348: veld van 4 cijfers + fallbacktekst. Niets ervan in `src/` |
| 14 | Er zijn `recommendation.*`-events | **NIET** | `events.ts:8-94` — wel `choice.shelf_opened` (r57), `dashboard.schap_*` (r72-74), geen enkel recommendation-event |
| 15 | Prebuild scherm B groepeert kaarten per prioriteitslaag | **NIET** | `renderB()` r2317-2367: één vlakke lijst met lenzen (Voor jou / Bij jou) en typefilters (basis/dienst/product). De laag zit er niet in — `helpOn` filtert op één prioriteit, dat is het |
| 16 | Premium is een bouwbare kaartsoort | **NIET** | Alleen `premium.waitlist_joined` / `premium.price_indicated` (`events.ts:60-61`, `api/account/waitlist/route.ts:167,180`). Geen product, geen prijs, geen levering |

**De vier regels die dit samenvatten.** De motor is voor 70% gebouwd, maar hij staat op de verkeerde surface (schap-iframe) en spreekt de verkeerde taal (proza-`role` in plaats van `layer_id`). De klaar-staat-gate waar de hele L3-lock op rust, heeft op Kompas-domein sinds 20 augustus geen anker meer. De aanbevelingsengine kent alleen supplementen. En het schap bestaat voor precies één domein — dus "Favorieten als bestemming" is vandaag al eerder een beweging-artefact dan een architectuur.

---

## C. PIVOT-besluiten

### C1 · `BESLUIT_BEWEGING` §A.2 L3-gate ("advies achter deur, pas na klaar-staat") — **PIVOT**

De gate blijft bestaan, maar verhuist naar de surface die hem nog kan dragen. `A.2` r.41-44 formuleert hem als toestandsregel: *"zolang er een open stap staat, is de doe-laag de enige primary."* Op Kompas-domein staat sinds 20 augustus geen open stap meer (`BewegingKompasScreen.tsx:45-50`) — afvinken verhuisde naar Mijn Dag. Een gate zonder anker is geen bescherming; hij is een dode conditie die per ongeluk `false` blijft. **Besluit: `adviceMayOutrankDayStep` (Fable §C.4) gaat gelden op Mijn Dag, niet op Kompas. Kompas-domein wordt de adviessurface; Mijn Dag blijft de doe-surface en houdt daar de gate.**

**Wat kapotgaat.** `A.3` #14 (*"één vergelijk-deur, achter de analyse, gated op de klaar-staat"*) en `G.1` (*"Advies … bereikbaar vanuit Voortgang"*) vervallen als routing. Stepped care blijft een renderconditie — maar de conditie is voortaan *rang binnen de laag* (gratis staat altijd op 1), niet *zichtbaarheid van de laag*. Dat is een zwakkere garantie; C3 hieronder compenseert.

### C2 · `BESLUIT_FIT_PREFS` §4 / §6 ("geen fit-paneel op doe-surface E") — **REFINE**

Kleine correctie op de opdracht: dit is niet lock L4 (§2, r.27, die gaat over dag-0-intake) maar de lagenkaart-rij §4 r.61 plus het verbod in §6 r.87. Beide zijn geschreven toen E een doe-surface was. Nu E een keuzesurface is, verschuift hij in diezelfde lagenkaart één rij omlaag: naar *"Product/dienst (B) — Ja, lens + filter"*.

**Wat blijft hard:** L1 en L2 (r.24-25) — Bond-oordeel vast, fit sorteert, **nooit één samengevoegd cijfer**. En het verbod op een *paneel* blijft: fit is een lens/chip die de volgorde binnen één verdict-niveau zet, geen instellingenscherm op Kompas. Postcode blijft sessie-lokaal (zie C6 en Q7). Dit is dus geen PIVOT: de lock zelf blijft overeind, alleen de rij-toewijzing van surface E verandert — en die verandering volgt uit een besluit dat je al genomen hebt, niet uit dit verdict.

### C3 · `DomainFreeActionsTile` → aanbevelingskaart — **REFINE, niet herbouwen**

Dit is het goedkoopste item in dit document. `LadderActionRow.tsx` is de kaart al: één optie, tekst links, handelingen rechts, met `resolveLadderAffordances` als het enige punt waar handelingen aan- of uitgaan. Wat de kaart mist zijn drie velden (`bond_verdict`, `prijs_indicatie`, `product_source`) en één handeling (`dienst`, die al gedocumenteerd klaarstaat op `ladder-affordances.ts:25-27`).

**Besluit:** hernoem het blok naar `DomainLayerRecommendations`, laat de bron `LeefstijlLadderLayer.actions` verrijken naar `LayerRecommendation[]` (sectie D), en zet de `dienst`-affordance aan — maar alleen waar C6 dat toestaat. **Cap: maximaal 3 kaarten per laag, altijd de gratis kaart op rang 1.** De eyebrow `Gratis, op prioriteit N` (`:48`) en de regel *"Hier verdienen we niets aan"* (`:83`) worden conditioneel per kaart in plaats van per blok.

**Wat kapotgaat.** `BESLUIT_BEWEGING` §A.4 NIET-#3 (*"geen permanent gestapeld advies … dat is een schap"*) staat onder spanning. Mitigatie: de kaarten hangen aan de laag die je aanklikte — de klik ís de trigger — en laag 5/6 toont de reden-waarom-niet in plaats van kaarten, zoals nu al (`BewegingKompasScreen.tsx:176-180`).

### C4 · `MijnKeuzeTile` op Kompas — **KEEP tile, afvink eraf (21 aug 2026)**

De tile blijft: wat je koos, zonder merk/prijs/oordeel — op Kompas-home domeinoverstijgend en op het domeinscherm gescoped. Dat is de N4-lock voor *wat* je ziet.

**Precisering (21 aug):** sessie-lokale afvinkcirkels zijn verwijderd. `MijnKeuzeTile` is een **read-only snapshot** met CTA “Open Mijn Dag →” (`dashboard_mijn_keuze_open_agenda`). Afvinken leeft alleen op Agenda (`daily_action_log` + `agenda_blocks`) — geen tweede ledger, KILL #8 blijft. Event `dashboard_mijn_keuze_afgevinkt` is retired.

**Toekomst (W2+):** zodra de laag kaarten draagt, dreigt dubbeling — dezelfde keuze staat dan als kaart-in-gekozen-staat én als rij in Mijn keuze. **Besluit: op het domeinscherm wint de kaart.** `MijnKeuzeTile` verdwijnt daar en blijft alleen op Kompas-home (cross-domein, waar geen ladder staat).

### C5 · Favorieten/schap als surface — **PIVOT naar archief + kaartdetail**

Het schap is vandaag een iframe over één domein (`VoortgangHub.tsx:145-152`, `schap-availability.ts:13`). Als bestemming naast een ladder die kaarten draagt, is het een tweede plek met hetzelfde aanbod en een eigen waarheid. **Besluit: Favorieten wordt (a) het archief van wat je koos, met bron en laag in beeld, en (b) de detailweergave van één kaart — het volledige oordeel, de vier assen, de commissie-microcopy en de vergelijkingslink.** Het is geen eigen commerciële bestemming meer; het is waar een kaart dieper wordt.

**Wat kapotgaat.** De v3.6-lock N2 (Favorieten = twee secties, Aanbevolen + Mijn keuze) blijft geldig voor het archief, maar de "Aanbevolen"-sectie wordt een spiegel van de laag in plaats van een eigen lijst. `choice.shelf_opened` blijft leven zolang de schap-iframe leeft — dus tijdens W2 draaien beide voor beweging. Retire het event pas in W4, met een GA4-annotatie.

### C6 · Prebuild #b (scherm B) vs #e (scherm E) als normatief — **BEIDE DEELS; nieuwe synthese is normatief**

Scherm B is **niet** normatief zoals het staat, om drie redenen die niets met de pivot te maken hebben: het groepeert niet per laag (r2317-2367 is één vlakke lijst), het noemt echte ondernemingen met gefabriceerde reviews en exacte kilometers (al afgewezen in `schap-basis-cards.ts:5-13` en `AANBIEDERS §D4`), en het zet betaalde kaarten ongesorteerd naast gratis over álle prioriteiten — wat `AANBIEDERS §C2` r.72 machinaal verbiedt.

Scherm E is normatief voor de **vorm** (kdome, ladder, blok per aangeklikte laag, CTA-stapel) en die vorm staat al in `src/`.

**Besluit: normatief wordt "E-vorm draagt B-inhoud, begrensd per laag".** Concreet:

| Laag | Wat er op de Kompas-laag mag staan | Grond |
|---|---|---|
| P1 | Alleen gratis | `AANBIEDERS §A`-tabel: *"Geen aanbieder. Gratis, geen kaart nodig"* |
| P2 · P3 | Gratis + vermelding zonder commissie (`is_monetised: nee` **én** `zou_monetiseren: nee`) | §C1 |
| P4 | Gratis + vermelding + commissie toegestaan | §C1 / §D3 |
| P5 | Niets — mechanisme klaar, knop uit | §A-tabel |
| P6 | Alleen de reden-waarom-niet tot de poort open is (voedingscheck + hertest) | §A-tabel; as-built `BewegingKompasScreen.tsx:176-180` |

De prebuild v3.6 blijft de bron voor copy en vorm. Voor de *plaatsing van geld* wint `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1` — dat is het jongste uitvoeringsbesluit en het enige met een toetsbare acceptatieregel.

---

## D. Aanbevelingskaart-contract

Eén kaart hoort bij precies één laag van precies één domein. Geen kaart bestaat los van een laag — dat is wat een aanbeveling van een schap onderscheidt.

| Veld | Type / waarden | Bron vandaag | Regel |
|---|---|---|---|
| `layer_id` | `1..6` | ontbreekt; `role: string` in `schap-diensten.ts:28` is proza | **Verplicht.** Vervangt de proza-`role` als sleutel; `role` blijft als leescopy |
| `domain` | `PillarId` | `account-favorites.ts:28-34` | **Verplicht.** Samen met `layer_id` de plaatsingssleutel |
| `kind` | `gratis \| dienst \| product \| begeleiding` | nieuw | Stuurt copy en handelingen. **Niet** hetzelfde als `AccountFavoriteKind` (`activiteit \| supplement \| dienst`) — één mapping-functie, geen tweede enum: gratis→activiteit, product→supplement, dienst/begeleiding→dienst. `begeleiding` toevoegen aan `AccountFavoriteKind` mag pas als er een product is (§E) |
| `bond_verdict` | `ja \| mits \| niet \| geen \| nooit` | prebuild `VLABEL` r672; kaartvorm `schap-basis-cards.ts:22-29` | **Redactioneel oordeel over de optie**, per kaart, niet per account. Verwar nooit met `VerdictValue` (`types/verdict.ts:6`, `kopen\|niet_nodig\|eerst_leefstijl\|nooit`) — dat is de per-account supplementpoort en blijft een aparte gate vóór `product_source` |
| `bond_axes` | `{ gecheckt, sterk, zwak, oordeel }` | `schap-basis-cards.ts:22-28` | Ongewijzigd overnemen. Zonder alle vier geen kaart |
| `verdict_written_on` / `verdict_review_due` | ISO-datum | `AANBIEDERS §F2` | Verlopen oordeel = kaart valt uit de lijst, niet: kaart blijft met oude tekst |
| `fit_sort_keys` | `{ locatie?, begeleiding?, prijs?, reviews? }` | `BESLUIT_FIT_PREFS §3` | **Sorteert binnen hetzelfde `bond_verdict`-niveau. Nooit erover heen. Nooit samengevoegd tot één cijfer** (L1/L2) |
| `prijs_indicatie` | `gratis \| eenmalig \| maandelijks \| per_sessie` + optionele band | nieuw | **Bandbreedte of aard, nooit een exact bedrag vóór het oordeel** (`AANBIEDERS §J` copy-lock). Prijs staat altijd ná `bond_axes.oordeel` |
| `primary_cta` | label + doel | `LadderActionRow.tsx:38-45` | Precies één per kaart. Op `gratis`: plannen. Op `dienst`/`product`: het oordeel opendoen. Nooit een koopknop op Kompas |
| `save_to_favorites` | `boolean` | gebouwd — `FavoriteSaveButton` + `ladderActionFavoriteId` | Altijd `true`. Id-vorm `laag-<domein>-p<n>-<slug>` blijft de enige sleutel |
| `plan_to_agenda` | `boolean` | gebouwd — `LadderMomentButton`, `ladder-moments.ts` | `true` voor `gratis` en `dienst` (een afspraak is plambaar). `false` voor `product` (innemen is geen afspraak) |
| `product_source` | `affiliate \| hub \| premium_waitlist \| none` | `affiliate-links.ts` · `supplement-hub/catalog` · `api/account/waitlist` | **`affiliate` uitsluitend als `layer_id === 4`** (§C1). `hub` = interne route (`/beste/*` of gids) en is de default-uitgang. `premium_waitlist` alleen conform §E |
| `is_monetised` / `zou_monetiseren` | `boolean` | `AANBIEDERS §F2` | De machinaal toetsbare acceptatieregel: nul kaarten met een `ja` bereikbaar vanaf P1–P3 |
| `compliance_note` | string \| null | `approved-claims.ts` · `AANBIEDERS §H` | EFSA woordelijk bij `product`. Commissie-microcopy ná het oordeel bij `is_monetised`. `providerKind` bepaalt het AVG-regime bij een zelfstandige (§H2). Geen zorgaanbieders (§H5) |

### Voorbeeldkaart — beweging, laag 2

Op prioriteit 2 (*Kracht + basisconditie*) staat als tweede kaart een **dienst**: een krachtgroep voor 45-plussers, in de eigen regio. `layer_id` is 2, `domain` is beweging, `kind` is dienst. Het Bond-oordeel is **mits** — "Alleen als…" — en de vier assen staan er woordelijk zoals ze vandaag al in `schap-diensten.ts:38-45` staan: gecheckt is *of een vaste groep de opkomst verhoogt ten opzichte van zelfstandig trainen*; sterk is *vaste avond en groepsdruk werken voor wie zelf moeilijk begint*; zwak is *minder individuele aandacht dan een PT-intake, en het tempo ligt vast op de groep*; het oordeel is *sterke optie als het ritme je eerder ontbrak dan de kennis*. Het oordeel is geschreven in maart 2026 en herzien vóór maart 2027; daarna valt de kaart uit de lijst.

De fit-sleutels zijn `locatie: bij_mij` en `begeleiding: met_coach` — die bepalen of deze kaart boven of onder de andere **mits**-kaart komt te staan, en raken zijn oordeel niet. De prijsindicatie is `maandelijks`, zonder bedrag, en staat onder het oordeel. De primaire CTA is *"Lees ons oordeel →"* en opent de detailweergave op Favorieten; opslaan bij Mijn keuze en een moment plannen staan er als secundaire handelingen naast, allebei via de bestaande knoppen. `product_source` is `none` en zowel `is_monetised` als `zou_monetiseren` staat op nee — want laag 2, en daar loopt geen geld. De compliance-notitie noteert `providerKind: onderneming`, dus geen art. 14-informatieplicht, en de badge leest *"Bij jou in de buurt"* — nooit *"Partner"* (§J).

Erboven, op rang 1, staat de gratis kaart: *twee krachtsessies per week, vijf oefeningen, hele lichaam* — `kind: gratis`, oordeel **ja**, prijs `gratis`, plambaar, met de regel dat we er niets aan verdienen. Dat is de hele boodschap van de laag: dit is je plan, en dit zijn mensen die je erbij kunnen helpen.

---

## E. Consumentenbond herformulering

**Huidige claim** (`BRAND_POSITIONING.md:13`): *"De Consumentenbond van supplementen — maar dan voor jouw profiel."*

**Voorgestelde claim:** *"De Consumentenbond van leefstijl: we beoordelen álles wat je kunt kiezen — van een gratis gewoonte tot een betaalde coach — en zeggen er per keer bij wat we eraan verdienen."*

Wat er verandert is niet de belofte maar de **reikwijdte**. Vandaag zit het oordeel achter een deur en gaat het over potjes; in de nieuwe vorm draagt elke aanbeveling op elke laag een oordeel, en is "gratis" niet de afwezigheid van een oordeel maar zelf een beoordeelde optie. Dat is precies wat het onderscheid redt zodra er betaalde kaarten op de ladder komen te staan.

**UI-regels — drie, en ze zijn toetsbaar.**

1. **Geen kaart zonder oordeel.** Een optie zonder de vier assen rendert niet. Dat geldt ook voor gratis kaarten — juist voor gratis kaarten, want dat is waar de claim zijn geloofwaardigheid haalt.
2. **Dual readout, altijd gescheiden.** Het `bond_verdict`-niveau bepaalt de groep; `fit_sort_keys` bepaalt de volgorde binnen die groep. Geen gewogen score, geen "8,4 voor jou", geen sterren (`BESLUIT_FIT_PREFS` L1-L2). Toets: twee kaarten met hetzelfde `bond_verdict` mogen van volgorde wisselen bij een andere fit; twee kaarten met een ander `bond_verdict` nooit.
3. **Herkomstregel ná het oordeel, op élke kaart.** Ofwel *"Hier verdienen we niets aan"*, ofwel *"We ontvangen commissie als je hier klant wordt. Het oordeel is los daarvan opgesteld en verandert niet mee."* Beide staan al woordelijk in `schap-basis-cards.ts:45` en de prebuild `MICRO_COMMISSIE` (r695). Nooit prijs vóór oordeel (`AANBIEDERS §J`).

**Wat er vandaag in `BRAND_POSITIONING.md` §1 wijzigt: alleen de tekst, niets aan het product.**

| Regel | Wijzigt vandaag? |
|---|---|
| r.13 "Eén zin" | **Ja, doc-only.** Vervangen door de claim hierboven |
| r.17 *"Geen eigen producten; affiliate volgt de redactionele keuze, niet andersom"* | **Nee — en dit is de belangrijkste.** Het blijft waar en het is de reden dat `premium_waitlist` géén geranked kaartsoort mag zijn (zie J3) |
| r.19 *"Leefstijl eerst; supplement is tier 3"* | **Nee.** De rang-1-regel (gratis staat altijd bovenaan) is de nieuwe uitdrukking ervan |
| r.28 differentiatiematrix, rij "Belang" | **Ja, doc-only.** *"Beste keuze wint"* uitbreiden naar diensten |
| §5 "Wat je actief deelt" | **Ja, doc-only.** Voeg toe: *"we zeggen per aanbeveling of er geld op loopt"* — dat is nieuw publiek-onderscheidend materiaal |

Geen productwijziging vandaag. Het doc gaat vóór W1 om; de code volgt in W2.

---

## F. Vier surfaces — eindtoestand

| Surface | De vraag | Primair | Secundair | Expliciet NIET |
|---|---|---|---|---|
| **Kompas home** | Waar sta ik vandaag, over alle domeinen? | Je prioriteitsdomein + wat je koos, cross-domein (`MijnKeuzeTile` read-only + CTA Mijn Dag) | Eén regel per ander domein; deur naar het prioriteitsdomein | Geen afvinken (Mijn Dag); geen kaarten; geen prijs; geen oordeel-label |
| **Kompas domein** | Wat past bij mijn stand op déze laag? | Ladder (6 lagen, klikbaar) + **max 3 aanbevelingskaarten op de gekozen laag**, gratis op rang 1 | Stand + delta in de kop; fit als lens/chip; sluitregel naar Voortgang | Geen afvinken (Mijn Dag); geen fit-*paneel*; geen koopknop; geen kaart op P1/P5; geen commissie op P1–P3; geen postcode-invoer tot W5 |
| **Mijn Dag** | Wat doe ik nu, en is het gelukt? | De dag + afvinken (`daily_action_log`) | Verplaatsen, "niet vandaag" | Geen oordeel, geen merk, geen prijs, geen vergelijkingslink (N4); geen tweede afvinkbron (KILL #7/#8) |
| **Voortgang hub** | Beweegt het? | Leefstijllijn over vijf domeinen + tijdlijn van checks | Keuze-archief in één regel; doel/ijkpunt | Geen kaarten; geen aanbod; geen afvinken (`voortgang-plan-later.md:7-9`) |
| **Voortgang profiel (domein)** | Waar sta ik op dít domein, en waarom? | Stand + readout + ladder-dekking (`LadderCoverageMeter`) + de ladder als verklaring | Ijkpunt, hertest-CTA, supplement-stance | Geen kaart, geen prijs, geen vergelijkingslink (bestaande lock 4, blijft) |
| **Favorieten** | Wat koos ik, en wat vinden we er precies van? | Archief per domein/laag, met bron in beeld | **Kaartdetail:** vier assen, herkomstregel, vergelijkingslink | Geen eigen aanbevelingsvolgorde; geen tweede aanbod; geen doorstart als commerciële bestemming |

---

## G. Digital Twin Contract

Drie percentages, drie bronnen, drie surfaces. **Ze mogen nooit worden opgeteld tot één getal** — dat is hetzelfde soort fout als een gecombineerd bond×fit-cijfer.

| Percentage | Bron | Surface | Copy-guardrail |
|---|---|---|---|
| **Positie** | Domeinscore 0-100 uit de engine (`model.scores.<domein>`) + `getScoreBandShortLabel` + delta uit `buildLeefstijllijnRows` | Kompas domein (kop) + Voortgang profiel | Band + delta, **nooit "fase N van M"** — `BESLUIT_BEWEGING` §A.3 #12 KILLt de ordinale ladder. `buildMovementPositionLine` blijft kwalitatief. Zelfrapportage, geen diagnose |
| **Ladder-dekking** | `resolveMovementLadderCoverage` (`movement-ladder.ts:160-181`) — `onOrder / measured`, noemer = wat de check kán beoordelen | Voortgang profiel (`LadderCoverageMeter`) | *"Dit getal beweegt bij je hermeting, niet bij wat je hier aanklikt"* (`LadderCoverageMeter.tsx:58`) — staat er al, blijft. Breuk náást het percentage. Ongemeten is geen tekort. **Alleen beweging levert dit vandaag**; de vier andere domeinen tonen het niet in plaats van een 0 |
| **Uitvoering** | `daily_action_log` — de enige completion-bron | Mijn Dag | **Telt nooit wat je niet deed** (`§A.4` NIET-#4): geen "2 van 7", geen lege balken, geen rood als default. Een agenda-blok is een intentie en telt níét mee (Mijn Dag-verdict KILL #8) |

**Wat de twin níét is.** Geen biologische leeftijd, geen samengesteld gezondheidscijfer, geen wearable-afgeleide. Een wearable mag later dezelfde `layerBand` vullen en zo de noemer van *ladder-dekking* laten groeien (`movement-ladder.ts:145-151`) — dat is het enige koppelpunt, en het staat achter de §15-providerpoort. Alle drie de percentages dragen de regel: adviezen, geen diagnoses.

---

## H. Voortgang hub — wireframe in proza

- **Leefstijllijn bovenaan, vijf domeinen, één beeld.** Dit is het enige plek waar de vijf naast elkaar staan; het beantwoordt "beweegt het?" en niets anders.
- **Tijdlijn van checkpunten eronder** — verspringt alleen bij check of hermeting, `rules_version`-bewaakt. De gedragsteller uit `daily_action_log` woont op Mijn Dag en komt hier **niet** bij (twee klokken, nooit vermengd — Fable §C.1).
- **Keuze-archief als één regel per domein**, niet als lijst: *"Beweging · 3 keuzes, laatste op prioriteit 2 →"*. Doorklik gaat naar Favorieten, waar het archief woont. De hub toont geen kaarten.
- **Logboek-verhuizing.** Alles wat vandaag als teller, strip of checkbox op Voortgang staat, gaat naar Mijn Dag — dat is `voortgang-plan-later.md` §5 en §6, en die zeggen expliciet *"komt niet terug in Voortgang"*. Dit verdict opent dat niet.
- **Domein-instap per rij** naar Voortgang profiel, waar de ladder verklaart en `LadderCoverageMeter` het dekkingsgetal draagt.
- **Premium-placeholder: één regel, geen badge, geen knop.** `voortgang-plan-later.md` §8 is hier expliciet — vier badges in de navigatie maken de hele navigatie onbetrouwbaar, en de wachtlijst mag pas terug *"zodra er een product ís om op te wachten"*. Dus: één regel *"Wat er nog niet is →"* naar één pagina. Niets meer, tot §E-voorwaarden zijn vervuld.
- **Wat er níét bij komt:** geen aanbevelingskaart, geen prijs, geen vergelijkingslink, geen afvinkbaar element. De hub meet.

---

## I. Bouwgolven + gates

| Golf | Inhoud | Gate vóór start | Meetpunt |
|---|---|---|---|
| **W1** | **Datacontract only.** `LayerRecommendation`-type (sectie D) + `MovementProvider` (`AANBIEDERS §F2`) + mapping `kind` ↔ `AccountFavoriteKind`. Eén acceptatietest: *nul kaarten met `is_monetised` of `zou_monetiseren` = ja bereikbaar vanaf P1–P3*. Plus `BRAND_POSITIONING.md` §1 herschrijven (sectie E). **Geen scherm, geen route, geen migratie.** | **GO op alle zes items in sectie C** | Geen product-event. Af te lezen aan: `tsc` groen + de acceptatietest rood-naar-groen |
| **W2** | **Kompas-pilot, alleen beweging.** `DomainFreeActionsTile` → `DomainLayerRecommendations`; max 3 kaarten per laag; gratis op rang 1; `dienst`-affordance aan op P2–P4; laag 1/5/6 volgens de tabel in C6. Schap-iframe blijft náást de pilot draaien | W1 klaar; **PROEF uitgevoerd** (`AANBIEDERS §G3` — die blokkeert vandaag drie besluiten); minstens 3 aanbieders met geldig oordeel + `verdictReviewDue` | `recommendation.layer_viewed` · `recommendation.card_clicked` · `recommendation.chosen` (sectie K). Ratio `card_clicked` / `layer_viewed` per `kind` — daar lees je af of een betaalde kaart als hulp of als advertentie leest |
| **W3** | **Voortgang.** Hub volgens sectie H; keuze-archief als regel; `LadderCoverageMeter` blijft; twin-contract sectie G gecodificeerd | W2 twee weken live | `dashboard_statistieken_niveau` (bestaand, `voortgang-plan-later.md` §12) |
| **W4** | **Favorieten → archief + kaartdetail.** Schap-iframe uit; `choice.shelf_opened` retire met GA4-annotatie; `SCHAP_DOMAINS` verdwijnt als concept | W2-meting bevestigt dat de laag de bestemming vervangt (`card_clicked` > `shelf_opened`) | `recommendation.card_clicked{target:"detail"}` vs `choice.shelf_opened` — de kruising is het bewijs |
| **W5** | **Postcode + premium.** Fit-lens `Bij jou`; afstandsbanden (§D4); postcode sessie-lokaal (§H3). Premium alleen als §E-voorwaarden zijn vervuld | Apart besluit per onderdeel. **Premium blokkeert op "er is een product"**, niet op bouwtijd | `choice.shelf_opened{lens}` uitbreiden (§I); `has_postcode: true\|false`, **nooit de postcode zelf** |

> **Niets in Cursor vóór Dennis GO op sectie C.** W1 is een type plus een test plus een doc-wijziging — dat is bewust het kleinste ding dat de pivot onomkeerbaar maakt zonder een scherm aan te raken. De prompt-volgorde blijft: dit verdict → jouw GO per item → W1-implementatieprompt → Cursor.

**Wat expliciet buiten scope blijft:** native uitrol slaap/stress/voeding (W2 is één domein), hermeting/wearable/bloed, het dagstap-preselect-spoor (`MovementTodayHero` houdt zijn meetvenster — DEFER), en de zorgaanbieder-categorie (§H5).

---

## J. Tegenspraak-check

**J1 · "Spectrum op elke laag" botst met `AANBIEDERS §C1`.** Dennis' north star zegt gratis → betaald → affiliate → premium per prioriteitslaag. §C1 (r.60-62) zegt: commissie alleen op P4, en §C2 (r.72) maakt dat een machinaal toetsbare acceptatieregel. Dit is geen nuanceverschil — het is de directe tegenstelling die §L1 al voorzag: *"Zeg je nee … dan moet de positionering opnieuw geformuleerd worden."*
**Welke lock wint tot je kiest: §C1.** Het is een uitvoeringsbesluit van 13 augustus met een test eronder, jonger dan alles wat het overrulet, en de disclosure-zin op het schap (*"aan sommige opties verdienen we iets, aan andere niets"*) is vandaag alleen wáár doordat P1–P3 schoon zijn. Sectie C6 codeert dit als de begrenzing per laag. Wil je toch commissie op P2/P3, dan is dat een apart, expliciet besluit over wat PerfectSupplement ís — en dan moet sectie E vóór W1 opnieuw geschreven worden, scherper dan nu.

**J2 · Kaarten op de laag botsen met `BESLUIT_BEWEGING §A.4` NIET-#3.** *"Elk blok onder de vouw dat er altijd staat ongeacht wat de gebruiker deed — supplementenlijst, gidsen-links, begeleiding — is een schap, geen advies. Advies verschijnt op een trigger of verschijnt niet."* Drie kaarten die permanent onder elke laag staan, zijn per die definitie een schap.
**Welke lock wint tot je kiest: A.4 NIET-#3.** Mitigatie in C3 (de laagklik is de trigger; cap 3; P1/P5 leeg; P6 alleen de reden-waarom-niet) maakt het verdedigbaar, maar niet gratis. Concreet: **als een gebruiker geen laag aanklikt, staat de aanbevolen laag open met maximaal de gratis kaart** — betaalde kaarten verschijnen pas na een expliciete laagkeuze. Dat houdt "advies verschijnt op een trigger" letterlijk waar.

**J3 · Premium als kaartsoort botst met `BRAND_POSITIONING.md:17`.** *"Onafhankelijk | Geen eigen producten; affiliate volgt de redactionele keuze, niet andersom."* Premium co-review is een eigen product. Een eigen product dat door je eigen Bond-oordeel geranked wordt naast de opties waar je niets aan verdient, is precies de structuur die de claim breekt — en de lezer die dat merkt, komt niet terug met een correctie.
**Welke lock wint tot je kiest: BRAND_POSITIONING.** Concreet voor W2: `premium_waitlist` krijgt **geen `bond_verdict` en geen rangpositie**. Het is hooguit één visueel afwijkende regel onder de kaarten (*"Dit doen we later zelf →"*), of het staat er niet. Voor Q8 betekent dat: premium co-viewing hoort op Voortgang, achter de §H-regel (één regel, geen badge, geen knop, tot er een product is), en er wordt nu niets aan gebouwd.

**J4 · `BESLUIT_FIT_PREFS §4` r.61 botst met fit-sortering op Kompas.** De lagenkaart zegt letterlijk *"Kompas / doe-surface (E) — Nee, geen fit-paneel"*.
**Geen echte tegenspraak, mits je C2 leest zoals hij bedoeld is:** de rij beschrijft een *doe-surface*, en Kompas-domein is dat sinds 20 augustus niet meer (`BewegingKompasScreen.tsx:45-50`). De lock op het *paneel* blijft; alleen de rij-toewijzing verschuift. L1 en L2 blijven onaangeroerd. Wel doc-onderhoud: `BESLUIT_FIT_PREFS §4` en §6 moeten in W1 één regel bijgewerkt worden, anders leest de volgende chat de oude toewijzing terug.

**J5 · Postcode op Kompas botst met `AANBIEDERS §H3`.** De prebuild toont een postcodeveld (r2340-2348); §H3 verbiedt persisteren, verbiedt het in élke event-payload, en verbiedt combinatie met check-antwoorden in één record.
**Geen tegenspraak zolang W5 apart blijft.** Sessie-lokale component-state, `has_postcode: true|false` in de payload, afstandsbanden in plaats van kilometers (§D4). Dat is uitvoerbaar — maar het is de reden dat postcode W5 is en niet W2: één slordige `useEffect` die de postcode in prefs schrijft, is een AVG-incident.

---

## K. Meetpunten — specificatie, niet registratie

Drie nieuwe events voor ná W2. Elk vereist registratie op **drie plekken**; let op dat dit account-scoped events zijn, dus het account-pad, niet het intake-pad uit `CLAUDE.md`:

1. `src/lib/events.ts` — `DOMAIN_EVENT_TYPES` (r.8-94)
2. `src/lib/account-events-client.ts` — `ClientEmitType` (r.3-19)
3. `src/app/api/account/events/route.ts` — `CLIENT_EMIT_TYPES` (r.9-24)

| Event | Payload | Hier lees je aan af |
|---|---|---|
| `recommendation.layer_viewed` | `{ domain, layer_id, card_count, has_paid: boolean, source: "default" \| "click" }` | Of mensen door de lagen bewegen of op de aanbevolen laag blijven — en of een laag mét betaalde kaart anders bekeken wordt. `source` scheidt de defaultstand van een echte laagkeuze (J2) |
| `recommendation.card_clicked` | `{ domain, layer_id, kind, bond_verdict, product_source, position, target: "detail" \| "plan" \| "save" }` | De kernratio per `kind`: klikt iemand een betaalde kaart even vaak als een gratis kaart op dezelfde laag? En leest hij het oordeel (`target:"detail"`) of slaat hij het over? |
| `recommendation.chosen` | `{ domain, layer_id, kind, bond_verdict, product_source, favorite_id }` | De enige conversie die telt op deze surface. `favorite_id` is de bestaande `laag-<domein>-p<n>-<slug>`-sleutel, dus de keten ladder → favoriet → Mijn Dag blijft één spoor |

**Payload-regels, hard.** Geen postcode (§H3). Geen aanbiedersnaam in GA4 of Clarity — alleen `slug`, en alleen server-side in `domain_events` (§I). Geen vrije tekst. `bond_verdict` mag mee omdat het redactioneel is en niet persoonsgebonden; `VerdictValue` (per account) mag **niet** mee.

**Bestaand event:** `choice.shelf_opened` (`events.ts:57`) blijft geldig **zolang het schap een aparte bestemming is** — dus tot W4. Bij retire: GA4-annotatie op de verhuisdatum, en de vier huidige emitters opruimen (`KompasOndersteuningTile.tsx:89`, `LeefstijlprofielDomeinScherm.tsx:270`, `BewegingKompasScreen.tsx:88`, `MeerHulpBridgeSheet.tsx:53`). De uitbreiding met `lens: 'profiel'|'lokaal'` uit `AANBIEDERS §I` hoort bij W5, niet eerder.

**Meetpunt van deze ronde:** geen product-events — dit is een besluitronde. Effect af te lezen aan tijd tot GO, het aantal OPEN items in sectie C na review, en of W1 binnen twee weken start.

---

## L. Wat je nu moet tekenen

| # | Besluit | Advies |
|---|---|---|
| C1 | L3-gate verhuist van Kompas naar Mijn Dag | **PIVOT — ja** |
| C2 | Fit sorteert op Kompas; paneel blijft verboden; L1/L2 hard | **REFINE — ja** |
| C3 | `DomainFreeActionsTile` → `DomainLayerRecommendations`, cap 3, gratis op rang 1 | **REFINE — ja** |
| C4 | `MijnKeuzeTile` blijft (read-only); afvink alleen Mijn Dag; verdwijnt in W2 van domeinscherm | **KEEP tile + afvink eraf — gedaan 21 aug** |
| C5 | Favorieten wordt archief + kaartdetail | **PIVOT — ja** |
| C6 | Normatief = E-vorm × B-inhoud, begrensd per laag volgens `AANBIEDERS §C1` | **PIVOT — ja** |
| J1 | Commissie blijft op P4 (of: apart besluit om dat te openen) | **§C1 wint — bevestig** |
| J3 | Premium krijgt geen `bond_verdict` en geen rang | **BRAND wint — bevestig** |
