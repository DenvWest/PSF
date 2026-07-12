import { EmptyState } from "@/components/partnerdesk/EmptyState";

export default function InstellingenPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Instellingen</h1>
      <EmptyState title="Instellingen komen in plak 5">
        Netwerken, categorieën en labels worden hier beheerd. De seeds (Daisycon,
        Arctic Blue + basiscategorieën) staan al in de database.
      </EmptyState>
    </div>
  );
}
