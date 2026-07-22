# Beweegdashboard als persoonlijk besturingssysteem — ontwerpdocument

> **Status (22 jul 2026): productontwerp / systeemvisie. Geen code, geen implementatie.**
> Vervolg op [`BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md`](BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md). Waar de blauwdruk de *surfaces* beschrijft (welke tegels, welke states, welke sync), beschrijft dít document de **laag eronder**: hoe ruwe data via betekenis in motivatie en duurzame actie verandert, en hoe Dashboard Main en het Dynamische Stappenplan technisch en conceptueel **één levend systeem** vormen.
> **Geen uitbreiding van functies.** Dit is een herontwerp-lens op wat er al is (B-1a/B-1b-cockpit, F1-harmonisatie) plus het contract dat borgt dat toekomstige toevoegingen het besturingssysteem versterken.
> **Verandert geen enkele DEFER/FREEZE/KILL-status en overschrijft geen gelockt besluit.** Waar de opdracht-wens botst met een SSOT-besluit, staat dat expliciet (→ §0.2 van de blauwdruk, hier samengevat in §3.4 en §14.5).
> **Verankerd tegen `main`.** Alle component-, lib- en type-namen in dit document verwijzen naar bestaande of in de blauwdruk voorgestelde PSF-artefacten.

---

## Leeswijzer

Dit document volgt exact de gevraagde 14-delige structuur. De rode draad is één zin:

> **Het dashboard is geen data-overzicht. Het is een machine die data omzet in het gevoel begeleid te worden naar de beste versie van jezelf.**

Elke sectie toetst zichzelf aan de **vier vragen** die het besturingssysteem continu moet beantwoorden:

1. **Waar begon ik?** — mijn 0-punt.
2. **Waar sta ik nu?** — mijn huidige werkelijkheid.
3. **Waar wil ik naartoe?** — mijn Future You.
4. **Wat is nu de eerstvolgende stap?** — mijn persoonlijke beweegstappenplan.

De harde ontwerpregel die daaruit volgt en die het hele document stuurt:

> **Als een onderdeel geen van de vier vragen beantwoordt, hoort het niet op het dashboard.**

---

## 1. Ontwerpvisie

### 1.1 Het dashboard als besturingssysteem, niet als cockpit-metafoor

Een *dashboard* in de klassieke zin toont de staat van een machine: meters, tellers, waarschuwingslampjes. Dat is precies wat we **niet** bouwen. Een besturingssysteem doet iets fundamenteel anders: het neemt ruwe signalen op, interpreteert ze in de context van een doel, en stuurt daarop het volgende gedrag. De gebruiker bedient geen meters — hij wordt *begeleid* door een systeem dat begrijpt waar hij vandaan komt en waar hij naartoe wil.

Concreet betekent dat drie dingen die een gewoon dashboard niet doet:

- **Het onthoudt zijn eigen 0-punt.** Elke waarde wordt getoond ten opzichte van waar de gebruiker begon — nooit als kaal getal.
- **Het kent een bestemming.** Elke stap, elke tegel, elke zin verwijst terug naar het zelfgekozen anker (Future You). Het systeem heeft een *richting*, geen alleen een *toestand*.
- **Het handelt terug.** Wat de gebruiker doet, verandert wat het systeem morgen voorstelt. De lus is gesloten (§6).

### 1.2 De filosofie van de Gids Bewegen na 40, digitaal tot leven gebracht

De gids `src/data/gids/beweging.ts` draait om zes waarden: **bewustwording, persoonlijke situatie, eigen tempo, vertrouwen, kleine haalbare stappen, duurzame gedragsverandering.** Het dashboard is geen andere boodschap in een ander jasje — het is diezelfde gids die *reageert*.

| Gids-waarde (statisch) | Dashboard-vertaling (levend) |
|---|---|
| Bewustwording | De 0-punt-kaart maakt de startsituatie zichtbaar en *houdbaar* — bewustwording die niet vervaagt |
| Persoonlijke situatie | Anker + startpatroon + intake-dimensies kleuren elke stap; twee gebruikers zien nooit hetzelfde dashboard |
| Eigen tempo | Recovery-hint en tier-keuze; het systeem schroeft nooit automatisch op boven wat herstel toelaat |
| Vertrouwen | Echte engine-score, eerlijke "niet elke dag een cijfer", feit-eerst copy, geen medische belofte |
| Kleine haalbare stappen | De VANDAAG-hero toont altijd de kleinste zinvolle stap, nooit een schema |
| Duurzame gedragsverandering | De lus (§6): actie → bewijs → herkalibratie → nieuwe, iets grotere stap |

De emotionele toon die we najagen: **de rust van de gids, niet de urgentie van een fitness-app.** Geen rode badges, geen aftellende streaks, geen "je bent 3 dagen inactief!". Een systeem dat naast je staat, niet dat over je schouder meekijkt.

### 1.3 Wat het uitdrukkelijk niet is

Geen kalorieënteller. Geen social-fitness-netwerk. Geen PT-vervanger met sets/reps als kern. Geen medisch hulpmiddel (adviezen, geen diagnoses). Geen verzameling widgets. En cruciaal: **geen gefaket dagelijks succescijfer** — de eerlijkheid ís de moat (§3.4).

---

## 2. Dashboard als datatransformatie

Het hart van dit document. Het dashboard is een **pijplijn** die één keten negen keer doorloopt en dan zichzelf voedt:

```
ruwe data → informatie → inzicht → betekenis → motivatie → actie → nieuw gedrag → nieuwe data → nieuwe inzichten ↺
```

### 2.1 De negen stadia, concreet gemaakt

Elk stadium heeft een **eigenaar** (welk PSF-artefact het produceert) en een **transformatieregel** (wat er precies gebeurt).

| # | Stadium | Wat het is | Eigenaar in PSF | Transformatieregel |
|---|---|---|---|---|
| 1 | **Ruwe data** | Losse, betekenisloze feiten | intake-antwoorden, `daily_action_log`-rijen, `RCV_FEEL`, exertie-tik, `movement_session_log`-minuten | Wordt vastgelegd, niet geïnterpreteerd |
| 2 | **Informatie** | Geordende, geaggregeerde data | `buildDomainTrendRow`, week-aggregatie uit daily-log | Sorteren, tellen, over tijd uitzetten |
| 3 | **Inzicht** | Een patroon dat opvalt | leefstijllijn-delta, "kracht 1× · wandelen 2×", exertie-histogram | Vergelijken met 0-punt / vorige week / curve |
| 4 | **Betekenis** | Het inzicht vertaald naar *jouw* leven | betekenis-motor (§3) via `buildAnchorWhySuffix` | Koppel inzicht aan anker + 0-punt → persoonlijke zin |
| 5 | **Motivatie** | De emotionele lading die tot handelen aanzet | Future You-copy in hero + score-tegel | "Dit brengt [Future You] dichterbij" |
| 6 | **Actie** | Eén concrete, haalbare stap | `MovementTodayHero` → "Markeer als gedaan" | Day-model SSOT selecteert de kleinste zinvolle stap |
| 7 | **Nieuw gedrag** | De stap daadwerkelijk gedaan | afvink-event → exertie-microvraag | Fogg: trigger + ability + motivation vielen samen |
| 8 | **Nieuwe data** | De actie wordt zelf een datapunt | nieuwe rij in `daily_action_log` (+ exertie-dimensie) | Append-only; voedt stadium 1 opnieuw |
| 9 | **Nieuwe inzichten** | Het patroon is veranderd | `computeCurrentPhaseId`, hermeting-delta | Herkalibratie → fase promoot → nieuwe stap ontsloten |

