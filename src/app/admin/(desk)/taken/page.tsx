import { EmptyState } from "@/components/partnerdesk/EmptyState";

export default function TakenPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Taken</h1>
      <EmptyState title="Taken komen in plak 2">
        Het takenoverzicht (te laat, vandaag, deze week) en de één-regel-invoer
        worden samen met contacten en de tijdlijn gebouwd.
      </EmptyState>
    </div>
  );
}
