# Analyse — Longevity-home, domein-gedreven

> **Status:** visie + fasering, klaar voor review. Opgesteld 25 juli 2026.
> **Aanleiding:** een longevity-AI-referentie-app (trends met verdicts, goal-tracking, wellness-shelf) als inspiratie voor het versterken van Overzicht/Home.
> **Kernbesluit:** neem de **integratie** over, verwerp de **oordelen**. Organiseer de home langs de vijf leefstijldomeinen, niet langs metrieken.
> **Herzien 25 juli 2026** na een meedenk-analyse: HRV-nuancering (§1, §3.5, §4.1), taxonomie observatie↔statusclaim, cross-domein sturing gekoppeld aan de echte recovery-hint, en drie display-modi (§7.1).

## Verificatie-noot (25 juli 2026)

De meedenk-analyse haalde enkele bestanden als bron aan die **niet bestaan**; de bijbehorende concepten kloppen wél maar wonen elders. Voor toekomstige lezers:

| Aangehaald | Werkelijkheid |
|---|---|
| `recovery-fit.ts` / `computeRecoveryFit` | Bestaat niet. De `recoveryFit`-hint (0–1, wearable-afgeleid) is input in [`movement-recovery-hint.ts`](../../src/lib/movement-recovery-hint.ts) |
| `category-taxonomy.ts` ("HRV onder slaap als categorie") | Bestaat niet. HRV komt alleen voor in kennisbank-citaties, niet als live user-facing categorie — wat het punt eerder versterkt: er is vandaag géén HRV-surface |
| `leefstijl-disclaimer.ts` (in `lib/`) | Bestaat wel, maar als [`src/data/leefstijl-disclaimer.ts`](../../src/data/leefstijl-disclaimer.ts) |
| `vitality-gauge.ts` "Uit balans" `#C24B4B` · `score-display.ts` 4-staps · `wearable.interest_clicked`-event | **Geverifieerd correct** |

## Verwante documenten

| Doc | Relatie |
|---|---|
| [`ARCHITECTUUR_LIFESTYLE_PLANNER.md`](ARCHITECTUUR_LIFESTYLE_PLANNER.md) §15 | Wearable/health-data OAuth-gate: register + DPA + DPIA vóór activatie |
| [`PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md`](PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md) | Afgeleide read-laag; wearables = Fase E |
| [`PLAN_VITALITEIT_PUNTEN_COMMUNITY.md`](PLAN_VITALITEIT_PUNTEN_COMMUNITY.md) | Punten/artefacten zonder gezondheidsoordeel |
| [`BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md`](BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) | Lock 5, lock 8 (geen normwaarde als oordeel) |

---

## 1. Wat we overnemen en wat we verwerpen

| Element in de referentie | Verdict | Waarom |
|---|---|---|
| **Alles komt samen op één home** | **OVERNEMEN** | Dit is de echte kracht: trends, doelen, ondersteuning en signalen op één plek. Onze versie: langs de 5 domeinen. |
| **Trends over tijd (W/M/6M)** | **OVERNEMEN** | Richting zien is motiverend. Onze trend = domeinscore + adherence, met W/M/6M-toggle. |
| **Verdict-labels ("Concerning", "Below average", "Athletic")** | **VERWERPEN** | Normwaarde-oordeel (lock 8). Vervang door **richting + delta + volgende stap**, zonder rood/groen-veroordeling. |
| **Biologische leeftijd / "Health Condition: Average"** | **VERWERPEN** | Pseudo-medisch, art. 9-oordeel. Geen enkele versie hiervan. |
| **Goal tracking: calorieën + macro's (0/2000 kcal, 0/70g)** | **NUANCEREN** | De kcal/macro-teller is MyFitnessPal — expliciet wat we NIET worden. Eiwit heeft een plek (herstel), maar als *doel binnen voeding*, niet als gamified counter. |
| **Steps / Sleep / Mindfulness als losse doelen** | **HERKADEREN** | Niet als losse metrieken, maar als readouts ónder hun domein (stappen→beweging, slaapduur→slaap). |
| **HRV/RHR als metric-met-verdict** | **VERWERPEN** | Een user-facing HRV-hero met "Below average" is een normwaarde-oordeel + art. 9. Nooit. |
| **HRV/RHR als sturingsinput** | **TOEGESTAAN — Fase E, achter de poort** | HRV mag de *timing en intensiteit* sturen (welke tier vandaag) als afgeleide hint, niet als tweede score en niet vooraan. Achter §15 (register + DPA + DPIA + `wearable_sync`-consent). Zie §3.5 en §4.1. |
| **"Wellness Products": Supplements + Medications met "+"** | **VERWERPEN als shelf** | Supplementen zijn onze moat, maar stepped-care: ná de leefstijlbasis, per domein, gegate op de voedingscheck — geen pil-logboek-plank. **Medicatie-tracking niet nu** (grote compliance-stap). |

