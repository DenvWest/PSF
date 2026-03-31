import Link from "next/link";
import Container from "@/components/layout/Container";

const products = [
  {
    name: "Omega 3",
    tagline:
      "Essentieel vetzuur voor hart, hersenen en ontstekingsbalans. Uitgebreid vergeleken op dosering, kwaliteit en prijs.",
    href: "/omega-3-vergelijken",
    linkLabel: "Vergelijking bekijken",
    secondaryHref: "/beste-omega-3-supplement#topkeuzes",
    secondaryLabel: "Bekijk topkeuzes →",
  },
  {
    name: "Magnesium",
    tagline:
      "Ondersteunt spieren, het zenuwstelsel en slaap. Vergelijk vormen en kies wat werkt — met duidelijke onderbouwing.",
    href: "/beste-magnesium",
    linkLabel: "Beste Magnesium supplementen →",
    secondaryHref: "/beste-magnesium#topkeuzes",
    secondaryLabel: "Bekijk top 5 magnesium →",
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
                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                  <Link
                    href={product.href}
                    className={`inline-flex w-fit items-center rounded-lg px-3.5 py-2 text-[0.8125rem] font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 ${
                      product.name === "Magnesium"
                        ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800"
                        : "bg-stone-100 text-stone-800 hover:bg-stone-200/90"
                    }`}
                  >
                    {product.linkLabel}
                  </Link>
                  <Link
                    href={product.secondaryHref}
                    className="inline-flex w-fit items-center text-[0.8125rem] font-medium text-stone-600 underline decoration-stone-300 underline-offset-[0.2em] transition-all duration-150 hover:text-stone-900 hover:decoration-stone-500"
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
