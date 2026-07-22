# Kompas-Beweging → Stappenplan — architectuuranalyse

> **Status (22 jul 2026): analyse/ontwerp, geen implementatie.** Opgesteld als antwoord op Dennis' vraag naar het meest effectieve pad van de dag-tier-keuze in `MovementTodayHero` naar het volledige stappenplan. Gebaseerd op de live staat van `BewegingScreen` → `MovementCockpit` → `MovementTodayHero` + `MovementRouteLadder`, `movement-today-choices.ts`, `movement-prefs.ts`, `movement.ts` (template v1.4), en de twee SSOT-docs [`BEWEEG_COCKPIT_FUTURE_YOU.md`](BEWEEG_COCKPIT_FUTURE_YOU.md) + [`ARCHITECTUUR_LIFESTYLE_PLANNER.md`](ARCHITECTUUR_LIFESTYLE_PLANNER.md).
> Verandert geen enkele bestaande DEFER/FREEZE/KILL-status. Levert analyse, geen code.

---

## Vooraf geverifieerd (niet aannemen, maar zo)

**De tier-keuze trekt uitsluitend uit fase 1 (`mov-phase-deze-week`).** `resolvePatternTrainingStepId` (`movement-prefs.ts`) zoekt alleen binnen `MOVEMENT_WEEK_PHASE_ID`. De rijkere programma-stappen uit week 2–4 (`mov-full-body-2x`, `mov-conditie-zone2`, `mov-conditie-interval-lite`) komen dus **nooit** in de dagflow terecht, ongeacht hoe ver iemand in het plan zit. Dit is relevant voor de tier-mapping (§G) en een open vraag (§L).

---

## A. Executive summary

De cockpit is al bijna wat Dennis wil: bij tier-keuze laadt hij **nu al** direct de juiste stap (hypothese B is grotendeels gebouwd). Het echte probleem is niet "een knop erbij", maar **twee onverbonden voltooiingssystemen** met verschillende identiteit (daily-log = account-scoped, plan-progress = session-scoped) en **twee visuele werelden** (donkere cockpit vs 480px light intake-kolom). Een extra hero-knop "Jouw stappenplan" lost dat niet op — het verzwaart de first viewport en botst met de SSOT-regel *"de enige plek waar je afvinkt is de VANDAAG-hero."* De doorway bestaat al: de route-ladder linkt naar het volledige plan, één component lager. Fix de **bestemming**, niet de ingang.

Richting: (1) harmoniseer de plan-reader naar één light 768px-surface met cockpit-tokens + één terminologie; (2) maak het volledige plan in account-context **read-only** (arc, geen tweede vinklijst) met one-way sync vanuit daily-log; (3) "opgeslagen plan" is géén F1-knop — de basis-template ís al opgeslagen, en het tijd-bewuste premium-plan is planner-engine-werk (F3). Bouw klein, wijs groot: de dagstap blijft gratis, altijd.

---

## B. Huidige frictie-diagnose

| Probleem | Impact | Root cause |
|---|---|---|
| Twee voltooiingssystemen syncen niet | Gebruiker vinkt in hero af, ziet in stappenplan nog "todo" → wantrouwen, dubbel werk | daily-log is **account-scoped** (`/api/account/daily-log`, key=stepId+dag); plan-progress is **session-scoped** (`PlanProgress.sessionId`, permanente step-state). Andere sleutel, andere semantiek (dag vs fase) |
| Breedte-/thema-breuk dark→light | Klik op "volledige stappenplan" voelt als een ánder product | Cockpit = 1280px dark / 768px light; plan-reader = 480px intake-kolom. Geen gedeelde token-set |
| Terminologie lekt | "leefstijlplan" (header) vs "stappenplan" (link) vs "beweegplan" (doc) = zelfde template, 3 namen | Nooit één canoniek label vastgelegd |
| Tier-picker zit vast op fase 1 | "Trainen" toont in week 6 nog steeds de week-1-krachtstap; het echte programma (full-body 2×, zone 2) verschijnt nergens in de dagflow | `resolvePatternTrainingStepId` scoped op `MOVEMENT_WEEK_PHASE_ID` only |
| "Stappenplan" belooft meer dan het levert | Wie op "Trainen" drukt verwacht een sessie (oefeningen/sets), krijgt één regel + rationale | Day-step = één gedrag (by design); er is geen workout-/sessiecatalogus |
| Geen "opgeslagen plan"-concept, terwijl het plan al persist | Dennis wil een "Bewaar dit plan"-knop → suggereert dat het niet al bewaard is | Plan-progress + movement-prefs persisteren al; de mentale model-mismatch is UX, geen data-gat |

