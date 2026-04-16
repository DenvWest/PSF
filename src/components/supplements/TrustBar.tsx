import Link from "next/link";

export function TrustBar() {
  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-xs text-slate-600 sm:justify-start">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="text-emerald-600">✓</span>
          Onafhankelijk getest
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="text-emerald-600">✓</span>
          Geen sponsoring
        </span>
        <Link
          href="/methodologie"
          className="underline-offset-2 hover:underline"
        >
          Lees onze methodologie →
        </Link>
      </div>
    </div>
  );
}
