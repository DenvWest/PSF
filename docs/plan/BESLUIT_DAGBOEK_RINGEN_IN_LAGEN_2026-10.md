# Besluit: de krans als drie lagen (midden · kernstoffen · ook gevolgd)

**Datum:** 5 oktober 2026
**Status:** besloten (Dennis, 5 okt: "akkoord met jouw eerste vormgeving")
**Raakt:** `DagboekKrans` (tabbladen Vandaag en Voedingsstoffen); `DagboekOokGevolgd` vervalt
**Herziet:** `BESLUIT_RIJKSTE_BRONNEN_EN_RINGTEGELS_2026-10.md` §4 en twee afgewezen opties daarin (zie onder)
**Bouwt voort op:** `BESLUIT_DOELEN_VERBONDEN_2026-10.md` §2, `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md` §2

## Aanleiding

De krans, de vijf kerntegels eronder en de rij ringtegels "Ook gevolgd" lazen als drie losse blokken. De kerntegels toonden bovendien opnieuw wat de krans al toonde.

## Besluit

1. **Eén beeld met drie lagen.**
   - **Midden:** "Wat at je vandaag?", daarna "x van y gedekt".
   - **Binnenring:** de vijf kernstoffen, elk in een eigen kleur. De telling en het gestippelde spoor (zink, vitamine D) blijven ongewijzigd.
   - **Buitenring:** de gevolgde stoffen, dunner (8 tegen 16), in één neutrale tint en met een duidelijke tussenruimte. De ring vult tot de RI. Een stof zonder RI krijgt een gestippeld spoor zonder vulling. Er komt geen ✓ en de buitenring telt nooit mee.
2. **De "+" zit aan het einde van de buitenring.** Die opent dezelfde `GevolgdeStoffenKiezer` (`surface: "dagboek"`). Er komt geen eigen opslag of rekenpad.
3. **Meedraaien = één draai op een tik, geen carrousel.** Tik je een segment aan (of de chip eronder), dan draait die ring langs de kortste weg zodat de stof bovenaan staat, bij een kleine wijzer. De overige segmenten worden gedempt. Eén regel onder de krans toont de stof met de vervolgstap: "Logboek van … →" voor een kernstof, "Rijkste bronnen →" voor een gevolgde stof die er een heeft. De animatie draait alleen bij `motion-safe`, er is geen doorlopende beweging en alle stoffen blijven zichtbaar.
4. **Chips in plaats van kaarten.** Onder de krans staat per ring een rij compacte chips met naam en waarde. Ze leveren het label dat de ring zelf niet draagt en zijn de toegang voor het toetsenbord en voor schermlezers (`aria-pressed`). De SVG is `aria-hidden`.
5. **De binnenring is niet aanpasbaar.** Gevraagd werd of iemand zelf de vijf binnenste stoffen kan kiezen. Antwoord: nee. Ze dragen de persoonlijke norm (Gezondheidsraad), de telling, het tekortsysteem, Patroon en de brug naar `/beste/*`. Een informatieve stof heeft hooguit een RI. In de binnenring zou die ineens een oordeel krijgen, zoals "natrium gedekt". De buitenring is volledig vrij. Dit bevestigt `BESLUIT_DOELEN_VERBONDEN_2026-10.md` §2.

## Herziet uit het besluit van 4 okt

- **"Gevolgde stoffen ín de krans" (daar afgewezen).** Ze staan nu in een eigen buitenring, niet in de ring van de telling. De twee redenen van toen gelden nog steeds en blijven gerespecteerd: de telling gaat alleen over de binnenring, en de scheiding blijft zichtbaar via de dikte, de neutrale tint, de tussenruimte en het label "zonder oordeel".
- **"Een draaiend wiel of carrousel" (daar afgewezen).** Er komt niets dat blijft draaien en niets dat achter een gebaar verdwijnt. Een tik draait de ring één keer en elke stof blijft zichtbaar (ring + chip).
- **§4 "ringtegels in een eigen rij onder de krans" en "kerntegels blijven kaarten".** Beide vervallen: de chips nemen hun rol over.

## Afgewezen

- **Labels permanent rond de ring.** Op 375 px is daar geen ruimte voor, zeker niet met negen gevolgde stoffen. Het label staat in de chip en in de regel onder de krans.
- **Een tik op een segment opent direct het logboek (zoals voorheen).** Dan is er geen moment om de stof eerst te zien. Het kost één tik extra, maar daarmee kun je ook een gevolgde stof aanwijzen zonder dat je het scherm verlaat.
- **Een maximum van 8 op de buitenring.** Bij het bouwen bleek dat niet nodig: er zijn negen informatieve stoffen te kiezen, en negen segmenten plus de "+" passen.

## Meetpunt

