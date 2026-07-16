# Item-analyse — psychometrische baseline Leefstijlcheck

*Automatisch gegenereerd door `scripts/item-analyse.mjs` op 2026-07-16. Alleen aggregaten — geen individuele sessies, e-mails of namen. Scores zijn HERBEREKEND uit `answers` regelset-bewust (< 1.4.0: sum/max; ≥ 1.4.0: item-herskalering). Drift-check vergelijkt herberekening met opgeslagen `domain_scores` per sessie.*

> **Duiding staat onderaan** en wordt handmatig geschreven (niet door het script). Her-draaien overschrijft dit bestand inclusief de duiding-sectie — daarna opnieuw duiden.

**Totaal sessies:** 2

## N per rules_version-generatie

| rules_version | N | aandeel |
|---|---|---|
| `1.4.0` | 1 | 50.0% |
| `1.3.1` | 1 | 50.0% |

---

## Generatie `1.4.0` — N = 1

> ⚠️ **Lage N (< 100).** Verdeling- en correlatiecijfers zijn indicatief, niet conclusief. Trek geen harde psychometrische conclusies; gebruik als richting, niet als bewijs.

### Item-statistiek (antwoordverdeling, spreiding, vloer/plafond)

| item | domein | N | gem. | SD | vloer% | plafond% | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|---|---|---|---|---|
| SLP_QUAL | sleep | 1 | 4.00 | — | 0.0% | 100.0% | 0 | 0 | 0 | 1 |
| SLP_CONS | sleep | 1 | 3.00 | — | 0.0% | 100.0% | 0 | 0 | 1 | 0 |
| SLP_ONSET | sleep | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| SLP_WAKE | sleep | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| NRG_PATN | energy | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| NRG_DEP | energy | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| STR_FREQ | stress | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| STR_RCV | stress | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| CON_SOC | connection | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| NUT_O3 | nutrition | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| NUT_PROT | nutrition | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| MOV_STR | movement | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| MOV_CARD | movement | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| RCV_PHYS | recovery | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| LIF_ALC | lifestyle | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| LIF_SUN | lifestyle | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |

*Vloer% = aandeel op laagste optie; plafond% = aandeel op hoogste optie. SD dicht bij 0 of hoge vloer/plafond = zwak discriminerend item.*

### Item-rest-correlatie (item vs. som overige domein-items)

| domein | item | N | r(item, rest) |
|---|---|---|---|
| sleep | SLP_QUAL | 1 | — |
| sleep | SLP_CONS | 1 | — |
| sleep | SLP_ONSET | 1 | — |
| sleep | SLP_WAKE | 1 | — |
| energy | NRG_PATN | 1 | — |
| energy | NRG_DEP | 1 | — |
| stress | STR_FREQ | 1 | — |
| stress | STR_RCV | 1 | — |
| nutrition | NUT_O3 | 1 | — |
| nutrition | NUT_PROT | 1 | — |
| movement | MOV_STR | 1 | — |
| movement | MOV_CARD | 1 | — |

*Vuistregel: r < 0,30 = item meet iets anders dan de rest van het domein; zeer hoge r (> 0,80) bij 2-item-domeinen kan redundantie zijn.*

### Inter-item-correlaties binnen slaap (SLP_QUAL↔SLP_WAKE-overlap)

| paar | N | r |
|---|---|---|
| SLP_QUAL ↔ SLP_CONS | 1 | — |
| SLP_QUAL ↔ SLP_ONSET | 1 | — |
| SLP_QUAL ↔ SLP_WAKE | 1 | — |
| SLP_CONS ↔ SLP_ONSET | 1 | — |
| SLP_CONS ↔ SLP_WAKE | 1 | — |
| SLP_ONSET ↔ SLP_WAKE | 1 | — |

### Domeinscore-verdeling (herberekend, 0–100)

