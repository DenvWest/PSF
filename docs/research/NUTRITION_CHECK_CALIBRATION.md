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

**Implementatie:** kernflow = 6 gap-sliders → allergieën → voorkeur → optionele 4 breedte-vragen (overslaanbaar).

## 4. Delta-copy patronen (begrip → actie)

Voorbeeldzinnen (inname-taal, geen status):

1. **Eiwit verbeterd:** "Eiwit: van laag naar rond — je verspreidt eiwit vaker over de dag sinds je vorige check."
2. **Omega-3 terug:** "Omega-3: van op niveau naar laag — vette vis kwam deze periode minder vaak voor."
3. **Score:** "Je voedingsscore ging van 62 naar 71 sinds je startpunt."
4. **Onveranderd:** "Magnesium: nog steeds rond — houd je gewoonte vast of voeg een handvol noten toe."
5. **Startpunt:** "Sinds je eerste check bewoog eiwit de goede kant op; omega-3 bleef gelijk."

## 5. Prioriteiten (implementatie)

1. Vraag-flow: kern 6 → optionele breedte 4 (P1)
2. Resultaat: nutriënt ← vraag-mapping zichtbaar (P1)
3. Baseline-delta + score-delta (P2)
4. Eiwitdoel-card prominenter bij eiwit-gap (P4)
5. YouTube-landingscopy + GA4 (P3)

**Niet nu:** cohort-vergelijking, macro-engine, vezels als 6e nutriënt.
