# PLAN — Aanpak-modus maand-roadmap (sport/kracht-vertical eerst)

> **Layer 3 — Plan.** Maand-planning (27 juni – 24 juli 2026) voor de Aanpak-modus op `/inzichten`: bouw één volledige, gepersonaliseerde categorie-vertical (**sport/kracht**) als bewezen sjabloon, met nutriënten gekoppeld aan lichaam (gewicht/activiteit → dagdoel), en breid daarna gecontroleerd uit naar meer leefstijl-categorieën. Houdt de volledige visie heel terwijl er incrementeel wordt gebouwd.
>
> Kruisverwijzingen: [`PLAN_PRIORITEIT_MOEITE_MATRIX.md`](PLAN_PRIORITEIT_MOEITE_MATRIX.md) (de IA) · [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) (tier-2 PAL/BMR/TDEE) · [`../core/COMPLIANCE.md`](../core/COMPLIANCE.md) · taxonomie: [`../../src/data/approach/category-taxonomy.ts`](../../src/data/approach/category-taxonomy.ts) · engine: [`../../src/lib/build-recommendations.ts`](../../src/lib/build-recommendations.ts) · personalisatie: [`../../src/lib/protein-target.ts`](../../src/lib/protein-target.ts) · [`../../src/lib/movement-pal.ts`](../../src/lib/movement-pal.ts) · [`../../src/lib/nutrient-personalization.ts`](../../src/lib/nutrient-personalization.ts)

---

## Samenvatting

Drie sporen die Dennis expliciet wil, in één maand verweven:

1. **Stap-voor-stap startpunt:** begin bij **sport/kracht** — eiwit → krachttraining → creatine. Niet de hele matrix tegelijk; één categorie volledig uitwerken als sjabloon.
2. **Nutriënten gekoppeld aan instelling** (gewicht/leeftijd/activiteit → dagdoel). De wiskunde staat al in `lib` (`computeProteinTarget`, `movement-pal`, `nutrient-personalization`) en is zichtbaar in de intake; de maand-taak is dit **surfacen in de Aanpak-kaart**, niet opnieuw bouwen.
3. **Gecontroleerde uitbreiding** naar meer leefstijl-categorieën — pas nadat het sport/kracht-sjabloon meetbaar werkt.

**Maand-doel:** aan het eind staat sport/kracht als complete, gepersonaliseerde vertical (voeding-target + supplement + betaald-programma-signaal) én één tweede categorie op hetzelfde sjabloon — met per-supplement meetdata die de volgende uitbreiding stuurt.

---

## 1. Het sjabloon (wat "een volledige categorie" betekent)

Elke categorie-vertical heeft vier lagen. Sport/kracht is de eerste die we volledig invullen:

| Laag | Sport/kracht-invulling | Status |
|---|---|---|
| **Voeding-eerst (Q1, gratis)** | Eiwit bij elke maaltijd | F1/F2 gebouwd |
| **Gepersonaliseerd op lichaam** | Eiwit-dagdoel uit gewicht × activiteit (`computeProteinTarget` + `movement-pal`) | lib bestaat, nog niet in Aanpak |
| **Supplement-naad (affiliate)** | Creatine (kracht) + eiwitpoeder, intern naar `/beste/*` | F2 (engine) |
| **Begeleiding (Q2, betaald)** | Krachttraining-programma | nog niet — eerst vraag meten |

Dit sjabloon is herbruikbaar per categorie (zie §4). De engine (`buildRecommendations`) + taxonomie (`category-taxonomy.ts`) zijn de SSOT; per categorie verandert alleen de invulling, niet de structuur.

---

## 2. Weekplanning

### Week 1 — Fundament hard maken (27 jun – 3 jul)
- **F2 reviewen, draaien, deployen** (engine-gestuurde Q1-kaarten).
- Sport/kracht-cluster scherpstellen: eiwit + creatine, creatine gegate op krachttraining-signaal (`MOV_STR`).
- Meetpunten live: `focus_area_click` met `destination approach_<slug>_gids` / `_vergelijk`.
- **Bewust nog niet:** matrix-2×2-chrome, Q2, tweede categorie.
- *Meetpunt: per-supplement doorklik + affiliate-naad — eerste "wat trekt"-signaal.*

