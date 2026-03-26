import Link from "next/link";
import Hero from "@/components/homepage/Hero";
import PopularCategories from "@/components/homepage/PopularCategories";
import TrustSection from "@/components/homepage/TrustSection";
import Container from "@/components/layout/Container";

const brandPillars = [
  {
    label: "Zorgvuldig geselecteerd",
    text: "Elk supplement is beoordeeld op samenstelling, dosering en transparantie van de fabrikant. Geen aannames, wel concrete criteria.",
    href: "/supplementen",
    linkLabel: "Bekijk supplementen",
  },
  {
    label: "Helder toegelicht",
    text: "Uitleg over de verschillen in vorm, toepassing en kwaliteit — zodat je begrijpt waarom het ene supplement beter past dan het andere.",
    href: "/blog",
    linkLabel: "Naar het blog",
  },
  {
    label: "Zonder overbodige ruis",
    text: "De methodologie legt uit welke afwegingen worden gemaakt en welke criteria tellen. Controleerbaar en consistent.",
    href: "/methodologie",
    linkLabel: "Lees de methodologie",
  },
];

function BrandSection() {
  return (
    <section className="border-t border-neutral-200 bg-neutral-50/60">
      <Container>
        <div className="py-16 md:py-20">
          <div className="max-w-xl">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.26em] text-stone-400">
              Waar je op kunt vertrouwen
            </p>
            <h2 className="ps-display mt-4 text-[1.875rem] leading-[1.1] text-stone-900 sm:text-[2.25rem]">
              Goede keuzes beginnen bij duidelijke informatie.
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-[1.75] text-stone-500">
              Supplementen vergelijken op dosering, kwaliteit en prijs — zonder vage claims. Alleen wat relevant is voor een concrete beslissing.
            </p>
          </div>

          <div className="mt-12 grid gap-px border border-stone-200 bg-stone-200 sm:grid-cols-3">
            {brandPillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="group flex flex-col bg-white px-6 py-7 transition hover:bg-stone-50"
              >
                <p className="text-sm font-medium text-stone-800">
                  {pillar.label}
                </p>
                <p className="mt-2.5 flex-1 text-[0.875rem] leading-[1.75] text-stone-400">
                  {pillar.text}
                </p>
                <p className="mt-5 text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition group-hover:text-stone-700 group-hover:decoration-stone-400">
                  {pillar.linkLabel}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

const blogPreviews = [
  {
    title: "Wat is omega-3?",
    href: "/wat-is-omega-3",
    category: "Ingrediënten",
    description:
      "De rol van EPA en DHA in het lichaam, en waarom de bron van je omega-3 meer uitmaakt dan de dosering.",
  },
  {
    title: "Omega-3 vergelijken",
    href: "/omega-3-vergelijken",
    category: "Vergelijking",
    description:
      "Populaire supplementen naast elkaar op EPA/DHA-gehalte, prijs per dag en kwaliteitsindicatoren.",
  },
  {
    title: "Magnesium vergelijken",
    href: "/magnesium-vergelijken",
    category: "Vergelijking",
    description:
      "Vormen, doseringen en toepassingen — van magnesiumcitraat tot bisglycinaat.",
  },
];

function BlogPreview() {
  return (
    <section className="py-28 pb-36">
      <div className="ps-divider" />
      <Container>
        <div className="pt-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[0.63rem] font-medium uppercase tracking-[0.26em] text-stone-400">
                Blog
              </p>
              <h2 className="ps-display mt-5 text-[2rem] leading-[1.1] text-stone-900 sm:text-[2.5rem]">
                Uitgelichte artikelen
              </h2>
            </div>
            <Link
              href="/blog"
              className="shrink-0 text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition hover:text-stone-700 hover:decoration-stone-400"
            >
              Alle artikelen
            </Link>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {blogPreviews.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group flex flex-col"
              >
                <div className="aspect-[3/2] w-full rounded-md bg-stone-100 transition duration-300 group-hover:bg-stone-200/70" />
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-stone-400">
                    {post.category}
                  </p>
                  <h3 className="ps-display mt-2 text-[1.1875rem] leading-[1.22] text-stone-900 transition group-hover:text-stone-600">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[0.875rem] leading-[1.75] text-stone-400">
                    {post.description}
                  </p>
                  <p className="mt-4 text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition group-hover:text-stone-700 group-hover:decoration-stone-400">
                    Lees meer
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandSection />
      <PopularCategories />
      <TrustSection />
      <BlogPreview />
    </>
  );
}
