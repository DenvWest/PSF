# Besluit: Keuze blijft Keuze — Vergelijken (voeding naast supplement, met PS-Score) en Favorieten

**Datum:** 6 oktober 2026
**Status:** Besloten (Dennis: "akkoord met voorstel bij keuze"), gebouwd 6 okt op `feat/keuze-vergelijken`.
**Raakt:** `src/lib/schap-tabs.ts`, `src/components/dashboard/voortgang/SchapView.tsx`, `NutrientLogboekPanel`
**Laat staan:** `BESLUIT_ONDERBALK_DRIE_TABS_2026-10.md` (Dagboek · Patroon · Keuze, ids ongewijzigd)

## Aanleiding

Dennis vroeg:
1. Keuze hernoemen naar **Supplementen**?
2. Daar vooral voeding en supplementen vergelijken (bij Producten).
3. Voedingslogboek veranderen in **PSF-score**.
4. Favorieten blijft voor de supplementen die iemand bewaart.

Op de vraag wat "PSF-score" betekent: **de PS-Score van supplementen** (0–100, productkwaliteit), niet een score voor iemands voeding.

## Besluiten

1. **De tab blijft "Keuze".** Afgewezen: "Supplementen" als naam van de hoofdtab.
   - Het dashboard is voeding eerst; het systeem bewijst nooit een tekort, en kopen of affiliate hoort niet in het dashboard (cockpit-besluit, juli 2026). Een hoofdtab "Supplementen" zegt het omgekeerde.
   - `/supplementen` is al de publieke catalogus met PS-Score: twee plekken met dezelfde naam en een andere inhoud.
   - De lus meten → wegen → kiezen (Dagboek → Patroon → Keuze) blijft heel.
2. **Onderdelen van Keuze (voeding):**
   - **Vergelijken** (vervangt Producten): per stof voeding naast supplement — portie, wat het levert, % van de norm — en bij elk supplement zijn **PS-Score** met een link naar `/supplementen?categorie=<stof>`.
   - **Voedingslogboek gaat op in Vergelijken.** Het toont nu al per stof de route (voeding of supplement); als apart tabblad dubbelt het.
   - **Favorieten** blijft: de supplementen die je met ☆ bewaarde (sinds 6 okt ook vanuit Je patroon, zie `BESLUIT_MICRO_IN_BEELD_2026-10.md` §6).
3. **De PS-Score is een productscore, geen persoonsscore.** Geen "PSF-score" voor iemands voeding: die is eerder afgewezen (geen tweede score; een "hoe gezond"-cijfer verbergt welke stof het verschil maakt — `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`).
4. De poort van het voedingslogboek blijft gelden in Vergelijken: staat je voedingsbasis niet, dan blijven de supplementknoppen dicht, met de reden erbij.

## Uitvoering (6 oktober)

- **Tabs op voeding:** Vergelijken · Favorieten. Vergelijken houdt de id `logboek` (oude links en meetreeksen blijven werken) en is het standaardtabblad op voeding. Een oude link naar `producten` op voeding landt op Vergelijken (`resolveSchapTabForDomain`). Slaap en beweging houden Producten.
- **Per stof** (routekaart, alleen op Keuze, niet op Kompas): na de voedingsbronnen het blok "Of een supplement · hoogste PS-Score": de top 3 producten van die stof met score en band, elk naar de eigen productpagina (`/product/<slug>`), plus "Alle N …-supplementen met PS-Score →" naar `/supplementen?categorie=<stof>`. Met de zin "De PS-Score beoordeelt het product (…), niet jouw voeding." Bron: `src/lib/supplement-hub/ps-score-per-stof.ts`.
- **Poort:** het PS-Score-blok staat er onder dezelfde voorwaarde als de vergelijklink: poort open, deur open voor die stof, en niet "alleen bord" gekozen.
- **Afwijking van besluit 2:** het vroegere tabblad Producten (oordeel per supplement uit je check: signaal, zekerheid, EU-claim, met bewaarknop) is niet verdwenen maar staat onder de vergelijking als "Oordeel per supplement · uit je check". Reden: anders gaan die oordelen en de "aanbevolen"-bewaarknop verloren, en zonder voedingscheck zou Vergelijken leeg zijn; nu toont dat blok dan zijn dichte poort met reden.
- **Geen affiliate-link in het dashboard:** de koopknop staat pas op de productpagina.

