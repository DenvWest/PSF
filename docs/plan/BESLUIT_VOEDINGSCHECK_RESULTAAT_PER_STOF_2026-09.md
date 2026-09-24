# Besluit — voedingscheck-resultaat: één rij per stof

**Datum:** 24 september 2026
**Status:** besloten (Dennis akkoord op A en B, 24 sep)
**Vervolg op:** `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.3–3.4 (tekortsysteem per stof, asymmetrie-regel)

---

## 1. Aanleiding

Het resultaat op `/intake?resultaten=true` las als losse blokken van gelijk gewicht — Focus, Kwaliteit, Jouw stappen (ingeklapt), Supplementen indien gewenst (ingeklapt), Sinds je vorige check (ingeklapt). Wat iemand kan dóén stond verspreid over drie plekken; alleen de focus en de onderbouwing waren zichtbaar.

Daarbovenop een bug: bij herladen via `?resultaten=true` stonden de sliders niet in state, dus vielen de per-stof-tabel (`VoedingVsSupplementTabel`) en de feitenrijen (`VerhoudingTabel`) stil weg — terwijl `intake_intake_log.raw_inputs` de antwoorden bewaart.

## 2. Besluit

**A — De stof is de eenheid op het resultaat.** Eén rij per stof (eiwit, omega-3, magnesium, vitamine D, zink), elk met dezelfde opbouw:

1. **Status** — uit `buildNutrientRouteStatuses` (route-taal: "Hier ligt winst", "Onderweg", "Haal je uit je eten"), niet uit een eigen oordeel.
2. **Jij vs. richtlijn** — zijn antwoord naast de drempel in dezelfde eenheid ("1× per week" naast "2× vette vis per week").
3. **Wat je doet** — één handeling.
4. **Vorige meting** — richting sinds de vorige check mét datum, of "eerste meting · <datum>". Alleen richting, geen bandnamen: de delta rekent op de estimate-band, de status op de route — twee meetlatten, dus geen "was onder → nu rond" die met de status kan botsen.
5. **Waarom dit telt** — de bestaande evidence-disclosure.
6. **Supplement** — alleen als de route aantoonbaar dicht zit (`supplementDoorOpen` + laag-6-poort), altijd ná de voedingsactie, als link naar `/supplementen?categorie=<stof>` (de catalogus met alle producten van die stof), niet naar één `/beste/*`-pagina.

De focus-stof staat bovenaan en is open; de rest zijn compacte, uitklapbare rijen. De blokken "Jouw stappen", "Supplementen, indien gewenst", "Sinds je vorige check" en de losse `VoedingVsSupplementTabel` op het resultaat gaan op in de rijen.

Herladen via `?resultaten=true` herstelt de antwoorden uit `raw_inputs`, zodat de rijen en feitenrijen ook bij terugkeer staan.

**B — `/supplementen` "Past bij jou" leest de voedingscheck.** Nu komt de lijst uit `buildRecommendations(session)` (de domeinscores van de brede check) en is de voedingscheck alleen een aan/uit-poort. Na B komt hij uit dezelfde routestatussen als de rijen onder A: stoffen met een open supplement-deur uit de laatste `intake_intake_log`. Beide pagina's zeggen dan hetzelfde.

## 3. Correctie op §3.4 van het voedingsfocus-besluit (zink)

§3.4 en `NIET_BEWIJSBAAR` in `nutrition-tekortsysteem.ts` zeggen dat zink "structureel geen oordeel" krijgt omdat bronnen 1–4 mg per portie leveren tegen 10 mg RI. Dat is te stellig geformuleerd. De gehaltes per product zijn goed bekend (NEVO, USDA); wie álles registreert kan zink net zo goed optellen als magnesium.

De echte reden is de **meetmethode, niet de stof**: het dagboek is een bewuste 2+2-registratie die een ondergrens oplevert. Zink komt in kleine beetjes uit veel producten tegelijk, dus een onvolledig dagboek haalt de 10 mg vrijwel nooit — ook niet bij iemand die in werkelijkheid genoeg binnenkrijgt. Dat leest als falen terwijl het een meetgat is.

- **In het dagboek** blijft zink voorlopig zonder dekkingsoordeel; heroverwegen zodra registratie vollediger wordt of de catalogus breder.
- **In de check** krijgt zink wél een status (frequentie van vlees/vis/peulvruchten + zuivel, vertrouwen 2/4 in `intake-reference.ts`), met de route-taal die al zegt dat het een proxy is.
- **Vitamine D** is een andere zaak: uit voeding berekenbaar, maar de status komt voor 80–90% uit zon op de huid. Voeding zegt daar dus weinig over toereikendheid.

## 4. Wat dit besluit níét doet

- Geen milligram-som of %RI op het resultaat — de check meet frequenties en `food-sources.ts` staat op `verified: false` (zie kop van `nutrient-routes.ts`). %RI hoort bij het dagboek (§3.6 voedingsfocus-besluit).
- Geen migratie, geen scoring-wijziging.
- `/beste/*` blijft ongemoeid.

## 5. Meetpunt

- Supplementlink per rij: bestaand `nutrition_supplement_vergelijk_click` (surface `check_rij`).
- Rij openen: GA4 `nutrition_result_row_open` (nutrient, is_focus).
- B: bestaande hub-events blijven; alleen de bron van "Past bij jou" verandert.
