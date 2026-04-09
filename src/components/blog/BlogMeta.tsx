interface BlogMetaProps {
  leestijd: string;
  gepubliceerdOp: string;
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

export default function BlogMeta({ leestijd, gepubliceerdOp }: BlogMetaProps) {
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
