# CONTENT GAPS — PerfectSupplement

> Voor de actuele lijst van bestaande pagina's: zie docs/PROJECT_STATE.md.

> **Layer 3 — Work.** Wat ontbreekt in het spinnenweb. Update na elke sprint.

---

**Wave 6 (mei 2026) opgelost:**
- `ComparisonProfileFits` op alle 8 `/supplementen/*` gidsen
- Homepage: profiel-strip met link naar `/profiel` + 4 profielkaarten
- Blog-categorie supplementen `themaHref` → `/supplementen`
- `buildFaqSchema()` gedeeld door vergelijkingen (`FaqSection`) en supplement-gidsen

---

## Link-gaps (pagina's die beter gelinkt moeten worden)

| Pagina | Moet gelinkt worden vanuit |
|---|---|
| `/beste/zink` | Extra profiel-pagina's (stressdrager) — ✅ via ComparisonProfileFits |
| `/beste/melatonine` | Slaap-blogs, profiel onrustige-slaper — ✅ via ComparisonProfileFits |
| `/profiel` | ✅ Homepage profiel-strip (Wave 6) |

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

**Wave 3 (mei 2026) opgelost:**
- Blogs `/blog/middagdip-bloedsuiker-na-40` en `/blog/krachttraining-na-40` — NRG_DEP/NRG_PATN + MOV_STR/MOV_CARD
- Kennisbank-term `vitamine-d` — LIF_SUN gap; inline in vit-D blogs
- Insulineresistentie inline: energie-pillar, energie-verhogen, middagdip-blog, profiel lage-batterij
- Energie-categorie intent-links + pillar `/energie-na-40` (was `/gids/energie`)
- Profiel lage-batterij → middagdip + krachttraining; overtrainer → krachttraining + pillar-fixes

**Wave 4 (mei 2026) opgelost:**
- Blog `/blog/alcohol-slaap-energie-na-40` — NRG_DEP/LIF_ALC ↔ slaap-pillar, middagdip, profielen
- Ademhaling-blog → `/kennisbank/nervus-vagus`
- Kennisbank-term pagina's: `[label](href)` markdown werkt in whyItMatters (en alle content-secties)
- Magnesium/melatonine audit: beide paren behouden (verschillende diepte), cross-links + slaap-categorie pillar-fix

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
| `/blog/middagdip-bloedsuiker-na-40` | ✅ Live | NRG_DEP + NRG_PATN ↔ insulineresistentie ↔ profiel lage-batterij |
| `/blog/krachttraining-na-40` | ✅ Live | MOV_STR/MOV_CARD ↔ eiwit KB ↔ profielen lage-batterij/overtrainer |
| `/blog/alcohol-slaap-energie-na-40` | ✅ Live | NRG_DEP + LIF_ALC ↔ slaap/energie pillars ↔ middagdip |

---

## Dubbele artikelen — audit (Wave 4)

| Paar | Beslissing | Rol |
|---|---|---|
| `magnesium-en-slaap` + `magnesium-en-slaapkwaliteit` | Beide behouden | Slaap-focus (6 min) vs complete vormengids (16 min, supplementen) |
| `melatonine-na-40` + `melatonine-wanneer-wel-niet` | Beide behouden | Narratief "waarom niet genoeg" vs praktisch wanneer wel/niet |

Cross-links toegevoegd; geen redirects nodig (verschillende zoekintentie).

---

## Profielpagina link-targets

| Profiel | Status | Pillar link | Cluster / vergelijking |
|---|---|---|---|
| Onrustige Slaper | ✅ | `/slaap-verbeteren-na-40` ✅ | `/beste/magnesium` ✅, `/beste/ashwagandha` ✅ |
| Stressdrager | ✅ | `/stress-verminderen-man` ✅ | `/blog/cortisol-en-testosteron` ✅, `/testosteron-na-40` ✅ |
| Lage Batterij | ✅ | `/energie-na-40` ✅ | `/blog/alcohol-slaap-energie-na-40` ✅, `/blog/middagdip-bloedsuiker-na-40` ✅ |
| Overtrainer | ✅ | `/herstel-verbeteren-na-40` ✅ | `/blog/krachttraining-na-40` ✅, `/blog/creatine-en-herstel` ✅ |

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
| Insulineresistentie | ✅ | middagdip-blog, energie-pillar, energie-verhogen, profiel lage-batterij |
| Vitamine D | ✅ | vitamine-d-en-energie, vitamine-d-tekort-herkennen, kennisbank cross-links |
| Eiwitbehoefte-na-40 | ✅ | eiwit-na-40 blog, krachttraining-blog, IntakeResults, profielen overtrainer/lage-batterij |
| Nervus vagus | ✅ | ademhaling-tegen-stress, profiel stressdrager, stress-thema |
| Oxidatieve stress | 💡 | Cross-cluster verbinder |

---

## Spinnenweb-integriteit checklist

- [x] Elke pillar linkt naar bijbehorend profiel (testosteron-pillar → 3 profielen)
- [x] Elke vergelijkingspagina heeft "past bij profiel X" blok (Wave 5 — ComparisonProfileFits)
- [x] Elke nieuwe cluster-blog linkt naar 2+ gerelateerde pagina's
- [x] Kennisbank-termen cortisol, hpa-as, melatonine, magnesiumvormen inline gelinkt (Wave 1)
- [x] Stress/energie cluster-blogs cornerstone → echte pillars (Wave 1)
- [x] Herstel-pillar kennisbank-links (Wave 1)
- [x] Turbo-snippets op testosteron-pillar en cluster-blogs
- [ ] Geen broken interne links (run `npm run build` — na deploy verifiëren)
- [ ] Content-map bijgewerkt na elke nieuwe pagina
- [x] Kennisbank-termen whyItMatters markdown-links renderen (Wave 4)
- [x] FAQ schema op vergelijkingen via gecentraliseerde `buildFaqSchema` (Wave 6)
- [x] Supplement-gidsen hebben "past bij profiel X" blok (Wave 6)

---

*Laatst bijgewerkt: mei 2026*
