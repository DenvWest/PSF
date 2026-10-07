# Besluit: Je patroon per maaltijd, doelen in Samenvatting, "Per stof"

**Datum:** 5 oktober 2026
**Status:** Besloten (Dennis), gebouwd op `feat/patroon-maaltijden`
**Raakt:** `src/components/dashboard/patroon/`, `src/lib/nutrition-maaltijd-patroon.ts`, `src/lib/use-voedingsdata-periode.ts`

## Aanleiding

Dennis' feedback: "Je patroon laat nu niet echt goede info zien."

1. Wat zit er gemiddeld per maaltijd (ontbijt, lunch, avondeten) aan macro- en micronutriënten? Dat moet als eerste getoond worden, met de maaltijden als kop.
2. Samenvatting mag de doelen tonen (macro, micro, kernstoffen): hoeveel wordt er gehaald, en hoeveel komt uit supplementen.
3. Optie: wat kost een maaltijd gemiddeld, en hoe rijk is hij?
4. "Deze week" en "Voedingsstoffen" zeggen weinig.

## Besluiten

1. **Eerste tab "Per maaltijd"**, standaard open. De kop is een segmentrij Ontbijt · Lunch · Avondeten · Tussendoor. Per maaltijd staat het gemiddelde over de keren dat die maaltijd geregistreerd is, de laatste 30 dagen. Bovenaan staan energie en macro's als tegels. Daaronder één tabel met alle micronutriënten van de voedingswaardetabel plus de kernstoffen (magnesium, zink, omega-3, vitamine D), met de kolommen gemiddeld · per 100 kcal · %ADH. Het deel uit supplementen staat er apart onder.
   - De noemer is het aantal keer dat de maaltijd geregistreerd is, niet het aantal kalenderdagen (asymmetrie-regel).
   - Er is één rekenpad: elke keer wordt doorgerekend met `berekenVoedingswaarde` en `nutrientenGesplitstUitItems`, dezelfde som als de dag en de krans.
2. **Samenvatting begint met "Je doelen deze week":**
   - macro's tegen je eigen doel, als neutraal restgetal zonder percentage (macro-besluit §1 Laag B);
   - "x van y meetbare kernstoffen op je norm", met een pil per stof;
   - supplementen: op hoeveel dagen, en welk deel van elke kernstof eruit kwam.
   De weekkaarten met staafjes per kernstof zijn uit Samenvatting gehaald. Ze dubbelden met dit blok en met "Per stof".
3. **"Hoe rijk" = dichtheid per 100 kcal, geen prijs.** De maaltijden staan in een vergelijkingstabel (kcal, eiwit en vezels per 100 kcal), en de maaltijdtabel heeft een kolom "/100 kcal". Dit is géén score en géén rangorde.
4. **"Deze week" + "Voedingsstoffen" → "Per stof".** Daarin staan de weektabel met bladeren, daaronder de vier vensters (vandaag tot 30 dagen) en de bevinding met "Plan in Mijn Dag". De telcirkels en drie losse uitlegblokken zijn vervangen door één korte noot.

## Afgewezen / uitgesteld

- **Kosten per maaltijd: uitgesteld, niet gebouwd.** Dit bevestigt `BESLUIT_SUPERMARKT_MCP_EN_BOODSCHAPPENLIJST_2026-10.md` (herzien 3 okt): prijzen zijn uitgesteld, folder- en AI-prijsdata zijn afgewezen, en de eerste prijsroute wordt later de Daisycon-supplementfeeds. De catalogus heeft geen prijsveld. Het scherm zegt dat ook letterlijk ("daar is nog geen betrouwbare prijsbron voor"). Terugkomen zodra er een prijsbron met licentie is.
- **Vensters als extra kolommen in de weektabel**: op 375 px zijn 7+ kolommen niet leesbaar. Ze staan daarom als tweede tabel in dezelfde tab.
- **Een dichtheidsscore per maaltijd** (één getal "hoe gezond"): afgewezen. Een tweede score is verboden (lock "minuten = evidence, nooit een tweede score"), en een gemiddelde van %RI's verbergt welke stof het verschil maakt.

## Meting

