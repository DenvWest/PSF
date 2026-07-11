# Leefstijlcheck — Scope- & evidence-review

> **Type:** wetenschappelijk + compliance + product review-rapport. Geen code.
> **Aanleiding:** `docs/plan/PROMPT_CLAUDE_LEEFSTIJLCHECK_SCOPE.md`.
> **Ankerprobleem:** verbinding is één grove vraag met generiek advies, terwijl slaap vier vragen krijgt. Dezelfde lens is toegepast op álle pijlers.
> **Legenda compliance:** ✅ toegestaan · ⚠️ mag mits veilige formulering (copy gegeven) · ❌ niet toegestaan.
> **Codebase-verificatie:** alle claims hieronder zijn tegen `src/` gecontroleerd op 2026-07-11. Afwijkingen t.o.v. de prompt-context staan in de kadertekst hieronder en zijn in de secties gemarkeerd met **[code-check]**.

---

## Verificatie vooraf — afwijkingen t.o.v. de prompt-context

De prompt-context klopt grotendeels, met vier correcties die de conclusies raken:

1. **Verbinding is géén "content-only" pijler — hij is half-geïntegreerd.** `src/lib/primary-theme.ts` bevat `connection` in `TIEBREAK_ORDER` als volwaardige `MeasuredPillarId`. De engine scoort verbinding dus (`connection_score`, RULES_VERSION 1.3.1) én kan het als laagste pijler selecteren. Toch: (a) het profiellabel valt terug op "In Balans" (`intake-engine.ts`), (b) er is geen `connection.ts` in `lifestyle-plans/` en `PLAN_TEMPLATE_DOMAINS` bevat hem niet, (c) `THEME_CONTENT_MAP.connection` heeft `pillarHref: null`/`profileSlug: null`, (d) `docs/copy/themes/connection.md` zegt `is_measured: false` en "connection kan geen primair thema worden". **Dit is een directe interne tegenspraak in de codebase**, niet alleen verouderde docs. Verbinding is halverwege ingebouwd en toen stil blijven liggen.

2. **De sterkste verbinding-referentie ontbreekt.** `socialConnectionRefs` in `leefstijlcheck-evidence.ts` citeert Holt-Lunstad 2015 (loneliness/isolation), Santini 2015 (depressie), Umberson 2010, Nielsen 2015. De **Holt-Lunstad 2010 mortaliteit-meta-analyse** (PLoS Med) — het fundament onder de hele pijler — staat er níét bij, en Dunbar/relatiekwaliteit/toxische relaties evenmin. Het bewijs is dus niet "oppervlakkig door slechte bronnen" maar "smal": vier goede refs op één as (steun → welzijn), geen enkele op kwaliteit, kwantiteit of negatieve relaties.

3. **`themes.ts` is geen lege placeholder.** Er bestaan wél recognition-lines (`CON_SOC ≤ 2`) én hefboom-copy voor connection. De echte gaten zijn: geen pillar-pagina, geen leefstijlplan, geen profiel, geen check-in. De copy die er is, is generiek ("plan één vast contactmoment").

4. **`getMovementLoad` = `max(MOV_CARD, MOV_STR)`** (niet een som/gemiddelde). `overtrainerPattern` = die max ≥ 3 én `RCV_PHYS` ≤ 1. Relevant voor sectie 5.

**Regel gevolgd:** bij conflict wint de code. De docs (`connection.md`, `ANALYSIS_PILLAR_COVERAGE.md §1`) zijn feitelijk onjuist en moeten in L0 mee.

---

## 1. Scope-architectuur — wat hoort waar

De leefstijlcheck probeert nu twee onverenigbare dingen tegelijk: **breed screenen** (8 categorieën in 3–4 min) én **diep adviseren** (persoonlijk plan per pijler). Dat kan alleen als de lagen strikt gescheiden zijn. Voorstel voor de drie lagen:

| Laag | Doel | Diepte | Waar in code |
|------|------|--------|--------------|
| **Tier-1 (intake)** | Breed screenen: welke pijler is de grootste hefboom? | 1–3 vragen per pijler, grove band | `intake-questions.ts`, `intake-engine.ts` |
| **Tier-2 (check-in)** | Verdieping op de gekozen pijler | 6–10 vragen, geen tijdslimiet | `/intake/{slaap,stress,voeding,beweging}` — verbinding ontbreekt |
| **Leefstijlplan** | Uitvoerbaar plan met fasen | n.v.t. (content) | `lifestyle-plans/*` — connection ontbreekt |

**Kernprincipe:** tier-1 hoeft geen construct volledig te meten — het hoeft alleen betrouwbaar te *ranken* welke pijler de aandacht verdient. Diepte hoort in tier-2. Gemeten aan die lat is het probleem niet dat verbinding te weinig vragen heeft, maar dat **slaap er te veel heeft voor tier-1**: 4 slaapvragen leveren nauwelijks betere ranking dan 2, terwijl ze 25% van het vragenbudget opeten.

