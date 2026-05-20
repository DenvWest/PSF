# COMPLIANCE — PerfectSupplement

> **Layer 1 — Core.** Juridische regels die op ELKE pagina gelden.

---

## Kernregel

PerfectSupplement vergelijkt en adviseert, maar verkoopt niet. Toch geldt de Claimsverordening (EU 1924/2006) omdat affiliate links als reclame tellen.

**Geen medische claims — altijd "adviezen, geen diagnoses".**

---

## EFSA-goedgekeurde claims per supplement

### Magnesium ✅
- Draagt bij tot de normale werking van het zenuwstelsel
- Draagt bij tot de normale spierfunctie
- Draagt bij tot de vermindering van vermoeidheid
- Draagt bij tot een normale psychologische functie
- *Voorwaarde: minimaal 56,25 mg per dagdosis (15% RI)*

### EPA/DHA — Omega-3 ✅
- EPA en DHA dragen bij tot de normale werking van het hart *(bij 250 mg EPA+DHA/dag)*
- DHA draagt bij tot normale hersenfunctie *(bij 250 mg DHA/dag)*
- DHA draagt bij tot normaal gezichtsvermogen *(bij 250 mg DHA/dag)*
- **Geen goedgekeurde claim voor "energie" of "vermoeidheid"**

### Vitamine D ✅
- Draagt bij tot normale werking van het immuunsysteem
- Draagt bij tot instandhouding van normale botten
- Draagt bij tot instandhouding van normale spierfunctie

### Zink ✅
- Draagt bij tot een normale werking van het immuunsysteem
- Draagt bij tot instandhouding van normaal testosterongehalte in het bloed
- Draagt bij tot een normale vruchtbaarheid en voortplanting

### Creatine ✅
- Creatine verhoogt de fysieke prestatie bij opeenvolgende korte, intensieve inspanningen *(bij 3g/dag)*

### Ashwagandha ⚠️ ON-HOLD
- Geen goedgekeurde EFSA-claim. Alle claims staan "on hold" (botanicals)
- On-hold claims mogen voorlopig gebruikt worden mits: claim is ingediend bij EFSA, onderbouwing aannemelijk, disclaimer aanwezig
- **Risico:** VWS overweegt verbod in NL (RIVM-advies, besluit verwacht medio 2026). Denemarken heeft verboden sinds april 2023.
- **Uitgesloten van Foundation Stack** — geen EFSA approval, regulatory risk

## Claim-regels voor code

| Situatie | Regel |
|---|---|
| Vergelijkingspagina's | EFSA-bewoording letterlijk of in alternatieve bewoording, juiste ingredient + dosering |
| Intake-resultaten | "Overweeg magnesium" = advies, geen diagnose. Taal binnen EFSA-kaders |
| Blogposts | Fysiologie is OK, maar zodra een supplement als oplossing wordt genoemd → EFSA-regels |
| On-hold claims | Altijd met disclaimer: "Dit is geen goedgekeurde gezondheidsclaim" |
| EFSA-tekst in code | **Letterlijk bewaren** — niet herschrijven bij refactoring |

---

## AVG / Privacy

- Geen account-systeem (drempel te hoog, e-mail volstaat)
- Consent management op elke pagina met cookie-opslag
- Unsubscribe flow in elke nurture email
- Analytics anonymization
- Tracking disclosure: transparant over wat wordt opgeslagen
- E-mail permissions: opt-in bij intake completion

## Affiliate disclosure

- Op elke vergelijkingspagina: zichtbare affiliate-disclaimer
- Affiliate links: `rel="noopener noreferrer sponsored"`
- Affiliate links NOOIT in blogposts, alleen op vergelijkingspagina's

## Medische disclaimers

- `MedicalDisclaimer` component op alle vergelijkings- en profielpagina's
- Profiel-specifieke disclaimers waar relevant (zie `core/PERSONALIZATION_ENGINE.md`)
- "Dit is geen medisch advies" — altijd

---

*Laatst bijgewerkt: mei 2026*