- `nutrition_patroon_sectie_gekozen` (bestaand) met de nieuwe ids `maaltijden` / `stof`.
- `nutrition_patroon_maaltijd_gekozen` {moment} (GA4) + Clarity-tag `nutrition_patroon_maaltijd`.
- `nutrition_patroon_doel_instellen_click` (GA4): de link "Stel er een in" bij een ontbrekend macrodoel.

---

## Herziening 5 oktober (tweede ronde, na Dennis' review)

Dennis' feedback op de eerste versie:
- Samenvatting toonde "ADH" zonder bron en was niet aan te passen.
- De rijen verwezen meteen naar supplementen.
- Omega-3-dekking klopte niet.
- Samenvatting en Per stof lieten dezelfde waarden zien.
- Per maaltijd moest ook per dag of per zelf gekozen periode te bekijken zijn.

### Besluiten (vervangen §2 en §4 hierboven)

1. **Tabs: Per maaltijd · Per stof · Trend.** Samenvatting is weg. Het doelenblok staat bovenaan Per stof en toont alleen tellingen: de kernstoffen zelf staan in de tabel eronder, dus geen getal staat twee keer. De keuze welke stoffen je toont (chips) staat nu bij Trend, de enige plek waar die filter werkt.
2. **Eén periodekiezer voor Per maaltijd en Per stof:** Vandaag · 7 dagen · 30 dagen · Kies.
   - "Kies" opent een maandkalender. Eén tik is één dag, een tweede tik maakt er een reeks van. Een stip betekent een dag met registratie.
   - Je kunt maximaal 42 dagen terug, de grens van de etiketporties-route.
   - Per maaltijd toont bij één dag ook "Wat je at" met hoeveelheden; bij een reeks "Wat je meestal at" met het aantal keren.
3. **"Norm", niet "ADH".** De kolom rekent sinds `BESLUIT_KERNSTOF_NORMEN_2026-10.md` tegen de Gezondheidsraad-norm. Elke rij noemt de norm, voor wie die geldt en de bron. Het stof-detail noemt de bron voluit.
4. **Omega-3 als periodetotaal.** De norm (200 mg EPA+DHA per dag, Gezondheidsraad 2001) komt neer op één keer per week vette vis. Een gemiddelde per geregistreerde dag blies één visdag op tot honderden procenten. Nu telt de som over de periode tegen de norm × het aantal kalenderdagen (`bouwPeriodeOverzicht`, `omega3AlsPeriodetotaal`). Die som is een harde ondergrens, dus een "gehaald" is echt bewezen. Trend en dagboek-krans rekenen nog per dag; zie Open.
5. **Een tik op een stof opent het stof-detail, niet `/beste/*`.** Het detail toont:
   - de norm met bron;
   - de zin "een norm geldt voor een groep; eronder zitten is geen tekort, dat stelt een arts vast";
   - jouw bronnen in de periode, met het aandeel uit supplementen;
   - de rijkste voedingsbronnen per portie, met "Voeg toe in je dagboek".

   Pas daaronder staat "Supplementen met X vergelijken". De monetisatie-uitgang blijft, met hetzelfde meetpunt `nutrition_week_nutrient_clicked`, maar komt als tweede stap (voeding eerst; asymmetrie-regel: het systeem bewijst nooit een tekort).
6. **Opgeruimd:** `PatroonNutrientTabel`, `PatroonVensterTabel`, `PatroonGevolgdTabel`, `nutrition-gevolgde-vensters`. De vier vensters naast elkaar dubbelden met de periodekiezer. De bevinding ("staat de laatste 30 dagen het vaakst onder je norm") blijft, met "Plan in Mijn Dag".

### Plak 2 — eigen invloed op de norm (gebouwd 5 okt, zie "Plak 2: uitvoering" onderaan)

Dennis koos **profielchips + een eigen streefwaarde**. Dit herziet punt 5 van `BESLUIT_KERNSTOF_NORMEN_2026-10.md` ("de norm van de kernstoffen is niet zelf bij te stellen"):