**Anti-scope-creep-regel (voorstel):**
> Tier-1 kent een hard budget van **max. 16 kernvragen + leeftijd + symptoomkeuze**. Een nieuwe tier-1-vraag mag er alleen bij als (a) hij de *ranking* tussen pijlers aantoonbaar verbetert (niet alleen de diepte binnen één pijler), én (b) er een bestaande vraag uit gaat of naar tier-2 verhuist. Diepte-vragen gaan per definitie naar tier-2.

**Vraagbudget-advies per pijler (tier-1), binnen 3–4 min:**

| Pijler | Nu | Advies | Reden |
|--------|----|--------|-------|
| Slaap | 4 | **2** (kwaliteit + consistentie) | SLP_ONSET/SLP_WAKE zijn tier-2-diepte |
| Stress | 2 | 2 | STR_RCV splitsen (zie §4), niet uitbreiden |
| Verbinding | 1 | **2** | 1 vraag confoundeert kwaliteit met sociale behoefte (§2) |
| Voeding | 2 | 2 | verwijst door naar voedingscheck (§6) |
| Beweging | 2 | 2 | kracht + cardio blijven gescheiden |
| Energie (readout) | 2 | **1–2** | NRG_DEP is een mengvat (§7) |
| Herstel (readout) | 1 | 1 | dun, maar readout — hoort niet zwaarder |
| Leefstijl (signaal) | 2 | 2 | alcohol + zon als quick-win-signalen |

Netto: verschuift 2 slaapvragen naar tier-2, voegt 1 verbindingvraag toe → budget blijft gelijk, ranking-kwaliteit stijgt.

---

## 2. Verbinding — diepgaande review (anker-case)

### 2a. Wat CON_SOC nu wél en niet meet

CON_SOC ("Heb je mensen om je heen bij wie je echt jezelf kunt zijn en op wie je kunt terugvallen?") meet **ervaren steun-adequaatheid** — en dat is op zich een goed construct. De vraag is subjectief geformuleerd ("dat voelt voldoende"), wat correct is: het is de *ervaren* toereikendheid die telt, niet de netwerkomvang.

**Construct-probleem:** de antwoordschaal mengt twee assen die los staan:
- **Kwaliteit/adequaatheid** (heb ik mensen om op terug te vallen?)
- **Kwantiteit** (meerdere vs één-twee vs beperkt vs nauwelijks)

Optie 4 ("meerdere") scoort hoger dan optie 3 ("één of twee, dat voelt voldoende") — terwijl de wetenschap zegt dat **1–3 sterke, gelijkwaardige relaties volstaan** en méér niet beter is. De schaal straft dus impliciet de introvert met twee diepe banden af, en beloont netwerkomvang die er niet toe doet.

**[code-check]** In de praktijk is dit effect klein — beide vallen ≥ 50 (band "voldoende") — maar de framing in de opties stuurt het advies en de recognition-copy wel.

### 2b. Evidence-basis (met compliance-oordeel per claim voor UI-gebruik)

| Bevinding | Bron | Mag in UI? |
|-----------|------|------------|
| Sociale verbondenheid hangt samen met betere gezondheids- en overlevingsuitkomsten op populatieniveau | Holt-Lunstad, Smith, Layton 2010, *PLoS Med*, DOI 10.1371/journal.pmed.1000316, PMID 20668659 | ✅ als leefstijlfactor, geen persoonlijk risico |
| **Kwaliteit > kwantiteit**: enkele sterke banden bufferen stress beter dan een groot oppervlakkig netwerk | Cohen & Wills 1985, *Psychol Bull*, PMID 3901065 (buffering-hypothese) | ✅ |
| Mensen onderhouden een gelaagd netwerk (~5 intieme, ~15 goede, ~50 vrienden); de binnenste 3–5 dragen de meeste steun | Sutcliffe, Dunbar et al. 2012, *Br J Psychol*, DOI 10.1111/j.2044-8295.2011.02061.x; Dunbar 1998 social brain | ✅ als "veel mensen hebben een handvol mensen die er echt toe doen" |
| **Eenzaamheid ≠ alleen zijn**: ervaren eenzaamheid is een andere as dan objectieve isolatie | Cacioppo & Hawkley 2010, *Ann Behav Med*, PMID 20652462 | ✅ |
| **Negatieve/toxische relaties** hangen samen met slechtere gezondheid — een gespannen relatie kan schadelijker zijn dan geen relatie | Umberson et al. 2006 "You make me sick", *J Health Soc Behav*, DOI 10.1177/002214650604700101, PMID 16583773; Liu & Waite 2014, DOI 10.1177/0022146514556893, PMID 25413482 | ⚠️ zie 2c |
| Sociale steun is een parallelle basisbehoefte (relatedness) voor duurzame gedragsverandering | Self-Determination Theory (Ryan & Deci 2000, PMID 11392867) — al impliciet in de codebase | ✅ |

### 2c. Toxische relaties in de UI — mag het? (diepte-vraag 4)

**Evidence bestaat en is solide** (Umberson 2006, Liu & Waite 2014): huwelijksspanning/negatieve relatiekwaliteit hangt samen met verhoogd cardiovasculair risico en slechtere zelfgerapporteerde gezondheid. **Maar:**

