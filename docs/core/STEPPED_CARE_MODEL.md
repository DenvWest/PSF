# STEPPED-CARE MODEL — PerfectSupplement

> **Layer 2 — Systems.** Hoe de PLAN-journey per symptoom personaliseert via tiers (gratis → meten → supplement → betaald). Schema staat in [`ENTITY_MODEL.md`](ENTITY_MODEL.md); copy/labels in [`../copy/plan-stepped-care.md`](../copy/plan-stepped-care.md).

Dit document beschrijft het **datamodel en de matching-logica**, niet de seed-content. Het concrete invullen van interventie-rijen met EFSA-bewoording gebeurt apart (zie [`COMPLIANCE.md`](COMPLIANCE.md)).

---

## Kernidee

De intake-journey loopt: **REVEAL → HERKENNING → FOCUS → PLAN**. Het PLAN-scherm toont per prioriteitsthema een *stepped-care trap*: van een gratis actie naar (eventueel) een betaalde optie. De **engine bepaalt de volgorde, niet de gebruiker** — dat is bewust (geen keuzestress, één pad).

Personalisatie per specifiek symptoom zit **niet in nieuwe thema's**, maar in `intervention_triggers`. Een thema blijft breed (`sleep`); een interventie verschijnt alleen als zijn triggers matchen met de intake-antwoorden/scores.

```
themes (breed: sleep, stress, nutrition, movement, connection)
  └─ recognition_lines        → HERKENNING-scherm ("Je ligt lang wakker…")
  └─ interventions            → PLAN-scherm, gesorteerd op tier
       └─ intervention_triggers  → bepaalt OF de interventie verschijnt
       └─ evidence_claims        → onderbouwing (tier 1-3 verplicht 'published')
```

---

## Tiers (1-5)

`interventions.tier` stuurt de volgorde en de visuele trap. `kind` blijft de semantische renderer-tag.

| tier | bedoeling | typisch `kind` | `is_paid` | bron |
|---|---|---|---|---|
| 1 | Gratis quick win, < 10 min, geen aankoop | `free_action` | false | — |
| 2 | Meten/tracken om patroon te zien | `measurement` | false (nu); later betaald | — |
| 3 | Ondersteuning/supplement | `supplement` | true | `affiliate_url` of `comparison_path` |
| 4-5 | Betaalde meting/dienst (later) | n.v.t. | true | `external_provider_label` + `external_provider_url` |

- Treden 1-3 vormen de verplichte "gratis-tot-ondersteuning"-trap; 4/5 zijn optioneel (zie `REQUIRED_TIERS` in [`src/lib/content/plan-content.ts`](../../src/lib/content/plan-content.ts)).
- **"Toon nu alleen gratis"** = de UI filtert op `tier = 1`. De rest van de trap staat klaar voor latere activatie zonder schemawijziging.
- Betaalde acties (tier 3-5, `is_paid = true`) tonen een disclosure-regel uit `disclaimers` via `paid_disclosure_key` (default `paid_action_default`).

---

## Matching: hoe een interventie verschijnt

Geïmplementeerd in [`src/lib/content/match-interventions.ts`](../../src/lib/content/match-interventions.ts).

Een interventie matcht als **minstens één trigger-groep** volledig klopt:

- Triggers met hetzelfde `group_id` worden **AND** gecombineerd.
- Verschillende `group_id`'s worden **OR** gecombineerd.
- Een interventie **zonder** triggers matcht altijd (generiek).

### Trigger-soorten (`kind`)

| `kind` | `field` | `operator` | Matcht op |
|---|---|---|---|
| `domain_below` | domein-score-key | (n.v.t.) | `score < value` |
| `domain_above` | domein-score-key | (n.v.t.) | `score > value` |
| `deficiency_signal` | signaal-key | (n.v.t.) | signaal is `true` |
| `profile_label` | (n.v.t.) | (n.v.t.) | profielnaam == `value` |
| `answer` | intake-vraag-id | `<=` `>=` `=` `in` | antwoordwaarde vs `value` |

**Context-velden** (bron: [`src/lib/intake-engine.ts`](../../src/lib/intake-engine.ts)):

