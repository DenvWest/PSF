# Kritische wetenschappelijke evaluatie: domeinen Energie en Herstel

**Datum:** juli 2026  
**Scope:** Leefstijlcheck (15 hoofdvragen), scoring-engine, dashboard-presentatie  
**Status:** onafhankelijke evaluatie — niet gebonden aan bestaande productkeuzes

---

## Samenvatting

Energie en Herstel zijn **geen zelfstandige leefstijldomeinen** in internationale leefstijlmodellen (MEDLIFE, WHO 24-uurs, Positieve Gezondheid, SDT). Ze functioneren wetenschappelijk beter als **ervaren uitkomstmaten (readouts)** die voortkomen uit gedragsdomeinen: slaap, stress, voeding en beweging.

De huidige applicatie bevat al een intern readout-model (`domain-role.ts`), maar de scoring-engine behandelt energie en herstel nog als volwaardige domeinen. Daarnaast telt `STR_RCV` dubbel mee in stress- én herstelscore — een constructvaliditeitsprobleem.

### Eindadvies: optie 7 — wetenschappelijk beter onderbouwde tweelaags structuur

1. **Vier interventiedomeinen:** slaap, stress, voeding, beweging  
2. **Twee rapportdomeinen:** energie, herstel (ervaren uitkomst)  
3. **Scoringfix:** herstelscore alleen op `RCV_PHYS`; `STR_RCV` uitsluitend bij stress  
4. **Prioritering/urgentie:** alleen interventiedomeinen sturen hefboom en urgentie  
5. **Behoud** vragen NRG_* en RCV_PHYS als nuttige readout-indicatoren

---

## 1. Zijn Energie en Herstel wetenschappelijk erkende leefstijldomeinen?

### Energie

**Conclusie:** Zelden als zelfstandig domein; vrijwel altijd als **uitkomstmaat**.

| Context | Voorkomen | Rol |
|---------|-----------|-----|
| MEDLIFE / mediterrane leefstijl | Niet als label | — |
| WHO 24-uursrichtlijnen | Niet | Bewegen, zitten, slapen |
| Positieve Gezondheid (Huber) | Onder lichaamsfuncties / kwaliteit van leven | Uitkomst |
| Gezondheidsbevordering | Vitaliteit, fatigue, SF-36 Vitality | Uitkomst |
| SDT (Deci & Ryan) | Subjective Vitality Scale | Psychologisch functioneren |

**Sterkte bewijs:** ★★★★★ voor “energie als uitkomst”; ★★☆☆☆ voor “energie als zelfstandig gedragsdomein”.

### Herstel

**Conclusie:** In leefstijlliteratuur verschijnt **rust/slaap/belastingsbalans**; in sportwetenschap **perceived recovery** na inspanning. Niet als parallel domein naast slaap, stress en beweging.

| Context | Terminologie | Rol |
|---------|--------------|-----|
| MEDLIFE blok 3 | Rust, slaap (6–8 uur), siësta | Gedrag/ritme |
| WHO / 24-uurs | Slaap, herstel als functie van slaap | Gedrag + uitkomst |
| Sportwetenschap | REST-Q, perceived recovery | Uitkomst na belasting |
| Leefstijlcoaching | Ontspanning, herstelmomenten | Onderdeel van stress/slaap |

**Sterkte bewijs:** ★★★★☆ voor herstel als uitkomst van belasting + rust; ★★☆☆☆ als zelfstandig leefstijldomein.

---

## 2. Zijn Energie en Herstel meetbare constructen?

### Gevalideerde instrumenten (literatuur)

| Instrument | Meet | Validatie |
|------------|------|-----------|
| Subjective Vitality Scale (SVS) | Energie/aliveness (SDT) | CFA, convergent validity (Ryan & Deci, 2000) |
| SF-36 Vitality subscale | Energie vs. vermoeidheid | Breed gebruikt, OMERACT-endorsed |
| FACIT-Fatigue | Ervaren vermoeidheid | Systematic review measurement properties 2025 |
| POMS energy/fatigue | Stemming-energie | Meta-analyses op trainingseffecten |
| Integrative Vitality Scale (2024) | Fysiek + psychologisch vitaliteit | IVS validatiestudie |

