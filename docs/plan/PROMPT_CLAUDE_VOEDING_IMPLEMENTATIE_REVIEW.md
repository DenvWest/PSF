# PROMPT — Voedingscheck implementatie-review (Claude Code)

> **Layer 2 — Plan.** Eén copy-paste prompt voor Claude Code die de **werkelijke uncommitted code** van de Voedingscheck leest en beoordeelt — niet het plan, maar de diff. Levert een reviewrapport + uitvoerbare Cursor-fixprompts.
>
> **Gebruik:** kopieer het blok hieronder in een verse Claude Code-sessie op branch `main` met de working tree intact. Companion: [`PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md`](PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md) (N0–N6 roadmap + wetenschappelijke diepte — die review is apart).
>
> **Scope-afbakening:** dit rapport gaat over **architectuur, code, UX, compliance-copy en tests**. Wetenschappelijke drempel-validatie (Gezondheidsraad/NEVO) zit in de optimization-review — hier alleen spot-check op compliance-copy.

---

````text
# ROL

Je bent tegelijk vijf reviewers voor PerfectSupplement (perfectsupplement.nl):

1. Senior software architect — modulegrenzen, dependency-richting, extensibility naar N3–N6.
2. Clean-code reviewer — DRY, type-duplicatie, testbaarheid, file size, @/-conventies.
3. Product/UX reviewer — completion-rate, cognitive load, vertrouwen, mobiel (375px).
4. Compliance spot-checker — copy-gate (FORBIDDEN_STATUS_PHRASES), supplement-gate, geen medische claims. GEEN wetenschappelijke diepte — die zit in de optimization-review.
5. Cursor-prompt engineer — levert uitvoerbare fixprompts, geen vage "refactor dit".

Toon: direct, concreet, met regelnummers en functienamen. Geen "overweeg refactoring" zonder plek + reden.

# DOEL & DELIVERABLES

Beoordeel de werkelijke, nog niet-gecommitte implementatie van de Voedingscheck. Schrijf ÉÉN bestand:

- `docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md`

Dat bestand bevat, in deze volgorde:
- 10 review-secties (zie onder)
- Sectie 9 = "Cursor-fixprompts": per blocker/should-fix één volledige, copy-paste Cursor-prompt volgens docs/core/CURSOR_PROMPT_TEMPLATE.md.
- Sectie 10 = "Futuristische architectuur": wat nu al goed neerzetten zodat N3–N6 zonder grote refactor kunnen.
- De vaste eindsecties (blockers / should-fix / bewust laten / architectuur-beslissingen / commit-splitsing / top-5 doen + niet doen).

HARDE REGEL: verander NIETS in `src/`. Je schrijft alleen `docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md`. Geen git commands, geen commit. Alle code die je oplevert staat als instructie IN de Cursor-fixprompts — plak GEEN patches/diffs in het reviewrapport zelf.

# VERPLICHTE WERKWIJZE — DIFF-FIRST, NIET SAMENVATTING

Voordat je één oordeel schrijft, LEES je de echte code. Draai eerst:

    git status --short
    git diff --stat
    git diff                                    # alle modified files
    git ls-files --others --exclude-standard    # alle untracked files

Open daarna elk bestand uit de lijst hieronder (modified via git diff, untracked via Read). Per bestand noem je minimaal: exports, imports, coupling (wie hangt aan wie), edge cases, en test-dekking (welke test raakt dit, of geen).

Je MOET concrete regelnummers en functienamen citeren. "Zie NutritionCapture" is onvoldoende — "NutritionCapture.tsx:412 handleAllergyToggle synct niet terug naar oilyFishPerWeek" is de norm.

# VOLLEDIGE BESTANDSLIJST (working tree — ~43 implementatie-bestanden, gegroepeerd per laag)

Dit is de reële uncommitted set. Sla de meta-docs over (PROMPT_CLAUDE_*.md, LEEFSTIJLCHECK_SCOPE_REVIEW.md — dat is de prompt/review-laag zelf).

## Orchestratie (API + response-builder)
- src/lib/nutrition-log-response.ts                              (untracked, ~72 r)
- src/app/api/intake/nutrition-log/route.ts                      (modified, ~37 r diff)
- src/app/api/intake/nutrition-log/latest/route.ts               (untracked — NIEUW endpoint)

## Engine (schatting, advies, labels, seizoen, extras)
- src/lib/nutrition-intake-estimate.ts                           (modified)
- src/lib/nutrition-advice.ts                                    (modified)
- src/lib/nutrition-advice-personalization.ts                    (untracked)
- src/lib/nutrition-estimate-labels.ts                           (untracked)
- src/lib/nutrition-season.ts                                    (untracked)
- src/lib/nutrition-lifestyle-extras.ts                          (untracked)

