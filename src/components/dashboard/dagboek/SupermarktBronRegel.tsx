import {
  bronnenVan,
  SUPERMARKT_BRON_INFO,
  supermarktProductUrl,
} from "@/lib/supermarkt-bron";
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
 * Rendert niets zonder producten. Eén regel per voorkomende bron, zodat een
 * toekomstige tweede bron vanzelf zijn eigen vermelding krijgt.
 */
export default function SupermarktBronRegel({
  producten,
}: {
  producten: readonly Pick<SupermarktProduct, "bron" | "bronId">[];
}) {
  const bronnen = bronnenVan(producten);
  if (bronnen.length === 0) return null;
  const enkelProduct = producten.length === 1 ? producten[0] : null;

  return (
    <p className="m-0 text-[10px] leading-relaxed text-[var(--vd-ink-4)]">
      {bronnen.map((bron, index) => {
        const info = SUPERMARKT_BRON_INFO[bron];
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