**De kern-root-cause:** het plan bestaat op twee assen die nooit zijn samengebracht — *executie per dag* (hero/daily-log) en *structuur per fase* (plan-reader/plan-progress). Elke oplossing die een dérde afvink-oppervlak toevoegt, maakt dit erger.

---

## C. Aanbevolen user journey

Zeven stappen, met edge cases geannoteerd:

1. **Eerste bezoek** `/dashboard?kompas=beweging` → geen startPattern gekozen → hero-score-tegel toont *leeg-state* ("Dit wordt je startpunt"); `MovementStartChoice` vraagt startpatroon + anker (B-1b). *Edge: startPattern nog niet gekozen → picker eerst, geen dagstap forceren.*
2. **Dagkeuze** → drie tiers (Herstel/Matig/Trainen) met Aanbevolen-badge uit verse check-in (rcvFeel ≤7d) of recovery-hint. *Edge: andere pijler is prioriteit vandaag → hero toont "Vandaag ligt je stap bij [slaap]" + `Maak beweging mijn prioriteit`.*
3. **Tier gekozen → stap laadt direct** (dit is al zo). Bij Trainen: training-gate ("Gisteren zwaar getraind?"). *Edge: gate=ja → herstel/matig/toch-trainen.*
4. **Context, geen tweede lijst.** Onder de stap: `Waarom deze training? →` (bestaat) en de **route-ladder direct eronder** beantwoordt "waar zit dit in mijn arc?". Géén hero-knop naar een tweede checklist.
5. **Afvinken** → `Markeer als gedaan` (de énige check-off) → exertie-microvraag (licht/matig/zwaar) → *"Morgen kies je opnieuw."* Daily-log = SSOT. *Edge: geen tijd → lichtere tier, zelfde key.*
6. **Terugkeer morgen** → hero reset naar dagkeuze; "Deze week"-readout spiegelt wat gelogd is; route-ladder schuift mee als de fase promoot.
7. **Plan-inzicht (op eigen initiatief)** → route-ladder-link → **redesigned plan-reader** (768px light, cockpit-taal): read-only arc voor account-users, reflecteert daily-log-voltooiingen. Basis: template aanbevolen op sport/werk/fitness (F2). Premium: tijd-slots + herkalibratie (F3).

```
375px — cockpit, na tier-keuze "Trainen"
┌ DomainTopNav ───────────────────────────┐
├──────────────────────────────────────────┤
│[■] VANDAAG · trainen                      │
│[■] ┌────────────────────────────────────┐ │
│[■] │ Eén krachtsessie: squat, push, pull│ │  ← day-step (SSOT)
│[■] │ Je traint al kracht — winst zit in │ │
│[■] │ consistentie…  …want jij wilt je   │ │  ← rationale + anker
│[■] │ sterk blijven voelen.              │ │
│[■] │ ⏱ 30–45 min                        │ │
│[■] │ ┌────────────────────────────────┐ │ │
│[■] │ │   Markeer als gedaan  ✓        │ │ │  ← PRIMARY (enige check)
│[■] │ └────────────────────────────────┘ │ │
│[■] │  Wijzig keuze  ·  Geen tijd vandaag?│ │  ← secondary text
│[■] │  Waarom deze training? →            │ │  ← tertiary link (bestaat)
│[■] └────────────────────────────────────┘ │
│    ╳ GEEN "Jouw stappenplan"-knop hier    │  ← anti-pattern
├──────────────────────────────────────────┤
│[■] JOUW ROUTE                             │
│[■] ● F1 NU · ○F2 ○F3                       │  ← read-only ladder
│[■] Bekijk je volledige stappenplan →      │  ← DE ENE doorway
└──────────────────────────────────────────┘
         │ tap
         ▼
┌ Plan-reader (light 768px, cockpit-tokens) ┐
│ Jouw stappenplan · beweging               │  ← één canonieke naam
│ ● Deze week  (jouw stap staat op ✓)       │  ← reflecteert daily-log
│ ○ Week 2–4   Structureel krachttrainen    │  ← read-only arc
│ ○ Week 4–12  Verankeren en meten          │
│ [Basis] Aanbevolen voor jou: kracht-thuis │  ← F2 template-variant
└───────────────────────────────────────────┘
```