**Meting:** `keuze_vergelijken_ps_score_click` {surface, nutrient, doel: product|catalogus, product?} (GA4). Bestaand: `nutrition_route_compare_click` (link naar `/beste/*`), tabwissel van het schap.

## Open

- Een korte uitleg van de PS-Score-opbouw in het dashboard (nu alleen de zin en de link naar de catalogus).

---

## Herziening 6 oktober (tweede ronde, na Dennis' review)

Dennis: "erg lelijk, geen goed verband zoals dagboek en patroon hebben". De hero was nog de oude vorm (intro + spiegel "Gratis · laag 1–5"), de keuze was een rij pillen met slotjes ("Uit een supplement" en "Allebei" dicht), en de stand kwam uit check-antwoorden ("jij: 1× per dag") in plaats van uit het dagboek.

### Besluiten (keuze Dennis)

1. **De poort komt uit je dagboek, niet meer uit de check-ladder (laag 6).** `src/lib/keuze-stof-stand.ts` leest per stof het 7-dagenvenster van het tekortsysteem (terugval 30 dagen, minimaal 3 geregistreerde dagen):
   - `op_koers` (ondergrens haalt de norm): de supplementkant blijft rustig en ingeklapt ("Je eten haalt je norm. Een supplement voegt hier weinig toe."), maar is te openen en te kiezen;
   - `ruimte`: de supplementkant staat open;
   - `niet_meetbaar` (zink, vitamine D) en `onbekend`: beide kanten open, met de reden.
   **Geen slotjes meer.** Dit herziet besluit 4 hierboven ("de poort van het voedingslogboek blijft gelden") voor Keuze. De asymmetrie-regel blijft: nooit "tekort", altijd "minstens wat je binnenkreeg".
2. **Twee kolommen per stof:** links "Uit je eten" (sage), rechts "Uit een supplement" (blauw, `--vd-accent-2`) — dezelfde twee accenten als de dekkingscirkels in het dagboek.
   - Eten: jouw bronnen van de laatste 7 dagen (aandeel), de maaltijd met de meeste ruimte, drie rijkste bronnen met ＋ naar het dagboek (op die maaltijd), "Meer in Je patroon →".
   - Supplement: per vorm (bisglycinaat, citraat, whey-isolaat, …) het product met de hoogste PS-Score, met band; "Alle N met PS-Score →" (`/supplementen?categorie=`) en "Vergelijk op prijs →" (`/beste/*`).
3. **"Allebei" is geen aparte knop meer:** elke kaart heeft "Kies eten" / "Kies supplement"; beide gekozen = allebei. Opslag ongewijzigd (`voeding-route-<stof>-<bord|potje|beide>` in `account_favorites`).
4. **Weg op voeding:** de oude intro en de spiegel ("Gratis · laag 1–5"). Daarvoor: een kop "Laatste 7 dagen · uit je dagboek — Je eten naast een supplement" met "x van y meetbare kernstoffen op je norm · … heeft ruimte".
5. **Blijft (keuze Dennis):** het zoekveld + stofchips (stip = stand: sage op koers, amber ruimte, grijs niet te meten), en "Oordeel per supplement · uit je check" onder de vergelijking.

Opgeruimd: het PS-Score-blok in `NutrientRouteChoiceCard` (eerste ronde) en `psScoreTopVoorStof`; de routekaart blijft voor Kompas.