### Onze vragen

| Vraag | Proxy voor | Gevalideerd? |
|-------|------------|--------------|
| NRG_PATN | Ervaren dagenergie | Nee — ad-hoc self-report |
| NRG_DEP | Compensatiegedrag (cafeïne/suiker/alcohol) | Deels gedragsindicator |
| RCV_PHYS | Perceived physical recovery | Nee — enkelvoudige item-proxy |
| STR_RCV (in herstelscore) | Psychosociaal herstel | Hoort bij stress, niet bij fysiek herstel |

**Consensus:** Gevalideerde schalen meten **uitkomsten**, niet “energie-domein” of “herstel-domein” als gedragsconstruct.

**Sterkte bewijs:** ★★★★★ voor bestaan van gevalideerde uitkomstmaten; ★★☆☆☆ voor onze ad-hoc items als domeinschaal.

---

## 3. Gedrag, determinant of uitkomst?

| Element | Classificatie |
|---------|---------------|
| NRG_PATN | Subjectieve ervaring / uitkomst |
| NRG_DEP | Deels gedrag (compensatie), deels uitkomst-indicator |
| RCV_PHYS | Subjectieve uitkomst (herstelbeleving na belasting) |
| STR_RCV | Psychosociale herstelcapaciteit → mediator onder stress |

**Kritische analyse:** Energie en herstel zijn **geen zuivere leefstijlgedragingen** zoals “2× per week krachttraining” of “vette vis eten”. Ze zijn **samenvattende ervaringen** die voortkomen uit meerdere gedragsdomeinen.

Logischer model:

```
Slaap + Voeding + Beweging + Stress → Energie (readout)
Slaap + Beweging + Stress + Belasting → Herstel (readout)
```

**Sterkte bewijs:** ★★★★☆

---

## 4. Mediterrane leefstijl

MEDLIFE (Sotos-Prieto et al., 2015) heeft drie blokken:

1. Voedingsconsumptie (15 items)  
2. Mediterrane eetgewoonten (7 items)  
3. **Fysieke activiteit, rust en sociale gewoonten** (6 items)

Blok 3 bevat: matig-intensieve beweging, weekenddutje, 6–8 uur slaap, beperkt tv-kijken, sociaal uitgaan, collectieve sport. **Geen “energie” of “herstel” als term.**

Concepten die wél terugkomen: slaap, rust, beweging, sociale verbondenheid, convivialiteit.

**Sterkte bewijs:** ★★★★★ (MEDLIFE development + systematic review Nutrients 2022)

---

## 5. Self-Determination Theory

SDT onderscheidt **basisbehoeften** (autonomie, competentie, verbondenheid) van **uitkomsten** zoals subjective vitality.

- Vitaliteit/energie = indicator van **psychologisch functioneren** wanneer basisbehoeften (deels) vervuld zijn  
- Geen vierde basisbehoefte “energie”  
- Herstel = geen SDT-construct; wel gerelateerd aan autonome motivatie voor duurzaam gedrag

Meta-analyse SDT-interventies (Ntoumanis et al., 2021): effecten op motivatie en gedrag, niet op “energie” als apart domein.

**Sterkte bewijs:** ★★★★★ voor SDT-raamwerk; ★★☆☆☆ voor energie/herstel als SDT-domeinen

---

## 6. Geschiktheid voor leefstijlcheck

| Criterium | Energie | Herstel |
|-----------|---------|---------|
| Face validity | Hoog — herkenbaar | Hoog — herkenbaar |
| Construct validity als domein | Laag–matig | Laag–matig |
| Construct validity als readout | Matig–goed | Matig |
| Inhoudsvaliditeit | Redelijk met driver-mapping | Redelijk na scoringfix |
| Praktische toepasbaarheid | Goed | Goed |
| Wetenschappelijke verdedigbaarheid | Alleen als uitkomst | Alleen als uitkomst |

