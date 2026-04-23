import Link from "next/link";

export default function PersonalizationCta() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#F7F5F0] to-[#EDE9E0] rounded-2xl border border-stone-200/60 p-8 md:p-12 shadow-sm">
      {/* Decoratief element */}
      <span
        className="absolute right-8 top-1/2 -translate-y-1/2 text-[8rem] opacity-10 pointer-events-none select-none leading-none"
        aria-hidden="true"
      >
        🧬
      </span>

      <div className="relative">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
          Krijg persoonlijke supplementaanbevelingen
        </h2>
        <p className="text-base text-stone-500 mt-3 max-w-lg leading-relaxed">
          Doe de gratis leefstijlcheck en ontdek welke supplementen bij jouw
          situatie passen.
        </p>
        <div className="mt-6">
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 bg-[#5A8F6A] text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-[#4A7F5A] transition-all shadow-sm hover:shadow-md"
          >
            Doe de gratis leefstijlcheck →
          </Link>
        </div>
        <p className="mt-4 flex items-center gap-4 text-xs text-stone-500">
          <span>± 3 minuten</span>
          <span>geen e-mail verplicht</span>
          <span>direct resultaat</span>
        </p>
      </div>
    </div>
  );
}
