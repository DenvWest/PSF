export default function EvidenceStars({
  stars,
  label,
  className = "text-sm font-medium text-stone-700",
}: {
  stars: 3 | 4 | 5;
  label: string;
  className?: string;
}) {
  return (
    <p className={className}>
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)} {label}
    </p>
  );
}
