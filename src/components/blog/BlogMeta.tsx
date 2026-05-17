interface BlogMetaProps {
  leestijd: string;
  gepubliceerdOp: string;
  variant?: "default" | "featured";
}

function formatDatum(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatBlogDatum(datum: string): string {
  const d = new Date(datum);
  if (Number.isNaN(d.getTime())) return datum;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogMeta({
  leestijd,
  gepubliceerdOp,
  variant = "default",
}: BlogMetaProps) {
  if (variant === "featured") {
    return (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
        <span>{leestijd} leestijd</span>
        <span aria-hidden className="text-stone-400/80 select-none">
          ·
        </span>
        <time dateTime={gepubliceerdOp}>{formatDatum(gepubliceerdOp)}</time>
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-sm text-stone-400">
      <span>{leestijd} leestijd</span>
      <span aria-hidden className="text-stone-300 select-none">
        ·
      </span>
      <time dateTime={gepubliceerdOp}>{formatDatum(gepubliceerdOp)}</time>
    </p>
  );
}