### 2.2 Een volledige trace — één datapunt van ruw tot nieuwe aanbeveling

Om te bewijzen dat de keten sluit, volgen we één echt signaal: **een gebruiker vinkt vandaag "Eén krachtsessie: squat, push, pull" af en tikt exertie = "matig".**

```
[1] RUWE DATA
    POST /api/account/daily-log  { stepId: "mov-kracht-onderhoud-week",
                                   date: "2026-07-22", exertion: "matig" }
    → één append-only rij. Nog geen betekenis.
        │
        ▼
[2] INFORMATIE
    Week-aggregatie leest daily-log → "deze week: kracht 1×, conditie 2×"
    Trend-buffer krijgt een executiepunt (score verandert nog niet — dat is bewust).
        │
        ▼
[3] INZICHT
    Vergelijk met vorige week (kracht 0×) → "eerste krachtsessie sinds je start".
    Exertie-histogram: 3e keer 'matig' op rij → herstel is stabiel, geen overbelasting.
        │
        ▼
[4] BETEKENIS  (betekenis-motor, §3)
    anchor = "kracht" → whySuffix "Want jij wilt je sterk en capabel blijven voelen."
    0-punt: MOV_STR-antwoord was 2 (laag) → "je begon bij één keer amper".
    → "Je deed vandaag je eerste bewuste krachtsessie in weken — precies de prikkel
       die spierverlies na 40 het hardst remt, en die jou sterk en capabel houdt."
        │
        ▼
[5] MOTIVATIE
    Future You-regel: "Dit is hoe je de man wordt die over tien jaar nog moeiteloos
    uit een lage stoel opstaat." (geen getal, wel richting)
        │
        ▼
[6] ACTIE  (morgen)
    Day-model kiest de volgende stap. Omdat exertie 'matig' was en herstel stabiel,
    blokkeert de recovery-hint niets: de Trainen-tier blijft beschikbaar.
        │
        ▼
[7] NIEUW GEDRAG
    Gebruiker keert terug, ziet "kracht 1×" al staan → sociale bewijskracht van
    zichzelf → doet de tweede sessie.
        │
        ▼
[8] NIEUWE DATA
    Tweede krachtrij. Weekdoel-teller (F3: lp_guideline_progress) nadert ≥80%.
        │
        ▼
[9] NIEUWE INZICHTEN
    ≥80% weekdoel vóór zondag → early-unlock → computeCurrentPhaseId promoot naar
    "Week 2–4: structureel krachttrainen" → route-ladder schuift → de dagstap-pool
    bevat nu zwaardere kracht-varianten. Bij de volgende hermeting: MOV_STR-delta
    zichtbaar → score beweegt → betekenis-motor kan nu zeggen "je bént sterker,
    gemeten, niet gevoeld."
        │
        └──────────────► terug naar [1], op een hoger niveau
```

Dit is de kern van "het dashboard leeft": **elke actie is tegelijk het einde van één keten en het begin van de volgende.** De gebruiker ziet geen pijplijn — hij ziet een systeem dat hem lijkt te begrijpen.

### 2.3 Welke transformaties bewust *niet* automatisch gebeuren

Een besturingssysteem dat alles automatiseert wordt een fitness-app. Drie transformaties houden we bewust menselijk of traag:

- **Betekenis → motivatie is copy, geen cijfer.** We rekenen geen "motivatiescore" uit. De motivatie leeft in taal (Future You), niet in een tweede meter.
- **Nieuwe data → score is traag.** Eén sessie verandert de score niet. De score-payoff landt bij de hermeting (§3.4). Dagelijkse ruis tonen zou de eerlijkheid ondermijnen.
- **Inzicht verschijnt pas als het statistisch eerlijk is.** Geen "je beweegt het best op woensdag" na twee woensdagen. Drempel: genoeg datapunten én actionable (§7.3).

---

## 3. De betekenislaag boven statistieken

### 3.1 Het probleem met kale statistieken

`6432 stappen` is een feit zonder adres. Het beantwoordt geen van de vier vragen. Het vertelt niet of dat veel of weinig is *voor jou*, of het de goede kant op gaat, of het je dichter bij je doel brengt. Een besturingssysteem toont nooit een kaal getal — het toont altijd een getal *met een adres*.

> **Ontwerpregel (hard):** geen enkele statistiek verschijnt zonder (a) een referentiepunt en (b) een implicatie voor het anker. Een getal zonder referent of zonder "en dus…" is een bug, geen feature.

### 3.2 De betekenis-motor: een formule, geen losse zinnen

Elke betekenisvolle uitspraak is opgebouwd uit vier slots. Dit is een **generatief systeem**, geen bibliotheek van hardcoded zinnen — waardoor het schaalt naar elke nieuwe metriek zonder herontwerp.

```
BETEKENISZIN =
    [MEETWAARDE]                     ← de ruwe informatie (stadium 2)
  + [REFERENT]                       ← 0-punt · vorige week · curve · doel
  + [ANKER-BETEKENIS]               ← buildAnchorWhySuffix(anchor)
  + [EERSTVOLGENDE IMPLICATIE]      ← wat dit betekent voor de volgende stap
```

**Voorbeeld (opdracht):** in plaats van `6432 stappen`:

> "Je bent vandaag **80% onderweg** [MEETWAARDE + REFERENT=doel] naar je doel om **zonder buiten adem de trap op te lopen** [ANKER]. Nog één korte wandeling en je zit erboven [IMPLICATIE]."

**Voorbeeld (langere horizon):**

> "Vergeleken met drie maanden geleden [REFERENT=0-punt] houd je beweging gemiddeld **18 minuten langer** vol [MEETWAARDE] — dat is precies de conditie die je nodig hebt om **mee te blijven doen** [ANKER]."

### 3.3 Vertaaltabel — elke ruwe PSF-metriek naar een betekeniszin

Belangrijk en eerlijk: **PSF telt geen stappen en leest (nu) geen hartslag.** Onze ruwe substraten zijn *minuten, modaliteit, volhoud-duur, exertie, score-delta en ritme*. De "6432 stappen"-illustratie uit de opdracht vertalen we daarom naar wat we écht meten. Stappen/hartslag komen pas met de wearable-adapter (§8.5, gated).

| Ruwe metriek (bestaat) | ❌ Kaal | ✅ Met betekenis (motor) |
|---|---|---|
| Minuten deze week (uit daily-log) | "72 minuten" | "Je bewoog deze week 3 keer — drie weken geleden was dat nul. Dat ritme is wat je '[trap zonder buiten adem]' dichterbij brengt." |
| Modaliteit-mix | "kracht 1×, conditie 2×" | "Je hield deze week kracht én conditie erin — precies de combinatie die na 40 het meest telt voor zelfstandig blijven." |
| Volhoud-duur (exertie over tijd) | "matig, matig, licht" | "Wat drie weken geleden zwaar voelde, voelt nu matig. Je lichaam went — dat is de stille winst." |
| Score-delta (hermeting) | "58, was 55" | "Je beweegscore ging van 55 naar 58. Niet gevoeld maar gemeten: je bént sterker geworden sinds je startte." |
| Fase-positie (route-ladder) | "fase 2 van 4" | "Je bent klaar voor fase 2 — kracht bouwen. De basis die je legde, draagt nu." |
| Afstand tot hermeting | "nog 21 dagen" | "Over ~3 weken zie je je lijn bewegen. De payoff komt niet vandaag — wel dan, eerlijk gemeten." |

### 3.4 De eerlijkheidsgrens — waarom betekenis nooit een gefaket cijfer wordt