- ❌ **Niet toegestaan:** een user-facing claim in de vorm "toxische relaties verkorten je leven / kosten je X gezonde jaren". Dat is een LEVY-/risicoclaim → MDR-grens, en bovendien diagnose-achtig richting de persoonlijke situatie.
- ⚠️ **Wel toegestaan, veilig geformuleerd** (coaching-taal, patroon, geen diagnose):
  > "Niet elk contact geeft energie. Relaties waarin je je voortdurend moet bewijzen of op je hoede bent, kosten vaak meer dan ze opleveren. Verbinding gaat over de mensen bij wie je *tot rust* komt — niet om zoveel mogelijk contacten."

Deze formulering: (a) geen mortaliteitsclaim, (b) geen label op de gebruiker of zijn relaties, (c) wel de wetenschappelijke kern (kwaliteit > kwantiteit, negatieve ties bestaan).

### 2d. Personalisatie-dimensies zonder MBTI-woo (diepte-vraag 2)

De verdedigbare as is **niet** "introvert vs extravert" als type, maar de **discrepantie tussen gewenst en ervaren contact** (discrepancy-model van eenzaamheid, Perlman & Peplau 1981). Dat is meetbaar met één vraag en vermijdt persoonlijkheidstypering volledig:

> **Nieuwe tier-1-modifier (optioneel, overslaanbaar):** "Hoeveel sociaal contact heb je nodig om je goed te voelen?"
> - Ik zit goed met een paar diepe contacten (laag-volume, hoog-diepte)
> - Ik heb regelmatig contact met verschillende mensen nodig (hoog-volume)
> - Wisselt / weet niet

Dit maakt het advies persoonlijk zónder claim: iemand die "een paar diepe contacten" kiest én CON_SOC = 3 ("één of twee, voelt voldoende") is **geen aandachtspunt** — nu wordt die wel als sub-optimaal (score 50) geframed. Compliance: ✅ (voorkeurvraag, geen gevoelig gegeven, geen diagnose).

### 2e. CON_SOC herschrijven of splitsen? (diepte-vraag 1)

**Aanbeveling: houd CON_SOC als één vraag in tier-1, maar herformuleer de opties zodat kwaliteit niet onder kwantiteit ligt, en voeg de modifier uit 2d toe.** Volledige splitsing (kwaliteit/eenzaamheid/toxisch/sociale-energie = 4 vragen) hoort in een **tier-2 verbinding-check-in**, niet in tier-1 — dat kost ~60–90 sec extra en breekt het budget.

Herschreven CON_SOC (kwaliteit-first, kwantiteit-neutraal):

> **"Heb je mensen bij wie je echt jezelf kunt zijn en op wie je kunt terugvallen?"** *(vraag ongewijzigd — is goed)*
> - Ja, en dat voelt ruim voldoende *(4)*
> - Ja, een paar — en dat is genoeg voor mij *(4 — gelijkgesteld, niet 3)*
> - Er zijn mensen, maar ik mis soms echt contact *(2)*
> - Nauwelijks — ik sta er meestal alleen voor *(1)*

Kern: "één of twee dat voelt voldoende" hoort **niet** lager te scoren dan "meerdere". Netwerkomvang is geen kwaliteitsmaat.

### 2f. Gedifferentieerde habit-copy (diepte-vraag 5)

Vervang de generieke regel in `vitality-habit-kernel.ts` (`resolveNextBestHabit`, `CON_SOC ≤ 2` → "Focus nu: plan één vast contactmoment deze week.") door copy die de modifier uit 2d gebruikt:

| Situatie | Vervangende copy (letterlijk) | Bron |
|----------|-------------------------------|------|
| Mist contact + hoog-volume-behoefte | "Focus nu: zoek deze week één plek terug waar je regelmatig mensen tegenkomt — een club, sport of vaste afspraak." | Cohen & Wills 1985 ✅ |
| Mist contact + hoog-diepte-behoefte | "Focus nu: investeer deze week in één relatie die er echt toe doet — een gesprek dat verder gaat dan het praktische." | Sutcliffe/Dunbar 2012 ✅ |
| Mist contact, behoefte onbekend | "Focus nu: kies één contact waar je energie van krijgt en zoek dat bewust op." | ✅ |

En de probleemzin (`resolveProblemStatement`, nu "Betekenisvol contact of steun schiet erbij in.") mag blijven — die is compliant en neutraal.

### 2g. Content-hub — minimale set om de grade-C-proxy te vervangen (diepte-vraag 6)

De Fable-audit markeerde `verbinding-steun → stress-werk-grenzen-stellen` als grade C ("steun ontvangen ≠ professioneel grenzen stellen"). Minimale set om dat te repareren:

1. **`connection.ts` leefstijlplan** (`lifestyle-plans/`) — het type staat al klaar (`connection` is een `MeasuredPillarId`; alleen `PLAN_TEMPLATES`/`PLAN_TEMPLATE_DOMAINS` mist hem). Laagste-drempel-item.
2. **`THEME_CONTENT_MAP.connection`**: `knowledgeSlug` bestaat ("sociale-verbinding"); voeg een `pillarHref` toe zodra er een pillar-pagina is.
3. **Profiellabel**: laat verbinding een eigen label dragen i.p.v. "In Balans" (bv. "De Verbinder" / "Op Jezelf") — anders kan de pijler nooit een profiel aansturen.
4. **Ja op een `/intake/verbinding` check-in** — maar pas ná L2 (zie roadmap); tier-1 hoeft het niet.

