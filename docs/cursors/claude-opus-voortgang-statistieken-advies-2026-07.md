# Voortgang → Statistieken → Supplementadvies — architectuur (Fase A)

**Datum:** 28 juli 2026 · **Model:** Claude Opus 5 · **Type:** analyse + architectuur, geen code
**Scope:** Dashboard → Voortgang: herpositionering Statistieken / Favorieten / Hub rond het stepped-care-advies

---

## Correcties op de uitgangsnotitie

Twee aannames uit het voorbereidende plan kloppen niet met de code. Ze maken het werk goedkoper én duurder op andere plekken.

**1. `VerdictEvidence` wórdt al opgeslagen.** De notitie stelt: "wordt niet opgeslagen in DB — alleen reasonKey blijft over". Dat is niet zo. `supplement-verdict-store.ts:91` schrijft `p_based_on: verdict.evidence` naar de kolom `supplement_verdicts.based_on` (jsonb), en de migratie `20260728120000_supplement_verdicts.sql` documenteert die kolom expliciet als reproduceerbaarheids-snapshot. Wat ontbreekt is uitsluitend de **leesrichting**: `VERDICT_SELECT` in dezelfde file laat `based_on` weg, en `StoredSupplementVerdict` (`types/verdict.ts`) heeft er geen veld voor. Er is dus **geen migratie nodig** — sectie G wordt een select-uitbreiding in plaats van een schemawijziging.

**2. De voeding-eerst-ladder heeft wél een datawijziging nodig.** `account-dashboard.ts:409-424` reduceert de opgeslagen `IntakeEstimate[]` tot `{ label, band, previousBand }` — het veld `nutrient` sneuvelt. `buildNutritionAdvice()` vereist juist `IntakeEstimate[]` met `nutrient`. De ladder kan dus niet uit de huidige `DashboardData` worden gebouwd zonder label→nutriënt terug te raden (fragiel). Slice 1 heeft een kleine, veilige uitbreiding van de dataloader nodig.

---

## A. VERDICT — aanbeveling SSOT-model

### Antwoord op de kernvraag

**Nee — de check-in van vandaag mag geen absolute waarheid zijn voor supplementadvies.** Niet uit voorzichtigheid, maar omdat de drie lagen verschillende dingen meten en verschillende houdbaarheden hebben.

### De drie modellen

**Model 1 — Vandaag overschrijft alles**

De dagelijkse domein-check-in herberekent de verdicts.

| | |
|---|---|
| Vóór | Voelt levend; "je slaapt slecht deze week → magnesium" is intuïtief |
| Tegen | `supplement_verdicts` is append-only: elke omslag schrijft een rij. Een gebruiker die wisselend slaapt genereert dagelijks kopen↔niet_nodig-flips en een onleesbare historie |
| Tegen | `VERDICT_REVIEW_DAYS` (90 dagen bij `kopen`, 30 bij `eerst_leefstijl`) wordt betekenisloos als het oordeel elke dag kan kantelen |
| Tegen | Backend ondersteunt het niet: `syncSupplementVerdicts()` voedt zich met `data.current.scores` — een snapshot van de laatste volledige check. Check-ins landen in `intake_domain_checkin` en voeden `series`/`domainCheckDaysAgo`, niet `current.scores` |
| Tegen | **Merk- en complianceschade.** Een koopadvies dat meebeweegt met een slechte nacht is reactieve verkoop, geen stepped care. Dit is precies het gedrag waartegen "de Consumentenbond van supplementen" zich positioneert |

**Model 2 — Gelaagd (aanbevolen)**

Baseline (laatste volledige leefstijlcheck × laatste voedingslog × rules_version) bepaalt supplementoordelen. De daglaag bepaalt focus, urgentie en toon — nooit het oordeel.

| | |
|---|---|
| Vóór | Sluit aan op wat er al draait: `syncSupplementVerdicts()` is idempotent en schrijft alleen bij een echte omslag (`supplement-verdict-store.ts:74-83`). Nul backend-werk voor slice 1–3 |
| Vóór | De voedingslog-poort blijft de scherpe conversieknop: zodra `nutritionLogCompleted` waar wordt, kantelt `nutrition_log_incomplete` → `trigger_matched`/`no_trigger_matched`. Dat is het moment waarop het advies "aangaat" |
| Vóór | Historie blijft leesbaar: elke rij in `supplement_verdicts` markeert een betekenisvolle verandering |
| Tegen | Vraagt copy-discipline: de UI moet expliciet zeggen wáárop een oordeel rust, anders leest een gebruiker die vandaag incheckte het als "hij weet het van vandaag" |

**Model 3 — Alleen volledige hermeting verandert oordelen**

| | |
|---|---|
| Vóór | Maximale stabiliteit, simpelste mentale model |
| Tegen | Breekt de conversieketen. De voedingscheck zou dan géén verdict meer kunnen ontgrendelen, terwijl `canShowSupplementStrip()` juist daarop gebouwd is. Een gebruiker die net zijn voeding invulde ziet niets veranderen — de belangrijkste beloningslus van het product valt weg |

### Gekozen: Model 2, met een expliciete definitie

Drie lagen, drie snelheden:

| Laag | Bron | Verandert | Voedt |
|---|---|---|---|
| **Baseline-oordeel** | Laatste volledige check (`data.current.scores`, `data.answers`) × `data.nutritionIntake` × `rulesVersion` | Bij hermeting, bij nieuwe voedingslog, bij regelwijziging | Supplement wel/niet, evidence, ladder |
| **Daglaag** | `intake_domain_checkin`, `daily_action_log`, `domainCheckDaysAgo` | Dagelijks | Focus op Vandaag, "dit domein is X dagen niet ververst"-nudge, urgentietoon |
| **Regellaag** | `RULES_VERSION`, `approvedClaims`, beschikbaarheid vergelijking | Bij deploy | Kan elk oordeel overrulen (`nooit`, `eerst_leefstijl`) |

De daglaag mag één ding met het advies doen: **de actualiteit ervan aanvechten.** Niet "je hebt nu magnesium nodig", maar "je slaapdomein is 21 dagen niet ververst — een hermeting kan dit oordeel veranderen". Dat is eerlijk, het is bruikbaar, en het duwt naar hermeting in plaats van naar de winkelwagen.

### Backend-impact

