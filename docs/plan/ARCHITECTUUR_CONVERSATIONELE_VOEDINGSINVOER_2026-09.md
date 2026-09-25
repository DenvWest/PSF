# Architectuur — voeding invoeren in gewone taal (conversationele laag)

**Datum:** 25 september 2026
**Status:** ontwerp ter beoordeling — **niet besloten, niet te bouwen vóór akkoord.** Dit ontwerp botst op vijf punten met besluiten die al genomen zijn (§0). Die besluiten blijven leidend totdat Dennis ze uitdrukkelijk herziet.
**Herzien 25 sep:** **C1 is door Dennis heropend** — er komt een chatvenster met LLM op de check én het dagboek (`BESLUIT_LLM_CHAT_VOEDING_2026-09.md`). Daarmee is §6 (de LLM als tolk) het plan geworden en geen optie meer. §6.3 (trigger) en §13 punten 3–4 vervallen; de volgorde staat in het besluit. Nieuw is §6.4 (chat op de check). C2–C5 blijven staan.
**Aanleiding:** een opdracht (25 sep) voor een "conversational nutrition engine": voeding en leefstijl opbouwen via een chatvenster in plaats van een vragenlijst, met de LLM als tolk en de database plus rekenlaag als bron van waarheid.
**Bouwt op:** [`BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md`](BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md) — de sessie-ingang moet eerst staan.

---

## 0. Eerst: waar de opdracht botst met genomen besluiten

CLAUDE.md schrijft voor om een conflict met `docs/plan/` te melden vóórdat er een eigen plan komt. Dit zijn ze:

