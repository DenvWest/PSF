import {
  COOKIE_CATEGORY_LABELS,
  COOKIE_INVENTORY,
  type CookieCategory,
} from "@/data/cookie-inventory";

const CATEGORY_ORDER: CookieCategory[] = [
  "necessary",
  "preferences",
  "statistics",
  "marketing",
];

export default function CookieInventoryTable() {
  return (
    <div className="space-y-8">
      {CATEGORY_ORDER.map((category) => {
        const entries = COOKIE_INVENTORY.filter((entry) => entry.category === category);
        if (entries.length === 0) {
          return null;
        }

        return (
          <section key={category}>
            <h3 className="font-semibold text-stone-900">
              {COOKIE_CATEGORY_LABELS[category]}
            </h3>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Cookie</th>
                    <th className="px-4 py-3 font-semibold">Aanbieder</th>
                    <th className="px-4 py-3 font-semibold">Doel</th>
                    <th className="px-4 py-3 font-semibold">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.name} className="border-t border-stone-200">
                      <td className="px-4 py-3 font-mono text-stone-700">{entry.name}</td>
                      <td className="px-4 py-3">{entry.provider}</td>
                      <td className="px-4 py-3">{entry.purpose}</td>
                      <td className="px-4 py-3">{entry.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
