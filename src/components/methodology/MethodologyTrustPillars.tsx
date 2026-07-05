import { METHODOLOGY_VALUES } from "@/data/methodology";
import { methodologyBodySmClass } from "@/components/methodology/methodology-typography";

export default function MethodologyTrustPillars() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {METHODOLOGY_VALUES.map((value) => (
        <article
          key={value.id}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <h3 className="font-display text-base font-semibold text-[#5A8F6A]">
            {value.title}
          </h3>
          <p className={`mt-2 ${methodologyBodySmClass}`}>
            {value.summary}
          </p>
        </article>
      ))}
    </div>
  );
}
