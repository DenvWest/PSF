# Moat KPI-review — Wave 6 (30 dagen na deploy)

> **Geen code.** Dit document is het meet- en besluitkader voor de moat-implementatie (waves 0–5).
> Review-datum: **4 augustus 2026** (30 dagen na deploy moat-stack, juli 2026).
> Baseline invullen zodra GA4/Search Console beschikbaar is — idealiter binnen 7 dagen na deploy.

---

## 1. Wat is live (referentie)

| Wave | Onderdeel | Meetpunt |
|---|---|---|
| P2 | Teaser+gate tier ≥2 | `inzichten_premium_kennisbank_click` slug `gate_view` / `gate_intake` / `gate_login` + Clarity `kennisbank_gate` |
| P2 | Sitemap `/inzichten` | Search Console impressies |
| P3 | Plan-bridge, fase-regel, gapSignal | `focus_area_click` destinations `inzichten_plan_bridge`, `artikel_plan_fase`; durable `focus.viewed` |
| W3 | Tier-1 footer CTA | `focus_area_click` destination `kennisbank_tier1_intake` + Clarity `kennisbank_tier1_footer` |
| W4 | Q1 eiwit-hero | `focus_area_click` destination `approach_q1_eiwit` vs `approach_eiwitpoeder_*` |
| W5 | Metadata 100% | Geen event — weaving kan op alle slugs |

**Smoke productie (Wave 1, juli 2026):** `/kennisbank/hpa-as` gate OK; `/kennisbank/melatonine` volledig.

---

## 2. Baseline (invullen Dennis — week 1 na deploy)

Periode baseline Search Console: **28 dagen vóór gate-deploy** (pre-gate).
Periode baseline GA4: **7 dagen vóór deploy** (indien volume laag: 28d met caveat).

| Meting | Baseline | Datum genoteerd |
|---|---|---|
| `gate_view` (7d totaal) | | |
| `gate_intake` (7d) | | |
| `gate_login` (7d) | | |
| Gate CTR = (intake+login) / views | | |
| `focus.viewed` durable (consented cohort, 7d) | | |
| `focus_area_click` `inzichten_plan_bridge` (7d) | | |
| `focus_area_click` `artikel_plan_fase` (7d) | | |
| `focus_area_click` `approach_q1_eiwit` (7d) | | |
| `focus_area_click` `kennisbank_tier1_intake` (7d) | | |
| Return visits `/inzichten` ingelogd (7d) | | |
| SC impressies gated URLs (28d pre-gate) | | |
| SC impressies `/inzichten` (28d pre-gate) | | |

---

## 3. KPI's — 30-dagen review (4 augustus 2026)

### KPI 1 — Gate converteert (Ring 2 acquisitie)

**Bewijst:** gated diepte trekt naar check/login i.p.v. alleen bounce.

| | Waarde 30d | Baseline | Δ |
|---|---|---|---|
| `gate_view` | | | |
| `gate_intake` | | | |
| `gate_login` | | | |
| **CTR** | | | |

**GA4 — Exploration:**
1. Event: `inzichten_premium_kennisbank_click`
2. Dimensie: event parameter `slug` (= `gate_view`, `gate_intake`, `gate_login`)
3. Optioneel: parameter `term` (per begrip — zie tier-herziening §4)
4. CTR = (`gate_intake` + `gate_login`) / `gate_view`

**Drempel interpretatie (richtlijn, geen harde gate):**
- CTR < 2% → copy/CTA of gate-plaatsing herzien
- CTR 2–8% → normaal voor gratis gate; door meten
- CTR > 8% → sterk; overweeg tier-1 promotie van top-converters

**Gated slugs (13) — Search Console + GA4 term-kruis:**

`epa-dha`, `circadiaan-ritme`, `hpa-as`, `cortisol`, `mitochondrien`, `nervus-vagus`, `atp`, `testosteron`, `slaapschuld`, `overtrainingssyndroom`, `vitamine-d`, `insulineresistentie`, `oxidatieve-stress`

---

### KPI 2 — Ring 2 levert waarde ná conversie

**Bewijst:** ingelogde bezoekers komen terug op `/inzichten` en klikken verdieping.

| | Waarde 30d | Baseline | Δ |
|---|---|---|---|
| Sessies `/inzichten` (ingelogd, schatting) | | | |
| `inzichten_premium_kennisbank_click` (premium feed, niet gate_*) | | | |
| Return user rate hub (7d window) | | | |

