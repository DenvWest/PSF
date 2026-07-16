# Cookie-consent pre-deploy checklist

**Laatst gecontroleerd:** 2026-07-16 (pre-traffic gate, productie)

Handmatige verificatie na wijzigingen aan cookiebanner of analytics-loading.

| Punt | Status | Opmerking |
|---|---|---|
| 1. Incognito → geen `_ga` / `_clck` cookies vóór opt-in | ✅ | |
| 2. Network tab → geen requests naar `google-analytics.com` / `clarity.ms` vóór opt-in | ✅ | |
| 3. **Weigeren** → site werkt, geen analytics-scripts | ✅ | |
| 4. Footer **Cookievoorkeuren** → modal heropent met huidige keuze | ✅ | |
| 5. Intake analytics-checkbox + submit → GA4 laadt zonder extra banner-klik | ✅ | |
| 6. `/intake` met consent → Clarity script **niet** geladen, GA4 wel | ✅ | |
| 7. Tab **Details** toont cookie-inventaris; tab **Over** toont consent-ID na opslaan | ✅ | |
| 8. Affiliate-link zonder marketing-toestemming → modal opent, geen redirect naar partner | ✅ | |
| 9. Marketing-toggle aan + opslaan → affiliate-link werkt weer | ✅ | |
| 10. Overlay volledig transparant — site achter modal leesbaar | ✅ | |