- **Profielchips** (geslacht, leeftijd 70+, voedingswijze) verschuiven de norm. Elke chip noemt de bron van de norm die eruit volgt. Dit volgt voedingsfocus §3.5.
- **Eigen streefwaarde per kernstof**: een tweede lijn naast de norm, met eigen balk. **Het "gehaald" blijft tegen de norm rekenen**, niet tegen de streefwaarde. Daarmee blijft het bezwaar uit het normenbesluit overeind: een zelf verlaagd doel kan geen ✓ geven die het systeem niet kan onderbouwen, en dat ✓ voedt de route naar `/beste/*`.
- Dit vraagt een migratie (opslag van chips en streefwaarden) en komt dus in een eigen PR met een blok in `OPENSTAAND.md`.

### Grens: informatie, geen diagnose

- **Wel:** jouw ondergrens naast de norm voor jouw groep, met bron.
- **Niet:** "je hebt een tekort", "je hebt een supplement nodig", rode kruisen.

Een inname onder de norm is geen tekort. Een tekort stelt een arts vast, met klachten en bloedonderzoek. Dat staat op het scherm.

### Meting (aanvullend)

- `nutrition_patroon_periode_gekozen` {periode: vandaag|7|30|eigen, dagen, sectie}
- `nutrition_patroon_stof_geopend` {nutrient} + Clarity `nutrition_patroon_stof`
- `nutrition_patroon_stof_naar_dagboek` {nutrient}
- `nutrition_week_nutrient_clicked` (bestaand): de supplementvergelijking vanuit het stof-detail

### Open

- Omega-3 als periodetotaal ook in Trend en in de dagboek-krans (plak 2b van `BESLUIT_DOELEN_VERBONDEN_2026-10.md`).
- Vitamine D 20 µg vanaf 70: komt mee met de chip "70+" in plak 2.

---

## Plak 2: uitvoering (5 oktober)

Dennis gaf akkoord ("akkoord met mergen, ook met plak 2").

**Gebouwd:**
- Tabel `account_kernstof_profiel` (migratie `20261005120000`, blokkeert deploy niet).
- `src/lib/account-kernstof-profiel.ts` met validatie, en de route `POST /api/account/kernstof-profiel`. Die geeft de hele voedingsdoelen-weergave terug, met de herberekende normen.
- **Je doelen** heeft een sectie "Kernstoffen" in de lijstvorm van #138:
  - Norm voor (Uit je check · Man · Vrouw);
  - Leeftijd (jonger dan 70 · 70 of ouder);
  - Voedingswijze (Alles · Vegetarisch · Veganistisch);
  - per kernstof de norm en een eigen streefwaarde.
- **Je patroon:** de stoffentabel toont onder de norm "eigen streefwaarde X/dag · Y%". Het stof-detail noemt de streefwaarde, linkt naar "aanpassen" en filtert de rijkste bronnen op voedingswijze.
- Normen en profiel staan in één gedeelde store (`use-kernstof-normen.ts`). Een wijziging op Je doelen werkt zonder herladen door in krans, patroon en agenda.

**Afgebakend:**
- **70+** zet de vitamine D-norm op 20 µg (Gezondheidsraad 2012). De bron van vitamine D in de normen is gecorrigeerd van "Gezondheidsraad 2018" naar 2012.
- **Voedingswijze verandert geen norm.** De Gezondheidsraad heeft geen aparte vegetarische norm voor deze stoffen. De keuze bepaalt alleen welke voedingsbronnen we tonen, en bij omega-3 de zin "zonder vis komt dat vooral uit algen(olie)". Het filter werkt op voedselgroep (vis, vlees; bij veganistisch ook eieren en zuivel).
- **Seizoen: niet gebouwd.** De norm verandert niet met het seizoen. Wat in de winter wel verandert, is de aanmaak van vitamine D in de huid, en die meet een dagboek niet; vitamine D blijft daarom "n.t.b.". Een seizoenchip zou dus niets doen of iets beweren wat het systeem niet weet.
- **Bovengrens voor streefwaarden:** zink ≤ 25 mg en vitamine D ≤ 100 µg (EFSA-bovengrens), omega-3 ≤ 5000 mg (EFSA: geen veiligheidsbezwaar tot 5 g). Magnesium ≤ 1000 mg als typfoutgrens; de EFSA-bovengrens van 250 mg geldt alleen voor supplementen.
- **"Gehaald" en de route naar `/beste/*` rekenen altijd tegen de norm, nooit tegen de streefwaarde.** De streefwaarde krijgt een percentage, geen vinkje en geen kleur.

