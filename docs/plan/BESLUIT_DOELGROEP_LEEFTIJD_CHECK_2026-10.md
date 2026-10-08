# Besluit: doelgroep blijft 30+, de check meet vanaf 18

- **Datum:** 8 oktober 2026
- **Status:** besloten (Dennis, 8 okt: "klopt"), bouw nog niet gedaan
- **Bouwt voort op:** de doelgroepverbreding van 23 sep naar "mannen en vrouwen 30+" (`BESLUIT_IJZER_CALCIUM_2026-09.md`), het open punt "band 55+" in `BESLUIT_KERNSTOF_NORMEN_2026-10.md`

## Aanleiding

Dennis overwoog de site en de CTA's ("Voeding na 30") naar 18+ te verschuiven, omdat de check alcohol meeweegt.

## Besluit

1. **De doelgroep en de copy blijven 30+.** Positionering, content, supplementkeuze en CTA-teksten ("Voeding na 30") veranderen niet. De problemen waar de site op draait (slaap, stress, herstel, overgang) spelen vooral vanaf 30. Een bredere doelgroep maakt de boodschap minder scherp en levert geen aantoonbare conversie op.
2. **Alcohol bepaalt een ondergrens, geen doelgroep.** Omdat de check alcohol meeweegt, is 18 de harde minimumleeftijd voor de check.
3. **De check meet vanaf 18.** De leeftijdsvraag begint nu bij "30–34" (`src/data/intake-questions.ts`), dus iemand van 25 kan zijn of haar leeftijd niet invullen. Er komt een band voor 18–29, zodat de normen voor jonge volwassenen kloppen (calcium 1000 mg tot 25, GR 2018).
4. **Samen met de band "55+".** Die band kan 65+ en 70+ niet onderscheiden (vitamine D 20 µg en calcium 1200 mg vanaf 70, eiwitondergrens vanaf 65). Beide wijzigingen raken dezelfde vraag en worden samen gebouwd.

## Afgewezen

- **Site en CTA's naar 18+:** zie punt 1. Alcohol is een reden voor een minimumleeftijd, niet voor een andere doelgroep.

## Open (bij de bouw)

- De precieze banden: één band "18–29" of "18–24" + "25–29" (calcium wisselt bij 25), en hoe "55+" wordt opgesplitst ("55–64", "65–69", "70+").
- Hoe de minimumleeftijd wordt afgedwongen (keuze "jonger dan 18" die de check netjes stopt, of alleen een vermelding).
- Bestaande sessies met "55+" behouden hun waarde. `age_range` heeft geen check-constraint in de database, dus nieuwe banden vragen geen migratie. Wel nalopen: de code die de banden leest (`voedingsnormen.ts`, `protein-target.ts`, `nutrition-protein-personal.ts`, `account-dashboard.ts`, `approved-claims.ts`).
