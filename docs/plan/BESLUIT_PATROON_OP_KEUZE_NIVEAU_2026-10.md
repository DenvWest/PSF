# Besluit: Je patroon krijgt de opbouw van Keuze (stofchips, hero, kaarten)

**Datum:** 10 oktober 2026
**Status:** Besloten (Dennis: "akkoord, ik vertrouw jou"). Plak 1 gebouwd (#244), plak 2 gebouwd (#247), plak 3 gebouwd.
**Bouwt voort op:** `BESLUIT_PATROON_STOF_EN_TREND_2026-10.md`, `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`, `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` (gratis 7 dagen, premium 30–90: ongewijzigd), `BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`

## Aanleiding

Dennis: Keuze is mooier en gebruiksvriendelijker dan Patroon, en bij eiwit wil je alle micro's met balken kunnen zien en zelf kunnen kiezen welke er staan, ook als er stoffen bijkomen.

## Besluiten

1. **Eén stof tegelijk, zoals Keuze.** Per stof begint met stofchips (Overzicht · kernstoffen · gevolgde stoffen) met een stip voor de stand (sage gehaald, terra onder de norm, grijs niet te meten). "+ Stoffen kiezen" opent de bestaande `GevolgdeStoffenKiezer`: dezelfde opslag, geen tweede kiezer.
2. **Hero per stof** (`PatroonStofHero`): stand in woorden, één zin, balk met normstreep. "Onder je norm", nooit "tekort".
3. **De hero is een eigen component, geen uittreksel uit Keuze.** `StofHero` in Keuze hangt aan de Keuze-stand (supplement erbij, bovengrens). Patroon deelt de visuele taal (`--vd-*`, dezelfde vormen), niet de code.
4. **De tabel blijft** als Overzicht. De losse "+ Stof toevoegen"-knop onderaan is vervallen; de kiezer zit in de chiprij. De terugknop in het detail is vervangen door de chip Overzicht.
5. **Gratis blijft 7 dagen.** Een voorstel van 14 dagen gratis is afgewezen: premium verkoopt het verband over tijd (30–90 dagen).

## Volgorde

1. Per stof (gebouwd). 2. Per maaltijd en Trend in dezelfde kaartstijl. 3. Knop "Bekijk <stof> in je patroon" op de stofkaart in Keuze, die naar Patroon › Per stof met die stof opent (`leesPatroonUrl` kent `stof=` al).

## Plak 2 (Per maaltijd en Trend)

- **Per maaltijd:** de segmentrij is een chiprij met stip (sage = er is iets geregistreerd, grijs = nog niets). Eén hero-kaart met maaltijd, energie en macro's als tegels en "waar je ontbijt het meest aan bijdraagt". "Wat je at" en de stoffentabel behouden hun tabel maar krijgen een gekleurde bovenrand (sage, blauw), zoals de kaarten in Keuze.
- **Trend:** elke stofgrafiek in een kaart met de stofnaam in de kop-lettertype; de zichtbaarheidschips volgen de chip-stijl met stip. Grafiek, legenda en norm-uitleg ongewijzigd.
- Geen logica- of dataverandering; alle bestaande testen blijven gelden.

## Plak 3 (Keuze naar Patroon)

De stofkaart in Keuze had al "Alle rijkste bronnen in Je patroon →" (in de eetkolom). De hero krijgt nu een eigen link "Bekijk <stof> in je patroon →" naar `?tab=voortgang&sectie=stof&stof=<stof>`. Beide linken met `keuze_naar_patroon_stof`, nu met `plek: hero | bronnen`. De periode blijft die je laatst koos (standaard 7 dagen, gratis); premium is ongewijzigd (zie `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md`).

## Volgende plak: calorieën en vetten als inzicht (besloten 10 okt, nog niet gebouwd)

Dennis: laat zien welke calorieën "gezond" zijn en welke niet, met goede en slechte vetten; eigenlijk ook als gevolgde stoffen in Trend, met een grafiek zoals bij de micronutriënten.

1. **Geen oordeel-labels.** "Goede/slechte calorieën of vetten" is een gezondheidsclaim en een oordeel; dat botst met `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (informatief, geen oordeel/tekortlabel) en "adviezen, geen diagnoses". Het ontstekings- en doelverhaal ("moe voelen", laaggradige ontsteking) hoort bij een eventueel medisch product en blijft buiten het platform.
2. **Wel, feitelijk:** (a) waar je calorieën vandaan komen (aandeel eiwit/koolhydraten/vet/vezels in kcal), (b) het deel van je vet dat verzadigd is, (c) voedingsdichtheid per 100 kcal (bestaat al als kolom in Per maaltijd).
3. **Als gevolgde stoffen in Trend:** energie en vet worden volgbaar (nu alleen `saturatedFatG` van de vetten), met dezelfde staafgrafiek als de micronutriënten. Zonder norm-oordeel, tegen een norm alleen als die uit een officiële bron komt (Gezondheidsraad).
4. **Later:** enkel-/meervoudig onverzadigd vet en transvet vragen NEVO-velden; de NEVO-voorwaarden (tweede bronvermelding, geen kosten voor eindgebruikers) worden eerst getoetst.

## Niet gedaan

- Het verbergen van kernstoffen (voorkeur van de Trend-tab) is niet gekoppeld aan de chips; alle kernstoffen staan als chip.

**Meting:** ongewijzigd: `nutrition_patroon_stof_geopend`, `nutrition_patroon_gevolgd_toevoegen_open`, `nutrition_patroon_nutrient_toggle`. Een chiptik is dezelfde actie als een tik op een rij.

## Plak 4: energie en vet als gevolgde stoffen, met een feitelijke verdeling (gebouwd 10 okt)

Dennis: calorieën en vetten ook als gevolgde stoffen in Trend, met dezelfde grafiek als de micronutriënten.

1. **Energie (kcal) en vet (g) zijn volgbaar** (`account-gevolgde-stoffen.ts`). Dat wijkt af van `BESLUIT_DOELEN_VERBONDEN_2026-10.md`, waar energie en macro's bewust buiten de volgbare stoffen vielen ("hebben het tabblad Macro's"). Eiwit en koolhydraten blijven eruit. Geen migratie: de tabel heeft geen check-constraint op de waarden.
2. **Zelfde grafiek, zonder norm.** Trend en Per stof behandelen ze als elke gevolgde stof zonder norm: staafjes tegen je eigen hoogste dag, "geen norm, alleen je gemiddelde".
3. **Verdeling in Per stof** (`PatroonEnergieVerdeling`): bij energie het aandeel eiwit, koolhydraten en vet in kcal (4/4/9 per gram), bij vet het deel dat verzadigd is. Feit, geen oordeel; de tekst zegt dat er geen "goede" of "slechte" calorie is. De uitsplitsing in enkel-/meervoudig onverzadigd en transvet wacht op NEVO (zie besluit hierboven).

**Meting:** ongewijzigd (`nutrition_patroon_stof_geopend`, `nutrition_patroon_gevolgd_toevoegen_open`, `voedingsdoel_aangepast` met `stof: energyKcal | fatG`): hier lees je af of mensen energie en vet volgen.

## Plak 5: de weg terug naar Keuze, namen en "wat kun je hiermee" (gebouwd 10 okt)

1. **Terug naar Keuze.** De links uit Keuze dragen `&van=keuze`. Patroon toont dan bovenaan één rustige regel: "Je kwam van Keuze · Eiwit. Hier zie je je eiwit over 7 dagen, als bewijs bij wat je kiest. ← Terug naar Keuze", die naar `?tab=keuze&stof=<stof>` gaat. De regel verdwijnt zodra je zelf een andere stof of sectie kiest en `van` verdwijnt dan ook uit de URL. Alleen de vijf kernstoffen hebben een Keuze; voor andere stoffen verschijnt hij niet. Zelfde mechanisme als `TerugNaarKeuze` op productpagina's.
2. **Namen:** energie heet **Calorieën** en vet **Vetten** in Patroon, de kiezer en Trend (`stofNaam`); in het dagboek blijft de tabelnaam staan.
3. **"Wat kun je hiermee?"** onder de verdeling: bij calorieën een link naar Per maaltijd (waar zit ruimte voor eiwit of vezels), bij vetten naar omega-3 en de rijkste bronnen. Feitelijk, geen oordeel.

**Meting:** nieuw GA4-event `patroon_terug_naar_keuze` {nutrient}; samen met `keuze_naar_patroon_stof {plek}` is dat de heen-en-weer-beweging Keuze ↔ Patroon. De "wat kun je hiermee"-links gebruiken `nutrition_patroon_sectie_gekozen` en `nutrition_patroon_stof_geopend`.

## Plak 6: het Overzicht in Per stof met de balk van het detail (gebouwd 10 okt)

Dennis: de overzichtsbalk in Patroon net zo mooi als in de losse stoffen.

1. **Eén balk** (`StofBalk`: afgeronde baan, vulling, normstreep) in elke stofrij van het Overzicht, dezelfde taal als de hero. Zonder norm of meting geen balk: een balk zonder maat suggereert een oordeel.
2. **Kaart-rijen in plaats van tabelrijen** (`PatroonStofRij`) voor kernstoffen en "Ook gevolgd": naam met stip en pil, percentage, balk, gemiddelde, norm met bron en eventuele streefwaarde onder elkaar. Geen vier smalle kolommen meer op 375px.
3. **De "Je doelen"-kaart** begint met een segmentbalk (één segment per kernstof: gehaald, nog niet, niet te meten) boven de bestaande zin. De tekst is gelijk.
4. Gevolgde stoffen blijven neutraal gekleurd ("zonder oordeel-kleur"). Rekenlogica, normen, de asymmetrie-regel en de meetpunten zijn niet veranderd.
