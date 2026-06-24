# Prompt — Supplementhub acquisitie, T0-instap & deal-positionering (PerfectSupplement)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude in een nieuw gesprek. Claude levert **alleen analyse** (A t/m G), geen code. Voeg optioneel toe: `CLAUDE.md`, `docs/core/IA_ECOSYSTEEM.md`, `docs/core/BRAND_POSITIONING.md`, `docs/core/AFFILIATE_SYSTEM.md`.

---

## Waarom deze prompt

De `/supplementen`-hub is live maar nog niet de sterke acquisitie-ingang die het kan zijn. Dennis twijfelt of het een **supplementhub-shop** moet worden (met `/beste/*`-vergelijkingen als extra categorie), en wil de **T0-instap** herpositioneren: gratis vragenlijst (Leefstijlcheck) + perks, waarbij PSF het onafhankelijke platform wordt dat op kwaliteit vergelijkt én laat zien wáár op dat moment de beste deal/laagste prijs is — niet dat PSF zelf korting geeft.

| Richting | Staat nu | Gap |
|----------|----------|-----|
| **Hub als acquisitie-ingang (T0)** | Hero pusht intake; sessie-gated "Aanbevolen" | Geen expliciete T0-laag met perks; hub is catalogus, geen conversie-funnel |
| **Shop vs. gescheiden assen** | Catalog heeft `guideHref` + `comparisonHref` naast elkaar | IA-regel §3/§7 houdt `/beste/*` bewust gescheiden; `/gidsen` is derde overlappende ingang |
| **Deal / laagste prijs** | Vergelijkingen tonen prijs per dag; geen deal-signaal | Geen "beste deal"-positionering; merkverbod §7 op kortingscodes als hoofdboodschap |
| **Onderbouwing via content** | Gidsen en `/inzichten` bestaan los | Geen expliciete evidence-brug van hub/gids naar `/inzichten` |
| **Professioneel ontwerp** | Functionele hub-layout | Geen doordachte IA/UX voor de nieuwe rol als acquisitie-ingang |

**Belangrijk:** "T0" in deze prompt = **acquisitie/instap-laag** (gratis funnel-instap), **niet** `interventions.tier` (1–5 in `STEPPED_CARE_MODEL.md`).

### Verificatie-bronnen (optioneel voor Claude)

| Onderwerp | Pad |
|-----------|-----|
| Hub-pagina + secties | `src/app/supplementen/page.tsx` |
| Hub-componenten | `src/components/supplement-hub/` (`HubHero`, `SupplementCatalog`, `ThemaGrid`, `RecommendedForYou`, `CategoryNav`, `SupplementCatalogCard`) |
| Catalog-data | `src/data/supplement-hub/catalog.ts` (`guideHref`, `comparisonHref`, `topScore`, `themas`) |
| Gids-pagina's | `src/app/supplementen/[supplement]/page.tsx` |
| Vergelijkingspagina's | `src/app/beste/[supplement]/page.tsx` |
| Overlappende ingang | `src/app/gidsen/page.tsx`, `src/app/gidsen/[slug]/page.tsx` |
| Nav | `src/components/layout/HeaderClient.tsx` |
| IA-ecosysteem | `docs/core/IA_ECOSYSTEEM.md` (§3 vergelijkingen als aparte as; §7 ontdubbelen) |
| Merkpositionering | `docs/core/BRAND_POSITIONING.md` (§7: geen kortingscodes als hoofdboodschap) |
| Affiliate | `docs/core/AFFILIATE_SYSTEM.md`, `src/data/affiliate-links.ts` |
| Stepped-care / één pad | `docs/core/STEPPED_CARE_MODEL.md`, `src/lib/content/plan-content.ts` |
| Inzichten-feed | `src/app/inzichten/`, `src/data/insights.ts`, `src/data/kennisbank.ts` |
| Punten/perks-alternatief | `docs/plan/PLAN_VITALITEIT_PUNTEN_COMMUNITY.md` (§6: Spoor A GO, Spoor B NO-GO) |
| Design tokens | `docs/core/DESIGN_TOKENS.md` |
| Events / meting | `src/lib/events.ts`, `src/lib/ga4.ts`, `src/lib/clarity.ts` |

