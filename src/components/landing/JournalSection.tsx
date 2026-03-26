import SectionShell from "./ui/SectionShell";
import SectionHeading from "./ui/SectionHeading";
import ArticleCard from "./ui/ArticleCard";

const articles = [
  {
    title: "Waarom omega-3 een fundamentele basis vormt",
    excerpt:
      "EPA en DHA in perspectief: waarom deze vetzuren horen bij een langetermijnstack—nuchter en zonder sensatie.",
    href: "/blog",
  },
  {
    title: "Magnesium en herstel in een overprikkelde leefstijl",
    excerpt:
      "Hoe magnesium aansluit op slaap, stress en training—bedoeld voor wie prestaties in weken en maanden meet, niet alleen in één sessie.",
    href: "/blog",
  },
  {
    title: "Van losse supplementen naar een samenhangend fundament",
    excerpt:
      "Principes voor minder, betere ingrediënten die samenhang versterken—vóór de volgende hype.",
    href: "/blog",
  },
  {
    title: "Preventieve gezondheid begint bij dagelijkse consistentie",
    excerpt:
      "Waarom kleine, herhaalbare keuzes het verschil maken voor veerkracht en vitaliteit op lange termijn.",
    href: "/blog",
  },
];

export default function JournalSection() {
  return (
    <section
      id="journal"
      className="border-b border-[var(--ps-border)]/50 py-[var(--ps-section-y)]"
      aria-labelledby="journal-heading"
    >
      <SectionShell>
        <SectionHeading
          eyebrow="Blog"
          title="Dieper kijken—voor een langere horizon"
          titleId="journal-heading"
          description="Artikelen over omega-3 en magnesium, dagelijkse gezondheidsondersteuning, herstel en lange-termijnvitaliteit—inhoudelijk, zonder oppervlakkig vulsel."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a, i) => (
            <ArticleCard key={a.title} {...a} delay={i * 0.06} />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
