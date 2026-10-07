# Besluit: Patroon zonder zijbalk, alle kernstoffen geteld, gevolgde stoffen als volwaardige stof, Trend per periode met "waarom"

**Datum:** 6 oktober 2026
**Status:** Gebouwd op `feat/patroon-stof-trend`, wacht op Dennis' akkoord op :3003
**Bouwt voort op:** `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`, `BESLUIT_MICRO_IN_BEELD_2026-10.md`
**Herziet:** `context-rail.ts` (Hermeting in de Voortgang-navigatie), Trend "zes weken per week" uit `nutrition-trend.ts` (verwijderd)

## Aanleiding

Dennis' feedback op Je patroon:

1. De linker zijbalk bij Patroon (Je patroon · Hermeting) past niet meer bij voeding en supplementen.
2. "1 van 2 meetbare kernstoffen op je norm": er zijn toch meer kernstoffen?
3. Kan "Ook gevolgd" dezelfde functie krijgen als de kernstoffen (stof · norm · bron), gekoppeld aan voeding en supplementen, ook voor nieuwe micronutriënten later?
4. Trend loopt achter op de andere tabs. Kan er per micronutriënt feitelijk staan waarom hij niet aan de norm voldoet? Als je maaltijden overslaat is er geen betrouwbaar dagantwoord, maar over één gemeten maaltijd valt wel iets te zeggen. Dus: dag, 7 dagen, 30 dagen en kiezen.

## Besluiten

### 1. Hermeting uit de navigatie, zijbalk weg op Patroon

- `VOORTGANG_RAIL_ITEMS` bevat alleen nog Je patroon. Met één item valt er niets te kiezen, dus verdwijnen de linker rail (md+) en de ingeklapte balk (mobiel) op Patroon.
- Het hermeting-scherm zelf blijft bestaan en is bereikbaar via de hermeting-herinnering. De brede check wordt niet meer aangeboden (`BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md`, bijvangst: de hermeting loopt sinds 17 sep dood). De scoring-engine en de hermeting-deltalogica blijven ongemoeid (voedingsfocus §170).

### 2. De telling noemt alle vijf kernstoffen

"1 van 2 meetbare" las alsof er twee kernstoffen waren. Nu: "**x van 5** kernstoffen op je norm (…)", met per groep waarom de rest niet:
- *Nog niet:* bewijsbaar, met norm, niet gehaald.
- *Met een dagboek niet aan te tonen:* zink, vitamine D (`NIET_BEWIJSBAAR`).
- *Zonder vaste norm:* eiwit rekent met je eigen doel.

### 3. Gevolgde stoffen krijgen hetzelfde stof-detail