Hier botst de opdracht-wens met een gelockt PSF-besluit, en we kiezen het besluit (→ blauwdruk §0.2):

- **Geen tweede, dagelijks bewegend "Future You Score 62→78".** Dat is een verzonnen cijfer naast de engine-score. Future You leeft in copy en richting, niet in een gefaket getal.
- **De betekenis-motor mag interpreteren, niet verzinnen.** Hij mag zeggen "je hield het langer vol" (waar, uit exertie-data), maar niet "je bent 12% fitter vandaag" (ongemeten).
- **De grootste betekenis-payoff is bewust uitgesteld naar de hermeting.** Dat is geen tekortkoming — het ís de moat. Elke concurrent geeft dagelijkse dopamine; wij geven eerlijke terugkoppeling en zeggen dat ook.

> **Waarom dit werkt:** een systeem dat één keer betrapt wordt op een verzonnen getal verliest het vertrouwen voor alles. De betekenislaag is krachtig *omdat* elke uitspraak verifieerbaar terug te voeren is op een echt datapunt.

---

## 4. Het 0-punt ("Hier begon je")

### 4.1 Van onboarding naar permanent referentiepunt

De eerste intake is niet alleen onboarding — het is de **nulmeting** waartegen alle latere betekenis wordt afgezet. Vraag 1 van de vier ("Waar begon ik?") heeft een eigen, permanent object nodig dat maanden later nog raadpleegbaar is. Zonder 0-punt heeft geen enkele latere statistiek een referent, en valt de hele betekenis-motor (§3) om.

### 4.2 Wat het 0-punt vastlegt (uit bestaande data, géén foto)

Alle onderstaande velden bestaan al na de eerste Leefstijlcheck. Het 0-punt is geen nieuwe vragenlijst — het is een **view** op wat er al ligt.

| 0-punt-dimensie | Bron in PSF | Wat het later betekent |
|---|---|---|
| Startdatum | `intake_sessions.created_at` | Ankerpunt voor "X weken/maanden geleden" |
| Beweegscore bij start | `domain_scores.beweging` (baseline) | `trendRow.baselineScore` — "begon bij 55" |
| Eerste beweeg-antwoorden | de 11 `MOVEMENT_QUESTIONS` (o.a. `MOV_STR`, `MOV_CARD`, `MOV2_PAIN`) | "je stond op één krachtmoment amper" |
| Eerste motivatie (het anker) | `movementAnchor` | "je koos toen: sterk blijven" |
| Eerste beperkingen | `MOV2_PAIN`, `MOV2_MOB`, `MOV2_FUNC` | "je had toen last van je knie" |
| Eerste energieniveau | energie-domeinscore + `MOV2_COND` | "je voelde je 's avonds leeg" |
| Eerste onzekerheden | `MOV2_MOTIV`, `MOV2_CONSIST` | "je twijfelde of je het vol zou houden" |
| Startpatroon | `preferredStartPattern` | "je koos: rustig met dagelijks ritme" |

> **Botsing → besluit (blauwdruk §0.2):** de opdracht noemt een foto ("Hier begon je"). We doen dat **niet** — het botst met de anti-transformatie-lijn (geen uiterlijk-avatar) én met AVG art. 9 (biometrisch/gezondheidsdata). De "beginsituatie" is de **beginwaarde**, niet een beeld. Dat is bovendien sterker: een foto toont je lijf, de beginwaarde toont je *leven* (energie, twijfel, klacht, motivatie) — precies de dimensies waarop groei het meest voelbaar is.

### 4.3 Hoe het 0-punt zichtbaar blijft (drie plekken, oplopende diepte)

Het 0-punt hoeft geen prominente tegel op de first viewport te zijn (dat zou de hero-hiërarchie breken). Het leeft op drie plekken:

1. **Impliciet, altijd** — in de trend-tegel als "Begin 55 · nu 58" (bestaat al: `trendRow.baselineScore`).
2. **Op de hermeting** — de terugblik zet expliciet 0-punt naast heden: "Toen: één krachtmoment amper, 's avonds leeg. Nu: 2× kracht per week, meer energie." Dit is het emotionele hoogtepunt van het systeem.
3. **Op verzoek, diep** — een "Hier begon je"-terugblikpagina (uitbreidbaar, geen first-viewport-ruis) die de volledige 0-punt-view toont: de antwoorden, het anker, de twijfels van toen — mét de groei ertussen.

### 4.4 Groei die niet alleen fysiek is

Het krachtigste aan het 0-punt: het legt **mentale** startwaarden vast (`MOV2_MOTIV`, `MOV2_CONSIST`, onzekerheid). Maanden later kan het systeem eerlijk zeggen: *"Je begon met twijfel of je dit vol zou houden. Je bent nu acht weken bezig."* Dat is groei die geen enkele stappenteller kan tonen — en het is precies wat de doelgroep (mannen 40+ die vaak eerder afhaakten) raakt.

---

## 5. Future You ("Hier wil je naartoe")

### 5.1 Future You is een richting, geen tegel

Vraag 3 van de vier ("Waar wil ik naartoe?"). De valkuil: Future You als losse doeltegel met een percentage ernaar toe. Dat maakt er een metriek van, en metrieken motiveren mannen 40+ niet — *identiteit* wel. Future You is daarom geen widget maar de **kleurlaag over het hele systeem**: de reden onder elke stap, de lading onder elke score.

> **Botsing → besluit:** géén "Future You Score 62→78" (verzonnen tweede cijfer, §3.4). Future You is de `movementAnchor` + de copy die eruit voortkomt (`buildAnchorWhySuffix`), overal subtiel aanwezig.

### 5.2 De vier ankers, concreet gemaakt tot Future You-beelden

De ankers bestaan al in `MOVEMENT_ANCHOR_OPTIONS`. Hier de vertaling van elk anker naar een **concreet toekomstbeeld** (geen abstract "fitter") dat de betekenis-motor overal kan inzetten:

| Anker (`movementAnchor`) | Keuze-label | Concrete Future You (voor betekenis-motor) |
|---|---|---|
| `zelfstandigheid` | "Zelf blijven doen wat ik wil" | "Op je 75e nog zelf je boodschappen dragen en uit een lage stoel opstaan zonder handen" |
| `meedoen` | "Fit genoeg voor de mensen om me heen" | "Meerennen met je (klein)kinderen, meedoen op de bruiloft i.p.v. toekijken" |
| `energie` | "Aan het eind van de dag nog energie over" | "'s Avonds nog fut voor je gezin, niet leeg op de bank" |
| `kracht` | "Me sterk en capabel blijven voelen" | "Je sterk en capabel voelen — de trap op zonder na te denken, een zware tas zonder moeite" |

De opdracht noemt beelden als "5 km zonder pauze", "spelen met kleinkinderen", "minder rugpijn", "beter slapen", "weer durven sporten". Die zijn allemaal onder te brengen bij één van de vier ankers — we hoeven geen vijfde te verzinnen. Wel kan een **F2-verfijning** een concreet mijlpaal-zinnetje per gebruiker toevoegen ("weer 5 km lopen") als vrije invulling *binnen* het gekozen anker, mits opgeslagen zonder PII-risico (kort, geen medische claims, moderatie-vrij enum-plus-tekst).

### 5.3 Waar Future You overal zichtbaar is

