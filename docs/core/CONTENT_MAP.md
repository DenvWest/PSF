# CONTENT MAP — PerfectSupplement

> **Layer 2 — Systems.** Canonieke routekaart voor content-generatie en interne links.
> **Niet handmatig dupliceren:** tellingen verversen met `npm run generate-state` → [`PROJECT_STATE.md`](../PROJECT_STATE.md).
> Historische Downloads-bestanden (`content-map.md`, `seo-content-strategie.md`) zijn **niet** bron — alleen dit bestand + `PROJECT_STATE.md`.

---

## URL-conventies (live)

| Type | Patroon | Voorbeeld |
|---|---|---|
| Vergelijking | `/beste/[slug]` | `/beste/magnesium` |
| Supplementgids | `/supplementen/[slug]` | `/supplementen/magnesium` |
| Pillar (leefstijl) | `/[slug]-na-40` of vaste slug | `/voeding-na-40` |
| Profiel | `/profiel/[slug]` | `/profiel/onrustige-slaper` |
| Blog | `/blog/[slug]` | `/blog/eiwit-na-40` |
| Kennisbank | `/kennisbank/[slug]` | `/kennisbank/cortisol` |
| Legacy vergelijking | `/beste-*` | → 301 naar `/beste/[slug]` via `next.config.ts` |
| Legacy thema-hub | `/thema/herstel` | → 301 naar `/herstel-verbeteren-na-40` (pillar) |
| Legacy thema-hub | `/thema/[overig]` | → 301 naar `/gids/[slug]` (catch-all) |

---

## Pillar pages (tier-1 leefstijl)

| Route | Status | Cluster | Primaire profielen |
|---|---|---|---|
| `/slaap-verbeteren-na-40` | ✅ Live | slaap | onrustige-slaper |
| `/stress-verminderen-man` | ✅ Live | stress | stressdrager |
| `/energie-na-40` | ✅ Live | energie | lage-batterij |
| `/herstel-verbeteren-na-40` | ✅ Live | herstel | overtrainer |
| `/testosteron-na-40` | ✅ Live | hormonen | stressdrager, lage-batterij, overtrainer |
| `/voeding-na-40` | ✅ Live | nutrition | lage-batterij |
| `/beweging-na-40` | ✅ Live | movement | lage-batterij, overtrainer |
| `/supplementen-mannen-40` | 💡 Gepland | commercial | — |

---

## Vergelijkingen (`/beste/*`)

| Slug | Gids | Affiliate | Opmerking |
|---|---|---|---|
| `magnesium` | `/supplementen/magnesium` | ✅ | |
| `omega-3-supplement` | `/supplementen/omega-3` | ✅ | |
| `ashwagandha` | `/supplementen/ashwagandha` | ✅ | |
| `vitamine-d` | `/supplementen/vitamine-d` | ✅ | |
| `creatine` | `/supplementen/creatine` | ✅ | |
| `zink` | `/supplementen/zink` | ✅ | |
| `eiwitpoeder` | `/supplementen/eiwitpoeder` | ✅ | |
| `melatonine` | — | ❌ | Geen `/beste/melatonine` (compliance); alleen `/supplementen/melatonine` |

---

## Profielen

| Slug | Label | Pillar(s) |
|---|---|---|
| `onrustige-slaper` | Onrustige Slaper | slaap |
| `stressdrager` | Stressdrager | stress, testosteron |
| `lage-batterij` | Lage Batterij | energie, voeding, beweging |
| `overtrainer` | Overtrainer | herstel, beweging |

Geannuleerde labels (niet gebruiken): Stille Slijter, Basis Mist, In Balans (alleen als engine-fallback).

---

## PLAN-journey thema's

| Theme slug | Pillar | DB interventies |
|---|---|---|
| `sleep` | `/slaap-verbeteren-na-40` | ✅ `20260529180000_evidence_sleep_plan.sql` |
| `stress` | `/stress-verminderen-man` | ✅ |
| `nutrition` | `/voeding-na-40` | ✅ `20260529220000_evidence_stress_nutrition_movement.sql` |
| `movement` | `/beweging-na-40` | ✅ idem |

---

## Supplementgidsen (`/supplementen/*`)

Zie `src/data/supplement-guides/index.ts` — 8 gidsen. Kwaliteitsdrempel: 1200–2000 woorden + FAQ; audit in [`CONTENT_GAPS.md`](CONTENT_GAPS.md).

---

## Onderhoud

1. Na nieuwe route: rij toevoegen in dit bestand + `PAGE_ROADMAP.md`.
2. `npm run generate-state` draaien.
3. Checklist in `CONTENT_GAPS.md` afvinken.

*Laatst bijgewerkt: juni 2026*
