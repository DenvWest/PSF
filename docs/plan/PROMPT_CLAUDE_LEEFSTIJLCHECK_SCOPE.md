# Claude review-prompt — Leefstijlcheck onder scope (alle pijlers, verbinding als anker)

> **Gebruik:** plak de inhoud onder **Prompt (copy-paste)** in Claude Code/Projects. Voeg als bijlage toe:
> - `docs/core/COMPLIANCE.md`
> - `docs/core/DOMAIN_MODEL.md`
> - `docs/core/INTAKE_SYSTEM.md`
> - `docs/plan/ANALYSIS_PILLAR_COVERAGE.md`
> - `docs/plan/PLAN_SOFTPILLAR_SELFEVAL_LOOP.md`
> - `docs/plan/LEEFSTIJLPLAN_HANDBOOK.md`
> - `docs/cursors/fable-leefstijlcheck-metadata-evidence-audit-2026-07.md`
> - Optioneel: PKN Vol. 2 hoofdstuk 5 & 6 (Present Knowledge in Nutrition — healthy-aging-lens)
>
> **Verwachte output:** Claude schrijft `docs/research/LEEFSTIJLCHECK_SCOPE_REVIEW.md` — een review-rapport met 8 vaste secties. **Geen code.** Dennis gebruikt het rapport voor productbeslissingen; implementatie gebeurt daarna via aparte Cursor-prompts per fase (L0, L1, …).

---

## Prompt (copy-paste)