- **Als eyebrow boven de hero:** "VANDAAG · voor: zelf blijven doen wat je wilt" (aanbeveling blauwdruk §4.3 — prominent zonder zevende tegel).
- **In elke "waarom deze stap":** de anker-suffix sluit elke rationale af (`buildAnchorWhySuffix`).
- **In de score-tegel:** de narratieve regel eronder is Future You-taal ("Elke week telt mee voor de versie van jou die straks nog gewoon zelf de trap op komt" — staat er al).
- **Op de hermeting:** de terugblik wordt geframed als "je bent dichter bij [Future You]".
- **In de route-ladder:** de laatste fase heet "Mijn toekomst onderhouden" — de route ís de reis naar Future You.

### 5.4 Elke stap verbonden aan Future You

De harde eis uit de opdracht: laat zien hoe **iedere** stap verbonden is met Future You. Het mechanisme bestaat al: elke `PlanStep.rationale` krijgt via de betekenis-motor de anker-suffix. Zo wordt dezelfde oefening voor twee mensen een ander verhaal:

```
Stap: "Opstaan uit een stoel zonder handen"
  → gebruiker A (anker=zelfstandigheid):
    "…traint precies de beenkracht die na 40 het snelst afneemt —
     want jij wilt zelf blijven doen wat je wilt."
  → gebruiker B (anker=meedoen):
    "…traint precies de beenkracht die na 40 het snelst afneemt —
     want jij wilt fit genoeg blijven om mee te doen, niet toe te kijken."
```

Zelfde fysiologie, andere bestemming. Dat is Future You als besturingsprincipe.

---

## 6. Dashboard ↔ Stappenplan interactiemodel

### 6.1 Het contract: het dashboard stuurt, het stappenplan leert terug

De opdracht vraagt de samenwerking veel dieper uit te werken. De kern: het is **bidirectioneel**. Het dashboard bepaalt wat het stappenplan toont; het stappenplan (via de gedane acties) verandert wat het dashboard weet.

```
   DASHBOARD MAIN                                    DYNAMISCH STAPPENPLAN
   (waar sta ik?)                                    (wat doe ik, en waarom?)
   ┌────────────────────────┐                        ┌────────────────────────┐
   │ score-ring (beweging)  │                        │ route-ladder (4 fasen) │
   │ anker (Future You)     │──── stuurt ──────────▶ │ plan-reader (12 weken) │
   │ trend / leefstijllijn  │   tier-keuze,          │ stap-kaarten (uitklap) │
   │ hermeting-teaser       │   anker, fase          │ VANDAAG (gespiegeld)   │
   └───────────┬────────────┘                        └───────────┬────────────┘
               │                                                 │
               │  ◀──────────── leert terug ─────────────────────┘
               │      afvink → daily_action_log →
               │      week-readout, trend, fase-promotie
               ▼
   computeCurrentPhaseId(scores, ctx, gelogde sessies)
```

### 6.2 De datastromen, benoemd (elk observeerbaar voor de gebruiker)

Dit is de "het leeft"-lijst, met per stroom de **richting**, het **signaal** en de **zichtbare uitkomst**:

| # | Richting | Signaal | Zichtbare uitkomst |
|---|---|---|---|
| 1 | Dashboard → Plan | Tier-keuze (Herstel/Matig/Trainen) | Hero-stap verandert *direct* (bestaat) |
| 2 | Plan → Dashboard | Afvink in hero → `daily_action_log` | "Deze week" en trend-sparkline updaten |
| 3 | Plan → Dashboard | Afvink | Plan-reader toont stap op ✓ (one-way read) |
| 4 | Dashboard → Plan | Exertie "zwaar" → recovery-context | Morgen stelt het plan een lichtere tier voor |
| 5 | Plan → Dashboard | Genoeg volgehouden → `computeCurrentPhaseId` | Route-ladder-NU-badge schuift een fase op, nieuwe stappen |
| 6 | Dashboard → Plan | Anker gewijzigd (`movementAnchor`) | Alle "waarom deze stap" herkleuren; arc herbouwt |
| 7 | Plan → Dashboard | Hermeting → nieuwe score/delta | Score-ring, trend, betekenis-motor herijken |

### 6.3 De motivatie-terugkoppellus uit de opdracht, uitgewerkt

De opdracht schetst: *motivatie daalt → stappenplan wordt korter → gebruiker voltooit → vertrouwen stijgt → dashboard past voorspellingen aan → nieuwe doelen → nieuwe statistieken.* Zo landt dat concreet in PSF:

```
motivatie daalt
   signaal: log-gaten (X dagen niets) + MOV2_MOTIV laag
        │
        ▼
stappenplan wordt korter
   day-model kiest lichtere instapstap; copy verschuift naar "verklein je doel,
   forceer niet"; recovery-hint kan Herstel-tier voorstellen
        │
        ▼
gebruiker voltooit de kleinere stap
   nieuwe daily_action_log-rij; drempel was laag genoeg (Fogg: ability ↑)
        │
        ▼
vertrouwen stijgt
   "Deze week" toont weer een readout i.p.v. leeg; geen schuld-copy onderweg
        │
        ▼
dashboard past aan
   fase blijft staan of promoot; recovery-context normaliseert; Trainen-tier
   komt weer beschikbaar (niet geforceerd — aangeboden, SDT)
        │
        ▼
nieuwe doelen / nieuwe statistieken
   bij herstel van ritme → early-unlock mogelijk → route schuift → nieuwe
   stap-varianten verschijnen → bij hermeting: nieuwe score-delta
```

> **Kern-invariant (blauwdruk §0.2):** er is **één** check-off (de VANDAAG-hero) en **één** executie-SSOT (`daily_action_log`). Het stappenplan *toont* status, het vinkt niet. Twee afvink-oppervlakken met verschillende sleutels leidden tot tegenstrijdige staat ("hero zegt gedaan, plan zegt todo"). Deze invariant is wat de bidirectionele lus betrouwbaar maakt.

---

## 7. Dynamische componenten en event-flow

### 7.1 Het dashboard verandert door de tijd — de levende tijdlijn

De opdracht: het dashboard moet veranderen na een check-in, wandeling, week, maand, terugval, nieuw doel. Hier per horizon **wat er verandert, welke kaart wint, welke verdwijnt.**

| Horizon | Trigger | Kaart wint | Kaart verdwijnt / dimt | Nieuw inzicht verschijnt |
|---|---|---|---|---|
| **Binnen de dag** | Ochtend, geen actie | VANDAAG-hero (todo, primair) | — | Aanbevolen-badge uit vers herstelgevoel |
| | Na check-in (`RCV_FEEL` laag) | Recovery-variant van hero | Trainen-tier dimt | "vandaag licht — dat is verstandig" |
| | Na afvink | Hero → "gedaan"-state | Primaire knop verdwijnt | exertie-microvraag → "Morgen kies je opnieuw" |
| **Na een wandeling/sessie** | `daily_action_log`-rij | "Deze week" readout | lege-week-copy verdwijnt | "kracht 1× · wandelen 2×" |
| **Na een week** | ≥2 trendpunten | Trend-tegel (sparkline) | "nog te vroeg"-copy verdwijnt | "Begin 55 · nu …" |
| **Na een maand** | Nadert hermeting | Hermeting-teaser wint gewicht | — | "Over ~1 week zie je je lijn bewegen" |
| **Na een terugval** | Log-gat X dagen | Hero met zachtere instapstap | Fase-druk verdwijnt | "pak de volgende gewoon weer op" (geen schuld) |
| **Na een nieuw doel** | Anker/startpatroon gewijzigd | Hero + route herbouwd | Oude waarom-copy verdwijnt | "je richting is bijgesteld" |
| **Na hermeting** | Nieuwe score/delta | Score-ring + trend | "nog te vroeg" definitief weg | "je bént sterker — gemeten, niet gevoeld" |

