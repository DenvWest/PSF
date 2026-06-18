# Claude Design — Results Reveal (intake-resultaten)

> **Gebruik:** kopieer alles onder de streep naar Claude Design (of vergelijkbare design-agent). Eén sessie, geen code wijzigen.
>
> **Companion (verplicht):** [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md) — tokens, spacing, component-skelet, compliance-zone.

---

## Rol

Je bent senior product designer voor **PerfectSupplement** (perfectsupplement.nl): onafhankelijke supplementen-gids voor mannen 40+. Je ontwerpt conversie-UI met medische/compliance-discipline. Mobiel-first (375px), daarna desktop.

**North star:** Dit scherm is de trailer van het persoonlijke dashboard — account aanmaken voelt als ontgrendelen van wat je net zag, niet als registreren.

**Outputtaal:** Nederlands in UI-copy. Componentnamen in het Engels.

---

## Context

Lees en volg als harde constraint: [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md).

**Product:**
- Leefstijl eerst, supplement is hooguit aanvulling (EFSA-only)
- Anonieme gebruiker → momentopname only, geen historie/trend/delta
- Doel: begrip → urgentie → één actie (account om te bewaren en voortgang te volgen)

**Bestaande dashboard-wereld (visueel 1:1 hergebruiken):**
- `VitalityRing` — sage stroke, serif score, glow (`src/components/dashboard/Dashboard.tsx`)
- `PrioritySection` — ladder, zwakste bovenaan, "← hier begin je nu"
- `PlanSection` — "Spoor A · Leefstijl", "Hier zit je winst", optioneel supplement Spoor B
- Tokens: `#1a2e1a` bg, sage `#5A8F6A`, terra `#C8956C`, panelen wit-op-alpha

**Schrijfstem:** [`docs/core/WRITING_VOICE.md`](../core/WRITING_VOICE.md) — begrip → urgentie → actie, geen diagnose-taal.

**Compliance:** [`docs/core/COMPLIANCE.md`](../core/COMPLIANCE.md) — EFSA-bewoording letterlijk, geen energie-claim op omega-3.

---

## Taak

Ontwerp het **RESULTAATSCHERM** direct ná de gratis Leefstijlcheck, vóór account-aanmaak.

Lever **twee richtingen** om te vergelijken, elk met **375px mobiel + desktop**:

| Richting | Concept |
|----------|---------|
| **A — Volledig donker** | Gebruiker stapt zijn persoonlijke ruimte binnen; hele viewport `#1a2e1a` |
| **B — Lichte overgang** | Marketing-site licht (`#f8f7f4`); alleen conversiekaart in donkere dashboardstijl |

Per richting: mockup + annotaties (spacing, font sizes, hex-codes) + component-callouts.

---

## Drie narratieve lagen (verplicht in het ontwerp)

### 1. Leefstijl-stappenplan
De gebruiker moet voelen: *"Ik weet precies waar ik begin — niet met pillen."*

Visuele flow (3-stappen pad):
1. Momentopname (ring + profiel) — Stap 1
2. Prioriteit-focus (één pijler, geen 6-rij ladder) — Stap 2
3. Eerste concrete stap (Spoor A, dominant) — Stap 3
4. Primaire CTA → account/login

**Geen supplement op REVEAL** — stepped-care tier 3 hoort in dashboard PLAN-sectie.

### 2. Dashboard-uitnodiging
De gebruiker moet voelen: *"Dit is mijn persoonlijke ruimte — ik wil dit bewaren."*

- Zelfde ring en card-tokens als `/dashboard`; volledige ladder alleen na login
- Subtiele glimps: vergrendeld delta-icoon of "Trend zichtbaar na account" — **geen fake trenddata**

### 3. Winst helder
De gebruiker moet voelen: *"Hier zit nu de meeste winst voor mij."*

