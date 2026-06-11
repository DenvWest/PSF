# PLAN — Voeding zelf-evaluatie-lus (meten → hermeten → advies)

> **Layer 3 — Plan.** Ontwerp voor de **terugkerende voedings-zelfrapportage-lus**: een 24h-zelfrapport dat via een inname-inschatting en delta-over-tijd tot niet-medisch advies leidt, met geanonimiseerde cohort-vergelijking als volume-gated uitbreiding. Dit is de **temporele laag** bovenop de reeds ontworpen tier-2 inname-meetlaag — geen herbouw daarvan. **Alleen planning — geen code, geen schema-migraties.** Pseudostructuur ter illustratie.
>
> Kruisverwijzingen: [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) · [`PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md`](PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md) · [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) · [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) · [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) · [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md)

---

## Samenvatting

`PLAN_MEASUREMENT_PERSONALIZATION.md` ontwierp al de **tier-2 inname-meetlaag** (PAL/BMR/TDEE, macro/micro-inschatting, de aparte `intake-intake-estimate.ts`, de inname-vs-status-grens, de `approved-claims`-gate, het anonimiseringspad). Dat is een **one-shot verdieping**. Dit plan voegt de ontbrekende dimensie toe: **tijd**. Een gebruiker rapporteert periodiek (niet per se dagelijks) wat hij at; het eerste rapport is zijn **nulpunt**, elk volgend rapport levert een **delta** ("je eiwit-inname ging van ~X naar ~Y"), en daaruit volgt **niet-medisch advies** — leefstijl eerst, dan supplement. Dit is exact de hermeting-loop die al bestaat voor de 6 domeinscores ([`intake_baseline_snapshots`](../core/ENTITY_MODEL.md) + `remeasure.completed`), nu gericht op een voedings-zelfrapport.

Het belichaamt het merkprincipe uit [`src/data/about.ts`](../../src/data/about.ts) — *"Eerst de basis, dan de pil — in die volgorde, altijd"* — als data: elke gap leidt eerst naar een leefstijlactie, pas daarna naar een gegate supplement-vergelijking.

**Eén nieuwe bouwsteen** (`intake_intake_log`), de rest hergebruikt bestaande patronen. Output blijft altijd een **inname-inschatting**, nooit een statusclaim. Cohort-vergelijking en model lichten vanzelf op bij volume; de basis-lus staat al daarvoor.

---

## Implementatie-status (juni 2026)

De eerste verticale snede staat: **van tap tot gegate affiliate-advies, met terugkerende delta.** Geverifieerd — `tsc` schoon, build slaagt, voedings-modules groen (78 unit-tests).

| Stap | Wat is gebouwd | Status |
|---|---|---|
| **F0** | `intake_intake_log`-tabel + `nutrition_intake_logging`-consent + AVG-cleanup-haak | ✅ gecommit |
| **F1** | `nutrition-intake-estimate.ts` + `nutrition-intake-statements.ts` + `src/data/nutrition/intake-reference.ts` (deterministische inschatting, inname-vs-status als systeem-eigenschap) | ✅ `70ca6a4` |
| **F2** | `nutrition-advice.ts` — gap → leefstijl-eerst → EFSA-gated supplement (hergebruikt `approved-claims` + `isComparisonAllowed`) | ✅ `78cc804` |
| **C0** | Capture-flow UI `NutritionCapture` + schrijf-route `/api/intake/nutrition-log` + `/intake/voeding` | ✅ `29ec061` |
| **C1** | Contextuele tier-2-CTA op de resultatenpagina (alleen bij voeding-aandacht) + `intake.cta_to_nutrition_log`-event | ✅ `94a297f` |
| **F3** | Delta bij her-log `nutrition-delta.ts` + `measurement.gap_detected` (anoniem) + delta in de UI | ✅ `5b07ef7` |
| **F4** | Cohort-vergelijking "mannen zoals jij" via k-anon | ⬜ later — volume-gated (500+) |
| **F5** | Model her-rangschikt advies-triggers | ⬜ later (2000+) |

**De keten loopt end-to-end:** resultaten → (voeding aandacht?) CTA → 1-minuut-zelfrapport → `intake_intake_log` → inname-zin (F1) → leefstijl-eerst-dan-gegate-supplement (F2) → bij her-log "je inname bewoog" (F3). Twee funnel-events: `intake.cta_to_nutrition_log` (instap) en `measurement.gap_detected` (gap).

**Borging:** geen log zonder geversioneerde consent; sessie alleen uit de getekende cookie; estimate server-side berekend; alle inname- én delta-zinnen door de verboden-woorden-filter (inname, niet status); supplement-suggesties alleen via de bestaande EFSA-poort (melatonine/ashwagandha per constructie uitgesloten).

### Logische vervolgstappen (geen herbouw — alles op het bestaande substraat)