---

## Kritische vergelijking met modellen

| Model | Domeinen | Energie/Herstel als domein? |
|-------|----------|----------------------------|
| MEDLIFE | Voeding, gewoonten, PA/rust/sociaal | Nee |
| WHO 24h | Bewegen, zitten, slapen | Nee |
| Positieve Gezondheid | 6 levensdimensies | Nee (onder lichaam/kwaliteit leven) |
| SDT | Autonomie, competentie, verbondenheid | Nee (vitaliteit = uitkomst) |
| Blue Zones | Bewegen, purpose, downshift, plant-slant diet, wine, belonging | Nee |
| PerfectSupplement (voor wijziging) | 6 gelijke pijlers | Ja — inconsistent met intern readout-model |

**Overal terugkerende domeinen:** voeding, beweging, slaap/rust, stress/mentale belasting, sociale verbinding.  
**Zelden als domein:** energie, herstel (als label).

---

## Voor- en nadelen huidige opzet

### Voordelen behoud readout-labels

- Hoge herkenbaarheid bij gebruikers (“Lage Batterij”, herstel na training)  
- Nuttige samenvatting van multi-domein effect  
- Sluit aan bij productcopy en nurture-flows

### Nadelen huidige opzet

- Gelijkwaardige 6-pijler-presentatie suggereert gelijkwaardige wetenschappelijke status  
- Dubbeltelling STR_RCV ondermijnt betrouwbaarheid  
- Urgentie op basis van 6 domeinen kan readout-artefacten versterken  
- Vitality-score sluit energie al uit — interne inconsistentie

---

## Alternatieven (onderbouwd)

| Alternatief | Onderbouwing | Aanbeveling |
|-------------|--------------|-------------|
| Beide als uitkomstmaten (readout) | MEDLIFE, SF-36, SDT-SVS | **Aanbevolen** |
| Energie in vitaliteit, herstel bij slaap/beweging | 24-uurs kader | Deels — herstel readout behouden |
| Samenvoegen energie + herstel | Beide uitkomsten | Niet aanbevolen — verschillende drivers |
| Verwijderen beide | Strikt gedragsmodel | Niet aanbevolen — face validity te hoog |
| Status quo (6 gelijke domeinen) | Geen sterke literatuursteun | **Niet aanbevolen** |

---

## Geïmplementeerde wijzigingen (juli 2026)

1. `recovery_score` = alleen `RCV_PHYS` (max 3)  
2. `getUrgency()` = alleen interventiedomeinen  
3. `derivePriority()` = interventiedomeinen bovenaan ladder, readouts onderaan  
4. UI: readout-pijlers gelabeld als “Rapport”  
5. Onderbouwing-pagina: sectie interventie vs. rapport

---

## Referenties (APA, selectie)

1. Bull, F. C., et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. *British Journal of Sports Medicine*, 54(24), 1451–1462. https://doi.org/10.1136/bjsports-2020-102955 (PMID: 33239350)

2. Canadian Society for Exercise Physiology. (2020). *Canadian 24-Hour Movement Guidelines for Adults aged 18–64 years*.

3. Dinu, M., et al. (2018). Mediterranean diet and multiple health outcomes: An umbrella review. *European Journal of Clinical Nutrition*, 72(1), 30–43. https://doi.org/10.1038/ejcn.2017.58 (PMID: 28488692)

4. Huber, M., et al. (2016). Towards a 'patient-centred' operationalisation of the new dynamic concept of health. *BMJ Open*, 6(1), e010091. https://doi.org/10.1136/bmjopen-2015-010091

5. Ntoumanis, N., et al. (2021). A meta-analysis of self-determination theory-informed intervention studies in the health domain. *Health Psychology Review*, 15(1), 110–130. https://doi.org/10.1080/17437199.2020.1718529 (PMID: 32064938)

