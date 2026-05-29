# Interventies — Slaap

Scoring-rubric (handmatig 1–5, geen AI):
- **Moeite**: hoeveel inspanning voor de gebruiker
- **Mechanisme**: hoe sterk het effect plausibel is
- **Onderbouwing**: kwaliteit van evidence
- **Veiligheid**: < 4 = nooit tonen

Composite (in app): `(mechanisme × onderbouwing × veiligheid) / moeite`

## Gratis actie

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| | | | | | | | | |

## Meten

| slug | name | description | moeite | mech | ond | veil | goal_phrase | triggers |
|------|------|-------------|--------|------|-----|------|-------------|----------|
| | | | | | | | | |

## Supplement

| slug | name | description | moeite | mech | ond | veil | goal_phrase | affiliate_url | triggers |
|------|------|-------------|--------|------|-----|------|-------------|---------------|----------|
| | | | | | | | | | |

Trigger-syntax: `group_id` + `kind` (`domain_below`, `domain_above`, `deficiency_signal`, `profile_label`, `answer`).

## Stepped-care tier-mapping (Fase 3b)

`tier` stuurt alleen volgorde + visuele trap; `kind` blijft semantische tag.
- Gratis actie → `tier 1`, `is_paid = false`
- Meten → `tier 2`, `is_paid = false` (true bij betaalde meting)
- Supplement → `tier 3`, `is_paid = true`, `paid_disclosure_key = paid_action_default`
- Later (betaalde treden) → `tier 4 | 5`, `is_paid = true`, met `external_provider_label` + `external_provider_url`

| tier | kind | slug | name | goal_phrase | moeite | mech | ond | veil | is_paid | external_provider_label | external_provider_url |
|------|------|------|------|-------------|--------|------|-----|------|---------|-------------------------|-----------------------|
| 4 | measurement | | | | | | | | true | | |  (later) |
| 5 | | | | | | | | | true | | |  (later) |
