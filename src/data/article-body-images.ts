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
): ArticleBodyImage {
  return {
    src: `/images/${folder}/inline/${slug}.jpg`,
    alt,
    caption,
  };
}

const BLOG_BODY_IMAGES: Record<string, ArticleBodyImage> = {
  "cortisol-verlagen-natuurlijk": img(
    "blog",
    "cortisol-verlagen-natuurlijk",
    "Mistig bospad in zacht ochtendlicht, rustig landschap",
    "Een stil bospad laat zien hoe cortisol verlagen vaak begint: minder prikkels, meer herstelruimte.",
  ),
  "cortisol-en-slaap": img(
    "blog",
    "cortisol-en-slaap",
    "Slaapkamer in avondlicht met gedempt nachtlampje",
    "Cortisol en slaap hangen samen: als het stresshormoon ’s avonds hoog blijft, wordt inslapen lastiger.",
  ),
  "ademhaling-tegen-stress": img(
    "blog",
    "ademhaling-tegen-stress",
    "Persoon in een rustige zithouding bij een raam",
    "Ademhaling tegen stress werkt via het autonome zenuwstelsel — een korte pauze kan de spanning laten zakken.",
  ),
  "stress-werk-grenzen-stellen": img(
    "blog",
    "stress-werk-grenzen-stellen",
    "Leeg bureau aan het einde van de werkdag bij raamlicht",
    "Grenzen stellen op het werk begint bij een duidelijk einde van de dag, niet bij nóg een extra taak.",
  ),
  "cortisol-en-testosteron": img(
    "blog",
    "cortisol-en-testosteron",
    "Krachttraining met vrije gewichten in een lichte sportschool",
    "Cortisol en testosteron beïnvloeden elkaar: chronische stress kan herstel en spieropbouw onder druk zetten.",
  ),
  "ashwagandha-werking-mannen": img(
    "blog",
    "ashwagandha-werking-mannen",
    "Gedroogde ashwagandha-wortelstukken in een keramieken schaal",
    "Ashwagandha wordt onderzocht als adaptogeen; de wortel zelf zegt niets over dosering of productkwaliteit.",
  ),
  "slaap-verbeteren-40-plus": img(
    "blog",
    "slaap-verbeteren-40-plus",
    "Ochtendlicht door linnen gordijnen in een rustige slaapkamer",
    "Slaap verbeteren na 40 vraagt vaak om ritme en licht — niet alleen om een extra supplement.",
  ),
  "slaaphygiene-mannen-40-plus": img(
    "blog",
    "slaaphygiene-mannen-40-plus",
    "Net opgemaakt bed in een sobere, lichte slaapkamer",
    "Slaaphygiëne is het geheel van gewoonten rond bed, licht en schermen dat de nachtrust draagt.",
  ),
  "magnesium-en-slaap": img(
    "blog",
    "magnesium-en-slaap",
    "Donkergroene bladgroenten op een houten snijplank",
    "Magnesium zit onder meer in groene bladgroenten; bij slaap telt vooral de vorm en het tijdstip van inname.",
  ),
  "magnesium-en-slaapkwaliteit": img(
    "blog",
    "magnesium-en-slaapkwaliteit",
    "Glas water en capsules op een nachtkastje",
    "Magnesium en slaapkwaliteit: een avonddosis kan rust ondersteunen, maar vervangt geen vast slaapritme.",
  ),
  "magnesium-in-combinatie-met-medicijnen": img(
    "blog",
    "magnesium-in-combinatie-met-medicijnen",
    "Magnesiumcapsules naast medicijnblisters en een glas water",
    "Magnesium in combinatie met medicijnen verdient extra aandacht: timing en interacties verschillen per middel.",
  ),
  "melatonine-wanneer-wel-niet": img(
    "blog",
    "melatonine-wanneer-wel-niet",
    "Schemerlucht boven een stil landschap bij zonsondergang",
    "Melatonine volgt het licht-donkerritme; daarom is het tijdstip van inname minstens zo belangrijk als de dosis.",
  ),
  "melatonine-na-40": img(
    "blog",
    "melatonine-na-40",
    "Wekker op een nachtkastje in gedempt licht",
    "Melatonine na 40: de aanmaak verandert met de leeftijd, maar een pil is niet automatisch de eerste stap.",
  ),
  "slaapritme-herstellen": img(
    "blog",
    "slaapritme-herstellen",
    "Zonsopkomst boven een stil veld",
    "Een slaapritme herstellen begint bij ochtendlicht: dat zet de interne klok opnieuw op tijd.",
  ),
  "vitamine-d-en-slaap": img(
    "blog",
    "vitamine-d-en-slaap",
    "Zonlicht op een vensterbank in een rustige kamer",
    "Vitamine D en slaap overlappen via seizoen en lichtblootstelling, niet via een snelle slaappil.",
  ),
  "energie-verhogen-natuurlijk": img(
    "blog",
    "energie-verhogen-natuurlijk",
    "Wandelaar op een pad door heuvels in helder daglicht",
    "Energie verhogen na 40 lukt vaker met beweging, slaap en voeding dan met een snelle stimulant.",
  ),
  "vitamine-d-tekort-herkennen": img(
    "blog",
    "vitamine-d-tekort-herkennen",
    "Bewolkte Nederlandse kust bij laag winterlicht",
    "Een vitamine D-tekort herken je niet aan één klacht; in Nederlandse winters is de zon vaak te zwak.",
  ),
  "testosteron-en-energie-na-40": img(
    "blog",
    "testosteron-en-energie-na-40",
    "Iemand die buiten traploopt in sportkleding",
    "Testosteron en energie na 40: slaaptekort en overtraining drukken vaak harder dan één bloedwaarde.",
  ),
  "omega-3-concentratie-energie": img(
    "blog",
    "omega-3-concentratie-energie",
    "Vette vis op een bord met citroen en groenten",
    "Omega-3 (EPA en DHA) zit vooral in vette vis; concentratie en energie vragen om een werkzame dosis.",
  ),
  "vitamine-d-en-energie": img(
    "blog",
    "vitamine-d-en-energie",
    "Persoon die in de ochtendzon langs het water loopt",
    "Vitamine D en energie: een tekort kan moeheid in stand houden, vooral in de donkere maanden.",
  ),
  "eiwit-na-40": img(
    "blog",
    "eiwit-na-40",
    "Eiwitshake naast eieren en yoghurt op een aanrecht",
    "Eiwit na 40 ondersteunt spierbehoud; de verdeling over de dag telt minstens zo zwaar als het dagtotaal.",
  ),
  "eiwitinname-timing-mannen-40": img(
    "blog",
    "eiwitinname-timing-mannen-40",
    "Mealprep-bakjes met kip, eieren en yoghurt voor eiwit over de dag",
    "Eiwitinname-timing na 40: een portie rond training en bij elke maaltijd is praktischer dan één grote piek.",
  ),
  "middagdip-bloedsuiker-na-40": img(
    "blog",
    "middagdip-bloedsuiker-na-40",
    "Kop latte met stoom in zacht middaglicht",
    "Een middagdip hangt vaak samen met bloedsuiker: eiwit en vezels dempen de piek na de lunch.",
  ),
  "krachttraining-na-40": img(
    "blog",
    "krachttraining-na-40",
    "Halterschijven op een houten vloer in een lichte gym",
    "Krachttraining na 40 is een van de duidelijkste manieren om spier- en botmassa te beschermen.",
  ),
  "alcohol-slaap-energie-na-40": img(
    "blog",
    "alcohol-slaap-energie-na-40",
    "Wijnglas op de voorgrond met een slaapkamer en kussen op de achtergrond",
    "Alcohol, slaap en energie: een avondglas of late cafeïne kan inslapen makkelijker maken, maar haalt diepe slaap onderuit.",
  ),
  "zout-kalium-bloeddruk-na-40": img(
    "blog",
    "zout-kalium-bloeddruk-na-40",
    "Verse groenten en kruiden klaar om te koken",
    "Kalium uit groenten en fruit helpt de natrium-kaliumbalans; bloeddruk reageert op het geheel, niet op één snuf zout.",
  ),
  "zonnebrand-en-vitamine-d": img(
    "blog",
    "zonnebrand-en-vitamine-d",
    "Zonnebril en hoed op een strandhanddoek in de zon",
    "Zonnebrand en vitamine D: bescherming van de huid blijft nodig; een tekort los je niet op met verbranden.",
  ),
  "vitamine-d-zon-nederland": img(
    "blog",
    "vitamine-d-zon-nederland",
    "Lage winterzon boven een Nederlandse polder met kanaal",
    "Vitamine D uit zonlicht is in Nederland een seizoensverhaal: van oktober tot maart is de UV-index vaak te laag.",
  ),
  "vitamine-d-meten-wanneer-zinvol": img(
    "blog",
    "vitamine-d-meten-wanneer-zinvol",
    "Bloedafnamebuisjes in een laboratoriumrek",
    "Vitamine D meten is zinvol bij klachten of risicofactoren — niet als routineprik zonder vraag.",
  ),
  "vitamine-d-seizoenen-jaarritme": img(
    "blog",
    "vitamine-d-seizoenen-jaarritme",
    "Herfstbos met laag zonlicht tussen de bomen",
    "Het jaarritme van vitamine D volgt de seizoenen: voorraden dalen in de herfst als de zon lager staat.",
  ),
  "vitamine-d-aandoeningen-onderzoek": img(
    "blog",
    "vitamine-d-aandoeningen-onderzoek",
    "Onderzoeksartikelen en een notitieboek op een bureau",
    "Onderzoek naar vitamine D en aandoeningen is omvangrijk, maar associatie is nog geen behandeladvies.",
  ),
  "vitamine-d-en-k2-samen": img(
    "blog",
    "vitamine-d-en-k2-samen",
    "Gefermenteerde kaas en groene groenten op een plank",
    "Vitamine D en K2 worden vaak samen genoemd omdat beide een rol spelen bij calciumverdeling in het lichaam.",
  ),
  "vitamine-d-hoge-doses-social-media": img(
    "blog",
    "vitamine-d-hoge-doses-social-media",
    "Persoon die buiten een foto maakt met een smartphone",
    "Hoge doses vitamine D op social media klinken overtuigend, maar megadoses vragen om labcontrole — niet om een trend.",
  ),
  "creatine-en-herstel": img(
    "blog",
    "creatine-en-herstel",
    "Sporttas en trainingsfles in een kleedruimte",
    "Creatine en herstel: de stof helpt ATP aanvullen, vooral bij herhaalde krachtinspanning.",
  ),
  "creatine-bijwerkingen-nieren-haaruitval": img(
    "blog",
    "creatine-bijwerkingen-nieren-haaruitval",
    "Glas water naast een maatschepje poeder",
    "Bijwerkingen van creatine worden vaak overdreven; nieren en haaruitval vragen om context, niet om paniek.",
  ),
  "creatine-dosering-en-laadfase": img(
    "blog",
    "creatine-dosering-en-laadfase",
    "Keukenweegschaal met een kleine hoeveelheid wit poeder",
    "Creatine-dosering: een laadfase is optioneel; 3 tot 5 gram per dag vult de voorraad ook zonder piek.",
  ),
  "creatine-wanneer-innemen": img(
    "blog",
    "creatine-wanneer-innemen",
    "Shakerfles op een bankje in de sportschool",
    "Wanneer creatine innemen telt minder dan elke dag innemen: timing is secundair aan consistentie.",
  ),
  "creatine-vormen-en-keurmerken": img(
    "blog",
    "creatine-vormen-en-keurmerken",
    "Supplementetiket van dichtbij, zonder merken te tonen",
    "Bij creatine-vormen telt Creapure of een vergelijkbaar keurmerk zwaarder dan een exotische variant op het etiket.",
  ),
  "creatine-water-vasthouden-en-gewicht": img(
    "blog",
    "creatine-water-vasthouden-en-gewicht",
    "Weegschaal op een badkamervloer in ochtendlicht",
    "Creatine en gewicht: extra water in de spier is geen vetmassa, al kan de weegschaal wel een kilo stijgen.",
  ),
  "creatine-en-brein-slaaptekort": img(
    "blog",
    "creatine-en-brein-slaaptekort",
    "Werkplek bij een raam na een late avond",
    "Creatine en het brein bij slaaptekort is een jong onderzoeksveld: hoopvol, maar geen vervanging van slaap.",
  ),
  "creatine-voor-vrouwen-na-40": img(
    "blog",
    "creatine-voor-vrouwen-na-40",
    "Vrouw die krachttraining doet in een lichte gym",
    "Creatine voor vrouwen na 40 wordt steeds vaker onderzocht, vooral rond spierbehoud en training.",
  ),
  "zink-en-testosteron": img(
    "blog",
    "zink-en-testosteron",
    "Gegrild vlees, oesters en pompoenpitten als zinkrijke voeding",
    "Zink en testosteron: een tekort kan hormonen raken, maar extra zink boven de behoefte is geen boost.",
  ),
  "omega-3-en-herstel": img(
    "blog",
    "omega-3-en-herstel",
    "Gegrilde zalmfilet met omega-3-capsules en citroen",
    "Omega-3 en herstel: EPA en DHA spelen een rol bij ontstekingsresolutie na inspanning.",
  ),
  "multivitamine-zinvol-na-40": img(
    "blog",
    "multivitamine-zinvol-na-40",
    "Kleurrijke groenten en fruit uitgespreid op een werkblad",
    "Een multivitamine na 40 vult gaten; het vervangt geen patroon met groenten, vis en zonlicht.",
  ),
  "beste-omega-3-supplement": img(
    "blog",
    "beste-omega-3-supplement",
    "Visoliecapsules naast een kleine kom sardines",
    "Het beste omega-3-supplement herken je aan EPA+DHA per capsule, oxidatie en een leesbaar etiket.",
  ),
  "wat-is-omega-3": img(
    "blog",
    "wat-is-omega-3",
    "Omega-3-softgels naast een verse zalmfilet",
    "Wat is omega-3: het gaat om EPA en DHA uit vis, niet om elk plantaardig oliezuur op een etiket.",
  ),
  "waar-let-je-op-bij-omega-3": img(
    "blog",
    "waar-let-je-op-bij-omega-3",
    "Visoliecapsules en een flesje naast een leeg notitieblok bij het vergelijken",
    "Waar let je op bij omega-3: dosis EPA/DHA, TOTOX of verse geur, en of de claim de inhoud dekt.",
  ),
  "beste-magnesium": img(
    "blog",
    "beste-magnesium",
    "Poeders en capsules van mineralen op een licht blad",
    "Het beste magnesium hangt af van het doel: bisglycinaat, citraat of tauraat zijn niet inwisselbaar.",
  ),
  "supplement-kiezen-waar-op-letten": img(
    "blog",
    "supplement-kiezen-waar-op-letten",
    "Checklist en loep bij een supplementetiket",
    "Een supplement kiezen begint bij het etiket: dosis, vorm, keurmerk en wat er juist niet op staat.",
  ),
  "buikvet-cortisol-slaap-mannen": img(
    "blog",
    "buikvet-cortisol-slaap-mannen",
    "Wandelaar of hardloper buiten op een pad",
    "Voldoende slaap en minder chronische stress remmen de cortisolgedreven opslag van buikvet sterker dan een dieet alleen.",
  ),
  "slaapkwaliteit-testosteron-herstel": img(
    "blog",
    "slaapkwaliteit-testosteron-herstel",
    "Lichte slaapkamer met wit beddengoed in ochtendlicht",
    "De hoogste testosteronaanmaak vindt plaats in de vroege, diepe slaap — slaapkwaliteit telt zwaarder dan het aantal uren.",
  ),
  "vermoeidheid-bloedwaarden-checken-mannen": img(
    "blog",
    "vermoeidheid-bloedwaarden-checken-mannen",
    "Bloedafnamebuisjes in een laboratoriumrek",
    "Vitamine D, B12, ijzer en schildklierwaarden zijn de eerste bloedwaarden die aanhoudende vermoeidheid kunnen verklaren.",
  ),
  "magnesium-herstel-mannen-40": img(
    "blog",
    "magnesium-herstel-mannen-40",
    "Sporttas en bidon in een kleedkamer na training",
    "Magnesium ondersteunt spierherstel, maar een groot deel van trager herstel na 30 komt door anabole resistentie.",
  ),
  "krachtverlies-eiwitbehoefte-na-40": img(
    "blog",
    "krachtverlies-eiwitbehoefte-na-40",
    "Eiwitrijke maaltijd met vlees, eieren en groenten",
    "Oudere spieren hebben meer eiwit per maaltijd nodig om dezelfde opbouwprikkel te bereiken als jongere spieren.",
  ),
  "overgang-slaapproblemen-opvliegers": img(
    "blog",
    "overgang-slaapproblemen-opvliegers",
    "Koel opgemaakt bed met een dun dekbed en los laken",
    "Een koele slaapkamer met laag-voor-laag beddengoed dempt het effect van nachtelijke opvliegers op je slaap.",
  ),
  "overgang-buikvet-gewichtstoename": img(
    "blog",
    "overgang-buikvet-gewichtstoename",
    "Persoon die krachttraining doet met een barbell",
    "Krachttraining behoudt spiermassa en ondersteunt de stofwisseling die in de overgang geleidelijk daalt.",
  ),
  "overgang-stress-cortisol": img(
    "blog",
    "overgang-stress-cortisol",
    "Persoon in yogahouding bij zonsondergang",
    "Regelmaat en ademhaling dempen een stresssysteem dat in de overgang gevoeliger reageert op dezelfde prikkels.",
  ),
  "vitamine-d-botgezondheid-overgang": img(
    "blog",
    "vitamine-d-botgezondheid-overgang",
    "Landschap in warm zonlicht tussen heuvels",
    "Vitamine D ondersteunt calciumopname voor de botten, maar vervangt niet de oestrogeenbescherming die wegvalt.",
  ),
  "magnesium-in-de-overgang": img(
    "blog",
    "magnesium-in-de-overgang",
    "Magnesiumcapsules naast een glas water op een nachtkastje",
    "Magnesium ondersteunt slaap en spierontspanning in de overgang, maar is geen bewezen middel tegen opvliegers.",
  ),
};

