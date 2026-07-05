import MethodologyChapterPills from "@/components/methodology/MethodologyChapterPills";
import { METHODOLOGY_HERO } from "@/data/methodology";

export default function MethodologyHero() {
  return (
    <section className="-mx-6 bg-[#E8E2D5] px-6 py-16 md:py-20 lg:-mx-8 lg:px-8">
      <span className="mb-6 block text-xs uppercase tracking-[0.2em] text-stone-500">
        {METHODOLOGY_HERO.eyebrow}
      </span>
      <h1 className="max-w-4xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-balance text-stone-900 md:text-5xl lg:text-6xl">
        {METHODOLOGY_HERO.headline}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-700 md:text-xl">
        {METHODOLOGY_HERO.lead}
      </p>
      <div className="mt-10 h-px w-24 bg-stone-400/40" />
      <MethodologyChapterPills />
    </section>
  );
}
