# GA4 account hardening — verificatiechecklist

**Property:** `G-EVHN1F8ZQW` (PerfectSupplement)  
**Laatst gecontroleerd:** 2026-07-16  
**DPA:** geaccepteerd 23-11-2022 — archief `dpa/Google_Analytics_DPA_geaccepteerd_2026-07-04.png`

Gebruik deze checklist in [Google Analytics](https://analytics.google.com/) → Admin. Code-side mitigatie (consent-gate, geen health data) staat al in de repo; dit zijn **accountinstellingen** die alleen in GA4 zelf te wijzigen zijn.

---

## 1. Accountland

| Instelling | Gewenst | Gecontroleerd |
|---|---|---|
| Account → Accountinstellingen → **Land** | **Nederland** | [x] |

---

## 2. Gegevens delen (uit)

Admin → Accountinstellingen → **Gegevens delen en -verzameling**:

| Instelling | Gewenst | Gecontroleerd |
|---|---|---|
| Google-producten en -services | **Uit** (of minimaal) | [x] |
| Modellering | **Uit** | [x] |
| Technische ondersteuning | Naar behoefte (mag aan voor support) | [x] |
| Accountspecialisten | **Uit** | [x] |
| Aanbevelingen voor uw bedrijf | **Uit** | [x] |

---

## 3. Bewaartermijn events

Admin → Property → **Gegevensretentie**:

| Instelling | Gewenst | Gecontroleerd |
|---|---|---|
| Bewaartermijn voor eventgegevens | **14 maanden** | [x] |
| Gegevens van terugkerende gebruikers resetten | **Uit** (tenzij bewuste keuze) | [x] |

---

## 4. DPA (reeds afgerond)

| Instelling | Status |
|---|---|
| Accountinstellingen → Gegevensverwerking → DPA | Geaccepteerd **23-11-2022** |
| Bewijs | `Documenten/.../privacy/dpa/Google_Analytics_DPA_geaccepteerd_2026-07-04.png` |

---

## Na verificatie

1. Vul **Laatst gecontroleerd** bovenaan in.
2. Voeg aan wijzigingslog `VERWERKINGSREGISTER.md` toe:  
   `| [datum] | GA4 account hardening gecontroleerd (land NL, delen uit, retentie 14m) |`
3. Screenshot optioneel archiveren in `privacy/dpa/` als bewijs van retentie-instelling.
