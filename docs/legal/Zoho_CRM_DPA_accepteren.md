# Zoho CRM — Data Processing Addendum accepteren

**Versie 1.0 — 4 juli 2026**  
**Verwerker:** Zoho Corporation · EU-datacenter (`zohoapis.eu`)  
**Gebruik bij PerfectSupplement:** contactformulier → CRM-leads (`src/app/api/contact/route.ts`)

> Na acceptatie: PDF/screenshot archiveren als  
> `Documenten/documenten/perfectsupplement/privacy/dpa/Zoho_CRM_DPA_geaccepteerd_[YYYY-MM-DD].pdf`  
> en registerregel in `docs/core/VERWERKINGSREGISTER.md` bijwerken.

---

## Waarom dit nodig is

Zoho CRM verwerkt persoonsgegevens (naam, e-mail, bericht) namens PerfectSupplement. Bij vrijwillige health-informatie in het berichtveld kan art. 9 AVG van toepassing zijn. Een verwerkersovereenkomst (art. 28 AVG) is verplicht vóór of bij start van de verwerking.

---

## Stappen (Zoho-organisatiebeheerder)

1. Log in op [accounts.zoho.eu](https://accounts.zoho.eu) met het admin-account van de CRM-organisatie.
2. Klik rechtsboven op je profielfoto → **My Account**.
3. Ga naar **Preferences** → tab **Privacy**.
4. Onder **Data Processing Addendum** → klik **Initiate Now**.
5. Selecteer de organisatie die CRM gebruikt voor PerfectSupplement.
6. Volg de e-mailflow: document lezen → voorwaarden accepteren → digitaal ondertekenen → **Finish**.
7. Download of exporteer het ondertekende DPA-document (PDF) uit het Zoho-portaal.

**Alternatief:** mail `legal@zohocorp.com` met vermelding van je EU-datacenter en organisatie-ID als de portal-flow niet beschikbaar is.

---

## Archiveren (na acceptatie)

```bash
# Voorbeeld — pas datum aan
cp ~/Downloads/Zoho_DPA.pdf \
  ~/Documenten/documenten/perfectsupplement/privacy/dpa/Zoho_CRM_DPA_geaccepteerd_2026-07-04.pdf
```

Werk daarna het verwerkingsregister bij:

| Veld | Waarde |
|---|---|
| Status | Geaccepteerd [datum] |
| Locatie data | EU |
| Archief | `dpa/Zoho_CRM_DPA_geaccepteerd_[datum].pdf` |

Voeg een regel toe aan de wijzigingslog in `VERWERKINGSREGISTER.md`.

---

## Verificatie

- [ ] DPA geïnitieerd en afgerond in Zoho Admin
- [ ] PDF in `privacy/dpa/` geplaatst
- [ ] Registerregel Zoho CRM bijgewerkt (status + archiefpad)
- [ ] DPIA §1.4 en checklist §6 Zoho-regel op "gearchiveerd" gezet
- [ ] `privacy/INDEX.md` bijgewerkt
