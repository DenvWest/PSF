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
    <section aria-label="Waarom vertrouwen op ons" className="py-16 md:py-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 text-center mb-12">
        Waarom PerfectSupplement?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TRUST_POINTS.map((point) => (
          <div key={point.title} className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#5A8F6A]/10 text-[#5A8F6A] flex items-center justify-center mb-4 text-xl">
              {point.icon}
            </div>
            <h3 className="font-semibold text-stone-900 text-base">
              {point.title}
            </h3>
            <p className="text-sm text-stone-500 mt-2 leading-relaxed">
              {point.body}
            </p>
            {point.linkHref && point.linkLabel && (
              <Link
                href={point.linkHref}
                className="text-sm text-[#5A8F6A] font-medium mt-3 hover:underline"
              >
                {point.linkLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
