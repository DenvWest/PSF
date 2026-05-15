# Accendo — architectuurvoorbereiding (planning)

**Status:** documentatie alleen — geen code in dit repo.  
**Startcode:** apart repo, week 9+, na gesloten PerfectSupplement SEO-spinnenweb en eerste organisch verkeer.

## Doel

Accendo is de B2B-laag: coaches en organisaties embedden de Leefstijlcheck (intake) onder eigen branding, met gedeelde kernlogica maar apart domein en merk.

## Wat apart moet blijven

| Onderdeel | PerfectSupplement (B2C) | Accendo (B2B) |
|-----------|-------------------------|---------------|
| Domein & merk | perfectsupplement.nl | apart subdomein/domein |
| Content (blog, pillars, vergelijkingen) | ja | nee (eigen marketing) |
| Affiliate monetisatie | ja | nee / eigen model |
| Admin tenant UI | PSF admin | multi-tenant org dashboard |
| Facturatie / seats | n.v.t. | Stripe of vergelijkbaar |

## Wat gedeeld kan worden (SDK / package)

- **Intake engine:** scoring, domeinen, profiellabels (`intake-engine` logica)
- **Intake UI componenten:** vraagflow, consent, resultaten (embedbaar via props)
- **Supabase schema:** `organization_id` op `intake_sessions` (bestaat); RLS per org
- **E-mail dispatch:** nurture templates met org-branding hooks (from-name, logo URL, primary color)

## Intake SDK — ontwerpprincipes

1. **Embed modes:** iframe (snelste) vs React package (`@accendo/intake-widget`) voor Next.js hosts.
2. **Theming interface:**
   - `primaryColor`, `fontFamily`, `logoUrl`, `organizationName`
   - Optionele `privacyPolicyUrl`, `supportEmail`
3. **Events:** `onComplete(sessionId)`, `onAbandon(step)` voor host-analytics.
4. **Geen localStorage:** sessie via Supabase + signed cookie (zoals PSF).
5. **AVG:** consent-blok verplicht; DPA per organisatie.

## API-grenzen

- Publiek: `POST /api/intake/session` met `organization_id` + API key of signed embed token
- Geen blootstelling van andere tenants (RLS)
- Rate limiting per org + IP (hergebruik PSF limiter)

## Data-model uitbreiding (toekomst)

- `organizations`: branding, plan, webhook URL
- `organization_members`: coach rollen
- `intake_sessions.organization_id` (bestaand veld) als tenant key

## Migratiepad vanuit PSF

1. Extract `@/lib/intake-engine` + types naar gedeeld npm package (private).
2. Extract intake components naar package met `"use client"` boundaries.
3. Accendo repo: dunne host app + org admin.
4. PSF blijft consumer vanzelfde package-versie (semver).

## Niet in scope vóór week 9

- Geen Accendo routes in `src/app/`
- Geen tweede deploy pipeline op Hetzner tot productbesluit
- Geen aparte Supabase project tenzij compliance dat vereist (eerst RLS per org evalueren)

## Succescriteria om Accendo te starten

- PSF: 5 pillars, cluster-blogs, 8/8 vergelijkingen met profielkoppeling
- Organisch verkeer + affiliate-inkomsten als B2B-bewijs
- Intake completion rate en nurture metrics stabiel

## Referenties in dit repo

- Intake: `src/components/intake/`, `src/lib/intake-engine.ts`
- Entity model: `docs/core/ENTITY_MODEL.md`
- E-mail: `docs/core/EMAIL_SYSTEM.md`
