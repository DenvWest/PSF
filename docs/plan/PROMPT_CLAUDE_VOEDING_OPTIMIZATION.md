# Claude review-prompt — Voeding optimaliseren (wetenschap & product, 40+ en breder)

> **Gebruik:** plak de inhoud onder **Prompt (copy-paste)** in Claude Code op branch `main` met de working tree intact. Voeg als bijlage toe:
> - `docs/core/COMPLIANCE.md`
> - `docs/research/NUTRITION_CHECK_CALIBRATION.md`
> - `docs/plan/PLAN_MEASUREMENT_PERSONALIZATION.md` (m.n. sectie A3–A4)
> - `docs/plan/PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md`
> - **Working tree:** `git diff` + untracked files — de reviewer leest de bron, niet deze samenvatting
> - Optioneel: PKN Vol. 2 hoofdstuk 5 & 6 (Present Knowledge in Nutrition)
>
> **Scope-afbakening (belangrijk):** dit is de **wetenschap-/product-review** — drempelvalidatie, portie-cijfers, bronnen, leeftijdsstrategie, micronutriënt-uitbreiding, conversie. **Architectuur, code, modulegrenzen en tests** zitten in de aparte **implementatie-review** ([`PROMPT_CLAUDE_VOEDING_IMPLEMENTATIE_REVIEW.md`](PROMPT_CLAUDE_VOEDING_IMPLEMENTATIE_REVIEW.md)). Verwijs daarnaar; herhaal geen code-oordelen hier.
>
> **Belangrijk — de code is verder dan dit document oorspronkelijk aannam.** N0 (porties), N1 (evidence) en N2 (allergie/voorkeur) zijn **grotendeels gebouwd maar nog niet gecommit**. Je taak is niet meer "moeten we dit bouwen?" maar **"valideer wat er staat tegen de bron, en bepaal N3–N6."**
>
> **Verwachte output:** `docs/research/VOEDING_OPTIMIZATION_REVIEW.md` — review-rapport met 8 vaste secties. **Geen code.** Dennis gebruikt het voor product- en contentbeslissingen; implementatie gebeurt daarna via aparte Cursor-prompts per fase.

---

## Prompt (copy-paste)

