# INTAKE SYSTEM — PerfectSupplement

> **Layer 2 — Systems.** Hoe de intake flow werkt.

---

## Vijf-fasen flow

```
Herkenning → Diagnose → Advies → Actie → Feedback
     ↑                                        |
     └────────────────────────────────────────┘
                   (elke 30 dagen)
```

### Fase 1 — Herkenning
Gebruiker selecteert symptomen. Opgeslagen als `symptom_profile` in Supabase.

### Fase 2 — Diagnose (de kern)
12 vragen, 6 categorieën, max 3 minuten. Resultaat: `domain_scores` per domein.

### Fase 3 — Advies (Herstelplan)
Geprioriteerde aanbeveling: eerst leefstijl ("quick wins"), dan supplementen. Persoonlijk, niet catalogus.

### Fase 4 — Actie
30-dagenplan: gewoonten + supplementen + herhaalmeting.

### Fase 5 — Feedback
Herhaalmeting na 30 dagen. Delta per domein. Aanbevelingen aanpassen.

---

## Vragenlijst (12 vragen, 6 categorieën)

### Slaap
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe voel je je als je wakker wordt?" | sleep_quality (SLP_QUAL) | 1-4 |
| "Lukt vast tijdstip slapen/wakker worden?" | sleep_consistency (SLP_CONS) | 1-3 |

### Energie
| Vraag | Variabele | Bereik |
|---|---|---|
| "Energieniveau overdag?" | energy_pattern (NRG_PATN) | 1-4 |
| "Waar leun je op voor energie?" | energy_dependency (NRG_DEP) | 1-4 |

### Stress
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe vaak gestrest of overprikkeld?" | stress_frequency (STR_FREQ) | 1-4 |
| "Hoe snel kom je tot rust?" | stress_recovery (STR_RECV) | 1-4 |

### Voeding
| Vraag | Variabele | Bereik |
|---|---|---|
| "Dagelijks eetpatroon?" | nutrition_quality (NUT_QUAL) | 1-4 |
| "Regelmatig vette vis?" | omega3_intake (NUT_O3) | 1-3 |

### Beweging
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe vaak intensief bewegen?" | movement_frequency (MOV_FREQ) | 1-4 |
| "Hoeveel bewegen buiten sport?" | daily_activity (MOV_DAILY) | 1-3 |

### Herstel
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe snel herstel na inspanning?" | physical_recovery (RCV_PHYS) | 1-3 |
| "Bewust momenten van rust?" | mental_recovery (RCV_MENT) | 1-3 |

---

## Scoring & Profiellabels

Scoring engine: `src/lib/intake-engine.ts`

### Urgentieniveaus

| Level | Conditie |
|---|---|
| critical | Laagste domein < 25 |
| moderate | Laagste domein 25-40 |
| mild | Laagste domein 40-60 |
| healthy | Alle domeinen > 60 |

### Profiellabels

| Profiel | Trigger | Primaire score |
|---|---|---|
| Onrustige Slaper | `sleep_score < 40` | sleep_score |
| Lage Batterij | `energy_score < 40` | energy_score |
| Stressdrager | `stress_score < 40` | stress_score |
| Stille Tekorten | `nutrition_score < 40` | nutrition_score |

**Prioriteit bij meerdere matches:** profiel met laagste genormaliseerde score wint. Bij gelijk: slaap > stress > energie > voeding > beweging > herstel.

---

## Beslislogica

Regelgebaseerd (fase 1). Geen AI/ML tot 500+ gebruikers.

### Supplementroute-logica
- Max 3 supplementen per profiel op resultatenpagina
- Aantal schaalt omlaag bij hogere totaalscore
- Elk supplement moet een bijbehorende vergelijkingspagina hebben
- Eiwitadvies verschijnt conditioneel, niet als supplement

---

## Zelflerend systeem (toekomst)

### Drie datasporen
1. **Inputs** — elke vragenlijst-invulling met tijdstempel
2. **Outputs** — elke aanbeveling gelogd
3. **Outcomes** — delta's bij herhaalmeting na 30 dagen

### Fasering
- **Fase 1 (nu):** Regelgebaseerd, handmatige regels
- **Fase 2 (500+ gebruikers):** Patroonherkenning, statistische analyse
- **Fase 3 (2000+ gebruikers):** Voorspellend model (decision tree / gradient boosting)

---

## UX principes

- Eén vraag per scherm op mobiel
- Voortgangsindicator: 6 categorieën (niet 12 vragen)
- Directe visuele feedback na elke categorie
- Geen vragen overslaan (systeem heeft alle data nodig)
- Totale invultijd: max 3 minuten

---

## Output-terminologie

| Term | Betekenis |
|---|---|
| Herstelplan | Persoonlijk adviesresultaat na vragenlijst |
| Quick Wins | Eerste 3 acties voor week 1 |
| Supplementroute | Geprioriteerde supplementsuggesties |
| Voortgangscheck | Herhaalmeting na 30 dagen |
| Delta-rapport | Verschil tussen twee metingen |

---

*Laatst bijgewerkt: mei 2026*
