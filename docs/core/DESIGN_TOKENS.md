# DESIGN TOKENS — PerfectSupplement

> **Layer 1 — Core.** Visuele standaarden voor consistente UI.

---

## Typography

| Element | Font | Gewicht |
|---|---|---|
| Headings (h1-h4) | DM Serif Display | 400 |
| Body tekst | DM Sans | 400 |
| Bold / emphasis | DM Sans | 700 |

## Kleuren

### Light site (marketing, blog, vergelijkingen)

| Token | Hex | Gebruik |
|---|---|---|
| Primary green | `#3C7A56` | CTA buttons, primaire accenten (licht thema) |
| Inline link green | `#5A8F6A` | Tekstlinks |
| Hover green | `#4A7F5A` | Link/button hover |
| Warm background | `#F7F5F0` / `#f8f7f4` | Pagina-achtergrond |
| Stone text | Tailwind stone palette | Body tekst |

### Dark world (intake, dashboard, REVEAL)

Gebruikt op Leefstijlcheck-resultaten, `/dashboard`, en het nieuwe REVEAL-scherm. Tokens in `src/app/globals.css` (`.ps-dark`, `.ps-dash`, `--intake-*`).

| Token | Hex / waarde | Gebruik |
|---|---|---|
| Background | `#1a2e1a` | Pagina-achtergrond |
| Gradient highlight | `#21381f` | Radial gradient bovenkant |
| Sage | `#5A8F6A` | Primair accent, ring stroke, CTA |
| Terra | `#C8956C` | Warmte, aandacht (geen secundaire CTA-fill op REVEAL) |
| CTA tekst op sage | `#0f1c10` | Button label |
| Panel | `rgba(255,255,255,0.05)` | Cards |
| Panel border | `rgba(255,255,255,0.12)` | Card borders |

**Pijlerkleuren (dashboard + REVEAL-ladder):** slaap `#5B6EAE`, energie `#C4873B`, stress `#8B6E99`, voeding `#5A8F6A`, beweging `#C26E4B`, herstel `#4A8A99` — zie `src/data/dashboard/index.ts`.

**REVEAL layout-spec:** [`docs/design/results-reveal-layout.md`](../design/results-reveal-layout.md)

## Layout

| Token | Waarde |
|---|---|
| Container max-width | `max-w-7xl` |
| Container padding | `px-6 lg:px-8` |
| Component | `Container` default export uit `@/components/layout/Container` |

## Mobile-first (375px viewport)

- Eén vraag per scherm op Leefstijlcheck
- Buttons ≥ 44px × 44px (touch targets)
- Tekst ≥ 16px (geen browser-zoom nodig)
- Geen horizontal scroll
- `next/image` lazy loading
- Server components waar mogelijk

## Tone of voice

Direct, warm, mannelijk zonder macho.

❌ *"Uw testosteronspiegel kan suboptimaal zijn door chronische hypothalamus-hypofyse-bijnier-as-dysregulatie."*

✅ *"Je lichaam herstelt niet goed genoeg. Dat vreet aan je energie. Hier is wat je eraan kunt doen."*

---

*Laatst bijgewerkt: juni 2026*
