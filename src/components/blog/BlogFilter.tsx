"use client";

import { useSearchParams, useRouter } from "next/navigation";

const FILTERS = [
  { id: "alles", label: "Alles" },
  { id: "stress", label: "Stress" },
  { id: "slaap", label: "Slaap" },
  { id: "energie", label: "Energie" },
  { id: "supplementen", label: "Supplementen" },
];

export default function BlogFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = searchParams.get("categorie") || "alles";

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter op categorie"
    >
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (f.id === "alles") {
                router.push("/blog", { scroll: false });
              } else {
                router.push(`/blog?categorie=${f.id}`, { scroll: false });
              }
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
