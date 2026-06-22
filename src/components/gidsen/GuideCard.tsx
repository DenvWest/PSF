import type { CSSProperties } from "react";
import Link from "next/link";
import GidsCover from "@/components/gidsen/GidsCover";
import type { Guide } from "@/data/guides";

type GuideCardProps = {
  guide: Guide;
};

export default function GuideCard({ guide }: GuideCardProps) {
  const cardStyle = {
    "--ac": guide.accent,
  } as CSSProperties;

  return (
    <Link
      href={`/gidsen/${guide.key}`}
      className="group flex cursor-pointer flex-col rounded-[20px] border border-[#ECE8DD] bg-white px-7 pb-6 pt-7 shadow-[0_1px_2px_rgba(30,40,34,.04)] transition-[transform,box-shadow,border-color] duration-350 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:border-[var(--ac)] hover:shadow-[0_24px_48px_-20px_rgba(30,40,34,.28)]"
      style={cardStyle}
    >
      <div className="flex justify-center px-0 pb-[22px] pt-1">
        <div className="h-[272px] w-[172px]">
          <GidsCover title={guide.title} accent={guide.accent} />
        </div>
      </div>

      <div
        className="inline-flex items-center gap-[7px] self-start rounded-full px-[11px] py-[5px] text-xs font-semibold tracking-[0.04em]"
        style={{
          background: "color-mix(in srgb, var(--ac) 12%, #fff)",
          color: "color-mix(in srgb, var(--ac) 72%, #1B2620)",
        }}
      >
        <span
          aria-hidden
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: "var(--ac)" }}
        />
        {guide.tag}
      </div>

      <h3 className="mt-3.5 font-serif text-[27px] font-normal tracking-[-0.01em] text-[#1B2620]">
        Gids · {guide.title}
      </h3>
      <p className="mt-2.5 text-[15px] leading-[1.55] text-[#5A6560]">
        {guide.promise}
      </p>

      <div
        className="mt-[18px] flex items-center gap-2 border-t border-[#F0ECE2] pt-[18px] text-[14.5px] font-semibold"
        style={
          guide.comingSoon
            ? { color: "#8A9189" }
            : { color: "color-mix(in srgb, var(--ac) 78%, #1B2620)" }
        }
      >
        {guide.comingSoon ? (
          "Binnenkort beschikbaar"
        ) : (
          <>
            Download gratis
            <span className="text-[17px] leading-none" aria-hidden>
              →
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
