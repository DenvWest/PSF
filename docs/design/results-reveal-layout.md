# Results Reveal — layout-spec

> **Companion bij** [`docs/cursors/claude-design-results-reveal-prompt.md`](../cursors/claude-design-results-reveal-prompt.md).
> Harde visuele constraint voor Claude Design en latere implementatie. Geen productie-CSS — delta t.o.v. bestaande tokens in `src/app/globals.css`.

---

## Scope

- Scherm: intake-resultaten ná Leefstijlcheck, vóór account (`IntakeResults` → refactor)
- Anoniem: momentopname only — geen trend, delta of sparklines
- Doel: dashboard-trailer — zelfde wereld als `/dashboard`

**Code-referenties:**
- Tokens: `src/app/globals.css` (`.ps-dark`, `--intake-*`)
- Dashboard: `src/components/dashboard/Dashboard.tsx` (`VitalityRing`, `PrioritySection`, `PlanSection`)
- Primitives: `src/components/app/primitives.tsx` (`Card`, `Button`)
- Pijlerkleuren: `src/data/dashboard/index.ts`

---

## 1. CSS-tokens (`.ps-reveal`)

Erft van `.ps-dark` / `--intake-*`. Alleen REVEAL-specifieke toevoegingen:

```css
.ps-reveal {
  /* Shell — richting A: full-bleed op .ps-dark */
  --reveal-max-width: 480px;
  --reveal-pad-x: 24px;
  --reveal-pad-bottom: 40px;
  --reveal-pad-top: 32px;

  /* Cards */
  --reveal-card-radius: 24px;
  --reveal-card-pad: 20px;
  --reveal-card-pad-hero: 24px;
  --reveal-hero-glow: rgba(90, 143, 106, 0.28);
  --reveal-hero-border: rgba(90, 143, 106, 0.28);
  --reveal-step-glow: rgba(90, 143, 106, 0.26);
  --reveal-supplement-bg: rgba(255, 255, 255, 0.025);

  /* Spacing */
  --reveal-gap-xs: 8px;
  --reveal-gap-sm: 12px;
  --reveal-gap-md: 20px;
  --reveal-gap-lg: 32px;
  --reveal-section-gap: 20px;

  /* CTA */
  --reveal-cta-min-height: 52px;
  --reveal-cta-radius: 14px;
  --reveal-cta-text: #0f1c10;

  /* Ladder — match dashboard LADDER_ROW_H */
  --reveal-ladder-row-h: 60px;

  /* Vitality ring */
  --reveal-ring-size: 160px;
  --reveal-ring-stroke: 13px;
  --reveal-ring-glow: drop-shadow(0 0 6px rgba(90, 143, 106, 0.4));

  /* Trust / compliance */
  --reveal-trust-text: rgba(255, 255, 255, 0.22);
  --reveal-trust-link: rgba(255, 255, 255, 0.50);
  --reveal-trust-divider: rgba(255, 255, 255, 0.08);

  /* Pijlerkleuren — zelfde als dashboard */
  --pillar-slaap: #5B6EAE;
  --pillar-energie: #C4873B;
  --pillar-stress: #8B6E99;
  --pillar-voeding: #5A8F6A;
  --pillar-beweging: #C26E4B;
  --pillar-herstel: #4A8A99;
}
```

### Richting B — lichte shell

```css
.ps-reveal-shell--light {
  --reveal-shell-bg: #f8f7f4;
  --reveal-shell-pad: 24px;
}

.ps-reveal-shell--light .ps-reveal {
  border-radius: var(--reveal-card-radius);
  box-shadow: 0 24px 64px rgba(15, 28, 16, 0.18);
  /* Binnenste kaart blijft .ps-dark tokens */
}
```

Desktop richting B: gecentreerde kaart `max-width: 720px`.

---

## 2. Typografie (mobiel 375px)