**GA4:**
- Pagina: `/inzichten`, filter op ingelogd indien beschikbaar (custom dim of event-sequentie)
- Event: `inzichten_premium_kennisbank_click` WHERE slug NOT IN (`gate_view`, `gate_intake`, `gate_login`)

**Clarity:**
- Filter: custom tag `inzichten_layer` = `premium_kennisbank` | `kennisbank_gate` | `kennisbank_tier1_footer`
- Recordings: gate → intake → return ingelogd op inzichten

---

### KPI 3 — De lus werkt (dé maat)

**Bewijst:** kennis-klik leidt tot check-in of plan-stap binnen dezelfde week.

| Destination | Kliks 30d | → actiezelfde week (handmatig/n8n) | Ratio |
|---|---|---|---|
| `inzichten_plan_bridge` | | | |
| `artikel_plan_fase` | | | |
| `approach_q1_eiwit` | | | |
| `kennisbank_tier1_intake` | | | |

**GA4:** event `focus_area_click`, dimensie `destination`.

**Durable (consented cohort only):**
- `focus.viewed` via PostHog/n8n-weekrapport
- Join: zelfde `account_id` / sessie → `check_in.completed` of plan-stap-event binnen 7 dagen

**Meetpunt-regel (F6):** als plan-bridge + Q1-hero samen < 5% van hub-bezoekers actie binnen week opleveren → eerst content/weaving versterken, niet F2-matrix UI.

---

### KPI 4 — Teaser-model kost geen rankings

**Bewijst:** organische impressies op gated URL's dalen niet structureel.

| URL-groep | SC impressies pre-gate (28d) | SC impressies post-gate (28d) | Δ % |
|---|---|---|---|
| 13 gated slugs (totaal) | | | |
| 3 publicFullContent | | | |
| 8 tier-1 | | | |
| `/inzichten` | | | |

**Search Console:**
- Filter pagina's: `/kennisbank/hpa-as` (referentie gated), `/kennisbank/melatonine` (handtekening), `/kennisbank/adh` (tier-1)
- Vergelijk 28d vensters vóór vs na deploy-datum
- **Acceptabel:** ±15% fluctuatie (seizoen/noise); **alarm:** >25% daling op 3+ gated slugs tegelijk

---

## 4. Secundaire KPI's (nice-to-have)

| KPI | Event | Notitie |
|---|---|---|
| Q1 vs supplement | `approach_q1_eiwit` vs `approach_eiwitpoeder_gids` | Gedrag-CTA moet ≥ supplement-CTA zijn na 30d |
| Tier-1 footer | `kennisbank_tier1_intake` | Alleen tier-1/handtekening-pagina's |
| Hub nav | `inzichten_hub_nav_click` | Effect sitemap-entry `/inzichten` |

---

## 5. Besluitmatrix (na invulling §3)

| Signaal | Besluit |
|---|---|
| Gate CTR OK + SC stabiel + lus zwak | **Content-eerst** — meer artikelen voeding/beweging; geen F2-matrix UI |
| Gate CTR laag + SC stabiel | **Copy/gate-tweak** — CTA, tier-1 footer, A/B gate-copy |
| SC daling gated | **Tier-herziening** — overweeg `publicFullContent` voor top-impressie slugs (zie `fable-kennisbank-tier-herziening-2026-07.md`) |
| Lus sterk + gate OK | **F2-matrix** — volgende categorie-hero (vetzuren Q1) |
| Return visits laag | **Nav + nurture** — anoniem nav-gating heroverwegen, e-mail naar gate-converters |

---

## 6. Review-checklist (4 augustus 2026)

- [ ] Baseline §2 ingevuld (of gemarkeerd “niet beschikbaar” met reden)
- [ ] KPI 1–4 tabellen §3 ingevuld
- [ ] GA4: gate CTR berekend
- [ ] Clarity: min. 3 recordings gate→intake bekeken
- [ ] Search Console: pre/post 28d export
- [ ] n8n/consented cohort: `focus.viewed` trend
- [ ] Besluit §5 gekozen en genoteerd
- [ ] Follow-up items → nieuwe Cursor-prompt of content-backlog

---

## 7. Consent-bias (altijd vermelden)

Client-events (`gate_*`, `focus_area_click`, Clarity) respecteren analytics-consent.
Durable events (`focus.viewed`) alleen consented cohort — **vergelijk funnel-ratio's nooit tussen consent en non-consent**.

---

*Aangemaakt: juli 2026 (Wave 6 moat-plan). Geen codewijziging.*