| # | De opdracht vraagt | Het bestaande besluit | Bron | Gevolg voor dit ontwerp |
|---|---|---|---|---|
| **C1** | Een LLM die vrije tekst leest over eten, sport, doelen en leefstijl | **Geen LLM op persoonsdata vóór 500+ checks én vóór de governance-poort G1–G7.** Naar een externe LLM gaan uitsluitend geanonimiseerde afgeleiden, nooit ruwe invoer. "Regelgebaseerd, geen AI/ML tot 500+ gebruikers." Voedingsgegevens zijn art. 9-gegevens. | `PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md` DEEL 3 (§3B, §3C, "Wat bewust NIET nu") · `PLAN_MEASUREMENT_PERSONALIZATION.md` §F · `docs/core/INTAKE_SYSTEM.md` "Beslislogica" · `docs/core/ARCHITECTURE.md` regel 2 · `docs/core/DPIA.md` §1 | Fase 1 hieronder werkt **zonder LLM**. Een LLM komt pas in fase 2, na een nieuw, expliciet besluit (§6). |
| **C2** | Een contextkaart "Energie 1.840 kcal", macro's | **Geen kcal- of macroteller.** Die positionering is expliciet afgewezen. | `ANALYSE_LONGEVITY_HOME_DOMEINGEDREVEN.md` (25 jul) · `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §2 · `src/lib/nutrition-dagboek-items.ts` ("Geen calorieën, geen macro's") | Kcal en macro's blijven buiten dit ontwerp. |
| **C3** | "Vandaag: calcium 820 mg, magnesium 290 mg" als dagtotaal | **Een som over ingevoerde items is een ondergrens, nooit een dagtotaal.** Geen rood kruis. Zink en vitamine D krijgen in het dagboek geen oordeel. | `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.3–3.4 · `nutrition-dagboek-items.ts` ("De ondergrens-regel") · `BESLUIT_VOEDINGSCHECK_RESULTAAT_PER_STOF_2026-09.md` §3 | De kaart toont "minstens … uit N producten, M zonder gehalte", zoals het dagboek nu al doet. |
| **C4** | Dagelijks alles invoeren via chat als kernmechanisme | **Het Virtuagym/MyFitnessPal-mechanisme is afgewezen.** Loggen is een middel; gekozen is het 2+2-dagboek (vier meetdagen). | `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §2, §3.2 | De chat is een **andere invoervorm voor hetzelfde 2+2-dagboek**, geen nieuw mechanisme. |
| **C5** | Een groot nieuw fundament | **Het focusfilter van 15 aug:** vraag 1 (verandert dit iets op of aan het bereik van `/beste/*`?) en vraag 2 (is het effect binnen 30 dagen af te lezen?) zijn eliminerend. | `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §1 | Tekstinvoer haalt beide vragen niet rechtstreeks. Daarom staat hij hier als **"nu niet, met trigger"** (§9). |

De opdracht vraagt ook om geen eigen normen te verzinnen en om herkomst traceerbaar te maken. Dat botst níét met de repo, en het meeste ervan staat er al (§1.3, §4).

---

## 1. Huidige architectuur (voor zover relevant voor voeding)

### 1.1 Lagen en waar ze wonen

| Laag | Waar | Opmerking |
|---|---|---|
| Routes | `src/app/api/**/route.ts` (58 route handlers) | Consumentenkant alleen via route handlers; server actions alleen in de admin-platformen |
| Toegang | `psf_account` (account) en `psf_intake_sid` (anonieme sessie), allebei HMAC-cookies | Zie het sessiedocument §1 |
| Database | Supabase via de service-role; RLS deny-all; `orgScoped()` verplicht voor nieuwe code (`src/lib/db/scoped.ts`) | |
| Validatie | Handgeschreven `sanitize*`/`parse*`-functies per domein | **Geen Zod** in `package.json` |
| Client-state | Lokale React-state plus `fetch` naar de server | Geen globale store |
| Events | `domain_events` + `emitEvent()`; een nieuw client-event wordt op drie plekken geregistreerd | CLAUDE.md, meet-standaarden |
| Rate limiting | Redis-backend (`@upstash/redis`/`ioredis`) met terugval op in-memory | `src/lib/rate-limit.ts` |

### 1.2 AI in de codebase: geen

- **Er is geen LLM-SDK geïnstalleerd** en er is geen enkele LLM-call.
- `POST /api/chat` is **evidence-Q&A zonder LLM**: full-text search op `evidence_claims` (`src/lib/evidence-rag.ts`, `docs/core/EVIDENCE_CHAT.md`). De kolom `embedding vector(1536)` bestaat maar is leeg. Er is geen UI die deze route aanroept.
- `POST /api/intake/chat` + `src/lib/chat-intake.ts` is een **gescripte vragenmachine** voor de oude brede check. Hij is gemarkeerd "EXPERIMENTAL … Not used by production pages", en de client stuurt bij elke beurt de complete state mee, die de server dan vertrouwt. **Niet op voortbouwen** (§10).

### 1.3 Voedingsdata: statisch, met herkomst per waarde

| Bestand | Rol |
|---|---|
| `src/data/nutrition/food-sources.ts` (2.720 regels) | **De gehaltes.** Per bron: `nutrientValue` (per 100 g, **ongewijzigd uit de brondataset**) en `amount` (onze portie-omrekening, expliciet gescheiden vanwege de NEVO-licentie). `SourceRef { origin: "nevo" \| "usda" \| "voedingscentrum" \| "literatuur", ref, edition }` en `verified: boolean`. **Stand 25 sep: 119 rijen over 5 stoffen; 104 `verified: true` (99 USDA, 5 NEVO), 15 niet (literatuur).** *(Gecorrigeerd: een eerdere versie van dit document zei "geen enkele rij geverifieerd"; dat kwam uit een verouderde kopcomment.)* |
| `src/data/nutrition/food-catalog.ts` (371 regels in de catalogus) | Wat je kunt invoeren: `key`, `labelNl`, categorie, één van **13 vaste voedselgroepen**, bereiding, `porties: {labelNl, grams}[]`, en `bron` = een sleutel in `FOOD_SOURCES` of `null` ("te loggen, gehaltes nog niet opgehaald"). **Geen enkel getal in de catalogus zelf.** |
| `src/data/nutrition/supplement-catalog.ts` | Supplementen als invoerbare items |
| `src/data/nutrition/portion-dictionary.ts` | Portiegroep → gram-equivalent |
| `src/data/nutrition/reference-intake.ts` | **RI uit EU 1169/2011 bijlage XIII** (wettelijk), met `personalTarget` voor eiwit |
| `src/data/nutrition/intake-reference.ts` | Drempels voor de check: expliciet "indicatief, vuistregels" |
| `src/lib/protein-target.ts` | Persoonlijk eiwitdoel (g/kg × belasting), achter een eigen `body_metrics`-toestemming |
| `scripts/usda-extract.mjs` | **USDA is geen runtime-integratie.** Een offline script dat per catalogusregel de beste FDC-match ophaalt en er een **rapport** van maakt; het **past niets automatisch aan**, want de matchbeoordeling is het eigenlijke werk. Het vraagt een eigen `FDC_API_KEY`. |

### 1.4 Rekenen en het dagboek

- **Dagboek:** `account_nutrition_daybook`, uniek op `(account_id, entry_date)`, met `portions`, `meals` en `items` in jsonb. `DagboekItem = { moment, bron: "voeding"|"supplement", key, grams }` (`src/lib/nutrition-dagboek-items.ts`). Invoer gaat nu via zoeken in de catalogus plus een portiekiezer (`src/components/dashboard/dagboek/DagboekCatalogusZoek.tsx`, `DagboekPortieInvoer.tsx`).
- **Rekenen:** `nutrientenUitItems(items)` levert per stof een **ondergrens**: een bedrag, plus het aantal items dat bijdroeg en het aantal zonder gehalte. Het gehalte komt uit `nutrientValue` (per 100 g) × gram. Deterministisch en reproduceerbaar.
- **Beoordeling:** `nutrition-tekortsysteem.ts`, `nutrition-sufficiency.ts` en `nutrition-delta.ts` (vier vensters, asymmetrie-regel).
- **De check** (frequentievragen) is een ander instrument: `nutrition-score.ts` → `nutrition-intake-estimate.ts`, opgeslagen in `intake_intake_log`. Hij raakt het dagboek niet en omgekeerd.

**Conclusie:** de keten *invoer → voedingsmiddel → gehalte uit de bron → deterministische som → referentie → oordeel* bestaat al, zonder LLM, met herkomst per waarde. Wat ontbreekt, is alleen de **invoervorm "gewone taal"**.

---

## 2. Voorgestelde architectuur

### 2.1 Eén regel die overal geldt

> **De tolk levert alleen verwijzingen naar gesloten lijsten** (catalogussleutels, porties, eenheden, eetmomenten, vraagtypes). **Elk getal over voeding komt uit `FOOD_SOURCES` via de bestaande rekenlaag.** Het maakt niet uit of de tolk een regelparser is of een LLM.

### 2.2 De keten

```
"havermout met banaan en melk, daarna 2 boterhammen met kaas"
   │
   ▼