---

## D. Surface-architectuur

| Optie | Frictie | Retentie | Dev | SSOT-consistentie | Mobile 375 | Desktop 1024 |
|---|---|---|---|---|---|---|
| **1. Inline expand in hero** | ❌ hoog (first viewport vol) | ⚠️ | ⚠️ | ❌ tweede-lijst-risico | ❌ te veel | ⚠️ |
| **2. Drawer/modal in cockpit** | ⚠️ | ⚠️ | ❌ (state, back-button, deep-link) | ⚠️ | ❌ lange content in drawer | ⚠️ |
| **3. Route → plan-reader, herontworpen** | ✅ laag | ✅ | ✅ (hergebruik bestaande route) | ✅ hero blijft enige actie | ✅ | ✅ |
| **4. Nieuw `/dashboard/plan/movement`** | ⚠️ | ✅ | ❌ tweede route onderhouden | ⚠️ route-duplicatie | ✅ | ✅ |

**Gekozen: Optie 3 — herontworpen plan-reader op de bestaande route.**

- **Optie 1 valt af:** de BEWEEG-SSOT is expliciet — de hero is de énige afvink-plek en de first viewport is heilig. Een uitklap-plan in de hero maakt precies de tweede todo-lijst die §7 van de cockpit-SSOT verbiedt.
- **Optie 2 valt af:** een 12-weeks plan is leescontent, geen micro-interactie. Een drawer breekt deep-link, back-button en SEO, en werkt slecht op 375px. (Een drawer is *wél* verdedigbaar voor een lichte "sessie-detail"-uitklap in F2 — oefeningen/sets — maar niet voor het hele plan.)
- **Optie 4 valt af:** een nieuwe route naast `/intake/plan/movement` is exact de terminologie-/route-lekkage uit §B. Eén canonieke plan-URL, herontworpen — niet twee.

De doorway blijft **één**: de bestaande route-ladder-link "Bekijk je volledige stappenplan". Geen tweede ingang in de hero.

---

## E. Visueel & breedte-besluit

| Surface | Breedte | Thema | Motivatie |
|---|---|---|---|
| Cockpit (hero, score, route) | tot 1280px dark / 768px light-zone | **dark** | Craft-atmosfeer, first viewport (staand besluit) |
| **Plan-reader (herontworpen)** | **768px (`lg:max-w-3xl`)** | **light** | Leescontent leest beter licht; roadmap: "niet heel Kompas donker". Adopteert cockpit-**tokens** (rounded-2xl, sage `#5A8F6A` accent, DM Serif-titels, eyebrow-labels) zodat het één familie is zónder een tweede donker product |
| 480px intake-kolom | **alleen pre-account intake** | light | Behouden waar er géén account/dashboard is; níét meer voor de dashboard-context |
| Compact-in-hero | — | — | **Niet doen.** Hero volgt shell-breedte, geen genest plan |

