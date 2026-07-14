# Product- & architectuurreview — Eigen affiliate-programma (`af_`)

*Rol: senior SaaS PM + affiliate-expert + UX + software-architect. Gebaseerd op de feitelijke code van 14 jul 2026 (fase 3A), niet op aannames. Alle bevindingen verwijzen naar echte bestanden.*

---

## 0. De belangrijkste correctie vooraf — lees dit eerst

De prompt die dit rapport aanvroeg is een **generiek affiliate-netwerk-sjabloon** (Impact/Awin-stijl): producten toevoegen, deeplinks, feeds, voorraad, couponcodes, "bel een webshop". **Dat model past maar voor de helft op wat je bouwt.** Het verschil begrijpen is 80% van de waarde van deze review.

Er zijn in dit project **drie dingen die "affiliate" heten** (CLAUDE.md waarschuwt hier ook voor):

| # | Naam | Wie | Geldrichting | Status |
|---|---|---|---|---|
| Rol 1 | `affiliate_clicks` | Merchants (Daisycon, Arctic Blue) waar **jij** commissie van krijgt | merchant → jou | **Live** |
| — | `pd_*` (PartnerDesk) | Upstream-partnerdossiers van diezelfde merchants | merchant → jou | Fase 1 klaar |
| Rol 2 | `af_*` (**dit programma**) | Promotors die **jouw** Leefstijlcheck aanraden en die **jij** betaalt | jou → affiliate | **Fase 3A, in aanbouw** |

**Het `af_`-programma is géén productcatalogus-netwerk.** Er is één "product": de Leefstijlcheck-funnel. Een affiliate is een **promotor** (influencer, coach, contentmaker, nieuwsbrief) die verkeer naar `/intake` stuurt. Jij betaalt hem per **lead** (voltooide intake) en per **sale** (premium, later).

**Consequentie voor de prompt-secties:**
- "Producten toevoegen / titel / afbeelding / voorraad / couponcode / deeplink / feed" → **niet van toepassing** op `af_`. Dat hoort bij een merchant-netwerk of bij PartnerDesk (Rol 1). Zie §6.
- "Hoe haal ik een webshop binnen" → dat is **PartnerDesk / Rol 1**, niet dit programma. Zie §11.
- "Partner logt in, maakt links, ziet commissie, krijgt uitbetaling" → **dat is wél `af_`** (portal = fase 5, nog niet gebouwd). Zie §12.

Als je écht een productcatalogus-netwerk wilt (meerdere merchants, feeds, deeplinks per product), dan is dat een **strategische pivot** weg van het huidige app-first-ontwerp — geen bugfix. Ik raad dat niet aan; zie §16.

---

## 1. Hoe het systeem NU werkt (feitelijk, in gewone taal)

### De keten
```
Promotor deelt link  →  /intake?ref=jan
   ↓ (client-side) cookie psf_aff_ref = "jan" gezet op de /intake-pagina
Bezoeker vult intake in
   ↓ POST /api/intake/session
attributeIntakeLead(): leest cookie → zoekt actieve af_affiliate met ref="jan"
   ↓ (fail-open: fout breekt de intake nooit)
af_conversions rij (type='lead', source='tracking', status='pending')
   ↓ meteen accrueForConversion()
af_ledger_entries rij (kind='accrual', bedrag via commissie-engine, state volgt conversie)
   ↓ jij keurt goed in /admin/programma/<ref>
ledger state 'approved'  →  "Uitbetaling voorbereiden"  →  af_payouts (draft)
   ↓ "Markeer betaald"
ledger state 'paid' + af_financial_events outbox-rij (voor latere boekhouding)
```

