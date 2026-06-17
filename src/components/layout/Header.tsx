import { getAccountFromCookie } from "@/lib/account-server";
import HeaderClient from "@/components/layout/HeaderClient";

export default async function Header() {
  const account = await getAccountFromCookie();
  const isLoggedIn = Boolean(account);

  return (
    <HeaderClient
      accountLinkHref={isLoggedIn ? "/dashboard" : "/account/login"}
      accountLinkLabel={isLoggedIn ? "Dashboard" : "Inloggen"}
    />
  );
}
