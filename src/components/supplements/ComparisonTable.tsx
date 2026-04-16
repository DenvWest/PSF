import type { ComparisonPageData } from "@/types/supplement";

type Props = {
  rows: ComparisonPageData["tableRows"];
  criteria: string[];
};

export function ComparisonTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="sticky left-0 bg-slate-50 px-4 py-3 font-semibold">
              Product
            </th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">EPA / DHA</th>
            <th className="px-4 py-3 font-semibold">Transparantie</th>
            <th className="px-4 py-3 font-semibold">Gebruiksgemak</th>
            <th className="px-4 py-3 font-semibold">Prijs</th>
            <th className="px-4 py-3 font-semibold">Badge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.slug}
              className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50"}`}
            >
              <td className="sticky left-0 px-4 py-3 font-medium text-slate-900">
                {row.name}
              </td>
              <td className="px-4 py-3 text-slate-700">{row.type}</td>
              <td className="px-4 py-3 text-slate-700">{row.dosering}</td>
              <td className="px-4 py-3 text-slate-700">{row.transparantie}</td>
              <td className="px-4 py-3 text-slate-700">{row.gebruiksgemak}</td>
              <td className="px-4 py-3 text-slate-700">{row.prijs}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  {row.badge}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
