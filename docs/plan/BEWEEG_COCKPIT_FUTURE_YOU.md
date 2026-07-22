# Beweeg-cockpit — de Future You-ervaring op Kompas

> **Status (21 jul 2026): B-1a is live** (cockpit-shell, hero met dag-keuze Herstel/Licht/Trainen, route-ladder, responsive grid); **B-1b in bouw** (startpatroon + anker via `movement-prefs`, "Geen tijd vandaag?"). Dit doc blijft de craft/copy-SSOT voor B-1b/c/d; de tegel-beschrijvingen §2 beschrijven de doelstaat, de live code kan al verder geëvolueerd zijn (dag-keuze-laag).
> Doel: de beweeg-view op Kompas herontwerpen als een **cockpit die vooruit wijst** — elke tegel voelt als een investering in de man die je over tien tot twintig jaar wilt zijn, niet als een fitness-dashboard. Craft = [`MovementDashboardPreview`](../../src/components/content/MovementDashboardPreview.tsx) (tegels, ring, typografie), maar met de éérlijke keuze: **echte data + narratief**, nooit een verzonnen tweede score.
> Geënt op [`ROADMAP_DASHBOARD_COCKPIT.md`](../core/ROADMAP_DASHBOARD_COCKPIT.md) (§5 IA, §6 moat, §8.4 Future You-narratief) en [`WRITING_VOICE.md`](../core/WRITING_VOICE.md). Alle bouwbrokken binnen bestaande poorten.

---

## 0. De kern in vijf zinnen

1. De cockpit is één donker craft-blok bovenaan het beweegscherm dat vier laag-contracten (score → plan → vandaag → evidence) tot **één toekomstverhaal** verbindt: *waar sta ik op mijn lijn · wat doe ik vandaag · houd ik het ritme · beweegt mijn lijn · wie word ik · wanneer zie ik het.*
2. We porten de **craft** van `MovementDashboardPreview` (ring, tegels, serif-cijfers, donkere atmosfeer) maar **strippen de drie verzinsels**: de groeiende "Future You Score 62 → 78", de beweegstreak-tegel en de badge-tegel. Die vervangen we door echte score + narratief, een ritme-readout en een read-only route-ladder.
3. De enige plek waar je iets afvinkt is de **VANDAAG-hero** — huidige plan-stap uit de day-model-SSOT. De route-ladder vinkt niet, "Deze week" vinkt niet: het zijn readouts, geen parallelle todo-lijsten.
4. De Future You-lading zit in **copy en richting**, niet in een dagelijks bewegend cijfer. De payoff landt bij de **hermeting** (§8.4-besluit "ja narratief, nee als tweede score"); de cockpit wijst daar dagelijks naartoe zonder het te faken.
5. Identiteit vóór mechanisme, kleine actie, nuchtere toon — Consumentenbond-coach, geen "jij kunt dit!", geen medische belofte.

---

## 1. Wireframe

Craft-atmosfeer = donker cockpit-blok (`[■]`) als first viewport; daaronder blijft het bestaande light-thema (`[ ]`). "Niet heel Kompas donker maken."

### 375px (mobiel-eerst, hero dominant)