**Meting:** `keuze_stof_geopend` {surface, nutrient, stand}, `keuze_bron_naar_dagboek` {nutrient, moment}, `keuze_naar_patroon_stof` {nutrient}, `keuze_vergelijken_ps_score_click` {…, doel: product|catalogus|vergelijking, stand}; bestaand: `nutrition_route_choice` (nu ook `geen` bij uitzetten), `nutrition_logboek_search`.

---

## Herziening 7 oktober (derde ronde): één kaart per stof

**Aanleiding.** Dennis: Keuze had niet dezelfde kleur als de rest van het dashboard, niet alle supplementen leken erin te staan, en "Je eten naast een supplement" en "Oordeel per supplement" vormden geen geheel. Bij het nalopen bleek het tweede blok het eerste tegen te spreken: omega-3 "630 / 250 mg · op je norm" uit het dagboek, met daaronder "Aanvullen" uit de check. Elke oordeelkaart had dezelfde zin en dezelfde "Prioriteit 6 van 6", dus niets daarvan was persoonlijk. Dennis koos het aanbevolen voorstel ("akkoord, en doe aanbevolen").

### Besluiten

1. **Eén kaart per stof; het losse blok "Oordeel per supplement · uit je check" vervalt op voeding.** Het oordeel uit de check staat in de stofkaart als blok "Uit je check": signaal, zekerheid, bloedwaarde, EU-claim, de datum, en "Hoe we hier komen" (dezelfde afleiding als voorheen).
   - **Het dagboek beslist, de check is context.** Meet het dagboek de stof (op koers of ruimte), dan zegt de kaart: "Je check zei '…'. Je dagboek weegt hier zwaarder: dat is wat je at, de check schatte het uit vragen."
   - Alleen waar het dagboek niets kan zeggen (te weinig dagen, zink, vitamine D) is het oordeel van de check het antwoord, met de reden erbij.
   - Zonder voedingscheck zijn er geen stofkaarten; dan staat het oude blok er nog, met de dichte poort, zodat het tabblad nooit leeg is.
   - **Afgewezen:** "Plek in je plan · Prioriteit 6 van 6". Die stond bij elke stof hetzelfde en zegt dus niets.
2. **Per product wat het toevoegt.**
   - Het etiket per dag en de prijs per dag.
   - "Samen met je eten minstens X van je norm Y (Z % van je norm)".
   - De veilige bovengrens uit `onderzoek-per-stof.ts`: bij magnesium en omega-3 alleen het etiket tegen de grens voor supplementen. Bij zink en vitamine D geldt de grens voor alles samen; omdat het dagboek die stoffen niet kan meten, zegt de regel dat.
   - Of het product de dagdosis van de EU-claim haalt (art. 10 1924/2006: de claim hoort bij de stof).
   - **Dit wijkt bewust af van de regel van 21 augustus** ("nooit optellen tot een dagtotaal"). Die regel gold voor de schatting uit de frequentievragen van de check, en daar blijft hij gelden. Het dagboek is gemeten inname, dus een ondergrens. Ondergrens + etiket blijft een ondergrens, en zo heet het ook: "minstens". Nooit "tekort".
3. **Wat eten nog meer meebrengt.** Bij elke "kan erbij"-bron staat "ook: …": de andere stoffen waarvan één portie minstens 15 % van de referentie levert. Dat is de "bron van"-drempel uit 1924/2006, hier per portie gelezen en alleen als feitelijke samenstelling getoond. Referenties: de RI uit 1169/2011; omega-3 250 mg (EFSA); vezels 3 g per portie.
4. **Prijs alleen aan de supplementkant.** We hebben geen prijzen van voeding, en die blijven uitgesteld (`BESLUIT_SUPERMARKT_MCP_EN_BOODSCHAPPENLIJST_2026-10.md`, 3 okt).
5. **Dezelfde productbron als `/supplementen`.** Het dashboard laadt de producten op de server uit de database (`loadHubProductsForPage` → `keuzeProducten`). Tot nu toe las Keuze alleen de statische catalogus, waardoor een product uit de admin wel op `/supplementen` kwam en niet in Keuze. Op 7 oktober stonden er in beide dezelfde 25 producten (in de database geteld). Per vorm blijft alleen het beste product staan, met "Alle N met PS-Score →" voor de rest. Creatine en ashwagandha horen niet bij de vijf kernstoffen en staan dus niet in Keuze voeding.
6. **Eén palet.** Kop, tabs, domeinchips en Favorieten gebruiken de `--vd-*`-tokens van Dagboek en Patroon.

