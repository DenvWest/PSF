import type { MovementLadderCoverage } from "@/lib/movement-ladder";

type LadderCoverageMeterProps = {
  coverage: MovementLadderCoverage;
  /** Hoeveel lagen de ladder in totaal heeft — voor de "niet gemeten"-regel. */
  totalLayers: number;
};

/**
 * Hoeveel van je ladder staat, volgens de check.
 *
 * Drie dingen zijn hier bewuste keuzes. Het getal komt uit je beweegcheck en
 * nooit uit je kliks: wat je kiest of afvinkt verandert het niet, dat doet je
 * hermeting. De noemer is wat de check kán beoordelen en niet alle zes lagen,
 * want ongemeten is geen tekort. En de breuk staat naast het percentage —
 * "2 van 3" is eerlijker over hoe grof dit is dan "67%" in zijn eentje.
 */
export default function LadderCoverageMeter({
  coverage,
  totalLayers,
}: LadderCoverageMeterProps) {
  if (coverage.percentage == null) {
    return null;
  }

  const measured = coverage.measured.length;
  const onOrder = coverage.onOrder.length;
  const unmeasured = totalLayers - measured;

  return (
    <div className="mb-3.5 rounded-[12px] border border-white/10 bg-black/20 px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Wat er staat volgens je check
        </span>
        <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-[#9CC5A9]">
          {coverage.percentage}%
        </span>
      </div>
      <div
        role="img"
        aria-label={`${onOrder} van ${measured} gemeten lagen staan`}
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
      >
        <div
          className="h-full rounded-full bg-[#5A8F6A]"
          style={{ width: `${coverage.percentage}%` }}
        />
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-[#CDD7D0]">
        {onOrder} van {measured} gemeten {measured === 1 ? "laag" : "lagen"}{" "}
        {onOrder === 1 ? "staat" : "staan"}.
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
        {unmeasured > 0
          ? `De ${unmeasured === 1 ? "laag" : `${unmeasured} lagen`} eronder ${unmeasured === 1 ? "meet" : "meten"} de check niet — die tellen niet als tekort mee. `
          : ""}
        Dit getal beweegt bij je hermeting, niet bij wat je hier aanklikt.
      </p>
    </div>
  );
}