- De tabel "Ook gevolgd" heeft dezelfde vorm als de kernstoffen: **stof · norm · voor wie · bron**, gemiddeld per dag, deel van de norm. Een tik opent het stof-detail.
- Het stof-detail is generiek (`StofDetailGegevens`): norm met bron voluit, eigen streefwaarde, per maaltijd, jouw bronnen, rijkste voedingsbronnen met zoeken, ＋ naar het dagboek en ☆.
- **Supplementkoppeling op één plek:** `supplementVergelijkingVoor` in `nutrition-stof-meting.ts`. Kernstoffen gaan naar hun `/beste/*`; voor een gevolgde stof staat er "nog geen supplementvergelijking: hier gaat het via voeding" tot er een vergelijking bestaat. Dan is het één regel in `VERGELIJKING_GEVOLGD`, geen schermwerk.
- **Nieuwe micronutriënten:** alles leest `NUTRIENT_ORDER` (kernstoffen) en `VOEDINGSWAARDE_VELDEN` (gevolgde stoffen). Een stof die daar bij komt, verschijnt vanzelf in de tabel, het detail, Trend en de URL-stand.
- Gevolgde stoffen blijven informatief: balk neutraal, geen "gehaald"-pil, geen kleur in Trend (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`).
- Zoeken bij een gevolgde stof toont alleen voeding: de supplementcatalogus draagt alleen kernstoffen.

### 4. Trend: dezelfde periodekiezer, schaal volgt de periode, "waarom" in feiten

- **Periodekiezer** gedeeld met Per maaltijd en Per stof: Vandaag · 7 dagen · 30 dagen · Kies.
- **Schaal:** één dag → per maaltijd; tot 14 dagen → per dag; langer → per week (gemiddeld per geregistreerde dag).
- **Volledige dag = ontbijt, lunch én avondeten geregistreerd.** Drie staten, nooit rood:
  - *gehaald* (sage): zonder benaderingen boven de norm. Mag ook op een onvolledige dag, want een ondergrens die de norm haalt is bewijs;
  - *onder de norm* (terra): alleen op een volledige dag;
  - *onvolledig* (gearceerd): onder de norm, maar er mist een hoofdmaaltijd, dus geen dagoordeel.
  Onder elke dag staat "2/3" (hoofdmaaltijden geregistreerd).
- **Per maaltijd geen kleur:** een maaltijd haalt geen dagnorm (`BESLUIT_MICRO_IN_BEELD_2026-10.md` §2). Wel het deel van de dagnorm.
- **Omega-3** blijft een periodetotaal (norm × kalenderdagen); per dag geen kleur.
- **"Waarom niet" per stof**, alleen feiten die het systeem kent (`nutrition-stof-trend.ts`):
  - niets geregistreerd; of de reden waarom een dagboek de stof niet kan aantonen;
  - op je volledige dagen gemiddeld X: Y% van de norm (met de norm);
  - hoeveel dagen een hoofdmaaltijd missen ("daar is onder de norm geen antwoord");
  - als niet alle dagen volledig zijn, wat er per maaltijd wél te zeggen is: "ontbijt 70 mg (20% van de dagnorm), 3×";
  - welke producten geen gehalte voor deze stof hebben en dus niet meetellen.
  Geen "je hebt een tekort", geen supplementadvies in deze regels.
- Een tik op de stofnaam in Trend opent het stof-detail in Per stof.

### 5. Trend als box van 0–100%, schatting voor de ontbrekende maaltijd, paneel ernaast (7 okt 2026, akkoord Dennis)

- **Box van 0 tot 100% van de norm.** De bovenrand is de norm; hulplijn op 50%. Boven de norm vult de staaf de box en staat er een label ("140%"). Het losse normlabel rechts vervalt. Zonder norm (eiwit zonder doel) blijft de schaal in de eenheid.
- **Onvolledige dag: had je het alsnog gehaald?** Gestippeld bovenop de staaf: het gemiddelde van je **eigen** registraties van de ontbrekende hoofdmaaltijd(en) in de periode, alleen vanaf 3×. Minder vaak: alleen "je avondeten moet nog X leveren voor de norm". De dag blijft "onvolledig" — een schatting kleurt nooit groen. Niet bij omega-3 (periodetotaal) en niet als de dag de norm al haalt; per week geen schatting.
- **Paneel naast de grafiek** (eronder onder 560 px tegelbreedte, via `@container`): uitleesregel, schatting, verdeling per maaltijd (per week: gemiddelde en aantal keer), top 3 bronnen, en de "waarom"-regels van de periode.

Volgt nog, apart: eetpatroon ("welke maaltijden eet je meestal?") in Je doelen met migratie, zodat wie periodiek vast 2/2 volledig kan zijn; daarna `NUT_DOEL`/`NUT_CONTEXT` in de voedingscheck (met "periodiek vasten" als context-optie).

### 6. Alles samen en eiwit tegen je doel (7 okt 2026, akkoord Dennis)

- **"Alles samen"-tabel bovenaan Trend:** per stof een rij, per dag/week/maaltijd een kolom, in de cel het % van de lat. ✓ alleen bij aantoonbaar gehaald (zonder benaderingen): kernstof sage, gevolgde stof neutrale tint (`BESLUIT_DOELEN_VERBONDEN_2026-10.md` §1, "✓ bij gehaald"). Onvolledig gearceerd met "≥", leeg "—", laatste kolom "gehaald x/y". Omega-3 krijgt geen ✓ per dag (periodetotaal). Tik op een rij = naar die grafiek.
- **Lijngrafiek afgewezen (zelfde dag):** een Staaf | Lijn-schakelaar met een lijn die breekt bij een lege dag is gebouwd en bekeken, en weer weggehaald: niet mooi. De regel "staafjes, geen lijngrafiek" blijft staan.
- **Eiwit tegen je eiwitdoel** (handmatig, anders de ondergrens van de richtlijn uit Je doelen), met "je eiwitdoel" in plaats van "de norm" in alle zinnen. Zonder gewicht/doel: schaal in g en "Vul je gewicht in bij Je doelen". Lost het open punt "Eiwit zonder vaste norm in Trend" op.
- **Afgewezen:** één gecombineerde grafiek met alle stoffen: vijf tot zeven lijnen over 14 dagen op 375 px is onleesbaar; de tabel is de plek waar alles samenkomt.
- **Meting (GA4):** `nutrition_patroon_trend_tabel_rij` {nutrient}.

### 7. Kleur per stof in Trend, oordeel in de vulling (7 okt 2026, akkoord Dennis)

Aanleiding: Trend voelde statisch: elke kaart dezelfde sage/terra/grijs, veel grijs (gevolgd, per maaltijd, omega-3, inactieve staven op 55%), geen beweging.

- **Elke kernstof tekent in zijn identiteitskleur** (`--vd-stof-*`, dezelfde als de krans): bolletje bij de naam, staven, arcering, schatting-stippel, tabelrij. Gevolgde stoffen blijven neutraal (`--vd-ink-2`), zoals de buitenring van de krans ("informatielaag leest niet als tekort").
- **Het oordeel zit in de vulling, niet in de tint** — de krans-regel "kleur is identiteit, geen oordeel" geldt nu ook in Trend: vol met ✓ = gehaald · licht (40%) = eronder · gearceerd = onvolledig · middentint (75%) waar geen oordeel hoort (per maaltijd, omega-3 per dag). **Vervangt** sage = gehaald / terra = onder in Trend.
- **Beweging:** staven groeien op bij openen en bij een andere periode (500 ms, licht verspringend), paneel vloeit over bij een tik; uit bij `prefers-reduced-motion`. Inactieve staven 80% i.p.v. 55%.
- **Afgewezen (voor nu):** kleurpaneel/kleurkiezer voor het hele dashboard. Haalbaar als één tint-schuif met afgeleide tokens, maar pas na het omzetten van ~935 vaste kleurcodes in het dashboard naar tokens; botst deels met het besluit van 23 sep 2026 (één donker thema). Apart traject als Dennis het wil.

## Afgewezen

- **Hermeting naar Meer verplaatsen:** de brede check wordt niet meer aangeboden en de hermeting loopt dood. Een menu-ingang naar een dood scherm helpt niemand. De herinnering blijft als enige ingang voor wie nog een brede check heeft.
- **Een dag zonder ontbijt "volledig" noemen als je nooit ontbijt:** een dagboek kan niet onderscheiden tussen "niet gegeten" en "niet geregistreerd". Zie Open.
- **Per dag over 30 dagen (30 staven):** op 375 px onleesbaar. Boven 14 dagen per week.
- **Onvolledige dagen weglaten uit Trend:** dan verdwijnt juist het bewijs dat er een gat in de registratie zit. Ze staan er gearceerd.

## Opgeruimd

`src/lib/nutrition-trend.ts` (zes weken per week) en `bouwGevolgdeWeken`: vervangen door `nutrition-stof-meting.ts` + `nutrition-stof-trend.ts`, één rekenpad voor kernstoffen en gevolgde stoffen.

## Meting

Geen nieuwe events; bestaande uitgebreid:
- `nutrition_patroon_stof_geopend` {nutrient, **soort** kern|gevolgd, **sectie** stof|trend}: hoe vaak gevolgde stoffen en de Trend-ingang het detail openen.
- `nutrition_patroon_periode_gekozen` {periode, dagen, sectie}: nu ook met `sectie: "trend"`.
- `nutrition_patroon_bron_naar_dagboek` / `_bron_gezocht`: nu ook voor gevolgde stoffen (nutrient = veldnaam, bijv. `calciumMg`).

## Open

- **Wie structureel geen ontbijt eet**, krijgt nooit een volledige dag. Optie later: "ik sla ontbijt bewust over" in Je doelen, waarna twee hoofdmaaltijden volledig zijn.
- ~~**Eiwit zonder vaste norm** in Trend~~ — opgelost in §6.
