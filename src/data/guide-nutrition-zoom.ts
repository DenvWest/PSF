export type GuideNutritionZoomKey =
  | "slaap"
  | "stress"
  | "energie"
  | "herstel"
  | "beweging"
  | "overgang"
  | "testosteron";

export type GuideNutritionZoom = {
  heading: string;
  intro: string;
  factors: string[];
  nutritionTitle: string;
  nutrition: { title: string; body: string }[];
  ctaLead: string;
};

export const GUIDE_NUTRITION_ZOOM: Record<GuideNutritionZoomKey, GuideNutritionZoom> = {
  slaap: {
    heading: "Slaap begint ook op je bord",
    intro:
      "Slaap hangt samen met licht, ritme, stress en beweging. Voeding is de factor die je het vaakst over het hoofd ziet.",
    factors: ["Vast slaapritme", "Ochtendlicht", "Stress afbouwen voor bedtijd", "Beweging overdag"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Magnesium en rust",
        body: "Magnesium draagt bij aan een normale werking van het zenuwstelsel. Peulvruchten, noten en groene bladgroenten leveren het van nature.",
      },
      {
        title: "Timing van de laatste maaltijd",
        body: "Een zware maaltijd of alcohol vlak voor het slapen maakt de nacht voor veel mensen onrustiger. Probeer een paar uur marge.",
      },
      {
        title: "Cafeïne",
        body: "Koffie na de middag kan het inslapen vertragen. Schuif je laatste kop eerder op en kijk wat er verandert.",
      },
    ],
    ctaLead: "Eet je genoeg van wat je slaap ondersteunt?",
  },
  stress: {
    heading: "Stress en wat je eet",
    intro:
      "Stress verlaag je met slaap, beweging en ontspanning. Voeding speelt mee: onder druk eet je vaak anders, en dat zie je zelf niet snel.",
    factors: ["Slaap", "Beweging en buitenlucht", "Adem- en rustmomenten", "Grenzen in je agenda"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Regelmaat",
        body: "Maaltijden overslaan en later snacken geeft schommelingen in je energie. Vaste momenten maken je dag voorspelbaarder.",
      },
      {
        title: "Magnesium, B-vitamines en omega-3",
        body: "Dit zijn stoffen waar je lichaam op leunt bij belasting. Volkoren, peulvruchten, noten en vette vis zijn de basis.",
      },
      {
        title: "Cafeïne en suiker",
        body: "Onder druk grijp je sneller naar koffie en snelle suikers. Je merkt vaak pas na een week minder hoeveel dat scheelt.",
      },
    ],
    ctaLead: "Kom je onder druk tekort op wat je lichaam nodig heeft?",
  },
  energie: {
    heading: "Energie komt grotendeels uit wat je eet",
    intro:
      "Energie hangt af van slaap, beweging, stress en herstel. Binnen die factoren is voeding de makkelijkste om bij te sturen.",
    factors: ["Slaap", "Beweging", "Stressbelasting", "Herstelmomenten"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Eiwit bij elke maaltijd",
        body: "Een ontbijt met voldoende eiwit houdt je energie stabieler dan alleen brood of zoet. Mik op een stevige portie bij elke maaltijd.",
      },
      {
        title: "Ijzer, B12 en vitamine D",
        body: "Dit zijn stoffen die bijdragen aan het verminderen van vermoeidheid. Of jij ze tekortkomt, meet je met bloedonderzoek of een inschatting van wat je eet.",
      },
      {
        title: "Genoeg eten",
        body: "Te weinig eten, ook door een dieet, merk je als eerste aan je energie.",
      },
    ],
    ctaLead: "Weet je wat er op je bord ontbreekt?",
  },
  herstel: {
    heading: "Herstel is ook een voedingsvraag",
    intro:
      "Herstel bepaal je met slaap, rust tussen inspanningen en de balans tussen training en belasting. Je lichaam bouwt daarbij op wat je eet.",
    factors: ["Slaap", "Rustdagen", "Opbouw van training", "Stress laag houden"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Eiwit",
        body: "Eiwit is de bouwstof voor spieren. Verdeel het over de dag in plaats van alles bij het avondeten.",
      },
      {
        title: "Omega-3 en kleurrijke groenten",
        body: "Vette vis en veel verschillende groenten leveren stoffen die passen bij een lichaam dat veel moet herstellen.",
      },
      {
        title: "Vocht en zout",
        body: "Bij veel zweten of zware dagen telt ook wat je drinkt. Water, en bij langere inspanning mineralen.",
      },
    ],
    ctaLead: "Krijgt je lichaam wat het nodig heeft om te herstellen?",
  },
  beweging: {
    heading: "Beweging vraagt brandstof",
    intro:
      "Beweging draait om regelmaat, kracht en herstel. Wat je eet bepaalt hoeveel je daarvan kunt volhouden.",
    factors: ["Dagelijks bewegen", "Krachttraining", "Rustdagen", "Slaap"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Eiwit voor spierbehoud",
        body: "Vanaf je dertigste loop je kracht en spiermassa terug zonder training en genoeg eiwit. Een stevige eiwitportie per maaltijd helpt.",
      },
      {
        title: "Koolhydraten rond inspanning",
        body: "Training op een lege tank voelt zwaarder. Eet iets voor een langere of zwaardere sessie.",
      },
      {
        title: "Calcium en vitamine D",
        body: "Belangrijk voor botten, zeker als je kracht en impact wilt blijven trainen.",
      },
    ],
    ctaLead: "Eet je genoeg om je beweging vol te houden?",
  },
  overgang: {
    heading: "Overgang en voeding",
    intro:
      "In de overgang verandert er veel tegelijk. Slaap, stress en beweging bepalen mee hoe je je voelt, en voeding is de factor waar je het meeste directe invloed op hebt.",
    factors: ["Slaap", "Stress", "Krachttraining", "Regelmaat in je dag"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Eiwit en spieren",
        body: "Spiermassa neemt af naarmate je ouder wordt. Voldoende eiwit en krachttraining houden je sterk.",
      },
      {
        title: "Calcium, vitamine D en K2",
        body: "Belangrijk voor sterke botten, juist rond en na de overgang.",
      },
      {
        title: "Magnesium en omega-3",
        body: "Passen bij slaap, stemming en herstel. Peulvruchten, noten en vette vis zijn de basis.",
      },
    ],
    ctaLead: "Weet je of je genoeg binnenkrijgt van wat nu extra telt?",
  },
  testosteron: {
    heading: "Leefstijl achter je vitaliteit: zoom in op voeding",
    intro:
      "Je hormoonbalans hangt samen met slaap, stress, krachttraining en lichaamssamenstelling. Dat zijn de leefstijlfactoren die ertoe doen, voor mannen en vrouwen vanaf 30.",
    factors: ["Slaap", "Stress en herstel", "Krachttraining", "Lichaamssamenstelling"],
    nutritionTitle: "Zoom in op voeding",
    nutrition: [
      {
        title: "Genoeg eten en genoeg eiwit",
        body: "Langdurig te weinig eten of crashdiëten drukken je energie en herstel. Eiwit ondersteunt spierbehoud naast training.",
      },
      {
        title: "Zink en vitamine D",
        body: "Zink draagt bij aan een normaal testosterongehalte in het bloed bij voldoende inname. Dat is geen belofte van verhoging. Vlees, vis, zaden en zuivel leveren het.",
      },
      {
        title: "Gezonde vetten",
        body: "Vette vis, noten en olijfolie horen bij een eetpatroon dat past bij herstel en vitaliteit.",
      },
    ],
    ctaLead: "Eet je genoeg van wat telt voor jouw vitaliteit?",
  },
};