**Harmonisatie-principe:** dark cockpit en light plan-reader delen **tokens, niet thema**. Sage-accent, serif-cijfers, `rounded-2xl border`, eyebrow-caps en de identiteits-fasenamen ("Opnieuw leren gebruiken" → "Mijn toekomst onderhouden") zijn de lijm. De overgang dark→light voelt dan als *"van cockpit naar werkblad"*, niet als *"naar een andere app"*. Retireer de 480px-kolom in dashboard-context — dat is de grootste visuele breuk nu.

---

## F. Data-model & sync

**Principe: één executie-SSOT, één afgeleide structuur-laag.**

```
                 ┌─────────────────────────────┐
   HERO (enige   │  daily_action_log            │  account-scoped
   check-off) ──►│  (account_id, domain, date,  │  = "wat deed ik, per dag"
                 │   action_key=stepId,         │  = EXECUTIE-SSOT
                 │   exertion?)                 │
                 └───────────────┬──────────────┘
                                 │ one-way read (F1)
                                 ▼
   PLAN-READER  ◄────────  computeCurrentPhaseId(scores, ctx, logged)
   (read-only arc)         = afgeleide fase-staat, GEEN handmatige checkbox
                                 │
   plan_progress (session-scoped, todo/doing/done/skipped)
   → blijft ALLEEN de store voor ANONIEME intake-users (geen account/daily-log)
```

**Sync-besluiten:**

1. **Daily-log = de waarheid over executie.** Account-scoped, durable, replaybaar (voedt "Deze week", trend, later `lp_occurrences`).
2. **In account-context: plan-progress-checkboxes eruit.** Het volledige plan wordt read-only "dit is je arc"; fase-staat komt uit `computeCurrentPhaseId` (bestaat al) + gelogde sessies. Dit is precies de SSOT-regel volgen, niet breken.
3. **Anonieme intake-user houdt de checkboxes** — daar is geen daily-log/account, dus plan-progress is hun enige tracker. Bewuste vertakking, expliciet documenteren.
4. **Twee-weg sync is géén F1.** Dat vereist eerst één identiteit. Nu: daily-log=`account_id`, plan-progress=`sessionId`. Zolang die naad bestaat, is one-way (daily-log → plan-display) de eerlijke, veilige stap. Identiteit unificeren = eigen brok.

**stepId → tier mapping (de sleutel-tabel):**

| Tier | stepId (huidig, fase 1) | Bron |
|---|---|---|
| herstel | `mov-rustdag-na-inspanning` (altijd) | `REST_DAY_STEP_ID` |
| matig | `mov-trap-of-wandeling` \| `mov-conditie-onderhoud-week` | `resolveModerateStepId` (per startPattern) |
| trainen | `mov-thuis-basisoefening` \| `mov-kracht-onderhoud-week` \| pattern-resolved | `resolvePatternTrainingStepId` (MOV_STR + startPattern) |

**Schema-voorstel "opgeslagen plan" (velden, geen SQL-verplichting):**

- **Basis (F2) — geen nieuwe tabel nodig.** Breid de bestaande `movement-prefs` (answers-jsonb) uit:
  - `preferredStartPattern`, `movementAnchor` (bestaan)
  - `preferredSport` (loop/fiets/kracht-thuis/sportschool/zwemmen…)
  - `workActivity` (zittend/staand/fysiek — uit `movement-pal.ts`, nog niet in UI)
  - `weeklyAvailability` (dagen/tijdvak-buckets)
  - `fitnessSelfRating` (leunt op bestaande MOV_STR/MOV_CARD)
  → De template-variant *ís* het opgeslagen basis-plan. Geen "Bewaar"-knop; opslaan = kiezen.
- **Premium (F3) — planner-engine (`lp_*`, bestaat als ontwerp):**
  - `lp_plan_instances` (account_id, module_id='movement', progression jsonb, template_version)
  - `lp_occurrences` (activity_id, scheduled_start/end, status, completed_at) ← daily-log-voltooiing mapt hierop
  - `lp_guideline_progress` (weekdoelen)
  - Meerdere varianten = meerdere `lp_plan_instances` of een `variant_label`-kolom.

---

