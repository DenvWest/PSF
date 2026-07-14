import { SettingsSections } from "@/components/partnerdesk/SettingsSections";
import {
  listCategories,
  listLabels,
  listNetworks,
} from "@/lib/partnerdesk/queries";

export const dynamic = "force-dynamic";

export default async function InstellingenPage() {
  const [networks, categories, labels] = await Promise.all([
    listNetworks(),
    listCategories(),
    listLabels(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Instellingen</h1>
      <SettingsSections networks={networks} categories={categories} labels={labels} />
    </div>
  );
}
