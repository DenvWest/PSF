# Advies — Beveiliging, auth & hosting (augustus 2026)

> **Layer 3 — Plan.** Strategisch security-/privacy-advies voor PerfectSupplement: MFA-plicht per loginlaag, OAuth vs OTP vs passkeys, cybercrime-weerbaarheid, en wanneer infra-spend zinvol is.
> Basis: verificatie in de repo op 8 augustus 2026 (zie §I voor wat wél en niet is geverifieerd).
> ⚖️ Geen juridisch advies. Onzekere punten zijn expliciet gemarkeerd.

---

## A. Executive summary

1. **MFA is nergens wettelijk verplicht voor PerfectSupplement** — niet vandaag, niet binnen 24 maanden. Niet via AVG art. 32, niet via NIS2, niet via eIDAS 2, niet via PSD2, niet via zorgwetgeving. Wie iets anders beweert, verkoopt FUD.
2. **Maar admin-MFA is wel je grootste enkelvoudige technische risico**, precies zoals je eigen affiliate-audit (R3) al zei. Eén wachtwoord staat tussen het open internet en de service-role-sleutel naar álle art. 9-data.
3. ⚠️ **Bevestigd en gefixt (9 aug 2026):** `getClientIp()` vertrouwde de `cf-connecting-ip`-header blind. Bij verificatie bleek `perfectsupplement.nl` in DNS **rechtstreeks** naar het origin-IP te wijzen (DNS-only, niet via Cloudflare geproxied) — dit was dus geen conditioneel risico ("als de origin bereikbaar is") maar een **altijd actief exploitpad**: elke bezoeker verbindt al rechtstreeks. Een poging om dit met een firewall-restrictie tot Cloudflare-IP's te verhelpen veroorzaakte kort productie-downtime (het echte verkeer loopt immers ook niet via Cloudflare) — direct teruggedraaid. Uiteindelijke fix: `src/lib/client-ip.ts` vertrouwt nu uitsluitend `x-real-ip` (door Nginx gezet via `proxy_set_header` op basis van `$remote_addr`, niet client-instelbaar), niet meer `cf-connecting-ip`/`x-forwarded-for`. Klaar voor deploy, nog niet live.
4. **Consumenten-OTP is goed gebouwd** (non-enumerating, per-IP én per-e-mail limiet, 15 min TTL, eenmalig, generieke fouten, honeypot). Daar MFA bovenop zetten levert vrijwel niets: beide factoren vallen samen op "wie de mailbox heeft".
5. **"Inloggen met Google" is géén MFA** — het is identiteitsdelegatie. Voor art. 9-data is het bovendien privacy-technisch een verslechtering (Google leert bij elke login dát deze persoon een gezondheids-leefstijldienst gebruikt). **Advies: OTP behouden, OAuth niet doen, passkeys pas overwegen bij premium-live.**
6. **Op admin-niveau is het antwoord omgekeerd:** een IdP-poort vóór `/admin` (Cloudflare Access, gratis tot 50 gebruikers) is de goedkoopste echte MFA die je kunt krijgen — twee onafhankelijke barrières, ±1–2 uur werk, nul app-code.
7. **Wat het dichtst bij een échte wettelijke plicht komt, is niet MFA maar back-up-testen.** AVG art. 32 lid 1 sub d eist een procedure om maatregelen "op gezette tijdstippen te testen". Je eigen compliance-audit belooft een kwartaal-restoretest; nergens in de repo staat bewijs dat die ooit gedraaid heeft.
8. **Herkader de hosting-vraag: verhuizen lost niets op.** De art. 9-data staat in Supabase (Frankfurt). Op de VPS staan de *sleutels*, niet de kroonjuwelen. Geld dat risico verlaagt gaat naar Supabase Pro (netwerkrestrictie + PITR), niet naar een grotere Hetzner-machine.
9. **Ops is je zwakste laag** (2,5/5): de app draait als root, de productie-build draait op de productiemachine (`npm ci` als root = supply-chain-pad), en `ARCHITECTURE.md` beschrijft nog PM2 terwijl prod op systemd draait — documentatiedrift die je juist tijdens een incident raakt.
10. **Eén interne inconsistentie om te repareren:** de DPIA voert "art. 9 **op grote schaal**" op als DPIA-grond (§0) en gebruikt vervolgens "beperkte verwerking" als argument tegen een FG (§6). Dat zijn bijna dezelfde woorden uit art. 35(3) en art. 37(1)(c). Herformuleer de DPIA-grond, of onderbouw de FG-conclusie apart.

