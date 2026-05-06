# PerfectSupplement — Page blueprints

Interne blueprint voorpaginatypen. SEO-, component- en data-afspraken staan ook in [`CLAUDE.md`](CLAUDE.md).

---

## Blueprint 1: Homepage

**Doel:** Herkenning (symptomen 40+), vertrouwen, primaire CTA naar Leefstijlcheck, secundaire routes naar hub/pillars.

**URL:** `/`

**Kernelementen:** Hero (symptoomgericht), trust-blokken, interne links naar thema’s/supplementen/pillar-content, minimaal één duidelijke CTA naar `/intake`.

**Metadata:** Unieke title + description; canonical `/`.

---

## Blueprint 2: Leefstijlcheck (intake flow)

**Doel:** 12 vragen → scoring → Herstelplan; geen harde medische claims.

**URL:** `/intake`

**Kernelementen:** Fase-navigatie, rate limiting, sessie naar Supabase (`intake_sessions`), CTA’s naar relevante vergelijkingen/gidsen in resultaat.

**Metadata:** Eigen title/description; geen indexing van tussenstappen indien `noindex` gewenst.

---

## Blueprint 3: Productvergelijking

**Doel:** Conversie + affiliate; onafhankelijke vergelijking op criteria.

**URL-patroon:** `/beste-[categorie]` (bijv. `/beste-magnesium`, `/beste-omega-3-supplement`)

**Kernelementen:** JSON-LD (o.a. Product waar van toepassing), tabel, productcards, `BuyingGuide`, FAQ, affiliate disclosure, link naar **Supplementgids** (`guideHref` op `ComparisonPageData`).

**Affiliate:** `rel="nofollow sponsored"`; geen gesponsorde content in doorsnee blog.

---

## Blueprint 4: Pillar / lange onderwerptekst

**Doel:** SEO-autoriteit op breed thema (slaap, stress, energie); brug naar thema’s, gids en intake.

**URL-patroon:** o.a. `/slaap-verbeteren-na-40`, vergelijkbaar pillar-slug.

**Kernelementen:** Koppenhiërarchie, inhoudsopgave bij >800 woorden, turbo-snippets bij interne links, CTA naar `/intake`, links naar Supplementgids waar relevant.

**Geen affiliate** in pillar-body (affiliate alleen op vergelijkingspagina’s).

---

## Blueprint 5: Kennisbank-term

**Doel:** Uitlegterm (definitie/mechanisme); ondersteuning van gids-, blog- en pillar-content.

**URL-patroon:** `/kennisbank/[slug]`

**Kernelementen:** Definitie + context, gerelateerde interne links (gids, blog, thema), metadata + Article/FAQ waar passend.

**Affiliate:** Nee.

---

## Blueprint 6: Supplementgids

### Doel

Educatieve gids per supplement: wat het doet, waarom het relevant is na 40, welke vorm je kiest, en bij welke klachten het past. Geen productverkoop — dat doet de vergelijkingspagina. De gids is de evidence-laag die de vergelijking geloofwaardig maakt, en de brug tussen thema-pagina’s en productkeuze.

### Positie in het spinnenweb

```
Thema (/thema/stress)
  ↓ "Lees de gids →"
Supplementgids (/supplementen/magnesium)           ← Dit blueprint
  ↓ "Welke scoort het beste? →"     ↓ "Wat verbetert nog meer? →"
Vergelijking (/beste-magnesium)     Thema of Pillar (/slaap-verbeteren-na-40)
  ↓                                   ↓
Affiliate klik                      Leefstijlcheck (/intake)
```

### Verschil met andere paginatypen

| | Supplementgids | Vergelijkingspagina | Pillar page |
|---|---|---|---|
| **Focus** | Eén supplement, alle vormen | 3–4 producten vergelijken | Breed onderwerp (slaap, stress) |
| **Doel** | Educatie + vertrouwen | Conversie + affiliate | SEO-autoriteit |
| **Affiliate links** | Nee | Ja | Nee |
| **CTA** | Tweeledig (vergelijking + leefstijl) | Leefstijlcheck + product | Leefstijlcheck |
| **Woordenaantal** | 1200-2000 | 1500-2500 | 2500-3500 |

