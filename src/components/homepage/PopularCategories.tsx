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
        <div className="pt-28 max-w-[460px]">
          <p className="text-[0.63rem] font-medium uppercase tracking-[0.26em] text-stone-400">
            Supplementen
          </p>
          <h2 className="ps-display mt-5 text-[2.25rem] leading-[1.1] text-stone-900 sm:text-[2.75rem]">
            Twee supplementen, helder uitgelegd.
          </h2>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 border-t border-stone-100/80">
          {products.map((product) => (
            <div key={product.name} className="pt-10 pb-6 pr-16">
              <h3 className="ps-display text-[1.375rem] leading-snug text-stone-900">
                {product.name}
              </h3>
              <p className="mt-3 text-sm leading-[1.8] text-stone-400">
                {product.tagline}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href={product.href}
                  className="inline-block text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition hover:text-stone-700 hover:decoration-stone-400"
                >
                  Meer over {product.name.toLowerCase()}
                </Link>
                <Link
                  href={product.secondaryHref}
                  className="inline-block text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition hover:text-stone-700 hover:decoration-stone-400"
                >
                  {product.secondaryLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