GA4: `nutrition_dagboek_krans_gekozen` (nieuw; params `ring`: `kern` | `gevolgd`, `nutrient`). Daarna lees je de doorstroom af aan `nutrition_dagboek_nutrient_opened` (logboek) en `nutrition_dagboek_rijkste_geopend` met `surface: ring`. `nutrition_dagboek_gevolgd_toevoegen_open` blijft voor de "+".

## Herziening 6 oktober 2026 — het midden toont één stof

**Status:** besloten (Dennis, 5–6 okt: "1 van 2 meetbare stoffen gedekt zegt ook niet zoveel", "zeg nooit tekort", "akkoord met alles").
**Herziet:** `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md` §2 ("het midden toont '1 van 2 meetbare stoffen gedekt'").

1. **Standaard staat de meetbare kernstof met het grootste open stuk bovenaan**, bij de wijzer. Het midden toont de naam (in de stofkleur), groot het percentage, en daaronder **"nog X tot je norm vandaag"**. Bij eiwit is dat "nog X g tot je doel vandaag". Is alles wat meetbaar is gedekt, dan staat er "Alles wat meetbaar is, is gedekt".
2. **Een tik op een stof zet die in het midden.**
   - Zink of vitamine D: "een dagboek kan dit niet aantonen", zonder "nog X".
   - Eiwit zonder doel: grammen, plus "Stel een eiwitdoel in →" naar Je doelen.
   - Gevolgde stof: "% van je norm · hoeveelheid", zonder "nog X". Dat zou een oordeel zijn op de informatielaag.
   - Heb je een eigen streefwaarde ingesteld (PR #141): een tweede regel "je streefwaarde X · Y%", zonder ✓. Het percentage en "gehaald" rekenen tegen de norm.
3. **Nooit "tekort".** Eén dag is een ondergrens; het tekortsysteem oordeelt pas over vier vensters. Een test bewaakt dat het woord niet verschijnt.
4. **De telling krijgt namen in plaats van een breuk:** "Gedekt: … Open: … Niet meetbaar met een dagboek: … Eiwit telt mee met een eiwitdoel." Zelfde regels als het tekortsysteem: alleen bewijsbare kernstoffen met een noemer.
5. **Normen** komen uit `nutrition-normen.ts` (PR #144): binnenring tegen de kernstofnorm, buitenring tegen de norm van de gevolgde stof (niet meer de etiket-RI).
6. **Buitenring met meer contrast** (vulling `--vd-ink-2`, lichter spoor, dikte 9). De "+" staat op een vaste plek direct achter het laatste segment in plaats van in een eigen, gelijke sector.

**Meetpunt:** ongewijzigd: `nutrition_dagboek_krans_gekozen`, met de doorstroom naar `nutrition_dagboek_nutrient_opened` en `nutrition_dagboek_rijkste_geopend`. Nieuw: `nutrition_dagboek_eiwitdoel_cta` (`surface: krans`) bij een tik op "Stel een eiwitdoel in"; het effect lees je af aan `voedingsdoel_aangepast` met `setting: eiwitdoel`.

## Aanvulling 6 oktober 2026 (2) — leesbaarheid, uitleg, dagen kiezen

**Status:** gebouwd na Dennis' feedback op :3004 ("378% begrijpt iemand niet", "tekst beter leesbaar", "I van informatie", "dagen eerder of later, kies-button zoals bij patroon").

1. **Geen percentages boven 100%.** Boven de norm staat de hoeveelheid ("945 mg ✓"), in het midden met "norm 250 mg gehaald". Bij omega-3 staat daar ook "omega-3 telt per week" (Je patroon leest omega-3 als periodetotaal). Gevolgde stoffen boven de norm: hoeveelheid, plus "norm … gehaald · zonder oordeel".
2. **Legenda in rijen in plaats van pillen.** Per stof een rij: kleurstip, naam en waarde in 13 px met tabulaire cijfers, en een dun balkje dat dezelfde vulling toont als de ring. Twee kolommen vanaf 400 px containerbreedte. "Ook gevolgd" toont er standaard vier; daarna "Toon alle n", zodat meer gevolgde stoffen het beeld niet vol maken.
3. **i-knop rechtsboven de krans.** Die klapt uit wat de binnenring, de buitenring, het midden en het gestippelde spoor betekenen, en dat alles een ondergrens is. Meetpunt: `nutrition_dagboek_krans_uitleg`.
4. **Dagen kiezen.** De dagenbalk krijgt ‹ / › (een week terug of vooruit, nooit voorbij vandaag), "Vandaag" en "Kies". Kies opent dezelfde maandkalender als Je patroon, nu gedeeld als `src/components/dashboard/shared/MaandKalender.tsx`. Meetpunt: `nutrition_dagboek_dag_gekozen` (`via`: strip / pijl / vandaag / kalender, `dagen_terug`).

## Aanvulling 6 oktober 2026 (3) — brede schermen, bijdrage per maaltijd, wat níét

**Status:** besloten (Dennis, 6 okt: "Doe A, B, C").

- **A · Weektabel.** De weektabel bevat alleen calorieën en macro's. Op Voedingsstoffen vervalt hij (dubbel met Macro's), op Macro's volgt hij de week van de dagenbalk (geen tweede set weekpijlen meer). Zonder ingesteld macrodoel staat er geen tabel vol streepjes, maar één regel met "Stel een doel in →". Meetpunt: `nutrition_dagboek_macrodoel_cta`.
- **B · Brede schermen.** Mobile-first blijft: onder 900 px blokbreedte is alles ongewijzigd. Daarboven staan dagenbalk en tabs over de volle breedte, met daaronder links de krans of de macroring (blijft staan bij scrollen) en rechts de inhoud. Gemeten op de blokbreedte (`@container` en `useBlokBreedte`), niet op het scherm, zoals de cockpitregel voorschrijft. Een tik op "Logboek van …" of "Rijkste bronnen" opent het detail **rechts** in plaats van op een nieuw scherm; de krans blijft links staan. De ring wordt bewust niet groter: groter is leger, niet leesbaarder.
- **C · Bijdrage per maaltijd** in het stof-detail: per eetmoment welk deel van wat je vandaag van die stof binnenkreeg. Geen % van de norm per maaltijd: dat leest als een oordeel over je ontbijt (`BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`, dichtheidsscore afgewezen). Bij één eetmoment geen verdeling.
- **Transvet:** zit in de NEVO-bron ("Vetzuren trans totaal"), maar niet in `nevo_foods`. Wordt een aparte PR: extractor, migratie en nieuwe laadronde door Dennis. Weergave zonder norm (GR 2026: "zo weinig mogelijk"), als "waarvan trans" in de voedingswaardetabel.

### Afgewezen (6 okt)

- **Ingrediënten per merk (product en supplement) nu tonen.** Er is geen bron die het mag leveren. NEVO heeft geen ingrediënten. De supermarktdata heeft een ongetoetste licentie (die blokkeert al livegang). Open Food Facts heeft wel ingrediënten, maar wisselende kwaliteit en een licentie met naamsvermelding en share-alike. Eerst een bronbesluit.
- **"Slechte E-nummers" markeren.** Alle E-nummers zijn door EFSA beoordeeld en in de EU toegelaten. "Slecht" is een oordeel dat we niet onderbouwen, en het past niet bij een platform waarvan de waarde in onderbouwing zit.
- **Koppeling aan laaggradige ontsteking.** Dat is een medische claim (CLAUDE.md: geen medische claims). Het onderzoek naar emulgatoren en ontsteking is vooral dierstudies en kleine proeven bij mensen, dus het haalt de poort niet (alleen sterk bewijs bij gezonde mensen, zie `BESLUIT_KERNSTOF_NORMEN_2026-10.md`).
- **Palmolie als waarschuwing.** Het gezondheidsdeel zit al in verzadigd vet. "Bevat palmolie" kan later als neutrale ingrediëntinformatie, maar pas na het bronbesluit en zonder gezondheidsframing.

## Aanvulling 6 oktober 2026 (4) — Macro's als de krans, premium datumkop

**Status:** gebouwd na Dennis' feedback op web en iPad ("heel kaal", "macro's dezelfde UI als voedingsstoffen", "ontbijt-lunch-avondeten-tussendoor onder het model", "dagen en Vandaag/Kies meer premium").

1. **Macro's in dezelfde vorm als Voedingsstoffen.** Een ring van 300 px met de calorieën in het midden ("van je doel …" als je een caloriedoel instelde), een legenda in rijen (gram plus aandeel van de calorieën, met balkje) en daaronder **Per maaltijd**: ontbijt, lunch, avondeten en tussendoor met kcal en de grammen koolhydraten, vet en eiwit, plus het deel van de calorieën van die dag. Zonder registratie: "Wat at je vandaag?" met "Voeg je ontbijt toe", net als de krans.
   - **Geen advies over timing.** Dennis noemde "de meeste eiwitten bij het ontbijt" en "de grootste maaltijd bij de lunch". Het bewijs bij gezonde mensen ondersteunt hooguit eiwit verdelen over de maaltijden, geen vaste volgorde. De tabel toont daarom wat er was, zonder oordeel.
2. **Alle gevolgde stoffen onder de krans.** De beperking tot vier ("Toon alle n") vervalt: de rijen zijn compact genoeg.
3. **Datumkop in plaats van "Je dag".** Bovenaan staat de dag zelf ("Vandaag · dinsdag 6 oktober" of "maandag 5 oktober"), met ‹ › per **dag** (nooit voorbij vandaag), "Vandaag" en "Kies" (met kalendericoon) als rustige randknoppen. De week staat eronder als zeven rondjes: gekozen = gevuld, vandaag = rand, stip = ingevuld, oranje stip = meetdag. Toekomstige dagen zijn niet te kiezen. De lange meetdag-uitleg wordt een korte legenda (met de volledige tekst als tooltip).
4. **Volgorde op mobiel:** datum, tabs, ring, inhoud. Tabs staan nu boven de ring omdat ze bepalen welke ring je ziet; op brede schermen staat de ring links naast de inhoud.

## Aanvulling 6 oktober 2026 (5) — dagen boven de inhoud, mobiel nagelopen

- **Op brede schermen staan datum en dagen bovenaan de rechterkolom**, direct boven wat erover gaat (eetmomenten, "Alles wat je at", de weektabel of het stof-detail). De tabs staan over de volle breedte, de ring links over twee rijen. Op mobiel blijft de datum bovenaan: datum, tabs, ring, inhoud.
- **Op 375 px in de browser nagelopen** (Chrome-emulatie): datumkop, rondjes, tabs, krans, legenda en de tabel per maaltijd passen. Daarbij aangepast:
  - op smalle schermen (blok < 460 px) een korte datum ("Ma 5 okt") in plaats van twee regels; Nederlandse maandnamen zonder hoofdletter;
  - de buitenring tekent een gevolgde stof zonder registratie als egaal leeg spoor; **gestippeld blijft alleen voor stoffen zonder norm** (en voor zink en vitamine D in de binnenring), nu als dunne stippellijn in plaats van dikke kralen;
  - de laatste kolom van de tabel per maaltijd krijgt ruimte tot de rand.

## Aanvulling 6 oktober 2026 (6) — kop als één groep, één bronregel, verwijderen rechtsboven

- **Vandaag en Kies sluiten aan op de datum** (‹ datum › Vandaag Kies) in plaats van rechts in de hoek. Op smalle schermen lopen ze door naar een tweede regel.
- **Eén bronvermelding** onder "Alles wat je at": de tabel draagt de NEVO-vermelding zelf; de tweede regel eronder vervalt.
- **Productdetail: verwijderen rechtsboven**, als knop met prullenbak. Een tik vraagt "Verwijderen?" met ✓ (ja) en × (laten staan), zodat niemand per ongeluk een product kwijtraakt. De losse knop onderaan vervalt.

## Herziening 8 oktober 2026 — de ring staat stil, het midden geeft overzicht

**Status:** besloten (Dennis, 8 okt: "ring verandert raar mee als je op één klikt", "geen optie van alle nutriënten tegelijk zien", "chip niet echt duidelijk", "kan niet meer naar de beste voedingsproducten"; gekozen: alles uit het voorstel).
**Herziet:** §3 hierboven ("meedraaien = één draai op een tik") en punt 1 van de herziening van 6 okt ("standaard staat de meetbare kernstof met het grootste open stuk bovenaan").

1. **Niet meer draaien.** Een tik licht de stof op en dimt de rest; de ring zelf blijft staan, en de wijzer bovenaan vervalt. De reden voor het draaien (de stof bij een vaste plek brengen) woog niet op tegen het gevoel dat de ring "raar meebeweegt".
2. **Standaard een overzicht in het midden:** de vijf kernstoffen onder elkaar, met kleurstip, naam, waarde (zelfde notatie als de lijst: % onder de norm, hoeveelheid erboven, ✓ als gedekt; "—" voor zink of vitamine D zonder registratie). Een tik op een stof toont die stof zoals sinds 6 okt ("nog X tot je norm vandaag"); nog een tik terug naar het overzicht. De telling met namen onder de krans blijft. "Nooit tekort" blijft.
3. **De lijst onder de krans staat ook op een smal scherm standaard open** ("Verberg stoffen" klapt hem in). Dat herziet de inklapbare lijst uit #155 alleen in de beginstand.
4. **De gekozen rij is duidelijk:** een rand en een lichte vulling in de stofkleur (gevolgde stoffen: neutrale rand), in plaats van een bijna onzichtbaar grijs vlak.
5. **Rijkste bronnen ook bij een kernstof.** Onder de krans staan bij een kernstof twee vervolgstappen naast elkaar: "Logboek van … →" en "Rijkste bronnen →" (hetzelfde scherm als bij een gevolgde stof, dat kernstoffen al kende). Een tik op een segment opent nog steeds niet direct een ander scherm (afgewezen op 5 okt, blijft zo).

**Meetpunt:** ongewijzigd `nutrition_dagboek_krans_gekozen`; de nieuwe link telt in `nutrition_dagboek_rijkste_geopend` met `surface: ring` en een kernstof als `nutrient`. Lees het effect af aan het aandeel kernstoffen in dat event.