## G. Tier → stappen mapping

Exact welke `movement.ts`-stappen per tier × startPattern verschijnen (fase 1, huidige staat):

| | **kracht** (startPattern) | **conditie** | **dagelijks_ritme** |
|---|---|---|---|
| **Herstel** | `mov-rustdag-na-inspanning` | idem | idem |
| **Matig** | `mov-trap-of-wandeling` (MOV_CARD≤2) | `mov-conditie-onderhoud-week` (MOV_CARD≥3) | day-model-fallback |
| **Trainen** | `mov-thuis-basisoefening` (MOV_STR≤2) of `mov-kracht-onderhoud-week` (MOV_STR≥3) | eerste zichtbare conditie-stap in fase, ≠ rustdag | day-model `activeHabit` (SSOT-fallback) |

**Ontbrekende content (belangrijk):**

1. **Fase-lock.** Alle bovenstaande stappen komen uit `mov-phase-deze-week`. De rijkere programma-stappen — `mov-full-body-2x`, `mov-conditie-zone2`, `mov-conditie-interval-lite` (week 2–4) — verschijnen **nooit** in de dagkeuze. Wie in week 6 "Trainen" kiest, krijgt de week-1-krachtprikkel. Ofwel: (a) maak de tier-resolver fase-aware (schuift mee met `computeCurrentPhaseId`), ofwel (b) hou 'm bewust op fase 1 als "anker" en communiceer de progressie via de route-ladder. **Beslissing nodig** (§L).
2. **Geen sessie-detail.** "Trainen" = één regel, geen oefeningen/sets/reps. Wie een echt schema verwacht, valt terug op de blog-protocol-link. Een read-only "sessie-detail"-uitklap (squat 3×8, push, pull…) uit een kleine catalogus = zinvolle F2-content, mits **read-only** (nooit een tweede vinklijst).

---

## H. Basis vs premium productgrenzen

| | **Gratis / Basis** | **Premium** |
|---|---|---|
| Dagstap (tier-keuze + afvinken) | ✅ **altijd gratis** (roadmap-besluit) | — |
| Volledig stappenplan (read-only arc) | ✅ | ✅ |
| Exertie-microvraag, week-ritme, trend | ✅ | ✅ |
| Template-programma op sport/werk/fitness | ✅ (na F2-intakevelden) | ✅ + meerdere varianten |
| **Tijd-slots / agenda-koppeling** | ❌ | ✅ (planner-engine) |
| **Herkalibratie** (plan past zich aan op basis van log/hermeting) | ❌ | ✅ |
| Wearable recoveryFit | ❌ | ✅ (fase 2, privacy-gate) |
| Coaching + kennisbank-verdieping | ❌ | ✅ |

**Hoe je de paywall van de dagstap weghoudt:** de grens loopt tussen *"wat doe ik vandaag"* (gratis: tier, stap, afvinken, volledige plan-lezen) en *"wanneer & automatisch bijgesteld"* (premium: agenda-slots, herkalibratie, wearables, coaching). Premium voegt de **planning-/uitvoering-laag** toe (de tweede laag uit `ARCHITECTUUR_LIFESTYLE_PLANNER`), nooit de inhoud van vandaag. Zolang "wat" gratis blijft en alleen "wanneer/auto" premium is, raak je de dagstap niet.

**Intake-velden die eerst gebouwd moeten worden:** `workActivity` (bestaat in `movement-pal.ts`, niet in UI), `preferredSport`, `weeklyAvailability`. Fitnessniveau is er al via MOV_STR/MOV_CARD. Zonder deze velden is "aanbevolen programma per sport/werk-tijd/fitnessniveau" niet te leveren — dus die velden zijn de F2-poort.

---

## I. UI copy & button hierarchy

**Hero (na tier-keuze, todo-state) — aanbevolen hiërarchie:**

```
[ Markeer als gedaan ✓ ]        ← PRIMARY, full-width, sage (de enige check-off)
  Wijzig keuze · Geen tijd vandaag?   ← SECONDARY, tekstlinks, gecentreerd
  Waarom deze training? →              ← TERTIARY, bestaande onderbouwing-link
```

