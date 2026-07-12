# Compliance- & security-audit — PartnerDesk

*Juridische en compliance-audit van het ontwerp in `PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md`, uitgevoerd als externe auditor vóór productie-goedkeuring.*

Datum: 12 juli 2026 · Status: audit op ontwerp (nog niet gebouwd)

> **Disclaimer**: dit is een compliance-analyse door een AI-assistent, geen juridisch advies. Bij twijfelpunten (gemarkeerd ⚖️ *juridisch onzeker*) is toetsing door een advocaat/FG aangewezen vóór productie.

**Kernbeeld vooraf**: het risicoprofiel is laag — single-tenant, één gebruiker, hoofdzakelijk B2B-gegevens, geen bijzondere categorieën, geen besluiten over personen. Maar "intern gebruik" is géén AVG-vrijstelling: contactpersonen van partners zijn betrokkenen met volle rechten. De audit vond **drie ontwerp-conflicten** die vóór de bouw gerepareerd moeten worden (§5-bevindingen D1–D3) — goedkoop nu, duur achteraf.

---

## Stap 1 — Relevante wet- en regelgeving

| Wet | Waarom relevant | Wanneer van toepassing | Raakt in dit systeem | Risico |
|---|---|---|---|---|
| **AVG + UAVG** | Contactpersonen, e-mail-logging, notities, klik/conversiedata = persoonsgegevens; jij bent verwerkingsverantwoordelijke | Altijd, vanaf record 1 | contacts, timeline (mail/notities), documents (handtekeningen), clicks/conversions (pseudoniem), auth-logs, embeddings | **Hoog** (enige wet met reële handhavings- en gat-kans) |
| **Telecommunicatiewet art. 11.7a (cookiewet/ePrivacy)** | Affiliate tracking werkt met cookies/identifiers | Bij plaatsen/uitlezen op randapparatuur | Niet in de backoffice zelf (alleen functionele sessie-cookie); wél in de keten publisher-site ↔ netwerk waarvan dit systeem data importeert | **Middel** (verplichting ligt op perfectsupplement.nl, niet op PartnerDesk — zie stap 10) |
| **AI Act (EU) 2024/1689** | Fase 4 gebruikt een general-purpose AI-model | Gefaseerd; art. 4 (AI-geletterdheid) geldt al, GPAI-regels via provider | Extractie, samenvatting, "vraag het dossier", suggesties | **Laag** (geen verboden praktijk, geen Annex-III-hoog-risico — zie stap 9) |
| **AWR art. 52 (fiscale bewaarplicht)** | Contracten, commissie-afrekeningen en conversiedata zijn (basis)administratie | 7 jaar bewaarplicht | contracts, conversions, rapportage-exports, facturen/creditnota's van netwerken | **Middel** (vergt bewaar- én níet-te-vroeg-wissen-beleid) |
| **Burgerlijk recht / contractrecht** | Programma-voorwaarden van netwerken (Daisycon e.d.) beperken datagebruik, doorlevering en opslag van feed-/conversiedata | Per gesloten aansluiting | feeds, clicks/conversions, raw-payloads, productdata | **Middel** (voorwaarden-check per netwerk nodig; sommige verbieden lokale opslag > X mnd) ⚖️ |
| **Auteursrecht** | Banners, logo's, productfoto's van partners zijn beschermd materiaal | Bij opslag/gebruik | documents (materiaal), product-afbeeldingen | **Laag** (gebruik binnen programma-licentie; bewaar herkomst) |
| **Oneerlijke handelspraktijken (art. 6:193a BW) / Reclamecode** | Affiliate-transparantie richting consument | Op de publieke site, niet in de backoffice | Buiten scope van dit systeem; reeds belegd op perfectsupplement.nl (`nofollow sponsored`, disclosure) | **Laag** |
| **Data Act** | Cloud-switching-bepalingen | Vanaf sep 2025 voor cloudcontracten | Werkt in jouw vóórdeel (Supabase-exit); geen eigen plichten (geen connected products) | **n.v.t.** als plicht |
| **DSA** | Alleen voor tussenhandelsdiensten met derden-content | — | Intern systeem, geen gebruikerscontent van derden | **n.v.t.** |
| **DMA** | Alleen poortwachters | — | — | **n.v.t.** |
| **NIS2 (Cyberbeveiligingswet NL)** | Essentiële/belangrijke entiteiten, sectoraal + omvangdrempels | — | Micro-onderneming buiten sectoren → niet verplicht; wel bruikbaar als baseline | **n.v.t.** als plicht |

Conclusie stap 1: het compliance-zwaartepunt ligt bij **AVG + fiscale bewaarplicht + netwerk-contractvoorwaarden**. AI Act is licht, de rest is niet van toepassing — laat je niet afleiden door DSA/DMA/NIS2-lijstjes.

---

## Stap 2 — DPIA-light

**DPIA formeel verplicht (art. 35)?** Nee ⚖️ — geen grootschalige/systematische monitoring van betrokkenen, geen bijzondere categorieën, geen AP-lijst-verwerking. Deze DPIA-light is een best practice en tevens verantwoordingsdocument (art. 5 lid 2).

