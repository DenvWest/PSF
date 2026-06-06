# PLAN — Meet- & Personalisatielaag

> **Layer 3 — Plan.** Gefaseerd ontwerp voor de meetlaag (tier 2 self-report inname-verdieping), de waarden→advies-matching, de productkennis-knowledge-base, het anonimiseringspad en de LLM-roadmap. **Alleen planning — geen code, geen schema-migraties.** Pseudostructuur ter illustratie.
>
> Kruisverwijzingen: [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) · [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) · [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md) · [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) · [`PERSONALIZATION_ENGINE.md`](../core/PERSONALIZATION_ENGINE.md)

---

## Samenvatting

De huidige intake meet 6 domeinen (0–100) regelgebaseerd in [`src/lib/intake-engine.ts`](../../src/lib/intake-engine.ts) en koppelt advies aan vergelijkingspagina's via [`src/data/approved-claims.ts`](../../src/data/approved-claims.ts). Dit plan voegt daar een **inname-meetlaag** aan toe die binnen de rol *leefstijlcoach* blijft: zelf-gerapporteerde schattingen van activiteit (PAL), metabolisme (BMR/TDEE) en macro/micro-inname, afgezet tegen referentiewaarden. Output is altijd een **inname-inschatting** ("je krijgt waarschijnlijk te weinig X binnen"), **nooit** een statusclaim of tekortdiagnose.

Vier ontwerpkeuzes dragen het plan:

1. **De meetlaag is tier 2 van het bestaande 5-tier stepped-care-model** — geen nieuwe tier-nummering, geen bloed-/diagnostiek-tier. Klinische meting blijft referral-only.
2. **Twee strikt gescheiden datastromen** (conform [`ARCHITECTURE.md`](../core/ARCHITECTURE.md)): productkennis (geen persoonsgegeven, vrij structureerbaar + vroeg RAG-voedbaar) en intake-antwoorden (AVG art. 9, eerst écht anonimiseren vóór elke aggregatie/training).
3. **De engine blijft regelgebaseerd en deterministisch** (fase 1). Inname-gaps → eerst leefstijl-quick-wins, dan supplement-suggesties, elk gegate door `approved-claims.ts` + een bestaande vergelijkingspagina.
4. **Groei-eerst**: rijkere personalisatie wordt in het begin gratis aangeboden om de leading indicators (intakes + e-mail-signups) te halen; de waarde-poort komt later, zonder schemawijziging (de `is_paid`/`tier`-velden bestaan al).

De productkennis-RAG-laag is een **aparte, vroegere track** dan de persoonsdata-LLM, juist omdat zij geen persoonsgegevens bevat.

---

## A. Meetlaag — tier 2 self-report inname-verdieping

> **Scope-anker:** rol = leefstijlcoach. Alle inputs zijn zelf-gerapporteerd, geen lichaamsmateriaal, geen klinische waarde. Dit valt onder `interventions.kind = 'measurement'`, tier 2 (`is_paid = false` nu) — zie [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) → "Scope per tier — inname vs status". Generaliseert naar coaches zonder BIG (white-label via `organization_id`). BIG/KNGF/fysiotherapie komt nergens voor.

### A1. Activiteitsniveau → PAL

**Aanbeveling:** een **IPAQ-short-geïnspireerde** zelfrapportage (3–4 vragen: zittend werk vs staand/fysiek werk, dagen/week matige beweging, dagen/week intensieve beweging) die mapt op een **PAL-multiplier** (Physical Activity Level, 1.4–2.0).

**Onderbouwing:** de intake heeft al bewegingsvragen (`MOV_STR`, `MOV_CARD`) op een 1–4 schaal. Een volledige IPAQ-MET-berekening is te zwaar voor een 3–4 minuten-intake en levert schijnprecisie. PAL-banden zijn de gevestigde brug van activiteit naar energiebehoefte (FAO/WHO/UNU) en sluiten aan op de bestaande schaal-logica van de engine (`getMovementLoad` neemt al `max(MOV_CARD, MOV_STR)`). We breiden dit uit met één expliciete werk-/dagactiviteitsvraag, want training ≠ dagelijkse activiteit.

