import { redirect } from "next/navigation";
import AccountSettings from "@/components/account/AccountSettings";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Je accountgegevens. De voedingsdoelen stonden hier kort, maar horen bij het
 * dashboard: ze bepalen wat elk cijfer in je dagboek betekent, en dat is geen
 * accountinstelling zoals je e-mailadres. Ze staan nu op `/dashboard/doelen`,
 * bereikbaar via "Meer" in de dashboardnavigatie.
 */
export default async function AccountPage() {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  return <AccountSettings email={account.email} />;
}
