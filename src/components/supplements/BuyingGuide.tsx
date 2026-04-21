import Link from "next/link";
import type { SupplementCategory } from "@/types/supplement";

type Props = {
  criteria: string[];
  category: SupplementCategory;
};

const CATEGORY_LABEL: Record<SupplementCategory, string> = {
  "omega-3": "omega-3 supplement",
  magnesium: "magnesiumvorm",
  ashwagandha: "ashwagandha supplement",
  "vitamine-d": "vitamine D supplement",
  creatine: "creatine supplement",
  zink: "zink supplement",
};

const OMEGA3_EXPLANATIONS: Record<string, string> = {
  "EPA/DHA per portie":
    "EPA (eicosapentaeenzuur) ondersteunt hart en ontstekingsbalans; DHA (docosahexaeenzuur) is essentieel voor hersenfunctie en het netvlies. Kijk altijd naar de werkzame hoeveelheid per portie — niet naar het totale visoliegewicht. Een goede omega-3 bevat minimaal 250 mg EPA+DHA per dag.",
  Transparantie:
    "Een transparant merk publiceert de exacte EPA- en DHA-waarden, de herkomst van de grondstof en idealiter onafhankelijke testresultaten (IFOS of vergelijkbaar). Zonder die informatie op het etiket is het onmogelijk om producten eerlijk te vergelijken.",
  Gebruiksgemak:
    "Consistent gebruik is belangrijker dan de perfecte dosis. Een product dat je niet volhoudt werkt niet. Kies een vorm — vloeibaar, gummies of capsules — die past bij jouw dagelijkse routine.",
  "Prijs/kwaliteit":
    "Een hogere prijs garandeert geen betere kwaliteit. Vergelijk altijd de kosten per gram EPA+DHA, niet de prijs van de verpakking. Vloeibare vormen zijn doorgaans goedkoper per gram dan gummies.",
};

const MAGNESIUM_EXPLANATIONS: Record<string, string> = {
  Opneembaarheid:
    "Niet alle magnesiumvormen worden even goed opgenomen. Bisglycinaat en tauraat scoren het hoogst; oxide het laagst. Check altijd het elementaire magnesiumgehalte per portie.",
  Slaapondersteuning:
    "Bisglycinaat is de favoriete keuze voor slaap vanwege de combinatie met glycine, een aminozuur dat ontspanning bevordert. Tauraat biedt vergelijkbare ondersteuning via een ander mechanisme.",
  Maagvriendelijkheid:
    "Magnesiumoxide en citraat kunnen bij hogere doseringen laxerend werken. Bisglycinaat en tauraat zijn doorgaans maagvriendelijker.",
  "Prijs/kwaliteit":
    "Citraat is de betaalbare optie met goede opneembaarheid. Bisglycinaat is duurder maar levert meer waarde voor slaap en ontspanning.",
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
    "KSM-66 is het meest onderzochte ashwagandha-extract voor cortisolverlaging, testosteron en sportieve prestaties. Sensoril heeft een hogere withanolideconcentratie en wordt vaker aanbevolen voor slaap. Generieke extracten zijn moeilijker te vergelijken omdat gestandaardisering vaak ontbreekt. Kies altijd een gepatenteerd extract als basis.",
  Dosering:
    "300 mg KSM-66 per dag is in meerdere gerandomiseerde studies effectief bewezen. 600 mg biedt ruimte voor een hogere behoefte zonder risico op bijwerkingen. Doseringen onder 250 mg KSM-66 zijn zelden onderzocht en bieden minder zekerheid over werkzaamheid.",
  "Prijs/kwaliteit":
    "Vergelijk niet op verpakkingsprijs maar op prijs per effectieve dag. Een product met 300 mg KSM-66 voor €0,42/dag versus 600 mg voor €0,23/dag: het tweede levert twee keer zoveel werkzame stof voor de helft van het geld. Bereken altijd prijs per mg gestandaardiseerd extract.",
  Transparantie:
    "Een transparant supplement vermeldt het exacte percentage withanoliden, het gebruikte extract-type en idealiter batchgewijze lab-uitslagen. Producten die alleen 'ashwagandha-poeder' of een vaag mg-getal vermelden zijn niet eerlijk te vergelijken met gestandaardiseerde extracten.",
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
  return (
    MAGNESIUM_EXPLANATIONS[criterium] ??
    "Zie onze methodologie voor de volledige uitleg van dit criterium."
  );
}

export function BuyingGuide({ criteria, category }: Props) {
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