```
┌ DomainTopNav ─────────────────────────────┐  bestaat
├───────────────────────────────────────────┤
│[■] Focus:  ◉ Kracht   Conditie   Ritme     │  ← fase-1 only, dun
│[■]                                         │
│[■] ┌─ VANDAAG · fase 1 · kracht ─────────┐ │  ┐
│[■] │ Kniebuigingen vanaf een stoel — 3×8 │ │  │ HERO —
│[■] │ waarom (anker) in jóuw termen       │ │  │ dominante
│[■] │ ⏱ 8 min                             │ │  │ tegel,
│[■] │ [ Markeer als gedaan ✓ ] [Geen tijd?]│ │  │ FIRST
│[■] └─────────────────────────────────────┘ │  ┘ VIEWPORT
├───────────────────────────────────────────┤
│[■] ┌ WAAR JE STAAT ──────┐ (ring, compact) │  ← Lijn/score
│[■] │   ◔ 58   Beweging    │  + narratieve   │     + FY-regel
│[■] │   "met jouw plan…"   │  FY-regel       │
│[■] └─────────────────────┘                  │
│[■] ┌ DEZE WEEK ─┐ ┌ JE TREND ─┐            │  ← 2-up readouts
│[■] │ ritme      │ │ ▁▂▃▅  ▲+3 │            │
│[■] └────────────┘ └───────────┘            │
│[■] ┌ JOUW ROUTE ─────────────────────────┐ │  ← read-only
│[■] │ ● F1 NU · fase 1 · week 2           │ │     ladder,
│[■] │ ○ F2 · F3 · F4 (gedimd)             │ │     GEEN afvink
│[■] └─────────────────────────────────────┘ │
│[■] ┌ JE VOLGENDE MEETMOMENT ─────────────┐ │  ← hermeting-teaser
│[■] │ "over ~3 weken zie je je lijn…"     │ │
│[■] └─────────────────────────────────────┘ │
├───────────────────────────────────────────┤
│[ ] Gedaan-log (chips + minuten)            │  ← A1-flag, light
│[ ] ▸ Voeding & supplementen (ingeklapt)    │
│[ ] Verdieping: Gids · Inzichten · Stappenpl.│  ← 1 blok
└───────────────────────────────────────────┘
```

**First viewport = focus-chips + VANDAAG-hero.** Alles daarna (score, week, trend, route, hermeting) is scroll-secundair; de score-ring "peekt" om scrollen uit te nodigen.

### 1024px (cockpit-grid als de preview: ring links, content rechts)

```
┌ DomainTopNav ──────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│[■] Focus:  ◉ Kracht   Conditie   Ritme                      │
│[■] ┌──────────────┐ ┌────────────────────────────────────┐ │
│[■] │ WAAR JE STAAT│ │ VANDAAG · fase 1 · kracht          │ │  hero =
│[■] │              │ │ Kniebuigingen vanaf een stoel 3×8  │ │  dominante
│[■] │   ◔  58      │ │ waarom (anker) · ⏱ 8 min           │ │  tegel,
│[■] │  Beweging    │ │ [ Markeer als gedaan ✓ ] [Geen tijd?]│ │  top-rechts
│[■] │              │ ├──────────────────┬─────────────────┤ │
│[■] │ "met jouw    │ │ DEZE WEEK        │ JE TREND        │ │
│[■] │  plan bouw   │ │ ritme-readout    │ ▁▂▃▅  ▲ +3      │ │
│[■] │  je aan…"    │ ├──────────────────┴─────────────────┤ │
│[■] │  (FY-regel)  │ │ JOUW ROUTE  ● F1 NU · ○F2 ○F3 ○F4   │ │  ladder =
│[■] │              │ │ (horizontale stepper)              │ │  stepper
│[■] └──────────────┘ ├────────────────────────────────────┤ │
│[■]  links = score   │ JE VOLGENDE MEETMOMENT (teaser)     │ │
│[■]  (besluit 5)     └────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│[ ] Gedaan-log        │  ▸ Voeding & supplementen           │  light, 2-kol
│[ ] Verdieping: Gids · Inzichten · volledig stappenplan →    │
└────────────────────────────────────────────────────────────┘
```

**Reconciliatie score vs hero.** Besluit 5 ("score links/boven") en besluit 1+2 ("dark cockpit first viewport, hero dominant") leven samen in de preview-grid: op 1024px is de **score de linker-anker-kolom** (zoals de ring in de preview) en is de **hero de dominante tegel rechtsboven**. Op 375px staat de **hero eerst** (dominant, first viewport) en de score direct daaronder als compacte ring in het bovenste cockpit-blok — nog steeds "boven" in de cockpit, niet begraven. Dit is de enige plek waar 375px en 1024px van volgorde verschillen; expliciet zo gekozen, aanpasbaar.

---

## 2. De tegels — elk een Future You-vraag

Zes tegels. Voor elke: de vraag die 'ie beantwoordt, exacte NL-copy, states, en de échte databron (nooit een verzonnen tweede score).

