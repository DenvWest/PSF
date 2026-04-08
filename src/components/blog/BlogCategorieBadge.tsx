import type { BlogCategorie } from "@/types/blog";

const BADGE_STYLES: Record<BlogCategorie, string> = {
  stress: "bg-amber-50 text-amber-700 ring-amber-200/50",
  slaap: "bg-sky-50 text-sky-700 ring-sky-200/50",
  energie: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
  supplementen: "bg-stone-100 text-stone-600 ring-stone-200/50",
};

const LABELS: Record<BlogCategorie, string> = {
  stress: "Stress",
  slaap: "Slaap",
  energie: "Energie",
  supplementen: "Supplementen",
};

interface BlogCategorieBadgeProps {
  categorie: BlogCategorie;
  className?: string;
}

export default function BlogCategorieBadge({
  categorie,
  className = "",
}: BlogCategorieBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider ring-1 ring-inset ${BADGE_STYLES[categorie]} ${className}`}
    >
      {LABELS[categorie]}
    </span>
  );
}