**Eén zin:** de referentie organiseert langs *metrieken met oordelen*; wij organiseren langs *domeinen met richting en een volgende stap*.

---

## 2. De domein-spine

De vijf leefstijldomeinen zijn de ruggengraat van de home. Alles hangt eraan.

```
HOME (Overzicht)
├─ Leefstijl-ring        → 5 pijlers in één ring (kleur + legenda + startstip)   [zie prototype §02]
├─ Je domeinen           → per pijler: score · W/M/6M-richting · Δ · bron · volgende stap
│    slaap · beweging · voeding · stress · verbinding
├─ Vandaag-focus         → het prioriteitsdomein toont zijn dagactie (bijv. beweeg-cockpit)
├─ Ondersteuning         → supplementen per domein, stepped-care, ná de basis, gegate
└─ (optioneel) Signalen  → wearable-inputs, achter consent, gevoed IN de domeinen
```

Verschil met de referentie: daar is "Your Trends" een lijst losse metrieken en "Goal Tracking" een aparte lijst. Bij ons is er **één as (de pijler)** waar de meting, de trend, de actie én de ondersteuning aan hangen.

---

## 3. Trends zonder oordeel

Elke pijler toont: **score · richting (W/M/6M) · delta · bron · volgende stap**. Geen verdict-label.

| Referentie zegt | Wij zeggen |
|---|---|
| "Sleep: **Concerning**" (rood) | "Slaap 61 · +3 deze maand · stijgend — houd je avond voorspelbaar" |
| "HRV: **Below average**" (rood) | "Stress 52 · +4 deze maand — je herstel trekt langzaam bij" |
| "Steps: **Needs improvement**" (rood) | "Beweging 58 · +7 sinds je start — nog één krachtmoment deze week" |

De **bron** staat er expliciet bij (`check-in` of `wearable-optioneel`), zoals `baselineSourceLabel` al levert in de data-laag. Richting en delta zijn feiten; een oordeel is een mening die we niet vellen.

---

## 3.5 De grens: observatie, sturing en statusclaim

"Adviezen, geen diagnoses" is te grof om mee te bouwen. De precieze grens is dat we **wel mogen observeren, sturen en adviseren**, maar **geen normatieve statusduiding** (pathologie, tekort zonder meting, of vergelijking met een populatie) mogen doen. Dat onderscheid maakt HRV-sturing mogelijk zónder de diagnose-lijn te overschrijden.

| Laag | Wat het is | Voorbeeld | Diagnose? |
|---|---|---|---|
| **Observatie** | Feit uit eigen input/sensor, t.o.v. je eigen baseline | "HRV-weekgemiddelde −12 ms t.o.v. jouw baseline" | Nee |
| **Patroon** | Combinatie over tijd/domeinen | "Slaap-check-in daalt terwijl je beweegvolume stijgt" | Nee (herkenning) |
| **Sturing** | Prioriteit / intensiteit | "Vandaag past Herstel beter dan Trainen" | Nee |
| **Advies** | Actie + mechanisme | "Houd je avond voorspelbaar" + quick-win | Nee |
| **Verwijzing** | Buiten scope | "Blijven klachten hangen → huisarts" | Nee |
| **Statusclaim** | Pathologie/tekort zonder meting | ~~"Je HRV is te laag", "magnesiumtekort"~~ | **Ja — verboden** |
| **Populatie-oordeel** | Vs leeftijdscohort | ~~"Below average", "Concerning"~~ | **Ja — verboden (lock 8)** |

Wat vandaag al aan de veilige kant zit: domeinscores 0–100 uit de eigen vragenlijst (beleving, geen labwaarde), profiellabels als herkenningsarchetype, prioriteit/grootste-hefboom als sturing, en de inname-inschatting ("waarschijnlijk te weinig omega-3") die [`COMPLIANCE.md`](../core/COMPLIANCE.md) expliciet toestaat.