### 2.1 WAAR JE STAAT — de lijn/score-tegel

- **Future You-vraag:** *Waar sta ik nu op de lijn naar de man die ik straks wil zijn?*
- **Databron:** `model.scores.beweging` (de éne engine-beweegscore) in de ring-craft van de preview. **Geen** "groeit naar 78"-tweede getal (besluit 4) — in plaats daarvan een **narratieve** Future You-regel (besluit 5).
- **Copy:**
  - Eyebrow: `WAAR JE STAAT`
  - Titel: de echte score in de ring + label `Beweging`
  - Ondersteunend (narratief FY): *"Elke week die je vasthoudt telt mee voor de versie van jou die straks nog gewoon zelf de trap op komt — dat is wat deze score langzaam opbouwt."*
  - CTA: `Bekijk je bewegingsanalyse →` (klapt de trend/onderbouwing uit)
- **States:**
  - *Leeg* (nog geen check / geen baseline): score verborgen, copy *"Dit wordt je startpunt. Vanaf hier gaan we bouwen."* + CTA `Doe de beweegcheck (3 min)`.
  - *Normaal:* ring + FY-regel.
  - *Recovery-licht:* n.v.t. — herstel raakt vandaag, niet je stand; de ring blijft rustig staan (geen daling faken).

### 2.2 VANDAAG — de hero (dominante tegel)

- **Future You-vraag:** *Wat is vandaag mijn kleinste investering in die toekomst?*
- **Databron:** day-model SSOT — `resolveActiveHabitContent` → `model.activeHabit` (huidige plan-stap), afvinken via `/api/account/daily-log` (`resolveActionKey`), override door [`movement-recovery-hint.ts`](../../src/lib/movement-recovery-hint.ts). **De enige "Markeer als gedaan" op het hele scherm** (besluit 2).
- **Copy:**
  - Eyebrow: `VANDAAG · fase 1 · kracht`
  - Titel (serif): de actie — *"Kniebuigingen vanaf een stoel — 3×8"* (`activeHabit.title`)
  - Ondersteunend (waarom, anker-gekleurd): *"Waarom vandaag: je wilt zelf blijven doen wat je wilt. Opstaan uit een stoel zonder je handen is daar letterlijk de test van — dit is die oefening."* (fallback = `slot.rationale`, het mechanisme, zoals nu)
  - Dosis: `⏱ 8 min`
  - CTA-primair: `Markeer als gedaan ✓` · CTA-secundair: `Geen tijd vandaag?`
  - Onderaan: `Waarom?` (onderbouwing, bestaat al)
- **States:**
  - *Todo:* titel + waarom + dosis + beide CTA's.
  - *Gedaan:* knop → `Gedaan ✓` (sage-tint); **exertion-microvraag** *"Hoe voelde dit? ○ licht ○ matig ○ zwaar"* (default meetmoment, besluit 7); daarna *"Morgen staat hier je volgende stap."* + één vervolg-link. **Geen streak-teller** (§7).
  - *Geen-tijd:* onthult de lichtere/rustdag-stap (`promoteRustdagStep`) of de `kort`-variant (B-1b), copy *"Drukke dag? Dit telt volledig mee."*
  - *Recovery-licht:* recovery-hint `light`/`rest` overrulet de stap → *"Je gaf aan zwaar hersteld — vandaag licht: 10 minuten wandelen."* Bij `medical` (`showMedicalNote`): exact de bestaande verwijs-copy (huisarts/fysiotherapeut), niets eromheen.

### 2.3 DEZE WEEK — de ritme-readout

- **Future You-vraag:** *Houd ik het ritme vast dat mijn toekomst bouwt?*
- **Databron:** week-samenvatting uit de gedaan-log / daily-log — een **spiegel van wat je deed**, geen todo-lijst met vinkjes (besluit 6). Nooit drie parallelle checkboxes.
- **Copy:**
  - Eyebrow: `DEZE WEEK · je ritme`
  - Titel (readout van feiten): *"Kracht 1× · wandelen 2×"* — wat er gelogd is, als constatering.
  - Ondersteunend: *"Ritme wint van perfectie. Mis je een week, dan pak je de volgende gewoon weer op."* (geen schuld-copy)
  - CTA: `Wat telde mee? →` (opent de gedaan-log) — géén afvink hier.