### Premium: volgende stap, niet in deze ronde

Richting, eens met Dennis: **we verdienen aan de beslissing, niet aan de informatie.** Alles per stof blijft gratis: stand, bronnen, producten, PS-Score, wat een product toevoegt, de bovengrens en de prijs. Premium wordt iets wat nog niet bestaat: **"Jouw stack"**, één advies over al je gekozen routes samen (dubbelingen, de bovengrens over alle bronnen samen, de goedkoopste combinatie, wanneer je wat inneemt). **Afgewezen:** iets wat nu gratis is achter een betaalmuur zetten. De les uit MyFitnessPal: kernfunctie achter Premium jaagt mensen weg, en een gratis versie die "goed genoeg" is converteert niet. Dat los je op met een betaalde laag die meer doet, niet met een gratis laag die minder doet.

**Meting:** bestaand `dashboard_afleiding_open` / `dashboard.afleiding_opened` (nu ook vanuit de stofkaart, surface `schap_voeding`), `keuze_stof_geopend`, `keuze_vergelijken_ps_score_click`, `nutrition_route_choice`.

---

## Herziening 7 oktober (vierde ronde): de knoppen doen iets

**Aanleiding.** Dennis: "Kies eten" en "Kies supplement" deden weinig. Dat klopte: ze bewaarden alleen de route als favoriet, met één bevestigingszin. Dennis ging akkoord met de voorgestelde volgorde.

### Besluiten

1. **"Kies eten" opent het kiezen van bronnen.**
   - Na de keuze krijgt elke "kan erbij"-bron een ☆. Die schrijft naar **Mijn producten** in het dagboek: dezelfde opslag (`/api/account/dagboek-favorieten`) en dezelfde meting als de ster in Je patroon, met `surface: "keuze_stof"`. Wat je stert, staat bovenaan als je eten toevoegt; "Naar Mijn producten →" opent die lijst.
   - De link heet nu "Alle rijkste bronnen in Je patroon →" (de top 10 met ster en ＋ bestond daar al).
   - **De voedingswijze staat erbij.** De lijst filterde al op vegetarisch/veganistisch uit Je doelen, maar dat was nergens te zien. Nu staat er "Afgestemd op: …" of "Eet je vegetarisch of veganistisch?", met een link naar Je doelen.
2. **"Kies supplement" is nu "Kies dit supplement", per product.**
   - Eén product per stof, bewaard als `voeding-product-<stof>-<slug>` in `account_favorites`. Een product kiezen zet de supplementroute aan; opnieuw tikken wist beide.
   - Daarna is de hoofdknop **"Naar de productpagina →"** (`/product/<slug>`). Daar staan winkels, prijzen en de koopknop, met de commissie-zin erbij. In het dashboard zelf blijft geen affiliate-link staan.
   - Keuze → Favorieten toont het gekozen product met dezelfde link.
   - **Afgewezen:** de knop naar `/supplementen` laten wijzen. Die link stond er al ("Alle N met PS-Score →"), en zo ging verloren wat iemand koos.
3. **Volgorde daarna:**
   - **(a) Het gekozen product loggen in Dagboek → Mijn supplementen.** Dat vraagt eerst een uitbreiding van de supplementcatalogus van het dagboek: die heeft nu 9 algemene regels, geen merkproducten en geen vitamine D.
   - **(b) Premium "Jouw week":** maaltijdbouwstenen die meerdere stoffen tegelijk aanvullen, binnen voedingswijze en allergieën, met vaste regels en zonder taalmodel (art. 9).
   - **(c) Premium "Jouw stack".**