**Copy-kader**

| Toegestaan | Verboden |
|---|---|
| "… t.o.v. jouw baseline" | "below/above average", "concerning", "athletic", "optimal zone" |
| "richting stijgend / dalend / stabiel" | "je HRV is te laag/hoog" |
| "op basis van je check-in / optioneel je wearable" | biologische leeftijd, health score, risico-% |
| "vandaag past Herstel/Matig/Trainen bij je recente week" | ms/RHR als gamified target |

---

## 4. Wearables → domeinen (gegate, optioneel)

Wearable-signalen zijn **inputs in de domeinen**, geen eigen scherm met oordelen. En ze zijn optioneel: voeding en verbinding hebben bewust géén wearable-bron — we faken geen precisie waar we die niet hebben.

| Signaal | Voedt domein | Als readout |
|---|---|---|
| Rust-hartslag + HRV | Stress & herstel | herstel-gereedheid, geen "Below average" |
| Stappen + actieve minuten | Beweging | naast de gelogde sessies |
| Slaapduur + -regelmaat | Slaap | naast de slaap-check-in |
| — | Voeding | geen wearable; blijft zelfrapportage |
| — | Verbinding | geen wearable; blijft zelfrapportage |

**Harde poort (§15):** OAuth/health-data pas ná register-uitbreiding + DPA + DPIA-revisie. Eigen consent-type (bijv. `wearable_sync`), default uit, per bron intrekbaar. Dit is **Fase E** uit de wekelijkse-log-fasering — niet nu.

## 4.1 Wat HRV concreet stuurt (Fase E — blijft in de architectuur tot de poort open is)

HRV is niet uniek omdat het een cijfer geeft, maar omdat het **timing en intensiteit** eerder ziet dan zelfrapportage (overtraining, een slechte slaapweek, stille stress-opbouw). Het stuurt dus, het scoort niet. De sturing loopt via de bestaande recovery-hint, niet via een nieuwe metric.

**Aansluiting op code (bestaand):** [`movement-recovery-hint.ts`](../../src/lib/movement-recovery-hint.ts) neemt al een optionele `recoveryFit` (0–1, "wearable-derived, premium fase 2") als input en geeft een hint-`level` (`none`/`light`/`rest`/`medical`) met een `source` (`intake`/`checkin`/`wearable`/`combined`). Dat is precies de naad: de wearable verfijnt de tier-hint, hij vervangt geen score. Er is géén `recovery-fit.ts` of `computeRecoveryFit` — de logica woont hier.

**Cross-domein sturing (nooit half-advies):**

| Signaal | Wat de rest van de week zegt | Sturing |
|---|---|---|
| HRV ↓ + slaap-check-in ↓ | zelfde richting | Slaap-prioriteit + avond-ritme-quick-win |
| HRV ↓ + beweegvolume ↑ | je traint door een dip | Herstel/Matig-tier, geen zware kracht |
| HRV ↓ + stress-check-in ↑ | belasting stapelt | Herstelmoment, geen extra load |
| Alleen HRV ↓, check-ins stabiel | één los signaal | Geen alarm: "kijk naar de week, geen grote wijziging" |

De laatste rij is de belangrijkste: één afwijkend sensorsignaal mag nooit de zelfrapportage overrulen. Conflict → toon beide met bron-label.

---

## 5. Waar supplementen zitten — onze moat, goed geplaatst

De referentie heeft een "Wellness Products"-plank: Supplements + Medications met een "+" en "No data yet". Dat is een logboek-plank; wij doen het omgekeerd.

- **Per domein, ná de basis.** Supplementen verschijnen onder het domein waar ze relevant zijn (beweging → creatine/eiwit; stress/slaap → magnesium), en pas ná de voedingscheck (`canShowSupplementStrip`, stepped-care).
- **Informerend, niet verkopend.** Links naar gids/vergelijking buiten de cockpit; geen prijzen, geen koop-CTA in de home.
- **Geen pil-logboek** en **geen medicatie-tracking** in deze fase. Medicatie raakt WGBO/art. 9 en vraagt een apart traject; niet meeliften op "even de home uitbreiden".

Dit is precies waar PerfectSupplement wint van een generieke longevity-app: de supplement-aanbeveling is de *geïnformeerde uitkomst van je leefstijlbeeld*, niet een plank met een plusje.

