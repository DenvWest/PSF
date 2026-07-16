# Item-analyse — psychometrische baseline Leefstijlcheck

*Automatisch gegenereerd door `scripts/item-analyse.mjs` op 2026-07-16. Alleen aggregaten — geen individuele sessies, e-mails of namen. Scores zijn HERBEREKEND uit `answers` met de engine-formules van RULES_VERSION 1.3.x (pre-S3-bump); dit is de nulmeting voor de vóór/ná-vergelijking bij 1.4.0.*

> **Duiding staat onderaan** en wordt handmatig geschreven (niet door het script). Her-draaien overschrijft dit bestand inclusief de duiding-sectie — daarna opnieuw duiden.

**Totaal sessies:** 1

## N per rules_version-generatie

| rules_version | N | aandeel |
|---|---|---|
| `1.3.1` | 1 | 100.0% |

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

*Effectieve vloer per domein = normalizeScore(aantal_items, max) — bij optie-min 1 ligt de laagst mogelijke score dus boven 0. Sleep-min ≈ 27, energy/stress/movement-min ≈ 25, nutrition-min ≈ 29, recovery-min ≈ 33, connection-min ≈ 25. Dit is het kern-artefact dat S3 herschaalt.*

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

**Kernuitkomst: er is (nog) geen empirische baseline. De bereikbare database bevat exact 1 sessie.** Alle verdelings-, spreidings- en correlatiecijfers hierboven zijn daarmee betekenisloos als psychometrie (SD en alle correlaties zijn per definitie leeg bij N=1). Deze run legt daarmee géén nulmeting vast in de statistische zin — hij legt vast *dat* die nog niet bestaat, plus een gevalideerde meetpijplijn die klaarstaat.

Wat deze run wél oplevert:

1. **De meetpijplijn is gevalideerd (drift = 0/1).** De herberekening uit `answers` met de gerepliceerde 1.3.x-formules komt exact overeen met de opgeslagen `domain_scores` van de enige sessie. Dat bewijst dat `scripts/item-analyse.mjs` de engine-math correct spiegelt; zodra N groeit levert dezelfde run een betrouwbare baseline zonder codewijziging. Het bevestigt óók dat de opgeslagen scores niet gecorrumpeerd zijn.

2. **Het vloer-artefact is wiskundig bevestigd, niet empirisch.** Onafhankelijk van N: doordat `normalizeScore(sum, max) = round(sum/max·100)` op optie-minima van 1 werkt, is de laagst *mogelijke* domeinscore niet 0 maar 25–33 (sleep ≈ 27, energy/stress/movement ≈ 25, nutrition ≈ 29, recovery ≈ 33, connection ≈ 25). De enige sessie illustreert dit: vier items op de laagste optie (SLP_ONSET, STR_FREQ, CON_SOC, RCV_PHYS) leveren tóch domeinscores van 25–47, en de urgentie-drempel `< 30` is voor een meer-item-domein feitelijk onbereikbaar. Dit is precies het artefact dat S3 (herschaling naar `(waarde−1)/(max−1)·100`) moet wegnemen — en het is aantoonbaar uit de math, dus S3 mag hierop door zónder op data te wachten.

3. **Beslissing voor S3 (dwingend):** de voorwaardelijke instructie in het uitvoeringsplan ("gebruik S2-baseline-percentielen *indien voldoende data*; anders behoud `<30/<50/<60` en documenteer dat data-herijking later volgt") valt hard op de **else-tak**. Kalibreer de urgentie-drempels in S3 **niet** op deze data — N=1 tunen is overfitting op één persoon. S3 = theorie-/math-gedreven herschaling met behoud van de bestaande drempellogica; empirische herijking van drempels wordt een expliciet uitgesteld punt tot N ≥ ~100 per generatie. Draai dit script opnieuw vóór elke toekomstige drempel-heroverweging.

4. **Waarschuwing over de databron.** Dit script draait op de credentials uit `.env.local`; ik kan (en mag) niet verifiëren welk Supabase-project dat is. Twee mogelijkheden, beide relevant: (a) het is een dev/lokale database — draai dit dan opnieuw met de **productie**-env vóór S3 om de echte N te kennen; (b) het *is* productie — dan heeft de intake-funnel vrijwel geen voltooide sessies, wat een distributie-/verkeersignaal is dat losstaat van deze herziening maar strategisch zwaarder weegt dan welke scoring-tweak ook. Bevestig welke van de twee geldt voordat S3 begint.

5. **Klein schema-detail.** De opgeslagen `urgency_level` is een mensleesbaar label ("Een of twee domeinen vragen aandacht"), niet de enum-sleutel; de herberekende enum (`moderate`) mapt daarop. Geen probleem, maar relevant als je ooit op `urgency_level` filtert of groepeert — doe dat op de herberekende enum, niet op de opgeslagen labelstring.

**Actiepunt vóór S3:** bevestig de databron (punt 4). Zolang N ≈ 1 blijft, is elke empirische validatie uit de expertreview (§9.6: item-rest-correlaties, SLP_QUAL↔SLP_WAKE-overlap, test-hertest via hermeting) nog niet uitvoerbaar — die blijven open tot er verkeer is. S3 kan wél door op de math-gedreven fixes.
