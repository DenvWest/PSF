import Link from "next/link";
import type { SupplementCategory } from "@/types/supplement";

type Props = {
  criteria: string[];
  category: SupplementCategory;
  /** Link naar Supplementgids (geen affiliate) */
  guideHref?: string;
};

const CATEGORY_LABEL: Record<SupplementCategory, string> = {
  "omega-3": "omega-3 supplement",
  magnesium: "magnesiumvorm",
  melatonine: "melatonine- of slaapcomplex-supplement",
  ashwagandha: "ashwagandha supplement",
  "vitamine-d": "vitamine D supplement",
  creatine: "creatine supplement",
  zink: "zink supplement",
  eiwitpoeder: "eiwitpoeder",
};

const OMEGA3_EXPLANATIONS: Record<string, string> = {
  "EPA/DHA per portie":
    "EPA en DHA dragen bij tot de normale werking van het hart (bij een inname van 250 mg EPA+DHA per dag). DHA draagt bovendien bij tot instandhouding van normale hersenfunctie en tot instandhouding van een normaal gezichtsvermogen (250 mg DHA per dag). Kijk naar de werkzame hoeveelheid per portie — niet naar het totale visoliegewicht.",
  Transparantie:
    "Een transparant merk publiceert de exacte EPA- en DHA-waarden, de herkomst van de grondstof en idealiter onafhankelijke testresultaten (IFOS of vergelijkbaar). Zonder die informatie op het etiket is het onmogelijk om producten eerlijk te vergelijken.",
  Gebruiksgemak:
    "Consistent gebruik is belangrijker dan de perfecte dosis. Een product dat je niet volhoudt werkt niet. Kies een vorm — vloeibaar, gummies of capsules — die past bij jouw dagelijkse routine.",
  "Prijs/kwaliteit":
    "Een hogere prijs garandeert geen betere kwaliteit. Vergelijk altijd de kosten per gram EPA+DHA, niet de prijs van de verpakking. Vloeibare vormen zijn doorgaans goedkoper per gram dan gummies.",
};

const MELATONINE_EXPLANATIONS: Record<string, string> = {
  Biobeschikbaarheid:
    "Biobeschikbaarheid (25%): hoe goed neemt je lichaam het op? Daarvoor kijken we naar vorm (capsule, tablet, vegicap) en naar time-release. Capsules en vegicaps zijn doorgaans prettig om in te nemen; tabletten kunnen iets trager zijn. Bij complexen tellen ook extractkwaliteit en standaardisering (zoals KSM-66) voor voorspelbare werking.",
  "Dosering & werkzame stoffen":
    "Dosering en werkzame stoffen (30%): sluiten de hoeveelheden aan bij wat klinisch en in richtlijnen gangbaar is besproken? Bij melatonine hebben lage, fysiologische doses vaak de voorkeur boven hoge doses uit de schappen. Bij blends beoordelen we óf doseringen duidelijk op het etiket staan — zonder medische claims over uitkomsten.",
  "Prijs-kwaliteit":
    "Prijs-kwaliteit (25%): wat krijg je voor je geld per maand? Soms is een goedkoop puur melatonineproduct de slimste keuze; soms rechtvaardigt een slaapcomplex de meerprijs doordat het meerdere routes tegelijk ondersteunt.",
  Transparantie:
    "Transparantie (20%): zijn doseringen zichtbaar en is er kwaliteits- of labinformatie? Bij huismerken en multi-ingrediëntformules is transparantie extra belangrijk om eerlijk te kunnen vergelijken.",
};

const MAGNESIUM_EXPLANATIONS: Record<string, string> = {
  Vormkwaliteit:
    "Bisglycinaat, citraat en tauraat zijn gangbare organisch gebonden vormen; oxide wordt minder goed opgenomen. Check altijd het elementaire magnesiumgewicht per portie — daar vergelijk je eerlijk op.",
  Dosering:
    "Elementair magnesium is wat telt voor vergelijking met de ADH en veilige bovengrenzen. Complexen combineren vormen; je wilt weten of de totale elementaire mg bij je routine past.",
  Transparantie:
    "Transparante merken vermelden vormen, elementaire mg en zo nodig vulstoffen. Als alleen 'magnesiumcomplex' staat zonder opdeling is vergelijken lastiger.",
  "Prijs/kwaliteit":
    "Bereken de prijs per dag per elementair magnesium. Citraat wint vaak op kosten; bisglycinaat kan duurder per mg zijn maar past bij voorkeur voor maagcomfort en capsulevorm.",
};