| Element | Font | Grootte | Gewicht | Kleur |
|---------|------|---------|---------|-------|
| H1 (warme kop) | DM Serif Display | 28–30px | 400 | `--text` |
| Profiellabel | DM Serif Display | 20–22px | 400 | `--text` |
| Section eyebrow | DM Sans | 11px uppercase | 600 | `--sage` of pijlerkleur |
| Section title | DM Serif Display | 18–21px | 400 | `--text` |
| Body | DM Sans | 16px min | 400 | `--text-muted` |
| Quick-win titel | DM Sans | 15px | 600 | `--text` |
| Disclaimer hero | DM Sans | 13px | 400 | `--text-subtle` |
| CTA knop | DM Sans | 15–15.5px | 600 | `--reveal-cta-text` op sage |
| CTA subtekst | DM Sans | 14px | 400 | `--text-muted` |
| Trust strip | DM Sans | 12px | 400 | `--reveal-trust-text` |
| Data-rechten knop | DM Sans | 13px | 500 | `--text-muted` |

Letter-spacing eyebrows: `0.12em–0.14em`. Geen tekst onder 12px behalve trust strip.

---

## 3. Layout-grid (mobiel, boven → onder)

### Above the fold (instant begrijpelijk)

```
┌─────────────────────────────────────┐
│ [H1] Dit is waar je nu staat.       │
│ herkenningszin (symptomen)          │
│ [HeroCard] ring + profiel + driver  │
│ [JourneyRail] Overzicht ● — Plan — Dashboard │
│ [WhereYouStart OPEN] ladder + quick-win → login │
│ [PrimaryCTA] sage filled            │
│ tekstlink: dashboard preview        │
└─────────────────────────────────────┘
```

### Below the fold (progressive disclosure)

```
├─ [dashboard preview] op tap (visueel mock)
└─ [details] Methodiek, privacy & disclaimer
     piramide + feedback + disclaimer + data-rechten
```

### Hiërarchie-regels

- Onder vitaliteit: precies **één** open blok (*Waar je begint*) met ladder + compacte quick-win
- Geen tweede leefstijlstap (*Ook goed om vast te houden*) op REVEAL
- Eén ingeklapte footer: methodiek + privacy + disclaimer
- Quick-win strip klikbaar → `/account/login`
- Dashboard-preview standaard gesloten (tekstlink)
- Volledige 6-pijler ladder en supplement alleen in dashboard na login
- Geen horizontale scroll; touch targets ≥ 44px

---

## 4. Component-anatomie

### VitalityRing

```html
<section aria-label="Jouw vitaliteit">
  <article class="reveal-hero-card">
    <!-- SVG ring: sage stroke, score 53 serif center -->
    <!-- Onder ring: profiel "Lage Batterij" -->
    <!-- Glimps: klein slot-icoon + "Trend zichtbaar na account" — geen fake delta -->
    <p class="reveal-disclaimer">Op basis van je antwoorden. Geen medische diagnose.</p>
  </article>
</section>
```

Ring: zelfde SVG-logica als `VitalityRing` in `Dashboard.tsx` — geen delta-regel op reveal.

### RevealPath + PriorityFocusCard

```html
<div class="reveal-path">
  <!-- verticale lijn links, genummerde markers 1–3 -->
  <section aria-label="Stap 1 — Waar je nu staat">
    <span class="step-marker">1</span>
    <span class="step-title">Waar je nu staat</span>
    <!-- VitalityRing + profiel + disclaimer -->
  </section>
  <section aria-label="Stap 2 — Waar je begint">
    <span class="step-marker">2</span>
    <span class="step-title">Waar je begint</span>
    <article class="priority-focus-card">
      <!-- één pijler: label, score-balk, "← hier begin je nu" -->
      <p class="dashboard-teaser">Alle 6 pijlers en je trend zie je in je dashboard.</p>
    </article>
  </section>
  <section aria-label="Stap 3 — Je eerste stap">
    <!-- LifestyleStepCard — zie hieronder -->
  </section>
</div>
```

Volledige `PriorityLadder` (6 rijen × 60px) blijft in dashboard; niet op REVEAL.

### LifestyleStepCard

```html
<section aria-label="Je eerste stap">
  <article class="reveal-card reveal-card--step">
    <header>
      <span class="track">Spoor A · Leefstijl</span>
      <span class="win-label">Hier zit je winst</span>
    </header>
    <h3>Eiwitrijk ontbijt</h3>
    <p>30 g eiwit vóór 10 uur houdt je energie stabiel.</p>
    <span class="pillar-badge">Voeding</span>
  </article>
</section>
```

