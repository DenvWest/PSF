interface RelevantieCardProps {
  titel: string;
  uitleg: string;
}

export default function RelevantieCard({ titel, uitleg }: RelevantieCardProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm font-semibold text-stone-900">{titel}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{uitleg}</p>
    </div>
  );
}
