import type { BlogCategorie } from "@/types/blog";

const BADGE_STYLES: Record<BlogCategorie, string> = {
  stress: "bg-amber-50 text-amber-700 ring-amber-200/60",
  slaap: "bg-blue-50 text-blue-700 ring-blue-200/60",
  energie: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
};

const LABELS: Record<BlogCategorie, string> = {
  stress: "Stress",
  slaap: "Slaap",
  energie: "Energie",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset ${BADGE_STYLES[categorie]} ${className}`}
    >
      {LABELS[categorie]}
    </span>
  );
}
