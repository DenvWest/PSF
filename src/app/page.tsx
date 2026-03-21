import Link from "next/link";
import Hero from "@/components/homepage/Hero";
import PopularCategories from "@/components/homepage/PopularCategories";
import TrustSection from "@/components/homepage/TrustSection";
import Section from "@/components/ui/Section";

function StartChoices() {
  const items = [
    {
      title: "Vergelijk supplementen",
      description:
        "Bekijk supplementen naast elkaar op dosering, prijs per dag, kwaliteit en gebruiksgemak.",
      href: "/omega-3-vergelijken",
    },
    {
      title: "Bekijk beste keuzes",
      description:
        "Zie snel welke supplementen eruit springen als beste overall, budget of premium keuze.",
      href: "/beste-omega-3-supplement",
    },
    {
      title: "Lees eerst uitleg",
      description:
        "Start met heldere gidsen over wat omega 3 is en waar je op let bij supplementen.",
      href: "/wat-is-omega-3",
    },
  ];

  return (
    <Section
      eyebrow="Start hier"
      title="Kies je startpunt"
      description="Drie overzichtelijke routes om snel te vergelijken, beste keuzes te zien of eerst rustig de basis te begrijpen."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
            <p className="mt-6 text-sm font-medium text-green-700 underline decoration-green-300 underline-offset-4 transition group-hover:text-green-800 group-hover:decoration-green-400">
              Open
            </p>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <StartChoices />
      <PopularCategories />
      <TrustSection />
    </>
  );
}
