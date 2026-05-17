import type { BlogCategorie } from "@/types/blog";

const BADGE_STYLES: Record<BlogCategorie, string> = {
  stress: "bg-amber-50/80 text-amber-800/90 ring-amber-200/40",
  slaap: "bg-sky-50/80 text-sky-800/90 ring-sky-200/40",
  energie: "bg-emerald-50/80 text-emerald-800/90 ring-emerald-200/40",
  supplementen: "bg-stone-100/90 text-stone-600 ring-stone-200/40",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.625rem] font-medium normal-case tracking-wide ring-1 ring-inset ${BADGE_STYLES[categorie]} ${className}`}
    >
      {LABELS[categorie]}
    </span>
  );
}
