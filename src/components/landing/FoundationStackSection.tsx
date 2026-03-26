import SectionShell from "./ui/SectionShell";
import SectionHeading from "./ui/SectionHeading";
import ProductCard from "./ui/ProductCard";

const products = [
  {
    name: "Omega-3",
    subtitle: "EPA en DHA: kwaliteit en concentratie die je op het etiket terugziet.",
    bullets: [
      "Vetzuren die je in dagelijkse dosering overzichtelijk kunt volgen.",
      "Vergelijk producten op zuiverheid en samenstelling—niet op slogans.",
    ],
    ctaLabel: "Omega-3 vergelijken",
    ctaHref: "/omega-3-vergelijken",
  },
  {
    name: "Magnesium",
    subtitle: "Een mineraal met meerdere vormen; de juiste keuze hangt af van je vraag.",
    bullets: [
      "Van bisglycinaat tot citraat: wat past bij jouw gebruik en routine.",
      "Als tweede lijn naast omega-3—complementair, niet ingewikkeld.",
    ],
    ctaLabel: "Magnesium vergelijken",
    ctaHref: "/magnesium-vergelijken",
  },
];

export default function FoundationStackSection() {
  return (
    <section
      id="products"
      className="border-b border-[var(--ps-border)]/50 bg-[var(--ps-warm-gray)]/20 py-[clamp(5rem,12vw,8rem)]"
      aria-labelledby="products-heading"
    >
      <SectionShell>
        <SectionHeading
          eyebrow="Supplementen"
          title="Twee focusproducten"
          titleId="products-heading"
          description="Geen brede shop: omega-3 en magnesium zijn waar we ons op richten—met uitleg die je serieus kunt nemen."
        />
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
          {products.map((p, i) => (
            <ProductCard key={p.name} {...p} delay={i * 0.08} />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
