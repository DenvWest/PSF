# PERSONALIZATION ENGINE — PerfectSupplement

> **Layer 2 — Systems.** Profiel-architectuur, scoring triggers, spinnenweb per profiel.

---

## 7 profielen

| Profiel | Slug | Trigger | Status |
|---|---|---|---|
| Onrustige Slaper | `onrustige-slaper` | `sleep_score < 40` | ✅ Live |
| Lage Batterij | `lage-batterij` | `energy_score < 40` | ✏️ Gepland |
| Stressdrager | `stressdrager` | `stress_score < 40` | ✏️ Gepland |
| Stille Tekorten | `stille-tekorten` | `nutrition_score < 40` | ✏️ Gepland |
| Stilzitter | `stilzitter` | `movement_score < 35` | ✏️ Gepland |
| Stille Slijter | `stille-slijter` | `recovery_score < 35` (zonder hoge movement) | ✏️ Gepland |
| Overtrainer | `overtrainer` | `movement_frequency ≥ 3 EN recovery_score ≤ 35` | ✏️ Gepland |

**Let op profielnaam-wijzigingen:** "Basis Mist" → "Stille Tekorten", "Overtrainer" → "Stilzitter" in productie. De oude namen staan nog in sommige docs/data.

**Prioriteit bij meerdere matches:** laagste genormaliseerde score wint. Bij gelijk: slaap > stress > energie > voeding > beweging > herstel.

---

## Wat een compleet profiel omvat (7 onderdelen)

| # | Onderdeel | Locatie |
|---|---|---|
| 1 | Profielpagina | `src/app/profiel/[slug]/page.tsx` |
| 2 | Profieldata | `src/data/profiles.ts` |
| 3 | Scoring trigger | `src/lib/intake-engine.ts` |
| 4 | Intake-resultaat koppeling | `src/components/intake/IntakeResults.tsx` |
| 5 | Nurture email personalisatie | `src/lib/emails/` |
| 6 | PDF-gids (optioneel) | `public/downloads/` |
| 7 | Content-spinnenweb | Pillar + blogs + vergelijkingen + kennisbank |

---

## Profielpagina — 8-sectie structuur

1. **Hero** — H1: "[Profielnaam]: [Herkenningsvraag]", 2 zinnen, CTA → /intake
2. **Herkenning** — "Ken je dit?" 4-5 situaties (dagelijks, niet medisch)
3. **Biologische verklaring** — 300 woorden, warm, kennisbank-links inline
4. **Quick wins + supplementen** — 3 concrete acties + max 2 supplementen met turbo-snippet
5. **4-weken plan** — week 1: quick wins, week 2-3: leefstijl, week 4: herhaalmeting
6. **CTA blok** — "Ontdek Jouw Profiel" → /intake
7. **Cross-links** — pillar, vergelijking(en), gerelateerd profiel
8. **Disclaimer** — MedicalDisclaimer + profiel-specifiek

---

## Profiel-specifieke disclaimers

| Profiel | Extra disclaimer |
|---|---|
| Onrustige Slaper | Slaapapneu: "Bij snurken + overgewicht + extreme vermoeidheid → huisarts" |
| Stille Tekorten | Bloedonderzoek: "Laat vitamine D, B12 en ijzer prikken" |
| Stilzitter | Pre-exercise: "Begin rustig, overleg bij hartklachten" |
| Stressdrager | GGZ: "Bij langdurige somberheid of burn-out → professionele hulp" |
| Lage Batterij | Schildklier: "Chronische vermoeidheid kan schildklier-gerelateerd zijn" |
| Overtrainer | Rust: "Meer trainen is niet de oplossing" |

---

## Spinnenweb per profiel

```
                    Pillar page
                   ↗           ↖
        Profiel ←→ Vergelijking(en)
                   ↘           ↗
                   Cluster-blogs
                        ↕
                   Kennisbank-termen
                        ↕
                      /intake
```

### Link-tabel per profiel

| Richting | Wat | Waar |
|---|---|---|
| Profiel → Pillar | Turbo-snippet in sectie 7 | Cross-links |
| Pillar → Profiel | Turbo-snippet in pillar | Profiel-herkenning sectie |
| Profiel → Vergelijking | In sectie 4 (supplementen) | Quick wins |
| Vergelijking → Profiel | "Past bij profiel X" blok | Onderaan vergelijking |
| Profiel → Intake | CTA in sectie 1 + 6 | Hero + CTA blok |
| Intake → Profiel | Profiellabel in resultaten | IntakeResults |
| Nurture → Profiel | Profiel-specifieke content | Email templates |

---

## Data-structuur (ProfilePage interface)

```typescript
export interface ProfilePage {
  slug: string
  label: string
  trigger: string
  heroTitle: string
  heroSubtitle: string
  targetKeyword: string
  metaTitle: string            // max 60 chars
  metaDescription: string      // max 155 chars
  recognitionPoints: string[]  // "Ken je dit?" bullets
  explanation: string
  quickWins: string[]          // 3 concrete acties
  supplements: {
    name: string
    reason: string
    comparisonUrl: string
  }[]
  relatedPillar: string
  relatedComparisons: string[]
  relatedProfile: string
  disclaimer: string
}
```

---

## Invultemplate per nieuw profiel

```
### Profiel: [NAAM]

**Slug:** [slug]
**Trigger:** [scoring conditie]
**Target keyword:** [SEO zoekwoord]

**H1:** [Profielnaam: Herkenningsvraag]
**Meta title:** [max 60 chars]
**Meta description:** [max 155 chars]

**Herkenning (5 bullets):**
1. [dagelijkse situatie]
2-5. [...]

**Quick wins (3 stuks):**
1-3. [concrete actie]

**Supplementen (max 2):**
1. [naam] → [vergelijkingspagina URL] — [waarom]

**Pillar link:** [URL]
**Vergelijking links:** [URLs]
**Overlap-profiel:** [welk profiel]
**Disclaimer:** [profiel-specifieke waarschuwing]
**PDF-gids:** [ja/nee]
```

---

## Review-checklist (na alle profielen)

### Per profiel
- [ ] 8 secties compleet?
- [ ] Scoring trigger correct in intake-engine?
- [ ] Profiellabel correct in intake-resultaten?
- [ ] Nurture emails personaliseren correct?
- [ ] Min. 1 pillar + 1 vergelijking linken naar profiel?
- [ ] MedicalDisclaimer + profiel-specifiek?
- [ ] Structured data correct?

### Cross-profiel
- [ ] Geen twee profielen met dezelfde trigger?
- [ ] Supplementroute verschilt per profiel?
- [ ] Quick wins uniek per profiel?
- [ ] Alle profielen bereikbaar via intake-resultaten?

---

*Laatst bijgewerkt: mei 2026*
