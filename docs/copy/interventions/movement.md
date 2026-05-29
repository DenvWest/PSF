# Interventies — Beweging

Zie [sleep.md](./sleep.md) voor rubric en trigger-syntax.

## Gratis actie

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| rustdag-na-training | Rustdag na zware training | Plan vandaag een rustdag of lichte wandeling na harde training. | 2 | 4 | 4 | 5 | herstel tussen inspanningen | movement_score < 65 |

## Meten

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| training-log | Belasting bijhouden | Noteer 7 dagen: training, slaap en zwaarte na inspanning. | 2 | 3 | 3 | 5 | inzicht in belasting en herstel | movement_score < 65 |

## Supplement

| slug | name | description | moeite | mech | ond | veil | goal_phrase | affiliate_url | triggers |
|------|------|-------------|--------|------|-----|------|-------------|---------------|----------|
| creatine-beweging | Creatine | Aanvulling bij krachttraining en herstel. | 3 | 4 | 4 | 5 | kracht en herstel ondersteunen | | /beste/creatine | movement_score < 60 |

## Stepped-care tier-mapping (Fase 3b)

`tier` stuurt alleen volgorde + visuele trap; `kind` blijft semantische tag.
- Gratis actie → `tier 1`, `is_paid = false`
- Meten → `tier 2`, `is_paid = false`
- Supplement → `tier 3`, `is_paid = true`, `paid_disclosure_key = paid_action_default`
- Later (betaalde treden) → `tier 4 | 5`, `is_paid = true`, met `external_provider_label` + `external_provider_url`