1. **Eerst activeren & meten, niet bouwen.** Laat de flow live draaien en lees de twee events: instap-ratio (`intake.cta_to_nutrition_log`) en gap-frequentie (`measurement.gap_detected`). Pas bij signaal verder bouwen.
2. **Re-log uitnodigen.** Een nurture-dag of resultaten-nudge die ~2 weken na de eerste log uitnodigt opnieuw te loggen — vult F3's delta-volume. Hergebruikt de bestaande nurture-cron + recovery-token; geen nieuw mechanisme.
3. **Baseline-vs-nu naast vorige-vs-nu.** F3 vergelijkt met de vorige log; voeg "sinds je startpunt" toe — kleine uitbreiding op `nutrition-delta.ts`, het `intake_intake_log`-substraat draagt het al.
4. **Zachte-pijler-lus.** [`PLAN_SOFTPILLAR_SELFEVAL_LOOP.md`](PLAN_SOFTPILLAR_SELFEVAL_LOOP.md) beschrijft de tegenhanger (stress/energie/beweging/herstel — delta *tegen jezelf* i.p.v. tegen een richtlijn). Zelfde substraat- en delta-patroon; dicht meteen de zwakke funnel-eindpunten van die pijlers.
5. **Betaalde diepte (horizon).** BMR/TDEE/macro-laag of cohort als premium, via de bestaande `is_paid`/`tier`-flag — config, geen herbouw.

**Aanbeveling:** stap 1 + 2. Je hebt nu een complete, ongeteste-in-het-wild keten; de hoogste waarde is **volume door de lus krijgen** (re-log-uitnodiging) en **kijken of mensen instappen en gaps dichten** — niet nóg een laag bouwen vóór er data stroomt.

---

## Wat al staat (niet herbouwen)

| Bouwsteen | Status | Bron |
|---|---|---|
| Tier-2 inname-engine (PAL/BMR/TDEE/macro/micro) | 📐 ontworpen | `PLAN_MEASUREMENT_PERSONALIZATION.md` §A → `intake-intake-estimate.ts` |
| Inname-gap → leefstijl-eerst-dan-supplement-matching | 📐 ontworpen | idem §B1 (`getAdvice`-patroon) |
| Supplement-gate (`approved-claims` + `isComparisonAllowed`) | ✅ live | [`src/data/approved-claims.ts`](../../src/data/approved-claims.ts), `intake-engine.ts` |
| Inname-vs-status template-grens + forbidden phrases | 📐 ontworpen | idem §B3 |
| Nulpunt-bevriezing voor delta | ✅ live | `intake_baseline_snapshots` ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md)) |
| Hermeting-loop + delta | ✅ live | `remeasure.completed`, `plan.checkin_completed` in `domain_events` |
| Consent-versionering per nieuw verwerkingsdoel | ✅ live | `consent_records` + `CONSENT_VERSION` ([`intake-consent.ts`](../../src/lib/intake-consent.ts)) |
| Anonimiseringspad (pseudonym → k-anon vóór aggregatie) | 📐 ontworpen | `PLAN_MEASUREMENT_PERSONALIZATION.md` §D2 |
| Volume-fases (regelgebaseerd <500, stats 500+, model 2000+) | 📐 ontworpen | idem §F |
| AVG-opruiming van sessie-gekoppelde data | ✅ live | `cleanup_intake_session_linked_data()` |

De lus hieronder voegt **alleen de temporele as + één capture-tabel** toe.

---

## De vijf lagen

| Laag | Wat het is | Hergebruikt / nieuw |
|---|---|---|
| **1. Capture** | 24h-zelfrapport: per eetmoment frequentie/portie-checkboxes, **alleen** voor nutriënten mét interventiepad (eiwit, omega-3/vette vis, magnesium-bronnen, vit D/zon, zink) | **NIEUW:** `intake_intake_log` |
| **2. Estimate** | Inname-inschatting per nutriënt vs referentieband (Gezondheidsraad ADH / EFSA DRV) | `intake-intake-estimate.ts` (§A) + referentiewaarden uit productkennis (§C1) |
| **3. Zelf-evaluatie** | Delta over tijd: eerste log = nulpunt, elk volgend = "je inname bewoog van ~X naar ~Y" | Patroon van `intake_baseline_snapshots` + remeasure-delta |
| **4. Advies** | Leefstijl-eerst ("eet vaker X") → dan supplement (`/beste/*`), EFSA-gated | `getAdvice`-patroon (§B1) + `approved-claims`-gate (§B2) |
| **5. Cohort** | "Mannen zoals jij eten gemiddeld ~X; jij zit op ~Y" | k-anon-pad (§D2), volume-gated (§F) |

