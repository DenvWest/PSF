import Link from "next/link";
import BlogCard, {
  BLOG_CARD_GRID_CLASS,
  BLOG_CARD_GRID_SECTION_TOP_CLASS,
} from "@/components/blog/BlogCard";
import Hero from "@/components/homepage/Hero";
import Container from "@/components/layout/Container";
import { getBlogPostBySlug } from "@/data/blog-posts";

/** Same articles as before (routes unchanged); data comes from blog-posts for covers. */
const FEATURED_ARTICLE_SLUGS = [
  "wat-is-omega-3",
  "omega-3-vergelijken",
  "magnesium-vergelijken",
] as const;

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
    <section className="bg-white">
      <Container>
        <div className="py-20 md:py-28">
          <div className="max-w-xl">
            <p className="ps-eyebrow">Waar je op kunt vertrouwen</p>
            <h2 className="ps-display mt-5 text-[1.875rem] leading-[1.1] text-stone-900 sm:text-[2.25rem]">
              Goede keuzes beginnen bij duidelijke informatie.
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-[1.75] text-stone-500">
              Supplementen vergelijken op dosering, kwaliteit en prijs — zonder vage claims. Alleen wat relevant is voor een concrete beslissing.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            {brandPillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="group flex h-full min-h-0 flex-col rounded-xl border border-stone-200/90 bg-white p-8 shadow-[0_1px_3px_rgba(28,25,23,0.04)] ring-1 ring-stone-900/[0.03] transition-all duration-200 hover:border-stone-300 hover:bg-stone-50/50 hover:shadow-[0_10px_32px_-12px_rgba(28,25,23,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/45 focus-visible:ring-offset-2 md:p-9"
              >
                <p className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em] text-stone-900">
                  {pillar.label}
                </p>
                <p className="mt-4 flex-1 text-[0.9375rem] leading-[1.7] text-stone-500">
                  {pillar.text}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-stone-600 transition-colors duration-150 group-hover:text-stone-900">
                  <span className="border-b border-stone-300/80 pb-px transition-[border-color,color] duration-150 group-hover:border-stone-600 group-hover:text-stone-900">
                    {pillar.linkLabel}
                  </span>
                  <span
                    className="text-stone-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-stone-600"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function BlogPreview() {
  const featuredPosts = FEATURED_ARTICLE_SLUGS.map((slug) =>
    getBlogPostBySlug(slug)
  ).filter((post): post is NonNullable<typeof post> => post != null);

  return (
    <section className="py-20 md:py-24">
      <div className="ps-divider" />
      <Container>
        <div className="pt-20 md:pt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="ps-eyebrow">Blog</p>
              <h2 className="ps-display mt-5 text-[2rem] leading-[1.1] text-stone-900 sm:text-[2.5rem]">
                Uitgelichte artikelen
              </h2>
            </div>
            <Link
              href="/blog"
              className="shrink-0 text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition-all duration-150 hover:text-stone-700 hover:decoration-stone-400"
            >
              Alle artikelen
            </Link>
          </div>

          <div className={`${BLOG_CARD_GRID_SECTION_TOP_CLASS} ${BLOG_CARD_GRID_CLASS}`}>
            {featuredPosts.map((post, index) => (
              <BlogCard
                key={post.slug}
                post={post}
                priority={index < 3}
              />
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
      <BlogPreview />
    </>
  );
}