### Vraag-tabel §2

| QuestionId | Oordeel | Herschreven / actie | Evidence-gap |
|------------|---------|---------------------|--------------|
| CON_SOC | **Aanpassen** | Opties kwaliteit-first (2e); "één-twee voldoende" = 4 i.p.v. 3 | Dunbar, Cohen & Wills, Holt-Lunstad 2010 ontbreken in refs |
| *(nieuw)* CON_NEED | **Toevoegen (optioneel, tier-1 modifier)** | Sociale-behoefte-vraag (2d) | discrepancy-model (Perlman & Peplau 1981) toevoegen |
| *(tier-2)* CON_TOXIC / CON_LONELY | **Splitsen naar tier-2** | Kwaliteit/eenzaamheid/toxisch in verbinding-check-in | Umberson 2006, Cacioppo 2010 |

---

## 3. Slaap — SLP_QUAL, SLP_CONS, SLP_ONSET, SLP_WAKE

De best bedeelde pijler, en **overbedeeld voor tier-1**. Construct-analyse:

- **SLP_QUAL** (uitgerust wakker worden) — dekt subjectieve slaapkwaliteit. Sterkste enkele indicator. **Behouden tier-1.**
- **SLP_CONS** (vast ritme) — slaapregelmaat is een krachtige, onafhankelijke voorspeller, sterker dan slaapduur (Windred et al. 2024, *Sleep*, DOI 10.1093/sleep/zsad253, PMID 37738616). **Behouden tier-1.**
- **SLP_ONSET** (inslaapduur) — kern-CBT-I-target (sleep onset latency), maar **overlapt met kwaliteit** en is diepte. **Naar tier-2.**
- **SLP_WAKE** (nachtelijk wakker) — meet sleep-maintenance-insomnia; **correleert sterk met SLP_QUAL** (wie doorslaapt, wordt uitgeruster wakker). Diagnostisch waardevol in tier-2, redundant in tier-1. **Naar tier-2.**

**CBT-I-verankering:** de Europese insomnia-richtlijn (Riemann et al. 2017, *J Sleep Res*, DOI 10.1111/jsr.12594, PMID 27890572) noemt CBT-I eerste keus; ONSET en WAKE zijn precies de twee assen die een tier-2 slaapmodule zou uitdiepen (stimuluscontrole vs sleep restriction).

**Personalisatie-gaten (nu geen enkele koppeling):**
- **Alcohol-cross:** `LIF_ALC` beïnvloedt slaaparchitectuur direct (Ebrahim et al. 2013, *Alcohol Clin Exp Res*, PMID 23347102: alcohol onderdrukt REM, fragmenteert de tweede nachthelft). Er is nu **geen** signaal dat lage slaapkwaliteit + frequente alcohol koppelt. Kandidaat voor een K-regel (§8). ⚠️ copy: "Alcohol helpt je inslapen maar verstoort de tweede helft van je nacht" — mechanisme, geen diagnose.
- **Shift worker / partner in bed:** niet uitvraagbaar in tier-1 zonder budget te breken → tier-2.

**4 vs 1 (slaap vs verbinding):** de asymmetrie is niet te verdedigen op construct-gronden. Slaap heeft 2 tier-1-vragen nodig, niet 4. Dat maakt budget vrij voor de verbinding-modifier zonder de check te verlengen.

### Vraag-tabel §3

| QuestionId | Oordeel | Actie | Evidence-gap |
|------------|---------|-------|--------------|
| SLP_QUAL | **Behouden** | tier-1 kern | — |
| SLP_CONS | **Behouden** | tier-1 kern | Windred 2024 (regelmaat > duur) toevoegen aan evidence |
| SLP_ONSET | **Tier-2 verplaatsen** | naar slaap-check-in | CBT-I stimuluscontrole |
| SLP_WAKE | **Tier-2 verplaatsen** | naar slaap-check-in; overlap met QUAL | sleep-maintenance-insomnia-ref |

---

## 4. Stress + herstel — STR_FREQ, STR_RCV, RCV_PHYS

**STR_RCV heeft een dubbelrol** en meet daardoor onzuiver. De vraag ("Lukt het je om op een drukke dag tot rust te komen én herstelmomenten te pakken?") combineert:
- **Stressregulatie** ("tot rust komen" — kan ik loslaten?)
- **Herstelgedrag** ("herstelmomenten pakken" — neem ik bewust pauze?)

Dat zijn twee constructen (Meijman & Mulder effort-recovery-model 1998; Geurts & Sonnentag 2006, *Scand J Work Environ Health*, PMID 16932076). Iemand kan slecht loslaten maar wél pauzes inbouwen, of andersom. **Splitsen in tier-2**, in tier-1 als één proxy acceptabel (rankt prima).

**RCV_PHYS is dun** (1 vraag, 3 opties) maar dat is **juist goed** — het is een readout, geen interventiedomein. Herstel hoort geen zwaarder gewicht te krijgen dan slaap/stress die het aandrijven. Wel: RCV_PHYS meet alleen *fysiek* herstel na inspanning; *mentaal* herstel valt nu tussen wal (STR_RCV) en schip. Voor tier-1 acceptabel.