**Meting:** `keuze_product_gekozen` {surface, nutrient, product, actie: gekozen|gewist, stand} (GA4 + Clarity `keuze_product`); `keuze_vergelijken_ps_score_click` met `doel: productpagina` (ook vanuit Favorieten); `nutrition_dagboek_favoriet_*` met `surface: keuze_stof`; `keuze_naar_mijn_producten`; `keuze_voedingswijze_wijzig`.

### Vijfde ronde (7 oktober, zelfde PR): eiwit, scrollen, de weg terug

Na Dennis' review op :3004:

1. **Eiwit stond altijd op "te weinig dagen", ook met een vol dagboek.** Het tekortsysteem rekent eiwit nooit als aandeel (`aandeelVanNorm` geeft null: het doel rekent met gewicht en trainingsbelasting). Keuze rekent nu met je eiwitdoel uit Je doelen (`useEiwitDoel`). Zonder eiwitdoel geldt de nieuwe stand `geen_doel`: je gemiddelde zonder percentage, met "Stel je eiwitdoel in →". De tests rekenden met een aandeel voor eiwit dat het echte systeem nooit levert; ze zijn bijgesteld.
2. **Een stof openen schuift die stof in beeld.** Het openen klapte de vorige stof erboven dicht, waardoor je op mobiel midden in de kaart terechtkwam. Dit gebeurt alleen na een eigen tik, met `prefers-reduced-motion` gerespecteerd.
3. **De weg van product terug.** Productlinks vanuit Keuze dragen `?van=keuze&stof=…`. De productpagina toont dan "← Terug naar je keuze · Eiwit" (terug naar die stof, open) en "Alle eiwitpoeder-producten met PS-Score →". Voor alle bezoekers staat die cataloguslink nu ook onderaan de productpagina; de broodkruimel "Eiwitpoeder" wees naar de gids, niet naar de producten.

4. **"Hoe we hier komen" bij eiwit noemt de beweegcheck niet meer** (Dennis akkoord met de tekst). De beweegcheck staat sinds 5 september niet meer in de navigatie, en beweging zit inmiddels in Je doelen (trainingsbelasting → eiwitdoel). Nieuwe regel: "Je eiwitsignaal kwam uit je check: weinig eiwit, samen met trainen of traag herstel. Je eiwitdoel rekent nu met je gewicht en trainingsbelasting uit Je doelen.", met "Naar Je doelen →". **Afgewezen:** de beweegcheck terughalen, omdat dat ingaat tegen het besluit "voeding eerst" van 5 september.
5. **Overal een weg terug.** Ook "Alle N met PS-Score →" (`/supplementen`) en "Vergelijk op prijs →" (`/beste/*`) dragen nu de herkomst. `TerugNaarKeuze` staat op alle drie de bestemmingen: bovenaan als knop, en op mobiel als zwevende "← Je keuze" zodra die knop uit beeld is. Op `/beste/*` zweeft hij boven de vaste koopbalk.

**Meting:** `keuze_eiwitdoel_instellen` {surface, plek?}, `keuze_terug_van_product` {nutrient, surface: product|supplementen|beste, plek: boven|zwevend, product?}, `keuze_product_naar_catalogus` {nutrient, product}.

---

## Herziening 7 oktober (zesde ronde): Favorieten wordt "Mijn keuzes"

**Aanleiding.** Dennis vond Favorieten "slap": een losse lijst titels zonder waarom en zonder iets om mee te doen. Hij ging akkoord met het voorstel en met de naam "Mijn keuzes" (dat wijzigt besluit 2 van 6 okt, "Favorieten blijft", alleen in naam; de id `favorieten` blijft voor oude links en meetreeksen). Zijn vraag om het moment (ontbijt, lunch, avondeten, tussendoor) erbij te zetten is meegenomen.

