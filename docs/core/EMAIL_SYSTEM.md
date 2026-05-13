# EMAIL SYSTEM — PerfectSupplement

> **Layer 2 — Systems.** Nurture sequence, Resend, reminders, PDF-gidsen.

---

## Nurture sequence (6 emails, dag 0-30)

| Dag | Template key | Inhoud | Personalisatie |
|---|---|---|---|
| 0 | `day0_welcome` | Welkom + profiel intro | Profielnaam, profiel-tip, conditionele PDF-link |
| 3 | `day3_quickwins` | Quick wins | Afgestemd op zwakste domein |
| 7 | `day7_verdieping` | Verdieping | Link naar profiel-relevante pillar page |
| 14 | `day14_supplement` | Supplement intro | Profiel-relevante vergelijkingspagina |
| 21 | `day21_motivatie` | Motivatie | Herkenningsmoment herhalen |
| 30 | `day30_herhaalmeting` | Herhaalmeting CTA | "Meet je voortgang" → /intake |

## Dag-0 flow

1. Intake completion → `src/app/api/intake/session/route.ts`
2. `scheduleNurtureSequence` wordt aangeroepen
3. Dag-0 welcome email stuurt **direct** bij intake completion
4. Conditionele slaapgids-link bij `profile_label === "Onrustige Slaper"` of `sleep_score < 50`

## Technische implementatie

| Onderdeel | Details |
|---|---|
| E-mail provider | Resend (gratis tier 3000/mnd) |
| Database tabel | `nurture_emails` (apart van `intake_reminders`) |
| Scheduling | `scheduleNurtureSequence` in session route |
| Trigger | cron-job.org (externe trigger) |
| Templates | `src/lib/emails/` |

## PDF-gidsen

| Profiel | Gids | Locatie | Trigger |
|---|---|---|---|
| Onrustige Slaper | Slaapgids | `public/downloads/slaapgids-perfectsupplement.pdf` | `profile_label === "Onrustige Slaper"` of `sleep_score < 50` |
| Stressdrager | Stressgids | ⏳ Gepland | `profile_label === "Stressdrager"` of `stress_score < 50` |
| Lage Batterij | Energiegids | ⏳ Gepland | `profile_label === "Lage Batterij"` of `energy_score < 50` |

## 30-dagen reminder

Aparte tabel `intake_reminders`. Trigger via cron-job.org. Stuurt herinnering om intake opnieuw te doen.

---

*Laatst bijgewerkt: mei 2026*
