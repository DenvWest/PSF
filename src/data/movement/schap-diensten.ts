import type { SchapBasisCard } from "@/data/movement/schap-basis-cards";

/**
 * Vier dienst-categorieën voor de Diensten-tab van het schap — generiek,
 * zonder specifieke aanbieder. De prebuild (`favorieten-schap-prebuild-v3`
 * DIENST-object) noemt hier met naam genoemde bedrijven ("Kracht & Co",
 * "De Vliert") met een gefabriceerde review en een exacte afstand. Dat is
 * precies wat `schap-basis-cards.ts` al afwees voor de gratis kaarten: prima
 * als ontwerp-mockup, niet als publiek oordeel over een echte onderneming
 * (BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1 §H1, §L — de partnerkeuze staat nog
 * open). Deze categorieën beoordelen de aanpak, niet een specifieke
 * aanbieder — en dragen dus ook geen commissie-microcopy en geen
 * vergelijkingslink: die horen bij een echte, met-naam-genoemde partij.
 */
export const SCHAP_DIENST_CARDS: readonly SchapBasisCard[] = [
  {
    id: "pt-intake",
    badge: "Dienst · Begeleiding",
    title: "PT-intake bij een lokale trainer",
    why: "Iemand die je vorm en belasting live bijstuurt, is de snelste manier om fouten uit je basis te halen — vooral bij kracht, waar techniek meer uitmaakt dan bij wandelen.",
    quality: "Kijk of de trainer met een intake en een opbouwschema werkt, niet alleen losse sessies.",
    role: "Aanvulling op prioriteit 2 · kracht + basisconditie",
    verdict: {
      gecheckt: "Of één-op-één begeleiding voor jou meerwaarde heeft boven zelfstandig trainen.",
      sterk: "Directe correctie op techniek, en iemand die je opbouw bijhoudt.",
      zwak: "Prijs per sessie is hoger dan een abonnement, en de kwaliteit verschilt sterk per trainer.",
      oordeel: "Zinvol als startpunt voor prioriteit 2, overbodig zodra je schema en techniek staan.",
      micro: "Hier verdienen we niets aan. Dit is een categorie, geen specifieke aanbieder.",
    },
  },
  {
    id: "krachtgroep",
    badge: "Dienst · Groepsles",
    title: "Krachtgroep voor 45-plussers",
    why: "Een vaste avond met een groep maakt het makkelijker om twee keer per week te blijven komen dan een los abonnement.",
    quality: "Let op groepsgrootte — bij meer dan acht mensen per begeleider is er weinig ruimte voor individuele correctie.",
    role: "Aanvulling op prioriteit 2 · kracht + basisconditie",
    verdict: {
      gecheckt: "Of een vaste groep de opkomst verhoogt ten opzichte van zelfstandig trainen.",
      sterk: "Vaste avond en groepsdruk werken voor wie zelf moeilijk begint.",
      zwak: "Minder individuele aandacht dan een PT-intake, en het tempo ligt vast op de groep.",
      oordeel: "Sterke optie als het ritme je eerder ontbrak dan de kennis.",
      micro: "Hier verdienen we niets aan. Dit is een categorie, geen specifieke aanbieder.",
    },
  },
  {
    id: "traject",
    badge: "Dienst · Traject",
    title: "Online begeleiding op afstand",
    why: "Wekelijks contact zonder reistijd, met iemand die je schema aanpast op wat je terugkoppelt.",
    quality: "Vraag wat er na het traject overblijft — een programma dat abrupt stopt laat je zonder vervolgstap.",
    role: "Aanvulling op prioriteit 2-3 · opbouw en consistentie",
    verdict: {
      gecheckt: "Opzegtermijn, en wat er na de eerste periode overblijft.",
      sterk: "Flexibel in tijd, en goedkoper dan wekelijks fysiek begeleid worden.",
      zwak: "Geen live correctie op techniek — dat blijft aan jou over.",
      oordeel: "Goed voor wie structuur mist, minder geschikt als techniek je knelpunt is.",
      micro: "Hier verdienen we niets aan. Dit is een categorie, geen specifieke aanbieder.",
    },
  },
  {
    id: "baantjeszwemmen",
    badge: "Basis · Conditie",
    title: "Rustig baantjeszwemmen",
    why: "Een alternatief voor wandelen dat je gewrichten ontziet — met dezelfde regel: op spreektempo, niet op tijd.",
    quality: "Kies een rustig uur; in een druk bad haal je zelden je eigen tempo.",
    role: "Aanvulling naast je basis · prioriteit 1",
    verdict: {
      gecheckt: "Of dit tempo ook echt bijdraagt, los van hoe fris het voelt.",
      sterk: "Ontziet gewrichten, en telt mee voor je dagbasis net als wandelen.",
      zwak: "Vraagt een lidmaatschap of dagkaart, en niet elk zwembad heeft een rustig uur.",
      oordeel: "Aanrader naast je basis, geen vervanging voor krachtwerk.",
      micro: "Hier verdienen we niets aan. Dit is een categorie, geen specifieke aanbieder.",
    },
  },
];
