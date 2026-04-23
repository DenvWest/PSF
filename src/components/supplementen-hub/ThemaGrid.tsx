import Link from "next/link";

export type ThemaData = {
  id: string;
  icon: string;
  label: string;
  description: string;
  href: string;
  iconBg: string;
  iconBgHover: string;
  comingSoon: boolean;
};

export const DEFAULT_THEMAS: ThemaData[] = [
  {
    id: "slaap",
    icon: "🌙",
    label: "Slaap",
    description: "Slaapkwaliteit, ritme en herstel verbeteren.",
    href: "/thema/slaap",
    iconBg: "bg-indigo-50",
    iconBgHover: "group-hover:bg-indigo-100",
    comingSoon: false,
  },
  {
    id: "stress",
    icon: "🧘",
    label: "Stress",
    description: "Cortisol verlagen, ontspanning en veerkracht.",
    href: "/thema/stress",
    iconBg: "bg-amber-50",
    iconBgHover: "group-hover:bg-amber-100",
    comingSoon: false,
  },
  {
    id: "energie",
    icon: "⚡",
    label: "Energie",
    description: "Energieniveau, focus en aandacht verbeteren.",
    href: "/thema/energie",
    iconBg: "bg-emerald-50",
    iconBgHover: "group-hover:bg-emerald-100",
    comingSoon: false,
  },
  {
    id: "herstel",
    icon: "🔄",
    label: "Herstel",
    description: "Spierherstel, mentale rust en regeneratie.",
    href: "/thema/herstel",
    iconBg: "bg-stone-50",
    iconBgHover: "",
    comingSoon: true,
  },
];

type ThemaGridProps = {
  themas?: ThemaData[];
};

export default function ThemaGrid({
  themas = DEFAULT_THEMAS,
}: ThemaGridProps) {
  return (
    <div className="py-16 md:py-20">
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
          Blader per thema
        </h2>
        <p className="mt-2 text-sm text-stone-500 max-w-lg">
          Kies een levensstijlthema en zie welke supplementen het meest relevant zijn.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {themas.map((thema) => {
        const cardInner = (
          <div
            className={`group relative rounded-2xl border border-stone-200 bg-white p-5 flex flex-col items-start transition-all duration-200 h-full ${
              thema.comingSoon
                ? "opacity-40 cursor-not-allowed"
                : "hover:shadow-md hover:-translate-y-1 cursor-pointer hover:border-[#5A8F6A]"
            }`}
          >
            <div className="relative">
              <span
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${thema.iconBg} ${thema.iconBgHover}`}
                aria-hidden="true"
              >
                {thema.icon}
              </span>
              {thema.comingSoon && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200 leading-none">
                  Binnenkort
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="font-display font-semibold text-stone-900">
                {thema.label}
              </p>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                {thema.description}
              </p>
            </div>
          </div>
        );

        return thema.comingSoon ? (
          <div key={thema.id}>
            {cardInner}
          </div>
        ) : (
          <Link key={thema.id} href={thema.href} className="block">
            {cardInner}
          </Link>
        );
      })}
      </div>
    </div>
  );
}