**K4 stress×herstel — verdedigbaar naast K1–K3?** K1 (`low_recovery_no_load`) vangt al "traag herstel zónder trainingsbelasting". Een K4 "hoge stressfrequentie (STR_FREQ ≤ 2) + slecht mentaal herstel (STR_RCV ≤ 2) zónder dat slaap het verklaart" zou de **chronische-stress-zonder-uitlaat**-groep isoleren — dat is een echte, andere populatie dan K1. **Verdedigbaar** (Geurts & Sonnentag 2006), mits het geen supplementroute triggert maar een leefstijl-/stress-plan. ⚠️: nooit "burn-out" of "overspannenheid" labelen.

### Vraag-tabel §4

| QuestionId | Oordeel | Actie | Evidence-gap |
|------------|---------|-------|--------------|
| STR_FREQ | **Behouden** | tier-1 kern | — |
| STR_RCV | **Aanpassen → tier-2 splitsen** | tier-1: laten; tier-2: loslaten vs pauzeren scheiden | effort-recovery-model (Geurts 2006) |
| RCV_PHYS | **Behouden** | readout, niet verzwaren | — |

---

## 5. Beweging — MOV_STR, MOV_CARD

Kracht en cardio zijn terecht gescheiden — voor mannen 40+ is dat het belangrijkste onderscheid.

- **Sarcopenie-relevantie:** spiermassa daalt ~3–8% per decennium na de 30e, versnellend na de 60e (EWGSOP2-consensus, Cruz-Jentoft et al. 2019, *Age Ageing*, DOI 10.1093/ageing/afy169, PMID 30312372). **Krachttraining is de primaire tegenmaatregel** — MOV_STR is daarmee de hoogwaardigste bewegingsvraag voor de doelgroep. ✅ "kracht wordt na je 40e belangrijker" als leefstijlkader.
- **MOV_CARD:** cardiovasculaire fitheid; WHO-richtlijn 2020 (Bull et al., *Br J Sports Med*, DOI 10.1136/bjsports-2020-102955) 150–300 min matige activiteit/week. Prima tier-1.
- **`overtrainerPattern`** = `max(MOV_CARD, MOV_STR) ≥ 3` én `RCV_PHYS ≤ 1` **[code-check]**. Dit is een verstandige, zuinige heuristiek: veel trainen + traag herstel = overbelasting. Zwakte: het gebruikt de *max* van cardio/kracht, dus iemand die alleen veel cardiot maar niet krachttraint, kan als "overtrainer" scoren terwijl het onderliggende probleem juist *te weinig* kracht is. Acceptabel voor tier-1, verfijnen in tier-2.

**PAL/protein-koppeling:** `protein-target.ts` gebruikt `trainingLoad` (1–4) voor de g/kg-range (1.0–1.2 basis → 1.2–1.6 bij training, PROT-AGE Bauer et al. 2013, *JAMDA*, DOI 10.1016/j.jamda.2013.05.021, PMID 23867520). De bewegingsvragen zijn de logische bron voor die `trainingLoad`. **[code-check]** Deze koppeling loopt via de voedingscheck, niet de leefstijlcheck — de naad (§6) moet borgen dat de bewegingsintensiteit uit de intake dáár landt.

**Intensiteit/duur ontbreekt** — frequentie is voor tier-1 voldoende om te ranken; duur/intensiteit is tier-2-diepte.

### Vraag-tabel §5

| QuestionId | Oordeel | Actie | Evidence-gap |
|------------|---------|-------|--------------|
| MOV_STR | **Behouden** | tier-1 kern; benadruk sarcopenie 40+ | EWGSOP2 (Cruz-Jentoft 2019) toevoegen |
| MOV_CARD | **Behouden** | tier-1 kern | WHO 2020 richtlijn |

---

## 6. Voeding in de leefstijlcheck — NUT_O3, NUT_PROT

**Scheefheidsrisico is reëel.** De intake-voedingsscore hangt aan 2 vragen (omega-3 + eiwit), terwijl er een volwaardige **voedingscheck** (`/intake/voeding`, 10 frequentie-sliders) bestaat met een eigen review-traject. Twee vragen bepalen nu een volledige pijlerscore die even zwaar meetelt als slaap (4 vragen) in de vitaliteitsscore — dat is onbalans.

**Aanbeveling — naad definiëren, niet mixen met VOEDING_OPTIMIZATION_REVIEW:**
- **NUT_O3 en NUT_PROT behouden in tier-1** — ze zijn de twee vragen met de sterkste 40+-relevantie (omega-3: EFSA EPA/DHA-hartclaim; eiwit: sarcopenie/PROT-AGE) en ze ranken de voedingspijler prima.
- **Tier-1 voeding = signaal, geen oordeel.** Bij een lage voedingsscore verwijst de intake door naar de voedingscheck als tier-2 ("Wil je hier dieper op in? Doe de voedingscheck — 10 vragen"). Zo blijft de intake kort en landt de diepte waar hij hoort.
- **Geen inhoudelijke voedingsadviezen dupliceren** tussen de twee checks — de leefstijlcheck geeft de hefboom-observatie, de voedingscheck de portie-details (dat traject loopt apart).

