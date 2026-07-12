# Productvisie — PartnerDesk (werknaam)

*Single-tenant affiliate management platform. Eén dossier per partner, nooit meer zoeken.*

Datum: 12 juli 2026 · Status: visie · Vervolg: `PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md`

---

## 0. Filosofie & ontwerpprincipes

> "Ik wil nooit meer hoeven zoeken naar informatie. Alles rondom een affiliate partner moet zich op één plek bevinden."

1. **De partner is het dossier.** Bij Daisycon, Awin en TradeTracker is informatie georganiseerd rond *functies* (statistieken, materiaal, programma's) en moet jíj de context reconstrueren. Hier is alles georganiseerd rond de *partner*: contracten, commissies, contacten, feeds, API, documenten en notities zijn eigenschappen van een dossier, geen losse modules.
2. **Eén antwoord per vraag.** "Wat is nú mijn commissie bij partner X?" heeft precies één berekend antwoord, met uitleg waarom (welke regel, uit welk contract, geldig tot wanneer).
3. **Signalen in plaats van rapporten.** Het systeem vertelt jou wat afwijkt. Jij hoeft nergens periodiek te gaan kijken.
4. **Single-tenant = radicaal versimpelen.** Geen rollen, geen multi-tenancy, geen instellingen die alleen bestaan om software verkoopbaar te maken.
5. **Lezen is de hoofdactiviteit.** Je kijkt 50× vaker iets op dan dat je iets wijzigt. Optimaliseer voor scanbaarheid; bewerken gebeurt inline, op de plek waar je leest.

---

## 1. Informatie-architectuur

### Waarom níet 14 hoofdmodules

Contracten, commissies, contactpersonen, feeds, API's, advertenties, documenten en notities bestaan *nooit* los van een partner. Als hoofdmodule dwing je jezelf om vanuit het contract terug te zoeken naar de context — precies de frustratie van bestaande platformen. Daarom: **vier lagen, zeven navigatie-items.**

**Laag 1 — Werklaag**: Vandaag (dashboard met signalen, taken, verloopkalender) · Taken.
**Laag 2 — Dossierlaag**: Partners — lijst + het partnerdossier met álles erin.
**Laag 3 — Registerlaag** (dwarsdoorsneden die zelfstandig bestaan): Producten · Campagnes · Rapportages.
**Laag 4 — Systeemlaag**: Instellingen (netwerken, eigen categorie-taxonomie, labels).

Dwarsdoorsnede-vragen ("welke contracten verlopen binnen 30 dagen?") zijn dashboard-signalen en opgeslagen weergaven — geen modules. Overal beschikbaar: ⌘K zoek/command-palette.

---

## 2. De Partner Detail Pagina — "het partnerdossier"

Eén verticaal scrollbare pagina met inklapbare secties en sticky anker-navigatie links — geen tabs (tabs verbergen informatie). Denk aan een Stripe-customer-pagina.

### 2.1 Sticky kop
Logo, naam, statusbadge (Actief/Onboarding/Gepauzeerd/Beëindigd), health score met uitleg-tooltip, netwerk-badge, categorie, labels. Quick actions: login bij netwerk ↗ (met gebruikersnaam-hint), mail primaire contactpersoon, + notitie, + taak.

### 2.2 Het Partnerpaspoort — de killer feature
Eén kaart met de acht feiten waar je altijd naar zoekt, elk berekend en deep-linkend naar zijn sectie:

```
┌─ Paspoort ────────────────────────────────────────────────────┐
│ Commissie nu     8% CPS (staffel 2)      → geldig t/m 31 dec  │
│ Contract         #2026-03 · t/m 31 dec   → opzeggen vóór 1 nov│
│ Cookieduur       30 dagen                                     │
│ Contactpersoon   Jeroen v.d. Berg        ✉ · laatst: 12 dgn  │
│ Login            partner.arcticblue.nl   ↗ · user: dennis@…   │
│ Feed             ● OK · 142 producten · gesynct 2 u geleden   │
│ API              ● OK · laatste call 09:14                    │
│ Openstaand       1 taak · 0 signalen                          │
└───────────────────────────────────────────────────────────────┘
```

### 2.3 Secties (allemaal op dezelfde pagina)

- **Algemene gegevens** — naam, logo, website, status, netwerk, login-URL + gebruikersnaam (wachtwoord in wachtwoordmanager), accountmanager, categorie, labels. Alles inline bewerkbaar.
- **Contactpersonen** — kaarten, onbeperkt. Per kaart: naam, functie, e-mail (klik = mail + log), telefoon, LinkedIn, verantwoordelijk voor, laatste contact (automatisch uit tijdlijn), notities. Eén ★ primair. Amber-badge "> 90 dgn geen contact".
- **Contracten** — kaart per contract: looptijd, opzegtermijn met teruggerekende **opzegdeadline** (+ automatische taak op −14 dgn), cookieduur, exclusiviteit, goedkeuringsvoorwaarden, staffels als mini-tabel, gekoppelde commissieregels, PDF's. Badges: `Actief` / `Verloopt over N dgn` (amber < 60, rood < 30) / `Verlopen` / `Concept`.
- **Commissies** — twee lagen. Laag 1: **"Nu geldig"** (berekend blok bovenaan). Laag 2: regeltabel met type (CPS/CPL/CPC/CPA/hybride), waarde, scope (alles/categorie/product), geldigheid (acties met countdown), bron-contract, soort (standaard/uitzondering/actie/bonus). Resolutieregel zichtbaar als "waarom dit bedrag?"-tooltip: productuitzondering > tijdelijke actie > categorieregel > contract-default; daarna meest recent.
- **Producten** — compacte tabel van producten van deze partner met berekende effectieve commissie; koppelen aan campagnes via zijpaneel.
- **Productfeeds** — kaart per feed: status, URL, formaat, laatste sync, aantal producten, mapping-status, foutlog. Feed-diff per sync ("+2, −1, 14 prijswijzigingen") als tijdlijn-event.
- **API** — per koppeling: endpoint, auth, key (masked), rate limits, laatste succesvolle call, foutenteller, log, test-knop.
- **Materiaal & documenten** — banners/logo's/screenshots als grid met preview; contracten/voorwaarden/handleidingen als lijst met versie en "verouderd"-vlag na 12 maanden.
- **Tijdlijn** — chronologisch, zoals een CRM. Handmatig (notitie, mail, meeting, telefoontje) en automatisch (commissie gewijzigd met diff, contract vernieuwd, feed-fout, product-diff) door elkaar, filterbaar. Snelle invoer bovenaan. Voedt "laatste contact".
- **Taken** — taken van deze partner, één-regel-invoer.

---

## 3. Dashboard — "Vandaag"

Beantwoordt één vraag: **wat vraagt vandaag mijn aandacht?** Geen grafieken (die horen bij Rapportages).

1. **Signalen** — gegroepeerd per ernst (rood/amber), elke regel één klik van de oplossing, met inline-acties: oplossen (deep-link), taak maken, snooze (met verplichte reden). Typen: verlopende contracten, opzegdeadlines, feed-fouten, feeds > 24 u niet gesynct, API-fouten, partner zonder contactpersoon, ontbrekende commissies, producten zonder koppeling, afwijkende commissies, laatste contact > 90 dgn.
2. **Taken vandaag** — te laat (rood) + vandaag + deze week (ingeklapt).
3. **Verloopkalender** — 90-dagen-strip met contract-eindes en opzegdeadlines.
4. **Recent** — nieuwste partners, laatst gewijzigde dossiers.

Lege staat is een feature: "Alles rustig. 0 signalen, 0 taken."

---

## 4. Producten

- Ontstaan uit **feeds** (import + mapping feed-categorie → eigen taxonomie) of handmatig.
- **Product → partner**: 1-op-1, ontstaat bij import — nooit handmatig koppelen.
- **Product → contract**: automatisch afgeleid (actief contract dekt alles); alleen uitzonderingen expliciet.
- **Product → commissie**: nooit handmatig — **effectieve commissie wordt berekend** uit de regels; uitzondering maak je door een regel met product-scope toe te voegen, vanaf de productrij zelf.
- **Product → campagne**: n-op-m via selectie + sticky actiebalk.
- Register-tabel met de kolom die geen enkel netwerk je geeft: effectieve commissie, sorteerbaar over partners heen.

---

## 5. Datamodel (samenvatting)

```
Network 1─n Partner
Partner 1─n Contact
        1─n Contract 1─n CommissionRule 1─n CommissionTier
        1─n Product ──n─m── Campaign (via CampaignItem)
        1─n Feed 1─n FeedRun
        1─n ApiConnection 1─n ApiLog
        1─n Click 1─0..1 Conversion
        1─n TimelineEvent · 1─n Task
Document ──> Partner | Contract | TimelineEvent
Signal   ──> Contract | Feed | Partner | Product | ApiConnection
```

Twee berekende kernconcepten: **effectieve commissie** (resolutie over geldige regels, altijd met herleiding) en **signalen** (gematerialiseerde uitkomst van periodieke checks, met snooze/oplos-state). Volledige uitwerking in het implementatieplan.

---

## 6. Navigatie

```
◆ PartnerDesk          ⌘K Zoeken…
─────────────────────
▸ Vandaag          (3)
▸ Partners
▸ Producten
▸ Campagnes
▸ Rapportages
▸ Taken            (2)
─────────────────────
▸ Instellingen
```

Zeven items. Badge-counts alleen op Vandaag en Taken. Zijbalk sticky, inklapbaar tot iconen.

---

## 7. Zoekfunctie (⌘K)

Spotlight-achtig, overal, zoekt én doet. Zoekt over partners, contacten (naam + e-mail), producten (naam + EAN), contractnummers, commissieregels, feeds, categorieën, labels, documenten, notitie-tekst. Fuzzy, gegroepeerd per type, recente items bij lege query. Deep links (contractnummer-treffer opent het dossier óp de contractsectie). Prefixes: `p ` partners, `c ` contacten, `# ` producten, `t ` taken, `> ` acties. Acties: "nieuwe notitie bij Arctic Blue", "sync feed X". Nooit in de index: API-keys.

---

## 8. Slimme functies (32)

**Datakwaliteit**: 1 dossier-compleetheidsscore met invul-knoppen · 2 partner zonder contactpersoon · 3 contract zonder producten · 4 product zonder commissieregel · 5 verouderd-document-vlag (> 12 mnd) · 6 duplicaat-EAN-detectie.
**Contract & commissie**: 7 opzegtermijn-bewaking met automatische taak · 8 commissie-afwijkingsdetectie (gemeten ≠ contractueel) · 9 tijdelijke acties vervallen vanzelf · 10 commissie-historie met diff · 11 staffel-voortgang · 12 effectieve-commissie-kolom sorteerbaar over partners · 13 verloopkalender 90 dgn · 14 exclusiviteits-conflictdetectie.
**Relatiebeheer**: 15 laatste-contact-bewaking (> 90 dgn) · 16 mail-logging via BCC-adres · 17 zelfschrijvend dossier (systeemgebeurtenissen in tijdlijn) · 18 snooze alleen mét reden · 19 uitlegbare health score · 20 contactpersoon-verloop-detectie (bounce).
**Feeds & techniek**: 21 feed-kwaliteitsscore · 22 feed-diff per sync · 23 prijswijzigings-alerts op campagneproducten · 24 dead-link-checker · 25 sync-anomalie-blokkade (feed plots leeg → mutaties geblokkeerd) · 26 API-statuspagina per partner.
**AI**: 27 contract-PDF → gestructureerde velden met bron-highlight en bevestiging · 28 contract-samenvatting in 3 zinnen · 29 tegenspraak-detectie (mail zegt 10%, dossier zegt 8%) · 30 koppel- en categoriesuggesties · 31 "vraag het dossier" met bronvermelding · 32 notitie → taak-suggestie.

---

## 9. UI-richtlijnen

Referentiekader: Linear (dichtheid + toetsenbord), Stripe (datahiërarchie), Notion (inline editing), Vercel (rust). Eén accentkleur; kleur alleen voor betekenis (groen OK, amber aandacht, rood actie, grijs inactief). Kaarten met inklapbare secties (status onthouden). Sticky: zijbalk, dossier-kop + paspoort, anker-nav, actiebalk bij selectie. Inline bewerken overal; zijpanelen in plaats van modals (modals alleen voor destructieve bevestiging). Toetsenbord: ⌘K, `n` notitie, `t` taak, `g p` partners, `j/k` rijen, `e` edit. Lege staten met één duidelijke actie. Alles < 200 ms.

---

## 10. Roadmap

### Fase 1 — MVP: het dossier
Partner CRUD + lijst · volledig partnerdossier (paspoort, contacten, contracten incl. staffels/opzegdeadline/PDF, commissies incl. resolutie + "nu geldig", documenten, tijdlijn, taken) · dashboard v1 met 6 signalen (contract verloopt, opzegdeadline, geen contactpersoon, ontbrekende commissie, contact > 90 dgn, taken te laat) · ⌘K v1 · instellingen (netwerken, categorieën, labels).

### Fase 2 — Producten & feeds
Feed-import (XML/CSV/JSON) + scheduler + runs met diff + anomalie-blokkade · productenregister met categorie-mapping en effectieve-commissie-kolom · product-signalen · campagnes + koppeling via actiebalk · feed-kwaliteits- en compleetheidsscores · ⌘K uitgebreid.

### Fase 3 — Data & rapportages
API-koppelingen (Daisycon eerst): clicks + conversies automatisch binnen · API-beheer + logs + status · rapportages (omzet/commissie per partner/product/campagne/periode, drill-down, CSV) · commissie-afwijkingsdetectie · staffel-voortgang · health score · dead-link-checker · BCC-mail-logging.

### Fase 4 — AI-laag
Contract-PDF-extractie met bevestigingsflow + samenvattingen · tegenspraak-detectie · koppel-/categoriesuggesties · "vraag het dossier" · notitie → taak · maandelijkse AI-dossier-review.

### Bewust níet bouwen
Multi-user rollen, multi-tenancy, white-label, facturatie, netwerk-featurepariteit, publieke API.

---

*Toetssteen voor elke toekomstige feature: maakt dit dat ik iets níet meer hoef op te zoeken? Zo nee, dan hoort het er niet in.*