| Bestand | Slice 1–3 | Slice 4 |
|---|---|---|
| `lib/supplement-verdict.ts` | ongewijzigd | ongewijzigd |
| `lib/supplement-verdict-producer.ts` | ongewijzigd | ongewijzigd |
| `lib/supplement-verdict-store.ts` | `based_on` toevoegen aan `VERDICT_SELECT` | — |
| `types/verdict.ts` | `basedOn` op `StoredSupplementVerdict` | — |
| `lib/account-dashboard.ts` | `nutrient` doorgeven in `nutritionIntake.items` | — |
| `lib/intake-engine.ts` | **niet aanraken** | niet aanraken |
| migraties | **geen** | geen |

Slice 4 uit het oorspronkelijke plan ("SSOT-wijziging check-in → verdict") **vervalt** als productiewerk. Wat overblijft is de veel kleinere versheids-indicator, die in slice 1 past.

---

## B. Informatiemodel

Wat elk scherm nodig heeft, gemapt op bestaande types. Alles komt uit `DashboardData` / `DashboardModel` tenzij anders vermeld.

### Statistieken

| Blok | Velden | Herkomst | Status |
|---|---|---|---|
| Waar sta je | `model.domainScores`, `model.priority`, `model.vitality` | `DashboardModel` | bestaat |
| Versheid | `data.domainCheckDaysAgo`, `data.cycleEvidence`, `data.remeasure` | `DashboardData` | bestaat |
| Evidence per domein | `verdict.basedOn.triggeredBy` → `QuestionId[]` → `LEEFSTIJLCHECK_EVIDENCE_BY_ID` | `based_on` + `data/leefstijlcheck-evidence.ts` | **leesrichting ontbreekt** |
| Voeding-eerst ladder | `IntakeEstimate[]` → `buildNutritionAdvice()` | `account-dashboard.ts` | **`nutrient` ontbreekt in `DashboardData`** |
| Verdict-samenvatting | `data.supplementVerdicts` → `buildVerdictCards()` | bestaat | bestaat, staat op verkeerd scherm |
| Trends (premium) | `HistorySection`, `StatistiekenPriorityOverTime`, `SignalsSection` | `Dashboard.tsx:3527-3538` | bestaat |

### Favorieten

| Blok | Velden | Herkomst |
|---|---|---|
| Eigen voorkeur | `data.priorityPref` (nu enige "keuze"-signaal); bookmarks bestaan nog niet | `AccountPriorityPrefData` |
| Kompas-aanbeveling | `buildRecommendations(session, eligibility)` | `lib/build-recommendations.ts` |
| Volledige oordeel-lijst | `data.supplementVerdicts` → `buildVerdictCards()` + `buildVerdictSummary()` | bestaat |

### Hub

| Blok | Velden |
|---|---|
| Reis-strip | `data.cycleEvidence.{activeDays, cycleDay}`, `data.remeasure.daysUntil`, `model.history.length` |
| Wat veranderde | `data.deltaReport`, `nutritionIntake.items[].previousBand` |

### Eén nieuw afgeleid viewmodel

Een pure mapper (voorstel: `lib/statistieken-advies-model.ts`) die `DashboardData` + `DashboardModel` omzet naar één viewmodel met vier velden: `snapshot`, `evidencePerDomain`, `nutritionLadder`, `verdictSummary`. Geen I/O, geen React — testbaar zonder render. Dit houdt `VoortgangHub.tsx` dun en voorkomt dat `Dashboard.tsx` (nu ~4000 regels) verder groeit.

---

## C. STATISTIEKEN — IA + wireframe

### Positioneringsverschuiving

Statistieken is nu een premium-voorportaal: de hubkaart belooft letterlijk "trends met Premium" (`VoortgangHub.tsx:1094-1097`) en het scherm opent met "Gebaseerd op je gratis test en ingevulde tijdlijn" gevolgd door een blur-upsell. Een gratis gebruiker heeft daar weinig te halen.

Nieuwe belofte: **Statistieken is waar het Kompas uitlegt wat het ziet en wat dat betekent — gratis. Premium is hoe dat over tijd beweegt.**

De hubkaart-ondertitel moet daarom mee veranderen (zie sectie E), anders komt de gratis gebruiker er nooit.

### Narratief

Vier gratis blokken vertellen één verhaal, in deze volgorde:

> **waarom dit domein** → **eerst je bord** → **helpt een potje** → **welke dan**

Elk blok beantwoordt de vraag die het vorige oproept. Blok 5 (premium) beantwoordt een andere vraag — "beweegt het?" — en staat daarom pas ná de afronding van het gratis verhaal.

### Wireframe — 375px