[1] Invoer-UI           client component in de Dagboek-tab (account verplicht)
   │  POST /api/account/nutrition-input/interpret        ← schrijft NIETS
   ▼
[2] Tolk                fase 1: deterministische parser (NL)
   │                    fase 2: LLM, alleen na besluit C1 (§6)
   │  → InterpretationResult: spans, kandidaatsleutels, hoeveelheid, eenheid, moment
   ▼
[3] Validator           schema + gesloten vocabulaire; onbekende sleutels vallen eraf
   ▼
[4] Resolver            span → kandidaten uit FOOD_CATALOG (+ synoniemen), gerangschikt
   ▼
[5] Portie-normalisatie "2 boterhammen" → Portie "snee" × 2 → gram; aanname expliciet
   ▼
[6] Voorstel            DaybookProposal: items + aannames + hooguit één vraag
   │  ← gebruiker bevestigt of corrigeert (chips)
   ▼
[7] Domeincommando      bestaande POST /api/account/nutrition-daybook (upsertDaybookDay)
   │                    = de ENIGE schrijfactie
   ▼
[8] Rekenen             nutrientenUitItems → ondergrens per stof (bestaand)
   ▼
[9] Referentie          reference-intake.ts + profiel (protein-target, voedingsdoelen)
   ▼
[10] Tekortsysteem      vier vensters → Keuze → /supplementen, /beste/*  (bestaand)
```

**Nieuw zijn alleen [1] tot en met [6].** Stap [7] tot en met [10] bestaan al en veranderen niet.

### 2.3 Fase 1: een deterministische tolk, geen LLM

**Waarom dat werkt:** de woordenschat is gesloten en klein. Er zijn 371 catalogusregels, 13 groepen, een handvol eenheden ("boterham", "snee", "kom", "glas", "handje", "stuk", "g", "ml") en een handvol eetmomenten ("ontbijt", "vanmorgen", "lunch", "tussendoor", "vanavond"). Een Nederlandse parser met een synoniemenlijst dekt de gewone zinnen:

- **Tokenisatie** op scheiders: `,` · `en` · `met` · `daarna` · `en toen`.
- **Hoeveelheden:** cijfers, telwoorden (`een`, `twee`, `drie`, `paar` → vraag), eenheden.
- **Eetmoment** uit het woord of de tijd ("vanmorgen" → ontbijt); zonder aanwijzing het moment dat in de UI openstaat.
- **Voedingsmiddel:** zoeken op `labelNl` plus synoniemen ("boterham" → brood + portie `snee`; "kaas" → een kaasvariant, die een vraag oproept).
- **Wat onbekend blijft**, komt terug als chip "niet herkend" met een knop die de bestaande catalogus-zoekfunctie opent.

**Wat fase 1 niet kan:** ingewikkelde zinnen ("zelfde als gisteren maar zonder…"), impliciete gerechten ("nasi"), ontkenningen. Die vallen terug op "niet herkend" en daarna op het zoeken in de catalogus. Dat is het huidige invoerpad; je raakt niets kwijt.

**Wat fase 1 oplevert naast de invoer:** een meting van **hoeveel spans zonder correctie goed opgelost worden**. Dat getal beslist later of een LLM iets toevoegt (§6).

### 2.4 Onzekerheid en aannames

Per voorgesteld item wordt vastgelegd hoe zeker het is:

| Toestand | Betekenis | Voorbeeld | UI |
|---|---|---|---|
| `genoemd` | product en hoeveelheid staan in de tekst | "2 boterhammen" | chip zonder markering |
| `aangenomen` | product zeker, portie is de standaard uit `porties[0]` | "een kom yoghurt" → kom, 150 g | chip met "± aangenomen", één tik om te wijzigen |
| `meerduidig` | meerdere kandidaten | "kaas" → belegen / jong / 30+ | **vraag** (hooguit één per invoer) |
| `onbekend` | geen kandidaat | "nasi" | chip "niet herkend" → zoeken |
| `bevestigd` | door de gebruiker goedgekeurd of aangepast | — | wordt pas dan opgeslagen |

**Regel:** er wordt niets opgeslagen zonder bevestiging. Na bevestiging bewaart het item of de portie gekozen of aangenomen was (§3.2), zodat de kalibratie later kan zien hoeveel "standaardporties" erin zitten.

### 2.5 "Welke informatie ontbreekt nog?" — deterministisch, niet door een LLM

Wat de opdracht een adaptief gesprek noemt, is een functie over profielvelden die ontbreken. **Een veld is alleen de vraag waard als het een referentiewaarde verandert voor een stof die de gebruiker registreert:**

| Profielveld | Verandert | Bron |
|---|---|---|
| Gewicht | eiwitdoel | `protein-target.ts` (vereist `body_metrics`-toestemming) |
| Trainingsbelasting / sport | eiwitdoel | idem |
| Voedingswijze (vegan, vega, pesco) | welke bronnen meetellen, vraag naar B12/omega-3 | `lifescore-questions.ts` (meta-vraag) |
| Seizoen | vitamine D (geen oordeel, wel context) | `isVitaminDLowSunSeason()` |
| Leeftijd, geslacht | alleen als `reference-intake.ts` per groep gaat verschillen, nu niet (bijlage XIII geeft één volwassenenwaarde) | — |

`nextProfileQuestion(profile, geregistreerdeStoffen)` levert hooguit één vraag, met de vaste opties uit de bestaande vragenset. Zo ontstaat het "kleinst mogelijke vervolg" zonder een model dat zelf bedenkt wat relevant is.

---

## 3. Datamodel

### 3.1 Geen nieuwe tabellen in fase 1

- **Het gesprek wordt niet opgeslagen.** De tekst is een art. 9-gegeven, de bevestigde items zijn de waarheid, en een transcript bewaren betekent een extra bewaartermijn, een extra verwijderplicht en een extra DPIA-rij, zonder productwaarde. Het "gesprek" bestaat in fase 1 alleen in de client zolang de invoer openstaat.
- **Bevestigde items** gaan in de bestaande `account_nutrition_daybook.items` (jsonb).
- **Het profiel** blijft waar het nu staat (sessie-antwoorden, `weight_kg` op de sessie, `account_voedingsdoelen`).

### 3.2 Eén optioneel veld op `DagboekItem` (jsonb, geen migratie)

```ts
export type DagboekItem = {
  moment: EetmomentId;
  bron: DagboekItemBron;
  key: string;
  grams: number;
  /** Hoe het item binnenkwam. Ontbreekt bij oude rijen → "zoeken". */
  invoer?: "zoeken" | "tekst";
  /** Of de portie gekozen is of de standaard was. Ontbreekt → "gekozen". */
  portie?: "gekozen" | "standaard";
};
```

`sanitizeItems` vult ontbrekende waarden aan. Dat is hetzelfde patroon als bij `bron` in september, en de opslag blijft dezelfde kolom.

### 3.3 Contract van de tolk

```ts
// src/lib/nutrition-text-interpret.ts (voorstel)
export type InterpretationResult = {
  contractVersion: "interpret.v1";
  interpreter: { kind: "rules"; version: string } | { kind: "llm"; model: string; promptVersion: string };
  mentions: FoodMention[];
  question: ClarifyingQuestion | null;
};