PAL-band (indicatief, niet definitief — copy-bron volgt):

| Zelfrapportage | PAL |
|---|---|
| Zittend werk, weinig beweging | ~1.4 |
| Licht actief (staand werk óf 1–2× sport) | ~1.6 |
| Actief (fysiek werk óf 3–4× sport) | ~1.8 |
| Zeer actief (zwaar fysiek werk + sport) | ~2.0 |

PAL wordt afgeleid uit de antwoorden, niet los gevraagd, zodat de intake niet langer wordt.

### A2. Metabolisme → BMR & TDEE

**Aanbeveling — BMR via Mifflin-St Jeor**, niet Harris-Benedict.

**Onderbouwing:** Mifflin-St Jeor is in validatiestudies (o.a. ADA) accurater voor de moderne populatie en is de de-facto standaard in leefstijl-/voedingstools. Harris-Benedict (1919, revisie 1984) overschat systematisch bij de huidige lichaamssamenstelling. Beide vragen dezelfde inputs, dus er is geen dataproportionaliteits-argument vóór Harris-Benedict.

```
BMR (man)  = 10·gewicht(kg) + 6.25·lengte(cm) − 5·leeftijd + 5
TDEE       = BMR × PAL
```

**Inputs en AVG-proportionaliteit:** lengte, gewicht, leeftijd, geslacht. Leeftijd is er al als `age_range` ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md), `intake_sessions.age_range`). Voor Mifflin gebruiken we het **midden van de bestaande leeftijdsband** (bv. `45-49` → 47) — zo komt er **geen exacte geboortedatum** bij, wat dataminimalisatie respecteert. Lengte/gewicht zijn nieuw en bijzonder gevoelig in combinatie met gezondheidsdata; ze worden:

- alleen gevraagd **als de gebruiker de inname-verdieping (tier 2) start** — niet in de basis-15-vragen-intake;
- opgeslagen als **inname-input**, niet als afgeleide "gezondheidsstatus";
- meegenomen in dezelfde art. 9-stroom en consent-versionering als de overige antwoorden (zie D).

Doelgroep is man 40+; de vrouw-formule en een non-binair pad documenteren we als open punt voor white-label, maar implementeren we niet nu.

### A3. Macro-inschatting

**Aanbeveling:** TDEE + één doelvraag (afvallen / onderhoud / spierbehoud-opbouw) → een **macroverdeling als inname-richtlijn**, met eiwit eerst (g/kg lichaamsgewicht), daarna vet (minimumdrempel), rest koolhydraten.

**Onderbouwing:** voor 40+ mannen is eiwit de hefboom (sarcopenie-preventie, verzadiging). Een g/kg-benadering (bv. 1.2–1.6 g/kg afhankelijk van doel en trainingsbelasting) is begrijpelijker en robuuster dan een procentuele split en sluit aan op het bestaande `protein_gap_signal` en de `NUT_PROT`-vraag in de engine. De uitkomst is expliciet een **richtlijn voor inname** ("streef naar ~X g eiwit per dag"), geen normatieve diagnose. Dit blijft volledig leefstijladvies.

### A4. Micronutriënt-inschatting

**Aanbeveling:** vertaal de bestaande + enkele extra voedingsvragen (frequentie vette vis, zuivel, vlees/peulvruchten, groente/fruit, zon-expositie) naar een **grove geschatte inname per nutriënt** (start: omega-3 EPA/DHA, magnesium, vitamine D, zink, eiwit — exact de stoffen waarvoor een goedgekeurde claim én vergelijkingspagina bestaat in `approved-claims.ts`). Zet die schatting af tegen de **referentiewaarde** (Gezondheidsraad ADH / EFSA DRV / RI).

**Onderbouwing:** beperk je tot de nutriënten waarvoor een interventiepad bestaat — een geschat magnesiumgat is alleen zinvol als er een `/beste/magnesium` achter zit. De engine kent `NUT_O3`, `NUT_PROT`, `LIF_SUN` al; we voegen een paar frequentievragen toe binnen tier 2. Output-vorm is strikt:

