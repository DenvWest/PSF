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

3. **Eén plek om in te stellen: Je doelen.** Twee ingangen: het bestaande item "Doelen" in Meer, en een link "Stoffen kiezen →" op de tabbladen Voedingsstoffen en Macro's die naar het blok "Wat je volgt" springt en terugbrengt naar het dagboek.

4. **Eén bron voor doelen.** Krans, beide tabbladen, weektabel en productdetail lezen hun doel uit één functie in `src/lib/`, zodat geen scherm een ander getal toont.

5. **De weektabel telt alles wat de dag telt.** Per dag `berekenVoedingswaarde` (catalogus via NEVO + etiket), daarna gemiddeld over dagen met minstens één product. Producten zonder waarden worden gemeld; het gemiddelde is dan een ondergrens. Dit sluit het open punt uit `BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md`.

## Afgewezen

- **Een tweede bewerkscherm in het dagboek** (stoffen aan/uit naast de tabel). Twee plekken voor dezelfde instelling lopen uit elkaar; dat is het "niet verbonden"-probleem dat dit besluit oplost. De link uit punt 3 legt het kiezen wel bij de tabel.
- **Een nieuw item in het Meer-menu** naast "Doelen". Dubbelop.
- **Een vooringestelde macro-verdeling of calorierichtlijn.** Blijft afgewezen (macro-besluit §4).
- **Gevolgde stoffen als nieuwe gemeten stof met tekortoordeel.** Dat loopt via `BESLUIT_IJZER_CALCIUM_2026-09.md` §8, niet via dit besluit.

## Volgorde

1. Weektabel telt catalogusproducten mee (geen migratie). **Gebouwd 4 okt.**
2. Eén bron voor doelen in `src/lib/`. **Gebouwd 4 okt**, samen met de Nederlandse norm per persoon: zie `BESLUIT_KERNSTOF_NORMEN_2026-10.md`.
   2b. Weekweergave voor omega-3 en vitamine D in de krans.
3. Doelen-scherm herontwerpen: blokken "Uit je check", "Jouw energie en macro's", "Wat je volgt"; Tailwind i.p.v. inline styles; één opslaan-knop; live grammen bij percentages.
4. Migratie: gevolgde stoffen + RI-overschrijvingen (eigen tabel of naast `account_macro_doelen`), chips op het Doelen-scherm, link vanuit het dagboek.

## Meetpunt

`voedingsdoel_aangepast` (bestaand), met nieuwe `setting`-waarden `gevolgde_stof_aan`, `gevolgde_stof_uit`, `ri_override`. Voor de dagboek-link: `nutrition_dagboek_stoffen_kiezen_klik` (nieuw, in plak 4).
