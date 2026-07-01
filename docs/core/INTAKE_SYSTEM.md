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
15 vragen, 7 categorieën, max 3–4 minuten. Resultaat: `domain_scores` per domein.

### Fase 3 — Advies (Herstelplan)
Geprioriteerde aanbeveling: eerst leefstijl ("quick wins"), dan supplementen. Persoonlijk, niet catalogus.

### Fase 4 — Actie
30-dagenplan: gewoonten + supplementen + herhaalmeting.

### Fase 5 — Feedback
Herhaalmeting na 30 dagen. Delta per domein. Aanbevelingen aanpassen. Sessies worden gelabeld met `rules_version` voor latere delta-analyse over regelset-wijzigingen.

---

## Vragenlijst (15 vragen, 7 categorieën)

### Slaap
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe voel je je als je wakker wordt?" | sleep_quality (SLP_QUAL) | 1-4 |
| "Lukt vast tijdstip slapen/wakker worden?" | sleep_consistency (SLP_CONS) | 1-3 |
| "Hoe lang duurt inslapen?" | sleep_onset (SLP_ONSET) | 1-4 |
| "Word je 's nachts wakker?" | sleep_wake (SLP_WAKE) | 1-4 |

### Energie
| Vraag | Variabele | Bereik |
|---|---|---|
| "Energieniveau overdag?" | energy_pattern (NRG_PATN) | 1-4 |
| "Waar leun je op voor energie?" | energy_dependency (NRG_DEP) | 1-4 |

### Stress
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe vaak gestrest of overprikkeld?" | stress_frequency (STR_FREQ) | 1-4 |
| "Rust komen en herstelmomenten op drukke dagen?" | stress_recovery (STR_RCV) | 1-4 |

### Voeding
| Vraag | Variabele | Bereik |
|---|---|---|
| "Regelmatig vette vis?" | omega3_intake (NUT_O3) | 1-3 |
| "Eiwitrijke producten per dag?" | protein_intake (NUT_PROT) | 1-4 |

### Beweging
| Vraag | Variabele | Bereik |
|---|---|---|
| "Kracht- of weerstandstraining?" | strength_training (MOV_STR) | 1-4 |
| "Cardio of intensieve sport?" | cardio_frequency (MOV_CARD) | 1-4 |

### Herstel
| Vraag | Variabele | Bereik |
|---|---|---|
| "Hoe snel herstel na inspanning?" | physical_recovery (RCV_PHYS) | 1-3 |

`STR_RCV` telt ook mee in `stress_score` (stress-categorie).

### Leefstijl (geen domeinscore)
| Vraag | Variabele | Bereik |
|---|---|---|
| "3+ glazen alcohol op één avond?" | alcohol_frequency (LIF_ALC) | 1-4 |
| "Zon en buitenlicht?" | sun_exposure (LIF_SUN) | 1-4 |

`LIF_ALC` en `LIF_SUN` sturen signalen en advies, maar tellen niet mee in `domain_scores`.

---

## Scoring & Profiellabels

Scoring engine: `src/lib/intake-engine.ts`

### Domein-maxima (genormaliseerd naar 0–100)

| Domein | Som | Max |
|---|---|---|
| slaap | SLP_QUAL + SLP_CONS + SLP_ONSET + SLP_WAKE | 15 |
| energie | NRG_PATN + NRG_DEP | 8 |
| stress | STR_FREQ + STR_RCV | 8 |
| voeding | NUT_O3 + NUT_PROT | 7 |
| beweging | MOV_STR + MOV_CARD | 8 |
| herstel | RCV_PHYS | 3 |

`STR_RCV` telt **niet** mee in `recovery_score` — alleen in `stress_score` (juli 2026 scoringfix).

### Urgentieniveaus

Berekend op **interventiedomeinen** (slaap, stress, voeding, beweging). Energie en herstel sturen urgentie niet.

| Level | Conditie |
|---|---|
| critical | 2+ domeinen < 30 |
| moderate | 1 domein < 30 of 3+ domeinen < 50 |
| mild | alle > 30 en 2+ onder 60 |
| healthy | alle domeinen > 60 |

### Profiellabels

| Profiel | Trigger | Primaire score |
|---|---|---|
| Onrustige Slaper | `sleep_score < 40` | sleep_score |
| Stressdrager | `stress_score < 40` | stress_score |
| Lage Batterij | `energy_score < 40` of `movement_score < 35` | energy_score / movement_score |
| In Balans | Alle domeinen ≥ 40 | hoogste domein |

**Prioriteit bij meerdere matches:** slaap > stress > energie/beweging. Nutrition en recovery hebben geen eigen profiellabel.

**Overtrainer-patroon:** Geen apart profiellabel in de engine. Het patroon (`max(MOV_CARD, MOV_STR) ≥ 3` EN `RCV_PHYS ≤ 1`) wordt herkend in `getSupplementRoute` en op de resultatenpagina. Er bestaat een `/profiel/overtrainer` pagina.

### Supplement-signalen (selectie)

| Signaal | Trigger (indicatief) |
|---|---|
| melatonine_signal | SLP_ONSET ≤ 2 en STR_FREQ ≥ 3 |
| magnesium_signal | SLP_WAKE ≤ 2 of (SLP_QUAL ≤ 2 en STR_RCV ≤ 2) |
| creatine_signal | hoge trainingsbelasting + laag herstel |
| protein_gap_signal | NUT_PROT ≤ 2 én (bewegingsbelasting ≥ 2 of RCV_PHYS ≤ 1 of overtrainer-patroon) |

---

## Beslislogica

Regelgebaseerd (fase 1). Geen AI/ML tot 500+ gebruikers.

### Supplementroute-logica
- Max 3 supplementen per profiel op resultatenpagina
- Aantal schaalt omlaag bij hogere totaalscore
- Elk supplement moet een bijbehorende vergelijkingspagina of gidspagina hebben
- Eiwit uit voeding eerst (quick wins + callout bij NUT_PROT ≤ 2); eiwitpoeder alleen als vergelijkingslink op resultaten + hub “Aanbevolen voor jou” bij `protein_gap_signal`, niet in de max-3 supplementroute

---

## UX principes

- Eén vraag per scherm op mobiel
- Voortgangsindicator: 15 vragen
- Directe visuele feedback na elke categorie
- Geen vragen overslaan (systeem heeft alle data nodig)
- Totale invultijd: max 3–4 minuten

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