---

## Prompt (copy-paste)

```text
ROL: Je bent senior product architect + UX-strateg op PerfectSupplement
(Next.js 16 App Router, TS strict, Supabase + RLS, affiliate-monetisatie).
Lees CLAUDE.md mee. Lever UITSLUITEND een ANALYSE. Geen code, geen diffs,
geen edits, geen "ik ga nu bouwen". Als je twijfelt of iets analyse of bouwen is:
het is analyse.

DOEL: Analyseer hoe de /supplementen-hub sterker neergezet kan worden als
acquisitie-ingang (T0), inclusief de kernbeslissing shop-vs-gescheiden-assen,
de verdedigbaarheid van "beste deal/laagste prijs"-positionering, onderbouwing
via /inzichten, en een professionele ontwerp/UX-richting. Lever een gefaseerd
aanpakplan met meetpunten.

STRATEGISCHE INTENTIE VAN DENNIS (neem dit als input, niet als vaststaand besluit):
- T0 = acquisitie/instap-laag: de supplement(hub) wordt gratis instappunt
  (vragenlijst/Leefstijlcheck) met perks om te converteren.
- "Korting" = PSF geeft zelf GEEN korting. PSF wil het onafhankelijke platform
  zijn dat alles op kwaliteit controleert en laat zien wáár op dat moment de
  beste deal/laagste prijs is. Eventueel later een directe deal (Arctic Blue).
  Of dit verdedigbaar is t.o.v. de Consumentenbond-positionering is een
  analysevraag — niet aannemen dat het goed is.
- Blog/kennisbank (/inzichten) moet als onderbouwing aan supplement(hub)/gidsen
  koppelen.
- Dennis twijfelt: supplementhub-shop (met /beste/* als extra categorie) vs.
  huidige IA-scheiding. Jij moet één aanbeveling geven.

CODEBASE-REALITEIT (geverifieerd, neem dit als waar aan):

1) Huidige /supplementen-hub (src/app/supplementen/page.tsx):
   - Secties: HubHero → SupplementCatalog ("Alle supplementgidsen") →
     RecommendedForYou (sessie-gated) / intake-CTA → ThemaGrid →
     "Waarom PerfectSupplement?" (3 kolommen) → MedicalDisclaimer.
   - HubHero: h1 "Welk supplement past bij jou?"; CTA naar /intake of
     #aanbevolen (bij sessie-cookie).
   - SupplementCatalog: filter op thema's (slaap/stress/energie/herstel) via
     CategoryNav; grid van SupplementCatalogCard.
   - Catalog-data (src/data/supplement-hub/catalog.ts): 8 entries met
     guideHref (/supplementen/*), comparisonHref (/beste/*), topScore,
     wiifm (EFSA-claims), themas. Melatonine: comparisonHref = null
     (geen /beste/melatonine — compliance).
   - SupplementCatalogCard: toont "Lees de gids →" + "Vergelijk →" als
     aparte links (guideHref vs comparisonHref).

2) Drie overlappende supplement-ingangen (IA-probleem):
   - /supplementen — canonische hub (8 gidsen + links naar vergelijkingen).
   - /gidsen — derde ingang (src/app/gidsen/), in nav naast Supplementen.
   - /beste/* — affiliate-vergelijkingspagina's (aparte commerciële as).
   IA_ECOSYSTEEM.md §7 markeert /gids · /gidsen · /supplementen als te ontdubbelen.
   Nav (HeaderClient.tsx): Supplementen · Inzichten · Gidsen.

3) Harde IA-regel: vergelijkingen zijn GEEN content-type.
   - IA_ECOSYSTEEM.md §3: "/beste/* = aparte affiliate-as, niet vermengen met content."
   - AFFILIATE_SYSTEM.md: affiliate links NOOIT in blogposts/content — alleen op
     vergelijkingspagina's. Content flow: blog → turbo-snippet → vergelijking → shop.
   - Dit beschermt de "Consumentenbond"-positionering.

4) Affiliate-realiteit (beperkingen voor "deal"-positionering):
   - Partners: Daisycon (Vitaminstore, VitalNutrition) + Arctic Blue direct
     (Awin, sld=dennisvanwestbroek). Arctic Blue NOOIT vervangen door Daisycon.
   - PSF beheert merchant-prijzen NIET. Prijzen zijn statisch in datafiles
     (src/data/supplements/*). Geen live prijsfeed.
   - Sub-ID: [supplement]-vergelijking. Click tracking: affiliate_clicks (niet wijzigen).
   - Cashback/rebate uit eigen commissie = contractueel risico bij affiliate-netwerken.

5) Merkverbod en perks-alternatief:
   - BRAND_POSITIONING.md §7: "Korting-codes of exclusieve deals als hoofdboodschap
     (ondermijnt Consumentenbond-positionering)."
   - PLAN_VITALITEIT_PUNTEN_COMMUNITY.md §6: Spoor A (punten → leefstijl-unlock) = GO;
     Spoor B (punten → supplementkorting/cashback) = NO-GO structureel.
   - Stepped-care (STEPPED_CARE_MODEL.md): één pad, engine bepaalt volgorde;
     tier 3 supplement komt NA tier 1-2 (gratis actie + meten). Hub als shop
     kan dit pad omzeilen als hoofdboodschap.

6) Content/onderbouwing:
   - /inzichten = één feed (blog + kennisbank samen), filterbaar op domein × type.
   - Types: Artikel · Deep dive · Checklist · Begrip. Geen affiliate in content.
   - Kennisbank-data: src/data/kennisbank.ts (aparte insightTier 1-3 schaal).
   - Gidsen: src/app/supplementen/[supplement]/page.tsx — informatief, neutraal.

7) Design context:
   - Light marketing thema: warm bg #F7F5F0, ps-green CTA, DM Serif Display + DM Sans.
   - Hub gebruikt al warm bg in hero en catalog-sectie.
   - Intake/dashboard = dark world (sage + terra) — hub is licht marketing-wereld.

LEVER DEZE ANALYSE (en niets anders):

A. Huidige staat — eerlijke inventarisatie:
   - Wat doet /supplementen nu goed (conversie, SEO, vertrouwen)?
   - Wat is dubbel/conflict met /gidsen en /beste/*?
   - Waar verliest de bezoeker het pad (anoniem → intake → vergelijking)?
   - Score de hub op: herkenning, vertrouwen, actie, monetisatie (1-5 elk).

B. Kernbeslissing — supplementhub-shop vs. gescheiden assen:
   - Variant 1: Hub als "shop" — /beste/* vergelijkingen als categorie/tab ín de hub
     (naast gidsen en thema's).
   - Variant 2: Hub als "gids + intake-ingang" — vergelijkingen blijven aparte as,
     hub linkt ernaar maar vermengt niet.
   - Variant 3: Hybride — hub toont "beste keuze" teaser per supplement (kwaliteit +
     prijs-signaal) maar volledige vergelijking op /beste/*.
   Voor elk: voor/tegen t.o.v. Consumentenbond-moat, affiliate-flow, SEO, compliance.
   Één aanbeveling met onderbouwing. Wat gebeurt met /gidsen in elk scenario?

C. T0 acquisitie-laag — vragenlijst + perks:
   - Hoe positioneer je de Leefstijlcheck als T0-instap OP de hub (niet alleen CTA)?
   - Welke perks zijn on-brand om te converteren (account, persoonlijke aanbeveling,
     punten/leefstijl-unlock uit Spoor A) vs. off-brand (korting, cashback)?
   - Hoe blijft dit consistent met stepped-care (leefstijl eerst, supplement tier 3)?
   - Wat is de minimale T0-bundle (gratis instap + 1 perk) die waarde levert zonder
     de één-pad-regel te breken?

D. "Beste deal / laagste prijs" — verdedigbaarheid:
   - Is "wij tonen waar de beste deal is" verdedigbaar als PSF:
     (a) eerst op kwaliteit vergelijkt (dosering, vorm, biobeschikbaarheid),
     (b) daarna prijs/deal als secundair signaal toont,
     (c) geen eigen korting geeft maar merchant-deals signaleert?
   - Toets aan: BRAND_POSITIONING §7, AFFILIATE_SYSTEM (prijzen niet beheerd),
     Omnibus/Prijzenwet (misleidende korting), cashback-risico Daisycon/Awin.
   - Arctic Blue direct-dealpad: wanneer verdedigbaar, wanneer niet?
   - Hoe scheid je redactionele kwaliteitskeuze van prijssignaal in UI/copy zodat
     "objectief" geloofwaardig blijft?
   - GO / CONDITIONEEL / NO-GO per mechanisme (deal-signaal, prijsvergelijking,
     direct coupon, cashback).

E. Onderbouwing-koppeling — /inzichten als evidence-laag:
   - Hoe koppelt /inzichten (ex-blog/kennisbank) aan hub, gidsen en vergelijkingen
     zonder affiliate-links in content te brengen?
   - Welke content-types (Deep dive, Begrip, Checklist) per supplement-slug?
   - Turbo-snippet-patroon: hub/gids → evidence-artikel → vergelijking (AFFILIATE_SYSTEM flow).
   - Minimaal 2 interne links per pagina (SEO-standaard): concreet voorstel per pagina-type.

F. Professionele ontwerp/UX-richting (conceptueel, geen code):
   - Voorgestelde sectie-volgorde en hiërarchie voor de nieuwe hub (hero, T0-instap,
     catalog, vergelijking-teaser of shop-categorie, evidence-blok, thema's, trust).
   - Mobiel-eerst (375px): wat ziet de bezoeker eerst, wat scrollt weg?
   - Visuele differentiatie: gids (informatief) vs. vergelijking (commercieel) vs.
     T0-instap (conversie) — zonder de licht marketing-wereld te breken.
   - Copy-richting voor hero + T0 (herkenning → vertrouwen → actie; geen diagnose-taal).
   - Referentie DESIGN_TOKENS.md: warm bg, ps-green CTA, geen dark-world op hub.

G. Fasering, risico's & meetpunten:
   - Geordende roadmap (Fase 0..n): doel, afhankelijkheid, definition of done.
   - Top 5 risico's + open vragen voor Dennis.
   - Meetpunt per nieuwe CTA/verbinding (hergebruik bestaande events vóór nieuwe):
     - affiliate.click (bestaand) voor vergelijking-kliks
     - profile.recognition, remeasure.* waar relevant
     - GA4 trackEvent + Clarity clarityTag voorstellen (geen PII)
     - Nieuw client-event alleen met 3 registratieplekken (events.ts +
       intake-events-client.ts + /api/intake/events/route.ts allowlist)

FORMAAT: beknopt, kopjes + bullets, geen tabellen langer dan nodig. Nederlands.
Geen code. Sluit af met: "Aanbeveling: <de ene volgende stap die ik zou nemen>".
```

---

## Na de analyse

1. Bewaar Claude's output (bijv. `docs/analyse/supplementhub-acquisitie-analyse.md`).
2. Kies één fase uit sectie G als aparte **implementatie-opdracht** (Cursor-prompt of Claude Code).
3. De shop-vs-as-keuze (sectie B) en T0-perks (sectie C) zijn blokkeerders voor ontwerp (sectie F) — neem die beslissingen vóór je bouwt.

*Prompt versie: juni 2026 — supplementhub acquisitie, T0-instap, deal-positionering & onderbouwing.*
