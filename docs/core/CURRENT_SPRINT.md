# CURRENT SPRINT — PerfectSupplement

> **Layer 3 — Work.** Wat nu gebouwd wordt. Dit document verandert regelmatig.

---

## Strategische prioriteit

**Meet-lus + account/dashboard (juni 2026).** De content-foundation staat; de focus ligt nu op de **continuïteit-moat**: een persoonlijk passwordless account, een `/dashboard` op echte data, en de check-in-meet-lus. Zie [`ACCOUNT_DASHBOARD_SYSTEM.md`](ACCOUNT_DASHBOARD_SYSTEM.md). Content-spinnenweb = doorlopend onderhoud, geen sprintfocus meer.

---

## Voltooid ✅

1. ✅ Pillar: `/slaap-verbeteren-na-40`
2. ✅ Pillar: `/stress-verminderen-man`
3. ✅ Pillar: `/energie-na-40`
4. ✅ Pillar: `/herstel-verbeteren-na-40`
5. ✅ Pillar: `/testosteron-na-40` (vijfde cluster)
5b. ✅ Pillar: `/voeding-na-40` (tier-1 nutrition-ingang)
5c. ✅ Pillar: `/beweging-na-40` (tier-1 movement-ingang)
6. ✅ Profiel: `/profiel/onrustige-slaper`
7. ✅ Profiel: `/profiel/stressdrager`
8. ✅ Profiel: `/profiel/lage-batterij`
9. ✅ Profiel: `/profiel/overtrainer`
10. ✅ 7 affiliate-vergelijkingen (`/beste/*`; melatonine alleen informatief via `/supplementen/melatonine`)
11. ✅ 27 blogartikelen, 24 kennisbankbegrippen, 4 thema-hubs
12. ✅ Slaapgids PDF + dag-0 nurture mail integratie
13. ✅ SEO audit fixes (admin noindex, canonical consistentie)
14. ✅ Nurture email sequence (6 templates)
15. ✅ Admin dashboard
16. ✅ Doc reorganisatie (3-layer system)
17. ✅ Cluster-blog: `/blog/cortisol-en-testosteron`
18. ✅ Cluster-blogs: `/blog/creatine-en-herstel`, `/blog/vitamine-d-en-energie`
19. ✅ Kennisbank: testosteron, slaapschuld, overtrainingssyndroom
20. ✅ Spinnenweb-links profielen ↔ cluster-blogs ↔ kennisbank
21. ✅ Sitemap: alle pillar pages (incl. voeding, beweging)
22. ✅ Wave 1 spinnenweb: inline KB-links (cortisol, HPA-as, melatonine, magnesiumvormen), stress/energie cornerstone → pillars, herstel-pillar KB-links
23. ✅ Wave 2 spinnenweb: profiel-KB-links, IntakeResults kennisbank bij lage score, blog `/blog/eiwit-na-40`
24. ✅ Wave 3 spinnenweb: blogs middagdip + krachttraining, kennisbank `vitamine-d`, energie-pillar insulineresistentie, profiel-links
25. ✅ Wave 4 spinnenweb: alcohol-blog (NRG_DEP), nervus vagus in ademhaling, KB markdown-rendering, Mg/melatonine cross-links
26. ✅ Wave 5 spinnenweb: ComparisonProfileFits op 8 vergelijkingen, homepage thema-links incl. herstel, stress-categorie pillar, DefinedTerm schema
27. ✅ Wave 6 spinnenweb: supplement-gids profiel-fits, homepage profielen, supplementen-categorie hub, FAQ schema gecentraliseerd

---

## Account & dashboard epic (juni 2026)

**Voltooid ✅**
- F1 identiteitslaag: `accounts` + `account_login_tokens` + `intake_sessions.account_id`, account_storage-consent
- F1.2 auth-kern → **OTP-inlogcode** (6-cijfer op de site + magic-link in de mail), `psf_account`-cookie (aparte secret, 90d)
- F1.3 claim-by-email (RPC's) + revoke (intrekken omkeerbaar / verwijderen definitief)
- F1.4 gate + account-beheer-scherm + logout
- F2 dashboard op echte `intake_sessions` (Dutch pillar-mapping, `computeVitaliteit`, trend, prioriteit, historie)
- F3 check-in-CTA's op het dashboard + F3b: `intake_domain_checkin` (slaap/stress/beweging) in de trend
- Login-vindbaarheid: IMU-header (Inloggen + gratis check), post-check account-CTA, nav-frictie (dashboard↔home zonder uitloggen), header opgeschoond (zoek eruit)

**Backlog (op urgentie)**
1. Voeding in de trend via `intake_intake_log` (F3b-deel-2) — medium
2. Identiteit-sectie scopen + bouwen (geslacht/gewicht/lengte/werk → eiwit/PAL; biometrie → voedingsadvies) — groot, eerst scope-besluit
3. Nurture-mail-consolidatie (geen aparte login/welkomstmail bóvenop nurture)
4. Resultaatscherm declutteren (diepte → dashboard, één primaire actie, twee e-mail-vragen samenvoegen)
5. Wearables / objectieve signalen — toekomst

---

## Volgende sprint (Wave 7)

| # | Item | Type | Impact |
|---|---|---|---|
| 1 | Breadcrumb schema centraliseren | Tech | ✅ Alle schema-builders importeren direct uit `@/lib/seo/structuredData`; legacy shim verwijderd |
| 2 | Profiel-overzicht vanuit footer | SEO | ✅ Footer linkt naar `/profiel`, `/juridisch` en `/cookies` |
| 3 | `/thema/herstel` hub of redirect | SEO | ✅ redirect → `/herstel-verbeteren-na-40` |
| 4 | Mobile device testing checklist | QA | Doelgroep mobiel |

## Op de horizon (was Wave 6)

- Meer profiel-specifieke PDF-gidsen (stressgids, energiegids)
- 30-dagen herhaalmeting met delta-vergelijking
- Admin dashboard affiliate clicks sectie
- Mobile device testing (checklist-based)
- Style upgrade voor lagere-kwaliteit pagina's
- B2B white-label pilot (geparkeerd tot content foundation staat)
- Decision tool (voeding-eerst) — fase 2 intake extensie
- Podcast/content channel

---

## Doorlopend

- Cluster-blogs: 2-3 per maand, gekoppeld aan pillars
- Kennisbank: uitbreiden waar nodig
- Bestaande blog audit: herkenningsmoment + interne links
- Interne link audit na elke sprint
- "Past bij profiel X" blok toevoegen aan vergelijkingpagina's

---

*Laatst bijgewerkt: 17 juni 2026*