Principe: **informatie verschijnt alleen wanneer relevant.** Een lege trend toont geen kale as met nul punten — hij toont "nog te vroeg voor een lijn". Een fase-promotie is geen confetti — het is een rustige highlight en één zin. Het dashboard is nooit voller dan de situatie vraagt.

### 7.2 Event-flow — de signalen die updates sturen

De bestaande meet-events zijn tegelijk de **systeem-events** die de lus aandrijven (drie-lagen-meting: `domain_events` / GA4 / Clarity — CLAUDE.md meet-standaard). Nieuwe CTA's krijgen hun meetpunt in dezelfde wijziging.

```
EVENT                                  BRON                        GEVOLG OP DASHBOARD
────────────────────────────────────────────────────────────────────────────────────
dashboard_vandaag_action_toggled       hero afvink                 week-readout + trend update
  (payload: exertion licht/matig/zwaar) exertie-microvraag         recovery-context volgende dag
movement_tier_selected                 tier-keuze                  hero-stap wisselt direct
dashboard_beweging_plan_click          route-ladder doorway        opent plan-reader
plan_reader_shown                      plan-reader mount           (meting: loopt de lus rond?)
movement_anchor_changed                "Wijzig mijn waarom"        alle waarom-copy herkleurt
remeasure_started / remeasure_done     hermeting-flow              score/trend/betekenis herijkt
movement_phase_promoted                computeCurrentPhaseId        route-NU-badge schuift
```

> **Meetpunt:** aan `dashboard_vandaag_action_toggled` + `dashboard_beweging_plan_click` + `plan_reader_shown` lees je af of Dashboard en Stappenplan als één levend systeem functioneren (afvinken → plan bekijken → terugkeren). Geen PII in GA4/Clarity — exertie is een enum, geen vrije tekst.

### 7.3 Wanneer een dynamisch inzicht verschijnt (de eerlijkheidspoort)

Een inzicht is geen decoratie. Het verschijnt alleen als het **twee poorten** haalt:

1. **Statistisch eerlijk** — genoeg datapunten (bv. ≥3 gelogde sessies vóór een ritme-uitspraak; ≥2 trendpunten vóór een lijn; RULES_VERSION-grens → delta `null`, geen getal-met-sterretje).
2. **Actionable** — het leidt tot een betere dagstap, een tijd-suggestie of een eerlijke terugblik. Geen "data om de data".

Faseer eerlijk:
- **Nu (F1–F2):** binnen-domein readouts uit daily-log + exertie ("je hield conditie langer vol dan kracht"). Regelgebaseerd, deterministisch.
- **Later (/inzichten-feed):** cross-pijler correlatie ("je slaapscore is hoger op dagen dat je bewoog") — vereist genoeg datapunten en hoort in de Inzichten-feed, niet in de cockpit.
- **AI (§8.5, gated):** "je beweegt het best rond 17u" — pas met occurrence-histogrammen, achter guardrails, geen medische output.

---

## 8. Dataarchitectuur

### 8.1 Alle databronnen, geclassificeerd

De opdracht vraagt: welke data permanent, tijdelijk, voorspellend, plan-bepalend? Hier de volledige inventaris, verankerd op wat PSF echt opslaat.

| Bron | Waar | Permanent? | Voedt voorspelling? | Bepaalt beweegplan? |
|---|---|---|---|---|
| Intake-antwoorden (incl. 11 `MOVEMENT_QUESTIONS`) | `intake_sessions.answers` (jsonb) | **Permanent** (= 0-punt) | ja (baseline) | ja (`showWhen`-gating, fase) |
| Domein-scores | `intake_sessions.domain_scores` | **Permanent** | ja | ja (`computeCurrentPhaseId`) |
| Anker + startpatroon | `answers`-jsonb (`movementAnchor`, `preferredStartPattern`) | **Permanent** | nee | ja (stap-selectie, copy) |
| Dagelijkse check-in (`RCV_FEEL`) | recovery-context | **Tijdelijk** (≤7d relevant) | ja (recovery-hint) | ja (tier-override) |
| Afvink-log | `daily_action_log` | **Permanent** (append-only) | ja (ritme, fase) | ja (early-unlock) |
| Exertie (licht/matig/zwaar) | payload op afvink-event | **Permanent** | ja (recovery volgende dag) | ja (lichtere tier bij zwaar) |
| Sessie-minuten | `movement_session_log` (P2, gated) | **Permanent** | ja (volume-trend) | indirect (evidence, nooit 2e score) |
| Trend / leefstijllijn | afgeleid (`buildDomainTrendRow`) | Afgeleid | — | nee (payoff-belofte) |
| Fase-progressie | `planProgress` / `lp_*` (F3) | **Permanent** | ja | ja |
| Tijd/agenda (F3) | `lp_*`, agenda-adapter | **Permanent** (gated) | ja (timingFit) | ja (planner) |
| Wearable (slaap/HRV/load) | adapter (§8.5, gated) | **Tijdelijk** (TTL 90d) | ja (soft recovery-hint) | nee (nooit 2e domeinscore) |
| Weer (F3) | adapter (toekomst) | **Tijdelijk** | ja (binnen/buiten) | ja (alternatief) |

### 8.2 De drie grootboeken die bewust gescheiden blijven

Een kernbesluit uit `day-model.ts`: completie hoort **niet** in het day-model. Er zijn drie gescheiden grootboeken, elk via eigen route:

- **`day-model`** — leidt af *wat* er vandaag staat (content, tijd, `actionKey`). Bevat geen status.
- **`daily_action_log`** — het executie-grootboek (*is het gedaan*). Append-only, idempotent op `stepId + dag`.
- **`agenda_blocks.status`** — het agenda-grootboek (planner, F3).

Waarom gescheiden: één bron voor "wat is vandaag", één voor "is het gedaan", voorkomt dat een wijziging in de content-resolutie stilzwijgend de schrijfsleutel laat afwijken van wat getoond wordt (zie de comment bij `resolveActionKey`).

### 8.3 Wat permanent is (de 0-punt-invariant)

Alles wat de vier vragen voedt over tijd, is permanent: 0-punt (intake), elke actie (append-only log), elke hermeting. **De append-only-regel is heilig** — we overschrijven nooit een historisch datapunt, want dan verliezen we het referentiepunt en valt de betekenis-motor om. Een terugval "wist" niets; hij is zelf een datapunt dat het systeem zachter maakt.

### 8.4 Wat tijdelijk is

Signalen met een houdbaarheidsdatum: het dagelijkse herstelgevoel (`RCV_FEEL`, ≤7d), wearable-aggregaten (TTL 90d, client-side geaggregeerd), weer (dag-vooruit). Deze sturen de *dagselectie* maar worden nooit permanent bewijs — ze zijn de *toestaande/limiterende* laag, niet de *scoregevende* laag.

### 8.5 Wat plan-bepalend is versus voorspellend

- **Plan-bepalend (deterministisch, nu):** scores + antwoorden (via `showWhen` en `computeCurrentPhaseId`), anker + startpatroon (stap-selectie), recovery-hint (tier-override). Dit is uitlegbaar en reproduceerbaar — geen black box.
- **Voorspellend (lerend, later, gated):** occurrence-histogrammen → beste tijdstip; volume-trends → progressie-tempo; wearable-HRV → herstelvoorspelling. Alles achter een privacy-poort (art. 9-toestemming, client-side aggregatie, geen sensor-raw in een stap, nooit een tweede domeinscore).

> **AVG-invariant:** geen PII in analytics; gezondheidsdata alleen server-side via `createSupabaseAdmin()`; wearable/agenda achter expliciete toestemming; geen vrije-tekst-health-dump in features.

---

## 9. Componentarchitectuur