```
┌───────────────────────────────────────────┐
│ ←   STATISTIEKEN                          │
├───────────────────────────────────────────┤
│                                           │
│  ── BLOK 1 · WAAR STA JE ──────────────   │
│  ┌─────────────────────────────────────┐  │
│  │ OP BASIS VAN JE CHECK VAN 12 JULI   │  │
│  │                                     │  │
│  │ Slaap en voeding vragen             │  │
│  │ nu je aandacht                      │  │
│  │                                     │  │
│  │ Slaap      ▓▓▓▓▓░░░░░  48   ⚠ zwak  │  │
│  │ Voeding    ▓▓▓▓▓▓░░░░  56   ⚠ zwak  │  │
│  │ Stress     ▓▓▓▓▓▓▓▓░░  74           │  │
│  │ Beweging   ▓▓▓▓▓▓▓▓░░  71           │  │
│  │ Verbinding ▓▓▓▓▓▓▓░░░  66           │  │
│  │                                     │  │
│  │ ⓘ Slaap is 21 dagen niet ververst.  │  │
│  │   Een hermeting kan dit beeld —     │  │
│  │   en het advies hieronder —         │  │
│  │   veranderen.       [Check slaap →] │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ── BLOK 2 · WAAROM DIT TELT ──────────   │
│  ┌─────────────────────────────────────┐  │
│  │ WAT DE WETENSCHAP HIEROVER ZEGT     │  │
│  │                                     │  │
│  │ ▸ Slaap                    ★★★★★    │  │
│  │ ▸ Voeding                  ★★★★☆    │  │
│  └─────────────────────────────────────┘  │
│         ↓ (uitgeklapt: één domein)        │
│  ┌─────────────────────────────────────┐  │
│  │ ▾ Slaap                    ★★★★★    │  │
│  │                                     │  │
│  │ Waarom we dit vroegen               │  │
│  │ Slaapkwaliteit voorspelt herstel    │  │
│  │ en energie overdag sterker dan      │  │
│  │ slaapduur alleen.                   │  │
│  │                                     │  │
│  │ Jouw antwoord wees op:              │  │
│  │ moeite met doorslapen               │  │
│  │                                     │  │
│  │ Sterkte van dit signaal             │  │
│  │ ★★★★★ — meta-analyses               │  │
│  │                                     │  │
│  │ Bron                                │  │
│  │ Chaput et al. (2020). Sleep         │  │
│  │ timing, quality... doi:10.xxxx      │  │
│  │                                     │  │
│  │ ⓘ Sterren zeggen iets over de       │  │
│  │   kracht van dit signaal — niet     │  │
│  │   over de zekerheid van jouw score. │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ── BLOK 3 · EERST JE BORD ────────────   │
│  ┌─────────────────────────────────────┐  │
│  │ STAP 1 VAN 3 · UIT VOEDING          │  │
│  │                                     │  │
│  │ Dit haal je van tafel               │  │
│  │                                     │  │
│  │ 🥗 Magnesium         onder referentie│ │
│  │    Voeg dagelijks een handje        │  │
│  │    noten of een portie peulvruchten │  │
│  │    toe.                             │  │
│  │                                     │  │
│  │ 🐟 Omega-3           onder referentie│ │
│  │    Twee keer per week vette vis.    │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ── BLOK 4 · EN DAN PAS EEN POTJE ─────   │
│  ┌─────────────────────────────────────┐  │
│  │ STAP 2 VAN 3 · ONS OORDEEL          │  │
│  │                                     │  │
│  │ Van 6 supplementen voegen er        │  │
│  │ 2 iets toe voor jou                 │  │
│  │                                     │  │
│  │ ● Magnesium            AANVULLEN    │  │
│  │   Je check laat een reden zien om   │  │
│  │   dit aan te vullen naast je        │  │
│  │   leefstijl.                        │  │
│  │   ▸ waarop dit rust                 │  │
│  │                                     │  │
│  │ ● Omega-3              AANVULLEN    │  │
│  │   ...                               │  │
│  │                                     │  │
│  │ ○ Ashwagandha          NIET NODIG   │  │
│  │   Je check laat geen reden zien.    │  │
│  │   Dat scheelt je geld.              │  │
│  │                                     │  │
│  │ [ Alle 6 oordelen + vergelijking → ]│  │
│  │                        (Favorieten) │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┈┈┈┈┈┈ einde gratis advies ┈┈┈┈┈┈┈┈┈┈┈  │
│                                           │
│  ── BLOK 5 · PREMIUM ──────────────────   │
│  ┌─────────────────────────────────────┐  │
│  │ 🔒 PREMIUM                          │  │
│  │ Beweegt het de goede kant op?       │  │
│  │                                     │  │
│  │ ░░░ geblurde trendgrafiek ░░░       │  │
│  │                                     │  │
│  │ · je lijn over 3 metingen           │  │
│  │ · wat veranderde sinds vorige check │  │
│  │ · welk advies daardoor kantelde     │  │
│  │                     [Meer weten →]  │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 👤 Lichaamssamenstelling   🔒PREMIUM│  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

### Poortstaat: voeding nog niet ingevuld

Blok 4 is dan geen lijst maar één poortkaart. Dit is de belangrijkste conversiestaat van het hele scherm.

```
┌─────────────────────────────────────┐
│ STAP 2 VAN 3 · NOG NIET TE ZEGGEN   │
│                                     │
│ Zonder je voeding kunnen we         │
│ niets zinnigs zeggen                │
│                                     │
│ We beoordelen 6 supplementen. Voor  │
│ alle 6 geldt nu hetzelfde: eerst    │
│ weten wat er van tafel komt.        │
│                                     │
│ [ Vul je voeding in (1 min) ]       │
│                                     │
│ Wij verkopen zelf niets. Deze stap  │
│ leidt vaak tot "niet nodig" — en    │
│ dat is ook een antwoord.            │
└─────────────────────────────────────┘
```

Blok 3 blijft in deze staat leeg-met-uitleg, niet verborgen: "Zodra je voeding bekend is, staat hier wat je van tafel kunt halen."

### Desktop (≥1024px)

Twee kolommen, maar het narratief blijft één leesrichting:

```
┌──────────────────────────────────────────────────────────────────┐
│  ←  STATISTIEKEN                                                 │
├────────────────────────────────────┬─────────────────────────────┤
│  BLOK 1 · Waar sta je              │  BLOK 3 · Eerst je bord     │
│  (domeinbalken, versheid)          │  (ladder stap 1)            │
│                                    │                             │
│  BLOK 2 · Waarom dit telt          │  BLOK 4 · Ons oordeel       │
│  (evidence, accordeon)             │  (verdicts, max 3 + link)   │
├────────────────────────────────────┴─────────────────────────────┤
│  BLOK 5 · PREMIUM — trends over de volle breedte                 │
└──────────────────────────────────────────────────────────────────┘
```

Links = wat we zien en waarom het telt. Rechts = wat je ermee doet. De premium-band ligt onder beide, visueel gescheiden.

### Gratis vs. premium — de grens expliciet

| | Gratis | Premium |
|---|---|---|
| Domeinscores nu | ✅ | |
| Evidence + bron per domein | ✅ | |
| Voeding-eerst ladder | ✅ | |
| Supplement wel/niet + reden | ✅ | |
| Link naar vergelijking | ✅ | |
| Verloop over meerdere metingen | | 🔒 |
| Wat veranderde sinds vorige check | | 🔒 |
| Welk oordeel daardoor kantelde | | 🔒 |
| Lichaamssamenstelling | | 🔒 |

Regel: **de premium-grens loopt langs de tijdas, niet langs het advies.** Alles wat "nu" is, is gratis. Alles wat "beweging" is, is premium. Dat is verdedigbaar naar de gebruiker en beschermt de merkbelofte.

---

## D. FAVORIETEN — IA + wireframe

### Probleem nu

`FavorietenView` (`VoortgangHub.tsx:285-469`) doet drie dingen zonder ze te scheiden: `SupplementVerdictPanel` (ons oordeel), `buildRecommendations` (onze aanrader), en twee CTA's naar `/supplementen`. Het woord "Favorieten" belooft iets van de gebruiker; het scherm levert alleen iets van ons.

### Nieuwe verdeling

| Scherm | Perspectief | Grondslag |
|---|---|---|
| Statistieken | Wat wij zien | Kompas + evidence |
| Favorieten | Wat jij kiest, met onze mening ernaast | Voorkeur + oordeel |

### Wireframe — 375px

```
┌───────────────────────────────────────────┐
│ ←   FAVORIETEN                            │
├───────────────────────────────────────────┤
│                                           │
│  ── JOUW KEUZE ────────────────────────   │
│  ┌─────────────────────────────────────┐  │
│  │ WAAR JIJ NU AAN WERKT               │  │
│  │                                     │  │
│  │ 🌙 Slaap                            │  │
│  │    Zelf gekozen als focus           │  │
│  │                        [Wijzig →]   │  │
│  └─────────────────────────────────────┘  │
│  (leeg-staat: "Je hebt nog geen focus     │
│   gekozen. Het Kompas stelt Slaap voor.") │
│                                           │
│  ── ONZE AANRADER ─────────────────────   │
│  ┌─────────────────────────────────────┐  │
│  │ WAT WIJ ZOUDEN KIEZEN               │  │
│  │                                     │  │
│  │ 🧲 Magnesium                        │  │
│  │    Helpt bij vermoeidheid en        │  │
│  │    spierfunctie                     │  │
│  │                                     │  │
│  │ [ Vergelijk 8 magnesium-potjes → ]  │  │
│  │                                     │  │
│  │ ⓘ Waarom dit? → Statistieken        │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ── ALLE OORDELEN ─────────────────────   │
│  ┌─────────────────────────────────────┐  │
│  │ We beoordeelden 6 supplementen.     │  │
│  │ Bij 4 is ons antwoord: niet kopen.  │  │
│  │                                     │  │
│  │ ● Magnesium         AANVULLEN       │  │
│  │   reden + [vergelijking →]          │  │
│  │ ● Omega-3           AANVULLEN       │  │
│  │ ○ Vitamine D        EERST LEEFSTIJL │  │
│  │ ○ Ashwagandha       NIET NODIG      │  │
│  │ ○ Creatine          NIET NODIG      │  │
│  │ ○ [ingrediënt]      RADEN WE NIET AAN│ │
│  │                                     │  │
│  │ Op basis van je laatste check.      │  │
│  │ Adviezen, geen diagnoses.           │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  [ Alle supplementen bekijken ]           │
└───────────────────────────────────────────┘
```

### Wat verhuist

| Element | Van | Naar |
|---|---|---|
| `SupplementVerdictPanel` (volledig, 6 items) | Favorieten, bovenaan | Favorieten, **onderaan** als "alle oordelen" |
| Verdict-samenvatting (max 3 + link) | — | **Statistieken blok 4** (nieuw) |
| `buildRecommendations`-lijst | Favorieten, midden | Favorieten, blijft — maar teruggebracht tot **de top-1** met expliciet "wat wij zouden kiezen" |
| Voedingscheck-CTA | Favorieten (fallback-knop) | **Statistieken blok 4** als primaire poort; op Favorieten alleen als het oordeel-blok leeg is |
| "Waarom dit?" | ontbreekt | nieuwe link Favorieten → Statistieken |

De verdict-lijst staat straks op twee plekken. Dat is bewust en het is geen doublure zolang de framing verschilt: Statistieken toont **max 3, met evidence-koppeling, als conclusie van een redenering**. Favorieten toont **alle 6, plat, als naslag**. De link tussen beide loopt beide kanten op.

---

## E. VOORTGANG HUB — de reis

### Probleem nu

De hub heeft drie kaarten (`PremiumWaitlistCard`, Favorieten, Statistieken) en geen reis. Het scherm `inzichten` bestaat in `VoortgangScreen` maar heeft **geen hubkaart** — het is alleen bereikbaar via een andere route. Dat is een IA-lek: een scherm dat in de navigatiestructuur zit maar niet in de navigatie.

### Voorstel: één strip + drie kaarten

```
┌───────────────────────────────────────────┐
│  VOORTGANG                                │
│  Zo volg je je vooruitgang                │
│  Op basis van je check, je tijdlijn en    │
│  je hermetingen.                          │
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  ●━━━━━━━━━━━━━●━━━━━━━━━━━━○       │  │
│  │  Check         Nu           Her-    │  │
│  │  12 jul        dag 16       meting  │  │
│  │                             14 dgn  │  │
│  │                                     │  │
│  │  2 checks gedaan · 16 dagen bezig   │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 📊 Statistieken                  →  │  │
│  │    Wat je check laat zien — en wat  │  │
│  │    dat betekent voor supplementen   │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ ❤️ Favorieten                    →  │  │
│  │    Jouw keuze, met onze mening      │  │
│  │    ernaast                          │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ ✨ Jouw inzichten                →  │  │
│  │    Je vitaalscore en wat eronder    │  │
│  │    zit                              │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ PremiumWaitlistCard (ongewijzigd)   │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

Drie wijzigingen:

1. **Reis-strip toegevoegd** — puur uit bestaande velden (`cycleEvidence`, `remeasure`, `model.history.length`). Geen score, geen "Future You", geen voorspelling: alleen waar je vandaan komt, waar je bent, wanneer de volgende meting is.
2. **Inzichten krijgt een kaart** — lost het navigatielek op.
3. **Statistieken-ondertitel herschreven** — van "trends met Premium" naar de gratis belofte. Dit is de kleinste wijziging met het grootste effect: zonder dit vindt een gratis gebruiker het nieuwe advies-blok nooit.
4. **PremiumWaitlistCard zakt naar onderen** — het is nu de eerste kaart, wat de hub een verkoopscherm maakt in plaats van een reisscherm.

Reis-metafoor zonder score: de strip toont *ritme*, niet *prestatie*. "Dag 16" is geen cijfer waarop je kunt zakken.

---

## F. UNIEKE SITUATIE / OMSTANDIGHEDEN

### De vraag achter de vraag

"Wanneer het niet gaat door omstandigheden — welk supplement onderhoudt het lichaam dan het beste?" Dit is de gevoeligste plek van het hele product. Het antwoord mag nooit worden: "leefstijl lukt niet, dus koop dit." Dat is precies de redenering van de industrie waartegen PerfectSupplement zich positioneert.

### De eerlijke formulering

Een supplement compenseert geen leefstijl. Wat het wél kan: **een specifiek tekort overbruggen terwijl de leefstijl er nog niet is.** Dat is een smallere, verdedigbare en EFSA-conforme claim — en het is toevallig ook wat de engine daadwerkelijk berekent.

### Wanneer welk oordeel — beslisregels

De logica bestaat al in `resolve()` (`supplement-verdict.ts:52-90`). De UI moet de vier uitkomsten alleen verschillend *framen*:

| Oordeel | reasonKey | Betekenis in mensentaal | UI-toon |
|---|---|---|---|
| `nooit` | `claim_forbidden` | Valt onder geneesmiddelenwet | Sluitend. Geen CTA. Wij nemen stelling |
| `nooit` | — | — | — |
| `eerst_leefstijl` | `claim_on_hold` | Geen goedgekeurde claim, verbod-risico | Afwachtend. "Wij wachten af" — geen belofte |
| `eerst_leefstijl` | `nutrition_log_incomplete` | Wij weten het nog niet | **Actiegericht.** Dit is de poort, geen oordeel |
| `eerst_leefstijl` | `comparison_unavailable` | Geen onderbouwde vergelijking | Eerlijk-onaf. "Hier hebben we nog geen oordeel over" |
| `niet_nodig` | `no_trigger_matched` | Geen reden gevonden | **Positief.** "Dat scheelt je geld" — dit is de merkbelofte in één zin |
| `kopen` | `trigger_matched` | Reden gevonden | Aanvullend, nooit vervangend. "Naast je leefstijl" |

Drie van deze zes reasonKeys leiden vandaag tot dezelfde visuele behandeling (`eerst_leefstijl` → oranje stip, label "Eerst leefstijl"). Dat is verwarrend: `nutrition_log_incomplete` is een oproep aan de gebruiker, `claim_on_hold` is een standpunt van ons, `comparison_unavailable` is een gat in onze dekking. Drie verschillende dingen onder één label.

**Aanbeveling:** splits `eerst_leefstijl` visueel op reasonKey — poort (actiegericht, met knop) vs. standpunt (neutraal, zonder knop). Geen nieuwe `VerdictValue`, alleen andere presentatie in `supplement-verdict-copy.ts`.

### Erkenning zonder diagnose

Eén kaart, alleen zichtbaar bij ≥2 zwakke domeinen (score < 50) én ≥14 dagen sinds laatste domeincheck — het patroon "het lukt even niet":

```
┌─────────────────────────────────────┐
│ ALS HET EVEN NIET LUKT              │
│                                     │
│ Drukke periodes bestaan. Je hoeft   │
│ niet alles tegelijk op te pakken.   │
│                                     │
│ Wat je nu wél kunt doen: kies één   │
│ domein, en laat de rest even.       │
│                                     │
│ Waar een supplement een gat kan     │
│ overbruggen, staat dat hierboven.   │
│ Waar het dat niet doet, zeggen we   │
│ dat ook.                            │
└─────────────────────────────────────┘
```

Geen symptomen, geen oorzaken, geen "stress kan leiden tot". Alleen erkenning + prioritering. Dit is de grens: de UI erkent een *situatie*, nooit een *toestand*.

---

## G. EVIDENCE-KOPPELING

### Antwoord op "moet VerdictEvidence worden opgeslagen?"

**Het wordt al opgeslagen.** `supplement-verdict-store.ts:91` geeft `p_based_on: verdict.evidence` mee aan de RPC; de kolom is `public.supplement_verdicts.based_on` (jsonb), toegelicht in de migratie als: *"domain scores, deficiency-signalen, profiellabel, getriggerde regels en eligibility op moment van oordeel"*.

Wat ontbreekt is de leesrichting:

1. `VERDICT_SELECT` (`supplement-verdict-store.ts:8-9`) noemt `based_on` niet
2. `VerdictRow` heeft geen `based_on`-veld
3. `StoredSupplementVerdict` (`types/verdict.ts:36-45`) heeft geen `basedOn`

Drie kleine wijzigingen, geen migratie, geen backfill-probleem (bestaande rijen hebben de kolom al gevuld sinds de feature live is).

Wel nodig: **defensief parsen.** `based_on` is jsonb met `default '{}'` en kan uit een oudere `rules_version` komen. Type het als `VerdictEvidence | null` en behandel een ontbrekende/lege snapshot als "geen evidence beschikbaar" → blok 2 valt terug op domeinniveau-evidence zonder vraagkoppeling.

### De brug: triggeredBy → evidence

```
StoredSupplementVerdict.basedOn.triggeredBy: RecommendationTriggerReason[]
   │
   ├─ { type: "domain_below", domain, score, threshold }
   │     └─→ domain (keyof DomainScores)
   │           └─→ QuestionId[]        ← ontbrekende schakel
   │                 └─→ LEEFSTIJLCHECK_EVIDENCE_BY_ID[qid]
   │                       └─→ whyThisQuestion · answerMeaning
   │                            strength.stars · references[]
   │
   ├─ { type: "signal", signal }        → geen vraagkoppeling; toon signaaltekst
   ├─ { type: "profile", label }        → geen vraagkoppeling; toon profieltekst
   ├─ { type: "pillar", pillarId }      → zelfde route als domain_below
   └─ { type: "hub_legacy", rule }      → niet tonen (interne regel)
```

### De ontbrekende schakel

`intake-engine.ts` bevat geen `Record<DomainId, QuestionId[]>` — de scoring noemt de vragen inline (`getAnswer(answers, "SLP_QUAL")` etc., rond regel 402-492). Er is dus geen bestaande map om te hergebruiken.

Twee opties:

| | Prefix-afleiding | Expliciete map |
|---|---|---|
| Hoe | `SLP_` → slaap, `STR_` → stress, `NUT_` → voeding, `MOV_` → beweging, `CON_` → verbinding, `NRG_` → energie, `RCV_` → herstel, `LIF_` → leefstijl | Nieuwe constante in `data/leefstijlcheck-evidence.ts` |
| Vóór | Nul onderhoud | Expliciet, testbaar, verdraagt uitzonderingen |
| Tegen | Breekt stil bij een nieuwe prefix of een vraag die twee domeinen voedt | Moet worden bijgehouden bij nieuwe vragen |

**Aanbeveling: expliciete map.** De transparantienotities in `leefstijlcheck-evidence.ts` documenteren al twee herindelingen (`STR_RCV` verhuisde van herstel naar stress; `RCV_PHYS` telt alleen fysiek herstel). Precies die uitzonderingen breken prefix-afleiding. De map hoort in `data/leefstijlcheck-evidence.ts`, naast de evidence zelf, met een test die faalt zodra een `QuestionId` in geen enkel domein zit.

### Sterrenweergave — compliance-detail

`LEEFSTIJLCHECK_STRENGTH_DISCLAIMER` zegt letterlijk dat sterren de *signaalsterkte per vraag* meten, en dat de domeinschaal-sterkte lager ligt. Een gemiddelde sterrenscore per domein tonen is daarmee inhoudelijk onjuist.

Regels voor blok 2:
- Toon sterren van **één representatieve vraag** (de hoogst scorende trigger), niet een domeingemiddelde
- Zet de disclaimer-strekking eronder als microcopy
- Nooit "betrouwbaarheid van je score" — altijd "sterkte van dit signaal"

### Hergebruik

`IntakeEvidenceDisclosure` (`components/intake/IntakeQuestion.tsx`) en `NutritionEvidenceDisclosure` bestaan. Voor het dashboard is een **read-only variant** nodig: geen vraagcontext, wel bron + sterren + waarom. Zelfde visuele taal, andere data-ingang.

---

## H. COPY-HIËRARCHIE

Regel: eyebrow = waar dit op rust · headline = de conclusie · body = max 2 zinnen.

### Statistieken

| Blok | Eyebrow | Headline | Body |
|---|---|---|---|
| 1 | `OP BASIS VAN JE CHECK VAN {datum}` | Slaap en voeding vragen nu je aandacht | Dit is je beeld van de laatste check. Niet van vandaag. |
| 1 versheid | — | — | Slaap is {n} dagen niet ververst. Een hermeting kan dit beeld veranderen. |
| 2 | `WAT DE WETENSCHAP HIEROVER ZEGT` | Waarom we hiernaar vroegen | (per domein, uit `whyThisQuestion`) |
| 3 | `STAP 1 VAN 3 · UIT VOEDING` | Dit haal je van tafel | (per nutriënt, uit `lifestyleAction`) |
| 4 | `STAP 2 VAN 3 · ONS OORDEEL` | Van {n} supplementen voegen er {m} iets toe voor jou | (per ingrediënt, uit `REASON_TEXT`) |
| 4 poort | `STAP 2 VAN 3 · NOG NIET TE ZEGGEN` | Zonder je voeding kunnen we niets zinnigs zeggen | Eerst weten wat er van tafel komt. Dat duurt een minuut. |
| 5 | `PREMIUM` | Beweegt het de goede kant op? | Je lijn over meerdere metingen, en welk advies daardoor kantelde. |

### Stepped-care-formuleringen

Vaste woordenschat — één zin per trede, consequent hergebruikt:

| Trede | Formulering |
|---|---|
| 1 | "Eerst je bord." |
| 2 | "Daarna gericht aanvullen." |
| 3 | "En dan pas: welk potje." |
| Aanvulling | "naast je leefstijl" — nooit "in plaats van" |
| Nee | "Dat scheelt je geld." |
| Poort | "Zonder je voeding kunnen we niets zinnigs zeggen." |
| Grondslag | "Op basis van je laatste check." |

### Verboden formuleringen

| Niet | Wel |
|---|---|
| "live gemeten", "we zien nu" | "op basis van je laatste check van {datum}" |
| "je hebt een tekort" | "onder de referentie-inname" |
| "dit verhelpt je vermoeidheid" | (uitsluitend de EFSA-claimtekst uit `getUsableClaims()`) |
| "betrouwbaarheid van je score" | "sterkte van dit signaal" |
| "je moet" | "wat je nu wél kunt doen" |
| "leefstijl lukt niet, dus…" | "waar een supplement een gat kan overbruggen" |

Bronregel: alle claimtekst komt uit `getUsableClaims()` via `nutritionSupplementGate()` — nooit met de hand geschreven. Alle redentekst komt uit `REASON_TEXT` in `supplement-verdict-copy.ts`.

---

## I. MEETPLAN

Per CLAUDE.md vereist elk nieuw client-event registratie op drie plekken: `lib/events.ts` + `lib/intake-events-client.ts` + de allowlist in `app/api/intake/events/route.ts`. Hergebruik gaat vóór nieuw.

### Hergebruiken

| Event | Waar nu | Nieuwe waarde |
|---|---|---|
| `dashboard_voedingscheck_cta_click` (GA4) | `VoortgangHub.tsx:428` | `surface: "voortgang_statistieken"` |
| `dashboard_verdict_click` (GA4) | `SupplementVerdictPanel.tsx:136` | `surface: "statistieken"` |
| `dashboard.verdict_clicked` (domain, al op allowlist) | idem | `surface: "statistieken"` |
| `dashboard_statistieken_upsell` (GA4) | `VoortgangHub.tsx:663` | ongewijzigd |
| `dashboard_voortgang_hub_click` (GA4) | `VoortgangHub.tsx:977` | `destination: "inzichten"` erbij |

### Nieuw

| Event | Laag | Payload | Doel |
|---|---|---|---|
| `dashboard_advies_blok_getoond` | GA4 | `{ state: "nutrition_missing" \| "ready" \| "all_no", verdict_count, buy_count }` | Funnel-instap; verhouding poort vs. advies |
| `dashboard_evidence_open` | GA4 + Clarity | `{ domain, stars }` | Wordt de onderbouwing gebruikt of genegeerd? |
| `dashboard_ladder_step_click` | GA4 | `{ step: "voeding" \| "supplement" \| "vergelijking", nutrient }` | Waar valt de stepped-care-ladder uit elkaar? |
| `dashboard.advies_gate_passed` | domain | `{ from_surface, verdict_count }` | Durable: voedingscheck → advies-ontgrendeling |

### Conversietrechter

```
dashboard_advies_blok_getoond(state=nutrition_missing)
        ↓  ← afhaakpunt 1: ziet de poort, klikt niet
dashboard_voedingscheck_cta_click(surface=voortgang_statistieken)
        ↓  ← afhaakpunt 2: start check, maakt niet af
[voedingscheck voltooid → nutritionLogCompleted = true]
        ↓
dashboard.advies_gate_passed
        ↓
dashboard_advies_blok_getoond(state=ready)
        ↓  ← afhaakpunt 3: ziet advies, klikt niet door
dashboard.verdict_clicked(surface=statistieken)
```

Kernratio's: poort→start, start→voltooid, ready→verdict-klik. De middelste is de duurste om te repareren en de meest waardevolle om te weten.

### Clarity

`clarityTag("dashboard_advies", <state>)` op blok 4 en `clarityTag("dashboard_evidence", <domain>)` op blok 2. Genoeg om sessies te filteren op mensen die de poort zagen en niet klikten.

### PII-regels

| Wel | Niet |
|---|---|
| domein-id (`slaap`), nutriënt-id (`magnesium`) | ruwe domeinscores (48, 56) |
| ingrediënt-key, verdict-waarde | antwoorden op intake-vragen |
| bandwaarden (`below`/`around`/`meets`) | profiellabel |
| tellingen (`verdict_count: 6`) | sessionId, accountId in GA4/Clarity |

Numerieke scores horen in `domain_events` (durable, server-side), niet in GA4/Clarity.

---

## J. IMPLEMENTATIESLICES

Vier slices, elk zelfstandig te reviewen en te deployen. Geen enkele raakt `intake-engine.ts`.

### Slice 0 — Datatoegang (voorwaarde)

Kleinste slice, blokkeert slice 1 en 2. Alleen data, geen UI.

| Bestand | Wijziging |
|---|---|
| `lib/supplement-verdict-store.ts` | `based_on` toevoegen aan `VERDICT_SELECT` en `VerdictRow`; mappen naar `basedOn` in `mapRow()` |
| `types/verdict.ts` | `basedOn: VerdictEvidence \| null` op `StoredSupplementVerdict` |
| `types/dashboard.ts` | `nutrient: NutrientId` op `NutritionIntakeItem` |
| `lib/account-dashboard.ts` | `nutrient: entry.nutrient` meenemen in de items-map (rond regel 417) |

**Acceptatie:** `data.supplementVerdicts[0].basedOn.triggeredBy` is gevuld voor een account met een voltooide check. `data.nutritionIntake.items[0].nutrient` is een geldige `NutrientId`. `tsc --noEmit` + `vitest` groen. Geen visuele wijziging.

**Risico:** laag. Additief; bestaande consumers van beide types breken niet.

---

### Slice 1 — Statistieken advies-blok (gratis)

Het hart van de wijziging: blokken 1, 3 en 4.

| Bestand | Wijziging |
|---|---|
| `lib/statistieken-advies-model.ts` | **nieuw** — pure mapper `DashboardData` + `DashboardModel` → viewmodel `{ snapshot, nutritionLadder, verdictSummary, freshness }` |
| `components/dashboard/voortgang/StatistiekenAdviesSection.tsx` | **nieuw** — blokken 1, 3, 4 + poortstaat |
| `components/dashboard/VoortgangHub.tsx` | `StatistiekenView` uitbreiden; hubkaart-ondertitel Statistieken herschrijven |
| `lib/events.ts` + `lib/intake-events-client.ts` + `app/api/intake/events/route.ts` | `dashboard.advies_gate_passed` registreren |

**Props:** `StatistiekenAdviesSection({ model, data, onOpenFavorieten })`. Geen eigen fetching, geen `useEffect` voor data.

**Acceptatie:**
- Zonder voedingslog: poortkaart met CTA naar `/intake/voeding?from=dashboard`, blok 3 toont uitlegtekst, geen verdict-lijst
- Met voedingslog: max 3 verdicts (sortering `buildVerdictCards`: kopen → wacht → nee) + link naar Favorieten
- Ladder toont uitsluitend nutriënten met `band === "below"`, leefstijl-item altijd vóór supplement-item
- Alle claimtekst komt uit `nutritionSupplementGate()`; geen letter met de hand geschreven
- 375px zonder horizontale scroll
- `dashboard_advies_blok_getoond` vuurt exact één keer per weergave (ref-guard, zoals `upsellShownRef` in `VoortgangHub.tsx:655`)

---

### Slice 2 — Evidence-disclosure (blok 2)

| Bestand | Wijziging |
|---|---|
| `data/leefstijlcheck-evidence.ts` | **nieuw:** `EVIDENCE_QUESTIONS_BY_DOMAIN: Record<DomainId, QuestionId[]>` |
| `components/dashboard/voortgang/EvidenceLadderCard.tsx` | **nieuw** — accordeon per zwak domein, read-only variant van `IntakeEvidenceDisclosure` |
| `lib/statistieken-advies-model.ts` | uitbreiden met `evidencePerDomain` |

**Acceptatie:**
- Alleen domeinen met `score < 50` óf een `domain_below`-trigger in `basedOn.triggeredBy`
- Sterren van één representatieve vraag, nooit een gemiddelde
- Disclaimer-microcopy aanwezig ("sterkte van dit signaal, niet zekerheid van je score")
- Bij `basedOn === null`: domeinniveau-evidence zonder vraagkoppeling, geen crash, geen lege kaart
- Test faalt zodra een `QuestionId` in geen enkel domein van de nieuwe map voorkomt

---

### Slice 3 — Favorieten herpositionering

| Bestand | Wijziging |
|---|---|
| `components/dashboard/VoortgangHub.tsx` | `FavorietenView` herordenen: keuze → aanrader (top-1) → alle oordelen |
| `components/dashboard/SupplementVerdictPanel.tsx` | `variant`-prop: `"summary"` (max 3, Statistieken) vs. `"full"` (alles, Favorieten) |
| `lib/supplement-verdict-copy.ts` | `eerst_leefstijl` visueel splitsen op reasonKey (poort vs. standpunt) |

**Acceptatie:** geen dubbele verdict-lijst binnen één scherm; "Waarom dit?"-link naar Statistieken werkt; `dashboard_verdict_click` draagt de juiste `surface`.

---

### Slice 4 — Hub-reis

| Bestand | Wijziging |
|---|---|
| `components/dashboard/VoortgangHub.tsx` | Reis-strip; Inzichten-hubkaart; `PremiumWaitlistCard` naar onder |

**Acceptatie:** strip toont alleen bestaande velden; verbergt zichzelf netjes als `cycleEvidence` of `remeasure` ontbreekt; geen score, geen voorspelling.

---

### Wat níet gebouwd wordt

De oorspronkelijk voorgestelde "slice 4 — SSOT-wijziging check-in → verdict" vervalt. Uit sectie A volgt dat check-ins verdicts juist *niet* mogen herberekenen. Wat ervoor in de plaats komt is de versheids-indicator in blok 1 — onderdeel van slice 1, ongeveer twintig regels, en het lost hetzelfde gebruikersprobleem op ("is dit nog actueel?") zonder de ledger te vervuilen.

---

## K. RISICO'S + COMPLIANCE

### Compliance

| Risico | Waar | Beheersing |
|---|---|---|
| **Niet-goedgekeurde gezondheidsclaim** | Blok 3 supplement-item, blok 4 verdict-reden | Claimtekst uitsluitend via `nutritionSupplementGate()` → `getUsableClaims()`. Redentekst uitsluitend via `REASON_TEXT`. Nul handgeschreven claims in de nieuwe componenten — reviewbaar met een grep op stringliterals |
| **Impliciete diagnose** | Blok 2 evidence, sectie F-kaart | Geen symptoom→oorzaak-taal. Evidence beschrijft *waarom we vroegen*, niet *wat je mankeert*. Bestaande disclaimer uit `SupplementVerdictPanel.tsx:176-177` blijft onder blok 4 staan |
| **Sterren als betrouwbaarheidsclaim** | Blok 2 | `LEEFSTIJLCHECK_STRENGTH_DISCLAIMER` verbiedt de domein-interpretatie. Eén representatieve vraag, disclaimer-microcopy verplicht |
| **KOAG/KAG** | Alle koop-CTA's | Ongewijzigd t.o.v. bestaande vergelijkingspagina's; `rel="nofollow sponsored"` blijft. Nieuwe links gaan naar interne vergelijkingen, niet naar merchants |

### AVG

| Risico | Beheersing |
|---|---|
| Scores/antwoorden in GA4 of Clarity | Alleen ids, bands en tellingen naar GA4/Clarity; numerieke scores blijven in `domain_events` (server-side) |
| `based_on` bevat afgeleide gezondheidsgegevens | Blijft binnen `supplement_verdicts` (RLS deny-all, alleen service-role). `cleanup_intake_session_linked_data()` verwijdert de rijen al bij intrekking — geverifieerd in de migratie, regel 177-179 |
| Nieuwe evidence-weergave = nieuwe verwerking? | Nee: uitsluitend hergebruik van reeds verzamelde en reeds opgeslagen data in dezelfde context. Geen wijziging in het verwerkingsregister nodig |

### Product

| Risico | Beheersing |
|---|---|
| **Premium voelt misleidend** — advies gratis, maar het scherm heet "Statistieken" en had een slotje | Hubkaart-ondertitel herschrijven (slice 1). Expliciete scheidslijn in de UI: "einde gratis advies". Premium-blok belooft alleen tijd-over-tijd, nooit "beter advies" |
| **"Absolute waarheid"-valkuil** | Elke advieskaart draagt de datum van de check. Versheidsnudge bij >14 dagen. Nooit "we zien nu" |
| **Twee verdict-lijsten** (Statistieken + Favorieten) | Verschillende framing (conclusie vs. naslag), verschillende lengte (3 vs. alle), wederzijdse links. Als gebruikerstests dit toch als doublure lezen: laat Statistieken alleen de telling + link tonen |
| **Blok-inflatie op 375px** | Blokken 2 en 5 default ingeklapt; alleen blok 1, 3, 4 open. Bovenkant van het scherm moet binnen twee scrolls het oordeel bereiken |
| **Advies leest als verkoop** bij veel `kopen`-oordelen | `buildVerdictSummary()` noemt de nee's eerst in de kop ("bij 4 is ons antwoord: niet kopen"). Die framing meenemen naar blok 4 |

### Technisch

| Risico | Beheersing |
|---|---|
| `Dashboard.tsx` groeit verder (~4000 regels) | Nieuwe componenten in `components/dashboard/voortgang/`; `Dashboard.tsx` krijgt nul nieuwe regels — `StatistiekenAdviesSection` hangt in `VoortgangHub.tsx` |
| `based_on` uit oude `rules_version` | `basedOn` als `VerdictEvidence \| null`, defensief parsen, graceful fallback naar domeinniveau-evidence |
| Domein→vraag-map raakt achter | Test die faalt bij een niet-gemapte `QuestionId` |
| Advies-blok rendert vóór verdicts zijn gesynct | `syncSupplementVerdicts()` draait server-side vóór de render; `data.supplementVerdicts` is dus altijd actueel. Leegstaat (`cards.length === 0`) blijft afgevangen zoals nu in `SupplementVerdictPanel.tsx:33-35` |

---

## Volgorde

Slice 0 → 1 → 2 → 3 → 4. Slice 0 is een halve dag en blokkeert de rest. Slice 1 levert alle waarde; 2–4 zijn verdieping.

Timing t.o.v. de bestaande roadmap: dit werk leest het best ná de merge van de Kompas-branch naar main, omdat blok 1 letterlijk de Kompas-domeinscores toont. Het blokkeert geen ship — maar als de domeinscores op Home nog schuiven, schuift blok 1 mee.

---

## Naar Fase B

Voor het HTML-prototype (Fable, `psf-design-reference/`) zijn secties C, D en E de invoer. Drie mockscenario's dekken de staten die de UI moet aankunnen:

1. **Voeding niet gedaan** — poortkaart in blok 4, blok 3 in uitleg-staat
2. **Magnesium + omega-3 kopen** — volle ladder, evidence uitgeklapt op slaap
3. **Alles `niet_nodig`** — de merkbelofte-staat: "geen enkele voegt nu iets toe voor jou"

Scenario 3 is het belangrijkste om visueel te laten kloppen. Het is de staat waarin het product zichzelf bewijst, en de staat die het makkelijkst als "leeg scherm" aanvoelt als het ontwerp hem niet draagt.
