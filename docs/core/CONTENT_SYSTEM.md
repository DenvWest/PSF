# CONTENT SYSTEM — PerfectSupplement

> **Layer 2 — Systems.** Hoe content wordt gebouwd: blueprints, Smart Content Module, turbo-snippets.

---

## Smart Content Module

Bij ELKE nieuwe pagina doorloop je deze 11 stappen:

0. **Raadpleeg `core/WRITING_VOICE.md`** — toon, woorden, begrip → urgentie → actie
1. **Raadpleeg `work/PAGE_ROADMAP.md`** — status en SEO-data van deze pagina
2. **Kies het juiste blueprint** (zie onder)
3. **Interne links** — welke 2-3 bestaande pagina's zijn semantisch gerelateerd?
4. **Kennisbank-indexering** — welke termen komen voor? Eerste voorkomen inline linken
5. **Profiellabel-koppeling** — welk profiel raak je aan? Link naar `/profiel/[slug]`
6. **CTA-toevoeging** — blogpost → vergelijking + intake; vergelijking → intake primair
7. **WIIFM-check** — spreek je het voordeel uit, niet het feature?
8. **Keuzestress-check** — zijn er >3 keuzes tegelijk? → vereenvoudigen
9. **Herkenning-moment** — begint de content met "Ken je dit: [situatie]"?
10. **Turbo-snippet** — voeg toe boven elke "Lees ook" sectie

---

## Blueprint 1: Vergelijkingspagina

**URL:** `/beste-[supplement]` of `/[supplement]-vergelijken`
**Doel:** Conversie via affiliate clicks

### Bestanden
```
src/app/beste-[supplement]/page.tsx
src/data/supplements/[supplement].ts
src/components/supplements/ComparisonTable.tsx (herbruikbaar)
```

### Secties (in volgorde)
1. **Metadata** — title (max 60), description (max 155), canonical, openGraph
2. **Structured Data** — Product schema per supplement + FAQPage
3. **Hero** — H1, voordeel-gerichte subheadline, CTA → /intake
4. **Waarom dit supplement** — 200-300 woorden, EFSA-claims
5. **Vergelijkingstabel** — ComparisonTable component
6. **Per product** — ProductCard met specs, voor/nadelen, affiliate link
7. **Hoe te kiezen** — keuzecriteria
8. **FAQ** — 3-5 vragen, FAQPage schema
9. **CTA** — intake CTA + "Past bij profiel X" blok
10. **Disclaimer** — MedicalDisclaimer

---

## Blueprint 2: Pillar page

**URL:** `/[onderwerp]` (bijv. `/slaap-verbeteren-na-40`)
**Doel:** SEO-autoriteit op breed zoekwoord

### Secties
1. **Metadata** + **Structured Data** (Article)
2. **Hero** — H1, herkenningsmoment, CTA
3. **Inhoudsopgave** — anchor links (>2000 woorden)
4. **Biologische context** — wat er na 40 verandert
5. **Leefstijl-interventies** — concrete acties
6. **Supplement-overzicht** — turbo-snippets → vergelijkingspagina's
7. **Profiel-herkenning** — "Herken je dit patroon?" → profielpagina
8. **CTA** — intake
9. **Bronnen** — PubMed links (follow)

---

## Blueprint 3: Profielpagina

**URL:** `/profiel/[slug]`
**Doel:** SEO op profiellabel, CTA naar intake

### 8 secties (exact deze opbouw)
1. **Hero** — H1: "[Profielnaam]: [Herkenningsvraag]", 2 zinnen, CTA → /intake
2. **Herkenning** — "Ken je dit?" 4-5 situaties, dagelijks leven
3. **Biologische verklaring** — 300 woorden, warm niet academisch, kennisbank-links
4. **Quick wins + supplementen** — 3 quick wins + max 2 supplementen met turbo-snippet
5. **4-weken plan** — week 1: quick wins, week 2-3: leefstijl, week 4: herhaalmeting
6. **CTA blok** — "Ontdek Jouw Profiel" → /intake
7. **Cross-links** — pillar, vergelijking(en), gerelateerd profiel
8. **Disclaimer** — MedicalDisclaimer + profiel-specifiek

Zie `systems/PERSONALIZATION_ENGINE.md` voor complete profiel-architectuur.

---

## Blueprint 4: Blogpost

**URL:** `/blog/[slug]`
**Doel:** Long-tail traffic, topical authority

### Secties
1. **Metadata** + **Structured Data** (Article)
2. **Hero** — H1, herkenningsmoment, categorie-label
3. **Inhoudsopgave** (bij >800 woorden)
4. **Content** — 800-1500 woorden, kennisbank-termen inline gelinkt
5. **Vergelijking-link** — turbo-snippet → relevante vergelijkingspagina
6. **CTA** — intake
7. **Gerelateerde artikelen** — 2-3 links met turbo-snippets

---

## Blueprint 5: Kennisbank

**URL:** `/kennisbank/[slug]`
**Doel:** Semantische diepte, interne links

### Secties
1. **Metadata** + **Structured Data** (DefinedTerm)
2. **Definitie** — 1-2 zinnen, direct antwoord
3. **Uitleg** — 200-500 woorden, praktisch
4. **Relevantie voor 40+** — waarom het ertoe doet
5. **Gerelateerde content** — 2-3 links

---

## Turbo-snippets bibliotheek

### Vergelijkingspagina's

| Van → Naar | Turbo-snippet |
|---|---|
| Homepage → `/beste-omega-3-supplement` | "Welke omega-3 is écht goed? Objectief vergeleken →" |
| Homepage → `/beste-magnesium` | "Welke magnesium past bij jou? Vergelijk op vorm en prijs →" |
| Homepage → `/beste-ashwagandha` | "Stress? Dit supplement wordt het meest onderzocht →" |

### Pillar pages

| Van → Naar | Turbo-snippet |
|---|---|
| Pillar slaap → `/beste-magnesium` | "Welke magnesium vorm werkt het best voor slaap? Vergeleken →" |
| Pillar slaap → `/beste-ashwagandha` | "Stress houdt je wakker? KSM-66 vs Sensoril — het verschil matteert →" |
| Pillar slaap → `/profiel/onrustige-slaper` | "Wakker om 3 uur? Herken je dit patroon? →" |

### Profielpagina's

| Van → Naar | Turbo-snippet |
|---|---|
| Profiel slaper → Pillar slaap | "Slecht slapen na 40? Complete gids van oorzaak tot oplossing →" |
| Profiel slaper → `/beste-magnesium` | "Welke magnesium past bij jouw slaapklachten? →" |
| Profiel slaper → `/beste-ashwagandha` | "Stress houdt je wakker? Dit supplement kan helpen →" |

### Intake CTA (universeel)
- "Ontdek in 3 minuten welke supplementen bij jou passen →"
- "In 3 minuten weet je hoe je scoort — en welk profiel bij jou past."

---

*Laatst bijgewerkt: mei 2026*
