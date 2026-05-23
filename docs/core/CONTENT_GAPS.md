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

**Wave 1 (mei 2026) opgelost:**
- Cortisol-blogs → `/kennisbank/cortisol` + `/kennisbank/hpa-as`
- Melatonine-blogs → `/kennisbank/melatonine`
- Magnesium-blogs → `/kennisbank/magnesiumvormen`
- Stress-blogs cornerstone → `/stress-verminderen-man` (was `/gids/stress`)
- Energie-blogs cornerstone → `/energie-na-40` (was `/gids/energie`)
- Herstel-pillar → 4 kennisbank-links (overtraining, eiwit, mitochondriën, ATP)

**Wave 2 (mei 2026) opgelost:**
- Profielpagina's: 2–3 inline kennisbank-links per profiel (stressdrager, onrustige slaper, lage batterij, overtrainer)
- IntakeResults: kennisbank-links bij lage domeinscore + eiwit-callout naar blog/KB
- Blog `/blog/eiwit-na-40` — NUT_PROT + MOV_STR gap

---

## Cluster-blogs die het spinnenweb versterken

| Blog (idee) | Verbindt | Impact |
|---|---|---|
| `/blog/cortisol-en-testosteron` | ✅ Live | pillar testosteron ↔ pillar stress ↔ ashwagandha |
| `/blog/creatine-en-herstel` | ✅ Live | pillar herstel ↔ creatine vergelijking ↔ profiel overtrainer |
| `/blog/vitamine-d-en-energie` | ✅ Live | pillar energie ↔ vitamine-d vergelijking ↔ profiel lage-batterij |
| `/blog/zink-en-testosteron` | ✅ Live | pillar testosteron ↔ zink vergelijking |
| `/blog/omega-3-en-herstel` | ✅ Live | pillar herstel ↔ omega-3 vergelijking ↔ profiel overtrainer |
| `/blog/eiwit-na-40` | ✅ Live | NUT_PROT + MOV_STR ↔ eiwitbehoefte KB ↔ herstel/testosteron pillar |
| `/blog/middagdip-bloedsuiker-na-40` | NRG_DEP + NRG_PATN ↔ insulineresistentie | **Hoog** |

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
| Cortisol | ✅ | cortisol-en-slaap, cortisol-verlagen, cortisol-en-testosteron, stress-pillar |
| HPA-as | ✅ | cortisol-en-slaap, cortisol-verlagen, stress-pillar |
| Melatonine | ✅ | melatonine-na-40, melatonine-wanneer-wel-niet, slaap-pillar |
| Testosteron | ✅ | testosteron-pillar, cortisol-blog, zink-blog |
| Slaapschuld | ✅ | slaap-pillar |
| Overtrainingssyndroom | ✅ | profiel overtrainer, herstel-pillar, kennisbank cross-links |
| Magnesiumvormen | ✅ | magnesium-en-slaap, magnesium-en-slaapkwaliteit |
| Mitochondriën / ATP | ✅ | creatine-blog, vitamine-d-en-energie, energie-pillar, energie-verhogen, herstel-pillar |
| Insulineresistentie | ⚠️ orphan | Term live — nog geen inline links vanuit blogs/pillars |
| Eiwitbehoefte-na-40 | ✅ | eiwit-na-40 blog, IntakeResults, profielen overtrainer/lage-batterij |
| Oxidatieve stress | 💡 | Cross-cluster verbinder |

---

## Spinnenweb-integriteit checklist

- [x] Elke pillar linkt naar bijbehorend profiel (testosteron-pillar → 3 profielen)
- [ ] Elke vergelijkingspagina heeft "past bij profiel X" blok
- [x] Elke nieuwe cluster-blog linkt naar 2+ gerelateerde pagina's
- [x] Kennisbank-termen cortisol, hpa-as, melatonine, magnesiumvormen inline gelinkt (Wave 1)
- [x] Stress/energie cluster-blogs cornerstone → echte pillars (Wave 1)
- [x] Herstel-pillar kennisbank-links (Wave 1)
- [x] Turbo-snippets op testosteron-pillar en cluster-blogs
- [ ] Geen broken interne links (run `npm run build` — na deploy verifiëren)
- [ ] Content-map bijgewerkt na elke nieuwe pagina
- [x] Nieuwe vergelijkingen (melatonine, eiwitpoeder) opgenomen in profieldata

---

*Laatst bijgewerkt: mei 2026*
