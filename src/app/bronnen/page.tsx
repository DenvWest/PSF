import type { Metadata } from "next";
import Link from "next/link";
import DumpDownloadLink from "@/components/bronnen/DumpDownloadLink";
import ContentPageLayout from "@/components/layout/ContentPageLayout";
import { NEVO_CITATION } from "@/lib/nevo-bron";
import { basicOpenGraph } from "@/lib/seo/open-graph";
import { ODBL_URL, OFF_WIJZIGINGEN, SUPERMARKT_BRON_INFO } from "@/lib/supermarkt-bron";

const TITLE = "Bronnen en licenties";
const DESCRIPTION =
  "Waar de voedingswaarden in het dagboek van PerfectSupplement vandaan komen: Open Food Facts (ODbL) en NEVO-online (RIVM), wat wij eraan veranderden en hoe je de database downloadt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://perfectsupplement.nl/bronnen",
  },
  ...basicOpenGraph({ path: "/bronnen", title: TITLE, description: DESCRIPTION }),
};

const OFF = SUPERMARKT_BRON_INFO.off;
const NEVO = SUPERMARKT_BRON_INFO.nevo;

const linkKlasse = "text-ps-green underline underline-offset-2 hover:text-ps-green-hover";

export default function BronnenPage() {
  return (
    <ContentPageLayout
      eyebrow="Juridisch"
      title="Bronnen en licenties"
      intro={
        <>
          Voedingswaarden in het dagboek komen uit twee bronnen. Hier staat welke, onder welke
          voorwaarden we ze gebruiken, wat wij eraan hebben aangepast en hoe je de database zelf
          kunt downloaden. Het zijn informatieve gegevens, geen{" "}
          <Link href="/medische-disclaimer" className={linkKlasse}>
            medisch advies
          </Link>
          .
        </>
      }
    >
      <section aria-labelledby="off">
        <h2 id="off" className="text-xl font-semibold text-stone-900">
          1. Open Food Facts
        </h2>
        <p className="mt-3">
          Gegevens over verpakte producten (naam, merk, voedingswaarden per 100 g of ml) komen uit{" "}
          <a href={OFF.algemeneUrl} rel="noopener" className={linkKlasse}>
            {OFF.naam}
          </a>
          , de open database van vrijwilligers. De gegevens vallen onder de{" "}
          <a href={ODBL_URL} rel="noopener" className={linkKlasse}>
            {OFF.licentieNaam} ({OFF.licentie}) 1.0
          </a>
          . © Open Food Facts contributors. Op het portiescherm van een product linken we naar de
          productpagina bij Open Food Facts; onder een lijst naar de bron in het algemeen.
        </p>
      </section>

      <section aria-labelledby="wijzigingen">
        <h2 id="wijzigingen" className="text-xl font-semibold text-stone-900">
          2. Wat wij hebben aangepast
        </h2>
        <p className="mt-3">
          Onze database is afgeleid van de Open Food Facts-database en daarom ook onder de ODbL
          beschikbaar. Ten opzichte van de bron hebben we:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          {OFF_WIJZIGINGEN.map((wijziging) => (
            <li key={wijziging}>{wijziging}</li>
          ))}
        </ul>
        <p className="mt-3">
          Staat er een fout in een product? Verbeter het bij de bron op Open Food Facts; bij een
          volgende verversing van onze database kan die verbetering doorkomen.
        </p>
      </section>

      <section aria-labelledby="download">
        <h2 id="download" className="text-xl font-semibold text-stone-900">
          3. Download de database
        </h2>
        <p className="mt-3">
          De volledige afgeleide database, onder dezelfde licentie (ODbL 1.0), als zip met de CSV, de
          licentie (<code className="text-sm">LICENTIE.txt</code>) en een leesmij (
          <code className="text-sm">LEESMIJ.txt</code>) met de bronvermelding en bovenstaande
          wijzigingen. Elke rij heeft een <code className="text-sm">snapshot_datum</code>: de datum
          van de Open Food Facts-dump waaruit de rij komt. Een lege cel betekent onbekend, nooit nul.
          De zip wordt hooguit één keer per uur opnieuw samengesteld.
        </p>
        <div className="mt-4">
          <DumpDownloadLink />
        </div>
        <p className="mt-4 text-sm">
          Kolommen: prod_id, bron, bron_id (de barcode), snapshot_datum, naam, merk, categorie,
          zoek_tekst, energy_kcal, fat_g, saturated_fat_g, carbohydrate_g, sugars_g, fiber_g,
          protein_g, salt_g, sodium_mg, calcium_mg, iron_mg, vitamin_c_mg en vitamin_d_ug. Alle
          waarden zijn per 100 g of ml. De vier laatste kolommen zijn voorlopig leeg.
        </p>
      </section>

      <section aria-labelledby="nevo">
        <h2 id="nevo" className="text-xl font-semibold text-stone-900">
          4. NEVO-online
        </h2>
        <p className="mt-3">
          Voor gangbare voedingsmiddelen (zoals &ldquo;yoghurt, naturel&rdquo;) gebruiken we het
          Nederlands Voedingsstoffenbestand van het RIVM, onder de{" "}
          <a href={NEVO.licentieUrl} rel="noopener" className={linkKlasse}>
            {NEVO.licentieNaam}
          </a>
          . Bron: {NEVO_CITATION}. Wij tonen de waarden ongewijzigd. Bij uitkomsten die wij daaruit
          berekenen, zoals een dagtotaal, staat dat de uitkomst is gebaseerd op gegevens van NEVO.
          NEVO-gegevens zijn niet opgenomen in de download hierboven.
        </p>
      </section>

      <section aria-labelledby="dagboek">
        <h2 id="dagboek" className="text-xl font-semibold text-stone-900">
          5. Wat je dagboek bewaart
        </h2>
        <p className="mt-3">
          Je dagboek bewaart alleen welk product je koos en hoeveel gram. De voedingswaarden halen we
          bij het tonen uit onze eigen kopie van de bron (Open Food Facts of NEVO) op; ze worden niet
          bij jouw gegevens opgeslagen. Meer daarover
          lees je in ons{" "}
          <Link href="/privacy" className={linkKlasse}>
            privacybeleid
          </Link>
          . Hoe we supplementen beoordelen staat op de{" "}
          <Link href="/methodologie" className={linkKlasse}>
            methodologiepagina
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="fout">
        <h2 id="fout" className="text-xl font-semibold text-stone-900">
          6. Fout of vraag?
        </h2>
        <p className="mt-3">
          Zie je iets dat niet klopt, of heb je een vraag over de licenties? Neem{" "}
          <Link href="/contact" className={linkKlasse}>
            contact
          </Link>{" "}
          op.
        </p>
      </section>
    </ContentPageLayout>
  );
}