### URL-patroon

`/supplementen/[supplement]`  
_App Router-dynamic segment heet **`supplement`** (niet `slug`)._

### Bestandslocaties (implementatie)

```
src/app/supplementen/[supplement]/page.tsx   ← dynamische route
src/data/supplementen/<slug>.ts              ← één module per supplement
src/data/supplementen/index.ts               ← export + ALL_SUPPLEMENT_SLUGS
src/types/supplementen.ts                     ← SupplementData-interface
```

_Niet gebruikt als enkelbron: platte `supplement-guides.ts` — gesplitste modules onderhouden._

### Extra sectie (aanbevolen)

**“Waar let je op bij het kiezen?”** (`waarOpLetten`): criteria-lijst als brug tussen educatie en productvergelijking — geen merken/prijzen.

### Melatonine (scope)

Staat als **aanvullende gids** naast magnesium, omega-3, vitamine D, creatine en zink: `/supplementen/melatonine` + `/beste-melatonine`. Niet in elke roadmap-tabel gesomd, wél live in codebase.

### Sectie-structuur

1. **Metadata** — `metaTitle` (≤60 tekens waar mogelijk), `metaDescription` (≤155), canonical, OG.
2. **Structured data** — `Article`, `FAQPage`, **`BreadcrumbList`** (`buildBreadcrumbSchema` uit `@/lib/structured-data`): Home → Supplementen → naam.
3. **Breadcrumb + hero** — Geen primaire CTA in hero.
4. **Wat het doet** — sectie `#wat-doet` (inhoudelijke id’s kunnen per implementatie licht verschillen); inline link naar eerste relevante `/kennisbank/[term]` in `watIsHet.tekst` (Markdown-links via `renderInlineMarkdownLinks`).
5. **Waarom na 40** — 4 cards, 2×2 / stack mobiel.
6. **Welke vorm** — VormCards met dosering + use-case-tag; géén merken/prijzen.
7. **Bij jouw klachten** — 3 cards → `/thema/[thema]`.
8. **FAQ** — 3–5 items; accordions; gekoppeld aan FAQ JSON-LD.
9. **CTA vergelijking** — sage-achtige achtergrond; primaire conversie naar `/beste-…`.
10. **Verdieping** — 2–3 bloglinks (kaarten).
11. **CTA Leefstijl** — `/intake`.
12. **Disclaimer** — `<MedicalDisclaimer />`.

### Tweeledig CTA-model

| CTA | Positie | Linkt naar |
|---|---|---|
| Vergelijking | Na FAQ | `/beste-[categorie]` |
| Leefstijlcheck | Onderaan | `/intake` |

### Datamodel (`SupplementData`)

Zie [`src/types/supplementen.ts`](src/types/supplementen.ts): Nederlandse sleutels (`watIsHet`, `waaromRelevant`, `vormenDosering`, `waarOpLetten`, `gerelateerdeSymptomen`, `faq`, `blogLinks`, `productVergelijkingCta`). Optioneel elders: `relatedKennisbank`-array voor tooling — niet verplicht; links kunnen in Markdown in `watIsHet.tekst`.

### Vergelijking → gids

Op productvergelijking wordt `BuyingGuide` gevoed met optionele **`guideHref`** (`ComparisonPageData`) en linktekst **“Lees de volledige gids →”**.

### Turbo-snippets (richting)

Handhaaf korte snippets bij thema ↔ gids, gids ↔ vergelijking, vergelijking ↔ gids (zie oorspronkelijk ontwerp-document).

### Design

Container `max-w-7xl`; DM Serif/display voor koppen waar afgestemd op hub; supplement-specifieke CTA-kleuren volgens [`CLAUDE.md`](CLAUDE.md).

### Checklist (per gids)

- [ ] 1200-2000 woorden (streven)
- [ ] H1 in lijn met “welke vorm past bij jou” / vergelijkbaar
- [ ] Breadcrumb + BreadcrumbList JSON-LD
- [ ] Alle relevante vormen + FAQ + tweeledige CTA
- [ ] Geen affiliate op gids-pagina
- [ ] `npm run build` groen

---

_Einde blueprint-document._
