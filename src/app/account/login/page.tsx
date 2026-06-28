import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginScreen from "@/components/account/LoginScreen";
import { parseAccountLoginFrom } from "@/lib/account-login-href";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type AccountLoginPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function AccountLoginPage({ searchParams }: AccountLoginPageProps) {
  const account = await getAccountFromCookie();
  if (account) {
    redirect("/dashboard");
  }

  const { from } = await searchParams;
  const loginFrom = parseAccountLoginFrom(from);

  return <LoginScreen loginFrom={loginFrom} />;
}
