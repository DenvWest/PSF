/**
 * Zoekintentie-gedreven alt-teksten en captions voor kennisbank-afbeeldingen.
 * Eén bron voor cover + inline; afgestemd op NL-zoekvragen rond supplementen en gezondheid.
 */
export interface KennisbankImageSeo {
  /** Korte beschrijving voor screenreaders en image search (~80–125 tekens). */
  coverAlt: string;
  /** Figcaption onder de cover; mag de zoekvraag beantwoorden. */
  coverCaption: string;
  /** Optionele title op het img-element (tooltip + extra signaal). */
  coverTitle: string;
  inlineAlt: string;
  inlineCaption: string;
  /** Zoektermen voor metadata keywords (max. 5, geen stuffing). */
  searchPhrases: string[];
}

const KENNISBANK_IMAGE_SEO: Record<string, KennisbankImageSeo> = {
  biobeschikbaarheid: {
    coverAlt:
      "Biobeschikbaarheid van supplementen — tomaten als voorbeeld van opneembare voedingsstoffen",
    coverCaption:
      "Biobeschikbaarheid zegt hoeveel van een stof je lichaam opneemt; bij supplementen verschilt dat sterk per vorm.",
    coverTitle: "Wat is biobeschikbaarheid bij supplementen?",
    inlineAlt:
      "Voedingsstoffen uit fruit — biobeschikbaarheid van natuurlijke bronnen versus capsules",
    inlineCaption:
      "Niet alles wat op het etiket staat komt in je bloed aan; biobeschikbaarheid is de maat voor wat je lichaam echt gebruikt.",
    searchPhrases: [
      "biobeschikbaarheid supplement",
      "wat is biobeschikbaarheid",
      "opname supplement lichaam",
    ],
  },
  chelaatvorm: {
    coverAlt:
      "Chelaatvorm mineralen — paddenstoelen en groenten als mineraalrijke voeding",
    coverCaption:
      "Een chelaatvorm bindt een mineraal aan een aminozuur; dat kan de opname in de darm verbeteren ten opzichte van oxide.",
    coverTitle: "Chelaatvorm magnesium en zink uitgelegd",
    inlineAlt:
      "Amandelen als mineraalrijke voeding — chelaatvorm versus gewone mineralen",
    inlineCaption:
      "Magnesiumbisglycinaat en zinkpicolinaat zijn chelaten; oxide is goedkoper maar wordt vaak minder goed opgenomen.",
    searchPhrases: ["chelaatvorm magnesium", "wat is chelaatvorm", "mineraal opname supplement"],
  },
  adaptogens: {
    coverAlt:
      "Adaptogens en adaptogenen — gedroogde kruiden op houten lepels bij daglicht",
    coverCaption:
      "Adaptogenen zijn plantenextracten die in onderzoek rond stressadaptatie voorkomen — geen bewezen wondermiddelen.",
    coverTitle: "Wat zijn adaptogenen?",
    inlineAlt:
      "Kamille en lavendel als adaptogene kruiden in natuurlijk licht",
    inlineCaption:
      "Ashwagandha en vergelijkbare kruiden worden adaptogeen genoemd; kwaliteit en dosering op het etiket tellen zwaar.",
    searchPhrases: ["adaptogenen supplement", "wat zijn adaptogens", "ashwagandha adaptogeen"],
  },
  "epa-dha": {
    coverAlt:
      "EPA en DHA omega-3 — gegrilde zalmfilet als natuurlijke bron van vetzuren",
    coverCaption:
      "EPA en DHA zijn de omega-3-vetzuren waarop EU-claims en doseringen zijn gebouwd — niet elke visolie levert genoeg.",
    coverTitle: "EPA en DHA: het verschil bij omega-3",
    inlineAlt:
      "Vette visfilet — bron van EPA en DHA omega-3-vetzuren",
    inlineCaption:
      "Bij omega-3 telt de som van EPA plus DHA per dag, niet het aantal capsules of milliliters visolie.",
    searchPhrases: ["epa dha verschil", "omega 3 epa dha", "hoeveel epa dha per dag"],
  },
  "circadiaan-ritme": {
    coverAlt:
      "Circadiaan ritme en licht — ochtendzon boven een rustig landschap",
    coverCaption:
      "Je circadiaan ritme koppelt slaap, hormonen en energie aan licht; avondlicht kan melatonine onderdrukken.",
    coverTitle: "Circadiaan ritme en slaap uitgelegd",
    inlineAlt:
      "Zonsondergang en het dag-nachtritme — circadiaan ritme en melatonine",
    inlineCaption:
      "Een vast slaap-wakkeritme en ochtendlicht helpen je biologische klok; supplementen vervangen dat niet.",
    searchPhrases: ["circadiaan ritme", "biologische klok slaap", "ritme verstoren avondlicht"],
  },
  adh: {
    coverAlt:
      "ADH aanbevolen dagelijkse hoeveelheid — glas water bij daglicht",
    coverCaption:
      "ADH staat voor Aanbevolen Dagelijkse Hoeveelheid: de referentie op etiketten, niet de dosis uit onderzoek.",
    coverTitle: "ADH supplement: wat betekent het op het etiket?",
    inlineAlt:
      "Water en hydratatie — ADH als referentie voor vitamines en mineralen",
    inlineCaption:
      "De ADH op een potje is vaak lager dan wat studies gebruiken; voor effect kijk je naar onderzoeksdoses en status.",
    searchPhrases: ["adh supplement", "aanbevolen dagelijkse hoeveelheid", "adh vitamine d"],
  },
  "efsa-claims": {
    coverAlt:
      "EFSA gezondheidsclaims — boekenkast als naslag bij goedgekeurde supplementclaims",
    coverCaption:
      "EFSA-claims zijn vooraf goedgekeurde gezondheidsuitspraken; wat niet op de EU-lijst staat mag een merk niet beloven.",
    coverTitle: "EFSA-claims op supplementen",
    inlineAlt:
      "Notitieboek bij claims — welke gezondheidsuitspraken EFSA toestaat",
    inlineCaption:
      "Een claim op de voorkant moet op de goedgekeurde lijst staan én de dosering op de achterkant moet de drempel halen.",
    searchPhrases: ["efsa claims supplement", "goedgekeurde gezondheidsclaims", "eu supplement claims"],
  },
  "derde-partij-testen": {
    coverAlt:
      "Derde-partij testen supplement — reageerbuizen in een laboratoriumrek",
    coverCaption:
      "Derde-partij testen laat een onafhankelijk lab controleren of inhoud en etiket kloppen — los van de fabrikant.",
    coverTitle: "Derde-partij testen bij supplementen",
    inlineAlt:
      "Microscoop en reageerbuizen — onafhankelijke kwaliteitscontrole van supplementen",
    inlineCaption:
      "NSF, Informed Sport en vergelijkbare keurmerken zijn vormen van externe controle; zonder publicatie zie je het niet.",
    searchPhrases: [
      "derde partij testen supplement",
      "onafhankelijk lab supplement",
      "supplement kwaliteit testen",
    ],
  },
  slaaphygiene: {
    coverAlt:
      "Slaaphygiëne tips — net opgemaakt bed in een rustige slaapkamer",
    coverCaption:
      "Slaaphygiëne omvat licht, schermen, temperatuur en een vast ritme — de basis vóór je aan melatonine denkt.",
    coverTitle: "Slaaphygiëne voor betere nachtrust",
    inlineAlt:
      "Rustige slaapkamer met strak linnengoed — gewoontes voor slaaphygiëne",
    inlineCaption:
      "Vaste bedtijden en een donkere, koele kamer verbeteren slaapkwaliteit sterker dan een los supplement.",
    searchPhrases: ["slaaphygiëne tips", "betere slaap gewoontes", "slaapritme verbeteren"],
  },
  "eiwitbehoefte-na-40": {
    coverAlt:
      "Eiwitbehoefte na 40 — eiwitrijke maaltijd met vis, groenten en peulvruchten",
    coverCaption:
      "Na je veertigste stijgt de eiwitbehoefte voor spierbehoud; verdeel eiwit over de dag in plaats van één grote portie.",
    coverTitle: "Hoeveel eiwit na 40 per dag?",
    inlineAlt:
      "Eiwitrijke lunch met vis en groenten — eiwitbehoefte voor mannen en vrouwen na 40",
    inlineCaption:
      "Richtlijn: ongeveer 1,2–1,6 g eiwit per kilo lichaamsgewicht per dag, met 25–40 g per maaltijd bij krachttraining.",
    searchPhrases: [
      "eiwitbehoefte na 40",
      "hoeveel eiwit per dag man",
      "eiwit spierbehoud ouderen",
    ],
  },
  "kalium-natrium-balans": {
    coverAlt:
      "Kalium-natrium balans — verse groenten en fruit op een snijplank",
    coverCaption:
      "Meer kalium uit groenten en fruit helpt de natrium-kaliumbalans; bloeddruk reageert op het geheel, niet op één snuf zout.",
    coverTitle: "Kalium en natrium: verhouding en bloeddruk",
    inlineAlt:
      "Tomaat, avocado en bladgroen — kaliumrijke voeding voor de natrium-balans",
    inlineCaption:
      "Minder zout alleen is zelden genoeg; extra groenten leveren kalium dat de balans ten goede kan keren.",
    searchPhrases: ["kalium natrium balans", "zout kalium bloeddruk", "kalium tekort voeding"],
  },
  healthspan: {
    coverAlt:
      "Healthspan en vitaliteit — naaldbos van boven, symbool voor gezonde levensjaren",
    coverCaption:
      "Healthspan is de periode waarin je vitaal functioneert — langer dan alleen het aantal levensjaren.",
    coverTitle: "Wat is healthspan?",
    inlineAlt:
      "Bospad en hangbrug — beweging en verbinding voor een langere healthspan",
    inlineCaption:
      "Slaap, beweging en sociale verbinding wegen zwaarder voor healthspan dan losse longevity-supplementen.",
    searchPhrases: ["healthspan betekenis", "gezond ouder worden", "levenskwaliteit oudere"],
  },
  "hpa-as": {
    coverAlt:
      "HPA-as en stress — herfstbosweg als beeld voor chronische stressbelasting",
    coverCaption:
      "De HPA-as koppelt hersenen, hypofyse en bijnieren; chronische stress houdt dit systeem langer actief.",
    coverTitle: "HPA-as uitgelegd bij stress",
    inlineAlt:
      "Mistig bos — HPA-as en langdurige stressreactie",
    inlineCaption:
      "Cortisol hoort ’s ochtends te pieken; een vlak of omgekeerd ritme past bij aanhoudende stress of slaaptekort.",
    searchPhrases: ["hpa as stress", "hpa as cortisol", "stress hormoon as"],
  },
  cortisol: {
    coverAlt:
      "Cortisol en ontspanning — kruidenthee in een glazen mok bij daglicht",
    coverCaption:
      "Cortisol piekt normaal in de ochtend; chronisch hoge waarden passen bij stress, slaaptekort of overtraining.",
    coverTitle: "Cortisol: stresshormoon en dagritme",
    inlineAlt:
      "Thee bij het raam — cortisol verlagen met rust en slaaphygiëne",
    inlineCaption:
      "Cortisol verlagen lukt niet met één supplement; slaap, grenzen en herstel zijn de eerste stappen.",
    searchPhrases: ["cortisol verlagen", "cortisol hoog symptomen", "cortisol slaap"],
  },
  melatonine: {
    coverAlt:
      "Melatonine en slaapritme — sterrenhemel boven een rustig landschap",
    coverCaption:
      "Melatonine signaleert duisternis aan je brein; fel avondlicht en schermen verstoren die aanmaak.",
    coverTitle: "Melatonine: wanneer wel en niet innemen?",
    inlineAlt:
      "Nachtelijke hemel — natuurlijke melatonine en het licht-donkerritme",
    inlineCaption:
      "Melatonine helpt soms bij jetlag of ritmeverstoring; voor chronische slaapproblemen is gedrag vaak effectiever.",
    searchPhrases: ["melatonine innemen", "melatonine slaap", "melatonine bijwerkingen"],
  },
  mitochondrien: {
    coverAlt:
      "Mitochondriën en energie — alpenmeer en bergen als symbool voor cellulaire kracht",
    coverCaption:
      "Mitochondriën maken ATP uit voeding en zuurstof — de energiecentrales van vrijwel elke cel.",
    coverTitle: "Mitochondriën: wat doen ze in je lichaam?",
    inlineAlt:
      "Zonlicht door bomen — mitochondriale functie en zuurstofgebruik",
    inlineCaption:
      "Beweging en slaap ondersteunen mitochondriale gezondheid; supplementclaims lopen vaak voor op het bewijs uit.",
    searchPhrases: ["mitochondriën functie", "mitochondriën energie", "cellulaire energie"],
  },
  "nervus-vagus": {
    coverAlt:
      "Nervus vagus en rust — houten hangbrug door een donker naaldbos",
    coverCaption:
      "De nervus vagus is de grote rem van je stresssysteem; trage uitademing kan hem activeren.",
    coverTitle: "Nervus vagus stimuleren met ademhaling",
    inlineAlt:
      "Besneeuwde bergen bij nacht — kalmeren via de nervus vagus",
    inlineCaption:
      "Ademhaling, sociale verbinding en slaap activeren de vagusbundel effectiever dan de meeste supplementen.",
    searchPhrases: ["nervus vagus", "vagus zenuw ontspanning", "vagus ademhaling"],
  },
  atp: {
    coverAlt:
      "ATP en kracht — halterschijven als symbool voor celulaire energie bij training",
    coverCaption:
      "ATP is de directe energiemunt van de cel; creatine helpt die voorraad sneller aanvullen bij herhaalde inspanning.",
    coverTitle: "ATP: energie voor spieren en brein",
    inlineAlt:
      "Halterrek in een lege sportschool — ATP en herstel na krachttraining",
    inlineCaption:
      "Creatine vult de ATP-voorraad aan; het vervangt geen slaap, voeding of training.",
    searchPhrases: ["atp energie", "atp creatine", "energie spier cel"],
  },
  testosteron: {
    coverAlt:
      "Testosteron en training — halter in een lege sportschool",
    coverCaption:
      "Testosteron ondersteunt spier, libido en herstel; slaap en overgewicht wegen zwaarder dan de meeste pillen.",
    coverTitle: "Testosteron na 30: wat verandert?",
    inlineAlt:
      "Berglandschap — vitaliteit en hormoonbalans bij testosteron",
    inlineCaption:
      "Krachttraining en voldoende slaap ondersteunen testosteron; supplementen met grote claims zijn zelden bewezen.",
    searchPhrases: ["testosteron laag man", "testosteron verhogen natuurlijk", "testosteron na 40"],
  },
  slaapschuld: {
    coverAlt:
      "Slaapschuld herstellen — opgevouwen linnengoed op een bed bij daglicht",
    coverCaption:
      "Slaapschuld bouwt op bij structureel te kort slapen; een weekend uitslapen lost dat niet volledig in.",
    coverTitle: "Wat is slaapschuld en hoe herstel je?",
    inlineAlt:
      "Onopgemaakt bed — slaapschuld en vermoeidheid na korte nachten",
    inlineCaption:
      "Consistente bedtijden en minder schermlicht ’s avonds zijn effectiever dan extra slaapmiddelen.",
    searchPhrases: ["slaapschuld", "slaaptekort herstellen", "te weinig slaap gevolgen"],
  },
  "sociale-verbinding": {
    coverAlt:
      "Sociale verbinding en gezondheid — koffie op een cafétafel",
    coverCaption:
      "Sociale verbinding is een van de sterkste voorspellers van herstel en levensduur, naast slaap en beweging.",
    coverTitle: "Sociale verbinding en longevity",
    inlineAlt:
      "Cappuccino op hout — ontmoeting en sociale steun voor herstel",
    inlineCaption:
      "Eenzaamheid verhoogt stress en verlaagt herstel; relaties zijn geen luxe maar onderdeel van gezondheid.",
    searchPhrases: ["sociale verbinding gezondheid", "eenzaamheid stress", "sociaal netwerk longevity"],
  },
  magnesiumvormen: {
    coverAlt:
      "Magnesiumvormen vergeleken — bladgroenten en zaden op een werkblad",
    coverCaption:
      "Magnesiumoxide, citraat en bisglycinaat verschillen in opname en darmtolerantie — niet inwisselbaar op het etiket.",
    coverTitle: "Magnesiumvormen: oxide, citraat of bisglycinaat?",
    inlineAlt:
      "Boerenkool en spruitjes — magnesium uit voeding naast supplementvormen",
    inlineCaption:
      "Bisglycinaat is voor velen rustiger voor de darm; oxide is goedkoop maar wordt slecht opgenomen.",
    searchPhrases: [
      "magnesiumvormen verschil",
      "magnesium bisglycinaat of citraat",
      "beste magnesium vorm",
    ],
  },
  overtrainingssyndroom: {
    coverAlt:
      "Overtraining en herstel — stil dennenbos als teken van rust na te veel belasting",
    coverCaption:
      "Overtrainingssyndroom is meer dan moe na sport: prestatie, slaap en stemming zakken wekenlang in.",
    coverTitle: "Overtrainingssyndroom: signalen en herstel",
    inlineAlt:
      "Stille kust — herstel na overtraining en te veel volume",
    inlineCaption:
      "Meer training is niet altijd beter; deload-weken en slaap zijn de eerste herstelstappen bij overtraining.",
    searchPhrases: ["overtraining symptomen", "overtrainingssyndroom", "te veel sporten herstel"],
  },
  "vitamine-d": {
    coverAlt:
      "Vitamine D en zonlicht — zon op zee bij helder weer",
    coverCaption:
      "Vitamine D ontstaat in de huid onder uv-B; in Nederland is dat een seizoensgebonden proces van april tot september.",
    coverTitle: "Vitamine D tekort en zon in Nederland",
    inlineAlt:
      "Zonsondergang boven zee — vitamine D uit zonlicht en seizoenen",
    inlineCaption:
      "In de winter is de zon in Nederland te zwak; dan is voeding of supplement de enige bron.",
    searchPhrases: ["vitamine d tekort", "vitamine d zon", "vitamine d supplement wanneer"],
  },
  "vitamine-k2": {
    coverAlt:
      "Vitamine K2 uit voeding — gestapelde kazen als gefermenteerde bron",
    coverCaption:
      "Vitamine K2 zit in gefermenteerde voeding en helpt calcium naar bot in plaats van naar de vaatwand.",
    coverTitle: "Vitamine K2: wat mag op het etiket?",
    inlineAlt:
      "Blauwe kaas — natuurlijke vitamine K2-bron naast supplementen",
    inlineCaption:
      "K2 MK-7 en MK-4 verschillen in halfwaardetijd; combineer met vitamine D alleen op gemeten indicatie.",
    searchPhrases: ["vitamine k2", "vitamine k2 en d samen", "vitamine k2 voeding"],
  },
  "vitamine-d-inname": {
    coverAlt:
      "Vitamine D innemen met vet — fles olijfolie op een houten plank",
    coverCaption:
      "Vitamine D is vetoplosbaar; inname met een vetrijke maaltijd verbetert de opname.",
    coverTitle: "Vitamine D innemen: wanneer en waarmee?",
    inlineAlt:
      "Olijfolie bij daglicht — vet bij vitamine D-suppletie",
    inlineCaption:
      "De dosis hangt af van je bloedwaarde en seizoen, niet van een vaste internetdosis.",
    searchPhrases: [
      "vitamine d innemen wanneer",
      "vitamine d met vet innemen",
      "vitamine d dosering",
    ],
  },
  insulineresistentie: {
    coverAlt:
      "Insulineresistentie en voeding — gebalanceerde maaltijd met vezels en eiwit",
    coverCaption:
      "Insulineresistentie betekent dat cellen trager op insuline reageren; beweging en vezels helpen de gevoeligheid.",
    coverTitle: "Insulineresistentie uitgelegd",
    inlineAlt:
      "Volkoren kom met groenten — voeding bij insulinegevoeligheid",
    inlineCaption:
      "Krachttraining en minder ultrabewerkt eten verbeteren insulinegevoeligheid sterker dan losse supplementen.",
    searchPhrases: ["insulineresistentie", "insulinegevoeligheid verbeteren", "bloedsuiker na 40"],
  },
  "oxidatieve-stress": {
    coverAlt:
      "Oxidatieve stress — berglandschap in helder daglicht",
    coverCaption:
      "Oxidatieve stress is een disbalans tussen vrije radicalen en antioxidanten — training maakt hem tijdelijk, ziekte langer.",
    coverTitle: "Oxidatieve stress: wat betekent het?",
    inlineAlt:
      "Bessen en bladgroenten — antioxidanten uit voeding bij oxidatieve stress",
    inlineCaption:
      "Meer antioxidanten-pillen zijn geen vervanging voor slaap, rookstop en gevarieerde voeding.",
    searchPhrases: ["oxidatieve stress", "vrije radicalen antioxidanten", "oxidatieve stress supplement"],
  },
  multivitamine: {
    coverAlt:
      "Multivitamine of voeding — fruitbowl met seizoensfruit",
    coverCaption:
      "Een multivitamine vult micronutriëntgaten; de basis blijft een gevarieerd voedingspatroon met groenten en vis.",
    coverTitle: "Multivitamine zinvol na 40?",
    inlineAlt:
      "Gevarieerd bord met groenten en vis — voeding vóór een multivitamine",
    inlineCaption:
      "Voor de meeste gezonde volwassenen is een multi geen vervanging van tekorten die je beter gericht aanpakt.",
    searchPhrases: ["multivitamine zinvol", "multivitamine na 40", "multi supplement nodig"],
  },
  "ps-score-model": {
    coverAlt:
      "PS-Score model — notitieboek en pen voor supplementvergelijking",
    coverCaption:
      "De PS-Score weegt dosering, vorm, EU-claims, etikettransparantie en toetsing — open berekend, niet ingetypt.",
    coverTitle: "PS-Score: hoe supplementen worden berekend",
    inlineAlt:
      "Sticky notes op een bureau — scoreonderdelen van het PS-model",
    inlineCaption:
      "Model 1.2.0 herverdeelt gewichten als een onderdeel ontbreekt; prijs zit er bewust niet in.",
    searchPhrases: ["ps score supplement", "supplement score berekenen", "perfect supplement score"],
  },
  scoregewichten: {
    coverAlt:
      "Scoregewichten PS-Score — afgemeten kruiden op een houten lepel",
    coverCaption:
      "Dosering weegt 30%, vorm 25%, claimdekking, transparantie en toetsing elk 15% — bewuste redactionele keuzes.",
    coverTitle: "Scoregewichten in de PS-Score uitgelegd",
    inlineAlt:
      "Bureau met koffie — afweging van scoregewichten bij supplementen",
    inlineCaption:
      "Geen meta-analyse schrijft 30/25/15 voor; de verhouding volgt uit wat bij supplementkwaliteit het meest verschil maakt.",
    searchPhrases: ["ps score gewichten", "scoregewichten supplement", "hoe wordt ps score berekend"],
  },
  onderzoeksdosis: {
    coverAlt:
      "Onderzoeksdosis supplement — houten lepel met afgemeten portie",
    coverCaption:
      "De onderzoeksdosis is de hoeveelheid uit studies — vaak hoger dan de EFSA-claimdrempel op het etiket.",
    coverTitle: "Onderzoeksdosis versus etiketdosering",
    inlineAlt:
      "Gelijke mealprep-porties — onderzoeksdosis en dagelijkse inname vergelijken",
    inlineCaption:
      "Magnesium 200 mg elementair en omega-3 1000 mg EPA+DHA zijn voorbeelden van onderzoeksankers in het PS-model.",
    searchPhrases: ["onderzoeksdosis supplement", "klinische dosis magnesium", "effectieve dosis omega 3"],
  },
  claimdekking: {
    coverAlt:
      "Claimdekking EU — notitieboeken en tablet op een bureau",
    coverCaption:
      "Claimdekking meet hoeveel erkende EU-claims jouw dagdosering ontsluit — vooral relevant bij omega-3 en DHA.",
    coverTitle: "Claimdekking op supplementetiketten",
    inlineAlt:
      "Leeg notitieboek — controleren of claims de dosering dekken",
    inlineCaption:
      "Claim mogen is ja/nee; claimdekking is een percentage — een product kan conform zijn maar weinig claims ontsluiten.",
    searchPhrases: ["claimdekking supplement", "eu gezondheidsclaim dosering", "omega 3 claim dha"],
  },
  etikettransparantie: {
    coverAlt:
      "Etikettransparantie — marktgroenten zonder prijskaarten als metafoor voor open ingrediënten",
    coverCaption:
      "Etikettransparantie vraagt om getallen per stof — geen proprietary blend zonder milligrammen.",
    coverTitle: "Etikettransparantie bij supplementen nakijken",
    inlineAlt:
      "Groenten zonder etiket — volledige ingrediëntenlijst op supplementen",
    inlineCaption:
      "Vier checks: werkzame stof in mg, dagdosering, uitsplitsing per vorm, geen verborgen mengsel.",
    searchPhrases: [
      "etiket supplement lezen",
      "proprietary blend supplement",
      "ingrediëntenlijst supplement",
    ],
  },
  "onafhankelijke-toetsing": {
    coverAlt:
      "Onafhankelijke toetsing — microscoop in close-up zonder personen",
    coverCaption:
      "Onafhankelijke toetsing vraagt om gepubliceerde labresultaten buiten de fabrikant — plus categorie-markers zoals TOTOX.",
    coverTitle: "Onafhankelijke toetsing in de PS-Score",
    inlineAlt:
      "Reageerbuizen in een rek — externe kwaliteitscontrole van supplementen",
    inlineCaption:
      "Getest maar niet gepubliceerd scoort lager dan verdient; wij analyseren (nog) geen potjes zelf.",
    searchPhrases: [
      "onafhankelijke toetsing supplement",
      "labtest supplement publiceren",
      "totox omega 3",
    ],
  },
  "wei-eiwit": {
    coverAlt:
      "Wei-eiwit whey — melk en eieren als natuurlijke eiwitbronnen",
    coverCaption:
      "Wei-eiwit is snel opneembaar en leucinerijk — handig als je bord het dagtotaal niet haalt, niet als vervanging van maaltijden.",
    coverTitle: "Wei-eiwit: wat is whey en wanneer nuttig?",
    inlineAlt:
      "Eiwitrijk ontbijt met eieren — wei-eiwit versus volwaardige maaltijden",
    inlineCaption:
      "Concentraat, isolaat en hydrolysaat verschillen in lactose en prijs; spieropbouw vraagt vooral om totaal eiwit per dag.",
    searchPhrases: ["wei eiwit", "whey eiwit wanneer", "wei eiwit of voeding"],
  },
  leucinedrempel: {
    coverAlt:
      "Leucinedrempel eiwit — feta-salade als eiwitrijke maaltijd",
    coverCaption:
      "De leucinedrempel is de hoeveelheid leucine per maaltijd die spieropbouw op gang brengt — hoger na je veertigste.",
    coverTitle: "Leucinedrempel: hoeveel eiwit per maaltijd?",
    inlineAlt:
      "Avocado-toast met ei — eiwit en leucine per eetmoment",
    inlineCaption:
      "Richtlijn: 2,5–3 g leucine per maaltijd; wei levert dat sneller dan veel plantaardige bronnen in kleinere porties.",
    searchPhrases: ["leucinedrempel", "leucine per maaltijd", "hoeveel eiwit per maaltijd spieropbouw"],
  },
};