Compliance blijft identiek aan COMPLIANCE.md: inname-inschatting mag ("krijgt waarschijnlijk minder omega-3 binnen"), statusclaim/"tekort" ❌.

### Vraag-tabel §6

| QuestionId | Oordeel | Actie | Evidence-gap |
|------------|---------|-------|--------------|
| NUT_O3 | **Behouden** | tier-1; doorverwijzen naar voedingscheck bij lage score | EFSA EPA/DHA (al in COMPLIANCE) |
| NUT_PROT | **Behouden** | tier-1; koppelen aan trainingLoad/protein-target | PROT-AGE (Bauer 2013) |

---

## 7. Energie + leefstijl-signalen — NRG_PATN, NRG_DEP, LIF_ALC, LIF_SUN

**NRG_DEP is een mengvat** en de zwakste readout-vraag. De opties mengen drie ongelijksoortige gedragingen op één schaal:
- optie 3: koffie/energiedrank (cafeïne)
- optie 2: suiker/snacks (glykemisch)
- optie 1: alcohol als ontspanning (depressivum)

Dat zijn **drie verschillende constructen**, geordend alsof ze één as vormen (meer "leunen" = slechter). Een koffiedrinker (optie 3) en een avonddrinker (optie 1) krijgen verschillende scores, maar de as "hoeveel leun je op stimulanten" is inhoudelijk niet lineair. Bovendien **overlapt optie 1 met LIF_ALC** — alcohol wordt twee keer uitgevraagd.

**Aanbeveling:**
- **NRG_PATN behouden** — energiepatroon overdag (stabiel/dip) is een schone readout.
- **NRG_DEP herzien of afschalen:** haal alcohol eruit (dat zit al in LIF_ALC) en maak er een schonere "waar leun je op"-vraag van (cafeïne/suiker/niets), óf schaal NRG_DEP af tot een pure quick-win-signaalvraag zonder scoregewicht. Het is een readout — het hoeft de vitaliteitsscore niet zwaar te sturen.

**LIF_ALC/LIF_SUN als quick-win-signalen — voldoende?** Ja. Beide zijn bewust geen interventiedomein maar signaal → quick-win. Dat is correct: het zijn modulatoren (alcohol → slaap/energie; zon → vitamine D/stemming) die het beste als cross-signaal werken, niet als eigen pijler. LIF_SUN voedt terecht de vitamine-D-lijn (relevant in de NL-winter). ✅

### Vraag-tabel §7

| QuestionId | Oordeel | Actie | Evidence-gap |
|------------|---------|-------|--------------|
| NRG_PATN | **Behouden** | readout | — |
| NRG_DEP | **Aanpassen** | alcohol eruit (dubbelt LIF_ALC); cafeïne/suiker scheiden of afschalen tot signaal | — |
| LIF_ALC | **Behouden** | signaal → quick-win; koppelen aan slaap (K-regel §8) | Ebrahim 2013 (alcohol/slaap) |
| LIF_SUN | **Behouden** | signaal → vitamine-D-lijn | — |

---

## 8. Personalisatie & evidence-UX (overkoepelend)

### 8a. Nieuwe PlanCondition-dimensies (conceptueel, geen code)

Huidige `PlanCondition`-types (`types/lifestyle-plan.ts`): `always · signal · scoreBelow · profileIs · answerAtMost`. Er is geen manier om op **voorkeur/behoefte** te personaliseren. Voorstel voor uitbreiding (L4):
- Een conditie die op de **sociale-behoefte-modifier** (CON_NEED, §2d) matcht — zodat verbinding-plannen introvert/extravert-gedifferentieerd kunnen zijn.
- Optioneel een **werktype/leefsituatie-modifier** (bv. ploegendienst) voor slaap-plannen — maar alleen als tier-2, want het breekt anders het tier-1-budget.

Geen nieuwe gevoelige gegevens (AVG): voorkeur-/behoeftevragen zijn geen bijzondere persoonsgegevens; relatiestatus of psychische klachten ❌ zonder apart doel + consent.

### 8b. Optionele tier-1 modifiers — max 1–2, hoogste rendement per seconde

1. **CON_NEED** (sociale behoefte, §2d) — hoogste personalisatie-rendement, ontgrendelt de hele verbinding-differentiatie voor ~5 sec invultijd. **Aanbevolen.**
2. Géén tweede tier-1-modifier — werktype/ploegendienst levert te weinig ranking-winst voor het budget; hoort in tier-2.

### 8c. QuestionEvidence-updates per pijler (diepte-vraag 3)

Ontbrekende referenties, per pijler 2–3 met identifier:

| Pijler | Toe te voegen referentie | Reden |
|--------|--------------------------|-------|
| Verbinding | Holt-Lunstad 2010 (PMID 20668659); Cohen & Wills 1985 (PMID 3901065); Sutcliffe/Dunbar 2012 (DOI 10.1111/j.2044-8295.2011.02061.x) | fundament + kwaliteit>kwantiteit ontbreekt nu |
| Slaap | Windred 2024 (PMID 37738616); Riemann 2017 CBT-I (PMID 27890572) | regelmaat > duur; CBT-I-basis |
| Stress/herstel | Geurts & Sonnentag 2006 (PMID 16932076) | effort-recovery voor STR_RCV-splitsing |
| Beweging | Cruz-Jentoft EWGSOP2 2019 (PMID 30312372); Bull WHO 2020 (DOI 10.1136/bjsports-2020-102955) | sarcopenie 40+; activiteitsnorm |
| Voeding | Bauer PROT-AGE 2013 (PMID 23867520) | eiwit g/kg 40+ |