## Intake-flow
- src/lib/nutrition-diet-skip.ts                                 (untracked, ~350 r)
- src/components/intake/NutritionCapture.tsx                     (modified, ~1085 r totaal — grootste bestand)

## Resultaat / UX / return-flow
- src/components/intake/NutritionResultView.tsx                  (modified, ~363 r)
- src/components/intake/NutritionResultsReturnLink.tsx           (untracked)
- src/components/intake/NutritionResultsReturnBanner.tsx         (untracked)
- src/lib/nutrition-return-link.ts                               (untracked)
- src/components/dashboard/DomainDeepTool.tsx                    (modified, ~222 r diff)
- src/components/dashboard/Dashboard.tsx                         (modified, ~55 r diff)

## Evidence (data + UI-componenten + onderbouwingspagina)
- src/data/nutrition/nutrition-question-evidence.ts             (untracked)
- src/data/nutrition/nutrient-evidence-map.ts                    (untracked)
- src/components/evidence/EvidenceQuestionCard.tsx               (untracked)
- src/components/evidence/EvidenceReferenceList.tsx              (untracked)
- src/components/evidence/EvidenceStars.tsx                      (untracked)
- src/components/evidence/NutritionEvidenceDisclosure.tsx        (untracked)
- src/app/onderbouwing/voeding/page.tsx                          (untracked — NIEUWE route)
- src/app/onderbouwing/page.tsx                                  (modified)

## Data (vragen, referentie, porties, lifestyle-extras)
- src/data/nutrition/lifescore-questions.ts                      (modified, ~244 r diff)
- src/data/nutrition/intake-reference.ts                         (modified)
- src/data/nutrition/portion-dictionary.ts                       (untracked)
- src/data/nutrition/nutrition-lifestyle-extras.ts               (untracked)
- src/data/lifestyle-plans/nutrition.ts                          (modified)

## Meetpunten
- src/lib/ga4.ts                                                 (modified, ~6 r diff)

## Overige UX-raakvlakken
- src/app/voeding-na-40/page.tsx                                 (modified)

## Tests (3 gewijzigd + 7 nieuw = 10)
Gewijzigd:
- src/app/api/intake/__tests__/nutrition-log-route.test.ts
- src/lib/__tests__/nutrition-advice.test.ts
- src/lib/__tests__/nutrition-intake-estimate.test.ts
Nieuw:
- src/lib/__tests__/nutrition-advice-personalization.test.ts
- src/lib/__tests__/nutrition-diet-skip.test.ts
- src/lib/__tests__/nutrition-estimate-labels.test.ts
- src/lib/__tests__/nutrition-flow.test.ts
- src/lib/__tests__/nutrition-lifestyle-extras.test.ts
- src/lib/__tests__/nutrition-question-evidence.test.ts
- src/lib/__tests__/nutrition-return-link.test.ts

## Doc (bijlage, geen code)
- docs/research/NUTRITION_CHECK_CALIBRATION.md                   (modified)

NB: src/types/nutrition.ts BESTAAT (nog) NIET — dat is bewust een open architectuur-vraag in sectie 10, niet een claim dat het er is.

# DE 10 REVIEW-SECTIES

## 1. Diff-samenvatting
Wat is gebouwd t.o.v. de N0/N1/N2 roadmap in PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md (N0 porties+flow, N1 evidence-UX, N2 allergie/voorkeur-advies)? Wat is scope creep (bijv. latest-endpoint, dashboard-koppeling, return-banner)? Geef een 1-alinea kaart per laag.

## 2. Architectuur & modulegrenzen
Teken het pipeline-diagram (antwoorden → estimate → labels → advice → personalization → response → UI). Is er een orchestrator-patroon of leidt route.ts alles zelf? Klopt de dependency-richting (data → lib → components, nooit andersom)? Is er ÉÉN source of truth voor dieet-context, of ligt fish-free/allergie-logica verspreid over nutrition-diet-skip / nutrition-advice-personalization / nutrition-lifestyle-extras?

## 3. Codekwaliteit
DRY, type-duplicatie (welke shape wordt 3× opnieuw gedeclareerd?), file size (NutritionCapture ~1085 r, nutrition-diet-skip ~350 r — te groot?), naming-consistentie, @/-import-conventie overal gehandhaafd?

## 4. Logica & edge cases
Concreet, met regelnummers:
- Oily-fish slider: wordt `oilyFishPerWeek` hergebruikt voor meerdere signalen? Semantisch correct?
- Skip/sync bij allergie-toggle: als iemand vis-allergie aanzet ná het invullen van de vis-slider — wordt de waarde ge-reset of blijft die spoken?
- Vit-D seizoen: runtime-seizoen consistent tussen intake-reference, estimate en resultaat?
- estimate-band vs label vs advice: kunnen die drie uit elkaar lopen (band zegt "laag", label zegt "oké", advies zegt niks)?
- B12 zonder eigen vraag: wordt B12 geadviseerd terwijl er geen vraag naar is? Waar komt dat signaal vandaan?

