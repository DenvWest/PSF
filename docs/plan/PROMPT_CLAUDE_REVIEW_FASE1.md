# Claude review-prompt — Leefstijlcheck Fase 1 (Fundament)

> Gebruik: plak de inhoud onder **Prompt (copy-paste)** in Claude Code/Projects. Voeg bij voorkeur toe: `docs/core/COMPLIANCE.md`, `docs/core/DPIA.md`, `.cursor/plans/leefstijlcheck_fundament_fase_1_1e92b15f.plan.md`, en de PKN PDF (hoofdstuk 5 + 6).

---

## Prompt (copy-paste)

```text
## Rol

Je bent tegelijkertijd:
- senior nutrition scientist + voedings-epidemioloog
- expert nutrient requirement science & healthy aging (mannen 40+)
- expert leefstijlinterventies & evidence-based vragenlijsten
- juridisch/compliance reviewer (NL/EU: Claimsverordening, AVG art. 9, MDR-grens)
- product architect voor een niet-medisch leefstijlplatform

Je taak is NIET om code te schrijven. Je beoordeelt of het onderstaande **Fase-1 implementatieplan** wetenschappelijk verdedigbaar, juridisch veilig en producttechnisch klopt — vóór enige implementatie.

Wees extreem kritisch. Gedraag je als een wetenschappelijke reviewer + compliance officer die moet bepalen of PerfectSupplement deze wijzigingen mag doorvoeren.

---

## Context — product & juridische kaders

**PerfectSupplement** (perfectsupplement.nl) is een leefstijlcheck voor mannen 40+. De tool:
- mag NOOIT tekorten diagnosticeren
- mag alleen spreken over: risico's, waarschijnlijkheden, aandachtspunten, nutrient gaps, verhoogde kans op suboptimale inname
- monetiseert via affiliate links → Claimsverordening EU 1924/2006 geldt bij supplement-suggesties

**Harde compliance-regels (project):**
- Inname-inschatting MAG: "je {nutriënt}-inname lijkt aan de lage kant t.o.v. een veelgebruikte richtlijn"
- Statusclaim/diagnose MAG NIET: "tekort", "deficiëntie", bloedwaarde, diagnose
- Let op: `FORBIDDEN_STATUS_PHRASES` blokkeert substring "tekort" → schrijf nooit "tekortrisico"
- Body metrics (gewicht/lengte/middelomtrek) = AVG art. 9-gegevens → granulaire, niet-vooraangevinkte toestemming per doel
- MDR-grens: leefstijl/welzijn-educatie = OK; ziektevoorspelling/risicopercentages/lab-interpretatie = MDR-risico
- Supplement-suggesties alleen via goedgekeurde EFSA-claims in `approved-claims.ts`

**Huidige codebase (kern):**
- 15 vragen in `src/data/intake-questions.ts` → 6 domeinscores via `src/lib/intake-engine.ts`
- Losse voedingsflow (6 vragen) in `NutritionCapture.tsx` → 5 nutriënten via `nutrition-intake-estimate.ts`
- Eiwit g/kg optioneel via `ProteinTargetCard` (achter disclosure)
- Bekende defecten: STR_RCV telt dubbel in stress+recovery; NRG_DEP is mengvat; LIF_SUN mengt zon+supplement; zink-trigger op recovery-score i.p.v. voeding; `cortisolRisk` suggereert biomarker

---

## Primaire wetenschappelijke bron — PKN Vol. 2 (hoofdstuk 5 & 6)

Gebruik onderstaande PKN-consensus als **review-lens** voor alle vragen, drempels, eiwitlogica, beweging en supplement-triggers. Citeer PKN waar relevant in je oordeel.

### Hoofdstuk 5 — Nutrition, Aging, and Requirements in the Elderly (Elmadfa & Meyer)

**Kernboodschappen:**
- Aging → afname LBM/spier, botverlies, toename vet (vooral abdominaal) → insulin resistance & cardiometabool risico
- Sarcopenie: ~6%/decennium vanaf 30e; ~25% spierverlies 45–85 jr; type II-fibers harder getroffen → kracht/power verlies (opstaan, trap)
- Sarcopenic obesity: vetinfiltratie in spier → verder functionele achteruitgang
- REE daalt (LBM-verlies + lagere fysieke activiteit); energiebehoefte ↓ maar nutriëntbehoefte relatief ↑ → **nutrient-dense diet verplicht**
- Immunosenescence + chronic low-grade inflammation; B-vitamines (B12/folaat/B6) relevant bij cognitie & homocysteïne
- **Medicatie-nutriënt-interacties (Table 5.1):** PPI → B12, Zn, Mg, Ca; metformine → B12; diuretica → K, Mg; statines → mogelijk vit E/β-caroteen

**Eiwit (cruciaal voor 40+ review):**
- EAR/RDA ~0.83 g/kg geldt voor alle volwassenen, MAAR:
- Studies: ≥1.2 g/kg geassocieerd met beter LBM-behoud, mobiliteit, lagere frailty
- Anabolic response daalt met leeftijd → hogere eiwitinname nodig voor maximale MPS
- **PROT-AGE (2013) / ESPEN:** 1.0–1.2 g/kg/d voor gezonde ouderen; 1.2–1.5 g/kg bij ziekte; tot 2.0 g/kg bij ernstige ondervoeding
- Landelijke richtlijnen ouderen: 1.0–1.3 g/kg (Table 5.3: o.a. >65 jr 1.0 g/kg IOM; 1.1–1.3 g/kg EFSA)
- **Conclusie PKN:** "balanced diet AND regular physical activity should be adopted to support healthy aging"

**Micronutriënten ouderen:**
- Vit D: huid- + nier-synthese ↓ met leeftijd; Ca-absorptie ↓; winter/hoge breedtegraad → supplementatie overwogen
- Ca + vit D + vit K: botgezondheid; vit K ↓ bij ouderen
- B12: atrofische gastritis, PPI, metformine → malabsorptie; foliumfortificatie zonder B12 = risico
- n-3 PUFA + antioxidanten: anti-inflammatoir

**Dieetadvies PKN:**
- Nutrient-dense: groente/fruit/peulvruchten/volkoren + matig dierlijk (eiwit, B12, zink, ijzer, Ca)
- Vit D supplement in winter / bij lage zon

### Hoofdstuk 6 — Nutrition for Sport and Physical Activity (Burke & Manore)

**Kernboodschappen:**
- Actieve individuen: hogere behoefte koolhydraten + eiwit vs sedentair
- **Energy availability** = (totale inname − trainingskosten) / kg FFM; <30 kcal/kg FFM → metabole suppressie (RED-S)
- Krachttraining + eiwit = synergistisch voor spieradaptatie

**Eiwit sport (Table 6.3 / sectie V):**
- Post-exercise: 0.3–0.4 g/kg BW (~20–30 g) hoogwaardig eiwit, binnen recovery
- Spreiding: elke 3–5 uur over de dag; strategisch post-training + pre-sleep
- **Totaal dagelijks bij zware training: 1.2–1.6 g/kg/d** (vs ~0.8 g/kg algemene populatie)
- Bij gerichte vetverlies + LBM-behoud: **1.6–2.4 g/kg/d**
- Koolhydraten: brandstof + glycogeen; eiwit ≠ energievervanger

**Recovery:**
- Rehydration 125–150% vochtdeficit; Na+ vervanging
- Eiwit + koolhydraat post-exercise voor glycogen + MPS

**Relevantie voor recreatieve 40+ man (niet elite):**
- PKN benadrukt dat sportvoeding-strategieën voor marathon/Ironman-niveau NIET nodig zijn voor iemand die net begint met fitness
- Maar krachttraining + adequate eiwit blijft evidence-based countermeasure voor sarcopenie (PKN ch.5 ↔ ch.6 kruislink)

---

## Te beoordelen plan — Fase 1 (Fundament)

### 0. Compliance-guardrails (leidend)
- G0.1 Inname-register; nooit "tekort"
- G0.2 `statementHasForbiddenPhrase` verbreden naar alle nieuwe copy
- G0.3 Granulaire art. 9-consent per datapunt (body metrics + health flags)
- G0.4 MDR-grens: middelomtrek/BMI = leefstijl-aandachtspunt, geen risicoscore
- G0.5 EFSA alleen bij supplement-brug

### A. Datamodel
- `body_metrics jsonb` (weightKg, heightCm, waistCm) + `health_flags jsonb` (dietPattern, smokes, medsAffectingNutrients, takesSupplements) op `intake_sessions`

### B. Nieuwe stap "Lichaam & risico"
- Vóór consent, alle velden overslaanbaar
- 3 numerieke velden + 4 flags
- ProteinTargetCard hergebruikt weightKg

### C. Vraag-splitsing
- NRG_DEP → NRG_CAF + NUT_SUGAR
- LIF_SUN → alleen zon; supplement → health_flags
- SLP_DUR toevoegen (slaapduur)

### D. Scoring
- STR_RCV uit recovery_score
- energy_score met NRG_CAF
- cortisolRisk → stressLoadPattern
- RULES_VERSION 1.1.0

### E. Zink-trigger
- Loskoppelen van recovery/nutrition-score; alleen bij voedings-band below

### F. Meetpunten
- intake.completed payload + GA4/Clarity op bodyrisk-stap

### G. Tests + build

**Scope NIET in Fase 1:** FFQ-uitbreiding (Fase 2), cardiometabool risicoblok (Fase 3), lab (Fase 4)

---

## Jouw opdracht — review in 8 secties

### 1. Wetenschappelijke fit (PKN ch.5 + ch.6)
Beoordeel per plan-onderdeel (A–G):
- Sluit het aan op PKN-consensus voor mannen 40+?
- Waar wijkt het plan af van PKN — terecht (product/praktisch) of onterecht (wetenschappelijk zwak)?
- Specifiek: zijn de geplande eiwit-drempels in `protein-target.ts` (1.2–1.8 g/kg) verdedigbaar t.o.v. PROT-AGE + sport-PKN?
- Ontbreekt er iets uit PKN ch.5/6 dat Fase 1 WEL zou moeten bevatten?

### 2. Vraagontwerp-review (bestaand + gepland)
Beoordeel alle 15 huidige vragen + de geplande splits/toevoegingen:
- Per vraag: behouden / aanpassen / uitbreiden / verwijderen + PKN-onderbouwing
- Is NRG_CAF + NUT_SUGAR voldoende voor bloedsuiker/energie-inzicht?
- Is SLP_DUR voldoende of ontbreken nog slaapvariabelen?
- Zijn health_flags (dieet, roken, medicatie, supplement) voldoende voor B12/zink/magnesium-modulatie per PKN Table 5.1?

### 3. Body-risk stap — wetenschap + compliance
- Mag middelomtrek/BMI in NL/EU als leefstijl-aandachtspunt (niet diagnose)?
- Is "bespreek bij twijfel met je huisarts" voldoende MDR-mitigatie?
- Welke drempels (cm/kg) zijn wetenschappelijk te verdedigen zonder SCORE2-achtige risicocalculatie?
- Is één consent voor gewicht+lengte+middelomtrek + flags proportioneel (AVG)?

### 4. Scoring-integriteit
- Is STR_RCV-dedup correct? Wat moet recovery_score dan wél bevatten?
- Herbenoem cortisolRisk → stressLoadPattern: voldoende?
- Hoe beïnvloeden nieuwe vragen de domeinscores — regressierisico's?

### 5. Nutrient-gap & supplement-logica
- Welke van de 5 huidige nutriënten (protein, omega3, magnesium, vitD, zinc) mogen na Fase 1 überhaupt een "below"-band krijgen?
- Is zink-trigger-fix voldoende?
- Welke supplement-suggesties zijn na Fase 1: algemeen nuttig / mogelijk nuttig / onvoldoende onderbouwd?
- Past dit bij PKN "nutrient-dense diet first, supplement when needed"?

### 6. Compliance-rode vlaggen
Label per geplande output/conclusie:
- ✅ toegestaan
- ⚠️ voorzichtig formuleren (geef veilige copy)
- 🚫 niet toegestaan / verwijderen

Check expliciet: Claimsverordening, AVG art. 9, MDR, forbidden phrases.

### 7. Ontbrekende elementen (PKN-gedreven)
Top 10 vragen/data die Fase 1 nog mist maar volgens PKN ch.5/6 **kritisch** zijn voor mannen 40+.
Top 10 die bewust naar Fase 2/3 mogen.

### 8. Eindoordeel + aanbeveling
Geef:
- **GO / GO MET WIJZIGINGEN / NO-GO** voor start implementatie
- Top 5 wijzigingen aan het plan vóór codering
- Top 5 zaken die in Fase 1 bewust NIET moeten
- Voorgestelde copy-templates (NL) voor: eiwit-inname, middelomtrek-aandachtspunt, vit D-inname, supplement-overweging — allemaal binnen compliance

---

## Output-formaat

Schrijf in het **Nederlands**. Gebruik tabellen waar nuttig. Wees concreet: noem vraag-IDs, bestandsnamen, drempelwaarden. Geen vage adviezen.

Eindig met:

**Implementatie-prioriteit (herzien):**
1. [must-fix vóór codering]
2. ...
3. [nice-to-have]

**Copy-voorbeelden (compliance-safe):**
- [template 1]
- [template 2]
- ...

---

## Bijlagen (referentie — niet herhalen, wel gebruiken)

Projectdocs (indien beschikbaar in repo):
- docs/core/COMPLIANCE.md
- docs/core/DPIA.md
- docs/plan/PLAN_MEASUREMENT_PERSONALIZATION.md
- src/lib/protein-target.ts (huidige g/kg: 1.2–1.4 basis, 1.4–1.6 bij load 3, 1.6–1.8 bij load 4)
- src/data/nutrition/intake-reference.ts (TODO: drempels niet gevalideerd)

PKN PDF: Present Knowledge in Nutrition, Volume 2 (2020 ILSI/Elsevier)
- Chapter 5: Nutrition, Aging, and Requirements in the Elderly
- Chapter 6: Nutrition for Sport and Physical Activity
```
