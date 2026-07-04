# Cursor Schedule — maandelijkse privacy-register controle

**Frequentie:** 1× per maand, 1e werkdag 08:00  
**Type:** read-only audit  
**Volledige instructies:** [`monthly-privacy-register-review.md`](monthly-privacy-register-review.md)

---

## Prompt (plak in Cursor Schedule)

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
- [ ] Verwerkersovereenkomsten (Zoho DPA indien nog open)
- [ ] [overige]

## Wijzigingslog-voorstel
Als geen wijziging nodig:
  "| [datum] | Gecontroleerd, geen wijziging |"
Als wijziging nodig:
  korte beschrijving per registerregel
```
