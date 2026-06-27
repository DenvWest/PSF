import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginScreen from "@/components/account/LoginScreen";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLoginPage() {
  const account = await getAccountFromCookie();
  if (account) {
    redirect("/dashboard");
  }

  return <LoginScreen />;
}