**Strength-sterren:** CON_SOC staat nu op 5★. Dat is verdedigbaar voor "sociale steun ↔ gezondheid" (Holt-Lunstad-meta-analyses), maar de sterren dekken nu een **smaller construct** dan de vraag suggereert. Advies: 5★ behouden, maar de `scientificRationale` uitbreiden met de kwaliteit/kwantiteit-nuance zodat de sterren de lading dekken. **Alle referenties in dit rapport moeten vóór publicatie op `/onderbouwing` tegen de bron geverifieerd worden** — DOI/PMID zijn hier op geheugen aangeleverd.

### 8d. Ontbrekende K-regels (cross-domein), incl. verbinding

Huidige signalen: K1 `low_recovery_no_load`, K2 `sleep_issue_no_stress`, K3 `energy_dip_unexplained` **[code-check]** — geen K4+, en verbinding komt in geen enkel cross-signaal voor.

| Voorstel | Logica | Verdedigbaar? | Route |
|----------|--------|---------------|-------|
| **K4 stress-zonder-uitlaat** | STR_FREQ ≤ 2 + STR_RCV ≤ 2, niet verklaard door slaap | ✅ (Geurts 2006) | stress-/leefstijlplan, geen supplement |
| **K5 alcohol-verstoorde-slaap** | LIF_ALC ≤ 2 + SLP_QUAL/SLP_WAKE laag | ✅ (Ebrahim 2013) | quick-win (minderen), geen supplement |
| **K6 verbinding×stress** | CON_SOC ≤ 2 + STR_FREQ ≤ 2 | ⚠️ isolatie versterkt stress-impact (Cohen & Wills buffering) — mag als leefstijlobservatie, geen diagnose | verbinding-plan |

K5 en K6 zijn de belangrijkste nieuwe koppelingen: ze verbinden de twee "signaal"-pijlers (alcohol/zon) en de vergeten pijler (verbinding) met de rest van de engine.

### Vraag-tabel §8 (overkoepelend — modifiers)

| QuestionId | Oordeel | Actie | Evidence-gap |
|------------|---------|-------|--------------|
| CON_NEED *(nieuw)* | **Toevoegen (tier-1 modifier, optioneel)** | discrepancy-model | Perlman & Peplau 1981 |
| *(werktype)* | **Niet tier-1** | tier-2 slaap-check-in | — |

---

## Diepte-vragen — expliciete antwoorden

1. **CON_SOC één vraag of splitsen?** Eén blijven in tier-1 (met kwaliteit-first-opties, §2e) + optionele CON_NEED-modifier. Volledige splitsing (kwaliteit/eenzaamheid/toxisch/energie) → tier-2 verbinding-check-in. Kosten tier-1: +~5 sec (alleen de modifier). Kosten tier-2: ~60–90 sec, buiten het intake-budget.
2. **Personalisatie zonder MBTI-woo?** Eén vraag naar sociale *behoefte* (discrepancy-model, §2d), niet naar persoonlijkheidstype. Verdedigbaar, geen gevoelig gegeven.
3. **Ontbrekende referenties per pijler?** Zie §8c-tabel (verbinding: Holt-Lunstad 2010, Cohen & Wills 1985, Dunbar 2012; slaap: Windred 2024, Riemann 2017; stress: Geurts 2006; beweging: Cruz-Jentoft 2019, Bull 2020; voeding: Bauer 2013).
4. **Toxische relaties / LEVY in UI?** Evidence-basis ✅ (Umberson 2006, Liu & Waite 2014), maar mortaliteits-/LEVY-claim ❌; wel toegestaan als coaching-observatie met ⚠️-copy (§2c).
5. **Welke generieke regels vervangen?** `vitality-habit-kernel.ts` → `resolveNextBestHabit` CON_SOC-regel (§2f, drie gedifferentieerde varianten); `themes.ts` connection-hefboom mag blijven maar de "één contactmoment"-nadruk verzachten. Probleemzin blijft.
6. **`/intake/verbinding` + `connection.ts`?** Ja op beide. `connection.ts` in L2 (laagste drempel, type staat klaar); `/intake/verbinding` check-in ná L2. Niet in tier-1.
7. **Tier-1 vraagbudget per pijler?** Zie §1-tabel: slaap 2 (van 4), verbinding 2 (van 1), rest gelijk — netto budget-neutraal binnen 3–4 min.

---

## Top-5 acties deze maand

