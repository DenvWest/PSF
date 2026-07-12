# ANALYSE — Pijler-dekking & domein-interactie

> **Layer 3 — Plan/Analyse.** Houdt het meet-/personalisatieplan ([`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md)) tegen het licht: dekt het alle leefstijl-pijlers, of trekt het zwaartepunt naar voeding? Legt domein-interactie, verdiepingspaden per pijler en een prioriteitsvolgorde vast. **Alleen analyse — geen code, geen `src/`-wijziging.**
>
> Kruisverwijzingen: [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) · [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md) · [`PERSONALIZATION_ENGINE.md`](../core/PERSONALIZATION_ENGINE.md) · [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) · [`COMPLIANCE.md`](../core/COMPLIANCE.md)

---

## Samenvatting

Het meetplan voegt een kwantitatieve inname-laag toe (PAL/BMR/TDEE, macro, micro), maar **alleen voeding heeft een harde referentiewaarde** (ADH/DRV/RI). De andere pijlers — slaap, stress, beweging, herstel — scoren zacht (zelfrapportage 0–100) zonder externe ijklat. Dat creëert een **scheefheid-risico**: de enige pijler die je in cijfers tegen een norm kunt afzetten, is ook de pijler met de duidelijkste supplement-CTA. Onbewust kantelt het advies dan naar "meten = voeding = supplement", wat botst met de merkbelofte *leefstijl eerst* en de inname-vs-status-grens.

Drie conclusies:

1. **De engine kruist al elf keer domeinen** (zie §0/§3) — dat is het bestaande kroonjuweel. Dit versterken is **hoogste impact, nul nieuwe data, en exact wat een coach onderscheidt van een symptoomchecker.** Daarom: eerst de interactielaag, dán de voedings-meetlaag.
2. **Eén afdwingbare anti-scheefheid-regel**: elke pijler-verdieping levert in de output minstens één leefstijl-quick-win uit een *ander* domein. Zo kan het advies structureel nooit een kale supplementlijst worden (§2).
3. **Verdieping van niet-voedingspijlers** kan later binnen scope (slaaplog, HRV-/wearable-tracking als leefstijldata) — maar wearables zijn een **open strategisch beslispunt voor Dennis**, geen aanbeveling (§4).

---

## 1. Pijler-dekkingsmatrix

| Pijler | (a) Hoe nu gemeten | (b) Verdiepingspad | (c) Kwantificeerbaar tegen referentie? |
|---|---|---|---|
| **Slaap** | 4 vragen (`SLP_QUAL/CONS/ONSET/WAKE`), score 0–100 | Slaaplog 7 dagen (tier 2, al als template in `STEPPED_CARE_MODEL`); wearable-slaapduur als optie (§4) | **Nee** — inherent zacht; geen ADH-equivalent. Wearable-uren is gedrag, geen norm |
| **Energie** | 2 vragen (`NRG_PATN`, `NRG_DEP`), score 0–100 | Geen eigen pad; energie is grotendeels **afgeleide** van slaap/stress/voeding | **Nee** — zacht; bovendien geen eigen `PillarId`/profielpagina (afgeleid signaal) |
| **Stress** | 2 vragen (`STR_FREQ`, `STR_RCV`), score 0–100 | Geen meetpad nu; HRV als optie (§4); herstelmomenten-tracking | **Nee** — zacht; HRV zou proxy zijn, geen klinische duiding |
| **Voeding** | 2 vragen (`NUT_O3`, `NUT_PROT`) + `LIF_SUN`/`LIF_ALC` | **Volledige meet-laag** (PAL/BMR/TDEE, macro, micro) — plan A | **JA — de enige.** ADH/EFSA DRV/RI als harde ijklat |
| **Beweging** | 2 vragen (`MOV_STR`, `MOV_CARD`), score 0–100 | PAL-afleiding (deelt input met voedingslaag); trainings-/stappen-tracking als optie (§4) | **Half** — PAL-banden zijn gevestigd, maar het is een activiteits-classificatie, geen tekort-referentie |
| **Herstel** | 1 vraag (`RCV_PHYS`) + gedeelde `STR_RCV`, score 0–100 | Geen eigen pad; sterk **interactie-afhankelijk** (beweging, slaap, stress) | **Nee** — zacht; dunste pijler (slechts 1 eigen vraag) |
| **Verbinding** *(connection)* | 1 vraag (`CON_SOC`), score 0–100 — gescoord sinds rules_version 1.3.0 | Geen check-in of plan-template | **Nee** — zacht |

*Geactualiseerd 11 juli 2026: verbinding wordt sinds rules_version 1.3.0 gescoord (`CON_SOC`) — de rij hierboven is bijgewerkt. De kernobservatie blijft gelden: alleen voeding heeft een harde externe referentiewaarde.*

**Kernobservatie:** kolom (c) is voor zes van de zeven pijlers "nee/half". **Alleen voeding** krijgt door het plan een harde, externe referentiewaarde. Dat asymmetrie-feit is de motor achter het scheefheid-risico in §2.

---

## 2. Scheefheid-risico

### Het mechanisme

Een meetlaag die alleen voeding hard kwantificeert, produceert voor voeding **concrete getallen met een norm ernaast** ("je krijgt ~220 mg magnesium binnen, RI is 350"). De overige pijlers blijven zachte 0–100-scores zonder ijklat. In een adviesoutput trekt het concrete getal de aandacht — en achter elk micronutriënt-gat zit bewust een vergelijkingspagina (`approved-claims.ts` koppelt alleen stoffen mét `comparisonPath`). Het pad *meten → getal → gat → supplement* is dus korter en "harder" dan *zachte score → leefstijl-gewoonte*. Zonder tegenkracht kantelt het zwaartepunt naar supplementen.

### Waarom dat botst

- **Merkbelofte "leefstijl eerst":** als de best-kwantificeerbare pijler ook de supplement-pijler is, ondermijnt de meetlaag de positionering "Consumentenbond van supplementen — objectief, leefstijl vóór pillen".
- **Inname-vs-status-grens ([`COMPLIANCE.md`](../core/COMPLIANCE.md)):** hoe harder en getalsmatiger de output, hoe groter de verleiding om van "je krijgt waarschijnlijk te weinig binnen" naar "je hebt te weinig" te glijden. Een getal-met-norm *voelt* als een status, terwijl het een inname-schatting is. De grens moet juist hier extra geborgd worden.

### Aanbeveling — één afdwingbare ontwerpregel

> **Cross-domein-balansregel:** elke verdieping/uitdieping van één pijler levert in de adviesoutput **minstens één leefstijl-quick-win uit een ánder domein**. Het advies kan daardoor structureel nooit een pure supplementlijst zijn.

**Waar de regel hoort:** in de **output-/template-laag**, niet in de losse scoringsregels. Concreet de samenstellaag die nu `getAdvice()` afsluit (`uniqueTopQuickWins` / `uniqueTopSupplements`): vóór het teruggeven van de `AdviceResult` geldt een invariant —

```
als (supplements.length > 0) dan (quickWins moet ≥1 item bevatten
     uit een ander domein dan de pijler die de supplement-suggestie triggerde)
```

Dit sluit aan op het bestaande patroon: `getAdvice` voegt nu al bij elke supplement-suggestie een leefstijl-`quickWin`/`longTerm` toe (bv. magnesium-suggestie + ademhalingsoefening + vast slaapritme). De regel maakt dat **gegarandeerd in plaats van toevallig**.

**Teststrategie (geen code, wel de borging):**
- **Invariant-test:** genereer over een brede matrix van `answers`-combinaties (alle domein-laag/hoog-permutaties + inname-gaps) telkens de `AdviceResult`; assert dat **geen enkele** uitkomst met ≥1 supplement een lege of mono-domein quick-win-lijst heeft. Dit is een property-based test, niet één happy-path-case.
- **Anti-scheefheid-metriek:** assert dat bij een geïsoleerd voedings-gat (alle andere domeinen gezond) de output nog steeds een niet-voedings-leefstijlactie bevat.
- **Compliance-koppeling:** combineer met de forbidden-phrases-test uit plan §B3 — de balansregel en de statuswoord-filter samen vormen de structurele borging.

---

## 3. Domein-interactie-laag (het kroonjuweel)

### Wat al bestaat (uit Fase 0)

| Bestaande kruisregel | Conditie | Domeinen |
|---|---|---|
| `magnesiumSignal` | `SLP_WAKE ≤ 2 \|\| (SLP_QUAL ≤ 2 && STR_RCV ≤ 2)` | slaap + stress-herstel |
| `cortisolRisk` | `STR_FREQ ≤ 2 && SLP_CONS ≤ 1 && NRG_PATN ≤ 2` | stress + slaap + energie |
| `recoveryDeficit` | `RCV_PHYS ≤ 1 && movementLoad ≥ 3` | herstel + beweging |
| `overtrainerPattern` | `movementLoad ≥ 3 && RCV_PHYS ≤ 1` | beweging + herstel |
| `creatine_signal` | `(recovery_score<50 && movementLoad≥3) \|\| recoveryPrimary \|\| overtrainer` | herstel + beweging |
| `melatonine_signal` | `SLP_ONSET ≤ 2 && STR_FREQ ≥ 3` | slaap + stress |
| `protein_gap_signal` | `NUT_PROT ≤ 2 && (movementLoad≥2 \|\| RCV_PHYS≤1 \|\| overtrainer)` | voeding + beweging/herstel |
| advies-regel | `sleep_score<50 && stress_score<50` → magnesium | slaap + stress |
| advies-regel | `SLP_ONSET ≤ 2 && STR_FREQ ≥ 3` → magnesium | slaap + stress |
| advies-regel | `energy_score<40 && nutrition_score<50` → eiwitontbijt | energie + voeding |
| advies-regel | `movementLoad≥3 && RCV_PHYS≤1` → rustdag + magnesium | beweging + herstel |
| profiel | "Lage Batterij": `energy_score<40 \|\| movement_score<35` | energie/beweging |

Sterke clusters: **slaap↔stress** en **beweging↔herstel** zijn goed gedekt. Energie is grotendeels afgeleid (geen eigen profielpagina, afgeleid signaal in `ENTITY_MODEL`).

### Wat ontbreekt maar logisch is (kandidaat-kruisregels)

**Niet implementeren — analyse-voorstel.** Elke regel volgt: conditie → cluster/duiding → *leefstijl-eerst*-advies.

| # | Conditie (indicatief) | Duiding (geen diagnose) | Leefstijl-eerst-advies | Waarom nu gemist |
|---|---|---|---|---|
| K1 | `recovery_score laag && movement_score laag` | Onderherstel **niet** door training, maar door slaap/stress | Slaap/stress-route, **niet** beweging-supplement; expliciet "niet méér trainen" | Huidige herstel-regels eisen `movementLoad ≥ 3`; lage-beweging-onderherstel valt nu tussen wal en schip |
| K2 | `sleep_score laag && stress_score hoog` (stress gezond) | Slaapprobleem **zonder** stressdrijver → ritme/licht/middelen-pad | Inslaapritueel + licht; géén stress-interventie opdringen | Onderscheidt "stress-gedreven" van "puur slaap" — nu deels in `melatonine_signal`, niet als route |
| K3 | `energy_score laag && sleep_score gezond && nutrition_score gezond` | Energie-dip **niet** verklaard door slaap/voeding → beweging/daglicht | Wandeling/daglicht-quick-win vóór elk supplement | Energie wordt nu vooral aan voeding gekoppeld (`energy+nutrition`-regel) → scheefheid-risico |
| K4 | `stress_score laag && recovery_score laag` (via gedeelde `STR_RCV`) | Mentale-hersteltekort, los van fysieke training | Herstelmomenten plannen; agenda-blokken | `STR_RCV` voedt beide scores maar er is geen expliciete "mentaal herstel"-route |
| K5 | `nutrition_score laag` als **confounder** bij meerdere lage domeinen | Voedingsbasis eerst herstellen vóór domein-specifieke supplementen | Volwaardige maaltijden als fundament-quick-win | Voorkomt dat zachte domeinen los "opgelost" worden terwijl de basis ontbreekt |
| K6 | `LIF_ALC laag && sleep_score laag` | Alcohol als slaapverstoorder | Alcoholvrije avonden (bestaat al als quick-win, niet als kruisregel) | Leefstijl-vraag stuurt nu advies maar telt niet als domein-interactie |

K1, K2 en K3 zijn het meest waardevol: ze trekken het advies **weg** van de standaard-supplementroute en zijn precies het coach-onderscheid (patroon zien, niet symptoom afvinken). Ze vergen **nul nieuwe data** — alleen nieuwe combinaties van bestaande antwoorden.

### Aanbeveling

Versterk de interactielaag **vóór** de voedings-meetlaag live gaat. Het is de goedkoopste (geen nieuwe data, geen consent-uitbreiding), meest merk-versterkende en meest scheefheid-corrigerende stap. Concreet: K1–K3 als eerste tranche, gemodelleerd in hetzelfde signaal-/advies-patroon van `intake-engine.ts`, elk met een *ander-domein* quick-win conform §2.

---

## 4. Verdiepingspad per niet-voedingspijler

Hoe slaap/stress/herstel/beweging(/verbinding) later óók kunnen verdiepen **binnen scope** — zonder lichaamsmateriaal of klinische duiding.

| Pijler | Verdieping binnen leefstijlcoach-scope (geen klinische meting) |
|---|---|
| **Slaap** | Zelf-gerapporteerde slaaplog (7 dagen: bedtijd, inslaapduur, wakker worden) — tier-2 `measurement`, al als template in `STEPPED_CARE_MODEL`. Optioneel wearable-slaapduur (§ hieronder) |
| **Stress** | Herstelmomenten-/piek-tracking (zelf-rapport dagdeel); optioneel HRV/rusthartslag als leefstijl-proxy (§ hieronder) |
| **Herstel** | Subjectieve hersteldagboek (spierpijn, frisheid bij ontwaken); afgeleid uit slaap+stress-interactie (§3) |
| **Beweging** | Stappen-/trainingsfrequentie-tracking (zelf-rapport of wearable); voedt PAL preciezer (deelt input met voedingslaag) |
| **Verbinding** | Gescoord sinds rules_version 1.3.0 (`CON_SOC`); verdieping (check-in, leefstijlplan, eigen profiellabel) is een open punt — zie `PLAN_LEEFSTIJLCHECK_UITVOERING.md` stap S5/S6 |

Gemeenschappelijk principe: het blijft **zelf-gerapporteerde of gedragsdata**, afgezet tegen *eigen baseline* (delta), nooit tegen een klinische norm. Dat houdt het aan de leefstijlcoach-kant van de grens en respecteert "geen statusclaim".

### Wearable-/smartwatch-data — OPEN STRATEGISCH BESLISPUNT (geen aanbeveling)

Slaap, HRV en rusthartslag uit een smartwatch zijn **leefstijl-tracking, geen medische meting** → in principe binnen scope. Het zou de niet-voedingspijlers kwantificeerbaar maken en de scheefheid uit §2 rechttrekken. Maar het is een strategische keuze voor Dennis, niet voor de engine. Voors en tegens:

**Voor:**
- Dekt juist de pijlers die nu zacht blijven (slaap, stress via HRV, herstel via rusthartslag) → corrigeert de voedings-scheefheid structureel.
- Objectieve delta over 30 dagen versterkt de Voortgangscheck (fase 5 intake) en de nurture-haak.
- Onderscheidend: weinig supplement-vergelijkers koppelen leefstijl-tracking.

**Tegen:**
- **Extra databron** met integratie-onderhoud (API's per fabrikant, OAuth, drift).
- **Art. 9-implicaties:** continue gezondheids-gerelateerde data verzwaart de privacy-last fors t.o.v. een eenmalige intake; consent-versionering, bewaartermijnen en het anonimiseringspad (plan §D) worden complexer.
- **Complexiteit & afhankelijkheid:** afhankelijk van externe platforms; risico dat het product van "advies" naar "device-integratie" verschuift — scope-creep weg van de kernbelofte.
- **Grensbewaking:** HRV/rusthartslag *voelen* klinisch; het risico op afglijden naar statusduiding ("je HRV is te laag") is reëel en moet streng getemd worden.

**Status:** beslis NIET zelf. Dit staat als eerste item in "Open beslispunten voor Dennis".

---

## 5. Prioriteitsvolgorde (met afhankelijkheden en onderbouwing)

| # | Stap | Afhankelijkheid | Waarom deze plek |
|---|---|---|---|
| **1** | **Domein-interactie-logica versterken** (K1–K3 uit §3) | Geen — alleen bestaande antwoorden | Hoogste impact, **nul nieuwe data**, geen consent-uitbreiding. Corrigeert scheefheid *vóór* die ontstaat en is het coach-onderscheid. Moet eerst omdat het het frame zet waarbinnen de meetlaag landt |
| **2** | **Voedings-meetlaag** (plan §A + §B) + cross-domein-balansregel (§2) | Ná stap 1 | Bewust ná de interactielaag: zo landt het harde voedingsgetal in een advies dat al multi-domein en leefstijl-eerst is, i.p.v. het zwaartepunt te kapen. De balansregel (§2) is hier de harde voorwaarde |
| **3** | **Productkennis-RAG** (plan §C/§F-spoor 2) | Parallel — geen afhankelijkheid van 1/2 | Volume-onafhankelijk en niet-persoonlijk; kan vroeg en los lopen. Versnelt de KB zonder de intake-stroom te raken |
| **4** | **Wearable-verdieping** (§4) | **Alleen indien Dennis "ja" zegt** + ná stap 1/2 | Pas zinvol als de zachte pijlers al via interactie zijn versterkt; anders los je hetzelfde probleem duurder op. Geblokkeerd door het beslispunt |
| **5** | **Persoonsdata-LLM** (plan §F-spoor 1) | 500+/2000+ **én** anonimiseringspad (plan §D) | Ongewijzigd gefaseerd. Vereist volume én k-anonimisering; komt logisch laatst |

**Rode draad:** de volgorde is bewust *interactie → meten → kennis → (optioneel) wearable → model*. Elke stap dempt de scheefheid van de volgende: de interactielaag (1) zorgt dat de voedings-meetlaag (2) niet domineert; de balansregel borgt het in de output; wearables (4) en model (5) komen pas als het fundament multi-domein en leefstijl-eerst is.

---

## Open beslispunten voor Dennis

1. **Wearable-/smartwatch-integratie (HRV, slaap, rusthartslag) — ja of nee?** Trekt de scheefheid recht en kwantificeert de niet-voedingspijlers, maar voegt een art. 9-zware databron, externe afhankelijkheid en grensbewakings-risico toe (§4). Bepaalt of stap 4 in de roadmap komt. **Geen aanbeveling van mijn kant — strategische keuze.**
2. **Eerste tranche kruisregels:** akkoord met K1–K3 (onderherstel-zonder-training, slaap-zonder-stress, energie-zonder-slaap/voeding) als eerste set, of een andere selectie uit §3?
3. **Hardheid van de balansregel:** moet de cross-domein-balansregel (§2) een *harde invariant* zijn (advies mét supplement faalt de test zonder ander-domein quick-win) of een zachte voorkeur? Aanbeveling neigt naar hard, maar de strengheid is een productkeuze.
4. **Verbinding-pijler:** de meetvraag (`CON_SOC`) bestaat al sinds rules_version 1.3.0 — dat is geen open punt meer. Vervolgbeslispunt: eigen profiellabel, leefstijlplan en check-in uitbouwen (zie `LEEFSTIJLCHECK_SCOPE_REVIEW.md` §2g en `PLAN_LEEFSTIJLCHECK_UITVOERING.md` stap S5/S6).

---

## Kruisverwijzingen

| Document | Relevantie |
|---|---|
| [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) | Het plan dat deze analyse toetst (§A meetlaag, §B matching, §C RAG, §D anonimisering, §F roadmap) |
| [`INTAKE_SYSTEM.md`](../core/INTAKE_SYSTEM.md) | 15 vragen / 7 categorieën / 6 gescoorde domeinen — bron van de pijlerdefinities |
| [`PERSONALIZATION_ENGINE.md`](../core/PERSONALIZATION_ENGINE.md) | Profielen + triggers; Overtrainer-patroon; energie/herstel als afgeleide signalen |
| [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) | Tier 2 = self-report verdieping; slaaplog-template; tier 4-5 referral-only |
| [`COMPLIANCE.md`](../core/COMPLIANCE.md) | Inname-vs-status-grens; reden waarom getalsmatige output extra borging vergt |

---

*Opgesteld: 6 juni 2026. Analyse-document — geen code, geen schema-migraties.*
