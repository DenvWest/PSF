# Status 13 april 2026

## Af
- Homepage met hero tekst gericht op symptomen + "VOOR MANNEN 40+" label
- Intake flow op /intake (5 fases, 12 vragen, leeftijd, disclaimer, feedback)
- Scoring engine met 6 domeinen, urgentieniveaus en profiellabels
- Supabase opslag: intake_sessions, intake_reminders, intake_feedback
- Resend e-mail herinnering na 30 dagen
- Cron-job.org dagelijks om 09:00 voor automatische verzending
- Admin dashboard op /admin met login, grafieken, sessietabel, feedback
- Feedback component op resultatenpagina (ja/nee + toelichting)
- Medische disclaimer op intro en resultaten
- Homepage CTA naar intake + step-care link

## In progress
- Niets

## Volgende (in volgorde van prioriteit)
1. Beslislogica verfijnen: supplementroute nooit leeg laten
2. AVG-compliance: consent flow, DPIA documenteren
3. Nurture e-mailsequence (dag 0, 3, 7, 14, 21, 30)
4. Herhaalmeting met delta-rapport
5. Blogartikelen linken aan profieltypen
6. Meer supplementcategorieën (ashwagandha, creatine, vitamine D, zink)
7. organization_id toevoegen aan tabellen (voorbereiding B2B)
8. REST API v1 voor toekomstige white-label
