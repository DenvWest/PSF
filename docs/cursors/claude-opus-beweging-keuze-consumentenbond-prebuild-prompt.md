# Prompt — Beweging: maak-een-keuze als Consumentenbond-keten (HTML-prebuild)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (Artifacts / Claude.ai).  
> **Output:** één self-contained HTML-bestand (prebuild). Geen React, geen repo-patches.  
> **Opgesteld:** 2 augustus 2026 — productmodel vastgelegd in gesprek (optie A herzien: commercieel ín de keuze).  
> **Doelbestand na review:** `docs/design/beweging-keuze-consumentenbond-prebuild-2026-08.html`

## Plaats in de reeks


| Doc                                              | Relatie                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Dit document                                     | **Nieuwe lock** — keuze = basis + partners/producten/diensten → Favorieten + Mijn Dag → meten |
| `BESLUIT_BEWEGING_PRODUCT_EN_IA.md`              | Deels **pivot**: geen intensiteit-picker als kern; hergebruik surface-namen waar nuttig       |
| `BESLUIT_FIT_PREFS.md`                           | Dual readout: Bond vast; fit = lens/filter — geen samengevoegd cijfer                         |
| `voortgang-conversiekaart-prebuild-2026-07.html` | Kwaliteitslat voor HTML-prebuilds + Favorieten/Beste-denkwijze                                |
| `DESIGN_TOKENS.md` / `.ps-dark`                  | Visuele tokens                                                                                |

> **Timing (aug 2026):** v3-prebuild bestaat al. **Geen nieuwe visie-prompt** over fit-prefs vóór
> pre-E / E. Bij B-revisie of B-implementatie: `BESLUIT_FIT_PREFS.md` als lock meenemen.


## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Kopieer het volledige blok onder **Prompt (copy-paste)**.
3. Optioneel: plak 1–2 screenshots van huidige Beweging “maak een keuze” als “dit NIET”.
4. Review in browser op 375px → opslaan onder `docs/design/` als je tevreden bent.

---

## Prompt (copy-paste)

