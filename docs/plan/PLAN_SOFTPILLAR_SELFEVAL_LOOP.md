# PLAN — Zachte-pijler zelf-evaluatie-lus (stress · energie · beweging · herstel)

> **Layer 3 — Plan.** Ontwerp voor de **terugkerende zelf-evaluatie-lus van de zachte pijlers**: stress, energie, beweging en herstel meten geen externe norm maar bewegen tegen het **eigen nulpunt** van de gebruiker (delta over tijd). Dit is de experiëntiële tegenhanger van de reeds ontworpen voedings-lus ([`PLAN_NUTRITION_SELFEVAL_LOOP.md`](PLAN_NUTRITION_SELFEVAL_LOOP.md)): die meet inname **tegen een richtlijn (ADH/DRV)**; deze meet beleving **tegen jezelf**. Tegelijk het antwoord op twee zwakke funnel-eindpunten — stress (🟡 PDF-gids opt-in, *redelijk*) en energie/beweging/herstel (🔴 doorlink naar pillar, *doodlopend*). **Alleen planning — geen code, geen schema-migraties.** Pseudostructuur ter illustratie.
>
> Kruisverwijzingen: [`PLAN_NUTRITION_SELFEVAL_LOOP.md`](PLAN_NUTRITION_SELFEVAL_LOOP.md) · [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) · [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) · [`PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md`](PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md) · [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) · [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) · [`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md) · [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md)

---

## Samenvatting

Het platform kent **twee soorten pijlers**, en die vragen om twee soorten lussen:

| Soort | Pijler(s) | Meetlat | Lus | Status |
|---|---|---|---|---|
| **Hard-kwantificeerbaar** | voeding | externe norm (ADH/EFSA DRV/RI) | inname *vs richtlijn* → gap → advies | 📐 ontworpen + F0 live ([`PLAN_NUTRITION_SELFEVAL_LOOP.md`](PLAN_NUTRITION_SELFEVAL_LOOP.md)) |
| **Zacht / experiëntieel** | stress, energie, beweging, herstel | géén externe norm — alleen **eigen baseline** | score/gedrag *vs eigen nulpunt* → richting → advies | **dit plan** |

[`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §1 stelde het al vast: **alleen voeding** heeft een harde, externe ijklat. De andere pijlers scoren zacht (zelfrapportage 0–100). Voor hen is de énige eerlijke meetlat de gebruiker zélf, over tijd — *"je stress-score bewoog van ~62 naar ~74"* — nooit een norm of status. Dat is precies de hermeting-loop die al bestaat voor de 6 domeinscores ([`intake_baseline_snapshots`](../core/ENTITY_MODEL.md) + `remeasure.completed`), nu uitgebreid naar een **lichte, terugkerende check-in** in plaats van alleen de zware 30-dagen-herintake.

**Waarom dit nu nodig is — de funnel-diagnose.** De PLAN-journey eindigt per zacht domein in een zwak eindpunt:

- **Stress → PDF-gids opt-in (🟡 redelijk).** Vangt e-mail (een leading indicator én een terugkeerkanaal) — daarom beter dan de rest. Maar de gids is een **eenmalig artefact**: download → 6 nurture-mails → stilte. Geen nulpunt, geen delta, geen *"is het beter geworden?"*. Het terugkeerkanaal staat er, maar er stroomt geen meting doorheen.
- **Energie / beweging / herstel → doorlink naar pillar (🔴 doodlopend).** Pure content. Geen capture, geen terugkeer, geen meting. De gebruiker leest en vertrekt; het platform leert niets en de gebruiker krijgt geen lus. (Voeding stond hier ook — en is via [`PLAN_NUTRITION_SELFEVAL_LOOP.md`](PLAN_NUTRITION_SELFEVAL_LOOP.md) als eerste uit dit rijtje getild.)

**De kern: het eindpunt is niet dood door gebrek aan content, maar door gebrek aan terugkeer + meting.** Een pillar of PDF mag het *begin* van een lus zijn, niet het einde.

**De goedkope verbouwing.** Anders dan voeding (dat een gloednieuw `intake_intake_log` nodig had voor grammen-over-tijd) hergebruikt deze lus **bijna alles**: de baseline-freeze, de delta-berekening, de remeasure-sessies, de events en zelfs de `cta_kind: pillar | remeasure` die al in de funnel zit. Eén lichte nieuwe bouwsteen (`intake_domain_checkin`) — de experiëntiële tweeling van `intake_intake_log`, verankerd aan hetzelfde nulpunt. De rest is **cadans + bedrading**, geen nieuwe engine: de re-score gebruikt de bestaande `calcDomainScores`.

Het belichaamt het merkprincipe uit [`src/data/about.ts`](../../src/data/about.ts) — *"Eerst de basis, dan de pil — in die volgorde, altijd"* — als data: een zachte pijler die beweegt door leefstijl wordt zichtbaar gemaakt vóór er ooit een supplement in beeld komt, en bij stress/energie/herstel ligt het zwaartepunt sowieso op leefstijl (geen `/beste/`-route).

---

## Wat al staat (niet herbouwen)

| Bouwsteen | Status | Bron |
|---|---|---|
| 6 domeinscores (incl. stress/energie/beweging/herstel) 0–100, regelgebaseerd | ✅ live | [`src/lib/intake-engine.ts`](../../src/lib/intake-engine.ts) → `calcDomainScores` |
| Nulpunt-bevriezing voor delta | ✅ live | `intake_baseline_snapshots` ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md)) |
| Delta-berekening baseline → nu | ✅ live | [`src/lib/intake-baseline.ts`](../../src/lib/intake-baseline.ts) (`computeDelta`, `days_since_baseline`) |
| Hermeting-sessie (`session_kind = remeasure`, `baseline_session_id`) | ✅ live | `supabase/migrations/20260610100000_intake_baseline_remeasure.sql` |
| Hermeting-events | ✅ live | `remeasure.invited`, `remeasure.completed` ([`src/lib/events.ts`](../../src/lib/events.ts)) |
| Terugkeer-link (recovery-token, `mode=remeasure`) | ✅ live | [`src/lib/recovery-token.ts`](../../src/lib/recovery-token.ts), dag-30-mail |
| Pillar- én remeasure-CTA als funnel-meetbaar type | ✅ live | `cta_kind` ∈ `lifestyle\|pillar\|supplement\|remeasure` ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md)), [`resolve-nurture-cta.ts`](../../src/lib/resolve-nurture-cta.ts) |
| Stress-terugkeerkanaal: PDF-gids opt-in + nurture | ✅ live | `/gids/stress`, `guide_opt_ins`, `guide-nurture/stress` ([`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md)) |
| Cross-domein-balansregel (advies nooit mono-supplement) | 📐 ontworpen | [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §2 |
| Kandidaat-kruisregels K1–K3 (energie/herstel-interactie) | 📐 ontworpen | idem §3 |
| Consent-versionering per nieuw verwerkingsdoel | ✅ live | `consent_records` + `CONSENT_VERSION` ([`intake-consent.ts`](../../src/lib/intake-consent.ts)) |
| Anonimiseringspad (pseudonym → k-anon vóór aggregatie) | 📐 ontworpen | [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §D2 |
| Volume-fases (regelgebaseerd <500, stats 500+, model 2000+) | 📐 ontworpen | idem §F |
| AVG-opruiming van sessie-gekoppelde data | ✅ live | `cleanup_intake_session_linked_data()` |

De lus hieronder voegt **alleen de lichte check-in-cadans + de eindpunt-bedrading** toe. Vergelijk met voeding: daar was de toevoeging *temporele as + capture-tabel*; hier is de temporele as er al (baseline+remeasure) — de toevoeging is *een lichtere meet-stap ertussen + de zachte-pijler-bedrading*.

---

## De diagnose, scherp — waarom 🟡 en 🔴

| Domein | Huidig eindpunt | Oordeel | Wat ontbreekt | Bijzonderheid |
|---|---|---|---|---|
| **Stress** | PDF-gids opt-in (`/gids/stress`) | 🟡 redelijk | meting na de download; de PDF is terminaal, geen nulpunt/delta | **Heeft al e-mail-capture** → goedkoopste om tot volle lus te maken. Geen `/beste/`-route (regel 74 in [`resolve-nurture-cta.ts`](../../src/lib/resolve-nurture-cta.ts)): zwaartepunt leefstijl |
| **Energie** | doorlink `/energie-na-40` | 🔴 doodlopend | capture + meting + terugkeer | **Afgeleide pijler** (geen eigen profielpagina; ANALYSIS §1). Lus leunt op interactie (K3: energie-dip-niet-door-slaap/voeding) |
| **Beweging** | doorlink `/beweging-na-40` | 🔴 doodlopend | capture + meting + terugkeer | **Half-kwantificeerbaar** (PAL-banden): deelt input met de voedings-meetlaag (§A1 van [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md)) |
| **Herstel** | doorlink `/gids/herstel` | 🔴 doodlopend | capture + meting + terugkeer | **Dunste pijler** (1 eigen vraag `RCV_PHYS` + gedeelde `STR_RCV`; ANALYSIS §1). Sterk interactie-afhankelijk (K1: onderherstel-niet-door-training) |

**Twee snelheden volgen hieruit.** Stress kan als voorhoede vrijwel direct (terugkeerkanaal bestaat). Energie en herstel zijn *afgeleide/dunne* pijlers: hun lus is minder een losse capture en meer een **interactie-uitkomst** (K1–K3) — daarover §"Energie & herstel" hieronder. Beweging zit ertussenin (deelt PAL-input met voeding).

---

## De vijf lagen (zacht: tegen jezelf, niet tegen een norm)

Zelfde vijf-lagen-anatomie als de voedings-lus, maar de meetlat verschuift van *richtlijn* naar *eigen nulpunt*.

| Laag | Wat het is | Hergebruikt / nieuw |
|---|---|---|
| **1. Capture** | Lichte check-in: 1–2 vragen per zacht domein ("hoe was je stress/energie/herstel deze week", zelfde schaal als de intake) | **NIEUW (licht):** `intake_domain_checkin` |
| **2. Estimate** | Re-score van het domein met **dezelfde** scoringsregels — geen nieuwe engine, geen schijnprecisie | `calcDomainScores` (bestaand), subset toegepast |
| **3. Zelf-evaluatie** | Delta + **richting** t.o.v. eigen nulpunt: *"je stress-score bewoog van ~62 naar ~74 — de goede kant op"* | `computeDelta` + `days_since_baseline` ([`intake-baseline.ts`](../../src/lib/intake-baseline.ts)) |
| **4. Advies** | Leefstijl-eerst, met **cross-domein-balansregel** en **K1–K3-interactie**; supplement alléén waar een gegate route bestaat (niet bij stress/herstel) | `getAdvice`-patroon + balansregel (ANALYSIS §2) + K1–K3 (§3) |
| **5. Cohort** | *"Mannen zoals jij verbeterden gemiddeld ~X punten in 30 dagen"* — richting-vergelijking, k-anon, volume-gated | k-anon-pad (§D2 plan), volume-gated (§F) |

### Laag 1 — Capture (lichte check-in)
Een **kort, terugkerend** instrument: niet de hele 15-vragen-herintake, maar de 1–2 vragen die het domein dragen (stress: `STR_FREQ`/`STR_RCV`; energie: `NRG_PATN`/`NRG_DEP`; beweging: `MOV_STR`/`MOV_CARD`; herstel: `RCV_PHYS` + gedeelde `STR_RCV`). Zelfde antwoordschaal als de intake, zodat de re-score één-op-één vergelijkbaar is met het nulpunt. **Geen nieuwe meetdimensie, geen wearable** (zie compliance). Beperk de check-in tot domeinen die in de intake als zwakste/focus naar voren kwamen — een check-in op een gezond domein is ruis.

### Laag 2 — Estimate (re-score, geen nieuwe engine)
De ruwe check-in-antwoorden gaan door de **bestaande** `calcDomainScores`. Dit is het scherpste contrast met voeding: daar bouwde laag 2 een nieuwe `intake-intake-estimate.ts` met PAL/BMR/TDEE; hier is de "estimate" gewoon de domeinscore die de engine al berekent, toegepast op verse antwoorden. Output is een **score 0–100**, expliciet zonder externe norm ernaast — het getal heeft alleen betekenis t.o.v. de vorige meting.

### Laag 3 — Zelf-evaluatie (delta + richting)
Het nulpunt is de dag-0-`intake_baseline_snapshots`-rij (al bevroren bij elke intake). Elke check-in → delta t.o.v. nulpunt én t.o.v. de vorige check-in, plus een **richting** (verbeterd / stabiel / verslechterd) met een drempel om ruis te dempen. Mechanisch identiek aan de 30-dagen-hermeting; het verschil is **cadans** (lichter, vaker) en **scope** (per zacht domein i.p.v. volledige herintake). De delta-as bestaat al in [`intake-baseline.ts`](../../src/lib/intake-baseline.ts).

### Laag 4 — Advies (leefstijl-eerst, cross-domein, K1–K3)
De richting voedt de bestaande prioriteitsvolgorde van `getAdvice`: leefstijl-quick-win eerst, supplement (indien überhaupt) daarna en alleen gegate. **Twee borgingen uit [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) horen hier thuis:**
- **Cross-domein-balansregel (§2):** elke verdieping levert minstens één leefstijl-quick-win uit een *ánder* domein → het advies kan structureel nooit een kale supplementlijst worden. Bij stress/herstel is dat extra natuurlijk: er ís geen stress-/herstel-`/beste/`-route, dus het advies is per definitie leefstijl.
- **K1–K3-interactie (§3):** juist energie en herstel zijn afgeleid. Een verslechterde *herstel*-richting bij lage beweging → **niet** "train meer / neem creatine", maar de slaap/stress-route (K1). Een energie-dip terwijl slaap én voeding gezond zijn → beweging/daglicht vóór elk supplement (K3). Dit is waar de lus het coach-onderscheid maakt in plaats van een symptoom af te vinken.

*"Welke leefstijl helpt"* = informatieve suggestie (content/KB); *"wat ik aanraad"* = uitsluitend de gegate affiliate-link, die bij stress/energie/herstel meestal niet bestaat — en dat is correct, geen gemis.

### Laag 5 — Cohort (anoniem, richting i.p.v. norm)
*"Mannen zoals jij (leeftijdsband, profiel) verbeterden hun stress-score gemiddeld ~X punten over 30 dagen; jij ~Y."* Uitsluitend uit de **k-geanonimiseerde** set (§D2, k ≥ drempel), nooit individuen blootleggend. Bij zachte pijlers vergelijk je **richting/verbetering**, niet absolute status — wat de inname-vs-status-grens vanzelf respecteert en het *"je bent niet de enige / het kan bewegen"*-effect geeft (de verbinding-as uit [`PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md`](PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md)).

---

## De enige nieuwe bouwsteen: `intake_domain_checkin`

De 30-dagen-hermeting maakt een **volledige** nieuwe `intake_sessions`-rij (`session_kind = remeasure`). Een lichte, frequentere per-domein check-in past daar niet in zonder de domeinscores met partiële data te vervuilen. Daarom een eigen, lichte tabel — de experiëntiële tweeling van [`intake_intake_log`](../../supabase/migrations/20260610140000_intake_intake_log.sql), gemodelleerd naar exact hetzelfde patroon:

```
intake_domain_checkin
  session_id        uuid          FK → intake_sessions, on delete cascade
  logged_at         timestamptz   ← de temporele as (pk-deel)
  organization_id   uuid          FK → organizations (default-tenant)
  domain_key        text          ← stress_score | energy_score | movement_score | recovery_score
  raw_inputs        jsonb         ← de ruwe check-in-antwoorden (bron van waarheid)
  score             jsonb         ← afgeleide re-score (delta-vriendelijk, apart van raw)
  rules_version     text          ← semver van de scoringsregels waarmee gere-scoord is
  pk (session_id, logged_at, domain_key)
  RLS aan, alleen service_role; verwijderd via cleanup_intake_session_linked_data() bij AVG-revoke/delete
```

**Waarom `raw_inputs` én `score` apart** (zelfde naad als bij voeding §F0): de scoringsregels evolueren (`rules_version` is al een kolom op `intake_sessions`, zie `20260609120000_intake_sessions_rules_version.sql`). Met de ruwe input bewaard kun je **oude check-ins herberekenen** als de regels wijzigen — zonder de capture te raken. Capture, score en advies blijven gescheiden verantwoordelijkheden.

**Waarom géén derde tabel later:** dit is het ene temporele substraat voor álle zachte pijlers (`domain_key` discrimineert), net zoals `intake_intake_log` het ene substraat is voor voeding. Trend, cohort en model pluggen hierop. **Geen tabel-per-domein.**

**Consent:** een terugkerende check-in is een uitbreiding van de verwerkingsdoeleinden t.o.v. de eenmalige intake → **eigen `consent_type` met `consent_version`** in `consent_records`, met `has_active_consent()` als gate. Geen check-in zonder actieve toestemming. (De stress-PDF-opt-in heeft al marketing-consent via `guide_opt_ins`; de meet-consent is een aparte, expliciete laag — niet impliceren uit de download.)

**Cleanup:** uitbreiden van `cleanup_intake_session_linked_data()` met een `intake_domain_checkin`-delete, exact zoals de F0-migratie dat voor `intake_intake_log` deed (regel 59–61 van die migratie).

---

## Stress als voorhoede — van eenmalige PDF naar dragende lus

Stress is 🟡 *redelijk* omdat het al doet wat de andere drie missen: **e-mail vangen** (`guide_opt_ins`) en een terugkeerkanaal openen (de gids-nurture, dag 0–30). De verbouwing is daarom klein en hoog-rendabel:

1. **De PDF wordt de entree, niet het einde.** De gids-opt-in-bevestiging biedt direct een nulpunt-check aan ("hoe staat je stress er nú voor?") of koppelt aan de reeds bevroren intake-baseline als die bestaat.
2. **De gids-nurture gaat meting dragen.** Eén van de 6 mails (bijv. dag 14 of 21) wordt een **lichte check-in-CTA** i.p.v. puur content — `cta_kind` bestaat al, dus dit is funnel-meetbaar zonder schemawerk.
3. **De richting voedt de volgende mail.** Verbeterd → bekrachtigen + verbinding-cohort; gestagneerd → andere leefstijl-hefboom (K-regel), nooit een opgedrongen supplement (stress heeft geen `/beste/`-route).

Resultaat: dezelfde opt-in, hetzelfde aantal mails, maar nu met een **nulpunt → delta → richting**-ruggengraat eronder. De 🟡 wordt een echte lus zonder nieuwe acquisitie.

---

## Energie & herstel — interactie-uitkomst, geen losse capture

[`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §1/§3 was hier expliciet: energie heeft geen eigen profielpagina (afgeleid signaal) en herstel is de dunste pijler (1 eigen vraag). Een *losse* energie- of herstel-check-in zou schijn-precisie zijn. Hun eerlijke meet- en advies-home is de **domein-interactielaag**:

- **Herstel-richting** wordt vooral verklaard door slaap+stress+beweging samen → K1 (onderherstel-zonder-training → slaap/stress-route, expliciet "niet méér trainen"). Een herstel-check-in is dus zinvol *als trigger om de interactie te herwaarderen*, niet als zelfstandig getal.
- **Energie-richting** wordt verklaard door slaap/stress/voeding → K3 (energie-dip-niet-door-slaap/voeding → beweging/daglicht vóór supplement). Dit corrigeert meteen de scheefheid uit ANALYSIS §2 (energie wordt nu te snel aan voeding/supplement gekoppeld).

**Gevolg voor de bouwvolgorde:** energie en herstel krijgen hun lus-waarde grotendeels *gratis* zodra K1–K3 in de engine staan (nul nieuwe data, ANALYSIS §3). De `intake_domain_checkin`-capture voor deze twee is optioneel/later; voor stress en beweging is hij primair.

Beweging zit ertussenin: half-kwantificeerbaar via PAL, en die PAL-afleiding **deelt input** met de voedings-meetlaag (§A1 van [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md)) — bouw die capture daarom in samenhang met de voedings-lus, niet dubbel.

---

## Gefaseerde implementatie-volgorde

| # | Stap | Waarom nu / later | Compliance-anker |
|---|---|---|---|
| **F0** | `intake_domain_checkin` + nieuw `consent_type`/`consent_version` + cleanup-haak | **Fundament. Retroactief niet-inhaalbaar** — niet-gelogde check-ins zijn weg. Lok de capture vóór de cadans perfect is. | Geversioneerde toestemming, los van gids-marketing-consent |
| **F1** | Re-score-koppeling (`calcDomainScores` op check-in) + delta/richting via [`intake-baseline.ts`](../../src/lib/intake-baseline.ts) + drempel tegen ruis | Nu. **Geen nieuwe engine** — hergebruik bestaande scoring + delta | Zacht: tegen eigen nulpunt, nooit norm/status |
| **F2** | Stress-voorhoede: gids-nurture draagt een check-in-CTA; PDF wordt entree | Nu, **hoogste ROI** — terugkeerkanaal bestaat al | `cta_kind` bestaat; meet-consent apart van marketing |
| **F3** | Advies-koppeling: cross-domein-balansregel (ANALYSIS §2) + K1–K3 (§3) in `getAdvice` | Nu. Trekt het advies wég van de supplement-default; energie/herstel krijgen hier hun waarde | Leefstijl-eerst; supplement alleen gegate |
| **F4** | Cohort-richting "mannen zoals jij verbeterden ~X" via k-anon | **Later, volume-gated (500+)** + anonimiseringspad §D2 | k ≥ drempel; richting, geen status; ruwe art. 9-tabel blijft binnen |
| **F5** | Model her-rangschikt richting→advies-triggers | **Later (2000+)** | Nooit claims/status; altijd gegate (§F) |

**Logica:** F0 legt het substraat → F1 maakt de lus eerlijk (delta tegen jezelf) → F2 verzilvert het bestaande stress-kanaal → F3 maakt het een coach (interactie i.p.v. symptoom) → F4/F5 maken het slim. Kritiek, retroactief-niet-inhaalbaar pad: **F0 eerst.** Let op de afhankelijkheid op de andere analyse: **F3 hangt aan het live zetten van K1–K3** (ANALYSIS §5 stap 1) — die kruisregels zijn de inhoud van het energie/herstel-advies.

### Events
| Event | Status | Doel |
|---|---|---|
| `remeasure.invited` / `remeasure.completed` | ✅ bestaand | Delta-koppeling; join op `session_id` met de bredere funnel |
| `measurement.checkin_completed` | ➕ nieuw (anoniem payload) | Lichte check-in voltooid — conversie van de zachte lus meten |
| `measurement.direction_detected` | ➕ nieuw (anoniem payload: domein + richting, géén score-getal/e-mail) | Welke domeinen welke kant op bewegen — fase-2-input (§F) |

Nieuwe events volgen het bestaande `DOMAIN_EVENT_TYPES`-patroon; payloads bevatten alleen gebande/anonieme signalen (domein + richting), conform §D van [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md).

---

## De "per domein / cadans"-vraag, scherp

Technisch ondersteunt `intake_domain_checkin` (met `logged_at`) **elke cadans** — wekelijks, per 2 weken, gekoppeld aan de 30-dagen-hermeting. Elke check-in = een meting; de delta t.o.v. nulpunt = hermeting; de richting = zelf-evaluatie; het gematchte advies = advies.

**De rem is menselijk, niet technisch.** Frequent loggen is hoge frictie voor mannen 40+ en botst met de propositie ("laagdrempelig"). Daarom, identiek aan de voedings-lus-keuze:
- **Default: laagdrempelig periodiek** — nulpunt + een lichte check-in gekoppeld aan de bestaande gids-/intake-nurture-momenten (dag 14/21/30), niet als losse verplichting.
- **Vaker: opt-in** voor de gemotiveerde gebruiker. Het fundament (`intake_domain_checkin` met `logged_at`) steunt beide zonder wijziging.

---

## Compliance — de zachte grens is inherent veiliger

**Beleving, tegen jezelf — nooit status.** *"Je stress-score bewoog van ~62 naar ~74 (de goede kant op)"* ✓ — *"je hebt een verhoogd cortisolniveau"* ✗. Dit is structureel veiliger dan de voedings-lus: er is **geen externe norm** waartegen je zou kunnen afglijden naar een statusclaim. De check-in is leefstijl-zelfrapportage, net zo niet-medisch als de 15-vragen-intake. Bij stress/energie/herstel is er bovendien geen `/beste/`-route, dus het advies is per definitie leefstijl — de affiliate-monetisatie speelt hier nauwelijks, en dat hoort zo.

**Wearables/HRV/rusthartslag — OPEN STRATEGISCH BESLISPUNT, geen aanbeveling.** Smartwatch-data zou juist deze zachte pijlers objectiveerbaar maken, maar staat als open beslispunt voor Dennis in [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §4 (art. 9-zware databron, externe afhankelijkheid, "HRV voelt klinisch"-grensrisico). **Dit plan gaat er bewust níét van uit** en blijft volledig op zelfrapportage. Beslis dat niet via deze lus.

---

## Wat bewust NIET nu

- **Geen wearable/HRV/rusthartslag.** Open beslispunt (ANALYSIS §4); de lus draait puur op zelfrapportage tegen eigen nulpunt.
- **Geen externe norm op zachte pijlers.** Geen "gezonde stress-waarde", geen klinische duiding — alleen delta tegen jezelf.
- **Geen losse energie-/herstel-capture vooraan.** Die twee zijn afgeleid; hun waarde komt uit K1–K3-interactie (ANALYSIS §3), niet uit een schijn-precies eigen getal.
- **Geen frequent loggen als default.** Periodiek; vaker alleen opt-in.
- **Geen nieuwe scoring-engine.** Re-score via de bestaande `calcDomainScores`; geen tweede waarheid naast de intake-domeinscores.
- **Geen cohort-surfacing vóór k-anon + volume (500+).** Tot dan blijft de lus puur individueel + regelgebaseerd.
- **Geen ML op de check-ins vóór 2000+ én doorlopen anonimiseringspad.** Gepseudonimiseerde logs gaan geen model in.
- **Geen tweede capture-bron naast `intake_domain_checkin`.** Eén temporeel substraat voor alle zachte pijlers; `domain_key` discrimineert.
- **Geen wijziging aan de basis-15-vragen-intake, domeinscores of bestaande triggers.** De lus is strikt additief.
- **Geen impliciete meet-consent uit de PDF-download.** Marketing-consent (`guide_opt_ins`) ≠ meet-consent; die laatste is een aparte, expliciete laag.

---

## Kruisverwijzingen

| Document | Relevantie voor dit plan |
|---|---|
| [`PLAN_NUTRITION_SELFEVAL_LOOP.md`](PLAN_NUTRITION_SELFEVAL_LOOP.md) | De harde-pijler-tegenhanger (inname vs norm); `intake_intake_log` als model voor `intake_domain_checkin`; zelfde vijf-lagen-anatomie |
| [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) | Bron van de hard/zacht-tweedeling (§1), de cross-domein-balansregel (§2), K1–K3-interactie en de prioriteitsvolgorde (§3/§5), wearable-beslispunt (§4) |
| [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) | Anonimiseringspad (§D), volume-fases (§F), beweging/PAL deelt input met de voedingslaag (§A1) |
| [`PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md`](PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md) | Meet→test→verbeter-loop, funnel-events op `session_id`, verbinding-as voor de cohort-laag |
| [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) | Tier 2 = self-report verdieping; check-in is `measurement`-kind; tier 4-5 referral-only |
| [`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md) | Gids-opt-in (`/gids/stress`), `guide_opt_ins`, de 6-mail-nurture die de stress-check-in gaat dragen |
| [`COMPLIANCE.md`](../core/COMPLIANCE.md) | Inname/beleving vs status; waarom delta-tegen-jezelf inherent veiliger is dan norm-vergelijking |
| [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) | `intake_baseline_snapshots`, `session_kind`, `consent_records`, `domain_events`/`cta_kind`, `cleanup_intake_session_linked_data()` |
| [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md) | 15-vragen-intake, 6 domeinscores, regelgebaseerd tot 500+; bron van de per-domein check-in-vragen |

---

*Opgesteld: 10 juni 2026. Planning-document — geen code, geen schema-migraties. Experiëntiële tegenhanger van [`PLAN_NUTRITION_SELFEVAL_LOOP.md`](PLAN_NUTRITION_SELFEVAL_LOOP.md): zachte pijlers meten tegen het eigen nulpunt, niet tegen een richtlijn.*