| domein | N | gem. | SD | min | p10 | p25 | p50 | p75 | p90 | max |
|---|---|---|---|---|---|---|---|---|---|---|
| sleep | 1 | 75.0 | — | 75 | 75 | 75 | 75 | 75 | 75 | 75 |
| energy *(readout)* | 1 | 67.0 | — | 67 | 67 | 67 | 67 | 67 | 67 | 67 |
| stress | 1 | 34.0 | — | 34 | 34 | 34 | 34 | 34 | 34 | 34 |
| nutrition | 1 | 34.0 | — | 34 | 34 | 34 | 34 | 34 | 34 | 34 |
| movement | 1 | 33.0 | — | 33 | 33 | 33 | 33 | 33 | 33 | 33 |
| recovery *(readout)* | 1 | 0.0 | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| connection | 1 | 33.0 | — | 33 | 33 | 33 | 33 | 33 | 33 | 33 |

*1.4.0+: slechtste item = 0, domein = gemiddelde item-scores. Legacy (< 1.4.0) vloer-artefact: sleep-min ≈ 27, movement-min ≈ 25 — zie ITEM_ANALYSE_BASELINE duiding vóór S3.*

### Vitaliteitsscore-verdeling (gemiddelde 5 interventiedomeinen)

| N | gem. | SD | min | p10 | p25 | p50 | p75 | p90 | max |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 42.0 | — | 42 | 42 | 42 | 42 | 42 | 42 | 42 |

### Urgentie- en bandverdeling (herberekend)

| urgentieniveau | N | aandeel |
|---|---|---|
| critical | 0 | 0.0% |
| moderate | 1 | 100.0% |
| mild | 0 | 0.0% |
| healthy | 0 | 0.0% |

| vitaliteitsband | N | aandeel |
|---|---|---|
| Sterk | 0 | 0.0% |
| Voldoende | 0 | 0.0% |
| Aandacht | 1 | 100.0% |
| Prioriteit | 0 | 0.0% |

### Integriteit: herberekend vs. opgeslagen

- Sessies met vergelijkbare opgeslagen `domain_scores`: 1
- Waarvan een interventiedomein > 1 punt afwijkt van de herberekening: **0** (0.0%)
- Opgeslagen `urgency_level`-verdeling: Een of twee domeinen vragen aandacht=1

*Drift > 0 duidt op sessies gescoord onder een andere regelset dan hun `rules_version` suggereert, of op opslag onder een oudere engine. Relevant voor legacy-vergelijking bij hermeting.*

---

## Generatie `1.3.1` — N = 1

> ⚠️ **Lage N (< 100).** Verdeling- en correlatiecijfers zijn indicatief, niet conclusief. Trek geen harde psychometrische conclusies; gebruik als richting, niet als bewijs.

### Item-statistiek (antwoordverdeling, spreiding, vloer/plafond)

| item | domein | N | gem. | SD | vloer% | plafond% | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|---|---|---|---|---|
| SLP_QUAL | sleep | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| SLP_CONS | sleep | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| SLP_ONSET | sleep | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| SLP_WAKE | sleep | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| NRG_PATN | energy | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| NRG_DEP | energy | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| STR_FREQ | stress | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| STR_RCV | stress | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| CON_SOC | connection | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| NUT_O3 | nutrition | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| NUT_PROT | nutrition | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| MOV_STR | movement | 1 | 3.00 | — | 0.0% | 0.0% | 0 | 0 | 1 | 0 |
| MOV_CARD | movement | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| RCV_PHYS | recovery | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |
| LIF_ALC | lifestyle | 1 | 2.00 | — | 0.0% | 0.0% | 0 | 1 | 0 | 0 |
| LIF_SUN | lifestyle | 1 | 1.00 | — | 100.0% | 0.0% | 1 | 0 | 0 | 0 |

*Vloer% = aandeel op laagste optie; plafond% = aandeel op hoogste optie. SD dicht bij 0 of hoge vloer/plafond = zwak discriminerend item.*

### Item-rest-correlatie (item vs. som overige domein-items)

