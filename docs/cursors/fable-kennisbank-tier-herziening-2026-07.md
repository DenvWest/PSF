# Fable — kennisbank tier-herziening ná teaser+gate (juli 2026)

Vervolg op `fable-moat-google-ai-premium-2026-07.md` (§3B.4 vuistregel, §3G besluit 5) en
`fable-cursor-prompts-moat-2026-07.md` §7 punt 1–2. Teaser+gate is live; dit document herziet
de 24 `insightTier`-waarden en levert één data-only Cursor-prompt. Alle content en consumers
geverifieerd tegen de codebase op 2026-07-05.

---

## 1. Advies-tabel (24 begrippen)

Vuistregel §3B.4: "zou dit exact zo bij een concurrent kunnen staan?" → tier 1 · mechanisme-diepte
→ tier 2 · interventie/supplement-context → tier 3. `publicFullContent` = handtekening-uitzondering
(volledig publiek ondanks tier ≥2).

| Slug | Huidig | Advies | publicFullContent | Reden (1 zin) |
|---|---|---|---|---|
| biobeschikbaarheid | 1 | **1** | — | Methodologie-handtekening (weegt 25% in de beoordelingsmethodiek) — hoort publiek. |
| chelaatvorm | 1 | **1** | — | Vorm-uitleg als methodologie-bouwsteen; blijft publiek. |
| adh | 1 | **1** | — | Basisbegrip/definitie-intent; pure acquisitie. |
| efsa-claims | 1 | **1** | — | Kern van de Consumentenbond-handtekening; moet publiek. |
| derde-partij-testen | 1 | **1** | — | Methodologie-handtekening; publiek bewijs van onafhankelijkheid. |
| healthspan | 1 | **1** | — | Generiek longevity-begrip; acquisitie, geen moat-diepte. |
| slaaphygiene | 2 | **1 ⬆** | — | Leefstijl-eerst acquisitie-magneet (hoog zoekvolume, gedrag geen supplement); gaten botst met de merkbelofte. |
| eiwitbehoefte-na-40 | 2 | **1 ⬆** | — | Draagt de Q1-eiwit-hero en de voeding-eerst startfocus; sterkste long-tail voor de doelgroep. |
| circadiaan-ritme | 2 | **2** | — | Mechanisme-diepte slaap; eerste trede van de gated verdiepingsladder. |
| hpa-as | 2 | **2** | — | Stress-mechanisme-diepte; blijft het gated referentievoorbeeld (P2-acceptatie). |
| mitochondrien | 2 | **2** | — | Energie-mechanisme; klassieke ring-2 diepte. |
| nervus-vagus | 2 | **2** | — | Stress-fysiologie-diepte zonder supplement-context; ring 2. |
| atp | 2 | **2** | — | Mechanisme-diepte energie; teaser dekt de definitie-intent. |
| slaapschuld | 2 | **2** | — | Verdieping op slaaphygiëne (die nu publiek wordt) — de ladder: publiek basisgedrag, gated mechanisme. |
| overtrainingssyndroom | 2 | **2** | — | Herstel-mechanisme; Overtrainer-profiel-diepte, ring 2. |
| adaptogens | 3 | **3** | **true ⬆** | Draagt de ashwagandha-uitsluitings-handtekening (EFSA on-hold, nuchtere RCT-nuance) — zelfde patroon als melatonine: bewust publiek. |
| epa-dha | 3 | **3** | — | Supplement-context omega-3; teaser rankt, dosering/keuze-diepte blijft gated. |
| cortisol | 3 | **3** | — | Semantisch grensgeval (deels mechanisme) maar functioneel identiek aan tier 2 — geen churn zonder effect. |
| melatonine | 3 | **3** | true (bestaand) | Uitsluitings-handtekening; ongewijzigd laten. |
| testosteron | 3 | **3** | — | Hoog zoekvolume mét zink/creatine-interventiecontext — precies waar de gate-funnel voor is. |
| magnesiumvormen | 3 | **3** | **true ⬆** | BRAND_POSITIONING §5 noemt "bisglycinaat vs oxide" letterlijk als publiek te delen educatie; de bouwstenen (biobeschikbaarheid, chelaatvorm) zijn al tier-1 publiek. |
| vitamine-d | 3 | **3** | — | Supplement-context met eigen vergelijkingspagina; teaser dekt de definitie-intent. |
| insulineresistentie | 3 | **3** | — | Voeding-interventiecontext; gated diepte is de account-reden voor dit thema. |
| oxidatieve-stress | 3 | **3** | — | Longevity-interventiecontext (omega-3); ring 3 klopt. |