export type FoodMention = {
  /** Positie in de invoertekst — geen kopie van de tekst. */
  span: { start: number; end: number };
  /** Gesloten vocabulaire: sleutels uit FOOD_CATALOG of SUPPLEMENT_CATALOG, hooguit 5, gerangschikt. */
  candidates: { bron: DagboekItemBron; key: string }[];
  quantity: { count: number; portieLabel: string } | { grams: number } | null;
  moment: EetmomentId | null;
  status: "genoemd" | "aangenomen" | "meerduidig" | "onbekend";
};

export type ClarifyingQuestion = {
  kind: "variant" | "portie" | "moment";
  mentionIndex: number;
  /** Altijd opties uit de catalogus of de porties, nooit vrij geformuleerd. */
  options: { label: string; value: string }[];
};

export type DaybookProposal = {
  /** Idempotentie: dezelfde bevestiging twee keer versturen levert één registratie op. */
  proposalId: string;
  entryDate: string;
  items: { item: DagboekItem; status: FoodMention["status"] }[];
  unresolvedSpans: { start: number; end: number }[];
  question: ClarifyingQuestion | null;
};
```

**In het contract staat bewust geen enkel veld voor een gehalte, een percentage of een oordeel.** Een tolk kán dus geen voedingswaarde verzinnen: er is geen veld waar die in zou passen.

---

## 4. Voedingsbronnen en herkomst

De opdracht vraagt om een `NutritionProvider`-abstractie met meerdere bronnen. **De aanbeveling is: geen abstractie in de runtime.** De "provider" is de **offline importstraat** die de statische data vult; de runtime leest één tabel.

| Categorie uit de opdracht | Zit nu in | Status |
|---|---|---|
| Gezaghebbend (NL) | `origin: "nevo"` + `NEVO_CITATION` | Voorzien, nog niet gevuld; licentie: "only unchanged", vandaar de scheiding tussen `nutrientValue` en `amount` |
| Referentie | `origin: "usda"`, via `scripts/usda-extract.mjs` (Foundation eerst, SR Legacy als terugval, Branded overgeslagen) | Het script staat klaar; `FDC_API_KEY` is Dennis' actie |
| Commercieel (merken) | — | Afgewezen: Open Food Facts is merkgebonden en de catalogus bewust niet (`BESLUIT_VOEDINGSFOCUS` §8) |
| Door de gebruiker ingevoerd | — | Niet nu. Zou een tweede bron van waarheid per account worden. |
| Geschat / afgeleid | `amount` (onze portieberekening), `variability`, `bioavailability` | Bestaat en is expliciet gescheiden van het brongetal |

**Wanneer wél naar Postgres (en een provider-laag):** als de catalogus boven een paar duizend regels uitkomt, als gebruikers eigen producten gaan toevoegen, of als gehaltes moeten veranderen zonder deploy. Geen van die drie speelt nu.

**Het echte gat zit in de dekking, niet in de verificatie.** Van de 371 catalogusregels hebben er 92 gehaltes, 115 bewust niet (75 verwaarloosbaar, 24 samengesteld, 16 verrijkt), en **164 zijn te loggen zonder enig gehalte**. Er zijn 5 stoffen, 42 regels met zoekwoorden, en 9 supplementen in de dagboekcatalogus. Tekstinvoer maakt het invoeren makkelijker, maar vult die gaten niet: een chat die "nasi" of "rauwe spinazie" goed herkent, levert voor die items nog steeds geen milligram op. De NEVO-import (`BESLUIT_NEVO_BRONVERMELDING.md`, "import nog te doen") en de USDA-run zijn de voorwaarde voor een dagboekchat die iets toevoegt.

---

## 5. Referentie- en behoeftelaag

De opdracht vraagt een "requirement engine" met typen als TARGET, RDA/AI, REFERENCE, RANGE, UPPER LIMIT, ESTIMATE en UNKNOWN. De bouwstenen staan er al, verspreid over drie bestanden. Voorstel: **één lezer, geen nieuwe normen.**

```ts
// src/lib/nutrition-reference.ts (voorstel)
export type ReferenceValue =
  | { kind: "RI"; value: number; unit: string; source: "EU 1169/2011 bijlage XIII" }
  | { kind: "persoonlijk_doel"; low: number; high: number; unit: string; source: "protein-target.ts"; version: string }
  | { kind: "claimdrempel"; value: number; unit: string; source: "approved-claims.ts" } // omega-3
  | { kind: "indicatief"; value: number; unit: string; source: "intake-reference.ts" }
  | { kind: "geen_oordeel"; reason: "meetmethode" | "zon" }; // zink in het dagboek, vitamine D

