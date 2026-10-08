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
  today: { title: string; body: string }[];
  weeks: { body: string; nutrients: string[] };
  ctaLead: string;
};

export const GUIDE_NUTRITION_ZOOM: Record<GuideNutritionZoomKey, GuideNutritionZoom> = {
  slaap: {
    heading: "Slaap begint ook op je bord",
    intro:
      "Slaap hangt samen met licht, ritme, stress en beweging. Voeding is de factor die je het vaakst over het hoofd ziet.",
    factors: ["Vast slaapritme", "Ochtendlicht", "Stress afbouwen voor bedtijd", "Beweging overdag"],
    today: [
      {
        title: "Op tijd eten",
        body: "Eet drie à vier uur voor het slapen: lig je rond 23:00 in bed, dan tussen 18:00 en 19:00. Wie binnen drie uur voor bedtijd eet, wordt vaker 's nachts wakker.",
      },
      {
        title: "Cafeïne",
        body: "Koffie na de middag kan het inslapen vertragen. Schuif je laatste kop eerder op en kijk wat er verandert.",
      },
    ],
    weeks: {
      body: "Of je genoeg magnesium binnenkrijgt, zie je niet aan één dag. Het telt op over weken: peulvruchten, noten, volkoren en groene bladgroenten. Magnesium draagt bij aan een normale werking van het zenuwstelsel.",
      nutrients: ["Magnesium", "Omega-3", "Vezels"],
    },
    ctaLead: "Eet je genoeg van wat je slaap ondersteunt?",
  },
  stress: {
    heading: "Stress en wat je eet",
    intro:
      "Stress verlaag je met slaap, beweging en ontspanning. Voeding speelt mee: onder druk eet je vaak anders, en dat zie je zelf niet snel.",
    factors: ["Slaap", "Beweging en buitenlucht", "Adem- en rustmomenten", "Grenzen in je agenda"],
    today: [
      {
        title: "Regelmaat",
        body: "Maaltijden overslaan en later snacken geeft schommelingen in je energie. Vaste momenten maken je dag voorspelbaarder.",
      },
      {
        title: "Cafeïne en suiker",
        body: "Onder druk grijp je sneller naar koffie en snelle suikers. Let er vandaag eens op wanneer je dat doet.",
      },
    ],
    weeks: {
      body: "Op drukke weken eet je vaak eenzijdiger zonder het te merken. Magnesium, B-vitamines en omega-3 zijn stoffen waar je lichaam op leunt bij belasting. Of je ze binnenkrijgt, lees je af aan een week, niet aan een dag.",
      nutrients: ["Magnesium", "Vitamine B12", "Omega-3"],
    },
    ctaLead: "Krijg je onder druk binnen wat je lichaam nodig heeft?",
  },
  energie: {
    heading: "Energie komt grotendeels uit wat je eet",
    intro:
      "Energie hangt af van slaap, beweging, stress en herstel. Binnen die factoren is voeding de makkelijkste om bij te sturen.",
    factors: ["Slaap", "Beweging", "Stressbelasting", "Herstelmomenten"],
    today: [
      {
        title: "Eiwit bij je ontbijt",
        body: "Een ontbijt met voldoende eiwit houdt je energie stabieler dan alleen brood of zoet. Dat merk je dezelfde ochtend.",
      },
      {
        title: "Genoeg eten",
        body: "Te weinig eten, ook door een dieet, merk je als eerste aan je energie.",
      },
    ],
    weeks: {
      body: "IJzer en vitamine B12 dragen bij aan het verminderen van vermoeidheid. Wat je daarvan binnenkrijgt, schommelt per dag en telt op over weken. Pas over een paar weken zie je of je eetpatroon ze levert.",
      nutrients: ["Eiwit", "IJzer", "Vitamine B12"],
    },
    ctaLead: "Weet je wat er op je bord ontbreekt?",
  },
  herstel: {
    heading: "Herstel is ook een voedingsvraag",
    intro:
      "Herstel bepaal je met slaap, rust tussen inspanningen en de balans tussen training en belasting. Je lichaam bouwt daarbij op wat je eet.",
    factors: ["Slaap", "Rustdagen", "Opbouw van training", "Stress laag houden"],
    today: [
      {
        title: "Eiwit verdeeld over de dag",
        body: "Eiwit is de bouwstof voor spieren. Verdeel het over je maaltijden in plaats van alles bij het avondeten.",
      },
      {
        title: "Vocht en zout",
        body: "Bij veel zweten of zware dagen telt ook wat je drinkt. Water, en bij langere inspanning mineralen.",
      },
    ],
    weeks: {
      body: "Herstel is een optelsom. Of je over weken genoeg eiwit, omega-3 en magnesium binnenkrijgt, bepaalt waar je lichaam op kan bouwen. Eén goede dag zegt daar weinig over.",
      nutrients: ["Eiwit", "Omega-3", "Magnesium"],
    },
    ctaLead: "Krijgt je lichaam wat het nodig heeft om te herstellen?",
  },
  beweging: {
    heading: "Beweging vraagt brandstof",
    intro:
      "Beweging draait om regelmaat, kracht en herstel. Wat je eet bepaalt hoeveel je daarvan kunt volhouden.",
    factors: ["Dagelijks bewegen", "Krachttraining", "Rustdagen", "Slaap"],
    today: [
      {
        title: "Koolhydraten rond inspanning",
        body: "Training op een lege tank voelt zwaarder. Eet iets voor een langere of zwaardere sessie.",
      },
      {
        title: "Eiwit na je training",
        body: "Een stevige eiwitportie bij de maaltijd na je training helpt je spieren op te bouwen.",
      },
    ],
    weeks: {
      body: "Vanaf je dertigste loop je kracht en spiermassa terug zonder training en genoeg eiwit. Calcium is belangrijk voor je botten, zeker als je kracht en impact wilt blijven trainen. Beide tellen op over weken.",
      nutrients: ["Eiwit", "Calcium", "Magnesium"],
    },
    ctaLead: "Eet je genoeg om je beweging vol te houden?",
  },
  overgang: {
    heading: "Overgang en voeding",
    intro:
      "In de overgang verandert er veel tegelijk. Slaap, stress en beweging bepalen mee hoe je je voelt, en voeding is de factor waar je het meeste directe invloed op hebt.",
    factors: ["Slaap", "Stress", "Krachttraining", "Regelmaat in je dag"],
    today: [
      {
        title: "Cafeïne en alcohol in de avond",
        body: "Veel vrouwen slapen onrustiger na koffie of alcohol later op de dag. Houd ze eerder op de dag en kijk wat er verandert.",
      },
      {
        title: "Eiwit bij elke maaltijd",
        body: "Spiermassa neemt af naarmate je ouder wordt. Een eiwitportie bij elke maaltijd en krachttraining houden je sterk.",
      },
    ],
    weeks: {
      body: "Calcium is belangrijk voor sterke botten, juist rond en na de overgang. Magnesium past bij slaap en herstel. Of je ze binnenkrijgt, zie je pas in je eetpatroon over weken.",
      nutrients: ["Calcium", "Eiwit", "Magnesium"],
    },
    ctaLead: "Weet je of je genoeg binnenkrijgt van wat nu extra telt?",
  },
  testosteron: {
    heading: "Leefstijl achter je vitaliteit: zoom in op voeding",
    intro:
      "Je hormoonbalans hangt samen met slaap, stress, krachttraining en lichaamssamenstelling. Dat zijn de leefstijlfactoren die ertoe doen, voor mannen en vrouwen vanaf 30.",
    factors: ["Slaap", "Stress en herstel", "Krachttraining", "Lichaamssamenstelling"],
    today: [
      {
        title: "Genoeg eten en genoeg eiwit",
        body: "Langdurig te weinig eten of crashdiëten drukken je energie en herstel. Eiwit ondersteunt spierbehoud naast training.",
      },
      {
        title: "Op tijd eten",
        body: "Slaap is een grote hefboom voor je hormoonbalans. Een paar uur marge tussen je avondeten en bed helpt veel mensen beter te slapen.",
      },
    ],
    weeks: {
      body: "Vette vis, noten en olijfolie horen bij een eetpatroon dat past bij herstel en vitaliteit. Zink draagt bij aan een normaal testosterongehalte in het bloed bij voldoende inname; dat is geen belofte van verhoging. Wat telt, is wat je over weken eet.",
      nutrients: ["Eiwit", "Omega-3", "Magnesium"],
    },
    ctaLead: "Eet je genoeg van wat telt voor jouw vitaliteit?",
  },
};
