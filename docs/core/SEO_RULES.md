# SEO RULES — PerfectSupplement

> **Layer 1 — Core.** Permanente SEO-regels. Toepassen op ELKE pagina.

---

## Site-architectuur (het spinnenweb)

### Paginatypen en hun rol

| Type | Voorbeeld | Doel |
|---|---|---|
| Pillar page | `/slaap-verbeteren-na-40` | SEO-autoriteit op breed zoekwoord, linkt naar clusters |
| Vergelijkingspagina | `/beste-magnesium` | Conversie + affiliate clicks |
| Blogpost | `/blog/cortisol-en-testosteron` | Long-tail traffic, topical authority |
| Intake flow | `/intake` | Conversie (e-mail + data) |
| Kennisbank | `/kennisbank/biobeschikbaarheid` | Semantische diepte, interne links |
| Profielpagina | `/profiel/onrustige-slaper` | SEO op profiellabel, CTA naar intake |
| Thema-hub | `/thema/slaap` | Navigatie, clustert gerelateerde content |

### Link-hiërarchie

```
Homepage
├── Pillar pages (4-6: slaap, stress, energie, hormonen, voeding, herstel)
│   ├── Blogposts (3-8 per pillar, long-tail)
│   │   └── Kennisbank-termen (inline links)
│   └── Vergelijkingspagina's (1-2 per pillar)
├── Profielpagina's (6 stuks, één per profiellabel)
│   └── Linken naar relevante pillar + vergelijking
└── Intake (/intake)
    └── Gelinkt vanaf elke pagina via CTA
```

### Interne link regels

1. Elke pagina linkt naar minimaal 2 gerelateerde pagina's (semantisch relevant, niet willekeurig)
2. Pillar pages linken naar al hun cluster-posts en vice versa
3. Vergelijkingspagina's krijgen links vanuit blogposts waar het supplement besproken wordt
4. Kennisbank-termen worden inline gelinkt bij eerste voorkomen in een tekst
5. Profielpagina's linken naar de intake en naar relevante vergelijkingspagina's
6. Turbo-snippet boven elke interne link-sectie: 1-2 zinnen context + klikstimulatie

### Follow vs. Nofollow

| Type | Rel-attribute |
|---|---|
| Alle interne links | Follow (geen `rel` nodig) |
| PubMed / wetenschappelijke bronnen | Follow |
| Affiliate links (Daisycon, Arctic Blue, Vitaminstore) | `rel="noopener noreferrer sponsored"` |
| Externe commerciële sites (geen bron) | `rel="nofollow"` |

**Canonical:** elke pagina heeft een canonical URL, ook bij query parameters.

---

## On-page SEO checklist (elke pagina)

- [ ] Unieke `<title>` tag (50-60 karakters, zoekwoord vooraan)
- [ ] `<meta name="description">` (120-155 karakters, CTA-achtig)
- [ ] Eén `<h1>` met primair zoekwoord
- [ ] Logische `<h2>` → `<h3>` hiërarchie (geen niveaus overslaan)
- [ ] Inhoudsopgave met anchor links bij >800 woorden
- [ ] Minimaal 2 interne links naar gerelateerde pagina's
- [ ] Turbo-snippet boven interne link-blokken
- [ ] Structured data (JSON-LD) passend bij paginatype
- [ ] Canonical URL
- [ ] Open Graph tags (`og:title`, `og:description`, `og:image`)
- [ ] Afbeeldingen: `alt` tekst, `width`/`height`, `next/image`
- [ ] Semantic HTML

---

## Structured Data (JSON-LD)

| Paginatype | Schema |
|---|---|
| Vergelijkingspagina | `Product` per supplement + `FAQPage` |
| Blogpost | `Article` |
| Kennisbank | `DefinedTerm` |
| Profielpagina | `BreadcrumbList` + `Article` |
| FAQ-secties | `FAQPage` |

Implementatie via `src/lib/structured-data.ts` met helpers: `generateProductSchema()`, `generateArticleSchema()`, `generateFAQSchema()`.

---

## Content Strategie — Content Kanon

### Tier 1 — Pillar pages (2000-3000 woorden)
Brede zoekwoorden: "Slaap verbeteren na 40", "Energie na 40", "Stress verminderen man", "Testosteron na 40"

### Tier 2 — Cluster blogs (800-1500 woorden)
Long-tail: "Magnesium glycinaat vs bisglycinaat", "Ashwagandha bijwerkingen", "Omega-3 hoeveel per dag"

### Tier 3 — Kennisbank (200-500 woorden)
Definities inline gelinkt: biobeschikbaarheid, chelaatvorm, adaptogeens, EPA/DHA, KSM-66

### Tier 4 — Opiniestukken (500-1000 woorden)
Positionering: "Waarom de meeste multivitamines geldverspilling zijn"

### Kalender-logica
Per maand: 1 pillar update, 2-3 cluster posts, 2-4 kennisbank-items. Nieuwe content altijd koppelen aan bestaande pagina's.

---

## Gedragsbeïnvloedende copy (Tornado-model)

Drie fasen aandacht op elke pagina:

### 1. Verdienen (< 2 sec)
- Duidelijk WAT je doet en VOOR WIE
- Primaire kleur voor Leefstijlcheck CTA
- Één focus per pagina

### 2. Vasthouden (2-10 sec)
- "Ken je dit: [situatie]" herkenningsmoment
- Hapklare blokken (~300 woorden + afbeelding)
- Progress indicator waar relevant

### 3. Verzilveren (Conversie)
- Eén primaire CTA per pagina
- Max 3-4 opties (geen keuzeparadox)
- WIIFM-framing: voordeel voor hem, niet wat jij doet

### Copy-flow per content stuk
1. **Herkenning:** "Je kent dit gevoel: 15:00, en je energie zakt"
2. **Validatie:** "Dat is niet raar. Na 40 verandert er iets"
3. **Mechanisme:** kort, geen jargon
4. **Actie:** CTA naar intake of vergelijking
5. **Bewijs:** PubMed of eigen vergelijking

---

## Technische SEO

- Server components waar mogelijk (geen onnodige client JS)
- `next/image` voor alle afbeeldingen met lazy loading
- Core Web Vitals: LCP, CLS, INP monitoren
- Geen JavaScript-afhankelijke content die Google niet kan crawlen
- Geen `<style>` tags in componenten

---

## Affiliate-content integratie

```
Blogpost → Vergelijkingspagina → Affiliate click
   ↓              ↓
 Intake CTA    Product link (nofollow+sponsored)
```

**Regels:**
- Affiliate links NOOIT in blogposts, alleen op vergelijkingspagina's
- Blogposts verwijzen naar vergelijkingspagina's als "brug"
- Dit houdt blog-content onafhankelijk en geloofwaardig

---

*Laatst bijgewerkt: mei 2026*
