import Link from "next/link";
import {
  EVIDENCE_DOSE,
  FORM_BIOAVAILABILITY,
  QUALITY_MARKERS,
  LABEL_POINTS,
  PS_SCORE_MODEL_DATE,
  PS_SCORE_MODEL_VERSION,
  SCORE_COMPONENT_LABELS,
  SCORE_WEIGHTS,
  TIER_LABELS,
  TIER_POINTS,
  TOETSING_POINTS,
} from "@/data/supplement-hub/score-model";
import type {
  BioavailabilityTier,
  ScoreComponentId,
} from "@/types/supplement-score";

const COMPONENT_TOELICHTING: Record<ScoreComponentId, string> = {
  claimdekking:
    "Hoeveel van de erkende EU-claims die vóór deze stof bestaan, ontsluit déze dagdosering. Voor magnesium en zink is dat alles of niets, want daar geldt één drempel. Bij omega-3 niet: naast de 250 mg EPA+DHA voor de hartclaim staat een aparte drempel van 250 mg DHA voor de hersen- en gezichtsclaim, en een olie met veel EPA en weinig DHA haalt die niet.",
  dosering:
    "De dagdosering op het etiket, afgezet tegen de dosering waarbij het aangehaalde onderzoek effect laat zien. Blijft een product daaronder, dan schaalt de score evenredig mee. Gaat het boven de aanvaardbare bovengrens, dan volgt aftrek — hoger is hier niet beter.",
  vorm: "De chemische vorm of het extract. De inschatting per vorm staat één keer vast en geldt voor elk product met die vorm, dus niet per product opnieuw bepaald.",
  transparantie:
    "Vier feiten die je zelf op de verpakking nakijkt: staat het werkzame gehalte in een getal, staat er een dagdosering, is de samenstelling per vorm uitgesplitst, en gaat er niets schuil in een proprietary blend.",
  toetsing:
    "Is het eindproduct getoetst door een partij buiten de fabrikant, en dekt een grondstofkeurmerk de zuiverheid. Dit onderdeel meet of een merk zich extern laat controleren en dat ook publiceert — het is geen eigen meting van ons. Ontbreekt beide, dan vaar je op wat de fabrikant zelf zegt.",
};

const CATEGORY_LABELS: Record<string, string> = {
  magnesium: "Magnesium",
  "omega-3": "Omega-3",
  "vitamine-d": "Vitamine D",
  zink: "Zink",
  creatine: "Creatine",
  ashwagandha: "Ashwagandha",
  eiwitpoeder: "Eiwitpoeder",
};

const TIER_ORDER: BioavailabilityTier[] = ["hoog", "goed", "gemiddeld", "laag"];

const WEIGHT_COLORS = ["#3E6E4C", "#4A7F5A", "#5A8F6A", "#6B9B78", "#8FB59A"] as const;

function formatAmount(value: number, eenheid: string): string {
  return `${value} ${eenheid === "ug" ? "µg" : eenheid}`;
}

const h2Class =
  "font-display text-2xl font-bold text-stone-900 md:text-3xl";
const leadClass = "mt-3 max-w-2xl text-base leading-relaxed text-stone-600";