---

## B. MFA & wetgeving — per loginlaag

### B.1 Toets per regime

| Regime | Van toepassing? | Wat het écht zegt | Gevolg voor PSF |
|---|---|---|---|
| **AVG art. 32** | Ja | "Passende technische en organisatorische maatregelen", risicogebaseerd. Noemt pseudonimisering, versleuteling, beschikbaarheid en **testen** — noemt MFA nergens | **Geen MFA-plicht.** Wél: bij een datalek beoordeelt de AP achteraf of je maatregelen passend waren. Een admin-account zonder tweede factor dat toegang geeft tot art. 9-data is dan een moeilijk verdedigbare keuze. Je verliest je art. 32-verweer, niet een expliciete regel |
| **NIS2 / Cyberbeveiligingswet (NL)** | Nee | Sectorbijlagen I/II + omvangdrempel (≥50 medewerkers of >€10 mln omzet). "Gezondheidszorg" = zorgaanbieders, medische-hulpmiddelenfabrikanten, farma — geen leefstijlwebsites | **Buiten scope op twee gronden tegelijk** (sector én omvang). ⚖️ De exacte inwerkingtreding van de NL-implementatie schuift al langer; verifieer de datum als er ooit een B2B-deal komt. Beide gronden moeten wegvallen voordat dit je raakt |
| **eIDAS 2 / EUDI-wallet** | Nee | Verordening (EU) 2024/1183. Acceptatieplicht geldt voor zeer grote platforms (VLOP's) en gereguleerde sectoren waar sterke authenticatie al verplicht is | **Geen verplichting om de wallet te accepteren.** Legt ook geen MFA op. Hoogstens ooit een extra optionele loginmethode |
| **PSD2 / SCA** | Nee | Geldt voor betaaldienstverleners en betalingstransacties, niet voor productlogins | **Niet van toepassing op je login.** Bij premium via Mollie/Stripe is SCA de plicht van de PSP, afgehandeld in hun checkout. Blijf met gehoste checkout bovendien buiten PCI-DSS-scope |
| **Zorgsector (Wkkgz, Wabvpz, NEN 7510/7512)** | Nee | Hangen aan de status "zorgaanbieder" (zorg in de zin van Wkkgz / handelingen individuele gezondheidszorg) | **Niet van toepassing** — je beoogd doel is vastgelegd als algemeen welzijn/leefstijl-educatie (`COMPLIANCE.md`), geen diagnose/monitoring/behandeling. Dit is precies waarom risico **R4 (functie-creep)** in je DPIA het duurste risico is: copy die richting diagnose of monitoring schuift, kan je onder MDR trekken, en dán verandert het hele regime in één klap |
| **AI Act** | Marginaal | Al beoordeeld in de affiliate-audit als "licht" | Geen actie |

**Kernzin:** er komt binnen 24 maanden geen wet die je MFA oplegt. De reden om admin-MFA te doen is puur risico — en dat risico is echt.

### B.2 Verdict per laag

| Laag | Verplicht? | Aanbevolen? | Waarom | Wanneer (trigger) |
|---|---|---|---|---|
| **Consument — e-mail-OTP** | Nee | **Nice-to-have, en nog niet nu** | Tweede factor bovenop e-mail-OTP is grotendeels schijnzekerheid: beide reduceren tot mailboxbezit. Winst zit elders: `session_version`, kortere cookie, en de IP-spoof-lek dichten | Passkeys **optioneel** aanbieden zodra premium live is én er betalende accounts zijn. Nooit als enige methode |
| **Admin `/admin`** | Nee | **Sterk aanbevolen — feitelijk P0** | Eén wachtwoord beschermt PartnerDesk, af_-grootboek, site-admin én indirect de service-role-sleutel. `admin_auth` kent alleen een IP-limiet, geen accountlockout — met een spoofbare IP-header is dat geen limiet | **Nu.** Niet wachten op een trigger. Goedkoopste route: Cloudflare Access vóór `/admin`, wachtwoord blijft erachter staan |
| **Cron / partner API** | Nee | **Sterk aanbevolen (andere maatregel)** | MFA bestaat niet voor machines. `verifyCronRequest` doet het goed (bearer met constant-time compare, HMAC+timestamp-variant, optionele IP-allowlist) — maar `CRON_ALLOWED_IPS` is opt-in en staat leeg = alles toegestaan | Zet de allowlist aan (cron-job.org publiceert vaste IP's) en leg rotatie vast zodra er een tweede partner-key bijkomt |

---

## C. Google/OAuth vs OTP vs passkeys

### Aanbeveling: **OTP behouden. Passkeys optioneel later. OAuth niet doen.**

**Vergelijking**

| | E-mail-OTP (nu) | Google/Apple OAuth | TOTP-app | Passkeys/WebAuthn |
|---|---|---|---|---|
| Wat het is | Bezitsfactor (mailbox) | Identiteitsdelegatie aan IdP | Tweede factor | Phishing-resistente eerste factor |
| Account takeover via mailcompromis | Kwetsbaar | Kwetsbaar (zelfde mailbox, ander pad) | Beschermt | Beschermt |
| Phishing van de code | Mogelijk (15 min-venster) | Beter (geen code in transit) | Mogelijk | Onmogelijk (origin-gebonden) |
| SIM-swap | N.v.t. — je gebruikt nergens SMS. **Zo houden** | N.v.t. | N.v.t. | N.v.t. |
| Sessiekaping | Identiek — het is jouw cookie in alle vier de gevallen | Identiek | Identiek | Identiek |
| UX mannen 40+ | Sterk: e-mail is al in de funnel, één veld, geen wachtwoord | Snel, maar "welk account gebruikte ik ook alweer?" | Slechtste: bijna niemand enrolt vrijwillig | Onwennig; heeft altijd een fallback nodig (= OTP) |
| AVG-impact | Nihil | **Negatief** | Nihil | Nihil |
| Bouwlast | Bestaat al | M | M | L |

**Waarom OAuth afvalt — de privacy-reden is doorslaggevend.** Bij "inloggen met Google" leert Google bij élke login dát deze persoon een gezondheids-leefstijldienst gebruikt. Dat feit is zelf een gezondheidsindicatie. Je voegt daarmee een nieuwe ontvanger, een nieuwe doorgifte-vraag en een nieuwe grondslag-/rolvraag toe (Google handelt bij het Google-account als zelfstandige verwerkingsverantwoordelijke, niet als jouw verwerker) — voor **nul** beveiligingswinst ten opzichte van e-mail-OTP naar datzelfde Gmail-adres. DPIA §1.4 en de privacyverklaring zouden allebei open moeten. Niet doen.

**Waarom TOTP voor consumenten afvalt.** Enrolment-percentages voor vrijwillige TOTP op consumentendiensten zijn laag; je doelgroep is 40+ en mobiel-first. Je zou de support-last van "authenticator kwijt" invoeren voor een dienst die geen geld of medisch dossier bevat. Verkeerde verhouding.

**Waarom passkeys wél op de rol staan — maar later.** Passkeys zijn technisch het beste antwoord (origin-gebonden, dus phishing-bestendig, en er is geen code die onderweg kan lekken). Maar ze hebben altijd een herstelpad nodig, en dat pad is bij jou onvermijdelijk e-mail-OTP — dus zolang OTP bestaat, is de ondergrens gelijk. Bouw ze als versneller voor terugkerende gebruikers, niet als beveiligingsmaatregel. **Trigger: premium live én betalende accounts.**

**De uitzondering: op admin-niveau is Google-als-IdP juist uitstekend.** Daar delegeer je niet aan de mailbox van een onbekende gebruiker maar aan jouw eigen Google-account, waar jij MFA hard kunt afdwingen. Cloudflare Access vóór `/admin` (gratis tot 50 gebruikers) geeft je IdP-login + MFA + auditlog, met je bestaande wachtwoord als tweede barrière erachter. Dit is de hoogste beveiligingswinst per bestede euro in dit hele document.

---

## D. Cybercrime-weerbaarheid

Realistisch dreigingsmodel: **geen gerichte APT.** Wat je werkelijk raakt is (1) geautomatiseerde credential-/brute-force-bots op `/admin`, (2) massascans op bekende CVE's van ongepatchte VPS'en, (3) een kwaadaardig npm-pakket dat via `npm ci` als root op je productiemachine landt, (4) een gestolen `.env` bij VPS-compromittering. Van die vier is er precies één die je nachtrust verdient: de vierde, omdat die de service-role-sleutel bevat.

### D.1 Edge — **3/5**

Cloudflare staat ervoor (Turnstile + CDN, bevestigd in DPIA/register), HSTS met preload staat aan, Turnstile beschermt `/api/contact` en `/api/intake/session`.

| Top-gaps | |
|---|---|
| 1 | ~~**Origin-bypass + header-spoofing.**~~ Gefixt 9 aug 2026 — zie A.3. `src/lib/client-ip.ts` vertrouwt nu alleen `x-real-ip` (Nginx-gegarandeerd), niet meer de spoofbare `cf-connecting-ip`/`x-forwarded-for`. Klaar om te deployen |
| 2 | Geen edge-rate-limit op auth-endpoints — alle throttling gebeurt pas in de app |
| 3 | `/admin` is bereikbaar vanaf het hele internet |

**Quick wins (2–4 uur):** firewall alleen open voor Cloudflare-ranges + Nginx `set_real_ip_from`/`real_ip_header CF-Connecting-IP` zodat client-headers worden overschreven · Cloudflare Access op `/admin` · WAF-rate-limitregel op `/api/account/*` en `/api/admin/auth`.

### D.2 App — **3,5/5**

Sterk en zichtbaar doordacht: strikte headers (`frame-ancestors 'none'`, nosniff, Referrer-Policy, COOP), HMAC-cookies mét issued-at en expiry, `timingSafeEqual` overal, non-enumerating login (altijd 200), generieke foutmeldingen, honeypotveld, dubbele rate-limit (IP + gehasht e-mailadres), Sentry met `sendDefaultPii: false` en eigen scrubber, Clarity geblokkeerd op `/intake` en `/dashboard`.

| Top-gaps | |
|---|---|
| 1 | **Geen admin-MFA en geen accountlockout.** `admin_auth` heeft alleen een IP-limiet. Met gap D.1-1 erbij is wachtwoord-brute-force onbegrensd |
| 2 | **CSP met `unsafe-inline` én `unsafe-eval`** in `script-src` (`src/proxy.ts:75`). `unsafe-eval` heb je in productie vrijwel zeker niet nodig — dat is de goedkope helft van de winst |
| 3 | **Geen `session_version`** (backlog #2) + 90 dagen cookielevensduur. Je kunt een gekaapte sessie vandaag niet intrekken — alleen het account revoken |
| 4 | Mislukte admin-logins worden niet gelogd en nergens gealarmeerd: je zou een aanval pas merken als hij slaagt |

**Kleiner, ter volledigheid:** `request-link` invalideert eerdere ongebruikte tokens niet, dus er kunnen tot 5 codes tegelijk geldig zijn. Met 6 verifieerpogingen per 15 min per e-mailadres blijft de raadkans verwaarloosbaar (~3 × 10⁻⁵ per venster) — netter, geen prioriteit.

**Quick wins (uren):** auth-failures loggen + alert · `unsafe-eval` uit de productie-CSP · `npm audit fix` (3 high: `undici` response-desync, `js-yaml`, `brace-expansion` — alle drie transitief).
**Medium (weken):** nonce-gebaseerde CSP zonder `unsafe-inline` · `session_version` + cookie naar 30 dagen met sliding refresh.

### D.3 Data — **3/5**

Sterk: EU-regio (Frankfurt), RLS aan, `pd_*`/`af_*` deny-all, geautomatiseerde retentie, werkende revoke-/anonimiseerroute, geen secrets in `NEXT_PUBLIC_*` (geverifieerd).

| Top-gaps | |
|---|---|
| 1 | **Blast radius van de service-role-sleutel.** 91 bestanden gebruiken `createSupabaseAdmin()`; de sleutel staat plat in `/root/perfectsupplement/.env`. VPS-compromittering = volledige lees/schrijf op alle art. 9-data = meldplichtig datalek van de zwaarste categorie |
| 2 | **Back-upniveau onbekend en nooit restore-getest.** Je eigen compliance-audit eist een kwartaaltest; er is geen spoor van uitvoering. Dit is het punt dat het dichtst bij een harde AVG-plicht ligt (art. 32 lid 1 sub d) |
| 3 | Geen sleutelrotatie-runbook — bij een vermoeden van lek is "hoe draai ik dit terug" niet opgeschreven |

**Quick wins:** één restore-test draaien en de uitkomst vastleggen (halve dag, en het is meteen je art. 32-bewijs) · sleutel roteren + runbook van één pagina · Supabase-plan en back-upretentie verifiëren.
**Medium:** Supabase network restrictions aanzetten (IP-allowlist op je Hetzner-IP) — dit verandert "gestolen sleutel" in "gestolen sleutel **plus** toegang tot jouw VPS". Verifieer beschikbaarheid op je plan; dit is de sterkste reden voor Pro.

### D.4 Ops — **2,5/5** (zwakste laag)

| Top-gaps | |
|---|---|
| 1 | **App draait als root**, met de service-role-sleutel in het procesgeheugen. Elke RCE is meteen volledige machinecompromittering |
| 2 | **Bouwen op de productiemachine.** `deploy.sh` doet `npm ci && npm run build` als root op prod: een kwaadaardig `postinstall`-script draait dan als root náást je `.env`. Dit is je meest onderschatte supply-chain-pad |
| 3 | **Documentatiedrift:** `ARCHITECTURE.md` §Server beschrijft PM2 (`pm2 restart --update-env`) terwijl prod op systemd draait; `CLAUDE.md` noemt rate limiting "in-memory" terwijl `rate-limit-redis.ts` allang bestaat. Verouderde runbooks kosten je tijd precies op het moment dat tijd telt |
| 4 | Geen bewijs in de repo van fail2ban, `dnf-automatic`, SSH-keys-only of uptime-monitoring |

**Quick wins (samen een halve dag):** SSH keys-only + rootlogin met wachtwoord uit + fail2ban · `dnf-automatic` voor security-updates · UptimeRobot of Better Stack (gratis) · Hetzner-snapshots inschakelen (±20% van de serverprijs) · de twee docs bijwerken.
**Medium:** eigen service-user in plaats van root + systemd-hardening (`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`) · build verplaatsen naar CI en alleen het artefact uitrollen · CI uitbreiden met `npm audit --audit-level=high` + Dependabot (CI draait nu lint/test/build, geen audit).

**Losse verificatie:** bevestig of de Redis-backend in productie daadwerkelijk geconfigureerd is. Zo niet, dan valt rate limiting terug op geheugen — bij één systemd-proces functioneel prima, maar **elke deploy of restart wist de tellers**, en dat verzwakt precies de OTP-brute-force-rem waar je op leunt.

---

## E. Infra-upgradepad

**De herkadering.** Hetzner is al betaald, en de art. 9-data staat er niet op. Op de VPS staan: de app, `/root/perfectsupplement/.env` (met de service-role-sleutel) en Nginx-logs met IP's. Een duurdere of "veiligere" server verandert daar niets aan — de kroonjuwelen zijn de *sleutels*, niet de schijf. Wat risico verlaagt is: beperken wie de sleutel mag gebruiken (Supabase-netwerkrestrictie), beperken wat een inbraak oplevert (niet als root, rotatie, niet bouwen op prod), en de deur zwaarder maken (SSH, fail2ban, updates, Access).

### E.1 Drie losse beslissingen

| Beslissing | Nu doen | Trigger voor de volgende stap | Wat het niet oplost |
|---|---|---|---|
| **1. Hetzner VPS** | Hardening (gratis) + snapshots aan (±€1–2/mnd). 4 GB volstaat ruim op huidige belasting | Upgrade tier pas bij aantoonbare resource-druk — nooit "voor de zekerheid" | Een grotere machine verlaagt geen enkel beveiligingsrisico |
| **2. Supabase** | Verifieer je huidige plan, back-upretentie en of netwerkrestrictie beschikbaar is | Pro (~$25/mnd) bij **premium live**, **eerste betalende klant**, óf **>500 actieve accounts** — welke het eerst komt. Levert PITR, langere logretentie, IP-allowlist, geen auto-pause, SOC 2-rapport voor B2B-gesprekken | Lost geen applicatie-auth-gaten op |
| **3. Managed PaaS vs VPS** | **Blijven op Hetzner** | Alleen heroverwegen als ops-tijd de bottleneck wordt, of als een B2B-klant hosting-attestaties eist | PaaS haalt OS-patching, SSH-oppervlak en root weg — maar **niet**: sleutelblootstelling (env-var is daar ook env-var), auth-ontwerp, CSP, admin-MFA, dependency-risico. Voegt toe: Amerikaanse leverancier in je doorgifte-analyse en herbouw van cron/deploy |

### E.2 Kostenbanden

| Band | Wat je ervoor krijgt | Oordeel |
|---|---|---|
| **€0–50/mnd** | Cloudflare gratis + Access gratis · fail2ban/auto-updates (€0) · Hetzner-snapshots (~€1–2) · Supabase Pro ($25) · uptime-monitor (€0) · wachtwoordmanager (~€3) | **Hier hoor je te zitten.** Dekt ruwweg 90% van je realistische risico |
| **€50–200/mnd** | PITR-add-on · Cloudflare Pro (~€20, managed WAF-regels) · aparte staging-VPS · betaalde logretentie · Sentry betaald | Pas zinvol bij premium-omzet en >2.000 accounts |
| **€200+/mnd** | Externe pentest (€3–6k eenmalig, geamortiseerd) · ISO 27001/NEN 7510-traject (€10k+) · CISO-as-a-service · HA/multi-region | **Niet uitgeven vóórdat een contract erom vraagt.** Trigger: B2B/white-label of coach-inzage — dan verwerk je art. 9-data van de klanten van een derde en word je verwerker |

---

## F. Prioriteiten

**P0 — deze maand**

| # | Actie | Inspanning | Waarom nu |
|---|---|---|---|
| 1 | ~~Origin dichtzetten: firewall op Cloudflare-ranges~~ — **niet mogelijk**: domein is DNS-only, al het echte verkeer loopt zelf ook rechtstreeks (geverifieerd 9 aug, veroorzaakte korte downtime bij poging). Fix verplaatst naar code: `client-ip.ts` vertrouwt alleen nog `x-real-ip`. Nginx-config wél opgeschoond (dubbele server-blokken weg, certbot SSL-hardening nu echt actief) | S | Zonder dit zijn álle IP-rate-limits decoratief, inclusief die op admin-login |
| 2 | Tweede barrière vóór `/admin` (Cloudflare Access, wachtwoord blijft erachter) | S | Ruimt R3 uit je eigen auditrisico-tabel op, zonder app-code |
| 3 | Supabase-plan/back-ups verifiëren + één restoretest draaien en vastleggen | S | Het enige punt met een reële juridische kant (art. 32 lid 1 sub d) |
| 4 | Bevestigen of Redis-rate-limiting in prod actief is; zo niet, de restart-reset documenteren of aanzetten | S | Bepaalt of je OTP-brute-force-rem een deploy overleeft |

**P1 — dit kwartaal**

| # | Actie | Inspanning |
|---|---|---|
| 5 | Niet-root service-user + systemd-hardening; build weg van de productiemachine | M |
| 6 | Service-role-sleutel roteren + rotatie-runbook + Supabase-netwerkrestrictie | M |
| 7 | `session_version` + cookie naar 30 dagen met sliding refresh (backlog #2/#3) | M |
| 8 | Auth-failure-logging + alert (mislukte admin-logins, OTP-pieken) | S |
| 9 | `npm audit fix` + Dependabot + `npm audit --audit-level=high` in CI | S |
| 10 | `unsafe-eval` uit de productie-CSP (GTM/Clarity nameten) | S |
| 11 | DPIA §0/§6 herformuleren (zie A.10) + `ARCHITECTURE.md` PM2→systemd + `CLAUDE.md` rate-limitregel | S |

**P2 — opportunistisch**

| # | Actie | Inspanning |
|---|---|---|
| 12 | Nonce-gebaseerde CSP (`unsafe-inline` eruit) | L |
| 13 | Turnstile op `/api/account/request-link` (tegen mail-bombing) | S |
| 14 | Eerdere OTP-tokens invalideren bij uitgifte van een nieuwe | S |
| 15 | Passkeys als optionele login — **trigger: premium live** | L |

---

## G. Bewust NIET doen (YAGNI)

| Niet doen | Waarom niet |
|---|---|
| MFA/TOTP voor consumenten | Lage enrolment, hoge supportlast, en bovenop e-mail-OTP nauwelijks extra bescherming |
| Google/Apple OAuth | Geen beveiligingswinst tegenover OTP; wél een nieuwe ontvanger, doorgifte en grondslagvraag rond art. 9-data |
| SMS-2FA | SIM-swap, kosten, en je zou telefoonnummers gaan verzamelen — meer PII voor minder veiligheid |
| Migreren naar Supabase Auth alleen om MFA te krijgen | Je zou consumenten-auth herbouwen om een admin-probleem op te lossen. Zet de poort aan de edge |
| ISO 27001 / NEN 7510-certificering | Geen zorgaanbieder. Pas relevant als een B2B-klant het contractueel eist |
| SIEM, HIDS, bug bounty, WAF-appliance | Volstrekt buiten proportie op deze schaal |
| Multi-region/HA-database, externe secret manager (Vault), Redis-cluster | Complexiteit zonder navenant risico |
| Verhuizen naar PaaS | Lost het sleutelprobleem niet op, kost herbouw en voegt een leverancier toe aan je doorgifte-analyse |
| Jaarlijkse pentest bij huidige schaal | Één gerichte review bij premium-launch is proportioneel; daarvóór volstaat een OWASP ASVS L1-zelfcheck (€0) |

---

## H. Disclaimer & externe hulp

Dit is een technisch-strategisch advies, **geen juridisch advies**. De wetstoetsen in §B zijn opgesteld op basis van de tekst en systematiek van de betreffende regimes; de conclusies "niet van toepassing" rusten telkens op twee onafhankelijke gronden (sector én omvang), wat ze robuust maakt — maar een jurist moet ze bevestigen voordat je ze in een klantcontract opneemt.

| Wanneer | Wie | Waarvoor |
|---|---|---|
| **Nu, kort (±1 uur)** | Privacyjurist | De DPIA-inconsistentie uit A.10: "art. 9 op grote schaal" (art. 35(3)(b)) versus "FG niet verplicht" (art. 37(1)(c)) gebruiken bijna dezelfde maatstaf. Laat de DPIA-grond herformuleren of de FG-conclusie apart onderbouwen — dit is precies wat een toezichthouder eruit pikt |
| **Vóór B2B/white-label of coach-inzage** | Advocaat | Je wordt dan **verwerker** van art. 9-data van andermans klanten: DPA-modellen, aansprakelijkheid, subverwerkersketen, NIS2-herbeoordeling via toeleveringsketen |
| **Bij elke copy-wijziging richting diagnose/monitoring** | Advocaat MDR/medische hulpmiddelen | Je hele regime kantelt zodra het beoogd doel medisch wordt. Dit is risico R4 uit je eigen DPIA — en het duurste |
| **Bij premium-launch + >1.000 accounts, of eerste B2B-contract** | Externe pentest (€3–6k) | Gerichte test op auth-flows en admin. Niet eerder — je vindt nu zelf meer voor minder |
| **FG (DPO) aanstellen** | — | Niet verplicht op huidige schaal. Herbeoordelen bij tienduizenden checks per jaar of bij het eerste B2B-contract met werknemersgezondheidsdata |
| **CISO / CISO-as-a-service** | — | Niet aan de orde. Bij één beheerder is een runbook effectiever dan een rol |

---

## I. Verificatiestatus

**Geverifieerd in de repo (8 aug 2026):** `src/proxy.ts` (CSP + headers + admin-gate) · `src/lib/client-ip.ts` · `src/lib/rate-limit*.ts` (Redis- én memory-backend, alle limieten) · `src/lib/admin-auth.ts` + `admin-session-cookie.ts` + `src/app/api/admin/auth/route.ts` · `src/lib/account-session-cookie.ts` + `account-login-token.ts` · `src/app/api/account/request-link|verify-code` · `src/app/account/verify/page.tsx` · `src/lib/cron-auth.ts` + de vier cron-routes · `src/lib/sentry-config.ts` · `src/components/analytics/AnalyticsLoader.tsx` · `.github/workflows/ci.yml` · `deploy.sh` · `npm audit` · DPIA, VERWERKINGSREGISTER, ACCOUNT_DASHBOARD_SYSTEM, ARCHITECTURE, COMPLIANCE_AUDIT_AFFILIATE_PLATFORM, Datalekprocedure.

**Aanvullend geverifieerd 9 aug 2026 (buiten de repo, rechtstreeks op server/DNS):** Nginx-config bevatte dubbele/conflicterende `server`-blokken (opgeschoond) · `perfectsupplement.nl` is **DNS-only**, niet via Cloudflare geproxied — origin is dus altijd rechtstreeks bereikbaar, geen conditioneel risico · Supabase stond op **Free plan**, geen beheerde back-ups (zie `docs/legal/Backup_Restoretest_PerfectSupplement_nl.md`) · firewalld-status gecontroleerd (services: ssh/http/https/mdns/dhcpv6-client, geen source-restrictie).

**Nog niet geverifieerd (staat buiten de repo — controleer zelf):** fail2ban, SSH-config en automatische updates op de VPS · of `REDIS_URL`/Upstash in productie gezet is · Cloudflare-zone-instellingen (WAF, rate limiting, Access, Turnstile-scope gezien DNS-only) · inhoud van `/root/perfectsupplement/.env`.

De vier P0-punten beginnen niet toevallig alle vier met verifiëren: de grootste onzekerheid in dit advies zit in de serverlaag, niet in de code.