/** Thema-hub covers — eigen zoekcontext per kennisbank-cluster. */
const KENNISBANK_THEMA_IMAGE_SEO: Record<string, KennisbankImageSeo> = {
  "lichaam-veroudering": {
    coverAlt:
      "Lichaam en veroudering — bergmeer tussen dennen als symbool voor vitaliteit na 40",
    coverCaption:
      "Begrippen over hormonen, botten en celveroudering — de fysiologie achter supplementkeuzes na 40.",
    coverTitle: "Kennisbank: lichaam en veroudering",
    inlineAlt: "",
    inlineCaption: "",
    searchPhrases: ["veroudering supplementen", "hormonen na 40", "vitamine d ouderen"],
  },
  "leefstijl-herstel": {
    coverAlt:
      "Leefstijl en herstel — onopgemaakt bed in ochtendlicht",
    coverCaption:
      "Slaap, stress en herstel bepalen of supplementen iets toevoegen — leefstijl eerst, poeder daarna.",
    coverTitle: "Kennisbank: leefstijl en herstel",
    inlineAlt: "",
    inlineCaption: "",
    searchPhrases: ["herstel slaap stress", "leefstijl supplementen", "slaap en herstel"],
  },
  supplementwetenschap: {
    coverAlt:
      "Supplementwetenschap — kruidenlepels als beeld bij opname en vorm",
    coverCaption:
      "Biobeschikbaarheid, vormen en claims — hoe je een etiket leest vóór je koopt.",
    coverTitle: "Kennisbank: supplementwetenschap",
    inlineAlt: "",
    inlineCaption: "",
    searchPhrases: ["supplement wetenschap", "supplement etiket uitleg", "biobeschikbaarheid"],
  },
  longevity: {
    coverAlt:
      "Longevity en healthspan — bergmeer in avondlicht",
    coverCaption:
      "Healthspan, oxidatieve stress en sociale verbinding — wat onderzoek zegt over langer vitaal leven.",
    coverTitle: "Kennisbank: longevity",
    inlineAlt: "",
    inlineCaption: "",
    searchPhrases: ["longevity supplementen", "healthspan", "gezond ouder worden"],
  },
  "ps-score": {
    coverAlt:
      "PS-Score kennisbank — thee en notitieboek bij supplementvergelijking",
    coverCaption:
      "Hoe we supplementen scoren: dosering, claims, transparantie en onafhankelijke toetsing.",
    coverTitle: "Kennisbank: PS-Score methode",
    inlineAlt: "",
    inlineCaption: "",
    searchPhrases: ["ps score uitleg", "supplement vergelijken score", "perfect supplement score"],
  },
};

export function getKennisbankImageSeo(slug: string): KennisbankImageSeo | undefined {
  return KENNISBANK_IMAGE_SEO[slug] ?? KENNISBANK_THEMA_IMAGE_SEO[slug];
}

export function getAllKennisbankImageSeoSlugs(): string[] {
  return [
    ...Object.keys(KENNISBANK_IMAGE_SEO),
    ...Object.keys(KENNISBANK_THEMA_IMAGE_SEO),
  ];
}