1. **Docs corrigeren (L0):** `connection.md` (`is_measured: false` → `true`) en `ANALYSIS_PILLAR_COVERAGE.md §1` ("Niet gescoord" → gescoord sinds 1.3.0). Feitelijk onjuist t.o.v. de engine. Risico laag, geen RULES_VERSION-impact.
2. **Generieke habit-copy vervangen (L0):** `vitality-habit-kernel.ts` CON_SOC-regel → drie gedifferentieerde varianten (§2f). Copy-only.
3. **Verbinding-evidence verbreden (L0→L1):** Holt-Lunstad 2010 + Cohen & Wills 1985 + Dunbar 2012 toevoegen aan `socialConnectionRefs`; `scientificRationale` uitbreiden met kwaliteit>kwantiteit.
4. **`connection.ts` leefstijlplan bouwen (L2):** het type is klaar (`connection` ∈ `MeasuredPillarId`); alleen `PLAN_TEMPLATES`/`PLAN_TEMPLATE_DOMAINS` mist hem. Vervangt de grade-C-proxy.
5. **Slaap afschalen naar 2 tier-1-vragen (L3):** SLP_ONSET/SLP_WAKE → tier-2 slaap-check-in; maakt budget vrij voor CON_NEED-modifier. RULES_VERSION-bump + delta documenteren.

## Top-5 bewust NIET doen

1. **Geen mortaliteits-/LEVY-percentages in de UI** (Holt-Lunstad "gelijk aan roken") — MDR-grens. Alleen als onderbouwing in dit rapport / op `/onderbouwing` als leefstijlfactor.
2. **Geen persoonlijkheidstest** (introvert/extravert-typering, MBTI-achtig) — alleen de behoefte-/discrepantie-vraag.
3. **Geen tier-1-uitbreiding voorbij het budget** — diepte hoort in tier-2 check-ins, niet in de intake.
4. **Voedingsadvies niet dupliceren** tussen leefstijlcheck en voedingscheck — naad definiëren, niet de portie-details in de intake trekken.
5. **Geen LLM in de engine** (fase 1) en geen nieuwe gevoelige gegevens (relatiestatus, psychische klachten) zonder apart doel + consent.

---

## Gefaseerde roadmap

| Fase | Indicatief | Inhoud | Bestanden (indicatief) | Risico | RULES_VERSION-impact |
|------|-----------|--------|------------------------|--------|----------------------|
| **L0** | 1–2 wk | Docs sync (connection.md, ANALYSIS_PILLAR_COVERAGE); generieke habit-lines vervangen; evidence-refs verbreden | `connection.md`, `ANALYSIS_PILLAR_COVERAGE.md`, `vitality-habit-kernel.ts`, `themes.ts`, `leefstijlcheck-evidence.ts` | Laag | Nee |
| **L1** | 2–3 wk | CON_SOC opties herschrijven (kwaliteit-first) + CON_NEED-modifier + evidence-update | `intake-questions.ts`, `intake-engine.ts`, `leefstijlcheck-evidence.ts` | Medium | **Ja** (vraagwijziging → delta documenteren) |
| **L2** | 3–4 wk | `connection.ts` leefstijlplan + `THEME_CONTENT_MAP.connection.pillarHref` + verbinding-profiellabel | `lifestyle-plans/connection.ts`, `index.ts`, `theme-content-map.ts`, `intake-engine.ts` | Medium | Nee (content + labelroute) |
| **L3** | 4–6 wk | Slaap → 2 tier-1-vragen (ONSET/WAKE naar tier-2); STR_RCV-splitsing tier-2; NRG_DEP herzien | `intake-questions.ts`, `intake-engine.ts`, `/intake/slaap` | Medium | **Ja** |
| **L4** | 2–3 mnd | PlanCondition-uitbreiding (sociale-behoefte-conditie) → gedifferentieerde verbinding-plannen | `types/lifestyle-plan.ts`, `lifestyle-plan-eval.ts`, `connection.ts` | Laag | Nee |
| **L5** | 3–6 mnd | K-regels: K4 stress-zonder-uitlaat, K5 alcohol-slaap, K6 verbinding×stress | `intake-engine.ts` (`DeficiencySignals`) | Medium | **Ja** |
| **L6** | 6–12 mnd | `/intake/verbinding` check-in (tier-2 diepte: kwaliteit/eenzaamheid/toxisch) + soft-pillar loop per pijler | `/intake/verbinding/page.tsx`, tier-2-modules | Hoog | Per check-in |

**Volgorde-logica:** copy/docs (L0, nul risico) vóór vraagwijzigingen (L1/L3, RULES_VERSION); content (L2, geen engine) parallel aan L1; engine-structuur (L4/L5) pas ná data uit L0–L3; tier-2-diepte (L6) als laatste.

---

## Meetpunten (bij latere implementatie)

| Event | Wanneer | Effect aflezen |
|-------|---------|----------------|
| `intake_evidence_expanded` | Klik "Waarom deze vraag?" per pijler | Vertrouwen vs drop-off per vraag |
| `intake_completed` | Bestaand | Completion vóór/na vraagwijziging (L1/L3) |
| `plan.viewed` / `plan.step_state_changed` | Verbinding-plan live (L2) | Engagement nieuwe pijler |
| Clarity-tag `social_profile=*` | Na CON_NEED-modifier (L1) | Recordings per adviespad |

Nieuw client-event = registratie op drie plekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`. Hergebruik bestaande event-types; geen PII in GA4/Clarity.
