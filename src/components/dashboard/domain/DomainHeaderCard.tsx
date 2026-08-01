import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import type { Pillar } from "@/types/dashboard";

type DomainHeaderCardProps = {
  pillar: Pillar;
  score: number;
  eyebrow: string;
  tagline: string;
  checkinDate?: string | null;
};

export default function DomainHeaderCard({
  pillar,
  score,
  eyebrow,
  tagline,
  checkinDate,
}: DomainHeaderCardProps) {
  return (
    <CockpitTile ariaLabel={`${pillar.label} — score`}>
      <div className="flex items-center gap-4">
        <KompasDomainGauge value={score} label={pillar.label} />
        <div className="min-w-0 flex-1">
          <div
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--ac)" }}
          >
            {eyebrow}
          </div>
          <div className="font-serif text-[25px] leading-[1.1] text-[#F1EFE8]">
            {pillar.label}
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
            {tagline}
          </p>
          {checkinDate !== undefined ? (
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#9FB0A6]">
              {checkinDate
                ? `Op basis van je laatste check-in · ${checkinDate}`
                : "Nog geen check-in voor dit domein"}
            </p>
          ) : null}
        </div>
      </div>
    </CockpitTile>
  );
}