const VITAMINED_EXPLANATIONS: Record<string, string> = {
  "Kwaliteit/vorm":
    "Kies altijd voor D3 (cholecalciferol) boven D2 (ergocalciferol). D3 is identiek aan de vorm die je huid aanmaakt bij zonlicht en verhoogt je bloedwaarden aantoonbaar effectiever. Keurmerken zoals Quali-D garanderen dat de cholecalciferol aan strikte zuiverheids- en stabiliteitseisen voldoet.",
  Dosering:
    "25 mcg (1000 IU) is voldoende voor dagelijks onderhoud bij mensen met matige zonblootstelling. Bij bewezen tekort (bloedwaarde < 50 nmol/L) of in de wintermaanden kan 50–75 mcg zinvol zijn. Laat bij twijfel je 25(OH)D-bloedwaarden meten voordat je hogere doseringen kiest.",
  "Prijs/kwaliteit":
    "Vitamine D is een van de meest betaalbare supplementen. Vergelijk de prijs per dag, niet de prijs van de verpakking. Een product met Quali-D keurmerk voor €0,14/dag levert meer zekerheid dan een goedkopere variant zonder kwaliteitsgarantie.",
  Transparantie:
    "Een transparant vitamine D-supplement vermeldt de exacte hoeveelheid in mcg én IU, de bron (cholecalciferol of levertraan), eventuele drager (olijfolie verhoogt opname) en idealiter een kwaliteitskeurmerk. Producten die alleen een vaag 'vitamine D' vermelden zonder bron of eenheid bieden onvoldoende zekerheid.",
};

const ASHWAGANDHA_EXPLANATIONS: Record<string, string> = {
  "Extract kwaliteit":
    "Wij beoordelen genoemd extracttype, withanolidepercentage en plantdeel. In de EU zijn gezondheidsclaims voor ashwagandha nog niet definitief afgerond (on-hold); je vergelijkt daarom vooral specificaties en betrouwbaarheid op het etiket.",
  Dosering:
    "Let op mg extract per dag en of fabrikant de standaardisatie steekt. Onderzoek gebruikt uiteenlopende doses; dat is geen garantie voor een persoonlijke uitkomst buiten onderzoekscontext.",
  "Prijs/kwaliteit":
    "Bereken de prijs per mg vermeld extract en per dagdosering. Twee potten met dezelfde merknaam-ingrediënt kunnen sterk verschillen in hoeveel werkzame stof je per euro krijgt.",
  Transparantie:
    "Batchinformatie, LAB-testen en exacte withanolide-% maken producten vergelijkbaar. Vage 'extract' zonder standaardisatie maakt een eerlijke vergelijking moeilijk.",
};

const EIWEITPOEDER_EXPLANATIONS: Record<string, string> = {
  "Biobeschikbaarheid (25%)":
    "Hoe snel en volledig neemt je lichaam het eiwit op? Whey (zeker isolaat en hydrolysaat) scoort hier doorgaans het hoogst; goed samengestelde plantaardige blends kunnen dichtbij komen. In onze methodiek weegt de verwachte opname en verteerbaarheid per portie zwaar mee.",
  "Dosering & eiwitgehalte (30%)":
    "Hoeveel gram eiwit zit er per serving, en sluit het aminozurenprofiel aan bij wat je nodig hebt voor herstel? We letten op eiwitpercentage per scoop, relevante hoeveelheid per portie en of de essentiële aminozuren gedekt zijn — niet op marketingclaims.",
  "Prijs-kwaliteit (25%)":
    "Wat betaal je per gram daadwerkelijk eiwit — niet per mooie verpakking? Een duurder isolaat kan per portie toch goedkoper uitpakken dan een goedkoper concentraat met veel opvulling. We vergelijken daarom op waarde voor je dagelijkse routine.",
  "Transparantie (20%)":
    "Zijn ingrediënten, eiwitbronnen en zo nodig allergenen duidelijk vermeld? Tellen reviews, certificeringen en merkreputatie mee? Transparantie helpt inschatten of je krijgt wat op het etiket staat.",
};

const ZINK_EXPLANATIONS: Record<string, string> = {
  Biobeschikbaarheid:
    "Organisch gebonden zinkvormen zoals zinkmethionine en zinkpicolinaat worden aanzienlijk beter opgenomen dan anorganisch zink (oxide, sulfaat). Zinkoxide heeft slechts ~5% absorptie. Kies altijd een organische vorm. L-OptiZinc® (zinkmethionine) heeft klinische studies achter de naam; regulier zinkmethionine gebruikt hetzelfde principe zonder het patent. Beide zijn goed opneembaar.",
  Dosering:
    "De aanbevolen dagelijkse hoeveelheid (ADH) voor mannen is 9,4 mg. Supplementen doseren doorgaans 15–25 mg. Bij 15 mg zit je veilig voor langdurig gebruik. Boven 25 mg per dag is voorzichtigheid geboden: langdurig hoge zinkinname kan de koperabsorptie belemmeren omdat zink en koper concurreren om dezelfde transporter in de darmwand.",
  "Prijs/kwaliteit":
    "Vergelijk de prijs per dag — niet de verpakkingsprijs. Met zinkmethionine of picolinaat zit je al voor €0,16–0,19 per dag. De meerwaarde van een gepatenteerde vorm zoals L-OptiZinc® ligt in de klinische documentatie, niet noodzakelijk in een hogere absorptie ten opzichte van regulier zinkmethionine.",
  Transparantie:
    "Een transparant zinksupplement vermeldt de exacte zinkvorm (niet slechts 'zink'), het elemental zinc gehalte per dosis, de procentuele bijdrage aan de RI en idealiter onafhankelijke lab-resultaten. Vermeldingen als 'zinkoxide' of 'zinksulfaat' zonder toelichting zijn een signaal voor een goedkopere, minder opneembare grondstof.",
};

