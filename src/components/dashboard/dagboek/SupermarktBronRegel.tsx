import {
  bronnenVan,
  SUPERMARKT_BRON_INFO,
  supermarktProductUrl,
} from "@/lib/supermarkt-bron";
import { NEVO_CITATION, nevoBerekendeBronRegel, nevoBronRegel } from "@/lib/nevo-bron";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * De bronregel bij getoonde voedingswaarden van supermarktproducten.
 *
 * ODbL §4.3 vraagt een vermelding die hoort bij wat de gebruiker ziet, met
 * bron én licentie en een link naar de licentietekst — een footer alleen is
 * onvoldoende (`docs/plan/JURIDISCHE_ANALYSE_SUPERMARKTDATA_2026-10.md`,
 * eindadvies §3). Bij één product linkt de bronnaam naar de productpagina bij
 * de bron zelf, zoals Open Food Facts bij productspecifieke gegevens vraagt;
 * bij een lijst naar de bron in het algemeen.
 *
 * NEVO-online (RIVM) vraagt een eigen tekst: bij weergegeven waarden "NEVO-online
 * versie 2025/9.0, RIVM, Bilthoven"; bij berekende uitvoer (`berekend`, een som
 * of dagtotaal) "Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM,
 * Bilthoven", en "… en andere gegevens" zodra de lijst ook een andere bron bevat.
 *
 * Rendert niets zonder producten. Eén regel per voorkomende bron.
 */
export default function SupermarktBronRegel({
  producten,
  berekend = false,
}: {
  producten: readonly Pick<SupermarktProduct, "bron" | "bronId" | "snapshotDatum">[];
  berekend?: boolean;
}) {
  const bronnen = bronnenVan(producten);
  if (bronnen.length === 0) return null;
  const enkelProduct = producten.length === 1 ? producten[0] : null;

  return (
    <p className="m-0 text-[10px] leading-relaxed text-[var(--vd-ink-4)]">
      {bronnen.map((bron, index) => {
        const info = SUPERMARKT_BRON_INFO[bron];
        if (bron === "nevo") {
          const versie = producten.find((p) => p.bron === "nevo")?.snapshotDatum ?? "2025/9.0";
          const tekst = berekend ? nevoBerekendeBronRegel(bronnen.length > 1) : nevoBronRegel({ nevoVersie: versie });
          return (
            <span key={bron}>
              {index > 0 ? " " : null}
              <a
                href={info.algemeneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[var(--vd-ink-3)]"
              >
                {tekst || NEVO_CITATION}
              </a>
              .
            </span>
          );
        }
        return (
          <span key={bron}>
            {index > 0 ? " " : null}
            Voedingswaarden:{" "}
            <a
              href={enkelProduct ? supermarktProductUrl(enkelProduct) : info.algemeneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--vd-ink-3)]"
            >
              {info.naam}
            </a>
            , beschikbaar onder de{" "}
            <a
              href={info.licentieUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--vd-ink-3)]"
            >
              {info.licentieNaam} ({info.licentie})
            </a>
            .
          </span>
        );
      })}
    </p>
  );
}