**Meting:**
- `kernstof_profiel_aangepast` {setting, surface}
- `doelen_regel_geopend` (bestaand) met de settings `norm_geslacht`, `norm_zeventig_plus`, `voedingswijze`, `streefwaarde_<stof>`
- `nutrition_patroon_norm_aanpassen_click` {nutrient}

---

## Herziening 7 oktober: waartegen rekent elke rij, en wat levert één product

**Status:** gebouwd op `feat/maaltijd-norm-product`, wacht op Dennis' akkoord.

Dennis' feedback:
1. De kolom "Norm" zei weinig. Bij 7 dagen moet duidelijk zijn wat de maaltijd gemiddeld deed tegen de norm, en of dat de norm, de ADH of je eigen doel is.
2. Een product in "Wat je at" moet je kunnen aantikken om te zien wat alleen dat product levert.

### Besluiten

1. **Elke rij noemt zijn referentie.** Onder de stofnaam staat "norm X/dag · bron". Heb je op Je doelen een streefwaarde gezet, dan staat er een tweede regel "jouw doel X/dag · Y%". Stoffen zonder norm zeggen waarom: "geen dagnorm", eiwit "doel op Je doelen", vezels "norm volgt uit je gewicht". De kolom heet "Van norm". Het percentage blijft tegen de norm, het doel krijgt een eigen percentage zonder kleur (plak 2 hierboven).
2. **De noemer staat in de kop:** "Gemiddeld per lunch · 5 van 7 dagen geregistreerd". Een korte noot zegt dat het percentage het deel van je dagnorm is dat een gemiddelde lunch dekt, en dat dagen zonder lunch niet meetellen (asymmetrie-regel blijft: gemiddeld per keer, niet per kalenderdag).
3. **"Waar je lunch het meest aan bijdraagt":** de drie stoffen met het hoogste deel van je dagnorm. Alleen de sterkste, geen "het minst": een lage bijdrage van één maaltijd zegt niets over je dag. Omega-3 doet niet mee, omdat die als weektotaal rekent ("telt per week" in de normregel).
4. **Tik op een product → wat het per keer leverde.** Hetzelfde rekenpad als de maaltijd (`gemiddeldeVan` in `nutrition-maaltijd-patroon.ts`), gemiddeld over de keren dat het product er stond. Per stof: hoeveelheid, % van je norm, je eigen doel, en "etiket: X% ADH". Hier staat de ADH wel, omdat het een productweergave is (`BESLUIT_KERNSTOF_NORMEN_2026-10.md` §4). Er staat bij dat de ADH een vaste wettelijke waarde voor iedereen is en je norm persoonlijk. Geen kleur en geen vinkje: één product haalt geen dagnorm.

### Meting

- `nutrition_patroon_product_geopend` {moment, soort: voeding|supplement} (GA4).

### Bijgesteld 7 oktober (tweede ronde, na Dennis' review op :3001)

Dennis: "nieuwe tabel niet mooi en teveel". Een regel met norm en bron onder elke stof maakte de tabel twee keer zo hoog.

- **Compacte tabel terug.** Eén regel per stof, met de kolommen Stof · Gem. · /100 kcal · Norm.
- **Eigen doel in de Norm-kolom:** onder het percentage staat klein "doel 17%". Zonder doel staat er alleen het percentage.
- **Tik op een stof** klapt open met de norm, de bron, je eigen doel en welke producten de stof leverden: per product het deel van een gemiddelde maaltijd en het % van je norm. Vervangt de vaste regels onder de stofnaam.
- De lange uitleg erboven is één korte noot eronder geworden. "Waar je … het meest aan bijdraagt" en de klikbare producten in "Wat je at" blijven.
- Meting: hergebruikt `nutrition_patroon_stof_geopend` met `sectie: "maaltijd"`.