- **States:**
  - *Leeg:* *"Nog niets deze week — je eerste moment telt al mee."*
  - *Gedaan:* de readout van modaliteiten × keren.
  - *Recovery-licht:* *"Deze week vooral herstel — dat is óók bouwen."*

### 2.4 JE TREND — beweegt de lijn?

- **Future You-vraag:** *Beweegt mijn lijn de goede kant op?*
- **Databron:** `buildDomainTrendRow(model, "beweging")` — de echte leefstijllijn (sparkline + `DeltaBadge`), zoals nu al in `BewegingScreen`. Geen verzonnen sub-scores ("Kracht ▲ Conditie ▲" uit de preview vervalt).
- **Copy:**
  - Eyebrow: `JE TREND`
  - Titel: sparkline + *"Begin 55 · nu 58"* + `▲ +3`
  - Ondersteunend (koppelt trend aan payoff): *"Elke stip is een investering die je terugziet bij je volgende meetmoment — niet vandaag, wel over weken."*
  - CTA: `Open je voortgang →` (Voortgang-tab)
- **States:**
  - *Leeg* (<2 punten): *"Nog te vroeg voor een lijn — na je eerste hermeting zie je 'm bewegen."*
  - *Normaal:* sparkline + delta.
  - *RULES_VERSION-grens:* delta `null` + label *"meetmethode bijgewerkt"* (staand besluit — geen getal met sterretje).

### 2.5 JOUW ROUTE — read-only ladder/stepper

- **Future You-vraag:** *Welke versie van mezelf ben ik aan het worden — en wat komt daarna?*
- **Databron:** `movementPlanTemplate.phases` + `computeCurrentPhaseId`. NU licht op; toekomst gedimd. **Geen checkbox op enige rij** (roadmap l.33 + besluit 3).
- **Copy:**
  - Eyebrow: `JOUW ROUTE`
  - Fase-namen (identiteit, niet techniek): F1 *"Opnieuw leren gebruiken"* → F2 *"Kracht bouwen"* → F3 *"Functioneel sterk"* → F4 *"Mijn toekomst onderhouden"*.
  - Ondersteunend: *"Je bouwt in fases, niet in één sprong. Dit is waar je nu staat en wat er straks komt."*
  - NU-rij-acties (max, geen afvink): `Maak dit je prioriteit` (`postPrioritySelection`) · `Open Mijn Dag` (`onGoAgenda`) · `Wijzig startpatroon`.
- **States:**
  - *Normaal:* NU-rij accent + `NU`-badge; F2–F4 gedimd, alleen naam.
  - *Fase-promotie:* NU-rij-copy *"Je bent klaar voor fase 2 — je hield het patroon twee weken vast."* (een moment, **geen badge**).
  - *Leeg:* F1 default opgelicht.

### 2.6 JE VOLGENDE MEETMOMENT — de hermeting-teaser

- **Future You-vraag:** *Wanneer zie ik écht of ik de goede kant op ga?*
- **Databron:** afstand tot de volgende hermeting (dagen sinds start/laatste meting). Wijst alléén vooruit — de payoff-mechaniek (levenslijn beweegt, toekomstige-ik spreekt) is **B-2**, niet hier.
- **Copy:**
  - Eyebrow: `JE VOLGENDE MEETMOMENT`
  - Titel: *"Over ~3 weken zie je je lijn bewegen."*
  - Ondersteunend (de eerlijke keuze expliciet): *"Niet elke dag een cijfer — dat is bewust. De payoff komt bij je hermeting, als je terugkijkt op wat er veranderde."*
  - CTA: `Zo werkt je hermeting →` (of inactief tot het zover is).
- **States:**
  - *Te vroeg:* *"Nog even bouwen — het meetmoment komt vanzelf."*
  - *Klaar:* *"Je hermeting staat klaar — 8 weken sinds je start."* + `Doe de hermeting`.