## 5. UX & bezoekerstevredenheid
Completion-rate-risico's (hoeveel stappen, hoeveel sliders?), cognitive load, progressive disclosure (evidence pas op verzoek?), return-flow via `?from=voeding` / `?from=dashboard` (raakt de bezoeker de juiste plek terug?), mobiel 375px.

## 6. Compliance spot-check
Alleen copy-gate — geen wetenschap. Check: FORBIDDEN_STATUS_PHRASES (docs/core/COMPLIANCE.md), supplement-gate (mag je hier naar /beste/* linken?), achtergebleven portie-TODO's, en of B12 geadviseerd wordt zónder onderbouwing/gate. Geen diagnose-taal.

## 7. Tests & kwaliteitsgat
Wat dekken de 10 testfiles echt (per file 1 zin)? Wat ontbreekt: GET `/nutrition-log/latest`, component-render (NutritionCapture, EvidenceDisclosure), E2E roundtrip (intake → log → latest → dashboard), sync-edge uit sectie 4?

## 8. Meetpunten
GA4 (ga4.ts diff) vs domain_events vs Clarity — welke laag is gekozen en klopt dat? Consent-bias (meet je alleen consented users?)? Ontbrekende events op nieuwe CTA's/vertakkingen (evidence-disclosure open, return-banner klik, allergie-toggle)? Nieuw client-event vereist registratie op 3 plekken — is dat gebeurd?

## 9. Cursor-fixprompts
Zie format hieronder. Eén volledige prompt per blocker + top should-fixs.

## 10. Futuristische architectuur
Zie checklist + beslissingstabel hieronder.

# 12 FUTURISTISCHE DIEPTE-VRAGEN (verplicht beantwoorden in sectie 10)

1. NutritionSelfReport / slider-ID's — kan `oilyFishPerWeek` semantisch hernoemd worden naar `omega3SourcesPerWeek` zonder breaking change (opgeslagen answers, response-contract)? Of is een apart signaalveld voor N2+ beter?
2. Gedeeld type-module — waar horen NutritionPreference, DietContext, NutritionAnswers? Rechtvaardigt dit `src/types/nutrition.ts` zodat N3–N6 niet verder fragmenteren?
3. Dieet-context SSOT — is één `resolveNutritionContext(preference, allergies)` haalbaar i.p.v. drie modules met eigen fish-free-logica? Wat breekt daarbij?
4. Evidence-registry — schaalt nutrition-question-evidence + nutrient-evidence-map naar 12 vragen + een 6e nutriënt zonder UI-refactor? Is de mapping data-driven of hardcoded?
5. buildNutritionLogResponse — uitbreidbaar met tier-2 macro (BMR/TDEE, zie PLAN_MEASUREMENT_PERSONALIZATION A3–A4) zonder API-contract break? Versioned response?
6. ESTIMATE_VERSION — bestaat een bump-strategie bij drempelwijziging (N3)? Blijft delta-vergelijkbaarheid tussen oude en nieuwe schattingen behouden?
7. Portion-dictionary — is het pad naar NEVO/Voedingscentrum-validatie open? Zijn copy, thresholds en evidence gescheiden of door elkaar?
8. Leeftijdsbanden (N4, 35–39) — kan de engine een leeftijdsband-parameter accepteren zonder elke functie-signature te breken?
9. Tier-2 AVG art. 9 (N5) — is er een naad om gezondheidsdata-input (gewicht/lengte) achter expliciete consent te zetten zonder de huidige flow te herbouwen?
10. Extra nutriënt (N6, vezels/B12) — hoeveel plekken moet je aanraken om één nutriënt toe te voegen (data, estimate, label, advice, evidence, UI)? Noem het aantal.
11. Feature flags / staged rollout — is de breadth-sectie / evidence-disclosure klaar voor A/B of een YouTube-funnel fase B, of zit alles hard aan?
12. Return-link SSOT — is `nutrition-return-link.ts` het enige punt dat `?from=` bepaalt, of wordt de herkomst op meerdere plekken opnieuw geraden?

# SECTIE 9 — CURSOR-FIXPROMPTS (format)

Elke prompt volgt EXACT het skelet uit docs/core/CURSOR_PROMPT_TEMPLATE.md:

    ## Rol
    ## Context   (docs + exacte bestandspaden)
    ## Taak      (production-ready, geen placeholders)
    ## Constraints  (@/-imports, NL UI / EN code, do-not-touch lijst, geen commit)
    ## Acceptatiecriterium  (checkbox-lijst, meetbaar)
    ## Verificatie  (grep console.log + npm run build / vitest)

Genereer alleen prompts waar de diff het rechtvaardigt. Minimaal deze kandidaten (skip of voeg toe naar bevinding):

| ID     | Trigger                          | Waarschijnlijke scope                                   |
|--------|----------------------------------|---------------------------------------------------------|
| FIX-01 | Dieet-context drift              | Consolidatie fish-free + NutritionPreference type       |
| FIX-02 | Omega-3 semantische mismatch     | Signaalveld of rename-strategie estimate vs UI          |
| FIX-03 | GET latest productie-gereed      | Rate limit, test, geen console.error                    |
| FIX-04 | Return-link dashboard-context    | NUTRITION_RESULTS_HREF behoudt `?from=`                 |
| FIX-05 | Vit-D season inconsistentie      | Runtime season in intake-reference/resultaat            |
| FIX-06 | NutritionCapture extract         | Step-machine naar hook/subcomponents                    |
| FIX-07 | Evidence fruit/berries gap       | Entries + mapping OF bewuste uitsluiting documenteren   |
| FIX-08 | Domain events evidence           | Registratie op 3 plekken als funnel-analyse nodig       |

Label per prompt: **vóór commit** / **follow-up PR** / **wacht op velddata**.

# SECTIE 10 — FUTURISTISCHE ARCHITECTUUR (checklist + tabel)

Beoordeel expliciet hoe de huidige code de geplande fases draagt:

    flowchart LR
      subgraph now [Nu commit-ready]
        N0[Porties + flow P1]
        N1[Evidence UX]
        N2[Allergie/voorkeur advies]
      end
      subgraph later [Later zonder refactor]
        N3[Drempel-validatie Gezondheidsraad]
        N4[Leeftijdsbanden 35-39]
        N5[Tier-2 BMR/TDEE AVG art.9]
        N6[Vezels B12 extra nutrient]
      end
      N0 --> N3
      N1 --> N6
      N2 --> N3
      N3 --> N5
      N4 --> N5

Sluit sectie 10 af met de tabel "Architectuur-beslissingen nu vastleggen":

| Beslissing | Nu doen | Uitstellen tot | Risico als je het niet doet |
|---|---|---|---|

# BIJLAGEN (lezen vóór je oordeelt)
- docs/core/COMPLIANCE.md
- docs/core/CURSOR_PROMPT_TEMPLATE.md
- docs/research/NUTRITION_CHECK_CALIBRATION.md
- docs/plan/PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md (N0–N6 roadmap)
- Working tree: git diff + untracked files (jij leest de bron, geen samenvatting)

# EINDSECTIES VAN HET RAPPORT (verplicht, in deze volgorde)
1. Blockers vóór commit — max 5, elk met FIX-xx prompt-ID.
2. Should-fix in deze PR — max 5.
3. Bewust laten zitten — max 5, met reden.
4. Futuristische architectuur-beslissingen — de tabel uit sectie 10.
5. Commit-splitsing — advies: 1 PR of 2–3 (core engine / evidence UX / dashboard). Onderbouw.
6. Top-5 acties deze maand + Top-5 NIET doen.

# CONSTRAINTS
- Verander NIETS in src/. Enige output: docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md.
- Geen code/patches in het reviewrapport — code hoort alleen als instructie in de Cursor-fixprompts.
- Concrete regelnummers + functienamen, geen vage aanbevelingen.
- Geen git commands, geen commit. Stop na het schrijven van het rapport zodat Dennis kan reviewen.
- Compliance-sectie = copy-gate only; wetenschappelijke diepte hoort in de optimization-review, niet hier.

# VERIFICATIE (vóór je stopt)
1. Heb je elk bestand uit de lijst echt geopend (git diff / Read)? 
2. Bevat elke bevinding een bestand:regel-verwijzing?
3. Heeft elke blocker een bijbehorende, copy-paste-klare Cursor-fixprompt in sectie 9?
4. Zijn de 12 futuristische diepte-vragen elk beantwoord in sectie 10?
5. Staan alle 6 eindsecties er, met de max-aantallen gerespecteerd?
````

---

## Workflow na de review

```text
Claude leest diff + schrijft VOEDING_IMPLEMENTATIE_REVIEW.md
        │
        ▼
   Blockers?
    ├─ Ja → plak FIX-xx Cursor-prompts in Cursor → klaar-check → commit
    └─ Nee → klaar-check → commit
        │
        ▼
  (optioneel) N3 product/wetenschap-review apart via PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md
```

*Laatst bijgewerkt: 11 juli 2026.*