**Netto wijzigingen: 4** — twee tier-verlagingen (slaaphygiene, eiwitbehoefte-na-40 → 1) en twee
nieuwe `publicFullContent`-flags (adaptogens, magnesiumvormen). De overige 20 blijven exact zoals ze staan.

---

## 2. Afwijkingen t.o.v. de hypothese + conflict-check

**Hypothese gevalideerd:** slaaphygiene en eiwitbehoefte-na-40 → tier 1 klopt, inclusief de
redenering (leefstijl-eerst, cluster-ondersteuning, bewuste scrape-trade-off). Circadiaan-ritme
en slaapschuld als gated slaap-verdiepingsladder klopt ook.

**Twee afwijkingen (toevoegingen, geen correcties):**

1. **adaptogens → `publicFullContent: true`.** De body en referenties dragen letterlijk de
   ashwagandha-uitsluitings-nuance (EFSA botanicals on-hold, "geen hormoon-reset-belofte",
   RCT-voorbehoud). Dat is handtekening-content uit de moat-rapport-set — een uitsluiting die je
   gate't, werkt niet als handtekening. Zelfde patroon als melatonine: tier blijft 3 (het ís
   interventie-context), toegang wordt publiek.
2. **magnesiumvormen → `publicFullContent: true`.** BRAND_POSITIONING §5 zet "Magnesium
   bisglycinaat vs oxide — waarom het verschil uitmaakt" expliciet in de kolom "deel publiek"
   en social-pijler 2 gebruikt het als transparantie-content; bovendien zijn de twee begrippen
   waar het naar doorverwijst (biobeschikbaarheid, chelaatvorm) al tier-1 publiek. De gated
   diepte is hier bovendien klein (whyItMatters is twee zinnen) — de gate kost hier merk zonder
   moat te winnen.

**Overwogen en afgewezen:** cortisol 3→2 (semantisch verdedigbaar, maar tier 2 en 3 gedragen
zich vandaag identiek in gate én feed — datawijziging zonder effect is churn); testosteron/
vitamine-d publiek maken (hoog volume is juist het gate-funnel-argument: de teaser rankt, de
diepte converteert).

**Conflict-check (geverifieerd — `insightTier` heeft exact twee consumers):**

- `src/app/kennisbank/[slug]/page.tsx:174-175` (de gate): leest `insightTier >= 2` en
  `publicFullContent` — precies wat we wijzigen; geen code-aanpassing nodig.
- `src/data/insights.ts:128-130` (`isPremiumKennisbankInsight`, filter `insightTier` 2–3):
  **slaaphygiene en eiwitbehoefte-na-40 vallen uit de premium-feed en uit het
  InzichtenPremiumKennisbank-blok; de feed-teller gaat van 18 naar 16 — bewust en OK** (tier-1
  begrippen horen in de publieke feed, niet in "Verdieping na je check").
- `publicFullContent` heeft géén effect op de feed: adaptogens en magnesiumvormen blijven als
  tier-3 in "Verdieping na je check" staan terwijl hun route publiek is — dat is het bestaande
  melatonine-patroon (feed = curatie, gate = route-toegang), geen regressie.
- Sitemap: neemt alle terms op ongeacht tier — ongewijzigd. Geen andere consumers
  (grep bevestigd buiten types/tests).

---

## 3. Cursor-prompt

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/cursors/fable-kennisbank-tier-herziening-2026-07.md (dit besluit: welke 4 entries en waarom)
- docs/cursors/fable-moat-google-ai-premium-2026-07.md §3D (teaser+gate-model)
- Bestanden (exacte paden, geverifieerd):
  - src/data/kennisbank.ts — ENIGE bestand dat je wijzigt. Interface KennisbankTerm heeft
    `insightTier: 1 | 2 | 3` en `publicFullContent?: boolean` (bestaat al, met doc-comment);
    de melatonine-entry gebruikt de flag al — KOPIEER die stijl exact
  - src/app/kennisbank/[slug]/page.tsx (regels 174-175) — ALLEEN LEZEN: de gate leest
    insightTier + publicFullContent; er is geen code-wijziging nodig
  - src/data/insights.ts (regels 125-132) — ALLEEN LEZEN: isPremiumKennisbankInsight filtert
    op insightTier 2–3; door deze wijziging vallen twee begrippen bewust uit de premium-feed

## Taak
Vier data-wijzigingen in src/data/kennisbank.ts — verder niets:

1. Entry `slug: 'slaaphygiene'`: `insightTier: 2` → `insightTier: 1`
2. Entry `slug: 'eiwitbehoefte-na-40'`: `insightTier: 2` → `insightTier: 1`
3. Entry `slug: 'adaptogens'`: voeg `publicFullContent: true,` toe, direct onder
   `insightTier: 3,` (zelfde plek als bij de melatonine-entry)