### Besluiten

1. **Op voeding toont de tab een overzicht per stof, in dezelfde volgorde als Vergelijken.**
   - Bovenaan: "x van y stoffen gekozen · n supplementen · € per dag (± € per maand)".
   - Per stof met een keuze één kaart: de stand uit je dagboek, je gesterde voedingsmiddelen die echt een bron van die stof zijn (≥ 15 % van de referentie per portie, met ★ om weg te halen en ＋ naar het dagboek), en je gekozen supplement (vorm, etiket per dag, prijs per dag, PS-Score, productpagina).
   - "Wijzig" opent Vergelijken op die stof.
   - Stoffen zonder keuze staan in één regel eronder.
2. **"Wanneer neem je het?"** Per gekozen supplement één moment: ontbijt, lunch, avondeten of tussendoor. Dat zijn dezelfde vier momenten als het dagboek. Opgeslagen als favoriet `voeding-moment-<stof>-<moment>`, net als de routekeuze. **Bewust zonder migratie:** `account_favorites` heeft geen momentkolom, en een migratie zou de deploy blokkeren voor een veld dat nu alleen geheugensteun is. Straks gebruikt voor (a) het supplement met één tik op dat moment loggen en (b) timing in "Jouw stack".
3. **Niets verdwijnt.** Wat niet bij een stofkeuze hoort (supplementen met een ster uit Je patroon, ladderkeuzes) staat eronder onder "Ook bewaard".
4. **Geen herinnering met tijd in deze ronde.** `alert_enabled` verstuurt nog niets (voorbereidend veld), en het moment dekt de vraag "wanneer".

**Premium (volgende stap, niet gebouwd):** "Jouw stack" over alle keuzes samen (dubbelingen, de bovengrens over alle bronnen, timing per moment, een goedkopere combinatie van gelijke kwaliteit) en "Jouw week". Gratis blijft alles hierboven.

**Meting:** `mijn_keuzes_moment` {nutrient, moment|geen} (GA4 + Clarity), `mijn_keuzes_naar_vergelijken` {nutrient}, `keuze_vergelijken_ps_score_click` {surface: mijn_keuzes, doel: productpagina}, `nutrition_dagboek_favoriet_*` {surface: mijn_keuzes}, `keuze_bron_naar_dagboek` {surface: mijn_keuzes}.

### Zevende ronde (7 oktober, zelfde PR): naast elkaar, moment ook bij eten

Na Dennis' review:

1. **Eten en supplement naast elkaar** in elke stofkaart, in dezelfde twee kolommen en kleuren als Vergelijken. Vanaf 30rem containerbreedte staan ze naast elkaar; op een smalle telefoon onder elkaar, omdat twee kolommen van ±160 px de productnaam, prijs en vier momentknoppen niet dragen. Een kant zonder keuze toont "Geen … gekozen · Kies in Vergelijken →", zodat de vergelijking altijd twee kanten heeft.
2. **"Wanneer eet je het?"** Per stof een moment voor je eten: `voeding-eetmoment-<stof>-<moment>`, naast het supplementmoment `voeding-moment-…`. De ＋ zet een bron meteen op dat moment in het dagboek.

**Open, ter beslissing bij Dennis: de prijs van de voedingsoptie naast die van het supplement.** Dat botst met twee eerdere besluiten:
- 3 oktober: "eerst voedingswaarden kloppend, prijzen/boodschappenlijst later" (commit 9dc6c8fd);
- `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md`: de supermarktsnapshot is "niet voor prijzen", met een onduidelijke licentie.

Daarom niet gebouwd. Voorstel: een kleine, handmatig bijgehouden tabel met een indicatieve prijs per portie, alleen voor de rijkste bronnen van de vijf kernstoffen (± 30 regels), met prijspeil en bron erbij. Vergelijken per portie, nooit "prijs per mg", omdat eten meer meebrengt dan die ene stof.

