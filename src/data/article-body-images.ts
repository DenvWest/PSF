export interface ArticleBodyImage {
  src: string;
  alt: string;
  caption: string;
}

function img(
  folder: "blog" | "kennisbank",
  slug: string,
  alt: string,
  caption: string,
  /** Optional filename stem when it differs from the article slug (e.g. cache-bust `-v2`). */
  fileStem?: string,
): ArticleBodyImage {
  return {
    src: `/images/${folder}/inline/${fileStem ?? slug}.jpg`,
    alt,
    caption,
  };
}

const BLOG_BODY_IMAGES: Record<string, ArticleBodyImage> = {
  "overgang-slaapproblemen-opvliegers": img(
    "blog",
    "overgang-slaapproblemen-opvliegers",
    "Bed met licht beddengoed in een donkere, koele slaapkamer",
    "Een koele slaapkamer met laag-voor-laag beddengoed dempt nachtelijke opvliegers beter dan extra dekens.",
  ),
  "buikvet-cortisol-slaap-mannen": img(
    "blog",
    "buikvet-cortisol-slaap-mannen",
    "Boswandeling in gefilterd licht, minder stress dan een late workout",
    "Voldoende slaap en rustige beweging remmen cortisolgedreven buikvet sterker dan nóg een HIIT-sessie.",
  ),
  "slaapkwaliteit-testosteron-herstel": img(
    "blog",
    "slaapkwaliteit-testosteron-herstel",
    "Opgemaakt bed in een lichte slaapkamer bij daglicht",
    "De hoogste testosteronaanmaak vindt plaats in de vroege, diepe slaap — slaapkwaliteit telt zwaarder dan het aantal uren.",
  ),
  "krachtverlies-eiwitbehoefte-na-40": img(
    "blog",
    "krachtverlies-eiwitbehoefte-na-40",
    "Salade met kaas, noten en groenten als eiwit bij de maaltijd",
    "Oudere spieren hebben meer eiwit per maaltijd nodig om dezelfde opbouwprikkel te bereiken.",
  ),
  "omega-3-hoeveel-per-dag": img(
    "blog",
    "omega-3-hoeveel-per-dag",
    "Potje met gele visolie-softgels naast een kartonnen koker",
    "Hoeveel omega-3 per dag hangt af van EPA en DHA samen, niet van het aantal capsules op het etiket.",
  ),
  "omega-3-uit-voeding-of-supplement": img(
    "blog",
    "omega-3-uit-voeding-of-supplement",
    "Blik sardines met bieslook",
    "Twee porties vette vis per week leveren vaak al wat een visoliecapsule belooft.",
  ),
  "algenolie-of-visolie": img(
    "blog",
    "algenolie-of-visolie",
    "Zeewier in ondiep water, de oorsprong van EPA en DHA in algenolie",
    "Algenolie haalt EPA en DHA bij de bron; visolie volgt dezelfde keten één schakel later.",
  ),
  "omega-3-en-hart-onderzoek": img(
    "blog",
    "omega-3-en-hart-onderzoek",
    "Onderzoeker in een witte jas aan een microscoop",
    "VITAL, REDUCE-IT en STRENGTH vonden niet hetzelfde — dosis, vorm en het labprotocol verschilden.",
  ),
  "hoeveel-magnesium-per-dag": img(
    "blog",
    "hoeveel-magnesium-per-dag",
    "Schaaltjes met verse groenten, bonen en kaas op een saladebar",
    "De ADH telt voeding mee: groene bladgroenten vullen het dagtotaal voordat een poeder dat doet.",
  ),
  "magnesium-uit-voeding": img(
    "blog",
    "magnesium-uit-voeding",
    "Kom met edamame, noten, pitten en mais",
    "Peulvruchten, noten en zaden dragen je magnesium — het potje vult alleen het gat.",
  ),
  "magnesium-en-stress": img(
    "blog",
    "magnesium-en-stress",
    "Zonsondergang boven donkere bergruggen",
    "Stress verhoogt de magnesiumbehoefte; even naar buiten haalt de bron van de spanning niet weg, wel de piek.",
  ),
  "whey-wanneer-wel-en-niet": img(
    "blog",
    "whey-wanneer-wel-en-niet",
    "Zachtgekookt ei in een eierdop naast een sneetje boterham",
    "Whey is handig als je bord het niet redt, niet als vervanging van eieren, kwark of vis.",
  ),
  "whey-en-darmklachten": img(
    "blog",
    "whey-en-darmklachten",
    "Kom verse kwark met een groen takje",
    "Darmklachten bij whey komen vaker van lactose dan van het eiwit zelf — yoghurt of isolaat is een tussenstap.",
  ),
  "whey-hoeveel-en-wanneer": img(
    "blog",
    "whey-hoeveel-en-wanneer",
    "Glas rode bessensmoothie met blauwe bessen en aardbei",
    "De dagtotalen bepalen je spieropbouw; de timing van de shake is de fijnafstelling.",
  ),
  "whey-etiket-lezen": img(
    "blog",
    "whey-etiket-lezen",
    "Leeg spiraalnotitieblok met potlood op een wit bureau",
    "Reken zelf: eiwit per 100 gram poeder en prijs per 100 gram eiwit zeggen meer dan de claim op de voorkant.",
  ),
  "eiwit-en-whey-in-de-overgang": img(
    "blog",
    "eiwit-en-whey-in-de-overgang",
    "Kom met ei, avocado, tomaat en groenten als eiwitrijke maaltijd",
    "In de overgang stijgt de eiwitbehoefte; een vast ontbijt met eiwit is praktischer dan één late shake.",
  ),
  "magnesium-in-combinatie-met-medicijnen": img(
    "blog",
    "magnesium-in-combinatie-met-medicijnen",
    "Magnesiumcapsules naast medicijnblisters en een glas water",
    "Magnesium in combinatie met medicijnen verdient extra aandacht: timing en interacties verschillen per middel.",
  ),
  "multivitamine-zinvol-na-40": img(
    "blog",
    "multivitamine-zinvol-na-40",
    "Schappen met verse groenten in een supermarkt",
    "Een multivitamine vult gaten; de basis blijft een gevarieerd voedingspatroon.",
  ),
  "zout-kalium-bloeddruk-na-40": img(
    "blog",
    "zout-kalium-bloeddruk-na-40",
    "Avocado en gekookt ei op toast met spinazie",
    "Kalium uit groenten en fruit helpt de natrium-kaliumbalans; bloeddruk reageert op het geheel.",
  ),
  "vitamine-d-zon-nederland": img(
    "blog",
    "vitamine-d-zon-nederland",
    "Lage winterzon boven een Nederlandse polder met kanaal",
    "Vitamine D uit zonlicht is in Nederland een seizoensverhaal: van oktober tot maart is de UV-index vaak te laag.",
  ),
  "vitamine-d-hoge-doses-social-media": img(
    "blog",
    "vitamine-d-hoge-doses-social-media",
    "Persoon die buiten een foto maakt met een smartphone",
    "Hoge doses vitamine D op social media klinken overtuigend, maar megadoses vragen om labcontrole — niet om een trend.",
  ),
  "vitamine-d-meten-wanneer-zinvol": img(
    "blog",
    "vitamine-d-meten-wanneer-zinvol",
    "Rek met reageerbuizen met blauwe vloeistof in een laboratorium",
    "Vitamine D meten is zinvol bij klachten of risicofactoren — niet als routineprik zonder vraag.",
  ),
  "vitamine-d-aandoeningen-onderzoek": img(
    "blog",
    "vitamine-d-aandoeningen-onderzoek",
    "Boekenkast met boeken in een bibliotheek",
    "Onderzoek naar vitamine D en aandoeningen is omvangrijk, maar associatie is nog geen behandeladvies.",
  ),
  "vitamine-d-en-slaap": img(
    "blog",
    "vitamine-d-en-slaap",
    "Hotelkamer met opgemaakt bed en daglicht door het raam",
    "Vitamine D en slaap overlappen via seizoen en lichtblootstelling, niet via een snelle slaappil.",
  ),
  "eiwitinname-timing-mannen-40": img(
    "blog",
    "eiwitinname-timing-mannen-40",
    "Mealprep-bakjes met kip, eieren en yoghurt voor eiwit over de dag",
    "Eiwitinname-timing na 30: een portie rond training en bij elke maaltijd is praktischer dan één grote piek.",
  ),
  "eiwit-na-40": img(
    "blog",
    "eiwit-na-40",
    "Kom kwark met bramen als eiwit bij het ontbijt",
    "Eiwit na 30 ondersteunt spierbehoud; de verdeling over de dag telt minstens zo zwaar als het dagtotaal.",
  ),
  "middagdip-bloedsuiker-na-40": img(
    "blog",
    "middagdip-bloedsuiker-na-40",
    "Kop latte met stoom in zacht middaglicht",
    "Een middagdip hangt vaak samen met bloedsuiker: eiwit en vezels dempen de piek na de lunch.",
  ),
  "alcohol-slaap-energie-na-40": img(
    "blog",
    "alcohol-slaap-energie-na-40",
    "Wijnglas op de voorgrond met een slaapkamer en kussen op de achtergrond",
    "Alcohol, slaap en energie: een avondglas of late cafeïne kan inslapen makkelijker maken, maar haalt diepe slaap onderuit.",
  ),
  "vitamine-d-en-energie": img(
    "blog",
    "vitamine-d-en-energie",
    "Wandelaar in een bos met zonlicht tussen de bomen",
    "Vitamine D en energie: een tekort kan moeheid in stand houden, vooral in de donkere maanden.",
  ),
  "cortisol-en-testosteron": img(
    "blog",
    "cortisol-en-testosteron",
    "Donker bos met mist en zacht licht tussen de bomen",
    "Cortisol en testosteron beïnvloeden elkaar: chronische stress kan herstel en spieropbouw onder druk zetten.",
  ),
  "cortisol-verlagen-natuurlijk": img(
    "blog",
    "cortisol-verlagen-natuurlijk",
    "Mistig dennenbos in zacht ochtendlicht",
    "Een stil bos in de mist laat zien hoe cortisol verlagen vaak begint: minder prikkels, meer herstelruimte.",
  ),
  "ademhaling-tegen-stress": img(
    "blog",
    "ademhaling-tegen-stress",
    "Graanveld bij zonsondergang",
    "Ademhaling tegen stress werkt via het autonome zenuwstelsel — een trage uitademing kan de spanning laten zakken.",
  ),
  "stress-werk-grenzen-stellen": img(
    "blog",
    "stress-werk-grenzen-stellen",
    "Lange, lege gang met glazen wanden in een kantoor",
    "Grenzen stellen op het werk begint bij een duidelijk einde van de dag, niet bij nóg een extra taak.",
  ),
  "slaaphygiene-mannen-40-plus": img(
    "blog",
    "slaaphygiene-mannen-40-plus",
    "Ochtendzon langs gordijnen in een slaapkamer met uitzicht",
    "Slaaphygiëne is het geheel van gewoonten rond bed, ochtendlicht en schermen dat de nachtrust draagt.",
  ),
  "ashwagandha-werking-mannen": img(
    "blog",
    "ashwagandha-werking-mannen",
    "Gedroogde ashwagandha-wortelstukken in een keramieken schaal",
    "Ashwagandha wordt onderzocht als adaptogeen; de wortel zelf zegt niets over dosering of productkwaliteit.",
  ),
  "testosteron-en-energie-na-40": img(
    "blog",
    "testosteron-en-energie-na-40",
    "Man loopt door een dicht bos",
    "Testosteron en energie na 30: slaaptekort en overtraining drukken vaak harder dan één bloedwaarde.",
  ),
  "energie-verhogen-natuurlijk": img(
    "blog",
    "energie-verhogen-natuurlijk",
    "Wandelaar met rugzak op een bospad",
    "Energie verhogen na 30 lukt vaker met beweging, slaap en voeding dan met een snelle stimulant.",
  ),
  "wat-is-omega-3": img(
    "blog",
    "wat-is-omega-3",
    "Open zee als herkomst van EPA en DHA, of je nu vis of algen kiest",
    "Wat is omega-3: het gaat om EPA en DHA uit vis of algen, niet om elk plantaardig oliezuur op een etiket.",
  ),
  "beste-omega-3-supplement": img(
    "blog",
    "beste-omega-3-supplement",
    "Zeewier onder water, dezelfde EPA en DHA-keten als in visolie",
    "Het beste omega-3-supplement herken je aan EPA+DHA per capsule, oxidatie en een leesbaar etiket.",
    "beste-omega-3-supplement-v2",
  ),
  "beste-magnesium": img(
    "blog",
    "beste-magnesium",
    "Kleurrijke salade met spinazie, radijs, wortel en komkommer",
    "Het beste magnesium hangt af van het doel: bisglycinaat, citraat of tauraat zijn niet inwisselbaar.",
  ),
};