### Pagina's (alles onder `/admin`, service-role, admin-auth via `proxy.ts`)
- **`/admin/programma`** — lijst van affiliates (naam, ref, status, #regels, #links). [`page.tsx`](src/app/admin/(desk)/programma/page.tsx)
- **`/admin/programma/[ref]`** — dossier met 6 inklapbare secties: Algemeen, Commissieafspraken, Links, Conversies, Grootboek, Uitbetalingen. [`[ref]/page.tsx`](src/app/admin/(desk)/programma/[ref]/page.tsx)
- **`/admin/programma/rapportage`** — tabel per affiliate (leads/sales/conv%/omzet/commissie) over datumbereik + CSV-export. [`rapportage/page.tsx`](src/app/admin/(desk)/programma/rapportage/page.tsx)
- Navigatie: item **"Affiliates"** in de PartnerDesk-sidebar. [`DeskShell.tsx`](src/components/partnerdesk/DeskShell.tsx)

### Database (10 tabellen, [`20260714120000_affiliate_kern_fase3a.sql`](supabase/migrations/20260714120000_affiliate_kern_fase3a.sql))
`af_sources`, `af_affiliates`, `af_commission_rules`, `af_links`, `af_conversions`, `af_ledger_entries`, `af_payouts`, `af_payout_items`, `af_financial_events`, `af_daily_rollups`. Alle **RLS deny-all** — uitsluitend server-side via `createSupabaseAdmin()`.

### API's / server-acties
- **Automatisch:** alleen `attributeIntakeLead()` in [`api/intake/session/route.ts:386`](src/app/api/intake/session/route.ts#L386) — de enige automatische ingang.
- **Handmatig (server actions):** affiliates CRUD, commissieregels, links, conversies (handmatig + CSV), goed-/afkeuren, herbereken, payout voorbereiden/betaald. In [`actions.ts`](src/lib/affiliate/actions.ts), [`conversion-actions.ts`](src/lib/affiliate/conversion-actions.ts), [`payout-actions.ts`](src/lib/affiliate/payout-actions.ts).

### Commissie (puur, engine-hergebruik) — [`af-commission.ts`](src/lib/affiliate/af-commission.ts)
Per conversie: filter regels die het type (lead/sale) dekken én geldig zijn op de datum → winnaar (promo > standaard → recentste `valid_from` → recentste `created_at`) → bedrag (% van omzet of vast). De winnende regel wordt **bevroren als `rule_snapshot`** in de grootboekregel: latere regelwijzigingen raken geboekt geld nooit.

### Grootboek (append-only, centen) — [`af-ledger.ts`](src/lib/affiliate/af-ledger.ts)
Nooit muteren: afkeuren = **tegenboeking** (`reversal`, negatief bedrag). Accrual is idempotent (max 1 per conversie). `recomputeAffiliateAccruals()` vult alleen **ontbrekende** accruals aan (bijv. nadat je alsnog een passende regel toevoegt).

---

## 2. Wat af is, wat incompleet is (per bouwsteen)

| Bouwsteen | Status | Opmerking |
|---|---|---|
| `af_`-schema (10 tabellen) | ✅ Af | Solide, append-only, centen. |
| Affiliate-beheer (CRUD, status, notities) | ✅ Af | Naam+e-mail volstaat; ref auto-gegenereerd. |
| Commissieregels + engine + snapshot | ✅ Af | Percentage/vast, promo/standaard, geldigheid. |
| Links genereren + kopiëren | ✅ Af | Puur `?ref=` aan doel-URL plakken. |
| Conversies: handmatig + CSV + goed/afkeuren | ✅ Af | Idempotent op `external_id`. |
| Grootboek + herbereken | ✅ Af | Getest ([`affiliate-recompute.test.ts`](src/lib/__tests__/affiliate-recompute.test.ts)). |
| Uitbetaling voorbereiden → betaald → outbox | ✅ Af | Handmatig, mono-tenant. |
| Rapportage + CSV-export | ✅ Af | Live berekend (geen rollups nog). |
| **Lead-attributie (intake)** | ⚠️ **Deels** | Werkt, maar cookie wordt maar op 2 pagina's gezet → **attributielek** (§4.3). |
| **Sale-attributie (premium)** | ❌ **Ontbreekt** | Premium is wachtlijst; geen betaalprovider. Sales alleen handmatig/CSV (§4.2). |
| **Click-tracking** | ❌ **Ontbreekt** | Geen `af_clicks`-tabel, geen redirect-endpoint. `af_daily_rollups.clicks` wordt nooit gevuld (§4.1). |
| Afwijkingssignaal (expected vs. gemeten) | ❌ Ontbreekt | `expected_cents` wordt opgeslagen maar nergens vergeleken. |
| Rollups / retentie-jobs | ❌ Fase 3B | Bewust uitgesteld. |
| Affiliate-portal (login) | ❌ Fase 5 | Naad (`account_id` nullable) staat klaar. |
| n8n / Daisycon / PSP / boekhoud-push | ❌ Uitgesteld | Bewust; naden ontworpen. |

**Verdict:** de **administratieve kern is verrassend compleet en netjes** (append-only geld, idempotentie, engine-hergebruik, bevroren snapshots). Het gat zit niet in de boekhouding maar in de **datatoevoer aan de voorkant**: er komt te weinig automatisch binnen. Drie concrete gaten, hieronder.

---

## 3. De drie echte gaten (dit is waar het pijn gaat doen bij echte partners)

### 3.1 Geen click-tracking → je kunt promotors geen funnel tonen
De architectuurdoc noemt `af_clicks` + een redirect-endpoint, maar de **migratie heeft die tabel niet aangemaakt** en er is geen `/r/<ref>`-route. Gevolg:
- `af_daily_rollups.clicks` blijft altijd 0.
- Kolom "Conv.%" in de rapportage is **sales/leads**, niet clicks→lead. Een promotor wil juist *clicks → lead → sale* zien om te weten of zijn verkeer kwalitatief is.
- Zonder klikdata kun je fraude/bot-verkeer niet herkennen en geen EPC (earnings-per-click) tonen — de metric waar elke serieuze affiliate op stuurt.

**Dit is voor de MVP acceptabel** (de doc noemt de klik-laag expliciet optioneel), maar het is het **eerste dat een professionele partner mist**. Fix = `/r/<ref>`-redirect die een klik logt en dan doorstuurt (zie roadmap fase T).

### 3.2 Geen automatische sale-attributie → de helft van je verdienmodel is blind
`attributeIntakeLead` maakt **alleen leads**. Er is geen code die bij een premium-aankoop een `type='sale'`-conversie boekt, want **premium is nog niet te koop** (wachtlijst `premium_waitlist`, geen Stripe/Mollie in de codebase). Nu komen sales dus **uitsluitend** via handmatige invoer of CSV binnen.

Zodra premium live gaat, moet er in de checkout-flow een `recordConversion({ type:'sale', revenueCents, intakeSessionId })` komen, geattribueerd aan dezelfde `psf_aff_ref`-cookie. **Dit is de belangrijkste ontbrekende schakel voor het businessmodel** — leads zijn een proxy, sales zijn het geld.

### 3.3 Attributielek: de cookie wordt maar op 2 pagina's gezet
`psf_aff_ref` wordt alleen gezet door `setReferralCookiesFromSearchParams`, en dat wordt **alleen aangeroepen in [`IntakeIntro.tsx`](src/components/intake/IntakeIntro.tsx) en [`NutritionCapture.tsx`](src/components/intake/NutritionCapture.tsx)** — client-side, uit `window.location.search`.

- ✅ **Happy path werkt:** link `perfectsupplement.nl/intake?ref=jan` → IntakeIntro leest de param → cookie gezet → intake → lead. De link-tool defaultt zelfs naar `/intake`, dus dit wordt gestuurd.
- ❌ **Lek:** link naar homepage/blog/vergelijkingspagina met `?ref=jan` → **geen** cookie (die pagina's roepen de setter niet aan). Klikt de bezoeker daarna door naar `/intake` (zonder param), dan is de attributie **weg**.

Promotors linken zelden naar je diepste funnelpagina; ze linken naar content. **Fix = de ref globaal capteren** (in `proxy.ts` server-side, of één root-effect), zodat élke instappagina `?ref=` vasthoudt. Klein, hoge impact.

---

## 4. Het dashboard als nieuwe partner bekeken

*(Let op: er is nog géén partner-login. Dit beoordeelt het **admin**-dossier alsof jij de partner "namens" bekijkt; de echte portal is fase 5.)*

**Is het logisch?** Voor jou als beheerder: ja, de 6-sectie-indeling volgt de keten. Voor een externe partner: er is nog niets — hij krijgt nu een e-mail/PDF van jou.

**Wat een affiliate wil zien en nu ontbreekt:**
- Zijn **eigen link(s)** kant-en-klaar + een QR/UTM-bouwer.
- **Clicks, EPC, click→lead→sale-funnel** (ontbreekt volledig, §3.1).
- **Openstaand/goedgekeurd/uitbetaald saldo** — bestaat intern (`AfLedgerSection`), maar niet voor hém zichtbaar.
- **Uitbetaalhistorie + verwachte volgende betaaldatum + drempel.**
- **Zijn commissieafspraak in mensentaal** ("€X per voltooide check, Y% van premium").
- **Promomateriaal** (banners, teksten, richtlijnen — AVG/claim-regels!).

### Must have (vóór je échte partners aansluit)
1. **Globale ref-capture** (dicht het attributielek, §3.3).
2. **Automatische sale-boeking** bij premium-launch (§3.2).
3. **Partner-portal (fase 5):** login + read-only eigen cijfers + eigen link. Zonder dit blijf je alles handmatig rapporteren en ontstaan disputen.
4. **Afwijkingssignaal** expected vs. gemeten (de tabel heeft `expected_cents` al — gebruik het).
5. **Payout-drempel + periodiek ritme** (nu kun je €0,04 uitbetalen; geen minimum).
6. **Onboarding-velden** die je écht nodig hebt om uit te betalen: IBAN, BTW/KVK, adres (§10).

### Nice to have (later)
Click-tracking + EPC, promomateriaal-bibliotheek, self-service linkbouwer met campagnes, recurring/tiered commissies, e-mailnotificaties bij nieuwe conversie/uitbetaling, W-8/belastingafhandeling, referral-of-referral (2-tier), leaderboard.

---

## 5. "Productbeheer" — waarom er (terecht) geen productcatalogus is

In een netwerk als Awin beheer je producten met titel/afbeelding/voorraad/deeplink/coupon. **Jouw `af_`-programma monetiseert de Leefstijlcheck-funnel, niet een SKU-catalogus.** Het "product" is impliciet: een voltooide intake (lead) en straks premium (sale).

Wat in jouw model de rol van "product" speelt is het **conversietype + de commissieregel**:
- `af_conversions.type ∈ {lead, sale}` = wát er verkocht/gegenereerd is.
- `af_commission_rules.applies_to ∈ {lead, sale, both}` = waar de afspraak op geldt.

**Aanbeveling:** bouw géén productcatalogus zolang je één funnel monetiseert. Als je later meerdere "aanbiedingen" krijgt (bijv. Leefstijlcheck-premium, een cursus, een boek), introduceer dan een lichte **`af_offers`**-tabel (`id, key, name, kind`) en hang `af_conversions.offer_id` + `af_commission_rules.offer_id` eraan. Dat is de juiste, minimale groeirichting — niet een merchant-productfeed. Couponcodes/deeplinks/voorraad horen bij Rol 1 (merchants), niet hier.

---

## 6. Tracking — stap voor stap (huidig vs. bedoeld)

**Huidig (lead):**
```
1. Promotor deelt  perfectsupplement.nl/intake?ref=jan
2. Browser laadt /intake → IntakeIntro (client) leest ?ref=jan
3. Cookie psf_aff_ref=jan  (SameSite=Lax, Secure, max-age 90 dgn)
4. Bezoeker voltooit intake → POST /api/intake/session
5. Server leest cookie → normalizeRef → zoekt af_affiliates.ref='jan', status='active', niet-archived
6. recordConversion(type='lead', source='tracking', external_id='intake:<sessionId>', status='pending')
   → idempotent op (source_id, external_id): dubbel indienen telt nooit dubbel
7. accrueForConversion → commissie-engine → af_ledger_entries (accrual, pending)
8. Jij keurt goed → ledger 'approved'
```
**Bedoeld maar nog niet gebouwd (sale + click):**
```
0. (click) /r/jan → log af_clicks → 302 naar landingspagina   ← ONTBREEKT
5b.(sale)  premium-checkout betaald → recordConversion(type='sale', revenue_cents, intake_session_id)  ← ONTBREEKT (premium nog niet te koop)
```
**Attributieregel nu:** de-facto last-cookie-wins binnen 90 dagen (cookie-overschrijving). Er is **geen expliciet attributievenster, geen self-referral-uitsluiting, geen hold-periode** — de doc noemt die wél als regel. Voor 3 partners prima; vóór schaal invullen.

---

## 7. Tracking-ID's + relaties (ERD)

Een tracking-ID in jouw model = **`af_affiliates.ref`**: een stabiele, URL-veilige slug (`refFromName`, uniek, lowercase, gestript). Die ref zit in de link, landt in de cookie, en verbindt bezoeker → affiliate → conversie → grootboek.

```
af_affiliates ──1:N── af_commission_rules
     │  (ref)              │ (bevroren als rule_snapshot bij boeking)
     │                     ▼
     ├──1:N── af_links     af_ledger_entries ──N:1── af_conversions
     │                          │  (accrual/reversal/…)      │ (external_id uniek per source)
     │                          │                            │
     │                          ├── reverses_entry_id (self) │
     │                          │                            └── intake_session_id → intake_sessions
     ├──1:N── af_conversions ───┘
     │
     ├──1:N── af_payouts ──1:N── af_payout_items ──N:1── af_ledger_entries
     │
     └── account_id ⇢ accounts   (NULLABLE — de naad naar login, fase 5)

af_sources ──1:N── af_conversions   (manual | csv | network | bookkeeping | psp | tracking)
af_financial_events   (outbox, losstaand — gevoed bij 'betaald')
af_daily_rollups      (leeg tot fase 3B)
```
De **UUID `id`** is overal het anker (niet naam/account) — correct ontworpen. `ref` is het *externe* handvat, `id` het *interne*.

---

## 8. Commissies — huidig model + wat mist

**Nu ondersteund:** per affiliate; percentage-van-omzet óf vast bedrag; per type (lead/sale/beide); standaard vs. tijdelijke promo met geldigheidsvenster; winnaar-resolutie met bevroren snapshot. Dat is een **degelijk fundament**.

**Wat een volwassen programma nog wil (nu afwezig):**
- **Recurring / lifetime** (premium = abonnement? dan wil je maandelijkse commissie, niet eenmalig). Vereist een `af_subscriptions`-achtig concept of herhaalde sale-conversies.
- **Tiered / staffel** ("20% tot 50 sales, daarna 25%").
- **First-order-only vs. alle orders.**
- **Programma-brede defaultregel** — nu heeft elke affiliate eigen regels; `af_affiliates.default_commission_rule_id` bestaat als kolom maar wordt **nergens gezet of gebruikt** (dormant). Overweeg één programma-default zodat je niet per partner regels hoeft te kopiëren.
- **Cap / max per periode** (fraudebescherming).

**Aanbeveling:** houd het huidige model; voeg alléén toe wat je verdienmodel echt vraagt. Als premium een abonnement wordt, is *recurring* de eerste uitbreiding.

---

## 9. Partner-onboarding — welke velden en waarom

`af_affiliates` heeft nu: `display_name, company, email, status, notes, payout_details (jsonb), ref`. Voor **echt uitbetalen** mist essentiële, gestructureerde data. Minimaal:

| Veld | Waarom |
|---|---|
| **IBAN + tenaamstelling** | Zonder kun je niet betalen. Nu alleen losse `payout_details` jsonb → foutgevoelig. |
| **BTW-id / KVK** | Factuurplicht; bepaalt of de affiliate met/zonder BTW factureert (`af_financial_events.vat_cents` bestaat al). |
| **Bedrijfsnaam + adres** | Boekhouding / self-billing-factuur. |
| **Land** | BTW-regime (NL vs. EU vs. buiten-EU), belasting. |
| **Contactpersoon + e-mail** | Communicatie, disputen. |
| **Website / kanaal + volume-inschatting** | Kwalificatie, fraudecheck, verwachte omzet. |
| **Akkoord programmavoorwaarden (datum+versie)** | Juridisch; claim-/AVG-regels (geen medische claims!). |
| **Payout-drempel & -methode** | Ritme en minimum. |

**Aanbeveling:** promoveer de must-haves (IBAN, BTW/KVK, land, adres) naar echte kolommen of een `af_payout_profiles`-tabel met validatie; laat `payout_details` jsonb voor de rest. Leg **akkoord op voorwaarden** vast (kolom `terms_accepted_at` + `terms_version`) — dit is compliance, geen luxe.

---

## 10. "Een webshop binnenhalen" — belangrijke kanttekening

De prompt vraagt een belscript om **een webshop** aan te sluiten. In jouw architectuur is dat **niet het `af_`-programma** — een webshop is een *merchant* (Rol 1 / PartnerDesk), niet een promotor. Twee scenario's:

- **Wil je een webshop als merchant** (jij promoot hun producten, zij betalen jou)? → dat is **PartnerDesk (`pd_partners`) + `affiliate_clicks`**, met een eigen onboarding (netwerk/commissie/feed/deeplink). Dan zijn de prompt-velden (feed, coupon, deeplink, webhook) wél relevant — maar in díé laag.
- **Wil je een webshop/merk als affiliate-promotor** (zij sturen verkeer naar jóuw Leefstijlcheck, jij betaalt hen)? → dan is `af_` juist, en het "gesprek" gaat over: welk kanaal/bereik, welke commissie (lead vs. sale), IBAN/BTW, akkoord voorwaarden, welke landingspagina, promomateriaal. Geen feed/voorraad/coupon nodig.

**Stappenplan voor een `af_`-promotor binnenhalen:**
1. Kwalificeer: kanaal, bereik, past bij mannen 40+ / slaap-stress-energie?
2. Spreek commissie af: bedrag per lead en/of % van premium; standaard of promo.
3. Verzamel uitbetaalgegevens: IBAN, BTW/KVK, land, adres.
4. Voorwaarden + AVG/claim-regels akkoord (geen medische claims).
5. Maak `af_affiliate` aan → deel `/intake?ref=<ref>` + promomateriaal.
6. Monitor eerste leads; keur goed; eerste uitbetaalcyclus draaien (= het MVP-criterium §11 van de architectuurdoc).

---

## 11. Database-review — concrete voorstellen

**Sterk:** append-only geld, centen, `UNIQUE(source_id, external_id)`, bevroren `rule_snapshot`, nullable `account_id`-naad, nette indexen op de hot paths.

**Ontbrekend / aan te scherpen:**
| Onderwerp | Voorstel |
|---|---|
| **`af_clicks`-tabel** | Bestaat niet (wel in de doc). Toevoegen bij fase T incl. `ip_hash, ua_hash, consent, occurred_at, ref, external_id` + retentiebeleid. |
| **`af_conversions.click_id`** | In de doc, niet in het schema → toevoegen zodra clicks bestaan (klik→conversie herleiding). |
| **Type-drift `AfSource.kind`** | Migratie voegde `'tracking'` toe, maar [`types/affiliate.ts:21`](src/types/affiliate.ts#L21) mist `'tracking'` (en `af_sources_kind_check` heeft nu 6 waarden). TS-type bijwerken. |
| **Dormant `default_commission_rule_id`** | Kolom + FK bestaan, worden nooit gebruikt. Óf gebruiken (programma-default), óf documenteren als toekomstige naad. |
| **Uitbetaalvelden** | IBAN/BTW/KVK/land/adres als kolommen of `af_payout_profiles` (§9). |
| **`terms_accepted_at` / `terms_version`** | Compliance-veld op `af_affiliates`. |
| **Index `af_conversions(status)`** | Rapportage/queries filteren op `status != 'rejected'`; overweeg index bij volume. |
| **Payout-drempel** | Geen minimumbedrag-constraint of -instelling; toevoegen (programma-setting). |
| **Attributievenster / self-referral** | Nu impliciet (cookie-TTL). Expliciete regel + `hold_until` vóór goedkeuring bij schaal. |
| **`af_daily_rollups`** | Leeg tot fase 3B — prima, maar documenteer dat rapportage nu live-scan is. |

---

## 12. UX-review per pagina

**`/admin/programma` (lijst)** — Goed: rustig, ref zichtbaar, snelle "+Affiliate". Mist: **geen saldo/leads-kolom** (je ziet niet wie geld verdient zonder door te klikken); geen filter op status; "Rapportage →" verstopt in subkop.

**`/admin/programma/[ref]` (dossier)** — Goed: logische keten in 6 secties, sticky header, "geen commissie"-waarschuwing + herbereken-knop is een sterke, eerlijke UX. Mist: **geen kerncijfer-header** (openstaand/leads/sales bovenaan); links-sectie toont geen clicks/conversies pér link; geen "kopieer alles"/QR.

**`/admin/programma/rapportage`** — Goed: datumbereik + totalen + CSV. Zwak: **"Conv.%" = sales/leads is misleidend** zolang er geen clicks zijn (lijkt een funnel maar is het niet); geen grafiek/trend; geen per-bron-uitsplitsing (tracking vs. handmatig vs. CSV).

**Conversies-sectie** — Sterk: `default type='sale'` in het formulier is logisch voor handmatige invoer; goed/afkeuren inline. Let op: **CSV-import geeft `pending`, handmatig geeft `approved`** — bewust, maar leg dat kort uit in de UI.

**Algemeen** — consistent met de PartnerDesk-tokens (`var(--ps-*)`), toegankelijke labels. Grootste UX-winst: **kerncijfers bovenaan elk dossier** en **eerlijke funnel-labels**.

---

## 13. Wat je mist t.o.v. Impact / Awin / Rewardful / Tapfiliate

Alleen de dingen die voor **jouw** model (self-referral, één funnel) relevant zijn — de rest (productfeeds, merchant-marktplaats) wil je bewust niet:

| Standaard elders | Bij jou | Prioriteit |
|---|---|---|
| Self-service **partner-portal** (login, eigen cijfers, link) | Fase 5, naad klaar | **Hoog** |
| **Click-tracking + EPC + funnel** | Ontbreekt | **Hoog** |
| **Automatische sale/webhook-conversie** | Ontbreekt (premium niet live) | **Hoog** (bij launch) |
| **Payout-drempel + vast ritme + self-billing factuur** | Handmatig, geen drempel | Midden |
| **Promomateriaal-bibliotheek** (met claim-regels) | Ontbreekt | Midden |
| **Recurring/tiered commissie** | Alleen eenmalig %/vast | Midden (bij abonnement) |
| **Fraudedetectie / self-referral-block / hold-periode** | Ontbreekt | Midden→Hoog bij schaal |
| **E-mailnotificaties** (nieuwe sale, uitbetaling) | Ontbreekt | Laag |
| **Cookie-consent op klik-tracking** | N.v.t. tot clicks bestaan | Met fase T |
| **2-tier / referral-of-referral** | Ontbreekt | Laag |

---

## 14. Roadmap in fases (aansluitend op de bestaande architectuurdoc)

De architectuurdoc heeft al fase 3A/3B/5. Ik voeg de **ontbrekende schakels** in als scherp afgebakende blokken met prioriteit en afhankelijkheid.

**Fase L — Attributie dichttimmeren (NU, klein, hoog)**
- Globale `?ref=`-capture in `proxy.ts` (server-side cookie) i.p.v. alleen 2 pagina's. Dicht §3.3.
- Expliciet attributievenster + self-referral-uitsluiting als regel.
- *Afhankelijkheid:* geen. *Complexiteit:* laag. *Waarom:* zonder dit lekt elke niet-`/intake`-link weg.

**Fase T — Click-laag (hoog, middel)**
- `af_clicks`-tabel + `/r/<ref>`-redirect-endpoint (log klik → 302), consent-gate, gehashte IP/UA, retentie.
- `af_conversions.click_id` + echte click→lead→sale-funnel in rapportage; EPC.
- *Afhankelijkheid:* fase L. *Waarom:* eerste ding dat pro-partners missen; nodig voor fraude-inzicht.

**Fase S — Sale-attributie bij premium-launch (hoog, middel — getriggerd door premium)**
- In premium-checkout: `recordConversion(type='sale', revenue_cents, intake_session_id)` op dezelfde cookie.
- Recurring-commissie als premium een abonnement wordt.
- *Afhankelijkheid:* premium moet te koop zijn (nu wachtlijst). *Waarom:* dit is het echte geld.

**Fase O — Onboarding & uitbetaling productioneel (midden)**
- IBAN/BTW/KVK/land/adres als echte velden + validatie; `terms_accepted_at/version`.
- Payout-drempel + periodiek ritme; self-billing-factuur uit `af_financial_events`.
- Afwijkingssignaal expected vs. gemeten (kolom bestaat al).
- *Afhankelijkheid:* geen. *Waarom:* nodig vóór je >3 echte partners betaalt.

**Fase 3B — Robuustheid (bestaand plan, midden)**
- Rollups + retentie-jobs; reconciliatie-dashboard; optioneel eerste n8n-adapter.

**Fase 5 — Partner-portal (bestaand plan, ná MVP-criterium, hoog zodra criterium gehaald)**
- `account_id` vullen + per-affiliate RLS + `/partner` read-only dashboard + eigen link/materiaal.
- *Afhankelijkheid:* fasen L+T+S+O geven de portal iets zinnigs om te tonen; het MVP-criterium (§11 architectuurdoc: ≥3 affiliates, end-to-end lead+sale, 1 volledige uitbetaalcyclus, reconciliatie klopt).

**Bewust NIET (nu):** productcatalogus/feeds/coupons/deeplinks (Rol 1-concepten), multi-tenant, eigen PSP, boekhoud-lock-in. Naden staan; integraties uitgesteld.

---

## 15. De vijf dingen die ik als eerste zou doen

1. **Dicht het attributielek** (fase L) — kleinste moeite, voorkomt dat je nu al leads misloopt.
2. **Kerncijfer-header** op lijst + dossier (leads/openstaand saldo) — grote UX-winst, lage moeite.
3. **Eerlijke funnel-labels** in rapportage (noem "Conv.%" pas een funnel als clicks bestaan).
4. **Onboarding-velden voor uitbetaling** (IBAN/BTW) — je kunt nu niet compliant uitbetalen.
5. **Plan de sale-hook mee** in het premium-launch-ticket, niet erna.

*Meetpunt: de bestaande `domain_events`/GA4-laag registreert al intake-events; koppel `af_conversions` (lead) aan een programma-KPI zodra fase L live is — dan lees je per affiliate het effect af in de rapportagepagina.*