```text
## Rol
Je bent Senior product designer + UX-architect + front-end craft lead voor PerfectSupplement
(perfectsupplement.nl) — de Consumentenbond van leefstijldomeinen voor mannen 40+.

Je levert GEEN analyse-essay en GEEN React. Je levert één self-contained HTML-prebuild
(Artifacts of downloadbaar .html) die het nieuwe Beweging-keuzemodel voelbaar maakt.

## Product — wat dit IS (gelockt)

PerfectSupplement is GEEN stomme log-app en GEEN tip-app met vage leefstijluitleg.
Na de Leefstijlcheck (vragenlijst) gebeurt per domein dit:

1) BASISADVIES — meteen zichtbaar op Beweging én op Mijn Dag.
   Moment koppelen = optioneel (alleen als de gebruiker dat wil).
2) MAAK EEN KEUZE — duidelijkere opties die OOK partners, producten en diensten
   bevatten (niet alleen “kracht / conditie”).
   Twee lenzen om aanbod te tonen:
   - Postcode → lokaal (diensten/partners bij jou)
   - Best voor leeftijd + Leefstijlcheck → ranking op profiel
   Ranking op profiel = FIT-LENS (sorteer/filter). Consumentenbond-oordeel per kaart
   blijft vast (gecheckt/sterk/zwak/niet). NOOIT fit×bond tot één cijfer mengen.
   Fit-dimensies (locatie / begeleiding / prijs / reviews): zie
   docs/design/BESLUIT_FIT_PREFS.md — max 4, discrete ankers, niet in dag-0-intake.
3) Gekozen optie → direct Favorieten + (optioneel) Mijn Dag / moment.
4) DAARNA METEN: eigen review, later wearables, 14-dagen hertest, 30-dagen hertest.
   Tijdens: max één evaluatievraag per mail — geen mini-enquête.

Niet alles slopen: herordenen. Basis soft-sporen (kracht/conditie/dagelijks ritme)
blijven als basislaag. Commercieel komt UIT dezelfde “maak een keuze”.

Positionering: Consumentenbond — oordeel/kwaliteit eerst; affiliate/partner volgt
het oordeel. Fit past het aanbod aan JOU; herschrijft het oordeel niet.
Geen shop-schap, geen diagnose-taal, geen medische claims.

## Taak
Bouw één self-contained HTML-bestand: “Beweging — keuze Consumentenbond prebuild”.

Mobile-first 375px, ook bruikbaar ≥1280px. Dark forest dashboard-look.

Toon deze STATES (switcher bovenaan of tabs — mock, geen backend):

A) NET NA TEST — basisadvies zichtbaar
   - Eyebrow: Beweging · op basis van je Leefstijlcheck
   - Concreet basisvoorstel (bijv. “2× kracht thuis, 25–40 min”) + 1 zin waarom voor DIT profiel
   - Primary: “Zet op Mijn Dag”
   - Secondary tekst: “Koppel een moment (optioneel)”
   - Duidelijke deur naar “Maak een keuze” (meer opties / partners)

B) MAAK EEN KEUZE — hoofdscreen (het hart van deze prebuild)
   - Korte intro: wat je kiest landt in Favorieten en kan op Mijn Dag
   - Twee lenzen (tabs of segmented control):
     1. Voor jou (leeftijd + Leefstijlcheck)
     2. Bij jou (postcode) — toon een postcode-veld (mock, bijv. 1012) + resultaten
   - Optielijst gemengd maar SCANNABLE, met type-badge per kaart:
     · Basis — Kracht
     · Basis — Conditie
     · Basis — Dagelijks ritme
     · Partner / dienst (lokaal of online)
     · Product (supplement of hulpmiddel — redactioneel kader, GEEN prijs-shopgrid)
   - Elke optie-kaart bevat:
     titel · 1 zin waarom voor dit profiel of deze postcode · type-badge ·
     kwaliteitschip (bijv. “Beoordeeld op dosering / reviews / past bij 40+”) ·
     twee acties: “Bewaar in Favorieten” en “Zet op Mijn Dag”
   - Minimaal 5 mock-opties over beide lenzen heen (hergebruik mag per lens filteren)
   - Na tik op een actie: inline bevestiging (“In Favorieten” / “Staat op Mijn Dag · wo 18:00”)
     + next-step regel: “Over 14 dagen meten we of dit voor jou werkt”

C) GEKOZEN — samenvatting
   - Wat gekozen is (basis of partner/product/dienst)
   - Waar het leeft: Favorieten ✓ · Mijn Dag ✓ (of “nog geen moment”)
   - Meet-pad zichtbaar: Review · 14 dagen · 30 dagen (14/30 mogen “binnenkort” zijn,
     review mag als eenvoudige 1–5 of “werkt wel/niet” stub)
   - Geen dead-end: altijd één duidelijke volgende stap

D) (Optioneel, compact) MIJN DAG-snippet
   - Toon hoe het blok op Mijn Dag eruitziet als het gekoppeld is (zelfde titel, domein Beweging)

## Visueel · tokens (hard)
Dark world (dashboard):
- bg #1a2e1a · radial highlight #21381f
- sage CTA #5A8F6A · CTA-tekst #0f1c10
- terra warmte #C8956C (geen tweede CTA-fill)
- beweging-identiteit #C26E4B (accentlijn/eyebrow, niet als primary button)
- ink #F1EFE8 · soft #CDD7D0 · mut #9FB0A6
- panels: rgba(255,255,255,0.05) · border rgba(255,255,255,0.12)
Typography: DM Serif Display (headings) + DM Sans (body) via Google Fonts.
Één compositie per viewport — geen card-soup van 6 gelijke tiles.
Kaarten alleen waar interactie zit.
CSS-only motion (subtiel enter / press) + prefers-reduced-motion.
Geen Framer, geen Lottie, geen emoji als iconografie (simpele SVG ok).
Geen floating badges op een hero-foto. Atmosfeer mag subtiel (gradient/texture),
geen wellness-spa / paars-glow / cream-terracotta cliché.

## Copy · stem
Nederlands. Jij/jou. Mannen 40+. Kort, concreet, peer-to-peer.
Geen diagnose, geen “boost”, geen hype, geen “koop nu”.
Wel: herkenning → waarom dit voor jou → actie → hoe we later meten.
Disclosure-toon bij commercieel: “We verdienen aan sommige links; het oordeel
gaat vóór de link.” (één korte regel, geen legal wall)

## Mock-inhoud (verplicht, realistisch)
Profielvoorbeeld: man 47, beweegscore matig, wil spierbehoud / energie.
Postcode-voorbeeld: 5211 (Den Bosch) of 1012 — kies er één en blijf consistent.

Voorbeeld-opties (pas labels aan, houd types):
1. Basis — Kracht thuis 2×/week
2. Basis — Conditie: stevig wandelen 3×
3. Dienst lokaal — PT-intake bij partner X (postcode)
4. Dienst/online — begeleidingstraject / sportschool-keten (best-voor-profiel)
5. Product — magnesium alleen als redactioneel kader “ter ondersteuning van …”
   met chip “eerst leefstijl / of aanvullen na X dagen” — GEEN harde medische claim

## Harde verboden
- GEEN React/Next/Tailwind-build — pure HTML+CSS(+minimaal JS voor tabs/states)
- GEEN drie intensiteitskaarten Herstel/Matig/Trainen als kern van “maak een keuze”
- GEEN productgrid met prijzen als hero
- GEEN shop-URL’s die doen alsof checkout in-app is (CTA = Favorieten / Mijn Dag;
  “Bekijk oordeel” mag als ghost-tekstlink)
- GEEN nep-wearable-dashboard alsof live; wearable = één eerlijke “later”-regel in state C
- GEEN Engelse UI-strings
- GEEN Lorem ipsum

## Acceptatiecriterium
- [ ] Op 375px snapt een nieuwkomer in ≤10 seconden: basis staat klaar, én ik kan
      partners/producten/diensten kiezen
- [ ] “Maak een keuze” toont BEIDE lenzen (profiel + postcode)
- [ ] Elke optie kan naar Favorieten én Mijn Dag (gedemonstreerd in UI)
- [ ] Moment-koppeling is optioneel, niet verplicht
- [ ] Meet-pad (review / 14d / 30d) is zichtbaar na keuze
- [ ] Voelt Consumentenbond + professioneel, niet habit-log of tip-app
- [ ] Self-contained één HTML-bestand, werkt offline in de browser

## Output-formaat
1. Korte notitie bovenaan in een HTML-comment OF een kleine “Ontwerpnotitie”-sectie
   (max 8 regels): wat dit bewijst vs huidige intensiteit-picker.
2. Daarna de werkende prebuild.
3. Geen lange essay buiten de HTML.
```

