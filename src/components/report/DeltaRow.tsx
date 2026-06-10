type DeltaDirection = "up" | "down" | "neutral";

export type DeltaRowProps = {
  label: string;
  delta: number;
};

function getDirection(delta: number): DeltaDirection {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "neutral";
}

function getMicrocopy(direction: DeltaDirection): string {
  if (direction === "up") return "verbeterd";
  if (direction === "down") return "aandacht";
  return "gelijk";
}

function formatDelta(delta: number): string {
  if (delta === 0) return "±0";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function DeltaRow({ label, delta }: DeltaRowProps) {
  const direction = getDirection(delta);
  const microcopy = getMicrocopy(direction);

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-700 font-medium text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={
            direction === "up"
              ? "text-emerald-600 text-lg"
              : direction === "down"
                ? "text-amber-500 text-lg"
                : "text-slate-400 text-lg"
          }
        >
          {direction === "up" ? "▲" : direction === "down" ? "▼" : "▬"}
        </span>
        <span
          className={
            direction === "up"
              ? "font-semibold text-emerald-700 text-sm"
              : direction === "down"
                ? "font-semibold text-amber-600 text-sm"
                : "font-semibold text-slate-500 text-sm"
          }
        >
          {formatDelta(delta)} punt
        </span>
        <span className="text-slate-400 text-xs">{microcopy}</span>
      </div>
    </div>
  );
}
