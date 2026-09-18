import { redirect } from "next/navigation";
import VoedingsdagboekScherm from "@/components/dashboard/dagboek/VoedingsdagboekScherm";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DagboekPage() {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login?from=dagboek");
  }

  return (
    <div className="ps-dark">
      <VoedingsdagboekScherm />
    </div>
  );
}