- Label **"Hier zit je winst"** op de leefstijl-stap
- Prioriteit-pijler (#1) in compacte focus-card; leefstijl-stap visueel dominant

---

## Schermopbouw (mobiel 375px, boven → onder)

1. **Kop** — serif: *"In drie stappen naar jouw overzicht"*
2. **Stap 1** — vitaliteitsring (53) + profiel *"Lage Batterij"* + disclaimer
3. **Stap 2** — `PriorityFocusCard`: Voeding #1, *"← hier begin je nu"*, teaser dashboard
4. **Stap 3** — Spoor A leefstijl quick-win + *"Hier zit je winst"*
5. **Primaire CTA** — enige filled knop: *"Bewaar dit en volg je voortgang →"* + subtekst *"Log in en bewaar dit — dan zie je je volledige prioriteit en voortgang."*
6. **Methodiek** — ingeklapt: piramide + feedback
7. **Trust & compliance zone** — zie Blok 8

**Geen supplement-disclosure op REVEAL.**

---

## Component — SupplementDisclosure (herbruikbaar)

Zelfstandig component; later ook op dashboard en vergelijkingspagina's. Touch én muis — geen hover-only.

**Altijd zichtbaar:**
- Supplementnaam + vorm + Evidence-badge (A / B)
- Eén regel EFSA-claim (exacte bewoording)

**Uitklapbaar (tap/klik):** *"ⓘ Waarom dit advies?"* → 2 bullets:
- (a) waarom dit middel/vorm op kwaliteit gekozen is
- (b) *"Wij kozen dit op kwaliteit, niet op commissie"*

**Aparte vaste tekstlink:** *"Bekijk de onafhankelijke vergelijking →"* (nooit in modal)

**Subtitel:** *"Spoor B · Aanvulling, pas hierna"*

**Placeholder (locked):** Omega-3 EPA/DHA, Evidence A, claim *"draagt bij aan de normale werking van het hart"*

**On-hold (ashwagandha-referentie):** altijd zichtbaar *"Dit is geen goedgekeurde gezondheidsclaim."* — magnesium/omega-3 niet.

---

## Visuele taal

- Achtergrond: `#1a2e1a` → gradient `#21381f`; `#0f1c10` alleen tekst op sage-knoppen
- Panelen: `rgba(255,255,255,0.05)`, border `rgba(255,255,255,0.12)`, radius ~24px
- Accenten: sage `#5A8F6A`, terra `#C8956C` (warmte, geen secundaire CTA-fill)
- Pijlerkleuren: slaap `#5B6EAE`, energie `#C4873B`, stress `#8B6E99`, voeding `#5A8F6A`, beweging `#C26E4B`, herstel `#4A8A99`
- Fonts: **DM Serif Display** koppen, **DM Sans** body
- Kernelementen: vitaliteitsring, prioriteitsladder (6 pijlers), rustige cards met zachte glow

**Device:** touch targets ≥ 44px, tekst ≥ 16px body, geen horizontale scroll, geen hover-only interacties.

---

## Blok 8 — Trust & compliance zone (verplicht)

Onder de primaire CTA. Visueel rustig, juridisch compleet. **Nooit** concurrerend met conversie-CTA.

### Tier 1 — Altijd tonen

| Element | Specificatie |
|---------|--------------|
| MedicalDisclaimer (intake) | 12px, `rgba(255,255,255,0.22)` — volledige tekst incl. AVG art. 9 |
| Privacy-links | `/privacy` · `/medische-disclaimer` |
| Toestemming intrekken & anonimiseren | Ghost button, ≥ 44px |
| Alles verwijderen | Ghost destructive, niet naast primaire CTA |
| Opnieuw beginnen | Subtiele tekstlink |

Intake-disclaimer (niet inkorten):
> *"De Leefstijlcheck is een vragenlijst voor leefstijl-inzicht — geen diagnose, geen behandeling en geen vervanging voor een arts. Je antwoorden bevatten gezondheidsgegevens (AVG art. 9) en worden alleen verwerkt na jouw uitdrukkelijke toestemming aan het einde van de check. We slaan ze versleuteld op en je kunt je toestemming op elk moment intrekken."*

### Tier 2 — Placeholder in design

| Element | Plaatsing |
|---------|-----------|
| *"Je ontvangt dit ook per e-mail"* | Tussen hero en CTA, 14px muted (als marketing_email consent) |
| IntakeFeedback *"Herken je jezelf in dit advies?"* | Compact onder CTA, boven trust strip |
| Account-consent checkbox | **Niet** op reveal — alleen op `/account/login` |

### Tier 3 — Implementatie-notitie (niet in mockup)

Sessie via cookie, confirm-dialog bij revoke/delete, non-enumerating login.

---

## Constraints — wat NIET

- Geen delta/trend/sparklines (anoniem = momentopname)
- Geen affiliate/koop-knoppen op dit scherm
- Geen secundaire CTA's boven primaire (geen "Doe de voeding-check")
- Geen losse domein-score-kaarten of 4-kaarten grid bovenin
- Geen meerdere uitklapblokken boven CTA
- Geen energie-claim op omega-3
- Geen tekort-diagnose ("je hebt een tekort") — inname-inschatting mag
- Geen emoji-reeksen, "boost/stack", superlatieven
- Revoke/delete nooit als sage/terra filled button

---

## Placeholder-data (locked — niet variëren)

| Veld | Waarde |
|------|--------|
| Profiel | Lage Batterij |
| Vitaliteit | 53 |
| Prioriteit | Voeding |
| Ladder-scores | voeding 38, energie 45, slaap 52, stress 58, beweging 62, herstel 68 |
| Quick-win | Eiwitrijk ontbijt — 30 g eiwit vóór 10 uur houdt je energie stabiel. |
| Supplement | Omega-3 EPA/DHA, Evidence A, hart-claim |

---

## Output-contract

Per richting (A + B) leveren:

1. **Mobiel mockup** 375px breed
2. **Desktop mockup** (max ~1280px; A full-bleed of B gecentreerde kaart)
3. **Annotaties:** spacing (px), font sizes, hex-codes per component
4. **Component-callouts:** `VitalityRing`, `PriorityLadder`, `LifestyleStepCard`, `SupplementDisclosure`, `PrimaryCTA`, `TrustStrip`, `DataRights`
5. **Ingevulde zelfevaluatie** (zie rubric)

Optioneel: HTML standalone export met beide richtingen naast elkaar.

---

## Zelfevaluatie-rubric (invullen na ontwerp)

1. Is leefstijl visueel dominant boven supplement? (ja/nee)
2. Voelt het als hetzelfde product als `/dashboard`? (1–5)
3. Is er precies één primaire actie? (ja/nee)
4. Past hero + ladder above-the-fold op 375px? (ja/nee)
5. Welke richting converteert beter voor drukke man 40+ op telefoon — en waarom?
6. Is de compliance-zone aanwezig maar visueel ondergeschikt? (ja/nee)
7. Zijn data-rechtenknoppen gescheiden van conversie-CTA? (ja/nee)

---

## Wat deze prompt NIET doet

- Geen code-implementatie in `src/`
- Geen wijziging aan `IntakeResults.tsx` of `Dashboard.tsx`
- Geen commit

**Vervolg na designkeuze:** aparte implementatie-prompt in Cursor (refactor + `SupplementDisclosure` component).

---

*Laatst bijgewerkt: juni 2026*
