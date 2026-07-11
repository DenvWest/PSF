# Voedingscheck — implementatie-review

> **Reviewer:** Claude Code (architect · clean-code · UX · compliance-copy · Cursor-prompt engineer).
> **Scope:** architectuur, code, UX, compliance-copy, tests van de Voedingscheck-implementatie. Wetenschappelijke drempel-/portie-validatie zit in de aparte optimization-review ([`PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md`](../plan/PROMPT_CLAUDE_VOEDING_OPTIMIZATION.md)).
> **Datum:** 11 juli 2026.
> **Diff-basis:** de implementatie is tijdens deze review gecommit in **`4481b97` — "Voedingscheck: allergie-flow, kompas-sync, result-return en premium CTA's."** De working tree is nu schoon. De blockers hieronder zijn dus **fix-forward** (volgende PR), niet meer "vóór commit". Reproduceer de diff met `git show 4481b97`.

---

## 0. Wat ik gelezen heb

Volledig gelezen: `nutrition-log-response.ts`, `nutrition-log/route.ts` (POST), `nutrition-log/latest/route.ts` (GET), `nutrition-advice.ts`, `nutrition-advice-personalization.ts`, `nutrition-estimate-labels.ts`, `nutrition-season.ts`, `nutrition-return-link.ts`, `nutrition-diet-skip.ts`, `nutrition-lifestyle-extras.ts`, `portion-dictionary.ts`, `intake-reference.ts`, `nutrition-question-evidence.ts`, `nutrient-evidence-map.ts`, `NutritionCapture.tsx` (1100 r), `NutritionResultView.tsx` (363 r), `NutritionResultsReturnLink/Banner.tsx`, `NutritionEvidenceDisclosure.tsx`, plus alle 10 testtitels, de GA4-eventtabel en de structurele exports van `lifescore-questions.ts`. `ga4.ts`, `nutrition-intake-estimate.ts` en `DomainDeepTool.tsx` bleken al in een eerdere commit geland (schoon t.o.v. HEAD).

---

## 1. Diff-samenvatting (t.o.v. N0/N1/N2)

Alle drie de roadmap-fases zijn in één commit geland — verder dan de optimization-prompt oorspronkelijk aannam:

- **N0 porties** — `portion-dictionary.ts` levert `PORTION_DEFINITIONS`, `PORTION_GRAMS` en `buildLifestyleAction()`; elke `lifestyleAction` in `intake-reference.ts` komt nu uit die builder (mét gram-equivalenten). Vit-D krijgt een runtime-seizoensvariant via `nutrition-season.ts`.
- **N1 evidence** — `nutrition-question-evidence.ts` (10 entries), `nutrient-evidence-map.ts` (gap/extra → vraag), `components/evidence/*`, publieke `/onderbouwing/voeding`, en een optionele `NutritionEvidenceDisclosure` op het resultaat.
- **N2 allergie/voorkeur** — `personalizeLifestyleText()` draait nu ín `buildNutritionAdvice`; `nutrition-diet-skip.ts` regelt skip/opt-out/copy; `nutrition-lifestyle-extras.ts` levert leefstijl-only extras (vezel, suiker, B12).

**Scope-creep t.o.v. N0–N2 (grotendeels terecht, maar ongepland):** een tweede API-endpoint `GET /nutrition-log/latest` + herlaad-flow, een `nutsSeedsLegumes`-vraag als extra magnesium-proxy, delta-vergelijking met de vorige log, dashboard-return + kompas-origin, en een return-banner op `/onderbouwing/voeding`. Dit is functioneel waardevol maar vergroot het oppervlak van één commit fors (zie §10 commit-splitsing).

---

## 2. Architectuur & modulegrenzen

**Pipeline (kloppend, duidelijke richting):**
`sliders/allergies/preference` → `nutritionReportFromAnswers` → `estimateNutritionIntake` → `withContextualEstimateLabels` → `buildNutritionAdvice` (+ `personalizeLifestyleText`) → `buildNutritionLifestyleExtras` → `buildNutritionLogResponse` → UI. De dependency-richting data → lib → components is netjes; `intake-reference.ts` blijft de enige referentietabel en wordt niet in de engine gehardcode.