### Week 2 — Nutriënt-personalisatie in de kaart (4 – 10 jul)
- **Instelling → dagdoel surfacen:** toon in de eiwit-Aanpak-kaart "jouw dagdoel ± X g eiwit per dag" via de bestaande `computeProteinTarget(weightKg, trainingLoad)` + `movement-pal` (activiteit) — gegate op `body_metrics`-consent + gewicht-input (hergebruik de flow achter [`ProteinTargetCard.tsx`](../../src/components/intake/ProteinTargetCard.tsx)).
- Zonder gewicht: een zachte "vul je gewicht in voor je persoonlijke dagdoel"-prompt (geen harde eis).
- Leeftijd is binnen 40+ secundair voor eiwit (zie comment in `protein-target.ts`); `age_range` blijft input voor de bredere BMR/TDEE-laag (tier-2, [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md)).
- **Bewust nog niet:** volledige PAL/BMR/TDEE/macro/micro — dat is tier-2, later.
- *Meetpunt: % dat gewicht invult + doorklik ná het persoonlijke dagdoel (toont of personalisatie conversie verhoogt).*

### Week 3 — Sport/kracht compleet (11 – 17 jul)
- Vertical afmaken: eiwit-target + creatine **+ de kracht-Q2 als gemeten wachtlijst-CTA** ("interesse in een krachtopbouw op maat?") → simpele interesse-pagina. **Geen programma/coach bouwen** — alleen de vraag meten.
- Hiermee is sport/kracht de eerste categorie met alle vier de lagen (waarvan Q2 nog als signaal).
- **Bewust nog niet:** het echte coach-programma (vraag-gated, zie IA §6 compliance: coach = nieuwe art. 9-ontvanger).
- *Meetpunt: `approach_kracht_q2_waitlist`-clicks = vraagsignaal voor het betaalde programma.*

### Week 4 — Tweede categorie + consolidatie (18 – 24 jul)
- Sjabloon generaliseren naar **één** tweede categorie — voorstel **herstel/slaap**: omega-3 + magnesium als supplement-naad, met een leefstijl-quick-win (slaapritme/herstelmoment) als de voeding-eerst-laag. Zelfde engine, zelfde kaart-pattern.
- Meetdata van wk 1–3 consolideren → beslissen welke categorie/supplement de winst trekt.
- Scope-review (§5): wat blijft bewust uit.
- *Meetpunt: vergelijk doorklik/conversie sport-kracht vs herstel → richt de uitbreiding van maand 2.*

---

## 3. Nutriënt-personalisatie — wat er al staat vs wat erbij moet

**Bestaat al (lib):**
- `computeProteinTarget({ weightKg, trainingLoad })` → eiwit-gramrange (PROT-AGE/ESPEN, 40+).
- `movement-pal.ts` → Physical Activity Level uit de beweging-antwoorden.
- `nutrient-personalization.ts` + `nutrition-intake-estimate.ts` → koppeling inname ↔ behoefte.
- `body_metrics`-consent + gewicht-input + `ProteinTargetCard` (zichtbaar in de intake/reveal).

**Moet erbij (maand-taak):**
- Deze laag **in de Aanpak-kaart** tonen (nu alleen in de intake).
- De "instelling" expliciet maken: gewicht (built) × activiteit/PAL (built) → dagdoel; leeftijd captured, voedt later BMR/TDEE.
- Later (tier-2): macro/micro-verdieping per `PLAN_MEASUREMENT_PERSONALIZATION.md`.

Conclusie: de personalisatie die Dennis wil is **80% surfacing, 20% nieuw** — laag risico, hoge waarde.

---

## 4. Categorie-map (de volledige visie/scope)

Uitbreidingsvolgorde, elk op het §1-sjabloon. Sport/kracht eerst (maand 1); de rest volgt op meetdata.

