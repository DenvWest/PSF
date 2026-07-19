import type { Metadata } from "next";
import LoginScreen from "@/components/account/LoginScreen";
import {
  parseAccountLoginFrom,
  parseSleepAnalysisFocus,
} from "@/lib/account-login-href";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type AccountLoginPageProps = {
  searchParams: Promise<{ from?: string; ref?: string; focus?: string }>;
};

export default async function AccountLoginPage({ searchParams }: AccountLoginPageProps) {
  const { from, ref, focus } = await searchParams;
  const loginFrom = parseAccountLoginFrom(from);
  const sleepFocus = parseSleepAnalysisFocus(focus);

  return (
    <LoginScreen loginFrom={loginFrom} nurtureRef={ref ?? null} sleepFocus={sleepFocus} />
  );
}
