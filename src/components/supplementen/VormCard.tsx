interface VormCardProps {
  naam: string;
  geschiktVoor: string;
  dosering: string;
  opmerking?: string;
}

type ColorScheme = {
  tag: string;
  tagText: string;
  border: string;
  dot: string;
};

function resolveColorScheme(geschiktVoor: string): ColorScheme {
  const lower = geschiktVoor.toLowerCase();

  if (lower.includes("slaap") || lower.includes("ontspan")) {
    return {
      tag: "bg-sky-50",
      tagText: "text-sky-700",
      border: "border-sky-100",
      dot: "bg-sky-400",
    };
  }
  if (lower.includes("stress") || lower.includes("veerkracht")) {
    return {
      tag: "bg-amber-50",
      tagText: "text-amber-700",
      border: "border-amber-100",
      dot: "bg-amber-400",
    };
  }
  if (lower.includes("hart") || lower.includes("bloedvaten") || lower.includes("cardio")) {
    return {
      tag: "bg-rose-50",
      tagText: "text-rose-700",
      border: "border-rose-100",
      dot: "bg-rose-400",
    };
  }
  if (lower.includes("cognitie") || lower.includes("focus") || lower.includes("hersen")) {
    return {
      tag: "bg-violet-50",
      tagText: "text-violet-700",
      border: "border-violet-100",
      dot: "bg-violet-400",
    };
  }
  if (lower.includes("energie") || lower.includes("immuun")) {
    return {
      tag: "bg-emerald-50",
      tagText: "text-emerald-700",
      border: "border-emerald-100",
      dot: "bg-emerald-400",
    };
  }
  return {
    tag: "bg-stone-50",
    tagText: "text-stone-600",
    border: "border-stone-200",
    dot: "bg-stone-400",
  };
}

export default function VormCard({
  naam,
  geschiktVoor,
  dosering,
  opmerking,
}: VormCardProps) {
  const colors = resolveColorScheme(geschiktVoor);

  return (
    <div
      className={`rounded-xl border bg-white p-5 ${colors.border}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-semibold text-stone-900">{naam}</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium ${colors.tag} ${colors.tagText}`}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`}
            aria-hidden
          />
          {geschiktVoor}
        </span>
      </div>

      <p className="mt-3 text-xs text-stone-600">
        <span className="font-medium text-stone-700">Dosering: </span>
        {dosering}
      </p>

      {opmerking && (
        <p className="mt-2 text-xs leading-relaxed text-stone-500">{opmerking}</p>
      )}
    </div>
  );
}
