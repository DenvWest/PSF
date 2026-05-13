# AFFILIATE SYSTEM — PerfectSupplement

> **Layer 2 — Systems.** Hoe affiliate links werken.

---

## Partners

| Partner | Type | Details |
|---|---|---|
| Daisycon | Netwerk (account 408175) | Vitaminstore.nl, VitalNutrition.nl |
| Arctic Blue | Direct via Awin | `sld=dennisvanwestbroek`, 3 varianten: visolie, gummies, algenolie |

## Harde regels

1. **Arctic Blue links NOOIT vervangen door Daisycon links**
2. **Affiliate links NOOIT in blogposts** — alleen op vergelijkingspagina's
3. **Alle affiliate links:** `target="_blank" rel="noopener noreferrer sponsored"`
4. **Deeplinks via URL format** (niet HTML)
5. **Sub ID format:** `[supplement]-vergelijking` (bijv. `ashwagandha-vergelijking`)
6. **Affiliate disclosure** zichtbaar op elke vergelijkingspagina

## Technische implementatie

| Onderdeel | Locatie |
|---|---|
| Affiliate URLs | `src/data/affiliate-links.ts` (module `@/data/affiliate-links`) |
| AffiliateLink component | Supabase click tracking + correct `rel` attribute |
| Click tracking | `affiliate_clicks` Supabase tabel (niet wijzigen) |

### Slug matching
Affiliate slug keys moeten matchen in drie plekken:
1. `SupplementProduct` (data)
2. `ChoiceRoute` (routing)
3. `AffiliateLink` (component)

Mismatch = broken affiliate tracking.

## Content flow

```
Blogpost (geen affiliate links)
    ↓ turbo-snippet
Vergelijkingspagina (affiliate links)
    ↓ product link
Externe shop (Vitaminstore, Arctic Blue, etc.)
```

Dit houdt blog-content onafhankelijk en geloofwaardig.

## Vergelijkingspagina framing

Huidige aanpak: **hybrid framing** ("kiezen per variant"). Later switchbaar naar "beste van [jaar]" wanneer meer producten/merken beschikbaar zijn. Nu alleen Arctic Blue varianten op omega-3.

---

*Laatst bijgewerkt: mei 2026*