| Categorie | Voeding-eerst (Q1) | Supplement-naad | Leefstijl Q2 (later) |
|---|---|---|---|
| **Sport/kracht** (maand 1) | Eiwit (dagdoel) | Creatine, eiwitpoeder | Krachtopbouw-programma |
| **Herstel/slaap** (maand 1, wk 4) | Slaapritme, herstelmoment | Magnesium, omega-3 | Slaap-/herstel-coaching |
| **Voeding-breed** | Vetzuren, vezels, ritme | Omega-3, vit-D | — |
| **Stress** | Ademhaling, herstelmomenten | Magnesium | Stress-/ontspanningscoaching |
| **Basis** | — | Vitamine D, zink | — |
| Energie | readout (geen eigen kaarten — reflecteert drivers) | — | — |

Ashwagandha blijft on-hold (regulatory), melatonine zonder affiliate — zie [`COMPLIANCE.md`](../core/COMPLIANCE.md).

---

## 4b. Tweede mode: Onderbouwing (niet een Artikelen-/blog-dubbel)

**Besluit (27 juni 2026).** De "Artikelen"-tab op /inzichten dupliceert nu blog + kennisbank (beide eigen routes). Hij wordt **"Onderbouwing"**: een interventie-georiënteerde lens op bestaande inzichten, geordend prioriteit×moeite (weinig moeite + hoge prioriteit boven → aflopend), elk doorlinkend naar gids + vergelijking. Zo wordt /inzichten één funnel: **Aanpak (wat) → Onderbouwing (waarom, evidence) → Vergelijking (koop)** — conversion-gericht, Consumentenbond-conform (evidence eerst).

- **Datamodel ondersteunt het al:** `InsightItem` ([`../../src/types/insight.ts`](../../src/types/insight.ts)) heeft `relatedSupplementId`, `gapSignal`, `planPhase`, `tier` — genoeg om per interventie-supplement te groeperen en op prioriteit te ordenen. Geen nieuwe content, een andere lens.
- **De Aanpak-kaart krijgt z'n "Zo zit het"-evidence-link terug** → de onderbouwing met dat `relatedSupplementId` (niet een los blog-artikel).
- **Geen content-verlies:** algemene discovery blijft op /blog + /kennisbank (eigen SEO); de /inzichten-feed was alleen aggregatie.
- **Fasering:** Week 3/4-bouwstap, ná de Aanpak-kant (eerst F2 + meten). Randvoorwaarde vóór de feed-aggregatie weg mag: interne links die nu via /inzichten lopen moeten door /blog + /kennisbank worden overgenomen (geen verweesde content / broken links). Affiliate blijft op de comparison-page.

## 5. Guardrails (scope-bewaking, doorlopend)

- **Engine = SSOT.** Supplementen toevoegen/weghalen = in de recommendation-engine, niet in de UI.
- **Voeding-eerst blijft de kop**, supplement is de aanvulling/laatste regel — anders verkapte supplementcatalogus i.p.v. Consumentenbond-moat. De cross-domein-balansregel moet zichtbaar blijven.
- **Meet vóór je uitbreidt.** Een nieuwe categorie pas bouwen als de vorige meetbaar trekt. "Volledigheid" = het sjabloon, niet alles tegelijk live.
- **Geen score/urgentie user-facing** (DPIA-R4); prioriteit kwalitatief uit de engine-ranking.
- **Affiliate alleen intern** naar `/beste/*` op /inzichten; de sponsored-link leeft op de vergelijkingspagina.
- **Q2/coach is vraag-gated** — eerst wachtlijst-signaal, dan pas consent + verwerkersovereenkomst + programma.

---

## Aanbeveling

Houd de volgorde **één categorie diep vóór breed**: maak sport/kracht in wk 1–3 compleet (incl. de personalisatie-surfacing in wk 2 — laag risico, hoge waarde), bewijs met meetdata dat het sjabloon werkt, en gebruik wk 4 om het naar precies één tweede categorie te kopiëren. Zo houd je de volledige visie (de categorie-map) heel zonder de scope per week te laten ontsporen.

---

*Opgesteld: 27 juni 2026. Planning-document — geen code. Eén categorie diep (sport/kracht) als bewezen sjabloon vóór breedte; nutriënt-personalisatie is surfacing van bestaande lib, niet nieuwbouw.*
