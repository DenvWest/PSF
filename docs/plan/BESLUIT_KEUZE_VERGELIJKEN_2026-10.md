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