### Laag 1 — Capture (24h-zelfrapport)
Een **grof, snel** instrument: een checklist "hoe zag gisteren eruit" per eetmoment, geen grammen-dagboek. Schijnprecisie is de vijand (zie §A1: te zwaar voor een korte flow). Beperk de uitvraag tot nutriënten waarvoor een interventiepad bestaat — een geschat magnesiumgat is alleen zinvol als er `/beste/magnesium` achter zit (§A4).

### Laag 2 — Estimate (inname-inschatting)
Het ruwe rapport gaat door `intake-intake-estimate.ts` → geschatte inname per nutriënt, afgezet tegen de referentieband. Output strikt: *"je krijgt waarschijnlijk minder dan ~X binnen"*, **nooit** *"je hebt een tekort"*. De centrale formuleringslaag (§B3) borgt dit per template, niet per zin.

### Laag 3 — Zelf-evaluatie (delta)
Het eerste log = nulpunt (zelfde rol als `intake_baseline_snapshots`). Elk volgend log → delta t.o.v. nulpunt én t.o.v. de vorige meting. Dit is mechanisch identiek aan de bestaande hermeting-loop; alleen het gemeten object verschilt (voedings-inname i.p.v. domeinscore).

### Laag 4 — Advies (leefstijl → supplement)
De inname-gap voedt dezelfde prioriteitsvolgorde die `getAdvice` al kent: leefstijl-quick-win eerst (lage `priority`), supplement-suggestie daarna (hoge `priority`), en alleen als de `approved-claims`-gate + `isComparisonAllowed` slagen — anders géén dode CTA. *"Welke voeding kun je gebruiken"* = informatieve voedingssuggestie (productkennis-KB); *"wat ik aanraad"* = de gegate affiliate-link. **Dit is waar de affiliate-monetisatie niet-medisch inplugt.**

### Laag 5 — Cohort (anoniem)
*"Mannen zoals jij (leeftijdsband, profiel) zitten gemiddeld op ~X; jij op ~Y."* Uitsluitend uit de **k-geanonimiseerde** set (§D2, k ≥ drempel bv. 20), nooit individuen blootleggend. Dit geeft het *"je bent niet de enige"*-effect (de verbinding-as uit `PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md`) **zonder** community-plumbing of identiteitskoppeling.

---

## De enige nieuwe bouwsteen: `intake_intake_log`

De bestaande `answers`-jsonb is **one-shot** (één intake-rij). Een terugkerende lus vraagt eigen rijen met een tijd-as. Ontworpen naar het model van [`plan_progress`](../core/ENTITY_MODEL.md):

```
intake_intake_log
  session_id        uuid          FK → intake_sessions, on delete cascade
  logged_at         timestamptz   ← de temporele as (pk-deel)
  organization_id   uuid          FK → organizations (default-tenant)
  raw_inputs        jsonb         ← het ruwe checklist-antwoord (bron van waarheid)
  estimate          jsonb         ← afgeleide inname-inschatting (apart van raw)
  estimate_version  text          ← semver van intake-intake-estimate.ts
  pk (session_id, logged_at)
  RLS aan; verwijderd via cleanup_intake_session_linked_data() bij AVG-revoke/delete
```

**Waarom `raw_inputs` én `estimate` apart:**
- De estimate-engine wordt later slimmer (meer voedingsmiddelen, betere porties). Met de ruwe input bewaard kun je **oude logs herberekenen** (`estimate_version` markeert met welke engine) — zonder de capture te raken.
- Dit is de **"doorontwikkelbaar zonder herbouw"-naad**: capture, inschatting en advies zijn gescheiden verantwoordelijkheden, precies zoals domeinscoring en inname-schatting gescheiden zijn (§A5).

**Consent:** voedingsdetail = uitbreiding van de verwerkingsdoeleinden → een **eigen `consent_type` met `consent_version`** in `consent_records`, met `has_active_consent()` als gate (§D1). Geen log zonder actieve toestemming.

---

## Gefaseerde implementatie-volgorde

| # | Stap | Waarom nu / later | Compliance-anker |
|---|---|---|---|
| **F0** | `intake_intake_log` + nieuw `consent_type`/`consent_version` | **Fundament. Retroactief niet-inhaalbaar** — niet-gelogde periodes zijn weg. Lock de capture vóór de engine perfect is. | Geversioneerde toestemming (§D1) |
| **F1** | `intake-intake-estimate.ts` (deterministisch) + centrale inname-vs-status-formuleringslaag + unit-tests | Nu. Niet-medisch wordt een **systeem-eigenschap**, geen reviewtaak per zin | "geschatte inname onder richtlijn" ✓ / "tekort" ✗ (§B3) |
| **F2** | Advies-koppeling: leefstijl → supplement, EFSA-gated | Nu. **Affiliate-monetisatie plugt hier in**, niet-medisch | `approved-claims` + `isComparisonAllowed` (§B2) |
| **F3** | Temporele lus: nulpunt + her-log → delta; emit `measurement.gap_detected` (anoniem payload) | Nu, **licht/periodiek** | Zelf-rapportage, geen status |
| **F4** | Cohort-vergelijking "mannen zoals jij" via k-anon | **Later, volume-gated (500+)** + anonimiseringspad §D2 | k ≥ drempel; ruwe art. 9-tabel verlaat de grens niet |
| **F5** | Model her-rangschikt advies-triggers | **Later (2000+)** | Nooit claims/status; altijd gegate (§F) |

