# Onderzoek — Voedingscheck calibratie (juli 2026)

> Afgebakend onderzoek t.o.v. Lifesum-achtige apps. Geen dagboek-clone — wel frequentie-proxy's, drempels en delta-copy voor mannen 40+.

## 1. Benchmark lightweight vs full diary

| App | Lightweight check | Full diary |
|-----|-------------------|------------|
| Lifesum | Onboarding-vragen over gewoontes; score/insights | Grammen, barcode, macro's per dag |
| Yazio | Snelle setup + doelen | Calorie-tracking |
| Noom | Gedrag/psychologie-quiz | Logging optioneel |
| Voedingscentrum | Schijf van Vijf, Mijn Eetmeter (optioneel) | Grammen bij verdieping |

**Conclusie voor PS:** houd de 3-min frequentie-check. Progressie via her-log + score-trend + band-delta — niet via dagelijks loggen.

## 2. Vragen per nutriënt (proxy's)

| Nutriënt | Beste proxy-vragen | Drempel-voorstel (vuistregel) |
|----------|-------------------|-------------------------------|
| Eiwit | Eiwitrijke eetmomenten/dag; vlees-vis-peulvruchten/dag | &lt;2 maaltijden → laag; ≥3 → op niveau ([Voedingscentrum](https://www.voedingscentrum.nl/nl/service/vraag-en-antwoord/afvallen-en-gewicht/heb-je-extra-eiwit-proteine-nodig-voor-spierherstel-en-spiergroei-na-krachttraining-of-duursport): spreiding 3–5 momenten) |
| Omega-3 | Vette vis/week | &lt;1×/week laag; ≥2× op niveau (Voedingscentrum: 1× vette vis/week minimum) |
| Magnesium | Groente/dag + vlees/peulvruchten | &lt;2 porties groente laag; ≥4 op niveau |
| Vitamine D | Buiten ≥15 min/week | &lt;1×/week laag; ≥3× op niveau |
| Zink | Vlees/vis/peulvruchten + zuivel/dag | &lt;1 portie laag; ≥2 op niveau |

Huidige drempels in `intake-reference.ts` sluiten hierop aan — geen wijziging nodig tot er velddata is.

## 3. Fruit / bessen / volkoren / suiker

| Vraag | Nuttig voor gaps? | Advies |
|-------|-------------------|--------|
| Fruit | Nee (geen 6e nutriënt nu) | Optionele breedte-sectie — alleen totaalscore |
| Bessen | Nee | Idem |
| Volkoren | Nee (kwaliteitssignaal) | Idem |
| Suiker | Nee (negatief gewicht score) | Idem — wel behouden voor score-balans |

**Implementatie:** groente → allergieën → voorkeur → noten/vis/vlees/zuivel/daglicht → optionele breedte. Zie §7.

## 7. Flow P1 geïmplementeerd (juli 2026)

| Fase | Vragen | UI |
|------|--------|-----|
| Kern vóór dieet | `vegetables` | Progress telt mee |
| Meta | `allergies`, `preference` | Live feedback welke vragen overgeslagen worden |
| Kern na dieet | `nutsSeedsLegumes`, `oilyFish`, `proteinMeals`, `meatLegumes`, `dairy`, `daylight` | Auto-skip + sync bij elke allergie-wijziging |
| Breedte (optioneel) | `fruit`, `berries`, `wholegrain`, `sugaryDrinks` | `wholegrain` skip bij tarwe-allergie |
| Consent | AVG-opt-in | 100% progress |

### Allergie-matrix (`nutrition-diet-skip.ts`)

| Allergie / voorkeur | Actie |
|---------------------|-------|
| `vis` / `zeevruchten` | Skip `oilyFish`; copy `meatLegumes` zonder vis |
| `melk` / `lactose` | Skip `dairy` |
| `noten` | Skip `nutsSeedsLegumes` |
| `eieren` | Auto opt-out `proteinMeals` + copy zonder ei |
| `tarwe` | Skip `wholegrain` (breadth) |
| Vegan | Plantaardige omega-3-vraag (`oilyFish`); skip `dairy` |
| Vegetariër | Plantaardige omega-3-vraag (`oilyFish`) |
| Pescotariër + vis-allergie | Voorkeur-optie disabled |

- **Sync:** `syncDietContext()` bij toggle allergie, verlaten allergie-stap, en voorkeur-keuze; redirect als huidige vraag skipped wordt.
- **Vis-default:** `oilyFish` start op index 0 ("Nooit").
- **Inline opt-out:** "Ik eet geen vis/zuivel/vlees of vis" voor mixed eaters (skip > opt-out).
- **Advies-personalisatie:** `preference` + `allergies` → `personalizeLifestyleText()`.
- **Meetpunten:** GA4 `nutrition_diet_skipped`, `nutrition_slider_opt_out`, `nutrition_breadth_skipped`.

Vraagset-referentie: `src/data/nutrition/lifescore-questions.ts` (`NUTRITION_FLOW`).

## 4. Delta-copy patronen (begrip → actie)

Voorbeeldzinnen (inname-taal, geen status):

1. **Eiwit verbeterd:** "Eiwit: van laag naar rond — je verspreidt eiwit vaker over de dag sinds je vorige check."
2. **Omega-3 terug:** "Omega-3: van op niveau naar laag — vette vis kwam deze periode minder vaak voor."
3. **Score:** "Je voedingsscore ging van 62 naar 71 sinds je startpunt."
4. **Onveranderd:** "Magnesium: nog steeds rond — houd je gewoonte vast of voeg een handvol noten toe."
5. **Startpunt:** "Sinds je eerste check bewoog eiwit de goede kant op; omega-3 bleef gelijk."

## 5. Prioriteiten (implementatie)

1. Vraag-flow: groente → meta → dieet-sliders → optionele breedte (P1 — live)
2. Resultaat: nutriënt ← vraag-mapping zichtbaar (P1)
3. Baseline-delta + score-delta (P2)
4. Eiwitdoel-card prominenter bij eiwit-gap (P4)
5. YouTube-landingscopy + GA4 (P3)

**Niet nu:** cohort-vergelijking, macro-engine, vezels als 6e nutriënt.

## 6. Portie-woordenboek (N0)

Gram-equivalenten voor leefstijladvies — SSOT in `src/data/nutrition/portion-dictionary.ts`. Alle getallen **indicatief**; verifiëren tegen NEVO/Voedingscentrum vóór live.

| Voedingsgroep | Portie-definitie (indicatief) | Bron |
|---------------|-------------------------------|------|
| Groente | ~100 g per portie | Voedingscentrum Schijf van Vijf |
| Fruit | 120–150 g | Voedingscentrum |
| Vette vis | 100–150 g | Voedingscentrum |
| Vlees (mager) | 100–120 g gekookt | Voedingscentrum |
| Peulvruchten | ~135 g uit blik (uitgelekt) | Voedingscentrum |
| Noten | ~25 g/dag (handvol) | Schijf van Vijf |
| Zuivel | 150 ml melk/yoghurt | Voedingscentrum |
| Ei | ~6–7 g eiwit | NEVO |

**VERIFY vóór norm-taal in UI:** mg/µg-ankers (350 mg Mg, 9–11 mg Zn, 10 µg vit D) staan alleen in `lifestyleAction`-tekst als vuistregel — niet in `referenceLabel` of `thresholds`.

Vitamine D: seizoensplit (okt–mrt winter-copy) via `src/lib/nutrition-season.ts` + `getNutrientLifestyleAction()`.