**Expliciet advies op Dennis' voorstel:**

- ❌ **Géén `[Jouw stappenplan]`-knop in de hero.** Het is een vierde actie in de first viewport, concurreert met de primaire check-off, en dupliceert de doorway die al in de route-ladder staat ("Bekijk je volledige stappenplan"). Het onderliggende doel — "waar past dit in mijn plan?" — wordt al beantwoord door de route-ladder één component lager. Versterk die, voeg niets toe.
- ❌ **Géén `[Opgeslagen plan]`-knop in F1.** Het plan is al persistent; een "bewaar"-affordance suggereert het tegendeel. In F2 wordt "aanbevolen voor jou"-copy een label ín de plan-reader, geen knop in de hero.
- ✅ **Behoud** `Wijzig keuze` / `Geen tijd vandaag?` als secundaire tekst — de huidige plaatsing klopt.

**Copy (NL, nuchter, geen medische belofte):**
- Doorway (route-ladder): *"Bekijk je volledige stappenplan →"* (bestaat, houden — dit wordt de canonieke naam overal).
- Plan-reader header: *"Jouw stappenplan · beweging"* (retireer "leefstijlplan" als label; het type mag `LifestylePlanTemplate` blijven heten).
- Basis-variant-label (F2): *"Aanbevolen voor jou: kracht-thuis, 2× per week."* (feit-eerst, geen "jij kunt dit!").
- Read-only arc-regel: *"Dit is waar je nu staat en wat er straks komt."* (bestaat in route-ladder — hergebruik toon).

---

## J. Fasering

### F1 — Harmonisatie & doorway (laagste risico, geen nieuwe data)
- **User-visible:** plan-reader herontworpen naar light 768px + cockpit-tokens; terminologie overal "stappenplan"; plan-reader reflecteert daily-log-voltooiingen (one-way read).
- **Backend:** geen nieuwe tabellen; leesbrug daily-log → plan-display; `computeCurrentPhaseId` blijft fase-bron.
- **Analytics:** hergebruik `dashboard_beweging_plan_click`; optioneel `plan_reader_shown {surface, variant}`.
- **Acceptatie:** account-user ziet geen tegenstrijdige staat tussen hero en plan; geen tweede afvink-oppervlak toegevoegd; één terminologie; visuele continuïteit dark→light; 375px + 1024px oké.

### F2 — Basis-programma (template-recommendation)
- **User-visible:** nieuwe intake-velden (workActivity, sport, beschikbaarheid); aanbevolen template-variant in plan-reader; optioneel read-only sessie-detail (oefeningen/sets); tier-picker fase-aware (na besluit §L2).
- **Backend:** `movement-prefs` answers-jsonb uitbreiden; kleine workout-catalogus (code-first, `src/data/planner/movement.ts`).
- **Analytics:** `plan_program_selected {sport, work_activity, fitness}`, `plan_reader_step_expanded` (triple-registratie).
- **Acceptatie:** gratis user krijgt aanbevolen programma zonder paywall; variant persist zonder expliciete "bewaar"-actie; dagstap ongewijzigd gratis.

### F3 — Planner-engine (premium, tijd-bewust)
- **User-visible:** tijd-slots, agenda-koppeling, herkalibratie, meerdere opgeslagen varianten; later wearable recoveryFit.
- **Backend:** `lp_*`-tabellen, `lp_plan_instances` + `lp_occurrences`, PriorityEngine (rules); daily-log-voltooiing mapt naar `lp_occurrences`.
- **Analytics:** `planner.started`, `planner.occurrence_completed`, `planner.priority_selected` (per `ARCHITECTUUR_LIFESTYLE_PLANNER` §13).
- **Acceptatie:** privacy-gate compleet vóór OAuth/wearable; premium raakt alleen "wanneer/auto", nooit "wat vandaag".

---

## K. Analytics events