### 9.1 Eigenaarschap van data — wie bezit, wie leest

Het besturingssysteem is één systeem, maar met heldere eigenaar-relaties. De regel: **precies één component bezit elk stuk waarheid; de rest leest.**

| Data | Eigenaar (bezit/schrijft) | Lezers |
|---|---|---|
| "Wat is vandaag" | `day-model` (SSOT) | hero, plan-reader, route-ladder |
| "Is het gedaan" | `daily_action_log` (via `/api/account/daily-log`) | week-readout, trend, plan-reader (one-way) |
| Anker + startpatroon | `movement-prefs` (answers-jsonb) | hero-copy, route, plan-reader, betekenis-motor |
| Score | intake-engine (`domainScores`) | score-ring, `computeCurrentPhaseId`, betekenis-motor |
| Fase | `computeCurrentPhaseId` (afgeleid) | route-ladder, day-model, plan-reader |
| Recovery-override | `movement-recovery-hint` / `-context` | hero (tier-selectie) |

### 9.2 Componentenkaart (bestaand + voorgesteld)

```
DASHBOARD MAIN (donker, cockpit) ─ BewegingScreen → MovementCockpit
├── MovementTodayHero        [bestaat]   VANDAAG — enige check-off, exertie, recovery-states
├── MovementStartChoice      [bestaat]   startpatroon + anker-picker (Future You-bron)
├── score-ring (in Cockpit)  [bestaat]   echte scores.beweging + narratieve FY-regel
├── trend-tegel (in Cockpit) [bestaat]   buildDomainTrendRow → sparkline + baseline
├── MovementRouteLadder      [bestaat]   4-fasen read-only + doorway naar plan-reader
├── hermeting-teaser         [bestaat]   forward-pointer, betekenis van "wanneer zie ik iets"
├── MovementWeekRhythm       [voorstel]  "Deze week" ritme-readout uit daily-log
└── CockpitShell/CockpitTile [bestaat]   gedeelde craft-primitives (tokens, geen thema)

DYNAMISCH STAPPENPLAN (light 768px)
├── MovementPlanDeepBody     [herontwerp] read-only 12-weken arc, one-way sync uit daily-log
├── MovementPlanConfigurator [bestaat]   basis-template-keuze (F2)
└── stap-kaart (uitklap)     [voorstel]  duur/intensiteit/reden/effect/alternatief/tips

GEDEELDE KERN (lib)
├── day-model                [bestaat, SSOT]  "wat is vandaag" (geen status)
├── movement-prefs           [bestaat]        anker + startpatroon
├── movement-recovery-hint/-context [bestaat] herstel-override op de dagstap
├── betekenis-motor          [voorstel]       §3 — formule die statistiek → betekeniszin maakt
└── daily_action_log (API)   [bestaat]        executie-SSOT

PLANNER-ENGINE (F3, service-role, gated)
└── PriorityEngine / ProgressionEngine / NotificationEngine / adapters (agenda, wearable, weer)
```

### 9.3 Welke modules onafhankelijk zijn, welke uitbreidbaar

- **Onafhankelijk (kern, altijd aanwezig):** day-model, daily-log, movement-prefs, hero, score-ring. Deze draaien zonder enige adapter en zonder premium. De **dagstap is altijd gratis** (noordster).
- **Uitbreidbaar (adapters, gated poorten):** planner-engine, agenda, wearable, weer, AI-coaching, cross-pijler-inzichten, zorgprofessional/B2B. Elk is een aparte poort met eigen privacy-vereisten; elk erft de cockpit-structuur en verzint géén tweede afvink-oppervlak.

### 9.4 De betekenis-motor als nieuw, centraal lib-artefact

Het enige echt nieuwe architectuur-onderdeel dat dit document voorstelt is de **betekenis-motor** (§3.2): een pure functie `buildMeaning(metric, referent, anchor) → string` die overal wordt aangeroepen waar nu nog kale of hardcoded copy staat. Het bundelt `buildAnchorWhySuffix` (bestaat), de 0-punt-referent (uit `trendRow.baselineScore` en intake), en de metriek. Het is de codificatie van de ontwerpregel "geen getal zonder adres". Voorgesteld als lib, niet als component — het produceert taal, geen UI.

---

## 10. Visualisaties met onderbouwing

Regel: **alleen visualisaties die gedrag ondersteunen.** Per visualisatie: waarom, welke vraag, wanneer verschijnt, wanneer verdwijnt, welke actie volgt.

| Visualisatie | Beantwoordt vraag | Verschijnt wanneer | Verdwijnt/verandert wanneer | Actie eruit |
|---|---|---|---|---|
| **Score-ring** (SVG, r=54) | "Waar sta ik nu?" (2) | altijd na 1e check | recovery-licht: ring blijft rustig, faket geen daling | oriëntatie, geen directe actie |
| **Leefstijllijn / sparkline** | "Waar begon ik → waar sta ik?" (1+2) | ≥2 trendpunten | <2: "nog te vroeg"; RULES-grens: delta `null` | wijst naar hermeting-payoff |
| **Route-ladder** (4-fasen stepper) | "Waar naartoe, wat komt daarna?" (3+4) | altijd | fase-promotie: NU-badge schuift | doorway naar plan-reader |
| **"Deze week" ritme-readout** | "Houd ik ritme?" (proces) | ≥1 actie deze week | lege week: "je eerste moment telt al mee" | valideert, geen checkbox |
| **Hermeting-teaser** (afstand) | "Wanneer zie ik écht iets?" | altijd | "klaar" bij dag 0 → CTA | start hermeting |
| **Exertie-histogram** (intern) | "Wordt zwaar lichter?" | ≥3 exertie-punten | onvoldoende data | voedt betekenis-motor + recovery |
| **0-punt-terugblik** (hermeting) | "Hoeveel ben ik gegroeid?" (1↔2) | op hermeting | — | emotionele payoff, motiveert door |

**Bewust géén:** ringen-armada (Apple-Activity-stijl 3 ringen tegelijk), calorie-grafieken, trainingsvolume-balken, hartslag-curves (geen sensor), streak-kalender met vlammetjes, radar met 6 assen op de first viewport. Reden: elk daarvan is een metriek-om-de-metriek die geen van de vier vragen scherper beantwoordt en de rust breekt.

**Visueel gewicht (hiërarchie), want niet alles is even belangrijk:**
1. VANDAAG-hero — grootste, enige gevulde (sage) knop. *Het is de enige actie.*
2. Score-ring — tweede anker, groot serif-cijfer. *Oriëntatie.*
3. Route-ladder — accent op NU-fase. *De brug naar het plan.*
4. Deze week / trend / hermeting — rustige readouts, kleiner. *Context, geen actie.*

Tokens (bestaan): accent sage `#5A8F6A` (`PILLAR.beweging`), tegel `rounded-2xl border-white/10 bg-black/20`, serif DM Serif Display voor cijfers/titels, ring track `#22302E`. Cockpit **donker** (staand besluit), plan-reader **light 768px** (leescontent leest beter licht) — dezelfde tokens, ander thema: "van cockpit naar werkblad", niet "andere app".

---

## 11. UX- en gedragsprincipes

