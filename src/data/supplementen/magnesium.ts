import type { SupplementData } from "@/types/supplementen";

export const magnesiumData: SupplementData = {
  slug: "magnesium",
  naam: "Magnesium",
  metaTitle: "Magnesium voor mannen 40+ | Vormen, dosering & advies | PerfectSupplement",
  metaDescription:
    "Welke magnesiumvorm past bij jou? Vergelijk glycinaat, citraat en meer. Praktisch advies voor mannen boven de 40.",
  h1: "Magnesium: welke vorm past bij jou?",
  introTekst:
    "Magnesium is betrokken bij meer dan 300 processen in je lichaam — van slaap tot spierherstel tot stressregulatie. Na je 40e neemt de opname af terwijl de behoefte gelijk blijft of toeneemt. Toch is niet elke magnesiumvorm hetzelfde.",

  watIsHet: {
    titel: "Wat doet magnesium in je lichaam?",
    tekst:
      "Magnesium is een mineraal dat je zenuwstelsel, spieren en energiehuishouding ondersteunt. Het speelt een sleutelrol bij de aanmaak van melatonine (je slaaphormoon) en bij het reguleren van cortisol (je stresshormoon). Veel mannen boven de 40 krijgen via voeding onvoldoende magnesium binnen — vooral bij stress, intensieve sport of alcoholgebruik neemt het verbruik toe.",
  },

  waaromRelevant: {
    titel: "Waarom is magnesium belangrijk na je 40e?",
    punten: [
      {
        titel: "Slaapkwaliteit",
        uitleg:
          "Magnesium activeert het parasympathisch zenuwstelsel — het systeem dat je lichaam helpt ontspannen voor het slapen.",
      },
      {
        titel: "Stressregulatie",
        uitleg:
          "Bij chronische stress verbruikt je lichaam meer magnesium, waardoor een tekort de stressrespons verder versterkt.",
      },
      {
        titel: "Spierfunctie & herstel",
        uitleg:
          "Essentieel voor spiercontractie en -ontspanning. Een tekort kan leiden tot krampen, stijfheid en trager herstel.",
      },
      {
        titel: "Energieproductie",
        uitleg:
          "Magnesium is nodig voor de omzetting van voedsel naar bruikbare energie (ATP). Zonder voldoende magnesium werkt dit proces minder efficiënt.",
      },
    ],
  },

  vormenDosering: {
    titel: "Welke vorm magnesium kies je?",
    vormen: [
      {
        naam: "Magnesium glycinaat",
        geschiktVoor: "Slaap & ontspanning",
        dosering: "200–400 mg elementair magnesium, 30–60 min voor het slapen",
        opmerking:
          "Goed verdragen, weinig darmproblemen. De glycine component heeft zelf ook een kalmerend effect.",
      },
      {
        naam: "Magnesium citraat",
        geschiktVoor: "Algemeen tekort aanvullen",
        dosering: "200–400 mg elementair magnesium per dag",
        opmerking:
          "Goede opname, breed beschikbaar. Kan bij hogere doseringen laxerend werken.",
      },
      {
        naam: "Magnesium tauraat",
        geschiktVoor: "Hart & bloedvaten",
        dosering: "200–400 mg per dag",
        opmerking:
          "Taurine ondersteunt hartfunctie. Interessant als cardiovasculaire gezondheid meespeelt.",
      },
      {
        naam: "Magnesium L-threonaat",
        geschiktVoor: "Cognitie & focus",
        dosering: "Volgens productlabel (dosering verschilt sterk)",
        opmerking:
          "Passeert de bloed-hersenbarrière. Relevant bij hersenmist of concentratieproblemen.",
      },
    ],
    disclaimer:
      "Dit is informatief bedoeld en geen medisch advies. Raadpleeg een arts of diëtist als je medicatie gebruikt of twijfelt over de juiste dosering.",
  },

  waarOpLetten: {
    titel: "Waar let je op bij het kiezen?",
    criteria: [
      {
        criterium: "Elementair magnesiumgehalte",
        uitleg:
          "Niet alle mg op het etiket is magnesium — check het elementaire gehalte, dat is wat je lichaam daadwerkelijk gebruikt.",
      },
      {
        criterium: "Vorm past bij je doel",
        uitleg:
          "Glycinaat voor slaap, citraat als alledaagse aanvulling, threonaat voor focus — kies op basis van wat je wilt verbeteren.",
      },
      {
        criterium: "Geen onnodige toevoegingen",
        uitleg:
          "Vermijd producten met veel vulstoffen, kunstmatige kleurstoffen of onnodige suikers.",
      },
      {
        criterium: "Dosering per capsule",
        uitleg:
          "Sommige producten vereisen 3–4 capsules per dag voor de aanbevolen dosis. Check of dat praktisch is voor jou.",
      },
    ],
  },

  gerelateerdeSymptomen: {
    titel: "Magnesium bij jouw klachten",
    links: [
      {
        symptoom: "Stress",
        tekst:
          "Magnesium ondersteunt de afbraak van cortisol en helpt je zenuwstelsel ontspannen.",
        href: "/symptomen/stress/oplossingen",
      },
      {
        symptoom: "Slaap",
        tekst:
          "Magnesium glycinaat wordt het meest aanbevolen bij slaapproblemen vanwege het kalmerende effect.",
        href: "/symptomen/slaap/oplossingen",
      },
      {
        symptoom: "Energie",
        tekst:
          "Als cofactor bij ATP-productie helpt magnesium je lichaam efficiënter energie vrijmaken.",
        href: "/symptomen/energie/oplossingen",
      },
    ],
  },

  faq: [
    {
      vraag: "Kan ik magnesium combineren met andere supplementen?",
      antwoord:
        "Ja, magnesium combineert goed met vitamine D (bevordert opname) en omega-3. Neem het bij voorkeur apart van ijzer- en calciumsupplementen, omdat die de opname kunnen verminderen.",
    },
    {
      vraag: "Wanneer merk ik effect?",
      antwoord:
        "Bij slaap merken veel mensen binnen 1–2 weken verschil. Bij stress en energie kan het 4–6 weken duren voordat je een consistent effect ervaart.",
    },
    {
      vraag: "Kan ik niet genoeg magnesium via voeding binnenkrijgen?",
      antwoord:
        "In theorie wel — noten, zaden, groene bladgroenten en volkoren bevatten magnesium. In de praktijk halen veel mannen boven de 40 het aanbevolen dagelijkse minimum niet, zeker bij stress of intensief sporten.",
    },
  ],

  blogLinks: [
    {
      href: "/blog/magnesium-en-slaapkwaliteit",
      titel: "Magnesium en slaapkwaliteit: wat zegt het onderzoek?",
    },
    {
      href: "/blog/cortisol-verlagen-natuurlijk",
      titel: "Cortisol verlagen: 5 bewezen methodes zonder medicatie",
    },
  ],
};
