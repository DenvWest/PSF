# Besluit: micronutriënten in beeld — gehaald, per maaltijd, route via voeding

**Datum:** 6 oktober 2026
**Status:** Besloten (Dennis: "akkoord"). Stap 1 gebouwd op `feat/patroon-benadering-macros`; stap 2–4 volgen elk als eigen PR.
**Herziet:** `BESLUIT_NUL_SPOOR_BENADERING_2026-10.md` §5 en "Afgewezen" (benaderingen in de dagsom), alleen voor energie, macro's en eiwit.
**Laat staan:** de asymmetrie-regel, "nooit een ✗ of rood", het ✓ tegen de norm (niet tegen de streefwaarde) voor de kernstoffen, geen oordeel per maaltijd.

## Aanleiding

Dennis' feedback op Je patroon → Per maaltijd:

1. De totalen klopten niet met wat er gegeten was. Avondeten 3 keer, met o.a. 2× 100 g kipdij, toonde gemiddeld 188 kcal en 21,2 g eiwit. Kipdij is een benaderingskoppeling (NEVO "Kip/bout z vel gegrild") en telde voor 0. Met kipdij is het ≈ 313 kcal en ≈ 40 g eiwit per keer.
2. Micronutriënten moeten beter in beeld: wordt de norm per dag of per 7 dagen gehaald, uit voeding of supplement, en wat zou je erbij kunnen eten?
3. Per stof ook per maaltijd zien, met kleur per dag/maaltijd: welke maaltijd of welk product helpt niet?
4. Rijkste voedingsbronnen: een zoekfunctie, of een langere lijst?

## Besluiten

### 1. Vrijgegeven benaderingen tellen mee voor energie, macro's en eiwit (≈) — gebouwd

- Alleen de tien vrijgegeven benaderingen (`FOOD_CATALOG_NEVO_BENADERINGEN`, uit `scripts/nevo-benadering-micros.json` → `toon`).
- Ze tellen mee voor energie, vet, verzadigd vet, koolhydraten, suikers, vezels en eiwit. Eiwit ook in de krans en het tekortsysteem (`bedragVanItem`).
- Vitamines, mineralen en de andere kernstoffen (magnesium, zink, vitamine D, omega-3) van een benadering tellen **niet** mee: die blijven een ondergrens uit echte brongetallen.
- Elke som waaraan een benadering bijdroeg, staat er met "≈". Onder de tegels staat welk product het is.
- Niet-vrijgegeven benaderingen (plantdranken, vleesvervangers, proteïnereep, …) blijven buiten elke som: daar verschilt juist de samenstelling per merk.

**Waarom:** het bezwaar tegen benaderingen in een som was het ✓ dat het systeem niet kan onderbouwen. Bij energie en macro's is er geen ✓ en geen norm. Bij eiwit is kipbout voor kipdij een kleinere fout dan 0 g: 200 g kip als 0 g tellen gaf de helft van je eiwit.

### 2. Kleur: groen ✓ waar gehaald, anders neutraal — nooit rood

- Een dag (kalender, Per stof) krijgt een groene stip/✓ als de norm van de gekozen stof aantoonbaar gehaald is. Anders een neutrale tint met de afstand ("te gaan").
- Geen rood, geen ✗: een inname onder de norm is geen tekort, en het systeem kan een tekort niet bewijzen (producten zonder gehalte).
- Een maaltijd krijgt geen kleur: de norm is een dagnorm, een ontbijt kan hem niet "halen".
- "Norm" (persoonlijk, met bron) blijft de term in Patroon; "% ADH" alleen op het etiket van één product.
- Het ✓ voor de kernstoffen blijft tegen de norm; een eigen streefwaarde krijgt een percentage, geen ✓. Bij de referentiestoffen (kalium, calcium, ijzer, B12, C) mag een eigen doel wel een ✓ geven (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`).

### 3. Per stof per maaltijd: "waar je X vandaan kwam" — stap 2

- In het stof-detail: het aandeel per maaltijd (ontbijt · lunch · avondeten · tussendoor) van de stof in de gekozen periode.
- Eén zin over **waar de ruimte zit** ("je lunch leverde 6% — daar zit de meeste ruimte"), met een concrete toevoeging. Niet: "deze maaltijd schiet tekort".
- Per product wat het bijdroeg; "onbekend" apart van een gemeten 0.

### 4. Route om de afstand dicht te maken: eerst voeding, dan supplement — stap 3

- Per stof en periode: gemiddeld vs. norm (met bron), uit voeding vs. uit supplement.
- **Met voeding:** de afstand vertaald naar een portie uit de rijkste bronnen ("≈ 30 g pompoenpitten"), gefilterd op voedingswijze, met "Voeg toe in je dagboek".
- **Of:** supplementvergelijking, alleen bij kernstoffen, als tweede stap. Nooit "je hebt een supplement nodig".

### 5. Rijkste voedingsbronnen: top 20 + voedselgroepchips, geen zoekveld — stap 4

- Top 5 blijft, met "Toon top 20".
- Chips per voedselgroep (groente, noten, vis, granen, …).
- Per bron: welk deel van je afstand één portie dicht.
- **Afgewezen: zoekveld.** Zoeken op product bestaat al in het dagboek; een tweede zoekveld dubbelt dat.

## Volgorde

1. Benaderingen in de som (dit besluit §1) — eerst, omdat elke dekking hierop rust.
2. Per maaltijd in Per stof + groene kalenderstip (§2, §3).
3. Route via voeding (§4).
4. Top 20 + chips (§5).

## Uit de eerdere brainstorm, nog niet besloten

- Voedselgroepen per maaltijd tegen de Schijf van Vijf (250 g groente, 200 g fruit, 1× vis per week, 25 g noten), met bron.
- Kolom "deel van je dag" in plaats van "Norm" in Per maaltijd.
- Energieverdeling (en%) naast de bandbreedte van de Gezondheidsraad — raakt macro-besluit §0.1, apart voorleggen.

## Meting

- Stap 1 voegt geen interactie toe: geen nieuw event. Het effect is af te lezen aan bestaande events in Patroon (`nutrition_patroon_maaltijd_gekozen`, `nutrition_patroon_stof_geopend`).
- Stap 2–4 krijgen hun eigen meetpunten in hun PR.