const CREATINE_EXPLANATIONS: Record<string, string> = {
  Zuiverheid:
    "Creatine monohydraat is de meest onderzochte en bewezen vorm. Andere vormen (HCL, ethyl ester, buffered creatine) hebben ondanks hogere prijzen geen bewezen meerwaarde in goed opgezette studies. Kies altijd voor monohydraat. Creapure® — geproduceerd door AlzChem in Duitsland — garandeert de hoogste zuiverheidsstandaard (>99,99%) met farmaceutische kwaliteitscontrole.",
  "Dosering/gemak":
    "De wetenschappelijke consensus is 3–5 gram per dag. Een laadschema (20 g/dag gedurende 5–7 dagen) verzadigt de creatinedepo's sneller maar is niet noodzakelijk. Bij 5 g/dag is volledige verzadiging na 3–4 weken bereikt. Poedervorm biedt de meest flexibele dosering en is goedkoper per gram dan capsules.",
  "Prijs/kwaliteit":
    "Vergelijk altijd de prijs per gram of prijs per dag — niet de verpakkingsprijs. Een grotere verpakking (500 g) levert doorgaans de scherpste prijs per dag. Generieke creatine monohydraat van micronized kwaliteit (200 mesh) is uitstekend oplosbaar en biedt dezelfde werkzaamheid als duurdere gecertificeerde varianten voor de meeste gebruikers.",
  Transparantie:
    "Een transparant creatinesupplement vermeldt de zuiverheidsnorm (bijv. micronized 200 mesh), het type creatine (monohydraat) en idealiter een kwaliteitskeurmerk. Creapure® is het enige creatine dat in Europa wordt geproduceerd en biedt aantoonbare garantie op afwezigheid van verontreinigingen zoals dicyandiamide en dihydrotriazine.",
};

function getExplanation(
  criterium: string,
  category: SupplementCategory,
): string {
  if (category === "omega-3") {
    return (
      OMEGA3_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  if (category === "ashwagandha") {
    return (
      ASHWAGANDHA_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  if (category === "vitamine-d") {
    return (
      VITAMINED_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  if (category === "creatine") {
    return (
      CREATINE_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  if (category === "zink") {
    return (
      ZINK_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  if (category === "melatonine") {
    return (
      MELATONINE_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  if (category === "eiwitpoeder") {
    return (
      EIWEITPOEDER_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  return (
    MAGNESIUM_EXPLANATIONS[criterium] ??
    "Zie onze methodologie voor de volledige uitleg van dit criterium."
  );
}

export function BuyingGuide({ criteria, category, guideHref }: Props) {
  const categoryLabel = CATEGORY_LABEL[category];

  return (
    <section className="mx-auto max-w-4xl px-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        Hoe kies je de juiste {categoryLabel}?
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Geen marketing — dit zijn de criteria die er echt toe doen.
      </p>

      <div className="mt-6 space-y-6">
        {criteria.map((criterium) => (
          <div key={criterium}>
            <h3 className="text-base font-semibold text-slate-900">
              {criterium}
            </h3>
            <p className="mt-1.5 text-sm leading-7 text-slate-600">
              {getExplanation(criterium, category)}
            </p>
          </div>
        ))}
      </div>

      {guideHref ? (
        <p className="mt-6 text-sm text-slate-600">
          Wil je eerst begrijpen welke vorm bij jou past?{" "}
          <Link
            href={guideHref}
            className="font-medium text-slate-900 underline decoration-slate-900/30 underline-offset-[3px] hover:decoration-slate-900/60"
          >
            Lees de volledige gids →
          </Link>
        </p>
      ) : null}

      <p className="mt-6 text-sm text-slate-500">
        Benieuwd hoe we beoordelen?{" "}
        <Link
          href="/methodologie"
          className="font-medium text-slate-700 underline-offset-2 hover:underline"
        >
          Lees onze methodologie
        </Link>
        .
      </p>
    </section>
  );
}