### Achtste ronde (7 oktober, zelfde PR): één ster, één plek

Dennis: "overal staat alleen forel". Eén gesterde forel is een bron van eiwit, omega-3 en vitamine D (≥ 15 % per portie), en stond dus op drie kaarten. Nu:
- Een gesterd voedingsmiddel staat alleen bij de stof waar één portie het meest aan bijdraagt, gemeten als aandeel van de referentie (`hoofdStof`). Forel staat dus bij omega-3.
- Andere stoffen waarvan het ook een bron is, zeggen "Telt ook mee: Forel (bij omega-3)".
- Heeft een stof met de route eten nog geen eigen bron, dan toont de kaart de twee rijkste bronnen van die stof met ☆ ("Kies een bron met ☆:"), binnen je voedingswijze.

**Prijs van de voedingsoptie:** Dennis akkoord met het voorstel (tabel met een indicatieve prijs per portie). Bouwvolgorde en prijsbron staan in het antwoord van 7 oktober; nog niet gebouwd.

### Negende ronde (7 oktober, zelfde PR): één knop per keuze, zoeken per kolom

Dennis: twee knoppen per voedingsmiddel (☆ en ＋) waren verwarrend, en de ster kwam pas na "Kies eten".

1. **In Vergelijken één knop per voedingsmiddel en per product: "Kies".**
   - Bij eten bewaart "Kies" het in Mijn keuzes (☆ in het dagboek) en zet het de route eten aan.
   - Bij een supplement: "Kies dit supplement" (ongewijzigd).
   - De grote knop "Kies eten" en de ＋ naar het dagboek zijn uit Vergelijken verdwenen. Onderaan elke kolom staat de stand: "… staat in Mijn keuzes · Naar Mijn keuzes →", met "Zet … uit".
   - **Loggen in het dagboek gebeurt vanuit Mijn keuzes** ("＋ Dagboek", op het gekozen moment). De taakverdeling: Vergelijken = kiezen, Mijn keuzes = doen.
2. **Een zoekveld per kolom.**
   - Eten: zoekt in de eigen catalogus en toont alleen wat per portie iets van die stof levert, rijkste eerst.
   - Supplement: zoekt op naam en vorm in de producten van die stof (dezelfde bron als `/supplementen`), hoogste PS-Score eerst.
   - Het zoekveld bovenaan Vergelijken (stof of voedingsmiddel) blijft.
3. **Mijn keuzes → product of alle supplementen van die stof**, met de herkomst `deel=favorieten`. De terugknop zegt dan "← Terug naar Mijn keuzes" en zet je daar neer.
4. **Supplement loggen in het dagboek: nog niet.** Het dagboek kent geen merkproducten. Mijn keuzes zegt dat er nu bij; dit is de volgende stap (a).

**Meting:** `keuze_eten_gekozen` {nutrient, product, actie, via: voorstel|zoek}, `keuze_eten_zoek` {nutrient, treffers}, `keuze_supplement_zoek` {nutrient, treffers}; `keuze_terug_van_product` nu ook vanuit Mijn keuzes.

### Tiende ronde (7 oktober, zelfde PR): wat je kiest, staat waar je het koos

Dennis koos bij eiwit "Ei, gebakken" en zag het niet terug in Mijn keuzes, wel "heel wat andere keuzes". **Oorzaak:**
- Mijn keuzes plaatste een gesterd voedingsmiddel alleen bij een stof waarvan één portie ≥ 15 % van de referentie levert.
- Eén ei levert 13,5 % van de eiwitreferentie en stond dus nergens.
- De eiwitkaart dacht dat er nog niets gekozen was en toonde de voorstellen.