---

## 3. Craft-tokens uit `MovementDashboardPreview`

**Hergebruiken (1:1 of licht aangepast):**

| Token | Waarde | Toepassing |
|---|---|---|
| Grid | `grid gap-4 lg:grid-cols-[220px_1fr]` + geneste `sm:grid-cols-2` | ring-links / content-rechts (1024px) |
| Ring | SVG `r=64`, `strokeWidth 12`, track `#22302E` + accent-arc, `strokeLinecap round`, `rotate(-90)`, serif-cijfer centraal | **echte** beweegscore |
| Tegel | `rounded-2xl border border-white/10 bg-black/20 p-4` | alle sub-tegels |
| Paneel | `rounded-3xl border border-white/10`, bg `linear-gradient(160deg,#131F1D,#0C1315)` | cockpit-omhulsel |
| Eyebrow | `text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]` | alle tegel-labels |
| Serif | `font-serif` (DM Serif Display) | scores + tegel-titels |
| Palet | bg `#102018`/`#131F1D`/`#0C1315` · text `#F1EFE8`/`#E7EDE8` · muted `#9FB0A6` · subtle `#7E8C82` · body `#CDD7D0` | donkere atmosfeer |
| Accent | **sage `#5A8F6A`** (`PILLAR.beweging`, preview gebruikt dit al) | ring, NU-rij, primaire CTA |

**Níét 1:1 overnemen (dit is de verzin-strip):**
- ❌ `Future You Score 62 · groeit naar 78 →` — de ring toont de **echte** engine-score; het tweede/groeiende getal is verboden (besluit 4). Narratieve regel i.p.v. cijfer.
- ❌ `Beweegstreak 12 dagen`-tegel — geen streak (§7). Vervangen door "Deze week"-ritme-readout.
- ❌ `Behaald · volgende badge`-tegel met chips — geen badges/gamification (§7). Vervangen door de route-ladder.
- ❌ `Kracht ▲ · Conditie ▲ · Energie ↗` — impliceert meerdere sub-scores; houd het bij de éne score + trend.
- ❌ `voorbeeld`-watermerk — dat is een marketing-demo-marker.
- ❌ De marketing-terracotta `oklch(0.69 0.095 50)` uit `/beweging-na-40` — op Kompas de sage-pijlerkleur (consistentie).

---

## 4. Mapping naar bestaande componenten (day-model blijft SSOT)

| Onderdeel | Actie | Detail |
|---|---|---|
| [`DomainTodayStrip`](../../src/components/dashboard/DomainTodayStrip.tsx) (gemount in `Dashboard.tsx` `withDomainTopNav`, l.3271) | **onderdrukken voor beweging** | Blijft de generieke vandaag-strip voor slaap/stress/voeding; beweging krijgt de eigen hero-tegel. Voorkomt dubbele vandaag-surface. |
| [`BewegingScreen`](../../src/components/dashboard/BewegingScreen.tsx) | **cockpit-host** | Nieuw donker `MovementCockpit`-blok bovenaan; bestaande light-secties (log, voeding, verdieping) eronder. |
| `MovementCockpit` | **nieuw** | Grid-omhulsel (preview-craft), rendert de zes tegels. |
| `MovementTodayHero` | **nieuw** (donker) | Evolutie van [`AgendaTodayHero`](../../src/components/dashboard/agenda/AgendaTodayHero.tsx): dezelfde day-model + daily-log-toggle-logica, craft-styling, anker/waarom/dosis + `Geen tijd?`- en recovery-states. Surface `kompas_beweging`. |
| `MovementScoreRing` | **nieuw / demotie** | Absorbeert de huidige gauge-card; **echte** `model.scores.beweging` + narratieve FY-regel. Vaste subtitle "Stapsgewijs kracht en conditie opbouwen" vervalt. |
| `MovementWeekRhythm` | **nieuw** | Ritme-readout uit de gedaan-log (geen todo). |
| `MovementTrendTile` | **nieuw / hergebruik** | `buildDomainTrendRow` sparkline + `DeltaBadge` (bestaan). |
| `MovementRouteLadder` | **nieuw** (donker) | 4 fase-rijen, NU licht op, read-only; `postPrioritySelection` / `onGoAgenda` / patroon-keuze. |
| `MovementRemeasureTeaser` | **nieuw** | Forward-pointer naar hermeting. |
| Focus-chips | **evolutie** [`MovementWeekCategoryPanel`](../../src/components/intake/MovementWeekCategoryPanel.tsx) | `WEEK_CATEGORY_OPTIONS` + `filterStepsForCategory`; stuurt hero-stap-selectie. |
| `SoonPill` + "Bewegingsvormen"-grid | **verwijderen** | A1-brok, al besloten. |
| 3× `FooterLink` | **→ 1 Verdieping-blok** | Gids + Inzichten; "Stappenplan" → secundaire tekstlink. |
| [`MovementLogPanel`](../../src/components/dashboard/MovementLogPanel.tsx) | **behouden** (A1-flag) | Evidence náást de score; voedt "Deze week". |
| [day-model](../../src/lib/day-model.ts) | **SSOT, ongewijzigd** | De ene waarheid voor "wat is vandaag". |