6. Puetz, T. W., et al. (2022). The effect of chronic exercise on energy and fatigue states: A systematic review and meta-analysis of randomized trials. *Frontiers in Psychology*, 13, 907637. https://doi.org/10.3389/fpsyg.2022.907637

7. Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation. *American Psychologist*, 55(1), 68–78. https://doi.org/10.1037/0003-066X.55.1.68 (PMID: 11392867)

8. Ryan, R. M., & Deci, E. L. (2008). Self-determination theory and the role of basic psychological needs in personality and the organization of behavior. *Canadian Psychology*, 49(3), 182–185. https://doi.org/10.1037/a0012801

9. Sotos-Prieto, M., et al. (2015). Design and development of an instrument to measure overall lifestyle habits: the MEDLIFE index. *Public Health Nutrition*, 18(5), 690–701. https://doi.org/10.1017/S1368980014001360

10. Stansfeld, S. A., et al. (1997). Social support and psychiatric sickness absence. *Psychological Medicine*, 27(1), 35–48.

11. Tremblay, M. S., et al. (2020). Timing of 24-hour movement behaviours: implications for practice. *Health Promotion and Chronic Disease Prevention in Canada*, 42(4), 105–108.

12. Umberson, D., & Montez, J. K. (2010). Social relationships and health: A flashpoint for health policy. *Journal of Health and Social Behavior*, 51(S), S54–S66. https://doi.org/10.1177/0022146510383501 (PMID: 20943583)

13. Vitale, J. A., et al. (2022). Assessment strategies to evaluate the Mediterranean lifestyle: A systematic review. *Nutrients*, 14(19), 4179. https://doi.org/10.3390/nu14194179

14. Ware, J. E., & Sherbourne, C. D. (1992). The MOS 36-item short-form health survey (SF-36). *Medical Care*, 30(6), 473–483.

15. Deci, E. L., & Ryan, R. M. (2008). Facilitating optimal motivation and psychological well-being across life's domains. *Canadian Psychology*, 49(1), 14–23.

16. Kellmann, M., & Kallus, K. W. (2001). *Recovery-Stress Questionnaire: User manual*. Human Kinetics.

17. Lally, P., et al. (2010). How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology*, 40(6), 998–1009. https://doi.org/10.1002/ejsp.674

18. Michie, S., et al. (2013). The behavior change technique taxonomy (v1). *Annals of Behavioral Medicine*, 46(1), 81–95. https://doi.org/10.1007/s12160-013-9486-6 (PMID: 23512568)

19. O'Connor, P. J. (2004). Evaluation of four highly purified diets on mood states. *Physiology & Behavior*, 82(2–3), 371–377.

20. Panossian, A., & Wikman, G. (2010). Effects of adaptogens on the central nervous system and the molecular mechanisms associated with their stress-protective activity. *Pharmaceuticals*, 3(1), 188–224.

21. Riemann, D., et al. (2017). European guideline for the diagnosis and treatment of insomnia. *Journal of Sleep Research*, 26(6), 675–700.

22. Schuch, F. B., et al. (2018). Exercise and severe major depression: A meta-analysis. *Journal of Psychiatric Research*, 100, 7–13.

23. Watson, N. F., et al. (2015). Recommended amount of sleep for a healthy adult: A joint consensus statement. *Sleep*, 38(6), 843–844. https://doi.org/10.5665/sleep.4716 (PMID: 25979105)

24. World Health Organization. (2022). *Guidelines on mental health at work*. WHO.

25. Zhang, Y., et al. (2024). Development and validation of the Integrative Vitality Scale. *Frontiers in Public Health*, 12, 1452068. https://doi.org/10.3389/fpubh.2024.1452068

---

## Expliciet eindadvies

**Gekozen conclusie: optie 7** — een wetenschappelijk beter onderbouwde tweelaags structuur:

- Interventiedomeinen (gedrag): slaap, stress, voeding, beweging  
- Rapportdomeinen (uitkomst): energie, herstel  

Dit is verdedigbaarder dan optie 1 (beide als volwaardige domeinen) en praktischer dan optie 6 (verwijderen).
