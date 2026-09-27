# Overdracht — plak 2 (admin-productbeheer) en §G (upstream-omzet in PartnerDesk)

**Datum:** 26 september 2026
**Status:** nog niet gestart, korte notitie voor een volgende sessie
**Context:** plak 1 (schema/backfill/DB-loader, alle 7 `/beste/*`-categorieën) en plak 4/4b
(retailers, offers, click-registratie, commissieberekening, conversie-inname) zijn af en
gemerged. Dit document markeert waar het volgende stuk begint — geen bouwwerk hier, alleen
de stand en de eerste concrete stappen.

---

## Twee aparte stukken, niet één

Dennis noemde ze in één zin, maar het zijn twee losse delen van
`ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md`:

- **§F — plak 2, admin-productbeheer.** Nieuw terrein: CRUD-routes voor de `sup_*`-catalogus
  (nu alleen bewerkbaar via de backfill-route en direct SQL).
- **§G — affiliate-beheer in PartnerDesk.** Bestaand terrein (het partnerdossier
  `/admin/partners/[slug]` draait al) dat nu upstream-omzetdata moet tonen uit de net
  gebouwde `pd_conversions`/`pd_ledger_entries`.

Bij het echte startsein eerst navragen welke van de twee eerst, of beide — niet aannemen.
Dennis' screenshot bij dit gesprek toonde het VitalNutrition-partnerdossier met lege
"Commissie nu"/"Contract"/"Cookieduur"-velden, wat wijst op interesse in §G, maar dat is
niet bevestigd als keuze.

---

## §G — wat er al staat, wat ontbreekt

Het partnerdossier (`src/app/admin/(desk)/partners/[slug]/page.tsx`) is een volwassen,
werkend patroon: `PassportCard`, `CollapsibleSection`, `InlineField`, `CommissionSection`,
`ContractsSection`, etc. — allemaal al gebouwd voor `pd_partners`/`pd_contracts`/
`pd_commission_rules`. De "Commissie nu"/"Contract"-velden zijn leeg omdat VitalNutrition
(en Vitaminstore, Arctic Blue) net zijn aangemaakt via de plak-4-migratie
(`20260926112517_pd_daisycon_en_retailer_partners.sql`) zonder contract-/commissiedata —
dat is normaal, geen bug, en moet handmatig ingevuld worden in PartnerDesk zelf (of is een
apart datawerk-stapje, geen codewerk).

**Wat er voor §G nog moet gebeuren, uit het analysedoc:**

1. Een omzet-sectie op `/admin/partners/[slug]` die leest uit `pd_conversions` +
   `pd_ledger_entries` (beide tabellen bestaan sinds plak 4b, nog leeg — er is nog geen
   enkele conversie binnengekomen).
2. **Dekking zichtbaar maken, niet alleen het bedrag.** Zie §G-kern: "3 van 7 partners
   rapporteren automatisch" is het soort getal dat moet — nooit een omzettotaal tonen zonder
   erbij te zeggen welke innamemethode (`pd_contracts.reporting_method`, nieuw veld uit
   plak 4b) erachter zit. Een partner zonder postback toont geen "€0", maar "geen
   automatische rapportage".
3. Verschil verwacht (`pd_ledger_entries.expected_cents`) versus ontvangen als
   `pd_signals`-signaal — het mechanisme (severity/dedupe_key) bestaat al voor andere
   signalen in PartnerDesk, hergebruiken, niet opnieuw verzinnen.
4. Dit hoort **op** het bestaande partnerdossier, niet in een nieuw dashboard — CLAUDE.md
   waarschuwt expliciet tegen een derde omzetweergave naast `/admin/programma` (eigen
   programma) en het intake-dashboard.

**Praktisch probleem om eerst op te lossen:** er is nog geen enkele partner met een
`webhook_secret` ingesteld, dus `pd_conversions` zal leeg blijven totdat er een echte
postback-integratie is. Voor een zinvolle demo/test van de §G-UI is waarschijnlijk een
handmatige test-rij in `pd_conversions` nodig (via `ingest_method: 'manual'`), niet wachten
op een live partner-koppeling.

---

## §F — wat er al staat, wat ontbreekt

**Bestaande bouwstenen** (uit het partnerdossier-patroon, direct herbruikbaar):
`DeskShell`, `PassportCard`, `InlineField`, `CollapsibleSection`, `StatusBadge`,
`CommandPalette`. Zie `src/components/partnerdesk/` voor het volledige patroon — een nieuw
`/admin/producten/[slug]`-dossier kan qua vorm bijna 1-op-1 van
`/admin/partners/[slug]/page.tsx` overnemen (secties, `InlineField`-bewerking, `FieldRow`).

**Nog te bouwen, in volgorde uit §F:**

1. `/admin/producten` — lijst: foto, naam, merk, score, #aanbiedingen, status, versheid.
2. `/admin/producten/[slug]` — dossier met secties: Basis · Samenstelling · Etiket ·
   Afbeeldingen · Claims (read-only) · Score (read-only) · Aanbiedingen · Bronnen · Tijdlijn.
3. `/admin/merken`, `/admin/categorieen`, `/admin/retailers` (retailers koppelt aan
   `pd_partners` — de 3 partners uit plak 4 staan er al, dit scherm laat ze beheren).
4. **Publiceerpoort** — het mechanisme dat `status → 'published'` blokkeert tenzij: ≥1
   afbeelding met `source`+`license_note`, alle `sup_product_actives` ingevuld, elke
   gekoppelde claim haalt zijn drempel, ≥1 actieve aanbieding met `price_checked_at` < 30
   dagen, ≥1 bron, score berekend. Dit is geen losse feature maar de vervanging van de
   TypeScript-compile-check die verloren ging bij de overstap naar de database — **niet
   overslaan of uitstellen**, ook niet voor een MVP.
5. Versheidsdashboard op `/admin/producten` (query over `data_checked_at`,
   `price_checked_at`, `sup_product_images.checked_at`).
6. `/admin/import` (CSV/feed-import) — expliciet als latere stap in §F, niet nodig voor de
   eerste 25 producten die al via backfill staan.

**Wat er al werkt en hergebruikt moet worden, niet opnieuw gebouwd:**
- De 25 producten uit de backfill hebben al `raw_legacy_fields` met specs/pros/cons/
  breakdown — een productdossier-scherm moet die kunnen tonen/bewerken, niet negeren.
- `computeTrustScore()` (PS-Score) is de score-motor, niet iets nieuws bouwen — zie de
  §C3-correctie in het hoofddocument voor waarom dit al vervangen is t.o.v. het
  oorspronkelijke §C3-voorstel.

---

## Eerste concrete stap bij het echte startsein

Niet zomaar beginnen bouwen — eerst met Dennis bevestigen:
1. §F of §G eerst, of beide?
2. Bij §G: is een handmatige test-conversie (`ingest_method: 'manual'`) acceptabel om de UI
   te kunnen bouwen/testen zonder te wachten op een live postback-partner?
3. Bij §F: is de bestaande `/admin/partners/[slug]`-vorm (secties, `InlineField`) het
   gewenste patroon voor `/admin/producten/[slug]`, of moet dat er anders uitzien?