```text
## Rol

Je bent tegelijkertijd:
- social epidemiologist / relationship scientist — Holt-Lunstad, Dunbar, relatiekwaliteit vs -kwantiteit, toxische relaties (Umberson), buffering-hypothese (Cohen & Wills)
- slaap- en stresswetenschapper — CBT-I, slaapconsistentie, HPA-as, recovery science
- bewegings- en voedingsepidemioloog — mannen 40+, sarcopenie, krachttraining vs cardio, PAL
- gedragspsycholoog — persoonlijkheids- en sociale-behoefte-spectrum (introversie/extraversie, attachment, sociale energie) als evidence-based dimensies, GEEN MBTI-woo
- product architect — 3–4 minuten tier-1 intake vs tier-2 verdieping (stepped care); anti-scope-creep
- compliance reviewer — NL/EU: geen diagnose-taal, AVG, MDR-grens bij sterftecijfers/verloren levensjaren als user-facing claim
- growth/strategie — "Consumentenbond van supplementen"-positionering: evidence + persoonlijk, niet generiek

Je taak is NIET om code te schrijven. Je produceert een review-rapport dat Dennis direct kan gebruiken voor productbeslissingen. Wees extreem kritisch: gedraag je als wetenschappelijke reviewer + compliance officer + productstrateeg die moet bepalen of de leefstijlcheck in zijn huidige vorm het merk waarmaakt.

Geef bij ELKE aanbeveling: (a) een peer-reviewed bron of richtlijn, en (b) een compliance-label: ✅ toegestaan · ⚠️ voorzichtig formuleren (geef veilige copy) · ❌ niet toegestaan.

---

## Context — product, code & kaders

**PerfectSupplement** (perfectsupplement.nl) is een onafhankelijk supplementen-vergelijkingsplatform + leefstijlcheck voor mannen 40+. Focus: slaap, stress, energie, herstel, verbinding, voeding, beweging. Monetisatie via affiliate links. Positionering: objectief, wetenschappelijk, "eerst de basis, dan de pil".

De **leefstijlcheck** (/intake) is een 3–4 minuten intake: 16 vragen over 8 categorieën → domeinscores → vitaliteitsscore → profiellabel → advies + leefstijlplan. Engine: `src/lib/intake-engine.ts`, RULES_VERSION 1.3.1, volledig regelgebaseerd.

### Harde compliance-regels (leidend — mag niet geschonden worden)
- **Geen diagnose-taal:** "adviezen, geen diagnoses". Geen "tekort", "deficiëntie", "eenzaamheidsdiagnose", klinische labels (depressie, sociale angst).
- **MDR-grens:** leefstijl/welzijn-educatie = OK; sterftecijfers, verloren levensjaren (LEVY), risicopercentages als user-facing claim = MDR-risico. In dit review-rapport mag je LEVY-evidence citeren als onderbouwing; beoordeel apart wat daarvan in de UI mag.
- **Evidence-patroon:** elke intake-vraag heeft publieke onderbouwing via QuestionEvidence (src/data/leefstijlcheck-evidence.ts) op /onderbouwing. answerMeaning spreekt over "patronen die vaker samengaan met", nooit over persoonlijke risico's.
- **AVG:** antwoorden zijn gezondheidsgerelateerd; geen nieuwe gevoelige dimensies (bv. relatiestatus, psychische klachten) zonder expliciet doel en granulaire consent-afweging.

### A. Volledige vraagset (src/data/intake-questions.ts) — 16 vragen, 8 categorieën

    flowchart LR
      subgraph interventie [5 interventiedomeinen]
        slaap[Slaap 4Q]
        stress[Stress 2Q]
        verbinding[Verbinding 1Q]
        voeding[Voeding 2Q]
        beweging[Beweging 2Q]
      end
      subgraph readout [2 readouts]
        energie[Energie 2Q]
        herstel[Herstel 1Q]
      end
      subgraph signaal [Signalen]
        leefstijl[LIF_ALC LIF_SUN]
      end
      interventie --> vitaliteit[Vitaliteitsscore]
      readout --> advies[getAdvice drivers]
      signaal --> quickWins[Quick wins]

| id        | pijler     | rol         | schaal   | vraag (kort) |
|-----------|------------|-------------|----------|--------------|
| SLP_QUAL  | slaap      | interventie | 4 opties | Hoe voel je je gemiddeld als je wakker wordt? |
| SLP_CONS  | slaap      | interventie | 3 opties | Vast slaap-waakritme? |
| SLP_ONSET | slaap      | interventie | 4 opties | Inslaapduur (sleep onset latency) |
| SLP_WAKE  | slaap      | interventie | 4 opties | Nachtelijk wakker worden / doorslapen |
| STR_FREQ  | stress     | interventie | 4 opties | Hoe vaak gestrest of overprikkeld? |
| STR_RCV   | stress     | interventie | 4 opties | Tot rust komen én herstelmomenten pakken op drukke dagen |
| CON_SOC   | verbinding | interventie | 4 opties | Mensen bij wie je jezelf kunt zijn en op wie je kunt terugvallen? |
| NUT_O3    | voeding    | interventie | 3 opties | Vette vis (zalm, makreel, sardines)? |
| NUT_PROT  | voeding    | interventie | 4 opties | Eiwitrijke producten per dag |
| MOV_STR   | beweging   | interventie | 4 opties | Kracht-/weerstandstraining |
| MOV_CARD  | beweging   | interventie | 4 opties | Cardio / intensieve sport |
| NRG_PATN  | energie    | readout     | 4 opties | Energieniveau overdag (patroon) |
| NRG_DEP   | energie    | readout     | 4 opties | Waar leun je op voor energie? (koffie/suiker/alcohol) |
| RCV_PHYS  | herstel    | readout     | 3 opties | Herstelsnelheid na inspanning |
| LIF_ALC   | leefstijl  | signaal     | 4 opties | ≥3 glazen alcohol op één avond |
| LIF_SUN   | leefstijl  | signaal     | 4 opties | Zon en buitenlicht |

Leeftijd wordt als band verzameld: INTAKE_AGE_RANGE_OPTIONS = 40–44 / 45–49 / 50–54 / 55+.

### B. Scoring & personalisatie — huidige staat

- **Engine** (intake-engine.ts, RULES_VERSION 1.3.1): elk domein genormaliseerd naar 0–100. Verbinding = connection_score = normalizeScore(CON_SOC, 4) → exact 25/50/75/100, één vraag, geen nuance.
- **Profiellabels**: "Lage Batterij", "Onrustige Slaper", "Stressdrager", "Overtrainer" etc. — maar als verbinding het laagste domein is, valt het label ALTIJD terug op "In Balans" (net als nutrition/recovery). Verbinding kan dus nooit een profiel dragen.
- **Habit-kernel** (vitality-habit-kernel.ts): CON_SOC ≤ 2 → probleemzin "Betekenisvol contact of steun schiet erbij in." + habit "Focus nu: plan één vast contactmoment deze week." Geen onderscheid introvert/extravert, kwaliteit/kwantiteit, partner/vrienden/gemeenschap.
- **PlanCondition-types** (types/lifestyle-plan.ts): always · signal · scoreBelow · profileIs · answerAtMost. Er bestaat GEEN persoonlijkheids- of sociale-behoefte-dimensie om plannen op te personaliseren.
- **Cross-domein signalen** (DeficiencySignals): K1 low_recovery_no_load, K2 sleep_issue_no_stress, K3 energy_dip_unexplained + supplement-signalen (omega3, magnesium, cortisol, creatine, melatonine, protein_gap). Verbinding komt in geen enkel cross-domein signaal voor.

### C. Evidence-patroon

QuestionEvidence per vraag (whyThisQuestion, scientificRationale, answerMeaning, strength 3–5★, references met DOI/PMID), publiek op /onderbouwing. CON_SOC heeft nu 5★ met Holt-Lunstad 2015, Santini 2015, Umberson 2010, Nielsen 2015 — maar géén Dunbar, géén kwaliteit-vs-kwantiteit-differentiatie, géén toxische-relaties-evidence. De aparte voedingscheck (/intake/voeding) heeft een eigen evidence-traject (VOEDING_OPTIMIZATION_REVIEW) — niet mixen.

### D. Verbinding als anker-case

De volledige CON_SOC-vraag:

    "Heb je mensen om je heen bij wie je echt jezelf kunt zijn en op wie je kunt terugvallen?"
    Subtitle: "Denk aan partner, vrienden of familie waar je op drukke of mindere dagen op kunt bouwen."
    4 — Ja, meerdere — ik voel me verbonden en gesteund
    3 — Eén of twee, dat voelt voldoende
    2 — Beperkt — ik mis soms echt contact
    1 — Nauwelijks — ik sta er meestal alleen voor

Huidige adviesketen bij lage score: recognition-line "Je mist soms echt contact of staat er vaak alleen voor" (themes.ts, CON_SOC ≤ 2) → hefboom-copy "Eén vast contactmoment per week doet vaak meer dan nog een product of protocol" → habit "plan één vast contactmoment deze week". Dat is alles.

Content-gap: THEME_CONTENT_MAP.connection heeft pillarHref: null en profileSlug: null (alleen knowledgeSlug "sociale-verbinding"); er is geen connection.ts in src/data/lifestyle-plans/ (wel sleep/stress/nutrition/movement); VerbindingScreen in het dashboard is een premium-upsell-placeholder; er is geen /intake/verbinding check-in (wel slaap/stress/voeding/beweging). De Fable-audit (bijlage) beoordeelde de enige taxonomy-link verbinding-steun → stress-werk-grenzen-stellen als grade C: "zwakste link van het systeem" — steun ontvangen ≠ professioneel grenzen stellen.

Docs zijn verouderd: docs/copy/themes/connection.md zegt is_measured: false en ANALYSIS_PILLAR_COVERAGE.md §1 zegt "Niet gescoord" — terwijl RULES_VERSION 1.3.0 verbinding als 5e interventiedomein scoort.

### E. Harde productconstraints

- Basis-intake blijft 3–4 minuten (tier 1); diepte gaat naar tier-2 check-ins (/intake/slaap, /intake/stress, …) — verbinding heeft die route nog niet.
- Engine blijft regelgebaseerd (geen LLM in fase 1).
- Geen medische claims; sterftecijfers/LEVY alleen als onderbouwing in dit rapport, nooit als user-facing risicopercentage (MDR).
- RULES_VERSION-impact: elke vraag- of scoringswijziging documenteren voor delta-vergelijkbaarheid (hermeting vergelijkt oude vs nieuwe sessies).

---

## Kernkritiek die je moet adresseren

**Verbinding / sociale contacten (anker-case):**
- Evidence: kwaliteit > kwantiteit; 1–3 sterke gelijkwaardige relaties (Dunbar-lagen, Cohen & Wills buffering); differentiatie partner/familie vs vrienden vs gemeenschap; toxische/negatieve relaties (Umberson, Holt-Lunstad poor-quality ties) — mag dit in coaching-taal, zonder LEVY-claims?
- Personalisatie: een introvert met 1–2 diepe contacten is GEEN probleemgeval; een extravert met 3 sterke contacten kan alsnog contact missen; eenzaamheid ≠ alleen zijn.
- Construct-validiteit: meet CON_SOC het bedoelde construct (ervaren steun), of confoundeert het sociale energie met netwerkomvang?
- Advies: "plan één contactmoment" is te generiek — welke evidence-based alternatieven per profiel bestaan er?

**Zelfde lens op ALLE pijlers** — beoordeel per vraag:
1. Meet het de bedoelde construct of een proxy?
2. Is de schaal granulair genoeg?
3. Is het advies persoonlijk genoeg, of generiek/vaag?
4. Welke peer-reviewed evidence ontbreekt in leefstijlcheck-evidence.ts?
5. Wat hoort in tier-1 vs tier-2 check-in?

---

## Jouw opdracht — review in 8 secties

Schrijf LEEFSTIJLCHECK_SCOPE_REVIEW.md. Werk elke sectie concreet uit: noem vraag-id's, bestandsnamen, schaalwaarden en bronnen. Vage adviezen ("meer aandacht voor verbinding") tellen niet. Secties 2–7 eindigen elk met een **vraag-tabel**: per QuestionId → oordeel (behouden / aanpassen / splitsen / tier-2 verplaatsen / verwijderen) + herschreven vraagtekst waar van toepassing + evidence-gap.

### 1. Scope-architectuur
Wat hoort in de 16-vragen tier-1, wat in domein-check-ins (tier 2), wat in leefstijlplannen? Maximaal aantal tier-1-vragen (nu 16 + leeftijd + symptoomkeuze) t.o.v. de 3–4-minutengrens. Definieer een anti-scope-creep-regel: wanneer mag een nieuwe vraag tier-1 in (en welke moet er dan uit)?

### 2. Verbinding — diepgaande review (anker)
- Evidence-basis: kwaliteit vs kwantiteit, 1–3 sterke relaties, toxische relaties, familie/partner vs vrienden — met bronnen en per claim een compliance-oordeel voor UI-gebruik.
- Personalisatie-dimensies: welke 1–2 dimensies (bv. sociale energie, contactbehoefte) zijn wetenschappelijk verdedigbaar zonder persoonlijkheidstest-woo?
- Herschreven CON_SOC (of splitsing): concrete vraagtekst + opties + wat elke optie betekent voor het advies.
- Advies per profiel: vervang "plan één contactmoment" door gedifferentieerde habit-lines (introvert/extravert × kwaliteit/kwantiteit-gap) — geef de letterlijke NL-copy.
- Content-hub: moet verbinding een pillar-pagina, profiel en leefstijlplan krijgen? Wat is de minimale set om de grade-C-proxy (stress-werk-grenzen-stellen) te vervangen?

### 3. Slaap (SLP_QUAL, SLP_CONS, SLP_ONSET, SLP_WAKE)
4 vragen — de best bedeelde pijler. Construct-validiteit en onderlinge overlap (QUAL vs WAKE), CBT-I-evidence per vraag, personalisatie-gaten: shift worker, partner in bed, alcohol-cross (LIF_ALC beïnvloedt slaap maar er is geen koppeling). Is 4 vragen hier te veel t.o.v. verbinding met 1?

### 4. Stress + herstel (STR_FREQ, STR_RCV, RCV_PHYS)
STR_RCV heeft een dubbelrol: "tot rust komen" (stressregulatie) én "herstelmomenten pakken" (herstelgedrag) in één vraag. Mentaal vs fysiek herstel: RCV_PHYS meet alleen fysiek herstel na inspanning en is met 1 vraag + 3 opties dun. Beoordeel of een K4-achtig cross-signaal (stress × herstel) verdedigbaar is naast K1–K3.

### 5. Beweging (MOV_STR, MOV_CARD)
Kracht vs cardio-balans, 40+ sarcopenie-evidence, overtraining-detectie (nu: movementLoad ≥ 3 + RCV_PHYS ≤ 1 → overtrainerPattern), koppeling met PAL/trainingLoad in de voedingscheck (protein-target). Ontbreekt intensiteit/duur, of is frequentie genoeg voor tier-1?

### 6. Voeding in de leefstijlcheck (NUT_O3, NUT_PROT)
2 vragen hier vs 10 frequentie-sliders in de aparte voedingscheck (/intake/voeding). Scheefheidsrisico: de intake-voedingsscore hangt aan 2 vragen terwijl er een volwaardige check bestaat. Wat behouden, wat afschalen, hoe verwijzen (tier-1 → voedingscheck als tier-2)? Niet mixen met het VOEDING_OPTIMIZATION-traject — wel de naad definiëren.

### 7. Energie + leefstijl-signalen (NRG_PATN, NRG_DEP, LIF_ALC, LIF_SUN)
NRG_DEP is een mengvat: koffie, suiker en alcohol in één schaal, met overlap op LIF_ALC. Zijn energie-readout-constructen valide, of meet NRG_DEP drie verschillende dingen? LIF_ALC/LIF_SUN als quick-win-signalen: volstaat dat, of verdienen ze een domein?

### 8. Personalisatie & evidence-UX (overkoepelend)
- Welke nieuwe PlanCondition-dimensies zijn nodig (bv. sociale energie, werktype) en wat is het minimale type-ontwerp (conceptueel, geen code)?
- Optionele tier-1 modifier-vragen: max 1–2, overslaanbaar — welke geven het meeste personalisatie-rendement per seconde invultijd?
- QuestionEvidence-updates: per pijler de ontbrekende referenties (met DOI/PMID) en welke strength-sterren omlaag/omhoog moeten.
- Cross-domein: welke K-regels ontbreken (incl. verbinding × stress/slaap) en welke zijn evidence-based verdedigbaar?

---

## Specifieke diepte-vragen (beantwoord expliciet)

1. Kan CON_SOC één vraag blijven, of is splitsing nodig (kwaliteit / eenzaamheid / toxisch / sociale energie)? Zo ja: welke splitsing en wat kost het in invultijd?
2. Hoe personaliseer je sociaal advies zonder MBTI-woo — welke 1–2 extra vragen in tier-1 of tier-2 zijn wetenschappelijk verdedigbaar?
3. Welke peer-reviewed bronnen ontbreken per pijler in leefstijlcheck-evidence.ts? Geef per pijler 2–3 concrete referenties met DOI/PMID.
4. Wat is de evidence voor "toxische relaties verminderen gezonde levensjaren" — mag dat in de UI, en hoe formuleer je het compliance-veilig (⚠️-copy)?
5. Welke generieke adviezen in vitality-habit-kernel.ts en themes.ts moeten worden geschrapt of vervangen? Geef per regel de vervangende copy.
6. Moet verbinding een eigen check-in (/intake/verbinding) + leefstijlplan (connection.ts) krijgen — ja/nee, en in welke fase?
7. Hoe balanceer je breedte (alle 8 categorieën) met diepte (evidence per vraag) binnen 3–4 minuten — wat is je aanbevolen tier-1-vraagbudget per pijler?

---

## Output-formaat

Markdown, Nederlands, met tabellen. **Geen code.** Per aanbeveling een peer-reviewed bron + compliance-label (✅/⚠️/❌). Noem concrete vraag-id's, bestandsnamen en schaalwaarden.

Eindig met:

**Top-5 acties deze maand:**
1. …

**Top-5 bewust NIET doen:**
1. …

**Gefaseerde roadmap** — herzie deze indeling waar jouw analyse afwijkt; noem per fase bestanden, risico en RULES_VERSION-impact:

| Fase | Indicatief | Inhoud | RULES_VERSION-impact |
|------|-----------|--------|----------------------|
| L0   | 1–2 wk    | Evidence- en copy-audit; generieke habit-lines vervangen; docs sync (connection.md, ANALYSIS_PILLAR_COVERAGE) | Nee |
| L1   | 2–3 wk    | CON_SOC herschrijven + evidence-update; optionele tier-1 modifier-vraag | Ja |
| L2   | 3–4 wk    | Verbinding check-in route + connection.ts plan-template | Nee |
| L3   | 4–6 wk    | Overige pijlers: vraag-splitsingen waar evidence het vereist | Ja |
| L4   | 2–3 mnd   | PlanCondition-uitbreiding (sociale energie, werktype) | Nee |
| L5   | 3–6 mnd   | Cross-domein K-regels incl. verbinding | Ja |
| L6   | 6–12 mnd  | Tier-2 diepte per pijler (soft-pillar loop) | Per check-in |
```

