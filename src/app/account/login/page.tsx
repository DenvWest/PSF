import type { Metadata } from "next";
import LoginScreen from "@/components/account/LoginScreen";
import { parseAccountLoginFrom } from "@/lib/account-login-href";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type AccountLoginPageProps = {
  searchParams: Promise<{ from?: string; ref?: string }>;
};

export default async function AccountLoginPage({ searchParams }: AccountLoginPageProps) {
  const { from, ref } = await searchParams;
  const loginFrom = parseAccountLoginFrom(from);

  return <LoginScreen loginFrom={loginFrom} nurtureRef={ref ?? null} />;
}
