import { redirect } from "next/navigation";
import AccountSettings from "@/components/account/AccountSettings";
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
    <div className="ps-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AccountSettings email={account.email} />
    </div>
  );
}
