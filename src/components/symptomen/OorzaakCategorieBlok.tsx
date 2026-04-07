import Link from "next/link";
import type { OorzaakCategorie } from "@/types/symptomen";

interface OorzaakCategorieBlokProps {
  categorie: OorzaakCategorie;
  index: number;
}

export default function OorzaakCategorieBlok({ categorie, index }: OorzaakCategorieBlokProps) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`rounded-xl px-6 py-8 ${
        isEven ? "bg-white" : "bg-stone-50/70"
      } border border-stone-200/70`}
    >
      <h3 className="text-lg font-semibold tracking-tight text-stone-900">
        {categorie.titel}
      </h3>

      <p className="mt-3 text-sm font-semibold leading-relaxed text-stone-800">
        {categorie.kernboodschap}
      </p>

      <div className="mt-4 space-y-2.5">
        {categorie.voorbeelden.map((voorbeeld, i) => (
          <p key={i} className="flex gap-3 text-sm leading-relaxed text-stone-600">
            <span aria-hidden className="mt-px shrink-0 select-none text-stone-400">
              —
            </span>
            <span>{voorbeeld}</span>
          </p>
        ))}
      </div>

      <p className="mt-5 text-sm">
        <Link href={categorie.blogLink.href} className="ps-text-link">
          Lees meer: {categorie.blogLink.titel}
        </Link>
      </p>
    </div>
  );
}
