import Link from "next/link";

const TRUST_POINTS = [
  {
    icon: "🏛️",
    title: "Onafhankelijk",
    body: "Geen eigen producten. We verdienen via transparante affiliate links.",
    linkLabel: "Lees onze affiliate-disclosure",
    linkHref: "/affiliate-disclosure",
  },
  {
    icon: "🔬",
    title: "Wetenschappelijk onderbouwd",
    body: "Elk advies is gebaseerd op peer-reviewed onderzoek.",
    linkLabel: "Bekijk onze methodologie",
    linkHref: "/methodologie",
  },
  {
    icon: "⚖️",
    title: "Objectieve scoring",
    body: "Supplementen beoordeeld op biobeschikbaarheid, dosering, prijs-kwaliteit en transparantie.",
    linkLabel: null,
    linkHref: null,
  },
] as const;

export default function WhyTrustUs() {
  return (
    <section aria-label="Waarom vertrouwen op ons">
      <div className="bg-[#F7F5F0] rounded-2xl p-8">
        <h2 className="font-serif text-xl text-stone-900 mb-6 text-center">
          Waarom PerfectSupplement?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col gap-2">
              <span className="text-2xl" aria-hidden="true">
                {point.icon}
              </span>
              <h3 className="font-semibold text-stone-900 text-sm">
                {point.title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {point.body}
              </p>
              {point.linkHref && point.linkLabel && (
                <Link
                  href={point.linkHref}
                  className="text-xs text-[#5A8F6A] hover:text-[#4a7a5a] transition-colors underline underline-offset-2"
                >
                  {point.linkLabel}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