> "Op basis van je voeding krijg je waarschijnlijk minder dan de aanbevolen hoeveelheid magnesium binnen."

Nooit: "je hebt een magnesiumtekort." Het verschil tussen **geschatte inname onder RI** (mag) en **gemeten status** (mag niet) is de harde grens uit [`COMPLIANCE.md`](../core/COMPLIANCE.md) → "Inname vs status". De referentiewaarden zelf horen in een nieuw getypeerd datafile (zie B/C), niet hardcoded in de engine.

### A5. Aansluiting op de bestaande 15-vragen-intake

**Aanbeveling — additief, niet vervangend.** De 15-vragen-intake ([`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md)) en de 6 domeinscores blijven exact zoals ze zijn. De meetlaag is een **optionele verdiepingsstap ná de basis-intake**, gemodelleerd als tier-2 `measurement`-interventie. Concreet:

- `answers: Record<string, number>` (de engine-contract) blijft de bron; nieuwe tier-2-velden (lengte, gewicht, doel, extra frequentievragen) komen als **aparte sleutels** in dezelfde `answers`-jsonb, zodat `calcDomainScores` en bestaande triggers ongewijzigd blijven.
- De inname-berekeningen (PAL, BMR/TDEE, macro, micro) komen in een **nieuwe `src/lib/intake-intake-estimate.ts`** (of vergelijkbaar) náást `intake-engine.ts`, niet erin — de domeinscoring en de inname-schatting zijn gescheiden verantwoordelijkheden.
- Geen enkele bestaande vraag-id of domein-max wordt aangeraakt → geen regressie op profiellabels, urgentie of nurture-snapshots.

---

## B. Waarden → advies-matching (de engine)

### B1. Inname-gaps → leefstijl eerst, dan supplement (deterministisch, fase 1)

**Aanbeveling:** breid het bestaande regelgebaseerde patroon van `getAdvice()` uit met inname-gap-regels, met **dezelfde prioriteitsvolgorde die er al is**: quick wins (leefstijl) krijgen lagere `priority`-nummers (komen eerst), supplement-suggesties hoger. `getAdvice` doet dit al: bij een eiwitgat eerst "begin elke maaltijd eiwitrijk", pas daarna een vergelijkingslink. Een geschat micronutriënt-gat volgt hetzelfde stramien:

```
gap(nutrient) onder RI
  → tier 1 quick win: voedingsbron eerst   (leefstijl, gratis)
  → tier 3 supplement: alleen als de quick win structureel niet volstaat
```

Dit hergebruikt de bestaande `RankedItem<T>`/`uniqueTop*`-machinerie; er komt geen tweede, concurrerend adviespad bij.

### B2. Gating per supplement-suggestie

**Aanbeveling:** elke supplement-suggestie passeert twee bestaande poorten:

1. **`approved-claims.ts`** — alleen ingrediënten met `status: 'approved'` en een niet-null `comparisonPath` mogen als interventie verschijnen. Melatonine (`forbidden`) en ashwagandha (`on_hold`) zijn hierdoor automatisch uitgesloten van de inname→supplement-route.
2. **Bestaande vergelijkingspagina** — `supplementAdviceAllowed()` in [`intake-engine.ts`](../../src/lib/intake-engine.ts) checkt al `isComparisonAllowed(slug)` voor elke `/beste/*`-link. De nieuwe inname-regels gebruiken **dezelfde helper**, zodat een gat zonder beschikbaar product geen dode CTA produceert.

Geen supplement-suggestie zonder (claim ✔ én comparison-path ✔). Dit is precies de PLAN-trap-eis uit [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) (tier 3 vereist `affiliate_url`/`comparison_path` + `published` evidence-claim).

### B3. Output-copy binnen de inname-vs-status-grens (template-niveau)

**Aanbeveling:** borg de grens **structureel in templates**, niet per geval. Eén centrale formuleringslaag genereert inname-zinnen volgens een vast patroon:

```
"Op basis van je {bron} krijg je waarschijnlijk {minder dan / rond} de
 aanbevolen hoeveelheid {nutrient} binnen."
```

- Verboden statuswoorden ("tekort", "deficiëntie", "je hebt te weinig X in je bloed", "je waarden") worden centraal geweerd — uitbreidbaar op de bestaande `FORBIDDEN_PHRASES_GLOBAL`-aanpak in `approved-claims.ts`.
- EFSA-bewoording komt **uitsluitend** uit `getUsableClaims(key)`, letterlijk, nooit herschreven (regel uit [`COMPLIANCE.md`](../core/COMPLIANCE.md)).
- Eén unit-test-set per template borgt dat geen enkele inname-output een statusclaim kan vormen, ongeacht de invoerwaarden. Compliance wordt zo een eigenschap van het systeem, geen reviewtaak per zin.

---

## C. Productkennis-knowledge-base (LLM-voedbaar, niet-persoonlijk)

### C1. Genormaliseerd schema

**Aanbeveling:** consolideer productkennis tot een genormaliseerd model. Er bestaat al een ongebruikte Supabase-basis in [`db/migrations/001_supplement_product_database.sql`](../../db/migrations/001_supplement_product_database.sql) (`products`, `ingredienten`, `evaluaties`, `doelgroep_match`, `conversies`, service_role-only). Voorgestelde velden-set (uitbreiding op het bestaande, géén migratie nu):

```
product
  id, merk, naam, categorie (= comparison-slug, FK-achtig naar approved-claims key)
  prijs_per_dag, url_affiliate (FK naar affiliate-links key)
  third_party_tested (bool), keurmerk, vegetarisch
ingredient_dosering
  product_id, stof, vorm (bv. bisglycinaat/citraat), hoeveelheid, eenheid,
  elementair (bool), biobeschikbaarheid_klasse
claim_link
  ingredient → approved_claims.key (EFSA-claim-id), voldoet_aan_conditie (bool)
referentiewaarde            ← nieuw, niet-persoonlijk
  nutrient, RI, bron (Gezondheidsraad/EFSA), eenheid
```

De `referentiewaarde`-tabel hoort bij productkennis (publieke norm, geen persoonsgegeven) en voedt zowel de micro-inschatting (A4) als de KB.

### C2. Waar het hoort — getypeerde datafiles vs Supabase

**Aanbeveling — gefaseerd, nu nog getypeerde datafiles als source of truth, Supabase als latere spiegel.**

- **Nu:** de vergelijkingsdata staat in getypeerde files ([`src/data/supplements/*.ts`](../../src/data/supplements/), `ComparisonPageData`) en `approved-claims.ts` is het claim-control-point. Dat is bewust: TypeScript dwingt consistentie af tussen affiliate-slug-keys, producten en claims (zie CLAUDE.md → "mismatch = build failure"). Die garantie verlies je in losse DB-rijen. Voor 8 supplementen is een database overkill (conform `ARCHITECTURE.md` "niet gekozen: Firebase/SQLite").
- **Later:** wanneer het aantal producten groeit of een coach (white-label) eigen producten beheert, wordt de Supabase-productdatabase de bron en worden de datafiles daaruit gegenereerd. De RLS is daar al op voorbereid (service_role-only, geen persoonsdata).

Beslisregel: **zolang productkennis hand-gecureerd is → datafiles; zodra het CRUD-beheer of multi-tenant wordt → Supabase.** De `referentiewaarde`-set start als datafile en verhuist mee.

### C3. RAG-/LLM-voedbaar — vroegere track dan persoonsdata

**Aanbeveling:** maak productkennis-RAG een **eigen, vroege track**, omdat zij **geen persoonsgegevens** bevat en dus niet hoeft te wachten op het anonimiseringspad (D) of op gebruikersvolume (F).

- De infrastructuur bestaat deels al: `evidence_claims.embedding vector(1536)` + `search_evidence_claims()` (FTS + semantisch) in [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md), gekoppeld aan de bestaande [`EVIDENCE_CHAT.md`](../core/EVIDENCE_CHAT.md)-track.
- Het genormaliseerde productschema + de EFSA-claims + referentiewaarden vormen samen een afgebakend, feitelijk corpus dat een RAG-laag kan ophalen ("welke magnesiumvorm bij X, met welke EFSA-claim, welke prijs/dag"). De LLM **genereert geen claims** — hij haalt alleen op uit `getUsableClaims()` en de KB; de claimgrens blijft deterministisch bewaakt.
- Dit kan starten zodra het schema staat, los van het aantal intakes.

---

## D. Intake-datastroom + anonimiseringspad

### D1. Scheiding, consent-versionering, RLS

**Aanbeveling — behoud de bestaande art. 9-discipline en breng tier-2-inputs in dezelfde stroom.**

- Intake-antwoorden (incl. nieuwe lengte/gewicht/doel) blijven in `intake_sessions.answers` (jsonb), uitsluitend benaderbaar via de **service_role-client** ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) → RLS: geen anon-client meer in gebruik).
- Elke tier-2-verdieping die nieuwe categorieën gevoelige data toevoegt, krijgt een **eigen `consent_type` met `consent_version`** in `consent_records` (de `CONSENT_VERSION`-machinerie bestaat in [`src/lib/intake-consent.ts`](../../src/lib/intake-consent.ts)). Lengte/gewicht/voedingsdetail = uitbreiding van de verwerkingsdoeleinden → expliciete, geversioneerde toestemming, met `has_active_consent()` als gate.
- Productkennis en intake-data **delen nooit een tabel** (kernregel `ARCHITECTURE.md`).

### D2. Pad van pseudonimisering (nu) → echte anonimisering (vóór aggregatie/training)

**Aanbeveling:** definieer anonimisering als **harde voorwaarde vóór elke aggregatie of modeltraining**, niet als achteraf-stap. Concreet pad:

```
Stap 0 (nu)         Gepseudonimiseerd: session_id + e-mail bestaan, herleidbaar.
                    → blijft persoonsgegeven (art. 9). NIET geschikt voor LLM/aggregatie.

Stap 1 (anon-view)  Bouw een afgeleide, append-only anonieme dataset:
                    - strip e-mail, first_name, session_id, recovery_tokens, IP/UA-hashes
                    - behoud alleen domain_scores, answer-codes, age_range (band), urgency
Stap 2 (k-anon)     Pas k-anonimiteit toe op antwoordcombinaties:
                    - generaliseer/onderdruk zeldzame combinaties (k ≥ drempel, bv. k=20)
                    - age_range blijft band, nooit exacte leeftijd
                    - lengte/gewicht → banden (bins), nooit exacte cm/kg in de anon-set
Stap 3 (gate)       Pas aggregatie/patroonherkenning/training UITSLUITEND toe op de
                    k-geanonimiseerde dataset. De ruwe art. 9-tabel verlaat de
                    service_role-grens nooit.
```

- Gepseudonimiseerd ≠ anoniem: een herleidbare sleutel blijft een persoonsgegeven (`ARCHITECTURE.md`). Daarom is k-anonimiteit op de combinaties nodig, niet alleen het verwijderen van directe identifiers.
- Dit pad geldt voor fase 2 én 3 van de LLM-roadmap (F). De productkennis-RAG (C) valt hier **buiten** — die bevat geen persoonsdata en doorloopt dit pad niet.

---

## E. Progressieve gratis profielen (groei-eerst)

**Aanbeveling:** bied de **rijkere personalisatie in het begin gratis** aan om de leading indicators te halen (aantal voltooide intakes + e-mail-signups), en houd de waarde-poort latent maar klaar.

- **Wat gratis blijft (altijd):** de basis-15-vragen-intake, de 6 domeinscores, het profiellabel, de tier-1-quick-wins en de tier-3-supplementsuggestie met vergelijkingslink. Dit is de monetisatie-motor (affiliate) en moet laagdrempelig blijven.
- **Wat nu gratis is maar later poortbaar (de "verdieping"):** de tier-2 inname-meetlaag (PAL/BMR/TDEE, macro-richtlijn, micronutriënt-inschatting met referentievergelijking) en het 30-dagen-delta-rapport. Het stepped-care-model ondersteunt dit **zonder schemawijziging**: `interventions.is_paid` en `tier` bestaan al, en "toon nu alleen gratis" = UI-filter op `tier = 1` ([`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md)). De omschakeling is dus een config/flag, geen herbouw.
- **Consistent met stepped-care:** tier 2 is gemarkeerd "false (nu); later betaald" in het tier-model — dit plan operationaliseert precies die zin. De waarde-poort komt pas als (a) het volume er is en (b) de verdieping bewezen waarde levert; tot dan is "gratis & rijk" het groei-instrument.

**Meetbaar maken:** koppel de verdieping aan de bestaande `domain_events` (zie F) zodat zichtbaar wordt of de tier-2-stap intakes/signups verhoogt — dat is de beslisdata voor het later sluiten van de poort.

---

## F. LLM-faserings-roadmap (gekoppeld aan volume)

Leidend blijft de regel uit [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md): **regelgebaseerd, geen AI/ML tot 500+ gebruikers.** Twee parallelle sporen.

### Spoor 1 — Persoonsdata-engine (volume-gebonden)

| Fase | Drempel | Aanpak | Benodigde data | Voorwaarde |
|---|---|---|---|---|
| **1 (nu)** | < 500 intakes | Regelgebaseerd, deterministisch (`getAdvice`, triggers) | Geen aggregatie nodig | — |
| **2** | 500+ | **Statistische patroonherkenning, geen ML** — frequenties, correlaties tussen antwoordcombinaties en uitkomsten, om triggers bij te stellen | k-geanonimiseerde dataset (D, stap 2) | Anonimiseringspad D doorlopen |
| **3** | 2000+ | **Voorspellend model** (decision tree / gradient boosting) op anonieme features → trigger-suggesties, nog steeds gegate door `approved-claims.ts` | Idem, grotere k-anon-set + 30-dagen-delta's | Idem + model-output blijft inname-vs-status-conform |

In **geen** fase genereert een model EFSA-claims of statusoordelen; het model stelt hooguit de **regels/triggers** bij, de claimgrens blijft deterministisch (B3).

### Spoor 2 — Productkennis-RAG (niet volume-gebonden, vroeger)

Start zodra het productschema (C) staat — onafhankelijk van intake-volume, want geen persoonsdata. Bouwt voort op `evidence_claims.embedding` + `search_evidence_claims()` en de [`EVIDENCE_CHAT.md`](../core/EVIDENCE_CHAT.md)-track.

### Events die geëmit moeten worden

De event-infrastructuur bestaat al: [`domain_events`](../core/ENTITY_MODEL.md) + `emitEvent()` in [`src/lib/events.ts`](../../src/lib/events.ts) met o.a. `intake.completed`, `email.opted_in`, `plan.checkin_completed`. Voor deze roadmap nodig:

| Event | Bestaat? | Doel |
|---|---|---|
| `intake.completed` | ✅ | Leading indicator + fase-drempel tellen |
| `email.opted_in` | ✅ | Leading indicator (signups) |
| `plan.checkin_completed` | ✅ | 30-dagen-hermeting → delta-data voor fase 3 |
| `measurement.intake_estimate_completed` | ➕ nieuw | Tier-2-verdieping voltooid (E-conversie meten) |
| `measurement.gap_detected` | ➕ nieuw (anoniem payload) | Welke inname-gaps voorkomen (fase 2-input) |

Nieuwe events volgen het bestaande `DOMAIN_EVENT_TYPES`-patroon. Payloads voor de meet-events bevatten **geen** lengte/gewicht/e-mail — alleen gebande/anonieme signalen, conform D.

### Drempel-logica

De overgang fase 1→2→3 wordt bepaald door een telling op `domain_events` (`intake.completed`-count), niet door een kalenderdatum. Pas bij het bereiken van de drempel **én** een doorlopen anonimiseringspad (D) gaat een volgende fase aan.

---

## Gefaseerde implementatie-volgorde

> Volgorde = afhankelijkheden, geen kalenderdata. Niets hiervan is in dit document geïmplementeerd.

1. **Referentiewaarden-datafile (C1)** — niet-persoonlijk, blokkeert A4. Geen afhankelijkheden. *Kan direct.*
2. **Inname-schattingslaag (A1–A4)** in een nieuwe `src/lib/`-module, los van `intake-engine.ts`. Afhankelijk van 1.
3. **Tier-2-consent + datavelden (D1)** — `consent_type`/`consent_version` voor lengte/gewicht/voeding vóór die data verzameld wordt. Blokkeert het live zetten van 2.
4. **Advies-matching-uitbreiding (B1–B2)** — inname-gap-regels in het bestaande `getAdvice`-patroon, hergebruik `supplementAdviceAllowed`. Afhankelijk van 2.
5. **Compliance-template-laag (B3)** + uitbreiding forbidden-phrases + unit-tests. Naast 4, vóór live.
6. **Tier-2 UI als `measurement`-interventie (E)** — gratis, achter het bestaande `tier`/`is_paid`-model. Afhankelijk van 4+5.
7. **Nieuwe events (F)** — `measurement.*` toevoegen aan `DOMAIN_EVENT_TYPES`. Naast 6.
8. **Productkennis-RAG-track (C3 / Spoor 2)** — parallel, niet-blokkerend, kan vroeg starten.
9. **Anonimiserings-pipeline (D2)** — pas nodig bij nadering 500-drempel; blokkeert Spoor 1 fase 2.
10. **Patroonherkenning → voorspellend model (F Spoor 1)** — alleen ná 9 en bij volume.

Kritiek pad voor de eerste waarde: **1 → 2 → 3 → 4 → 5 → 6**. Spoor 2 (8) en de anonimisering (9) lopen er los naast.

---

## Wat bewust NIET nu

- **Geen bloed-/diagnostiek-tier.** Klinische meting blijft referral-only: extern verwijzen, niets opslaan, niets duiden ([`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md), [`ARCHITECTURE.md`](../core/ARCHITECTURE.md)). Geen nieuwe tier-nummering naast 1–5.
- **Geen statusclaims of tekortdiagnoses.** Alle output blijft inname-inschatting; "je hebt een tekort" komt nergens voor ([`COMPLIANCE.md`](../core/COMPLIANCE.md)).
- **Geen BIG/KNGF/fysiotherapie-framing** in engine, copy, disclaimers of onderbouwing. Scope = leefstijlcoach, generaliseerbaar naar coaches zonder BIG.
- **Geen ML op persoonsdata vóór 500+ én vóór doorlopen anonimiseringspad.** Gepseudonimiseerde data gaat geen model of aggregatie in.
- **Geen migratie van productkennis naar Supabase nu.** Getypeerde datafiles + `approved-claims.ts` blijven source of truth zolang de catalogus hand-gecureerd is; de TypeScript-consistentiegarantie weegt zwaarder dan DB-flexibiliteit.
- **Geen exacte geboortedatum, geen exacte lengte/gewicht in de anonieme set.** Leeftijd blijft band; lichaamsmaten worden gebband vóór aggregatie.
- **Geen wijziging aan de basis-15-vragen-intake, domein-maxima of bestaande triggers.** De meetlaag is strikt additief.
- **Geen tweede primaire CTA naast de stepped-care-trap.** Eén pad; de engine bepaalt de volgorde.

---

## Kruisverwijzingen

| Document | Relevantie voor dit plan |
|---|---|
| [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) | Twee gescheiden datastromen; waardentrap = diepere personalisatie, geen diagnostiek-tier |
| [`COMPLIANCE.md`](../core/COMPLIANCE.md) | Inname vs status; EFSA-claims uitsluitend via `approved-claims.ts`; forbidden phrases |
| [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) | Tier 2 = self-report inname-verdieping; tier 4-5 referral-only; `is_paid`/`tier`-poort |
| [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md) | 15-vragen-intake, 6 domeinscores, regelgebaseerd tot 500+ |
| [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) | `intake_sessions`, `consent_records`, `domain_events`, productdatabase, `evidence_claims.embedding` |
| [`PERSONALIZATION_ENGINE.md`](../core/PERSONALIZATION_ENGINE.md) | Profiellabels en triggers waar de meetlaag op aansluit |

---

*Opgesteld: 6 juni 2026. Planning-document — geen code, geen schema-migraties.*