| Principe | Concreet in dit besturingssysteem |
|---|---|
| **Één primaire actie per scherm** | Alleen de hero heeft een gevulde knop; al het andere is secundair/tertiair |
| **Minimale cognitieve belasting** | Max ~6 tegels; dagelijkse check-in = één vraag; geen sub-scores/calorieën |
| **Betekenis boven data** | Geen getal zonder adres (§3); de betekenis-motor is een harde poort |
| **Inzicht boven cijfers** | Een inzicht verschijnt alleen als het eerlijk én actionable is (§7.3) |
| **Voortgang boven prestaties** | Procesdoelen leiden ("beweeg 3× iets"); resultaatdoelen pas bij hermeting |
| **Autonomie boven controle (SDT)** | Gebruiker kiest anker, tier, startpatroon; systeem forceert nooit op |
| **Kleine haalbare stappen (Fogg/Tiny Habits)** | De kleinste zinvolle stap van vandaag; koppel aan bestaande gewoonte |
| **Positieve gedragsverandering** | Terugval = datapunt, geen schuld; "pak de volgende gewoon weer op" |
| **Vertrouwen opbouwen** | Echte score, eerlijke "niet elk dag een cijfer", geen medische belofte |
| **Rust in de interface** | Headspace-kalmte: witruimte, weinig knoppen, geen rode urgentie-badges |
| **Informatie alleen wanneer relevant** | Lege trend toont geen kale as; kaarten verschijnen/verdwijnen contextueel (§7.1) |

**Gedragsframeworks die het systeem dragen:**
- **COM-B:** Capability ↑ (kleinste stap), Opportunity ↑ (tijd/alternatieven, F2/F3), Motivation ↑ (anker + eerlijke trend).
- **Fogg (B=MAP):** elke extra vraag verlaagt *ability* → daarom één dagvraag, niet elf. De trigger zit op het laagst-drempelige gedrag.
- **SDT:** autonomie (keuze), competentie (eerlijke voortgang), verbondenheid (het anker gaat vaak over anderen: meedoen, kleinkinderen).

**Vermeden (opdracht + SSOT):** overvolle dashboards, te veel cijfers/knoppen, fitness-app-uitstraling, competitie, schuldgevoel, gamification-badges, gefaket tweede cijfer.

---

## 12. Wireframebeschrijvingen per dashboardsectie

De volledige 375px/1024px-wireframes en de plan-reader-wireframe staan in de blauwdruk (§11.1–11.3). Hier de **sectie-per-sectie leesrichting** die de vier vragen expliciet maakt — welk deel welke vraag beantwoordt.

### 12.1 First viewport (donker) — de vier vragen in één blik

```
┌ [anker-eyebrow] voor: zelf blijven doen wat je wilt ─────┐  → VRAAG 3 (Future You)
│                                                          │
│ ┌ VANDAAG · trainen ─────────────────────────────────┐  │  → VRAAG 4 (volgende stap)
│ │ Eén krachtsessie: squat, push, pull                │  │     DOMINANT — enige actie
│ │ [waarom, anker-gekleurd] · ⏱ 30–45 min             │  │
│ │ [ Markeer als gedaan ✓ ]   Geen tijd vandaag?      │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ◔ 58 Beweging   "elke week telt mee voor…"              │  → VRAAG 2 (waar sta ik) + FY-lading
│                                                          │
│ ┌ Deze week ─┐  ┌ Je trend ──────────┐                  │  → proces + VRAAG 1↔2 (begon→nu)
│ │ kracht 1×  │  │ ▁▂▃▅  Begin 55·nu 58│                  │
│ └────────────┘  └─────────────────────┘                  │
│                                                          │
│ ┌ Jouw route ──────────────────────────────────────┐   │  → VRAAG 3+4 (reis naar FY)
│ │ ● F1 NU · ○F2 ○F3 ○F4                             │   │
│ │ Bekijk je volledige stappenplan →                 │   │  ← DE doorway
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ┌ Je volgende meetmoment ──────────────────────────┐    │  → wanneer wordt VRAAG 2 herijkt
│ │ "over ~3 weken zie je je lijn bewegen"            │    │
│ └───────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

Elke sectie is gelabeld met de vraag die hij beantwoordt. **Geen sectie beantwoordt géén vraag** — dat is de test uit de leeswijzer, hier visueel gemaakt.

### 12.2 Light onderbouw (na scroll)

```
├ Gedaan-log (chips + minuten)               → bewijs (VRAAG 1↔2)
├ ▸ Voeding & supplementen (ingeklapt)       → cross-pijler, progressive disclosure
└ Verdieping: Gids · Inzichten · Stappenplan → uitdiepen, geen ruis op first viewport
```

### 12.3 Plan-reader (Dynamisch Stappenplan, light 768px)

```
┌ Jouw stappenplan · beweging ─────────────────────┐  → één canonieke naam
│ voor: zelf blijven doen wat je wilt              │  → anker-kop (VRAAG 3)
│ ● Deze week   Kracht leren    (jouw stap ✓)      │  → gespiegeld uit daily-log
│ → Week 2–4    Structureel krachttrainen          │  → NU-fase, accent (VRAAG 4)
│   ┌ uitklap ────────────────────────────────────┐│
│   │ ⏱ 30–45 min · matig · 2×/week               ││
│   │ Waarom: [mechanisme] …want jij wilt [anker] ││  → §3 betekenis-motor
│   │ Verwacht effect · Alternatief: fietsen       ││
│   └──────────────────────────────────────────────┘│
│ ○ Week 4–12   Verankeren en meten                │  → toekomst, gedimd (VRAAG 3)
└──────────────────────────────────────────────────┘
```

De plan-reader **toont**, de hero **doet**. Startknop en afvinken leven alleen in de hero (kern-invariant §6.3).

---

## 13. Systeemdiagrammen (in tekst)

### 13.1 De volledige transformatie-lus (het besturingssysteem in één diagram)

```
                    ┌──────────────── 0-PUNT (permanent) ───────────────┐
                    │  intake · score-baseline · anker · beperkingen    │
                    └───────────────────────┬───────────────────────────┘
                                            │ referent voor alle betekenis
                                            ▼
   ┌─────────────────────────── DASHBOARD MAIN ───────────────────────────┐
   │  VRAAG 2: score-ring   VRAAG 3: anker/FY   VRAAG 1↔2: trend           │
   └───────────────┬───────────────────────────────────────┬──────────────┘
                   │ tier-keuze → hero-stap                 │ betekenis-motor (§3)
                   ▼                                        │ kleurt elke zin
        ┌────────────────────────┐                          │
        │ VANDAAG-HERO (VRAAG 4) │◀─────── Future You ──────┘
        │  enige check-off       │
        └───────────┬────────────┘
                    │ afvink + exertie
                    ▼
        ┌────────────────────────┐
        │ daily_action_log       │  EXECUTIE-SSOT (append-only, permanent)
        └───────────┬────────────┘
        ┌───────────┼────────────┬─────────────────────────┐
        ▼           ▼            ▼                          ▼
  "Deze week"   trend/lijn   plan-reader ✓        recovery-context (morgen)
  (ritme)       (traag)      (one-way read)       (tier-override)
        └───────────┴────────────┴─────────────────────────┘
                    ▼
        computeCurrentPhaseId(scores, ctx, gelogde sessies)
                    │  fase promoot?
                    ▼
        route-ladder schuift → nieuwe dagstappen ontsloten
                    │
                    ▼  (na ~8 weken)
        HERMETING → nieuwe score/delta → 0-punt naast heden → betekenis-payoff
                    │
                    ▼
        DASHBOARD verandert → de lus begint opnieuw, op een hoger niveau
```

### 13.2 Datatransformatie-pijplijn (stadia gekoppeld aan eigenaren)

```
[1 RUW]      daily_action_log · RCV_FEEL · exertie · intake
   │ aggregeer
[2 INFO]     buildDomainTrendRow · week-aggregatie
   │ vergelijk met 0-punt/curve
