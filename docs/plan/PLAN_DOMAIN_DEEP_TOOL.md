# PLAN — DomainDeepTool: één diepe tool per Kompas-domein

> **Layer 3 — Plan + besluitlog.** Strategisch ontwerp voor het uniforme
> "deep tool"-patroon per Kompas-domein (gratis snapshot → premium meten →
> premium begeleiding), met voeding als geïmplementeerde pilot (juli 2026).
> Kruisverwijzingen: [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) ·
> [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) ·
> [`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) ·
> [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`IA_ECOSYSTEEM.md`](../core/IA_ECOSYSTEEM.md) §5

---

## F0 — North star

Elk Kompas-domein krijgt één diepe tool die opent op de laatste check-in, gratis
vertrouwen opbouwt (PS-beoordeling + leefstijl), en premium ontgrendelt wanneer
iemand wil meten (T1) of persoonlijke terugkoppeling wil (T2) — het gat dat dit
sluit: 8 versnipperde premium-teasers zonder funnel, en een tier-2 waarvan nooit
gedefinieerd is wát er straks betaald wordt.

## F1 — Verificatie (stand 3 juli 2026, alles geopend en gecontroleerd)

**Bevestigd:**

| Bron | Bevinding |
|---|---|
| `Dashboard.tsx` (3712 r.) | `VoedingScreen` r. 2811; `KompasHome`-routing r. 3063→3178; `KompasSoonScreen` r. 2708 (alleen activiteiten/trend-overlays); `DomainSoonScreen` r. 2783 (energie/herstel: gauge + lever + SoonPill, géén drivers); `MEDITERRANEAN_PRODUCTS` r. 2267 = 4 emoji-placeholders; `KompasLightPanel`/`KompasSectionHeader`/`SoonPill` r. 2283–2366 |
| Domein-schermen | Sleep/Stress/Beweging/Verbinding dupliceren elk `KOMPAS_LIGHT`, `KompasLightPanel`, `KompasSectionHeader`, `SoonPill` als lokale kopie. Elk heeft: check-in-CTA (behalve verbinding), leefstijl-sectie, supplementstrip-variant, coach-`WaitlistButton`, premium-teaser-kaart met `SoonPill` |
| `src/data/dashboard/index.ts` | `PILLARS` 7 domeinen ✓; `TAB_SECTIONS.vandaag = ["vandaagCard","kompasHome"]` ✓; `IDENTITY_FIELDS` (geslacht/gewicht/lengte/werk) bestaat al als dormant T1-inputontwerp ("Ontgrendelt je persoonlijke eiwitdoel") |
| `domain-role.ts` | intervention/readout ✓; `READOUT_DRIVERS` gedefinieerd maar **door geen enkele UI gebruikt** |
| `account-dashboard.ts` | `nutritionIntake { date, items[{label, band: below\|around\|meets}] }` zit al in `DashboardData` (laatste `intake_intake_log.estimate`); voeding-scores voeden de tijdreeks via `nutrition_score` |
| Migraties | `intake_domain_checkin` ✓ (sleep/stress/movement); `daily_action_log` ✓; `premium_waitlist` ✓ maar zie bug hieronder |
| API | `sleep-checkin`/`stress-checkin`/`movement-checkin` ✓; `nutrition-log` ✓ (estimate + score + advies + delta); `protein-target` ✓ incl. `measurement.protein_target_computed`-events |
| Docs | STEPPED_CARE tier 2 `is_paid=false` nu, "later betaald" al voorzien; PLAN_MEASUREMENT §A (PAL/BMR/TDEE/macro's, lengte/gewicht pas bij start verdieping) en §E (groei-eerst); BRAND_POSITIONING §4 moat = engine/triggers/timing privé, uitkomsten publiek |
| `nutrientReferences` | 5 nutriënten met vuistregel-drempels, `lifestyleAction`, `comparisonPath`, `claimKey` — "vuistregel"-taal verplicht (indicatieve drempels) |

**Afwijkingen t.o.v. het prompt (gemeld, niet gegokt):**

1. **`CHECK_ROUTES` bestaat niet** — heet `PILLAR_CHECKIN_ROUTES` (slaap/stress/beweging/voeding; **verbinding en de readouts hebben géén check-in-route**).
2. **Voeding-check-ins lopen NIET via `intake_domain_checkin`** maar via `intake_intake_log` (rijker: estimate-banden, score, advies, delta). Vermoeden uit het prompt bevestigd.
3. **Live bug:** `premium_waitlist`-migratie CHECK't op 3 features (`inzichten`,`statistieken`,`lichaamssamenstelling`) terwijl de API er 8 accepteert → **alle 5 coach-wachtlijstknoppen geven vandaag een 500**. Fix zit in retentie-backlog-prompt 3 (`docs/cursors/fable-prompts-retentie-backlog-2026-07.md`); hier niet gedupliceerd. Tot die fix toont de T2-CTA de error-state.
4. `NutritionIntakeSection` (banden-weergave) bestaat al in `Dashboard.tsx` maar is **dormant** — `"nutritionIntake"` staat niet in `TAB_SECTIONS`.
5. `domain_tool.*` als client-side `domain_event` kan niet op het dashboard: `/api/intake/events` vereist een intake-sessie-cookie die daar niet gegarandeerd is (zie F4.5).

## F2 — Diagnose

- **Versnippering bevestigd:** 5 interventieschermen met identieke opbouw maar 5× gekopieerde bouwstenen; 8 premium-featurekeys verspreid over losse teasers; coach-joins geven live 500.
- **Voeding is data-rijkste domein maar toont er niets van:** de inname-banden bestaan (dormant `NutritionIntakeSection`), de tool toont emoji-placeholders.
- **Energie/herstel zijn doodlopende schermen:** `DomainSoonScreen` zonder drivers, terwijl `READOUT_DRIVERS` klaarligt.
- **Premium-teasers meten "shown" maar geen klik-intent** — er is geen funnel gratis → T1 → T2.
- **Tier-2-schuld:** stepped care zegt "gratis nu, later betaald", maar niemand heeft gedefinieerd wát er betaald wordt en waar de knip ligt t.o.v. de moat.

## F3 — Beslissingen

**Poort 1 — patroon: Optie A, één `DomainDeepTool`-shell.**
De 5 schermen dupliceren nu al hun bouwstenen; een shell maakt de 3-lagen-gating
één keer testbaar en meetbaar (zelfde events, ander `domain`-veld). Per-domein
merknamen kunnen later als content-laag bovenop, niet als aparte componentbomen.
Optie B (losse tools) vermenigvuldigt precies de schuld die F2 constateert.

**Poort 2 — gratis laag 0 = snapshot + PS-beoordeling + tier-3-strip. De moat draagt dit.**
Gratis: (a) snapshot van de laatste check-in (inname-banden + domeinscore),
(b) PS-kwalitatieve keuzelijst op productgroep-niveau (geen merken, geen verkoop),
(c) supplementstrip via bestaand tier-3-affiliate-pad. Moat-analyse: de gratis
laag toont uitsluitend **uitkomsten** (banden, oordelen, score) — nooit de **hoe**
(drempels, gewichten, triggers). Dat is exact de scheidslijn uit
BRAND_POSITIONING §4/§5 ("deel de waarom, bescherm de hoe"); een concurrent die
dit scrapet heeft de engine niet. De vraag "is dit genoeg waarde zonder T1?" —
ja: herkenning + één concrete actie + onafhankelijk oordeel ís de
Consumentenbond-belofte; T1 voegt precisie en longitudinaliteit toe, geen
vertrouwen. **Niet gratis:** longitudinaal loggen, trends over weken, export,
persoonlijke doelen (TDEE/eiwitdoel — vereist lengte/gewicht), coach-terugkoppeling.

**Poort 3 — T1: scenario (b), soft-paywall direct na eerste snapshot (fake-door, geen betaling).**
1. De gratis, herhaalbare voedingscheck ís al de gratis tier-2-basis
   (inname-inschatting); T1-in-de-tool is de *verdieping* (kcal/macro's,
   persoonlijke doelen, weektrends) waarvoor STEPPED_CARE "later betaald" al
   aankondigt. De groei-belofte uit PLAN_MEASUREMENT §E blijft dus intact: de
   leading-indicator-laag (check-ins, hermeting) blijft gratis.
2. Scenario (a) — gratis tot X check-ins — creëert een entitlement dat je bij de
   latere lock moet afpakken: loss aversion, support-pijn, en nul conversiesignaal
   tot die dag.
3. Scenario (c) — 7 dagen freemium — vereist een echte logging-backend vóór je
   iets kunt leren; te duur voor een pilot.
4. (b) meet betalingsintentie per klik zonder één regel backend; retentierisico
   is klein omdat de gratis check-in-lus de retentie draagt, niet de locked module.

**Poort 4 — T2: Optie A, async weekterugkoppeling op self-report (dag 16–30, aan de hermeting-lus).**
UI vóór launch: **waitlist** (bestaand `premium_waitlist`-instrument) — meet
intentie hard, in tegenstelling tot een kale SoonPill; een fake-door-checkout is
overkill zolang er geen prijs is. Geen live coach: geen backend, en "live"
schuurt tegen diagnose-verwachtingen. Voorwaarde: constraint-fix uit
retentie-backlog-prompt 3 (coach-features geven nu 500).

**Poort 5 — readouts: Optie A, DriverDeepView (spec, geen code nu).**
Gratis: gauge + `READOUT_DRIVERS` als kaarten ("Energie volgt uit slaap, voeding
en beweging") met per driver de score-delta en een CTA naar de stuurdomein-tool.
T1 optioneel later (energie-curve / herstel-log als light-log); T2 nooit eigen
coach — begeleiding loopt via het stuurdomein. Een eigen 3-lagen-trap zou tegen
`domain-role.ts` ingaan en content dupliceren.

**Poort 6 — pilot: Optie A, voeding.**
Rijkste bestaand substraat (eigen check-flow, `intake_intake_log`-banden,
`nutrientReferences`, protein-target-API), meeste monetisatiepaden (5
vergelijkingspagina's + curated productgroepen), en de dormant
`NutritionIntakeSection` bewijst dat de data al dashboard-klaar is. Slaap heeft
check-in-infra maar geen banden-equivalent in de gratis laag.

## F4 — Ontwerp

### 4.1 Domein-matrix (alle 7)

| Domein | Gratis laag 0 (concrete UI) | Premium T1 (meten) | Premium T2 (coach) | Data-bron | Compliance-risico | Affiliate |
|---|---|---|---|---|---|---|
| **Voeding** (pilot) | Snapshot inname-banden (5 nutriënten) of intake-fallback (NUT_O3/NUT_PROT) · Voedingsbasis-acties · PS-beoordeling productgroepen · supplementstrip | kcal/macro's + persoonlijk eiwitdoel/TDEE (lengte/gewicht pas bij start, §A) + weektrend | Weekterugkoppeling op check-ins + hermeting-delta | `intake_intake_log.estimate` + `answers.NUT_O3/NUT_PROT` + `scores.voeding` | Inname vs status (hoogste risico; banden-copy bestaat al en is conform) | omega-3, magnesium, eiwit, vit-D, zink |
| **Slaap** | Snapshot slaapscore + SLP_*-herkenningsregels · ritme-hefbomen · magnesium-strip | Slaaplog: bedtijd/wektijd/avondprikkels + weektrend (teaser bestaat) | Weekterugkoppeling op slaaplog | `intake_domain_checkin` (sleep_score) + `answers.SLP_*` | Geen slaapstoornis-taal; log = gedrag, geen slaapmeting | magnesium |
| **Stress** | Snapshot stress_score + reset-tools · magnesium-strip | Piek/dagboek: momenten + triggers (self-report) | Weekterugkoppeling | `intake_domain_checkin` (stress_score) | Geen burn-out-/diagnose-taal | magnesium |
| **Beweging** | Snapshot movement_score + MOV_STR/MOV_CARD-herkenning · creatine/eiwit-strip | Trainingslog + eiwitdoel-koppeling (protein-target-API bestaat al) | Weekterugkoppeling | `intake_domain_checkin` (movement_score) + `answers.MOV_*` | Geen prestatie-/blessureclaims | creatine, eiwitpoeder |
| **Verbinding** | Snapshot connection_score + contactmoment-quick-win | Weekreflectie (1 vraag/week) — vereist eerst een check-in-route (bestaat niet) | Weekterugkoppeling, voorzichtigste copy | `domain_scores.connection_score` (geen check-route!) | Eenzaamheid ≠ klinische term; zachtste taal | geen |
| **Energie** (readout) | DriverDeepView: gauge + drivers slaap/voeding/beweging met delta + CTA naar stuurdomein-tool | Optioneel later: energie-curve light | Geen eigen T2 → driver-tool | `READOUT_DRIVERS` + scores | Geen "energie-boost"-claims (EFSA) | geen (via drivers) |
| **Herstel** (readout) | DriverDeepView: drivers slaap/beweging/stress | Optioneel later: herstel-log light | Geen eigen T2 → driver-tool | `READOUT_DRIVERS` + scores | Geen overtraining-diagnose | geen (via drivers) |

### 4.2 DomainDeepTool UX-shell (wireframe in woorden)

```
┌─ KompasLightPanel (licht op donkere kompas-surface) ─────────────┐
│ [DomainTopNav — bestaand, buiten de shell]                       │
│ ┌ Header-Card (glow: pillar.color) ──────────────────────────┐   │
│ │ [gauge score]  EYEBROW (pillar-kleur)                      │   │
│ │                Domeinnaam (serif 25)                       │   │
│ │                tagline                                     │   │
│ │                "Op basis van je laatste check-in · {datum}"│   │
│ └────────────────────────────────────────────────────────────┘   │
│ [Check-in-CTA → PILLAR_CHECKIN_ROUTES[domein]]                   │
│ ── LAAG 0 (altijd zichtbaar) ──                                  │
│ SnapshotCard   — banden of intake-fallback; empty → check-in-CTA │
│ Leefstijl-sectie (domein-specifiek, bestaand)                    │
│ CuratedChoices — "PS-beoordeling", productgroepen, geen merken   │
│ SupplementStrip — buildRecommendations-variant (tier 3)          │
│ ── LAAG 1 (T1, locked) ──                                        │
│ MeetModule     — 🔒 "Premium · meten", beschrijving,             │
│                  "Bekijk wat je straks meet" → preview-bullets,  │
│                  SoonPill "Binnenkort in premium"                │
│ ── LAAG 2 (T2) ──                                                │
│ CoachModule    — "Premium · begeleiding", weekterugkoppeling-    │
│                  framing, WaitlistButton (geen medische belofte) │
└──────────────────────────────────────────────────────────────────┘
```

Component-tree (pilot-implementatie):

```
src/components/dashboard/DomainDeepTool.tsx   (nieuw, herbruikbaar)
├─ DomainDeepTool          — shell: panel + header + check-in-CTA + slots
│    └─ fires: domain_tool_snapshot_viewed { domain, layer, has_checkin }
├─ DeepToolSectionHeader   — eyebrow/titel/action (t.z.t. vervangt 5 kopieën)
├─ DeepToolSoonPill        — idem
├─ DeepToolMeetModule      — laag 1 locked; fires domain_tool_tier_preview_click
└─ DeepToolCoachModule     — laag 2 wrapper (children = WaitlistButton/SoonPill)

Dashboard.tsx → VoedingScreen  — gebruikt de shell; levert voeding-content
src/data/dashboard/nutrition-curated.ts — CuratedChoice-seed (statisch)
```

### 4.3 Data-flow (voeding-pilot)

```
intake_sessions ─┐
intake_intake_log ┴→ loadAccountDashboardData()
      │                 ├─ DashboardData.nutritionIntake { date, items[label, band] }
      │                 └─ model.answers (NUT_O3, NUT_PROT) · model.scores.voeding
      └→ KompasHome (heeft `data`) → VoedingScreen(nutritionIntake-prop)
              └→ DomainDeepTool: header-datum + SnapshotCard-banden
```

- **Geen nieuwe tabel nu** — pilot-T1 is locked UI. Bij echte T1: voeding
  hergebruikt `intake_intake_log` (AVG-cleanup al geregeld in
  `cleanup_intake_session_linked_data`); pas als een tweede domein T1 krijgt,
  beslissen we over een generieke `domain_tool_log`. Minimale diff wint.
- **Geen migratie in deze wijziging.** De enige open SQL is de
  `premium_waitlist`-constraint-fix, die bij backlog-prompt 3 hoort.

### 4.4 Compliance per laag

- **Laag 0:** banden-labels zijn bestaand en conform ("Aan de lage kant" =
  inname-band, geen status); vuistregel-disclaimer blijft ("een vuistregel, geen
  meting, status of diagnose"). Curated = kwalitatief oordeel op
  productgroep-niveau, geen merken, geen gezondheidsclaimtaal.
- **Laag 1:** unlock-copy praat over "inname-inschatting", "streefwaarde",
  "op basis van wat jij invult" — nooit "tekort", nooit "live gemeten".
  Lengte/gewicht worden pas bij start van de verdieping gevraagd (§A), en dat
  staat er expliciet bij.
- **Laag 2:** "leefstijlbegeleiding, geen diagnose"; terugkoppeling op eigen
  check-ins, geen medische duiding.

### 4.5 Meetpunten (max 6 — het zijn er 2 nieuw + 4 hergebruikt)

| Event | Laag | Kanaal | Payload |
|---|---|---|---|
| `domain_tool_snapshot_viewed` **(nieuw)** | 0 | GA4 + Clarity | `{ domain, layer: "free", has_checkin }` |
| `domain_tool_tier_preview_click` **(nieuw)** | 1 | GA4 + Clarity | `{ domain, target_tier: 1 }` |
| `dashboard_voeding_checkin_click` (hergebruik) | 0 | GA4 + Clarity | `{ surface, placement }` |
| `dashboard_voeding_supplement_click` (hergebruik) | 0 | GA4 + Clarity | `{ slug, target }` |
| `dashboard_voeding_coach_waitlist_shown` (hergebruik) | 2 | GA4 | `{ surface }` |
| `premium_waitlist_join` + `premium.waitlist_joined` (hergebruik) | 2 | GA4 + domain_event (server) | `{ feature, surface }` |

Afwijking t.o.v. het F4.5-voorstel in het prompt: `domain_tool.*` als
**client**-domain_event kan niet — `/api/intake/events` vereist een
intake-sessie-cookie die op het account-dashboard niet gegarandeerd is
(meten.mdc). Het bestaande dashboard-patroon is GA4+Clarity client-side, durable
events server-side; het durable T2-signaal (`premium.waitlist_joined`) dekt de
conversie-kant al. Wil Dennis een durable snapshot-event, dan is daarvoor een
account-scoped events-route nodig — buiten pilot-scope. `domain_scores` gaan
nergens in client-payloads (alleen `has_checkin` boolean); geen PII.
`dashboard_voeding_premium_upsell` vervalt op deze surface — opgevolgd door
`domain_tool_snapshot_viewed` → `domain_tool_tier_preview_click`.

## F5 — Scope

**Gebouwd (code, alleen voeding):**
- `src/components/dashboard/DomainDeepTool.tsx` — herbruikbare shell + MeetModule + CoachModule + section-header/soon-pill.
- `src/data/dashboard/nutrition-curated.ts` — statische PS-beoordeling-seed (productgroepen).
- `Dashboard.tsx`: `VoedingScreen` herbouwd op de shell (3 lagen); `MEDITERRANEAN_PRODUCTS` vervangen; `KompasHome` geeft `nutritionIntake` door.

**Bewust NIET:** macro-logging-backend, Stripe/`isMember`, coach-API, andere
domeinschermen migreren, `affiliate-links.ts`, intake-flow, scoring-engine,
migraties.

## F6 — Handoff

**Acceptatiecriteria strategie:** ✔ matrix 4.1 · ✔ moat-analyse Poort 2 ·
✔ paywall-scenario Poort 3 · ✔ readout-strategie Poort 5 · ✔ component-tree 4.2.

**Acceptatiecriteria pilot:**
- [ ] `/dashboard?tab=vandaag&kompas=voeding` toont 3 herkenbare lagen
- [ ] Laag 0 toont banden-snapshot met datum; zonder voedingscheck: intake-fallback; zonder data: check-in-CTA
- [ ] Laag 1/2 locked met conforme copy; nergens "live gemeten" of "tekort"
- [ ] Meetpunten conform 4.5
- [ ] `grep -rn "console.log" src/` schoon; `npx tsc --noEmit` groen; vitest groen; build groen (niet naast een draaiende `next dev`)

**Vervolgvolgorde (ROI na voeding):**
1. **Slaap** — check-in-infra + slaaplog-teaser bestaan; magnesium-affiliate; T1-artefact (slaaplog) is het meest gevraagde.
2. **Beweging** — trainingslog-teaser + protein-target-API half klaar; creatine/eiwit-affiliate.
3. **Stress** — piek/dagboek is nieuw substraat; magnesium overlapt slaap (minder incrementeel).
4. **Verbinding** — eerst een check-in-route bouwen; geen affiliate; laagste ROI.
5. **Energie/herstel** — DriverDeepView (klein: `READOUT_DRIVERS` + bestaande gauges), kan parallel aan 2–4.

**Randvoorwaarde T2:** constraint-fix `premium_waitlist` (retentie-backlog-prompt 3) vóór de coach-waitlist gepromoot wordt.

**Meetpunt-regel:** `domain_tool_snapshot_viewed` → `domain_tool_tier_preview_click`
→ `premium.waitlist_joined` — hier lees je of de deep tool premium-intentie
opwekt zonder free-tier vertrouwen te breken.

---

*Aangemaakt: 3 juli 2026 (Fable-sessie DomainDeepTool)*