| Event | Wanneer firen | Status |
|---|---|---|
| `dashboard_vandaag_card_shown` / `_action_toggled` | hero getoond / afgevinkt (surface=`kompas_beweging`) | bestaat |
| `dashboard_beweging_plan_click` | doorway naar plan-reader | bestaat |
| `dashboard_vandaag_step_alternative` | tier-keuze / wijzig / geen-tijd | bestaat |
| `plan_reader_shown` `{surface, variant}` | plan-reader mount (F1) | nieuw — triple-registreren |
| `plan_reader_step_expanded` `{step_id}` | sessie-detail uitklap (F2) | nieuw |
| `plan_program_selected` `{sport, work_activity, fitness}` | basis-variant gekozen (F2) | nieuw |
| `planner.*` | F3, per ARCHITECTUUR §13 | ontwerp |

> Meetpunt: `dashboard_beweging_plan_click` (doorway) + `plan_reader_shown` — hier lees je af of de herontworpen plan-reader de klik-door en de terugkeer verbetert; `dashboard_vandaag_action_toggled` blijft de hero-conversie. Geen PII in GA4/Clarity-payloads.

---

## L. Open vragen voor Dennis (blokkerend)

1. **Checkboxes weg voor account-users?** De BEWEEG-SSOT zegt "hero is de enige check-off". Mag de handmatige vinklijst in de plan-reader dan wég (read-only arc) voor ingelogde users — met behoud voor anonieme intake-users? Dit is de kern van de sync-oplossing.
2. **Tier-picker fase-lock:** moet "Trainen" meebewegen met de route-fase (week 2–4 → `mov-full-body-2x`), of bewust het week-1-anker houden en progressie alleen via de route-ladder tonen?
3. **Sessie-detail (oefeningen/sets):** gewenste F2-content? Zo ja: wie schrijft de workout-catalogus, en accepteer je dat die read-only is (geen tweede vinklijst)?
4. **Nieuwe intake-velden (workActivity/sport/beschikbaarheid):** waar in de flow — volledige intake, pulse-check-in, of een lichte dashboard-onboarding?
5. **Premium-grens bevestigen:** akkoord dat "tijd-slots/agenda/herkalibratie" premium is en "basis-template + dagstap" altijd gratis — d.w.z. de dagstap komt nóóit achter de paywall?

---

## Onze aanbeveling — per kernvraag

| Kernvraag | Verdict |
|---|---|
| Knop "Jouw stappenplan" onder hero-acties? | ❌ **Nee** — verzwaart first viewport, dupliceert de route-ladder-doorway, botst met SSOT. Versterk de bestaande ingang. |
| Stappenplan herontwerpen in cockpit-formaat? | ⚠️ **Ja, maar light 768px** — cockpit-**tokens**, niet cockpit-thema. Niet in de hero, niet in 480px, niet als drawer. |
| Auto-geladen tier-plan na keuze? | ✅ **Ja — grotendeels al gebouwd.** Formaliseer als read-only context; voeg géén tweede checklist toe. |
| Opgeslagen plan-knop in fase 1? | ❌ **Nee** — het plan is al opgeslagen. Basis-template = F2 (nieuwe intake-velden), tijd-bewust premium = F3 (planner-engine). |

**Samenvattend:** stop met "een knop erbij" denken. De frictie is niet een ontbrekende ingang maar een **onverbonden bestemming** en **twee visuele werelden**. Bouw F1 = harmoniseer de plan-reader (één light 768px-surface, cockpit-tokens, één terminologie, one-way sync vanuit daily-log) en houd de hero heilig als enige actie. Dat lost het bekende gat op zonder een derde afvink-oppervlak, zonder premium op de dagstap, en zonder de first viewport te overladen. Daarna pas F2 (basis-template, nieuwe intake-velden) en F3 (planner-engine, tijd & herkalibratie). Kleine actie, grote richting.

*Opgesteld 22 juli 2026, geverifieerd tegen `main`. Geen implementatie tot expliciet "bouw F1".*