```text
## Prerequisite

Lees `docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md` als die bestaat.
Sla alles over wat daar als "bewust laten zitten" of "follow-up PR" staat.
Deze prompt beslist alleen N3–N6 (drempels, portie-validatie, leeftijd, tier-2, extra nutriënten).

## Rol

Je bent tegelijkertijd:
- senior nutrition scientist — healthy aging, macro/micro DRV's (Gezondheidsraad, EFSA, Voedingscentrum, NEVO)
- gedragswetenschapper — frequentie-vragen vs portie-duidelijkheid; conversie zonder overweldigen
- product architect — 3-minuten-check behouden, tier-2-verdieping optioneel
- compliance reviewer — inname-taal, geen tekort-diagnose, EFSA-gate (Claimsverordening 1924/2006, AVG art. 9, MDR-grens)
- growth/strategie — "Consumentenbond van supplementen"-positionering, YouTube → voedingscheck → supplement

Je taak is NIET om code te schrijven en NIET om architectuur/tests te beoordelen (dat doet de implementatie-review). Je produceert een wetenschap-/product-rapport dat Dennis direct kan gebruiken voor product- en contentbeslissingen. Wees extreem kritisch: wetenschappelijk reviewer + compliance officer + conversie-strateeg.

WERKWIJZE — DIFF-FIRST. De implementatie is al grotendeels gebouwd (uncommitted). Lees vóór je oordeelt de echte bron:
    git diff
    git ls-files --others --exclude-standard
Open minimaal: portion-dictionary.ts, nutrition-advice-personalization.ts, nutrition-question-evidence.ts, nutrient-evidence-map.ts, intake-reference.ts, nutrition-season.ts, lifescore-questions.ts, protein-target.ts. Beoordeel de WERKELIJKE getallen en copy die er staan — niet wat dit document beschrijft.

Geef bij ELKE aanbeveling: (a) een wetenschappelijke bron of richtlijn, en (b) een compliance-label: ✅ toegestaan · ⚠️ voorzichtig formuleren (geef veilige copy) · ❌ niet toegestaan.

---

## Context — product, code & juridische kaders

**PerfectSupplement** (perfectsupplement.nl) is een onafhankelijk supplementen-vergelijkingsplatform + leefstijlcheck voor mannen 40+. Focus: slaap, stress, energie, herstel, voeding. Monetisatie via affiliate links. Positionering: objectief, wetenschappelijk, "eerst de basis, dan de pil".

De **voedingscheck** (`/intake/voeding`) is een lichtgewicht frequentie-check (geen dagboek/gram-logging). Flow: frequentie-sliders → allergie-multi → voorkeur-single → nutriënt-banden → gepersonaliseerd leefstijladvies → gegate supplement-suggestie → optionele evidence-onderbouwing.

### Wat is nu GEBOUWD (uncommitted) — valideer dit, herbouw het niet

| Fase | Wat er in de working tree staat | Kernbestanden | Wat jij nog moet valideren |
|------|----------------------------------|---------------|-----------------------------|
| **N0 porties** | Elke `lifestyleAction` bevat nu gram-equivalenten; vit-D heeft een seizoensvariant (winter/zomer) op runtime | `data/nutrition/portion-dictionary.ts` (`PORTION_DEFINITIONS`, `PORTION_GRAMS`, `buildLifestyleAction`), `lib/nutrition-season.ts` | Zijn de gram-getallen correct t.o.v. NEVO/Voedingscentrum? Ze staan als "indicatief / TODO verify". |
| **N1 evidence** | 10 vraag-onderbouwingen met sterren + APA/DOI/PMID-referenties; publieke pagina `/onderbouwing/voeding`; optionele disclosure per vraag | `data/nutrition/nutrition-question-evidence.ts`, `nutrient-evidence-map.ts`, `components/evidence/*`, `app/onderbouwing/voeding/page.tsx` | Kloppen de bronnen, de sterren-rationale en de disclaimer-taal? Is de plaatsing conversie-veilig? |
| **N2 allergie/voorkeur** | `personalizeLifestyleText()` draait nu ín `buildNutritionAdvice`; fish-free/dairy-free/egg-free/vegan substituties; dieet-skip-logica | `lib/nutrition-advice-personalization.ts`, `lib/nutrition-diet-skip.ts`, `lib/nutrition-lifestyle-extras.ts` | Zijn de substituties voedingskundig correct (algenolie i.p.v. vis, pompoenpitten i.p.v. noten, etc.)? |
| **(nieuw)** | Aparte `nutsSeedsLegumes`-slider → `nutsSeedsLegumesPerWeek` als extra magnesium-proxy | `data/nutrition/lifescore-questions.ts` | Weegt die correct mee naast de groente-proxy, of dubbeltelt magnesium? |

**Bevestigd via de code:** allergie/voorkeur worden nu wél gebruikt — route → `buildNutritionLogResponse` → `buildNutritionAdvice({preference, allergies})` → `personalizeLifestyleText`. De oude aanname "opgeslagen maar niet gebruikt" is achterhaald.

### Nog OPEN — dit is waar jouw prioritering telt

- **N3 drempel-validatie:** in `intake-reference.ts` staan ALLE 5 nutriënt-drempels nog met `// TODO review` — het zijn vuistregels, geen gebronde norm. De UI noemt ze daarom expliciet "vuistregel", niet "richtlijn". Dit is de grootste openstaande wetenschappelijke schuld.
- **N3 leeftijd in eiwit g/kg:** `protein-target.ts` heeft nog géén leeftijdsfactor binnen 40+ (TODO in bestand).
- **N4 leeftijdsbanden:** nog 40+ only (`INTAKE_AGE_RANGE_OPTIONS = ["40–44","45–49","50–54","55+"]`).
- **N5 tier-2 macro (BMR/TDEE):** niet gebouwd (`PLAN_MEASUREMENT_PERSONALIZATION` A3–A4).
- **N6 6e nutriënt:** B12 bestaat nú alleen als evidence-vraag (`b12_vegan`) — GEEN `/beste/*`-pad, NIET in de 5-nutriënt-engine. Vezels (`wholegrain`) telt alleen in de totaalscore, geen band. Beslis: engine-nutriënt maken of evidence-only laten.

### Harde compliance-regels (leidend — mag niet geschonden worden)
- **Inname-inschatting MAG:** "op basis van je voeding krijg je waarschijnlijk minder dan de aanbevolen hoeveelheid magnesium binnen."
- **Statusclaim/diagnose MAG NIET:** "tekort", "deficiëntie", bloedwaarde, diagnose. `FORBIDDEN_STATUS_PHRASES` blokkeert de substring "tekort" → schrijf ook nooit "tekortrisico".
- **Supplement-suggestie alleen** via de vier-stappen gate in `nutrition-advice.ts` (`nutritionSupplementGate`) → goedgekeurde EFSA-claim in `approved-claims.ts` + bestaand `/beste/*`-pad + `isComparisonAllowed`. Geen gate = geen pil.
- **Leefstijl-eerst invariant:** elke supplement-suggestie staat ná minstens één leefstijl-quick-win (priority 1 vóór priority 2). De `buildNutritionAdvice`-sort borgt dit — controleer of dat na personalisatie intact blijft.
- **Drempelgetallen zijn "vuistregels"**, geen gevalideerde norm. De UI noemt ze expliciet "vuistregel" zolang de TODO's in `intake-reference.ts` niet gebronde grenzen bevatten.
- **Body metrics** (gewicht/lengte/leeftijd voor macro) = AVG art. 9-gegevens → granulaire, niet-vooraangevinkte consent per doel; leeftijd blijft bandbreedte (geen geboortedatum).
- **MDR-grens:** leefstijl/welzijn-educatie = OK; ziektevoorspelling, risicopercentages, lab-interpretatie = MDR-risico.

### Huidige voedingsvragen (`src/data/nutrition/lifescore-questions.ts`)

Frequentie-sliders + 1 allergie-multi + 1 voorkeur-single. Alleen de vetgedrukte sliders voeden de nutriënten-engine via een `report`-fragment; de rest telt in de totaalscore. Let op: `nutsSeedsLegumes` is nieuw t.o.v. de vorige versie.

| id               | vraag (kort)                                  | voedt nutriënt-engine? |
|------------------|-----------------------------------------------|------------------------|
| fruit            | stuks fruit / week                            | nee (alleen score)     |
| berries          | bessen / week                                 | nee (alleen score)     |
| **vegetables**   | porties groente / dag → `vegFruitPerDay`      | ja (magnesium)         |
| **nutsSeedsLegumes** | noten/zaden/peulvr. / week → `nutsSeedsLegumesPerWeek` | ja (magnesium — NIEUW) |
| wholegrain       | % volkoren                                    | nee (alleen score; vezel-evidence) |
| **oilyFish**     | vette vis / week → `oilyFishPerWeek`          | ja (omega-3)           |
| **proteinMeals** | eiwitrijke eetmomenten / dag → `proteinMealsPerDay` | ja (eiwit)       |
| **meatLegumes**  | vlees/vis/peulvruchten / dag → `meatLegumesPerDay` | ja (zink)         |
| **dairy**        | porties zuivel / dag → `dairyServingsPerDay`  | ja (zink-proxy)        |
| sugaryDrinks     | suikerdrank/snoep / week (negatief gewicht)   | nee (alleen score)     |
| **daylight**     | ≥15 min buiten / week → `sunExposurePerWeek`  | ja (vitamine D)        |
| allergies        | noten/vis/zeevruchten/eieren/melk/lactose/tarwe (multi) | ja — via `personalizeLifestyleText` |
| preference       | none / pescatariër / vegetariër / veganist    | ja — via `personalizeLifestyleText` |

### Huidige nutriënt-drempels (`src/data/nutrition/intake-reference.ts`) — allemaal nog "TODO review"

5 nutriënten, elk met een `/beste/*`-interventiepad. Band-logica: signaal < belowMax → "below"; ≥ meetsMin → "meets"; ertussen → "around". `lifestyleAction` komt nu uit `buildLifestyleAction()` in `portion-dictionary.ts` (mét gram-equivalent).

| nutriënt   | referentie              | belowMax / meetsMin      | /beste/-pad              | drempel-status |
|------------|-------------------------|--------------------------|--------------------------|----------------|
| protein    | eiwit bij elke maaltijd | <2 / ≥3 eiwit-maaltijden | /beste/eiwitpoeder       | TODO review    |
| omega3     | 2× vette vis/week       | <1 / ≥2 ×/week           | /beste/omega-3-supplement| TODO review    |
| magnesium  | groente/noten/peulvr.   | <2 / ≥4 porties groente  | /beste/magnesium         | TODO review    |
| vitamin_d  | dagelijks buiten        | <1 / ≥3 ×/week           | /beste/vitamine-d        | TODO review    |
| zinc       | dagelijks vlees/vis/peulvr. | <1 / ≥2 porties/dag  | /beste/zink              | TODO review    |

### Gebouwde lifestyle-copy (valideer de getallen in `portion-dictionary.ts`)

De reviewer moet de echte strings lezen. Voorbeelden die nu in de code staan (getallen indicatief, "TODO verify"):
- eiwit: "20–30 g eiwit per eetmoment: 2 eieren + kwark bij ontbijt, 100 g kip of 135 g linzen…"
- magnesium: "30 g noten (~1 handvol, ~80 mg), 100 g gekookte spinazie of 135 g zwarte bonen. Vuistregel mannen: rond de 350 mg/dag."
- zink: "100 g rundvlees (~4–5 mg), 2 eieren, of 135 g peulvruchten. Vuistregel mannen: ~9–11 mg/dag."
- vitamine D (winter): "10 µg via voeding of supplement is een veelgebruikte vuistregel."
Controleer elk getal (135 g linzen? 80 mg Mg per 30 g noten? 4–5 mg Zn per 100 g rundvlees? 350 mg Mg / 9–11 mg Zn / 10 µg D) tegen NEVO/Voedingscentrum/Gezondheidsraad. Fout getal = compliance-risico.

### Huidige eiwit-logica (`src/lib/protein-target.ts`)

Kwantitatieve g/kg-range op basis van gewicht × trainingsbelasting. **Leeftijd binnen 40+ is nog NIET meegenomen** (TODO in bestand). Bron: PROT-AGE (2013) / ESPEN (2014). Output = RANGE gram/dag, expliciet een inname-richtlijn, nooit een status. Getoond achter disclosure (`ProteinTargetCard`).

| trainingLoad | g/kg range |
|--------------|-----------|
| 1 (basis/geen training) | 1.0–1.2 |
| 2 | 1.2–1.4 |
| 3 | 1.4–1.6 |
| 4 | 1.6–1.8 |

### Geplande macro-tier (nog niet gebouwd — `PLAN_MEASUREMENT_PERSONALIZATION.md` A3–A4)

Tier-2 verdieping ná de basis-check, in een aparte `src/lib/`-module:
- BMR via **Mifflin-St Jeor** (man): `10·gewicht + 6.25·lengte − 5·leeftijd + 5`; TDEE = BMR × PAL. Leeftijd = midden van de bestaande band (bv. 45–49 → 47).
- Macro-inschatting: TDEE + één doelvraag → macroverdeling als **inname-richtlijn**, eiwit eerst (g/kg), dan vet (minimum), rest koolhydraten.
- Micro-inschatting: bestaande frequentievragen → grove geschatte inname per nutriënt, afgezet tegen Gezondheidsraad ADH / EFSA DRV. Output strikt: "krijgt waarschijnlijk minder dan de aanbevolen hoeveelheid binnen." Nooit "tekort".

---

## Jouw opdracht — review in 8 secties

Schrijf `VOEDING_OPTIMIZATION_REVIEW.md`. Werk elke sectie concreet uit: noem vraag-id's, bestandsnamen, drempelwaarden, gram-equivalenten en bronnen. Vage adviezen ("eet meer groente") tellen niet. Label elke sectie-aanbeveling: **valideert bestaande implementatie** vs **nieuw voorstel (N3–N6)**.

### 1. Leeftijdsstrategie — 40+ only vs uitbreiden (N4, nog open)
Beoordeel de opties: (A) strikt 40+, (B) 35–39 optioneel, (C) 30–39, (D) volledige 18+ mannen.
- Per optie: wetenschappelijke verschillen (PROT-AGE, sarcopenie-drempel ~30e (~6%/decennium), vit D-synthese, eiwit g/kg), merk-risico ("Consumentenbond"-verwatering) en engine-impact.
- Aanbeveling: welke banden toevoegen in `INTAKE_AGE_RANGE_OPTIONS`, en waar leeftijd wél/niet de nutrition-engine mag beïnvloeden (eiwit g/kg → ja; omega-3/vit-D-drempel → waarschijnlijk nee — onderbouw).
- Copy-impact: `/voeding-na-40`, YouTube-scripts, pillar-SEO.

### 2. Macro-laag — nu versterken vs tier-2 uitstellen (N3 g/kg + N5)
- Huidige eiwit-logica (`proteinMeals`-vraag + `ProteinTargetCard`) vs geplande BMR/TDEE (A3–A4).
- Leeftijdsfactor in g/kg: concrete banden (40–49 vs 50–59 vs 60+) — verdedigbaar t.o.v. PROT-AGE/ESPEN? `protein-target.ts` mist dit nog.
- Moet macro nu al zichtbaarder — "streef naar ~X g eiwit" op het resultaat, ook zonder lengte/gewicht? Compliance-veilige formulering?
- Koolhydraten/vet: wel/niet in de frequentie-check — risico op schijnprecisie zonder gram-logging.

### 3. Micronutriënten — 5 huidige valideren vs uitbreiden
Per bestaand engine-nutriënt in `intake-reference.ts` — beoordeel de gebouwde drempel + proxy:

| Nutriënt   | Review-vragen (drempel is nog "TODO review") |
|------------|-----------------------------------------------|
| Eiwit      | Drempels 2/3 maaltijden vs g/kg; spreiding over 3–5 momenten |
| Omega-3    | 2× vis/week vs gram EPA/DHA; is de gebouwde vegan-proxy (algenolie/ALA) correct? |
| Magnesium  | Nu TWEE proxy's: `vegetables` + `nutsSeedsLegumes` — dubbeltellen die? Hoe wegen ze samen? |
| Vitamine D | Zon-proxy + seizoen (`nutrition-season.ts`): klopt de winter/zomer-grens voor NL? |
| Zink       | Vlees/peulvruchten + zuivel; overlap met eiwit-vraag; is de dairy-free-substitutie correct? |

Nieuwe/half-gebouwde kandidaten:
- **B12** — bestaat nú als evidence-vraag (`b12_vegan`) zónder engine-band en zónder `/beste/*`. Beslis: engine-nutriënt maken (vereist interventiepad), evidence-only laten, of uitbreiden met medicatie-proxy (PPI/metformine, PKN Table 5.1). De code heeft hier een expliciete TODO.
- **Vezels** — `wholegrain` telt nu alleen in de score + heeft evidence, geen band. Engine-nutriënt of zo laten?
- IJzer, calcium — alleen als er een `/beste/*` of leefstijl-only-advies bij past.

**Harde regel:** geen 6e/7e engine-nutriënt zonder affiliate/vergelijkingspad óf expliciet leefstijl-only-advies. Motiveer per kandidaat: engine-nutriënt / evidence-only / leefstijl-only / niet doen.

### 4. Portie-onderbouwing — VALIDEER het gebouwde woordenboek
`portion-dictionary.ts` bestaat al met `PORTION_DEFINITIONS` en gram-equivalenten in elke `lifestyleAction`. Jouw taak: elk getal verifiëren tegen bron (Voedingscentrum / NEVO / Gezondheidsraad) en de compliance-formulering checken ("richtlijn"/"vuistregel", geen diagnose).

Lever een validatietabel: gebouwd getal → bron → ✅/⚠️/❌ → correctie indien fout.

| Portie / getal (nu in code) | Verwachte bron | Klopt? | Correctie |
|-----------------------------|----------------|--------|-----------|
| groente 100 g/portie        | Schijf van Vijf | ?      |           |
| peulvruchten 135 g uitgelekt| Voedingscentrum | ?      |           |
| noten 25–30 g/dag, ~80 mg Mg| Schijf v Vijf / NEVO | ? |           |
| vette vis 100–150 g         | Voedingscentrum | ?      |           |
| rundvlees 100 g ≈ 4–5 mg Zn | NEVO           | ?      |           |
| vit-D 10 µg vuistregel      | Gezondheidsraad | ?     |           |
| Mg ~350 mg/dag, Zn 9–11 mg  | Gezondheidsraad ADH | ? |           |

Vul aan voor alle groepen. Waar een getal niet te bronnen is: markeer als ❌ en geef veilige vervanging.

### 5. Evidence-UX — VALIDEER de gebouwde onderbouwing (N1 gebouwd)
De 10 `NUTRITION_QUESTION_EVIDENCE`-entries, `EvidenceStars`, `NutritionEvidenceDisclosure` en `/onderbouwing/voeding` bestaan al.
- **Inhoudsreview:** kloppen per vraag de `whyThisQuestion`, `scientificRationale` (2–3 bullets), sterren-`strength` en `references` (APA/DOI/PMID)? Zijn de sterren-toekenningen (3/4/5) verdedigbaar of te gul?
- **Disclaimer-taal:** dekt `NUTRITION_EVIDENCE_DISCLAIMER` / `_STRENGTH_DISCLAIMER` de MDR/status-grens? ✅/⚠️/❌.
- **Plaatsing:** disclosure default dicht onder de slider vs alleen op resultaat vs alleen `/onderbouwing` — is de gekozen plaatsing conversie-veilig (geen extra klik tijdens invullen)?
- **Gaten:** fruit/berries hebben geen evidence-entry — bewust of gat? Documenteer.

### 6. Vraagset-review — behouden, splitsen, toevoegen
Volledige review van de nutrition-vragen in `lifescore-questions.ts`. Label per vraag: **behouden / aanpassen / splitsen / optioneel maken / verwijderen**.
- Kern gap-sliders vs breedte-vragen (fruit/berries/wholegrain/sugaryDrinks) — calibration-doc P1: kern → allergie → voorkeur → optionele breedte (overslaanbaar). Bevestig of weerleg.
- `nutsSeedsLegumes` is nu apart toegevoegd als magnesium-proxy naast `vegetables` — is dat de juiste keuze, of dubbeltelling? Hoe zouden beide samen moeten wegen?
- `allergies` + `preference` worden nu doorvertaald via `personalizeLifestyleText`. Beoordeel of de substituties compleet zijn (bv. tarwe-allergie → nu geen effect; lactose vs melk als aparte keys; pescatariër → vis wél).
- `sugaryDrinks` — koppelen aan energie-domein of laten als score-balans?

### 7. Conversie & vertrouwen — nu vs later
Koppeling aan de YouTube-funnel (`PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md`):
- Welke (nu gebouwde) onderbouwing moet live/gecommit zijn vóór de eerste video (Fase A)?
- Wat pas na ~50 completed logs met `utm_source=youtube`?
- Hoe versterkt het portie-advies de supplement-gate ("eerst het bord, dan de pil") i.p.v. de affiliate-druk te verhogen?
- Meetvoorstellen: welke events lezen het effect van de evidence-disclosure en portie-tips af? (zie Meetpunten onder). Zeg per event: wat lees je eraan af?

### 8. Gefaseerde roadmap — bijwerken naar de echte stand
Lever een prioriteitenmatrix die N0–N2 als **gebouwd (te valideren/committen)** markeert en N3–N6 prioriteert. Per fase: **Must-have / Nice-to-have / Niet doen** + afhankelijkheden + risico.

| Fase | Stand | Inhoud | Bestanden (indicatief) | Risico |
|------|-------|--------|------------------------|--------|
| N0 | **gebouwd, valideren** | Portie-woordenboek + gram-equivalenten + vit-D seizoen | portion-dictionary.ts, nutrition-season.ts | Getallen ongebrond |
| N1 | **gebouwd, valideren** | Evidence-data + disclosure + /onderbouwing/voeding | nutrition-question-evidence.ts, components/evidence/* | Completion + bronjuistheid |
| N2 | **gebouwd, valideren** | Allergie/voorkeur in advies; noten-proxy | nutrition-advice-personalization.ts, lifescore-questions.ts | Substitutie-juistheid |
| N3 | **open** | Drempel-validatie t.o.v. Gezondheidsraad; leeftijd in eiwit g/kg | intake-reference.ts, protein-target.ts | Compliance |
| N4 | **open** | Leeftijdsbanden 35–39 (productbesluit) | intake-questions.ts, copy sitewide | Merk |
| N5 | **open** | Tier-2 macro (BMR/TDEE) — alleen na N3-data | PLAN_MEASUREMENT_PERSONALIZATION | AVG art. 9 |
| N6 | **open** | 6e nutriënt: B12 (nu evidence-only) of vezels | nieuw /beste/* of leefstijl-only | Scope |

Herzie waar jouw analyse afwijkt — de matrix is een voorstel, geen dictaat.

---

## Specifieke diepte-vragen (beantwoord expliciet)

1. Zijn de gebouwde gram-getallen in `portion-dictionary.ts` (135 g linzen, ~80 mg Mg/30 g noten, 4–5 mg Zn/100 g rundvlees, 350 mg Mg, 9–11 mg Zn, 10 µg D) correct te bronnen? Welke moeten worden gecorrigeerd vóór commit?
2. Dubbeltellen `vegetables` en `nutsSeedsLegumes` het magnesium-signaal, of vullen ze elkaar correct aan?
3. Zijn de N2-substituties (algenolie i.p.v. vis, pompoenpitten i.p.v. noten, rundvlees/ei i.p.v. zuivel voor zink) voedingskundig verdedigbaar en compleet? Welke allergie/voorkeur mist nog een substitutie?
4. Moeten we onder 40 opengaan (N4)? Zo ja: welke banden en wat verandert er wetenschappelijk per band?
5. B12: engine-nutriënt maken (vereist `/beste/*`), evidence-only laten, of medicatie-proxy toevoegen — wat is verdedigbaar zonder de "geen 6e nutriënt zonder pad"-regel te breken?
6. Welke van de nu-gebouwde onderdelen mag NIET live vóór drempel-validatie (N3), omdat de UI anders norm-taal suggereert die niet gebronde is?

---

## Output-formaat

Markdown, Nederlands, met tabellen. **Geen code.** Per aanbeveling een bron + compliance-label (✅/⚠️/❌). Noem concrete vraag-id's, bestandsnamen en drempelwaarden. Markeer elke bevinding als **valideert bestaande code** of **nieuw voorstel (N3–N6)**.

Eindig met:

**Top-5 acties deze maand:**
1. …

**Top-5 bewust NIET doen:**
1. …
```

---

## Na de review — verwachte implementatievolgorde

De review bepaalt de exacte prioriteit. Omdat N0–N2 al in de working tree staan, is de eerstvolgende stap **valideren + committen**, niet opnieuw bouwen. Daarna N3+, telkens als **aparte Cursor-implementatieprompt**, niet alles in één PR:

1. **Valideren & committen N0–N2** — corrigeer de gram-/mg-getallen in `portion-dictionary.ts` waar de review ❌/⚠️ geeft; commit dan de evidence + personalisatie. (Zie de aparte implementatie-review voor code/architectuur-blockers.)
2. **N3 drempel-validatie** — vervang de `TODO review`-grenzen in `intake-reference.ts` door gebronde Gezondheidsraad/Voedingscentrum-cijfers; pas dáárna mag norm-/richtlijn-taal terug in de UI.
3. **N3 leeftijd in eiwit g/kg** — leeftijdsfactor in `protein-target.ts`.
4. **N4 leeftijdsbesluit** — pas dáárna banden + copy sitewide.
5. **N5 tier-2 macro** — pas na N3-data én een privacy-register-check (AVG art. 9).
6. **N6 6e nutriënt** — alleen met interventiepad óf expliciet leefstijl-only.

**Niet in de eerstvolgende PR:** volledige leeftijdsherziening sitewide, B12 als engine-nutriënt zonder `/beste/*`, dagboek/gram-logging.

---

## Meetpunten (bij latere implementatie)

| Event                          | Wanneer                      | Effect aflezen |
|--------------------------------|------------------------------|----------------|
| `nutrition_evidence_expanded`  | Klik "Waarom deze vraag?"    | GA4: vertrouwen vs drop-off per vraag |
| `nutrition_portion_tip_viewed` | Portie-detail op resultaat   | Engagement vs supplement-reveal |
| `nutrition_log_completed`      | Bestaand                     | Completion-rate vóór/na evidence-UI |
| `nutrition_supplement_revealed`| Bestaand (YouTube-plan)      | Gate-effect ná portie-advies |

Controleer of de nu-gebouwde disclosure/return-flow al een meetpunt heeft (`git diff src/lib/ga4.ts`). Nieuw client-event vereist registratie op drie plekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`. Hergebruik bestaande event-types; geen PII in GA4/Clarity-payloads.
