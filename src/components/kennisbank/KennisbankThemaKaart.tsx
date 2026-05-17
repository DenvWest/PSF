import Link from "next/link";
import type { KennisbankTheme } from "@/data/kennisbank";
import { themeLabels } from "@/data/kennisbank";
import KennisbankThemaIcon from "@/components/kennisbank/KennisbankThemaIcon";
import {
  KB_CARD_ARROW,
  KB_CARD_META,
  KB_ICON_BOX,
  KB_NOISE_SVG,
  KB_THEMA_CARD,
} from "@/components/kennisbank/kennisbank-layout";

interface KennisbankThemaKaartProps {
  theme: KennisbankTheme;
  termCount: number;
}

export default function KennisbankThemaKaart({ theme, termCount }: KennisbankThemaKaartProps) {
  const config = themeLabels[theme];
  const countLabel = termCount === 1 ? "1 begrip" : `${termCount} begrippen`;

  return (
    <Link
      href={`/kennisbank/${theme}`}
      className={`${KB_THEMA_CARD} ${config.colorClasses.bg}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        aria-hidden
        style={{ backgroundImage: KB_NOISE_SVG }}
      />

      <div className="relative flex min-h-full flex-1 flex-col p-8 md:p-10">
        <div className={`${KB_ICON_BOX} ${config.colorClasses.accent}`}>
          <KennisbankThemaIcon theme={theme} />
        </div>

        <div className="mt-auto flex flex-col pt-11 md:pt-14">
          <h2 className="font-display text-[1.4rem] font-semibold leading-[1.12] tracking-tight text-white md:text-[1.65rem]">
            {config.title}
          </h2>
          <p
            className={`mt-4 max-w-[30ch] text-sm leading-[1.68] md:text-[0.9375rem] md:leading-relaxed ${config.colorClasses.tekst}`}
          >
            {config.description}
          </p>

          <div className="mt-9 flex w-full items-center justify-between gap-4 border-t border-white/12 pt-5 md:mt-10">
            <span className={KB_CARD_META}>{countLabel}</span>
            <span className={KB_CARD_ARROW} aria-hidden>
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