| Vraag | Antwoord |
|---|---|
| **Welke persoonsgegevens** | (a) Zakelijke contactpersonen: naam, functie, zakelijk e-mail/telefoon, LinkedIn, contactnotities. (b) Communicatie: gelogde mails (BCC), meetingnotities — vrije tekst. (c) Handtekeningen/namen in contract-PDF's. (d) Pseudonieme consumentdata: click-ID's, sub-ID's, order-referenties, mogelijk IP in raw-payloads. (e) Eén interne gebruiker: accountgegevens, auth-logs. (f) Eenmanszaak-partners: bedrijfsgegevens = persoonsgegevens. |
| **Waarom** | Relatiebeheer en contractadministratie van affiliate-partnerschappen; financiële verantwoording; (F4) AI-ondersteuning bij dossieronderhoud. |
| **Grondslag** | Contactbeheer/dossier: **gerechtvaardigd belang** (art. 6(1)(f)) — normaal zakelijk relatiebeheer, geringe inbreuk, betrokkenen mogen dit redelijkerwijs verwachten; belangenafweging vastgelegd in dit document. Contracten/conversies: deels **wettelijke verplichting** (art. 6(1)(c), AWR). Mail-logging van volledige inhoud: gerechtvaardigd belang **mits geminimaliseerd** (zie risico R1). |
| **Bewaartermijnen** | Zie stap 12; kern: fiscaal 7 jr, contactgegevens einde relatie + 1 jr, kliks 13 mnd, serverlogs 30 dgn. |
| **Risico's** | R1 mail-logging zuigt persoonsgegevens van derden (cc's, klantcases in mails) naar het dossier. R2 append-only tijdlijn + "archiveren, nooit wissen" (plan A9) maakt wissing feitelijk onmogelijk. R3 doorgifte VS (Anthropic, Resend). R4 vrije-tekstvelden (notities) worden onbedoeld gevoelig ("Jeroen is ziek, burn-out"). R5 raw-payloads bevatten meer dan nodig (IP's, e-mails van consumenten). |
| **Maatregelen** | M1 mail-logging standaard alleen metadata + samenvatting, volledige body opt-in per mail. M2 PII-scrub-functie (ontwerp-eis, zie stap 13). M3 DPA's + doorgiftemechanisme per verwerker (stap 14). M4 UI-hint bij notities ("zakelijk, feitelijk") + scrub-bereik omvat vrije tekst. M5 allowlist-import: alleen benodigde velden uit API-responses persisteren, raw-payload gefilterd. |
| **Alternatieven overwogen** | Geen mail-logging (verlies kerdoel — afgewezen, wel geminimaliseerd); kliks niet lokaal opslaan maar alleen aggregaten (beperkt afwijkingsdetectie — deels overgenomen: bewaar kort, aggregeer daarna); AI lokaal draaien (onpraktisch; API met DPA + zero-retention volstaat). |
| **Restrisico's** | Vrije tekst blijft menselijk risico (discipline + scrub als vangnet); pseudonieme klikdata blijft herleidbaar in de keten bij het netwerk (buiten jouw macht, contractueel afgedekt); single-admin-account blijft single point of failure (MFA + wachtwoordmanager). Restniveau: **laag en aanvaardbaar** na maatregelen. |

---

## Stap 3 — Gegevensregister

Legenda: PG = persoonsgegeven · Enc = extra encryptie bovenop disk-encryptie · Exp/Del/Anon = exporteerbaar / verwijderbaar / anonimiseerbaar. Dit register + stap 12 vormt samen het **verwerkingsregister (art. 30)** — verplicht, want de verwerking is structureel, niet incidenteel.

| Gegeven | PG? | Bijzonder? | Gevoelig? | Bewaartermijn | Enc? | Logging? | Exp | Del | Anon |
|---|---|---|---|---|---|---|---|---|---|
| Partnernaam/bedrijf | Nee, **tenzij eenmanszaak** | Nee | Nee | relatie + 7 jr (fiscale context) | disk | mutatie-events | ✓ | archief | ✓ |
| Contactpersoon (naam, functie) | **Ja** | Nee | Nee | einde relatie + 1 jr | disk | mutatie-events | ✓ | **scrub vereist** | ✓ |
| Zakelijk e-mail/telefoon | **Ja** | Nee | Beperkt | idem | disk | ja | ✓ | scrub | ✓ |
| LinkedIn-URL | **Ja** | Nee | Nee | idem — heroverweeg noodzaak (minimalisatie) | disk | ja | ✓ | scrub | ✓ |
| Notitie / tijdlijn-tekst | **Ja** (vaak) | **Kan** (vrije tekst!) | Ja | relatie + 2 jr | disk | append-only | ✓ | **scrub vereist** | deels |
| Gelogde mail (body) | **Ja**, ook derden | Kan | Ja | 2 jr, daarna alleen samenvatting | disk | ja | ✓ | scrub | deels |
| Contract-PDF | **Ja** (handtekening, namen) | Nee | Ja (commercieel) | einde + 7 jr (AWR) | disk + private bucket | upload-event | ✓ | na termijn | nee |
| IP-adres (raw payloads/serverlogs) | **Ja** | Nee | Ja | **niet persisteren** (allowlist-import); serverlogs 30 dgn | disk | n.v.t. | — | ✓ | ✓ |
| Klik (click-ID, sub-ID, timestamp) | **Ja** (pseudoniem) | Nee | Beperkt | 13 mnd, daarna aggregaat | disk | import-runs | ✓ | ✓ | ✓ |
| Conversie (orderref, bedragen) | **Ja** (pseudoniem) + fiscaal | Nee | Ja (financieel) | 7 jr (AWR) | disk | import-runs | ✓ | na termijn | ✓ (na 13 mnd orderref hashen) ⚖️ |
| Cookie-ID | Ja — **hoort hier niet**: niet importeren | — | — | 0 | — | — | — | — | — |
| Campagne | Nee | — | Nee | onbeperkt | disk | events | ✓ | ✓ | — |
| Document (banner/handleiding) | Nee (meestal) | Nee | Nee | einde relatie | disk | upload-event | ✓ | ✓ | — |
| Gebruikersaccount (Dennis) | **Ja** | Nee | Ja (toegang) | duur gebruik | Supabase Auth (hash) | auth-logs | ✓ | ✓ | — |
| Auditlog / timeline_events | **Ja** (indirect) | Nee | Ja | relatie + 7 jr, PII-scrubbaar | disk | is zelf log | ✓ | scrub | ✓ |
| API-token/credentials | Nee (wel geheim) | — | **Zeer** | duur verbinding + rotatie | **AES-256-GCM** (plan A11 ✓) | nooit inhoudelijk loggen | **nee** | ✓ | — |
| Webhook-payload (Resend inbound) | **Ja** (mail) | Kan | Ja | verwerken → wissen ruwe payload ≤ 30 dgn | disk | ontvangst-log zonder body | — | ✓ | — |
| Feed / product / commissieregel | Nee | — | Commercieel | operationeel | disk | runs/events | ✓ | ✓ | — |
| Embeddings (F4) | **Ja** (afgeleid van notities/docs) | Kan | Ja | volgt bron; **mee-scrubben bij wissing bron** | disk | re-embed-log | — | ✓ | nee |

---

## Stap 4 — Dataflows

```
[1] Affiliate netwerk (Daisycon API, EU)
      │ HTTPS, API-key (AES-GCM opgeslagen)
      ▼
[2] Import-job (tick, advisory lock)
      │ ALLOWLIST-FILTER: alleen benodigde velden; IP/cookie-ID/e-mail
      │ van consumenten worden NIET gepersisteerd (M5)
      ▼
[3] Postgres (Supabase, EU-regio — verplichte keuze) ── PITR/back-ups (Supabase, EU)
      │                                                  └─ retentie 30 dgn, restore-test per kwartaal
      ├─► [4] Dashboard/dossier (server-rendered, sessie-cookie functioneel)
      ├─► [5] Rapportage → CSV-export (bevat pseudonieme + financiële data;
      │        export = eigen verantwoordelijkheid: lokaal opslaan in versleutelde omgeving)
      ├─► [6] Zoekindex (pg_trgm, in dezelfde DB; credentials uitgesloten)
      └─► [7] AI-laag (F4): chunks → Anthropic API (VS/EU-endpoint)
               │ DPA + zero-data-retention vereist; geen training op input
               └─► embeddings terug → eigen DB (blijft in EU)

[8] Mail → BCC log@… → Resend inbound (VS-verwerker!) → webhook (signature-check)
      → domein-match → timeline_event (samenvatting; body opt-in) → ruwe payload wissen ≤ 30 dgn

[9] Uploads (PDF/banners) → Supabase Storage private bucket → signed URLs (kort geldig)

[10] Verwijderpad (ontbreekt in plan — moet erbij, D1):
      archiveren (operationeel) ─≠─ wissen (AVG):
      PII-scrub-service raakt: contacts → timeline (body + metadata-snapshots)
      → documents (verwijderen of vervangen) → embeddings → zoek/recent_visits → back-up-verloop
      (wissing wordt effectief in back-ups na rotatietermijn — vastleggen in beleid)
```

Tussenstappen expliciet: elke import logt een run (wat, wanneer, hoeveel); elke mutatie een timeline-event; exports zijn handmatige acties (geen automatische doorlevering aan derden — er ís geen derde).

---

## Stap 5 — Privacy by Design per module

**Ontwerp-conflicten (blockers, repareren vóór bouw):**
- **D1 — Wissingsplicht vs. append-only/archiveren.** Plan A9 ("archiveren i.p.v. verwijderen") + append-only `timeline_events` botst met art. 17 AVG zodra een contactpersoon om wissing vraagt. Fix: **PII-scrub-service** als F1-bouwtaak — vervangt naam/e-mail/telefoon/LinkedIn en vrije-tekst-referenties door pseudoniem (`Contact [gewist]`), inclusief `metadata`-snapshots in events, embeddings en recent_visits. Append-only blijft (structuur bewaren, inhoud scrubben is verenigbaar met art. 17). ⚖️ *Volledig bewaren "omdat het handig is" is geen grondslag.*
- **D2 — Mail-logging te ruim.** BCC-logging (plan BR-16/F3) slaat standaard volledige mailbodies op, inclusief persoonsgegevens van derden die nooit een relatie met jou hadden. Fix: standaard metadata + onderwerp + automatische samenvatting; volledige body alleen na expliciete keuze per mail.
- **D3 — Raw payloads.** `raw jsonb` op clicks/conversions (plan §3) bewaart alles wat het netwerk stuurt, mogelijk IP's/klantdata. Fix: allowlist-import; `raw` alleen voor de gefilterde velden of maximaal 90 dgn voor debugging, daarna nachtelijke strip-job.

| Module | Privacyrisico | Verbetering |
|---|---|---|
| Partnerdossier | Eenmanszaak = persoonsgegeven zonder dat je 't merkt | Veld `is_sole_proprietor` of werkinstructie; zulke partners vallen onder scrub-bereik |
| Contactpersonen | Informatieplicht **art. 14** (gegevens niet van betrokkene zelf verkregen — uit netwerk-dashboards/LinkedIn) wordt vrijwel altijd vergeten | Privacyverklaring op site + verwijzing in eerste mailcontact; LinkedIn-veld heroverwegen (minimalisatie) |
| Contracten | Handtekeningen/namen in PDF's; 7-jaar-plicht ≠ eeuwig | Retentie-job na einde+7 jr; geen OCR-tekst onnodig dupliceren |
| Commissies | Geen PG | — |
| Producten/feeds | Geen PG; wél contractuele beperkingen netwerk op feeddata | Voorwaarden-check per netwerk vastleggen in dossier (notitie bij aansluiting) |
| API | Credentials | Al goed ontworpen (A11); aanvullen met rotatiebeleid (stap 11) |
| Taken | Vrije tekst kan PG bevatten | Onder scrub-bereik brengen |
| Rapportages | Pseudonieme data in CSV-exports verlaat het systeem | Export-log (wie/wanneer — trivial bij 1 gebruiker, toch loggen); geen exports in gedeelde mappen |
| Zoekfunctie | Indexeert notities/mails → PII breed vindbaar | Acceptabel intern; scrub moet ook de index raken (zelfde DB → automatisch) |
| AI (F4) | Doorgifte + afgeleide data (embeddings) | Stap 9 |
| Documenten | Derden-PII in bijlagen | Upload-discipline; scrub kan document-delete vereisen |
| Notities/tijdlijn | Grootste vrije-tekst-risico | UI-microcopy ("feitelijk en zakelijk"); D1-scrub |
| Dashboard | Geen extra PG | — |

---

## Stap 6 — Security by Design (OWASP-gebaseerd)

Referentie: OWASP ASVS 4.0 niveau 1–2 (passend bij risicoprofiel).

| Domein | Maatregel (concreet) |
|---|---|
| **Authenticatie** | Supabase Auth + allowlist (plan A4) **+ MFA verplicht aanzetten** — één admin-account zonder MFA is het grootste enkelvoudige risico van dit systeem. Wachtwoord ≥ 16 tekens uit manager. Login-rate-limit (Supabase default + Nginx `limit_req`). |
| **Autorisatie** | Ook met 1 gebruiker: elke server action valideert sessie server-side; RLS `authenticated`-only op álle tabellen; `service_role`-key alleen in server-omgeving, nooit client. |
| **Sessies** | Cookies `HttpOnly; Secure; SameSite=Lax`; sessieduur ≤ 7 dgn met refresh; logout overal. |
| **API (tick/jobs)** | Secret-header met constant-time-vergelijking; optioneel IP-allowlist (VPS → eigen endpoint); 401 zonder detail. |
| **Uploads** | Allowlist op MIME **én magic bytes** (extensie-check alleen is omzeilbaar); limiet 25 MB; **SVG niet ongesanitizeerd accepteren** (XSS-vector — plan §13 staat svg toe: sanitizen met SVGO/DOMPurify of alleen als `<img>` serveren vanaf apart storage-domein met `Content-Disposition: attachment` en CSP `sandbox`); zip alleen opslaan, nooit server-side uitpakken (zip-bomb/path traversal). |
| **Bestandsopslag** | Private buckets; signed URLs ≤ 10 min; geen publieke listing; pad-namen zonder PII. |
| **Back-ups** | Supabase PITR (EU); encrypted at rest; **kwartaal-restore-test** (een niet-geteste back-up bestaat niet); rotatie 30 dgn (bepaalt wanneer wissing effectief is — beleid, stap 4). |
| **Logging** | Stap 7; nooit secrets/tokens/mail-bodies in serverlogs. |
| **Database** | TLS-only verbindingen; least-privilege (app-rol geen DDL); RLS aan; `timeline_events` UPDATE/DELETE revoked (plan ✓) — scrub via aparte `security definer`-functie met eigen audit-event. |
| **Encryptie** | At rest: Supabase default. In transit: TLS 1.2+. Applicatielaag: credentials AES-256-GCM (plan ✓); key in env; **key-rotatieprocedure documenteren** (herversleutel-script). |
| **Secrets** | Nooit in repo; `.env` op server met 600-permissies; aparte keys per omgeving; rotatie bij incident én jaarlijks. |
| **Webhooks (Resend)** | Signature-verificatie (svix-headers) verplicht; timestamp-tolerantie ≤ 5 min (replay); onbekende afzender → "onverwerkt"-bak, nooit auto-koppelen. |
| **Rate limiting** | Login + webhook + tick-route; Nginx-laag volstaat (single user). |
| **CSRF** | Next.js Server Actions hebben origin-binding; aanvullend `SameSite=Lax` + geen state-changing GET's. |
| **XSS** | React-escaping; verbod `dangerouslySetInnerHTML` (lint-regel); CSP: `default-src 'self'`, geen inline scripts; mail-bodies (HTML!) altijd als tekst renderen of door DOMPurify. |
| **SQL-injectie** | Uitsluitend geparametriseerde queries via Supabase-client/`sql`-tagged templates; zoek-input nooit geconcateneerd (pg_trgm via parameters). |
| **IDOR** | Laag risico (1 gebruiker), maar signed URLs + sessie-check per resource houden het dicht; UUID's zijn geen beveiliging. |
| **Broken access control** | Elke route achter middleware-guard; expliciete test: uitgelogd → alles 302 naar /login (Playwright-case in F1-smoke). |
| **Headers/VPS** | HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors 'none'; VPS: SSH-keys-only, fail2ban, unattended-upgrades, firewall alleen 80/443/SSH. |
| **Dependencies** | `npm audit` in CI; lockfile-discipline; Dependabot of maandelijkse update-ronde. |

---

## Stap 7 — Logging

**Wél loggen**: auth-gebeurtenissen (login, mislukte pogingen, MFA-wijziging); alle mutaties (= timeline_events, bestaat by design); import-runs met aantallen; job-uitvoeringen; scrub-uitvoeringen (wát gescrubd is als categorie, niet de oude waarde!); export-acties; webhook-ontvangsten (metadata); applicatiefouten met stacktrace.

**Níet loggen**: wachtwoorden/tokens/API-keys (ook niet gemaskeerd half); volledige mail-bodies of document-inhoud in serverlogs; raw API-payloads in applicatielogs; zoekopdrachten met inhoud (alleen latency/aantallen); persoonsgegevens in URL's (dus geen e-mail in querystrings — design-regel).

**Bewaartermijnen**: serverlogs (Nginx/systemd) 30 dgn; `api_logs` 90 dgn (plan ✓); auth-logs 12 mnd; timeline_events = dossierhistorie (stap 12), geen "log" in retentietechnische zin.

**Verplicht vs. verstandig**: geen wettelijke auditlog-plicht voor dit systeem; timeline als audit-trail is een sterke aanbeveling (verantwoordingsplicht art. 5(2)) en al ontworpen. Verplicht is wél: datalek-documentatie (art. 33(5)) — elk incident intern vastleggen, ook niet-gemelde.

---

## Stap 8 — Documenten

- **Regels**: contracten = fiscale administratie → 7 jr na einde (AWR); handtekeningen/namen = persoonsgegevens → binnen scrub-/retentiebeleid; banners/logo's = auteursrechtelijk beschermd → gebruik binnen programma-voorwaarden, verwijderen na einde partnerschap (licentie eindigt meestal mee).
- **Metadata bewaren**: uploader (impliciet), upload-datum, bron/herkomst (mail, netwerk-dashboard), versie, type, gekoppeld contract — allemaal al in het datamodel ✓; voeg `origin`-veld toe (herkomst is bewijswaarde).
- **Verwijderen**: contracten na einde+7 jr (job + jaarlijkse review-taak); marketingmateriaal bij einde partnerschap; handleidingen bij vervanging (versies opruimen > 2 versies terug).
- **Beveiligen**: private bucket, signed URLs kort, geen PII in bestandsnamen, upload-validatie (stap 6), virus-scan is bij 1 uploader optioneel (best practice, geen blocker).

---

## Stap 9 — AI (fase 4)

**AI Act-classificatie**: jij bent *gebruiksverantwoordelijke (deployer)* van een GPAI-model via API. Contract-extractie, samenvatting, zoeken-met-bronnen en werkstroomsuggesties vallen **niet** onder verboden praktijken (art. 5) en **niet** onder Annex III-hoog-risico (geen besluiten over natuurlijke personen: geen werving, kredietwaardigheid, essentiële diensten). Classificatie: **minimaal risico** ⚖️ (herbeoordelen bij elke nieuwe AI-feature — zodra AI iets over een *persoon* gaat beoordelen, kantelt dit).

**Verplichtingen en aanbevelingen:**
1. **Art. 4 AI-geletterdheid** (geldt nu al): kort AI-gebruiksbeleid volstaat bij 1 gebruiker — wat mag erin, wat nooit (zie 3), hoe om te gaan met fouten.
2. **AVG**: Anthropic = verwerker → **DPA afsluiten + zero-data-retention/geen-training bevestigen** (API-standaard, maar leg vast); doorgifte VS via DPF/SCC's controleren; overweeg EU-endpoint indien beschikbaar.
3. **Dataminimalisatie richting model**: contracten en notities bevatten namen — acceptabel onder de DPA, maar stuur nooit credentials of volledige mail-threads; scope prompts op het dossier (plan §20.4 ✓).
4. **Menselijke controle**: het ontwerp is hier al goed — *suggestie ≠ mutatie*, bevestiging per veld, `actor='ai'` in de tijdlijn (plan §20.5–20.6 ✓). Vasthouden als harde regel: AI krijgt nooit een service-functie die zonder bevestiging muteert.
5. **Uitlegbaarheid/hallucinaties**: bronverplichting (plan EC-118 ✓) + bron-quote bij extracties (✓); voeg toe: confidence nooit tonen als percentage (schijnprecisie), wel "controleer dit veld".
6. **Logging**: elke AI-suggestie + besluit (overgenomen/afgewezen) persisteren — zit in `ai_extractions.status` ✓; bewaar prompts niet langer dan nodig (30 dgn debug, daarna weg).
7. **Bewaartermijn afgeleiden**: embeddings volgen de bron (stap 3); extracties volgen het contract.
8. **Art. 22 AVG** (geautomatiseerde besluitvorming): niet van toepassing — geen besluiten met rechtsgevolgen over personen. Zo houden.

---

## Stap 10 — Cookies & tracking

- **PartnerDesk zelf (backoffice)**: alleen een strikt noodzakelijke sessie-cookie → **geen toestemming, geen banner** (Tw 11.7a-uitzondering). Geen analytics in de backoffice zetten — dan blijft dit zo.
- **De affiliate-tracking-keten**: kliks/conversies ontstaan op perfectsupplement.nl en bij het netwerk. De toestemmingsplicht voor tracking-cookies ligt bij de **site die plaatst/uitleest** — affiliate-cookies zijn niet-functioneel, dus **consent vóór plaatsing** op de publisher-site (bestaande verplichting van perfectsupplement.nl, geen nieuwe van PartnerDesk).
- **Wat PartnerDesk wél raakt**: door conversiedata te importeren word je verwerkingsverantwoordelijke voor die (pseudonieme) gegevens. Vergewisplicht: leg per netwerk vast dat hun tracking consent-gebaseerd is (staat in Daisycon-publishervoorwaarden) — één notitie per netwerk-aansluiting in het dossier volstaat als verantwoording. ⚖️ *Rolverdeling publisher/netwerk (zelfstandig vs. gezamenlijk verantwoordelijk) is in de branche niet uitgekristalliseerd; volg de voorwaarden van het netwerk en documenteer je aanname.*
- **Zonder toestemming mag**: strikt functionele cookies; server-side conversieregistratie zónder apparaat-toegang; geaggregeerde/contextuele metingen. **Alternatieven**: first-party/server-side tracking bij netwerken die het bieden, consent-afhankelijk laden van trackingpixels (al praktijk), aggregatie na 13 mnd (stap 12).

---

## Stap 11 — API-koppelingen

| Onderwerp | Eis/advies |
|---|---|
| API-keys | AES-256-GCM at rest (plan ✓); nooit in zoekindex/exports/logs (plan ✓); least-privilege scope bij het netwerk (alleen rapportage-lezen). |
| OAuth | Verkies OAuth boven statische keys waar het netwerk het biedt; refresh-tokens ook versleuteld; token-expiry afhandelen zonder key in foutmelding. |
| Rotatie | Jaarlijks + direct bij incident of vertrek van iemand met toegang; herversleutel-script voor master-key-rotatie (stap 6). |
| IP-whitelisting | Aanzetten waar het netwerk het aanbiedt (vast VPS-IP — gratis winst). |
| Rate limiting | Respecteer netwerk-limits (backoff in plan EC-95 ✓); eigen tick-route rate-limited. |
| Webhook-validatie | Signature + timestamp (stap 6); geen webhook zonder verificatie in productie. |
| Auditlogging | `api_logs` 90 dgn (✓): endpoint, status, duur — zonder payload-inhoud. |
| Contractueel | Per netwerk: API-voorwaarden bevatten vaak beperkingen op opslag/duur van data — check bij aansluiting en noteer in het dossier (stap 1, contractrecht). |

---

## Stap 12 — Bewaartermijnen

| Datatype | Wettelijk | Praktisch | Advies |
|---|---|---|---|
| Partner (dossier-kern) | — | duur relatie | Einde relatie + 2 jr, daarna scrub PG-delen; fiscale stukken apart 7 jr |
| Contactpersoon | — | duur relatie | Einde relatie + 1 jr; jaarlijkse schoningstaak |
| Contract (PDF + velden) | **7 jr na einde (AWR art. 52)** | idem | Automatische review-taak op einde + 7 jr |
| Commissieregels/afrekeningen | 7 jr (onderdeel administratie) | idem | Bewaren; archived rules niet wissen binnen termijn |
| Feed(config + runs) | — | operationeel | Runs 12 mnd, config duur gebruik |
| Rapport/export | 7 jr indien financiële verantwoording | korter | Exports niet laten slingeren; bron-DB is het archief |
| Klik | — | analyse-horizon | **13 mnd**, daarna verwijderen of aggregeren |
| Conversie | **7 jr** (omzetverantwoording) | idem | Na 13 mnd orderref pseudonimiseren (hash), bedragen behouden ⚖️ |
| Document overig | — | duur nut | Einde relatie; materiaal direct bij einde (licentie) |
| Notitie/tijdlijn | — | dossierwaarde | Relatie + 2 jr; scrub-functie voor verzoeken |
| Serverlog | — | debugging | 30 dgn |
| Auditlog (timeline) | — | verantwoording | = notitie-regime; systeemevents zonder PG mogen blijven |
| API-log | — | debugging | 90 dgn (plan ✓) |
| Back-up | — | herstel | 30 dgn rotatie; wissing werkt door na rotatie (beleid vastleggen) |
| Gelogde mail | — | dossierwaarde | Body 2 jr → samenvatting; ruwe webhook-payload ≤ 30 dgn |
| Taak | — | werkvoorraad | 12 mnd na afronding hard delete (plan A9 ✓) |

Implementatie-eis: **retentie is code** — nachtelijke `retention-job` in de tick (F1-bouwtaak erbij), geen handmatig beleid dat niemand uitvoert.

---

## Stap 13 — Rechten van betrokkenen

Betrokkenen: contactpersonen (direct), eenmanszaak-eigenaren, consumenten (pseudoniem — verzoeken lopen praktisch via het netwerk; jij kunt op click-ID matchen als het netwerk het verzoek doorzet).

| Recht | Technische inrichting |
|---|---|
| Inzage (art. 15) | **Contact-export-functie**: alle velden + events + gelogde mails van één contact als JSON/PDF — bouwtaak F1 (klein: query per contact_id). |
| Rectificatie (16) | Bestaat al: inline edit. |
| Wissing (17) | **PII-scrub-service (D1)** — de belangrijkste ontbrekende bouwsteen: pseudonimiseert contact-velden, event-snapshots, vrije tekst-referenties (handmatige review-stap voor tekst), embeddings, recent_visits; documenten met PII van betrokkene: verwijderen of zwartlakken; scrub-event in tijdlijn (zonder oude waarden). |
| Export/portabiliteit (20) | Zelfde export-functie volstaat (grondslag is f/c, portabiliteit strikt niet verplicht ⚖️ — toch leveren, kost niets). |
| Beperking (18) | `processing_restricted`-vlag op contact: uitgesloten van mailknop, AI en exports tot beoordeling klaar. |
| Bezwaar (21) | Beoordeling (belangenafweging vastleggen als notitie) → scrub of gemotiveerde afwijzing. |
| Logging van verzoeken | Klein register (settings/notitie-conventie): datum verzoek, actie, afgerond — termijn: reactie ≤ 1 maand. |

---

## Stap 14 — Compliance-checklist

**V** = wettelijk verplicht · **A** = sterke aanbeveling · **O** = optioneel.

| ☐ | Item | Status/actie |
|---|---|---|
| ☐ V | Privacyverklaring (art. 13/14 — óók richting partner-contactpersonen) | Tekst op site + verwijzing in mailhandtekening; benoem: dossier, mail-logging, bewaartermijnen, rechten |
| ☐ V | Verwerkingsregister (art. 30) | Stap 3 + 12 van dit document bijhouden als levend register |
| ☐ V | Verwerkersovereenkomsten | Supabase (EU-regio kiezen), Anthropic (F4), Resend (F3), Hetzner (hosting); doorgifte-check (DPF/SCC) per VS-partij |
| ☐ V | Datalekprocedure (art. 33/34) | Runbook: detectie → vastlegging → 72 u-afweging AP-melding → betrokkenen-afweging; intern register óók voor niet-gemelde lekken |
| ☐ V | Bewaarbeleid + uitvoering | Stap 12 + retention-job (code!) |
| ☐ A | Back-upbeleid | 30 dgn rotatie, EU, kwartaal-restore-test |
| ☐ A | Loggingbeleid | Stap 7 |
| ☐ A | Incidentprocedure (breder dan datalek) | Zelfde runbook, sectie security-incident (key-rotatie, sessie-invalidatie) |
| ☐ A | AI-gebruiksbeleid (art. 4 AI Act) | 1 pagina: toegestane use-cases, verboden input, bevestigingsplicht |
| ☐ A | Securitybaseline | Stap 6 als checklist in repo (`SECURITY.md`) |
| ☐ A | Autorisatiemodel | Nu: 1 account + MFA + documented recovery; herzien bij 2e gebruiker |
| ☐ A | Encryptie-inventaris | Wat, waar, welke key, rotatieprocedure |
| ☐ A | Secrets-management | Env-conventies + rotatieschema |
| ☐ A | PII-scrub-functie + contact-export | D1 + stap 13 — bouwtaken |
| ☐ O | Pentest | Bij dit profiel: geautomatiseerde scan (OWASP ZAP) + dependency-audit volstaat; volledige pentest pas bij multi-user |
| ☐ A | DPIA-light actueel houden | Dit document; herzien per fase-oplevering |
| ☐ n.v.t. | Cookiebeleid backoffice | Niet nodig (alleen functionele cookie); publisher-site heeft eigen beleid |

---

## Stap 15 — Risicomatrix (kans × impact, 1–5)

| # | Risico | K | I | Score | Oplossing | Restrisico |
|---|---|---|---|---|---|---|
| R1 | Mail-logging slaat PII van derden breed op (D2) | 4 | 3 | **12 hoog** | Metadata + samenvatting standaard; body opt-in; payload ≤ 30 dgn | Laag (3) |
| R2 | Wissingsverzoek technisch onuitvoerbaar (D1: append-only + archiveren) | 3 | 4 | **12 hoog** | PII-scrub-service in F1; back-up-doorwerking in beleid | Laag (4) |
| R3 | Compromittering admin-account (geen MFA, alles achter 1 login) | 2 | 5 | **10 hoog** | MFA verplicht, sessie-limiet, login-alerts, fail2ban | Laag (5) |
| R4 | VS-doorgifte zonder geldige grondslag (Anthropic/Resend) | 3 | 3 | **9 middel** | DPA's + DPF/SCC-check vóór activatie van die features | Laag (3) |
| R5 | Raw payloads persisteren consumentendata (D3) | 4 | 2 | **8 middel** | Allowlist-import + strip-job 90 dgn | Laag (2) |
| R6 | Back-up nooit restore-getest → dataverlies bij incident | 3 | 4 | **12 hoog** | Kwartaal-restore-test, geagendeerd als taak in het systeem zelf | Laag (4) |
| R7 | SVG/HTML-upload → stored XSS in eigen backoffice | 2 | 3 | **6 middel** | Sanitize/apart domein + CSP (stap 6) | Zeer laag (2) |
| R8 | Fiscale stukken te vroeg gewist door schoningsijver | 2 | 4 | **8 middel** | Retentie-job kent AWR-categorieën; delete geblokkeerd binnen termijn | Laag (2) |
| R9 | Art. 14-informatieplicht niet nageleefd richting contactpersonen | 4 | 2 | **8 middel** | Privacyverklaring + mailfooter-verwijzing | Laag (2) |
| R10 | Netwerk-voorwaarden verbieden lokale dataopslag zoals ontworpen | 2 | 3 | **6 middel** | Voorwaarden-check per netwerk vóór API-activatie (F3-taak) | Laag ⚖️ |
| R11 | Vrije-tekstvelden verzamelen sluipenderwijs gevoelige info | 3 | 2 | **6 middel** | UI-hint, scrub-bereik, jaarlijkse dossier-review (bestaat als F4-feature) | Middel (4) — menselijk gedrag |
| R12 | VPS-compromittering (SSH, ongepatcht) | 2 | 5 | **10 hoog** | Hardening stap 6; updates automatisch; alerts | Laag (4) |

---

## Stap 16 — Compliance-roadmap (gekoppeld aan bouwfases)

**Vóór/tijdens Fase 1 (MVP, verplicht vóór eerste echte data):**
- MFA + auth-hardening (R3) · Supabase EU-regio + DPA (R4-deel) · PII-scrub-service en contact-export als bouwtaken (D1, R2) · retention-job-skelet (stap 12) · privacyverklaring + art. 14-tekst (R9) · verwerkingsregister vastleggen (= dit doc bijhouden) · datalek-runbook (1 pagina) · securitybaseline stap 6 in F1-taken (upload-validatie, headers, CSP, tick-secret) · beslissing mail-logging-ontwerp (D2) nú, ook al bouwt het pas in F3.

**Vóór Fase 2 (feeds/producten):** netwerk-voorwaarden-check feeddata (R10) · upload-hardening af (SVG, R7) · restore-test #1 (R6).

**Vóór Fase 3 (kliks/conversies/mail):** allowlist-import + strip-job (D3, R5) · klik-retentie 13 mnd in retention-job · Resend-DPA + webhook-signature (R4) · mail-logging geminimaliseerd live (R1) · vergewis-notitie consent-keten per netwerk (stap 10).

**Vóór Fase 4 (AI):** Anthropic-DPA + zero-retention vastgelegd · AI-gebruiksbeleid (art. 4) · embeddings in scrub-bereik · prompt-log-retentie 30 dgn.

**Later/doorlopend:** kwartaal-restore-tests · jaarlijkse schoningstaak + register-review · OWASP ZAP-scan jaarlijks · key-rotatie jaarlijks.

---

## Stap 17 — Toekomstbestendigheid

| Groeiscenario | Nu al regelen (goedkoop) | Pas dán regelen |
|---|---|---|
| Meerdere medewerkers | `actor` bestaat al — maak er `actor_user_id` van (nullable, nu altijd jij): auditing per persoon is later niet te reconstrueren | Rollenmodel, autorisatiematrix, offboarding-procedure, echte pentest |
| Meerdere BV's | Bepaal per verwerking wie verantwoordelijke is; houd contracten/financiële data per entiteit scheidbaar (veld `legal_entity` op contract kost niets) | Intragroep-verwerkersafspraken |
| Meerdere merken | Geen actie (zelfde verantwoordelijke) | — |
| Multi-tenant/SaaS | **Niet voorbereiden** (YAGNI — plan A1 terecht); wél: alle PII in aanwijsbare kolommen houden, niet in vrije jsonb — dat maakt élke latere migratie of scrub doenlijk | Verwerkersrol! DPA's met klanten, RLS per tenant, NIS2-herbeoordeling, SOC2/ISO-traject |
| AI-first | Suggestie-≠-mutatie-principe en `actor='ai'` als onwrikbare regels vastleggen (staan al in plan §20) | AI-Act-herclassificatie per nieuwe feature (kantelpunt: AI beoordeelt personen) |
| Internationale partners | Contactdata VK/VS-partners: AVG geldt gewoon (jij bent NL-verantwoordelijke); doorgifte speelt alleen bij nieuwe verwerkers | Lokale e-privacy-regels alleen relevant als je daar tracking plaatst |

Rode draad: de twee keuzes die migraties later eenvoudig houden zijn **(1) PII alleen in benoemde kolommen** en **(2) alle mutaties door de service-laag** — beide al in het ontwerp; bewaken bij elke feature.

---

## Production Readiness Compliance Score

**Huidig ontwerp (vóór aanpassingen): 55/100.**
Sterk: dataminimalisatie-instinct (geen wachtwoorden, credentials versleuteld, geen PII in zoekindex), audit-trail by design, human-in-the-loop AI, EU-hosting mogelijk. Zwak: wissing onmogelijk gemaakt door eigen architectuurprincipe, mail-logging te gulzig, raw payloads onbegrensd, geen MFA/DPA's/retentie-uitvoering benoemd.

**Top-5 te lossen vóór ingebruikname (samen ≈ 30 punten):**
1. **PII-scrub + contact-export bouwen (D1/R2)** — het wissings- en inzagerecht moet uitvoerbaar zijn.
2. **MFA + auth-hardening (R3)** — grootste technische enkelvoudige risico.
3. **DPA's + EU-regio + doorgifte-check (R4)** — vóór er ook maar één contactpersoon in staat.
4. **Mail-logging minimaliseren (D2/R1)** — ontwerpbeslissing nu nemen.
5. **Retentie als code + allowlist-import (R5/R8)** — beleid dat niet draait bestaat niet.

**Score na uitvoering roadmap-F1-maatregelen: ≈ 88/100.** Restpunten (vrije-tekst-discipline, restore-test-ritme, jaarlijkse reviews) zijn beheersmaatregelen, geen blockers. Eindoordeel als auditor: **voorwaardelijk goedkeurbaar** — de vijf blockers zijn allemaal vóór of tijdens Fase 1 in te bouwen en geen van alle duur.