[3 INZICHT]  delta · ritme-readout · exertie-histogram
   │ koppel aan anker (buildAnchorWhySuffix) + 0-punt
[4 BETEKENIS] betekenis-motor → "getal met adres"
   │ laad met Future You
[5 MOTIVATIE] FY-copy in hero/score (geen cijfer)
   │ vertaal naar kleinste stap
[6 ACTIE]    MovementTodayHero → "Markeer als gedaan"
   │ Fogg: trigger+ability+motivation
[7 GEDRAG]   stap gedaan
   │ append
[8 NIEUWE DATA] nieuwe daily_action_log-rij → terug naar [1]
   │ patroon veranderd?
[9 NIEUW INZICHT] computeCurrentPhaseId · hermeting-delta → fase/score schuift
```

### 13.3 Bidirectionele stuur/leer-relatie (compact)

```
DASHBOARD ──stuurt──▶ STAPPENPLAN     (tier, anker, fase, score → welke stap/fase zichtbaar)
DASHBOARD ◀──leert── STAPPENPLAN      (afvink → daily-log → week/trend/fase-promotie)
             ↑ één check-off, één SSOT, geen tweede vinklijst (kern-invariant)
```

---

## 14. Aanbevelingen voor een schaalbare implementatie

### 14.1 Bouw geen nieuw dashboard — laat de cockpit volwassen worden

De hele visie is al belichaamd in de bestaande B-1a/B-1b-cockpit. Bouw langs de vastgelegde fasering (blauwdruk §slot):

- **F1 (nu):** harmoniseer de plan-reader tot één light 768px-surface met cockpit-tokens en one-way sync uit daily-log; houd de hero heilig als enige actie. *Introduceer hier de betekenis-motor (§3.2)* als lib — het is de grootste hefboom voor "voelt begeleid" en raakt geen datamodel.
- **F2:** basis-template + ontbrekende intake-velden (tijd/werk/sport), zonder paywall op de dagstap; optioneel Future You-mijlpaalzin binnen het anker (§5.2).
- **F3 (premium):** planner-engine (tijd, agenda, herkalibratie, wearables) als *planning/uitvoering-laag*, nooit als inhoud van vandaag.

### 14.2 De vier invarianten die elke uitbreiding moet respecteren

Elke nieuwe module, adapter of AI-laag erft deze noordsterren. Wie ze schendt, verdunt het besturingssysteem:

1. **Één check-off** — de VANDAAG-hero. Geen tweede afvink-oppervlak, ooit.
2. **Één score** — de engine-score. Geen gefaket tweede/groeiend getal.
3. **Dagstap altijd gratis** — premium raakt nooit de inhoud van vandaag.
4. **Geen gamification** — beloning = echte data (lijn, fase, hermeting), niet badges/streaks.

### 14.3 Uitbreidbaarheid richting AI, wearables, zorgprofessionals

- **AI-coaching:** als reranking-strategie (`ModelRecommendationStrategy`) op pseudonieme features, achter guardrails (max intensity, medische grens), nooit vrije-tekst-health-dump. Het levert *betere timing/keuze*, geen nieuwe inhoud die de kern omzeilt.
- **Wearables:** slaap/HRV/load → *soft* recovery-hint op de analyse-laag; nooit een tweede domeinscore, nooit sensor-raw in een stap. Art. 9-poort: expliciete toestemming, client-side aggregatie, TTL 90d.
- **Zorgprofessional / B2B:** activiteiten via een DB-tabel (`lp_activity_definitions`) + CMS, zonder deploy; aparte tenant-overweging. De betekenis-motor en cockpit-structuur blijven ongewijzigd — de professional voegt *inhoud* toe, geen nieuw afvink-mechaniek.

### 14.4 Meetbaarheid ingebouwd (meet-standaard)

Bij elke nieuwe CTA/keuze/opt-in de meting in dezelfde wijziging. De sleutel-events die aantonen dat het besturingssysteem *rondloopt*: `dashboard_vandaag_action_toggled` (hero-conversie) + `dashboard_beweging_plan_click` (doorway) + `plan_reader_shown`. Geen PII in GA4/Clarity.

### 14.5 De botsingen op één rij (opdracht-wens vs. gelockt besluit)

Voor de volledigheid — dit document omarmt de opdracht-visie, maar respecteert deze gelockte afwijzingen (blauwdruk §0.2). Ze zijn geen beperkingen maar de *bron* van de moat (eerlijkheid, rust):

| Opdracht-wens | Besluit | Waarom |
|---|---|---|
| Foto "Hier begon je" | ❌ Beginwaarde i.p.v. foto | Anti-transformatie-lijn + AVG art. 9; beginwaarde toont het *leven*, niet het lijf |
| Future You Score 62→78 | ❌ FY in copy/richting | Verzonnen tweede cijfer ondermijnt vertrouwen |
| Streaks / "X dagen op rij" | ❌ Ritme-readout | Schuld-mechaniek; opdracht vraagt zelf "geen schuldgevoel" |
| Badges / gamification | ❌ Echte data als beloning | Fitness-app-signaal, expliciet afgewezen |
| Meerdere afvink-oppervlakken | ❌ Eén check-off | Voorkomt tegenstrijdige staat; kern-invariant |
| "6432 stappen" / hartslag | ⚠️ Minuten/modaliteit nu; stappen pas met wearable-adapter (gated) | PSF telt geen stappen; betekenis-motor werkt op wat we écht meten |
| Rijke dagelijkse check-in (11 dim) | ⚠️ Eén dagvraag; rijke check bij hermeting | Fogg: elke extra vraag verlaagt ability |
| Weer-adaptatie | ⚠️ Toekomst-adapter (F3) | Vereist adapter die nog niet bestaat |

---

## Slot — de aanbeveling in één alinea

Ontwerp het beweegdashboard niet als een verzameling meters maar als een **transformatiemachine**: 0-punt in, Future You als bestemming, en tussen die twee een lus die ruwe data via een strenge betekenis-motor (geen getal zonder adres) omzet in motivatie en één haalbare stap — waarna die stap zelf nieuwe data wordt en het systeem op een hoger niveau opnieuw begint. Alles wat op het scherm staat beantwoordt één van vier vragen (waar begon ik, waar sta ik, waar wil ik heen, wat is de volgende stap); alles wat dat niet doet, hoort er niet. Het Dashboard en het Stappenplan zijn geen twee schermen maar één besturingssysteem: het dashboard stuurt welke stap zichtbaar is, de gedane stap leert het dashboard wie de gebruiker aan het worden is. Bouw dit als de volwassen-wording van de bestaande cockpit, met de betekenis-motor als eerste, kleinste, grootste hefboom — en borg met de vier invarianten (één check-off, één score, gratis dagstap, geen gamification) dat elke toekomstige laag de belofte versterkt in plaats van 'm te verdunnen. De gebruiker mag nooit het gevoel hebben naar cijfers te kijken; hij moet het gevoel hebben begeleid te worden naar de beste versie van zichzelf.

> **Meetpunt:** `dashboard_vandaag_action_toggled` + `dashboard_beweging_plan_click` + `plan_reader_shown` — hieraan lees je af of de transformatie-lus daadwerkelijk rondloopt. Geen PII in GA4/Clarity.

*Opgesteld 22 juli 2026, verankerd tegen `main` + de blauwdruk + de drie SSOT-docs (`BEWEEG_COCKPIT_FUTURE_YOU.md`, `KOMPAS_BEWEGING_NAAR_STAPPENPLAN.md`, `ARCHITECTUUR_LIFESTYLE_PLANNER.md`). Geen implementatie, geen code. Verandert geen enkele DEFER/FREEZE/KILL-status.*