const KENNISBANK_BODY_IMAGES: Record<string, ArticleBodyImage> = {
  biobeschikbaarheid: img(
    "kennisbank",
    "biobeschikbaarheid",
    "Abrikozen op een snijplank bij daglicht",
    "Biobeschikbaarheid zegt hoeveel van een stof het lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.",
  ),
  chelaatvorm: img(
    "kennisbank",
    "chelaatvorm",
    "Amandelen op een lichte ondergrond",
    "Een chelaatvorm bindt een mineraal aan een aminozuur, wat de opname in de darm kan veranderen.",
  ),
  adaptogens: img(
    "kennisbank",
    "adaptogens",
    "Gedroogde kamille en lavendel op houten lepels",
    "Adaptogenen zijn plantenextracten die in onderzoek duiken rond stressadaptatie — geen wondermiddelen.",
  ),
  "epa-dha": img(
    "kennisbank",
    "epa-dha",
    "Vette visfilet met schilferige structuur op een bord",
    "EPA en DHA zijn de omega-3-vetzuren waarop de meeste claims en doseringen zijn gebouwd.",
  ),
  "circadiaan-ritme": img(
    "kennisbank",
    "circadiaan-ritme",
    "Ochtendzon boven een stil meer",
    "Het circadiaan ritme is de interne 24-uursklok die slaap, hormonen en energie aan licht koppelt.",
  ),
  adh: img(
    "kennisbank",
    "adh",
    "Glas helder water op een houten tafel",
    "ADH (antidiuretisch hormoon) regelt hoeveel water de nieren vasthouden — relevant bij dorst en nachtelijke toiletbezoeken.",
  ),
  "efsa-claims": img(
    "kennisbank",
    "efsa-claims",
    "Leeg notitieboek op een bureau zonder leesbare tekst",
    "EFSA-claims zijn goedgekeurde gezondheidsclaims; wat niet op de lijst staat, mag een merk niet zomaar beloven.",
  ),
  "derde-partij-testen": img(
    "kennisbank",
    "derde-partij-testen",
    "Microscoop met reageerbuizen, zonder persoon in beeld",
    "Derde-partij-testen laten een onafhankelijk lab het product controleren, los van de fabrikant.",
  ),
  slaaphygiene: img(
    "kennisbank",
    "slaaphygiene",
    "Slaapkamer met gedempt licht en strak linnengoed",
    "Slaaphygiëne is het geheel van gewoonten rond licht, bed en schermen dat nachtrust voorspelbaarder maakt.",
  ),
  "eiwitbehoefte-na-40": img(
    "kennisbank",
    "eiwitbehoefte-na-40",
    "Gebakken vis met groenten en een portie peulvruchten",
    "De eiwitbehoefte na 30 ligt vaak hoger dan de standaardrichtlijn, vooral bij krachttraining.",
  ),
  "kalium-natrium-balans": img(
    "kennisbank",
    "kalium-natrium-balans",
    "Snijplank met tomaat, avocado en bladgroen",
    "De kalium-natrium-balans beïnvloedt bloeddruk; meer groenten telt vaak zwaarder dan alleen minder zout.",
  ),
  healthspan: img(
    "kennisbank",
    "healthspan",
    "Houten hangbrug door een groene bosrand",
    "Healthspan is de periode waarin je vitaal functioneert — langer dan alleen levensjaren erbij.",
  ),
  "hpa-as": img(
    "kennisbank",
    "hpa-as",
    "Mistig naaldbos in zacht licht",
    "De HPA-as koppelt hersenen, hypofyse en bijnieren: chronische stress houdt dit systeem langer ‘aan’.",
  ),
  cortisol: img(
    "kennisbank",
    "cortisol",
    "Stille theekop in ochtendlicht bij een raam",
    "Cortisol piekt normaal in de ochtend; een vlak of omgekeerd ritme hoort bij aanhoudende belasting.",
  ),
  melatonine: img(
    "kennisbank",
    "melatonine",
    "Avondhemel met de eerste sterren boven een donker veld",
    "Melatonine signaleert duisternis aan het brein; fel avondlicht dempt die boodschap.",
  ),
  mitochondrien: img(
    "kennisbank",
    "mitochondrien",
    "Zonlicht door boombladeren in een rustig bos",
    "Mitochondriën maken ATP uit voeding en zuurstof — de energiecentrales van de cel.",
  ),
  "nervus-vagus": img(
    "kennisbank",
    "nervus-vagus",
    "Besneeuwde bergtoppen bij maanlicht",
    "De nervus vagus is de grote rem van het stresssysteem: trage uitademing kan hem activeren.",
  ),
  atp: img(
    "kennisbank",
    "atp",
    "Halterrekken in een lege sportschool",
    "ATP is de directe energiemunt van de cel; creatine helpt die voorraad sneller aanvullen.",
  ),
  testosteron: img(
    "kennisbank",
    "testosteron",
    "Rotsachtige bergtoppen in sneeuw",
    "Testosteron ondersteunt spier, libido en herstel; slaap en overgewicht wegen zwaarder dan de meeste pillen.",
  ),
  slaapschuld: img(
    "kennisbank",
    "slaapschuld",
    "Onopgemaakt bed in een kamer met dichte gordijnen",
    "Slaapschuld bouwt op als je structureel te kort slaapt — een weekend uitslapen lost dat niet volledig in.",
  ),
  "sociale-verbinding": img(
    "kennisbank",
    "sociale-verbinding",
    "Cappuccino op een houten tafel",
    "Sociale verbinding is een van de sterkste voorspellers van herstel en levensduur, naast slaap en beweging.",
  ),
  magnesiumvormen: img(
    "kennisbank",
    "magnesiumvormen",
    "Boerenkool en spruitjes als magnesiumrijke bladgroenten",
    "Magnesiumvormen verschillen in opname en darmtolerantie: oxide is goedkoop, glycine rustiger voor velen.",
  ),
  overtrainingssyndroom: img(
    "kennisbank",
    "overtrainingssyndroom",
    "Stille kustlijn als beeld bij herstel na belasting",
    "Overtrainingssyndroom is meer dan moe na sport: prestatie, slaap en stemming zakken wekenlang in.",
  ),
  "vitamine-d": img(
    "kennisbank",
    "vitamine-d",
    "Zonsondergang boven zee zonder personen in beeld",
    "Vitamine D ontstaat in de huid onder uv-B; in Nederland is dat een seizoensgebonden proces.",
  ),
  "vitamine-k2": img(
    "kennisbank",
    "vitamine-k2",
    "Blauwe kaas op een plank als gefermenteerde K2-bron",
    "Vitamine K2 zit in gefermenteerde voeding en speelt een rol bij calcium naar bot in plaats van naar de vaatwand.",
  ),
  "vitamine-d-inname": img(
    "kennisbank",
    "vitamine-d-inname",
    "Fles olijfolie bij daglicht",
    "Vitamine D-inname werkt beter bij een beetje vet; de dosis hangt af van status, niet van een vaste internetdosis.",
  ),
  insulineresistentie: img(
    "kennisbank",
    "insulineresistentie",
    "Volkoren maaltijd met groenten en een magere eiwitbron",
    "Insulineresistentie betekent dat cellen trager op insuline reageren; beweging en vezels helpen die gevoeligheid.",
  ),
  "oxidatieve-stress": img(
    "kennisbank",
    "oxidatieve-stress",
    "Bessen en donkere bladgroenten in een kom",
    "Oxidatieve stress is een disbalans tussen vrije radicalen en antioxidanten — training maakt hem tijdelijk, ziekte langer.",
  ),
  multivitamine: img(
    "kennisbank",
    "multivitamine",
    "Dagelijks patroon van groenten, vis en volkoren op één bord",
    "Een multivitamine vult micronutriëntgaten; de basis blijft een gevarieerd voedingspatroon.",
  ),
  "ps-score-model": img(
    "kennisbank",
    "ps-score-model",
    "Lege sticky notes op een bureau naast een toetsenbord",
    "Het PS-scoremodel weegt etiket, dosis, vorm en toetsing — zodat producten vergelijkbaar worden.",
  ),
  scoregewichten: img(
    "kennisbank",
    "scoregewichten",
    "Bureau met koffie, koffiebonen en toetsenbord",
    "Scoregewichten bepalen hoe zwaar dosis, zuiverheid en claims meetellen in de eindscore.",
  ),
  onderzoeksdosis: img(
    "kennisbank",
    "onderzoeksdosis",
    "Drie gelijke mealprep-bakjes met rijst, linzen en groenten",
    "De onderzoeksdosis is de hoeveelheid die in studies werd gebruikt — vaak hoger dan een marketingdosis op het etiket.",
  ),
  claimdekking: img(
    "kennisbank",
    "claimdekking",
    "Open notitieboek zonder tekst op een wit bureau",
    "Claimdekking vraagt of de belofte op de voorkant wordt gedekt door de milligrammen op de achterkant.",
  ),
  etikettransparantie: img(
    "kennisbank",
    "etikettransparantie",
    "Boerenkool, avocado en tomaat zonder etiketten",
    "Etikettransparantie betekent dat vorm, dosis en hulpstoffen zichtbaar zijn — geen proprietary blend zonder getallen.",
  ),
  "onafhankelijke-toetsing": img(
    "kennisbank",
    "onafhankelijke-toetsing",
    "Rek met blauwe reageerbuizen, zonder persoon in beeld",
    "Onafhankelijke toetsing laat zien of batch en etiket overeenkomen, buiten de marketingafdeling om.",
  ),
  "leucinedrempel": img(
    "kennisbank",
    "leucinedrempel",
    "Avocado-toast met ei als eiwitrijke maaltijd",
    "De leucinedrempel is de hoeveelheid per maaltijd die spieropbouw op gang brengt.",
  ),
  "wei-eiwit": img(
    "kennisbank",
    "wei-eiwit",
    "Ontbijtbord met eieren, bacon en koffie",
    "Wei-eiwit is snel opneembaar en leucinerijk, wat het geschikt maakt rond training.",
  ),
};

export function blogBodyImage(slug: string): ArticleBodyImage | undefined {
  return BLOG_BODY_IMAGES[slug];
}

export function kennisbankBodyImage(slug: string): ArticleBodyImage | undefined {
  return KENNISBANK_BODY_IMAGES[slug];
}

export function articleBodyImageSrcs(
  coverSrc: string,
  body: ArticleBodyImage | undefined,
): string[] {
  return body ? [coverSrc, body.src] : [coverSrc];
}