---

## 5. Copy-voorstellen ter keuze (geen architectuur)

### 5a. Het anker — vier opties + waarom-suffix

Eén enum-vraag, geen vrije tekst (geen PII, geen moderatie). Kleurt de "Waarom vandaag"-regel in de hero en later de nurture. **Score blijft engine-only** (besluit 8).

> **Vraag:** *"Als bewegen over tien jaar één ding voor je geregeld heeft — wat moet dat zijn?"*

| # | Optie (zichtbare copy) | `movementAnchor` | Waarom-suffix (achter de mechanisme-regel) |
|---|---|---|---|
| 1 | *"Zelf blijven doen wat ik wil — niemand nodig hebben"* | `zelfstandigheid` | *"…want jij wilt zelf blijven doen wat je wilt, zonder iemand nodig te hebben."* |
| 2 | *"Fit genoeg voor de mensen om me heen"* | `meedoen` | *"…want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken."* |
| 3 | *"Aan het eind van de dag nog energie over"* | `energie` | *"…want jij wilt 's avonds nog energie overhouden, niet op wilskracht draaien."* |
| 4 | *"Me sterk en capabel blijven voelen"* | `kracht` | *"…want jij wilt je sterk en capabel blijven voelen."* |

**Default = mannen 40+** (de doelgroep): het "over tien jaar"-frame en de trap-/zelfstandigheid-beelden zijn hierop geijkt; optie 1 is het diepste anker.

**35–65-variant (1 alinea).** Voor een bredere 35–65-groep schuift "over tien jaar" naar *"de komende jaren"* en leidt de framing meer met energie (optie 3) en meedoen (optie 2, dan eerder partner/kinderen dan kleinkinderen); zelfstandigheid (optie 1) blijft het diepste anker maar niet de default-toon, omdat "zelf de trap op komen" op je 40e nog abstract voelt. Kracht (optie 4) werkt in beide groepen identiek. Concreet: alleen de vraag-intro en de kleinkind-beelden wisselen mee; de vier enums en suffixen blijven gelijk.

### 5b. Exertie na gedaan — bevestigd

**Ja: `licht / matig / zwaar`** als de default microvraag ná "Markeer als gedaan" (besluit 7). Feit-eerst, drie opties, één tik. Alles daarboven (RPE-schaal, hartslag, series-detail) = **later opt-in**, nooit default — dagstap blijft licht.

---

## 6. Meetpunten (bestaande events/surfaces — géén nieuwe types)