export default function PsScoreUitleg() {
  const componenten = Object.keys(SCORE_WEIGHTS) as ScoreComponentId[];

  return (
    <div className="space-y-16 md:space-y-20">
      <section aria-labelledby="uitgangspunten">
        <h2 id="uitgangspunten" className={h2Class}>
          Drie uitgangspunten
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-stone-900">
              Berekend, niet ingetypt
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Elk onderdeel volgt uit een feit dat op het etiket staat of uit
              onze registratie van Europees goedgekeurde gezondheidsclaims.
              Daarom kunnen we bij elk cijfer laten zien waar het vandaan komt,
              en levert hetzelfde product altijd dezelfde score op.
            </p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-stone-900">
              Prijs zit er niet in
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Een kwaliteitsscore die meebeweegt met wat iets kost, meet twee
              dingen tegelijk en laat je ze niet meer los afwegen. Kosten krijgen
              een eigen rang. Een technische test blokkeert dat prijs-, verkoper-
              of commissiegegevens de berekening ooit binnenkomen.
            </p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-stone-900">
              Niet weten is geen nul
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Kunnen we een onderdeel niet vaststellen — bijvoorbeeld omdat het
              elementaire gehalte niet op het etiket staat — dan valt dat
              onderdeel weg en verdelen we het gewicht over de rest. Op de kaart
              staat dan dat het onbekend is, niet dat het slecht is.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="onderdelen">
        <h2 id="onderdelen" className={h2Class}>
          De vijf onderdelen
        </h2>
        <p className={leadClass}>
          Samen vormen ze de score van 0 tot 100. De verhouding is voor elke
          categorie gelijk.
        </p>

        <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-stone-100">
          {componenten.map((id, index) => (
            <div
              key={id}
              className="h-full"
              style={{
                width: `${SCORE_WEIGHTS[id] * 100}%`,
                backgroundColor: WEIGHT_COLORS[index % WEIGHT_COLORS.length],
              }}
              title={`${SCORE_COMPONENT_LABELS[id]} ${Math.round(SCORE_WEIGHTS[id] * 100)}%`}
            />
          ))}
        </div>

        <ul className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {componenten.map((id, index) => (
            <li key={id} className="px-5 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-stone-900">
                  <span
                    className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: WEIGHT_COLORS[index % WEIGHT_COLORS.length],
                    }}
                    aria-hidden="true"
                  />
                  {SCORE_COMPONENT_LABELS[id]}
                </h3>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                  {Math.round(SCORE_WEIGHTS[id] * 100)}%
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {COMPONENT_TOELICHTING[id]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="claim">
        <h2 id="claim" className={h2Class}>
          Twee verschillende vragen over dezelfde claim
        </h2>
        <p className={leadClass}>
          Eén ervan levert punten op, de andere niet. Dat onderscheid is de kern
          van hoe wij naar EU-claims kijken.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              Geen punten — een toestand
            </p>
            <h3 className="mt-1.5 font-display text-base font-semibold text-stone-900">
              Mág dit product zijn claim voeren?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Dat is een drempel, geen glijdende schaal: er bestaat niet zoiets
              als &ldquo;meer claim&rdquo;. Daarom staat die uitkomst als label
              op de kaart en niet als punten in de score. Bij mineralen ligt de
              drempel op 15% van de dagelijkse referentie-inname; vrijwel elk
              serieus product haalt hem.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              Wél punten — een aandeel
            </p>
            <h3 className="mt-1.5 font-display text-base font-semibold text-stone-900">
              Hoeveel van wat de stof kán bieden, ontsluit deze dosering?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Dit is wél een gradient. Voor omega-3 staan drie claims op de
              Europese lijst: de hartclaim vanaf 250 mg EPA+DHA, en een hersen-
              en een gezichtsclaim die elk apart 250 mg DHA vragen. Een olie met
              veel EPA en weinig DHA ontsluit er één van de drie. Dat verschil is
              echt, dus telt het mee.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <p className="text-sm leading-relaxed text-stone-600">
            De dosering meten we bewust níet tegen de wettelijke ondergrens maar
            tegen de onderzoeksdosis. De claimdrempel bepaalt wat een fabrikant
            op de verpakking mag zetten; hij zegt weinig over de vraag of de
            dosering in de buurt komt van wat onderzoek gebruikte.
          </p>
          <p className="text-sm leading-relaxed text-stone-600">
            Waar de claim wél doorwerkt is in de kosten: we rekenen{" "}
            <strong>prijs per claim-conforme dag</strong>. Doseert een product
            onder de drempel, dan heb je er meer van nodig en stijgt de dagprijs
            navenant. Een goedkoop potje dat te laag doseert is dus niet
            goedkoop. Bestaat er voor het ingrediënt geen erkende claim — zoals
            bij ashwagandha en eiwit — dan rekenen we per etiketdag en zegt het
            label dat er ook bij.
          </p>
        </div>
      </section>

      <section aria-labelledby="onderzoeksdosis">
        <h2 id="onderzoeksdosis" className={h2Class}>
          Onderzoeksdosis per categorie
        </h2>
        <p className={leadClass}>
          De dosering waartegen we meten, en waar die waarde vandaan komt.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs text-stone-500">
                <th scope="col" className="px-5 py-3 font-medium">
                  Categorie
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Onderzoeksdosis
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Bovengrens
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Herkomst
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {Object.entries(EVIDENCE_DOSE).map(([category, evidence]) =>
                evidence ? (
                  <tr key={category} className="align-top">
                    <th
                      scope="row"
                      className="px-5 py-4 font-semibold text-stone-900"
                    >
                      {CATEGORY_LABELS[category] ?? category}
                    </th>
                    <td className="px-5 py-4 text-stone-700">
                      <span className="font-medium tabular-nums">
                        {formatAmount(evidence.onderzoeksdosis, evidence.eenheid)}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-400">
                        {evidence.omschrijving}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium tabular-nums text-stone-700">
                      {formatAmount(evidence.bovengrens, evidence.eenheid)}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-stone-500">
                      {evidence.bron}
                    </td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="vormen">
        <h2 id="vormen" className={h2Class}>
          Opneembaarheid per vorm
        </h2>
        <p className={leadClass}>
          Elke vorm krijgt één vaste inschatting, met de reden erbij. Die geldt
          voor elk product met die vorm — we beoordelen dus niet per merk
          opnieuw.
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {TIER_ORDER.map((tier) => (
            <li key={tier} className="text-sm text-stone-600">
              <span className="font-medium text-stone-800">
                {TIER_LABELS[tier]}
              </span>
              <span className="ml-2 tabular-nums text-stone-400">
                {TIER_POINTS[tier]} punten
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-8">
          {Object.entries(FORM_BIOAVAILABILITY).map(([category, forms]) => {
            const entries = Object.entries(forms);
            if (entries.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="font-display text-lg font-semibold text-stone-900">
                  {CATEGORY_LABELS[category] ?? category}
                </h3>
                <ul className="mt-3 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
                  {entries.map(([formKey, form]) => (
                    <li key={formKey} className="px-5 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {form.label}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                          {TIER_LABELS[form.tier]} · {TIER_POINTS[form.tier]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                        {form.onderbouwing}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="markers">
        <h2 id="markers" className={h2Class}>
          Kwaliteitsmarkers per categorie
        </h2>
        <p className={leadClass}>
          Sommige toetsen bestaan alleen waar ze ergens over gaan. Creatinepoeder
          oxideert niet, dus daar een oxidatiewaarde eisen zou het onterecht
          straffen. Deze markers tellen mee in &ldquo;onafhankelijke
          toetsing&rdquo;, maar alleen in de categorie waar ze van toepassing
          zijn — en waar dat niet zo is, krimpt de noemer mee.
        </p>

        <div className="mt-6 space-y-6">
          {Object.entries(QUALITY_MARKERS).map(([category, markers]) => {
            if (markers.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="font-display text-lg font-semibold text-stone-900">
                  {CATEGORY_LABELS[category] ?? category}
                </h3>
                <ul className="mt-3 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
                  {markers.map((marker) => (
                    <li key={marker.key} className="px-5 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {marker.label}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                          {marker.punten} punten
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                        {marker.waarom}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-4 max-w-3xl rounded-xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          Op dit moment staat elke marker bij elk product op &ldquo;niet
          vermeld&rdquo;. Dat is geen slordigheid van ons maar een bevinding:
          geen van deze fabrikanten publiceert een oxidatiewaarde of een
          verontreinigingsrapport dat wij hebben kunnen inzien. We vullen een
          marker pas in als we de gepubliceerde waarde zelf hebben gezien.
        </p>
      </section>

      <section aria-labelledby="punten">
        <h2 id="punten" className={h2Class}>
          Etiket en toetsing in punten
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-stone-900">
              Etikettransparantie
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li className="flex justify-between gap-3">
                <span>Werkzaam gehalte in een getal</span>
                <span className="tabular-nums text-stone-400">
                  {LABEL_POINTS.werkzameStofGekwantificeerd}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Expliciete dagdosering</span>
                <span className="tabular-nums text-stone-400">
                  {LABEL_POINTS.dagdoseringVermeld}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Samenstelling per vorm uitgesplitst</span>
                <span className="tabular-nums text-stone-400">
                  {LABEL_POINTS.samenstellingUitgesplitst}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Geen proprietary blend</span>
                <span className="tabular-nums text-stone-400">
                  {LABEL_POINTS.geenProprietaryBlend}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-stone-900">
              Onafhankelijke toetsing
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li className="flex justify-between gap-3">
                <span>Onafhankelijk labonderzoek</span>
                <span className="tabular-nums text-stone-400">
                  {TOETSING_POINTS.thirdPartyTested}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Per erkend grondstofkeurmerk</span>
                <span className="tabular-nums text-stone-400">
                  +{TOETSING_POINTS.perKeurmerk}
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              Merkgebonden grondstofstandaarden zoals Creapure®, Quali-D® en
              L-OptiZinc® tellen hier mee: de chemische vorm eronder is gewoon
              monohydraat, cholecalciferol of zinkmethionine, dus het onderdeel
              &ldquo;vorm&rdquo; beloont ze niet al. Gestandaardiseerde
              plantextracten zoals KSM-66® tellen hier juist níet mee — bij een
              botanical ís de standaardisatie de vorm. Eén feit hoort één keer te
              scoren.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="grenzen">
        <h2 id="grenzen" className={h2Class}>
          Wat model {PS_SCORE_MODEL_VERSION} nog niet meet
        </h2>
        <p className={leadClass}>
          Een score die zijn eigen gaten niet noemt, is een verkooppraatje.
        </p>
        <ul className="mt-6 space-y-4">
          <li className="rounded-2xl bg-[#F7F5F0] px-6 py-5">
            <h3 className="text-sm font-semibold text-stone-900">
              Wij laten zelf geen potjes analyseren
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Elk cijfer hierboven komt uit gegevens die al bestaan en die jij
              kunt nalopen: het etiket, de Europese lijst van goedgekeurde
              claims, en labrapporten die fabrikanten zelf publiceren. We kopen
              geen producten om ze op eigen kosten door een laboratorium te
              laten narekenen. Dat heeft één concrete consequentie: het
              onderdeel <em>onafhankelijke toetsing</em> meet of een merk zich
              extern laat controleren én dat laat zien — niet of de inhoud van
              dat potje klopt. Een fabrikant die wél test maar niets
              publiceert, scoort hier dus lager dan hij verdient.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Eigen labanalyses zijn de logische volgende stap voor dit model.
              Komen ze er, dan worden ze een apart onderdeel met een eigen
              versienummer, met het meetrapport erbij — geen stille bijstelling
              van bestaande cijfers.
            </p>
          </li>
          <li className="rounded-2xl bg-[#F7F5F0] px-6 py-5">
            <h3 className="text-sm font-semibold text-stone-900">
              Versheid van visolie in een getal
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              De plek ervoor bestaat sinds model 1.1.0 — zie de kwaliteitsmarkers
              hierboven — maar geen enkele fabrikant in onze vergelijking
              publiceert een oxidatiewaarde. Zolang dat zo is, kunnen we versheid
              alleen als ontbrekend tonen, niet als verschil.
            </p>
          </li>
          <li className="rounded-2xl bg-[#F7F5F0] px-6 py-5">
            <h3 className="text-sm font-semibold text-stone-900">
              Waar een olie voor geschikt is
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              De EPA:DHA-verhouding telt sinds model 1.1.0 indirect mee, via de
              aparte DHA-drempel in de claimdekking. Maar of jij meer aan EPA of
              aan DHA hebt, hangt van je doel af — en dat kan geen enkele score
              voor je beslissen.
            </p>
          </li>
          <li className="rounded-2xl bg-[#F7F5F0] px-6 py-5">
            <h3 className="text-sm font-semibold text-stone-900">
              Smaak, gemak en verpakkingsformaat
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Dat zijn voorkeuren, geen kwaliteit. Ze horen in een keuzehulp, niet
              in een ranglijst.
            </p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="versie">
        <h2 id="versie" className={h2Class}>
          Versie en verhouding tot onze andere beoordelingen
        </h2>
        <p className={leadClass}>
          Dit is model {PS_SCORE_MODEL_VERSION}, vastgesteld op{" "}
          {PS_SCORE_MODEL_DATE}. Wijzigt het model, dan wijzigt de versie en
          herberekenen we alles — zoals we dat ook doen bij de regels achter de
          Leefstijlcheck.
        </p>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="font-display text-base font-semibold text-stone-900">
            Wat veranderde in 1.1.0
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-stone-600">
            <li>
              <strong>Claimdekking erbij, als vijfde onderdeel (20%).</strong>{" "}
              De andere gewichten schoven mee terug.
            </li>
            <li>
              <strong>
                De onderzoeksdosis voor omega-3 ging van 500 naar 1000 mg
                EPA+DHA.
              </strong>{" "}
              Dat was een fout in 1.0.0: 500 mg is de algemene
              innameaanbeveling, niet de dosering waarbij het onderzoek dat wij
              aanhalen effect laat zien. Onze eigen definitie vroeg om het
              tweede getal.
            </li>
            <li>
              <strong>Kwaliteitsmarkers per categorie.</strong> Oxidatiewaarde en
              verontreinigingstest kregen een plek in de toetsing, alleen waar ze
              van toepassing zijn.
            </li>
          </ul>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          De redactionele beoordeling op onze{" "}
          <Link
            href="/beste/magnesium"
            className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] hover:decoration-ps-green"
          >
            vergelijkingspagina&rsquo;s
          </Link>{" "}
          staat hier los van en gebruikt een eigen schaal van 0 tot 10, met een
          redacteur die ook smaak, gemak en verkrijgbaarheid meeweegt. De
          PS-Score doet dat bewust niet. Waar beide een oordeel geven, kun je ze
          naast elkaar leggen. Meer over onze werkwijze staat op{" "}
          <Link
            href="/methodologie"
            className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] hover:decoration-ps-green"
          >
            de methodologiepagina
          </Link>
          , en hoe we met affiliate-inkomsten omgaan op{" "}
          <Link
            href="/affiliate-disclosure"
            className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] hover:decoration-ps-green"
          >
            affiliate-disclosure
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