**Logica:** F0 legt het substraat → F1 maakt het niet-medisch betrouwbaar → F2 maakt het rendabel → F3 maakt het een lus → F4/F5 maken het slim. Kritiek, retroactief-niet-inhaalbaar pad: **F0 eerst.**

### Events
| Event | Status | Doel |
|---|---|---|
| `measurement.gap_detected` | ➕ nieuw (anoniem payload) | Welke inname-gaps voorkomen — fase-2-input (§F) |
| `remeasure.completed` / `plan.checkin_completed` | ✅ bestaand | Delta-koppeling; join op `session_id` met de bredere funnel |

---

## De "per dag"-vraag, scherp

Technisch ondersteunt **F3 elke cadans** — dagelijks, wekelijks, per 30 dagen. Elke log = een meting; de delta t.o.v. het nulpunt = hermeting; de gap-analyse = zelf-evaluatie; het gematchte advies = advies.

**De rem is menselijk, niet technisch.** Dagelijks loggen is hoge frictie voor mannen 40+ en past niet bij de propositie ("3 minuten, laagdrempelig"). Daarom:
- **Default: laagdrempelig periodiek** (nulpunt + een lichte her-check elke ~1-2 weken, of gekoppeld aan de bestaande 30-dagen-hermeting).
- **Dagelijks: opt-in** voor de fanatiekeling. Het fundament (`intake_intake_log` met `logged_at`) steunt beide zonder wijziging.

---

## Compliance — de harde grens (ruggengraat)

**Inname, niet status.** *"Je eiwit-inname lijkt laag t.o.v. een richtlijn"* ✓ — *"je hebt een tekort"* ✗. Geen biomarkers, geen diagnose, geen klinische duiding. Het 24h-log is leefstijl-zelfrapportage, net zo niet-medisch als de 15-vragen-intake. Referentiewaarden horen in **productkennis** (publieke norm, geen persoonsgegeven), niet hardcoded in de engine. Voedingsadvies = informatief; supplement-advies = uitsluitend achter de `approved-claims`-poort (melatonine `forbidden`, ashwagandha `on_hold` → automatisch uitgesloten).

---

## Wat bewust NIET nu

- **Geen grammen-dagboek / calorie-tracker.** Grof checklist-rapport; schijnprecisie weren (§A1).
- **Geen dagelijks-loggen als default.** Periodiek; dagelijks alleen opt-in.
- **Geen cohort-surfacing vóór k-anon + volume (500+).** Tot dan blijft de lus puur individueel + regelgebaseerd.
- **Geen ML op de logs vóór 2000+ én doorlopen anonimiseringspad.** Gepseudonimiseerde logs gaan geen model in.
- **Geen statusclaim/tekortdiagnose, geen bloed-/diagnostiek-tier.** Klinische meting blijft referral-only ([`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md)).
- **Geen wijziging aan de basis-15-vragen-intake, domeinscores of bestaande triggers.** De lus is strikt additief.
- **Geen tweede capture-bron naast `intake_intake_log`.** Eén temporeel substraat waar trend, cohort én model op pluggen.

---

## Kruisverwijzingen

| Document | Relevantie voor dit plan |
|---|---|
| [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) | De tier-2 inname-engine (§A), advies-matching (§B), productkennis-KB (§C), anonimiseringspad (§D), volume-fases (§F) waarop deze lus voortbouwt |
| [`PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md`](PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md) | Meet→test→verbeter-loop, funnel-events op `session_id`, verbinding-as |
| [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) | Tier 2 = self-report inname-verdieping; tier 4-5 referral-only; `is_paid`/`tier`-poort |
| [`COMPLIANCE.md`](../core/COMPLIANCE.md) | Inname vs status; EFSA-claims uitsluitend via `approved-claims.ts`; forbidden phrases |
| [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) | `intake_baseline_snapshots`, `plan_progress`, `consent_records`, `domain_events`, `cleanup_intake_session_linked_data()` |
| [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) | Twee gescheiden datastromen; waardentrap = diepere personalisatie, geen diagnostiek-tier |
| [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md) | 15-vragen-intake, 6 domeinscores, regelgebaseerd tot 500+ |

---

*Opgesteld: 10 juni 2026. Planning-document — geen code, geen schema-migraties. Temporele uitbreiding op [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md).*