- Domein-scores: `sleep_score`, `energy_score`, `stress_score`, `nutrition_score`, `movement_score`, `recovery_score`
- Deficiency-signalen: `omega3_deficiency`, `magnesium_signal`, `cortisol_risk`, `creatine_signal`, `melatonine_signal`, `protein_gap_signal`
- Profiellabels: `Onrustige Slaper`, `Stressdrager`, `Lage Batterij`, `In Balans` (Overtrainer is een patroon, zie [`PERSONALIZATION_ENGINE.md`](PERSONALIZATION_ENGINE.md))
- Vraag-id's: canonieke lijst in [`src/data/intake-questions.ts`](../../src/data/intake-questions.ts). Voorbeelden per thema: slaap `SLP_ONSET` (inslapen), `SLP_WAKE` (doorslapen), `SLP_QUAL`, `SLP_CONS`; stress `STR_FREQ`, `STR_RCV`; voeding `NUT_O3`, `NUT_PROT`; beweging `MOV_STR`, `MOV_CARD`, `MOV_FREQ`; herstel `REC_QUAL`.

### Selectie

- `pickTopPerTier` kiest per tier de interventie met de hoogste composite-score; oplopend gesorteerd op tier.
- `passesSafetyFilter` weert interventies met te lage veiligheidsscore.
- Geen DB-match → fallback naar `getSupplementRoute` (alleen een tier-3 supplement).

---

## Render-eisen (PLAN-scherm)

In [`getPlanContent`](../../src/lib/content/plan-content.ts):

1. Een thema is "PLAN-ready" als het voor `free_action`, `measurement` én `supplement` een interventie heeft **mét** een `published` `evidence_claims`-rij.
2. De trap rendert alleen als tier 1, 2 én 3 aanwezig zijn na matching.
3. Tier 1-3 **vereisen** een gepubliceerde claim; tier 4-5 mogen zonder claim renderen.
4. Niet-ready thema's vallen terug op alleen een supplement-suggestie.

Gevolg voor content: een interventie zonder gepubliceerde claim verschijnt **niet** in de volledige trap. Evidence is dus een harde voorwaarde, geen nice-to-have.

---

## Referentie-template: "slecht inslapen → magnesium (tier 3)"

Zo modelleer je een specifiek symptoom. **Geen nieuw thema** — thema blijft `sleep`, het symptoom wordt getarget via een `answer`-trigger op `SLP_ONSET` (inslapen).

| Laag | Inhoud |
|---|---|
| Thema | `sleep` (bestaat al) |
| HERKENNING | recognition_line `SLP_ONSET <= 2`: "Je ligt lang wakker voordat je in slaap valt." (bestaat al) |
| Tier 1 — `free_action` | "Inslaapritueel / wind-down" — trigger `answer SLP_ONSET <= 2` |
| Tier 2 — `measurement` | "Slaaplog 7 dagen" — zelfde trigger (toekomstig betaald via `is_paid`/`external_provider_*`) |
| Tier 3 — `supplement` | "Magnesium glycinaat" — `is_paid = true`, `comparison_path = '/beste/magnesium'`, zelfde trigger |
| Evidence | per interventie 1 `evidence_claims`-rij op `status = 'published'` met EFSA-conforme bewoording |
| UI nu | filter `tier = 1` → toont alleen het gratis inslaapritueel |

**Melatonine:** `approved-claims` status `forbidden` — geen affiliate, geen tier-3 interventie, geen `/beste/melatonine`. Hooguit informatief via `/supplementen/melatonine` en `/kennisbank/melatonine`.

**Belangrijk:** de werkelijke SQL-seed (interventie-rijen, triggers, claims) wordt pas geschreven nadat de EFSA-bewoording is goedgekeurd — dat is de copy-bron. Tot die tijd alleen dit model.

---

## Wat je NIET doet

- Geen apart thema per symptoom (granulariteit = triggers, niet themes).
- Geen tweede primaire CTA naast de trap (één pad; de engine bepaalt de volgorde).
- Geen affiliate/betaalde actie zonder disclosure-regel (`is_paid` → `paid_disclosure_key`).
- Geen tier 1-3 interventie zonder `published` evidence-claim (rendert anders niet).

---

*Laatst bijgewerkt: mei 2026*