- **Hero shown/afvink:** `dashboard_vandaag_card_shown` + `dashboard_vandaag_action_toggled` (bestaan), `surface: "kompas_beweging"`, `domain: "beweging"`.
- **Focus-keuze:** `movement_week_category` (GA4) + `plan.week_category_selected` (domain_events) — bestaan in `MovementWeekCategoryPanel`.
- **Startpatroon:** patroon-id als payload-dimensie op het week-category/plan-event — geen nieuw type.
- **Exertie:** `licht/matig/zwaar` als payload-dimensie op `dashboard_vandaag_action_toggled` (hero) resp. `movement.session_logged` (gedaan-log) — zelfde zelfgerapporteerde-beweegdata-klasse, register/DPIA al gedekt.
- **Deze week / Trend:** read-only, geen nieuw event (leest daily-log / `movement.session_logged` / leefstijllijn).
- **Route-prioriteit:** hergebruikt `postPrioritySelection`-telemetrie.
- **Hermeting-teaser:** hergebruikt het bestaande hermeting-CTA-event.

> Meetpunt: `dashboard_vandaag_card_shown` / `dashboard_vandaag_action_toggled` (surface=`kompas_beweging`) + `movement_week_category` — hier lees je hero-conversie en focus-keuze af.

---

## 7. Expliciet afgewezen

- ❌ **Streaks / "X dagen op rij"** — geen schuld-mechaniek; ritme tonen we als readout, niet als teller.
- ❌ **Badges / "volgende badge"** — geen gamification; de beloning is echte data (lijn, fase, log, hermeting).
- ❌ **Dagelijkse "Future You Score" (62 → 78)** — geen tweede/bewegend cijfer naast de engine-score; alleen echte score + narratief.
- ❌ **Tweede todo-lijst** — "Deze week" en "Jouw route" vinken niet; de enige afvink zit in de VANDAAG-hero (day-model SSOT).
- ❌ **Sub-scores per capaciteit** (kracht/conditie/energie als losse cijfers) — één scoringswaarheid.
- ❌ **Medische beloftes / uiterlijk-transformatie / avatar** — adviezen, geen diagnoses.

---

## 8. Fasering — wat dit doc wél/niet dekt

Dit doc dekt de **cockpit-beschrijving + copy** tot en met B-1d. Het dekt **niet** de payoff-mechaniek (B-2), agenda-diepte of een LLM-laag.

| Brok | Inhoud | Backend? | Poort |
|---|---|---|---|
| **B-1a** | Donker `MovementCockpit`-shell (hero + score-ring + trend + route-ladder + hermeting-teaser) op echte data (`activeHabit`, `scores.beweging`, leefstijllijn). Focus-chips. Strip-onderdrukking voor beweging. SoonPills/grid weg, footer→verdieping. Verzin-strip (streak/badge/FY-score) afgewezen. | Nee | direct — "domein→prioriteit"-brok |
| **B-1b** | Startpatroon-keuze (2–3 kaarten, geen squat-default) + `preferredStartPattern` (answers-jsonb) · `kort/vol`-varianten + tijd-knop · anker-vraag + anker-gekleurde waarom-regel. | answers + plan-data | na B-1a |
| **B-1c** | Exertie `licht/matig/zwaar` ná gedaan (payload-dim) · "Deze week"-ritme-readout uit de log · morgen-hint. | payload-dim | ná A1 (log live) |
| **B-1d** | Fase-promotie-momenten (copy, geen badge) · hermeting-teaser als levende forward-pointer (leest hermeting-afstand). | leest bestaand | na B-1c |
| **B-2 — NIET in dit doc** | Persoonlijke levenslijn ná check · hermeting-payoff waarin de toekomstige-ik terugkoppelt en de lijn zichtbaar beweegt. | — | staand besluit §8.4: ná beweeggids + Voortgang-basis |
| **Buiten scope** | agenda-fase-B · live plan-sliders · avatar · badges/streaks · tweede score · LLM-laag. | — | eigen poorten |

---

## 9. Open voor Dennis (copy-laag, niet architectuur)

1. De vier anker-opties + formulering (§5a) — akkoord of bijstellen?
2. Doelgroep-toon: 40+ default of de 35–65-variant meenemen (§5a)?
3. De narratieve FY-regels per tegel (§2) — toon/lengte naar smaak.

*Opgesteld 21 juli 2026, geverifieerd tegen `main` + `ROADMAP_DASHBOARD_COCKPIT.md`. Verandert geen enkele DEFER/FREEZE/KILL-status. Geen implementatie tot "bouw B-1a".*