### SupplementDisclosure

**Niet op REVEAL** (fase 1). Component blijft herbruikbaar op dashboard `PlanSection` en vergelijkingspagina's. Stepped-care: supplement = tier 3 op PLAN, niet op reveal.

### PrimaryCTA

```html
<section aria-label="Bewaar je overzicht">
  <button type="button" class="reveal-cta-primary">
    Bewaar dit en volg je voortgang →
  </button>
  <p class="reveal-cta-sub">Log in en bewaar dit — dan zie je je volledige prioriteit en voortgang.</p>
</section>
```

Sage fill, tekst `#0f1c10`, min-height 52px, full-width op mobiel.

### Trust & compliance zone

Ingeklapte drawer **"Jouw gegevens & privacy"** (default gesloten). Geen full-width knoppen.

```html
<footer class="reveal-trust">
  <details>
    <summary>Jouw gegevens & privacy</summary>
    <p><!-- DISCLAIMER_TEXTS.intake, links uitgelijnd --></p>
    <a>privacyverklaring</a> · <a>medische disclaimer</a>
    <button class="text-link">Toestemming intrekken & anonimiseren</button>
    <button class="text-link destructive">Alles verwijderen</button>
    <button class="text-link subtle">Opnieuw beginnen</button>
  </details>
  <p class="copyright">© 2026 · Privacy · Disclaimer</p>
</footer>
```

**Regels:**
- Trust zone altijd **onder** primaire CTA
- Revoke/delete: ghost only — geen sage/terra fill
- Knoppen verticaal gestapeld, gap 10px, min-height 44px

Intake-disclaimer copy (niet inkorten): `src/lib/disclaimer-text.ts` → `DISCLAIMER_TEXTS.intake`.

---

## 5. Richting A vs B

| | Richting A — `fullscreen-dark` | Richting B — `embedded-card` |
|--|------------------------------|------------------------------|
| Shell | `ResultsRevealShell` + `ps-dark` full-bleed | Lichte host `#f8f7f4` + donkere kaart |
| PSF.com | **Default** (`shellVariant` niet gezet) | Niet op B2C — alleen embed/B2B |
| Sluiten | `IntakeExit` in layout (één knop) | Zelfde of host-sluiting |
| Mobiel max-width | 480px (`IntakeClient`) | 480px (kaart) |
| Desktop max-width | 600px (`lg:` — gelijk aan dashboard) | 600px (`lg:`) |
| Implementatie | `src/components/intake/ResultsRevealShell.tsx` | `variant="embedded-card"` prop |

Desktop (`lg+`): hero ring + profiel naast elkaar; CTA max `max-w-md` gecentreerd. Breedte wordt gezet door `IntakeClient` op results-fase, niet alleen door de shell.

---

## 6. Visuele anti-patterns (niet ontwerpen)

- Tekstkaart "Jouw vitaliteit" zonder ring
- Terra filled buttons boven account-CTA ("Doe de X-check")
- Grid met 4 losse leefstijlonderdelen above-the-fold
- Sparklines, delta "+3 sinds vorige check"
- Affiliate/koop-knoppen op reveal
- Meerdere uitklapblokken boven CTA
- Revoke/delete styled als primaire actie
- Emoji-reeksen, "boost/stack", superlatieven

---

## 7. Placeholder-data (locked)

| Veld | Waarde |
|------|--------|
| Profiel | Lage Batterij |
| Vitaliteit | 53 |
| Prioriteit | Voeding |
| Quick-win titel | Eiwitrijk ontbijt |
| Quick-win detail | 30 g eiwit vóór 10 uur houdt je energie stabiel. |
| Pad-titel | In drie stappen naar jouw overzicht |
| Dashboard-teaser | Alle 6 pijlers en je trend zie je in je dashboard. |
| Supplement op REVEAL | Geen — dashboard PLAN-sectie |

---

*Laatst bijgewerkt: juni 2026*