4. Entry `slug: 'magnesiumvormen'`: voeg `publicFullContent: true,` toe, direct onder
   `insightTier: 3,`

Raak per entry NIETS anders aan: geen content-teksten, geen shortDefinition, geen
relatedSlugs/relatedComparisons, geen referenties, geen meta-velden. De overige 20 entries
blijven byte-identiek. Het tier-doc-comment op de interface (regel ±16) blijft staan — het
klopt nog.

Privacy/meten: dit is een data-only wijziging — geen nieuwe events, geen nieuwe CTA's, geen
wijziging aan het verwerkingsregister. De bestaande gate-events
(inzichten_premium_kennisbank_click met gate_view/gate_intake/gate_login) blijven ongewijzigd
en registreren vanzelf minder gate-views op de twee vrijgegeven slugs.

## Constraints
- Imports via `@/` (niet relatief) — n.v.t. voor deze wijziging, geen imports toevoegen
- Nederlandse UI strings, Engelse variabelen/functies
- Data-only: GEEN wijzigingen aan componenten, routes, libs of events
- Verander NIETS aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local, src/app/kennisbank/[slug]/page.tsx, src/data/insights.ts,
  src/app/sitemap.ts, de melatonine-entry
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] Anoniem: /kennisbank/slaaphygiene en /kennisbank/eiwitbehoefte-na-40 tonen de volledige
      inhoud (howItWorks + whyItMatters + referenties-footer), geen gate
- [ ] Anoniem: /kennisbank/adaptogens en /kennisbank/magnesiumvormen tonen de volledige inhoud,
      geen gate
- [ ] Anoniem: /kennisbank/circadiaan-ritme toont de gate ("De verdieping is gratis") en GEEN
      howItWorks-tekst
- [ ] /kennisbank/melatonine ongewijzigd volledig publiek
- [ ] Premium-feed op /inzichten?kennisbank=premium (ingelogd + check) telt 16 begrippen;
      slaaphygiene en eiwitbehoefte-na-40 staan er niet meer in, adaptogens en magnesiumvormen wél
- [ ] Diff raakt uitsluitend src/data/kennisbank.ts, exact 4 entries
- [ ] Geen nieuwe console.log in src/
- [ ] tsc groen; build groen

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npx tsc --noEmit
3. npm run build   (stop een draaiende `next dev` eerst — nooit builden naast een live dev-server)
4. Start daarna eenmalig `npm run start` (of de dev-server) en controleer:
   curl -s http://localhost:3000/kennisbank/slaaphygiene | grep -c "De verdieping is gratis"      → 0
   curl -s http://localhost:3000/kennisbank/slaaphygiene | grep -ci "hoe werkt het"               → ≥1
   curl -s http://localhost:3000/kennisbank/adaptogens | grep -c "De verdieping is gratis"        → 0
   curl -s http://localhost:3000/kennisbank/circadiaan-ritme | grep -c "De verdieping is gratis"  → 1

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat(kennisbank): tier-herziening — slaaphygiene/eiwitbehoefte publiek (tier 1), adaptogens/magnesiumvormen handtekening-uitzondering"
```

---

## 4. 30-dagen meetnotitie (Search Console + GA4)

**Vrijgegeven URL's — verwacht: impressies/kliks omhoog** (meer indexeerbare tekst, long-tail):
- /kennisbank/slaaphygiene · /kennisbank/eiwitbehoefte-na-40 (de twee acquisitie-wedstrijden)
- /kennisbank/adaptogens · /kennisbank/magnesiumvormen (handtekening — monitor of ze op
  "ashwagandha EFSA" / "magnesium bisglycinaat vs oxide"-achtige queries gaan lopen)

**Gated hoog-volume URL's — verwacht: definitie-impressies stabiel:**
- /kennisbank/cortisol · /kennisbank/testosteron · /kennisbank/vitamine-d
- Alarmgrens: dalen impressies op deze drie >25% t.o.v. de 30 dagen vóór de gate, dan is de
  teaser te dun → eerst de whatIsIt-teaser verlengen, pas daarna hertieren overwegen.

**GA4-kruispeiling:** de gate-events dragen een `term`-parameter — lees `gate_view` per term af.
Gated begrippen met veel gate_views en goede `gate_intake`-CTR bewijzen de gate; gated begrippen
met veel views en ~0% CTR zijn de volgende hertier-kandidaten. Zelfde Exploration als het
30-dagen meetplan in `fable-cursor-prompts-moat-2026-07.md` §8.

---

*Opgesteld: 5 juli 2026 (Fable-sessie tier-herziening). Geen code gewijzigd, geen commits.*
