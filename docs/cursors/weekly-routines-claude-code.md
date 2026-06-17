# Wekelijkse Claude Code routines (copy-paste)

Gebruik deze prompts 1-op-1 als wekelijkse routines in Claude Code. Alle routines zijn read-only en rapporteren alleen.

---

## Shared execution contract (voor alle routines)

Plak dit bovenaan elke routineprompt:

```text
Execution Contract (verplicht):
- Baseline: vergelijk tegen `main` (huidige branch mag verschillen).
- READ-ONLY: geen bestanden wijzigen, geen commits, geen git push.
- Geen auto-fix voorstellen toepassen in code; alleen bevindingen rapporteren.
- Bij twijfel: markeer als "Onbekend" met reden en exact bestandspad.
- Lever alleen markdown-output in dit format:

## Executive summary
- Scope:
- Resultaat:
- Risiconiveau: 🔴 / 🟡 / 🟢

## Findings
| Severity | Bestand/Route | Probleem | Bewijs | Aanbevolen fix |
|---|---|---|---|---|

## Checklist
- [ ] Check 1
- [ ] Check 2

## Known limitations
- ...
```

---

## R1 — Claim drift (wekelijks)

```text
Je bent compliance-reviewer voor PerfectSupplement.

Volg EXACT `docs/cursors/monthly-koag-audit.md` en voer de audit read-only uit tegen `main`.

Verplichte checks:
1) Toets site-copy tegen `src/data/approved-claims.ts`:
   - `FORBIDDEN_PHRASES_GLOBAL` met context (false positives vermijden; "tegen" in gewone taal niet markeren)
   - Niet-goedgekeurde claims per ingrediënt versus `getUsableClaims(...)`
2) Ashwagandha:
   - Markeer elke claim zonder canonieke `ON_HOLD_DISCLAIMER`
   - Controleer aanwezigheid VWS on-hold context
3) Omega-3:
   - Markeer energie-/vermoeidheidsclaims (niet EFSA-goedgekeurd voor EPA/DHA)

Scope-prioriteit:
- `src/data/supplements/*`
- `src/data/supplement-guides/*`
- `src/data/blog/**`
- `src/data/nurture-content.ts`
- intake-gerelateerde aanbevelingscopy in `src/lib/**`

Output:
- Gebruik exact het Shared execution contract format.
- Focus op afwijkingen; geen lange lijst met "alles OK".
```

---

## R2 — Spinnenweb + broken interne links (wekelijks zondag)

```text
Je bent content-architect voor PerfectSupplement.

Volg EXACT `docs/cursors/spinnenweb-link-audit.md` en voer de audit read-only uit tegen `main`.

Taken:
1) Bouw routekaart op basis van:
   - `src/app/**/page.tsx` (inclusief dynamische segmenten)
   - data-slugs uit `src/data/**` (supplementen, profielen, blog, kennisbank)
2) Verzamel interne links:
   - alle `href` naar interne routes in `src/data/**` en relevante componenten
3) Resolve links tegen echte routes:
   - markeer broken links
   - let extra op verouderde `/gids/*` verwijzingen
4) Toets `docs/core/CONTENT_GAPS.md` spinnenweb-checklist:
   - pillar -> profiel links
   - `/beste/*` met profiel-fit blok
   - cluster-blogs met >=2 gerelateerde interne links
   - weespagina’s (0 inkomende interne links)

Output:
- Gebruik exact het Shared execution contract format.
- Voeg een aparte tabel toe:
  `| Linkbron | Linkdoel | Status | Opmerking |`
```

---

## R3 — SEO + structured data (wekelijks zondag)

```text
Je bent technisch SEO-reviewer voor PerfectSupplement.

Volg EXACT `docs/cursors/seo-structured-data-audit.md` en voer de audit read-only uit tegen `main`.

Controleer per route:
1) Metadata:
   - unieke title
   - description
   - canonical (`alternates.canonical`)
2) Heading-structuur:
   - exact 1x h1
   - logische h2/h3-hiërarchie
3) JSON-LD per paginatype:
   - `/beste/*`: ItemList/Product + FAQ waar relevant
   - `/supplementen/*`: passend schema + FAQ
   - `/blog/*`: Article
   - `/kennisbank/*`: DefinedTerm
   - sitewide: Breadcrumb
4) Dubbele schema-bron:
   - benoem expliciet dat `src/lib/structured-data.ts` alias/re-export is van `src/lib/seo/structuredData.ts`
   - markeer alleen als warning wanneer er echte functionele duplicatie is

Output:
- Gebruik exact het Shared execution contract format.
- Voeg een compacte route-matrix toe:
  `| Route | Meta OK | H1 OK | JSON-LD OK | Opmerking |`
```

---

## R4 — Security + dependency check (wekelijks)

```text
Je bent security auditor voor PerfectSupplement (Next.js 16).
READ-ONLY audit tegen `main`.

Voer uit:
1) Dependencies
   - Draai `npm audit --json`
   - Rapporteer alleen `high` en `critical` met pakket, severity, fix
2) Secret leakage scan in `src/`
   - Zoek op patronen: `sk-`, `pk-`, `key-`, `token-`, `AKIA`, `Bearer `
   - Zoek hardcoded Supabase URL/key (ipv env refs)
   - Markeer alleen echte lekken (geen placeholders/testdata)
3) .gitignore check
   - Verifieer dat `.env`, `.env.local`, `.env.production` genegeerd zijn
4) API route hardening (`src/app/api/**/route.ts`)
   - Geen rate limiting (zoek import/use van `@/lib/rate-limit`)
   - Geen inputvalidatie op request body
   - Service-role gebruik zonder admin-auth check
5) RLS bypass checks
   - Zoek `.from(` in code
   - markeer gebruik van admin client (`supabaseAdmin` of equivalent) zonder duidelijke reden/auth-guard

Severity labels:
- 🔴 Critical: direct misbruikbaar of key leak
- 🟡 Warning: ontbrekende bescherming of verhoogd risico
- 🟢 OK: geen issue

Output:
- Gebruik exact het Shared execution contract format.
- Voeg extra tabel toe:
  `| Check | Status | Bewijs |`
```

---

## R5 — Affiliate link validator (wekelijks)

```text
Je bent affiliate link validator voor PerfectSupplement.
READ-ONLY audit tegen `main`.

Taken:
1) Verzamel affiliate URL's uit `src/data/affiliate-links.ts`
2) Verzamel externe affiliate href's uit:
   - vergelijkingen (`src/app/beste/[supplement]/page.tsx` + gekoppelde data in `src/data/supplements/*.ts`)
   - supplement-gidsen (`src/app/supplementen/[supplement]/page.tsx` + gerelateerde componenten/data)
   - alleen links met affiliate-intentie (`rel="nofollow sponsored"` of affiliateSlug-gedreven links)
3) Test URL's:
   - `curl -sL -o /dev/null -w "%{http_code} %{url_effective}"`
   - Classificeer:
     - ✅ 200/301/302 (werkend)
     - ❌ 4xx/5xx/timeout
     - ⚠️ redirect naar onverwacht domein of afwijkend pad
4) Dekking-check:
   - elk product in `src/data/supplements/*.ts` moet een geldige `affiliateSlug` hebben die bestaat in `affiliate-links.ts`
5) Sub-ID consistentie:
   - controleer `ws=`/sub-id op consistent format per categorie (bijv. `ashwagandha`, `magnesium`, `omega-3-supplement`)

Output:
- Gebruik exact het Shared execution contract format.
- Focus op problemen, niet op successen.
- Voeg extra tabel toe:
  `| Slug/URL | Probleemtype | Impact | Aanbevolen fix |`
```

---

## Aanbevolen planning

- Zondag 07:00 — R2 Spinnenweb
- Zondag 07:20 — R3 SEO/Structured Data
- Maandag 07:00 — R1 Claim Drift
- Woensdag 07:00 — R4 Security/Dependencies
- Vrijdag 07:00 — R5 Affiliate Validator