const KENNISBANK_BODY_IMAGES: Record<string, ArticleBodyImage> = {
  biobeschikbaarheid: img(
    "kennisbank",
    "biobeschikbaarheid",
    "Capsules en een glas water op een rustig werkblad",
    "Biobeschikbaarheid zegt hoeveel van een stof het lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.",
  ),
  chelaatvorm: img(
    "kennisbank",
    "chelaatvorm",
    "Fijne poeders in glazen schaaltjes bij daglicht",
    "Een chelaatvorm bindt een mineraal aan een aminozuur, wat de opname in de darm kan veranderen.",
  ),
  adaptogens: img(
    "kennisbank",
    "adaptogens",
    "Gedroogde adaptogene kruiden in een keramieken kom",
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
    "Stapel documenten en een markeerstift op een bureau",
    "EFSA-claims zijn goedgekeurde gezondheidsclaims; wat niet op de lijst staat, mag een merk niet zomaar beloven.",
  ),
  "derde-partij-testen": img(
    "kennisbank",
    "derde-partij-testen",
    "Laboratoriumglaswerk in een heldere werkruimte",
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
    "De eiwitbehoefte na 40 ligt vaak hoger dan de standaardrichtlijn, vooral bij krachttraining.",
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
    "Oudere wandelaar op een bospad in de zon",
    "Healthspan is de periode waarin je vitaal functioneert — langer dan alleen levensjaren erbij.",
  ),
  "hpa-as": img(
    "kennisbank",
    "hpa-as",
    "Persoon in een rustpauze op een bank in het park",
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
    "Persoon die rustig ademhaalt met gesloten ogen",
    "De nervus vagus is de grote rem van het stresssysteem: trage uitademing kan hem activeren.",
  ),
  atp: img(
    "kennisbank",
    "atp",
    "Sprintersblok of start van een korte krachtinspanning in een gym",
    "ATP is de directe energiemunt van de cel; creatine helpt die voorraad sneller aanvullen.",
  ),
  testosteron: img(
    "kennisbank",
    "testosteron",
    "Krachttraining met een barbell in een sobere gym",
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
    "Twee mensen in gesprek aan een tafeltje in de buitenlucht",
    "Sociale verbinding is een van de sterkste voorspellers van herstel en levensduur, naast slaap en beweging.",
  ),
  magnesiumvormen: img(
    "kennisbank",
    "magnesiumvormen",
    "Verschillende poeders in kleine glazen potjes",
    "Magnesiumvormen verschillen in opname en darmtolerantie: oxide is goedkoop, glycine rustiger voor velen.",
  ),
  overtrainingssyndroom: img(
    "kennisbank",
    "overtrainingssyndroom",
    "Lege hardloopschoenen naast een bank na een training",
    "Overtrainingssyndroom is meer dan moe na sport: prestatie, slaap en stemming zakken wekenlang in.",
  ),
  "vitamine-d": img(
    "kennisbank",
    "vitamine-d",
    "Zon op huid bij een wandeling langs het water",
    "Vitamine D ontstaat in de huid onder uv-B; in Nederland is dat een seizoensgebonden proces.",
  ),
  "vitamine-k2": img(
    "kennisbank",
    "vitamine-k2",
    "Gefermenteerde kaas op een plank met groene kruiden",
    "Vitamine K2 zit in gefermenteerde voeding en speelt een rol bij calcium naar bot in plaats van naar de vaatwand.",
  ),
  "vitamine-d-inname": img(
    "kennisbank",
    "vitamine-d-inname",
    "Druppelflesje vitamine D naast een eetlepel olie",
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
    "Notitieboek met een eenvoudig score-overzicht op een bureau",
    "Het PS-scoremodel weegt etiket, dosis, vorm en toetsing — zodat producten vergelijkbaar worden.",
  ),
  scoregewichten: img(
    "kennisbank",
    "scoregewichten",
    "Balansweegschaal met gewichtjes op een werkblad",
    "Scoregewichten bepalen hoe zwaar dosis, zuiverheid en claims meetellen in de eindscore.",
  ),
  onderzoeksdosis: img(
    "kennisbank",
    "onderzoeksdosis",
    "Maatlepel poeder naast een wetenschappelijk artikel",
    "De onderzoeksdosis is de hoeveelheid die in studies werd gebruikt — vaak hoger dan een marketingdosis op het etiket.",
  ),
  claimdekking: img(
    "kennisbank",
    "claimdekking",
    "Etiket naast een uitvergrote ingrediëntenlijst",
    "Claimdekking vraagt of de belofte op de voorkant wordt gedekt door de milligrammen op de achterkant.",
  ),
  etikettransparantie: img(
    "kennisbank",
    "etikettransparantie",
    "Supplementpot met een volledig leesbare achterkant",
    "Etikettransparantie betekent dat vorm, dosis en hulpstoffen zichtbaar zijn — geen proprietary blend zonder getallen.",
  ),
  "onafhankelijke-toetsing": img(
    "kennisbank",
    "onafhankelijke-toetsing",
    "Labrapport met grafieken naast een gesloten potje",
    "Onafhankelijke toetsing laat zien of batch en etiket overeenkomen, buiten de marketingafdeling om.",
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
