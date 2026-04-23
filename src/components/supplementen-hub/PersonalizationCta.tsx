import Link from "next/link";

export default function PersonalizationCta() {
  return (
    <div className="bg-[#F7F5F0] rounded-2xl border border-stone-200 p-8 lg:p-10">
      <h2 className="font-display text-xl text-stone-900">
        Krijg persoonlijke supplementaanbevelingen
      </h2>
      <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-lg">
        Doe de gratis leefstijlcheck en ontdek welke supplementen bij jouw
        situatie passen.
      </p>
      <div className="mt-6">
        <Link
          href="/intake"
          className="inline-flex items-center gap-2 bg-[#5A8F6A] text-white rounded-lg px-6 py-3 text-sm font-semibold hover:bg-[#4a7a5a] transition-all shadow-sm hover:shadow-md"
        >
          Doe de gratis leefstijlcheck →
        </Link>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        ± 3 minuten · geen e-mail verplicht · direct resultaat
      </p>
    </div>
  );
}
