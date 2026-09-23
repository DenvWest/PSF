import { redirect } from "next/navigation";
import AccountSettings from "@/components/account/AccountSettings";
import VoedingsdoelenKaart from "@/components/account/VoedingsdoelenKaart";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  return (
    <>
      <AccountSettings email={account.email} />
      {/*
        De kaart haalt zijn eigen gegevens op: de richtlijn wordt server-side
        gerekend zodat het gewicht uit de check nooit als prop de client
        bereikt — dezelfde grens die DashboardData aanhoudt.
      */}
      <VoedingsdoelenKaart />
    </>
  );
}
