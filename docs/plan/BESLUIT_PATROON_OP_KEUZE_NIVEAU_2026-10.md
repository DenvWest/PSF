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