---

## Na de review — verwachte implementatievolgorde

De review bepaalt de exacte prioriteit; default-volgorde (laag risico / hoog vertrouwen eerst), telkens als **aparte Cursor-implementatieprompt**, niet alles in één PR:

1. **L0** — evidence- en copy-audit: generieke habit-lines in `vitality-habit-kernel.ts` en `themes.ts` vervangen; `docs/copy/themes/connection.md` en `ANALYSIS_PILLAR_COVERAGE.md` synchroniseren met RULES_VERSION 1.3.x (verbinding wordt wél gescoord).
2. **L1** — CON_SOC herschrijven + `leefstijlcheck-evidence.ts`-update (Dunbar, kwaliteit vs kwantiteit); RULES_VERSION bumpen + delta documenteren.
3. **L2** — `/intake/verbinding` check-in + `src/data/lifestyle-plans/connection.ts`; grade-C-proxy in de taxonomy vervangen.
4. **L3** — vraag-splitsingen overige pijlers (STR_RCV-dubbelrol, NRG_DEP-mengvat) waar de review het vereist.
5. **L4–L6** — PlanCondition-uitbreiding, K-regels, tier-2 diepte — alleen na data uit L0–L3.

**Niet in scope van deze prompt en de eerste implementatie-PR:** engine-code wijzigen, RULES_VERSION bumpen, nieuwe events registreren — dat komt pas na de review, per fase.

---

## Meetpunten (bij latere implementatie)

| Event | Wanneer | Effect aflezen |
|-------|---------|----------------|
| `intake_evidence_expanded` | Klik "Waarom deze vraag?" per pijler | Vertrouwen vs drop-off per vraag |
| `intake_completed` | Bestaand | Completion-rate vóór/na vraagwijziging |
| `plan.viewed` / `plan.step_state_changed` | Verbinding-plan live | Engagement nieuwe pijler |
| Clarity-tag `social_profile=*` | Na personalisatie-dimensie | Recordings per adviespad |

Nieuw client-event vereist registratie op drie plekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`. Hergebruik bestaande event-types vóór je nieuwe verzint; geen PII in GA4/Clarity-payloads.