---

## 6. Goal-tracking, herkaderd

Niet MyFitnessPal. De doelen zijn **gedrags- en anker-gedreven**, niet macro-tellers.

- **Anker bovenaan:** "Zodat ik op mijn zeventigste nog zelf de trap op kom." Elk domeindoel hangt daaronder.
- **Eiwit** houdt een plek (bestaand eiwitdoel / `body_metrics`), maar als "eiwit voor je herstel", niet als "0/70g"-teller met voortgangsbalk.
- **Kcal/carbs/fat als dagdoel:** niet overnemen. Dat trekt ons naar caloriebeheer, precies de positionering die we afwijzen.

---

## 7. Compliance-poorten (samengevat)

| Onderdeel | Poort |
|---|---|
| Verdict-labels / biologische leeftijd | **Niet bouwen** — lock 8, merkbelofte |
| Wearable-sync (RHR/HRV/stappen/slaap) | Register + DPA + DPIA + eigen consent (§15) — Fase E |
| Medicatie-tracking | Apart traject; WGBO/art. 9 — niet nu |
| Domeinscores tonen | Mag — als richting, met bron, zonder oordeel |
| Supplementen in de home | Mag — stepped-care, gegate, informerend, geen koop-CTA |

## 7.1 Drie display-modi (geen tegenstrijdigheid)

"Geen rood/groen op de home" lijkt te botsen met bestaande code die wél banden en kleuren heeft. Dat is geen tegenspraak maar een **surface-onderscheid** — drie display-modi, elk met een eigen strengheid:

| Modus | Waar | Wat het toont | Bestaande code |
|---|---|---|---|
| **Richting** | Home / domein-spine | score · richting · Δ · volgende stap. Geen band, geen kleur-oordeel. | dit doc |
| **Band** | Voortgang / diepere analyse | band + score, **altijd** gepaard met bron + delta | [`vitality-gauge.ts`](../../src/lib/vitality-gauge.ts) (5 banden, incl. rood "Uit balans" `#C24B4B`) |
| **Reveal** | Intake-uitslag | 4-staps status | [`score-display.ts`](../../src/lib/score-display.ts) (`Sterk`/`Voldoende`/`Aandacht`/`Prioriteit`, bewuste KOAG-keuze) |

Het cruciale verschil met de longevity-app: onze banden zijn geankerd aan **je eigen antwoorden**, niet aan een populatienorm. "Uit balans" is een zelf-referentiële band; "Below average" is een cohort-oordeel. Toch is de professionele regel: op de home geen band, en waar de band wél leeft (Voortgang) altijd bron + delta ernaast, nooit "slecht/gezond".

---

## 8. Fasering

| Fase | Wat | Nieuw doel / poort? |
|---|---|---|
| **A** | Home = domein-spine: ring + "Je domeinen" (score·richting·Δ·bron·volgende stap), zonder oordelen. Puur uit bestaande check-in/score-data. | nee |
| **B** | Vandaag-focus koppelen (prioriteitsdomein toont zijn dagactie) + supplementen stepped-care per domein. | nee (bestaande gate) |
| **C** | W/M/6M-trend per domein uit de bestaande trend-data. | nee |
| **D** | Punten/artefacten uit [`PLAN_VITALITEIT_PUNTEN_COMMUNITY.md`](PLAN_VITALITEIT_PUNTEN_COMMUNITY.md) — motivatie zonder gezondheidsoordeel. | consent (community) |
| **E** | Wearable-sync → domeininputs. | **ja** — §15-poort |
| **F** | Medicatie / klinische data. | **ja** — apart traject |

Fase A–C zijn bouwbaar op wat er al is en introduceren geen nieuw verwerkingsdoel. D–F hebben elk hun eigen poort.

---

## 9. Wat we bewust niet doen

- Geen rood/groen-verdict op een leefstijldomein.
- Geen biologische leeftijd, geen "gezondheid: gemiddeld".
- Geen calorie-/macro-teller als dagdoel.
- Geen wearable-data vóór de §15-poort.
- Geen medicatie-tracker in deze fase.
- Geen supplement-plank met "+"; supplementen blijven stepped-care per domein.

---

Meetpunt: geen — dit document activeert niets. Meetpunten komen per fase bij implementatie (drievoudige client-event-registratie waar nodig).