**Orchestrator:** `buildNutritionLogResponse` ([nutrition-log-response.ts:35](../../src/lib/nutrition-log-response.ts#L35)) is de juiste centrale orchestrator — beide routes hangen eraan. Goed.

**Zwakke plek — géén single source of truth voor dieet-context.** De "wat telt als fish-free / dairy-free / welke allergie-strings" leeft op drie plekken met drie signatures:
- [nutrition-advice-personalization.ts:33](../../src/lib/nutrition-advice-personalization.ts#L33) `isFishFree(ctx)` + `isDairyFree(ctx)`
- [nutrition-estimate-labels.ts:5](../../src/lib/nutrition-estimate-labels.ts#L5) `isFishFreeNutritionContext(preference, allergies)`
- [nutrition-diet-skip.ts:34](../../src/lib/nutrition-diet-skip.ts#L34) `hasFishAllergy` + [:23](../../src/lib/nutrition-diet-skip.ts#L23) `isPlantBasedOmega3Context`

De allergie-sleutels (`"vis"`, `"zeevruchten"`, `"melk"`, `"lactose"`, `"noten"`, `"eieren"`, `"tarwe"`) staan als kale strings in elk van die bestanden. Eén hernoeming = stille drift. → **FIX-01.**

**`step` vs `flowStep`.** [NutritionCapture.tsx:261-264](../../src/components/intake/NutritionCapture.tsx#L261-L264) leidt tijdens render een `flowStep` af (via `redirectIfCurrentStepSkipped`) zonder `setStep`. Alle navigatie werkt op `flowStep`, de state heet `step`. Werkt, maar twee bronnen van waarheid voor "waar ben ik" is fragiel. → context voor **FIX-06.**

---

## 3. Codekwaliteit

- **Type-duplicatie.** `NutritionPreference` staat identiek in [nutrition-log-response.ts:16](../../src/lib/nutrition-log-response.ts#L16) én [nutrition-advice-personalization.ts:4](../../src/lib/nutrition-advice-personalization.ts#L4). De context-shape `{preference, allergies}` bestaat als `NutritionAdviceContext`, `DietContext` én inline params. → **FIX-01** (gedeeld type).
- **File size.** [NutritionCapture.tsx](../../src/components/intake/NutritionCapture.tsx) = 1100 r, één component, ~8 verantwoordelijkheden. `renderQuestionBody`/`showOptOut` staan ná de `return` ([:975](../../src/components/intake/NutritionCapture.tsx#L975)/[:994](../../src/components/intake/NutritionCapture.tsx#L994)) — hoisted, dus geldig, maar leesbaarheid lijdt. → **FIX-06.**
- **Theming-inconsistentie.** [NutritionResultView.tsx](../../src/components/intake/NutritionResultView.tsx) gebruikt rauwe hex (`text-[#1c1917]`, `bg-[#faf9f7]`) terwijl `NutritionCapture` de `intake-*`-tokens gebruikt (`text-intake-ink`). Bemoeilijkt dark-mode/rebrand. Nice-to-have.
- **`@/`-conventie** overal gerespecteerd. Geen `any` gezien. Semantische HTML (`<section>`, `<nav>`, `<details>`) netjes toegepast.

---

## 4. Logica & edge cases

**a) `syncDietContext` herstelt geskipte core-sliders niet — echte bug.**
[nutrition-diet-skip.ts:226-239](../../src/lib/nutrition-diet-skip.ts#L226-L239): een geskipte slider wordt op 0 gezet met `optOut=false` ([:228-229](../../src/lib/nutrition-diet-skip.ts#L228)). Vervalt de dieet-conditie, dan draait de else-tak die alléén reset wanneer het een opt-out was (`nextOptOut[id] && …`, [:234](../../src/lib/nutrition-diet-skip.ts#L234)). Voor een geskipte slider is `optOut` false → **geen reset → blijft op 0**. De breadth-tak doet het wél goed via een `=== 0`-reset ([:243-244](../../src/lib/nutrition-diet-skip.ts#L243-L244)) — asymmetrie.
- **Reproductie:** kies veganist (dairy → 0), wissel dan naar vegetariër. `dairy` blijft op 0 i.p.v. terug naar zijn default (`dairy.defaultIndex` is niet 0). De gebruiker ziet de zuivelvraag straks op "Nooit".
- **De bestaande test maskeert dit.** [nutrition-diet-skip.test.ts:93-107](../../src/lib/__tests__/nutrition-diet-skip.test.ts#L93-L107) "sync reset bij deselect allergie" test alléén `oilyFish`, en `oilyFish.defaultIndex === 0` (bevestigd door nutrition-flow.test.ts:52). De assertie `toBe(0)` slaagt of de reset nu draait of niet — vals vertrouwen. → **FIX (should-fix), + betere test met een niet-nul default.**

**b) Return-`from` is overladen (zie ook §5/FIX-04).** `from=dashboard` (origin, gelezen in [NutritionCapture.tsx:230](../../src/components/intake/NutritionCapture.tsx#L230)) en `from=voeding` (kom-terug-marker, gezet in [nutrition-return-link.ts:13](../../src/lib/nutrition-return-link.ts#L13)) delen dezelfde query-param → ze wissen elkaar.

**c) Dubbele + uiteenlopende estimate-berekening.** [route.ts:198](../../src/app/api/intake/nutrition-log/route.ts#L198) berekent `estimate` **zonder** contextlabels en slaat die op ([:218](../../src/app/api/intake/nutrition-log/route.ts#L218)); [:200](../../src/app/api/intake/nutrition-log/route.ts#L200) `buildNutritionLogResponse` berekent estimate **opnieuw mét** `withContextualEstimateLabels` voor de respons. Opgeslagen ≠ teruggegeven (omega-3 `referenceLabel` verschilt in fish-free context). `nutritionReportFromAnswers`/`computeNutritionScore` draaien 2× (route [:137-138](../../src/app/api/intake/nutrition-log/route.ts#L137) + response [:40-41](../../src/lib/nutrition-log-response.ts#L40)). Functioneel loopt delta op `band` (niet label), dus het valt nu niet om, maar het is latente drift + dubbel werk. → should-fix.

**d) Vit-D seizoen — consistent.** `seasonFromDate` ([nutrition-season.ts:9](../../src/lib/nutrition-season.ts#L9)) draait op okt–mrt=winter; `getNutrientLifestyleAction` ([nutrition-advice.ts:37](../../src/lib/nutrition-advice.ts#L37)) gebruikt het op adviesdatum. De opgeslagen `intake-reference` default is `"summer"` (statische fallback), maar het advies wordt runtime herberekend — geen zichtbare mismatch. OK.

**e) B12 zonder eigen engine-vraag — correct afgehandeld.** B12 is geen engine-nutriënt maar een leefstijl-only extra (`preference === "vegan"`, [nutrition-lifestyle-extras.ts:55](../../src/lib/nutrition-lifestyle-extras.ts#L55)), priority 0, zonder supplement-gate/`/beste/*`. Compliance-veilig.

---

## 5. UX & bezoekerstevredenheid

- **Completion.** Progressive disclosure is goed: evidence zit achter `<details>` op het resultaat/`/onderbouwing` — **niet** inline tijdens de vragen (bevestigd: `NutritionEvidenceDisclosure` wordt alleen in `NutritionResultView` gebruikt, niet in `NutritionCapture`). De breadth-sectie is expliciet overslaanbaar ([NutritionCapture.tsx:790-847](../../src/components/intake/NutritionCapture.tsx#L790-L847)). Dieet-skip verkort de flow voor allergici. Goede keuzes voor completion.
- **Return-flow — kapot voor de dashboard-herkomst (blocker-klasse).** Pad `dashboard → resultaat → "Wetenschappelijke onderbouwing" → "Terug"`:
  1. Resultaat-link gebruikt `withNutritionReturn("/onderbouwing/voeding")` → zet `from=voeding` en **overschrijft** `from=dashboard` ([NutritionResultView.tsx:353](../../src/components/intake/NutritionResultView.tsx#L353)).
  2. Op `/onderbouwing/voeding` toont `NutritionResultsReturnLink` een terug-link naar de **statische** `NUTRITION_RESULTS_HREF = "/intake/voeding?resultaten=true"` ([nutrition-return-link.ts:27](../../src/lib/nutrition-return-link.ts#L27)) — zonder `from`.
  3. Terug op het resultaat is `fromDashboard=false` → de UI toont "Sluiten"/home i.p.v. "Terug naar dashboard" ([NutritionResultView.tsx:323-338](../../src/components/intake/NutritionResultView.tsx#L323-L338)). De dashboard-context is verdampt. → **FIX-04.**
- **Mobiel.** `min-h-[44px]` touch targets, `max-w-lg`, gecentreerde layout — 375px oogt in orde.
- **Cognitive load.** Focus-nutriënt + "Jouw stappen (n)" + "Supplementen, indien gewenst" + delta zijn allemaal collapsible — nette hiërarchie, eiwit krijgt terecht de hero-focus ([NutritionResultView.tsx:55-57](../../src/components/intake/NutritionResultView.tsx#L55)).

---

## 6. Compliance spot-check (copy-gate)

- **Supplement-gate intact.** `nutritionSupplementGate` ([nutrition-advice.ts:67-87](../../src/lib/nutrition-advice.ts#L67)) hergebruikt de vier-stappen EFSA-keten; personalisatie raakt alleen de leefstijl-tekst (priority 1), niet de gate. De sort borgt leefstijl vóór supplement ([:136](../../src/lib/nutrition-advice.ts#L136)). Getest in personalization.test.ts:90 "supplement-gate ongewijzigd".
- **Status-taal.** Er zijn compliance-tests die `FORBIDDEN_STATUS_PHRASES` over álle gegenereerde varianten greppen: personalization (:106), lifestyle-extras (:75), evidence (:77). Sterk. De disclaimers ([nutrition-question-evidence.ts:38-42](../../src/data/nutrition/nutrition-question-evidence.ts#L38)) benoemen expliciet "geen medische uitspraak, geen bloedwaarde". "Vuistregel" i.p.v. "richtlijn" is consistent doorgevoerd (portion-dictionary copy).
- **Let op (naar optimization-review):** de gram-/mg-getallen in `portion-dictionary.ts` staan als "indicatief/TODO verify". Copy-gate is OK; de *cijferjuistheid* is een wetenschap-vraag, niet deze review.

---

## 7. Tests & kwaliteitsgat

**Sterk gedekt (unit):** diet-skip (30+ cases incl. skip/opt-out/preference-disable/copy), personalisatie + compliance, lifestyle-extras + volgorde + compliance, evidence-coverage (10 entries, alle 5 nutriënten, alle extras) + compliance, estimate-labels, flow-volgorde, return-link.

**Gaten:**
1. **`GET /nutrition-log/latest` heeft geen enkele test** — het nieuwe endpoint (parsing, 401/404/500, delta uit 2 rijen) is onbewaakt. → **FIX-03** bundelt test + rate-limit.
2. **Geen component/RTL-tests** — `syncDietContext`-koppeling in `NutritionCapture`, `toggleAllergy`, de evidence-toggle-event, ResultView-rendering: niets. De bug in §4a leeft precies in het onbeteste gebied tussen lib en component.
3. **Geen E2E roundtrip** POST → `latest` → dashboard-return.
4. **Return-link-test dekt het dashboard-verlies niet** (alleen `from=voeding`, [nutrition-return-link.test.ts](../../src/lib/__tests__/nutrition-return-link.test.ts)).
5. **Trivially-passing test** (§4a): sync-reset-test kan de bug niet zien door `oilyFish.defaultIndex === 0`.

---

## 8. Meetpunten

- **Gedekt (GA4 + Clarity):** `nutrition_evidence_expanded` (op `<details>` open, [NutritionEvidenceDisclosure.tsx:41](../../src/components/evidence/NutritionEvidenceDisclosure.tsx#L41)), `nutrition_diet_skipped`, `nutrition_slider_opt_out`, `nutrition_breadth_skipped`, `nutrition_result_reopen_click`, `nutrition_onderbouwing_return_click`, plus stringlit-events `nutrition_supplement_revealed`, `nutrition_lifestyle_extra_shown`, `nutrition_result_dashboard_return`, `nutrition_check/log_completed`, `nutrition_youtube_landing`.
- **Inconsistentie:** helft via `GA4_EVENTS.*` ([ga4.ts:19-24](../../src/lib/ga4.ts#L19)), helft als losse string-literals (o.a. [NutritionResultView.tsx:80/102/126](../../src/components/intake/NutritionResultView.tsx#L80)). → consolideer in `GA4_EVENTS`.
- **Durable laag alleen op POST.** `domain_events` vuurt enkel `measurement.checkin_completed` + `measurement.gap_detected` ([route.ts:233-255](../../src/app/api/intake/nutrition-log/route.ts#L233)). Evidence-expand en return-clicks zitten niet in de durable/PostHog-laag → funnel-analyse van "wie klikt onderbouwing door" kan alleen via GA4. Bewuste keuze; alleen upgraden als je die funnel echt wilt sturen → **FIX-08 (optioneel).**
- **Consent-bias:** de consent-checkbox geldt voor DB-opslag; GA4/Clarity-skip/evidence-events vuren daarvóór. Geen PII in de payloads (scores/ids), dus AVG-OK, maar de evidence-engagement is niet gekoppeld aan opgeslagen sessies.

---

## 9. Cursor-fixprompts

> Elke prompt volgt het skelet uit [`CURSOR_PROMPT_TEMPLATE.md`](../core/CURSOR_PROMPT_TEMPLATE.md). Label per prompt: **[fix-forward — volgende PR]** tenzij anders vermeld. Geen patches — instructies.

### FIX-04 — Return-link behoudt dashboard-context · **[fix-forward, hoogste prio]**

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md §5
- src/lib/nutrition-return-link.ts
- src/components/intake/NutritionResultView.tsx (regel 131, 353)
- src/components/intake/NutritionResultsReturnLink.tsx
- src/components/intake/NutritionCapture.tsx (regel 230 — leest from=dashboard)
- src/lib/__tests__/nutrition-return-link.test.ts

## Taak
De query-param `from` is overladen: hij codeert zowel de herkomst (`dashboard`) als de
"kom terug naar resultaat"-marker (`voeding`). Daardoor wist de onderbouwing-round-trip de
dashboard-herkomst. Los op zonder de bestaande `from=dashboard`-herkomst te breken:
1. Introduceer een APARTE marker-param voor de terugkeer (bv. `terug=voeding`), zodat `from`
   alleen herkomst blijft. `withNutritionReturn(href)` moet een bestaande `from`-waarde
   ONGEMOEID laten en alleen de terug-marker toevoegen.
2. `NUTRITION_RESULTS_HREF` mag geen statische constante meer zijn: bouw de terug-href zó dat
   een meegegeven herkomst (`from=dashboard`) behouden blijft. `NutritionResultsReturnLink`
   leest die herkomst uit de huidige searchParams en geeft die door aan de resultaat-URL.
3. Resultaat: dashboard → resultaat → onderbouwing → terug landt weer met `from=dashboard`,
   dus met de "Terug naar dashboard"-knop.

## Constraints
- Imports via `@/`; NL UI-strings, EN code.
- Verander NIETS aan de GA4-eventnamen of aan de gate-logica.
- Geen git commands, geen commit. .env.local niet aanraken.

## Acceptatiecriterium
- [ ] `withNutritionReturn` overschrijft een bestaande `from`-param niet.
- [ ] Vanuit `/onderbouwing/voeding?from=dashboard&terug=voeding` wijst de terug-link naar het
      resultaat mét `from=dashboard`.
- [ ] Nieuwe tests: dashboard-herkomst blijft behouden door de hele round-trip.
- [ ] Bestaande return-link-tests groen (aangepast waar de param-naam wijzigt).
- [ ] npm run build groen; geen nieuwe console.log.

## Verificatie
1. grep -rn "console.log" src/
2. npx vitest run src/lib/__tests__/nutrition-return-link.test.ts
3. npm run build
Niet automatisch committen. Stop na aanpassingen zodat ik kan reviewen.
```

### FIX-01 — Dieet-context SSOT + gedeeld type · **[fix-forward]**

```text
## Rol
Je bent senior TypeScript-refactorer voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md §2/§3
- src/lib/nutrition-advice-personalization.ts (isFishFree/isDairyFree, NutritionPreference)
- src/lib/nutrition-estimate-labels.ts (isFishFreeNutritionContext)
- src/lib/nutrition-diet-skip.ts (hasFishAllergy/hasDairyAllergy/… + DietContext)
- src/lib/nutrition-log-response.ts (2e NutritionPreference-declaratie)

## Taak
Er zijn drie implementaties van "fish-free/dairy-free" en de allergie-sleutels staan als kale
strings in drie bestanden. Consolideer zonder gedragswijziging:
1. Nieuw src/types/nutrition.ts met: NutritionPreference, DietContext ({preference, allergies}),
   en een ALLERGY_KEYS-enum/const-union ("vis","zeevruchten","melk","lactose","noten","eieren","tarwe").
2. Eén module met de predicaten: isFishFree(ctx), isDairyFree(ctx), hasAllergy(ctx, ...keys).
   Laat personalization, estimate-labels en diet-skip die hergebruiken i.p.v. eigen kopieën.
3. Verwijder de duplicaat-declaraties van NutritionPreference.

## Constraints
- Puur refactor: identiek gedrag, geen nieuwe features. Imports via `@/`.
- Verander NIETS aan de publieke functiesignatures die routes/components importeren, tenzij je
  de callers meemigreert in dezelfde wijziging.
- Geen git commands, geen commit.

## Acceptatiecriterium
- [ ] Fish-free/dairy-free logica bestaat nog op precies één plek.
- [ ] Allergie-sleutels komen uit één const; nergens meer los ge-typte strings.
- [ ] Alle bestaande nutrition-tests groen, ongewijzigd (of alleen import-paden aangepast).
- [ ] npm run build groen; geen console.log.

## Verificatie
1. grep -rn "console.log" src/
2. npx vitest run src/lib/__tests__/nutrition-diet-skip.test.ts src/lib/__tests__/nutrition-advice-personalization.test.ts src/lib/__tests__/nutrition-estimate-labels.test.ts
3. npm run build
Niet automatisch committen.
```

### FIX-03 — GET /nutrition-log/latest productie-gereed · **[fix-forward]**

```text
## Rol
Je bent Next.js/TypeScript backend-developer voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md §7
- src/app/api/intake/nutrition-log/latest/route.ts (GET, geen rate-limit)
- src/app/api/intake/nutrition-log/route.ts (POST — consumeRateLimitForIp als patroon)
- src/lib/rate-limit.ts, src/lib/rate-limit-config.ts, src/lib/turnstile-verify.ts (getClientIp)
- src/app/api/intake/__tests__/nutrition-log-route.test.ts (teststijl)

## Taak
1. Voeg rate-limiting toe aan de GET, analoog aan de POST (consumeRateLimitForIp met een
   passende bucket; hergebruik bestaande config-key of voeg er één toe). 429 met Retry-After bij
   overschrijding.
2. Schrijf een testbestand voor de GET: 401 zonder geldige sessiecookie, 404 zonder log,
   happy-path met estimate+statements+advice, en delta wanneer er twee logs zijn.

## Constraints
- console.error bij echte DB-fouten mag blijven (consistent met de POST). Geen console.log.
- Imports via `@/`; NL error-strings, EN code. Geen git commands, geen commit.

## Acceptatiecriterium
- [ ] GET rate-limit't per IP; 429 + Retry-After bij te veel calls.
- [ ] Nieuw testbestand dekt 401/404/happy/delta.
- [ ] npm run build groen; geen console.log.

## Verificatie
1. grep -rn "console.log" src/
2. npx vitest run src/app/api/intake
3. npm run build
Niet automatisch committen.
```

### FIX-05 — syncDietContext: geskipte sliders herstellen · **[fix-forward]**

```text
## Rol
Je bent TypeScript-developer voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md §4a
- src/lib/nutrition-diet-skip.ts (syncDietContext, regel 226-248)
- src/lib/__tests__/nutrition-diet-skip.test.ts (regel 93 — de trivially-passing test)

## Taak
Een slider die overgeslagen werd (op 0, optOut=false) keert niet terug naar zijn default als de
dieet-conditie vervalt; alleen opt-outs worden hersteld. Zuivel blijft daardoor op 0 hangen bij
vegan → vegetariër.
1. Laat de core-slider-tak in syncDietContext een niet langer geskipte slider terugzetten naar
   question.defaultIndex wanneer die op de skip-sentinel (0) staat en niet auto-opt-out is —
   consistent met hoe de breadth/wholegrain-tak dat al doet.
2. Herschrijf de test "sync reset bij deselect allergie" zodat die een slider met een
   NIET-nul defaultIndex gebruikt (bv. dairy), zodat de reset écht wordt geverifieerd. Voeg de
   vegan→vegetariër-transitie voor dairy toe.

## Constraints
- Geen gedragswijziging voor het skip-pad zelf, alleen het herstel-pad. Imports via `@/`.
- Geen git commands, geen commit.

## Acceptatiecriterium
- [ ] Vegan (dairy=0) → vegetariër herstelt dairy naar defaultIndex.
- [ ] Nieuwe/aangepaste test faalt op de oude code en slaagt op de nieuwe.
- [ ] Overige diet-skip-tests groen.
- [ ] npm run build groen; geen console.log.

## Verificatie
1. grep -rn "console.log" src/
2. npx vitest run src/lib/__tests__/nutrition-diet-skip.test.ts
3. npm run build
Niet automatisch committen.
```

### FIX-06 — NutritionCapture opsplitsen · **[follow-up PR — niet blokkerend]**

```text
## Rol
Je bent React/Next.js-architect voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/research/VOEDING_IMPLEMENTATIE_REVIEW.md §2/§3
- src/components/intake/NutritionCapture.tsx (1100 r)

## Taak
Extraheer zonder gedragswijziging:
1. Een hook useNutritionFlow() die de step-machine, dietContext/sync, en navigatie (next/back)
   bevat — inclusief de `step` vs afgeleide `flowStep`-logica, geconsolideerd tot één bron.
2. Een hook of module voor de resultaat-fetch (latest) en de submit-fetch.
3. Presentational subcomponenten voor de stap-schermen (vraag, breadthIntro, consent, error).
Verplaats `renderQuestionBody`/`showOptOut` uit de functie-body-na-return naar echte componenten.

## Constraints
- Puur refactor, identieke UX en identieke GA4/Clarity-events. Imports via `@/`.
- Geen wijziging aan de API-payloads of NutritionResultView-props.
- Geen git commands, geen commit.

## Acceptatiecriterium
- [ ] NutritionCapture.tsx < ~250 r, orchestreert alleen.
- [ ] Flow identiek handmatig te doorlopen (start → dieet → breadth → consent → resultaat).
- [ ] npm run build groen; geen console.log.

## Verificatie
1. grep -rn "console.log" src/
2. npx vitest run src/lib/__tests__/nutrition-flow.test.ts
3. npm run build
Niet automatisch committen.
```

**Niet als Cursor-prompt uitgeschreven (bewuste keuze):**
- **FIX-02 (omega-3 rename)** — semantische verbetering, geen bug; hoort in §10-besluit, niet in een fix. **[wacht op velddata.]**
- **FIX-07 (fruit/berries evidence)** — bewuste uitsluiting (score-only), alleen documenteren. **[wacht op velddata.]**
- **FIX-08 (domain_events voor evidence)** — alleen zinvol als je de onderbouwing-funnel wilt sturen. **[follow-up.]**
- **Dubbele estimate (§4c)** — kandidaat om mee te nemen in FIX-01/orchestratie-opruiming; los als de refactor er toch is.

---

## 10. Futuristische architectuur (N3–N6)

**Antwoorden op de 12 diepte-vragen:**

1. **`oilyFishPerWeek` rename → omega3SourcesPerWeek?** Niet gratis: de key zit in `report`-fragmenten, in `raw_inputs` van opgeslagen rijen én in de estimate. Rename = breaking voor historische logs en delta. Advies: **alias/nieuw signaalveld** toevoegen voor N2+, oude key behouden.
2. **Gedeeld type-module?** Ja — `src/types/nutrition.ts` is nu gerechtvaardigd (zie FIX-01). Zonder dat fragmenteren N3–N6 verder.
3. **`resolveNutritionContext`?** Haalbaar en aanbevolen (FIX-01). De drie fish-free-varianten collapsen naar één predicatenset + allergie-enum.
4. **Evidence-registry schaalbaar?** Ja — `GAP_EVIDENCE_MAP`/`EXTRA_EVIDENCE_MAP` zijn totale `Record`s ([nutrient-evidence-map.ts:14-29](../../src/data/nutrition/nutrient-evidence-map.ts#L14)); een 6e nutriënt = één map-entry + één evidence-entry, geen UI-refactor.
5. **`buildNutritionLogResponse` uitbreidbaar met tier-2 macro?** Additief ja (extra optioneel veld `macro?`), maar `NutritionAnswers` heeft geen gewicht/lengte → dat vereist een nieuw, consent-gated invoerpad (AVG art. 9), niet alleen een responseveld. Zet het response-contract nu al op een optioneel-veld-patroon.
6. **`ESTIMATE_VERSION` bump-strategie?** `ESTIMATE_VERSION` bestaat en wordt opgeslagen ([route.ts:219](../../src/app/api/intake/nutrition-log/route.ts#L219)), maar `compareNutritionEstimates` vergelijkt oude vs nieuwe estimate **zonder versie-guard**. Bij een drempelwijziging (N3) worden cross-versie-delta's misleidend. **Nu vastleggen:** delta alleen tonen bij gelijke `estimate_version`, anders "opnieuw ingesteld".
7. **Portion-dictionary NEVO-pad?** Copy (`LIFESTYLE_ACTIONS`) en thresholds (`intake-reference`) zijn gescheiden; `PORTION_DEFINITIONS.sourceNote` + de `VERIFY`-comments vormen het validatiepad. Scheiding is oké; alleen de getallen moeten gebrond (optimization-review).
8. **Leeftijdsband in engine?** Engine-functies nemen `report`, niet leeftijd. Begin lokaal: `protein-target.ts` neemt al gewicht/load — voeg dáár de leeftijdsfactor toe (N3) vóór je leeftijd door de hele estimate-keten trekt.
9. **Tier-2 AVG art. 9-naad?** Response is additief uit te breiden, maar er is nog geen consent-gated invoer voor gewicht/lengte. De naad = een aparte tier-2-module + eigen consent-stap, niet de bestaande flow verbouwen.
10. **6e nutriënt = hoeveel plekken?** ~6–7: `lifescore-questions` (vraag+report), `intake-reference` (nutrient+threshold+path+claimKey+`NUTRIENT_IDS`), `portion-dictionary` (`LIFESTYLE_ACTIONS`), `nutrient-evidence-map` (GAP-entry), `nutrition-question-evidence` (entry), optioneel `personalization`. Data-driven, dus mechanisch — maar meerdere bestanden.
11. **Feature-flags klaar voor A/B?** Nee — breadth-skip en evidence-disclosure zitten hard in de component; YouTube-funnel draait op referral-cookies + `from`, geen toggle-laag. Voeg een flag-laag toe vóór fase B als je A/B wilt.
12. **Return-link SSOT?** Nee. `nutrition-return-link.ts` kent alleen `from=voeding`; de `from=dashboard`-herkomst wordt elders gezet en in de capture gelezen. Dat is precies de FIX-04-bron.

### Architectuur-beslissingen nu vastleggen

| Beslissing | Nu doen | Uitstellen tot | Risico als je het niet doet |
|---|---|---|---|
| Gedeeld `src/types/nutrition.ts` + dieet-SSOT | ✅ FIX-01 | — | Elke N3–N6-toevoeging vergroot de drift over 3 modules |
| `from`-param ontvlechten (herkomst vs terug-marker) | ✅ FIX-04 | — | Elke nieuwe herkomst (mail, ad) breekt dezelfde round-trip |
| Response-contract op optioneel-veld-patroon | ✅ (klein) | Macro-invulling N5 | Tier-2 macro dwingt straks een contract-break af |
| Delta guarden op `estimate_version` | ✅ (klein) | — | N3-drempelwijziging maakt historische delta's misleidend |
| Leeftijd eerst lokaal in `protein-target.ts` | Bij N3 | Volledige leeftijd-keten N4 | Leeftijd te vroeg door de hele engine = brede refactor |
| Feature-flag-laag | Uitstellen | Fase B / A/B | Premature flag-infra zonder A/B-behoefte |

---

## Eindoordeel

### Fix-forward "blockers" (max 5) — al gecommit in `4481b97`, dus volgende PR
1. **FIX-04** — return-link verliest dashboard-herkomst (funnel-breuk). §5.
2. **FIX-05** — `syncDietContext` laat geskipte sliders (dairy) op 0 hangen; test maskeert het. §4a.
3. **FIX-03** — GET `/nutrition-log/latest` zonder rate-limit én zonder tests. §7.
4. **FIX-01** — dieet-context/fish-free op 3 plekken zonder SSOT; type-duplicatie. §2/§3.
5. **Dubbele estimate** in POST: opgeslagen (kaal) ≠ teruggegeven (gelabeld). §4c.

### Should-fix in deze/volgende PR (max 5)
1. GA4-events consolideren in `GA4_EVENTS` (nu half string-literals). §8.
2. Betere test voor het sync-reset-pad (niet-nul default). §4a/§7.
3. Component/RTL-test voor de allergie-toggle + evidence-toggle. §7.
4. `NutritionResultView` naar `intake-*`-tokens i.p.v. rauwe hex. §3.
5. `estimate_version`-guard in de delta-vergelijking. §10.

### Bewust laten zitten (max 5)
1. `console.error` in routes — established patroon, geen debug-log.
2. B12 als leefstijl-only extra zonder `/beste/*` — compliance-correct.
3. fruit/berries zonder evidence — bewuste score-only uitsluiting (documenteren).
4. FIX-06 (NutritionCapture-splitsing) — waardevol maar niet blokkerend; follow-up.
5. domain_events voor evidence/return — pas als je die funnel echt stuurt.

### Commit-splitsing
De hele lading zit in **één** commit (`4481b97`: allergie-flow + kompas-sync + result-return + premium CTA's). Dat is precies de brede, moeilijk te reviewen/reverten commit die de prompt wilde vermijden. Te laat om te splitsen, maar **splits de fixes wél**: (1) FIX-04 + FIX-05 (UX/logica-bugs), (2) FIX-03 (endpoint hardening), (3) FIX-01 + estimate-opruiming (refactor). Drie kleine PR's i.p.v. één.

### Top-5 acties deze maand
1. FIX-04 (dashboard-return herstellen).
2. FIX-05 + niet-triviale test.
3. FIX-03 (rate-limit + tests op `latest`).
4. FIX-01 (types + dieet-SSOT), estimate-dubbeling meenemen.
5. GA4-events consolideren + `estimate_version`-delta-guard.

### Top-5 NIET doen
1. Geen `oilyFishPerWeek`-rename vóór er een migratiepad voor historische logs is.
2. Geen tier-2 macro-velden forceren vóór het consent-gated invoerpad bestaat.
3. Geen leeftijd door de hele estimate-keten trekken — eerst lokaal in `protein-target.ts`.
4. Geen feature-flag-infra bouwen zonder concrete A/B-behoefte.
5. Geen `NutritionCapture`-refactor (FIX-06) in dezelfde PR als de bugfixes — apart houden.
