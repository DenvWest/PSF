# Interventies — Voeding

Zie [sleep.md](./sleep.md) voor rubric en trigger-syntax.

## Gratis actie

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| eiwit-per-maaltijd | Eiwit bij elke maaltijd | Begin elke maaltijd met 20–30 g eiwit. | 2 | 4 | 4 | 5 | stabielere energie en herstel | nutrition_score < 65 |

## Meten

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| voeding-dagboek | Voeding bijhouden | Noteer 5 dagen: eiwit per maaltijd en vetzuren. | 2 | 3 | 3 | 5 | inzicht in je voedingspatroon | nutrition_score < 65 |

## Supplement

| slug | name | description | moeite | mech | ond | veil | goal_phrase | affiliate_url | triggers |
|------|------|-------------|--------|------|-----|------|-------------|---------------|----------|
| omega-3-voeding | Omega-3 (EPA/DHA) | Aanvulling wanneer vette vis structureel ontbreekt. | 3 | 4 | 4 | 5 | vetzuur-balans ondersteunen | | /beste/omega-3-supplement | nutrition_score < 60 |

## Stepped-care tier-mapping (Fase 3b)

`tier` stuurt alleen volgorde + visuele trap; `kind` blijft semantische tag.
- Gratis actie → `tier 1`, `is_paid = false`
- Meten → `tier 2`, `is_paid = false`
- Supplement → `tier 3`, `is_paid = true`, `paid_disclosure_key = paid_action_default`
- Later (betaalde treden) → `tier 4 | 5`, `is_paid = true`, met `external_provider_label` + `external_provider_url`
