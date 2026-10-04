# Besluit: doelen per stof, zelf kiezen wat je volgt, één bron voor alle schermen

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "Akkoord", met vervolgvraag over de plek; zie §3)
**Raakt:** `/dashboard/doelen` (`VoedingsdoelenKaart`, `MacroDoelenKaart`), het dagboek (krans, tabbladen Voedingsstoffen en Macro's, weektabel, productdetail)
**Bouwt voort op:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§0.1, §4), `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md` (open punt weektabel)

## Aanleiding

Het Doelen-scherm had twee losse formulieren (eiwit en macro's), en de weektabel in het dagboek toonde "n.o." voor alles wat uit de catalogus kwam: hij telde alleen etiketproducten. Dennis vroeg of doelen ook bij voedingsstoffen horen, of het scherm mooier en breder kan, of iemand zelf kan kiezen welke stoffen hij ziet, en hoe alles verbonden blijft.

## Besluit

1. **Drie soorten doel, elk met een eigen regel.**

   | Soort | Stoffen | Wie bepaalt het doel | Wat je ziet |
   |---|---|---|---|
   | Uit je check | magnesium, zink, vitamine D, omega-3, eiwit | Het systeem (tekortsysteem, PROT-AGE) | ✓ of "te gaan", nooit ✗. Enige route naar `/beste/*` |
   | Referentie | kalium, calcium, ijzer, B12, C (en wat de databron later levert) | Wettelijke RI (1169/2011, bijlage XIII) als standaard, zelf te overschrijven | %RI of afstand, neutrale tint, ✓ bij gehaald |
   | Eigen doel | energie, koolhydraten, vet, eiwit-% | Alleen de gebruiker. Leeg blijft leeg | Getal, balk, "nog X tot je doel" |

   **Nieuw t.o.v. eerdere besluiten:** de RI wordt een *instelbaar doel* met een ✓ bij gehaald, waar hij tot nu alleen een %RI was. Dat mag omdat de RI een wettelijke referentiewaarde is en geen door het systeem berekend advies (macro-besluit §4 blijft voor energie/macro's ongewijzigd: geen vooringevulde 50/30/20). Nooit een ✗, nooit "te veel" of "te weinig" (asymmetrie-regel).

2. **Zelf kiezen wat je volgt.** Een gebruiker kiest welke informatieve stoffen het dagboek en de weektabel tonen. Grenzen:
   - De vijf kernstoffen zijn niet uit te zetten: ze dragen de krans en het tekortsysteem.
   - Alleen velden die NEVO en het etiket al leveren; geen nieuwe stoffen via deze route.
   - Gevolgde stoffen en eigen doelen leiden nooit naar `/beste/*` (macro-besluit §0.1).

3. **Eén opslag en één kiezer, meerdere ingangen.** De gevolgde stoffen staan in één tabel (`account_gevolgde_stoffen`) en worden overal gekozen met hetzelfde component (`GevolgdeStoffenKiezer`). Ingangen: het blok "Wat je volgt" op Je doelen (via Meer), en een rij "+ stof toevoegen" onder de venstertabel in Je patroon. *Herzien 4 okt, zie "Herziening" hieronder.*

4. **Eén bron voor doelen.** Krans, beide tabbladen, weektabel en productdetail lezen hun doel uit één functie in `src/lib/`, zodat geen scherm een ander getal toont.

5. **De weektabel telt alles wat de dag telt.** Per dag `berekenVoedingswaarde` (catalogus via NEVO + etiket), daarna gemiddeld over dagen met minstens één product. Producten zonder waarden worden gemeld; het gemiddelde is dan een ondergrens. Dit sluit het open punt uit `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md`.

## Afgewezen

- **Een tweede, eigen bewerkscherm** met een eigen opslag of eigen kiezer. Twee plekken die elk iets eigens bewaren lopen uit elkaar; dat is het "niet verbonden"-probleem dat dit besluit oplost. (Een tweede *ingang* naar dezelfde kiezer en dezelfde opslag mag wel, zie "Herziening".)
- **Een nieuw item in het Meer-menu** naast "Doelen". Dubbelop.
- **Een vooringestelde macro-verdeling of calorierichtlijn.** Blijft afgewezen (macro-besluit §4).
- **Gevolgde stoffen als nieuwe gemeten stof met tekortoordeel.** Dat loopt via `BESLUIT_IJZER_CALCIUM_2026-09.md` §8, niet via dit besluit.

## Volgorde

1. Weektabel telt catalogusproducten mee (geen migratie). **Gebouwd 4 okt.**
2. Eén bron voor doelen in `src/lib/`. **Gebouwd 4 okt**, samen met de Nederlandse norm per persoon: zie `BESLUIT_KERNSTOF_NORMEN_2026-10.md`.
   2b. Weekweergave voor omega-3 en vitamine D in de krans.
3. Doelen-scherm herontwerpen: blokken "Uit je check", "Jouw energie en macro's", "Wat je volgt"; Tailwind i.p.v. inline styles; één opslaan-knop; live grammen bij percentages.
4. Migratie: gevolgde stoffen + RI-overschrijvingen (eigen tabel of naast `account_macro_doelen`), chips op het Doelen-scherm, link vanuit het dagboek.
   **4a gebouwd 4 okt** (PR #129): tabel `account_gevolgde_stoffen`, kiezer, kaart "Wat je volgt". **4b gebouwd 4 okt**: "Ook gevolgd" + "+" onder de venstertabel in Je patroon; etiketporties van 30 dagen in één verzoek (`?van=&tot=`). RI-overschrijving per stof nog niet gebouwd.

## Herziening 4 okt (Dennis: "Akkoord")

Dennis wilde een "+"-knop onder de tabel in Je patroon om een stof toe te voegen. Dat leek te botsen met de afwijzing van "een tweede bewerkscherm". Het bezwaar daar was dat twee plekken *uit elkaar lopen*. Dat kan niet als beide ingangen hetzelfde component gebruiken en naar dezelfde tabel schrijven. Daarom:

- De "+" opent `GevolgdeStoffenKiezer`, hetzelfde component als op Je doelen.
- Toegevoegde stoffen staan in Patroon onder een eigen kopje "Ook gevolgd": gemiddelde per venster in mg/µg/g, %RI in neutrale tint. Geen ✓, geen richtingpijl, geen link naar `/beste/*` (scheiding tekortsysteem ↔ informatielaag, macro-besluit §0.1).
- Te kiezen: de informatieve velden die het dagboek al heeft (vezels, verzadigd vet, suikers, natrium, kalium, calcium, ijzer, vitamine B12, vitamine C). Kernstoffen staan er al vast in; energie en macro's staan op het tabblad Macro's. Extra NEVO-stoffen (folaat, jodium, selenium, …) vragen een uitbreiding van de import en komen later.

### Afspraak met de parallelle sessie (dagboek + micronutriëntringen)

Een andere sessie breidt het dagboek en de micronutriëntringen uit. Om dubbel werk en uiteenlopende opslag te voorkomen:

- **Deze sessie levert:** tabel `account_gevolgde_stoffen`, `src/lib/account-gevolgde-stoffen.ts` (welke velden volgbaar zijn + lezen/schrijven), `GET/POST /api/account/gevolgde-stoffen`, de hook `useGevolgdeStoffen()` en het component `GevolgdeStoffenKiezer`.
- **De dagboeksessie gebruikt die**, en maakt geen eigen lijst of eigen opslag van "welke stoffen toon ik". Wil het dagboek meer of andere velden volgbaar maken, dan gaat dat via `VOLGBARE_VELDEN` in diezelfde module.
- **Doelen per stof** (RI-overschrijving) komen in een volgende stap in dezelfde tabel; nog niet gebouwd.

## Meetpunt

`voedingsdoel_aangepast` (bestaand), met nieuwe `setting`-waarden `gevolgde_stof_aan`, `gevolgde_stof_uit`, `ri_override`. Voor de dagboek-link: `nutrition_dagboek_stoffen_kiezen_klik` (nieuw, in plak 4).
