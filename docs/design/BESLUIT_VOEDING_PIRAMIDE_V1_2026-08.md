# Voeding v1 — eetbasis-piramide, feitelijke readout en gated vergelijk-deur

**Status:** spec, niet gebouwd · **Datum:** 9 augustus 2026 · **Prebuild:** `voeding-piramide-prebuild-v1-2026-08.html`

Noordster: *eerst structureel goed eten, daarna pas perfect eten.*

---

## 0 · Correcties op de opdracht (geverifieerd in repo, aug 2026)

Drie aannames uit de prompt kloppen niet met de code. De spec volgt de code.

| Aanname in prompt | Werkelijkheid in repo | Gevolg voor deze spec |
| --- | --- | --- |
| VR-CTA → `/dashboard?tab=voortgang&screen=voeding` | `screen` accepteert alleen `hub · inzichten · favorieten · statistieken · lichaamssamenstelling · domein` ([dashboard-url.ts:10-17](../../src/lib/dashboard-url.ts#L10-L17)). Domein-diepte gaat via `screen=domein&domein=<pillar>` ([dashboard-url.ts:171-187](../../src/lib/dashboard-url.ts#L171-L187)) | Alle links in §M gebruiken `?tab=voortgang&screen=domein&domein=voeding`, gebouwd met `buildDashboardVoortgangHref("domein", null, "voeding")`. Géén nieuwe screen-id. |
| Frame VQ = "één slider-vraag (groente)" | De `vegetables`-slider vraagt letterlijk *"Hoeveel porties **magnesiumrijke** voeding eet je op een gewone dag?"* ([lifescore-questions.ts:150](../../src/data/nutrition/lifescore-questions.ts#L150)) | VQ toont die vraag mét de herformulering die §C voorstelt. De herformulering is een **copy-wijziging, geen engine-wijziging** — `vegFruitPerDay` blijft de magnesium-proxy voeden. |
| `nutrition_checkin_routing_click` bestaat al | Bestaat niet. Wél: `nutrition_log_completed`, `nutrition_check_completed`, `dashboard_voedingscheck_cta_click`, `nutrition_result_agenda_cta_click`, `nutrition_result_dashboard_return`, `nutrition_supplement_revealed`, `nutrition_lifestyle_extra_shown` | §G behandelt het als nieuw event, en stelt voor de twee bestaande per-bestemming-events erin op te laten gaan. |

Eén lock-conflict dat ik expliciet beslecht: de canon schrijft UI-laagnamen voor als *"LAAG 1 · Je eetbasis"*, L2 verbiedt ordinalen in UI. **Besluit: de UI toont uitsluitend de naam** ("Je eetbasis"). Nergens een cijfer, ook niet zonder "van 6". Het laagnummer leeft alleen in het data-contract (`layer: 1..6`). L2 wint van de letterlijke canon-notatie.

Verder: `helper` wordt op de vraag wél al gerenderd ([NutritionCapture.tsx:928-936](../../src/components/intake/NutritionCapture.tsx#L928-L936)) — anders dan bij beweging, waar de subtitle dood in de data lag. Dat verandert §C: `helpBody` is een *toevoeging* naast de helper, geen vervanging.

---

## A · Diagnose huidige voeding-UX

`NutritionResultView` afgezet tegen het gewenste C.1-model.

| Blok | Nu (letterlijk) | Waarom het faalt | Gewenst |
| --- | --- | --- | --- |
| **Kop** | h1 "Je voedingsscore" + gauge 0–100 | Het eerste wat hij leest is een cijfer over zichzelf. Een cijfer nodigt uit tot vergelijken en herhalen, niet tot begrijpen. Grenst aan L12. | h1 = de conclusie in woorden. Het cijfer verdwijnt van VR; het blijft bestaan als interne band-input. |
| **Conclusie** | "Wat je binnenkrijgt" + `summaryLine` = *"2 aandachtspunten op je frequentie"* | Telt wat er mis is. Dat is een saldo-readout: hij leest een tekortscore, geen positie. | Eén conclusiezin: waar hij in de eet-hiërarchie staat, en wat dáár de eerstvolgende winst is. |
| **Gaps** | `gaps = estimate.filter(band === "below")` over 5 nutriënten; focus = eiwit-first, anders `gaps[0]` | De vijf nutriënten zijn precies de vijf met een `/beste/*`-pagina. De diagnose-as is de verkoop-as. | Clusters C1–C5 uit laag 1–2 zijn de as. Nutriënten zijn een *uitlezing* daarvan, geen indeling. |
| **Supplement** | `<details>` "Supplementen, indien gewenst" met `Vergelijk {label} →` per stof, **boven** het delta-blok en **boven** de ijkpunt-prompt | Een vergelijk-link staat hiërarchisch vóór "wat is er veranderd sinds vorige keer". Het scherm eindigt in het schap. | Weg van VR. Vergelijken bestaat alleen achter de poort op VL (L6/L7). |
| **Focus** | "Focus: Eiwit" + `lifestyleAction` uit de portion-dictionary | Focus is een stof, geen gedrag. "Eiwit" is niet iets wat je doet. | Focus is een cluster ("Planten + eiwit + vezels") met één concrete eerstvolgende stap. |
| **Delta** | `deltaStatementFor()` → *"Je Eiwit-inname bewoog de goede kant op sinds je vorige check."* | Noemt geen antwoord, geen richting in maat, geen vorige waarde. Onfalsifieerbaar en daarmee betekenisloos. Zelfde ziekte als "een band lager" bij beweging, alleen vager. | Antwoordlabel → antwoordlabel, letterlijk. §D4. |
| **Vervolg-CTA** | Afhankelijk van `fromDashboard`: "Zet op Mijn Dag" + "Terug naar dashboard", óf "Sluiten" + Leefstijlcheck-link; plus onderbouwing-link, ijkpunt-prompt, N vergelijk-links, N evidence-disclosures | Zes tot tien uitgangen, geen enkele primair naar het domeinbeeld. De duurste bestemming (Voortgang › Voeding) is er niet eens bij. | Eén primaire CTA naar Voortgang › Voeding. §B. |

**Twee bevindingen die ik zelf toevoeg — en de duurste staat er tussen:**

**A5 · De meetlat-inversie.** De vier vragen die daadwerkelijk tegen een gepubliceerde populatierichtlijn te leggen zijn — `fruit`, `berries`, `wholegrain`, `sugaryDrinks` — zijn de *optionele* breedte-vragen, overslaanbaar met één tik (`breadth_skipped`), en ze voeden alleen de 0–100-score en twee lifestyle-extras ([nutrition-lifestyle-extras.ts:37-46](../../src/lib/nutrition-lifestyle-extras.ts#L37-L46)). Ze bereiken de gap-engine nooit: `NutritionSelfReport` kent ze niet ([nutrition-intake-estimate.ts:26-42](../../src/lib/nutrition-intake-estimate.ts#L26-L42)). De zeven *verplichte* kern-vragen zijn stuk voor stuk proxies voor de vijf supplement-nutriënten, met een eigen confidence-veld dat voor magnesium en vitamine D op **1 van 4** staat.

**A6 · `daylight` is geen eetvraag.** "Hoe vaak ben je ≥15 minuten buiten in daglicht?" staat in de voedingscheck omdat vitamine D een `/beste/`-pagina heeft. In een eetbasis-piramide heeft die vraag geen laag.

> **Duurste als je er één fixt: A5.** De andere vijf zijn presentatie — herschrijfbaar in copy, zonder de meting aan te tasten. A5 zegt dat het *instrument* op de verkoopcatalogus is gebouwd: de vragen die het oordeel dragen zijn zwak gebronde proxies, en de vragen met een echte bron zijn optioneel. Zolang dat staat, is elke "meetlat" die we op VR tonen een meetlat over data die we niet betrouwbaar hebben verzameld — en dan is de Consumentenbond-claim niet cosmetisch beschadigd maar feitelijk onwaar. Fix A5 en A1–A4 worden herschrijfwerk; fix A1–A4 zonder A5 en je hebt een mooiere onwaarheid.

Concreet gevolg voor v1: de vier breedte-vragen worden **verplichte kern** (§L, slice V1a) en `breadth_skipped` verdwijnt als normale toestand. Zolang dat niet is gebeurd, rendert §D een expliciete `na`-rij met een resume-link in plaats van te doen alsof we het weten.

---

## B · Informatie-hiërarchie per surface

Prioriteit 1 = must see, boven de vouw. "Weg" = verdwijnt uit de UI in v1.

| Blok | VQ (vraag) | VR (resultaat) | VL (Voortgang › Voeding) |
| --- | --- | --- | --- |
| Voortgangsindicator | **1** — `Vraag n van 11`, max 1 regel | — | — |
| Vraag + helper | **1** — prompt (serif) + helper (voorbeelden), max 3 regels | — | — |
| "Waarom vragen we dit?" | **2** — disclosure, dicht, 1 regel trigger | — | — |
| Antwoord-slider | **1** — stops + huidig label | — | — |
| Conclusie-blok (`.checkin-readout`) | — | **1** — eyebrow, conclusiezin, cluster-pil, statement, delta, implicatie, CTA. Max 9 regels | **1** — identiek blok, variant `voortgang`: CTA wordt stille link |
| Feitelijke clusterrijen | — | **2** — max 4 zichtbaar + "toon alles" (alleen laag 1–2) | **2** — alle laag 1–2-rijen open |
| Eetbasis-rail (6 lagen) | — | **weg** — VR benoemt alleen dát er meer onder ligt, in één regel | **1** — de rail is de hoofdinhoud van VL |
| "Wat kun je hier doen?" | — | **weg** (L7: geen genummerde actielijst op resultaat) | **2** — alleen op laag 1–3, max 3 acties, 1 knop per actie |
| Ijkpunt-prompt | — | **3** — blijft, verhuist naar ónder de CTA | — |
| Delta-detail per nutriënt | — | **3** — max 2 regels in het delta-blok, rest naar VL | **3** — volledige lijst |
| Lange advieslijst ("Jouw stappen (n)") | — | **weg** | **2** — wordt de laag-acties op de rail |
| Supplement-kaarten / vergelijk-links | — | **weg** (L6/L7) | **3** — alleen op laag 6, alleen bij open poort, label-only |
| Eiwitdoel-calculator | — | **weg van VR** | **3** — op laag 3 achter "meer uitleg" |
| Evidence-disclosures | — | **3** — één per zichtbare clusterrij, dicht | **3** — idem |
| Onderbouwing-link | — | **3** — footnote, 1 link | **3** — footnote |
| Beweging-koppelregel | — | — | **3** — max 1 regel (L11) |

**Wat expliciet van VR verdwijnt:** de supplement-`<details>` en alle `Vergelijk X →`-links · de `otherGaps`-lijst "Jouw stappen (n)" · de `ProteinTargetCard`-disclosure · de h1 met het scorecijfer · de dubbele terug-knoppen. Uitgangen op VR gaan daarmee van 6–10 naar **4**: primaire CTA, ijkpunt-prompt, onderbouwing-footnote, en één terug-link (dashboard óf sluiten, nooit beide).

---

## C · Vraag-uitleg contract

**UI-patroon.** `<details>`/`<summary>` **onder de antwoord-slider**, boven de Terug/Volgende-rij. Onderbouwing op 375px: de slider is het enige interactieve element en moet binnen duimbereik blijven; een disclosure ertussen duwt de slider omhoog en verandert de tikpositie per vraag, wat het slepen onbetrouwbaar maakt. Onder de slider is de trigger nog steeds binnen bereik (~560px vanaf de top), en openen duwt alleen de navigatie weg, die je toch pas ná het antwoord gebruikt. Trigger ≥44px hoog, volle breedte.

**Vaste trigger-copy voor alle vragen:** `Waarom vragen we dit?`

**Wat er nooit in mag:** bandgrenzen of drempelwaarden ("vanaf 3 porties scoor je …") · elke vorm van tussenstand, score of voorspelling · voorbeelden die het gewenste antwoord verklappen ("de meeste mannen zitten hier op 2") · het woord vuistregel zónder de bron erbij · productnamen.

**Hergebruik-notitie.** De bestaande `helper` blíjft staan en blijft gerenderd — hij doet iets anders dan `helpBody`: de helper helpt je *meten* ("bijv. handvol noten, hummus"), de helpBody legt uit *waarom we het vragen*. Ze samenvoegen zou de helper 3 regels langer maken op precies het moment dat de gebruiker een getal probeert te schatten. Gescheiden houden.

**L8-behandeling.** `benchmarkLabel` gebruikt drie woorden, nooit door elkaar: **populatierichtlijn** (WHO/Gezondheidsraad, gepubliceerd) · **vuistregel** (onze eigen indicatieve grens, zie de TODO in [intake-reference.ts:6-9](../../src/data/nutrition/intake-reference.ts#L6-L9)) · **geen norm** (`null`).

### Kern-sliders

| id | helpTitle | helpBody | helpAnchor | benchmarkLabel |
| --- | --- | --- | --- | --- |
| `vegetables` | Waarom plantporties tellen | Planten leveren vezels, kalium, magnesium en foliumzuur in één keer — daarom vragen we naar porties in plaats van naar losse stoffen. Op je resultaat zie je dit terug als je plantbasis, samen met je fruit-antwoord. | C4 | Populatierichtlijn: ≥400 g groente en fruit per dag (WHO 2020) |
| `nutsSeedsLegumes` | Waarom noten en peulvruchten | Dit is de losse-momenten-vraag: noten, zaden en peulvruchten buiten je warme maaltijd om. Ze zijn de dichtste bron van vezels en magnesium in een normaal Nederlands eetpatroon. Je ziet dit terug in je plantbasis. | C3 | *null* — geen norm; dit is jouw eigen ijkpunt |
| `oilyFish` | Waarom vette vis apart | Vette vis is de enige gewone voedingsbron van EPA en DHA. Eén keer per week is de Nederlandse basis; wie geen vis eet krijgt daar op zijn resultaat een aparte regel over. | C3 | Populatierichtlijn: 1× per week vis, bij voorkeur vet (Gezondheidsraad 2015) |
| `proteinMeals` | Waarom eetmomenten, niet grammen | Voor mannen boven de veertig doet de *verdeling* over de dag meer dan het dagtotaal — daarom tellen we momenten. Op je resultaat zie je of je eiwit over de dag verdeeld staat of op één maaltijd hangt. | C3 | Vuistregel: 3 eiwitrijke eetmomenten per dag (PROT-AGE 2013) |
| `meatLegumes` | Waarom deze eiwitbronnen | Vlees, vis en peulvruchten zijn de dragende eiwit- en zinkbronnen in de meeste eetpatronen. We vragen ze los van je eetmomenten omdat de bron iets anders zegt dan het ritme. | C3 | *null* — geen norm; dit is jouw eigen ijkpunt |
| `dairy` | Waarom zuivel apart | Zuivel is voor veel mannen de stille helft van hun eiwit en calcium. We vragen ernaar om te voorkomen dat we een eiwitgat zien dat er niet is. Meer is hier niet beter — daarom telt deze vraag anders dan de rest. | C3 | *null* — geen norm; dit is jouw eigen ijkpunt |
| `daylight` | Waarom een vraag over buiten | Dit is geen eetvraag. Je vitamine D komt in Nederland vooral van je huid, niet van je bord — zonder deze vraag zouden we een tekort aan je eten toeschrijven dat daar niet vandaan komt. Je ziet hem op je resultaat apart staan, buiten je eetbeeld. | *null* (buiten de clusters) | Vuistregel: dagelijks 15 minuten buiten, huid onbedekt |

### Breedte-sliders (worden kern — zie A5)

| id | helpTitle | helpBody | helpAnchor | benchmarkLabel |
| --- | --- | --- | --- | --- |
| `fruit` | Waarom fruit los telt | Fruit en groente tellen samen op naar dezelfde dagelijkse hoeveelheid, maar bijna niemand schat ze in één keer goed in. Apart vragen geeft een scherper plantbeeld op je resultaat. | C4 | Onderdeel van: ≥400 g groente en fruit per dag (WHO 2020) |
| `berries` | Waarom juist bessen | Bessen zijn geen aparte gezondheidsklasse — we vragen ernaar omdat ze de variatie in je plantpatroon zichtbaar maken, en variatie is iets anders dan hoeveelheid. | C4 | *null* — geen norm; dit is jouw eigen ijkpunt |
| `wholegrain` | Waarom volkoren-aandeel | Hier vragen we een verhouding en geen aantal: van het brood en de granen die je tóch al eet, hoeveel is volkoren. Dat is de grootste vezelknop in een Nederlands eetpatroon en je ziet hem terug in je vezelbeeld. | C4 | Populatierichtlijn: 25 g vezels per dag (Gezondheidsraad 2015) — deze vraag schat het aandeel, niet de grammen |
| `sugaryDrinks` | Waarom frequentie, niet hoeveelheid | Bij suiker voorspelt hoe vaak meer dan hoeveel per keer: het gaat om hoe vaak het je standaardkeuze is. Op je resultaat komt dit terug bij wat je kunt minderen, niet bij wat je mist. | C5 | Populatierichtlijn: vrije suikers onder 10% van je energie (WHO 2015) — deze vraag schat frequentie, niet procenten |

### Meta-vragen

De prompt noemt drie meta-velden (allergy, diet, pref); de repo heeft er **twee**: `allergies` (multi) en `preference` (single). Er is geen apart dieet-veld — het dieet *is* de voorkeur ([lifescore-questions.ts:118-144](../../src/data/nutrition/lifescore-questions.ts#L118-L144)).

| id | helpTitle | helpBody | helpAnchor | benchmarkLabel |
| --- | --- | --- | --- | --- |
| `allergies` | Waarom we hiernaar vragen | Een advies dat je niet kúnt uitvoeren is geen advies. Wat je aanvinkt slaan we alleen op om vragen over te slaan die voor jou niet gelden, en om je vervolgstappen erop aan te passen. | *null* | *null* |
| `preference` | Waarom je eetpatroon telt | Vegetarisch, veganistisch en pescotarisch eten verschuift welke bronnen realistisch voor je zijn — en bij veganistisch eten geldt één punt dat voor niemand anders geldt. Je krijgt daardoor andere vervolgstappen, niet een strenger oordeel. | *null* | *null* |

**Meetpunt-voorstel:** `nutrition_question_help_opened { slider_id }` — zie §G.

---

## D · Feitelijke meting-readout (VR + VL)

### D1 · Data-contract

```
NutritionFactRow {
  clusterId:      'C1'|'C2'|'C3'|'C4'|'C5'|'context'
  label:          string          // clusternaam, gebruikerstaal
  answerSummary:  string          // letterlijk gekozen antwoordlabel(s)
  benchmarkLabel: string | null   // populatierichtlijn | vuistregel | null
  benchmarkKind:  'populatierichtlijn' | 'vuistregel' | null
  source:         string | null   // "WHO 2020" | "Gezondheidsraad 2015" | null
  status:         'below' | 'near' | 'meets' | 'na'
  layer:          1 | 2 | 3 | 4 | 5 | 6
  whyLine:        string          // max 12 woorden
  sliderIds:      string[]        // herkomst, voor de resume-link bij status 'na'
}
```

`status: 'na'` dekt twee gevallen die de UI verschillend rendert: **geen norm** (er ís geen meetlat, jouw antwoord is het ijkpunt) en **niet gemeten** (vraag overgeslagen). Onderscheid via `sliderIds` + de aanwezigheid van een antwoord — een rij zonder antwoord toont de resume-link, een rij zonder norm niet.

### D2 · Mapping

| Cluster / rij | Sliders | Laag | Benchmark | Bron | status per antwoord |
| --- | --- | --- | --- | --- | --- |
| **C4 Plantbasis** | `vegetables` + `fruit` + `berries` (samengevoegd, zie D3) | 1 | ≥400 g groente en fruit per dag | WHO 2020 | zie D3 |
| **C4 Vezelbasis** | `wholegrain` | 1 | 25 g vezels per dag (aandeel geschat) | Gezondheidsraad 2015 | 0% → below · 25% → below · 50% → near · 75% → meets · 100% → meets |
| **C3 Eiwitritme** | `proteinMeals` | 3 | Vuistregel: 3 eiwitrijke eetmomenten per dag | PROT-AGE 2013 | 0 → below · 1 → below · 2 → near · 3 → meets · 4+ → meets |
| **C3 Eiwitbronnen** | `meatLegumes` + `dairy` + `nutsSeedsLegumes` | 1 | *null* | — | altijd `na` (geen norm) — toont antwoord + whyLine |
| **C3 Visbron** | `oilyFish` | 2 | 1× per week vis, bij voorkeur vet | Gezondheidsraad 2015 | nooit → below · 1× → meets · 2×+ → meets · opt-out "geen vis" → `na` met eigen regel |
| **C5 Wat je mindert** | `sugaryDrinks` | 2 | Vrije suikers onder 10% van je energie (frequentie geschat) | WHO 2015 | nooit t/m 1×/wk → meets · 2–4×/wk → near · 5×/wk t/m 2×/dag → below |
| **C1 Passende energie** | — | 1 | *null* | — | altijd `na` — niet gemeten in v1, expliciet zo benoemd |
| **C2 Regelmatig patroon** | — | 1 | *null* | — | altijd `na` — niet gemeten in v1, expliciet zo benoemd |
| **C5 Water, tempo, omgeving** | — | 1 | *null* | — | altijd `na` — niet gemeten in v1 |
| **context · Daglicht** | `daylight` | 4 | Vuistregel: dagelijks 15 min buiten | — | zelden → below · 1–2× → near · 3×+ → meets. **Rendert buiten de clusterlijst**, onder een eigen kopje "Buiten je bord" |
| **context · Jouw eetpatroon** | `preference`, `allergies` | 4 | *null* | — | altijd `na` — toont antwoord + waarom het je vervolgstappen verandert |

Elf rijen. Drie daarvan (C1, C2, C5-gedrag) zijn **eerlijk leeg**: de check meet ze niet. Ze staan er wél, met de regel *"Hier vroegen we nog niets naar"*, omdat een piramide met een onzichtbare onderste helft suggereert dat de basis staat.

### D3 · Plant-equivalentie (het analogon van de aerobe equivalentie)

`vegetables`, `fruit` en `berries` meten alle drie een deel van dezelfde ≥400 g. Drie losse `below`-rijen tonen drie gaten waar er één is. **Besluit: één samengestelde rij "Plantbasis"**, met de drie antwoorden achter elkaar in `answerSummary`.

Regel — plantporties per dag `P` = `vegetables` (porties/dag) + `fruit` omgerekend naar porties/dag (frequentiestop ÷ 7 waar de stop een weekfrequentie is, met "1× per dag" = 1 en "2× per dag" = 2) + `berries` idem, gekapt op 1 (bessen tellen mee als variatie, niet als volume):

- `P < 2` → **below** · `2 ≤ P < 4` → **near** · `P ≥ 4` → **meets** (WHO ≥400 g ≈ 4 porties van ~100 g)

Verdediging tegenover twee losse rijen: de gebruiker eet niet in categorieën, hij eet planten. Bovendien is de foutmarge per losse vraag groot (zelfrapportage van porties), terwijl de som stabieler is — precies de reden waarom WHO zelf groente en fruit optelt in plaats van apart normeert. De prijs is dat we niet kunnen zeggen *welke* van de drie het gat maakt; dat lossen we op door de drie antwoorden letterlijk naast elkaar te tonen in dezelfde rij, zodat hij het zelf ziet.

**Als de breedte-vragen overgeslagen zijn** (`breadth_skipped`, zolang A5 niet is gefixt): geen `below` uitspreken op een half gemeten som. De rij toont status `na` met `answerSummary` = alleen het groente-antwoord en de regel *"Je sloeg de vier extra vragen over — zonder fruit en volkoren kunnen we je plantbasis niet leggen."* plus één link **"Beantwoord de vier extra vragen →"** die de check hervat.

### D4 · Copy-regels bij `below`

Feit, dan kans. Nooit een saldo, nooit schuld, nooit een telling van wat hij niet deed.

Goed:

1. *"Plantbasis: 1 portie per dag. De populatierichtlijn ligt op ongeveer vier. Eén extra portie bij je avondeten is de kortste weg omhoog."*
2. *"Volkoren: 25% van je brood en granen. Je vezels komen hier bijna volledig vandaan — dit is de knop met het meeste effect per moeite."*
3. *"Vette vis: nooit. Eén keer per week is de Nederlandse basis; een blikje makreel telt net zo goed als verse zalm."*

Afgekeurd:

- ~~*"Je komt 3 porties per dag tekort — dat is 21 porties per week."*~~ Telt op wat ontbreekt en maakt er een schuld van die per week groeit. Verbod 4, BESLUIT §A.4.
- ~~*"Slechts 1 op de 4 mannen haalt dit. Jij ook niet."*~~ Sociale vergelijking als oordeel, en het tweede zinsdeel is een verwijt zonder handeling.

### D5 · Verhouding tot de bestaande gap-lijst

De 5-nutriënten-uitlezing verdwijnt niet, maar zakt: hij is niet langer de indeling, hij wordt **de tweede laag onder de clusterrijen**. Op VR staan maximaal 4 clusterrijen zichtbaar; "toon alles" vouwt de rest van laag 1–2 uit. Nutriëntnamen (eiwit, omega-3, magnesium, vitamine D, zink) verschijnen op VR uitsluitend binnen de `whyLine` van een clusterrij, nooit als eigen kop en nooit met een vergelijk-link.

**Boven de vouw op 375px (~640px):** eyebrow, conclusiezin, cluster-pil, statement, delta-blok, en de eerste anderhalve clusterrij. Dat is de bedoeling — de conclusie moet compleet zijn zonder scrollen, en de eerste half-zichtbare rij is het scroll-signaal.

**Laag 3 en hoger komt niet op VR.** Eén regel benoemt wat er ligt: *"Onder je beeld liggen nog je verhoudingen, jouw situatie en wat je zou kunnen meten."* Zonder die zelfbeperking heeft de CTA naar Voortgang geen lading en blijft VL leeg (zie §H, pre-mortem).

### D6 · Delta-copy (geen woord "band")

Zeven templates, gespiegeld op beweging R0d. `{cluster}` = clusternaam, `{answer}` / `{prevAnswer}` = letterlijke antwoordlabels, `{benchmarkShort}` = korte richtlijn, `{n}` = aantal.

| # | Wanneer | Regel |
| --- | --- | --- |
| **N1** | Eerste check | `Dit is je nulpunt. Vanaf hier meten we verandering, niet perfectie.` |
| **N2** | Focus-cluster vooruit, over de richtlijn heen | `{cluster}: van "{prevAnswer}" naar "{answer}". Daarmee zit je op {benchmarkShort} — dat vasthouden is nu de opdracht.` |
| **N3** | Focus-cluster vooruit, nog onder de richtlijn | `{cluster}: van "{prevAnswer}" naar "{answer}". Een stap vooruit sinds vorige keer.` |
| **N4** | Focus-cluster achteruit | `{cluster}: je gaf vorige keer "{prevAnswer}", nu "{answer}". Dat is minder dan vorige keer — en precies het moment om de stap kleiner te maken, niet groter.` |
| **N5** | Antwoord ongewijzigd op de focus | `{cluster}: hetzelfde antwoord als vorige keer ("{answer}"). Stabiel is geen stilstand als de rest bewoog.` |
| **N6** | Geen focus, niets veranderd | `Je antwoorden staan waar ze stonden. Geen verandering is ook een uitkomst — na twee keer hetzelfde is het de vraag waard of de stap wel klein genoeg was.` |
| **N7** | Vorige focus opgelost, nieuwe elders | `{prevCluster} staat nu op "{answer}" — dat was vorige keer je grootste winst. {cluster} is nu de eerstvolgende.` |
| **alsoLine** | Max 2 extra clusters, puur feitelijk | `{cluster}: "{prevAnswer}" → "{answer}"` · gescheiden door ` · ` |

**KILL-lijst** — verboden formulering links, verplicht alternatief rechts.

| Verboden | Waarom | Gebruik dit |
| --- | --- | --- |
| band, niveau, trede, schijf, categorie | Engine-vocabulaire, gebruiker kent de breedte niet | het letterlijke antwoordlabel |
| "bewoog de goede kant op" (huidige code) | Onfalsifieerbaar, noemt geen maat | `van "{prevAnswer}" naar "{answer}"` |
| "liep iets terug" (huidige code) | Idem, plus verzachting die de gebruiker niet vroeg | `je gaf vorige keer "{prevAnswer}", nu "{answer}"` |
| punten, score, %-verbetering | L12, puntenstelsel | antwoordlabels |
| "je haalt het niet", "tekort", "achterstand" | Schuldframe | `de populatierichtlijn ligt op {benchmarkShort}` |
| ↑ ↓ → als richtingsteken | Onleesbaar voor screenreaders, en het ís geen getal | "een stap vooruit" / "minder dan vorige keer" |
| "eindelijk", "gelukkig", "helaas" | Toon-oordeel over zijn leven | weglaten |

---

## E · De eetbasis-rail op Voortgang (VL)

Zes lagen, verticale rail, elk met een naam en een toestand. Geen nummers, geen voortgangsbalk, geen piramide-illustratie met gevulde segmenten (dat is een ordinaal in beeldvorm).

Toestanden: **staat** (engine ziet dit als op orde) · **nu** (hier ligt je eerstvolgende winst) · **wacht** (nog niet aan de beurt, met reden) · **dicht** (poort niet open, met reden).

| Laag | Naam | Toestand-regel | Acties |
| --- | --- | --- | --- |
| 1 | Je eetbasis | `nu` zolang één cluster `below` is | max 3, uit de `below`-clusters |
| 2 | Voedingskwaliteit | `wacht` tot laag 1 geen `below` meer heeft, dan `nu` | max 3 |
| 3 | Verhoudingen | `wacht` tot laag 1 én 2 staan | max 3, incl. eiwitdoel-calculator achter "meer uitleg" |
| 4 | Op jouw situatie | altijd read-only | geen knop; één link *"Pas je gegevens aan"* (ghost — geen formulier in v1) |
| 5 | Meten & timing | altijd `wacht` in v1 | geen |
| 6 | Aanvullen & vergelijken | `dicht` of open, zie L6 | max 1 label-only link per stof |

**Laag-1 acties (max 3, gekozen op status `below`, in clustervolgorde):**

- *Zet één portie groente bij je avondeten* — knop: `Zet op Mijn Dag`
- *Ruil je brood naar volkoren bij je volgende boodschappen* — knop: `Zet op Mijn Dag`
- *Kies water als standaard bij het avondeten* — knop: `Zet op Mijn Dag`

**Laag-5 ghost-copy:** *"Calorieën tellen, macro's bijhouden, eten binnen een tijdvenster — dat zijn gereedschappen, geen fundament. Ze doen pas iets als je eetbasis en je verhoudingen staan. We openen dit niet eerder."* Geen knop, geen "binnenkort".

**Laag-6, poort dicht:** *"Eerst je tafel, dan het potje. We laten je pas iets vergelijken als je voedingscheck laat zien dát er iets aan te vullen valt — anders verkopen we je een oplossing voor een probleem dat je niet hebt."* Geen productnaam, geen link.

**Laag-6, poort open.** L6 noemt twee voorwaarden: voedingscheck gedaan **én** minstens één gemeten signaal. Bij het uitwerken van de toestanden bleek dat te ruim: F1 — eerste check, eiwitritme en drankkeuze allebei onder hun richtlijn — voldoet aan beide voorwaarden, en zou de vergelijk-deur dus openen op het exacte moment dat de eetbasis nog wankelt. Dat is de omkering van de noordster.

**Derde voorwaarde, toegevoegd: er staat geen enkel `below` meer open in laag 1.** De poort gaat pas open als het overgebleven signaal er één is dat je bord niet meer dicht kán maken — omdat de rest van je eetbasis op zijn richtlijn ligt, of omdat een opt-out de voedingsroute afsluit (geen vis → omega-3). Dat is een *aanscherping* van L6, geen versoepeling, en het is de enige gate-formulering die "eerst de tafel, dan het potje" letterlijk waarmaakt in plaats van hem alleen te citeren.

Bij open poort: één regel per stof — `{Stof} · {reden in max 8 woorden}` + link `Vergelijk op prijs en kwaliteit →`. Geen prijs, geen foto, geen merknaam, geen aantal.

**Zelf-calibratie.** De prompt vraagt "max laag 5 zelf instelbaar". **Ik wijk af: in v1 mag je jezelf tot en met laag 3 plaatsen, en de plaatsing is display-only.** Reden in §H (commissie-wijziging 1). Copy: *"Waar denk jij dat je nu staat?"* met drie keuzes en daaronder, bij afwijking van de engine: *"Wij plaatsen je nu bij {laagnaam}, omdat {reden}. Jouw inschatting verandert je acties niet — hij helpt ons zien waar we ernaast zitten."*

---

## F · States

| | Situatie | VR-blokken | Delta | VL-rail | CTA |
| --- | --- | --- | --- | --- | --- |
| **F1** | Eerste check, geen delta | conclusie · 4 clusterrijen · "wat ligt eronder"-regel | **N1** | laag 1 = `nu`, 2–3 `wacht`, 5 ghost, 6 `dicht` | `Bekijk je voedingsbeeld →` |
| **F2** | Hercheck, focus-cluster vooruit | conclusie · delta prominent · 4 rijen | **N2** of **N3** + alsoLine | laag 1 = `nu` of `staat` | idem |
| **F3** | Hercheck, focus-cluster achteruit | conclusie met empathie-opening · delta · 4 rijen · géén nieuwe actie | **N4** | laag 1 = `nu`, actielijst gekrompen naar **1** actie | idem |
| **F4** | Laag 1–2 staan, laag 3+ wacht | conclusie "onderhoud" · 4 rijen `meets`/`near` | **N5** of **N6** | laag 1–2 = `staat`, laag 3 = `nu` | idem |
| **F5** | Poort open: eetbasis staat, één signaal dat het bord niet dekt | ongewijzigd VR (geen supplement op VR) | **N5** + alsoLine | laag 6 open, max 2 label-only links | idem |
| **F6** | Geen voedingscheck | **bestaat niet** — er is niets gemeten | — | rail in wachtstand, laag 6 `dicht`, plus de beweging-koppelregel | `Doe de voedingscheck →` |

De poort is dicht in F1 t/m F4, telkens om een andere reden — dat is de test of de gate-copy werkt: *"nog twee antwoorden onder hun richtlijn"* (F1) · *"geen enkel antwoord onder een richtlijn"* (F2, F4) · *"deze check teruggelopen"* (F3) · *"geen check"* (F6). Eén gate, vijf verschillende eerlijke redenen.

**Wat er in F3 níet staat:** geen tweede actie, geen "pak het weer op", geen verwijzing naar hoe goed het vorige keer ging, geen supplement. Eén cluster, één kleinere stap, klaar.

---

## G · Meetplan

| Event | Nieuw of hergebruik | Payload | Hier lees je aan af |
| --- | --- | --- | --- |
| `nutrition_log_completed` | **hergebruik + 2 params** | bestaand (`nutrition_score`, `from`, `breadth_skipped`) + `has_delta: boolean`, `focus_cluster: 'C1'…'C5'\|'none'` | Of de clusterindeling de gap-indeling vervangt zonder de afronding te raken. |
| `nutrition_checkin_routing_click` | **nieuw — en vervangt twee bestaande** | `{ target: 'voortgang_voeding' \| 'mijn_dag' \| 'onderbouwing' \| 'dashboard', surface: 'result' }` | Welke uitgang wint op VR. Nu onmeetbaar: `nutrition_result_agenda_cta_click` en `nutrition_result_dashboard_return` zijn aparte events, dus je kunt ze niet als één funnel tegen elkaar zetten. Eén event met een target-param wél. Die twee laten we opgaan in dit event. |
| `nutrition_question_help_opened` | **nieuw** | `{ slider_id }` | Of de uitleg gelezen wordt en bij welke vraag — de vraag met de meeste opens is de vraag die het slechtst geformuleerd is. |
| `nutrition_layer_action_click` | **nieuw** | `{ layer: 1\|2\|3, action_id }` | Of de rail iets doet of alleen mooi is. Als dit ~0 blijft terwijl `nutrition_checkin_routing_click{voortgang_voeding}` wél loopt, is VL een leesscherm en geen werkscherm. |
| `dashboard_voedingscheck_cta_click` | **hergebruik, ongewijzigd** | `{ surface }` | Instroom naar de check vanaf de vier bestaande oppervlakken. |
| `nutrition_supplement_revealed` | **verhuist** | ongewijzigd, maar vuurt nu op VL laag 6 i.p.v. VR | Hoe vaak de poort feitelijk opengaat. |
| `domain_tool.snapshot_viewed` | hergebruik | `{ domain: 'voeding', has_conclusion }` | Terugkeer naar VL los van de check-in. |

Geen nieuw durable `domain_event`. Geen PII, geen vrije tekst, geen antwoordlabels in payloads — alleen enums en booleans. `focus_cluster` is een enum van zes waarden, geen gebruikerstekst.

---

## H · Commissie

### /KRAAK AF — vijf redenen om nee te zeggen

1. **Twee waarheidssystemen zonder verzoeningsregel.** De engine plaatst je op een laag; de zelf-calibratie laat je jezelf ergens anders plaatsen. Wie wint bij conflict? De spec zei "max laag 5 zelf" en beantwoordde de vraag niet.
2. **De piramide is een nieuw scherm voor bestaande inhoud.** Gaps, advies en supplement-verdicts bestaan al op Voortgang. We hernoemen ze tot lagen en noemen dat een model.
3. **De meetlat rust op zelfrapportage met confidence 1.** Magnesium en vitamine D staan op 1 van 4 vertrouwen ([intake-reference.ts:159,187](../../src/data/nutrition/intake-reference.ts#L159)). Een WHO-getal ernaast zetten leent geloofwaardigheid die de meting niet heeft.
4. **Zes lagen waarvan er drie leeg zijn.** Laag 4 is read-only, laag 5 is een ghost, laag 6 is meestal dicht. De helft van het model is een belofte.
5. **We halen de vergelijk-links weg bij de enige gebruiker die er klaar voor is.** Wie een gemeten tekort heeft en op VR staat, moet nu twee klikken verder — en de conversie van dat pad is nul tot je het gemeten hebt.

### /WELKE AANNAMES zitten hier onuitgesproken in

- Dat een man van 45 die zijn eetpatroon wil verbeteren, een hiërarchie wíl zien in plaats van drie dingen om morgen te doen.
- Dat "eerst de basis" motiverend is en niet vertragend. Voor iemand die al drie jaar traint kan laag 1 als betuttelend landen.
- Dat de bestaande sliders bruikbare cluster-input zijn. Ze zijn ontworpen als nutriënt-proxies; ik hergebruik ze voor een ander doel en neem aan dat dat mag.
- Dat één voedingscheck genoeg signaal geeft voor een delta. Bij een 14-daagse hermeetcyclus meet je vooral ruis in zelfrapportage.
- Dat WHO-populatierichtlijnen zich laten vertalen naar een individueel oordeel. Dat is precies wat een populatierichtlijn níet is.

### /PRE-MORTEM — zes weken later mislukt

Het is 20 september. De piramide staat live. `nutrition_checkin_routing_click{voortgang_voeding}` haalt 34% — beter dan verwacht. Maar `nutrition_layer_action_click` staat op 41 events totaal, en 38 daarvan komen van laag 1. Reden: VR beantwoordde de vraag al. Wie zijn conclusie, zijn delta en zijn vier clusterrijen heeft gelezen, weet genoeg; VL herhaalt dat en voegt drie acties toe die hij op VR ook al kon raden. De rail is een tweede leesscherm geworden. Tegelijk zakt de afrondingsgraad van de check van 71% naar 63%, omdat de vier breedte-vragen verplicht zijn geworden — de check duurt nu 13 vragen in plaats van 9-plus-optioneel. We hebben de meetlat gekocht met afronding, en de piramide met niets.

### /WAT ZIE IK OVER HET HOOFD

- **`breadth_skipped` als normale toestand.** Precies de gebruikers die haasten, missen drie van de vier benchmarkbare vragen. Dan tonen we een meetlat over data die er niet is.
- **`daylight` staat in een voedingscheck.** Zes lagen over eten, en één verplichte vraag over buiten zijn.
- **De opt-outs.** "Ik eet geen vis" / "geen zuivel" / "geen vlees of vis" zetten de slider op 0 — dat is in de engine niet te onderscheiden van "wel, maar nooit". Een veganist krijgt zo een `below` op visbron.
- **Migratie.** Oude logs hebben geen clusters. VL moet ze kunnen tonen zonder te doen alsof.

### Wat ik concreet wijzig

**Wijziging 1 — zelf-calibratie wordt display-only en stopt bij laag 3.** (Uit /KRAAK AF 1.) Laag 4 en 5 hebben geen enkel engine-signaal; een zelfclaim daar is onfalsifieerbaar en zou niets ontgrendelen. De keuze wordt opgeslagen, verandert geen enkele actie, en bij afwijking toont de UI beide met de reden van de engine. Dat maakt het een *feedbackkanaal op ons model* in plaats van een tweede oordeelsysteem. Verwerkt in §E.

**Wijziging 2 — VR houdt laag 3 en hoger bewust leeg, en benoemt dat in één regel.** (Uit /PRE-MORTEM.) Zonder die zelfbeperking heeft de CTA geen lading. De "toon alles"-toggle op VR vouwt alléén de resterende laag-1–2-rijen uit, nooit laag 3+. Verwerkt in §D5 en §B.

**Wijziging 3 — `below` wordt nooit uitgesproken op een half gemeten som, en `daylight` verlaat de clusterlijst.** (Uit /WAT ZIE IK OVER HET HOOFD.) Bij `breadth_skipped` toont de plantbasis-rij status `na` met een resume-link in plaats van een oordeel; daglicht krijgt een eigen kopje "Buiten je bord". Verwerkt in §D2 en §D3.

**Wijziging 4 — opt-out wordt een eigen status, geen nul.** Wie "ik eet geen vis" kiest krijgt op de visbron-rij status `na` met de regel *"Je eet geen vis — dan is dit niet jouw meetlat."* Nooit `below`. Verwerkt in §D2.

### Op de twee punten die de opdracht verplicht meegeeft

**(a) Een richtlijn noemen maakt `below` confronterender dan een chip, en dat kan afhaken vergroten.** Klopt, en dat accepteer ik — maar niet onvoorwaardelijk. Een chip die "Aandacht" zegt zonder maat is niet vriendelijker, hij is alleen vager; de gebruiker vult zelf een strenger oordeel in dan wij zouden geven. Wat ik wél doe: de richtlijn staat nooit in de kop en nooit in de conclusiezin. Hij staat in de clusterrij, ná het eigen antwoord, in kleinere typografie, met het woord *populatierichtlijn* ervoor — dat woord zegt letterlijk "dit gaat over een bevolking, niet over jou". En de eerstvolgende zin is altijd een handeling, nooit een verschil.

**(b) Uitleg per vraag verlengt de check en kan de afronding verlagen.** De disclosure zelf kost nul tijd als je hem niet opent — hij is één regel en dicht. Het echte risico zit in mijn eigen wijziging: de vier breedte-vragen verplicht maken kost wél tijd. Daarom hangt A5 aan een meting in plaats van aan een besluit: slice V1a zet ze om, en als `nutrition_log_completed` binnen twee weken meer dan 5 procentpunt afronding verliest, draaien we terug naar optioneel en accepteren we de `na`-rij als permanente toestand. Dat is een echte terugvaloptie, geen escape.

---

## I · Copy-voorbeelden — drie persona's, volledige VR-copy

### I1 · Eiwitritme onder de vuistregel, laag 1 wankel, eerste check

> **WAT JE VOEDINGSCHECK ZEGT**
>
> # Je eetbasis staat er half — en je eiwit hangt aan één maaltijd.
>
> `Eiwitritme · 1× per dag`
>
> Eiwit werkt niet als dagtotaal maar als ritme. Eén eiwitrijk moment per dag betekent dat je lichaam de rest van de dag niets te verwerken krijgt, en boven de veertig is dat het verschil tussen spier behouden en spier verliezen.
>
> **DIT IS JE NULPUNT**
> Vanaf hier meten we verandering, niet perfectie.
>
> Je grootste winst zit niet in meer eten, maar in eerder beginnen: een eiwitrijk ontbijt verandert je hele dagritme zonder dat er iets bij hoeft.
>
> **[ Bekijk je voedingsbeeld → ]**
> Daar zie je wat er nog onder je eetbasis ligt.
>
> ---
>
> **WAT WE HEBBEN GEMETEN**
>
> **Eiwitritme** — 1× per dag
> Vuistregel: 3 eiwitrijke eetmomenten per dag · PROT-AGE 2013
> *Verdeling over de dag doet boven de veertig meer dan het totaal.*
>
> **Wat je mindert** — 5–6× per week suikerhoudende dranken of snoep
> Populatierichtlijn: vrije suikers onder 10% van je energie · WHO 2015
> *Frequentie voorspelt hier meer dan hoeveelheid per keer.*
>
> **Plantbasis** — 2 porties per dag · fruit 3–4× per week · bessen 1× per week
> Populatierichtlijn: ≥400 g groente en fruit per dag · WHO 2020
> *Vezels, kalium en magnesium komen hier in één keer vandaan.*
>
> **Vezelbasis** — 50% van je brood en granen is volkoren
> Populatierichtlijn: 25 g vezels per dag · Gezondheidsraad 2015
> *De grootste vezelknop in een Nederlands eetpatroon.*
>
> *Toon alles (3)*
>
> Onder je beeld liggen nog je verhoudingen, jouw situatie en wat je zou kunnen meten.
>
> ---
>
> Wil je hier over veertien dagen op terugkijken? Zet je ijkpunt voor voeding.
>
> Wetenschappelijke onderbouwing van de voedingscheck

### I2 · Herstel-pad, plantbasis vooruit, laag 2 in beeld

> **WAT JE VOEDINGSCHECK ZEGT**
>
> # Je plantbasis is vooruitgegaan — nu telt wat eromheen staat.
>
> `Plantbasis · 3 porties per dag`
>
> Meer planten is de breedste enkele verandering die er is: vezels, kalium, foliumzuur en verzadiging bewegen tegelijk mee. Je zit nu tussen je vorige antwoord en de populatierichtlijn in.
>
> **SINDS JE VORIGE CHECK**
> Plantbasis: van "1× per dag" naar "3× per dag". Een stap vooruit sinds vorige keer.
> Vezelbasis: "25%" → "75%"
>
> Wat je nu opbouwt houdt alleen stand als de rest niet tegenwerkt — en bij jou is dat je drankkeuze, niet je bord.
>
> **[ Bekijk je voedingsbeeld → ]**
> Daar staat wat je kunt minderen zonder iets in te leveren.
>
> ---
>
> **WAT WE HEBBEN GEMETEN**
>
> **Plantbasis** — 3 porties per dag · fruit 1× per dag · bessen 2× per week
> Populatierichtlijn: ≥400 g groente en fruit per dag · WHO 2020
> *Vezels, kalium en magnesium komen hier in één keer vandaan.*
>
> **Vezelbasis** — 75% van je brood en granen is volkoren
> Populatierichtlijn: 25 g vezels per dag · Gezondheidsraad 2015
> *De grootste vezelknop in een Nederlands eetpatroon.*
>
> **Wat je mindert** — 3–4× per week suikerhoudende dranken of snoep
> Populatierichtlijn: vrije suikers onder 10% van je energie · WHO 2015
> *Frequentie voorspelt hier meer dan hoeveelheid per keer.*
>
> **Eiwitritme** — 2× per dag
> Vuistregel: 3 eiwitrijke eetmomenten per dag · PROT-AGE 2013
> *Verdeling over de dag doet boven de veertig meer dan het totaal.*
>
> *Toon alles (3)*
>
> Onder je beeld liggen nog je verhoudingen, jouw situatie en wat je zou kunnen meten.

### I3 · Alles op orde — onderhoud, poort dicht

> **WAT JE VOEDINGSCHECK ZEGT**
>
> # Je eetbasis staat. Vanaf hier is volhouden het werk.
>
> `Plantbasis · 4 porties per dag`
>
> Je antwoorden liggen op of rond elke richtlijn die we durven noemen. Dat is zeldzamer dan het klinkt, en het betekent iets ongemakkelijks: er is hier geen makkelijke winst meer te halen.
>
> **SINDS JE VORIGE CHECK**
> Plantbasis: hetzelfde antwoord als vorige keer ("4 porties per dag"). Stabiel is geen stilstand als de rest bewoog.
>
> Wat er nu telt is niet een volgende verbetering, maar of dit patroon over drie maanden nog staat als je week tegenzit.
>
> **[ Bekijk je voedingsbeeld → ]**
> Daar zie je wat er pas telt als de basis staat.
>
> ---
>
> **WAT WE HEBBEN GEMETEN**
>
> **Plantbasis** — 4 porties per dag · fruit 1× per dag · bessen 3–4× per week
> Populatierichtlijn: ≥400 g groente en fruit per dag · WHO 2020
> *Vezels, kalium en magnesium komen hier in één keer vandaan.*
>
> **Vezelbasis** — 100% van je brood en granen is volkoren
> Populatierichtlijn: 25 g vezels per dag · Gezondheidsraad 2015
> *De grootste vezelknop in een Nederlands eetpatroon.*
>
> **Eiwitritme** — 3× per dag
> Vuistregel: 3 eiwitrijke eetmomenten per dag · PROT-AGE 2013
> *Verdeling over de dag doet boven de veertig meer dan het totaal.*
>
> **Visbron** — 2× per week vette vis
> Populatierichtlijn: 1× per week vis, bij voorkeur vet · Gezondheidsraad 2015
> *De enige gewone voedingsbron van EPA en DHA.*
>
> *Toon alles (3)*
>
> Onder je beeld liggen nog je verhoudingen, jouw situatie en wat je zou kunnen meten.

Op VL leest deze persona bij Aanvullen & vergelijken: *"Eerst je tafel, dan het potje. Je check laat nu geen enkel signaal zien dat er iets aan te vullen valt — dan houden we deze dicht."*

---

## J · Layout 375px

Eén `h1` per frame. Alle tap-targets ≥44px. Vouw op ~640px.

```
FRAME VQ                              FRAME VR                             FRAME VL
┌─────────────────────────┐ 0px       ┌─────────────────────────┐ 0px      ┌─────────────────────────┐ 0px
│ progress 3px            │           │ eyebrow  WAT JE ...     │  22      │ ‹ Voortgang             │  40
│ 04 · VOEDING            │  28       │ h1 conclusie (2 rgl)    │  62      │ h1 Je voedingsbeeld     │  46
│ Vraag 4 van 13          │  22       │ pil  Cluster · antwoord │  34      │ laatste check · datum   │  20
│                         │           │ statement (3 rgl)       │  62      ├─────────────────────────┤
│ h1 vraagtekst (3 rgl)   │  96       │ ┌ delta ──────────────┐ │          │ .checkin-readout        │ 250
│ helper (2 rgl)          │  40       │ │ label · regel · also│ │  92      │  (identiek aan VR,      │
│                         │           │ └─────────────────────┘ │          │   CTA = stille link)    │
│ ┌ slider ─────────────┐ │           │ implicatie (2 rgl)      │  44      ├─────────────────────────┤ 356
│ │  huidig label       │ │  60       │ ┌ CTA terra ──────────┐ │  46      │ EETBASIS-RAIL           │
│ │ ●──────────────     │ │  44       │ hint (1 rgl)          │  20      │ ● Je eetbasis      NU   │  88
│ └─────────────────────┘ │           ├─────────────────────────┤ 382      │   3 acties + knop       │ 180
│ 0 ─ 1 ─ 2 ─ 3 ─ 4+      │  20       │ WAT WE HEBBEN GEMETEN   │  24      │ ○ Voedingskwaliteit WACHT│ 72
│                         │           │ ┌ rij 1 ─────────────┐  │  76      │ ○ Verhoudingen     WACHT│  72
│ ▸ Waarom vragen we dit? │  44 ←tap  │ ┌ rij 2 ─────────────┐  │  76      │ ○ Op jouw situatie      │  84
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ~460      ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ~558     ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ~640
│ (open: 3 rgl + anker)   │  84       │ ┌ rij 3 ─────────────┐  │  76      │ ○ Meten & timing  GHOST │  96
│                         │           │ ┌ rij 4 ─────────────┐  │  76      │ ▣ Aanvullen & vergelijk │ 140
│ ← Terug      Volgende → │  48       │ toon alles (3)          │  40      │   gate-copy of 2 links  │
└─────────────────────────┘           │ "onder je beeld ligt…"  │  38      │ beweging-koppelregel    │  36
                                      ├─────────────────────────┤          │ onderbouwing-footnote   │  32
                                      │ Buiten je bord          │  70      └─────────────────────────┘
                                      │ ijkpunt-prompt          │  96
                                      │ onderbouwing-footnote   │  32
                                      │ terug-link              │  46
                                      └─────────────────────────┘
```

**Boven de vouw op VR:** eyebrow, conclusie, cluster-pil, statement, delta, implicatie, de CTA, en tweeënhalve clusterrij. Waarom juist dat: de conclusie plus de verandering plus de uitgang vormen samen het complete antwoord op "en, hoe sta ik ervoor" — die mag geen scroll kosten. De clusterrijen zijn het bewijs onder die conclusie; dat het derde blok half zichtbaar is, is het scroll-signaal dat zegt dat het bewijs er is. De CTA staat bewust bóven de rijen: wie genoeg heeft aan de conclusie moet niet langs zijn eigen tekortkomingen hoeven scrollen om weg te komen.

**Boven de vouw op VL:** de readout (identiek aan VR) plus laag 1 met zijn acties. De rest van de rail is scroll — dat mag, want wie op VL is, is er om te lezen.

---

## K · HTML-prebuild

`docs/design/voeding-piramide-prebuild-v1-2026-08.html`

Sticky chrome met twee switchers (frame VQ · VR · VL, state F1–F6), `aria-pressed` op de actieve knop, plus een statenote-regel per combinatie. Frame VQ toont één slider-vraag met de disclosure in beide toestanden (`aria-expanded` correct). Frame VR toont `.checkin-readout` in exact het R0-patroon, daaronder de clusterrijen met "toon alles". Frame VL toont dezelfde `.checkin-readout` (L10) plus de eetbasis-rail met laag-1-acties en de laag-6-poort in beide toestanden. Tokens identiek aan de beweging-prebuild; DM Sans + DM Serif Display; geen emoji; geen externe assets behalve fonts.

---

## L · Cursor-slices

| Slice | Wat | Bestanden | Acceptatiecriterium | Afhankelijk van |
| --- | --- | --- | --- | --- |
| **V1a** | Breedte-vragen worden kern + help-velden per vraag | `src/data/nutrition/lifescore-questions.ts` (verplaats `NUTRITION_BREADTH_SLIDER_IDS` naar core, voeg `help: { title, body, anchor, benchmarkLabel, benchmarkKind, source }` toe per vraag), `src/lib/nutrition-diet-skip.ts` (skip-logica blijft gelden op de nieuwe kern) | `NUTRITION_REQUIRED_STEP_COUNT` = 13, `NUTRITION_BREADTH_STEP_COUNT` = 0; alle 13 vragen hebben een `help`-object; bestaande skip-tests blijven groen | — |
| **V1b** | Piramide-data: zes lagen + vijf clusters | **nieuw** `src/data/nutrition/lifestyle-pyramid.ts` | Export `NUTRITION_LAYERS` (6, met naam + toestandregels) en `NUTRITION_CLUSTERS` (C1–C5 met sliderIds, layer, whyLine). Geen laagnummer in enige exportstring | — |
| **V1c** | Engine: conclusie, fact-rows, delta zonder band | **nieuw** `src/lib/nutrition-conclusion.ts` (`buildNutritionConclusion`, `buildNutritionFactRows` incl. plant-equivalentie D3 en opt-out-status), wijzig `src/lib/nutrition-delta.ts` (`deltaStatementFor` → templates N1–N7 met antwoordlabels) | Nieuwe test `nutrition-conclusion.test.ts` dekt D3, opt-out en `breadth_skipped`. **Let op:** `nutrition-delta.test.ts` assert nu letterlijk `"bewoog de goede kant op"` en `"liep iets terug"` — die assertions moeten mee veranderen, niet omzeild worden | V1a, V1b |
| **V1d** | Gedeeld readout-component | **nieuw** `src/components/intake/NutritionCheckinReadout.tsx` (`variant: "checkin" \| "voortgang"`, spiegel van `MovementCheckinReadout`) + refactor `src/components/intake/NutritionResultView.tsx` (supplement-`<details>`, `otherGaps`, `ProteinTargetCard` en score-h1 eruit; één CTA erin) | VR heeft ≤4 uitgangen; `grep -n "Vergelijk" NutritionResultView.tsx` geeft nul treffers | V1c |
| **V1e** | Vraag-help-UI | `src/components/intake/NutritionCapture.tsx` (vraag-tak: `<details>` onder `renderQuestionBody`, boven de nav-rij) | Disclosure ≥44px, `aria-expanded` correct, `helper` blijft ongewijzigd gerenderd | V1a |
| **V1f** | Eetbasis-rail op Voortgang | **nieuw** `src/components/dashboard/voortgang/VoedingEetbasisRail.tsx`, wijzig `src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx` (voeding-tak naast de bestaande `isMovement`-tak op regel 83) | VL rendert de readout + zes lagen; laag 6 toont beide poort-toestanden; geen ordinaal in de DOM | V1b, V1d |
| **V1g** | Poort laag 6 | `src/lib/statistieken-advies-model.ts` (hergebruik `nutritionLadderPending` + `buildRecommendationsEligibility`), `VoedingEetbasisRail.tsx` | Poort open vereist `nutritionLogCompleted === true` **én** ≥1 `below`-signaal; test in `statistieken-advies-model.test.ts`-patroon | V1f |
| **V1h** | Meetpunten | `NutritionCapture.tsx`, `NutritionCheckinReadout.tsx`, `VoedingEetbasisRail.tsx` | Vier events uit §G vuren; `nutrition_result_agenda_cta_click` en `nutrition_result_dashboard_return` zijn verwijderd ten gunste van `nutrition_checkin_routing_click` | V1d, V1f |

V1a en V1b kunnen parallel en zijn de enige twee zonder voorganger.

**Migratie-naad.** Logs van vóór V1c hebben geen clusters en geen antwoordlabels in `raw_inputs` — alleen de numerieke `NutritionSelfReport`-velden en de `estimate`-array. `buildNutritionFactRows` kan de clusterrijen dus wél reconstrueren uit de opgeslagen getallen (die zijn er), maar de **delta**-regel van een oude log kan geen antwoordlabel van de vorige meting tonen als die meting van vóór V1a is en de breedte-vragen miste. Regel: bij een vorige log zonder de vier breedte-antwoorden valt de delta terug op N1 ("dit is je nulpunt") in plaats van een half-vergelijk te tonen. Dat is een besluit, geen bug — benoem het in de PR.

---

## M · Brug-contract

### Element × surface

| Element | Intake-resultaat (VR) | Voortgang › Voeding (VL) | Programma / Mijn Dag |
| --- | --- | --- | --- |
| `.checkin-readout` | **primair** | **primair** (variant `voortgang`) | verboden |
| Clusterrijen (laag 1–2) | secundair, max 4 + toon alles | **primair**, alle | verboden |
| Eetbasis-rail (6 lagen) | verboden | **primair** | verboden |
| "Wat kun je hier doen?" | verboden (L7) | secundair, laag 1–3 | verboden |
| Zelf-calibratie | verboden | secundair, t/m laag 3 | verboden |
| Laag 5 ghost | verboden | secundair | verboden |
| Laag 6 poort + vergelijk-link | **verboden** (L6/L7) | secundair, alleen bij open poort | verboden |
| Eiwitdoel-calculator | verboden | secundair, laag 3 achter "meer uitleg" | verboden |
| Ijkpunt-prompt | secundair | verboden (dubbeling) | verboden |
| Beweging-koppelregel | verboden | secundair, max 1 regel (L11) | verboden |
| Actie "Zet op Mijn Dag" | verboden | secundair, per laag-actie | **primair** |
| Onderbouwing-link | footnote | footnote | verboden |

### Deeplinks

- **VR primaire CTA** → `buildDashboardVoortgangHref("domein", null, "voeding")` = `/dashboard?tab=voortgang&screen=domein&domein=voeding`. Landingspositie: bovenaan, met de readout als eerste blok — hij herkent letterlijk wat hij net las, en scrollt de rail in. Géén auto-scroll naar laag 1; dat ontneemt hem de herkenning.
- **VL laag 6** → bestaande `comparisonPath` uit `nutrientReferences` (`/beste/eiwitpoeder`, `/beste/omega-3-supplement`, `/beste/magnesium`, `/beste/vitamine-d`, `/beste/zink`). Label-only, geen nieuwe affiliate-slug, geen `sub_id`-wijziging.
- **Beweging G.1** → één regel op VL wanneer het beweegadvies op de voedingscheck wacht: *"Je beweegadvies wacht nog op deze check — die staat nu."* met link naar `buildDashboardVoortgangHref("domein", null, "beweging")`. Andersom, wanneer de voedingscheck ontbreekt, blijft de bestaande CTA in `BewegingAdviesTreden` staan; die verandert niet.
- **R5 (spec only, niet bouwen)** → een laag-actie levert straks een Mijn Dag-blok via het bestaande `buildDashboardAgendaHref()`-contract, met `action_id` als bron. Geen UI in v1, geen persistentie van gekozen acties (dat is de voeding-tegenhanger van R3 bij beweging).

### Differentiatie

Apple Health en de coaching-apps meten beter dan wij en zullen dat blijven doen: zij hebben sensoren, wij hebben elf vragen. Waar zij niets hebben is een *volgorde met een weigering erin*. Een tracker toont je alles tegelijk en laat de prioritering aan jou; een coaching-app verkoopt je de volgende module. Wij zeggen expliciet welke vraag nu níet aan de beurt is, en houden de commerciële deur dicht tot de meting hem opent — en dat is geen bescheidenheid maar het product. Het maakt van een advies een oordeel dat je kunt controleren, en van een vergelijk-link iets dat je hebt verdiend in plaats van iets dat je is voorgeschoteld. Die combinatie — een gepubliceerde hiërarchie, een gate die meetbaar dicht kan blijven, en een affiliate-model dat de gate niet mag omzeilen — is precies wat een partij met distributie en zonder redactionele geloofwaardigheid niet zelf kan bouwen, en dus moet kopen.

---

## Buiten scope

Beweging R0/R0b · de 14-punten canon als scroll-inhoud · 23-punten checklist · puntenstelsel · calorie-tracker, barcode, macro-dashboard · bloedwaarden · slaap/stress-piramide · DB-migratie (alles blijft in bestaande `answers`/jsonb).
