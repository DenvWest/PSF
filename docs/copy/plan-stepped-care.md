# PLAN — stepped-care copy-placeholders

Eigenaar levert definitieve teksten. Cursor gebruikt placeholders tot vervanging.
Wijzig de teksten in `src/lib/plan-stepped-care-copy.ts` zodra ze definitief zijn.

## Trede-labels (werkwoord-vorm, B1)

Eén label per tier. Beschrijf het gevolg/de actie, geen jargon ("Quick win",
"Tracken", "Supplement" vermijden).

| tier | placeholder-label | bedoeling |
|------|-------------------|-----------|
| 1 | `{{Doe dit deze week}}` | gratis, concreet, < 10 min, geen aankoop |
| 2 | `{{Houd dit bij}}` | meten/tracken om patroon te zien |
| 3 | `{{Vul aan waar nodig}}` | ondersteuning/supplement (affiliate) |
| 4 | `{{Betaalde optie}}` | betaalde meting/dienst (later) |
| 5 | `{{Betaalde optie}}` | betaalde dienst (later) |

## Paid-disclosure-zin (KOAG/affiliate-conform)

Komt uit `disclaimers.key = 'paid_action_default'` (seed in migratie 3b).
Placeholder: "Affiliate: we kunnen een vergoeding ontvangen als je via deze link
koopt. Dit beïnvloedt onze beoordeling niet."

## "Geen actie beschikbaar voor deze trede"

Placeholder: "Voor deze stap hebben we nu geen los advies — de stappen
hierboven hebben prioriteit."