| domein | item | N | r(item, rest) |
|---|---|---|---|
| sleep | SLP_QUAL | 1 | — |
| sleep | SLP_CONS | 1 | — |
| sleep | SLP_ONSET | 1 | — |
| sleep | SLP_WAKE | 1 | — |
| energy | NRG_PATN | 1 | — |
| energy | NRG_DEP | 1 | — |
| stress | STR_FREQ | 1 | — |
| stress | STR_RCV | 1 | — |
| nutrition | NUT_O3 | 1 | — |
| nutrition | NUT_PROT | 1 | — |
| movement | MOV_STR | 1 | — |
| movement | MOV_CARD | 1 | — |

*Vuistregel: r < 0,30 = item meet iets anders dan de rest van het domein; zeer hoge r (> 0,80) bij 2-item-domeinen kan redundantie zijn.*

### Inter-item-correlaties binnen slaap (SLP_QUAL↔SLP_WAKE-overlap)

| paar | N | r |
|---|---|---|
| SLP_QUAL ↔ SLP_CONS | 1 | — |
| SLP_QUAL ↔ SLP_ONSET | 1 | — |
| SLP_QUAL ↔ SLP_WAKE | 1 | — |
| SLP_CONS ↔ SLP_ONSET | 1 | — |
| SLP_CONS ↔ SLP_WAKE | 1 | — |
| SLP_ONSET ↔ SLP_WAKE | 1 | — |

### Domeinscore-verdeling (herberekend, 0–100)

| domein | N | gem. | SD | min | p10 | p25 | p50 | p75 | p90 | max |
|---|---|---|---|---|---|---|---|---|---|---|
| sleep | 1 | 47.0 | — | 47 | 47 | 47 | 47 | 47 | 47 | 47 |
| energy *(readout)* | 1 | 63.0 | — | 63 | 63 | 63 | 63 | 63 | 63 | 63 |
| stress | 1 | 38.0 | — | 38 | 38 | 38 | 38 | 38 | 38 | 38 |
| nutrition | 1 | 57.0 | — | 57 | 57 | 57 | 57 | 57 | 57 | 57 |
| movement | 1 | 63.0 | — | 63 | 63 | 63 | 63 | 63 | 63 | 63 |
| recovery *(readout)* | 1 | 33.0 | — | 33 | 33 | 33 | 33 | 33 | 33 | 33 |
| connection | 1 | 25.0 | — | 25 | 25 | 25 | 25 | 25 | 25 | 25 |

*1.4.0+: slechtste item = 0, domein = gemiddelde item-scores. Legacy (< 1.4.0) vloer-artefact: sleep-min ≈ 27, movement-min ≈ 25 — zie ITEM_ANALYSE_BASELINE duiding vóór S3.*

### Vitaliteitsscore-verdeling (gemiddelde 5 interventiedomeinen)

| N | gem. | SD | min | p10 | p25 | p50 | p75 | p90 | max |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 46.0 | — | 46 | 46 | 46 | 46 | 46 | 46 | 46 |

### Urgentie- en bandverdeling (herberekend)

| urgentieniveau | N | aandeel |
|---|---|---|
| critical | 0 | 0.0% |
| moderate | 1 | 100.0% |
| mild | 0 | 0.0% |
| healthy | 0 | 0.0% |

| vitaliteitsband | N | aandeel |
|---|---|---|
| Sterk | 0 | 0.0% |
| Voldoende | 0 | 0.0% |
| Aandacht | 1 | 100.0% |
| Prioriteit | 0 | 0.0% |

### Integriteit: herberekend vs. opgeslagen

- Sessies met vergelijkbare opgeslagen `domain_scores`: 1
- Waarvan een interventiedomein > 1 punt afwijkt van de herberekening: **0** (0.0%)
- Opgeslagen `urgency_level`-verdeling: Een of twee domeinen vragen aandacht=1

*Drift > 0 duidt op sessies gescoord onder een andere regelset dan hun `rules_version` suggereert, of op opslag onder een oudere engine. Relevant voor legacy-vergelijking bij hermeting.*

---

## Duiding (handmatig — niet door het script gegenereerd)

<!-- DUIDING_PLACEHOLDER -->
_Nog in te vullen na deze run._