**Fix:**
- Een keuze in Vergelijken (of vanuit de voorstellen in Mijn keuzes) wordt bewaard bij de stof waar je hem maakte, als `voeding-eten-<stof>-<voedingsmiddel>`, naast de ☆ in het dagboek.
- Mijn keuzes toont wat je bij een stof koos altijd bij die stof. De drempel (`hoofdStof`) geldt alleen nog voor oudere sterren zonder stof.
- In Vergelijken staat je keuze bovenaan de eetkolom ("Jouw keuze"), ook als je hem via het zoekveld vond.
- Wissen haalt de dagboekster alleen weg als je het voedingsmiddel bij geen andere stof koos.

**Zoeken op meer woorden:** de catalogus vond "ei gebakken" niet bij "Ei, gebakken", omdat hij als één stuk tekst zocht en botste op de komma. Nu tellen alle woorden in elke volgorde (laagste rang, onder de bestaande treffers). Dat geldt ook voor het dagboek.

## Herziening 8 oktober (elfde ronde): het gekozen supplement in het dagboek

Stap 3 uit `PROMPT_VERVOLG_KEUZE_2026-10-08.md`; maakt punt 4 van de negende ronde af.

**Ontwerpvraag:** hoe verwijst een dagboekregel naar een hubproduct? De producten komen uit de database, maar de dagboekregel (`DagboekItem` in de jsonb van `account_nutrition_daybook`) werd tegen de statische catalogus gecontroleerd, en de ring rekent synchroon.

**Besloten (Dennis, 8 okt): slug plus het etiket vastleggen.**
- Een supplementregel kan een `product` dragen: `{ naam, nutrient, dosis, unit }`, zoals het etiket per dag was op het moment van loggen. `key` is dan de slug. `bron` blijft `"supplement"`, dus alles wat supplementen telt of kleurt (blauwe ring "uit een supplement", Patroon, bronnen per stof) doet vanzelf mee.
- `grams` telt bij een merkproduct dagdoses ("1 dagdosis").
- **Afgewezen: alleen de slug en de dosis bij het uitlezen opzoeken.** Dan wordt de hele uitlezing (ring, Patroon, weekoverzicht) async, en een product dat uit de hub verdwijnt laat de regel zwijgen.
- **Afgewezen: koppelen aan een van de 9 algemene supplementen.** Daarmee gaat de etiketdosis verloren, en voor vitamine D bestaat er geen catalogusregel.
- **De server neemt een etiket alleen aan als het klopt:** gelijk aan het hubproduct van nu, of aan wat er die dag al stond (`behoudBekendeProducten`). Een client kan dus geen dosis verzinnen, en een oude dag blijft staan als het etiket later verandert. Geen migratie: het is dezelfde jsonb-kolom.

**In de UI:**
- Mijn keuzes → supplementkant: "＋ Dagboek" op het gekozen moment (`voeding-moment-<stof>-<moment>`, anders ontbijt). Het opent het portiescherm in het dagboek, net als ＋ bij eten (`voeg=product:<slug>`). De zin "Loggen in je dagboek volgt…" is weg. Zonder vaste dosis per dag op het etiket staat er dat loggen nog niet kan.
- Dagboek → "Mijn supplementen": je Keuze-supplementen staan bovenaan ("supplement · jouw keuze"), zonder ster, want ze staan al in Mijn keuzes. Daarna favorieten en eerder gebruikt; een eerder gelogd merkproduct staat er ook in.
- Wie een oudere regel opnieuw kiest, logt met het etiket van nu.
- **Geen aantal bij een merkproduct** (Dennis, 8 okt): het portiescherm vraagt alleen "Zet in dagboek" en logt één dagdosis volgens het etiket; in de maaltijd staat "dagdosis" zonder invoerveld. Wie het twee keer neemt, logt het twee keer.

**Meting:** `keuze_bron_naar_dagboek` {nutrient, moment, surface: mijn_keuzes, kant: supplement}, hetzelfde event als ＋ bij eten. In het dagboek zijn het de bestaande `nutrition_dagboek_zoek_item_gekozen` en `nutrition_dagboek_portie_bevestigd` met `bron: supplement`.