export function resolveReference(nutrient: NutrientId, profile: NutritionProfile): ReferenceValue;
```

Een bovengrens (UL) komt pas als er een stof met een reëel UL-risico in de invoer zit (bijvoorbeeld vitamine D uit supplementen). Dan komt die uit de EFSA-UL-tabel, met bron en versie, en niet uit eigen schattingen.

---

## 6. Fase 2 — een LLM als tolk: alleen na een nieuw besluit

### 6.1 Wat eerst besloten moet worden (C1)

De governance-poort G1–G7 in `PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md` §3C is geschreven voor **aggregatie en modelverbetering** (k-anonimiteit, drempel van 500+). **Een LLM die per verzoek de eigen invoer van één gebruiker interpreteert, is een ander verwerkingsdoel, en dat dekken de bestaande besluiten niet.** De enige regel die er direct over gaat (G5: "bij een externe LLM-API geen PII in de payload") en de algemene stop ("geen LLM op persoonsdata vóór 500+") verbieden het. Vrije tekst over eten is per definitie art. 9 en is niet te anonimiseren: "ik ben zwanger en eet…" staat gewoon in de zin.

Om het toe te staan zijn dus nodig:

1. **Een besluit door Dennis** dat per-verzoek-interpretatie een apart doel is, los van het aggregatiespoor, en vastgelegd in `docs/plan/`.
2. **Een juridische toets** (in de DPIA staan al punten die nog "⚖️ jurist te bevestigen" zijn).
3. **Een DPIA-aanvulling en een nieuwe rij in het verwerkingsregister.** Vandaag blijven alle art. 9-gegevens bij verwerkers in de EU (Supabase Frankfurt, Hetzner; `VERWERKINGSREGISTER.md`).
4. **Een verwerker met verwerking in de EU en een verwerkersovereenkomst.** Feit om mee te wegen: de eigen API van Anthropic kent de parameter `inference_geo` met de waarden `"us"` en `"global"`, maar **geen EU-waarde**. EU-verwerking van Claude loopt via een cloudplatform met een EU-regio (Google Vertex AI met de multi-regio `"eu"` of een specifieke regio; Amazon Bedrock in een EU-regio). `inference_geo` werkt daar niet: de regio van het platform bepaalt de locatie. **Contractueel te verifiëren op het moment van besluiten**, niet aan te nemen.
5. **Een eigen toestemmingstype** (bijv. `nutrition_text_ai`), vastgelegd in `consent_records.account_id`, met een versie, intrekbaar, en met fase 1 als terugval zonder toestemming.
6. **Data-minimalisatie in de payload:** alleen de invoerzin en de gesloten vocabulaire. Geen account-id, geen e-mail, geen naam, geen profiel.

### 6.2 Als het besluit er komt: zo zit de LLM erin

- **Alleen stap [2].** De LLM levert hetzelfde `InterpretationResult` als de regelparser. Stap [3] tot en met [10] veranderen niet.
- **Gestructureerde output:** een tooldefinitie met `strict: true` of `output_config.format` (JSON-schema met `additionalProperties: false`). **Daarna tóch valideren op de server:** elke sleutel moet in de catalogus staan, anders valt hij eraf.
- **Gesloten vocabulaire in de prompt:** de catalogus (sleutels en labels, geen persoonsdata) staat vooraan en is stabiel, en dus te cachen. Per verzoek komt alleen de zin erbij.
- **Terugval:** ongeldige output → één nieuwe poging → daarna het resultaat van de regelparser. De gebruiker ziet nooit een fout door het model.
- **Weigeren of timeout:** hetzelfde terugvalpad; controleer `stop_reason` vóór het lezen.
- **Versies en herleidbaarheid:** `interpreter.model` en `promptVersion` gaan mee in het event (§8), **zonder** de tekst.
- **Streaming:** niet nodig. De output is klein en gestructureerd; een korte laadtoestand volstaat.
- **Modelkeuze:** een beslispunt. Eerst meten op een evaluatieset van **synthetische** Nederlandse voedselzinnen (dezelfde gouden set als de tests van fase 1, §11), met kosten per interpretatie en het aandeel dat goed wordt opgelost, en pas dan kiezen.
- **Nooit:** gehaltes, percentages, adviezen of claims genereren. Het contract heeft er geen veld voor (§3.3), en de validator weigert onbekende velden.

### 6.3 Trigger voor fase 2

~~Pas bespreken als fase 1 minstens 4–6 weken draait én het aandeel **onopgeloste spans** (uit het event in §8) de grootste bron van uitval in de tekstinvoer blijkt. Als de regelparser 85% oplost, dan voegt een LLM vooral kosten en een DPIA-last toe.~~ *Vervallen op 25 sep — zie `BESLUIT_LLM_CHAT_VOEDING_2026-09.md`.*

### 6.4 Chat op de check (`/intake`) — eerste LLM-plek

**Uitkomst = precies wat `nutrition-log` nu al accepteert:** `{ sliders, allergies, preference }`. De chat is een andere manier om die 14 antwoorden te verzamelen. De scoring (`nutrition-score.ts` → `nutrition-intake-estimate.ts`), het resultaat en "Past bij jou" blijven hetzelfde.

**Contract per beurt:**

```ts
// src/lib/check-chat/contract.ts (voorstel)
export type CheckChatTurn = {
  contractVersion: "checkchat.v1";
  /** Korte gesprekstekst (max ±300 tekens). Gefilterd; bij twijfel vervangen door de vaste vraagtekst. */
  reply: string;
  /** Alleen bestaande vraag-ids, alleen een stop-index binnen het bereik van die vraag. */
  updates: { questionId: SliderId; stopIndex: number; zekerheid: "genoemd" | "afgeleid" }[];
  meta?: { allergies?: AllergyValue[]; preference?: "none" | "pescatarian" | "vegetarian" | "vegan" };
  /** De volgende open vraag; null = alles beantwoord → samenvatting. */
  nextQuestionId: SliderId | "allergies" | "preference" | null;
};
```

**Wat het model krijgt:** per vraag de id, de vaste vraagtekst, de stops met hun labels en het `help`-blok (bron en benchmark) uit `lifescore-questions.ts`. Dat is geen persoonsgegeven, staat stabiel vooraan en is dus te cachen. Daarna het concept tot nu toe en het laatste bericht van de gebruiker.

**Wat de server na elke beurt controleert:**

- `questionId` staat in de set van schuifjes.
- `stopIndex` ligt binnen `stops.length` van die vraag.
- De allergieën horen bij de vaste set.
- `reply` valt binnen de maximale lengte en komt door `FORBIDDEN_PHRASES_GLOBAL`.

Voldoet iets niet, dan valt dat onderdeel weg, en wordt `reply` vervangen door de vaste vraagtekst van `nextQuestionId`. **De chat loopt dus altijd door, desnoods als gescripte vragenlijst.** Een fout van het model, een weigering (`stop_reason`) of een timeout volgt hetzelfde pad.

**Wat het model niet mag:** iets zeggen over tekorten, dekking, supplementen of gezondheid. Dat staat op de resultaatpagina, uit de deterministische code. Het systeemprompt én het filter dwingen dat af; het contract heeft geen veld voor een oordeel.

**Einde van de chat:** een samenvatting "Zo heb ik je antwoorden begrepen", met de 14 antwoorden als de bestaande schuifjes. Ze zijn al ingevuld en aan te passen, en `afgeleid` is gemarkeerd. Daarna "Klopt — laat mijn resultaat zien" → de bestaande opslag in `nutrition-log` → de bestaande resultaatpagina. **Er wordt niets opgeslagen dat de gebruiker niet zag en bevestigde.**

**Toegang en kosten (V5/V6):**

- Toestemming voor de AI-chat plus Turnstile bij de eerste beurt; op dat moment wordt de sessie aangemaakt (sessiedocument §10).
- Daarna is de sessiecookie verplicht.
- Rate limit per sessie en IP, maximaal ±40 beurten en 500 tekens per bericht.
- De server bewaart geen gesprek: de client stuurt het concept en de laatste berichten mee.
- Knop **"Liever de schuifjes"** → de huidige flow, met de antwoorden die er al zijn ingevuld.

**Endpoint:** `POST /api/intake/check-chat`, een route handler, zonder streaming in v1 (korte antwoorden plus een typ-indicator).

**Meetpunt:** `nutrition.check_chat_started` en `nutrition.check_chat_completed`, met alleen tellingen: beurten, beantwoord, afgeleid, terugvallen, model en promptversie. Nooit tekst. Registratie op de drie plekken. Hier lees je het effect af: het aandeel voltooide checks via chat tegenover via de schuifjes.

**Nieuwe bestanden (bij de bouw):** `src/lib/check-chat/{contract,validate,prompt,provider}.ts`, `src/app/api/intake/check-chat/route.ts`, `src/components/intake/CheckChat.tsx`, plus een keuze-knop in `NutritionCapture.tsx`. **Nieuwe dependency:** `@anthropic-ai/sdk` of `@anthropic-ai/vertex-sdk`, afhankelijk van V1. Dat is een uitbreiding van de stack, en die komt pas met Dennis' keuze bij V1.

---

## 7. API-architectuur

| Endpoint | Nieuw? | Doet | Schrijft |
|---|---|---|---|
| `POST /api/account/nutrition-input/interpret` | nieuw | `{ text, entryDate, openMoment? }` → `DaybookProposal`. Account verplicht, rate limit, invoer maximaal ±500 tekens. | **nee** |
| `POST /api/account/nutrition-daybook` | bestaat | slaat de dag op, inclusief `items` (met `invoer`/`portie`) | ja (enige schrijfpad) |
| `GET /api/account/nutrition-daybook` | bestaat | dagen lezen | — |

- **Waarom het account verplicht is:** het dagboek is al alleen voor accounts; toestemming, verwijdering en isolatie gaan via `account_id` (intrekken ontkoppelt of cascadeert); en de rekenkosten (in fase 2) blijven gebonden aan een geverifieerde identiteit.
- **Idempotentie:** `proposalId` wordt bij bevestiging meegestuurd; de dag wordt op `(account_id, entry_date)` ge-upsert, dus twee keer bevestigen levert geen dubbele registratie op zolang de client de volledige dag stuurt (zoals nu).
- **Route handlers, geen server actions**, conform de rest van de consumentenkant.

## 8. Meetpunten

Er komt één nieuw event en de rest is hergebruik (CLAUDE.md: bestaande types eerst):

- **Nieuw:** `nutrition.dagboek_tekst_geinterpreteerd`, met alleen tellingen: `mentions`, `opgelost`, `aangenomen`, `meerduidig`, `onbekend`, `interpreter_kind`, `interpreter_version`. **Nooit de tekst**, geen productsleutels van onopgeloste spans. Het wordt op de drie plekken geregistreerd (`events.ts`, `intake-events-client.ts`, allowlist in `api/intake/events/route.ts`).
- **Hergebruik:** `nutrition.dagboek_portie_bevestigd` en `nutrition.dagboek_day_saved`, met `surface: "tekstinvoer"`.
- **Hier lees je het effect af:** het aandeel van de dagen dat via tekst wordt opgeslagen, en de ratio `dagboek_opened → dagboek_day_saved` vóór en na.

## 9. UI-architectuur

- **Plek:** de Dagboek-tab, boven de bestaande maaltijdblokken (`DagboekScherm.tsx`). Geen aparte chatpagina en geen doorlopende chatgeschiedenis in fase 1.
- **Vorm:** één invoerveld ("Wat at je?") → het antwoord is geen chattekst maar een **rij chips per eetmoment**: `[Havermout · 40 g ±] [Banaan · 1 stuk] [Melk · 1 glas] [Brood · 2 sneden] [Kaas ▾]`. Tik op een chip = de bestaande `DagboekPortieInvoer`.
- **Contextkaarten** (het idee uit de opdracht, binnen de regels):
  - *Wat we aannamen* — alleen de chips met `aangenomen`, met één tik om te wijzigen.
  - *Nog één vraag* — hooguit één `ClarifyingQuestion` of `nextProfileQuestion`, met vaste opties als knoppen.
  - *Vandaag tot nu toe* — de bestaande `DagboekNutrientBalken`/`DagboekRingen`: **"minstens"**, een ✓ bij bewezen dekking, nooit een kruis, geen oordeel voor zink en vitamine D (C3).
- **Tekst in de UI** volgt `WRITING_VOICE.md`; in fase 1 is alle copy vaste copy (templates), er wordt niets gegenereerd.
- **Mobiel (375 px):** chips lopen door op de volgende regel, het invoerveld blijft onderin in beeld; binnen tegels `@container` gebruiken, geen `lg:`.

## 10. Wat níét veranderd moet worden

- `src/lib/intake-engine.ts`, `RULES_VERSION` 1.4.0 en de hermeting-deltalogica.
- `nutrition-score.ts` en `nutrition-intake-estimate.ts`: de check blijft een apart instrument; tekstinvoer voedt hem niet ("geen tweede score").
- De semantiek van `food-sources.ts` (de scheiding tussen `nutrientValue` en `amount`, `verified`, één bron per waarde, nooit middelen).
- `approved-claims.ts` en de claimgrens: geen claimtekst uit de tolk.
- `affiliate_clicks`, `/beste/*`, `DagboekSlot` en het 2+2-venster.
- **`chat-intake.ts` / `/api/intake/chat` niet als basis gebruiken:** daar houdt de client de state vast en vertrouwt de server die, en de flow is gescript voor de oude brede check. Laten staan zoals het nu is, of in een aparte opruimplak verwijderen.
- `/api/chat` (evidence): een ander product (vragen over onderbouwing), niet samenvoegen.

## 11. Teststrategie

- **Gouden set** (`src/lib/__tests__/nutrition-text-parse.test.ts`): 150–300 **synthetische** Nederlandse zinnen → verwachte mentions (sleutel, aantal, portie, moment, status). Die set is later ook de evaluatieset voor fase 2. Geen echte gebruikersinvoer als testdata.
- **Unit:** tokenisatie, telwoorden, eenheden → gram via `porties`, synoniemen, eetmoment, meerduidigheid → precies één vraag.
- **Invarianten** (property-achtig): elke voorgestelde `key` bestaat in de catalogus; een `InterpretationResult` bevat geen enkel getal behalve hoeveelheden en posities; zonder bevestiging wordt niets opgeslagen.
- **Integratie:** `interpret` → voorstel → `nutrition-daybook` POST → `nutrientenUitItems` levert dezelfde ondergrens als dezelfde items via de zoekfunctie ingevoerd.
- **Regressie:** de bestaande dagboektests en `nutrition-food-index.test.ts` blijven groen; oude items zonder `invoer`/`portie` lezen als `zoeken`/`gekozen`.
- **E2E:** handmatig op localhost, 375 px (er is geen Playwright).

## 12. Bestanden die waarschijnlijk veranderen (fase 1)

| Nieuw | Gewijzigd |
|---|---|
| `src/data/nutrition/food-synonyms.ts` | `src/lib/nutrition-dagboek-items.ts` (`invoer`, `portie` + sanitize) |
| `src/lib/nutrition-text-parse.ts` | `src/components/dashboard/dagboek/DagboekScherm.tsx` (invoerveld inbouwen) |
| `src/lib/nutrition-text-interpret.ts` (contract + resolver) | `src/lib/events.ts`, `src/lib/intake-events-client.ts`, `src/app/api/intake/events/route.ts` (event) |
| `src/lib/nutrition-reference.ts` (één lezer, §5) | `docs/core/DPIA.md` alleen in fase 2 |
| `src/app/api/account/nutrition-input/interpret/route.ts` | |
| `src/components/dashboard/dagboek/DagboekTekstInvoer.tsx` | |
| tests bij elk van de bovenstaande | |

Geen migraties. Geen nieuwe dependencies in fase 1 (Zod pas overwegen bij fase 2, en dat is dan een stack-beslissing voor Dennis).

## 13. Aanbevolen volgorde

1. **Het sessiedocument, S0–S3** (`BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md`). Dat raakt de funnel direct: de enige ingang slaat dan eindelijk op.
2. **De USDA-/NEVO-verificatie** (plak 1 van het voedingsfocus-besluit). Zonder geverifieerde getallen voegt makkelijker invoeren weinig toe.
3. **Tekstinvoer fase 1: "nu niet, met trigger".** Trigger: de dagboekevents laten zien dat de **invoer** het afhaakpunt is (lage ratio `dagboek_opened → dagboek_day_saved` bij gebruikers die het dagboek wél openen). Dan in drie plakken: (a) parser, synoniemen en gouden set, zonder UI; (b) interpret-route plus meetpunt; (c) invoer-UI in de Dagboek-tab.
4. **Fase 2 (LLM): pas na besluit C1 en de trigger uit §6.3.**

## 14. Beslispunten voor Dennis

1. **C1:** wil je het LLM-besluit heropenen voor *per-verzoek-interpretatie van de eigen invoer*, als apart doel naast het aggregatiespoor? Zo ja, dan eerst de jurist en de DPIA, en een EU-route (§6.1). Zo nee, dan stopt dit ontwerp bij fase 1.
2. **C2–C4:** bevestig dat kcal, macro's, dagtotalen en dagelijks alles loggen buiten scope blijven, zodat een volgende sessie dat niet opnieuw opent.
3. **Account verplicht voor tekstinvoer?** *Aanbeveling: ja.*
4. **Geen transcripten opslaan?** *Aanbeveling: ja, niet opslaan.*
5. **De trigger voor fase 1** (§13, punt 3): akkoord, of wil je fase 1 nu al, en waarom?
6. **Validatie:** de handgeschreven `sanitize*`-stijl aanhouden *(aanbeveling voor fase 1)*, of Zod toevoegen (een stack-wijziging)?
