# Interventies — Stress

Zie [sleep.md](./sleep.md) voor rubric en trigger-syntax.

## Gratis actie

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| rustmomenten-agenda | Vaste herstelmomenten inplannen | Blok twee korte pauzes van 3 minuten in je agenda — bewust zonder scherm. | 2 | 4 | 3 | 5 | meer ademruimte op drukke dagen | stress_score < 65 |

## Meten

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| stress-check-in | Spanning bijhouden | Noteer 7 dagen: wanneer spanning piekt en wat je lichaam doet. | 2 | 3 | 3 | 5 | inzicht in je stresspatroon | stress_score < 65 |

## Supplement

| slug | name | description | moeite | mech | ond | veil | goal_phrase | affiliate_url | triggers |
|------|------|-------------|--------|------|-----|------|-------------|---------------|----------|
| ashwagandha-stress | Ashwagandha | Aanvulling wanneer rustmomenten alleen niet genoeg voelen. | 3 | 3 | 3 | 4 | stress en herstel ondersteunen | | /beste/ashwagandha | stress_score < 60 |

## Stepped-care tier-mapping (Fase 3b)

`tier` stuurt alleen volgorde + visuele trap; `kind` blijft semantische tag.
- Gratis actie → `tier 1`, `is_paid = false`
- Meten → `tier 2`, `is_paid = false`
- Supplement → `tier 3`, `is_paid = true`, `paid_disclosure_key = paid_action_default`
- Later (betaalde treden) → `tier 4 | 5`, `is_paid = true`, met `external_provider_label` + `external_provider_url`
