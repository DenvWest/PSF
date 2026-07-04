# Maandelijkse privacy-register controle — read-only

**Frequentie:** 1× per maand (1e werkdag), of direct bij wezenlijke verwerkingswijziging
**Type:** read-only audit — rapporteert, wijzigt alleen het register als Dennis akkoord geeft
**Owner:** Dennis
**Bronnen van waarheid:** `docs/core/VERWERKINGSREGISTER.md`, `docs/core/DPIA.md`, `src/app/privacy/page.tsx`

---

## Scheduling (Cursor)

**Status:** handmatig instellen in Cursor UI (niet via repo te automatiseren).

1. Open Cursor → **Schedule** (cloud agent / `/schedule`)
2. Stel in: **1× per maand**, 1e werkdag 08:00
3. Plak de prompt uit [`monthly-privacy-register-review-schedule.md`](monthly-privacy-register-review-schedule.md)

Complementair aan: [`weekly-routines-claude-code.md`](weekly-routines-claude-code.md) (technische routines) en [`monthly-koag-audit.md`](monthly-koag-audit.md) (claims).

---

## Wat je controleert

Vergelijk **drie lagen** op consistentie:

| Laag | Bestand | Publiek? |
|---|---|---|
| Verwerkingsregister (art. 30) | `docs/core/VERWERKINGSREGISTER.md` | Nee — intern |
| DPIA (art. 35) | `docs/core/DPIA.md` | Nee — intern |
| Privacyverklaring | `src/app/privacy/page.tsx` | Ja — `/privacy` |

Plus: codebase als feitelijke bron (verwerkers, tabellen, retentie, nieuwe API-routes).

### Checklist

1. **Nieuwe verwerkingen** — nieuwe tabellen (`supabase/migrations/`), API-routes met PII, nieuwe third-party SDK's, nieuwe consent-scopes in `src/lib/consent-texts.ts`
2. **Verwerkers** — env-vars (`RESEND`, `N8N_WEBHOOK_URL`, Zoho, Cloudflare, Supabase, Hetzner); komen ze overeen met register + privacyverklaring? (PostHog/n8n alleen als env actief is)
3. **Bewaartermijnen** — `src/lib/intake-retention.ts`, privacyverklaring-tabel, ENTITY_MODEL
4. **Doorgifte buiten EU** — analytics, e-mail, CDN; DPF/SCC vermeld?
5. **Grondslagen** — elke nieuwe verwerking heeft art. 6 en (indien van toepassing) art. 9 grondslag
6. **DPIA-trigger** — vereist een wijziging DPIA-herziening? (nieuwe bijzondere gegevens, grootschalige profilering, nieuwe hoge risico's)
7. **Open `[VUL IN]`-punten** — verwerkersovereenkomsten; check of `N8N_WEBHOOK_URL` of PostHog intussen is geactiveerd

---

## Prompt (copy-paste)

```text
Je bent privacy-compliance reviewer voor PerfectSupplement.

Execution Contract:
- READ-ONLY op code; wijzig alleen docs/core/VERWERKINGSREGISTER.md als Dennis expliciet vraagt om update.
- Vergelijk register, DPIA en privacyverklaring tegen de actuele codebase (main).
- Lever markdown-rapport.

Taken:
1) Lees docs/core/VERWERKINGSREGISTER.md, docs/core/DPIA.md, src/app/privacy/page.tsx
2) Scan op drift:
   - supabase/migrations/ (nieuwe tabellen/kolommen met PII)
   - src/lib/consent-texts.ts (nieuwe scopes)
   - src/data/cookie-inventory.ts (sync met cookiebanner Details-tab en /cookies)
   - src/app/api/** (nieuwe endpoints met persoonsgegevens)
   - package.json / env-usage (nieuwe verwerkers)
3) Rapporteer inconsistenties tussen de drie documentlagen
4) Geef advies: register bijwerken / DPIA herzien / privacyverklaring bijwerken / geen actie

Output:

## Executive summary
- Gecontroleerd op: [datum]
- Resultaat: ✅ consistent / ⚠️ kleine drift / 🔴 actie vereist

## Drift-tabel
| Ernst | Onderwerp | Register | Privacyverklaring | Codebase | Advies |

## Open punten
- [ ] Verwerkersovereenkomsten
- [ ] [overige]

## Wijzigingslog-voorstel
Als geen wijziging nodig:
  "| [datum] | Gecontroleerd, geen wijziging |"
Als wijziging nodig:
  korte beschrijving per registerregel
```

---

## Na de run (Dennis)

| Situatie | Actie |
|---|---|
| Geen drift | Voeg één regel toe aan wijzigingslog in `VERWERKINGSREGISTER.md` |
| Kleine drift | Update register + eventueel privacyverklaring in dezelfde sessie |
| Wezenlijke wijziging | Update register + DPIA-sectie + privacyverklaring; overweeg DPIA-herziening |
| Nieuwe verwerker | Verwerkersovereenkomst tekenen vóór productie-gebruik |

**Datumregel:** de `Laatst bijgewerkt`-datum bovenaan het register wijzig je alleen bij inhoudelijke aanpassingen — niet bij een kale maandcontrole.
