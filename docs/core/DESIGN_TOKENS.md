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

| Token | Hex | Gebruik |
|---|---|---|
| Primary green | `#3C7A56` | CTA buttons, primaire accenten |
| Inline link green | `#5A8F6A` | Tekstlinks |
| Hover green | `#4A7F5A` | Link/button hover |
| Warm background | `#F7F5F0` | Pagina-achtergrond |
| Stone text | Tailwind stone palette | Body tekst |

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

*Laatst bijgewerkt: mei 2026*
