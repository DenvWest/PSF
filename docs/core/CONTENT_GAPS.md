# CONTENT GAPS — PerfectSupplement

> Voor de actuele lijst van bestaande pagina's: zie docs/PROJECT_STATE.md.

> **Layer 3 — Work.** Wat ontbreekt in het spinnenweb. Update na elke sprint.

---

## Link-gaps (pagina's die beter gelinkt moeten worden)

| Pagina | Moet gelinkt worden vanuit |
|---|---|
| `/herstel-verbeteren-na-40` | Homepage, relevante blogs, `/thema/herstel` |
| `/beste-zink` | Relevante blogs, profiel-pagina's |
| `/beste/creatine` | Relevante blogs, profiel overtrainer |
| `/beste-melatonine` | Slaap-blogs, profiel onrustige-slaper, pillar slaap |
| `/beste-eiwitpoeder` | Energie-blogs, profiel overtrainer, pillar herstel |
| `/beste-vitamine-d` | Energie-blogs, profiel lage-batterij |

---

## Cluster-blogs die het spinnenweb versterken

| Blog (idee) | Verbindt | Impact |
|---|---|---|
| `/blog/cortisol-en-testosteron` | toekomstig pillar testosteron ↔ pillar stress ↔ ashwagandha | **Hoog** — cross-cluster brug, voorbereiding testosteron-pillar |
| `/blog/creatine-en-herstel` | pillar herstel ↔ creatine vergelijking ↔ profiel overtrainer | **Hoog** — verbindt 3 live pagina's |
| `/blog/vitamine-d-en-energie` | pillar energie ↔ vitamine-d vergelijking ↔ profiel lage-batterij | **Hoog** — verbindt 3 live pagina's |
| `/blog/zink-en-testosteron` | toekomstig pillar testosteron ↔ zink vergelijking | Midden |
| `/blog/omega-3-en-herstel` | pillar herstel ↔ omega-3 vergelijking ↔ profiel overtrainer | Midden |
| `/blog/melatonine-en-slaap` | pillar slaap ↔ melatonine vergelijking ↔ profiel onrustige-slaper | Midden |

---

## Profielpagina link-targets

| Profiel | Status | Pillar link | Vergelijking link(s) |
|---|---|---|---|
| Onrustige Slaper | ✅ | `/slaap-verbeteren-na-40` ✅ | `/beste-magnesium` ✅, `/beste-ashwagandha` ✅ |
| Stressdrager | ✅ | `/stress-verminderen-man` ✅ | `/beste-ashwagandha` ✅, `/beste-magnesium` ✅ |
| Lage Batterij | ✅ | `/energie-na-40` ✅ | `/beste/omega-3-supplement` ✅, `/beste/vitamine-d` ✅ |
| Overtrainer | ✅ | `/herstel-verbeteren-na-40` ✅ | `/beste/creatine` ✅, `/beste/omega-3-supplement` ✅ |

---

## Ontbrekende pillar page

| Pillar | Status | Zou verbinden |
|---|---|---|
| `/testosteron-na-40` | ✏️ Gepland | zink vergelijking, creatine vergelijking, blog testosteron-en-energie-na-40 |

---

## Kennisbank — ontbrekende termen voor inline linking

| Term | Nodig voor | Prioriteit |
|---|---|---|
| Testosteron | Testosteron pillar, energie-blogs, profiel overtrainer | Hoog |
| Slaapschuld | Slaap pillar, slaap-blogs | Midden |
| Magnesiumvormen | Magnesium vergelijking, magnesium-blogs | Midden |
| Overtrainingssyndroom | Profiel overtrainer, pillar herstel | Midden |
| Insulineresistentie | Energie pillar, pillar testosteron | Laag |
| Oxidatieve stress | Cross-cluster verbinder | Laag |

---

## Spinnenweb-integriteit checklist

- [ ] Elke pillar linkt naar bijbehorend profiel?
- [ ] Elke vergelijkingspagina heeft "past bij profiel X" blok?
- [ ] Elke blog linkt naar 2+ gerelateerde pagina's?
- [ ] Kennisbank-termen inline gelinkt bij eerste voorkomen?
- [ ] Turbo-snippets bestaan voor alle live pagina's?
- [ ] Geen broken interne links (run `npm run build`)?
- [ ] Content-map bijgewerkt na elke nieuwe pagina?
- [ ] Nieuwe vergelijkingen (melatonine, eiwitpoeder) opgenomen in profieldata?

---

*Laatst bijgewerkt: mei 2026*
