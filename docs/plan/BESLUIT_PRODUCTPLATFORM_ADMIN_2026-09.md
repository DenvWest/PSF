# Besluit — Admin-productbeheer (§F): publiceerpoort, score-invoer, scoredekking

**Datum:** 30 september 2026 (akkoord Dennis, per plak in de sessie)
**Status:** besloten, gebouwd (plak 2a–5), zie PR #61–#67 en de zachte waarschuwing in #68
**Vervolg op:** `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §F en §J
**Aanleiding:** de catalogus staat in `sup_*`; zonder poort is er geen structurele garantie meer
dat een product met een claim die het niet waarmaakt niet live gaat (de TypeScript-compile-check
viel weg bij de overstap van statische data naar de database).

---

## 1. Publiceerpoort (besloten, gebouwd)

`draft → published` alleen als alle zes punten slagen: afbeelding met bron én licentie-notitie,
werkzame stoffen volledig, gekoppelde claims halen hun drempel, actieve aanbieding met prijs
jonger dan 30 dagen, minstens één bron, PS-Score te berekenen.

- Wordt bij elke statuswijziging **server-side opnieuw uit de database** berekend; de browser
  levert niets aan. Pure functie: `src/lib/product-admin/publish-gate.ts`.
- `meets_condition` is afgeleid van de werkzame stoffen en wordt na elke wijziging (stof
  toevoegen/wijzigen/verwijderen, claim koppelen) opnieuw berekend. Alleen goedgekeurde claims
  uit `approved-claims.ts` zijn te koppelen. Geen handmatige override.
- Afgewezen: publiceren met een waarschuwing i.p.v. een blokkade. Reden: dit is de enige
  structurele garantie tegen een claim die het product niet waarmaakt; een waarschuwing is
  wegklikbaar.

## 2. Score-invoer per product in de database (besloten, gebouwd)

Kolom `sup_products.score_inputs` (jsonb, nullable; migratie `20260930143532`): vormsleutel,
etiketfeiten, kwaliteitsmarkers, certificeringen, dosis-onzeker-reden. **Geen prijs** (de score
is prijsvrij; prijs leeft in `sup_offers`).

- De admin leest eerst de database en valt terug op `score-inputs.ts`. Backfill:
  `POST /api/admin/data/sup-score-inputs-backfill` (idempotent, overschrijft niets).
- Afgewezen: een aparte tabel `sup_score_inputs`. Reden: één rij per product, geen historie
  nodig, en een tweede join maakt de loader zwaarder zonder winst.
- Afgewezen: `score-inputs.ts` blijven bijhouden als enige bron. Reden: een in de admin aangemaakt
  product kan dan nooit de poort halen.
- Kwaliteitsmarkers: het formulier herhaalt de bestaande regel uit `score-inputs.ts` — pas
  aanvinken als je de gepubliceerde waarde of het rapport zelf hebt gezien. Een keurmerk of
  testuitslag toeschrijven aan een merk dat het niet voert is een feitelijke bewering over dat bedrijf.

## 3. Scoredekking: zachte waarschuwing, geen harde drempel (besloten, gebouwd)

Het model hernormaliseert over de bepaalde onderdelen ("niet weten is iets anders dan slecht
scoren"). Een score over 3 van 5 onderdelen kan daardoor hoger uitvallen dan bij volledig
beoordeelde producten (testproduct: 94 tegenover 74–82 bij echte eiwitpoeders).

**Besluit:** onder **75 % bepaalde onderdelen** toont de admin een amber "Let op" in de
publiceerpoort en `n/m` naast de score in de lijst. Publiceren blijft mogelijk.

- Afgewezen: harde drempel "minstens 4 van 5". Redenen: (1) legitieme producten hebben weinig
  bepaalbare onderdelen (stof zonder EU-claim én onzekere dosis); (2) de publieke productpagina
  meldt al "Deze score gaat over N van de M onderdelen", dus de lezer wordt niet misleid;
  (3) de scoreonderdelen worden mogelijk nog aangepast en een absoluut aantal breekt dan.
- De drempel is bewust **relatief** (`SCORE_COVERAGE_ADVICE_BELOW` in `publish-gate.ts`).
- Heroverwegen als: er in de praktijk producten met dunne dekking bovenaan een categorie
  belanden. Dan eerst de publieke rangschikking bekijken (toon dekking bij de score / sorteer
  volledige scores voor), niet meteen de poort verharden.

## 4. Bewust buiten scope (open)

- **De hub `/supplementen`, `/product/[slug]` en `product-catalog.ts` lezen nog uit statische
  bestanden.** Een in de admin aangemaakt product verschijnt op `/beste/<categorie>` (DB-loader)
  maar nog niet op de hub of als productpagina. Aparte, riskantere plak: raakt live pagina's.
- Afbeeldingen uploaden: bestanden moeten nu via de repo in `public/images/producten/` staan.
  Het admin-scherm controleert alleen naam, bestaan en licentie-notitie.
- Import: vaste kolommen, geen mapping van willekeurige leveranciersfeeds; geen EAN-dubbeldetectie
  (de catalogus heeft geen EAN-kolom).
- Retailers: `relationship` (direct/netwerk) is niet bewerkbaar; het bepaalt het meetpad
  (`click_token` of netwerk-subid). Contract, cookieduur en commissie blijven uitsluitend in PartnerDesk.

## 5. Geen persoonsgegevens, geen verwerkersovereenkomst nodig

Het productbeheer is admin-only en bevat geen persoonsgegevens; er komt geen nieuwe verwerker bij.
De PartnerDesk-omzetsectie (§G, PR #58) slaat alleen zakelijke conversiegegevens op (bedragen,
externe ID's, click_token zonder IP of sessie); zie `docs/partners/SPEC_CLICK_TOKEN_TRACKING.md` §6.
