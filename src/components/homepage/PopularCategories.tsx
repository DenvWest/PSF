import Link from "next/link";
import Container from "@/components/layout/Container";

const products = [
  {
    name: "Omega 3",
    tagline:
      "Essentieel vetzuur voor hart, hersenen en ontstekingsbalans. Uitgebreid vergeleken op dosering, kwaliteit en prijs.",
    href: "/omega-3-vergelijken",
    secondaryHref: "/beste-omega-3-supplement",
    secondaryLabel: "Beste keuzes",
  },
  {
    name: "Magnesium",
    tagline:
      "Ondersteunt spieren, het zenuwstelsel en slaap. Welke vorm past het beste bij jouw doel?",
    href: "/magnesium-vergelijken",
    secondaryHref: "/beste-magnesium",
    secondaryLabel: "Beste keuzes",
  },
];

export default function PopularCategories() {
  return (
    <section className="py-28">
      <div className="ps-divider" />
      <Container>
        <div className="pt-28">
          <div className="max-w-[460px]">
            <p className="ps-eyebrow">Supplementen</p>
            <h2 className="ps-display mt-5 text-[2.25rem] leading-[1.1] text-stone-900 sm:text-[2.75rem]">
              Twee supplementen, helder uitgelegd.
            </h2>
          </div>

          <div className="mt-16 grid border-t border-stone-200/80 sm:grid-cols-2">
            {products.map((product, i) => (
              <div
                key={product.name}
                className={`pt-10 pb-8 ${
                  i === 0
                    ? "sm:pr-14"
                    : "sm:pl-10 sm:border-l sm:border-stone-200/80"
                }`}
              >
                <h3 className="ps-display text-[1.5rem] leading-snug text-stone-900">
                  {product.name}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.8] text-stone-400">
                  {product.tagline}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <Link
                    href={product.href}
                    className="inline-block text-[0.8125rem] font-medium text-stone-500 underline decoration-stone-200 underline-offset-4 transition-all duration-150 hover:text-stone-800 hover:decoration-stone-400"
                  >
                    Vergelijking bekijken
                  </Link>
                  <Link
                    href={product.secondaryHref}
                    className="inline-block text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition-all duration-150 hover:text-stone-700 hover:decoration-stone-400"
                  >
                    {product.secondaryLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
