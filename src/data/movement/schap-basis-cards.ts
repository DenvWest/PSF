/**
 * De gratis, geen-aanbieder-kaarten uit het schap (scherm B in
 * beweging-keuze-consumentenbond-prebuild-v3.6, `CARDS` r.1153) — woordelijk
 * overgenomen, ID's `wandelen` en `ritme`.
 *
 * De vier `dienst`-kaarten uit diezelfde array (pt-intake, krachtgroep,
 * baantjes, keten) staan hier BEWUST niet bij. Ze noemen een specifiek
 * bedrijf met een gefabriceerde review en een exacte afstand ("1,8 km") —
 * prima als ontwerp-mockup, niet als iets dat we live over een echte
 * onderneming beweren. `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md`
 * §L noemt de partnerkeuze zelf nog als open besluit voor Dennis, en §D4
 * verwerpt bovendien exacte kilometers ten gunste van afstandsbanden. Die
 * laag komt zodra dat besluit er is — niet eerder.
 */
export type SchapBasisCard = {
  id: "wandelen" | "ritme";
  badge: string;
  title: string;
  why: string;
  quality: string;
  role: string;
  verdict: {
    gecheckt: string;
    sterk: string;
    zwak: string;
    oordeel: string;
    micro: string;
  };
};

export const SCHAP_BASIS_CARDS: readonly SchapBasisCard[] = [
  {
    id: "wandelen",
    badge: "Basis · Conditie",
    title: "Stevig wandelen, 3× 30 minuten",
    why: "Je zit het grootste deel van je dag. Dit tilt je dagbasis omhoog zonder je krachtdagen zwaarder te maken — je kunt praten, maar niet zingen.",
    quality: "Getoetst op intensiteit (spreektest) en volhoudbaarheid",
    role: "Aanvulling naast je basis — of vervanging, als je dat wilt",
    verdict: {
      gecheckt: "Of dit op dit tempo ook echt iets doet, en of het je krachtdagen niet in de weg zit.",
      sterk: "Geen materiaal, geen abonnement, geen reistijd. Op spreektempo tilt dit je dagbasis omhoog en het herstel tussen je krachtdagen mee.",
      zwak: "Voor spierbehoud doet wandelen weinig. Wie hier zijn krachtwerk mee vervangt, houdt zijn spiermassa niet vast.",
      oordeel: "Aanrader ernaast, geen vervanging. Van deze lijst de sterkste optie die je vandaag nog kunt beginnen.",
      micro: "Hier verdienen we niets aan. Dat verandert niets aan hoe we het beoordelen, en niets aan waar het staat.",
    },
  },
  {
    id: "ritme",
    badge: "Basis · Dagelijks ritme",
    title: "Elk werkuur twee minuten staan",
    why: "De kleinste stap op deze lijst, en de enige die vandaag al kan. Werkt tegen de stijfheid die je bij de check als eerste noemde.",
    quality: "Getoetst op drempel · geen materiaal, geen planning",
    role: "Aanvulling naast je basis",
    verdict: {
      gecheckt: "Of het onderbreken van lang zitten los van je training iets oplevert, en of het vol te houden is naast werk.",
      sterk: "Nul drempel, nul kosten, en het werkt op het stuk van je dag dat het grootst is. Voor stijfheid is dit de directste ingreep die er is.",
      zwak: "Het beweegt je score nauwelijks: op je beweegscore telt dit licht mee. En zonder herinnering vergeet vrijwel iedereen het na week twee.",
      oordeel: "Aanrader, maar verwacht er geen conditie of spiermassa van. Dit is comfort en gewoontevorming, geen training.",
      micro: "Hier verdienen we niets aan. Dat verandert niets aan hoe we het beoordelen, en niets aan waar het staat.",
    },
  },
];
