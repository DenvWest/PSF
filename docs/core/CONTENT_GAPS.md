# CONTENT GAPS — PerfectSupplement

> Voor de actuele lijst van bestaande pagina's: zie docs/PROJECT_STATE.md.

> **Layer 3 — Work.** Wat ontbreekt in het spinnenweb. Update na elke sprint.

---

## Link-gaps (pagina's die beter gelinkt moeten worden)

| Pagina | Moet gelinkt worden vanuit |
|---|---|
| `/herstel-verbeteren-na-40` | Homepage, `/thema/herstel` |
| `/beste/zink` | Extra profiel-pagina's (stressdrager) |
| `/beste/melatonine` | Slaap-blogs, profiel onrustige-slaper |
| `/beste/eiwitpoeder` | Energie-blogs, pillar herstel |

---

## Cluster-blogs die het spinnenweb versterken

| Blog (idee) | Verbindt | Impact |
|---|---|---|
| `/blog/cortisol-en-testosteron` | ✅ Live | pillar testosteron ↔ pillar stress ↔ ashwagandha |
| `/blog/creatine-en-herstel` | ✅ Live | pillar herstel ↔ creatine vergelijking ↔ profiel overtrainer |
| `/blog/vitamine-d-en-energie` | ✅ Live | pillar energie ↔ vitamine-d vergelijking ↔ profiel lage-batterij |
| `/blog/zink-en-testosteron` | ✅ Live | pillar testosteron ↔ zink vergelijking |
| `/blog/omega-3-en-herstel` | ✅ Live | pillar herstel ↔ omega-3 vergelijking ↔ profiel overtrainer |
| `/blog/melatonine-en-slaap` | pillar slaap ↔ melatonine vergelijking ↔ profiel onrustige-slaper | **Hoog** |

---

## Profielpagina link-targets

| Profiel | Status | Pillar link | Cluster / vergelijking |
|---|---|---|---|
| Onrustige Slaper | ✅ | `/slaap-verbeteren-na-40` ✅ | `/beste/magnesium` ✅, `/beste/ashwagandha` ✅ |
| Stressdrager | ✅ | `/stress-verminderen-man` ✅ | `/blog/cortisol-en-testosteron` ✅, `/testosteron-na-40` ✅ |
| Lage Batterij | ✅ | `/energie-na-40` ✅ | `/blog/vitamine-d-en-energie` ✅, `/beste/vitamine-d` ✅ |
| Overtrainer | ✅ | `/herstel-verbeteren-na-40` ✅ | `/blog/creatine-en-herstel` ✅, `/kennisbank/overtrainingssyndroom` ✅ |

---

## Pillar pages

| Pillar | Status | Verbindt |
|---|---|---|
| `/testosteron-na-40` | ✅ Live | zink, creatine, ashwagandha vergelijkingen + cluster-blogs |

---

## Kennisbank — termen (inline linking)

| Term | Status | Inline vanuit |
|---|---|---|
| Testosteron | ✅ | testosteron-pillar, cortisol-blog, zink-blog |
| Slaapschuld | ✅ | slaap-pillar |
| Overtrainingssyndroom | ✅ | profiel overtrainer, kennisbank cross-links |
| Magnesiumvormen | ✅ | magnesium vergelijking, magnesium-blogs |
| Insulineresistentie | ✅ term | Energie pillar, pillar testosteron — meer inline links gewenst |
| Oxidatieve stress | 💡 | Cross-cluster verbinder |

---

## Spinnenweb-integriteit checklist

- [x] Elke pillar linkt naar bijbehorend profiel (testosteron-pillar → 3 profielen)
- [ ] Elke vergelijkingspagina heeft "past bij profiel X" blok
- [x] Elke nieuwe cluster-blog linkt naar 2+ gerelateerde pagina's
- [x] Kennisbank-termen testosteron, slaapschuld, overtrainingssyndroom inline gelinkt
- [x] Turbo-snippets op testosteron-pillar en cluster-blogs
- [ ] Geen broken interne links (run `npm run build` — na deploy verifiëren)
- [ ] Content-map bijgewerkt na elke nieuwe pagina
- [x] Nieuwe vergelijkingen (melatonine, eiwitpoeder) opgenomen in profieldata

---

*Laatst bijgewerkt: mei 2026*
