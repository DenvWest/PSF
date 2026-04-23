import Link from "next/link";

export type ThemaData = {
  id: string;
  icon: string;
  label: string;
  description: string;
  href: string;
  iconBg: string;
  comingSoon: boolean;
};

export const DEFAULT_THEMAS: ThemaData[] = [
  {
    id: "slaap",
    icon: "🌙",
    label: "Slaap",
    description: "Slaapkwaliteit, ritme en herstel verbeteren.",
    href: "/thema/slaap",
    iconBg: "bg-indigo-100",
    comingSoon: false,
  },
  {
    id: "stress",
    icon: "🧘",
    label: "Stress",
    description: "Cortisol verlagen, ontspanning en veerkracht.",
    href: "/thema/stress",
    iconBg: "bg-amber-100",
    comingSoon: false,
  },
  {
    id: "energie",
    icon: "⚡",
    label: "Energie",
    description: "Energieniveau, focus en aandacht verbeteren.",
    href: "/thema/energie",
    iconBg: "bg-emerald-100",
    comingSoon: false,
  },
  {
    id: "herstel",
    icon: "🔄",
    label: "Herstel",
    description: "Spierherstel, mentale rust en regeneratie.",
    href: "/thema/herstel",
    iconBg: "bg-rose-100",
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {themas.map((thema) => {
        const cardInner = (
          <div
            className={`relative rounded-2xl border border-stone-200 bg-white p-5 flex flex-col items-start gap-3 transition-all h-full ${
              thema.comingSoon
                ? "opacity-60"
                : "hover:border-[#5A8F6A] hover:shadow-sm cursor-pointer"
            }`}
          >
            <div className="relative">
              <span
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${thema.iconBg}`}
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
            <div>
              <p className="font-semibold text-sm text-stone-800">
                {thema.label}
              </p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {thema.description}
              </p>
            </div>
          </div>
        );

        return thema.comingSoon ? (
          <div key={thema.id} className="cursor-default">
            {cardInner}
          </div>
        ) : (
          <Link key={thema.id} href={thema.href} className="block">
            {cardInner}
          </Link>
        );
      })}
    </div>
  );
}
